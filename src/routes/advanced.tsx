import { createFileRoute } from "@tanstack/react-router";
import { EarlyStoppingChart, FeatureImportanceChart, LearningRateChart, OverfittingChart } from "@/components/lab/charts";
import { ChartContainer, ComparisonTable, ConceptPanel, Container, PageHero, SectionHeader, SectionIndex } from "@/components/lab/primitives";
import { FEATURES } from "@/data/content";

export const Route = createFileRoute("/advanced")({
  head: () => ({
    meta: [
      { title: "Advanced Boosting Techniques — Boosting Lab" },
      { name: "description", content: "Early stopping, regularization, cross-validation, hyperparameter optimization, imbalanced data and feature importance." },
      { property: "og:title", content: "Advanced Boosting Techniques — Boosting Lab" },
      { property: "og:description", content: "Optimize and interpret boosted models." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHero crumbs={[{ label: "advanced" }]} eyebrow="Module 05" title="Advanced Techniques" description="Controlling capacity, tuning efficiently and interpreting what a boosted model has learned." />
      <SectionIndex items={[{ id: "early", label: "Early stopping" }, { id: "overfit", label: "Overfitting" }, { id: "lr", label: "Learning rate" }, { id: "more", label: "Techniques" }, { id: "fi", label: "Feature importance" }]} />
      <Container className="py-20">
        <SectionHeader id="early" index="5.1" eyebrow="Early stopping" title="Stop when validation stops improving" />
        <ChartContainer title="Training vs validation loss" subtitle="stopping point at minimum validation loss"><EarlyStoppingChart /></ChartContainer>
      </Container>
      <Container className="pb-20">
        <SectionHeader id="overfit" index="5.2" eyebrow="Overfitting prevention" title="The capacity gap" description="As trees get deeper, training accuracy keeps climbing while validation accuracy peaks and falls." />
        <ChartContainer title="Train vs validation accuracy" subtitle="by max_depth"><OverfittingChart /></ChartContainer>
      </Container>
      <Container className="pb-20">
        <SectionHeader id="lr" index="5.3" eyebrow="Learning rate optimization" title="Shrinkage trades speed for generalization" />
        <ChartContainer title="Learning rate schedules" subtitle="validation loss"><LearningRateChart /></ChartContainer>
      </Container>
      <Container className="pb-20">
        <SectionHeader id="more" index="5.4" eyebrow="Techniques" title="Further optimization" />
        <div className="max-w-4xl md:ml-[136px]">
          {[["Regularization", "L1/L2 on leaf weights, γ, min_child_weight."], ["Cross-validation", "Stratified k-fold and xgb.cv."], ["Hyperparameter optimization", "Grid, random, Bayesian (Optuna)."], ["Handling imbalanced datasets", "scale_pos_weight, class weights, focal loss."]].map(([t, s]: string[], i) => (
            <ConceptPanel key={t} index={`5.4.${i + 1}`} title={t!} summary={s!}>Content placeholder.</ConceptPanel>
          ))}
        </div>
      </Container>
      <Container>
        <SectionHeader id="fi" index="5.5" eyebrow="Feature importance explorer" title="Credit-risk feature importance" description="Hypothetical credit-risk dataset. Switch between gain, weight and cover importance." />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ChartContainer title="Importance ranking" subtitle="XGBoost · normalized"><FeatureImportanceChart /></ChartContainer>
          <ComparisonTable columns={["Feature", "Gain", "Weight", "Cover"]} rows={FEATURES.map((f) => [f.feature, f.gain, f.weight, f.cover])} />
        </div>
      </Container>
    </>
  );
}
