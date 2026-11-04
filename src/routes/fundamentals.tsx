import { createFileRoute } from "@tanstack/react-router";
import { InteractiveDiagram } from "@/components/lab/BoostingVisualizer";
import { ComparisonTable, ConceptPanel, Container, MathematicalExplanation, PageHero, SectionHeader, SectionIndex } from "@/components/lab/primitives";

export const Route = createFileRoute("/fundamentals")({
  head: () => ({
    meta: [
      { title: "Understanding Boosting — Boosting Lab" },
      { name: "description", content: "Weak learners, sequential learning, boosting iterations and how boosting differs from bagging." },
      { property: "og:title", content: "Understanding Boosting — Boosting Lab" },
      { property: "og:description", content: "The core ideas behind boosting, with interactive diagrams." },
    ],
  }),
  component: Page,
});

const SECTIONS = [
  { id: "concepts", label: "Core concepts" },
  { id: "sequence", label: "Visual sequence" },
  { id: "math", label: "Notation" },
  { id: "bagging", label: "Boosting vs bagging" },
  { id: "examples", label: "Examples" },
];

function Page() {
  return (
    <>
      <PageHero crumbs={[{ label: "fundamentals" }]} eyebrow="Module 01" title="Understanding Boosting" description="Boosting builds a strong predictor by adding simple models one at a time, each one trained to fix what the ensemble still gets wrong." />
      <SectionIndex items={SECTIONS} />
      <Container className="py-20">
        <SectionHeader id="concepts" index="01" eyebrow="Core concepts" title="Six ideas to start with" />
        <div className="max-w-4xl md:ml-[136px]">
          <ConceptPanel defaultOpen index="1.1" title="What is boosting?" summary="An ensemble technique that combines weak learners sequentially into one strong learner.">Content placeholder — full explanation coming in the content phase.</ConceptPanel>
          <ConceptPanel index="1.2" title="What are weak learners?" summary="Models only slightly better than random guessing, such as decision stumps.">Content placeholder.</ConceptPanel>
          <ConceptPanel index="1.3" title="Strong vs weak learners" summary="A strong learner achieves arbitrarily low error; boosting proves weak learners can be combined into one.">Content placeholder.</ConceptPanel>
          <ConceptPanel index="1.4" title="Sequential learning" summary="Each new learner is trained with knowledge of the errors of the current ensemble.">Content placeholder.</ConceptPanel>
          <ConceptPanel index="1.5" title="Boosting iterations" summary="Each round adds a learner, updates weights or residuals, and reduces training loss.">Content placeholder.</ConceptPanel>
          <ConceptPanel index="1.6" title="Boosting vs bagging" summary="Bagging trains in parallel to reduce variance; boosting trains in sequence to reduce bias.">Content placeholder.</ConceptPanel>
        </div>
      </Container>
      <Container className="pb-20">
        <SectionHeader id="sequence" index="02" eyebrow="Interactive diagram" title="The boosting sequence" description="Hover any stage. Each learner only sees what the previous ones left unexplained." />
        <InteractiveDiagram nodes={[
          { label: "Dataset", sub: "X, y", tone: "muted" },
          { label: "Weak learner 1", sub: "h₁(x)" },
          { label: "Error analysis", sub: "r₁ = y − F₁", tone: "orange" },
          { label: "Weak learner 2", sub: "h₂(x)" },
          { label: "Error analysis", sub: "r₂ = y − F₂", tone: "orange" },
          { label: "Weak learner 3", sub: "h₃(x)" },
          { label: "Final ensemble", sub: "F(x) = Σ αₘhₘ", tone: "lime" },
        ]} />
      </Container>
      <Container className="pb-20">
        <SectionHeader id="math" index="03" eyebrow="Mathematical notation" title="The additive model" />
        <div className="grid gap-4 md:ml-[136px] lg:grid-cols-2">
          <MathematicalExplanation label="Additive expansion" formula="F_M(x) = Σₘ αₘ · hₘ(x)" terms={[["hₘ", "weak learner m"], ["αₘ", "learner weight"], ["M", "number of rounds"]]} note="KaTeX rendering placeholder" />
          <MathematicalExplanation label="Stagewise update" formula="Fₘ(x) = Fₘ₋₁(x) + ν · hₘ(x)" terms={[["ν", "learning rate (shrinkage)"], ["Fₘ₋₁", "current ensemble"]]} note="KaTeX rendering placeholder" />
        </div>
      </Container>
      <Container className="pb-20">
        <SectionHeader id="bagging" index="04" eyebrow="Comparison" title="Boosting vs bagging" />
        <div className="md:ml-[136px]">
          <ComparisonTable columns={["Aspect", "Bagging", "Boosting"]} rows={[
            ["Training", "Parallel, independent", "Sequential, dependent"],
            ["Primary goal", "Reduce variance", "Reduce bias (and variance)"],
            ["Sample weighting", "Uniform bootstrap", "Focus on hard examples"],
            ["Base learners", "Deep, low-bias trees", "Shallow, high-bias trees"],
            ["Example", "Random Forest", "AdaBoost, XGBoost"],
          ]} />
        </div>
      </Container>
      <Container>
        <SectionHeader id="examples" index="05" eyebrow="Practical examples" title="Where you'll see boosting" />
        <div className="grid border border-hairline md:ml-[136px] md:grid-cols-3 [&>*]:border-hairline [&>*:not(:last-child)]:border-b md:[&>*:not(:last-child)]:border-b-0 md:[&>*:not(:last-child)]:border-r">
          {[["Credit scoring", "Estimating default probability from applicant history."], ["Search ranking", "Learning-to-rank with LambdaMART."], ["Fraud detection", "Imbalanced classification at scale."]].map(([t, d]) => (
            <div key={t} className="p-6"><div className="font-display text-lg">{t}</div><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </Container>
    </>
  );
}
