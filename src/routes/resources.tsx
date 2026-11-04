import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Container, PageHero, Pill, SectionHeader } from "@/components/lab/primitives";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Boosting Lab" },
      { name: "description", content: "Papers, documentation, notebooks and datasets for learning boosting algorithms." },
      { property: "og:title", content: "Resources — Boosting Lab" },
      { property: "og:description", content: "Papers, docs, notebooks and datasets for boosting." },
    ],
  }),
  component: Page,
});

const GROUPS: { title: string; items: { name: string; meta: string; href?: string; tag: string }[] }[] = [
  { title: "Papers", items: [
    { name: "A Decision-Theoretic Generalization of On-Line Learning (AdaBoost)", meta: "Freund & Schapire, 1997", tag: "paper" },
    { name: "Greedy Function Approximation: A Gradient Boosting Machine", meta: "Friedman, 2001", tag: "paper" },
    { name: "XGBoost: A Scalable Tree Boosting System", meta: "Chen & Guestrin, 2016", href: "https://arxiv.org/abs/1603.02754", tag: "paper" },
    { name: "LightGBM: A Highly Efficient Gradient Boosting Decision Tree", meta: "Ke et al., 2017", tag: "paper" },
    { name: "CatBoost: Unbiased Boosting with Categorical Features", meta: "Prokhorenkova et al., 2018", href: "https://arxiv.org/abs/1706.09516", tag: "paper" },
  ] },
  { title: "Documentation", items: [
    { name: "scikit-learn ensemble methods", meta: "scikit-learn.org", href: "https://scikit-learn.org/stable/modules/ensemble.html", tag: "docs" },
    { name: "XGBoost documentation", meta: "xgboost.readthedocs.io", href: "https://xgboost.readthedocs.io", tag: "docs" },
    { name: "LightGBM documentation", meta: "lightgbm.readthedocs.io", href: "https://lightgbm.readthedocs.io", tag: "docs" },
  ] },
  { title: "Notebooks & datasets", items: [
    { name: "Credit risk walkthrough notebook", meta: "coming soon", tag: "ipynb" },
    { name: "Synthetic credit_risk.csv", meta: "coming soon", tag: "csv" },
  ] },
];

function Page() {
  return (
    <>
      <PageHero crumbs={[{ label: "resources" }]} eyebrow="Reference" title="Resources" description="Primary sources, documentation and downloadable material." />
      <Container className="py-16">
        {GROUPS.map((g, gi) => (
          <section key={g.title} className="mb-14">
            <SectionHeader index={String(gi + 1).padStart(2, "0")} title={g.title} />
            <div className="border-t border-hairline md:ml-[136px]">
              {g.items.map((it) => {
                const inner = (<><div><div className="font-display text-lg group-hover:text-violet">{it.name}</div><div className="mt-1 font-mono text-xs text-muted-foreground">{it.meta}</div></div><span className="flex items-center gap-3"><Pill tone="violet">{it.tag}</Pill>{it.href && <ArrowUpRight size={16} />}</span></>);
                return it.href
                  ? <a key={it.name} href={it.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 border-b border-hairline py-5">{inner}</a>
                  : <div key={it.name} className="group flex items-center justify-between gap-4 border-b border-hairline py-5 opacity-70">{inner}</div>;
              })}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}
