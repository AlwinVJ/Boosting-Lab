"""
Boosting Lab: End-to-End Credit Risk Underwriting Workflow
Demonstrating Leak-Proof Preprocessing, Asymmetric Loss Matrix Optimization, TreeSHAP Explainability & Model Persistence.

DATA TRANSPARENCY NOTICE:
This workflow uses an illustrative synthetic consumer loan dataset generated to model retail credit risk.
All cost parameters ($15,000 FN write-off, $1,200 FP lost margin) are pedagogical assumptions,
not audited proprietary bank figures.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
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
# 1 & 2. DATASET GENERATION & EXPLORATION (Reproducible Synthetic Schema)
# ==============================================================================
def load_credit_risk_data(n_samples=5000, random_state=42):
    """Generates the canonical 5,000-sample synthetic consumer credit portfolio."""
    rng = np.random.default_rng(random_state)

    credit_score = rng.normal(675, 65, n_samples).clip(350, 850).round()
    income = np.exp(rng.normal(11.0, 0.45, n_samples)).clip(18000, 250000).round()
    dti = rng.uniform(0.05, 0.68, n_samples).round(2)
    loan_amount = (income * rng.uniform(0.15, 0.45, n_samples)).round(-2)
    emp_length = rng.integers(0, 26, n_samples)
    late_payments = rng.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.70, 0.15, 0.08, 0.05, 0.02])

    # Calibrated default logit model
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
    print("=" * 75)
    print("END-TO-END CONSUMER CREDIT RISK MODELING WORKFLOW")
    print("=" * 75)

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

    # 3. Stratified Chronological/Partition Split (80% Train, 20% Evaluation Test Set)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train cohort: {len(X_train)} samples, Test evaluation cohort: {len(X_test)} samples")

    # 4. Asymmetric Imbalance Ratio
    scale_pos_weight = (len(y_train) - y_train.sum()) / y_train.sum()

    # 5. Model Training (Regularized XGBoost)
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

    # 6. Out-of-Sample Probability Estimation
    # Note: raw predict_proba reflects ranking discriminability
    raw_probs = xgb_model.predict_proba(X_test)[:, 1]
    print(f"\nTest ROC-AUC:     {roc_auc_score(y_test, raw_probs):.4f}")
    print(f"Test PR-AUC:      {average_precision_score(y_test, raw_probs):.4f}")
    print(f"Test Brier Score: {brier_score_loss(y_test, raw_probs):.4f}")

    # ==============================================================================
    # 7 & 8. ASYMMETRIC LOSS EVALUATION & DECISION THRESHOLD OPTIMIZATION
    # ==============================================================================
    C_FN = 15000  # Cost of granting loan to defaulter (write-off + legal collection)
    C_FP = 1200   # Cost of turning away solvent borrower (lost net interest margin)

    # Theoretical Bayes-optimal cutoff: theta* = C_FP / (C_FN + C_FP)
    bayes_optimal_theta = C_FP / (C_FN + C_FP)
    print(f"\n--- Decision Threshold Dynamics (C_FN=${C_FN:,}, C_FP=${C_FP:,}) ---")
    print(f"Theoretical Bayes-Optimal Cutoff: theta* = {bayes_optimal_theta:.4f}")

    thresholds_to_evaluate = [
        ("Operating Point 1: Standard Symmetric (θ = 0.50)", 0.50),
        ("Operating Point 2: Balanced Production Target (θ = 0.18)", 0.18),
        ("Operating Point 3: Theoretical Bayes-Optimal (θ* ≈ 0.074)", bayes_optimal_theta),
    ]

    baseline_cost = None

    for label, theta in thresholds_to_evaluate:
        # Decision Rule: Predict 1 (Default) => Reject loan; Predict 0 => Approve loan
        y_pred_theta = (raw_probs >= theta).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred_theta).ravel()

        approved = tn + fn
        rejected = tp + fp
        recall = tp / (tp + fn)
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        expected_cost = fn * C_FN + fp * C_FP

        if baseline_cost is None:
            baseline_cost = expected_cost
            savings = 0
            savings_pct = 0.0
        else:
            savings = baseline_cost - expected_cost
            savings_pct = (savings / baseline_cost) * 100

        print(f"\n{label}:")
        print(f"  Approved: {approved} ({approved/len(y_test):.1%}), Rejected: {rejected} ({rejected/len(y_test):.1%})")
        print(f"  Confusion Matrix: TP={tp}, FP={fp}, TN={tn}, FN={fn}")
        print(f"  Recall (Defaults Caught): {recall:.1%}, Precision: {precision:.1%}")
        print(f"  Expected Financial Cost:  ${expected_cost:,.2f}")
        if savings > 0:
            print(f"  Cohort Cost Reduction:    ${savings:,.2f} ({savings_pct:.1f}%)")

    # ==============================================================================
    # 9. TREESHAP LOCAL ATTRIBUTION (Adverse Action Notice Compliance)
    # ==============================================================================
    try:
        import shap
        print("\n--- TreeSHAP Feature Attribution Extraction ---")
        explainer = shap.TreeExplainer(xgb_model)
        # Compute exact Shapley values for declined applicant
        declined_idx = np.where(raw_probs >= 0.18)[0][0]
        applicant_shap = explainer(X_test.iloc[[declined_idx]])

        print(f"Applicant Index: {declined_idx}")
        print(f"Base Expected Margin E[F(x)]: {explainer.expected_value:.3f}")
        print("Top 3 Adverse Action Factors (features pushing toward default):")
        feat_contribs = list(zip(features, applicant_shap.values[0]))
        sorted_contribs = sorted(feat_contribs, key=lambda x: x[1], reverse=True)[:3]
        for feat, val in sorted_contribs:
            print(f"  {feat:20s}: {val:+.3f} log-odds")
    except ImportError:
        print("\nNote: Install 'shap' to run local Shapley attribution extractions.")

    # ==============================================================================
    # 10. MODEL PERSISTENCE
    # ==============================================================================
    model_filename = "credit_risk_xgboost.joblib"
    joblib.dump(xgb_model, model_filename)
    print(f"\nTrained model persisted to {model_filename}")


if __name__ == "__main__":
    main()
