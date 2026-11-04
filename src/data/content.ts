// Placeholder content and data. All metrics are illustrative, not experimental results.

export const PROGRESS = {
  total: 6,
  completed: 2,
  hours: 18,
  current: "03 — XGBoost and Modern Algorithms",
};

export const MODULES = [
  { id: "01", title: "Boosting Fundamentals", to: "/fundamentals", time: "2.5 h", topics: ["Weak learners", "Sequential learning", "Bagging vs boosting"], status: "done" },
  { id: "02", title: "Gradient Boosting Machines", to: "/algorithms", time: "3 h", topics: ["Residuals", "Loss functions", "Functional gradient descent"], status: "done" },
  { id: "03", title: "XGBoost and Modern Algorithms", to: "/algorithms", time: "3.5 h", topics: ["Regularized objective", "Second-order gradients", "LightGBM, CatBoost"], status: "active" },
  { id: "04", title: "Practical Implementation", to: "/implementation", time: "3 h", topics: ["scikit-learn", "xgboost", "Hyperparameters"], status: "todo" },
  { id: "05", title: "Advanced Optimization", to: "/advanced", time: "3 h", topics: ["Early stopping", "Regularization", "Imbalance"], status: "todo" },
  { id: "06", title: "Real-World Applications", to: "/case-study", time: "3 h", topics: ["Credit risk", "Evaluation", "Interpretation"], status: "todo" },
] as const;

export type Algorithm = {
  key: string;
  name: string;
  year: string;
  author: string;
  color: string;
  tagline: string;
  overview: string;
  mechanism: string;
  strengths: string[];
  limitations: string[];
  applications: string[];
  traits: { speed: number; accuracy: number; categorical: number; tuning: number };
};

export const ALGORITHMS: Algorithm[] = [
  {
    key: "adaboost", name: "AdaBoost", year: "1995", author: "Freund & Schapire", color: "var(--orange)",
    tagline: "Re-weights misclassified samples each round.",
    overview: "The original practical boosting algorithm. Each learner focuses on examples the previous learners misclassified.",
    mechanism: "Sample weights increase for errors; each learner's vote is weighted by its accuracy α = ½·ln((1−ε)/ε).",
    strengths: ["Simple and interpretable", "Few hyperparameters", "Strong with decision stumps"],
    limitations: ["Sensitive to noisy labels and outliers", "Exponential loss only"],
    applications: ["Face detection (Viola–Jones)", "Baseline classification"],
    traits: { speed: 4, accuracy: 2, categorical: 1, tuning: 4 },
  },
  {
    key: "gbm", name: "Gradient Boosting", year: "2001", author: "J. Friedman", color: "var(--cyan)",
    tagline: "Fits each tree to the negative gradient of the loss.",
    overview: "Generalizes boosting to any differentiable loss by treating model fitting as gradient descent in function space.",
    mechanism: "At step m, compute pseudo-residuals rᵢ = −∂L/∂F(xᵢ), fit a tree hₘ to them, update F ← F + ν·hₘ.",
    strengths: ["Any differentiable loss", "Strong tabular performance", "Well understood theory"],
    limitations: ["Sequential, slow on large data", "Needs careful tuning of ν and depth"],
    applications: ["Ranking", "Regression", "Risk scoring"],
    traits: { speed: 2, accuracy: 3, categorical: 1, tuning: 3 },
  },
  {
    key: "xgboost", name: "XGBoost", year: "2016", author: "Chen & Guestrin", color: "var(--violet)",
    tagline: "Regularized, second-order, systems-optimized boosting.",
    overview: "Adds explicit regularization and a second-order Taylor expansion of the loss, plus engineering for scale.",
    mechanism: "Optimizes Σ L + Σ Ω(f), Ω = γT + ½λ‖w‖². Split gain uses gradient g and Hessian h sums.",
    strengths: ["Built-in L1/L2 regularization", "Sparse-aware missing value handling", "Parallel, distributed"],
    limitations: ["Many hyperparameters", "Memory heavy on wide data"],
    applications: ["Kaggle competitions", "Fraud detection", "Click-through prediction"],
    traits: { speed: 4, accuracy: 5, categorical: 2, tuning: 2 },
  },
  {
    key: "lightgbm", name: "LightGBM", year: "2017", author: "Microsoft", color: "var(--lime)",
    tagline: "Histogram-based, leaf-wise growth for speed.",
    overview: "Bins features into histograms and grows trees leaf-wise, with GOSS sampling and exclusive feature bundling.",
    mechanism: "Chooses the leaf with maximum loss reduction to split; GOSS keeps large-gradient samples.",
    strengths: ["Very fast training", "Low memory", "Handles large datasets"],
    limitations: ["Leaf-wise growth can overfit small data", "Sensitive to num_leaves"],
    applications: ["Large-scale ranking", "Real-time scoring"],
    traits: { speed: 5, accuracy: 5, categorical: 3, tuning: 3 },
  },
  {
    key: "catboost", name: "CatBoost", year: "2017", author: "Yandex", color: "var(--foreground)",
    tagline: "Ordered boosting with native categorical encoding.",
    overview: "Avoids target leakage with ordered target statistics and uses symmetric (oblivious) trees.",
    mechanism: "Permutation-driven ordered boosting; categorical features encoded with ordered target statistics.",
    strengths: ["Excellent categorical support", "Robust defaults", "Reduced prediction shift"],
    limitations: ["Slower training on CPU", "Smaller ecosystem"],
    applications: ["E-commerce", "Recommendation", "Tabular data with many categories"],
    traits: { speed: 3, accuracy: 5, categorical: 5, tuning: 5 },
  },
];

export const HYPERPARAMS = [
  { name: "n_estimators", default: "100", range: "50 – 5000", desc: "Number of boosting rounds (trees).", effect: "More trees reduce bias; with a high learning rate they can overfit.", risk: "over" },
  { name: "learning_rate", default: "0.1", range: "0.001 – 0.3", desc: "Shrinkage applied to each tree's contribution.", effect: "Lower values generalize better but require more trees.", risk: "both" },
  { name: "max_depth", default: "3", range: "2 – 12", desc: "Maximum depth of each individual tree.", effect: "Controls interaction order. Deep trees capture complex patterns.", risk: "over" },
  { name: "min_samples_split", default: "2", range: "2 – 100", desc: "Minimum samples required to split an internal node.", effect: "Higher values produce more conservative trees.", risk: "under" },
  { name: "min_samples_leaf", default: "1", range: "1 – 100", desc: "Minimum samples required in a leaf node.", effect: "Smooths predictions; regularizes leaf values.", risk: "under" },
  { name: "subsample", default: "1.0", range: "0.5 – 1.0", desc: "Fraction of rows sampled per tree (stochastic GB).", effect: "Values below 1 reduce variance and add randomness.", risk: "both" },
  { name: "colsample_bytree", default: "1.0", range: "0.3 – 1.0", desc: "Fraction of features sampled per tree (XGBoost).", effect: "Decorrelates trees, speeds up training.", risk: "both" },
  { name: "reg_alpha", default: "0", range: "0 – 10", desc: "L1 penalty on leaf weights (XGBoost).", effect: "Encourages sparse leaf weights.", risk: "under" },
  { name: "reg_lambda", default: "1", range: "0 – 10", desc: "L2 penalty on leaf weights (XGBoost).", effect: "Shrinks leaf weights toward zero; stabilizes splits.", risk: "under" },
] as const;

export const FEATURES = [
  { feature: "Payment History", gain: 0.31, weight: 0.18, cover: 0.24 },
  { feature: "Credit Score", gain: 0.24, weight: 0.21, cover: 0.22 },
  { feature: "Debt-to-Income Ratio", gain: 0.18, weight: 0.19, cover: 0.17 },
  { feature: "Annual Income", gain: 0.12, weight: 0.17, cover: 0.15 },
  { feature: "Loan Amount", gain: 0.09, weight: 0.15, cover: 0.13 },
  { feature: "Employment Length", gain: 0.06, weight: 0.1, cover: 0.09 },
];

export const MODEL_METRICS = [
  { model: "Logistic Regression", accuracy: 0.81, precision: 0.74, recall: 0.62, f1: 0.67, auc: 0.84 },
  { model: "Random Forest", accuracy: 0.85, precision: 0.79, recall: 0.68, f1: 0.73, auc: 0.89 },
  { model: "Gradient Boosting", accuracy: 0.87, precision: 0.81, recall: 0.72, f1: 0.76, auc: 0.91 },
  { model: "XGBoost", accuracy: 0.88, precision: 0.82, recall: 0.74, f1: 0.78, auc: 0.92 },
];

export const CREDIT_SAMPLE = [
  { id: 1001, credit_score: 712, annual_income: 68400, dti: 0.24, loan_amount: 15000, emp_length: 6, late_payments: 0, default: 0 },
  { id: 1002, credit_score: 598, annual_income: 41200, dti: 0.47, loan_amount: 22000, emp_length: 1, late_payments: 3, default: 1 },
  { id: 1003, credit_score: 765, annual_income: 102000, dti: 0.18, loan_amount: 30000, emp_length: 11, late_payments: 0, default: 0 },
  { id: 1004, credit_score: 644, annual_income: 53800, dti: 0.39, loan_amount: 9500, emp_length: 3, late_payments: 1, default: 0 },
  { id: 1005, credit_score: 581, annual_income: 36500, dti: 0.52, loan_amount: 18000, emp_length: 0, late_payments: 4, default: 1 },
];

// Synthetic training curves
export const LOSS_CURVE = Array.from({ length: 60 }, (_, i) => {
  const t = i + 1;
  const train = 0.08 + 0.6 * Math.exp(-t / 9);
  const val = 0.2 + 0.5 * Math.exp(-t / 10) + Math.max(0, (t - 28) * 0.0045);
  return { iter: t * 10, train: +train.toFixed(4), val: +val.toFixed(4) };
});

export const LR_ESTIMATORS = Array.from({ length: 30 }, (_, i) => {
  const n = (i + 1) * 20;
  const f = (lr: number) => 0.22 + 0.5 * Math.exp(-(n * lr) / 12) + (lr > 0.2 ? Math.max(0, (n - 150) * 0.0003 * lr * 4) : 0);
  return { n, "lr=0.01": +f(0.01).toFixed(3), "lr=0.1": +f(0.1).toFixed(3), "lr=0.3": +f(0.3).toFixed(3) };
});

export const COMPLEXITY_CURVE = Array.from({ length: 12 }, (_, i) => {
  const d = i + 1;
  return { depth: d, train: +(0.7 + 0.3 * (1 - Math.exp(-d / 3))).toFixed(3), val: +(0.7 + 0.2 * (1 - Math.exp(-d / 2.5)) - Math.max(0, (d - 5) * 0.018)).toFixed(3) };
});
