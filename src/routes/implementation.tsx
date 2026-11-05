import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CodeBlock, ConsoleOutput } from "@/components/lab/CodeBlock";
import { Container, DatasetPreview, MetricCard, PageHero, Pill, SectionHeader, SectionIndex, Tabs, ComparisonTable } from "@/components/lab/primitives";
import { CREDIT_SAMPLE, FEATURES } from "@/data/content";
import { FeatureImportanceChart } from "@/components/lab/charts";
import { KeyTakeaway, WarningCallout } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";

export const Route = createFileRoute("/implementation")({
  head: () => ({
    meta: [
      { title: "Module 06: Practical Implementation Lab — Boosting Lab" },
      { name: "description", content: "End-to-end Python boosting lab: preprocessing, multi-model implementations, evaluation metrics, and SHAP feature importance." },
      { property: "og:title", content: "Practical Implementation Lab — Boosting Lab" },
      { property: "og:description", content: "Hands-on implementation guide for AdaBoost, GBM, XGBoost, LightGBM, and CatBoost in Python." },
    ],
  }),
  component: ImplementationPage,
});

type ModelKey = "adaboost" | "gbm" | "xgb" | "lightgbm" | "catboost";

interface ModelImplementation {
  name: string;
  file: string;
  code: string;
  out: string[];
  metrics: [string, string][];
  strengths: string;
}

const IMPLEMENTATIONS: Record<ModelKey, ModelImplementation> = {
  adaboost: {
    name: "AdaBoostClassifier",
    file: "adaboost_training.py",
    code: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import roc_auc_score, accuracy_score

# 1. Dataset & stratified split
X, y = make_classification(n_samples=1200, n_features=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

# 2. Base weak learner: decision stump (max_depth=1)
base_stump = DecisionTreeClassifier(max_depth=1, random_state=42)

# 3. Discrete SAMME AdaBoost configuration
model = AdaBoostClassifier(
    estimator=base_stump,
    n_estimators=150,
    learning_rate=0.8,
    algorithm="SAMME",
    random_state=42
)
model.fit(X_train, y_train)

# 4. Out-of-sample evaluation
y_proba = model.predict_proba(X_test)[:, 1]
print("AdaBoost Test ROC-AUC:", roc_auc_score(y_test, y_proba))
print("AdaBoost Test Accuracy:", accuracy_score(y_test, model.predict(X_test)))`,
    out: ["Fitting 150 decision stumps...", "Estimator weights range: 0.12 - 0.74", "Test ROC-AUC: 0.8642"],
    metrics: [["Accuracy", "0.83"], ["ROC-AUC", "0.86"], ["Fit Time", "0.8 s"]],
    strengths: "Fast baseline with simple decision stumps; minimal hyperparameter tuning required.",
  },
  gbm: {
    name: "GradientBoostingClassifier",
    file: "gbm_training.py",
    code: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score, accuracy_score

# 1. Dataset & stratified split
X, y = make_classification(n_samples=1200, n_features=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

# 2. Gradient Boosting with modern log_loss & early stopping
model = GradientBoostingClassifier(
    loss="log_loss",           # Modern parameter replacing deprecated 'deviance'
    n_estimators=300,
    learning_rate=0.05,
    max_depth=4,
    min_samples_split=10,
    subsample=0.8,             # Stochastic gradient boosting
    n_iter_no_change=20,       # Validation-based early stopping
    validation_fraction=0.15,
    random_state=42
)
model.fit(X_train, y_train)

# 3. Out-of-sample evaluation
y_proba = model.predict_proba(X_test)[:, 1]
print(f"Optimal iterations: {model.n_estimators_}")
print("GBM Test ROC-AUC:", roc_auc_score(y_test, y_proba))`,
    out: ["Iter 50: log_loss = 0.412", "Iter 150: log_loss = 0.328", "Iter 300: log_loss = 0.281", "Test ROC-AUC: 0.9085"],
    metrics: [["Accuracy", "0.87"], ["ROC-AUC", "0.91"], ["Fit Time", "3.4 s"]],
    strengths: "Flexible loss optimization; robust out-of-the-box performance on medium tabular datasets.",
  },
  xgb: {
    name: "XGBoost Classifier",
    file: "xgboost_training.py",
    code: `import xgboost as xgb
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score

# 1. Dataset & 3-way split (train/validation/test)
X, y = make_classification(n_samples=1500, n_features=12, random_state=42)
X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val)

# 2. Modern regularized XGBClassifier
model = xgb.XGBClassifier(
    n_estimators=1000,
    learning_rate=0.03,
    max_depth=4,
    min_child_weight=3,
    gamma=0.2,
    reg_alpha=0.1,
    reg_lambda=1.5,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric=["auc", "logloss"],
    early_stopping_rounds=40,
    tree_method="hist",
    random_state=42
)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

# 3. Predict & evaluate using optimal checkpoint
y_proba = model.predict_proba(X_test)[:, 1]
print(f"Optimal iteration: {model.best_iteration}")
print("XGBoost Test ROC-AUC:", roc_auc_score(y_test, y_proba))`,
    out: ["[0]   val-auc: 0.824", "[100] val-auc: 0.898", "[240] val-auc: 0.923 (best)", "Test ROC-AUC: 0.9215"],
    metrics: [["Accuracy", "0.88"], ["ROC-AUC", "0.92"], ["Fit Time", "1.2 s"]],
    strengths: "Second-order Hessian split precision with hardware acceleration and L1/L2 regularization.",
  },
  lightgbm: {
    name: "LightGBM Classifier",
    file: "lightgbm_training.py",
    code: `import lightgbm as lgb
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# 1. Dataset & 3-way split
X, y = make_classification(n_samples=1500, n_features=12, random_state=42)
X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val)

# 2. LightGBM with leaf-wise growth & bagging (subsample_freq=1 required!)
model = lgb.LGBMClassifier(
    n_estimators=1000,
    learning_rate=0.03,
    num_leaves=31,
    max_depth=5,
    subsample=0.8,
    subsample_freq=1,          # Crucial: enables row subsampling every round
    colsample_bytree=0.8,
    random_state=42
)
model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    callbacks=[lgb.early_stopping(40, verbose=False)]
)

# 3. Predict & evaluate
y_proba = model.predict_proba(X_test)[:, 1]
print(f"Optimal iteration: {model.best_iteration_}")
print("LightGBM Test ROC-AUC:", roc_auc_score(y_test, y_proba))`,
    out: ["Histogram binning completed (max_bin=255)", "Early stopping at iteration 218", "Test ROC-AUC: 0.9208"],
    metrics: [["Accuracy", "0.88"], ["ROC-AUC", "0.92"], ["Fit Time", "0.4 s"]],
    strengths: "High training throughput and memory efficiency via histogram binning (max_bin=255) and leaf-wise tree growth.",
  },
  catboost: {
    name: "CatBoost Classifier",
    file: "catboost_training.py",
    code: `import pandas as pd
import numpy as np
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# 1. Dataset with mixed numerical & native string categorical columns
rng = np.random.default_rng(42)
n = 1500
df = pd.DataFrame({
    "credit_score": rng.normal(670, 50, n),
    "debt_ratio": rng.uniform(0.1, 0.6, n),
    "tier": rng.choice(["Prime", "Near-Prime", "Subprime"], n),
    "status": rng.choice(["Employed", "Self-Employed", "Retired"], n),
    "default": rng.choice([0, 1], n, p=[0.8, 0.2]),
})

X = df.drop(columns=["default"])
y = df["default"]
cat_cols = ["tier", "status"]

# 2. Three-way split
X_tr_val, X_test, y_tr_val, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
X_train, X_val, y_train, y_val = train_test_split(X_tr_val, y_tr_val, test_size=0.25, random_state=42, stratify=y_tr_val)

# 3. CatBoost with native strings & oblivious trees
model = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.03,
    depth=6,
    cat_features=cat_cols,     # Handled via online ordered target statistics
    eval_metric="AUC",
    early_stopping_rounds=40,
    use_best_model=True,
    random_seed=42,
    verbose=False
)
model.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)

# 4. Predict & evaluate
y_proba = model.predict_proba(X_test)[:, 1]
print(f"Optimal iteration: {model.get_best_iteration()}")
print("CatBoost Test ROC-AUC:", roc_auc_score(y_test, y_proba))`,
    out: ["Ordered target statistics generated", "Best iteration: 265", "Test ROC-AUC: 0.9221"],
    metrics: [["Accuracy", "0.89"], ["ROC-AUC", "0.92"], ["Fit Time", "1.9 s"]],
    strengths: "Native categorical processing avoiding prediction shift and self-target leakage, symmetric oblivious tree architecture.",
  },
};

const SECTIONS = [
  { id: "datasets", label: "1. Dataset Exploration" },
  { id: "preprocessing", label: "2. Data Preprocessing" },
  { id: "model-lab", label: "3. Multi-Model Lab" },
  { id: "evaluation-metrics", label: "4. Evaluation Metrics" },
  { id: "feature-importance", label: "5. Feature Importance & SHAP" },
  { id: "quiz", label: "6. Knowledge Check" },
];

function ImplementationPage() {
  const [selectedModel, setSelectedModel] = useState<ModelKey>("xgb");
  const model = IMPLEMENTATIONS[selectedModel];

  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "implementation" }]}
        eyebrow="Module 06 — Practical Engineering"
        title="Practical Implementation Lab"
        description="A complete production-grade development environment: from data preprocessing and leakage prevention to multi-model implementations, metrics evaluation, and SHAP explainability."
      />
      <SectionIndex items={SECTIONS} />

      {/* SECTION 1: DATASET EXPLORATION */}
      <Container className="py-20">
        <SectionHeader
          id="datasets"
          index="01"
          eyebrow="Data Geometry"
          title="Dataset Exploration & Structure"
          description="Understanding dataset properties is the critical first step in selecting boosting architectures and preprocessing strategies."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <p className="text-base leading-relaxed text-muted-foreground">
            Boosting algorithms excel primarily on structured, tabular datasets with mixed feature types (numeric, ordinal, categorical). Below is a representative 5-record demonstration preview from a 5,000-sample synthetic educational dataset showcasing numeric variables (<code className="text-cyan">credit_score</code>, <code className="text-cyan">dti</code>) and the target variable (<code className="text-orange">default</code>).
          </p>
          <DatasetPreview
            name="credit_risk_train.csv (5-Record Pedagogical Demo Preview)"
            meta="5,000 synthetic samples × 8 features · Binary Target"
            rows={CREDIT_SAMPLE}
          />
        </div>
      </Container>

      {/* SECTION 2: DATA PREPROCESSING */}
      <Container className="pb-20">
        <SectionHeader
          id="preprocessing"
          index="02"
          eyebrow="Leak-Proof Pipelines"
          title="Preprocessing Guidelines for Tree Ensembles"
          description="Tree-based boosting algorithms behave differently from linear models and neural networks. Understanding tree invariants avoids wasted compute and prevented data leakage."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-sm font-semibold text-lime">Scale Invariance</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Tree splits depend solely on the <strong>relative ordering</strong> of values (<InlineMath formula="x_i \le \theta" />). Standardizing (Z-score) or Min-Max scaling does <em>not</em> alter tree split points or predictions whatsoever.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-sm font-semibold text-cyan">Missing Value Handling</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                XGBoost, LightGBM, and CatBoost handle <code className="text-violet">NaN</code> natively via learned default split directions. Traditional mean/median imputation actually destroys the signal that a value was missing!
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-sm font-semibold text-violet">Categorical Encoding Strategies</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                One-hot encoding low-cardinality features (&lt; 10 levels) is safe, but high-cardinality features fragment tree depth. Use LightGBM's integer categorical binning or CatBoost's online target statistics instead of manual target encoding.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-sm font-semibold text-orange">Monotonic Constraints</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                In regulated banking and healthcare, domain physics require monotonic behavior (e.g. higher credit score must never increase default probability). Enforce this natively using <code className="text-cyan">monotone_constraints</code> in XGBoost/LightGBM.
              </p>
            </div>
          </div>

          <WarningCallout title="Critical Data Leakage Rules">
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Always Split Before Imputing or Encoding:</strong> Never compute target statistics or fill missing values using the full dataset before train/test splitting.</li>
              <li><strong>Temporal Leakage in Financial/Time Series:</strong> Use chronological splits (<code className="text-violet">TimeSeriesSplit</code>) rather than random K-Fold to prevent training on future information.</li>
            </ul>
          </WarningCallout>
        </div>
      </Container>

      {/* SECTION 3: MULTI-MODEL LAB */}
      <Container className="pb-20">
        <SectionHeader
          id="model-lab"
          index="03"
          eyebrow="Interactive Workspace"
          title="Multi-Model Development Lab"
          description="Switch between real Python scripts for all 5 major boosting algorithms, complete with hyperparameter configurations and test outputs."
        />
        <div className="border border-hairline bg-surface md:ml-[136px]">
          <Tabs<ModelKey>
            value={selectedModel}
            onChange={setSelectedModel}
            tabs={[
              { value: "adaboost", label: "AdaBoost" },
              { value: "gbm", label: "Gradient Boosting" },
              { value: "xgb", label: "XGBoost" },
              { value: "lightgbm", label: "LightGBM" },
              { value: "catboost", label: "CatBoost" },
            ]}
          />
          <div className="grid lg:grid-cols-[1fr_320px]">
            <div className="space-y-4 p-5 lg:border-r lg:border-hairline">
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>Model: <span className="text-foreground font-semibold">{model.name}</span></span>
                <Pill tone="cyan">{model.file}</Pill>
              </div>
              <CodeBlock code={model.code} filename={model.file} />
              <div className="space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80">
                  Console Output (Illustrative Demonstration)
                </div>
                <ConsoleOutput lines={model.out} />
              </div>
            </div>

            <aside className="p-5 space-y-6">
              <div>
                <div className="eyebrow mb-2">Performance Metrics (Illustrative Test Set)</div>
                <div className="divide-y divide-hairline rounded border border-hairline">
                  {model.metrics.map(([label, val], idx) => (
                    <MetricCard
                      key={label}
                      label={label}
                      value={val}
                      tone={(["violet", "cyan", "lime"] as const)[idx] ?? "violet"}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="eyebrow mb-2">Architectural Strength</div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {model.strengths}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </Container>

      {/* SECTION 4: EVALUATION METRICS */}
      <Container className="pb-20">
        <SectionHeader
          id="evaluation-metrics"
          index="04"
          eyebrow="Validation Science"
          title="Evaluation Metrics Deep Dive"
          description="Choosing the wrong metric leads to deploying suboptimal models. Understand when each metric applies."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-base font-semibold text-cyan">ROC-AUC vs. PR-AUC</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <strong>ROC-AUC</strong> evaluates True Positive Rate vs False Positive Rate. It can be deceptively optimistic when negative cases vastly outnumber positives (e.g. 99% non-default vs 1% default).
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <strong>PR-AUC (Precision-Recall)</strong> focuses strictly on positive instances and does not factor in True Negatives, making it the gold standard for severe class imbalance.
              </p>
            </div>

            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-base font-semibold text-orange">RMSE vs. MAE in Regression</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <strong>RMSE (L2 loss)</strong> squares errors, heavily penalizing large outliers. Choose RMSE if large errors are catastrophically bad.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <strong>MAE (L1 loss)</strong> weights all errors linearly, making it robust against extreme noisy anomalies.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* SECTION 5: FEATURE IMPORTANCE & SHAP */}
      <Container className="pb-20">
        <SectionHeader
          id="feature-importance"
          index="05"
          eyebrow="Interpretability"
          title="Feature Importance: Gain, Weight, Cover & SHAP"
          description="Tree algorithms provide multiple distinct measures of feature importance that must not be conflated with causal drivers."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded border border-hairline bg-surface p-4">
              <div className="eyebrow mb-2">Feature Importance (Illustrative Demonstration)</div>
              <FeatureImportanceChart />
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <div className="rounded border border-hairline bg-surface p-3">
                <span className="font-semibold text-violet">Gain:</span> Total reduction in loss (gain) brought by all splits using this feature. Generally the most reliable native metric.
              </div>
              <div className="rounded border border-hairline bg-surface p-3">
                <span className="font-semibold text-cyan">Weight / Frequency:</span> Number of times a feature was selected to split. Biased toward continuous features with many unique values.
              </div>
              <div className="rounded border border-hairline bg-surface p-3">
                <span className="font-semibold text-lime">Cover:</span> Number of samples affected by splits using this feature.
              </div>
            </div>
          </div>

          <div className="rounded border border-hairline bg-surface p-5 space-y-3">
            <h4 className="font-display text-sm font-semibold text-foreground">
              Cardinality Bias in Impurity Importance vs. Game-Theoretic Attribution
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 text-xs text-muted-foreground leading-relaxed">
              <div className="rounded border border-hairline/60 bg-surface-2 p-3 space-y-1.5">
                <div className="font-semibold text-orange">Why Split Weight / Gini Is Biased (Strobl et al. 2007)</div>
                <p>
                  Features with many unique values (continuous variables, ZIP codes, IDs) offer vastly more candidate split thresholds during tree construction. Consequently, greedy trees choose them far more frequently by chance alone, artificially inflating their split-weight and Gini importance even if they carry pure random noise.
                </p>
              </div>
              <div className="rounded border border-hairline/60 bg-surface-2 p-3 space-y-1.5">
                <div className="font-semibold text-cyan">Axiomatic Fairness in TreeSHAP (Lundberg et al. 2020)</div>
                <p>
                  TreeSHAP evaluates the marginal contribution of feature <InlineMath formula="j" /> across all possible feature subsets <InlineMath formula="S \subseteq F \setminus \{j\}" /> in <InlineMath formula="\mathcal{O}(TLD^2)" /> time. It is the only attribution method mathematically proven to satisfy <strong>Efficiency</strong>, <strong>Symmetry</strong>, <strong>Null player</strong>, and <strong>Monotonicity</strong>.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">
              SHAP (SHapley Additive exPlanations)
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Native tree feature importances (Gain/Weight) suffer from inconsistency: modifying a model to give more weight to a feature can paradoxically <em>decrease</em> its split importance score. <strong>TreeSHAP</strong> (Lundberg et al.) computes exact Shapley values from cooperative game theory in polynomial time <InlineMath formula="O(TLD^2)" />, satisfying efficiency, symmetry, and monotonicity.
            </p>
          </div>

          <WarningCallout title="Feature Importance ≠ Causal Explanation">
            <p className="text-xs leading-relaxed">
              If <code className="text-cyan">credit_score</code> has high Gain or SHAP attribution, that proves it is an informative statistical predictor within this specific model—it does <strong>not</strong> establish a causal effect (<InlineMath formula="P(Y \mid \text{do}(X_j))" />). Collinear features can mask each other's true influence, and high attribution can reflect spurious associations, proxy effects, or selection bias in the training distribution.
            </p>
          </WarningCallout>
        </div>
      </Container>

      {/* SECTION 6: QUIZ */}
      <Container className="pb-24">
        <SectionHeader
          id="quiz"
          index="06"
          eyebrow="Assessment"
          title="Knowledge Check"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <QuizBlock
            title="Implementation Lab Quiz"
            questions={[
              {
                id: "q1",
                question: "Why is feature scaling (e.g. StandardScaler or MinMaxScaler) unnecessary for tree-based boosting algorithms?",
                options: [
                  "Because boosting algorithms convert all numbers into strings",
                  "Because decision tree split rules depend strictly on ordinal ranking (x_i ≤ threshold) rather than absolute numerical distances",
                  "Because GPUs automatically scale features in memory",
                  "Because learning rate shrinks all features to zero anyway",
                ],
                correctIndex: 1,
                explanation: "Unlike neural networks or SVMs that compute Euclidean distances or inner products, decision trees only evaluate whether a feature value is greater than or less than a split threshold. Any strictly monotonic scaling does not change the order or optimal split location.",
              },
              {
                id: "q2",
                question: "Why is PR-AUC (Precision-Recall AUC) preferred over ROC-AUC when evaluating highly imbalanced fraud or credit default models?",
                options: [
                  "PR-AUC is faster to compute on multi-core processors",
                  "ROC-AUC includes True Negatives in its False Positive Rate denominator, which remains deceptively close to zero when negative instances dominate",
                  "PR-AUC is always higher than ROC-AUC",
                  "ROC-AUC cannot be plotted as a curve",
                ],
                correctIndex: 1,
                explanation: "When negative cases represent 99.9% of data, thousands of false alarms barely budge the False Positive Rate (FP / TN + FP). Precision-Recall directly tracks the true positive recovery rate relative to false alarms, exposing model failure on rare events.",
              },
              {
                id: "q3",
                question: "Why are SHAP values mathematically preferred over traditional Gini/Gain feature importance for attribution consistency?",
                options: [
                  "SHAP values satisfy the consistency property (if a model changes so a feature contributes more, its SHAP importance never decreases)",
                  "SHAP values can only be computed for linear models",
                  "SHAP values replace the need for train-test splitting",
                  "Traditional Gain values cannot be plotted on bar charts",
                ],
                correctIndex: 0,
                explanation: "Traditional tree importance metrics (like Gain and Weight) are inconsistent: modifying a model so that a feature has greater impact can paradoxically decrease its measured Gain. Shapley values uniquely satisfy the axiomatic consistency and additivity properties derived from cooperative game theory.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
