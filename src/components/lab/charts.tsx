import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { COMPLEXITY_CURVE, FEATURES, LOSS_CURVE, LR_ESTIMATORS, MODEL_METRICS } from "@/data/content";
import { Tabs } from "./primitives";

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, fontFamily: "JetBrains Mono", tickLine: false };
const tooltipStyle = {
  contentStyle: { background: "var(--surface-2)", border: "1px solid var(--hairline)", borderRadius: 2, fontFamily: "JetBrains Mono", fontSize: 12 },
  labelStyle: { color: "var(--muted-foreground)" },
  itemStyle: { color: "var(--foreground)" },
  cursor: { stroke: "var(--hairline)", fill: "var(--hairline)" },
};
const legend = { wrapperStyle: { fontFamily: "JetBrains Mono", fontSize: 11 } };

export function EarlyStoppingChart() {
  const best = LOSS_CURVE.reduce((b, d) => (d.val < b.val ? d : b));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={LOSS_CURVE} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="var(--hairline)" vertical={false} />
        <XAxis dataKey="iter" {...axis} />
        <YAxis {...axis} domain={[0, 0.8]} />
        <Tooltip {...tooltipStyle} />
        <Legend {...legend} />
        <ReferenceLine x={best.iter} stroke="var(--orange)" strokeDasharray="4 4" label={{ value: `stop @ ${best.iter}`, fill: "var(--orange)", fontSize: 11, fontFamily: "JetBrains Mono", position: "insideTopRight" }} />
        <Line type="monotone" dataKey="train" name="training loss" stroke="var(--cyan)" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="val" name="validation loss" stroke="var(--violet)" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function OverfittingChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={COMPLEXITY_CURVE} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="var(--hairline)" vertical={false} />
        <XAxis dataKey="depth" {...axis} label={{ value: "max_depth", position: "insideBottomRight", fill: "var(--muted-foreground)", fontSize: 10, dy: 8 }} />
        <YAxis {...axis} domain={[0.6, 1]} />
        <Tooltip {...tooltipStyle} />
        <Legend {...legend} />
        <ReferenceLine x={5} stroke="var(--lime)" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="train" name="train accuracy" stroke="var(--cyan)" strokeWidth={2} dot={{ r: 2 }} />
        <Line type="monotone" dataKey="val" name="validation accuracy" stroke="var(--orange)" strokeWidth={2} dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function LearningRateChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={LR_ESTIMATORS} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="var(--hairline)" vertical={false} />
        <XAxis dataKey="n" {...axis} />
        <YAxis {...axis} domain={[0.1, 0.8]} />
        <Tooltip {...tooltipStyle} />
        <Legend {...legend} />
        <Line type="monotone" dataKey="lr=0.01" stroke="var(--cyan)" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="lr=0.1" stroke="var(--violet)" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="lr=0.3" stroke="var(--orange)" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

type Imp = "gain" | "weight" | "cover";
export function FeatureImportanceChart() {
  const [kind, setKind] = useState<Imp>("gain");
  const data = [...FEATURES].sort((a, b) => b[kind] - a[kind]);
  return (
    <div>
      <Tabs<Imp> value={kind} onChange={setKind} tabs={[{ value: "gain", label: "gain" }, { value: "weight", label: "weight" }, { value: "cover", label: "cover" }]} />
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 16, right: 24, left: 40, bottom: 0 }}>
          <CartesianGrid stroke="var(--hairline)" horizontal={false} />
          <XAxis type="number" {...axis} />
          <YAxis type="category" dataKey="feature" {...axis} width={130} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey={kind} fill={kind === "gain" ? "var(--violet)" : kind === "weight" ? "var(--cyan)" : "var(--lime)"} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ModelComparisonChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={MODEL_METRICS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="var(--hairline)" vertical={false} />
        <XAxis dataKey="model" {...axis} tickFormatter={(v: string) => v.split(" ").map((w) => w[0]).join("")} />
        <YAxis {...axis} domain={[0.5, 1]} />
        <Tooltip {...tooltipStyle} />
        <Legend {...legend} />
        <Bar dataKey="f1" name="F1" fill="var(--cyan)" />
        <Bar dataKey="auc" name="ROC-AUC" fill="var(--violet)" />
        <Bar dataKey="recall" name="Recall" fill="var(--orange)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Successive trees improving predictions (stacked residual reduction). */
export function ResidualDecayChart() {
  const data = Array.from({ length: 10 }, (_, i) => ({ tree: `T${i + 1}`, residual: +(0.9 * Math.exp(-i / 2.6) + 0.05).toFixed(3) }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="var(--hairline)" vertical={false} />
        <XAxis dataKey="tree" {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="residual" name="mean |residual|" fill="var(--violet)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
