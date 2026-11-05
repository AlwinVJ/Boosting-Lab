"""
Boosting Lab: Complete Gradient Boosting Machines (GBM) Workflow
Demonstrating Functional Gradient Descent, Loss Objectives, Stochastic Subsampling & Early Stopping.
"""

import numpy as np
from sklearn.datasets import make_classification, make_regression
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    brier_score_loss,
    classification_report,
    root_mean_squared_error,
    mean_absolute_error,
    r2_score,
)
import joblib


def run_gbm_classifier():
    print("=" * 60)
    print("1. GRADIENT BOOSTING CLASSIFIER (Deviance / Log-Loss)")
    print("=" * 60)

    # A. Dataset Preparation
    X, y = make_classification(
        n_samples=1500,
        n_features=12,
        n_informative=8,
        n_redundant=2,
        weights=[0.65, 0.35],
        random_state=42,
    )

    # B. Stratified Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # C. Model Configuration with Validation-Based Early Stopping
    # Modern parameter: loss="log_loss" (replaces deprecated 'deviance')
    # n_iter_no_change triggers early stopping when internal validation loss plateaus
    gbm_clf = GradientBoostingClassifier(
        loss="log_loss",
        n_estimators=500,
        learning_rate=0.05,
        max_depth=3,
        subsample=0.8,              # Stochastic GB: 80% row subsample per stage
        min_samples_split=10,
        min_samples_leaf=5,
        n_iter_no_change=20,        # Early stopping patience
        validation_fraction=0.15,   # Internal holdout for early stopping
        tol=1e-4,
        random_state=42,
    )

    # D. Model Fitting
    print("Training GradientBoostingClassifier with early stopping...")
    gbm_clf.fit(X_train, y_train)

    print(f"Optimal stopping stage: {gbm_clf.n_estimators_} trees (out of 500 max)")
    print(f"Initial loss: {gbm_clf.train_score_[0]:.4f}")
    print(f"Final training loss: {gbm_clf.train_score_[-1]:.4f}")

    # E. Evaluation
    y_pred = gbm_clf.predict(X_test)
    y_proba = gbm_clf.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    brier = brier_score_loss(y_test, y_proba)

    print("\n--- Classification Performance ---")
    print(f"Accuracy:    {acc:.4f}")
    print(f"ROC-AUC:     {auc:.4f}")
    print(f"Brier Score: {brier:.4f} (lower is better calibrated)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    # F. Permutation Feature Importance
    print("Computing Permutation Feature Importance...")
    perm_imp = permutation_importance(gbm_clf, X_test, y_test, n_repeats=10, random_state=42)
    top_indices = np.argsort(perm_imp.importances_mean)[::-1][:5]
    print("Top 5 features by test score drop:")
    for idx in top_indices:
        print(f"  Feature {idx:2d}: {perm_imp.importances_mean[idx]:.4f} +/- {perm_imp.importances_std[idx]:.4f}")

    # G. Persistence
    joblib.dump(gbm_clf, "gbm_classifier.joblib")
    print("Model serialized to gbm_classifier.joblib")


def run_gbm_regressor():
    print("\n" + "=" * 60)
    print("2. GRADIENT BOOSTING REGRESSOR (MSE & Huber Robust Loss)")
    print("=" * 60)

    # A. Dataset Preparation with Heavy Outliers
    X, y = make_regression(n_samples=1200, n_features=10, noise=8.0, random_state=42)
    # Inject 5% extreme target outliers to illustrate loss function choice
    n_outliers = int(0.05 * len(y))
    rng = np.random.default_rng(42)
    y[rng.choice(len(y), size=n_outliers, replace=False)] += rng.normal(150, 40, size=n_outliers)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    # B. Compare Standard Squared Error vs Outlier-Resistant Huber Loss
    models = {
        "Squared Error (L2)": GradientBoostingRegressor(loss="squared_error", n_estimators=250, learning_rate=0.05, max_depth=4, random_state=42),
        "Huber Loss (Robust)": GradientBoostingRegressor(loss="huber", alpha=0.90, n_estimators=250, learning_rate=0.05, max_depth=4, random_state=42),
    }

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        rmse = root_mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        print(f"\n{name} Results:")
        print(f"  Test RMSE: {rmse:.3f}")
        print(f"  Test MAE:  {mae:.3f}")
        print(f"  Test R²:   {r2:.3f}")


if __name__ == "__main__":
    run_gbm_classifier()
    run_gbm_regressor()
