import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({ index, eyebrow, title, description, id }: { index?: string; eyebrow?: string; title: string; description?: string; id?: string }) {
  return (
    <div id={id} className="mb-10 grid scroll-mt-24 gap-4 border-t border-hairline pt-6 md:grid-cols-[120px_1fr]">
      <div className="font-mono text-xs text-violet">{index ?? "—"}</div>
      <div className="max-w-3xl">
        {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
        <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export function PageHero({ crumbs, eyebrow, title, description, children }: { crumbs: { label: string; to?: string }[]; eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div className="lab-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-10">
        <BreadcrumbNavigation crumbs={crumbs} />
        <div className="eyebrow mt-12">{eyebrow}</div>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>
        {children}
      </div>
    </section>
  );
}

export function BreadcrumbNavigation({ crumbs }: { crumbs: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
      <Link to="/" className="hover:text-foreground">lab</Link>
      {crumbs.map((c) => (
        <span key={c.label} className="flex items-center gap-1.5">
          <ChevronRight size={12} />
          {c.to ? <Link to={c.to} className="hover:text-foreground">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/** Expandable explanation block. */
export function ConceptPanel({ index, title, summary, children, defaultOpen = false }: { index?: string; title: string; summary: string; children?: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-hairline">
      <button onClick={() => setOpen((o) => !o)} className="group grid w-full grid-cols-[48px_1fr_24px] items-start gap-4 py-6 text-left">
        <span className="pt-1 font-mono text-xs text-muted-foreground">{index}</span>
        <span>
          <span className="block font-display text-xl font-medium transition-colors group-hover:text-violet">{title}</span>
          <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">{summary}</span>
        </span>
        <ChevronDown size={18} className={cn("mt-1 text-muted-foreground transition-transform", open && "rotate-180 text-violet")} />
      </button>
      {open && children && <div className="grid grid-cols-[48px_1fr] gap-4 pb-8"><span /><div className="text-[15px] leading-relaxed text-muted-foreground">{children}</div></div>}
    </div>
  );
}

/** Math notation placeholder — ready to be swapped for KaTeX rendering. */
export function MathematicalExplanation({ label, formula, terms, note }: { label: string; formula: string; terms?: [string, string][]; note?: string }) {
  return (
    <figure className="border-l-2 border-violet bg-surface px-6 py-5">
      <figcaption className="eyebrow mb-3">{label}</figcaption>
      <div className="overflow-x-auto font-mono text-lg text-foreground md:text-xl">{formula}</div>
      {terms && (
        <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {terms.map(([k, v]) => (
            <div key={k} className="flex gap-3"><dt className="min-w-12 font-mono text-cyan">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>
          ))}
        </dl>
      )}
      {note && <p className="mt-4 font-mono text-[11px] text-muted-foreground">{note}</p>}
    </figure>
  );
}

export function MetricCard({ label, value, delta, tone = "violet", hint }: { label: string; value: string; delta?: string; tone?: "violet" | "cyan" | "orange" | "lime"; hint?: string }) {
  const toneCls = { violet: "bg-violet", cyan: "bg-cyan", orange: "bg-orange", lime: "bg-lime" }[tone];
  return (
    <div className="relative border-hairline p-5">
      <span className={cn("absolute left-0 top-5 h-4 w-0.5", toneCls)} />
      <div className="eyebrow">{label}</div>
      <div className="mt-3 font-display text-3xl font-semibold tabular-nums">{value}</div>
      {(delta || hint) && <div className="mt-1 font-mono text-xs text-muted-foreground">{delta && <span className="text-lime">{delta} </span>}{hint}</div>}
    </div>
  );
}

export function ChartContainer({ title, subtitle, children, actions, placeholder = true, className }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode; placeholder?: boolean; className?: string }) {
  return (
    <div className={cn("panel flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-5 py-4">
        <div>
          <div className="font-display text-sm font-medium">{title}</div>
          {subtitle && <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {placeholder && <span className="border border-orange/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-orange">Illustrative</span>}
        </div>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

export function ComparisonTable({ columns, rows, highlight }: { columns: string[]; rows: (string | number | ReactNode)[][]; highlight?: number }) {
  return (
    <div className="overflow-x-auto border border-hairline">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-hairline bg-surface">
            {columns.map((c) => <th key={c} className="px-4 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-wider text-muted-foreground">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={cn("border-b border-hairline last:border-0 transition-colors hover:bg-surface/60", highlight === i && "bg-violet/5")}>
              {r.map((cell, j) => <td key={j} className={cn("px-4 py-3 align-top", j === 0 ? "font-medium" : "text-muted-foreground", typeof cell === "number" && "font-mono tabular-nums")}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DatasetPreview({ name, rows, meta }: { name: string; rows: Record<string, string | number>[]; meta?: string }) {
  const cols = Object.keys(rows[0] ?? {});
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5 font-mono text-xs">
        <span><span className="text-cyan">df</span>.head() <span className="text-muted-foreground">— {name}</span></span>
        {meta && <span className="text-muted-foreground">{meta}</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead><tr className="border-b border-hairline">{cols.map((c) => <th key={c} className="px-3 py-2 text-left font-normal text-muted-foreground">{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-hairline last:border-0 hover:bg-surface-2">
                {cols.map((c) => <td key={c} className={cn("whitespace-nowrap px-3 py-2 tabular-nums", c === "default" && (r[c] === 1 ? "text-orange" : "text-lime"))}>{r[c]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "violet" | "cyan" | "lime" | "orange" }) {
  const t = { muted: "text-muted-foreground border-hairline", violet: "text-violet border-violet/40", cyan: "text-cyan border-cyan/40", lime: "text-lime border-lime/40", orange: "text-orange border-orange/40" }[tone];
  return <span className={cn("inline-flex items-center border px-2 py-0.5 font-mono text-[11px]", t)}>{children}</span>;
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex overflow-x-auto border-b border-hairline">
      {tabs.map((t) => (
        <button key={t.value} role="tab" aria-selected={value === t.value} onClick={() => onChange(t.value)}
          className={cn("-mb-px whitespace-nowrap border-b px-4 py-2.5 font-mono text-xs transition-colors", value === t.value ? "border-violet text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-[1400px] px-5", className)}>{children}</div>;
}

/** In-page section index (replaces a permanent sidebar). */
export function SectionIndex({ items }: { items: { id: string; label: string }[] }) {
  return (
    <div className="sticky top-14 z-40 border-b border-hairline bg-background/90 backdrop-blur">
      <Container className="flex gap-1 overflow-x-auto py-2">
        {items.map((it, i) => (
          <a key={it.id} href={`#${it.id}`} className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <span className="text-violet">{String(i + 1).padStart(2, "0")}</span> {it.label}
          </a>
        ))}
      </Container>
    </div>
  );
}
