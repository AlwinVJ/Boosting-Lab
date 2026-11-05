# Boosting Lab — Python Reference Implementation Suite

This directory contains standalone, reproducible Python scripts accompanying each educational module of Boosting Lab. Every script can be executed independently from the terminal or imported into Jupyter notebooks.

---

## 1. Environment Setup

It is recommended to run these scripts in an isolated virtual environment with Python 3.10, 3.11, or 3.12:

```bash
# 1. Create a virtual environment
python -m venv .venv

# 2. Activate the virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# 3. Install verified dependencies
pip install -r ../requirements.txt
```

---

## 2. Directory Structure & Script Mapping

| Script | Module / Topic | Core Concepts Demonstrated |
| :--- | :--- | :--- |
| **`01_adaboost_workflow.py`** | Module 02: AdaBoost | `AdaBoostClassifier`, `AdaBoostRegressor`, decision stumps, `SAMME`, estimator weights ($\alpha$), model persistence |
| **`02_gradient_boosting_workflow.py`** | Module 03: Gradient Boosting | `GradientBoostingClassifier`, `GradientBoostingRegressor`, `loss="log_loss"`, Huber loss, stochastic subsampling, early stopping |
| **`03_xgboost_workflow.py`** | Module 04: XGBoost | `XGBClassifier`, `XGBRegressor`, Newton leaf updates, sparsity-aware splits (NaNs), Gain/Weight importance, JSON persistence |
| **`04_lightgbm_catboost_workflow.py`** | Module 05: Modern Algorithms | `LGBMClassifier` (leaf-wise growth, `subsample_freq=1`), `CatBoostClassifier` (native string categoricals, oblivious trees) |
| **`05_hyperparameter_tuning_workflow.py`** | Module 07: Hyperparameters | Leak-proof `Pipeline` cross-validation, `GridSearchCV`, `RandomizedSearchCV`, optional Bayesian optimization with Optuna |
| **`06_early_stopping_benchmarks.py`** | Module 08: Advanced Techniques | Side-by-side early stopping across Scikit-Learn, XGBoost, LightGBM, and CatBoost; checkpoint restoration nuances |
| **`07_credit_risk_case_study.py`** | Module 09: Credit Risk Case Study | 12-step loan underwriting pipeline, asymmetric loss matrix ($C_{\text{FN}}=\$15\text{k}, C_{\text{FP}}=\$1.2\text{k}$), threshold optimization, TreeSHAP |

---

## 3. Running the Workflows

You can run each workflow directly:

```bash
# AdaBoost (Classification & Regression)
python python/01_adaboost_workflow.py

# Gradient Boosting Machines
python python/02_gradient_boosting_workflow.py

# XGBoost (Newton Boosting & Sparsity-Aware Splits)
python python/03_xgboost_workflow.py

# LightGBM & CatBoost (Categorical Handling)
python python/04_lightgbm_catboost_workflow.py

# Hyperparameter Tuning Progression
python python/05_hyperparameter_tuning_workflow.py

# Early Stopping Comparison Across Frameworks
python python/06_early_stopping_benchmarks.py

# Full End-to-End Credit Risk Underwriting Pipeline
python python/07_credit_risk_case_study.py
```

---

## 4. Key Engineering Standards

* **Leak-Proof Preprocessing:** All transformations, scalers, imputers, and encodings are fit strictly on training splits.
* **Deterministic Seeds:** Fixed random seeds (`random_state=42`) ensure reproducible metrics across runs.
* **Modern APIs:** No deprecated parameters (e.g. uses `estimator=` rather than `base_estimator=`, `loss="log_loss"` rather than `loss="deviance"`, and `root_mean_squared_error`).
* **Educational Transparency:** Synthetic datasets and financial cost assumptions are clearly identified as pedagogical simulations.
