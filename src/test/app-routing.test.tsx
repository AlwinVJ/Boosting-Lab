import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("App curriculum routing", () => {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
  });

  const routesToTest = [
    { path: "/", name: "Home" },
    { path: "/fundamentals", name: "Module 01: Fundamentals" },
    { path: "/adaboost", name: "Module 02: AdaBoost" },
    { path: "/gradient-boosting", name: "Module 03: Gradient Boosting" },
    { path: "/xgboost", name: "Module 04: XGBoost" },
    { path: "/algorithms", name: "Module 05: Modern Algorithms" },
    { path: "/implementation", name: "Module 06: Implementation Lab" },
    { path: "/hyperparameters", name: "Module 07: Hyperparameters" },
    { path: "/advanced", name: "Module 08: Advanced Techniques" },
    { path: "/case-study", name: "Module 09: Credit Risk Case Study" },
    { path: "/resources", name: "Resources & Bibliography" },
  ];

  routesToTest.forEach(({ path, name }) => {
    it(`correctly resolves ${name} at route "${path}"`, () => {
      const matches = router.matchRoutes(path);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
      expect(matches.at(-1)?.routeId).toBe(path === "/" ? "/" : path);
    });
  });
});
