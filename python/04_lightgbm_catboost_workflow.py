"""
Boosting Lab: Complete LightGBM & CatBoost Workflows with Categorical Handling
Demonstrating Histogram Discretization, Leaf-Wise Growth, Ordered Target Statistics & Native Categoricals.
"""

import numpy as np
import pandas as pd
import lightgbm as lgb
from catboost import CatBoostClassifier, CatBoostRegressor, Pool
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, root_mean_squared_error, r2_score


def generate_mixed_tabular_dataset(n_samples=2500, random_state=42):
    """Generates a realistic tabular dataset with mixed numeric and categorical features."""
    rng = np.random.default_rng(random_state)

    credit_score = rng.normal(670, 60, n_samples).clip(350, 850)
    income = np.exp(rng.normal(11.0, 0.45, n_samples)).clip(20000, 200000)
    dti = rng.uniform(0.05, 0.65, n_samples)
    loan_amount = (income * rng.uniform(0.15, 0.40, n_samples)).round(-2)

    # High-cardinality and nominal categoricals
    employment_type = rng.choice(["Salaried", "Self-Employed", "Hourly", "Commission"], size=n_samples, p=[0.55, 0.20, 0.15, 0.10])
    home_ownership = rng.choice(["Rent", "Mortgage", "Own"], size=n_samples, p=[0.45, 0.40, 0.15])
    loan_purpose = rng.choice(["Debt Consolidation", "Home Improvement", "Major Purchase", "Medical"], size=n_samples)

    # Target logistic DGP
    z = (credit_score - 670) / 60
    logit = -2.5 - 0.9 * z + 3.0 * (dti - 0.30) + (loan_amount / income - 0.25) * 1.5
    # Category risk modifiers
    logit += np.where(home_ownership == "Rent", 0.35, -0.20)
    logit += np.where(employment_type == "Self-Employed", 0.25, 0.0)

    prob = 1 / (1 + np.exp(-logit))
    default = (rng.random(n_samples) < prob).astype(int)

    df = pd.DataFrame({
        "credit_score": credit_score,
        "income": income,
        "dti": dti,
        "loan_amount": loan_amount,
        "employment_type": employment_type,
        "home_ownership": home_ownership,
        "loan_purpose": loan_purpose,
        "default": default,
    })
    return df


def run_lightgbm_workflow():
    print("=" * 60)
    print("1. LIGHTGBM PIPELINE (Histogram Discretization & Leaf-Wise Growth)")
    print("=" * 60)

    df = generate_mixed_tabular_dataset(n_samples=3000, random_state=42)
    cat_cols = ["employment_type", "home_ownership", "loan_purpose"]

    # In LightGBM, categorical columns must be explicitly formatted as pandas 'category' dtype
    for col in cat_cols:
        df[col] = df[col].astype("category")

    X = df.drop(columns=["default"])
    y = df["default"]

    X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val)

    # Key LightGBM Parameters:
    # - num_leaves: Main complexity control (default 31; theoretical max for depth d is 2^d)
    # - max_depth: Bounded to prevent deep single-leaf overfitting
    # - subsample & subsample_freq: IMPORTANT: subsample requires subsample_freq > 0 to enable bagging!
    # - min_child_samples: Minimum data in one leaf (regularization against tiny leaves)
    lgb_clf = lgb.LGBMClassifier(
        n_estimators=1000,
        learning_rate=0.03,
        num_leaves=31,
        max_depth=5,
        min_child_samples=25,
        subsample=0.8,
        subsample_freq=1,          # Crucial: enables row bagging every 1 iteration
        colsample_bytree=0.8,
        random_state=42,
    )

    print("Training LightGBM with early stopping...")
    lgb_clf.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        callbacks=[lgb.early_stopping(stopping_rounds=40, verbose=False)],
    )

    print(f"Best Iteration: {lgb_clf.best_iteration_}")
    y_proba = lgb_clf.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_proba)
    print(f"Test ROC-AUC: {auc:.4f}")

    # Persistence
    lgb_clf.booster_.save_model("lightgbm_model.txt")
    print("LightGBM model saved to lightgbm_model.txt")


def run_catboost_workflow():
    print("\n" + "=" * 60)
    print("2. CATBOOST PIPELINE (Native Online Ordered Target Statistics)")
    print("=" * 60)

    df = generate_mixed_tabular_dataset(n_samples=3000, random_state=42)
    cat_cols = ["employment_type", "home_ownership", "loan_purpose"]

    # CatBoost accepts raw Python string columns natively!
    X = df.drop(columns=["default"])
    y = df["default"]

    X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val)

    # Key CatBoost Parameters:
    # - cat_features: List of categorical feature names/indices passed directly without one-hot encoding
    # - depth: Oblivious symmetric tree depth (typically 4-8)
    # - l2_leaf_reg: L2 regularization on leaf values
    # - use_best_model: Automatically restores model weights to best validation round (default True)
    cb_clf = CatBoostClassifier(
        iterations=1000,
        learning_rate=0.03,
        depth=6,
        cat_features=cat_cols,
        l2_leaf_reg=3.0,
        eval_metric="AUC",
        early_stopping_rounds=40,
        random_seed=42,
        verbose=False,
    )

    print("Training CatBoost with native categorical handling...")
    cb_clf.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)

    print(f"Best Iteration: {cb_clf.get_best_iteration()}")
    print(f"Best Validation Score: {cb_clf.get_best_score()['validation']['AUC']:.4f}")

    y_proba = cb_clf.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_proba)
    print(f"Test ROC-AUC: {auc:.4f}")

    # Feature Importance (PredictionValuesChange)
    importances = cb_clf.get_feature_importance()
    print("\nCatBoost Feature Importances:")
    for feat, imp in zip(X.columns, importances):
        print(f"  {feat:20s}: {imp:.2f}%")

    # Persistence
    cb_clf.save_model("catboost_model.cbm")
    print("CatBoost model saved to catboost_model.cbm")


if __name__ == "__main__":
    run_lightgbm_workflow()
    run_catboost_workflow()
