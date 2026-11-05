import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Support both TanStack Start native (dist/client) and Nitro legacy (.output/public)
const candidateDirs = [
  resolve("dist", "client"),
  resolve(".output", "public"),
];

const publicDir = candidateDirs.find((dir) => existsSync(dir));

if (!publicDir) {
  console.error("Error: Neither dist/client nor .output/public directory exists. Run vite build first.");
  process.exit(1);
}

console.log(`Detected static build output directory: ${publicDir}`);

// 1. Copy index.html -> 404.html for GitHub Pages SPA client-side fallback
const indexPath = resolve(publicDir, "index.html");
const fallbackPath = resolve(publicDir, "404.html");

if (existsSync(indexPath)) {
  copyFileSync(indexPath, fallbackPath);
  console.log("Successfully created 404.html fallback for GitHub Pages.");
} else {
  console.error(`Error: index.html not found in ${publicDir}.`);
  process.exit(1);
}

// 2. Create .nojekyll to prevent GitHub Pages from bypassing underscore-prefixed files
const nojekyllPath = resolve(publicDir, ".nojekyll");
writeFileSync(nojekyllPath, "", "utf8");
console.log(`Successfully created .nojekyll in ${publicDir}.`);

// 3. Verify prerendered route directories
const expectedRoutes = [
  "fundamentals",
  "adaboost",
  "gradient-boosting",
  "xgboost",
  "algorithms",
  "implementation",
  "hyperparameters",
  "advanced",
  "case-study",
  "resources",
];

let allRoutesPresent = true;
for (const route of expectedRoutes) {
  const routeHtml = resolve(publicDir, route, "index.html");
  if (!existsSync(routeHtml)) {
    console.warn(`Warning: Route index missing for /${route} at ${routeHtml}`);
    allRoutesPresent = false;
  }
}

if (allRoutesPresent) {
  console.log(`Verified all ${expectedRoutes.length} nested route index.html files exist in ${publicDir}.`);
}
