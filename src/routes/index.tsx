import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BoostingVisualizer } from "@/components/lab/BoostingVisualizer";
import { AlgorithmExplorer, LearningModule } from "@/components/lab/learning";
import { Container, SectionHeader } from "@/components/lab/primitives";
import { CURRICULUM_MODULES } from "@/data/curriculum";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boosting Lab — From Weak Learners to Powerful Predictions" },
      { name: "description", content: "Interactive educational platform for learning boosting: AdaBoost, Gradient Boosting, XGBoost, LightGBM, and CatBoost, from intuition to mathematical foundations and implementation." },
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
              Explore the mathematical foundations, working mechanisms, Python implementations, and optimization strategies behind boosting algorithms in machine learning.
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
        <SectionHeader index="01" eyebrow="Learning journey" title="Nine comprehensive modules, one continuous path." description="From foundational ensemble concepts and mathematical derivations to modern implementations, tuning, and real-world credit risk assessment." />
        <LearningModule />
      </Container>

      <Container className="pb-24">
        <SectionHeader index="02" eyebrow="Algorithm family" title="Five algorithms, one foundational principle." description="Every boosting method adds learners sequentially to reduce residual error. They differ in what they optimize, how they handle sparsity, and how they scale." />
        <AlgorithmExplorer />
      </Container>

      <Container className="pb-16">
        <SectionHeader index="03" eyebrow="Complete Curriculum" title="Explore the Learning Roadmap" description="Nine modules covering boosting from first principles to real-world application. Everything is accessible directly — start anywhere." />
        <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {CURRICULUM_MODULES.map((m) => (
            <Link key={m.id} to={m.to} className="group bg-background p-6 transition-colors hover:bg-surface">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-violet">Module {m.number}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{m.time} · {m.difficulty}</span>
              </div>
              <div className="mt-3 flex items-start gap-1 font-display text-lg font-medium leading-snug transition-colors group-hover:text-violet">
                {m.title}
                <ArrowUpRight size={14} className="mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {m.tagline}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
