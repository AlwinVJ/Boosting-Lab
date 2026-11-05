import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const basePath =
  process.env["BASE_PATH"] ||
  (process.env["GITHUB_REPOSITORY"]
    ? `/${process.env["GITHUB_REPOSITORY"].split("/")[1]}/`
    : process.env["NODE_ENV"] === "production"
      ? "/Boosting-Lab/"
      : "/");

const routes = [
  "",
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

const prerenderPages = routes.map((r) => ({
  path: `${basePath.replace(/\/$/, "")}/${r}`.replace(/^\/\//, "/"),
}));

export default defineConfig({
  base: basePath,
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart({
      server: { entry: "server" },
      router: {
        basepath: basePath,
      },
      prerender: {
        enabled: true,
        crawlLinks: false,
        autoStaticPathsDiscovery: false,
      },
      pages: prerenderPages,
    }),
    viteReact(),
    tailwindcss(),
  ],
});
