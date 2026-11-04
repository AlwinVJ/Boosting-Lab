import { useState, useMemo } from "react";
import katex from "katex";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MathBlockProps {
  formula: string;
  label?: string | undefined;
  terms?: [string, string][] | undefined;
  note?: string | undefined;
  className?: string | undefined;
  displayMode?: boolean | undefined;
}

export function MathBlock({
  formula,
  label,
  terms,
  note,
  className,
  displayMode = true,
}: MathBlockProps) {
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (e) {
      console.error("KaTeX rendering error:", e);
      return `<span class="katex-error">${formula}</span>`;
    }
  }, [formula, displayMode]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <figure
      className={cn(
        "group relative my-4 border-l-2 border-violet bg-surface/90 px-5 py-4 transition-colors hover:border-violet/90",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {label && <figcaption className="eyebrow">{label}</figcaption>}
        <button
          onClick={handleCopy}
          className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100"
          title="Copy LaTeX formula"
          aria-label="Copy LaTeX formula"
        >
          {copied ? <Check size={11} className="text-lime" /> : <Copy size={11} />}
          <span>{copied ? "copied" : "LaTeX"}</span>
        </button>
      </div>

      <div
        className="my-2 overflow-x-auto py-2 text-foreground"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {terms && terms.length > 0 && (
        <dl className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-hairline pt-3 text-xs sm:grid-cols-2">
          {terms.map(([symbol, desc]) => (
            <div key={symbol} className="flex items-baseline gap-2">
              <dt className="min-w-10 font-mono text-cyan">{symbol}</dt>
              <dd className="text-muted-foreground">{desc}</dd>
            </div>
          ))}
        </dl>
      )}

      {note && (
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground/80">
          <span className="text-violet font-semibold">Note:</span> {note}
        </p>
      )}
    </figure>
  );
}

export function InlineMath({ formula, className }: { formula: string; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode: false,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return formula;
    }
  }, [formula]);

  return (
    <span
      className={cn("inline-katex mx-0.5 text-foreground align-middle", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
