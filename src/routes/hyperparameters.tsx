import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Sliders, Sparkles } from "lucide-react";
import { Container, PageHero, Pill, SectionHeader, SectionIndex, ChartContainer } from "@/components/lab/primitives";
import { LearningRateChart, OverfittingChart } from "@/components/lab/charts";
import { KeyTakeaway, WarningCallout } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hyperparameters")({
  head: () => ({
    meta: [
      { title: "Hyperparameter Tuning for Boosting — Boosting Lab" },
      { name: "description", content: "Master hyperparameter tuning for Gradient Boosting and XGBoost: learning rates, tree depth, regularization, GridSearchCV, and Optuna." },
      { property: "og:title", content: "Hyperparameter Tuning for Boosting — Boosting Lab" },
      { property: "og:description", content: "Comprehensive practical and theoretical guide to tuning boosting hyperparameters." },
    ],
  }),
  component: HyperparametersPage,
});

interface HyperparamDef {
  name: string;
  algo: "GBM" | "XGBoost" | "Both";
  defaultVal: string;
  range: string;
  type: "Capacity" | "Regularization" | "Sampling" | "Optimization";
  desc: string;
  impact: string;
  guideline: string;
}

const ALL_PARAMS: HyperparamDef[] = [
  {
    name: "learning_rate (η / ν)",
    algo: "Both",
    defaultVal: "0.1",
    range: "0.005 – 0.3",
    type: "Optimization",
    desc: "Shrinkage factor applied to each tree's contribution before adding to the ensemble.",
    impact: "Lower values (0.01 – 0.05) yield superior generalization but require proportionally higher n_estimators.",
    guideline: "Set to 0.05 or 0.02 early in development and pair with early stopping.",
  },
  {
    name: "n_estimators",
    algo: "Both",
    defaultVal: "100",
    range: "100 – 5000",
    type: "Capacity",
    desc: "Total number of sequential boosting iterations (trees).",
    impact: "Too few trees leads to underfitting; too many trees paired with high learning rate causes overfitting.",
    guideline: "Do not tune in isolation. Fix learning rate small and use early_stopping_rounds on validation loss.",
  },
  {
    name: "max_depth",
    algo: "Both",
    defaultVal: "3 (GBM) / 6 (XGB)",
    range: "2 – 10",
    type: "Capacity",
    desc: "Maximum depth of individual decision trees. Directly controls feature interaction order.",
    impact: "Depth d captures interactions between up to d features. Deep trees (d > 8) quickly memorize noise.",
    guideline: "Start with depth 3 to 5 for tabular datasets. Rarely exceed 8 unless signal is highly interactive.",
  },
  {
    name: "min_child_weight",
    algo: "XGBoost",
    defaultVal: "1",
    range: "1 – 20",
    type: "Regularization",
    desc: "Minimum sum of instance weight (Hessian) needed in a child node.",
    impact: "Higher values prevent trees from splitting down to single outlier instances.",
    guideline: "In imbalanced classification, increase to 3–10 to avoid creating leaves dominated by rare noise.",
  },
  {
    name: "gamma (γ / min_split_loss)",
    algo: "XGBoost",
    defaultVal: "0.0",
    range: "0.0 – 5.0",
    type: "Regularization",
    desc: "Minimum loss reduction required to make a further partition on a leaf node.",
    impact: "Acts as an explicit pruning threshold. Splits yielding gain < γ are pruned.",
    guideline: "Start at 0; increase to 0.1–1.0 if training loss drops much faster than validation loss.",
  },
  {
    name: "subsample",
    algo: "Both",
    defaultVal: "1.0",
    range: "0.5 – 1.0",
    type: "Sampling",
    desc: "Fraction of observations randomly sampled (without replacement) to train each tree.",
    impact: "Values < 1.0 introduce stochasticity (Stochastic Gradient Boosting), reducing variance and speeding up runtime.",
    guideline: "A value of 0.8 is standard practice across Kaggle and production pipelines.",
  },
  {
    name: "colsample_bytree",
    algo: "XGBoost",
    defaultVal: "1.0",
    range: "0.4 – 1.0",
    type: "Sampling",
    desc: "Subsample ratio of features (columns) when constructing each tree.",
    impact: "Prevents a few dominant features from dictating every single tree split, encouraging ensemble diversity.",
    guideline: "Values between 0.6 and 0.8 improve test stability significantly on datasets with > 20 features.",
  },
  {
    name: "reg_alpha (L1) & reg_lambda (L2)",
    algo: "XGBoost",
    defaultVal: "α=0, λ=1",
    range: "0.0 – 10.0",
    type: "Regularization",
    desc: "L1 and L2 penalty coefficients on leaf weights.",
    impact: "reg_alpha encourages sparsity (zeroing leaf weights); reg_lambda smooths extreme weights toward zero.",
    guideline: "Increase reg_lambda (e.g. 2–10) when predictions have high variance or in collinear feature sets.",
  },
];

const SECTIONS = [
  { id: "overview", label: "1. Overview & Strategy" },
  { id: "parameter-glossary", label: "2. Parameter Glossary" },
  { id: "interaction-effects", label: "3. Interaction Effects" },
  { id: "optimization-methods", label: "4. Search Strategies" },
  { id: "optuna-code", label: "5. Bayesian Tuning (Optuna)" },
  { id: "quiz", label: "6. Knowledge Check" },
];

function HyperparametersPage() {
  const [filter, setFilter] = useState<string>("All");
  const [openParam, setOpenParam] = useState<string | null>("learning_rate (η / ν)");

  const filteredParams = ALL_PARAMS.filter(
    (p) => filter === "All" || p.algo === filter || p.algo === "Both"
  );

  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "hyperparameters" }]}
        eyebrow="Module 07 — Model Optimization"
        title="Hyperparameter Tuning & Optimization"
        description="Master the critical control parameters that balance capacity, learning dynamics, and regularization in Gradient Boosting and XGBoost."
      />
      <SectionIndex items={SECTIONS} />

      <Container className="py-20">
        <SectionHeader
          id="overview"
          index="01"
          eyebrow="Strategic Framework"
          title="The Systematic Tuning Protocol"
          description="Do not run brute-force GridSearch over 10 parameters simultaneously: the Cartesian explosion is prohibitively expensive and sub-optimal."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <KeyTakeaway
            title="The Recommended 4-Stage Tuning Pipeline"
            points={[
              "Phase 1 — Baseline & Learning Rate: Fix learning_rate = 0.05 or 0.1, set n_estimators high (e.g. 1000), and calibrate baseline performance with early_stopping_rounds = 50.",
              "Phase 2 — Tree Architecture: Tune tree-specific parameters that dictate capacity: max_depth (3 to 8) and min_child_weight (1 to 10).",
              "Phase 3 — Stochastic Sampling: Tune subsample (0.6 to 0.9) and colsample_bytree (0.5 to 0.9) to add diversity and decorrelate trees.",
              "Phase 4 — Regularization: If gap between train and validation persists, introduce gamma (0.1 to 1.0) and reg_lambda (1.0 to 10.0).",
              "Phase 5 — Final Refinement: Lower learning_rate to 0.01 or 0.02 and let n_estimators scale up with early stopping.",
            ]}
          />
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="parameter-glossary"
          index="02"
          eyebrow="Interactive Directory"
          title="Boosting Hyperparameters Directory"
          description="Filter and inspect each parameter's mathematical role, default values, and impact on under/overfitting."
        />
        <div className="max-w-4xl md:ml-[136px]">
          <div className="mb-6 flex gap-2">
            {["All", "XGBoost", "GBM"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "rounded px-3 py-1 font-mono text-xs transition-colors",
                  filter === tab
                    ? "bg-violet text-primary-foreground font-semibold"
                    : "border border-hairline text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="divide-y divide-hairline rounded border border-hairline bg-surface">
            {filteredParams.map((p) => {
              const isOpen = openParam === p.name;
              return (
                <div key={p.name} className="transition-colors hover:bg-surface-2/30">
                  <button
                    onClick={() => setOpenParam(isOpen ? null : p.name)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {p.name}
                      </span>
                      <Pill tone="cyan">{p.algo}</Pill>
                      <Pill tone="muted">{p.type}</Pill>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        default: <span className="text-foreground">{p.defaultVal}</span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "text-muted-foreground transition-transform",
                          isOpen && "rotate-180 text-violet"
                        )}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="grid gap-3 border-t border-hairline/60 bg-surface-2/40 p-4 text-xs sm:grid-cols-2">
                      <div>
                        <div className="font-mono text-muted-foreground">Description:</div>
                        <p className="mt-1 text-foreground leading-relaxed">{p.desc}</p>
                        <div className="mt-3 font-mono text-cyan">Typical Search Range: {p.range}</div>
                      </div>
                      <div>
                        <div className="font-mono text-muted-foreground">Practical Impact & Tuning Rule:</div>
                        <p className="mt-1 text-foreground leading-relaxed">{p.impact}</p>
                        <div className="mt-2 rounded bg-background/50 p-2 text-lime font-mono">
                          Tip: {p.guideline}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="interaction-effects"
          index="03"
          eyebrow="Key Dynamics"
          title="Critical Hyperparameter Interactions"
          description="Hyperparameters in boosting do not act in isolation. Understanding their paired interactions is key to mastering tuning."
        />
        <div className="grid gap-8 md:ml-[136px] lg:grid-cols-2">
          <ChartContainer
            title="Interaction: Learning Rate × n_estimators"
            subtitle="Validation loss trajectories under different shrinkage factors"
          >
            <LearningRateChart />
          </ChartContainer>

          <ChartContainer
            title="Interaction: Tree Depth × Overfitting Gap"
            subtitle="Training vs. Validation Accuracy as max_depth scales"
          >
            <OverfittingChart />
          </ChartContainer>
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="optimization-methods"
          index="04"
          eyebrow="Tooling & Strategy"
          title="Grid vs. Random vs. Bayesian Search"
        />
        <div className="max-w-4xl space-y-4 md:ml-[136px]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-base font-semibold">GridSearchCV</div>
              <div className="mt-1 font-mono text-[11px] text-orange">Exhaustive / Inefficient</div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Evaluates every combination on a grid. Suffers severely from the curse of dimensionality. If 5 parameters have 4 values each, that is 4⁵ = 1,024 model fits.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-base font-semibold">RandomizedSearchCV</div>
              <div className="mt-1 font-mono text-[11px] text-cyan">Stochastic / Effective</div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Samples N random configurations from continuous probability distributions. Bergstra & Bengio showed it explores continuous spaces vastly better than grid search with 1/10th the compute.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-base font-semibold">Bayesian (Optuna / Hyperopt)</div>
              <div className="mt-1 font-mono text-[11px] text-lime">Adaptive / State of the Art</div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Builds a surrogate model (Tree-structured Parzen Estimator) of the objective function. Focuses future trial evaluations in promising regions of the hyperparameter space.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeader
          id="optuna-code"
          index="05"
          eyebrow="Production Python"
          title="Bayesian Optimization with Optuna"
          description="Complete, reproducible Python script optimizing an XGBoost model using Optuna."
        />
        <div className="max-w-4xl space-y-4 md:ml-[136px]">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
              <span>optuna_xgboost_tuning.py</span>
              <span className="text-cyan">Python 3.10+</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`import optuna
import xgboost as xgb
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score
import numpy as np

def objective(trial):
    # 1. Define hyperparameter search distributions
    params = {
        "n_estimators": 800,
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.1, log=True),
        "max_depth": trial.suggest_int("max_depth", 3, 8),
        "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
        "gamma": trial.suggest_float("gamma", 0.0, 2.0),
        "subsample": trial.suggest_float("subsample", 0.6, 0.95),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 0.95),
        "reg_alpha": trial.suggest_float("reg_alpha", 1e-3, 10.0, log=True),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-3, 10.0, log=True),
        "random_state": 42,
        "eval_metric": "auc",
        "early_stopping_rounds": 40,
    }

    # 2. Evaluate with Stratified 5-Fold Cross-Validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    auc_scores = []

    for train_idx, val_idx in cv.split(X, y):
        X_tr, X_va = X[train_idx], X[val_idx]
        y_tr, y_va = y[train_idx], y[val_idx]

        model = xgb.XGBClassifier(**params)
        model.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], verbose=False)

        val_preds = model.predict_proba(X_va)[:, 1]
        auc_scores.append(roc_auc_score(y_va, val_preds))

    return np.mean(auc_scores)

# 3. Create study and optimize for 50 trials
study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=50)

print(f"Best Trial ROC-AUC: {study.best_value:.4f}")
print("Optimal Parameters:")
for k, v in study.best_params.items():
    print(f"  {k}: {v}")`}
            </pre>
          </div>
        </div>
      </Container>

      <Container className="pb-24">
        <SectionHeader
          id="quiz"
          index="06"
          eyebrow="Assessment"
          title="Knowledge Check"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <QuizBlock
            title="Hyperparameter Tuning Quiz"
            questions={[
              {
                id: "q1",
                question: "What is the primary danger of using a very small learning rate (e.g., 0.001) with too few estimators (e.g., n_estimators=50)?",
                options: [
                  "Severe catastrophic overfitting",
                  "Underfitting: the ensemble has taken 50 tiny steps and has not had enough iterations to reach the optimal loss valley",
                  "Numerical overflow in Hessian calculation",
                  "The algorithm reverts to random guessing",
                ],
                correctIndex: 1,
                explanation: "With a tiny shrinkage factor (0.001), 50 trees will barely nudge predictions away from the initial constant. Learning rate and n_estimators are inversely linked: lowering the learning rate requires a proportional increase in n_estimators.",
              },
              {
                id: "q2",
                question: "Why is RandomizedSearchCV almost always preferred over GridSearchCV when tuning 6 or more boosting parameters?",
                options: [
                  "GridSearchCV cannot handle floating-point parameters",
                  "RandomizedSearchCV tests unique values across continuous dimensions rather than wasting evaluations testing identical coordinates on unimportant dimensions",
                  "GridSearchCV is mathematically incompatible with XGBoost",
                  "RandomizedSearchCV guarantees finding the global optimum",
                ],
                correctIndex: 1,
                explanation: "In any machine learning model, some parameters are far more influential than others (e.g. learning_rate and depth vs reg_alpha). Grid search wastes dozens of trials repeating identical values of the important parameters, while random search explores distinct values on every single trial.",
              },
              {
                id: "q3",
                question: "Which parameter should be tuned first when an XGBoost model exhibits severe overfitting (100% train accuracy, 75% validation accuracy)?",
                options: [
                  "Increase learning rate to 0.5",
                  "Reduce max_depth (e.g. from 8 down to 3 or 4) and increase min_child_weight",
                  "Increase n_estimators to 5,000",
                  "Disable subsampling",
                ],
                correctIndex: 1,
                explanation: "Deep trees allow complex multi-variable interactions that memorize individual noisy instances. Restricting max_depth and increasing min_child_weight directly constrains tree capacity and eliminates brittle, low-sample leaf partitions.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
