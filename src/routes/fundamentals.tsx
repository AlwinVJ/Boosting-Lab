import { createFileRoute } from "@tanstack/react-router";
import { InteractiveDiagram } from "@/components/lab/BoostingVisualizer";
import { ComparisonTable, ConceptPanel, Container, PageHero, SectionHeader, SectionIndex } from "@/components/lab/primitives";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";
import { DerivationStep, KeyTakeaway, WarningCallout } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";

export const Route = createFileRoute("/fundamentals")({
  head: () => ({
    meta: [
      { title: "Module 01: Fundamentals of Boosting — Boosting Lab" },
      { name: "description", content: "Comprehensive foundation of ensemble learning, weak vs strong learners, bias-variance trade-off, and mathematical additive modeling." },
      { property: "og:title", content: "Module 01: Fundamentals of Boosting — Boosting Lab" },
      { property: "og:description", content: "Understand why weak learners can be combined into arbitrarily strong predictors." },
    ],
  }),
  component: FundamentalsPage,
});

const SECTIONS = [
  { id: "ensemble-learning", label: "1. Ensemble Learning" },
  { id: "bias-variance", label: "2. Bias-Variance Decomposition" },
  { id: "what-is-boosting", label: "3. What is Boosting?" },
  { id: "bagging-vs-boosting", label: "4. Boosting vs. Bagging" },
  { id: "math-foundations", label: "5. Mathematical Foundations" },
  { id: "quiz", label: "6. Knowledge Check" },
];

function FundamentalsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "fundamentals" }]}
        eyebrow="Module 01 — Theory & Foundations"
        title="Fundamentals of Boosting"
        description="The mathematical and conceptual origins of ensemble learning: how sequential weak learners with high bias can be systematically combined into high-precision, low-bias predictors."
      />
      <SectionIndex items={SECTIONS} />

      {/* SECTION 1 */}
      <Container className="py-20">
        <SectionHeader
          id="ensemble-learning"
          index="01"
          eyebrow="Paradigms"
          title="Introduction to Ensemble Learning"
          description="Ensemble methods train multiple individual models (base learners) and aggregate their predictions to achieve superior accuracy and stability compared to any single constituent model."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <p className="text-base leading-relaxed text-muted-foreground">
            The fundamental premise of ensemble learning is rooted in probability theory: if individual hypotheses make errors that are partially independent or uncorrelated, combining their outputs cancels out idiosyncrasies and errors. This is the machine learning realization of the classical <em>Wisdom of Crowds</em> or <em>Condorcet's Jury Theorem</em>.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-base font-semibold text-violet">Homogeneous Ensembles</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                All base learners use the identical learning algorithm (e.g., all decision trees in Random Forest or XGBoost), but each learner is exposed to different sample distributions, feature subsets, or pseudo-residuals.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-base font-semibold text-cyan">Heterogeneous Ensembles</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Base learners are drawn from fundamentally different algorithmic families (e.g., combining a Support Vector Machine, a Neural Network, and a Gradient Boosted Tree via Stacking / Meta-learning).
              </p>
            </div>
          </div>

          <KeyTakeaway
            title="Dietterich's Three Reasons Why Ensembles Work"
            points={[
              "Statistical Reason: When training data is limited, multiple hypotheses can achieve identical training accuracy. Averaging their predictions reduces the risk of choosing a single wrong hypothesis that fails on test data.",
              "Computational Reason: Many learning algorithms (such as decision trees with greedy heuristics or neural networks with gradient descent) get trapped in local optima. Ensembles restart or guide searches from different vantage points.",
              "Representational Reason: The true underlying data-generating function may lie outside the hypothesis space of any single weak learner. Summing or voting weighted outputs expands the expressive capacity of the model.",
            ]}
          />
        </div>
      </Container>

      {/* SECTION 2 */}
      <Container className="pb-20">
        <SectionHeader
          id="bias-variance"
          index="02"
          eyebrow="Theoretical Core"
          title="The Bias-Variance Trade-off"
          description="To understand why bagging and boosting are complementary paradigms, we must examine the mathematical decomposition of expected generalization error."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <MathBlock
            label="Bias-Variance-Noise Decomposition for Mean Squared Error"
            formula="\mathbb{E}\left[\left(y - \hat{f}(x)\right)^2\right] = \underbrace{\left(\text{Bias}\left[\hat{f}(x)\right]\right)^2}_{\text{Underfitting}} + \underbrace{\text{Var}\left[\hat{f}(x)\right]}_{\text{Overfitting / Sensitivity}} + \underbrace{\sigma^2}_{\text{Irreducible Noise}}"
            terms={[
              ["\\text{Bias}[\\hat{f}(x)]", "\\mathbb{E}[\\hat{f}(x)] - f(x) \\quad \\text{(Difference between average prediction and truth)}"],
              ["\\text{Var}[\\hat{f}(x)]", "\\mathbb{E}\\left[(\\hat{f}(x) - \\mathbb{E}[\\hat{f}(x)])^2\\right] \\quad \\text{(Variability of prediction across training sets)}"],
              ["\\sigma^2", "\\text{Var}(\\epsilon) \\quad \\text{(Intrinsic irreducible noise in target data } y = f(x) + \\epsilon)"],
            ]}
            note="High bias means the model is too simple (underfits). High variance means the model is overly complex and captures random sample noise (overfits)."
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded border border-cyan/40 bg-cyan/5 p-5">
              <div className="font-mono text-xs font-semibold uppercase text-cyan">Bagging (e.g. Random Forest)</div>
              <h4 className="mt-1 font-display text-lg font-semibold">Variance Reduction Engine</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Bagging starts with deep, unpruned decision trees that have <strong>very low bias</strong> but <strong>high variance</strong>. By averaging many independently trained bootstrap trees, variance drops by a factor of <InlineMath formula="\approx 1/B" /> while keeping bias low.
              </p>
            </div>
            <div className="rounded border border-violet/40 bg-violet/5 p-5">
              <div className="font-mono text-xs font-semibold uppercase text-violet">Boosting (e.g. GBM, XGBoost)</div>
              <h4 className="mt-1 font-display text-lg font-semibold">Bias Reduction Engine</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Boosting starts with very shallow, simple models (decision stumps) that have <strong>high bias</strong> but <strong>very low variance</strong>. By sequentially fitting subsequent trees to the errors of previous trees, bias is iteratively eliminated.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* SECTION 3 */}
      <Container className="pb-20">
        <SectionHeader
          id="what-is-boosting"
          index="03"
          eyebrow="The Boosting Breakthrough"
          title="What is Boosting? History & Weak Learner Theorem"
          description="In 1988, Michael Kearns and Leslie Valiant posed a question that defined the field: Can an algorithm that outputs a hypothesis only slightly better than random guessing be boosted into an arbitrarily accurate predictor?"
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <p className="text-base leading-relaxed text-muted-foreground">
            In 1990, Robert Schapire proved the <strong>Weak Learning Hypothesis</strong>: the answer is yes. A <em>weak learner</em> is formally defined within the Probably Approximately Correct (PAC) framework as an algorithm whose classification error is guaranteed to be strictly better than random guessing by some margin <InlineMath formula="\gamma > 0" />:
          </p>

          <MathBlock
            label="Weak Learning Condition"
            formula="P\left(h(x) \neq y\right) \le \frac{1}{2} - \gamma \quad \text{for some } \gamma > 0"
            terms={[
              ["h(x)", "Weak classifier output in {-1, +1}"],
              ["\\gamma", "Edge over random guessing (even if \\gamma = 0.01)"],
            ]}
            note="Schapire proved that weak learnability is mathematically equivalent to strong learnability (achieving arbitrarily small error ε > 0 with high confidence 1 - δ)."
          />

          <p className="text-sm leading-relaxed text-muted-foreground">
            The mechanism to achieve this is <strong>sequential error correction</strong>:
          </p>

          <InteractiveDiagram
            nodes={[
              { label: "Dataset D₁", sub: "Uniform Weights", tone: "muted" },
              { label: "Learner h₁", sub: "High Bias Stump", tone: "cyan" },
              { label: "Compute Residuals", sub: "r₁ = y - h₁(x)", tone: "orange" },
              { label: "Learner h₂", sub: "Fits r₁", tone: "violet" },
              { label: "Compute Residuals", sub: "r₂ = r₁ - νh₂", tone: "orange" },
              { label: "Learner h₃", sub: "Fits r₂", tone: "violet" },
              { label: "Ensemble F_M", sub: "F = Σ αₘhₘ", tone: "lime" },
            ]}
          />
        </div>
      </Container>

      {/* SECTION 4 */}
      <Container className="pb-20">
        <SectionHeader
          id="bagging-vs-boosting"
          index="04"
          eyebrow="Systematic Comparison"
          title="Boosting vs. Bagging: The Fundamental Differences"
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <ComparisonTable
            columns={["Dimension", "Bagging (e.g. Random Forest)", "Boosting (GBM, XGBoost, CatBoost)"]}
            rows={[
              ["Architecture", "Parallel & Embarrassingly Distributed", "Sequential & Stagewise Dependent"],
              ["Primary Mechanism", "Variance Reduction (averaging decorrelated outputs)", "Bias Reduction (iterative error correction)"],
              ["Base Estimator", "Deep, low-bias decision trees (max_depth: unlimited)", "Shallow, high-bias decision stumps (max_depth: 2 to 6)"],
              ["Sample Weighting", "Uniform bootstrap sampling with replacement", "Dynamic reweighting or pseudo-residual assignment"],
              ["Aggregation Method", "Simple majority voting or equal arithmetic mean", "Weighted linear combination F_M(x) = Σ α_m h_m(x)"],
              ["Overfitting Behavior", "Does NOT overfit as n_estimators increases", "CAN overfit if n_estimators is large without shrinkage/stopping"],
              ["Collinear Features", "Random feature subsampling mitigates dominance", "Greedy trees exploit strongest feature; requires colsample_bytree"],
              ["Missing Values", "Typically requires imputation before training", "Sparsity-aware learning discovers default split direction"],
            ]}
          />

          <WarningCallout title="Common Misconception: Can Bagging Overfit with More Trees?">
            Adding more trees to a Random Forest never increases overfitting: mathematically, as the number of bootstrap trees <InlineMath formula="B \to \infty" />, the variance converges to a lower bound. In Boosting, however, because each tree seeks to minimize remaining training error, adding thousands of trees with a high learning rate <em>will</em> overfit sample noise.
          </WarningCallout>
        </div>
      </Container>

      {/* SECTION 5 */}
      <Container className="pb-20">
        <SectionHeader
          id="math-foundations"
          index="05"
          eyebrow="Mathematical Formulation"
          title="Stagewise Additive Models & Loss Optimization"
          description="Every boosting algorithm is a concrete realization of a Stagewise Additive Model."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <DerivationStep
            step={1}
            title="The Additive Expansion Model"
            formula="F_M(x) = \sum_{m=1}^M \alpha_m h_m(x; \theta_m)"
            terms={[
              ["F_M(x)", "Final ensemble prediction function"],
              ["h_m(x; \\theta_m)", "Base learner m parameterized by split coordinates \\theta_m"],
              ["\\alpha_m", "Weight coefficient / contribution of learner m"],
              ["M", "Total number of boosting iterations"],
            ]}
          >
            Instead of learning all <InlineMath formula="M" /> models simultaneously (which is computationally intractable), boosting uses <em>forward stagewise additive modeling</em>.
          </DerivationStep>

          <DerivationStep
            step={2}
            title="Forward Stagewise Update Step"
            formula="(\alpha_m, \theta_m) = \arg\min_{\alpha, \theta} \sum_{i=1}^N L\left(y_i, F_{m-1}(x_i) + \alpha h(x_i; \theta)\right)"
            terms={[
              ["F_{m-1}(x)", "Ensemble accumulated up to iteration m-1 (fixed, non-trainable)"],
              ["L(y, \\hat{y})", "Chosen loss function quantifying discrepancy"],
            ]}
            note="Notice: we never modify previously fitted trees F_{m-1}. We only solve for the single best (α_m, θ_m) to add next."
          >
            At round m, previously learned trees are frozen, and the new tree is trained to directly minimize the remaining loss.
          </DerivationStep>

          <DerivationStep
            step={3}
            title="Loss Function Specialization"
            formula="F_m(x) = F_{m-1}(x) + \nu \cdot h_m(x)"
            terms={[
              ["\\nu \\in (0, 1]", "Shrinkage factor (learning rate)"],
            ]}
          >
            Different choices of loss function <InlineMath formula="L(y, F)" /> yield different boosting algorithms:
            <ul className="mt-2 list-disc pl-5 space-y-1 text-xs">
              <li><strong className="text-orange">Exponential Loss:</strong> <InlineMath formula="L(y, F) = e^{-yF}" /> yields <strong>AdaBoost</strong>.</li>
              <li><strong className="text-cyan">Squared Error Loss:</strong> <InlineMath formula="L(y, F) = \frac{1}{2}(y - F)^2" /> yields <strong>L2-Boost / Residual Fitting</strong>.</li>
              <li><strong className="text-violet">Logistic Deviance Loss:</strong> <InlineMath formula="L(y, F) = \ln(1 + e^{-yF})" /> yields <strong>LogitBoost / Gradient Boosting Classifier</strong>.</li>
            </ul>
          </DerivationStep>
        </div>
      </Container>

      {/* SECTION 6 */}
      <Container className="pb-24">
        <SectionHeader
          id="quiz"
          index="06"
          eyebrow="Assessment"
          title="Knowledge Check"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <QuizBlock
            title="Fundamentals of Boosting Mastery Quiz"
            questions={[
              {
                id: "q1",
                question: "What is the primary difference in how Bagging and Boosting handle the Bias-Variance trade-off?",
                options: [
                  "Bagging reduces bias using deep trees; Boosting reduces variance using shallow trees",
                  "Bagging reduces variance by averaging low-bias, high-variance models; Boosting reduces bias by sequentially correcting high-bias weak models",
                  "Both bagging and boosting reduce variance exclusively",
                  "Neither bagging nor boosting affects bias or variance",
                ],
                correctIndex: 1,
                explanation: "Bagging trains independent, complex models in parallel to average away variance. Boosting trains simple, high-bias models sequentially to systematically eliminate bias.",
              },
              {
                id: "q2",
                question: "What does Schapire's Weak Learning Theorem establish?",
                options: [
                  "That any machine learning model with 100% accuracy will always overfit",
                  "That a weak learner performing only slightly better than random guessing can be boosted into an arbitrarily accurate strong learner",
                  "That decision trees cannot be used for regression",
                  "That gradient descent is guaranteed to find global minima for convex problems only",
                ],
                correctIndex: 1,
                explanation: "Schapire proved that the class of weakly learnable concepts (error < 0.5 - γ) is mathematically equivalent to the class of strongly learnable concepts (error < ε for any ε > 0).",
              },
              {
                id: "q3",
                question: "In forward stagewise additive modeling, what happens to the previously trained trees F_{m-1}(x) when tree m is added?",
                options: [
                  "All previous trees are re-trained and their split thresholds are adjusted",
                  "All previous trees are completely frozen and fixed; only the new tree's parameters are optimized",
                  "Previous trees are discarded and replaced by the newest tree",
                  "Their weights α are set to 1/m",
                ],
                correctIndex: 1,
                explanation: "In greedy forward stagewise modeling, the existing ensemble F_{m-1} is held constant. The algorithm solves solely for the parameters of the new candidate learner h_m to minimize the current objective.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
