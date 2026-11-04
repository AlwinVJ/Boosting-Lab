import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown, BookOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CURRICULUM_MODULES } from "@/data/curriculum";

export const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/fundamentals", label: "Fundamentals" },
  { to: "/adaboost", label: "AdaBoost" },
  { to: "/gradient-boosting", label: "GBM" },
  { to: "/xgboost", label: "XGBoost" },
  { to: "/algorithms", label: "Algorithms" },
  { to: "/implementation", label: "Lab" },
  { to: "/hyperparameters", label: "Tuning" },
  { to: "/advanced", label: "Advanced" },
  { to: "/case-study", label: "Case Study" },
  { to: "/resources", label: "Resources" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5">
      <img
        src="/boosting-lab-icon.jpg"
        alt="Boosting Lab"
        width={28}
        height={28}
        className="size-7 shrink-0 object-contain"
      />
      <span className="whitespace-nowrap font-display text-[15px] font-bold tracking-[0.12em]">
        BOOSTING<span className="text-violet">LAB</span>
      </span>
    </Link>
  );
}

export function NavigationBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCurriculumOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-6">
          <Logo />

          {/* Curriculum Dropdown on Desktop */}
          <div className="relative hidden xl:block" ref={dropdownRef}>
            <button
              onClick={() => setCurriculumOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded border border-hairline px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-violet/60 hover:text-foreground"
            >
              <BookOpen size={13} className="text-violet" />
              <span>Modules</span>
              <ChevronDown
                size={12}
                className={`transition-transform ${curriculumOpen ? "rotate-180 text-violet" : ""}`}
              />
            </button>

            {curriculumOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 rounded border border-hairline bg-surface p-2 shadow-2xl backdrop-blur-xl">
                <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Complete Curriculum
                </div>
                <div className="max-h-[70vh] space-y-0.5 overflow-y-auto">
                  {CURRICULUM_MODULES.map((m) => (
                    <Link
                      key={m.id}
                      to={m.to}
                      onClick={() => setCurriculumOpen(false)}
                      className="group flex items-start gap-3 rounded p-2 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="mt-0.5 font-mono text-xs text-violet">
                        {m.number}
                      </span>
                      <div>
                        <div className="text-xs font-medium text-foreground group-hover:text-violet">
                          {m.title}
                        </div>
                        <div className="line-clamp-1 font-mono text-[10px] text-muted-foreground">
                          {m.time} · {m.difficulty}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex overflow-x-auto">
          {NAV_ITEMS.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="relative whitespace-nowrap px-2.5 py-4 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:inset-x-2.5 data-[status=active]:after:bottom-0 data-[status=active]:after:h-px data-[status=active]:after:bg-violet"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            className="p-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav className="max-h-[85vh] overflow-y-auto border-t border-hairline bg-background px-5 py-4 lg:hidden">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Navigation
          </div>
          <div className="space-y-1">
            {NAV_ITEMS.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="flex items-center justify-between border-b border-hairline/40 py-2.5 text-sm text-muted-foreground data-[status=active]:font-semibold data-[status=active]:text-foreground"
              >
                <span>{n.label}</span>
              </Link>
            ))}
          </div>

          <div className="mb-2 mt-6 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Curriculum Modules
          </div>
          <div className="space-y-1">
            {CURRICULUM_MODULES.map((m) => (
              <Link
                key={m.id}
                to={m.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded p-2 text-xs text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <span className="font-mono text-violet">{m.number}</span>
                <span>{m.title}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
