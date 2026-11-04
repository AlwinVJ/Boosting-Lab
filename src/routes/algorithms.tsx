import { createFileRoute } from "@tanstack/react-router";
import { AlgorithmExplorer } from "@/components/lab/learning";
import { ComparisonTable, Container, PageHero, SectionHeader, SectionIndex, Pill } from "@/components/lab/primitives";
import { MathBlock, InlineMath } from "@/components/lab/MathBlock";
import { KeyTakeaway, WarningCallout } from "@/components/lab/PedagogicalComponents";
import { QuizBlock } from "@/components/lab/QuizBlock";

export const Route = createFileRoute("/algorithms")({
  head: () => ({
    meta: [
      { title: "Module 05: Modern Boosting Algorithms — Boosting Lab" },
      { name: "description", content: "Deep dive into LightGBM (GOSS, EFB), CatBoost (Ordered Boosting, Oblivious Trees), and a 5-way comparative analysis across all boosting algorithms." },
      { property: "og:title", content: "Modern Boosting Ecosystem — Boosting Lab" },
      { property: "og:description", content: "LightGBM, CatBoost, and 5-way algorithm comparative benchmarks." },
    ],
  }),
  component: AlgorithmsPage,
});

const SECTIONS = [
  { id: "lightgbm", label: "1. LightGBM Deep Dive" },
  { id: "catboost", label: "2. CatBoost Deep Dive" },
  { id: "comparison-matrix", label: "3. 5-Way Comparative Matrix" },
  { id: "interactive-explorer", label: "4. Interactive Explorer" },
  { id: "selection-guide", label: "5. When to Choose Which" },
  { id: "code-implementations", label: "6. Python Implementations" },
  { id: "quiz", label: "7. Knowledge Check" },
];

function AlgorithmsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "curriculum", to: "/" }, { label: "algorithms" }]}
        eyebrow="Module 05 — Modern Ecosystem"
        title="Modern Boosting: LightGBM & CatBoost"
        description="Explore the architectural breakthroughs that reshaped modern tabular learning: LightGBM's histogram binning and GOSS, CatBoost's ordered target statistics, and an unbiased comparative analysis."
      />
      <SectionIndex items={SECTIONS} />

      {/* SECTION 1: LIGHTGBM */}
      <Container className="py-20">
        <SectionHeader
          id="lightgbm"
          index="01"
          eyebrow="Speed & Scalability"
          title="LightGBM: Histogram Binning, Leaf-Wise Growth & GOSS"
          description="Introduced by Microsoft Research in 2017 (Ke et al.), LightGBM was engineered to overcome the memory and speed bottlenecks of standard tree building on massive datasets."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-base font-semibold text-lime">Histogram-Based Split Finding</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Continuous features are discretized into <InlineMath formula="K = 256" /> integer bins (stored as 8-bit uint8). Instead of sorting all <InlineMath formula="N" /> data points, split evaluation costs <InlineMath formula="O(K \times \text{#features})" /> rather than <InlineMath formula="O(N \times \text{#features})" />, slashing memory by 80% and speeding up split search by up to 15×.
              </p>
            </div>
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-display text-base font-semibold text-cyan">Leaf-Wise (Best-First) Growth</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Classical trees grow level-wise (depth-wise), splitting all nodes at a given depth. LightGBM splits the single leaf that produces the <strong>maximum delta loss reduction</strong> anywhere in the tree. This achieves lower loss with fewer total splits, but requires controlling <code className="text-violet">num_leaves</code> to prevent overfitting small data.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">
              Gradient-Based One-Side Sampling (GOSS)
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              In gradient boosting, data points with small gradients have already been learned accurately, while points with large gradients contribute most to the training loss. GOSS keeps all top <InlineMath formula="a \times 100\%" /> instances with large gradients, randomly samples a fraction <InlineMath formula="b" /> from instances with small gradients, and scales small-gradient samples by a factor to restore unbiased data distribution:
            </p>

            <MathBlock
              label="GOSS Gradient Sum Formula"
              formula="\tilde{V}_j(d) = \frac{1}{n} \left( \sum_{x_i \in A_l} g_i + \frac{1 - a}{b} \sum_{x_i \in B_l} g_i \right)"
              terms={[
                ["A_l", "Subset of instances in split branch with large gradients (top fraction a)"],
                ["B_l", "Randomly sampled subset of instances with small gradients (fraction b)"],
                ["\\frac{1-a}{b}", "Multiplier applied to small-gradient samples to preserve overall expectation"],
              ]}
              note="GOSS preserves the original data distribution without retraining on the full dataset, reducing computational cost while maintaining accuracy."
            />
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">
              Exclusive Feature Bundling (EFB)
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              High-dimensional tabular data is frequently sparse (e.g. one-hot encoded categories). Two features rarely take non-zero values simultaneously. EFB bundles mutually exclusive features into a single composite feature by adding offsets to their values, safely reducing the effective number of features without losing information.
            </p>
          </div>
        </div>
      </Container>

      {/* SECTION 2: CATBOOST */}
      <Container className="pb-20">
        <SectionHeader
          id="catboost"
          index="02"
          eyebrow="Categorical Excellence"
          title="CatBoost: Ordered Boosting & Oblivious Trees"
          description="Developed by Yandex researchers (Dorogush et al. 2017 initial release; Prokhorenkova et al. NeurIPS 2018), CatBoost eliminates target leakage, handles high-cardinality categorical features natively, and uses symmetric decision structures."
        />
        <div className="max-w-4xl space-y-8 md:ml-[136px]">
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">
              Target Leakage & Prediction Shift in Standard GBM
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              In standard gradient boosting, pseudo-residuals <InlineMath formula="r_i = -\partial L / \partial F(x_i)" /> are computed using the model trained on the exact same dataset that contains sample <InlineMath formula="i" />. This produces a subtle shift: the distribution of <InlineMath formula="r(x)|x" /> during training differs from test time. CatBoost solves this with <strong>Ordered Boosting</strong>: multiple random permutations of the dataset are maintained, and a model for predicting sample <InlineMath formula="i" /> is trained strictly on samples that precede <InlineMath formula="i" /> in that permutation.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-foreground">
              Ordered Target Statistics (Native Categorical Encoding)
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Instead of naive one-hot encoding (which explodes dimensionality) or standard mean target encoding (which leaks the target and overfits), CatBoost encodes categorical features online using only the prior history of instances:
            </p>

            <MathBlock
              label="CatBoost Ordered Target Statistic with Prior"
              formula="\hat{x}_k^i = \frac{\sum_{j=1}^{p-1} \mathbb{I}(x_{\sigma_j, k} = x_{\sigma_p, k}) \cdot y_{\sigma_j} + a \cdot P}{\sum_{j=1}^{p-1} \mathbb{I}(x_{\sigma_j, k} = x_{\sigma_p, k}) + a}"
              terms={[
                ["\\sigma", "A random permutation of the training indices {1, ..., n}"],
                ["p", "The rank/position of current sample i in permutation \\sigma"],
                ["P", "Prior value: overall mean of the target variable across the entire dataset"],
                ["a > 0", "Weight coefficient of the prior (smoothes categories with few observations)"],
              ]}
              note="Because the target of sample i is NEVER included in its own statistic, target leakage is mathematically impossible."
            />
          </div>

          <div className="rounded border border-hairline bg-surface p-5">
            <div className="font-display text-base font-semibold text-violet">
              Symmetric (Oblivious) Trees
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Unlike XGBoost and LightGBM (which evaluate independent splits at each branch), CatBoost trees are <strong>symmetric</strong>: the identical feature and split threshold are applied across all nodes at the same tree depth.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded border border-hairline/60 bg-surface-2 p-3">
                <span className="font-semibold text-lime">Regularization Benefit:</span> Drastically restricts model search space, preventing complex idiosyncratic branch overfitting.
              </div>
              <div className="rounded border border-hairline/60 bg-surface-2 p-3">
                <span className="font-semibold text-cyan">Inference Speed:</span> A symmetric tree with depth d can be evaluated as an index lookup via bitwise SIMD instructions in CPU registers: <InlineMath formula="\text{index} = \sum_{k=0}^{d-1} 2^k \cdot \mathbb{I}(x_{f_k} > \theta_k)" />.
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* SECTION 3: 5-WAY COMPARISON MATRIX */}
      <Container className="pb-20">
        <SectionHeader
          id="comparison-matrix"
          index="03"
          eyebrow="Comparative Matrix"
          title="5-Way Comprehensive Algorithm Comparison"
          description="A rigorous comparison of AdaBoost, Gradient Boosting, XGBoost, LightGBM, and CatBoost across 8 architectural criteria."
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <ComparisonTable
            columns={["Feature / Dimension", "AdaBoost", "GBM (Scikit-Learn)", "XGBoost", "LightGBM", "CatBoost"]}
            rows={[
              ["First Author & Year", "Freund & Schapire (1995/1997)", "J. Friedman (1999/2001)", "Chen & Guestrin (2014/2016)", "Ke et al. (Microsoft, 2017)", "Prokhorenkova et al. (Yandex, 2018)"],
              ["Loss Optimization", "Exponential loss only", "1st-order pseudo-residuals", "2nd-order Taylor (g & h)", "2nd-order Taylor (g & h)", "Ordered functional gradient"],
              ["Tree Growth Policy", "Decision Stumps (depth 1)", "Level-wise (depth-first)", "Level-wise (default) or leaf-wise", "Leaf-wise (best-first)", "Symmetric / Oblivious (SIMD)"],
              ["Continuous Splits", "Exact threshold search", "Exact pre-sort (HistGBM binned)", "Exact greedy & Quantile sketch / hist", "Histogram binning (256 integer bins)", "Histogram binning (dynamic borders)"],
              ["Categorical Handling", "Requires one-hot encoding", "Requires one-hot / Ordinal", "Partition splits / one-hot", "Integer histogram categorical splits", "Ordered Target Statistics (online)"],
              ["Missing Value Policy", "Requires manual imputation", "Imputation (native in HistGBM)", "Sparsity-aware default direction", "Dedicated NaN histogram bin", "Min / Max float allocation"],
              ["Training Speed (CPU)", "Fast on small; CPU only", "Slow on large N (exact pre-sort)", "Fast with tree_method='hist'", "Fastest on large dense tabular (N > 10⁵)", "Moderate on CPU, fastest on GPU"],
              ["Inference Latency", "Fast (stump summation)", "Standard sequential tree traversal", "Fast (low-latency C++ / Treelite)", "Fast (low-latency C++ / Treelite)", "Fastest CPU scoring (SIMD bitmask)"],
            ]}
          />
          <WarningCallout title="Benchmarking Qualification: No Universal Winner">
            Algorithm speed and accuracy rankings are strictly context-dependent. On datasets with millions of rows, LightGBM often trains fastest on CPU; on datasets with rich high-cardinality categorical features, CatBoost typically achieves higher out-of-the-box accuracy; on GPU clusters with custom loss objectives, XGBoost provides granular second-order control. Always evaluate on your specific dataset geometry.
          </WarningCallout>
        </div>
      </Container>

      {/* SECTION 4: INTERACTIVE EXPLORER */}
      <Container className="pb-20">
        <SectionHeader
          id="interactive-explorer"
          index="04"
          eyebrow="Interactive Benchmarking"
          title="Algorithm Explorer & Trait Profiles"
          description="Select any algorithm to drill down into its mechanism, strengths, limitations, and trait ratings."
        />
        <div className="md:ml-[136px]">
          <AlgorithmExplorer detailed />
        </div>
      </Container>

      {/* SECTION 5: SELECTION GUIDE */}
      <Container className="pb-20">
        <SectionHeader
          id="selection-guide"
          index="05"
          eyebrow="Practical Guidance"
          title="When to Choose Which Algorithm?"
          description="No boosting algorithm is universally superior. Your choice should depend on dataset geometry, latency constraints, and hardware."
        />
        <div className="max-w-4xl space-y-4 md:ml-[136px]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-mono text-xs font-semibold text-lime">Choose LightGBM If:</div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li>• Dataset has &gt; 500,000 rows.</li>
                <li>• RAM or memory footprint is constrained.</li>
                <li>• Training throughput / fast iterations are essential.</li>
                <li>• Features are primarily numeric.</li>
              </ul>
            </div>

            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-mono text-xs font-semibold text-violet">Choose CatBoost If:</div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li>• Dataset contains many high-cardinality categorical features (ZIP codes, IDs).</li>
                <li>• You need robust out-of-the-box defaults with minimal hyperparameter tuning.</li>
                <li>• Ultra-low latency microsecond scoring is needed in production.</li>
              </ul>
            </div>

            <div className="rounded border border-hairline bg-surface p-5">
              <div className="font-mono text-xs font-semibold text-cyan">Choose XGBoost If:</div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li>• Dataset is medium size (10k to 500k rows).</li>
                <li>• You need granular control over L1/L2 leaf regularization.</li>
                <li>• You require custom loss objectives with 1st/2nd derivatives.</li>
                <li>• Proven cross-platform enterprise stability is critical.</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* SECTION 6: CODE IMPLEMENTATIONS */}
      <Container className="pb-20">
        <SectionHeader
          id="code-implementations"
          index="06"
          eyebrow="Code Example"
          title="Python Implementations: LightGBM & CatBoost"
        />
        <div className="max-w-4xl space-y-6 md:ml-[136px]">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2 font-mono text-xs">
              <span>lightgbm_catboost_comparison.py</span>
              <span className="text-cyan">Python 3.10+</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
{`import lightgbm as lgb
from catboost import CatBoostClassifier, Pool
from sklearn.metrics import roc_auc_score

# ==========================================
# 1. LIGHTGBM PIPELINE
# ==========================================
lgb_model = lgb.LGBMClassifier(
    n_estimators=1000,
    learning_rate=0.03,
    num_leaves=31,              # controls complexity in leaf-wise growth
    max_depth=-1,               # unconstrained depth; regulated by num_leaves
    boosting_type="gbdt",       # or 'goss' for gradient-based sampling
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
)
lgb_model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    callbacks=[lgb.early_stopping(stopping_rounds=50, verbose=False)],
)
lgb_auc = roc_auc_score(y_val, lgb_model.predict_proba(X_val)[:, 1])
print(f"LightGBM ROC-AUC: {lgb_auc:.4f}")

# ==========================================
# 2. CATBOOST PIPELINE (Native Categorical Handling)
# ==========================================
cat_features = ["occupation", "education_level", "home_ownership"]

cb_model = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.03,
    depth=6,                    # symmetric tree depth
    cat_features=cat_features,  # passed directly without one-hot encoding!
    eval_metric="AUC",
    early_stopping_rounds=50,
    random_seed=42,
    verbose=False
)
cb_model.fit(X_train, y_train, eval_set=(X_val, y_val))
cb_auc = roc_auc_score(y_val, cb_model.predict_proba(X_val)[:, 1])
print(f"CatBoost ROC-AUC: {cb_auc:.4f}")`}
            </pre>
          </div>
        </div>
      </Container>

      {/* SECTION 7: QUIZ */}
      <Container className="pb-24">
        <SectionHeader
          id="quiz"
          index="07"
          eyebrow="Assessment"
          title="Knowledge Check"
        />
        <div className="max-w-4xl md:ml-[136px]">
          <QuizBlock
            title="Modern Boosting Algorithms Quiz"
            questions={[
              {
                id: "q1",
                question: "How does LightGBM's leaf-wise (best-first) tree growth differ from XGBoost's traditional level-wise tree growth?",
                options: [
                  "Leaf-wise always splits all nodes at a given depth simultaneously",
                  "Leaf-wise splits the single leaf that yields the highest loss reduction regardless of its depth in the tree",
                  "Leaf-wise creates binary trees while level-wise creates ternary trees",
                  "Leaf-wise can only be used for linear regression",
                ],
                correctIndex: 1,
                explanation: "Leaf-wise chooses the leaf with maximum delta loss reduction to split, achieving lower loss than depth-wise algorithms with the same number of splits.",
              },
              {
                id: "q2",
                question: "What is target leakage, and how does CatBoost's Ordered Boosting mathematically eliminate it?",
                options: [
                  "Target leakage occurs when test data is used in cross-validation; CatBoost prevents it with K-fold CV",
                  "Target leakage occurs when sample i's target is used to calculate its own pseudo-residual; CatBoost uses permutations where models only see samples preceding i",
                  "Target leakage occurs when continuous features are binned into histograms",
                  "Target leakage is when learning rate is greater than 1.0",
                ],
                correctIndex: 1,
                explanation: "In standard boosting, the model evaluating sample i was trained on data containing sample i, causing prediction shift. CatBoost creates random permutations of the dataset and ensures that the model used to estimate i's gradient is trained strictly on observations prior to i in that sequence.",
              },
              {
                id: "q3",
                question: "Why do CatBoost's symmetric (oblivious) trees provide an advantage in high-throughput production environments?",
                options: [
                  "They eliminate the need for GPU servers",
                  "All nodes at depth d share the same split condition, enabling tree evaluation via bitwise SIMD operations in CPU registers without branching",
                  "They never require hyperparameter tuning",
                  "They can run inside relational SQL databases without compiling",
                ],
                correctIndex: 1,
                explanation: "Because the split condition at level k is identical across all nodes, each observation's leaf index can be computed directly as a binary bitmask using vector CPU instructions, resulting in sub-millisecond scoring latencies.",
              },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
