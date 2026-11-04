import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, SectionHeader, SectionIndex } from "@/components/lab/primitives";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";
import { DerivationStep, WorkedExample, KeyTakeaway, WarningCallout } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";
import { ResidualDecayChart } from "@/components/lab/charts";

export const Route = createFileRoute("/gradient-boosting")({
  head: () => ({
    meta: [
      { title: "Gradient Boosting Machines (GBM) — Boosting Lab" },
      { name: "description", content: "Master Gradient Boosting Machines: functional gradient descent, pseudo-residuals, shrinkage, loss functions, and Scikit-Learn implementation." },
      { property: "og:title", content: "Gradient Boosting Machines — Boosting Lab" },
      { property: "og:description", content: "Comprehensive educational guide to Gradient Boosting Machines from mathematical derivations to practical implementations." },
    ],
  }),
  component: GradientBoostingPage,
});

const SECTIONS = [
  { id: "intro", label: "1. Overview & Intuition" },
  { id: "residuals", label: "2. Residual-Based Learning" },
  { id: "math", label: "3. Functional Gradient Descent" },
  { id: "derivation", label: "4. Loss Functions & Gradients" },
  { id: "worked-example", label: "5. Worked Numerical Example" },
  { id: "implementation", label: "6. Python Implementation" },
  { id: "quiz", label: "7. Knowledge Check" },
];

function GradientBoostingPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "gradient-boosting" }]}
        eyebrow="Module 03 — Core Algorithms"
        title="Gradient Boosting Machines (GBM)"
        description="Jerome Friedman's revolutionary framework: viewing boosting as gradient descent in function space, allowing sequential tree ensembles to optimize any differentiable loss function."
      />
      <SectionIndex items={SECTIONS} />

      <Container className="py-20">
        <SectionHeader
          id="intro"
          index="01"
          eyebrow="Conceptual Paradigm"
          title="From AdaBoost to Gradient Boosting"
          description="While AdaBoost was restricted to exponential loss for binary classification, Friedman (2001) realized that boosting could be generalized to any differentiable loss function (MSE, MAE, Huber, Deviance/Log-loss) by treating model fitting as gradient descent in function space."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <p className="text-base leading-relaxed text-muted-foreground">
            In standard parametric gradient descent, we optimize parameter vectors <InlineMath formula="\theta" /> in parameter space by moving along the negative gradient <InlineMath formula="-\nabla_\theta L" />. In Gradient Boosting, we instead optimize an entire predictive function <InlineMath formula="F(x)" /> by iteratively adding weak learners <InlineMath formula="h_m(x)" /> that approximate the negative gradient of the loss evaluated at each training point.
          </p>

          <KeyTakeaway
            title="The 3 Pillars of Gradient Boosting"
            points={[
              "Loss Function: Any loss L(y, F(x)) that is differentiable with respect to the model's predictions F(x).",
              "Weak Learner: Typically a shallow regression tree (depth 3 to 6) fit to pseudo-residuals.",
              "Additive Model & Shrinkage: New trees are scaled by a shrinkage factor ν ∈ (0, 1] before being accumulated into the ensemble: F_m(x) = F_{m-1}(x) + ν · h_m(x).",
            ]}
          />
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="residuals"
          index="02"
          eyebrow="Residual Learning"
          title="How Successive Trees Learn Residuals"
          description="For mean squared error (MSE), the negative gradient is simply the ordinary residual: r_i = y_i - F(x_i). Each new tree directly fits the unexplained errors of the current model."
        />
        <div className="grid gap-8 md:ml-[136px] lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Imagine predicting house prices. Suppose our initial model predicts the dataset mean $300,000 for every house. If House A sells for $340,000, its residual is +$40,000. If House B sells for $260,000, its residual is -$40,000.
            </p>
            <p>
              Instead of fitting a second tree on the raw prices, Tree 2 is trained directly on these residuals (+$40k, -$40k). If Tree 2 predicts +$30,000 for House A with a learning rate <InlineMath formula="\nu = 0.1" />, the ensemble update becomes:
            </p>
            <div className="rounded border border-hairline bg-surface p-3 font-mono text-xs text-foreground">
              F_1(House A) = 300,000 + 0.1 × 30,000 = $303,000
            </div>
            <p>
              The remaining residual is now +$37,000. Tree 3 then fits this smaller remaining error. Over dozens or hundreds of rounds, the cumulative ensemble gradually converges to the true target values without overfitting in single giant jumps.
            </p>
          </div>
          <div className="rounded border border-hairline bg-surface p-4">
            <div className="eyebrow mb-2">Residual Decay per Estimator</div>
            <ResidualDecayChart />
          </div>
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="math"
          index="03"
          eyebrow="Mathematical Derivation"
          title="Functional Gradient Descent: The Full Derivation"
          description="Let us derive Friedman's Gradient Boosting algorithm rigorously from first principles of empirical risk minimization."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <DerivationStep
            step={1}
            title="Empirical Risk Minimization in Function Space"
            formula="\min_{F} \mathcal{R}(F) = \sum_{i=1}^N L(y_i, F(x_i))"
            terms={[
              ["F(x)", "The predictive function mapping input features x to predicted target ŷ"],
              ["L(y, F(x))", "Loss function quantifying prediction error"],
              ["N", "Number of training observations"],
            ]}
          >
            We seek a function <InlineMath formula="F^*(x)" /> that minimizes total empirical risk over the dataset.
          </DerivationStep>

          <DerivationStep
            step={2}
            title="Step 0: Initialize with Optimal Constant Prediction"
            formula="F_0(x) = \arg\min_{\gamma} \sum_{i=1}^N L(y_i, \gamma)"
            terms={[
              ["\\gamma", "Constant scalar value minimizing initial loss"],
            ]}
            note="For squared error L(y, F) = 1/2 (y - F)², F_0(x) is the mean of y. For absolute error L(y, F) = |y - F|, F_0(x) is the median of y. For binary log-loss, F_0(x) is the log-odds ln(p / (1 - p))."
          >
            The algorithm begins with a baseline constant prediction that requires zero tree splits.
          </DerivationStep>

          <DerivationStep
            step={3}
            title="Step 1: Compute Pseudo-Residuals (Negative Gradients)"
            formula="r_{im} = -\left[ \frac{\partial L(y_i, F(x_i))}{\partial F(x_i)} \right]_{F(x) = F_{m-1}(x)}"
            terms={[
              ["r_{im}", "Pseudo-residual for sample i at iteration m"],
              ["F_{m-1}(x_i)", "Current ensemble prediction before adding tree m"],
            ]}
            note="The term 'pseudo-residual' highlights that this quantity represents the steepest descent direction in the N-dimensional space of predictions."
          >
            Evaluating the negative derivative of the loss function with respect to the model's current output produces the pseudo-residuals.
          </DerivationStep>

          <DerivationStep
            step={4}
            title="Step 2: Fit Regression Tree to Pseudo-Residuals"
            formula="\mathcal{T}_m = \{R_{jm}\}_{j=1}^{J_m}"
            terms={[
              ["R_{jm}", "Disjoint terminal regions (leaves) of the m-th tree"],
              ["J_m", "Total number of terminal leaves in tree m"],
            ]}
          >
            Train a shallow regression tree using the training set <InlineMath formula="\{(x_i, r_{im})\}_{i=1}^N" />.
          </DerivationStep>

          <DerivationStep
            step={5}
            title="Step 3: Compute Optimal Leaf Outputs (Line Search)"
            formula="\gamma_{jm} = \arg\min_{\gamma} \sum_{x_i \in R_{jm}} L\left(y_i, F_{m-1}(x_i) + \gamma\right)"
            terms={[
              ["\\gamma_{jm}", "Optimal predicted value assigned to leaf j of tree m"],
              ["R_{jm}", "Subset of training instances falling into leaf j"],
            ]}
            note="For squared loss, γ_jm is simply the average of pseudo-residuals in leaf j. For logistic loss, γ_jm has a closed-form approximation via Newton-Raphson."
          >
            Each leaf value is solved to minimize the original loss over the subset of samples landing in that leaf.
          </DerivationStep>

          <DerivationStep
            step={6}
            title="Step 4: Update the Ensemble with Shrinkage (Learning Rate)"
            formula="F_m(x) = F_{m-1}(x) + \nu \sum_{j=1}^{J_m} \gamma_{jm} \mathbb{I}(x \in R_{jm})"
            terms={[
              ["\\nu \\in (0, 1]", "Learning rate / shrinkage parameter (typically 0.01 to 0.1)"],
              ["F_m(x)", "Updated ensemble prediction after round m"],
            ]}
            note="Empirically, setting ν < 0.1 significantly improves generalization performance compared to full step sizes (ν = 1)."
          >
            Scaling new trees by <InlineMath formula="\nu" /> prevents any single tree from dominating the model, analogous to a small step size in stochastic gradient descent.
          </DerivationStep>
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="derivation"
          index="04"
          eyebrow="Loss Functions"
          title="Common Loss Functions & Their Pseudo-Residuals"
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <MathBlock
              label="Squared Error (Regression)"
              formula="L(y, F) = \frac{1}{2}(y - F)^2 \implies r_{im} = y_i - F_{m-1}(x_i)"
              note="Negative gradient is exactly equal to the ordinary residual."
            />
            <MathBlock
              label="Absolute Error / L1 (Robust Regression)"
              formula="L(y, F) = |y - F| \implies r_{im} = \text{sign}(y_i - F_{m-1}(x_i))"
              note="Robust against outliers because gradient magnitude is always ±1."
            />
            <MathBlock
              label="Binary Deviance / Log-Loss (Classification)"
              formula="L(y, F) = \ln(1 + e^{-2y F}) \implies r_{im} = y_i - p_i"
              terms={[["p_i", "\\frac{1}{1 + e^{-F(x_i)}} (predicted probability)"]]}
              note="Residual is difference between true label y_i ∈ {0, 1} and probability p_i."
            />
            <MathBlock
              label="Huber Loss (Smooth Transition)"
              formula="r_{im} = \begin{cases} y_i - F(x_i) & \text{if } |y_i - F| \le \delta \\ \delta \cdot \text{sign}(y_i - F) & \text{otherwise} \end{cases}"
              note="Acts like MSE near zero, but transitions to MAE for extreme outliers."
            />
          </div>
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="worked-example"
          index="05"
          eyebrow="Numerical Walkthrough"
          title="Worked Numerical Example: Regression with 4 Points"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <WorkedExample
            title="GBM Regression Round 1 Trace (Squared Error, ν = 0.1)"
            description="Suppose target values y = [12, 18, 26, 32] for inputs x = [1, 2, 3, 4]."
            steps={[
              {
                label: "Compute Initial Constant Prediction F_0",
                calculation: "F_0 = mean(y) = (12 + 18 + 26 + 32) / 4 = 88 / 4 = 22.0",
                result: "F_0(x) = 22.0 for all x",
                explanation: "The initial model prediction before any tree is fitted is the sample mean.",
              },
              {
                label: "Compute Iteration 1 Pseudo-Residuals r_{i,1} = y_i - F_0",
                calculation: "r_{1,1} = 12 - 22 = -10.0\nr_{2,1} = 18 - 22 = -4.0\nr_{3,1} = 26 - 22 = +4.0\nr_{4,1} = 32 - 22 = +10.0",
                result: "r = [-10.0, -4.0, +4.0, +10.0]",
                explanation: "Points 1 & 2 were over-predicted by F_0; Points 3 & 4 were under-predicted.",
              },
              {
                label: "Fit Tree 1 to Residuals (split at x ≤ 2.5)",
                calculation: "Left Leaf (x=1,2): mean(-10, -4) = -7.0\nRight Leaf (x=3,4): mean(+4, +10) = +7.0",
                result: "h_1(x) = -7.0 if x ≤ 2.5 else +7.0",
                explanation: "The regression tree partitions the data to minimize residual variance.",
              },
              {
                label: "Update Ensemble with Shrinkage ν = 0.1",
                calculation: "For x ≤ 2.5: F_1(x) = 22.0 + 0.1 * (-7.0) = 22.0 - 0.70 = 21.3\nFor x > 2.5: F_1(x) = 22.0 + 0.1 * (+7.0) = 22.0 + 0.70 = 22.7",
                result: "F_1 = [21.3, 21.3, 22.7, 22.7]",
                explanation: "Predictions have moved in the correct direction: Points 1 & 2 shifted downwards, Points 3 & 4 shifted upwards.",
              },
            ]}
            conclusion="Even with a gentle learning rate of 0.1, the MSE decreased from 56.0 down to 48.9 in a single boosting round."
          />
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="implementation"
          index="06"
          eyebrow="Code Example"
          title="Python Implementation: GradientBoostingRegressor"
        />
        <div className="max-w-4xl space-y-4 md:ml-[136px]">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
              <span>gbm_regressor.py</span>
              <span className="text-cyan">Python 3.10+</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# 1. Instantiate GradientBoostingRegressor with tuned shrinkage and depth
gbm = GradientBoostingRegressor(
    loss="squared_error",      # options: 'squared_error', 'absolute_error', 'huber', 'quantile'
    n_estimators=300,          # number of boosting stages
    learning_rate=0.05,        # shrinkage parameter ν
    max_depth=4,               # depth of individual regression trees
    min_samples_split=10,      # minimum samples required to split internal node
    subsample=0.8,             # Stochastic Gradient Boosting (sample 80% rows per tree)
    random_state=42
)

# 2. Fit the ensemble
gbm.fit(X_train, y_train)

# 3. Track training loss progression across stages
train_loss = gbm.train_score_
print(f"Initial loss: {train_loss[0]:.4f}")
print(f"Final loss at iteration 300: {train_loss[-1]:.4f}")

# 4. Predict and evaluate
y_pred = gbm.predict(X_test)
rmse = mean_squared_error(y_test, y_pred, squared=False)
r2 = r2_score(y_test, y_pred)
print(f"Test RMSE: {rmse:.3f}")
print(f"Test R² Score: {r2:.3f}")`}
            </pre>
          </div>
          <WarningCallout title="Stochastic Gradient Boosting (subsample < 1.0)">
            Setting <code className="text-violet">subsample = 0.8</code> introduces row sampling without replacement at each iteration. This reduces variance, mimics bagging, decorrelates successive trees, and speeds up training.
          </WarningCallout>
        </div>
      </Container>

      <Container className="pb-24">
        <SectionHeader
          id="quiz"
          index="07"
          eyebrow="Assessment"
          title="Knowledge Check"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <QuizBlock
            title="Gradient Boosting Mastery Quiz"
            questions={[
              {
                id: "q1",
                question: "Why does Gradient Boosting fit trees to negative gradients instead of raw residuals when using loss functions other than squared error?",
                options: [
                  "Because raw residuals are mathematically undefined for non-linear loss functions",
                  "Because the negative gradient of any loss function points in the direction of steepest loss reduction in prediction space",
                  "Because trees can only split on gradients, not residuals",
                  "To make the algorithm run faster on GPU hardware",
                ],
                correctIndex: 1,
                explanation: "By definition, the negative gradient -∂L/∂F represents the direction of steepest descent. Fitting a regression tree to this vector trains the tree to predict the optimal step direction for reducing the chosen loss.",
              },
              {
                id: "q2",
                question: "What is the purpose of the shrinkage parameter (learning rate ν)?",
                options: [
                  "To normalize leaf values so they sum to 1.0",
                  "To scale down each tree's contribution, leaving room for future trees to learn and reducing overfitting",
                  "To restrict the depth of trees to maximum 2 splits",
                  "To convert regression outputs into probabilities",
                ],
                correctIndex: 1,
                explanation: "Shrinkage (ν < 1) scales the contribution of each tree. Smaller values slow down the learning process, requiring more trees, but consistently achieve superior out-of-sample generalization error.",
              },
              {
                id: "q3",
                question: "For binary classification with deviance (logistic loss), what is the pseudo-residual for an instance with true label y_i ∈ {0, 1} and current predicted probability p_i?",
                options: [
                  "r_i = y_i / p_i",
                  "r_i = y_i - p_i",
                  "r_i = (y_i - p_i)^2",
                  "r_i = ln(p_i / (1 - p_i))",
                ],
                correctIndex: 1,
                explanation: "Differentiating the cross-entropy / deviance loss with respect to the raw logit F(x) yields the elegant gradient: -∂L/∂F = y_i - p_i, exactly the difference between the true binary label and predicted probability.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
