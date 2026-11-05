import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, SectionHeader, SectionIndex, Pill, Tabs } from "@/components/lab/primitives";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";
import { DerivationStep, WorkedExample, KeyTakeaway, WarningCallout } from "@/components/lab/PedagogicalComponents";
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
  const [task, setTask] = useState<"classifier" | "regressor">("classifier");

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

          <div className="rounded border border-violet/40 bg-violet/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-violet">
                Theoretical Breakthrough (Kearns & Valiant 1988, Schapire 1990)
              </span>
              <Pill tone="violet">PAC Theory</Pill>
            </div>
            <h4 className="font-display text-base font-semibold text-foreground">
              Equivalence of Weak and Strong Learnability
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              In Probably Approximately Correct (PAC) learning theory, a <em>strong learner</em> is an algorithm capable of achieving arbitrarily high accuracy (<InlineMath formula="1 - \epsilon" /> for any <InlineMath formula="\epsilon > 0" />) with high confidence (<InlineMath formula="1 - \delta" />). A <em>weak learner</em> is only required to perform slightly better than random chance (<InlineMath formula="\epsilon < 1/2 - \gamma" /> for some <InlineMath formula="\gamma > 0" />). Schapire (1990) proved the profound mathematical result that <strong>weak learnability is equivalent to strong learnability</strong>: any weak learning algorithm can be transformed into an arbitrarily strong learner via sequential boosting.
            </p>
          </div>

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
              ["w_i^{(m)}", "Weight of sample i at round m (normalized such that \\sum w_i^{(m)} = 1)"],
              ["y_i \\in \\{-1, +1\\}", "True binary class label"],
              ["h_m(x_i)", "Prediction of the m-th weak classifier in {-1, +1}"],
              ["\\mathbb{I}(\\cdot)", "Indicator function: 1 if misclassified, 0 otherwise"],
            ]}
            note="If ε_m = 0.5 (random guessing), the learner provides zero information. If ε_m > 0.5, inverting its predictions yields an error rate of 1 - ε_m < 0.5."
          >
            The error rate ε_m is the fraction of total sample weight attributed to misclassified instances.
          </DerivationStep>

          <DerivationStep
            step={2}
            title="Analytical Derivation of Estimator Importance Weight (α_m)"
            formula="\alpha_m = \frac{1}{2} \ln\left(\frac{1 - \epsilon_m}{\epsilon_m}\right)"
            terms={[
              ["\\alpha_m", "Voting power / contribution weight of model m in the ensemble"],
              ["\\epsilon_m", "Weighted classification error of learner m"],
            ]}
            note="When ε_m approaches 0, α_m approaches +∞ (complete confidence). When ε_m = 0.5, α_m = 0 (no vote)."
          >
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                At round <InlineMath formula="m" />, AdaBoost minimizes the exponential loss of the updated ensemble <InlineMath formula="F_m(x) = F_{m-1}(x) + \alpha h_m(x)" />:
              </p>
              <div className="rounded bg-surface-2 p-3 font-mono text-[11px] text-foreground">
                \mathcal&#123;L&#125;(\alpha) = \sum_&#123;i=1&#125;^N w_i^&#123;(m)&#125; \exp\left(-\alpha y_i h_m(x_i)\right)
              </div>
              <p>
                Partitioning training samples into those correctly classified (<InlineMath formula="y_i h_m(x_i) = +1" />) and misclassified (<InlineMath formula="y_i h_m(x_i) = -1" />):
              </p>
              <div className="rounded bg-surface-2 p-3 font-mono text-[11px] text-foreground">
                \mathcal&#123;L&#125;(\alpha) = e^&#123;-\alpha&#125; \sum_&#123;y_i = h_m(x_i)&#125; w_i^&#123;(m)&#125; + e^&#123;\alpha&#125; \sum_&#123;y_i \neq h_m(x_i)&#125; w_i^&#123;(m)&#125; = (1 - \epsilon_m) e^&#123;-\alpha&#125; + \epsilon_m e^&#123;\alpha&#125;
              </div>
              <p>
                Taking the derivative with respect to <InlineMath formula="\alpha" /> and setting it to zero:
              </p>
              <div className="rounded bg-surface-2 p-3 font-mono text-[11px] text-foreground">
                \frac&#123;\partial \mathcal&#123;L&#125;&#125;&#123;\partial \alpha&#125; = -(1 - \epsilon_m)e^&#123;-\alpha&#125; + \epsilon_m e^&#123;\alpha&#125; = 0 \implies e^&#123;2\alpha&#125; = \frac&#123;1 - \epsilon_m&#125;&#123;\epsilon_m&#125; \implies \alpha_m = \frac&#123;1&#125;&#123;2&#125; \ln\left(\frac&#123;1 - \epsilon_m&#125;&#123;\epsilon_m&#125;\right)
              </div>
            </div>
          </DerivationStep>

          <DerivationStep
            step={3}
            title="Normalization Constant (Z_m) & Exponential Loss Bound"
            formula="Z_m = \sum_{i=1}^N w_i^{(m)} \exp\left(-\alpha_m y_i h_m(x_i)\right) = 2\sqrt{\epsilon_m(1 - \epsilon_m)}"
            terms={[
              ["Z_m", "Normalization constant ensuring updated weights sum to 1.0"],
              ["\\epsilon_m = \\frac{1}{2} - \\gamma_m", "Classifier edge \\gamma_m > 0 over random guessing"],
            ]}
            note="Because Z_m = √(1 - 4γ_m²) ≤ exp(-2γ_m²), the training error drops exponentially: (1/N) ∑ I(H(x_i) ≠ y_i) ≤ ∏ Z_m ≤ exp(-2 ∑ γ_m²)."
          >
            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                Plugging the optimal <InlineMath formula="\alpha_m" /> back into <InlineMath formula="\mathcal{L}(\alpha)" /> yields the minimal loss at step <InlineMath formula="m" />:
              </p>
              <div className="rounded bg-surface-2 p-3 font-mono text-[11px] text-foreground">
                Z_m = (1 - \epsilon_m)\sqrt&#123;\frac&#123;\epsilon_m&#125;&#123;1 - \epsilon_m&#125;&#125; + \epsilon_m\sqrt&#123;\frac&#123;1 - \epsilon_m&#125;&#123;\epsilon_m&#125;&#125; = 2\sqrt&#123;\epsilon_m(1 - \epsilon_m)&#125;
              </div>
              <p>
                As long as each weak learner performs slightly better than random chance (<InlineMath formula="\epsilon_m < 0.5 \implies \gamma_m > 0" />), we have <InlineMath formula="Z_m < 1" />, guaranteeing that training error converges to zero at an exponential rate.
              </p>
            </div>
          </DerivationStep>

          <DerivationStep
            step={4}
            title="Sample Weight Update Rule"
            formula="w_i^{(m+1)} = \frac{w_i^{(m)} \cdot \exp\left(-\alpha_m y_i h_m(x_i)\right)}{Z_m}"
            terms={[
              ["w_i^{(m+1)}", "New normalized sample weight for observation i in round m+1"],
              ["y_i h_m(x_i)", "+1 if correct classification; -1 if misclassified"],
            ]}
            note="For correct predictions: weight is multiplied by exp(-α_m) < 1. For incorrect predictions: weight is multiplied by exp(+α_m) > 1."
          >
            Samples incorrectly classified get their weights magnified by <InlineMath formula="e^{\alpha_m}" />, while correctly classified samples get their weights dampened by <InlineMath formula="e^{-\alpha_m}" />.
          </DerivationStep>

          <DerivationStep
            step={5}
            title="Final Ensemble Prediction & Margin Theory"
            formula="H(x) = \text{sign}\left(\sum_{m=1}^M \alpha_m h_m(x)\right)"
            terms={[
              ["H(x)", "Final aggregated ensemble prediction in {-1, +1}"],
              ["M", "Total number of boosting iterations (estimators)"],
            ]}
          >
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                The final prediction is a weighted majority vote among all <InlineMath formula="M" /> weak classifiers.
              </p>
              <div className="rounded border border-hairline bg-surface p-3 space-y-1.5">
                <div className="font-semibold text-cyan">Why AdaBoost Resists Overfitting: Margin Theory</div>
                <p>
                  Schapire, Freund, Bartlett, and Lee (1998) demonstrated that AdaBoost continues to improve generalization performance even after training classification error reaches 0%. This occurs because AdaBoost continues to increase the <strong>classification margins</strong> of the training examples: <InlineMath formula="\text{margin}(x, y) = y \frac{\sum_{m} \alpha_m h_m(x)}{\sum_m \alpha_m} \in [-1, 1]" />. Larger margins correlate directly with lower upper bounds on generalization error.
                </p>
              </div>
            </div>
          </DerivationStep>

          <div className="rounded border border-cyan/40 bg-cyan/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold text-foreground">
                Multiclass AdaBoost: The SAMME Algorithm (Zhu et al. 2009)
              </h4>
              <Pill tone="cyan">K-Class Generalization</Pill>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Standard binary AdaBoost requires <InlineMath formula="\epsilon_m < 0.5" />. In a <InlineMath formula="K" />-class problem (<InlineMath formula="K > 2" />), random guessing yields an error of <InlineMath formula="1 - 1/K" /> (e.g. 90% error for 10 classes). Requiring error &lt; 50% would be excessively restrictive. Zhu, Zou, Rosset, and Hastie (2009) introduced <strong>SAMME</strong> (Stagewise Additive Modeling using a Multi-class Exponential loss function):
            </p>
            <MathBlock
              label="SAMME Learner Weight Formula"
              formula="\alpha_m = \ln\left(\frac{1 - \epsilon_m}{\epsilon_m}\right) + \ln(K - 1)"
              terms={[
                ["K", "Number of distinct classes (K ≥ 2)"],
                ["\\epsilon_m", "Weighted multiclass classification error rate"],
              ]}
              note="Notice: when K = 2, ln(K - 1) = ln(1) = 0, reducing exactly to binary AdaBoost up to a scale factor of 1/2. For any K, α_m > 0 as long as accuracy > 1/K (better than random guessing)."
            />
            <WarningCallout title="Scikit-Learn API Modernization Notice">
              Scikit-Learn originally offered two multiclass AdaBoost algorithms: <code className="text-violet">SAMME</code> (discrete predictions) and <code className="text-violet">SAMME.R</code> (real-valued class probability estimates). <code className="text-violet">SAMME.R</code> was <strong>deprecated in Scikit-Learn 1.4</strong> and <strong>removed in Scikit-Learn 1.6</strong>, which also removed the <code className="text-violet">algorithm</code> parameter entirely, standardizing strictly on discrete SAMME. In modern Python code, omit the <code className="text-cyan">algorithm</code> argument to maintain full backward and forward compatibility.
            </WarningCallout>
          </div>
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
          description="Complete, reproducible end-to-end workflows for both AdaBoostClassifier and AdaBoostRegressor with decision stumps, weight inspection, and persistence."
        />
        <div className="max-w-4xl space-y-4 md:ml-[136px]">
          <div className="border border-hairline bg-surface">
            <Tabs<"classifier" | "regressor">
              value={task}
              onChange={setTask}
              tabs={[
                { value: "classifier", label: "AdaBoostClassifier (Discrete SAMME)" },
                { value: "regressor", label: "AdaBoostRegressor (Drucker 1997)" },
              ]}
            />
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>Script: <strong className="text-foreground">{task === "classifier" ? "adaboost_classifier.py" : "adaboost_regressor.py"}</strong></span>
                <Pill tone="cyan">Python 3.10+ · Scikit-Learn 1.4+</Pill>
              </div>

              {task === "classifier" ? (
                <>
                  <pre className="overflow-x-auto rounded bg-surface-2 p-4 font-mono text-xs leading-6 text-foreground">
{`from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report, confusion_matrix
import joblib

# 1. Dataset Preparation: Generate synthetic binary dataset
X, y = make_classification(
    n_samples=1200, n_features=10, n_informative=6, n_redundant=2,
    weights=[0.70, 0.30], random_state=42
)

# 2. Stratified Data Splitting: Preserve 30% class balance across train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# 3. Base Weak Learner: Decision stump (max_depth=1)
# NOTE: 'estimator' replaces deprecated 'base_estimator' in Scikit-Learn 1.4+
stump = DecisionTreeClassifier(max_depth=1, random_state=42)

# 4. Model Training: Configure AdaBoost with decision stumps
# NOTE: 'estimator' replaces 'base_estimator' (1.4+). In Scikit-Learn 1.6+,
# the 'algorithm' parameter was removed, standardizing exclusively on discrete SAMME.
clf = AdaBoostClassifier(
    estimator=stump,
    n_estimators=100,
    learning_rate=0.8,
    random_state=42
)
clf.fit(X_train, y_train)

# 5. Model Inspection: Extract learner contribution weights (alpha_m)
print(f"Total estimators fitted: {len(clf.estimators_)}")
print(f"First 5 alpha weights: {clf.estimator_weights_[:5].round(4)}")
print(f"First 5 weighted errors: {clf.estimator_errors_[:5].round(4)}")

# 6. Evaluation & Inference
y_pred = clf.predict(X_test)
y_proba = clf.predict_proba(X_test)[:, 1]
print(f"Test Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"Test ROC-AUC:  {roc_auc_score(y_test, y_proba):.4f}")
print("Confusion Matrix:\\n", confusion_matrix(y_test, y_pred))

# 7. Model Persistence
joblib.dump(clf, "adaboost_classifier.joblib")
print("Model saved to adaboost_classifier.joblib")`}
                  </pre>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded border border-hairline/60 bg-surface-2/60 p-3 space-y-1">
                      <span className="font-semibold text-lime">Why 'estimator' &amp; SAMME?</span>
                      <p className="text-muted-foreground">Scikit-Learn 1.4+ renamed <code className="text-foreground">base_estimator</code> to <code className="text-foreground">estimator</code>. The real-valued <code className="text-foreground">SAMME.R</code> algorithm was deprecated and removed in 1.6 along with the <code className="text-foreground">algorithm</code> parameter; <code className="text-foreground">AdaBoostClassifier</code> now implements the exact discrete Freund &amp; Schapire exponential loss formulation by default.</p>
                    </div>
                    <div className="rounded border border-hairline/60 bg-surface-2/60 p-3 space-y-1">
                      <span className="font-semibold text-orange">Why Decision Stumps (Depth 1)?</span>
                      <p className="text-muted-foreground">Boosting requires <em>weak</em> learners with high bias. If you pass an unconstrained tree (<code className="text-foreground">max_depth=None</code>), each tree memorizes the data, producing zero training error (<InlineMath formula="\epsilon_m = 0" />) and rendering subsequent boosting rounds useless.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <pre className="overflow-x-auto rounded bg-surface-2 p-4 font-mono text-xs leading-6 text-foreground">
{`from sklearn.ensemble import AdaBoostRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
import joblib

# 1. Dataset Preparation: Continuous regression target
X, y = make_regression(n_samples=1000, n_features=8, noise=15.0, random_state=42)

# 2. Train-Test Split (75% train, 25% test)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)

# 3. Base Weak Learner: Shallow regression tree
base_tree = DecisionTreeRegressor(max_depth=3, random_state=42)

# 4. AdaBoost.R2 Configuration (Drucker 1997)
reg = AdaBoostRegressor(
    estimator=base_tree,
    n_estimators=100,
    learning_rate=0.1,
    loss="linear",              # Options: 'linear', 'square', 'exponential'
    random_state=42
)
reg.fit(X_train, y_train)

# 5. Out-of-Sample Regression Evaluation
y_pred = reg.predict(X_test)
print(f"Test MAE:  {mean_absolute_error(y_test, y_pred):.3f}")
print(f"Test RMSE: {root_mean_squared_error(y_test, y_pred):.3f}")
print(f"Test R²:   {r2_score(y_test, y_pred):.3f}")

# 6. Model Persistence
joblib.dump(reg, "adaboost_regressor.joblib")
print("Model saved to adaboost_regressor.joblib")`}
                  </pre>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded border border-hairline/60 bg-surface-2/60 p-3 space-y-1">
                      <span className="font-semibold text-cyan">AdaBoost.R2 Loss Formulations:</span>
                      <p className="text-muted-foreground"><code className="text-foreground">loss="linear"</code> weights errors proportionally <InlineMath formula="e_i = |y_i - \hat{y}_i| / D" />. <code className="text-foreground">loss="square"</code> emphasizes larger anomalies, while <code className="text-foreground">loss="exponential"</code> mirrors classification-style margin penalties.</p>
                    </div>
                    <div className="rounded border border-hairline/60 bg-surface-2/60 p-3 space-y-1">
                      <span className="font-semibold text-violet">Standalone Script Reference:</span>
                      <p className="text-muted-foreground">Run the complete standalone script from your terminal: <code className="text-foreground">python python/01_adaboost_workflow.py</code></p>
                    </div>
                  </div>
                </>
              )}
            </div>
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
              {
                id: "q4",
                question: "In the multiclass SAMME algorithm with K classes, what accuracy must a weak classifier achieve to receive a positive voting weight (α_m > 0)?",
                options: [
                  "Accuracy strictly greater than 1/K (better than random chance in K classes)",
                  "Accuracy strictly greater than 50%",
                  "Accuracy strictly greater than (K - 1) / K",
                  "Accuracy strictly greater than 90%",
                ],
                correctIndex: 0,
                explanation: "Because α_m = ln((1 - ε_m) / ε_m) + ln(K - 1), α_m is positive whenever 1 - ε_m > 1/K. This correctly generalizes the binary condition (accuracy > 1/2) to arbitrary K-class problems.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
