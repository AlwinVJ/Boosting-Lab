import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { CodeBlock, ConsoleOutput } from "@/components/lab/CodeBlock";
import { LearningRateChart } from "@/components/lab/charts";
import { ChartContainer, Container, DatasetPreview, MetricCard, PageHero, Pill, SectionHeader, Tabs } from "@/components/lab/primitives";
import { CREDIT_SAMPLE, HYPERPARAMS } from "@/data/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/implementation")({
  head: () => ({
    meta: [
      { title: "Implementation Lab — Boosting Lab" },
      { name: "description", content: "Scikit-learn and XGBoost implementations of boosting with configuration panels, outputs and a hyperparameter explorer." },
      { property: "og:title", content: "Implementation Lab — Boosting Lab" },
      { property: "og:description", content: "A workspace for boosting experiments in scikit-learn and XGBoost." },
    ],
  }),
  component: Page,
});

type K = "gbc" | "gbr" | "hgb" | "xgb";
const IMPLS: Record<K, { label: string; file: string; code: string; out: string[]; metrics: [string, string][] }> = {
  gbc: {
    label: "GradientBoostingClassifier", file: "gb_classifier.py",
    code: `from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=3,
    subsample=0.8,
    random_state=42,
)
model.fit(X_train, y_train)
proba = model.predict_proba(X_test)[:, 1]
print("ROC-AUC:", roc_auc_score(y_test, proba))`,
    out: ["fitting 300 estimators ...", "ROC-AUC: 0.91  (placeholder)"], metrics: [["Accuracy", "0.87"], ["ROC-AUC", "0.91"], ["Fit time", "4.2 s"]],
  },
  gbr: {
    label: "GradientBoostingRegressor", file: "gb_regressor.py",
    code: `from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error

model = GradientBoostingRegressor(
    loss="huber",
    n_estimators=500,
    learning_rate=0.05,
    max_depth=4,
)
model.fit(X_train, y_train)
rmse = mean_squared_error(y_test, model.predict(X_test)) ** 0.5
print("RMSE:", rmse)`,
    out: ["fitting 500 estimators ...", "RMSE: 3.84  (placeholder)"], metrics: [["RMSE", "3.84"], ["R²", "0.82"], ["Fit time", "6.1 s"]],
  },
  hgb: {
    label: "HistGradientBoostingClassifier", file: "hist_gb.py",
    code: `from sklearn.ensemble import HistGradientBoostingClassifier

model = HistGradientBoostingClassifier(
    max_iter=400,
    learning_rate=0.08,
    max_leaf_nodes=31,
    early_stopping=True,
    validation_fraction=0.1,
)
model.fit(X_train, y_train)  # handles NaN natively
print("iterations used:", model.n_iter_)`,
    out: ["early stopping triggered", "iterations used: 212  (placeholder)"], metrics: [["Accuracy", "0.88"], ["Iterations", "212"], ["Fit time", "0.9 s"]],
  },
  xgb: {
    label: "XGBoost", file: "xgb_train.py",
    code: `import xgboost as xgb

model = xgb.XGBClassifier(
    n_estimators=1000,
    learning_rate=0.05,
    max_depth=5,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,
    reg_lambda=1.0,
    eval_metric="auc",
    early_stopping_rounds=50,
)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=100)`,
    out: ["[0]    validation_0-auc:0.8412", "[100]  validation_0-auc:0.9134", "[287]  best iteration  (placeholder)"], metrics: [["ROC-AUC", "0.92"], ["Best iter", "287"], ["Fit time", "1.3 s"]],
  },
};

function Page() {
  const [tab, setTab] = useState<K>("gbc");
  const impl = IMPLS[tab];
  return (
    <>
      <PageHero crumbs={[{ label: "implementation" }]} eyebrow="Module 04" title="Implementation Lab" description="An experimentation workspace using scikit-learn and xgboost. Code is real; outputs are placeholders until execution is connected." />
      <Container className="py-16">
        <SectionHeader index="04" eyebrow="Workspace" title="Experiments" />
        <div className="border border-hairline">
          <Tabs<K> value={tab} onChange={setTab} tabs={(Object.keys(IMPLS) as K[]).map((k) => ({ value: k, label: IMPLS[k].label }))} />
          <div className="grid lg:grid-cols-[1fr_340px]">
            <div className="space-y-4 p-4 lg:border-r lg:border-hairline">
              <DatasetPreview name="credit_risk.csv" meta="5,000 × 8 · synthetic" rows={CREDIT_SAMPLE} />
              <CodeBlock code={impl.code} filename={impl.file} />
              <ConsoleOutput lines={impl.out} />
            </div>
            <aside className="p-4">
              <div className="eyebrow mb-3">Model configuration</div>
              <div className="space-y-4">
                {[["n_estimators", 300, 50, 1000], ["learning_rate", 5, 1, 30], ["max_depth", 3, 1, 10]].map(([n, v, min, max]) => (
                  <label key={n as string} className="block">
                    <div className="flex justify-between font-mono text-xs"><span>{n}</span><span className="text-violet">{n === "learning_rate" ? ((v as number) / 100).toFixed(2) : v}</span></div>
                    <input type="range" defaultValue={v as number} min={min as number} max={max as number} className="mt-2 w-full accent-[var(--violet)]" />
                  </label>
                ))}
                <button disabled className="w-full border border-violet/50 py-2 font-mono text-xs text-violet opacity-70">▶ run (coming soon)</button>
              </div>
              <div className="eyebrow mb-1 mt-8">Evaluation</div>
              <div className="border border-hairline">
                {impl.metrics.map(([l, v], i) => <div key={l} className={cn(i > 0 && "border-t border-hairline")}><MetricCard label={l} value={v} tone={(["violet", "cyan", "lime"] as const)[i] ?? "violet"} /></div>)}
              </div>
            </aside>
          </div>
        </div>
      </Container>
      <Container>
        <SectionHeader index="05" eyebrow="Hyperparameter tuning" title="Parameter explorer" description="Expand a parameter to see its role, defaults and over/underfitting implications." />
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="border-t border-hairline">{HYPERPARAMS.map((p) => <ParamRow key={p.name} p={p} />)}</div>
          <ChartContainer title="learning_rate × n_estimators" subtitle="validation loss vs number of trees" className="h-fit lg:sticky lg:top-24"><LearningRateChart /></ChartContainer>
        </div>
      </Container>
    </>
  );
}

function ParamRow({ p }: { p: (typeof HYPERPARAMS)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-hairline">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 py-4 text-left hover:text-violet">
        <span className="font-mono text-sm">{p.name}</span>
        <span className="flex items-center gap-3"><Pill>default {p.default}</Pill><ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} /></span>
      </button>
      {open && (
        <div className="grid gap-3 pb-5 text-sm text-muted-foreground sm:grid-cols-2">
          <p>{p.desc}</p>
          <div className="space-y-2"><p>{p.effect}</p><div className="flex gap-2"><Pill tone="cyan">range {p.range}</Pill>{p.risk !== "under" && <Pill tone="orange">overfit risk ↑</Pill>}{p.risk !== "over" && <Pill tone="lime">regularizes</Pill>}</div></div>
        </div>
      )}
    </div>
  );
}
