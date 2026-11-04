import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizBlockProps {
  title?: string;
  description?: string;
  questions: QuizQuestion[];
  className?: string;
}

export function QuizBlock({
  title = "Knowledge Check",
  description = "Test your understanding of the concepts covered in this module.",
  questions,
  className,
}: QuizBlockProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted[questionId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = (questionId: string) => {
    if (selectedAnswers[questionId] === undefined) return;
    setSubmitted((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleReset = (questionId: string) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setSubmitted((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const totalAnswered = Object.keys(submitted).length;
  const totalCorrect = questions.filter(
    (q) => submitted[q.id] && selectedAnswers[q.id] === q.correctIndex
  ).length;

  return (
    <div className={cn("panel my-8 overflow-hidden border border-hairline", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline bg-surface-2/40 px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-violet" />
            <h3 className="font-display text-base font-semibold">{title}</h3>
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {totalAnswered > 0 && (
          <div className="font-mono text-xs">
            Score:{" "}
            <span
              className={cn(
                "font-semibold",
                totalCorrect === questions.length ? "text-lime" : "text-cyan"
              )}
            >
              {totalCorrect}/{questions.length}
            </span>
          </div>
        )}
      </div>

      <div className="divide-y divide-hairline">
        {questions.map((q, idx) => {
          const isSubmitted = submitted[q.id] || false;
          const selected = selectedAnswers[q.id];
          const isCorrect = isSubmitted && selected === q.correctIndex;
          const isWrong = isSubmitted && selected !== q.correctIndex;

          return (
            <div key={q.id} className="p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded border border-hairline bg-surface-2 font-mono text-xs text-violet">
                  {idx + 1}
                </span>
                <p className="text-[15px] font-medium leading-relaxed">{q.question}</p>
              </div>

              <div className="mt-4 space-y-2 sm:ml-9">
                {q.options.map((option, optIdx) => {
                  const isThisSelected = selected === optIdx;
                  const isThisCorrect = isSubmitted && optIdx === q.correctIndex;
                  const isThisWrong = isSubmitted && isThisSelected && !isThisCorrect;

                  let optionBorder = "border-hairline hover:border-violet/50 hover:bg-surface-2/50";
                  if (isThisCorrect) {
                    optionBorder = "border-lime/60 bg-lime/10 text-foreground font-medium";
                  } else if (isThisWrong) {
                    optionBorder = "border-orange/60 bg-orange/10 text-foreground";
                  } else if (isThisSelected) {
                    optionBorder = "border-violet bg-violet/10 text-foreground";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={cn(
                        "flex w-full items-center justify-between rounded border px-4 py-3 text-left text-sm transition-all",
                        optionBorder
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{option}</span>
                      </div>
                      {isThisCorrect && (
                        <CheckCircle2 size={16} className="shrink-0 text-lime" />
                      )}
                      {isThisWrong && (
                        <XCircle size={16} className="shrink-0 text-orange" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between sm:ml-9">
                {!isSubmitted ? (
                  <button
                    type="button"
                    disabled={selected === undefined}
                    onClick={() => handleSubmit(q.id)}
                    className={cn(
                      "rounded bg-primary px-4 py-1.5 font-mono text-xs font-medium text-primary-foreground transition-opacity",
                      selected === undefined
                        ? "cursor-not-allowed opacity-40"
                        : "hover:opacity-90"
                    )}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReset(q.id)}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw size={12} />
                    Try again
                  </button>
                )}
              </div>

              {isSubmitted && (
                <div
                  className={cn(
                    "mt-4 rounded border p-4 text-xs leading-relaxed sm:ml-9",
                    isCorrect
                      ? "border-lime/30 bg-lime/5 text-muted-foreground"
                      : "border-orange/30 bg-orange/5 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-mono font-semibold uppercase tracking-wider">
                    {isCorrect ? (
                      <span className="text-lime">Correct</span>
                    ) : (
                      <span className="text-orange">Incorrect</span>
                    )}
                  </div>
                  <p className="mt-1 text-foreground/90">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
