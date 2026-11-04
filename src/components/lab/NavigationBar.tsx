import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LearningProgressIndicator } from "./LearningProgressIndicator";

export const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/fundamentals", label: "Fundamentals" },
  { to: "/algorithms", label: "Algorithms" },
  { to: "/implementation", label: "Implementation" },
  { to: "/advanced", label: "Advanced Topics" },
  { to: "/case-study", label: "Case Study" },
  { to: "/resources", label: "Resources" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <rect x="1" y="16" width="5" height="9" fill="var(--muted-foreground)" opacity="0.5" />
        <rect x="8" y="11" width="5" height="14" fill="var(--cyan)" opacity="0.8" />
        <rect x="15" y="6" width="5" height="19" fill="var(--violet)" />
        <path d="M2 13 L10 8 L18 3 L24 1" stroke="var(--orange)" strokeWidth="1.5" fill="none" />
      </svg>
      <span className="font-display text-[15px] font-bold tracking-[0.12em]">
        BOOSTING<span className="text-violet">LAB</span>
      </span>
    </Link>
  );
}

export function NavigationBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-6 px-5">
        <Logo />
        <nav className="hidden items-center lg:flex">
          {NAV_ITEMS.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="relative px-3 py-4 text-[13px] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:inset-x-3 data-[status=active]:after:bottom-0 data-[status=active]:after:h-px data-[status=active]:after:bg-violet"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LearningProgressIndicator />
          <button
            className="p-1.5 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-hairline bg-background px-5 py-3 lg:hidden">
          {NAV_ITEMS.map((n, i) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              className="flex items-center gap-4 border-b border-hairline py-3 text-sm text-muted-foreground last:border-0 data-[status=active]:text-foreground"
            >
              <span className="font-mono text-xs text-violet">{String(i).padStart(2, "0")}</span>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
