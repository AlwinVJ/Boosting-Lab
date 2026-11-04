import { describe, expect, it } from "vitest";

describe("Credit Risk Threshold Mathematics & Financial Model Validation", () => {
  const TOTAL_TEST_APPLICANTS = 1000;
  const ACTUAL_DEFAULTS = 148;
  const ACTUAL_NON_DEFAULTS = 852;
  const C_FN = 15000; // Expected loss from granting loan to defaulting borrower ($)
  const C_FP = 1200; // Lost interest margin from rejecting non-defaulting borrower ($)

  it("verifies cohort population consistency across default and non-default sums", () => {
    expect(ACTUAL_DEFAULTS + ACTUAL_NON_DEFAULTS).toBe(TOTAL_TEST_APPLICANTS);
    expect(ACTUAL_DEFAULTS / TOTAL_TEST_APPLICANTS).toBe(0.148);
  });

  it("calculates the theoretical Bayes-optimal decision threshold accurately", () => {
    const bayesOptimalThreshold = C_FP / (C_FN + C_FP);
    expect(bayesOptimalThreshold).toBeCloseTo(0.07407, 4);
    expect(bayesOptimalThreshold).toBe(2 / 27);
  });

  const OPERATING_POINTS = [
    {
      name: "Operating Point 1 (Default θ = 0.50)",
      theta: 0.5,
      tp: 96,
      fn: 52,
      tn: 832,
      fp: 20,
      expectedApproved: 884,
      expectedRejected: 116,
      expectedCost: 804000,
      expectedRecall: 0.6486,
      expectedPrecision: 0.8276,
    },
    {
      name: "Operating Point 2 (Commercial Volume Balance θ = 0.18)",
      theta: 0.18,
      tp: 130,
      fn: 18,
      tn: 762,
      fp: 90,
      expectedApproved: 780,
      expectedRejected: 220,
      expectedCost: 378000,
      expectedRecall: 0.8784,
      expectedPrecision: 0.5909,
    },
    {
      name: "Operating Point 3 (Bayes-Optimal θ* ≈ 0.074)",
      theta: 0.074,
      tp: 142,
      fn: 6,
      tn: 672,
      fp: 180,
      expectedApproved: 678,
      expectedRejected: 322,
      expectedCost: 306000,
      expectedRecall: 0.9595,
      expectedPrecision: 0.441,
    },
  ];

  OPERATING_POINTS.forEach((pt) => {
    describe(pt.name, () => {
      it("preserves exact ground-truth class totals (TP + FN = Defaults, TN + FP = Non-Defaults)", () => {
        expect(pt.tp + pt.fn).toBe(ACTUAL_DEFAULTS);
        expect(pt.tn + pt.fp).toBe(ACTUAL_NON_DEFAULTS);
        expect(pt.tp + pt.fn + pt.tn + pt.fp).toBe(TOTAL_TEST_APPLICANTS);
      });

      it("verifies approval and rejection counts match under decision rule (Predict Default = Reject)", () => {
        // Under default prediction:
        // Applicants predicted y_hat = 0 (TN + FN) are Approved for loans.
        // Applicants predicted y_hat = 1 (TP + FP) are Rejected.
        const approved = pt.tn + pt.fn;
        const rejected = pt.tp + pt.fp;

        expect(approved).toBe(pt.expectedApproved);
        expect(rejected).toBe(pt.expectedRejected);
        expect(approved + rejected).toBe(TOTAL_TEST_APPLICANTS);
      });

      it("computes exact financial expected loss: FN * C_FN + FP * C_FP", () => {
        const totalLoss = pt.fn * C_FN + pt.fp * C_FP;
        expect(totalLoss).toBe(pt.expectedCost);
      });

      it("verifies recall and precision metrics", () => {
        const recall = pt.tp / (pt.tp + pt.fn);
        const precision = pt.tp / (pt.tp + pt.fp);

        expect(recall).toBeCloseTo(pt.expectedRecall, 3);
        expect(precision).toBeCloseTo(pt.expectedPrecision, 3);
      });
    });
  });

  it("verifies financial cost savings relative to baseline θ = 0.50", () => {
    const costBaseline = OPERATING_POINTS[0]!.expectedCost;
    const costBalanced = OPERATING_POINTS[1]!.expectedCost;
    const costOptimal = OPERATING_POINTS[2]!.expectedCost;

    const savingsBalanced = costBaseline - costBalanced;
    const savingsOptimal = costBaseline - costOptimal;

    expect(savingsBalanced).toBe(426000);
    expect(savingsBalanced / costBaseline).toBeCloseTo(0.5298, 3); // ~53.0%

    expect(savingsOptimal).toBe(498000);
    expect(savingsOptimal / costBaseline).toBeCloseTo(0.6194, 3); // ~61.9%
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
