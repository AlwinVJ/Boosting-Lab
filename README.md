# BOOSTING LAB

### From Weak Learners to Powerful Predictions.

An interactive educational platform dedicated to understanding **Boosting Algorithms in Machine Learning**, exploring their mathematical foundations, working mechanisms, Python implementations, optimization techniques, and real-world applications.

---

## About the Project

Boosting Lab is an interactive educational platform designed to make ensemble learning and boosting algorithms intuitive and mathematically rigorous. The platform explores how multiple weak learners with high bias can be combined sequentially into robust, high-precision predictive models.

Rather than treating algorithms as black boxes (`import model; model.fit()`), Boosting Lab bridges the gap between mathematical proofs, algorithmic implementations, and real-world machine learning engineering.

---

## Data Transparency & Educational Scope Notice

Boosting Lab is an interactive educational research and pedagogical platform:
* **Demonstration Datasets:** The credit risk dataset featured in `/implementation` and `/case-study` is a 5,000-sample synthetic pedagogical dataset deterministically generated via `src/data/credit-dataset-generator.ts` (Mulberry32 PRNG seed 42) to illustrate consumer loan underwriting workflows, asymmetric error costs, and adverse action explanations. It does not represent live bank customer records.
* **Model Predictions & Outputs:** Terminal outputs, benchmark comparison metrics, and confusion matrix illustrations are educational demonstrations intended to highlight comparative performance tradeoffs across algorithms, not production financial underwriting guarantees.
* **Regulatory Frameworks:** Legal and regulatory references (ECOA / Regulation B, FCRA, SR 11-7) reflect US statutory requirements and supervisory standards as of mid-2025. CFPB Circulars 2022-03 and 2023-03 were withdrawn on May 12, 2025; statutory mandates under ECOA (15 U.S.C. § 1691) and Regulation B (12 CFR § 1002.9) remain in effect. This platform is strictly educational and does not constitute formal legal, credit underwriting, or financial advice.

---

## Complete Curriculum Architecture

The curriculum is organized into **nine comprehensive educational modules**:

### 01. Fundamentals of Boosting (`/fundamentals`)
* Introduction to Ensemble Learning (homogeneous vs. heterogeneous ensembles, Condorcet's Jury Theorem).
* The Bias-Variance-Noise Decomposition ($\text{MSE} = \text{Bias}^2 + \text{Variance} + \sigma^2$).
* Schapire's Weak Learning Theorem and PAC Learning foundations.
* Boosting vs. Bagging (parallel variance reduction vs. sequential bias reduction).
* Forward Stagewise Additive Modeling formulation ($F_M(x) = \sum_{m=1}^M \alpha_m h_m(x)$).

### 02. AdaBoost: Adaptive Boosting (`/adaboost`)
* Core intuition of adaptive sample reweighting and decision stumps.
* Mathematical derivation of weighted classification error ($\epsilon_m$), estimator weight ($\alpha_m$), and normalization factor ($Z_m$).
* Exponential loss equivalence and sensitivity to outlier noise.
* Python implementation with Scikit-Learn `AdaBoostClassifier`.
* Interactive numerical walkthrough and knowledge check quiz.

### 03. Gradient Boosting Machines (`/gradient-boosting`)
* Jerome Friedman's functional gradient descent in function space.
* Residual learning and step-by-step numerical calculation.
* Mathematical derivation of pseudo-residuals ($r_{im} = -\left[\frac{\partial L(y_i, F(x_i))}{\partial F(x_i)}\right]$).
* Common loss functions: Squared Error, Absolute Error (L1), Binary Deviance, Huber Loss.
* Shrinkage (learning rate $\nu$), line search, and terminal leaf optimization ($\gamma_{jm}$).
* Scikit-Learn implementation with `GradientBoostingRegressor` and `GradientBoostingClassifier`.

### 04. XGBoost: Extreme Gradient Boosting (`/xgboost`)
* The regularized objective function: $\mathcal{L}^{(t)} = \sum l(y_i, \hat{y}_i^{(t-1)} + f_t(x_i)) + \Omega(f_t)$.
* Second-order Taylor expansion with first ($g_i$) and second ($h_i$) derivatives.
* Analytical derivation of optimal leaf weight ($w_j^* = -\frac{G_j}{H_j + \lambda}$) and structure score.
* Split Gain formula with complexity penalty $\gamma$: $\text{Gain} = \frac{1}{2}\left[\frac{G_L^2}{H_L+\lambda} + \frac{G_R^2}{H_R+\lambda} - \frac{(G_L+G_R)^2}{H_L+H_R+\lambda}\right] - \gamma$.
* Sparsity-aware split finding for missing values and zero-entries.
* Multi-parameter regularization ($\gamma, \lambda, \alpha, \text{min\_child\_weight}$) and Python `xgboost` implementation.

### 05. Modern Boosting Ecosystem: LightGBM & CatBoost (`/algorithms`)
* **LightGBM:** Histogram-based split finding (configurable bin count via `max_bin`, default 255 discrete bins), Leaf-wise (best-first) tree growth, GOSS (Gradient-based One-Side Sampling), and Exclusive Feature Bundling (EFB).
* **CatBoost:** Ordered Boosting to mitigate prediction shift and self-target leakage in categorical encoding, Ordered Target Statistics with prior $P$, and symmetric (oblivious) trees for SIMD bitwise inference.
* **Comprehensive 5-Way Comparison Matrix:** AdaBoost vs. GBM vs. XGBoost vs. LightGBM vs. CatBoost.
* Practical selection guide: when to use which boosting framework based on dataset geometry.

### 06. Practical Implementation Lab (`/implementation`)
* Tabular dataset exploration (features, distributions, target imbalance).
* Data preprocessing and strict temporal leakage prevention (scale-invariance of tree splits).
* Multi-model Python workbench: reproducible scripts for AdaBoost, GBM, XGBoost, LightGBM, and CatBoost.
* Evaluation metrics deep dive: ROC-AUC vs. PR-AUC, Confusion Matrix, MAE, MSE, and RMSE.
* Feature importance methods: Gain, Weight, Cover, Permutation Importance, and TreeSHAP.
* The vital distinction between statistical feature importance and causal interpretation.

### 07. Hyperparameter Tuning & Optimization (`/hyperparameters`)
* The 5-stage systematic boosting tuning protocol.
* Interactive directory of key parameters across GBM and XGBoost.
* Critical interaction effects: Learning Rate $\times$ Estimators, Depth $\times$ Overfitting Gap.
* Comparison of search strategies: GridSearchCV vs. RandomizedSearchCV vs. Bayesian Optimization.
* Full production Python script for Bayesian hyperparameter tuning using Optuna.

### 08. Advanced Boosting Techniques (`/advanced`)
* Learning rate shrinkage theory, asymptotic decay, and empirical scaling rules.
* Early stopping dynamics: validation curve monitoring, patience parameters, and optimal iteration restoration.
* Multi-layered overfitting defense across tree architecture, row subsampling, and feature subsampling.
* Imbalanced classification: `scale_pos_weight` mathematics, PR-AUC optimization, and cost-sensitive threshold shifting.

### 09. Real-World Case Study: Credit Risk Prediction (`/case-study`)
* Business problem framing: financial consequences of asymmetric error costs ($C_{\text{FN}} \gg C_{\text{FP}}$).
* Exploratory analysis of a 5,000-sample synthetic consumer credit demonstration dataset.
* Leak-proof feature engineering: leverage ratios, adjusted DTI, and payment risk indices.
* Model benchmarking: Logistic Regression baseline vs. Random Forest vs. GBM vs. tuned XGBoost.
* Expected loss minimization via cost-optimal decision thresholding ($\theta^* \approx 0.074$) vs commercial volume threshold ($\theta = 0.18$).
* Individual loan decision explainability using TreeSHAP as a local feature attribution technique, distinguishing mathematical Shapley attributions from legal and regulatory adverse action compliance (FCRA / ECOA / Regulation B).
* Production challenges: concept drift (PSI monitoring), algorithmic fairness (Four-Fifths Rule), and regulatory governance (SR 11-7).

### Resources & Bibliography (`/resources`)
* Primary foundational research papers (Schapire 1990, Freund & Schapire 1997, Friedman 2001, Chen & Guestrin 2016, Ke et al. 2017, Prokhorenkova et al. 2018, Lundberg et al. 2020).
* Canonical statistical machine learning textbooks (Hastie, Tibshirani, Friedman 2009; Schapire & Freund 2012).
* Official documentation and developer resources for Scikit-Learn, XGBoost, LightGBM, CatBoost, SHAP, and Optuna.

---

## Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern declarative UI component library |
| **TypeScript** | Strict type safety with `exactOptionalPropertyTypes` |
| **Vite 8** | Ultra-fast build tool and local development server |
| **TanStack Router & Start** | Type-safe file-based routing and SSR application shell |
| **KaTeX** | Fast, high-fidelity LaTeX mathematical formula rendering |
| **Tailwind CSS v4** | Dark-mode design system with semantic lab tokens |
| **Recharts** | Interactive SVG charting for loss curves and metrics |
| **Framer Motion** | Visual transitions and sequential step animations |
| **Lucide React** | Consistent, lightweight SVG icon system |
| **Vitest** | Fast unit and integration route testing |

---

## Getting Started Locally

### Prerequisites
* **Node.js** (v20.0.0 or higher; tested on v22.17.1)
* **npm** (v10.0.0 or higher; tested on v10.9.9)

### 1. Clone the Repository
```bash
git clone https://github.com/alwinvj/boosting-lab.git
cd boosting-lab
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Start the Local Development Server
```bash
npm run dev
```
Open your browser at the local port printed in the terminal (typically `http://localhost:3000` or `http://localhost:5173`).

### 4. Run TypeScript Check
```bash
npx tsc --noEmit
```

### 5. Run Automated Tests
```bash
npm run test
```

### 6. Build for Production & Static Prerendering
```bash
npm run build
```
This runs `vite build` followed by `node scripts/prepare-gh-pages.mjs`. It compiles the client and SSR bundles, executes TanStack Start's prerender engine across all 11 curriculum routes, copies `index.html` to `404.html` for client-side routing fallback, and creates `.nojekyll` to prevent GitHub Pages from bypassing underscore-prefixed asset directories.

The static deployment artifact is stored in `.output/public/`.

To preview the production build locally:
```bash
npm run preview
```

---

## Deploying to GitHub Pages

Boosting Lab is configured for seamless static hosting on **GitHub Pages** using GitHub Actions with a manual trigger (`workflow_dispatch`).

### 1. One-Time GitHub Repository Configuration
1. Open your repository on GitHub: `https://github.com/alwinvj/boosting-lab`.
2. Navigate to **Settings** (top navigation tab) → **Pages** (in the left sidebar under *Code and automation*).
3. Under **Build and deployment** → **Source**, change the dropdown from *Deploy from a branch* to **GitHub Actions**.
4. (No branch or folder selection is needed when using GitHub Actions).

### 2. Triggering the Deployment Workflow
Deployments are configured with a manual trigger so you have full control over when releases go live:
1. In your repository, click the **Actions** tab.
2. In the left workflow list, click **Deploy to GitHub Pages**.
3. Click the **Run workflow** button on the right side.
4. Ensure the `main` branch is selected, then click the green **Run workflow** button.
5. The workflow will execute:
   * **build**: Checks out code, sets up Node.js 22, installs dependencies (`npm ci`), runs TypeScript check (`npx tsc --noEmit`), runs unit tests (`npm test`), builds static prerendered HTML with `BASE_PATH: /Boosting-Lab/`, and uploads the `.output/public` artifact.
   * **deploy**: Publishes the artifact to GitHub Pages with OpenID Connect (OIDC) token authentication.

### 3. Verifying Your Deployment
Once the deployment job completes, your live site will be accessible at:
```
https://alwinvj.github.io/Boosting-Lab/
```
Verify that:
* The website loads with dark theme styling, KaTeX formulas, and images.
* Navigation links smoothly transition between all 11 modules (`/fundamentals`, `/adaboost`, `/gradient-boosting`, `/xgboost`, `/algorithms`, `/implementation`, `/hyperparameters`, `/advanced`, `/case-study`, `/resources`).
* Refreshing any subpage (e.g. `/case-study`) directly in the browser reloads correctly without 404 errors.

### 4. Deploying Subsequent Updates
Whenever you make further improvements to the codebase:
1. Commit your changes to the `main` branch.
2. Go to the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow** to publish the new version.

---

## Design System & Architecture

* **Dark-Only Aesthetic:** Designed around machine learning lab research interfaces using semantic OKLCH tokens (`--violet`, `--cyan`, `--orange`, `--lime`, `--surface`, `--hairline`).
* **In-Page Sticky Section Indexes:** Replaces static sidebar clutter with sticky contextual navigation across chapters.
* **Separation of Concerns:** Structured curriculum metadata lives in `src/data/curriculum.ts`; educational primitives (`MathBlock`, `QuizBlock`, `DerivationStep`, `WorkedExample`) live in `src/components/lab/`.

---

## Author

**Alwin V J**
* Machine Learning & Data Science Enthusiast
* GitHub: [@alwinvj](https://github.com/alwinvj)

---

*Boosting Lab — Understand the mathematics. Explore the algorithms. Build powerful models.*
