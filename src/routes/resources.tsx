import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, FileText, Code2, Database } from "lucide-react";
import { Container, PageHero, Pill, SectionHeader, SectionIndex } from "@/components/lab/primitives";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources & Bibliography — Boosting Lab" },
      { name: "description", content: "Curated research papers, books, documentation, and references for machine learning boosting algorithms." },
      { property: "og:title", content: "Resources & Bibliography — Boosting Lab" },
      { property: "og:description", content: "Primary sources, documentation, and canonical texts on boosting." },
    ],
  }),
  component: ResourcesPage,
});

const GROUPS = [
  {
    title: "Foundational Research Papers",
    icon: FileText,
    items: [
      {
        name: "The Strength of Weak Learnability",
        authors: "Robert E. Schapire",
        year: "1990",
        venue: "Machine Learning, 5(2), 197–227",
        summary: "The seminal paper proving Kearns and Valiant's conjecture that weak and strong learnability are equivalent under the PAC model.",
        href: "https://www.cs.princeton.edu/~schapire/papers/strengthofweak.pdf",
        tag: "PAC Theory",
      },
      {
        name: "A Decision-Theoretic Generalization of On-Line Learning (AdaBoost)",
        authors: "Yoav Freund & Robert E. Schapire",
        year: "1997",
        venue: "Journal of Computer and System Sciences, 55(1), 119–139",
        summary: "Introduced the AdaBoost algorithm, proving exponential training error reduction and non-overfitting margin theory (Gödel Prize winner).",
        href: "https://www.sciencedirect.com/science/article/pii/S002200009791504X",
        tag: "Foundational",
      },
      {
        name: "Greedy Function Approximation: A Gradient Boosting Machine",
        authors: "Jerome H. Friedman",
        year: "2001",
        venue: "Annals of Statistics, 29(5), 1189–1232",
        summary: "Formulated boosting as functional gradient descent, unlocking boosting for arbitrary differentiable loss functions.",
        href: "https://projecteuclid.org/journals/annals-of-statistics/volume-29/issue-5/Greedy-function-approximation-A-gradient-boosting-machine/10.1214/aos/1013203451.full",
        tag: "GBM Theory",
      },
      {
        name: "XGBoost: A Scalable Tree Boosting System",
        authors: "Tianqi Chen & Carlos Guestrin",
        year: "2016",
        venue: "KDD '16 Proceedings, 785–794",
        summary: "Introduced regularized second-order Taylor tree boosting, weighted quantile sketch, and sparsity-aware parallel architecture.",
        href: "https://arxiv.org/abs/1603.02754",
        tag: "Systems & ML",
      },
      {
        name: "LightGBM: A Highly Efficient Gradient Boosting Decision Tree",
        authors: "Guolin Ke, Qi Meng, Thomas Finley, et al.",
        year: "2017",
        venue: "Advances in Neural Information Processing Systems (NeurIPS 30)",
        summary: "Introduced Gradient-based One-Side Sampling (GOSS) and Exclusive Feature Bundling (EFB) with histogram binning.",
        href: "https://proceedings.neurips.cc/paper/2017/file/6449f44a102fde848669bdd9eb6b76fa-Paper.pdf",
        tag: "High Scale",
      },
      {
        name: "CatBoost: Unbiased Boosting with Categorical Features",
        authors: "Liudmila Prokhorenkova, Gleb Gusev, Aleksandr Vorobev, et al.",
        year: "2018",
        venue: "Advances in Neural Information Processing Systems (NeurIPS 31)",
        summary: "Identified prediction shift in standard GBM and introduced Ordered Boosting and target statistics on symmetric trees.",
        href: "https://arxiv.org/abs/1706.09516",
        tag: "Categoricals",
      },
      {
        name: "Consistent Individualized Feature Attribution for Tree Ensembles (TreeSHAP)",
        authors: "Scott M. Lundberg, Gabriel G. Erion, Su-In Lee",
        year: "2020",
        venue: "Nature Machine Intelligence, 2, 56–67",
        summary: "Polynomial-time exact computation of Shapley values for tree ensembles, establishing modern interpretability standards.",
        href: "https://arxiv.org/abs/1802.03888",
        tag: "Interpretability",
      },
    ],
  },
  {
    title: "Canonical Textbooks",
    icon: BookOpen,
    items: [
      {
        name: "The Elements of Statistical Learning (2nd Edition)",
        authors: "Trevor Hastie, Robert Tibshirani, Jerome Friedman",
        year: "2009",
        venue: "Springer Series in Statistics",
        summary: "Chapters 10 & 16 provide the definitive mathematical treatments of boosting, additive logistic regression, and MART.",
        href: "https://hastie.su.domains/ElemStatLearn/",
        tag: "Gold Standard",
      },
      {
        name: "Boosting: Foundations and Algorithms",
        authors: "Robert E. Schapire & Yoav Freund",
        year: "2012",
        venue: "MIT Press",
        summary: "A comprehensive treatise by the creators of AdaBoost covering game-theoretic, margin, and optimization perspectives.",
        href: "https://mitpress.mit.edu/9780262017183/boosting/",
        tag: "Comprehensive",
      },
    ],
  },
  {
    title: "Official Documentation & Frameworks",
    icon: Code2,
    items: [
      {
        name: "Scikit-Learn Ensemble Methods Documentation",
        authors: "Scikit-Learn Community",
        year: "2024",
        venue: "scikit-learn.org",
        summary: "User guide for GradientBoostingClassifier, GradientBoostingRegressor, and HistGradientBoostingClassifier.",
        href: "https://scikit-learn.org/stable/modules/ensemble.html",
        tag: "scikit-learn",
      },
      {
        name: "XGBoost Official Documentation",
        authors: "DMLC / XGBoost Team",
        year: "2024",
        venue: "xgboost.readthedocs.io",
        summary: "Full API reference, parameter guides, GPU acceleration instructions, and survival analysis tutorials.",
        href: "https://xgboost.readthedocs.io",
        tag: "XGBoost",
      },
      {
        name: "LightGBM Documentation",
        authors: "Microsoft / LightGBM Team",
        year: "2024",
        venue: "lightgbm.readthedocs.io",
        summary: "Detailed parameter tuning guide, GOSS configuration, categorical feature handling, and distributed training.",
        href: "https://lightgbm.readthedocs.io",
        tag: "LightGBM",
      },
      {
        name: "CatBoost Documentation",
        authors: "Yandex / CatBoost Team",
        year: "2024",
        venue: "catboost.ai",
        summary: "Guides on categorical handling, text/embeddings support, GPU training, and model export to C++/Java.",
        href: "https://catboost.ai/docs/",
        tag: "CatBoost",
      },
      {
        name: "SHAP (SHapley Additive exPlanations) Documentation",
        authors: "Scott Lundberg et al.",
        year: "2024",
        venue: "shap.readthedocs.io",
        summary: "Documentation for TreeExplainer, summary plots, force plots, waterfall charts, and interaction values.",
        href: "https://shap.readthedocs.io",
        tag: "Explainability",
      },
      {
        name: "Optuna: Next-Generation Hyperparameter Optimization",
        authors: "Preferred Networks",
        year: "2024",
        venue: "optuna.readthedocs.io",
        summary: "Automated Bayesian hyperparameter search using Tree-structured Parzen Estimator (TPE) with pruning callbacks.",
        href: "https://optuna.readthedocs.io",
        tag: "Tuning",
      },
    ],
  },
];

const SECTIONS = [
  { id: "papers", label: "1. Research Papers" },
  { id: "textbooks", label: "2. Canonical Textbooks" },
  { id: "docs", label: "3. Official Documentation" },
];

function ResourcesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "resources" }]}
        eyebrow="Bibliography & Reference"
        title="Curriculum Resources & Reading List"
        description="The primary literature, mathematical textbooks, and official engineering documentation underpinning the Boosting Lab educational curriculum."
      />
      <SectionIndex items={SECTIONS} />

      <Container className="py-20">
        <div className="space-y-16 md:ml-[136px]">
          {GROUPS.map((g, idx) => {
            const Icon = g.icon;
            const sectionId = idx === 0 ? "papers" : idx === 1 ? "textbooks" : "docs";
            return (
              <section key={g.title} id={sectionId} className="scroll-mt-28">
                <div className="flex items-center gap-2 border-b border-hairline pb-3">
                  <Icon size={18} className="text-violet" />
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {g.title}
                  </h3>
                </div>

                <div className="mt-4 divide-y divide-hairline rounded border border-hairline bg-surface">
                  {g.items.map((it) => (
                    <div key={it.name} className="p-5 transition-colors hover:bg-surface-2/40">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <a
                          href={it.href}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-center gap-1.5 font-display text-base font-medium text-foreground hover:text-violet"
                        >
                          <span>{it.name}</span>
                          <ArrowUpRight size={14} className="opacity-60 transition-opacity group-hover:opacity-100" />
                        </a>
                        <Pill tone="cyan">{it.tag}</Pill>
                      </div>

                      <div className="mt-1 font-mono text-xs text-muted-foreground">
                        {it.authors} · <span className="text-foreground/80">{it.year}</span> · <em>{it.venue}</em>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {it.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </>
  );
}
