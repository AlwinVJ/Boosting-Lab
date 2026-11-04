import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, SectionHeader, SectionIndex } from "@/components/lab/primitives";
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
          description="Released in 2014–2016, XGBoost rapidly became the benchmark solution across industry and competitive data science (winning over 17 out of 29 Kaggle challenges in 2015)."
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
            formula="\tilde{\mathcal{L}}^{(t)} = \sum_{j=1}^T \left[ \left(\sum_{i \in I_j} g_i\right) w_j + \frac{1}{2}\left(\sum_{i \in I_j} h_i + \lambda\right) w_j^2 \right] + \gamma T"
            terms={[
              ["I_j", "Set of data points mapped to leaf j: I_j = \\{i : q(x_i) = j\\}"],
              ["G_j", "\\sum_{i \\in I_j} g_i \\quad \\text{(Sum of gradients in leaf j)}"],
              ["H_j", "\\sum_{i \\in I_j} h_i \\quad \\text{(Sum of Hessians in leaf j)}"],
            ]}
          >
            By defining <InlineMath formula="G_j = \sum_{i \in I_j} g_i" /> and <InlineMath formula="H_j = \sum_{i \in I_j} h_i" />, the objective decomposes into independent quadratic equations for each leaf <InlineMath formula="j" />.
          </DerivationStep>

          <DerivationStep
            step={5}
            title="Optimal Leaf Weight w_j* & Optimal Objective Value"
            formula="w_j^* = -\frac{G_j}{H_j + \lambda}, \qquad \tilde{\mathcal{L}}^*(q) = -\frac{1}{2} \sum_{j=1}^T \frac{G_j^2}{H_j + \lambda} + \gamma T"
            terms={[
              ["w_j^*", "The optimal prediction value for leaf j (found by setting derivative ∂L/∂w_j = 0)"],
              ["\\tilde{\\mathcal{L}}^*(q)", "Structure score: measures the quality of tree structure q"],
            ]}
            note="If λ = 0, w_j* is the standard Newton-Raphson step -G_j / H_j. The L2 penalty λ guarantees denominator stability when H_j is small."
          >
            This gives the exact analytical formula for how much each leaf should output.
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
            note="A split is only accepted if Gain > 0. This naturally implements pre-pruning!"
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
                L1 regularization on leaf weights. Drives leaf weights to exactly zero, producing sparse models and automatic feature pruning.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-4">
              <div className="font-mono text-sm font-semibold text-lime">min_child_weight</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Minimum sum of Hessians <InlineMath formula="\sum h_i" /> required in a child. For regression, this is the number of samples; for classification, it corresponds to effective sample count.
              </p>
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
          title="Python Implementation with xgboost"
        />
        <div className="max-w-4xl space-y-4 md:ml-[136px]">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
              <span>train_xgboost.py</span>
              <span className="text-cyan">xgboost 2.0+</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, log_loss

# 1. Instantiate modern XGBClassifier with regularized parameters
model = xgb.XGBClassifier(
    n_estimators=1000,
    learning_rate=0.03,
    max_depth=5,
    min_child_weight=3,
    gamma=0.2,                 # leaf penalty
    reg_alpha=0.1,             # L1 regularization
    reg_lambda=1.5,            # L2 regularization
    subsample=0.8,             # row subsampling
    colsample_bytree=0.8,      # column subsampling per tree
    eval_metric=["auc", "logloss"],
    early_stopping_rounds=50,  # stop if validation AUC doesn't improve for 50 rounds
    random_state=42,
    tree_method="hist",        # fast histogram-based split finding
)

# 2. Fit with validation monitoring
model.fit(
    X_train, y_train,
    eval_set=[(X_train, y_train), (X_val, y_val)],
    verbose=100
)

# 3. Best iteration information
print(f"Best Iteration: {model.best_iteration}")
print(f"Best Validation Score: {model.best_score:.4f}")

# 4. Feature Importance types
print("Weight Importance:", model.get_booster().get_score(importance_type="weight"))
print("Gain Importance:", model.get_booster().get_score(importance_type="gain"))`}
            </pre>
          </div>
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
