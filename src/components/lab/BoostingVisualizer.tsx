import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// Tiny real gradient boosting with decision stumps on a 1D toy dataset (squared loss).
const N = 40;
const DATA = Array.from({ length: N }, (_, i) => {
  const x = i / (N - 1);
  const noise = Math.sin(i * 12.9898) * 0.12;
  return { x, y: Math.sin(x * Math.PI * 2) * 0.75 + x * 0.4 + noise };
});

function fitStump(res: number[]) {
  let best = { s: 0.5, l: 0, r: 0, err: Infinity };
  for (let k = 1; k < N; k++) {
    const s = (DATA[k - 1]!.x + DATA[k]!.x) / 2;
    const L = res.slice(0, k), R = res.slice(k);
    const l = L.reduce((a, b) => a + b, 0) / L.length;
    const r = R.reduce((a, b) => a + b, 0) / R.length;
    const err = L.reduce((a, v) => a + (v - l) ** 2, 0) + R.reduce((a, v) => a + (v - r) ** 2, 0);
    if (err < best.err) best = { s, l, r, err };
  }
  return best;
}

function boost(rounds: number, lr = 0.7) {
  const mean = DATA.reduce((a, d) => a + d.y, 0) / N;
  let F = DATA.map(() => mean);
  const history = [F.slice()];
  for (let m = 0; m < rounds; m++) {
    const res = DATA.map((d, i) => d.y - F[i]!);
    const st = fitStump(res);
    F = F.map((f, i) => f + lr * (DATA[i]!.x < st.s ? st.l : st.r));
    history.push(F.slice());
  }
  return history;
}

const STAGES = [
  { key: "w1", label: "Weak learner 1", short: "h₁", desc: "A single split. Underfits the signal.", round: 1, showRes: false },
  { key: "e1", label: "Residual errors", short: "r₁", desc: "Errors y − F₁(x) become the next target.", round: 1, showRes: true },
  { key: "w2", label: "Learner 2 corrects", short: "h₂", desc: "Fits residuals; F₂ = F₁ + ν·h₂.", round: 2, showRes: true },
  { key: "w3", label: "Learner 3 refines", short: "h₃", desc: "Smaller residuals, finer correction.", round: 4, showRes: true },
  { key: "ens", label: "Final ensemble", short: "F_M", desc: "Sum of 40 shrunken weak learners.", round: 40, showRes: false },
];

const W = 520, H = 300, P = 24;
const sx = (x: number) => P + x * (W - 2 * P);
const sy = (y: number) => H / 2 - y * (H / 2 - P) / 1.3;

export function BoostingVisualizer({ autoplay = true }: { autoplay?: boolean }) {
  const history = useMemo(() => boost(40), []);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(autoplay);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2600);
    return () => clearInterval(t);
  }, [playing]);

  const st = STAGES[stage]!;
  const F = history[st.round]!;
  const path = F.map((f, i) => `${i === 0 ? "M" : "L"}${sx(DATA[i]!.x).toFixed(1)},${sy(f).toFixed(1)}`).join(" ");
  const mse = F.reduce((a, f, i) => a + (DATA[i]!.y - f) ** 2, 0) / N;

  return (
    <div className="panel glow-violet overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5 font-mono text-[11px]">
        <span className="text-muted-foreground">boosting.sequence <span className="text-foreground">// round {st.round}</span></span>
        <div className="flex items-center gap-4">
          <span>MSE <span className="tabular-nums text-cyan">{mse.toFixed(4)}</span></span>
          <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} className="text-muted-foreground hover:text-foreground">
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Boosting fit improving over rounds">
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={sx(g)} x2={sx(g)} y1={P} y2={H - P} stroke="var(--hairline)" />)}
        <line x1={P} x2={W - P} y1={sy(0)} y2={sy(0)} stroke="var(--hairline)" />
        {st.showRes && DATA.map((d, i) => (
          <motion.line key={`r${i}`} x1={sx(d.x)} x2={sx(d.x)} initial={false} animate={{ y1: sy(d.y), y2: sy(F[i]!) }} transition={{ duration: 0.6 }} stroke="var(--orange)" strokeWidth={1.2} opacity={0.8} />
        ))}
        {DATA.map((d, i) => <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r={3} fill="var(--foreground)" opacity={0.85} />)}
        <motion.path initial={false} animate={{ d: path }} transition={{ duration: 0.7, ease: "easeInOut" }} fill="none" stroke={stage === 4 ? "var(--lime)" : "var(--violet)"} strokeWidth={2.2} />
      </svg>

      <div className="border-t border-hairline px-4 py-3">
        <div className="text-sm"><span className="font-display font-medium">{st.label}.</span> <span className="text-muted-foreground">{st.desc}</span></div>
      </div>

      <div className="grid grid-cols-5 border-t border-hairline">
        {STAGES.map((s, i) => (
          <button key={s.key} onClick={() => { setStage(i); setPlaying(false); }}
            className={cn("relative flex flex-col items-start gap-1 border-r border-hairline px-3 py-3 text-left last:border-r-0 transition-colors hover:bg-surface-2", i === stage && "bg-surface-2")}>
            <span className={cn("font-mono text-xs", i === stage ? (i === 4 ? "text-lime" : "text-violet") : "text-muted-foreground")}>{s.short}</span>
            <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">{s.label}</span>
            {i < 4 && <svg className="absolute -right-[7px] top-1/2 z-10 -translate-y-1/2" width="12" height="12" viewBox="0 0 12 12"><path d="M2 2 L8 6 L2 10" stroke={i < stage ? "var(--violet)" : "var(--muted-foreground)"} fill="var(--background)" strokeWidth="1.3" /></svg>}
            {i === stage && <motion.span layoutId="stage-bar" className="absolute inset-x-0 top-0 h-0.5 bg-violet" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Generic animated node flow: A → B → C with traveling pulse. */
export function InteractiveDiagram({ nodes }: { nodes: { label: string; sub?: string; tone?: "violet" | "cyan" | "orange" | "lime" | "muted" }[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % nodes.length), 1400);
    return () => clearInterval(t);
  }, [nodes.length]);
  const toneBorder = { violet: "border-violet text-violet", cyan: "border-cyan text-cyan", orange: "border-orange text-orange", lime: "border-lime text-lime", muted: "border-muted-foreground text-foreground" };
  return (
    <div className="panel overflow-x-auto p-6">
      <div className="flex min-w-max items-center">
        {nodes.map((n, i) => (
          <div key={i} className="flex items-center">
            <button onMouseEnter={() => setActive(i)} className={cn("w-36 border px-3 py-3 text-left transition-all duration-300", i <= active ? toneBorder[n.tone ?? "violet"] : "border-hairline text-muted-foreground", i === active && "bg-surface-2")}>
              <div className="font-mono text-[10px] opacity-70">{String(i).padStart(2, "0")}</div>
              <div className="mt-1 font-display text-sm font-medium">{n.label}</div>
              {n.sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{n.sub}</div>}
            </button>
            {i < nodes.length - 1 && (
              <div className="relative mx-1 h-px w-10 bg-hairline">
                {i < active && <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="absolute inset-0 origin-left bg-violet" />}
                <span className="absolute -right-0.5 -top-[3px] size-0 border-y-[3.5px] border-l-[5px] border-y-transparent border-l-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
