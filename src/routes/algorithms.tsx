import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlgorithmExplorer } from "@/components/lab/learning";
import { ComparisonTable, Container, PageHero, SectionHeader, SectionIndex, Pill, Tabs } from "@/components/lab/primitives";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";
import { KeyTakeaway, WarningCallout } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";

export const Route = createFileRoute("/algorithms")({
  head: () => ({
    meta: [
      { title: "Module 05: Modern Boosting Algorithms — Boosting Lab" },
      { name: "description", content: "Deep dive into LightGBM (GOSS, EFB), CatBoost (Ordered Boosting, Oblivious Trees), and a 5-way comparative analysis across all boosting algorithms." },
      { property: "og:title", content: "Modern Boosting Ecosystem — Boosting Lab" },
      { property: "og:description", content: "LightGBM, CatBoost, and 5-way algorithm comparative benchmarks." },
    ],
  }),
  component: AlgorithmsPage,
});

const SECTIONS = [
  { id: "lightgbm", label: "1. LightGBM Deep Dive" },
  { id: "catboost", label: "2. CatBoost Deep Dive" },
  { id: "comparison-matrix", label: "3. 5-Way Comparative Matrix" },
  { id: "interactive-explorer", label: "4. Interactive Explorer" },
  { id: "selection-guide", label: "5. When to Choose Which" },
  { id: "code-implementations", label: "6. Python Implementations" },
  { id: "quiz", label: "7. Knowledge Check" },
];

function AlgorithmsPage() {
  const [algoTab, setAlgoTab] = useState("lightgbm");

  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "algorithms" }]}
        eyebrow="Module 05 — Modern Ecosystem"
        title="Modern Boosting: LightGBM & CatBoost"
        description="Explore the architectural breakthroughs that reshaped modern tabular learning: LightGBM's histogram binning and GOSS, CatBoost's ordered target statistics, and an unbiased comparative analysis."
      />
      <SectionIndex items={SECTIONS} />

      {/* SECTION 1: LIGHTGBM */}
      <Container className="py-20">
        <SectionHeader
          id="lightgbm"
          index="01"
          eyebrow="Speed & Scalability"
          title="LightGBM: Histogram Binning, Leaf-Wise Growth & GOSS"
          description="Introduced by Microsoft Research in 2017 (Ke et al.), LightGBM was engineered to overcome the memory and speed bottlenecks of standard tree building on massive datasets."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded border border-hairline bg-surface p-5 space-y-2">
              <div className="font-display text-base font-semibold text-lime">Histogram-Based Split Finding (max_bin)</div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Continuous features are discretized into integer bins (controlled by <code className="text-lime">max_bin</code>, default 255, stored as 8-bit <code className="text-foreground">uint8</code>). Instead of sorting all <InlineMath formula="N" /> data points at every split, histogram construction costs <InlineMath formula="O(K \times \text{#features})" /> rather than <InlineMath formula="O(N \times \text{#features})" />, slashing RAM by up to 80% and accelerating split finding by 8× to 15×.
              </p>
              <div className="rounded bg-surface-2 p-2.5 font-mono text-[11px] text-muted-foreground">
                max_bin=255 (balanced) · max_bin=63 (high throughput) · max_bin=511 (fine continuous resolution)
              </div>
            </div>
            <div className="rounded border border-hairline bg-surface p-5 space-y-2">
              <div className="font-display text-base font-semibold text-cyan">Leaf-Wise (Best-First) vs Level-Wise</div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Classical boosting algorithms (GBM, default XGBoost) grow trees <strong>level-wise (depth-first)</strong>, splitting all nodes at a given level simultaneously. LightGBM grows trees <strong>leaf-wise (best-first)</strong>, choosing the single leaf that produces the <em>maximum delta loss reduction</em> anywhere in the tree. While achieving lower loss with fewer splits, it requires constraining <code className="text-violet">num_leaves</code> to avoid overfitting on small datasets.
              </p>
              <div className="rounded bg-surface-2 p-2.5 font-mono text-[11px] text-muted-foreground">
                Note: Modern XGBoost also supports leaf-wise growth via grow_policy="lossguide".
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">
              Gradient-Based One-Side Sampling (GOSS)
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              In gradient boosting, data points with small gradients have already been learned accurately, while points with large gradients contribute most to the training loss. GOSS keeps all top <InlineMath formula="a \times 100\%" /> instances with large gradients, randomly samples a fraction <InlineMath formula="b" /> from instances with small gradients, and scales small-gradient samples by a factor to restore unbiased data distribution:
            </p>

            <MathBlock
              label="GOSS Gradient Sum Formula"
              formula="\tilde{V}_j(d) = \frac{1}{n} \left( \sum_{x_i \in A_l} g_i + \frac{1 - a}{b} \sum_{x_i \in B_l} g_i \right)"
              terms={[
                ["A_l", "Subset of instances in split branch with large gradients (top fraction a)"],
                ["B_l", "Randomly sampled subset of instances with small gradients (fraction b)"],
                ["\\frac{1-a}{b}", "Multiplier applied to small-gradient samples to preserve overall expectation"],
              ]}
              note="GOSS preserves the original data distribution without retraining on the full dataset, reducing computational cost while maintaining accuracy."
            />
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">
              Exclusive Feature Bundling (EFB)
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              High-dimensional tabular data is frequently sparse (e.g. one-hot encoded categories). Two features rarely take non-zero values simultaneously. EFB bundles mutually exclusive features into a single composite feature by adding offsets to their values, safely reducing the effective number of features without losing information.
            </p>
          </div>
        </div>
      </Container>

      {/* SECTION 2: CATBOOST */}
      <Container className="pb-20">
        <SectionHeader
          id="catboost"
          index="02"
          eyebrow="Categorical Excellence"
          title="CatBoost: Ordered Boosting & Oblivious Trees"
          description="Developed by Yandex researchers (Dorogush et al. 2017 initial release; Prokhorenkova et al. NeurIPS 2018), CatBoost mitigates prediction shift and self-target leakage, handles high-cardinality categorical features natively, and uses symmetric decision structures."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">
              Target Leakage & Prediction Shift in Standard GBM
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              In standard gradient boosting, pseudo-residuals <InlineMath formula="r_i = -\partial L / \partial F(x_i)" /> are computed using the model trained on the exact same dataset that contains sample <InlineMath formula="i" />. This produces a subtle shift: the distribution of <InlineMath formula="r(x)|x" /> during training differs from test time. CatBoost solves this with <strong>Ordered Boosting</strong>: multiple random permutations of the dataset are maintained, and a model for predicting sample <InlineMath formula="i" /> is trained strictly on samples that precede <InlineMath formula="i" /> in that permutation.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">
              Ordered Target Statistics (Native Categorical Encoding)
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Instead of naive one-hot encoding (which explodes dimensionality) or standard mean target encoding (which leaks the target and overfits), CatBoost encodes categorical features online using only the prior history of instances:
            </p>

            <MathBlock
              label="CatBoost Ordered Target Statistic with Prior"
              formula="\hat{x}_k^i = \frac{\sum_{j=1}^{p-1} \mathbb{I}(x_{\sigma_j, k} = x_{\sigma_p, k}) \cdot y_{\sigma_j} + a \cdot P}{\sum_{j=1}^{p-1} \mathbb{I}(x_{\sigma_j, k} = x_{\sigma_p, k}) + a}"
              terms={[
                ["\\sigma", "A random permutation of the training indices {1, ..., n}"],
                ["p", "The rank/position of current sample i in permutation \\sigma"],
                ["P", "Prior value: overall mean of the target variable across the entire dataset"],
                ["a > 0", "Weight coefficient of the prior (smoothes categories with few observations)"],
              ]}
              note="Because the target of sample i is omitted from its own summary statistic, self-target leakage within the training permutation is eliminated. (Note: External data leakage—such as preprocessing or encoding before cross-validation splits—is a pipeline defect that no internal algorithm mechanism can prevent.)"
            />
          </div>

          <div className="rounded border border-hairline bg-surface p-5">
            <div className="font-display text-base font-semibold text-violet">
              Symmetric (Oblivious) Trees
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Unlike XGBoost and LightGBM (which evaluate independent splits at each branch), CatBoost trees are <strong>symmetric</strong>: the identical feature and split threshold are applied across all nodes at the same tree depth.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded border border-hairline/60 bg-surface-2 p-3">
                <span className="font-semibold text-lime">Regularization Benefit:</span> Drastically restricts model search space, preventing complex idiosyncratic branch overfitting.
              </div>
              <div className="rounded border border-hairline/60 bg-surface-2 p-3">
                <span className="font-semibold text-cyan">Inference Speed:</span> A symmetric tree with depth d can be evaluated as an index lookup via bitwise SIMD instructions in CPU registers: <InlineMath formula="\text{index} = \sum_{k=0}^{d-1} 2^k \cdot \mathbb{I}(x_{f_k} > \theta_k)" />.
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* SECTION 3: 5-WAY COMPARISON MATRIX */}
      <Container className="pb-20">
        <SectionHeader
          id="comparison-matrix"
          index="03"
          eyebrow="Comparative Matrix"
          title="5-Way Comprehensive Algorithm Comparison"
          description="A rigorous comparison of AdaBoost, Gradient Boosting, XGBoost, LightGBM, and CatBoost across 9 canonical architectural dimensions."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <ComparisonTable
            columns={["Dimension", "AdaBoost", "GBM (Scikit-Learn)", "XGBoost", "LightGBM", "CatBoost"]}
            rows={[
              [
                "1. Learning Mechanism",
                "Sequential re-weighting of misclassified training samples",
                "Functional gradient descent fitting negative loss gradients",
                "Regularized 2nd-order Taylor expansion (gradients + Hessians)",
                "Histogram-based gradient boosting with GOSS & EFB",
                "Ordered functional gradient descent on random permutations"
              ],
              [
                "2. Loss Optimization",
                "Exponential loss (binary classification); SAMME for multiclass",
                "First-order pseudo-residuals across differentiable losses (MSE, MAE, Deviance)",
                "Exact second-order Newton steps via analytic leaf weight optimization w* = -G/(H+λ)",
                "Second-order Taylor optimization on discrete integer histograms",
                "Ordered functional gradient avoiding prediction shift on arbitrary differentiable losses"
              ],
              [
                "3. Tree Construction & Growth",
                "Shallow Decision Stumps (depth 1)",
                "Level-wise (depth-first) regression trees",
                "Level-wise (depth-wise) by default; leaf-wise via lossguide",
                "Leaf-wise (best-first) maximizing loss reduction per split",
                "Symmetric (oblivious) trees sharing splits across entire levels"
              ],
              [
                "4. Regularization Techniques",
                "Implicit via early stopping & learning rate shrinkage",
                "Shrinkage factor ν, min_samples_leaf, stochastic row subsampling",
                "γ (min split gain), L2 leaf weight λ, L1 leaf weight α, min_child_weight",
                "min_data_in_leaf, max_leaves constraint, feature/row subsampling, L1/L2",
                "l2_leaf_reg penalty, random strength, structural oblivious tree symmetry"
              ],
              [
                "5. Categorical Handling",
                "Manual one-hot encoding required",
                "Manual encoding required (or HistGradientBoosting categorical support)",
                "One-hot encoding, partition splits (experimental), or external Ordinal",
                "Native optimal histogram sorting for integer categories",
                "Native Online Ordered Target Statistics with prior smoothing"
              ],
              [
                "6. Missing Value Handling",
                "Requires explicit imputation before training",
                "Requires imputation (HistGradientBoosting routes NaNs to default bin)",
                "Sparsity-aware split finding learns optimal default routing direction",
                "Dedicated NaN histogram bin routed to branch yielding minimal loss",
                "Treated as minimum or maximum floating-point value or dedicated split"
              ],
              [
                "7. Efficiency & Scalability",
                "Fast on small datasets; strictly single-core CPU in vanilla implementations",
                "Slow on large N due to exact sorting at every split node",
                "Highly scalable parallel CPU & GPU exact greedy and histogram split search",
                "Often fastest CPU training throughput on large datasets; speed depends on feature count, max_bin, and thread count",
                "Moderate CPU training; fast GPU acceleration; ultra-low latency SIMD CPU inference"
              ],
              [
                "8. Typical Applications",
                "Viola-Jones real-time face detection, educational baselines",
                "Actuarial insurance pricing, baseline ranking (LambdaMART)",
                "Competitive data science, credit risk modeling, tabular benchmarks",
                "High-throughput search ranking, e-commerce CTR, massive-scale forecasting",
                "Datasets with rich high-cardinality categoricals, low-latency scoring APIs"
              ],
              [
                "9. Primary Limitations",
                "Extremely vulnerable to noisy labels and extreme outliers",
                "Scales poorly to high sample counts without histogram binning",
                "Extensive hyperparameter search space requiring careful tuning",
                "Leaf-wise tree growth can aggressively overfit small datasets (N < 10,000)",
                "Higher memory usage when computing high-cardinality interaction pairs on CPU"
              ],
            ]}
          />
          <WarningCallout title="Benchmarking Qualification: No Universal Winner">
            Algorithm speed and accuracy rankings are strictly context-dependent. On datasets with millions of rows, LightGBM often trains fastest on CPU; on datasets with rich high-cardinality categorical features, CatBoost typically achieves higher out-of-the-box accuracy; on GPU clusters with custom loss objectives, XGBoost provides granular second-order control. Always evaluate on your specific dataset geometry.
          </WarningCallout>
        </div>
      </Container>

      {/* SECTION 4: INTERACTIVE EXPLORER */}
      <Container className="pb-20">
        <SectionHeader
          id="interactive-explorer"
          index="04"
          eyebrow="Interactive Benchmarking"
          title="Algorithm Explorer & Trait Profiles"
          description="Select any algorithm to drill down into its mechanism, strengths, limitations, and trait ratings."
        />
        <div className="md:ml-[136px] space-y-4">
          <AlgorithmExplorer detailed />
          <p className="text-xs text-muted-foreground leading-relaxed">
            *Trait ratings shown above represent aggregate empirical heuristics across standard tabular benchmarks. In production, relative throughput and predictive accuracy depend heavily on dataset cardinality, row count, feature sparsity, and hardware optimization (SIMD CPU vs. GPU acceleration).
          </p>
        </div>
      </Container>

      {/* SECTION 5: SELECTION GUIDE */}
      <Container className="pb-20">
        <SectionHeader
          id="selection-guide"
          index="05"
          eyebrow="Practical Guidance"
          title="When to Choose Which Algorithm?"
          description="No boosting algorithm is universally superior. Your choice should depend on dataset geometry, latency constraints, and hardware."
        />
        <div className="max-w-4xl space-y-4 md:ml-[136px]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-mono text-xs font-semibold text-lime">Choose LightGBM If:</div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li>• Dataset has &gt; 500,000 rows.</li>
                <li>• RAM or memory footprint is constrained.</li>
                <li>• Training throughput / fast iterations are essential.</li>
                <li>• Features are primarily numeric.</li>
              </ul>
            </div>

            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-mono text-xs font-semibold text-violet">Choose CatBoost If:</div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li>• Dataset contains many high-cardinality categorical features (ZIP codes, IDs).</li>
                <li>• You need robust out-of-the-box defaults with minimal hyperparameter tuning.</li>
                <li>• Ultra-low latency microsecond scoring is needed in production.</li>
              </ul>
            </div>

            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-mono text-xs font-semibold text-cyan">Choose XGBoost If:</div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li>• Dataset is medium size (10k to 500k rows).</li>
                <li>• You need granular control over L1/L2 leaf regularization.</li>
                <li>• You require custom loss objectives with 1st/2nd derivatives.</li>
                <li>• Proven cross-platform enterprise stability is critical.</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* SECTION 6: CODE IMPLEMENTATIONS */}
      <Container className="pb-20">
        <SectionHeader
          id="code-implementations"
          index="06"
          eyebrow="Hands-On Python"
          title="Production-Grade Implementations: LightGBM & CatBoost"
          description="Complete, reproducible implementations demonstrating native categorical handling, leaf-wise vs oblivious tree topologies, early stopping callbacks, and model persistence."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Tabs
              tabs={[
                { value: "lightgbm", label: "LightGBM (Leaf-Wise & GOSS)" },
                { value: "catboost", label: "CatBoost (Ordered Boosting & Oblivious Trees)" },
              ]}
              value={algoTab}
              onChange={setAlgoTab}
            />
            <span className="text-xs font-mono text-muted-foreground">
              Reference: <code className="text-cyan">python python/04_lightgbm_catboost_workflow.py</code>
            </span>
          </div>

          {algoTab === "lightgbm" ? (
            <div className="space-y-4">
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
                  <span>lightgbm_workflow.py</span>
                  <span className="text-cyan">lightgbm &gt;= 4.0.0</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, classification_report

# 1. Synthesize realistic tabular credit dataset with numeric & categorical columns
rng = np.random.default_rng(42)
n_samples = 3000

credit_score = rng.normal(670, 60, n_samples).clip(350, 850)
income = np.exp(rng.normal(11.0, 0.45, n_samples)).clip(20000, 200000)
dti = rng.uniform(0.05, 0.65, n_samples)
loan_amount = (income * rng.uniform(0.15, 0.40, n_samples)).round(-2)

employment_type = rng.choice(["Salaried", "Self-Employed", "Hourly", "Commission"], size=n_samples, p=[0.55, 0.20, 0.15, 0.10])
home_ownership = rng.choice(["Rent", "Mortgage", "Own"], size=n_samples, p=[0.45, 0.40, 0.15])
loan_purpose = rng.choice(["Debt Consolidation", "Home Improvement", "Major Purchase", "Medical"], size=n_samples)

# Logistic data generating process
z = (credit_score - 670) / 60
logit = -2.5 - 0.9 * z + 3.0 * (dti - 0.30) + (loan_amount / income - 0.25) * 1.5
logit += np.where(home_ownership == "Rent", 0.35, -0.20)
logit += np.where(employment_type == "Self-Employed", 0.25, 0.0)
prob = 1 / (1 + np.exp(-logit))
default = (rng.random(n_samples) < prob).astype(int)

df = pd.DataFrame({
    "credit_score": credit_score,
    "income": income,
    "dti": dti,
    "loan_amount": loan_amount,
    "employment_type": employment_type,
    "home_ownership": home_ownership,
    "loan_purpose": loan_purpose,
    "default": default,
})

# 2. In LightGBM, categorical features MUST be set to pandas 'category' dtype
cat_cols = ["employment_type", "home_ownership", "loan_purpose"]
for col in cat_cols:
    df[col] = df[col].astype("category")

X = df.drop(columns=["default"])
y = df["default"]

# 3. Three-way stratified split: 60% train, 20% validation, 20% held-out test
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val
)

# 4. Instantiate LightGBM with leaf-wise growth parameters
# CRITICAL: subsample requires subsample_freq > 0 to activate bagging!
lgb_model = lgb.LGBMClassifier(
    n_estimators=1000,
    learning_rate=0.03,
    num_leaves=31,              # Primary tree complexity parameter
    max_depth=5,                # Upper depth ceiling to prevent single-leaf deep spikes
    min_child_samples=25,       # Minimum samples required in a terminal leaf
    subsample=0.8,              # Bagging fraction
    subsample_freq=1,           # Enables bagging every 1 iteration (CRITICAL!)
    colsample_bytree=0.8,       # Feature subsampling ratio
    random_state=42,
)

# 5. Fit with early stopping callback
lgb_model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    callbacks=[lgb.early_stopping(stopping_rounds=40, verbose=False)],
)

# 6. Evaluation on held-out test set
y_pred = lgb_model.predict(X_test)
y_proba = lgb_model.predict_proba(X_test)[:, 1]
print(f"Optimal Iteration: {lgb_model.best_iteration_}")
print(f"Test ROC-AUC:      {roc_auc_score(y_test, y_proba):.4f}")
print(f"Test Accuracy:     {accuracy_score(y_test, y_pred):.4f}")

# 7. Model Persistence
lgb_model.booster_.save_model("lightgbm_model.txt")
print("Model saved to lightgbm_model.txt")`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="panel p-4 space-y-2 border-hairline/80">
                  <div className="font-semibold text-cyan">The subsample_freq = 1 Requirement</div>
                  <p className="text-muted-foreground leading-relaxed">
                    A notorious LightGBM trap: specifying <code className="text-foreground">subsample=0.8</code> has <strong>zero effect</strong> unless <code className="text-cyan">subsample_freq &gt; 0</code> is also explicitly passed. LightGBM defaults <code className="text-foreground">subsample_freq=0</code>, disabling row subsampling completely regardless of <code className="text-foreground">subsample</code>. Always pass <code className="text-cyan">subsample_freq=1</code> to bag rows every iteration.
                  </p>
                </div>
                <div className="panel p-4 space-y-2 border-hairline/80">
                  <div className="font-semibold text-violet">num_leaves vs max_depth Relationship</div>
                  <p className="text-muted-foreground leading-relaxed">
                    In depth-wise algorithms, <InlineMath formula="T = 2^{\text{depth}}" /> leaves are grown uniformly. In LightGBM's leaf-wise strategy, the tree greedily splits the single leaf maximizing loss reduction. A tree with <code className="text-foreground">num_leaves=31</code> can attain depth 30 if unconstrained. Pairing <code className="text-cyan">num_leaves=31</code> with a moderate <code className="text-cyan">max_depth=5</code> or <code className="text-cyan">6</code> prevents runaway asymmetric branches.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
                  <span>catboost_workflow.py</span>
                  <span className="text-cyan">catboost &gt;= 1.2.0</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`import numpy as np
import pandas as pd
from catboost import CatBoostClassifier, Pool
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, classification_report

# 1. Synthesize mixed tabular dataset with raw string categorical columns
rng = np.random.default_rng(42)
n_samples = 3000

credit_score = rng.normal(670, 60, n_samples).clip(350, 850)
income = np.exp(rng.normal(11.0, 0.45, n_samples)).clip(20000, 200000)
dti = rng.uniform(0.05, 0.65, n_samples)
loan_amount = (income * rng.uniform(0.15, 0.40, n_samples)).round(-2)

employment_type = rng.choice(["Salaried", "Self-Employed", "Hourly", "Commission"], size=n_samples, p=[0.55, 0.20, 0.15, 0.10])
home_ownership = rng.choice(["Rent", "Mortgage", "Own"], size=n_samples, p=[0.45, 0.40, 0.15])
loan_purpose = rng.choice(["Debt Consolidation", "Home Improvement", "Major Purchase", "Medical"], size=n_samples)

z = (credit_score - 670) / 60
logit = -2.5 - 0.9 * z + 3.0 * (dti - 0.30) + (loan_amount / income - 0.25) * 1.5
logit += np.where(home_ownership == "Rent", 0.35, -0.20)
logit += np.where(employment_type == "Self-Employed", 0.25, 0.0)
prob = 1 / (1 + np.exp(-logit))
default = (rng.random(n_samples) < prob).astype(int)

df = pd.DataFrame({
    "credit_score": credit_score,
    "income": income,
    "dti": dti,
    "loan_amount": loan_amount,
    "employment_type": employment_type,  # Raw strings supported directly!
    "home_ownership": home_ownership,
    "loan_purpose": loan_purpose,
    "default": default,
})

cat_cols = ["employment_type", "home_ownership", "loan_purpose"]
X = df.drop(columns=["default"])
y = df["default"]

# 2. Three-way stratified split: 60% train, 20% validation, 20% held-out test
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val
)

# 3. Instantiate CatBoostClassifier with Ordered Boosting & Oblivious Trees
cb_model = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.03,
    depth=6,                    # Oblivious (symmetric) tree depth
    cat_features=cat_cols,      # Native categorical list: no one-hot or target encoding needed!
    l2_leaf_reg=3.0,            # L2 penalty on leaf values
    eval_metric="AUC",
    early_stopping_rounds=40,   # Stops when validation AUC stops improving
    random_seed=42,
    verbose=False,
)

# 4. Train with validation monitoring
cb_model.fit(
    X_train, y_train,
    eval_set=(X_val, y_val),
    verbose=False,
)

# 5. Out-of-sample evaluation on held-out test set
y_pred = cb_model.predict(X_test)
y_proba = cb_model.predict_proba(X_test)[:, 1]

print(f"Optimal Iteration: {cb_model.get_best_iteration()}")
print(f"Best Val AUC:      {cb_model.get_best_score()['validation']['AUC']:.4f}")
print(f"Test ROC-AUC:      {roc_auc_score(y_test, y_proba):.4f}")
print(f"Test Accuracy:     {accuracy_score(y_test, y_pred):.4f}")

# 6. Feature Importances (PredictionValuesChange)
print("\\nFeature Importances:")
for col, imp in zip(X.columns, cb_model.get_feature_importance()):
    print(f"  {col:20s}: {imp:.2f}%")

# 7. Model Persistence
cb_model.save_model("catboost_model.cbm")
print("Model saved to catboost_model.cbm")`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="panel p-4 space-y-2 border-hairline/80">
                  <div className="font-semibold text-lime">Native Ordered Target Statistics</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Standard target encoding leaks the target variable <InlineMath formula="y_i" /> into the feature representation, causing severe overfitting. CatBoost solves this with <em>Ordered Target Statistics</em>: it randomly permutes the dataset and computes each sample's target statistic strictly using samples that appear <em>prior</em> to it in the random ordering, eliminating target shift entirely.
                  </p>
                </div>
                <div className="panel p-4 space-y-2 border-hairline/80">
                  <div className="font-semibold text-cyan">Oblivious (Symmetric) Trees</div>
                  <p className="text-muted-foreground leading-relaxed">
                    CatBoost builds oblivious decision trees where all nodes at depth <InlineMath formula="d" /> share the exact same split criterion <InlineMath formula="x_j &gt; c" />. This symmetric architecture provides strong regularization against overfitting and allows ultra-fast vectorized evaluation during production inference (bit-shift addressing into a flat leaf table).
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="panel p-4 space-y-2 text-xs border-hairline/60">
            <h4 className="font-semibold text-foreground">Summary Comparison: Categorical Handling</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-hairline text-muted-foreground">
                    <th className="py-2 pr-4">Framework</th>
                    <th className="py-2 pr-4">Data Type Required</th>
                    <th className="py-2 pr-4">Categorical Algorithm</th>
                    <th className="py-2">Production Gotcha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline/40 text-muted-foreground">
                  <tr>
                    <td className="py-2 pr-4 font-semibold text-foreground">LightGBM</td>
                    <td className="py-2 pr-4"><code className="text-cyan">category</code> dtype</td>
                    <td className="py-2 pr-4">Optimal Fisher partition (sorting bins by <InlineMath formula="\sum g / \sum h" />)</td>
                    <td className="py-2"><code className="text-orange">subsample_freq=1</code> required for bagging</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold text-foreground">CatBoost</td>
                    <td className="py-2 pr-4">Raw <code className="text-cyan">str</code> / <code className="text-cyan">object</code></td>
                    <td className="py-2 pr-4">Online Ordered Target Statistics + feature combinations</td>
                    <td className="py-2">Higher training RAM on massive high-cardinality combinations</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Container>

      {/* SECTION 7: QUIZ */}
      <Container className="pb-24">
        <SectionHeader
          id="quiz"
          index="07"
          eyebrow="Assessment"
          title="Knowledge Check"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <QuizBlock
            title="Modern Boosting Algorithms Quiz"
            questions={[
              {
                id: "q1",
                question: "How does LightGBM's leaf-wise (best-first) tree growth differ from XGBoost's traditional level-wise tree growth?",
                options: [
                  "Leaf-wise always splits all nodes at a given depth simultaneously",
                  "Leaf-wise splits the single leaf that yields the highest loss reduction regardless of its depth in the tree",
                  "Leaf-wise creates binary trees while level-wise creates ternary trees",
                  "Leaf-wise can only be used for linear regression",
                ],
                correctIndex: 1,
                explanation: "Leaf-wise chooses the leaf with maximum delta loss reduction to split, achieving lower loss than depth-wise algorithms with the same number of splits.",
              },
              {
                id: "q2",
                question: "What is target leakage, and how does CatBoost's Ordered Boosting mathematically eliminate it?",
                options: [
                  "Target leakage occurs when test data is used in cross-validation; CatBoost prevents it with K-fold CV",
                  "Target leakage occurs when sample i's target is used to calculate its own pseudo-residual; CatBoost uses permutations where models only see samples preceding i",
                  "Target leakage occurs when continuous features are binned into histograms",
                  "Target leakage is when learning rate is greater than 1.0",
                ],
                correctIndex: 1,
                explanation: "In standard boosting, the model evaluating sample i was trained on data containing sample i, causing prediction shift. CatBoost creates random permutations of the dataset and ensures that the model used to estimate i's gradient is trained strictly on observations prior to i in that sequence.",
              },
              {
                id: "q3",
                question: "Why do CatBoost's symmetric (oblivious) trees provide an advantage in high-throughput production environments?",
                options: [
                  "They eliminate the need for GPU servers",
                  "All nodes at depth d share the same split condition, enabling tree evaluation via bitwise SIMD operations in CPU registers without branching",
                  "They never require hyperparameter tuning",
                  "They can run inside relational SQL databases without compiling",
                ],
                correctIndex: 1,
                explanation: "Because the split condition at level k is identical across all nodes, each observation's leaf index can be computed directly as a binary bitmask using vector CPU instructions, resulting in sub-millisecond scoring latencies.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
