import { createFileRoute } from "@tanstack/react-router";
import { InteractiveDiagram } from "@/components/lab/BoostingVisualizer";
import { ResidualDecayChart } from "@/components/lab/charts";
import { AlgorithmExplorer } from "@/components/lab/learning";
import { ChartContainer, ConceptPanel, Container, MathematicalExplanation, PageHero, SectionHeader, SectionIndex } from "@/components/lab/primitives";

export const Route = createFileRoute("/algorithms")({
  head: () => ({
    meta: [
      { title: "Boosting Algorithms: GBM, XGBoost, LightGBM, CatBoost — Boosting Lab" },
      { name: "description", content: "Gradient boosting machines, XGBoost's regularized objective, and a comparison of AdaBoost, LightGBM and CatBoost." },
      { property: "og:title", content: "Boosting Algorithms — Boosting Lab" },
      { property: "og:description", content: "Explore GBM, XGBoost, AdaBoost, LightGBM and CatBoost side by side." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHero crumbs={[{ label: "algorithms" }]} eyebrow="Modules 02 – 03" title="Algorithm Exploration" description="From Friedman's gradient boosting to the regularized, second-order machinery of XGBoost — and the modern algorithms that followed." />
      <SectionIndex items={[{ id: "gbm", label: "Gradient Boosting" }, { id: "xgb", label: "XGBoost" }, { id: "others", label: "Other algorithms" }]} />
      <Container className="py-20">
        <SectionHeader id="gbm" index="02" eyebrow="Gradient boosting machines" title="Learning from residuals" description="Each tree is fit to the negative gradient of the loss — for squared error, simply the residuals." />
        <div className="grid gap-8 md:ml-[136px] lg:grid-cols-[1fr_1fr]">
          <div>
            {[["Intuition", "Correct the ensemble one small step at a time."], ["Residual-based learning", "Targets become y − F(x)."], ["Sequential tree construction", "Shallow trees added one by one."], ["Loss functions", "Squared, absolute, Huber, log-loss."], ["Gradient descent view", "Descent in function space."]].map(([t, s]: string[], i) => (
              <ConceptPanel key={t} index={`2.${i + 1}`} title={t!} summary={s!}>Content placeholder.</ConceptPanel>
            ))}
          </div>
          <div className="space-y-4">
            <MathematicalExplanation label="Pseudo-residuals" formula="rᵢₘ = −[∂L(yᵢ, F(xᵢ)) / ∂F(xᵢ)]" terms={[["L", "loss function"], ["F", "Fₘ₋₁"]]} />
            <ChartContainer title="Successive trees reduce residuals" subtitle="mean |residual| after each tree"><ResidualDecayChart /></ChartContainer>
          </div>
        </div>
      </Container>
      <Container className="pb-20">
        <SectionHeader id="xgb" index="03" eyebrow="XGBoost" title="Regularized second-order boosting" />
        <div className="space-y-8 md:ml-[136px]">
          <div className="grid gap-4 lg:grid-cols-2">
            <MathematicalExplanation label="Regularized objective" formula="𝓛 = Σᵢ l(yᵢ, ŷᵢ) + Σₖ Ω(fₖ),  Ω = γT + ½λ‖w‖²" terms={[["T", "number of leaves"], ["w", "leaf weights"], ["γ", "leaf penalty"], ["λ", "L2 penalty"]]} />
            <MathematicalExplanation label="Split gain" formula="Gain = ½[G_L²/(H_L+λ) + G_R²/(H_R+λ) − (G_L+G_R)²/(H_L+H_R+λ)] − γ" terms={[["G", "sum of gradients gᵢ"], ["H", "sum of Hessians hᵢ"]]} />
          </div>
          <div>
            <div className="eyebrow mb-3">Training pipeline</div>
            <InteractiveDiagram nodes={[
              { label: "DMatrix", sub: "sparse, binned", tone: "muted" },
              { label: "Gradients", sub: "gᵢ, hᵢ", tone: "cyan" },
              { label: "Split finding", sub: "max gain", tone: "violet" },
              { label: "Missing values", sub: "default direction", tone: "orange" },
              { label: "Leaf weights", sub: "w* = −G/(H+λ)", tone: "violet" },
              { label: "Prune", sub: "gain < γ", tone: "orange" },
              { label: "Update ŷ", sub: "ŷ += η·f", tone: "lime" },
            ]} />
          </div>
          <div className="grid lg:grid-cols-2 lg:gap-x-10">
            {[["What makes XGBoost different?", "Regularization, Hessians, systems design."], ["First and second-order gradients", "Taylor expansion of the loss."], ["Tree construction", "Exact and approximate greedy algorithms."], ["L1 and L2 regularization", "reg_alpha and reg_lambda on leaf weights."], ["Missing value handling", "Learned default directions per split."], ["Split gain", "Structure score improvement."]].map(([t, s]: string[], i) => (
              <ConceptPanel key={t} index={`3.${i + 1}`} title={t!} summary={s!}>Content placeholder.</ConceptPanel>
            ))}
          </div>
        </div>
      </Container>
      <Container>
        <SectionHeader id="others" index="04" eyebrow="Comparison interface" title="AdaBoost, LightGBM, CatBoost and more" />
        <AlgorithmExplorer detailed />
      </Container>
    </>
  );
}
