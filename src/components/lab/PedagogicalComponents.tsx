import { type ReactNode } from "react";
import { Check, Lightbulb, Calculator, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathBlock } from "./MathBlock";

interface DerivationStepProps {
  step: number;
  title: string;
  formula?: string | undefined;
  children: ReactNode;
  note?: string | undefined;
  terms?: [string, string][] | undefined;
}

export function DerivationStep({
  step,
  title,
  formula,
  children,
  note,
  terms,
}: DerivationStepProps) {
  return (
    <div className="relative my-6 rounded border border-hairline bg-surface/60 p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded bg-violet/20 font-mono text-xs font-semibold text-violet">
          {step}
        </span>
        <h4 className="font-display text-base font-semibold">{title}</h4>
      </div>

      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>

      {formula && (
        <MathBlock formula={formula} terms={terms} note={note} className="my-3 bg-surface-2/60" />
      )}
    </div>
  );
}

interface WorkedExampleProps {
  title: string;
  description: string;
  steps: {
    label: string;
    calculation?: string;
    result?: string;
    explanation?: string;
  }[];
  conclusion?: string;
}

export function WorkedExample({
  title,
  description,
  steps,
  conclusion,
}: WorkedExampleProps) {
  return (
    <div className="my-8 rounded border border-hairline bg-surface p-6">
      <div className="flex items-center gap-2 border-b border-hairline pb-4">
        <Calculator size={18} className="text-cyan" />
        <h4 className="font-display text-base font-semibold text-foreground">
          Worked Example: {title}
        </h4>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <div className="mt-5 space-y-4">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="rounded border border-hairline/60 bg-surface-2/40 p-4 text-sm"
          >
            <div className="flex items-center gap-2 font-mono text-xs text-cyan">
              <span>Step {idx + 1}:</span>
              <span className="font-sans font-medium text-foreground">{s.label}</span>
            </div>
            {s.calculation && (
              <div className="my-2 overflow-x-auto rounded bg-background/60 px-3 py-2 font-mono text-xs text-orange">
                {s.calculation}
              </div>
            )}
            {s.result && (
              <div className="flex items-center gap-1.5 font-mono text-xs text-lime">
                <ArrowRight size={12} />
                <span>Result: {s.result}</span>
              </div>
            )}
            {s.explanation && (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {s.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      {conclusion && (
        <div className="mt-4 flex items-start gap-2 rounded border border-lime/30 bg-lime/5 p-3 text-xs text-muted-foreground">
          <Check size={14} className="mt-0.5 shrink-0 text-lime" />
          <div>
            <span className="font-semibold text-foreground">Takeaway: </span>
            {conclusion}
          </div>
        </div>
      )}
    </div>
  );
}

export function KeyTakeaway({
  title = "Key Takeaway",
  children,
  points,
}: {
  title?: string;
  children?: ReactNode;
  points?: string[];
}) {
  return (
    <div className="my-6 rounded border-l-4 border-l-lime border-y border-r border-hairline bg-surface/80 p-5">
      <div className="flex items-center gap-2 text-lime">
        <Lightbulb size={16} />
        <h5 className="font-display text-sm font-semibold uppercase tracking-wider">
          {title}
        </h5>
      </div>
      {children && (
        <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      )}
      {points && points.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {points.map((pt, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-lime" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WarningCallout({
  title = "Common Pitfall",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-6 rounded border-l-4 border-l-orange border-y border-r border-hairline bg-orange/5 p-5">
      <div className="flex items-center gap-2 text-orange">
        <AlertTriangle size={16} />
        <h5 className="font-display text-sm font-semibold uppercase tracking-wider">
          {title}
        </h5>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
