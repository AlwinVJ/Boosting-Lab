import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { ALGORITHMS, MODULES, type Algorithm } from "@/data/content";
import { cn } from "@/lib/utils";

/** Horizontal learning journey rail. */
export function LearningModule() {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative grid min-w-[1100px] grid-cols-6">
        <div className="absolute left-0 right-0 top-[7px] h-px bg-hairline" />
        {MODULES.map((m) => (
          <Link key={m.id} to={m.to} className="group relative pr-6">
            <span className="relative z-10 flex size-[15px] items-center justify-center border border-hairline bg-background transition-colors group-hover:border-violet">
              <span className="size-1.5 bg-muted-foreground transition-colors group-hover:bg-violet" />
            </span>
            <div className="mt-6 font-mono text-xs text-muted-foreground">{m.id} · {m.time}</div>
            <div className="mt-2 flex items-start gap-1 font-display text-lg font-medium leading-snug transition-colors group-hover:text-violet">
              {m.title}<ArrowUpRight size={14} className="mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <ul className="mt-3 space-y-1">
              {m.topics.map((t) => <li key={t} className="text-[13px] text-muted-foreground">— {t}</li>)}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TraitBar({ v, color }: { v: number; color: string }) {
  return <span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <i key={i} className="h-2.5 w-2" style={{ background: i <= v ? color : "var(--hairline)" }} />)}</span>;
}

export function AlgorithmCard({ a, active, onClick }: { a: Algorithm; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn("group relative w-full border-b border-hairline px-4 py-4 text-left transition-colors hover:bg-surface", active && "bg-surface")}>
      {active && <motion.span layoutId="algo-active" className="absolute inset-y-0 left-0 w-0.5" style={{ background: a.color }} />}
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2.5 font-display text-lg font-medium">
          <span className="size-2" style={{ background: a.color }} />{a.name}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{a.year}</span>
      </div>
      <p className="mt-1 pl-[18px] text-[13px] text-muted-foreground">{a.tagline}</p>
    </button>
  );
}

/** Master-detail algorithm comparison. */
export function AlgorithmExplorer({ detailed = false }: { detailed?: boolean }) {
  const [sel, setSel] = useState(2);
  const a = ALGORITHMS[sel]!;
  return (
    <div className="grid border border-hairline md:grid-cols-[320px_1fr]">
      <div className="border-b border-hairline md:border-b-0 md:border-r">
        {ALGORITHMS.map((x, i) => <AlgorithmCard key={x.key} a={x} active={i === sel} onClick={() => setSel(i)} />)}
      </div>
      <motion.div key={a.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="p-6 md:p-8">
        <div className="eyebrow">{a.author} · {a.year}</div>
        <h3 className="mt-2 text-3xl font-semibold">{a.name}</h3>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{a.overview}</p>
        <div className="mt-6 border-l-2 bg-background/40 px-4 py-3 font-mono text-[13px] leading-relaxed" style={{ borderColor: a.color }}>{a.mechanism}</div>
        <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {([["Training speed", a.traits.speed], ["Typical accuracy", a.traits.accuracy], ["Categorical support", a.traits.categorical], ["Ease of tuning", a.traits.tuning]] as const).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-hairline pb-2 text-sm">
              <span className="text-muted-foreground">{k}</span><TraitBar v={v} color={a.color} />
            </div>
          ))}
        </div>
        {detailed && (
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {([["Strengths", a.strengths, "text-lime"], ["Limitations", a.limitations, "text-orange"], ["Applications", a.applications, "text-cyan"]] as const).map(([t, items, c]) => (
              <div key={t}>
                <div className={cn("eyebrow", c)}>{t}</div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">{items.map((s) => <li key={s}>— {s}</li>)}</ul>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
