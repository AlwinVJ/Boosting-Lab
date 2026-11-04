import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, SectionHeader, SectionIndex, Pill } from "@/components/lab/primitives";
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
          description="While AdaBoost was restricted to exponential loss for binary classification, Jerome Friedman (1999 technical report, published 2001 in Annals of Statistics) realized that boosting could be generalized to any differentiable loss function (MSE, MAE, Huber, Bernoulli deviance) by treating model fitting as gradient descent in function space."
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
              ["\\gamma", "Constant scalar prediction minimizing initial empirical risk"],
              ["F_0(x)", "Zero-split baseline prediction applied uniformly across all inputs"],
            ]}
            note="Squared Error: F_0 = ȳ (sample mean). Absolute Error: F_0 = median(y). Binary Logistic Deviance: F_0 = ln(p̄ / (1 - p̄)) (sample log-odds). Multiclass Log Loss: F_{0,k} = ln(p̄_k) - (1/K)∑ ln(p̄_j) (centered prior logits)."
          >
            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                Gradient boosting begins with an optimal constant model before growing any tree partitions. Solving <InlineMath formula="\sum_{i=1}^N \frac{\partial L(y_i, \gamma)}{\partial \gamma} = 0" /> yields exact closed-form initializations:
              </p>
              <div className="grid gap-2 sm:grid-cols-2 pt-1 font-mono text-[11px]">
                <div className="rounded bg-surface-2 p-2.5">
                  <span className="text-cyan font-bold">MSE Regression:</span> F_0 = \frac&#123;1&#125;&#123;N&#125;\sum_&#123;i=1&#125;^N y_i = \bar&#123;y&#125;
                </div>
                <div className="rounded bg-surface-2 p-2.5">
                  <span className="text-orange font-bold">MAE Regression:</span> F_0 = \text&#123;median&#125;(y)
                </div>
                <div className="rounded bg-surface-2 p-2.5">
                  <span className="text-violet font-bold">Binary Deviance:</span> F_0 = \ln\left(\frac&#123;\bar&#123;y&#125;&#125;&#123;1 - \bar&#123;y&#125;&#125;\right)
                </div>
                <div className="rounded bg-surface-2 p-2.5">
                  <span className="text-lime font-bold">Multiclass (K):</span> F_&#123;0,k&#125; = \ln(\bar&#123;y&#125;_k) - \frac&#123;1&#125;&#123;K&#125;\sum_&#123;j&#125;\ln(\bar&#123;y&#125;_j)
                </div>
              </div>
            </div>
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
          eyebrow="Loss Functions & Gradients"
          title="Common Loss Functions & Their Pseudo-Residuals"
          description="A rigorous comparison of regression and classification losses, resolving the label convention between {0, 1} Bernoulli deviance and {-1, +1} margin deviance."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <MathBlock
              label="Squared Error (Regression)"
              formula="L(y, F) = \frac{1}{2}(y - F)^2 \implies r_{im} = y_i - F_{m-1}(x_i)"
              terms={[
                ["F_0(x)", "\\bar{y} \\quad \\text{(Sample mean)}"],
                ["\\gamma_{jm}", "\\text{mean}_{x_i \\in R_{jm}}(r_{im}) \\quad \\text{(Average residual in leaf)}"],
              ]}
              note="Negative gradient is exactly equal to the ordinary arithmetic residual."
            />
            <MathBlock
              label="Absolute Error / L1 (Robust Regression)"
              formula="L(y, F) = |y - F| \implies r_{im} = \text{sign}(y_i - F_{m-1}(x_i))"
              terms={[
                ["F_0(x)", "\\text{median}(y) \\quad \\text{(Sample median)}"],
                ["\\gamma_{jm}", "\\text{median}_{x_i \\in R_{jm}}(y_i - F_{m-1}(x_i))"],
              ]}
              note="Robust against extreme outliers because gradient magnitude is bounded at ±1."
            />
          </div>

          <MathBlock
            label="Huber Loss (Smooth Transition between L2 and L1)"
            formula="L_\delta(y, F) = \begin{cases} \frac{1}{2}(y - F)^2 & \text{if } |y - F| \le \delta \\ \delta |y - F| - \frac{1}{2}\delta^2 & \text{otherwise} \end{cases} \implies r_{im} = \begin{cases} y_i - F(x_i) & \text{if } |y_i - F| \le \delta \\ \delta \cdot \text{sign}(y_i - F) & \text{otherwise} \end{cases}"
            terms={[
              ["\\delta", "Transition threshold between quadratic and linear penalty (typically 90th percentile of residuals)"],
            ]}
            note="Combines the fast convergence of MSE near zero with the outlier resistance of MAE for large errors."
          />

          <div className="rounded border border-violet/40 bg-violet/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold text-foreground">
                Binary Classification: Bernoulli Deviance vs. Friedman's Formulation
              </h4>
              <Pill tone="violet">Mathematical Clarification</Pill>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Literature in gradient boosting uses two different label conventions. Confusing these two formulations creates apparent mathematical contradictions in the gradient and probability mappings.
            </p>

            <div className="grid gap-6 md:grid-cols-2 pt-2">
              <div className="rounded border border-hairline bg-surface p-4 space-y-3">
                <div className="font-mono text-xs font-semibold text-cyan uppercase tracking-wider">
                  Standard Modern Formulation: y ∈ &#123;0, 1&#125;
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Used in Scikit-Learn (<code className="text-violet">GradientBoostingClassifier</code>, <code className="text-violet">HistGradientBoostingClassifier</code>), XGBoost (<code className="text-violet">binary:logistic</code>), and LightGBM. The model outputs raw log-odds (logits) <InlineMath formula="F(x) = \ln(p / (1 - p))" />:
                </p>
                <div className="rounded bg-surface-2 p-3 font-mono text-xs space-y-2 text-foreground">
                  <div>p_i = \sigma(F(x_i)) = \frac&#123;1&#125;&#123;1 + e^&#123;-F(x_i)&#125;&#125;</div>
                  <div>L(y, F) = -[y \ln p + (1-y)\ln(1-p)] = \ln(1 + e^F) - yF</div>
                  <div className="text-lime font-bold">r_&#123;im&#125; = -\frac&#123;\partial L&#125;&#123;\partial F&#125; = y_i - p_i</div>
                  <div>F_0 = \ln\left(\frac&#123;\bar&#123;y&#125;&#125;&#123;1 - \bar&#123;y&#125;&#125;\right) \quad (\text&#123;log-odds of sample mean&#125;)</div>
                  <div>\gamma_&#123;jm&#125; \approx \frac&#123;\sum_&#123;i \in R_&#123;jm&#125;&#125; (y_i - p_i)&#125;&#123;\sum_&#123;i \in R_&#123;jm&#125;&#125; p_i(1 - p_i)&#125; \quad (\text&#123;Newton-Raphson step&#125;)</div>
                </div>
              </div>

              <div className="rounded border border-hairline bg-surface p-4 space-y-3">
                <div className="font-mono text-xs font-semibold text-orange uppercase tracking-wider">
                  Friedman (2001) Formulation: y ∈ &#123;-1, +1&#125;
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Used in Friedman's original 2001 paper to parallel AdaBoost's margin notation with probability <InlineMath formula="P(y = +1 \mid x) = \frac{1}{1 + e^{-2F(x)}}" />:
                </p>
                <div className="rounded bg-surface-2 p-3 font-mono text-xs space-y-2 text-foreground">
                  <div>L(y, F) = \ln(1 + e^&#123;-2yF&#125;)</div>
                  <div className="text-lime font-bold">\tilde&#123;r&#125;_&#123;im&#125; = -\frac&#123;\partial L&#125;&#123;\partial F&#125; = \frac&#123;2y_i&#125;&#123;1 + e^&#123;2y_i F(x_i)&#125;&#125;</div>
                  <div>\text&#123;Relating to &#125; \tilde&#123;y&#125; = \frac&#123;y+1&#125;&#123;2&#125; \in \&#123;0, 1\&#125;:</div>
                  <div className="text-cyan">\tilde&#123;r&#125;_&#123;im&#125; = 2(\tilde&#123;y&#125;_i - p_i)</div>
                  <div>\gamma_&#123;jm&#125; \approx \frac&#123;\sum_&#123;i \in R_&#123;jm&#125;&#125; \tilde&#123;r&#125;_&#123;im&#125;&#125;&#123;\sum_&#123;i \in R_&#123;jm&#125;&#125; |\tilde&#123;r&#125;_&#123;im&#125;|(2 - |\tilde&#123;r&#125;_&#123;im&#125;|)&#125;</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Notice that the factor of 2 in Friedman's negative gradient arises from the <InlineMath formula="-2yF" /> scaling in the exponent. When implemented with the standard logit link <InlineMath formula="F = \ln(p/(1-p))" /> on binary labels <InlineMath formula="y \in \{0, 1\}" />, the negative gradient is simply <InlineMath formula="y_i - p_i" />.
            </p>
          </div>

          <div className="rounded border border-lime/40 bg-lime/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold text-foreground">
                Multiclass Classification: Multinomial Deviance (Softmax)
              </h4>
              <Pill tone="lime">K-Tree Architecture</Pill>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              For a <InlineMath formula="K" />-class problem (<InlineMath formula="K > 2" />), target labels are encoded as one-hot indicator vectors <InlineMath formula="y_{ik} \in \{0, 1\}" /> for <InlineMath formula="k = 1, \dots, K" />. The ensemble maintains <InlineMath formula="K" /> parallel continuous functions <InlineMath formula="F_1(x), \dots, F_K(x)" />, producing predicted class probabilities via the Softmax transform:
            </p>

            <MathBlock
              label="Multiclass Softmax Probability & Multinomial Cross-Entropy Loss"
              formula="p_k(x) = \frac{\exp(F_k(x))}{\sum_{j=1}^K \exp(F_j(x))}, \quad L(y, F) = -\sum_{k=1}^K y_k \ln p_k(x)"
              terms={[
                ["y_{ik}", "Binary indicator: 1 if sample i belongs to class k, 0 otherwise"],
                ["p_k(x)", "Predicted posterior probability for class k"],
                ["F_k(x)", "Raw real-valued score (logit) for class k"],
              ]}
              note="Differentiating the multinomial loss with respect to F_k(x_i) yields the negative gradient: r_{ikm} = y_{ik} - p_k(x_i)."
            />

            <div className="rounded border border-hairline bg-surface p-4 space-y-2 text-xs">
              <div className="font-semibold text-foreground">Crucial Architectural Consequence: K Trees per Stage</div>
              <p className="text-muted-foreground leading-relaxed">
                Unlike binary classification (which trains a single tree per boosting round), multiclass gradient boosting builds <strong><InlineMath formula="K" /> distinct regression trees at every boosting iteration <InlineMath formula="m" /></strong> (one tree per class). For 10 classes and 200 estimators, the model fits a total of <InlineMath formula="10 \times 200 = 2,000" /> trees.
              </p>
              <div className="rounded bg-surface-2 p-2.5 font-mono text-[11px] text-foreground">
                \gamma_&#123;jkm&#125; \approx \frac&#123;K-1&#125;&#123;K&#125; \frac&#123;\sum_&#123;x_i \in R_&#123;jkm&#125;&#125; r_&#123;ikm&#125;&#125;&#123;\sum_&#123;x_i \in R_&#123;jkm&#125;&#125; |r_&#123;ikm&#125;|(1 - |r_&#123;ikm&#125;|)&#125;, \quad F_&#123;m,k&#125;(x) = F_&#123;m-1,k&#125;(x) + \nu \sum_&#123;j=1&#125;^&#123;J_&#123;km&#125;&#125; \gamma_&#123;jkm&#125; \mathbb&#123;I&#125;(x \in R_&#123;jkm&#125;)
              </div>
            </div>
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
from sklearn.metrics import root_mean_squared_error, r2_score
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

# 4. Predict and evaluate (using Scikit-Learn 1.4+ root_mean_squared_error)
y_pred = gbm.predict(X_test)
rmse = root_mean_squared_error(y_test, y_pred)
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
              {
                id: "q4",
                question: "If GradientBoostingClassifier is trained with n_estimators = 100 on a 5-class dataset (K = 5), how many total individual decision trees are fitted across the ensemble?",
                options: [
                  "500 trees (5 separate regression trees per boosting stage, one for each class)",
                  "100 trees (one single multi-output tree per boosting stage)",
                  "20 trees (100 divided evenly across 5 classes)",
                  "1 tree with 500 leaves",
                ],
                correctIndex: 0,
                explanation: "Under the multinomial deviance loss, each boosting iteration fits K independent regression trees—one for each target class—to approximate that class's pseudo-residuals. For 100 iterations and 5 classes, 100 × 5 = 500 trees are built.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
