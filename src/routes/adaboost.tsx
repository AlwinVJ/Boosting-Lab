import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, SectionHeader, SectionIndex } from "@/components/lab/primitives";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";
import { DerivationStep, WorkedExample, KeyTakeaway } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";

export const Route = createFileRoute("/adaboost")({
  head: () => ({
    meta: [
      { title: "AdaBoost: Adaptive Boosting — Boosting Lab" },
      { name: "description", content: "Master AdaBoost: decision stumps, sample weight updates, learner contribution weights, exponential loss derivation, and Python implementation." },
      { property: "og:title", content: "AdaBoost: Adaptive Boosting — Boosting Lab" },
      { property: "og:description", content: "Comprehensive educational guide to AdaBoost from mathematical derivation to Python implementation." },
    ],
  }),
  component: AdaBoostPage,
});

const SECTIONS = [
  { id: "fundamentals", label: "1. Fundamentals" },
  { id: "mathematics", label: "2. Mathematical Derivation" },
  { id: "worked-example", label: "3. Numerical Example" },
  { id: "implementation", label: "4. Scikit-Learn Code" },
  { id: "quiz", label: "5. Knowledge Check" },
];

function AdaBoostPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "adaboost" }]}
        eyebrow="Module 02 — Foundations"
        title="AdaBoost: Adaptive Boosting"
        description="The foundational boosting algorithm that paved the way for modern ensemble methods by adaptively re-weighting misclassified samples at each iteration."
      />
      <SectionIndex items={SECTIONS} />

      <Container className="py-20">
        <SectionHeader
          id="fundamentals"
          index="01"
          eyebrow="Core Concept"
          title="AdaBoost Fundamentals & Intuition"
          description="Introduced by Yoav Freund and Robert Schapire in 1995, AdaBoost (Adaptive Boosting) answered Kearns and Valiant's fundamental question: Can a collection of weak learners create a single strong learner?"
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <p className="text-base leading-relaxed text-muted-foreground">
            AdaBoost constructs an ensemble sequentially. Unlike bagging (such as Random Forest), where individual trees are trained independently on bootstrap samples, AdaBoost builds models in a pipeline where every new model pays closer attention to the instances that previous models failed to predict accurately.
          </p>
          <KeyTakeaway
            title="The Core Intuition of Adaptive Re-weighting"
            points={[
              "Start with uniform sample weights where every observation has an equal say: w_i = 1/N.",
              "Train a weak base classifier (commonly a decision stump — a 1-split decision tree).",
              "Compute the weighted classification error rate ε_m of the learner.",
              "Assign a learner importance weight α_m based on its accuracy. Accurate learners get high positive votes; learners with 50% accuracy get zero weight.",
              "Increase the weights of misclassified observations and decrease the weights of correctly classified observations.",
              "Renormalize weights so they sum to 1, and repeat the process for M iterations.",
            ]}
          />
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="mathematics"
          index="02"
          eyebrow="Mathematical Foundations"
          title="Step-by-Step Mathematical Derivation"
          description="AdaBoost minimizes exponential loss through stagewise additive modeling. Let us examine the exact mathematical formulas governing learner weights, sample updates, and the final ensemble."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <DerivationStep
            step={1}
            title="Weighted Classification Error Rate (ε_m)"
            formula="\epsilon_m = \frac{\sum_{i=1}^N w_i^{(m)} \cdot \mathbb{I}(y_i \neq h_m(x_i))}{\sum_{i=1}^N w_i^{(m)}}"
            terms={[
              ["w_i^{(m)}", "Weight of sample i at round m"],
              ["y_i \\in \\{-1, +1\\}", "True binary class label"],
              ["h_m(x_i)", "Prediction of the m-th weak classifier"],
              ["\\mathbb{I}(\\cdot)", "Indicator function: 1 if misclassified, 0 otherwise"],
            ]}
            note="If ε_m = 0.5 (random guessing), the learner provides zero information. If ε_m > 0.5, we can invert its predictions to achieve error < 0.5."
          >
            The error rate ε_m is the fraction of total sample weight attributed to misclassified instances.
          </DerivationStep>

          <DerivationStep
            step={2}
            title="Estimator Importance Weight (α_m)"
            formula="\alpha_m = \frac{1}{2} \ln\left(\frac{1 - \epsilon_m}{\epsilon_m}\right)"
            terms={[
              ["\\alpha_m", "Voting power / contribution weight of model m in the ensemble"],
              ["\\epsilon_m", "Weighted classification error of learner m"],
            ]}
            note="When ε_m approaches 0, α_m approaches +∞ (complete confidence). When ε_m = 0.5, α_m = 0 (no vote)."
          >
            By minimizing the exponential loss objective <InlineMath formula="L(y, F(x)) = \exp(-y F(x))" />, we obtain this exact analytical solution for <InlineMath formula="\alpha_m" />.
          </DerivationStep>

          <DerivationStep
            step={3}
            title="Sample Weight Update Rule & Normalization"
            formula="w_i^{(m+1)} = \frac{w_i^{(m)} \cdot \exp\left(-\alpha_m y_i h_m(x_i)\right)}{Z_m}"
            terms={[
              ["Z_m", "Normalization constant: \\sum_{i=1}^N w_i^{(m)} \\exp(-\\alpha_m y_i h_m(x_i))"],
              ["y_i h_m(x_i)", "+1 if correct classification; -1 if misclassified"],
            ]}
            note="For correct predictions: weight is multiplied by exp(-α_m) < 1. For incorrect predictions: weight is multiplied by exp(+α_m) > 1."
          >
            Samples incorrectly classified get their weights magnified by <InlineMath formula="e^{\alpha_m}" />, while correctly classified samples get their weights dampened by <InlineMath formula="e^{-\alpha_m}" />.
          </DerivationStep>

          <DerivationStep
            step={4}
            title="Final Ensemble Prediction"
            formula="H(x) = \text{sign}\left(\sum_{m=1}^M \alpha_m h_m(x)\right)"
            terms={[
              ["H(x)", "Final aggregated ensemble prediction in {-1, +1}"],
              ["M", "Total number of boosting iterations (estimators)"],
            ]}
          >
            The final prediction is a weighted majority vote among all M weak classifiers.
          </DerivationStep>
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="worked-example"
          index="03"
          eyebrow="Numerical Walkthrough"
          title="Worked Numerical Example: 5 Data Points"
          description="Let us trace iteration 1 and 2 manually with exact numbers on a 1D classification problem."
        />
        <div className="max-w-4xl md:ml-[136px]">
          <WorkedExample
            title="AdaBoost 2-Round Trace"
            description="Suppose we have 5 data points: x = [1, 2, 3, 4, 5] with labels y = [+1, +1, -1, -1, +1]. Initially w_i = 1/5 = 0.20."
            steps={[
              {
                label: "Initial weights & Stump 1",
                calculation: "Initial weights: w = [0.20, 0.20, 0.20, 0.20, 0.20]\nStump 1 splits at x < 2.5 -> predicts [+1, +1, -1, -1, -1]",
                result: "Misclassifies only sample 5 (y_5 = +1, predicted -1)",
                explanation: "Error rate ε_1 = w_5 = 0.20. Since ε_1 = 0.20 < 0.5, this is a valid weak classifier.",
              },
              {
                label: "Compute α_1 for Stump 1",
                calculation: "α_1 = 0.5 * ln((1 - 0.20) / 0.20) = 0.5 * ln(0.80 / 0.20) = 0.5 * ln(4) = 0.5 * 1.3863",
                result: "α_1 = 0.6931",
                explanation: "Because Stump 1 has 80% accuracy, it receives a strong positive vote α_1 ≈ 0.693.",
              },
              {
                label: "Update Sample Weights for Round 2",
                calculation: "Correct samples (1-4): w_i * exp(-0.6931) = 0.20 * 0.50 = 0.10\nIncorrect sample (5): w_5 * exp(+0.6931) = 0.20 * 2.00 = 0.40\nZ_1 = 4 * 0.10 + 0.40 = 0.80",
                result: "New normalized weights: w_1..4 = 0.10 / 0.80 = 0.125, w_5 = 0.40 / 0.80 = 0.50",
                explanation: "Notice that sample 5 now accounts for 50% of the entire dataset weight! Stump 2 is forced to prioritize sample 5.",
              },
            ]}
            conclusion="Sequential sample re-weighting dynamically directs model capacity toward previously failed examples without altering the underlying learning algorithm."
          />
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="implementation"
          index="04"
          eyebrow="Hands-On Code"
          title="Python Implementation with Scikit-Learn"
          description="Train and evaluate AdaBoostClassifier with DecisionTreeClassifier(max_depth=1) as base estimator."
        />
        <div className="max-w-4xl space-y-4 md:ml-[136px]">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
              <span>adaboost_example.py</span>
              <span className="text-cyan">Python 3.10+</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import numpy as np

# 1. Instantiate the weak base learner (decision stump)
base_estimator = DecisionTreeClassifier(max_depth=1, random_state=42)

# 2. Configure AdaBoost with 100 boosting rounds and learning rate 1.0
model = AdaBoostClassifier(
    estimator=base_estimator,
    n_estimators=100,
    learning_rate=1.0,
    algorithm="SAMME",
    random_state=42
)

# 3. Fit on training data
model.fit(X_train, y_train)

# 4. Inspect estimator weights (alpha values)
print(f"Number of estimators: {len(model.estimators_)}")
print(f"First 5 estimator weights: {model.estimator_weights_[:5]}")
print(f"First 5 estimator errors: {model.estimator_errors_[:5]}")

# 5. Evaluate
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]
print("ROC-AUC:", roc_auc_score(y_test, y_proba))
print(classification_report(y_test, y_pred))`}
            </pre>
          </div>
        </div>
      </Container>

      <Container className="pb-24">
        <SectionHeader
          id="quiz"
          index="05"
          eyebrow="Assessment"
          title="Knowledge Check"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <QuizBlock
            title="AdaBoost Mastery Quiz"
            questions={[
              {
                id: "q1",
                question: "What happens to the learner weight α_m when a weak classifier has an error rate of exactly ε_m = 0.5 (random guessing)?",
                options: [
                  "α_m becomes negative infinity",
                  "α_m becomes 0, giving the learner zero voting power",
                  "α_m becomes 1.0",
                  "The algorithm halts with an unhandled exception",
                ],
                correctIndex: 1,
                explanation: "When ε_m = 0.5, (1 - ε_m) / ε_m = 0.5 / 0.5 = 1. Since ln(1) = 0, α_m = 0.5 * 0 = 0. The model is given zero say in the final ensemble.",
              },
              {
                id: "q2",
                question: "Why is AdaBoost famously sensitive to noisy data and outlier labels?",
                options: [
                  "Decision stumps cannot split numerical features",
                  "Exponential loss violently magnifies weights of mislabeled or impossible-to-classify samples round after round",
                  "It cannot use more than 50 estimators",
                  "It uses L1 regularization which zeroes out features",
                ],
                correctIndex: 1,
                explanation: "Because AdaBoost multiplies misclassified sample weights by exp(α_m) each round, mislabeled points (noise) will continually be misclassified, absorbing a disproportionate amount of sample weight and distorting subsequent decision boundaries.",
              },
              {
                id: "q3",
                question: "What is the primary difference between AdaBoost and Random Forest?",
                options: [
                  "Random Forest trains deep trees in parallel on bootstrap samples; AdaBoost trains shallow stumps sequentially with adaptive sample weighting",
                  "Random Forest is only for classification; AdaBoost is only for regression",
                  "AdaBoost uses gradient descent while Random Forest uses second-order Hessians",
                  "Random Forest always achieves higher test accuracy than AdaBoost",
                ],
                correctIndex: 0,
                explanation: "Random Forest is a bagging technique focused on variance reduction through parallel decorrelated deep trees, whereas AdaBoost is a boosting technique focused on bias reduction through sequential adaptive correction.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
