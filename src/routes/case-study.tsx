import { createFileRoute } from "@tanstack/react-router";
import { FeatureImportanceChart, ModelComparisonChart } from "@/components/lab/charts";
import { ChartContainer, ComparisonTable, Container, DatasetPreview, MetricCard, PageHero, SectionHeader, SectionIndex } from "@/components/lab/primitives";
import { CREDIT_SAMPLE, MODEL_METRICS } from "@/data/content";

export const Route = createFileRoute("/case-study")({
  head: () => ({
    meta: [
      { title: "Predicting Credit Risk with Boosting — Boosting Lab" },
      { name: "description", content: "End-to-end case study: credit risk prediction comparing Logistic Regression, Random Forest, Gradient Boosting and XGBoost." },
      { property: "og:title", content: "Predicting Credit Risk with Boosting Algorithms" },
      { property: "og:description", content: "An end-to-end boosting case study on credit risk." },
    ],
  }),
  component: Page,
});

const STEPS = ["Business Problem", "Dataset Overview", "Data Preprocessing", "Exploratory Data Analysis", "Feature Engineering", "Model Development", "Model Training", "Hyperparameter Optimization", "Model Evaluation", "Feature Importance", "Business Interpretation", "Challenges and Solutions"];
const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

function Page() {
  const best = MODEL_METRICS[3]!;
  return (
    <>
      <PageHero crumbs={[{ label: "case-study" }]} eyebrow="Module 06 · Case study" title="Predicting Credit Risk with Boosting Algorithms" description="An end-to-end workflow, from business framing to interpretation. All metrics on this page are illustrative placeholders, not experimental results." />
      <SectionIndex items={STEPS.map((s) => ({ id: slug(s), label: s }))} />
      <Container className="py-16">
        <div className="mb-16 grid grid-cols-2 border border-hairline lg:grid-cols-5 [&>*]:border-hairline [&>*:not(:last-child)]:border-r">
          <MetricCard label="Accuracy" value={best.accuracy.toFixed(2)} hint="placeholder" />
          <MetricCard label="Precision" value={best.precision.toFixed(2)} tone="cyan" hint="placeholder" />
          <MetricCard label="Recall" value={best.recall.toFixed(2)} tone="orange" hint="placeholder" />
          <MetricCard label="F1-score" value={best.f1.toFixed(2)} tone="lime" hint="placeholder" />
          <MetricCard label="ROC-AUC" value={best.auc.toFixed(2)} hint="placeholder" />
        </div>
        {STEPS.map((s, i) => (
          <section key={s} className="mb-16">
            <SectionHeader id={slug(s)} index={String(i + 1).padStart(2, "0")} title={s} description="Content placeholder — this step will be written in the content phase." />
            <div className="md:ml-[136px]">
              {s === "Dataset Overview" && <DatasetPreview name="credit_risk.csv" meta="synthetic sample" rows={CREDIT_SAMPLE} />}
              {s === "Model Evaluation" && (
                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                  <ComparisonTable highlight={3} columns={["Model", "Acc", "Prec", "Rec", "F1", "AUC"]} rows={MODEL_METRICS.map((m) => [m.model, m.accuracy, m.precision, m.recall, m.f1, m.auc])} />
                  <ChartContainer title="Model comparison" subtitle="illustrative placeholder metrics"><ModelComparisonChart /></ChartContainer>
                </div>
              )}
              {s === "Feature Importance" && <ChartContainer title="XGBoost feature importance"><FeatureImportanceChart /></ChartContainer>}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}
