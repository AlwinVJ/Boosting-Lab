export interface ChapterInfo {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface CurriculumModule {
  id: string;
  number: string;
  slug: string;
  to: string;
  title: string;
  shortTitle: string;
  tagline: string;
  time: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  prerequisites: string[];
  topics: string[];
  chapters: ChapterInfo[];
}

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: "01",
    number: "01",
    slug: "fundamentals",
    to: "/fundamentals",
    title: "Fundamentals of Boosting",
    shortTitle: "Fundamentals",
    tagline: "How sequential weak learners combine to form powerful predictive ensembles.",
    time: "2.5 h",
    difficulty: "Beginner",
    prerequisites: ["Basic Python", "Decision Tree intuition", "Bias-Variance Tradeoff"],
    topics: ["Ensemble learning intuition", "Weak vs strong learners", "Sequential correction", "Bagging vs boosting comparison", "Additive model formulation"],
    chapters: [
      { id: "ensemble-intro", number: "1.1", title: "Introduction to Ensemble Learning", description: "Why combine models, homogeneous vs heterogeneous ensembles, and diversity." },
      { id: "boosting-intro", number: "1.2", title: "Introduction to Boosting", description: "Historical origin (Schapire 1990), weak learner hypothesis, and sequential updates." },
      { id: "bagging-vs-boosting", number: "1.3", title: "Boosting vs. Bagging", description: "Parallel vs sequential training, variance reduction vs bias reduction, Random Forest vs Boosting." },
      { id: "math-foundations", number: "1.4", title: "Mathematical Foundations", description: "Weighted error rates, stagewise additive models, and functional optimization overview." },
    ],
  },
  {
    id: "02",
    number: "02",
    slug: "adaboost",
    to: "/adaboost",
    title: "AdaBoost: Adaptive Boosting",
    shortTitle: "AdaBoost",
    tagline: "The original adaptive algorithm that weights misclassified samples round by round.",
    time: "3.0 h",
    difficulty: "Beginner",
    prerequisites: ["Module 01 Fundamentals", "Logarithms and Exponentials", "Binary Classification"],
    topics: ["Decision stumps", "Sample weight updating", "Learner contribution weight α", "Exponential loss derivation", "Scikit-Learn implementation"],
    chapters: [
      { id: "adaboost-fundamentals", number: "2.1", title: "AdaBoost Fundamentals", description: "Intuition of adaptive sample reweighting and decision stumps as atomic classifiers." },
      { id: "adaboost-math", number: "2.2", title: "AdaBoost Mathematics & Derivation", description: "Rigorous step-by-step derivation of learner weight α_m and normalization factor Z_m." },
      { id: "adaboost-implementation", number: "2.3", title: "AdaBoost Python Implementation", description: "Scikit-Learn AdaBoostClassifier, custom decision stump logic, and weight visualizer." },
    ],
  },
  {
    id: "03",
    number: "03",
    slug: "gradient-boosting",
    to: "/gradient-boosting",
    title: "Gradient Boosting Machines (GBM)",
    shortTitle: "Gradient Boosting",
    tagline: "Fitting subsequent regression trees to the pseudo-residuals of arbitrary loss functions.",
    time: "3.5 h",
    difficulty: "Intermediate",
    prerequisites: ["Module 01 & 02", "Calculus (Gradients & Derivatives)", "Regression Trees"],
    topics: ["Pseudo-residuals", "Functional gradient descent", "Loss functions (MSE, MAE, Deviance)", "Shrinkage (learning rate)", "Step-by-step numerical example"],
    chapters: [
      { id: "gbm-intro", number: "3.1", title: "Introduction to Gradient Boosting", description: "Generalizing boosting from AdaBoost's exponential loss to any differentiable loss." },
      { id: "residual-learning", number: "3.2", title: "Residual-Based Learning", description: "Detailed step-by-step numerical walkthrough on a toy dataset calculating residuals." },
      { id: "gbm-math", number: "3.3", title: "Mathematical Foundations & Functional Gradient Descent", description: "Empirical risk minimization, negative gradients, line search, and terminal leaf value optimization." },
      { id: "gbm-implementation", number: "3.4", title: "GBM Scikit-Learn Implementation", description: "GradientBoostingRegressor and GradientBoostingClassifier with training loss curves." },
    ],
  },
  {
    id: "04",
    number: "04",
    slug: "xgboost",
    to: "/xgboost",
    title: "XGBoost: Extreme Gradient Boosting",
    shortTitle: "XGBoost",
    tagline: "Second-order Taylor expansion, regularized objective, and hardware-accelerated splits.",
    time: "4.0 h",
    difficulty: "Intermediate",
    prerequisites: ["Module 03 GBM", "Taylor Series Expansion", "L1/L2 Regularization"],
    topics: ["Second-order Taylor expansion", "First (g) and second (h) gradients", "Optimal leaf weight w*", "Split gain formula", "Sparsity-aware split finding"],
    chapters: [
      { id: "xgb-intro", number: "4.1", title: "Introduction to XGBoost", description: "Architectural advances, why XGBoost dominated competitions, and key differences from standard GBM." },
      { id: "xgb-math", number: "4.2", title: "XGBoost Mathematical Foundations", description: "Rigorous step-by-step derivation of the 2nd-order objective, optimal weight w*, and split gain." },
      { id: "xgb-tree-construction", number: "4.3", title: "Tree Construction & Sparsity-Aware Splits", description: "Exact greedy split, weighted quantile sketch, and default handling for missing values." },
      { id: "xgb-regularization", number: "4.4", title: "Regularization Mechanics (γ, λ, α)", description: "How gamma, lambda, alpha, and min_child_weight prevent overfitting mathematically." },
      { id: "xgb-implementation", number: "4.5", title: "XGBoost Python Implementation", description: "xgb.XGBClassifier, xgb.XGBRegressor, eval_set monitoring, and feature importance." },
    ],
  },
  {
    id: "05",
    number: "05",
    slug: "algorithms",
    to: "/algorithms",
    title: "Modern Boosting Ecosystem: LightGBM & CatBoost",
    shortTitle: "Modern Ecosystem",
    tagline: "Histogram binning, leaf-wise growth, ordered boosting, and comprehensive algorithm comparison.",
    time: "3.5 h",
    difficulty: "Intermediate",
    prerequisites: ["Module 03 & 04", "Categorical Encoding", "Histogram Concepts"],
    topics: ["Histogram-based binning", "Leaf-wise vs level-wise growth", "GOSS & EFB in LightGBM", "Target statistics & ordered boosting in CatBoost", "5-way algorithm comparative matrix"],
    chapters: [
      { id: "lightgbm", number: "5.1", title: "LightGBM: Speed & Scalability", description: "Histogram binning, leaf-wise growth with max depth, GOSS, and Exclusive Feature Bundling." },
      { id: "catboost", number: "5.2", title: "CatBoost: Categorical Excellence", description: "Ordered target statistics, target leakage prevention, and symmetric oblivious trees." },
      { id: "comparison-matrix", number: "5.3", title: "Comprehensive Algorithm Comparison", description: "Unbiased 5-way comparative analysis: AdaBoost vs GBM vs XGBoost vs LightGBM vs CatBoost." },
    ],
  },
  {
    id: "06",
    number: "06",
    slug: "implementation",
    to: "/implementation",
    title: "Practical Implementation Lab",
    shortTitle: "Implementation Lab",
    tagline: "Hands-on Python workflows from preprocessing to model training, evaluation, and interpretability.",
    time: "3.5 h",
    difficulty: "Intermediate",
    prerequisites: ["Pandas", "Scikit-Learn Basics", "Classification & Regression Metrics"],
    topics: ["Exploratory Data Analysis", "Preprocessing & leakage prevention", "Model benchmarking", "Classification & regression metrics", "SHAP and permutation importance"],
    chapters: [
      { id: "datasets", number: "6.1", title: "Dataset Exploration & Structure", description: "Classification and regression tabular datasets, class distributions, and feature types." },
      { id: "preprocessing", number: "6.2", title: "Data Preprocessing & Leakage Prevention", description: "Proper imputation, categorical encoding, scaling, train-test splitting without leakage." },
      { id: "model-development", number: "6.3", title: "Multi-Model Development", description: "Side-by-side training of AdaBoost, GBM, XGBoost, LightGBM, and CatBoost in Python." },
      { id: "evaluation", number: "6.4", title: "Evaluation Metrics Deep Dive", description: "Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC, MAE, MSE, and RMSE selection criteria." },
      { id: "feature-importance", number: "6.5", title: "Feature Importance & Model Explainability", description: "Gain, weight, cover, permutation importance, and SHAP TreeExplainer." },
    ],
  },
  {
    id: "07",
    number: "07",
    slug: "hyperparameters",
    to: "/hyperparameters",
    title: "Hyperparameter Tuning & Optimization",
    shortTitle: "Hyperparameters",
    tagline: "Mastering the control knobs that balance model capacity, convergence rate, and generalization.",
    time: "3.0 h",
    difficulty: "Advanced",
    prerequisites: ["Module 04 XGBoost", "Cross-Validation", "Probability"],
    topics: ["GBM & XGBoost key parameters", "GridSearchCV vs RandomizedSearchCV", "Bayesian optimization with Optuna", "Hyperparameter interaction effects", "Search-space design"],
    chapters: [
      { id: "gbm-params", number: "7.1", title: "Gradient Boosting Hyperparameters", description: "n_estimators, learning_rate, max_depth, min_samples_split, subsample, loss." },
      { id: "xgb-params", number: "7.2", title: "XGBoost Hyperparameters", description: "max_depth, min_child_weight, gamma, subsample, colsample_bytree, reg_alpha, reg_lambda." },
      { id: "tuning-strategies", number: "7.3", title: "Optimization Strategies & Tooling", description: "K-fold cross-validation, RandomizedSearchCV, Bayesian optimization with Optuna." },
    ],
  },
  {
    id: "08",
    number: "08",
    slug: "advanced",
    to: "/advanced",
    title: "Advanced Boosting Techniques",
    shortTitle: "Advanced Topics",
    tagline: "Learning rate shrinkage, early stopping mechanics, regularization, and imbalanced datasets.",
    time: "3.5 h",
    difficulty: "Advanced",
    prerequisites: ["Module 06 & 07", "Overfitting / Regularization Concepts"],
    topics: ["Learning rate vs n_estimators tradeoff", "Early stopping and patience", "Preventing overfitting in production", "Imbalanced classification with scale_pos_weight", "Threshold optimization"],
    chapters: [
      { id: "lr-estimators", number: "8.1", title: "Learning Rate & Shrinkage", description: "Why small learning rates generalize better, empirical trade-offs, and scaling rules." },
      { id: "early-stopping", number: "8.2", title: "Early Stopping Dynamics", description: "Monitoring validation loss, best iteration selection, and patience parameters." },
      { id: "overfitting-prevention", number: "8.3", title: "Comprehensive Overfitting Prevention", description: "Multi-layered regularization: tree depth, minimum child weight, subsampling, and feature subsampling." },
      { id: "imbalanced-data", number: "8.4", title: "Handling Class Imbalance", description: "scale_pos_weight, PR-AUC evaluation, threshold tuning, and cost-sensitive boosting." },
    ],
  },
  {
    id: "09",
    number: "09",
    slug: "case-study",
    to: "/case-study",
    title: "Real-World Case Study: Credit Risk Prediction",
    shortTitle: "Case Study",
    tagline: "An end-to-end financial machine learning workflow from framing to deployment and governance.",
    time: "4.0 h",
    difficulty: "Advanced",
    prerequisites: ["All Previous Modules", "Financial Risk Formulation"],
    topics: ["Credit default prediction & Expected Credit Loss (ECL)", "Asymmetric cost of errors & Bayes-optimal thresholding", "Multi-model benchmarking vs Logistic Regression & Random Forest", "Leak-proof preprocessing & Out-of-Time (OOT) validation", "TreeSHAP local attributions & Adverse Action Notices", "Regulatory compliance (ECOA, Regulation B, FCRA, SR 11-7 adverse action requirements)"],
    chapters: [
      { id: "business-understanding", number: "9.1", title: "Business Understanding & Risk Formulation", description: "Credit risk definition, Basel default criteria, Expected Credit Loss (ECL = PD × LGD × EAD), and asymmetric loss matrices." },
      { id: "data-eda", number: "9.2", title: "Dataset Authenticity & Exploratory Analysis", description: "Synthetic pedagogical simulation vs real-world credit bureaus, and the canonical UCI Credit Card Default benchmark." },
      { id: "data-preparation", number: "9.3", title: "Leak-Proof Preprocessing & Feature Engineering", description: "Leverage ratios, class imbalance handling, tree scale-invariance, and Out-of-Time (OOT) validation splits." },
      { id: "model-benchmarking", number: "9.4", title: "Model Development & Benchmarking", description: "Logistic Regression scorecard baseline vs Random Forest vs Gradient Boosting vs tuned XGBoost." },
      { id: "evaluation-thresholding", number: "9.5", title: "Evaluation & Threshold Optimization", description: "Brier score, calibration curves, PR-AUC vs ROC-AUC, and cost-volume threshold optimization." },
      { id: "interpretation-shap", number: "9.6", title: "TreeSHAP Explainability & Adverse Action", description: "Local attributions, global summary, ECOA / Regulation B (§ 1002.9) adverse action compliance, and associative vs causal limitations." },
      { id: "production-challenges", number: "9.7", title: "Fair Lending, Model Risk (SR 11-7) & Drift", description: "Equal Credit Opportunity Act, disparate impact, PSI drift tracking, and reject inference survivorship bias." },
    ],
  },
];
