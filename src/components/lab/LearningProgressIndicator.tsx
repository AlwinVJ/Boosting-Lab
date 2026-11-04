import { PROGRESS } from "@/data/content";

export function LearningProgressIndicator() {
  const pct = Math.round((PROGRESS.completed / PROGRESS.total) * 100);
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="flex items-center gap-2.5 border border-hairline px-2.5 py-1.5"
      title={`${PROGRESS.completed} of ${PROGRESS.total} modules complete`}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90">
        <circle cx="11" cy="11" r={r} stroke="var(--hairline)" strokeWidth="2.5" fill="none" />
        <circle
          cx="11" cy="11" r={r} stroke="var(--violet)" strokeWidth="2.5" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <div className="hidden leading-none sm:block">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Progress</div>
        <div className="mt-0.5 font-mono text-xs">{pct}%</div>
      </div>
    </div>
  );
}
