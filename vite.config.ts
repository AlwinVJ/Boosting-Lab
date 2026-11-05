import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const basePath =
  process.env["BASE_PATH"] ||
  (process.env["GITHUB_REPOSITORY"]
    ? `/${process.env["GITHUB_REPOSITORY"].split("/")[1]}/`
    : process.env["NODE_ENV"] === "production"
      ? "/Boosting-Lab/"
      : "/");

export default defineConfig({
  base: basePath,
  plugins: [
    tanstackStart({
      server: { entry: "server" },
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
      pages: [
        { path: "/" },
        { path: "/fundamentals" },
        { path: "/adaboost" },
        { path: "/gradient-boosting" },
        { path: "/xgboost" },
        { path: "/algorithms" },
        { path: "/implementation" },
        { path: "/hyperparameters" },
        { path: "/advanced" },
        { path: "/case-study" },
        { path: "/resources" },
      ],
    }),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
