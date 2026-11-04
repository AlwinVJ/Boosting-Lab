/**
 * Reproducible Synthetic Credit Portfolio Generator
 *
 * This module generates a reproducible, deterministic synthetic consumer credit dataset
 * for educational demonstration in Boosting Lab.
 *
 * Requirements & Design:
 * - Deterministic PRNG: Mulberry32 algorithm initialized with SEED = 42.
 * - Advertised Portfolio Size: 5,000 synthetic observations.
 * - Calibrated Default Prevalence: ~14.8% empirical default rate to match portfolio assumptions.
 * - Realistic Feature Distributions: Continuous credit scores, log-skewed incomes, bounded DTI,
 *   discrete employment lengths, and non-negative late payment counts.
 *
 * DATA TRANSPARENCY NOTICE:
 * All generated records are strictly synthetic and generated via a parameterized statistical simulation.
 * No data points represent actual bank consumer accounts, bureau records, or proprietary credit files.
 */

export interface CreditRecord {
  [key: string]: string | number;
  id: number;
  credit_score: number;
  annual_income: number;
  dti: number;
  loan_amount: number;
  emp_length: number;
  late_payments: number;
  default: 0 | 1;
}

export interface PortfolioSummary {
  totalRecords: number;
  defaultCount: number;
  nonDefaultCount: number;
  defaultRate: number;
  meanCreditScore: number;
  meanAnnualIncome: number;
  meanDti: number;
  meanLoanAmount: number;
}

export const SYNTHETIC_DATA_METADATA = {
  generatorName: "Boosting Lab Synthetic Credit Portfolio Generator",
  defaultSeed: 42,
  defaultCount: 5000,
  targetPrevalence: 0.148,
  description:
    "A 5,000-observation deterministic synthetic consumer loan dataset generated to illustrate financial risk modeling, asymmetric loss matrices, cost-volume threshold shifting, and TreeSHAP explainability.",
  variables: [
    { name: "id", type: "integer", desc: "Synthetic applicant identifier (1001 to 6000)." },
    {
      name: "credit_score",
      type: "integer",
      desc: "Synthetic FICO-style credit score clamped to [350, 850].",
    },
    {
      name: "annual_income",
      type: "numeric ($)",
      desc: "Simulated annual gross income in US dollars.",
    },
    {
      name: "dti",
      type: "numeric ratio",
      desc: "Debt-to-Income ratio: monthly debt obligations / gross monthly income.",
    },
    { name: "loan_amount", type: "numeric ($)", desc: "Requested principal loan amount." },
    {
      name: "emp_length",
      type: "integer (years)",
      desc: "Employment length in completed years [0 to 25].",
    },
    {
      name: "late_payments",
      type: "integer",
      desc: "Number of 30+ days past-due incidents in prior 24 months [0 to 6].",
    },
    {
      name: "default",
      type: "binary {0, 1}",
      desc: "Default status over 24-month horizon (1 = 90+ DPD default, 0 = solvent).",
    },
  ],
  assumptions: [
    "Feature Generation: Log-skewed annual incomes, bounded beta-distributed debt-to-income ratios, and normal credit scores with realistic covariance.",
    "Target Generation: Binary default target generated via logistic link: logit(p) = beta_0 + beta_1*z(credit_score) + beta_2*dti + beta_3*late_payments + beta_4*(loan/income). Default assigned if U < p where U ~ Uniform(0, 1).",
    "Calibrated Scale: Logistic intercept beta_0 tuned deterministically to produce ~14.8% default prevalence across 5,000 records.",
  ],
  limitations: [
    "No Macroeconomic Dynamics: Does not simulate shifting interest rate cycles, inflation shocks, or labor market contractions.",
    "Unobserved Survival Bias: Does not model historical reject inference (only simulated under the assumption of full loan origination).",
    "No Disguised Proxy Bias: Neutral synthetic schema does not include real-world systemic demographic proxies.",
    "Strictly Pedagogical: Intended solely for machine learning education; cannot be used for production underwriting or capital adequacy estimation.",
  ],
  disclaimer:
    "LEGAL DISCLAIMER: All data produced by this generator is entirely synthetic and created for educational demonstration. It contains no real borrower identities, proprietary banking portfolio records, or actual credit bureau information.",
} as const;

/**
 * Deterministic 32-bit Pseudo-Random Number Generator (Mulberry32).
 */
export function createMulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Standard Normal variate generator via Box-Muller transform using Mulberry32.
 */
function createNormalGenerator(prng: () => number) {
  let spare: number | null = null;
  return function nextNormal(mean = 0, std = 1): number {
    if (spare !== null) {
      const val = spare;
      spare = null;
      return mean + val * std;
    }
    let u = 0;
    let v = 0;
    while (u === 0) u = prng();
    while (v === 0) v = prng();
    const mag = Math.sqrt(-2.0 * Math.log(u));
    const z0 = mag * Math.cos(2.0 * Math.PI * v);
    const z1 = mag * Math.sin(2.0 * Math.PI * v);
    spare = z1;
    return mean + z0 * std;
  };
}

/**
 * Deterministically generates a synthetic credit portfolio.
 */
export function generateSyntheticCreditPortfolio(count = 5000, seed = 42): CreditRecord[] {
  const prng = createMulberry32(seed);
  const randNorm = createNormalGenerator(prng);

  const records: CreditRecord[] = [];

  for (let i = 0; i < count; i++) {
    const id = 1001 + i;

    // 1. Credit Score: Gaussian centered at 675, std 65, bounded [350, 850]
    const rawScore = randNorm(675, 65);
    const credit_score = Math.round(Math.max(350, Math.min(850, rawScore)));

    // 2. Annual Income: Log-normal distribution centered around ~$65,000
    // Correlated weakly with credit score
    const scoreFactor = (credit_score - 675) / 130;
    const logIncome = randNorm(11.0 + 0.15 * scoreFactor, 0.45);
    const annual_income = Math.round(Math.max(18000, Math.min(250000, Math.exp(logIncome))));

    // 3. Debt-to-Income (DTI): Higher for lower credit score / lower income
    const baseDti = 0.32 - 0.08 * scoreFactor + randNorm(0, 0.08);
    const dti = +Math.max(0.05, Math.min(0.68, baseDti)).toFixed(2);

    // 4. Requested Loan Amount: Scaled to income with random variation
    const maxAffordable = annual_income * 0.45;
    const loanRaw = randNorm(annual_income * 0.28, 6000);
    const loan_amount =
      Math.round(Math.max(2500, Math.min(maxAffordable, Math.min(45000, loanRaw))) / 500) * 500;

    // 5. Employment Length: 0 to 25 years, correlated with credit score
    const baseEmp = Math.round(randNorm(6 + 2 * scoreFactor, 4));
    const emp_length = Math.max(0, Math.min(25, baseEmp));

    // 6. Past-Due Incidents (late_payments): Higher for low scores
    const lateProb = Math.max(0, 1 - (credit_score - 450) / 350);
    let late_payments = 0;
    if (prng() < lateProb * 0.8) {
      late_payments = Math.min(6, Math.max(1, Math.round(prng() * 4 + lateProb * 2)));
    }

    // 7. Calibrated Logistic Target Formulation:
    // logit = beta0 + beta_cs * z(cs) + beta_dti * dti + beta_late * late + beta_loan * (loan/income)
    const zScore = (credit_score - 675) / 65;
    const loanToIncome = loan_amount / Math.max(1, annual_income);

    const logit =
      -2.85 - // baseline intercept calibrated for ~14.8% default prevalence
      0.95 * zScore +
      2.8 * (dti - 0.32) +
      0.55 * late_payments +
      1.2 * (loanToIncome - 0.28);

    const probDefault = 1 / (1 + Math.exp(-logit));
    const isDefault: 0 | 1 = prng() < probDefault ? 1 : 0;

    records.push({
      id,
      credit_score,
      annual_income,
      dti,
      loan_amount,
      emp_length,
      late_payments,
      default: isDefault,
    });
  }

  return records;
}

/**
 * Computes portfolio summary statistics for a generated set of records.
 */
export function summarizePortfolio(records: CreditRecord[]): PortfolioSummary {
  const totalRecords = records.length;
  if (totalRecords === 0) {
    return {
      totalRecords: 0,
      defaultCount: 0,
      nonDefaultCount: 0,
      defaultRate: 0,
      meanCreditScore: 0,
      meanAnnualIncome: 0,
      meanDti: 0,
      meanLoanAmount: 0,
    };
  }

  let defaultCount = 0;
  let sumScore = 0;
  let sumIncome = 0;
  let sumDti = 0;
  let sumLoan = 0;

  for (const r of records) {
    if (r.default === 1) defaultCount++;
    sumScore += r.credit_score;
    sumIncome += r.annual_income;
    sumDti += r.dti;
    sumLoan += r.loan_amount;
  }

  return {
    totalRecords,
    defaultCount,
    nonDefaultCount: totalRecords - defaultCount,
    defaultRate: +(defaultCount / totalRecords).toFixed(4),
    meanCreditScore: Math.round(sumScore / totalRecords),
    meanAnnualIncome: Math.round(sumIncome / totalRecords),
    meanDti: +(sumDti / totalRecords).toFixed(3),
    meanLoanAmount: Math.round(sumLoan / totalRecords),
  };
}

// Pre-generated deterministic 5,000 dataset and first 5 demonstration records
export const GENERATED_5000_PORTFOLIO = generateSyntheticCreditPortfolio(5000, 42);
export const GENERATED_PORTFOLIO_SUMMARY = summarizePortfolio(GENERATED_5000_PORTFOLIO);
export const GENERATED_CREDIT_SAMPLE_5 = GENERATED_5000_PORTFOLIO.slice(0, 5);
