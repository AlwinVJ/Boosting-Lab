"""
Boosting Lab: Multi-Framework Early Stopping & Best Checkpoint Restoration Mechanics
Comparing Scikit-Learn, XGBoost, LightGBM, and CatBoost on a Controlled Validation Split.
"""

from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.ensemble import GradientBoostingClassifier
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier


def compare_early_stopping_frameworks():
    print("=" * 70)
    print("EARLY STOPPING DYNAMICS ACROSS 4 CANONICAL FRAMEWORKS")
    print("=" * 70)

    # A. Controlled Dataset Setup (1,500 samples, 20% validation split, 20% test split)
    X, y = make_classification(n_samples=1800, n_features=12, weights=[0.70, 0.30], random_state=42)
    X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val)

    patience = 25  # Number of successive rounds without metric improvement before halting

    # 1. Scikit-Learn GradientBoostingClassifier
    # Uses internal holdout (validation_fraction) or external validation via staged_predict
    print("\n--- 1. Scikit-Learn GradientBoostingClassifier ---")
    sk_gbm = GradientBoostingClassifier(
        n_estimators=1000,
        learning_rate=0.03,
        max_depth=4,
        n_iter_no_change=patience,   # Halts when validation score stops improving
        validation_fraction=0.20,
        random_state=42,
    )
    sk_gbm.fit(X_train, y_train)
    # Scikit-Learn automatically truncates estimators to best stage
    print(f"Optimal Stage: {sk_gbm.n_estimators_} trees (out of 1,000 max)")
    sk_auc = roc_auc_score(y_test, sk_gbm.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC:  {sk_auc:.4f}")

    # 2. XGBoost XGBClassifier
    print("\n--- 2. XGBoost XGBClassifier ---")
    xgb_clf = xgb.XGBClassifier(
        n_estimators=1000,
        learning_rate=0.03,
        max_depth=4,
        early_stopping_rounds=patience,
        eval_metric="auc",
        random_state=42,
    )
    xgb_clf.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    # XGBoost 1.6+ automatically defaults predict() to use [0, best_iteration + 1)
    print(f"Best Iteration: {xgb_clf.best_iteration}")
    print(f"Best Val Score: {xgb_clf.best_score:.4f}")
    xgb_auc = roc_auc_score(y_test, xgb_clf.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC:   {xgb_auc:.4f}")

    # 3. LightGBM LGBMClassifier
    print("\n--- 3. LightGBM LGBMClassifier ---")
    lgb_clf = lgb.LGBMClassifier(
        n_estimators=1000,
        learning_rate=0.03,
        num_leaves=31,
        random_state=42,
    )
    lgb_clf.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        callbacks=[lgb.early_stopping(stopping_rounds=patience, verbose=False)],
    )
    print(f"Best Iteration: {lgb_clf.best_iteration_}")
    lgb_auc = roc_auc_score(y_test, lgb_clf.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC:   {lgb_auc:.4f}")

    # 4. CatBoost CatBoostClassifier
    print("\n--- 4. CatBoost CatBoostClassifier ---")
    cb_clf = CatBoostClassifier(
        iterations=1000,
        learning_rate=0.03,
        depth=5,
        early_stopping_rounds=patience,
        use_best_model=True,  # Default True: automatically evaluates inference on best round
        eval_metric="AUC",
        random_seed=42,
        verbose=False,
    )
    cb_clf.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)
    print(f"Best Iteration: {cb_clf.get_best_iteration()}")
    cb_auc = roc_auc_score(y_test, cb_clf.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC:   {cb_auc:.4f}")


if __name__ == "__main__":
    compare_early_stopping_frameworks()
