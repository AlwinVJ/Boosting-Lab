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
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Pill tone="cyan">Illustrative Benchmark Simulation</Pill>
          <span className="font-mono text-xs text-muted-foreground">Synthetically calibrated consumer installment loan portfolio</span>
        </div>
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
            name="synthetic_loan_portfolio.csv"
            meta="5,000 synthetic rows × 8 features · Default Rate = 14.8% · Illustrative Benchmark"
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
          <p className="font-mono text-xs text-muted-foreground">
            * Note: Benchmark metrics reflect an illustrative synthetic simulation (5,000 observations, 14.8% default prevalence, 80/20 train/test split). Real-world credit risk benchmarks depend on specific portfolio macroeconomic conditions and feature sets.
          </p>

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
            Because the cost of approving a defaulter (<InlineMath formula="C_{\text{FN}} = \$15,000" />) is 12.5× higher than turning away a creditworthy applicant (<InlineMath formula="C_{\text{FP}} = \$1,200" />), we tune the decision threshold <InlineMath formula="\theta" /> by minimizing expected monetary cost rather than maximizing raw classification accuracy:
          </p>

          <MathBlock
            label="Theoretical Bayes-Optimal Decision Threshold"
            formula="\theta^* = \frac{C_{\text{FP}}}{C_{\text{FP}} + C_{\text{FN}}} = \frac{1,200}{1,200 + 15,000} = \frac{1,200}{16,200} \approx 0.0741 \quad (7.41\%)"
            terms={[
              ["\\theta^*", "Bayes-optimal default probability cutoff for calibrated probabilities"],
              ["C_{\\text{FN}}", "Loss from approving a defaulter ($15,000 principal write-off)"],
              ["C_{\\text{FP}}", "Opportunity cost from rejecting a solvent borrower ($1,200 interest profit)"],
            ]}
            note="Under strictly calibrated probabilities, predicting default whenever p >= 7.41% minimizes theoretical portfolio loss. In commercial banking practice, institutions explore the full empirical cost curve to balance write-off reduction against commercial loan volume requirements."
          />

          <WorkedExample
            title="Threshold Shift Impact on Portfolio Performance (1,000 Applicant Cohort)"
            description="Evaluating 1,000 loan applicants with a baseline default prevalence of 14.8% (148 actual defaults, 852 actual non-defaulters)."
            steps={[
              {
                label: "Operating Point 1: Standard Symmetric Threshold (θ = 0.50)",
                calculation: "Approved: 880 applicants (120 rejected).\n• False Negatives (missed defaults approved): 52 × $15,000 = $780,000 loss.\n• False Positives (good borrowers rejected): 20 × $1,200 = $24,000 lost profit.\nTotal Portfolio Cost: $780,000 + $24,000 = $804,000. Recall: 64.9% (96/148).",
                result: "Net Portfolio Cost: $804,000",
                explanation: "The default 0.50 cutoff allows 52 defaulting borrowers to receive funding, creating severe bad-debt write-offs because the classifier treats $1,200 errors and $15,000 errors identically.",
              },
              {
                label: "Operating Point 2: Balanced Production Operating Threshold (θ = 0.18)",
                calculation: "Approved: 760 applicants (240 rejected).\n• False Negatives: drops from 52 to 18 (130 defaults caught). 18 × $15,000 = $270,000 loss.\n• False Positives: rises to 90 applicants. 90 × $1,200 = $108,000 lost profit.\nTotal Portfolio Cost: $270,000 + $108,000 = $378,000. Recall: 87.8% (130/148).",
                result: "Net Portfolio Cost: $378,000 (Annual Savings: $426,000 / 53.0%)",
                explanation: "A balanced operating threshold favored by risk committees: it cuts bad-debt write-offs by 65% while maintaining acceptable 76% commercial loan origination volume.",
              },
              {
                label: "Operating Point 3: Theoretical Bayes-Optimal Cutoff (θ* ≈ 0.074)",
                calculation: "Approved: 676 applicants (324 rejected).\n• False Negatives: drops to 6 (142 defaults caught). 6 × $15,000 = $90,000 loss.\n• False Positives: rises to 180 applicants. 180 × $1,200 = $216,000 lost profit.\nTotal Portfolio Cost: $90,000 + $216,000 = $306,000. Recall: 95.9% (142/148).",
                result: "Net Portfolio Cost: $306,000 (Annual Savings: $498,000 / 61.9%)",
                explanation: "Achieves the minimum possible expected monetary loss under well-calibrated probabilities. However, rejecting 32.4% of total applicants reduces market share, which is why commercial lenders often select intermediate points like θ = 0.18.",
              },
            ]}
            conclusion="Machine learning predictions only translate into business value when coupled with cost-aware decision thresholding calibrated to financial loss matrices."
          />
        </div>
      </Container>

      {/* CHAPTER 6: SHAP INTERPRETABILITY */}
      <Container className="pb-20">
        <SectionHeader
          id="interpretability-shap"
          index="06"
          eyebrow="Explainability"
          title="SHAP Interpretability & Adverse Action Disclosures"
          description="Under the Equal Credit Opportunity Act (ECOA / Regulation B) and the Fair Credit Reporting Act (FCRA), lenders must provide specific, truthful reasons when credit is denied."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <ChartContainer title="Global SHAP Feature Attribution (Credit Risk)">
              <FeatureImportanceChart />
            </ChartContainer>

            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <h5 className="font-display text-sm font-semibold text-foreground">
                Local Additive Attributions
              </h5>
              <p>
                For an individual applicant, TreeSHAP decomposes the model output margin (log-odds <InlineMath formula="F(x) = \ln(p / (1-p))" />) into additive feature attributions:
              </p>
              <div className="rounded border border-hairline bg-surface p-3 font-mono text-[11px] text-foreground space-y-1">
                <div>Expected value E[F(X)]: -1.75 (base prob: 14.8%)</div>
                <div className="text-orange">+ Credit Score 598: +0.62 (log-odds)</div>
                <div className="text-orange">+ DTI 0.47: +0.48 (log-odds)</div>
                <div className="text-lime">- Income $95k: -0.21 (log-odds)</div>
                <div className="font-semibold text-violet">= F(x) = -0.86 → p = 29.7% (&gt; 18% cutoff: DECLINE)</div>
              </div>
              <p className="text-[11px]">
                The largest positive SHAP contributions (e.g. low credit score, elevated debt-to-income) indicate the primary model features that drove the predicted default probability above the threshold.
              </p>
            </div>
          </div>

          <WarningCallout title="Regulatory Compliance & Causality Disclosures">
            <div className="space-y-2 text-xs">
              <p>
                <strong>CFPB Consumer Financial Protection Circular 2022-03:</strong> The CFPB clarified that creditors cannot rely on post-hoc explanation tools (such as SHAP or LIME) if they produce inaccurate, unstable, or fabricated reasons for adverse action. Creditors must understand the specific, actual factors that led to denial under Regulation B (12 CFR § 1002.9) and FCRA (15 U.S.C. § 1681m).
              </p>
              <p>
                <strong>Associative vs Causal:</strong> SHAP measures statistical attribution within the model's internal decision logic (<InlineMath formula="\mathbb{E}[f(X) \mid X_j = x_j]" />). It does <em>not</em> prove causal interventions (<InlineMath formula="P(Y \mid \text{do}(X_j))" />). A model explanation never legalizes an algorithmic decision that causes unlawful disparate impact.
              </p>
            </div>
          </WarningCallout>
        </div>
      </Container>

      {/* CHAPTER 7: PRODUCTION GOVERNANCE */}
      <Container className="pb-20">
        <SectionHeader
          id="production-governance"
          index="07"
          eyebrow="Governance & Risk"
          title="Real-World Governance: SR 11-7, Drift & Fair Lending"
          description="Deploying credit models in regulated banking requires adherence to Federal Reserve SR 11-7 / OCC Bulletin 2011-12 model risk management guidance."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-hairline bg-surface p-5 text-xs space-y-2">
              <div className="font-mono font-semibold text-orange">Concept & Data Drift (PSI)</div>
              <p className="text-muted-foreground">
                Macroeconomic shocks (interest rate changes, inflation) alter borrower delinquency dynamics. Credit risk models must track the <strong>Population Stability Index (PSI)</strong>:
              </p>
              <div className="rounded bg-surface-2 p-2 font-mono text-[11px] text-foreground">
                PSI = Σ (Actual% - Expected%) × ln(Actual% / Expected%)
              </div>
              <p className="text-muted-foreground">PSI &lt; 0.10: Stable; 0.10–0.25: Moderate drift (monitor); &gt; 0.25: Significant drift requiring model recalibration or retuning.</p>
            </div>

            <div className="rounded border border-hairline bg-surface p-5 text-xs space-y-2">
              <div className="font-mono font-semibold text-cyan">Fair Lending & Disparate Impact</div>
              <p className="text-muted-foreground">
                Excluding protected attributes (race, gender, national origin, age) does not guarantee compliance. Boosting models readily uncover non-linear proxy variables that may induce disparate impact.
              </p>
              <p className="text-muted-foreground">
                Institutions must evaluate the <strong>Adverse Impact Ratio (AIR)</strong> under the Equal Credit Opportunity Act (ECOA): approval rates across protected groups must satisfy the Four-Fifths Rule (AIR &ge; 0.80) unless justified by legitimate business necessity with no less discriminatory alternative.
              </p>
            </div>
          </div>

          <div className="rounded border border-hairline bg-surface p-5 text-xs space-y-2">
            <div className="font-mono font-semibold text-violet">Federal Reserve SR 11-7 / OCC 2011-12 Governance Pillars</div>
            <p className="text-muted-foreground">
              Federal guidance on Model Risk Management requires three independent lines of defense: (1) Sound model development and conceptual justification; (2) Rigorous independent model validation prior to deployment; and (3) Ongoing outcome analysis, benchmarking, and governance committee oversight.
            </p>
          </div>

          <WarningCallout title="Educational Scope Notice">
            This module provides a pedagogical simulation of boosting workflows in consumer credit risk. Production credit underwriting systems require formal independent model validation (SR 11-7), fair lending legal reviews, stress testing under macroeconomic adverse scenarios, and continuous compliance audits.
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
                question: "How do Shapley additive explanations (SHAP) assist lenders with adverse action requirements under FCRA and ECOA (Regulation B)?",
                options: [
                  "They grant automatic legal immunity from fair lending audits and guarantee 0% model error",
                  "They provide mathematically consistent local feature attributions in log-odds space, helping identify the principal factors driving an individual credit denial under CFPB Circular 2022-03 guidelines",
                  "They automatically scrub all demographic variables and proxy features from the training pipeline",
                  "They eliminate the need for independent model validation required by Federal Reserve SR 11-7",
                ],
                correctIndex: 1,
                explanation: "Under FCRA and ECOA (Regulation B), lenders must disclose the principal specific factors leading to adverse action. CFPB Circular 2022-03 requires that reasons derived from complex algorithms accurately reflect the factors considered. TreeSHAP quantifies exact local feature attributions, though creditors must still verify that reasons are truthful, stable, and compliant with fair lending laws.",
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
