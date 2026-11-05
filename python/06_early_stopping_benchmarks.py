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
    # Uses internal holdout (validation_fraction) or external validation via staged_predict.
    # Stopping round = t* + patience. Scikit-Learn truncates estimators_ to t*,
    # discarding the trailing patience trees.
    print("\n--- 1. Scikit-Learn GradientBoostingClassifier ---")
    sk_gbm = GradientBoostingClassifier(
        n_estimators=1000,
        learning_rate=0.03,
        max_depth=4,
        n_iter_no_change=patience,   # Halts when validation score stops improving for 'patience' rounds
        validation_fraction=0.20,
        random_state=42,
    )
    sk_gbm.fit(X_train, y_train)
    # Scikit-Learn truncates fitted estimators to exactly the best stage
    print(f"Best Validation Iteration (t*): {sk_gbm.n_estimators_}")
    print(f"Retained Estimators in Model:   {len(sk_gbm.estimators_)} (trailing deteriorating trees discarded)")
    sk_auc = roc_auc_score(y_test, sk_gbm.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC at Best Stage:     {sk_auc:.4f}")

    # 2. XGBoost XGBClassifier
    # Trains until t* + patience. Retains all trees up to the stopping round,
    # but sets best_iteration = t* and by default slices inference to [0, best_iteration + 1).
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
    total_xgb_trees = xgb_clf.get_booster().num_boosted_rounds()
    print(f"Best Iteration (t*):            {xgb_clf.best_iteration}")
    print(f"Total Boosted Rounds Trained:   {total_xgb_trees} (t* + patience rounds trained)")
    print(f"Best Validation AUC Score:      {xgb_clf.best_score:.4f}")
    print(f"Inference Model Slicing:        Automatic range [0, {xgb_clf.best_iteration + 1})")
    xgb_auc = roc_auc_score(y_test, xgb_clf.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC at Best Iteration: {xgb_auc:.4f}")

    # 3. LightGBM LGBMClassifier
    # Trains until t* + patience. Retains all trees up to stopping round,
    # but records best_iteration_ and defaults predict() to best_iteration_.
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
    total_lgb_trees = lgb_clf.booster_.num_trees()
    print(f"Best Iteration (t*):            {lgb_clf.best_iteration_}")
    print(f"Total Trees in Booster:         {total_lgb_trees} (t* + patience rounds trained)")
    print(f"Inference Model Slicing:        Default uses best_iteration_ ({lgb_clf.best_iteration_} trees)")
    lgb_auc = roc_auc_score(y_test, lgb_clf.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC at Best Iteration: {lgb_auc:.4f}")

    # 4. CatBoost CatBoostClassifier
    # When eval_set is provided and early_stopping_rounds is set,
    # 'use_best_model=True' (default) automatically ensures inference uses best iteration weights.
    print("\n--- 4. CatBoost CatBoostClassifier ---")
    cb_clf = CatBoostClassifier(
        iterations=1000,
        learning_rate=0.03,
        depth=5,
        early_stopping_rounds=patience,
        use_best_model=True,  # Automatically restores inference to best iteration checkpoint
        eval_metric="AUC",
        random_seed=42,
        verbose=False,
    )
    cb_clf.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)
    total_cb_trees = cb_clf.tree_count_
    best_cb_iter = cb_clf.get_best_iteration()
    print(f"Best Iteration (t*):            {best_cb_iter}")
    print(f"Total Trees Generated:          {total_cb_trees} (t* + patience rounds trained)")
    print(f"use_best_model Active:          True (inference evaluates on checkpoint at t* = {best_cb_iter})")
    cb_auc = roc_auc_score(y_test, cb_clf.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC at Best Iteration: {cb_auc:.4f}")


if __name__ == "__main__":
    compare_early_stopping_frameworks()
