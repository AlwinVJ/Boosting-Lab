"""
Boosting Lab: Complete AdaBoost End-to-End Workflow (Classification & Regression)

This script demonstrates:
1. Dataset preparation using reproducible synthetic distributions.
2. Train-test splitting with stratification for classification.
3. AdaBoostClassifier with decision stumps and Scikit-Learn's modern SAMME algorithm.
4. Estimator weight (alpha) and error inspection across boosting rounds.
5. AdaBoostRegressor with continuous regression trees.
6. Comprehensive evaluation (ROC-AUC, F1, RMSE, R²).
7. Model persistence via joblib.
"""

import numpy as np
from sklearn.datasets import make_classification, make_regression
from sklearn.model_selection import train_test_split
from sklearn.ensemble import AdaBoostClassifier, AdaBoostRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
    mean_absolute_error,
    root_mean_squared_error,
    r2_score,
)
import joblib


def run_adaboost_classification():
    print("=" * 60)
    print("1. ADABOOST CLASSIFIER WORKFLOW")
    print("=" * 60)

    # A. Dataset Preparation
    # Generating a synthetic binary dataset with informative and redundant features
    X, y = make_classification(
        n_samples=1200,
        n_features=10,
        n_informative=6,
        n_redundant=2,
        weights=[0.70, 0.30],  # 30% positive class prevalence
        random_state=42,
    )
    print(f"Dataset shape: {X.shape}, Class distribution: {np.bincount(y)}")

    # B. Stratified Train-Test Splitting
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

    # C. Weak Learner and Model Initialization
    # Decision stump (tree of depth 1) is the canonical weak learner
    stump = DecisionTreeClassifier(max_depth=1, random_state=42)

    # In Scikit-Learn 1.4+, 'estimator' replaces deprecated 'base_estimator'
    # 'algorithm="SAMME"' is the standard discrete boosting formulation
    adaboost_clf = AdaBoostClassifier(
        estimator=stump,
        n_estimators=100,
        learning_rate=0.8,
        algorithm="SAMME",
        random_state=42,
    )

    # D. Model Fitting
    print("\nTraining AdaBoostClassifier...")
    adaboost_clf.fit(X_train, y_train)

    # E. Estimator Inspection
    weights = adaboost_clf.estimator_weights_
    errors = adaboost_clf.estimator_errors_
    print(f"Total fitted estimators: {len(adaboost_clf.estimators_)}")
    print(f"First 5 estimator weights (alpha): {np.round(weights[:5], 4)}")
    print(f"First 5 weighted errors (epsilon): {np.round(errors[:5], 4)}")

    # F. Model Evaluation
    y_pred = adaboost_clf.predict(X_test)
    y_proba = adaboost_clf.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred)

    print("\n--- Classification Performance ---")
    print(f"Accuracy: {acc:.4f}")
    print(f"ROC-AUC:  {auc:.4f}")
    print("Confusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    # G. Model Persistence
    model_path = "adaboost_classifier.joblib"
    joblib.dump(adaboost_clf, model_path)
    print(f"Model serialized successfully to {model_path}")

    # Verify loaded inference
    loaded_clf = joblib.load(model_path)
    loaded_auc = roc_auc_score(y_test, loaded_clf.predict_proba(X_test)[:, 1])
    assert np.isclose(auc, loaded_auc), "Loaded model predictions mismatch!"
    print("Persistence verification verified: reload matches in-memory model.")


def run_adaboost_regression():
    print("\n" + "=" * 60)
    print("2. ADABOOST REGRESSOR WORKFLOW (Drucker 1997)")
    print("=" * 60)

    # A. Dataset Preparation
    X, y = make_regression(
        n_samples=1000,
        n_features=8,
        n_informative=5,
        noise=15.0,
        random_state=42,
    )

    # B. Train-Test Splitting
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42
    )

    # C. Model Configuration
    # Shallow regression trees (depth 3) are typically used for regression
    reg_tree = DecisionTreeRegressor(max_depth=3, random_state=42)
    adaboost_reg = AdaBoostRegressor(
        estimator=reg_tree,
        n_estimators=100,
        learning_rate=0.1,
        loss="linear",  # options: 'linear', 'square', 'exponential'
        random_state=42,
    )

    # D. Model Fitting
    print("Training AdaBoostRegressor...")
    adaboost_reg.fit(X_train, y_train)

    # E. Evaluation
    y_pred = adaboost_reg.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("\n--- Regression Performance ---")
    print(f"MAE:  {mae:.3f}")
    print(f"RMSE: {rmse:.3f}")
    print(f"R²:   {r2:.3f}")


if __name__ == "__main__":
    run_adaboost_classification()
    run_adaboost_regression()
