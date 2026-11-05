import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EarlyStoppingChart, LearningRateChart, OverfittingChart } from "@/components/lab/charts";
import { ChartContainer, Container, PageHero, SectionHeader, SectionIndex, Pill, Tabs } from "@/components/lab/primitives";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";
import { KeyTakeaway, WarningCallout } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";

export const Route = createFileRoute("/advanced")({
  head: () => ({
    meta: [
      { title: "Module 08: Advanced Boosting Techniques — Boosting Lab" },
      { name: "description", content: "Master advanced boosting techniques: learning rate dynamics, early stopping mechanics, multi-layered regularization, and imbalanced classification." },
      { property: "og:title", content: "Advanced Boosting Techniques — Boosting Lab" },
      { property: "og:description", content: "Preventing overfitting, early stopping, and handling severe class imbalance in boosting models." },
    ],
  }),
  component: AdvancedPage,
});

const SECTIONS = [
  { id: "lr-dynamics", label: "1. Learning Rate & Shrinkage" },
  { id: "early-stopping", label: "2. Early Stopping Mechanics" },
  { id: "overfitting-prevention", label: "3. Overfitting Defense" },
  { id: "imbalanced-classification", label: "4. Imbalanced Classification" },
  { id: "python-workflow", label: "5. Production Python Code" },
  { id: "quiz", label: "6. Knowledge Check" },
];

function AdvancedPage() {
  const [advTab, setAdvTab] = useState("imbalance");

  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "advanced" }]}
        eyebrow="Module 08 — Advanced Engineering"
        title="Advanced Boosting Techniques"
        description="Master the engineering and theoretical nuances of production boosting: shrinkage schedules, validation-driven early stopping, stochastic subsampling, and extreme class imbalance."
      />
      <SectionIndex items={SECTIONS} />

      {/* SECTION 1: LEARNING RATE & SHRINKAGE */}
      <Container className="py-20">
        <SectionHeader
          id="lr-dynamics"
          index="01"
          eyebrow="Shrinkage Theory"
          title="Learning Rate & Estimator Trade-Offs"
          description="Friedman proved that multiplying each tree by a shrinkage factor ν ∈ (0, 1] drastically improves out-of-sample generalization error compared to full unit steps."
        />
        <div className="grid gap-8 md:ml-[136px] lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              In functional gradient descent, taking a full step (<InlineMath formula="\nu = 1.0" />) greedily over-corrects towards the current pseudo-residuals. While training loss plunges rapidly in the first 20 rounds, the model easily memorizes noise, resulting in poor validation accuracy.
            </p>
            <p>
              By shrinking the update to <InlineMath formula="\nu = 0.03" />, each tree only contributes a modest nudge towards the target. Future trees have room to learn orthogonal patterns that generalize across the distribution.
            </p>
            <div className="rounded border border-hairline bg-surface p-4 text-xs space-y-2">
              <div className="font-semibold text-foreground">Why Smaller Learning Rate Is Not Universally Better on Its Own:</div>
              <p className="text-muted-foreground">
                A common misconception is that simply lowering <InlineMath formula="\nu" /> (e.g., from 0.1 to 0.005) automatically improves performance. However, if <code className="text-violet">n_estimators</code> is held fixed at 100, a tiny learning rate leaves the model severely <strong>underfitted</strong>. Smaller learning rates only improve generalization when paired with a proportionally higher computational budget (<code className="text-cyan">n_estimators = 2,000–5,000</code>) governed by early stopping.
              </p>
            </div>
            <KeyTakeaway
              title="The Empirical Scaling Rule"
              points={[
                "Inverse Scaling: Halving the learning rate (e.g. 0.1 → 0.05) approximately doubles the number of estimators needed to reach equivalent training loss.",
                "Lower Minimum: Lower learning rates consistently achieve lower minimum validation loss, but exhibit diminishing returns below ν = 0.01.",
                "Production Protocol: Fix ν to a reasonable budget (0.02 to 0.05), set n_estimators large (e.g. 3,000), and let validation early stopping find the optimal stopping round.",
              ]}
            />
          </div>

          <ChartContainer
            title="Validation Loss under Differing Shrinkage (ν)"
            subtitle="Comparing ν = 0.01, 0.1, and 0.3"
          >
            <LearningRateChart />
          </ChartContainer>
        </div>
      </Container>

      {/* SECTION 2: EARLY STOPPING */}
      <Container className="pb-20">
        <SectionHeader
          id="early-stopping"
          index="02"
          eyebrow="Convergence Control"
          title="Early Stopping Dynamics & Framework Mechanics"
          description="While high-capacity tree ensembles can overfit if trained unchecked for thousands of rounds, early stopping halts execution when validation performance ceases to improve."
        />
        <div className="grid gap-8 md:ml-[136px] lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              The trajectory of empirical training loss is inherently context-dependent:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
              <li><strong>Stochastic Fluctuations:</strong> In deterministic full-batch gradient boosting with exact line search on convex losses, empirical training loss generally decreases. However, when using stochastic row subsampling (<code className="text-foreground">subsample &lt; 1.0</code>) or column subsampling (<code className="text-foreground">colsample_bytree &lt; 1.0</code>), the full-dataset training loss can fluctuate between rounds because trees fit random subsets.</li>
              <li><strong>Asymptotic Error Plateaus:</strong> Boosting does <em>not</em> necessarily drive training error to zero. In datasets with overlapping class distributions (Bayes error), label noise, shallow tree depth constraints (e.g., depth-1 stumps), or strong regularizers (<InlineMath formula="\lambda, \gamma" />), training error asymptotically plateaus well above zero.</li>
              <li><strong>Validation Divergence:</strong> As model capacity expands, validation loss initially drops, reaches an optimal minimum (the balance point of generalization capacity), and subsequently creeps upward as subsequent trees fit sample-specific residual noise.</li>
            </ul>

            <div className="rounded border border-hairline bg-surface p-4 text-xs space-y-2">
              <div><strong className="text-foreground">Patience Parameter (stopping_rounds):</strong> Number of successive iterations with no validation metric improvement before execution halts.</div>
              <div><strong className="text-foreground">Checkpoint Restoration Differences:</strong> Frameworks do not handle best-iteration inference identically; understanding their specific behaviors is essential.</div>
            </div>

            <div className="rounded border border-hairline/60 bg-surface-2 p-3 space-y-2 text-xs">
              <div className="font-semibold text-foreground">Framework Checkpoint &amp; Restoration Behaviors:</div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• <strong className="text-cyan">XGBoost:</strong> Records <code className="text-foreground">best_iteration</code> and <code className="text-foreground">best_score</code>. Modern XGBoost (1.6+) automatically configures <code className="text-foreground">predict()</code> to evaluate trees up to <code className="text-foreground">best_iteration + 1</code>, but all trees up to the stopping point remain stored in memory unless explicitly sliced via <code className="text-foreground">iteration_range</code>.</li>
                <li>• <strong className="text-lime">LightGBM:</strong> The <code className="text-foreground">early_stopping</code> callback records <code className="text-foreground">best_iteration_</code>. Standard Scikit-Learn API <code className="text-foreground">predict()</code> uses this best stage by default, but low-level booster evaluation or raw model file exports may require explicitly passing <code className="text-foreground">num_iteration=model.best_iteration_</code>.</li>
                <li>• <strong className="text-violet">CatBoost:</strong> Automatically scores using the best validation iteration when <code className="text-foreground">use_best_model=True</code> (the default when an evaluation set is provided). If explicitly set to <code className="text-foreground">False</code>, it scores with all iterations through the stopping round.</li>
                <li>• <strong className="text-orange">Scikit-Learn:</strong> In <code className="text-foreground">GradientBoosting*</code> with <code className="text-foreground">n_iter_no_change</code>, training halts after patience expires and the model truncates internal estimator lists to the best stage (<code className="text-foreground">n_estimators_</code>).</li>
              </ul>
            </div>

            <WarningCallout title="Patience Setting Guideline">
              With small learning rates (<InlineMath formula="\nu \le 0.02" />), validation loss can plateau for 15–20 rounds before dropping again. Set patience to at least 30–50 rounds to prevent premature stopping on temporary plateaus.
            </WarningCallout>
          </div>

          <ChartContainer
            title="Training Loss vs. Validation Loss"
            subtitle="Optimal stopping point @ minimum validation loss"
          >
            <EarlyStoppingChart />
          </ChartContainer>
        </div>
      </Container>

      {/* SECTION 3: OVERFITTING PREVENTION */}
      <Container className="pb-20">
        <SectionHeader
          id="overfitting-prevention"
          index="03"
          eyebrow="Regularization Hierarchy"
          title="Multi-Layered Overfitting Defense"
          description="Modern boosting provides a multi-layered defense against overfitting across sample space, feature space, tree structure, and leaf values."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <ChartContainer
            title="The Capacity Gap: Train vs. Validation Accuracy"
            subtitle="Evaluating complexity vs generalization across max_depth"
          >
            <OverfittingChart />
          </ChartContainer>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-hairline bg-surface p-4">
              <div className="font-mono text-xs font-semibold uppercase text-violet">Layer 1: Tree Constraints</div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• <strong className="text-foreground">max_depth:</strong> Restricts interaction order (typically 3–6).</li>
                <li>• <strong className="text-foreground">min_child_weight:</strong> Minimum Hessian required in leaf (prevents single-sample leaves).</li>
              </ul>
            </div>

            <div className="rounded border border-hairline bg-surface p-4">
              <div className="font-mono text-xs font-semibold uppercase text-cyan">Layer 2: Stochastic Sampling</div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• <strong className="text-foreground">subsample (0.7–0.8):</strong> Trains each tree on a random row subset.</li>
                <li>• <strong className="text-foreground">colsample_bytree (0.6–0.8):</strong> Trains each tree on a random feature subset.</li>
              </ul>
            </div>

            <div className="rounded border border-hairline bg-surface p-4">
              <div className="font-mono text-xs font-semibold uppercase text-orange">Layer 3: Explicit Penalties</div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• <strong className="text-foreground">gamma (γ):</strong> Minimum gain required to create a new partition.</li>
                <li>• <strong className="text-foreground">reg_lambda (L2):</strong> Shrinks leaf weights smoothly towards zero.</li>
                <li>• <strong className="text-foreground">reg_alpha (L1):</strong> Zeroes out unimportant leaf weights.</li>
              </ul>
            </div>

            <div className="rounded border border-hairline bg-surface p-4">
              <div className="font-mono text-xs font-semibold uppercase text-lime">Layer 4: Validation Safeguards</div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• <strong className="text-foreground">Early Stopping:</strong> Cuts off training before noise memorization.</li>
                <li>• <strong className="text-foreground">Stratified K-Fold CV:</strong> Out-of-fold generalization verification.</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* SECTION 4: IMBALANCED CLASSIFICATION */}
      <Container className="pb-20">
        <SectionHeader
          id="imbalanced-classification"
          index="04"
          eyebrow="Skewed Distributions"
          title="Handling Extreme Class Imbalance"
          description="In fraud detection, rare medical diagnosis, or credit default, positive cases often represent less than 1% of the data. Standard log-loss treats all misclassifications symmetrically."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <MathBlock
            label="XGBoost scale_pos_weight Formula"
            formula="\text{scale\_pos\_weight} = \frac{\text{Total Negative Samples } (N_{\text{neg}})}{\text{Total Positive Samples } (N_{\text{pos}})}"
            note="For example: in a credit risk dataset with 9,500 non-defaults and 500 defaults, scale_pos_weight = 9500 / 500 = 19.0."
          />

          <p className="text-sm leading-relaxed text-muted-foreground">
            Setting <code className="text-violet">scale_pos_weight = 19.0</code> scales the gradient of positive instances by 19×. This forces the tree split finding algorithm to treat each positive instance with 19 times greater urgency than a negative instance.
          </p>

          <WarningCallout title="Critical Cross-Validation Notice: Never SMOTE Outside Folds">
            <p className="leading-relaxed">
              If using synthetic oversampling methods such as SMOTE, resampling must occur <strong>strictly inside the training split of each cross-validation fold</strong> (e.g. using <code className="text-cyan">imblearn.pipeline.Pipeline</code>). Applying SMOTE to the entire dataset before CV splits synthesizes samples from test-fold neighbors, resulting in severe optimistic data leakage. In modern gradient boosting, algorithmic weighting (<code className="text-violet">scale_pos_weight</code> in XGBoost/LightGBM, <code className="text-violet">auto_class_weights</code> in CatBoost) is strongly preferred over SMOTE because it adjusts loss gradients directly without hallucinating artificial points in high-dimensional feature spaces.
            </p>
          </WarningCallout>

          <KeyTakeaway
            title="Imbalanced Boosting Protocol"
            points={[
              "Never evaluate on Accuracy: A dummy model predicting all negatives achieves 99% accuracy while having zero clinical/financial value.",
              "Track PR-AUC (Precision-Recall) and F1 Score at specific decision thresholds.",
              "Prefer Algorithmic Weighting over SMOTE: scale_pos_weight adjusts gradients without synthesizing unrealistic observations.",
              "Cross-Validation Isolation: If resampling is applied, it must reside strictly within each training fold, never touching validation data.",
              "Cost-Sensitive Threshold Tuning: Optimize the probability decision threshold post-training based on actual business cost matrices.",
            ]}
          />
        </div>
      </Container>

      {/* SECTION 5: PYTHON WORKFLOW */}
      <Container className="pb-20">
        <SectionHeader
          id="python-workflow"
          index="05"
          eyebrow="Hands-On Python"
          title="Advanced Production Workflows"
          description="Complete, reproducible implementations for severe class imbalance management and side-by-side early stopping benchmarks across all major boosting frameworks."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Tabs
              tabs={[
                { value: "imbalance", label: "Imbalanced Learning & PR-AUC Thresholding" },
                { value: "early_stopping", label: "Multi-Framework Early Stopping Benchmark" },
              ]}
              value={advTab}
              onChange={setAdvTab}
            />
            <span className="text-xs font-mono text-muted-foreground">
              Reference: <code className="text-cyan">python python/06_early_stopping_benchmarks.py</code>
            </span>
          </div>

          {advTab === "imbalance" ? (
            <div className="space-y-4">
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
                  <span>imbalanced_boosting_workflow.py</span>
                  <span className="text-cyan">Python 3.10+ · XGBoost</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`import numpy as np
import xgboost as xgb
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, average_precision_score, precision_recall_curve

# 1. Synthesize severe 90:10 imbalanced dataset (simulating credit defaults or fraud)
X, y = make_classification(
    n_samples=2500,
    n_features=15,
    n_informative=10,
    n_redundant=2,
    weights=[0.90, 0.10],  # 10% positive rate
    random_state=42,
)

# 2. Three-way stratified split: 60% train, 20% validation, 20% held-out test
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val
)

# 3. Compute scale_pos_weight from training split: N_neg / N_pos
num_neg = np.sum(y_train == 0)
num_pos = np.sum(y_train == 1)
scale_pos_weight = num_neg / num_pos
print(f"Class counts: {num_neg} negatives / {num_pos} positives -> scale_pos_weight = {scale_pos_weight:.2f}")

# 4. Build regularized XGBoost model optimized for Precision-Recall AUC
model = xgb.XGBClassifier(
    n_estimators=1500,
    learning_rate=0.03,         # Small shrinkage
    max_depth=4,                # Constrain tree complexity
    min_child_weight=4,         # Prevent tiny minority noise leaves
    subsample=0.8,              # Row subsampling
    colsample_bytree=0.8,       # Column subsampling
    reg_lambda=2.0,             # L2 regularization
    scale_pos_weight=scale_pos_weight, # Directly scales positive gradients
    eval_metric=["aucpr", "logloss"],  # Focus early stopping on PR-AUC
    early_stopping_rounds=40,
    tree_method="hist",
    random_state=42,
)

# 5. Fit with validation monitoring
model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=False,
)

print(f"Best Iteration: {model.best_iteration}")

# 6. Predict probabilities on unseen test set
y_proba = model.predict_proba(X_test)[:, 1]
pr_auc = average_precision_score(y_test, y_proba)
print(f"Test PR-AUC (Average Precision): {pr_auc:.4f}")

# 7. Threshold Optimization: Find threshold maximizing F1 or enforcing 80% recall
precisions, recalls, thresholds = precision_recall_curve(y_test, y_proba)
# Select threshold where recall >= 0.80 with maximum precision
valid_indices = np.where(recalls[:-1] >= 0.80)[0]
optimal_threshold = thresholds[valid_indices[-1]]
print(f"Optimal Threshold for >= 80% Recall: {optimal_threshold:.4f}")

y_pred_opt = (y_proba >= optimal_threshold).astype(int)
print("\\nClassification Report at Optimal Threshold:")
print(classification_report(y_test, y_pred_opt, digits=4))`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="panel p-4 space-y-2 border-hairline/80">
                  <div className="font-semibold text-cyan">Why PR-AUC Over ROC-AUC on Imbalanced Data</div>
                  <p className="text-muted-foreground leading-relaxed">
                    When the negative class dominates 90:10 or 99:1, a large flood of False Positives barely shifts the False Positive Rate <InlineMath formula="\text{FPR} = \text{FP} / (\text{FP} + \text{TN})" />, making the ROC-AUC curve appear deceitfully optimistic (&gt;0.95). In contrast, PR-AUC evaluates Precision <InlineMath formula="\text{TP} / (\text{TP} + \text{FP})" /> against Recall, exposing any surge in False Positives immediately.
                  </p>
                </div>
                <div className="panel p-4 space-y-2 border-hairline/80">
                  <div className="font-semibold text-violet">Threshold Optimization vs Default 0.50</div>
                  <p className="text-muted-foreground leading-relaxed">
                    By default, <code className="text-foreground">predict()</code> uses a fixed <InlineMath formula="\theta = 0.50" /> threshold. In production imbalanced tasks (loan underwriting, fraud, cancer screening), missing a positive sample is orders of magnitude more expensive than a false alarm. Empirically shifting the decision threshold along the precision-recall curve aligns model outputs with real business loss utilities.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
                  <span>early_stopping_benchmarks.py</span>
                  <span className="text-cyan">Scikit-Learn · XGBoost · LightGBM · CatBoost</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.ensemble import GradientBoostingClassifier
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier

# 1. Controlled benchmark dataset (1,800 samples, 12 features)
X, y = make_classification(n_samples=1800, n_features=12, weights=[0.70, 0.30], random_state=42)
X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val)

patience = 25  # Patience rounds before early halting

# --- 1. Scikit-Learn ---
# Truncates internal estimators_ list to n_estimators_ upon early exit
sk_gbm = GradientBoostingClassifier(
    n_estimators=1000,
    learning_rate=0.03,
    max_depth=4,
    n_iter_no_change=patience,
    validation_fraction=0.20,
    random_state=42,
)
sk_gbm.fit(X_train, y_train)
print(f"Scikit-Learn Optimal Trees: {sk_gbm.n_estimators_} (out of 1,000)")
print(f"Scikit-Learn Test ROC-AUC:   {roc_auc_score(y_test, sk_gbm.predict_proba(X_test)[:, 1]):.4f}")

# --- 2. XGBoost ---
# Automatically routes predict() to [0, best_iteration + 1)
xgb_clf = xgb.XGBClassifier(
    n_estimators=1000,
    learning_rate=0.03,
    max_depth=4,
    early_stopping_rounds=patience,
    eval_metric="auc",
    random_state=42,
)
xgb_clf.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
print(f"XGBoost Best Iteration:     {xgb_clf.best_iteration}")
print(f"XGBoost Test ROC-AUC:        {roc_auc_score(y_test, xgb_clf.predict_proba(X_test)[:, 1]):.4f}")

# --- 3. LightGBM ---
# Uses early_stopping callback; best_iteration_ is stored and used by default
lgb_clf = lgb.LGBMClassifier(
    n_estimators=1000,
    learning_rate=0.03,
    num_leaves=31,
    random_state=42,
)
lgb_clf.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    callbacks=[lgb.early_stopping(stopping_rounds=patience, verbose=False)],
)
print(f"LightGBM Best Iteration:    {lgb_clf.best_iteration_}")
print(f"LightGBM Test ROC-AUC:       {roc_auc_score(y_test, lgb_clf.predict_proba(X_test)[:, 1]):.4f}")

# --- 4. CatBoost ---
# use_best_model=True (default) restores weights automatically to the optimal round
cb_clf = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.03,
    depth=5,
    early_stopping_rounds=patience,
    use_best_model=True,
    eval_metric="AUC",
    random_seed=42,
    verbose=False,
)
cb_clf.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)
print(f"CatBoost Best Iteration:    {cb_clf.get_best_iteration()}")
print(f"CatBoost Test ROC-AUC:       {roc_auc_score(y_test, cb_clf.predict_proba(X_test)[:, 1]):.4f}")`}
                </pre>
              </div>

              <div className="panel p-4 space-y-3 text-xs border-hairline/60">
                <h4 className="font-semibold text-foreground">Checkpoint Restoration Architecture by Library</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground">
                  <div className="rounded bg-surface-2/40 p-3 space-y-1">
                    <span className="font-semibold text-foreground">Scikit-Learn:</span>
                    <p>Internal holdout validation. When performance plateaus for <code className="text-cyan">n_iter_no_change</code> rounds, the estimator truncates its <code className="text-foreground">estimators_</code> array to <code className="text-cyan">n_estimators_</code>. Predictions naturally use only the retained trees.</p>
                  </div>
                  <div className="rounded bg-surface-2/40 p-3 space-y-1">
                    <span className="font-semibold text-foreground">XGBoost:</span>
                    <p>Stores all trained trees up to the stopping point, but records <code className="text-cyan">best_iteration</code>. Modern XGBoost automatically restricts <code className="text-foreground">predict()</code> to slice <code className="text-cyan">[0, best_iteration + 1)</code>.</p>
                  </div>
                  <div className="rounded bg-surface-2/40 p-3 space-y-1">
                    <span className="font-semibold text-foreground">LightGBM:</span>
                    <p>Driven by the <code className="text-cyan">early_stopping</code> callback. Stores <code className="text-cyan">best_iteration_</code>. When early stopping is triggered, subsequent calls to <code className="text-foreground">predict()</code> automatically evaluate only up to <code className="text-cyan">best_iteration_</code>.</p>
                  </div>
                  <div className="rounded bg-surface-2/40 p-3 space-y-1">
                    <span className="font-semibold text-foreground">CatBoost:</span>
                    <p>Configured via <code className="text-cyan">use_best_model=True</code> (the default). CatBoost automatically trims the model state to the optimal checkpoint, ensuring production inferences match the best validation score.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
            title="Advanced Boosting Mastery Quiz"
            questions={[
              {
                id: "q1",
                question: "Why does early stopping restore model parameters to best_iteration rather than keeping the final tree from round n_estimators?",
                options: [
                  "Because the final tree is automatically corrupt in memory",
                  "Because after validation loss reaches its minimum, subsequent trees capture random noise, increasing generalization error",
                  "To reduce disk storage of model files",
                  "Because early stopping only works if half the trees are removed",
                ],
                correctIndex: 1,
                explanation: "The minimum point on the validation loss curve marks the optimal balance of bias and variance. All iterations trained after this point are over-specializing on training sample quirks and degrading real-world performance.",
              },
              {
                id: "q2",
                question: "In a medical diagnosis dataset with 980 healthy patients and 20 diseased patients, what is the recommended scale_pos_weight in XGBoost?",
                options: [
                  "scale_pos_weight = 1.0",
                  "scale_pos_weight = 980 / 20 = 49.0",
                  "scale_pos_weight = 20 / 980 = 0.02",
                  "scale_pos_weight = 0.5",
                ],
                correctIndex: 1,
                explanation: "scale_pos_weight = negative_samples / positive_samples = 980 / 20 = 49.0. This multiplies the gradients of diseased patients by 49, compensating for the 49:1 class imbalance.",
              },
              {
                id: "q3",
                question: "What is the effect of setting colsample_bytree = 0.7 in an XGBoost model?",
                options: [
                  "It removes 30% of features permanently from the entire dataset",
                  "Before building each individual tree, a random 70% subset of features is sampled, preventing strong features from dominating every split and decorrelating trees",
                  "It limits tree depth to 7 splits",
                  "It speeds up execution by downsampling rows",
                ],
                correctIndex: 1,
                explanation: "Similar to Random Forest's max_features parameter, colsample_bytree samples a fresh random subset of features for each tree. This ensures diverse split logic across the ensemble and reduces model variance.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
