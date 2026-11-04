import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BoostingVisualizer } from "@/components/lab/BoostingVisualizer";
import { AlgorithmExplorer, LearningModule } from "@/components/lab/learning";
import { Container, SectionHeader } from "@/components/lab/primitives";

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
        <SectionHeader
          index="01"
          eyebrow="Curriculum Overview"
          title="Explore the Learning Roadmap"
          description="Nine comprehensive modules, one continuous path. From foundational ensemble concepts and mathematical derivations to modern implementations, tuning, and real-world credit risk assessment."
        />
        <LearningModule />
      </Container>

      <Container className="pb-24">
        <SectionHeader
          index="02"
          eyebrow="Algorithm family"
          title="Five algorithms, one foundational principle."
          description="Every boosting method adds learners sequentially to reduce residual error. They differ in what they optimize, how they handle sparsity, and how they scale."
        />
        <AlgorithmExplorer detailed />
      </Container>

      <Container className="pb-24">
        <SectionHeader
          index="03"
          eyebrow="Primary Sources"
          title="Foundational Literature & References"
          description="Curated primary source papers, algorithmic breakthroughs, and seminal literature cited across the curriculum."
        />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="panel flex flex-col justify-between p-6">
            <div>
              <div className="eyebrow text-violet">Seminal PAC Theory · 1990</div>
              <h4 className="mt-2 font-display text-lg font-semibold">The Strength of Weak Learnability</h4>
              <p className="mt-1 font-mono text-xs text-muted-foreground">Robert E. Schapire</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Proved Kearns and Valiant's hypothesis that weak learnability implies strong learnability, establishing boosting.
              </p>
            </div>
            <a
              href="https://www.cs.princeton.edu/~schapire/papers/strengthofweak.pdf"
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center justify-between border-t border-hairline pt-4 font-mono text-xs text-muted-foreground transition-colors hover:text-violet"
            >
              <span>Read Original Paper</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="panel flex flex-col justify-between p-6">
            <div>
              <div className="eyebrow text-cyan">Functional Descent · 2001</div>
              <h4 className="mt-2 font-display text-lg font-semibold">Greedy Function Approximation</h4>
              <p className="mt-1 font-mono text-xs text-muted-foreground">Jerome H. Friedman</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Formulated boosting as gradient descent in function space, unifying regression and classification under arbitrary loss.
              </p>
            </div>
            <a
              href="https://projecteuclid.org/journals/annals-of-statistics/volume-29/issue-5/Greedy-function-approximation-A-gradient-boosting-machine/10.1214/aos/1013203451.full"
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center justify-between border-t border-hairline pt-4 font-mono text-xs text-muted-foreground transition-colors hover:text-cyan"
            >
              <span>Read Annals of Statistics</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="panel flex flex-col justify-between p-6">
            <div>
              <div className="eyebrow text-lime">Scalable Tree Boosting · 2016</div>
              <h4 className="mt-2 font-display text-lg font-semibold">XGBoost: A Scalable System</h4>
              <p className="mt-1 font-mono text-xs text-muted-foreground">Tianqi Chen & Carlos Guestrin</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Introduced 2nd-order Taylor expansions, sparsity-aware split finding, and weighted quantile sketch.
              </p>
            </div>
            <a
              href="https://arxiv.org/abs/1603.02754"
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center justify-between border-t border-hairline pt-4 font-mono text-xs text-muted-foreground transition-colors hover:text-lime"
            >
              <span>Read arXiv Preprint</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 border border-hairline px-4 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-violet hover:text-foreground"
          >
            <span>View All Bibliography & Research Papers</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </>
  );
}
