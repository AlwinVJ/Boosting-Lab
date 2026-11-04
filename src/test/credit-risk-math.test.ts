import { describe, expect, it } from "vitest";

import {
  CANONICAL_OPERATING_POINTS,
  computeBayesOptimalThreshold,
  evaluateOperatingPoint,
  FINANCIAL_CONSTANTS,
  OPERATING_POINT_BALANCED,
  OPERATING_POINT_BASELINE,
  OPERATING_POINT_BAYES_OPTIMAL,
} from "@/lib/credit-risk-engine";
import {
  generateSyntheticCreditPortfolio,
  GENERATED_5000_PORTFOLIO,
  GENERATED_CREDIT_SAMPLE_5,
  GENERATED_PORTFOLIO_SUMMARY,
  summarizePortfolio,
} from "@/data/credit-dataset-generator";

describe("Credit Risk Centralized Calculation Engine", () => {
  it("verifies financial constants match documented baseline assumptions", () => {
    expect(FINANCIAL_CONSTANTS.DEFAULT_C_FN).toBe(15000);
    expect(FINANCIAL_CONSTANTS.DEFAULT_C_FP).toBe(1200);
    expect(FINANCIAL_CONSTANTS.TOTAL_EVALUATION_COHORT).toBe(1000);
    expect(
      FINANCIAL_CONSTANTS.COHORT_ACTUAL_DEFAULTS + FINANCIAL_CONSTANTS.COHORT_ACTUAL_NON_DEFAULTS,
    ).toBe(FINANCIAL_CONSTANTS.TOTAL_EVALUATION_COHORT);
    expect(
      FINANCIAL_CONSTANTS.COHORT_ACTUAL_DEFAULTS / FINANCIAL_CONSTANTS.TOTAL_EVALUATION_COHORT,
    ).toBe(0.148);
  });

  it("calculates the theoretical Bayes-optimal decision threshold accurately", () => {
    const bayesOptimalThreshold = computeBayesOptimalThreshold();
    expect(bayesOptimalThreshold).toBeCloseTo(0.07407, 4);
    expect(bayesOptimalThreshold).toBe(2 / 27);
  });

  CANONICAL_OPERATING_POINTS.forEach((pt) => {
    describe(pt.label, () => {
      it("preserves exact ground-truth class totals (TP + FN = Defaults, TN + FP = Non-Defaults)", () => {
        expect(pt.actualDefaults).toBe(FINANCIAL_CONSTANTS.COHORT_ACTUAL_DEFAULTS);
        expect(pt.actualNonDefaults).toBe(FINANCIAL_CONSTANTS.COHORT_ACTUAL_NON_DEFAULTS);
        expect(pt.totalCohort).toBe(FINANCIAL_CONSTANTS.TOTAL_EVALUATION_COHORT);
        expect(pt.cm.tp + pt.cm.fn).toBe(pt.actualDefaults);
        expect(pt.cm.tn + pt.cm.fp).toBe(pt.actualNonDefaults);
      });

      it("verifies loan approval and rejection volume constraints", () => {
        // Loan decision: Predict Default (y_hat=1) => Reject; Predict Non-default (y_hat=0) => Approve
        expect(pt.approved).toBe(pt.cm.tn + pt.cm.fn);
        expect(pt.rejected).toBe(pt.cm.tp + pt.cm.fp);
        expect(pt.approved + pt.rejected).toBe(pt.totalCohort);
        expect(pt.approvalRate + pt.rejectionRate).toBeCloseTo(1.0, 5);
      });

      it("verifies classification metrics (Precision, Recall, Specificity, F1-score)", () => {
        const expectedPrecision = pt.cm.tp / (pt.cm.tp + pt.cm.fp);
        const expectedRecall = pt.cm.tp / (pt.cm.tp + pt.cm.fn);
        const expectedSpecificity = pt.cm.tn / (pt.cm.tn + pt.cm.fp);
        const expectedF1 =
          (2 * expectedPrecision * expectedRecall) / (expectedPrecision + expectedRecall);

        expect(pt.precision).toBeCloseTo(expectedPrecision, 4);
        expect(pt.recall).toBeCloseTo(expectedRecall, 4);
        expect(pt.specificity).toBeCloseTo(expectedSpecificity, 4);
        expect(pt.f1Score).toBeCloseTo(expectedF1, 4);
      });

      it("verifies expected portfolio loss calculation", () => {
        const expectedLoss =
          pt.cm.fn * FINANCIAL_CONSTANTS.DEFAULT_C_FN + pt.cm.fp * FINANCIAL_CONSTANTS.DEFAULT_C_FP;
        expect(pt.expectedCost).toBe(expectedLoss);
      });
    });
  });

  it("verifies relative cohort savings vs baseline threshold θ = 0.50", () => {
    expect(OPERATING_POINT_BASELINE.expectedCost).toBe(804000);
    expect(OPERATING_POINT_BALANCED.expectedCost).toBe(378000);
    expect(OPERATING_POINT_BAYES_OPTIMAL.expectedCost).toBe(306000);

    expect(OPERATING_POINT_BALANCED.savingsVsBaseline).toBe(426000);
    expect(OPERATING_POINT_BALANCED.savingsPercentage).toBeCloseTo(0.52985, 4); // ~53.0%

    expect(OPERATING_POINT_BAYES_OPTIMAL.savingsVsBaseline).toBe(498000);
    expect(OPERATING_POINT_BAYES_OPTIMAL.savingsPercentage).toBeCloseTo(0.6194, 4); // ~61.9%
  });

  it("allows custom cost parameter evaluation via evaluateOperatingPoint", () => {
    const customEvaluated = evaluateOperatingPoint(
      { tp: 100, fn: 50, tn: 800, fp: 50 },
      0.2,
      "Custom Test",
      1000000,
      20000,
      1000,
    );
    expect(customEvaluated.expectedCost).toBe(50 * 20000 + 50 * 1000);
    expect(customEvaluated.approved).toBe(850);
    expect(customEvaluated.rejected).toBe(150);
  });
});

describe("Reproducible Synthetic Credit Portfolio Generator", () => {
  it("generates deterministic records across independent invocations with identical seed", () => {
    const run1 = generateSyntheticCreditPortfolio(100, 42);
    const run2 = generateSyntheticCreditPortfolio(100, 42);

    expect(run1).toHaveLength(100);
    expect(run2).toHaveLength(100);
    expect(run1[0]).toEqual(run2[0]);
    expect(run1[42]).toEqual(run2[42]);
    expect(run1[99]).toEqual(run2[99]);
  });

  it("produces advertised 5,000 synthetic observations with realistic bounds", () => {
    expect(GENERATED_5000_PORTFOLIO).toHaveLength(5000);
    expect(GENERATED_PORTFOLIO_SUMMARY.totalRecords).toBe(5000);

    // Default prevalence should be calibrated close to 14.8%
    expect(GENERATED_PORTFOLIO_SUMMARY.defaultRate).toBeGreaterThan(0.12);
    expect(GENERATED_PORTFOLIO_SUMMARY.defaultRate).toBeLessThan(0.18);
    expect(
      GENERATED_PORTFOLIO_SUMMARY.defaultCount + GENERATED_PORTFOLIO_SUMMARY.nonDefaultCount,
    ).toBe(5000);

    // Check bounded values
    GENERATED_5000_PORTFOLIO.slice(0, 200).forEach((record) => {
      expect(record.credit_score).toBeGreaterThanOrEqual(350);
      expect(record.credit_score).toBeLessThanOrEqual(850);
      expect(record.annual_income).toBeGreaterThanOrEqual(18000);
      expect(record.dti).toBeGreaterThan(0);
      expect(record.loan_amount).toBeGreaterThan(0);
      expect(record.emp_length).toBeGreaterThanOrEqual(0);
      expect(record.late_payments).toBeGreaterThanOrEqual(0);
      expect([0, 1]).toContain(record.default);
    });
  });

  it("verifies the 5 demonstration sample records match the pre-generated slice", () => {
    expect(GENERATED_CREDIT_SAMPLE_5).toHaveLength(5);
    expect(GENERATED_CREDIT_SAMPLE_5[0]?.id).toBe(1001);
  });

  it("computes accurate summary statistics for arbitrary record sets", () => {
    const summary = summarizePortfolio([
      {
        id: 1,
        credit_score: 700,
        annual_income: 60000,
        dti: 0.3,
        loan_amount: 10000,
        emp_length: 5,
        late_payments: 0,
        default: 0,
      },
      {
        id: 2,
        credit_score: 600,
        annual_income: 40000,
        dti: 0.5,
        loan_amount: 20000,
        emp_length: 2,
        late_payments: 2,
        default: 1,
      },
    ]);
    expect(summary.totalRecords).toBe(2);
    expect(summary.defaultCount).toBe(1);
    expect(summary.defaultRate).toBe(0.5);
    expect(summary.meanCreditScore).toBe(650);
    expect(summary.meanAnnualIncome).toBe(50000);
  });
});

describe("Content Accuracy & Algorithmic Guardrails", () => {
  it("verifies LightGBM max_bin is 255 (not hardcoded 256) in content specifications", async () => {
    const { ALGORITHMS } = await import("@/data/content");
    const lgb = ALGORITHMS.find((a) => a.key === "lightgbm");
    expect(lgb).toBeDefined();
    expect(lgb?.overview).toContain("max_bin=255");
    expect(lgb?.overview).not.toContain("256 bins");
    expect(lgb?.overview).not.toContain("256 discrete bins");
  });

  it("verifies CatBoost target leakage qualification is appropriately bounded", async () => {
    const { ALGORITHMS } = await import("@/data/content");
    const cb = ALGORITHMS.find((a) => a.key === "catboost");
    expect(cb).toBeDefined();
    expect(cb?.overview).toContain("prediction shift");
    expect(cb?.mechanism).toContain("self-target leakage");
    expect(cb?.limitations).toContain("Does not prevent upstream pipeline data leakage");
    expect(cb?.overview).not.toContain("mathematically impossible");
    expect(cb?.mechanism).not.toContain("mathematically impossible");
  });
});
