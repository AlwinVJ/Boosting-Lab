import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BoostingVisualizer } from "@/components/lab/BoostingVisualizer";
import { AlgorithmExplorer, LearningModule } from "@/components/lab/learning";
import { Container, SectionHeader } from "@/components/lab/primitives";
import { MODULES } from "@/data/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boosting Lab — From Weak Learners to Powerful Predictions" },
      { name: "description", content: "Interactive lab for learning boosting: AdaBoost, Gradient Boosting, XGBoost, LightGBM and CatBoost, from intuition to implementation." },
      { property: "og:title", content: "Boosting Lab — From Weak Learners to Powerful Predictions" },
      { property: "og:description", content: "Explore the mathematics, intuition, and implementation behind boosting algorithms." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="lab-grid pointer-events-none absolute inset-0" />
        <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-[1fr_1.1fr] lg:py-24">
          <div>
            <div className="eyebrow">Machine Learning / Ensemble Methods</div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] md:text-7xl">
              From Weak Learners to <span className="text-violet">Powerful</span> Predictions.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Explore the mathematics, intuition, and implementation behind boosting algorithms. Understand how sequential learning transforms simple models into powerful predictive systems.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/fundamentals" className="group inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Start Learning <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/algorithms" className="inline-flex items-center gap-2 border border-input px-5 py-3 text-sm font-medium transition-colors hover:border-violet hover:text-violet">
                Explore Algorithms
              </Link>
            </div>
            <div className="mt-12 flex gap-8 font-mono text-xs text-muted-foreground">
              <span><span className="text-foreground">F</span><sub>m</sub>(x) = F<sub>m−1</sub>(x) + ν·h<sub>m</sub>(x)</span>
            </div>
          </div>
          <BoostingVisualizer />
        </Container>
      </section>

      <Container className="py-24">
        <SectionHeader index="01" eyebrow="Learning journey" title="Six modules, one continuous path." description="Each module builds on the previous one — from the core idea of sequential correction to deploying boosted models on real data." />
        <LearningModule />
      </Container>

      <Container className="pb-24">
        <SectionHeader index="02" eyebrow="Algorithm family" title="Five algorithms, one principle." description="Every boosting method adds learners sequentially to reduce error. They differ in what they optimize and how they scale." />
        <AlgorithmExplorer />
      </Container>

      <Container className="pb-8">
        <SectionHeader index="03" eyebrow="Roadmap" title="Explore the Learning Roadmap" description="Six modules covering boosting from first principles to real-world application. Everything is open — start anywhere, no sign-up required." />
        <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <Link key={m.id} to={m.to} className="group bg-background p-6 transition-colors hover:bg-surface">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-violet">{m.id}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{m.time}</span>
              </div>
              <div className="mt-3 flex items-start gap-1 font-display text-lg font-medium leading-snug transition-colors group-hover:text-violet">
                {m.title}
                <ArrowUpRight size={14} className="mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
