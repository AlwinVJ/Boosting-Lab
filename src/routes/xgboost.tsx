import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, SectionHeader, SectionIndex, Pill, Tabs } from "@/components/lab/primitives";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";
import { DerivationStep, WorkedExample, KeyTakeaway, WarningCallout } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";
import { InteractiveDiagram } from "@/components/lab/BoostingVisualizer";

export const Route = createFileRoute("/xgboost")({
  head: () => ({
    meta: [
      { title: "XGBoost: Extreme Gradient Boosting — Boosting Lab" },
      { name: "description", content: "Master XGBoost: 2nd-order Taylor expansion, regularized objective, optimal leaf weights, split gain formula, and Python implementation." },
      { property: "og:title", content: "XGBoost: Extreme Gradient Boosting — Boosting Lab" },
      { property: "og:description", content: "Deep mathematical derivation and practical guide to XGBoost." },
    ],
  }),
  component: XGBoostPage,
});

const SECTIONS = [
  { id: "intro", label: "1. Overview & Innovation" },
  { id: "math", label: "2. Second-Order Derivation" },
  { id: "split-gain", label: "3. Split Gain & Structure Score" },
  { id: "tree-splits", label: "4. Sparsity & Splitting" },
  { id: "regularization", label: "5. Regularization (γ, λ, α)" },
  { id: "worked-example", label: "6. Numerical Example" },
  { id: "implementation", label: "7. Python Implementation" },
  { id: "quiz", label: "8. Knowledge Check" },
];

function XGBoostPage() {
  const [taskTab, setTaskTab] = useState("classifier");

  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "xgboost" }]}
        eyebrow="Module 04 — Modern Standards"
        title="XGBoost: Extreme Gradient Boosting"
        description="Tianqi Chen & Carlos Guestrin's landmark algorithm: combining a regularized second-order Taylor expansion with hardware-conscious systems engineering."
      />
      <SectionIndex items={SECTIONS} />

      <Container className="py-20">
        <SectionHeader
          id="intro"
          index="01"
          eyebrow="Architectural Innovation"
          title="Why XGBoost Dominated Machine Learning"
          description="Initiated by Tianqi Chen in 2014 within DMLC and published with Carlos Guestrin at ACM SIGKDD 2016, XGBoost rapidly became the benchmark solution across industry and competitive data science."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <p className="text-base leading-relaxed text-muted-foreground">
            While classical GBM uses a first-order Taylor approximation (fitting regression trees only to negative gradients), XGBoost incorporates both first-order gradients (<InlineMath formula="g_i" />) and second-order curvatures / Hessians (<InlineMath formula="h_i" />). Furthermore, XGBoost formalizes tree complexity directly within the loss function via explicit L1 and L2 penalties on leaf weights and tree size.
          </p>

          <InteractiveDiagram
            nodes={[
              { label: "DMatrix", sub: "Compressed CSC/CSR", tone: "muted" },
              { label: "Gradients (g, h)", sub: "1st & 2nd Order", tone: "cyan" },
              { label: "Split Gain", sub: "G² / (H + λ)", tone: "violet" },
              { label: "Sparsity Path", sub: "Default Direction", tone: "orange" },
              { label: "Optimal Leaves", sub: "w* = -G / (H+λ)", tone: "violet" },
              { label: "Prune (γ)", sub: "Gain < γ Removed", tone: "orange" },
              { label: "Shrinkage", sub: "ŷ += η · f_t(x)", tone: "lime" },
            ]}
          />
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="math"
          index="02"
          eyebrow="Mathematical Foundations"
          title="The Second-Order Taylor Expansion"
          description="Let us derive the exact mathematical objective function that XGBoost minimizes at each boosting step t."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <DerivationStep
            step={1}
            title="The Regularized Objective Function"
            formula="\mathcal{L}^{(t)} = \sum_{i=1}^n l\left(y_i, \hat{y}_i^{(t-1)} + f_t(x_i)\right) + \Omega(f_t)"
            terms={[
              ["l(y_i, \\hat{y}_i)", "Differentiable convex loss function"],
              ["\\hat{y}_i^{(t-1)}", "Prediction of the ensemble at step t-1 (constant at step t)"],
              ["f_t(x_i)", "The new tree we are trying to train at step t"],
              ["\\Omega(f_t)", "Regularization penalty on tree complexity"],
            ]}
          >
            At step t, all previous trees are frozen; we only optimize the new tree <InlineMath formula="f_t" />.
          </DerivationStep>

          <DerivationStep
            step={2}
            title="Tree Complexity Penalty Definition Ω(f)"
            formula="\Omega(f_t) = \gamma T + \frac{1}{2}\lambda \sum_{j=1}^T w_j^2 + \alpha \sum_{j=1}^T |w_j|"
            terms={[
              ["T", "Number of terminal leaves in tree f_t"],
              ["w_j", "Continuous prediction weight assigned to leaf j"],
              ["\\gamma", "Complexity penalty per additional leaf (minimum gain threshold)"],
              ["\\lambda", "L2 ridge regularization penalty on leaf weights"],
              ["\\alpha", "L1 lasso regularization penalty on leaf weights"],
            ]}
            note="Higher γ encourages shallower trees; higher λ shrinks leaf weights toward zero and prevents numerical instability."
          >
            The penalty penalizes both having too many leaves and having excessively large leaf weights.
          </DerivationStep>

          <DerivationStep
            step={3}
            title="Second-Order Taylor Approximation"
            formula="\mathcal{L}^{(t)} \simeq \sum_{i=1}^n \left[ l(y_i, \hat{y}_i^{(t-1)}) + g_i f_t(x_i) + \frac{1}{2} h_i f_t^2(x_i) \right] + \Omega(f_t)"
            terms={[
              ["g_i", "\\partial_{\\hat{y}^{(t-1)}} l(y_i, \\hat{y}^{(t-1)}) \\quad \\text{(First derivative / gradient)}"],
              ["h_i", "\\partial^2_{\\hat{y}^{(t-1)}} l(y_i, \\hat{y}^{(t-1)}) \\quad \\text{(Second derivative / Hessian)}"],
            ]}
            note="Notice that l(y_i, ŷ_i^(t-1)) is a constant with respect to f_t and can be dropped from the optimization objective."
          >
            Approximating the loss with a 2nd-order Taylor expansion turns arbitrary losses into an easily solvable quadratic optimization problem.
          </DerivationStep>

          <DerivationStep
            step={4}
            title="Grouping by Leaves (Instance Sets I_j)"
            formula="\tilde{\mathcal{L}}^{(t)} = \sum_{j=1}^T \left[ G_j w_j + \frac{1}{2}\left(H_j + \lambda\right) w_j^2 + \alpha |w_j| \right] + \gamma T"
            terms={[
              ["I_j", "Set of data points mapped to leaf j: I_j = \\{i : q(x_i) = j\\}"],
              ["G_j", "\\sum_{i \\in I_j} g_i \\quad \\text{(Sum of first-order gradients in leaf j)}"],
              ["H_j", "\\sum_{i \\in I_j} h_i \\quad \\text{(Sum of second-order Hessians in leaf j)}"],
              ["\\lambda, \\alpha", "L2 and L1 regularization coefficients on leaf weights"],
            ]}
          >
            By defining <InlineMath formula="G_j = \sum_{i \in I_j} g_i" /> and <InlineMath formula="H_j = \sum_{i \in I_j} h_i" />, the global objective decomposes into <InlineMath formula="T" /> independent single-variable optimization problems—one for each leaf <InlineMath formula="j" />.
          </DerivationStep>

          <DerivationStep
            step={5}
            title="Optimal Leaf Weight w_j* & Structure Score"
            formula="w_j^* = \begin{cases} -\dfrac{G_j}{H_j + \lambda} & \text{if } \alpha = 0 \\[10pt] -\text{sign}(G_j) \dfrac{\max(0, |G_j| - \alpha)}{H_j + \lambda} & \text{if } \alpha > 0 \end{cases}"
            terms={[
              ["w_j^*", "The optimal prediction value for leaf j"],
              ["\\tilde{\\mathcal{L}}^*(q)", "Structure score with L2 only (\\alpha=0): -\\frac{1}{2} \\sum_{j=1}^T \\frac{G_j^2}{H_j + \\lambda} + \\gamma T"],
            ]}
            note="When α = 0, setting the first derivative to zero yields the standard regularized Newton step. When α > 0, the subgradient condition produces the soft-thresholding operator: if |G_j| ≤ α, the optimal leaf weight is driven exactly to zero, pruning that leaf's impact!"
          >
            This gives the exact analytical formula for each leaf weight. Substituting <InlineMath formula="w_j^*" /> back into the objective yields the structure score <InlineMath formula="\tilde{\mathcal{L}}^*(q)" />, which quantifies the quality of tree topology <InlineMath formula="q" />.
          </DerivationStep>
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="split-gain"
          index="03"
          eyebrow="Split Quality"
          title="The Split Gain Formula"
          description="How XGBoost evaluates whether an internal node should split into left and right branches."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <MathBlock
            label="XGBoost Split Gain Formula"
            formula="\text{Gain} = \frac{1}{2} \left[ \frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L + G_R)^2}{H_L + H_R + \lambda} \right] - \gamma"
            terms={[
              ["G_L, H_L", "Sum of gradients and Hessians of samples falling to Left child"],
              ["G_R, H_R", "Sum of gradients and Hessians of samples falling to Right child"],
              ["(G_L+G_R, H_L+H_R)", "Original unsplit parent node statistics"],
              ["\\gamma", "Complexity penalty for creating an additional leaf"],
            ]}
            note="A split is only accepted if Gain > 0. This naturally implements pre-pruning! Note: Formula shown assumes standard L2 regularization (α = 0). When L1 penalty α > 0 is configured, each G² term is replaced by the soft-thresholded quantity (max(0, |G| - α))²."
          />

          <KeyTakeaway
            title="Anatomy of the Split Gain Formula"
            points={[
              "First term G_L² / (H_L + λ): The score of the proposed left leaf.",
              "Second term G_R² / (H_R + λ): The score of the proposed right leaf.",
              "Third term (G_L + G_R)² / (H_L + H_R + λ): The score if we do NOT split and keep the single parent leaf.",
              "Subtracted term γ: The cost of adding one more terminal node to the tree.",
            ]}
          />
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="tree-splits"
          index="04"
          eyebrow="Sparsity & Speed"
          title="Sparsity-Aware Learning & Missing Values"
          description="In real-world data, features often contain missing values, zero-entries, or one-hot encodings. XGBoost handles sparsity natively without imputation."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <p className="text-sm leading-relaxed text-muted-foreground">
            For each split, XGBoost enumerates only non-missing entries. It then evaluates two scenarios: (1) routing all missing values to the Left branch, or (2) routing all missing values to the Right branch. The direction that achieves maximum Gain is saved as the <em>default direction</em> for that split.
          </p>

          <KeyTakeaway
            title="Benefits of Sparsity-Aware Split Finding"
            points={[
              "Zero preprocessing required for missing values (np.nan).",
              "Computation scales linearly with the number of non-missing entries rather than total rows.",
              "Learns optimal domain-specific patterns (e.g., missing income indicates student vs retired).",
            ]}
          />
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="regularization"
          index="05"
          eyebrow="Overfitting Defense"
          title="XGBoost Regularization Control Knobs"
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-hairline bg-surface p-4">
              <div className="font-mono text-sm font-semibold text-violet">gamma (γ / min_split_loss)</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Minimum loss reduction required to create a new partition. Splits with gain &lt; γ are rejected or pruned back. Higher values produce conservative, shallow trees.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-4">
              <div className="font-mono text-sm font-semibold text-cyan">reg_lambda (λ / L2)</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                L2 regularization on leaf weights. Appears in denominator <InlineMath formula="H + \lambda" />. Dampens large weights and prevents extreme predictions from small sample leaves.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-4">
              <div className="font-mono text-sm font-semibold text-orange">reg_alpha (α / L1)</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                L1 regularization on leaf weights. Drives leaf weights to exactly zero via soft-thresholding, producing sparse leaf updates.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-4">
              <div className="font-mono text-sm font-semibold text-lime">min_child_weight</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Minimum sum of Hessians <InlineMath formula="\sum h_i" /> required in a child. For regression, this is the number of samples; for classification, it corresponds to effective sample count.
              </p>
            </div>
          </div>

          <div className="rounded border border-hairline bg-surface p-5 space-y-3">
            <h4 className="font-display text-sm font-semibold text-foreground">
              Critical Theoretical Distinction: Leaf-Weight Penalties vs. Feature Subsampling
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 text-xs text-muted-foreground leading-relaxed">
              <div className="rounded border border-hairline/60 bg-surface-2 p-3 space-y-1.5">
                <div className="font-semibold text-cyan">Leaf-Weight Regularization (λ, α, η)</div>
                <p>
                  Acts strictly on the <strong>output space</strong> (the continuous prediction weights <InlineMath formula="w_j^*" /> assigned to leaf nodes). Setting <code className="text-orange">reg_alpha &gt; 0</code> shrinks or zeroes out leaf predictions, but does <em>not</em> remove columns from the input feature dataset.
                </p>
              </div>
              <div className="rounded border border-hairline/60 bg-surface-2 p-3 space-y-1.5">
                <div className="font-semibold text-violet">Input-Feature Selection (colsample_bytree, max_depth)</div>
                <p>
                  Acts on the <strong>input space and tree topology</strong>. Subsampling columns per tree (<code className="text-cyan">colsample_bytree = 0.8</code>) randomly hides input features during split finding, decorrelating trees and preventing collinear dominant variables from monopolizing every node.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="worked-example"
          index="06"
          eyebrow="Numerical Walkthrough"
          title="Worked Numerical Example: Split Gain Calculation"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <WorkedExample
            title="Computing Optimal Leaf Weights and Split Gain (λ = 1.0, γ = 0.5)"
            description="Consider a parent node with 4 samples. Suppose gradients g = [-1.5, -0.5, +0.8, +1.2] and Hessians h = [1.0, 1.0, 1.0, 1.0]."
            steps={[
              {
                label: "Compute Parent Node Statistics",
                calculation: "G_parent = -1.5 - 0.5 + 0.8 + 1.2 = 0.0\nH_parent = 1.0 + 1.0 + 1.0 + 1.0 = 4.0\nw*_parent = -0.0 / (4.0 + 1.0) = 0.0\nScore_parent = (0.0)² / (4.0 + 1.0) = 0.0",
                result: "Parent Score = 0.0",
                explanation: "Because gradients balance out, the unsplit parent leaf produces weight 0 and score 0.",
              },
              {
                label: "Evaluate Split: Left (samples 1, 2) vs Right (samples 3, 4)",
                calculation: "Left: G_L = -1.5 - 0.5 = -2.0, H_L = 2.0\nRight: G_R = +0.8 + 1.2 = +2.0, H_R = 2.0",
                result: "G_L = -2.0, H_L = 2.0; G_R = +2.0, H_R = 2.0",
                explanation: "The split clearly separates negative gradient samples from positive gradient samples.",
              },
              {
                label: "Compute Optimal Leaf Weights for Left and Right",
                calculation: "w*_L = -(-2.0) / (2.0 + 1.0) = +2.0 / 3.0 = +0.667\nw*_R = -(+2.0) / (2.0 + 1.0) = -2.0 / 3.0 = -0.667",
                result: "w*_L = +0.667, w*_R = -0.667",
                explanation: "Notice the effect of L2 regularization λ=1: without λ, w*_L would be 1.0. The weight was regularized (shrunk) to 0.667.",
              },
              {
                label: "Compute Split Gain",
                calculation: "Gain = 0.5 * [ (-2.0)² / (2+1) + (+2.0)² / (2+1) - 0.0 ] - 0.5\nGain = 0.5 * [ 4/3 + 4/3 ] - 0.5 = 0.5 * 2.667 - 0.5 = 1.333 - 0.500",
                result: "Gain = 0.833",
                explanation: "Since Gain = 0.833 > 0, the split easily clears the complexity penalty γ = 0.5 and is retained!",
              },
            ]}
            conclusion="XGBoost computes split gain using simple sums of first and second derivatives, making split evaluation fast and exact."
          />
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="implementation"
          index="07"
          eyebrow="Hands-On Python"
          title="Production-Grade Python Implementation with XGBoost"
          description="Complete, fully self-contained workflows for classification and regression featuring sparsity-aware missing value handling, early stopping, Gain-based feature importance, and JSON serialization."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Tabs
              tabs={[
                { value: "classifier", label: "XGBClassifier (Sparsity & Early Stopping)" },
                { value: "regressor", label: "XGBRegressor (Newton L2 Shrinkage)" },
              ]}
              value={taskTab}
              onChange={setTaskTab}
            />
            <span className="text-xs font-mono text-muted-foreground">
              Reference: <code className="text-cyan">python python/03_xgboost_workflow.py</code>
            </span>
          </div>

          {taskTab === "classifier" ? (
            <div className="space-y-4">
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
                  <span>xgboost_classifier_workflow.py</span>
                  <span className="text-cyan">xgboost &gt;= 2.0.0</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`import numpy as np
import xgboost as xgb
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

# 1. Synthesize binary classification dataset with missing values (NaN)
X, y = make_classification(
    n_samples=2000,
    n_features=15,
    n_informative=10,
    n_redundant=3,
    weights=[0.80, 0.20],  # Imbalanced: 20% minority class
    random_state=42,
)

# Inject 8% missing values (NaN) to demonstrate XGBoost's native sparsity-aware split finding
rng = np.random.default_rng(42)
mask = rng.random(X.shape) < 0.08
X[mask] = np.nan

# 2. Three-way split: 60% train, 20% validation (for early stopping), 20% held-out test
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val
)

# Compute negative-to-positive class balance ratio for loss weighting
scale_pos = (y_train == 0).sum() / (y_train == 1).sum()

# 3. Instantiate regularized XGBClassifier with 2nd-order objective
model = xgb.XGBClassifier(
    n_estimators=1000,
    learning_rate=0.03,        # Shrinkage step size (eta)
    max_depth=4,               # Constrains feature interaction order
    min_child_weight=3,        # Minimum sum of instance Hessians per leaf
    gamma=0.2,                 # Minimum split gain threshold (pre-pruning)
    subsample=0.8,             # Row subsampling ratio (stochastic bagging)
    colsample_bytree=0.8,      # Column subsampling ratio per tree
    reg_alpha=0.1,             # L1 penalty on leaf prediction weights
    reg_lambda=1.5,            # L2 penalty on leaf prediction weights
    scale_pos_weight=scale_pos, # Class weighting for positive class
    eval_metric=["auc", "logloss"],
    early_stopping_rounds=40,  # Halt if validation AUC does not improve for 40 rounds
    tree_method="hist",        # Hardware-optimized histogram binning
    random_state=42,
)

# 4. Fit with validation monitoring
model.fit(
    X_train, y_train,
    eval_set=[(X_train, y_train), (X_val, y_val)],
    verbose=False,
)

print(f"Optimal Iteration: {model.best_iteration}")
print(f"Best Validation Score: {model.best_score:.4f}")

# 5. Out-of-sample evaluation on unseen test set
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

print(f"Test Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"Test ROC-AUC:  {roc_auc_score(y_test, y_proba):.4f}")
print("\\nClassification Report:\\n", classification_report(y_test, y_pred, digits=4))

# 6. Feature Importance: Gain (loss reduction) vs Weight (split frequency)
booster = model.get_booster()
gain_scores = booster.get_score(importance_type="gain")
print("Top 3 features by Gain:", sorted(gain_scores.items(), key=lambda x: x[1], reverse=True)[:3])

# 7. Native JSON Serialization (Production Standard in XGBoost 2.0+)
model.save_model("xgboost_model.json")
reloaded_model = xgb.XGBClassifier()
reloaded_model.load_model("xgboost_model.json")
print("Model serialized to JSON and reloaded successfully.")`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="panel p-4 space-y-2 border-hairline/80">
                  <div className="font-semibold text-cyan">Sparsity-Aware Split Finding</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Unlike standard Scikit-Learn tree algorithms which require upfront imputation, XGBoost handles missing values (<code className="text-orange">NaN</code>) natively. When evaluating each split, missing samples are sent to the left branch, then the right branch. The direction yielding the higher Gain is designated as the <em>default direction</em> and stored permanently in the node.
                  </p>
                </div>
                <div className="panel p-4 space-y-2 border-hairline/80">
                  <div className="font-semibold text-violet">Gain vs Weight Importance</div>
                  <p className="text-muted-foreground leading-relaxed">
                    <code className="text-foreground">get_score(importance_type="weight")</code> only counts how many times a feature is split on, biasing towards continuous noise with many split candidates. <code className="text-foreground">importance_type="gain"</code> measures the actual average training loss reduction brought by splits on that feature, making it much more reliable.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
                  <span>xgboost_regressor_workflow.py</span>
                  <span className="text-cyan">xgboost &gt;= 2.0.0</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`import numpy as np
import xgboost as xgb
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.metrics import root_mean_squared_error, r2_score

# 1. Synthesize continuous regression dataset with realistic additive noise
X, y = make_regression(
    n_samples=1500,
    n_features=12,
    n_informative=8,
    noise=10.0,
    random_state=42,
)

# 2. Three-way split: 60% train, 20% validation, 20% held-out test
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.25, random_state=42
)

# 3. Instantiate XGBRegressor with 2nd-order squared-error objective
reg = xgb.XGBRegressor(
    n_estimators=800,
    learning_rate=0.04,
    max_depth=5,
    min_child_weight=2,
    gamma=0.1,
    subsample=0.85,
    colsample_bytree=0.85,
    reg_lambda=1.0,            # L2 ridge penalty on leaf weights
    objective="reg:squarederror",
    eval_metric="rmse",
    early_stopping_rounds=30,  # Patience rounds
    tree_method="hist",
    random_state=42,
)

# 4. Train with early stopping monitoring
reg.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=False,
)

# 5. Out-of-sample evaluation on held-out test set
y_pred = reg.predict(X_test)
rmse = root_mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Optimal Iteration: {reg.best_iteration}")
print(f"Test RMSE: {rmse:.3f}")
print(f"Test R² Score: {r2:.3f}")

# 6. Save model booster
reg.save_model("xgboost_regressor.json")
print("Regression booster saved to JSON.")`}
                </pre>
              </div>

              <div className="panel p-4 space-y-2 border-hairline/80 text-xs">
                <div className="font-semibold text-lime">2nd-Order Taylor Exactness for Squared Error</div>
                <p className="text-muted-foreground leading-relaxed">
                  For squared error <InlineMath formula="l(y, \hat{y}) = \frac{1}{2}(y - \hat{y})^2" />, the negative gradient is <InlineMath formula="g_i = \hat{y}_i - y_i" /> (the residual error) and the Hessian is constant: <InlineMath formula="h_i = 1" />. As a result, the second-order Taylor expansion is not an approximation—it is mathematically exact! The denominator <InlineMath formula="\sum h_i + \lambda = N_j + \lambda" /> directly shrinks leaf predictions by sample count plus ridge weight.
                </p>
              </div>
            </div>
          )}

          {/* 9 Canonical Hyperparameters Guide */}
          <div className="panel p-5 space-y-4">
            <h4 className="text-sm font-semibold text-foreground">The 9 Canonical XGBoost Hyperparameters</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-surface-2/60 border border-hairline/60 space-y-1">
                <div className="font-mono font-bold text-violet">n_estimators (100–2000)</div>
                <p className="text-muted-foreground">Number of sequential boosting rounds. Pair with a low <code className="text-cyan">learning_rate</code> and <code className="text-cyan">early_stopping_rounds</code>.</p>
              </div>
              <div className="p-3 rounded bg-surface-2/60 border border-hairline/60 space-y-1">
                <div className="font-mono font-bold text-violet">learning_rate / eta (0.01–0.1)</div>
                <p className="text-muted-foreground">Step-size shrinkage factor <InlineMath formula="\eta" /> scaling each tree's contribution. Lower values improve generalization at the cost of requiring more iterations.</p>
              </div>
              <div className="p-3 rounded bg-surface-2/60 border border-hairline/60 space-y-1">
                <div className="font-mono font-bold text-violet">max_depth (3–8)</div>
                <p className="text-muted-foreground">Maximum tree depth. Binds the interaction order between features. Values above 8 frequently trigger overfitting on tabular data.</p>
              </div>
              <div className="p-3 rounded bg-surface-2/60 border border-hairline/60 space-y-1">
                <div className="font-mono font-bold text-cyan">min_child_weight (1–10)</div>
                <p className="text-muted-foreground">Minimum sum of instance Hessians <InlineMath formula="\sum h_i" /> required in a leaf. In binary classification, this prevents leaves with very few minority samples.</p>
              </div>
              <div className="p-3 rounded bg-surface-2/60 border border-hairline/60 space-y-1">
                <div className="font-mono font-bold text-cyan">gamma / min_split_loss (0–1.0)</div>
                <p className="text-muted-foreground">Minimum loss reduction required to make a further partition. Splits whose raw gain does not exceed <InlineMath formula="\gamma" /> are pre-pruned.</p>
              </div>
              <div className="p-3 rounded bg-surface-2/60 border border-hairline/60 space-y-1">
                <div className="font-mono font-bold text-cyan">subsample (0.6–0.9)</div>
                <p className="text-muted-foreground">Row subsampling ratio per tree. Induces stochastic diversity across boosting steps and guards against sample-level overfitting.</p>
              </div>
              <div className="p-3 rounded bg-surface-2/60 border border-hairline/60 space-y-1">
                <div className="font-mono font-bold text-orange">colsample_bytree (0.5–0.9)</div>
                <p className="text-muted-foreground">Fraction of feature columns randomly subsampled for each tree. Decorrelates trees and suppresses dominant collinear features.</p>
              </div>
              <div className="p-3 rounded bg-surface-2/60 border border-hairline/60 space-y-1">
                <div className="font-mono font-bold text-orange">reg_alpha (0–1.0)</div>
                <p className="text-muted-foreground">L1 regularization on leaf weights <InlineMath formula="\alpha \sum |w_j|" />. Encourages leaf weights toward zero in sparse or noisy settings.</p>
              </div>
              <div className="p-3 rounded bg-surface-2/60 border border-hairline/60 space-y-1">
                <div className="font-mono font-bold text-orange">reg_lambda (1.0–5.0)</div>
                <p className="text-muted-foreground">L2 ridge regularization on leaf weights <InlineMath formula="\lambda \sum w_j^2" />. Appears directly in the denominator <InlineMath formula="H + \lambda" />, stabilizing small-Hessian leaves.</p>
              </div>
            </div>
          </div>

          <WarningCallout title="Three Common XGBoost Practitioner Mistakes">
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li><strong>Relying on split count (Weight importance):</strong> High-cardinality or continuous noisy features get split on repeatedly, artificially inflating their Weight score. Always inspect <em>Gain</em> or SHAP values.</li>
              <li><strong>Using Python pickle instead of native JSON/UBJSON:</strong> XGBoost 2.0+ deprecates raw pickle for production serialization due to security vulnerabilities and cross-architecture incompatibilities. Use <code className="text-cyan">save_model("model.json")</code>.</li>
              <li><strong>Forgetting to specify validation data for early stopping:</strong> Setting <code className="text-orange">early_stopping_rounds</code> without providing an <code className="text-cyan">eval_set</code> in <code className="text-foreground">fit()</code> will either throw an error or cause the model to train for all <code className="text-foreground">n_estimators</code> without early exit.</li>
            </ul>
          </WarningCallout>
        </div>
      </Container>

      <Container className="pb-24">
        <SectionHeader
          id="quiz"
          index="08"
          eyebrow="Assessment"
          title="Knowledge Check"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <QuizBlock
            title="XGBoost Mastery Quiz"
            questions={[
              {
                id: "q1",
                question: "In the XGBoost split gain formula, what happens if the calculated gain is less than gamma (γ)?",
                options: [
                  "The learning rate is automatically doubled",
                  "The split produces a negative net gain and is pruned/rejected",
                  "XGBoost converts the split into a linear regression model",
                  "The algorithm halts with an error",
                ],
                correctIndex: 1,
                explanation: "Because Gain = 1/2 [Left + Right - Parent] - γ, if the loss reduction does not exceed γ, the overall Gain is negative. XGBoost will not keep this partition, acting as an effective regularization safeguard.",
              },
              {
                id: "q2",
                question: "How does the L2 regularization parameter lambda (λ) influence leaf weight w_j*?",
                options: [
                  "It multiplies the numerator G_j",
                  "It appears in the denominator (H_j + λ), shrinking leaf weights closer to zero and stabilizing small-Hessian leaves",
                  "It forces all leaf weights to be strictly positive",
                  "It has no mathematical connection to leaf weights",
                ],
                correctIndex: 1,
                explanation: "Optimal leaf weight is w_j* = -G_j / (H_j + λ). Increasing λ increases the denominator, thereby reducing the absolute magnitude of w_j* and preventing individual leaves from producing extreme output values.",
              },
              {
                id: "q3",
                question: "Why does XGBoost use a second-order Taylor expansion (first and second derivatives) instead of only first-order gradients?",
                options: [
                  "It allows exact Newton-Raphson step calculation for any arbitrary differentiable loss, optimizing convergence speed and accuracy",
                  "Second derivatives are required for calculating tree depth",
                  "To make the model compatible with GPU acceleration only",
                  "Because decision trees cannot compute first-order gradients",
                ],
                correctIndex: 0,
                explanation: "The second-order Taylor expansion approximates any differentiable loss function locally with a quadratic curve. This yields an analytical closed-form solution for the optimal leaf weight and split gain via Newton-Raphson optimization.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
