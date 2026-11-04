/**
 * Centralized Credit Risk Mathematical & Financial Calculation Engine
 *
 * This module provides the single source of truth for:
 * - Asymmetric financial cost matrix constants
 * - Confusion matrix totals, approval/rejection counts
 * - Standard classification metrics (Precision, Recall, Specificity, F1-score)
 * - Expected financial portfolio losses, cost savings, and relative percentages
 * - Bayes-optimal theoretical decision threshold calculations
 *
 * Used across the Case Study UI (src/routes/case-study.tsx) and automated test suites
 * to guarantee that displayed educational metrics and verified calculations cannot silently diverge.
 */

export const FINANCIAL_CONSTANTS = {
  // Expected loss when funding an applicant who defaults (False Negative cost)
  DEFAULT_C_FN: 15000,
  // Lost interest margin / opportunity cost when rejecting a solvent borrower (False Positive cost)
  DEFAULT_C_FP: 1200,
  // Canonical test cohort evaluation population size
  TOTAL_EVALUATION_COHORT: 1000,
  // Ground-truth actual default count in test evaluation cohort (14.8% default rate)
  COHORT_ACTUAL_DEFAULTS: 148,
  // Ground-truth actual non-default count in test evaluation cohort (85.2% non-default rate)
  COHORT_ACTUAL_NON_DEFAULTS: 852,
} as const;

export interface ConfusionMatrix {
  tp: number;
  fn: number;
  tn: number;
  fp: number;
}

export interface OperatingPointMetrics {
  theta: number;
  label: string;
  cm: ConfusionMatrix;
  actualDefaults: number; // TP + FN
  actualNonDefaults: number; // TN + FP
  totalCohort: number; // TP + FN + TN + FP
  approved: number; // TN + FN (predicted non-default, y_hat = 0)
  rejected: number; // TP + FP (predicted default, y_hat = 1)
  approvalRate: number; // approved / totalCohort
  rejectionRate: number; // rejected / totalCohort
  precision: number; // TP / (TP + FP)
  recall: number; // TP / (TP + FN)
  specificity: number; // TN / (TN + FP)
  f1Score: number; // 2 * (precision * recall) / (precision + recall)
  expectedCost: number; // FN * C_FN + FP * C_FP
  savingsVsBaseline: number; // baselineCost - expectedCost
  savingsPercentage: number; // (baselineCost - expectedCost) / baselineCost
}

/**
 * Calculates the theoretical Bayes-optimal decision threshold minimizing expected loss:
 * theta* = C_FP / (C_FN + C_FP) = 1 / (1 + C_FN / C_FP)
 */
export function computeBayesOptimalThreshold(
  cFp: number = FINANCIAL_CONSTANTS.DEFAULT_C_FP,
  cFn: number = FINANCIAL_CONSTANTS.DEFAULT_C_FN,
): number {
  if (cFp <= 0 || cFn <= 0) {
    throw new Error("Financial cost parameters must be strictly positive.");
  }
  return cFp / (cFn + cFp);
}

/**
 * Evaluates an operating point's confusion matrix and computes all derived metrics.
 */
export function evaluateOperatingPoint(
  cm: ConfusionMatrix,
  theta: number,
  label: string,
  baselineCost?: number,
  cFn: number = FINANCIAL_CONSTANTS.DEFAULT_C_FN,
  cFp: number = FINANCIAL_CONSTANTS.DEFAULT_C_FP,
): OperatingPointMetrics {
  const actualDefaults = cm.tp + cm.fn;
  const actualNonDefaults = cm.tn + cm.fp;
  const totalCohort = actualDefaults + actualNonDefaults;

  // In credit default risk classification:
  // Predict y_hat = 1 (Default) => Reject loan application (TP + FP)
  // Predict y_hat = 0 (Non-default) => Approve loan application (TN + FN)
  const approved = cm.tn + cm.fn;
  const rejected = cm.tp + cm.fp;

  const approvalRate = totalCohort > 0 ? approved / totalCohort : 0;
  const rejectionRate = totalCohort > 0 ? rejected / totalCohort : 0;

  const precision = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
  const recall = actualDefaults > 0 ? cm.tp / actualDefaults : 0;
  const specificity = actualNonDefaults > 0 ? cm.tn / actualNonDefaults : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const expectedCost = cm.fn * cFn + cm.fp * cFp;
  const refBaseline = baselineCost ?? expectedCost;
  const savingsVsBaseline = refBaseline - expectedCost;
  const savingsPercentage = refBaseline > 0 ? savingsVsBaseline / refBaseline : 0;

  return {
    theta,
    label,
    cm,
    actualDefaults,
    actualNonDefaults,
    totalCohort,
    approved,
    rejected,
    approvalRate,
    rejectionRate,
    precision,
    recall,
    specificity,
    f1Score,
    expectedCost,
    savingsVsBaseline,
    savingsPercentage,
  };
}

// Canonical Operating Point 1: Standard Symmetric Threshold (theta = 0.50)
const RAW_CM_BASELINE: ConfusionMatrix = {
  tp: 96,
  fn: 52,
  tn: 832,
  fp: 20,
};

export const OPERATING_POINT_BASELINE = evaluateOperatingPoint(
  RAW_CM_BASELINE,
  0.5,
  "Operating Point 1: Standard Symmetric Threshold (θ = 0.50)",
);

// Canonical Operating Point 2: Balanced Production Operating Threshold (theta = 0.18)
const RAW_CM_BALANCED: ConfusionMatrix = {
  tp: 130,
  fn: 18,
  tn: 762,
  fp: 90,
};

export const OPERATING_POINT_BALANCED = evaluateOperatingPoint(
  RAW_CM_BALANCED,
  0.18,
  "Operating Point 2: Balanced Production Operating Threshold (θ = 0.18)",
  OPERATING_POINT_BASELINE.expectedCost,
);

// Canonical Operating Point 3: Theoretical Bayes-Optimal Cutoff (theta* ≈ 0.074)
const RAW_CM_BAYES_OPTIMAL: ConfusionMatrix = {
  tp: 142,
  fn: 6,
  tn: 672,
  fp: 180,
};

export const OPERATING_POINT_BAYES_OPTIMAL = evaluateOperatingPoint(
  RAW_CM_BAYES_OPTIMAL,
  computeBayesOptimalThreshold(),
  "Operating Point 3: Theoretical Bayes-Optimal Cutoff (θ* ≈ 0.074)",
  OPERATING_POINT_BASELINE.expectedCost,
);

export const CANONICAL_OPERATING_POINTS = [
  OPERATING_POINT_BASELINE,
  OPERATING_POINT_BALANCED,
  OPERATING_POINT_BAYES_OPTIMAL,
] as const;
