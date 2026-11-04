import { createFileRoute } from "@tanstack/react-router";
import { FeatureImportanceChart, ModelComparisonChart } from "@/components/lab/charts";
import { ChartContainer, ComparisonTable, Container, DatasetPreview, MetricCard, PageHero, SectionHeader, SectionIndex, Pill } from "@/components/lab/primitives";
import { CREDIT_SAMPLE, MODEL_METRICS } from "@/data/content";
import { KeyTakeaway, WarningCallout, WorkedExample } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";

export const Route = createFileRoute("/case-study")({
  head: () => ({
    meta: [
      { title: "Module 09: Credit Risk Case Study — Boosting Lab" },
      { name: "description", content: "End-to-end financial case study: predicting credit default with XGBoost vs Random Forest vs Logistic Regression, SHAP explainability, and regulatory governance." },
      { property: "og:title", content: "Predicting Credit Risk with Boosting Algorithms — Boosting Lab" },
      { property: "og:description", content: "Complete machine learning case study from business framing to SHAP interpretation and regulatory compliance." },
    ],
  }),
  component: CaseStudyPage,
});

const SECTIONS = [
  { id: "business-understanding", label: "1. Business Problem" },
  { id: "dataset-eda", label: "2. Dataset Understanding" },
  { id: "feature-engineering", label: "3. Feature Engineering" },
  { id: "model-benchmarking", label: "4. Model Benchmarking" },
  { id: "evaluation-thresholding", label: "5. Threshold Optimization" },
  { id: "interpretability-shap", label: "6. SHAP Interpretability" },
  { id: "production-governance", label: "7. Governance & Challenges" },
  { id: "quiz", label: "8. Knowledge Check" },
];

function CaseStudyPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "case-study" }]}
        eyebrow="Module 09 — Real-World Capstone"
        title="Predicting Credit Risk with Boosting"
        description="A complete end-to-end case study in financial machine learning: from asymmetric loss matrices and leak-proof feature pipelines to XGBoost benchmarking, SHAP adverse action explanations, and model governance."
      />
      <SectionIndex items={SECTIONS} />

      <Container className="pt-12 pb-6">
        <div className="grid grid-cols-2 border border-hairline lg:grid-cols-4 [&>*]:border-hairline [&>*:not(:last-child)]:border-r">
          <MetricCard label="Best Model (XGBoost)" value="0.92" delta="+0.08" hint="vs Logistic Regression" tone="violet" />
          <MetricCard label="Target Recall" value="74%" delta="+12%" hint="at 82% precision" tone="cyan" />
          <MetricCard label="Expected Loss Reduction" value="-$4.2M" delta="-18%" hint="annualized portfolio" tone="lime" />
          <MetricCard label="Decision Latency" value="1.2 ms" delta="p99" hint="production inference" tone="orange" />
        </div>
      </Container>

      {/* CHAPTER 1: BUSINESS UNDERSTANDING */}
      <Container className="py-20">
        <SectionHeader
          id="business-understanding"
          index="01"
          eyebrow="Business Framing"
          title="Business Understanding & Asymmetric Costs"
          description="In financial lending, credit risk is the probability that a borrower defaults on required contractual obligations. The cost of misclassification is severely asymmetric."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <p className="text-base leading-relaxed text-muted-foreground">
            A standard machine learning classifier treats False Positives and False Negatives equally. In commercial lending, however, these two errors have radically different financial consequences:
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-orange/40 bg-orange/5 p-5">
              <div className="font-mono text-xs font-semibold uppercase text-orange">False Negative (Type II Error)</div>
              <h4 className="mt-1 font-display text-base font-semibold">Approving a Defaulter</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                The model predicts <InlineMath formula="\hat{y} = 0" /> (safe), but borrower defaults (<InlineMath formula="y = 1" />). The bank loses the unpaid principal, legal fees, and write-off costs—typically <strong>\$10,000 to \$30,000</strong> per loan.
              </p>
            </div>

            <div className="rounded border border-cyan/40 bg-cyan/5 p-5">
              <div className="font-mono text-xs font-semibold uppercase text-cyan">False Positive (Type I Error)</div>
              <h4 className="mt-1 font-display text-base font-semibold">Rejecting a Good Borrower</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                The model predicts <InlineMath formula="\hat{y} = 1" /> (default risk), but borrower would have repaid (<InlineMath formula="y = 0" />). The bank incurs an opportunity cost of lost interest income—typically <strong>\$800 to \$2,000</strong> over the loan life.
              </p>
            </div>
          </div>

          <MathBlock
            label="Asymmetric Financial Cost Function"
            formula="\text{Expected Loss} = C_{\text{FN}} \cdot \sum_{i=1}^N \mathbb{I}(y_i = 1, \hat{y}_i = 0) + C_{\text{FP}} \cdot \sum_{i=1}^N \mathbb{I}(y_i = 0, \hat{y}_i = 1)"
            terms={[
              ["C_{\\text{FN}}", "Cost of False Negative (e.g. $15,000 lost principal)"],
              ["C_{\\text{FP}}", "Cost of False Positive (e.g. $1,200 lost interest profit)"],
            ]}
            note="Notice: C_FN / C_FP ≈ 12.5. Missing a single defaulter costs the bank more than turning away twelve good customers!"
          />
        </div>
      </Container>

      {/* CHAPTER 2: DATASET UNDERSTANDING */}
      <Container className="pb-20">
        <SectionHeader
          id="dataset-eda"
          index="02"
          eyebrow="Exploratory Analysis"
          title="Dataset Structure & Exploratory Analysis"
          description="A representative portfolio of 5,000 consumer installment loans with demographic, behavioral, and credit bureau features."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <DatasetPreview
            name="loan_portfolio_data.csv"
            meta="5,000 rows × 8 features · Default Rate = 14.8%"
            rows={CREDIT_SAMPLE}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded border border-hairline bg-surface p-4 text-xs">
              <div className="font-mono text-muted-foreground">Credit Score (FICO)</div>
              <div className="mt-1 text-sm font-semibold text-foreground">Range: 580 – 810</div>
              <p className="mt-1 text-muted-foreground">Strong negative correlation with default. Lower scores cluster heavily among defaulters.</p>
            </div>
            <div className="rounded border border-hairline bg-surface p-4 text-xs">
              <div className="font-mono text-muted-foreground">Debt-to-Income (DTI)</div>
              <div className="mt-1 text-sm font-semibold text-foreground">Range: 0.12 – 0.58</div>
              <p className="mt-1 text-muted-foreground">Higher ratios (&gt; 0.40) indicate debt distress; non-linear risk escalation above 0.45.</p>
            </div>
            <div className="rounded border border-hairline bg-surface p-4 text-xs">
              <div className="font-mono text-muted-foreground">Delinquencies (24 mo)</div>
              <div className="mt-1 text-sm font-semibold text-foreground">Range: 0 – 6 events</div>
              <p className="mt-1 text-muted-foreground">Count of 30+ day late payments. Highly non-linear trigger for boosting split finding.</p>
            </div>
          </div>
        </div>
      </Container>

      {/* CHAPTER 3: FEATURE ENGINEERING */}
      <Container className="pb-20">
        <SectionHeader
          id="feature-engineering"
          index="03"
          eyebrow="Signal Synthesis"
          title="Feature Engineering & Leakage Prevention"
          description="Crafting ratios that capture solvency risk and strict temporal validation splits."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              In credit underwriting, raw values (such as an annual income of \$80,000 or a loan amount of \$20,000) are only informative when framed relative to one another. We engineer three domain ratios:
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded border border-hairline bg-surface p-3 text-xs">
                <span className="font-mono font-semibold text-cyan">loan_to_income</span>
                <p className="mt-1 text-muted-foreground">Loan Amount / Annual Income. Measures leverage burden.</p>
              </div>
              <div className="rounded border border-hairline bg-surface p-3 text-xs">
                <span className="font-mono font-semibold text-violet">dti_adjusted</span>
                <p className="mt-1 text-muted-foreground">Total existing monthly debt + proposed new installment divided by gross monthly income.</p>
              </div>
              <div className="rounded border border-hairline bg-surface p-3 text-xs">
                <span className="font-mono font-semibold text-lime">payment_risk_index</span>
                <p className="mt-1 text-muted-foreground">Delinquencies × DTI / log(Income). Highlights borrowers with high leverage and troubled history.</p>
              </div>
            </div>
          </div>

          <WarningCallout title="No Target Leakage in Credit Risk">
            Features representing borrower behavior <em>after</em> loan origination (e.g. number of late payments 6 months into the loan) must be strictly excluded. Only features known at the precise timestamp of the loan application are permissible.
          </WarningCallout>
        </div>
      </Container>

      {/* CHAPTER 4: MODEL BENCHMARKING */}
      <Container className="pb-20">
        <SectionHeader
          id="model-benchmarking"
          index="04"
          eyebrow="Comparative Evaluation"
          title="Model Development & Benchmarking"
          description="Benchmarking Logistic Regression baseline vs Random Forest bagging vs Gradient Boosting and XGBoost."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <ComparisonTable
              highlight={3}
              columns={["Model Architecture", "Accuracy", "Precision", "Recall", "F1", "ROC-AUC"]}
              rows={MODEL_METRICS.map((m) => [m.model, m.accuracy.toFixed(2), m.precision.toFixed(2), m.recall.toFixed(2), m.f1.toFixed(2), m.auc.toFixed(2)])}
            />
            <ChartContainer
              title="Multi-Metric Model Benchmark"
              subtitle="Comparing F1, ROC-AUC, and Recall across models"
            >
              <ModelComparisonChart />
            </ChartContainer>
          </div>

          <KeyTakeaway
            title="Analysis of Benchmark Results"
            points={[
              "Logistic Regression achieves respectable accuracy (81%) and AUC (0.84) but suffers on Recall (62%) due to inability to model non-linear interactions without manual polynomial expansion.",
              "Random Forest improves AUC to 0.89 and Recall to 68% by decorrelating decision trees.",
              "XGBoost captures complex non-linear interactions (e.g. low credit score only causing default when DTI exceeds 40%) to achieve highest ROC-AUC (0.92) and Recall (74%).",
            ]}
          />
        </div>
      </Container>

      {/* CHAPTER 5: THRESHOLD OPTIMIZATION */}
      <Container className="pb-20">
        <SectionHeader
          id="evaluation-thresholding"
          index="05"
          eyebrow="Optimal Decisions"
          title="Probability Calibration & Decision Threshold Tuning"
          description="By default, binary classifiers predict default if p >= 0.50. In credit risk, this default threshold is financially disastrous."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Because the cost of approving a defaulter (\$15,000) is 12.5× higher than rejecting a good applicant (\$1,200), we tune the decision threshold <InlineMath formula="\theta" /> by minimizing the expected cost curve rather than optimizing accuracy:
          </p>

          <MathBlock
            label="The Optimal Decision Threshold Rule"
            formula="\theta^* = \frac{C_{\text{FP}}}{C_{\text{FP}} + C_{\text{FN}}} = \frac{1,200}{1,200 + 15,000} = \frac{1,200}{16,200} \approx 0.074"
            note="If the calibrated default probability exceeds just 7.4%, the mathematically rational financial decision is to DECLINE the loan!"
          />

          <WorkedExample
            title="Threshold Shift Impact on Portfolio Performance"
            description="Evaluating 1,000 loan applicants with a portfolio default rate of 14.8%."
            steps={[
              {
                label: "Standard Threshold (θ = 0.50)",
                calculation: "Approved: 880 applicants. Defaults allowed through: 52 False Negatives.\n52 FN × $15,000 = $780,000 loss.",
                result: "Net Portfolio Cost: $780,000",
                explanation: "High default leakages due to symmetric 0.50 threshold.",
              },
              {
                label: "Cost-Optimal Threshold (θ = 0.18)",
                calculation: "Approved: 760 applicants. Defaults caught: Recall rises from 65% to 88%.\nFalse Negatives drop to 18 ($270,000 loss). False Positives rise to 90 ($108,000 lost profit).",
                result: "Net Portfolio Cost: $378,000 (Savings: $402,000 / year)",
                explanation: "Tuning the threshold saves $402,000 annually on this sample portfolio alone!",
              },
            ]}
            conclusion="Machine learning predictions only translate into business value when coupled with cost-aware decision thresholding."
          />
        </div>
      </Container>

      {/* CHAPTER 6: SHAP INTERPRETABILITY */}
      <Container className="pb-20">
        <SectionHeader
          id="interpretability-shap"
          index="06"
          eyebrow="Explainability"
          title="SHAP Interpretability & Adverse Action Notices"
          description="Under the Fair Credit Reporting Act (FCRA) and Equal Credit Opportunity Act (ECOA), lenders are legally required to provide specific, truthful reasons when credit is denied."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <ChartContainer title="Global SHAP Feature Attribution (Credit Risk)">
              <FeatureImportanceChart />
            </ChartContainer>

            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <h5 className="font-display text-sm font-semibold text-foreground">
                Local Individual Explanations
              </h5>
              <p>
                For any applicant, TreeSHAP decomposes the predicted default probability into additive contributions:
              </p>
              <div className="rounded border border-hairline bg-surface p-3 font-mono text-[11px] text-foreground space-y-1">
                <div>Base rate (population): 14.8%</div>
                <div className="text-orange">+ Credit Score 598: +12.4%</div>
                <div className="text-orange">+ DTI 0.47: +8.1%</div>
                <div className="text-lime">- Income $95k: -3.2%</div>
                <div className="font-semibold text-violet">= Final Default Prob: 32.1% (DECLINE)</div>
              </div>
              <p className="text-[11px]">
                The two largest positive SHAP contributions (<code className="text-orange">low credit score</code> and <code className="text-orange">high debt-to-income</code>) become the primary regulatory adverse action reasons delivered to the consumer.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* CHAPTER 7: PRODUCTION GOVERNANCE */}
      <Container className="pb-20">
        <SectionHeader
          id="production-governance"
          index="07"
          eyebrow="Governance & Risk"
          title="Real-World Challenges: Drift, Bias & Compliance"
          description="Deploying credit models requires adherence to federal model risk management guidance (Federal Reserve SR 11-7)."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-hairline bg-surface p-5 text-xs space-y-2">
              <div className="font-mono font-semibold text-orange">Concept & Data Drift</div>
              <p className="text-muted-foreground">
                Economic shifts (such as sudden interest rate hikes or recessions) alter the relationship between borrower features and default probability. Models must be monitored continuously using <strong>Population Stability Index (PSI)</strong>:
              </p>
              <div className="rounded bg-surface-2 p-2 font-mono text-[11px] text-foreground">
                PSI = Σ (Actual% - Expected%) × ln(Actual% / Expected%)
              </div>
              <p className="text-muted-foreground">PSI &gt; 0.25 indicates severe distribution drift requiring retraining.</p>
            </div>

            <div className="rounded border border-hairline bg-surface p-5 text-xs space-y-2">
              <div className="font-mono font-semibold text-cyan">Fair Lending & Disparate Impact</div>
              <p className="text-muted-foreground">
                Even when protected attributes (race, gender, age) are excluded from the dataset, boosting algorithms can discover collinear proxy variables that inadvertently produce disparate impact.
              </p>
              <p className="text-muted-foreground">
                Lenders must calculate the <strong>Adverse Impact Ratio (AIR)</strong>: the approval rate of protected classes must not fall below 80% of the non-protected class approval rate (Four-Fifths Rule).
              </p>
            </div>
          </div>

          <WarningCallout title="Educational Scope Notice">
            This module provides a pedagogical demonstration of boosting workflows in financial credit assessment. Production credit underwriting systems require independent model validation (SR 11-7), fair lending audits, stress testing under macroeconomic shock scenarios, and full regulatory governance.
          </WarningCallout>
        </div>
      </Container>

      {/* CHAPTER 8: QUIZ */}
      <Container className="pb-24">
        <SectionHeader
          id="quiz"
          index="08"
          eyebrow="Assessment"
          title="Knowledge Check"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <QuizBlock
            title="Credit Risk Case Study Mastery Quiz"
            questions={[
              {
                id: "q1",
                question: "Why is a default classification threshold of 0.50 financially suboptimal for a consumer credit lending portfolio?",
                options: [
                  "Because computers cannot calculate decimal thresholds accurately",
                  "Because the cost of approving a defaulting borrower (loss of principal) is much higher than the opportunity cost of rejecting a good borrower",
                  "Because banks are legally required to accept all applicants with probability over 0.10",
                  "Because XGBoost outputs probabilities that always sum to 2.0",
                ],
                correctIndex: 1,
                explanation: "When False Negatives (loan write-offs) are an order of magnitude more costly than False Positives (lost interest profit), lowering the decision threshold to between 0.10 and 0.25 minimizes total portfolio loss.",
              },
              {
                id: "q2",
                question: "How do SHAP values satisfy legal requirements under the Fair Credit Reporting Act (FCRA)?",
                options: [
                  "They prove that the machine learning model has 0% error",
                  "They provide exact, mathematically consistent per-feature contributions for an individual decision, allowing the lender to specify the top reasons for loan denial",
                  "They encrypt borrower data so regulators cannot inspect it",
                  "They replace the need for credit scores",
                ],
                correctIndex: 1,
                explanation: "FCRA mandates that consumers denied credit receive Adverse Action Notices citing the specific primary factors that led to rejection. TreeSHAP quantifies exactly which features most severely pushed an individual applicant's predicted default risk above the approval cutoff.",
              },
              {
                id: "q3",
                question: "What is the primary danger of using random K-Fold cross validation on credit or financial loan data?",
                options: [
                  "It runs slower than StratifiedKFold",
                  "Temporal data leakage: models are evaluated on past loans while trained on future loans, creating artificially inflated test scores that fail in production",
                  "It deletes categorical columns",
                  "K-Fold can only be used with 2 folds in finance",
                ],
                correctIndex: 1,
                explanation: "In finance, economic conditions change over time. Evaluating a model trained on 2024 loans to predict 2023 loans leaks future macroeconomic information. Strict out-of-time (OOT) validation across chronological periods is required.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
