"""
Boosting Lab: Complete XGBoost End-to-End Workflow (Classification & Regression)
Demonstrating Regularized Newton Boosting, Sparsity-Aware Splits, Early Stopping & JSON Model Persistence.
"""

import numpy as np
import xgboost as xgb
from sklearn.datasets import make_classification, make_regression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    classification_report,
    root_mean_squared_error,
    r2_score,
)


def run_xgboost_classifier():
    print("=" * 60)
    print("1. XGBOOST CLASSIFIER WORKFLOW (Regularized 2nd-Order Boosting)")
    print("=" * 60)

    # A. Dataset Preparation with Synthetic Missing Values
    X, y = make_classification(
        n_samples=2000,
        n_features=15,
        n_informative=10,
        n_redundant=3,
        weights=[0.80, 0.20],  # 20% minority class
        random_state=42,
    )
    # Inject 8% missing values (NaN) to demonstrate XGBoost's native sparsity-aware split finding
    rng = np.random.default_rng(42)
    mask = rng.random(X.shape) < 0.08
    X[mask] = np.nan
    print(f"Dataset shape: {X.shape}, Missing values injected: {np.isnan(X).sum()}")

    # B. Three-Way Split (60% Train, 20% Validation for Early Stopping, 20% Final Test)
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val
    )
    print(f"Train size: {len(X_train)}, Val size: {len(X_val)}, Test size: {len(X_test)}")

    # Calculate class imbalance scaling ratio: N_neg / N_pos
    scale_pos = (y_train == 0).sum() / (y_train == 1).sum()

    # C. Model Configuration
    # Important Hyperparameters:
    # - max_depth: Limits interaction order (typically 3-6)
    # - min_child_weight: Sum of instance Hessians needed in a leaf (prevents tiny noise leaves)
    # - gamma: Minimum loss reduction required to make a further partition (pre-pruning)
    # - subsample / colsample_bytree: Stochastic row and feature subsampling
    # - reg_alpha (L1) / reg_lambda (L2): Direct shrinkage on leaf weights w*
    model = xgb.XGBClassifier(
        n_estimators=1000,
        learning_rate=0.03,
        max_depth=4,
        min_child_weight=3,
        gamma=0.2,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.5,
        scale_pos_weight=scale_pos,
        eval_metric=["auc", "logloss"],
        early_stopping_rounds=40,
        tree_method="hist",          # Optimized histogram-based split search
        random_state=42,
    )

    # D. Model Fitting with Validation Tracking
    print("\nTraining XGBClassifier with early stopping...")
    model.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_val, y_val)],
        verbose=100,
    )

    print(f"\nBest Iteration: {model.best_iteration}")
    print(f"Best Validation Score: {model.best_score:.4f}")

    # E. Final Out-of-Sample Evaluation
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    print("\n--- Final Test Set Evaluation ---")
    print(f"Test Accuracy: {acc:.4f}")
    print(f"Test ROC-AUC:  {auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    # F. Feature Importance (Weight vs Gain)
    booster = model.get_booster()
    weight_score = booster.get_score(importance_type="weight")
    gain_score = booster.get_score(importance_type="gain")
    print("Top 3 features by Gain (average loss reduction per split):")
    sorted_gain = sorted(gain_score.items(), key=lambda x: x[1], reverse=True)[:3]
    for feat, score in sorted_gain:
        print(f"  {feat}: {score:.4f}")

    # G. Native JSON Serialization (Production Standard in XGBoost 2.0+)
    model_json_path = "xgboost_model.json"
    model.save_model(model_json_path)
    print(f"\nModel saved to {model_json_path}")

    # Verify reload
    reloaded_model = xgb.XGBClassifier()
    reloaded_model.load_model(model_json_path)
    reloaded_auc = roc_auc_score(y_test, reloaded_model.predict_proba(X_test)[:, 1])
    assert np.isclose(auc, reloaded_auc), "Reloaded model prediction mismatch!"
    print("Reload verification successful: predictions match exactly.")


def run_xgboost_regressor():
    print("\n" + "=" * 60)
    print("2. XGBOOST REGRESSOR WORKFLOW (reg:squarederror)")
    print("=" * 60)

    X, y = make_regression(n_samples=1500, n_features=12, noise=10.0, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    X_tr, X_va, y_tr, y_va = train_test_split(X_train, y_train, test_size=0.25, random_state=42)

    reg = xgb.XGBRegressor(
        n_estimators=800,
        learning_rate=0.04,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_lambda=1.0,
        eval_metric="rmse",
        early_stopping_rounds=30,
        random_state=42,
    )

    reg.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], verbose=False)
    y_pred = reg.predict(X_test)
    rmse = root_mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"Stopped at iteration: {reg.best_iteration}")
    print(f"Test RMSE: {rmse:.3f}")
    print(f"Test R²:   {r2:.3f}")


if __name__ == "__main__":
    run_xgboost_classifier()
    run_xgboost_regressor()
