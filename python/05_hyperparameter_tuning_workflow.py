"""
Boosting Lab: Complete Hyperparameter Tuning Progression
Demonstrating Leak-Proof Pipeline Cross-Validation, GridSearchCV, RandomizedSearchCV & Optuna.
"""

import sys
sys.stdout.reconfigure(line_buffering=True)

import numpy as np
from scipy.stats import uniform, randint
from sklearn.datasets import make_classification
from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    GridSearchCV,
    RandomizedSearchCV,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.ensemble import GradientBoostingClassifier


def run_grid_and_random_search():
    print("=" * 60)
    print("1. LEAK-PROOF HYPERPARAMETER TUNING (Grid & Randomized Search)")
    print("=" * 60)

    # A. Dataset Preparation
    X, y = make_classification(
        n_samples=1500,
        n_features=12,
        n_informative=8,
        weights=[0.75, 0.25],
        random_state=42,
    )
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # B. Build Leak-Proof Pipeline
    # Crucial: Preprocessors inside Pipeline are fit strictly on training folds inside each CV split
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("gbm", GradientBoostingClassifier(random_state=42)),
    ])

    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

    # C. Strategy 1: GridSearchCV (Exhaustive Discrete Grid)
    print("\n--- Running GridSearchCV ---")
    param_grid = {
        "gbm__n_estimators": [30, 60],
        "gbm__learning_rate": [0.05, 0.1],
        "gbm__max_depth": [2, 3],
        "gbm__subsample": [0.8, 1.0],
    }

    grid_search = GridSearchCV(
        estimator=pipeline,
        param_grid=param_grid,
        scoring="roc_auc",
        cv=cv,
        n_jobs=1,
        verbose=0,
    )
    grid_search.fit(X_train, y_train)

    print(f"GridSearch Best CV ROC-AUC: {grid_search.best_score_:.4f}")
    print(f"GridSearch Best Parameters: {grid_search.best_params_}")

    # Evaluate on held-out test set
    test_auc_grid = roc_auc_score(y_test, grid_search.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC (Grid Tuned):  {test_auc_grid:.4f}")

    # D. Strategy 2: RandomizedSearchCV (Continuous & Discrete Distributions)
    print("\n--- Running RandomizedSearchCV (Continuous Distributions) ---")
    param_distributions = {
        "gbm__n_estimators": randint(30, 70),
        "gbm__learning_rate": uniform(0.03, 0.12),
        "gbm__max_depth": randint(2, 4),
        "gbm__subsample": uniform(0.70, 0.30),
    }

    random_search = RandomizedSearchCV(
        estimator=pipeline,
        param_distributions=param_distributions,
        n_iter=6,  # 6 representative random parameter configurations
        scoring="roc_auc",
        cv=cv,
        random_state=42,
        n_jobs=1,
        verbose=0,
    )
    random_search.fit(X_train, y_train)

    print(f"RandomSearch Best CV ROC-AUC: {random_search.best_score_:.4f}")
    print(f"RandomSearch Best Parameters: {random_search.best_params_}")

    test_auc_random = roc_auc_score(y_test, random_search.predict_proba(X_test)[:, 1])
    print(f"Test ROC-AUC (Random Tuned): {test_auc_random:.4f}")


def run_optuna_bayesian_optimization():
    print("\n" + "=" * 60)
    print("2. ADVANCED: BAYESIAN OPTIMIZATION (Optuna Study)")
    print("=" * 60)
    try:
        import optuna
        import xgboost as xgb
    except ImportError:
        print("Optuna or XGBoost not installed. Run 'pip install optuna xgboost' to execute this section.")
        return

    # Suppress verbose Optuna logging output
    optuna.logging.set_verbosity(optuna.logging.WARNING)

    X, y = make_classification(n_samples=1500, n_features=12, weights=[0.75, 0.25], random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

    def objective(trial):
        params = {
            "n_estimators": 300,
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
            "max_depth": trial.suggest_int("max_depth", 3, 6),
            "subsample": trial.suggest_float("subsample", 0.60, 0.95),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.60, 0.95),
            "reg_lambda": trial.suggest_float("reg_lambda", 1e-2, 10.0, log=True),
            "eval_metric": "auc",
            "early_stopping_rounds": 25,
            "tree_method": "hist",
            "random_state": 42,
        }

        cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
        scores = []
        for tr_idx, va_idx in cv.split(X_train, y_train):
            X_tr, X_va = X_train[tr_idx], X_train[va_idx]
            y_tr, y_va = y_train[tr_idx], y_train[va_idx]
            model = xgb.XGBClassifier(**params)
            model.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], verbose=False)
            scores.append(roc_auc_score(y_va, model.predict_proba(X_va)[:, 1]))
        return np.mean(scores)

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=10)

    print(f"Optuna Best CV ROC-AUC: {study.best_value:.4f}")
    print("Optuna Optimal Parameters:")
    for k, v in study.best_params.items():
        print(f"  {k}: {v}")

    # Retrain final production model on full training set using optimal parameters
    print("\n--- Retraining Final Model on Full Training Dataset ---")
    final_params = study.best_params.copy()
    final_params.update({
        "n_estimators": 300,
        "eval_metric": "auc",
        "tree_method": "hist",
        "random_state": 42,
    })
    final_model = xgb.XGBClassifier(**final_params)
    final_model.fit(X_train, y_train, verbose=False)

    # Evaluate on untouched held-out test cohort
    y_test_pred = final_model.predict(X_test)
    y_test_proba = final_model.predict_proba(X_test)[:, 1]
    final_test_auc = roc_auc_score(y_test, y_test_proba)

    print("\n--- Final Out-of-Sample Performance Comparison ---")
    print(f"Optuna 3-Fold Cross-Validation ROC-AUC: {study.best_value:.4f}")
    print(f"Held-Out Test Set ROC-AUC:              {final_test_auc:.4f}")
    print(f"Generalization Gap (|CV - Test|):       {abs(study.best_value - final_test_auc):.4f}")
    print("\nHeld-Out Classification Report:")
    print(classification_report(y_test, y_test_pred, digits=4))


if __name__ == "__main__":
    run_grid_and_random_search()
    run_optuna_bayesian_optimization()
