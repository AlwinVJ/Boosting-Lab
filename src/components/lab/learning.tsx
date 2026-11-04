import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { ALGORITHMS, type Algorithm } from "@/data/content";
import { CURRICULUM_MODULES } from "@/data/curriculum";
import { cn } from "@/lib/utils";

/** Responsive curriculum overview grid displaying all 9 modules with full topic lists and metadata. */
export function LearningModule() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {CURRICULUM_MODULES.map((m) => {
        const durationFormatted = m.time.replace(" h", " HOURS").toUpperCase();
        const difficultyBadgeClass =
          m.difficulty === "Beginner"
            ? "border-cyan/40 bg-cyan/5 text-cyan"
            : m.difficulty === "Intermediate"
            ? "border-violet/40 bg-violet/5 text-violet"
            : "border-orange/40 bg-orange/5 text-orange";

        return (
          <Link
            key={m.id}
            to={m.to}
            className="group panel relative flex flex-col justify-between p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:border-violet/60 hover:bg-surface-2/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
          >
            <div>
              {/* Header metadata row: Module number, duration, difficulty badge */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-violet">
                    MODULE {m.number}
                  </span>
                  <span className="text-hairline">|</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {durationFormatted}
                  </span>
                </div>
                <span className={cn("border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", difficultyBadgeClass)}>
                  {m.difficulty}
                </span>
              </div>

              {/* Module Title */}
              <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-violet">
                {m.title}
              </h3>

              {/* Tagline / Brief Description */}
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {m.tagline}
              </p>

              {/* Topics Covered */}
              <div className="mt-6 border-t border-hairline pt-4">
                <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Topics:
                </div>
                <ul className="mt-2.5 space-y-2">
                  {m.topics.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground/80">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet/60 transition-colors group-hover:bg-violet" />
                      <span className="break-words">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom action prompt */}
            <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4 font-mono text-xs text-muted-foreground transition-colors group-hover:text-violet">
              <span>Explore Module {m.number}</span>
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        );
      })}
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
