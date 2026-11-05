import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

const testRouter = createRouter({
  routeTree,
  context: { queryClient: new QueryClient() },
});

describe("App curriculum routing", () => {
  const router = testRouter;

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

describe("Curriculum & Algorithm Data Integrity", () => {
  it("contains all 9 academic modules with complete topic coverage", async () => {
    const { CURRICULUM_MODULES } = await import("@/data/curriculum");
    expect(CURRICULUM_MODULES).toHaveLength(9);
    CURRICULUM_MODULES.forEach((m) => {
      expect(m.title).toBeTruthy();
      expect(m.to).toBeTruthy();
      expect(m.topics.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("contains all 5 canonical boosting algorithms with verified technical fields", async () => {
    const { ALGORITHMS } = await import("@/data/content");
    expect(ALGORITHMS).toHaveLength(5);
    const expectedKeys = ["adaboost", "gbm", "xgboost", "lightgbm", "catboost"];
    expect(ALGORITHMS.map((a) => a.key)).toEqual(expectedKeys);
    ALGORITHMS.forEach((a) => {
      expect(a.name).toBeTruthy();
      expect(a.overview).toBeTruthy();
      expect(a.mechanism).toBeTruthy();
      expect(a.strengths.length).toBeGreaterThan(0);
      expect(a.limitations.length).toBeGreaterThan(0);
      expect(a.applications.length).toBeGreaterThan(0);
    });
  });
});

describe("Brand & Navigation Logo", () => {
  it("imports valid logo image asset for header and footer", async () => {
    const logoModule = await import("@/assets/boosting-lab-icon.jpg");
    expect(logoModule.default).toBeTruthy();
    expect(logoModule.default).toMatch(/boosting-lab-icon/);
  });

  it("exports Logo component configured with valid image asset and alt text", async () => {
    const { Logo } = await import("@/components/lab/NavigationBar");
    expect(Logo).toBeTypeOf("function");
    const logoElement = Logo();
    expect(logoElement.type).toBeTruthy();
    const children = logoElement.props.children;
    expect(children).toHaveLength(2);
    const imgElement = children[0];
    expect(imgElement.props.src).toMatch(/boosting-lab-icon/);
    expect(imgElement.props.alt).toBe("Boosting Lab logo");
    expect(imgElement.props.width).toBe(28);
    expect(imgElement.props.height).toBe(28);
  });
});
