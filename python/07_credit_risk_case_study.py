"""
Boosting Lab: End-to-End Consumer Credit Risk Underwriting Workflow
Demonstrating Leak-Proof Preprocessing, Stratified 3-Way Partitioning,
Scale_pos_weight Probability Distortion & Platt / Isotonic Calibration,
Asymmetric Loss Matrix Optimization & Decision Threshold Derivation,
TreeSHAP Explainability & Model Persistence.

DATA TRANSPARENCY NOTICE:
This workflow uses an illustrative synthetic consumer loan portfolio (5,000 observations)
generated to model retail credit risk.
All cost parameters ($15,000 FN write-off, $1,200 FP lost margin) are pedagogical assumptions,
not audited proprietary bank figures.
"""

import sys
sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    classification_report,
)
import xgboost as xgb
import joblib


# ==============================================================================
# 1. DATASET GENERATION (Canonical 5,000-sample Synthetic Portfolio)
# ==============================================================================
def load_credit_risk_data(n_samples=5000, random_state=42):
    """
    Generates a reproducible 5,000-observation consumer loan portfolio.
    Features: credit_score, annual_income, dti, loan_amount, emp_length, late_payments.
    Target: binary default (0 = non-default, 1 = default).
    """
    rng = np.random.default_rng(random_state)

    credit_score = rng.normal(675, 65, n_samples).clip(350, 850).round()
    income = np.exp(rng.normal(11.0, 0.45, n_samples)).clip(18000, 250000).round()
    dti = rng.uniform(0.05, 0.68, n_samples).round(2)
    loan_amount = (income * rng.uniform(0.15, 0.45, n_samples)).round(-2)
    emp_length = rng.integers(0, 26, n_samples)
    late_payments = rng.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.70, 0.15, 0.08, 0.05, 0.02])

    # Calibrated default logit DGP
    z_score = (credit_score - 675) / 65
    loan_to_income = loan_amount / income
    logit = -2.85 - 0.95 * z_score + 2.80 * (dti - 0.32) + 0.55 * late_payments + 1.20 * (loan_to_income - 0.28)
    prob_default = 1 / (1 + np.exp(-logit))
    default = (rng.random(n_samples) < prob_default).astype(int)

    df = pd.DataFrame({
        "id": np.arange(1001, 1001 + n_samples),
        "credit_score": credit_score,
        "annual_income": income,
        "dti": dti,
        "loan_amount": loan_amount,
        "emp_length": emp_length,
        "late_payments": late_payments,
        "default": default,
    })
    return df


def main():
    print("=" * 80)
    print("END-TO-END CONSUMER CREDIT RISK MODELING WORKFLOW")
    print("Leak-Proof Preprocessing | Probability Calibration | Cost-Optimal Thresholds")
    print("=" * 80)

    # 1. Load Data
    df = load_credit_risk_data(n_samples=5000, random_state=42)
    print(f"Loaded portfolio: {len(df)} records, Default prevalence: {df['default'].mean():.2%}")

    # 2. Domain Feature Engineering (Ratios)
    df["loan_to_income"] = df["loan_amount"] / df["annual_income"]
    df["dti_adjusted"] = df["dti"] + (df["loan_amount"] * 0.03) / (df["annual_income"] / 12)
    df["payment_risk_index"] = df["late_payments"] * df["dti"] / np.log(df["annual_income"])

    features = [
        "credit_score", "annual_income", "dti", "loan_amount",
        "emp_length", "late_payments", "loan_to_income", "dti_adjusted", "payment_risk_index"
    ]
    X = df[features]
    y = df["default"]

    # ==============================================================================
    # 3. THREE-WAY STRATIFIED PARTITIONING (Leak-Proof Modeling Standard)
    # ==============================================================================
    # Partition into:
    #   - 60% Training cohort (3,000 samples): trains base XGBoost booster
    #   - 20% Calibration / Validation cohort (1,000 samples): fits probability calibrator
    #     and selects operational cost threshold theta*
    #   - 20% Final Out-of-Sample Test cohort (1,000 samples): untouched test evaluation
    X_train_calib, X_test, y_train_calib, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    X_train, X_calib, y_train, y_calib = train_test_split(
        X_train_calib, y_train_calib, test_size=0.25, random_state=42, stratify=y_train_calib
    )

    print(f"\nThree-Way Stratified Partition Sizes:")
    print(f"  Training cohort:           {len(X_train)} samples ({len(X_train)/len(df):.0%}) | Defaults: {y_train.sum()} ({y_train.mean():.2%})")
    print(f"  Calibration/Val cohort:    {len(X_calib)} samples ({len(X_calib)/len(df):.0%}) | Defaults: {y_calib.sum()} ({y_calib.mean():.2%})")
    print(f"  Final Untouched Test:      {len(X_test)} samples ({len(X_test)/len(df):.0%}) | Defaults: {y_test.sum()} ({y_test.mean():.2%})")

    # ==============================================================================
    # 4. MODEL TRAINING (Regularized XGBoost with Class Weighting)
    # ==============================================================================
    # Asymmetric Imbalance Weight: N_neg / N_pos on training data
    scale_pos_weight = (len(y_train) - y_train.sum()) / y_train.sum()
    print(f"\nTraining Class Imbalance Ratio (scale_pos_weight): {scale_pos_weight:.2f}")

    xgb_model = xgb.XGBClassifier(
        n_estimators=300,
        learning_rate=0.03,
        max_depth=4,
        min_child_weight=3,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=42,
        tree_method="hist",
    )
    xgb_model.fit(X_train, y_train)

    # ==============================================================================
    # 5. PROBABILITY CALIBRATION ANALYSIS & THE IMPACT OF SCALE_POS_WEIGHT
    # ==============================================================================
    # CRITICAL MATHEMATICAL INSIGHT:
    # When XGBoost is trained with scale_pos_weight = w, positive loss gradients are
    # multiplied by w. The resulting raw predictions approximate:
    #   P(y=1|x)_raw ≈ (w * P(y=1|x)) / (1 + (w - 1) * P(y=1|x))
    # This intentionally inflates raw scores upward toward 0.50.
    # While ranking discriminability (ROC-AUC) is preserved, the output is NOT a true probability!
    # Direct application of cost-derived thresholds to uncalibrated outputs causes severe over-rejection.
    raw_val_probs = xgb_model.predict_proba(X_calib)[:, 1]
    raw_val_brier = brier_score_loss(y_calib, raw_val_probs)
    raw_val_auc = roc_auc_score(y_calib, raw_val_probs)

    print("\n--- Validation Probability Calibration Assessment ---")
    print(f"Raw XGBoost Validation ROC-AUC:     {raw_val_auc:.4f}")
    print(f"Raw XGBoost Validation Brier Score: {raw_val_brier:.4f} (Poor calibration due to scale_pos_weight)")
    print(f"Raw Mean Predicted Risk:            {raw_val_probs.mean():.2%} vs Actual Prevalence: {y_calib.mean():.2%}")

    # Compute calibration curve on validation cohort
    prob_true_raw, prob_pred_raw = calibration_curve(y_calib, raw_val_probs, n_bins=5)
    print("Raw Calibration Bins (Predicted vs Observed):")
    for p_pred, p_true in zip(prob_pred_raw, prob_true_raw):
        print(f"  Predicted Bin Center: {p_pred:.3f} -> Observed Default Rate: {p_true:.3f}")

    # Fit Probability Calibrators on the dedicated Calibration Cohort
    # In Scikit-Learn 1.6+, FrozenEstimator is preferred over cv='prefit'
    try:
        from sklearn.frozen import FrozenEstimator
        def create_calibrator(model, method):
            return CalibratedClassifierCV(estimator=FrozenEstimator(model), method=method)
    except ImportError:
        def create_calibrator(model, method):
            return CalibratedClassifierCV(estimator=model, method=method, cv="prefit")

    # A. Platt Scaling (Sigmoid / Logistic link on logit margins)
    platt_calibrator = create_calibrator(xgb_model, "sigmoid")
    platt_calibrator.fit(X_calib, y_calib)
    platt_val_probs = platt_calibrator.predict_proba(X_calib)[:, 1]
    platt_val_brier = brier_score_loss(y_calib, platt_val_probs)

    # B. Isotonic Regression (Non-parametric piecewise constant isotonic link)
    isotonic_calibrator = create_calibrator(xgb_model, "isotonic")
    isotonic_calibrator.fit(X_calib, y_calib)
    isotonic_val_probs = isotonic_calibrator.predict_proba(X_calib)[:, 1]
    isotonic_val_brier = brier_score_loss(y_calib, isotonic_val_probs)

    print("\n--- Post-Calibration Verification (Validation Cohort) ---")
    print(f"Platt Scaling (Sigmoid) Brier Score:  {platt_val_brier:.4f} (Brier improvement: {raw_val_brier - platt_val_brier:+.4f})")
    print(f"Isotonic Regression Brier Score:      {isotonic_val_brier:.4f} (Brier improvement: {raw_val_brier - isotonic_val_brier:+.4f})")
    print(f"Platt Calibrated Mean Predicted Risk: {platt_val_probs.mean():.2%} vs Actual Prevalence: {y_calib.mean():.2%}")

    # We select Platt Scaling as the production calibrator (smooth, parametric, prevents overfitting on small bins)
    calibrator = platt_calibrator

    # ==============================================================================
    # 6. ASYMMETRIC LOSS FUNCTION & THRESHOLD DERIVATION
    # ==============================================================================
    # Financial Cost Matrix:
    #   C_FN: Cost of approving an applicant who defaults ($15,000 write-off & recovery costs)
    #   C_FP: Cost of rejecting an applicant who would not default ($1,200 lost net margin)
    #   C_TN: 0 (correct approval)
    #   C_TP: 0 (correct rejection)
    C_FN = 15000
    C_FP = 1200

    # THEORETICAL BAYES-OPTIMAL THRESHOLD DERIVATION:
    # Expected cost of rejecting (d = 1): E[Cost | d=1] = (1 - p) * C_FP
    # Expected cost of approving (d = 0): E[Cost | d=0] = p * C_FN
    # The lender rejects whenever E[Cost | d=1] <= E[Cost | d=0]:
    #   (1 - p) * C_FP <= p * C_FN
    #   C_FP <= p * (C_FN + C_FP)
    #   p >= C_FP / (C_FN + C_FP) = theta*
    #
    # UNDERLYING MATHEMATICAL ASSUMPTIONS:
    # 1. Calibrated Probabilities: p = P(y=1|x) accurately reflects true default probability.
    # 2. Constant Misclassification Costs: C_FN and C_FP are fixed across all applicants.
    # 3. Binary Decision Space: Single approve/reject decision without risk-based pricing.
    # 4. Risk Neutrality: Objective is minimizing expected monetary loss without risk aversion.
    bayes_optimal_theta = C_FP / (C_FN + C_FP)
    print(f"\n--- Theoretical Bayes-Optimal Threshold Derivation ---")
    print(f"Formula: theta* = C_FP / (C_FN + C_FP) = {C_FP} / ({C_FN} + {C_FP}) = {bayes_optimal_theta:.4f}")

    # ==============================================================================
    # 7. THRESHOLD EVALUATION ON VALIDATION COHORT (Decision Calibration)
    # ==============================================================================
    # Notice: Threshold exploration is performed strictly on validation data, NEVER on final test!
    candidate_thresholds = [
        ("Operating Point 1: Standard Symmetric (theta = 0.50)", 0.50),
        ("Operating Point 2: Balanced Production Target (theta = 0.18)", 0.18),
        ("Operating Point 3: Theoretical Bayes-Optimal (theta* ~ 0.074)", bayes_optimal_theta),
    ]

    print("\n--- Validation Threshold Performance (Model Selection Phase) ---")
    val_baseline_cost = None
    for label, theta in candidate_thresholds:
        val_pred = (platt_val_probs >= theta).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_calib, val_pred).ravel()
        cost = fn * C_FN + fp * C_FP
        if val_baseline_cost is None:
            val_baseline_cost = cost
        savings = val_baseline_cost - cost
        print(f"  {label:60s} | Val Cost: ${cost:,.2f} | Savings vs 0.50: ${savings:,.2f}")

    # ==============================================================================
    # 8. FINAL EVALUATION ON UNTOUCHED TEST COHORT (Out-of-Sample Performance)
    # ==============================================================================
    print("\n" + "=" * 80)
    print("FINAL EVALUATION ON UNTOUCHED TEST SET (1,000 Observations)")
    print("=" * 80)

    # Predict using frozen calibrated pipeline
    test_calib_probs = calibrator.predict_proba(X_test)[:, 1]
    test_auc = roc_auc_score(y_test, test_calib_probs)
    test_pr_auc = average_precision_score(y_test, test_calib_probs)
    test_brier = brier_score_loss(y_test, test_calib_probs)

    print(f"Final Test ROC-AUC:     {test_auc:.4f}")
    print(f"Final Test PR-AUC:      {test_pr_auc:.4f}")
    print(f"Final Test Brier Score: {test_brier:.4f}")

    test_baseline_cost = None

    for label, theta in candidate_thresholds:
        # Decision Rule: Reject if calibrated probability >= theta; else Approve
        y_test_pred = (test_calib_probs >= theta).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_test, y_test_pred).ravel()

        approved = tn + fn
        rejected = tp + fp
        recall = tp / (tp + fn)
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        expected_cost = fn * C_FN + fp * C_FP

        if test_baseline_cost is None:
            test_baseline_cost = expected_cost
            savings = 0.0
            savings_pct = 0.0
        else:
            savings = test_baseline_cost - expected_cost
            savings_pct = (savings / test_baseline_cost) * 100.0

        print(f"\n{label}:")
        print(f"  Operational Decisions:    Approved = {approved} ({approved/len(y_test):.1%}), Rejected = {rejected} ({rejected/len(y_test):.1%})")
        print(f"  Confusion Matrix:         TP={tp:3d}, FP={fp:3d}, TN={tn:3d}, FN={fn:3d}")
        print(f"  Statistical Metrics:      Recall (Defaults Caught) = {recall:.1%}, Precision = {precision:.1%}")
        print(f"  Portfolio Financial Cost: ${expected_cost:,.2f}")
        if savings > 0:
            print(f"  Financial Optimization:   Cost Reduction = ${savings:,.2f} ({savings_pct:.1f}% vs symmetric baseline)")

    # ==============================================================================
    # 9. TREESHAP LOCAL EXPLAINABILITY (Adverse Action Notice Compliance)
    # ==============================================================================
    try:
        import shap
        print("\n" + "=" * 80)
        print("TREESHAP FEATURE ATTRIBUTION (Adverse Action Compliance)")
        print("=" * 80)

        explainer = shap.TreeExplainer(xgb_model)
        # Identify an applicant declined under the Bayes-optimal threshold
        declined_indices = np.where(test_calib_probs >= bayes_optimal_theta)[0]
        sample_idx = declined_indices[0]

        applicant_shap = explainer(X_test.iloc[[sample_idx]])
        calib_prob = test_calib_probs[sample_idx]

        print(f"Declined Applicant Test Index:   {sample_idx}")
        print(f"Calibrated Default Probability:  {calib_prob:.2%}")
        print(f"Base Expected Model Margin E[F]: {explainer.expected_value:.3f}")
        print("\nTop 3 Adverse Action Factors (features pushing toward default):")
        feat_contribs = list(zip(features, applicant_shap.values[0]))
        sorted_contribs = sorted(feat_contribs, key=lambda x: x[1], reverse=True)[:3]
        for feat, val in sorted_contribs:
            print(f"  {feat:20s}: {val:+.3f} log-odds impact")
    except ImportError:
        print("\nNote: 'shap' package not loaded. Skipping SHAP extraction.")

    # ==============================================================================
    # 10. MODEL PERSISTENCE
    # ==============================================================================
    base_model_path = "credit_risk_xgboost_base.joblib"
    calibrated_model_path = "credit_risk_xgboost_calibrated.joblib"
    joblib.dump(xgb_model, base_model_path)
    joblib.dump(calibrator, calibrated_model_path)
    print(f"\nPersisted base XGBoost model to {base_model_path}")
    print(f"Persisted calibrated underwriting pipeline to {calibrated_model_path}")


if __name__ == "__main__":
    main()
