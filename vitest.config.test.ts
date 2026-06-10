import { describe, expect, it } from "vitest";

import config from "./vitest.config";

describe("vitest.config", () => {
  const testConfig = config.test;

  it("uses the node environment", () => {
    expect(testConfig.environment).toBe("node");
  });

  it("includes test files under src, tests, and the repo root", () => {
    expect(testConfig.include).toEqual([
      "src/**/*.test.ts",
      "tests/**/*.test.ts",
      "./*.test.ts",
    ]);
  });

  it("includes the root-level glob to discover co-located test files", () => {
    expect(testConfig.include).toContain("./*.test.ts");
  });

  it("excludes node_modules and dist", () => {
    expect(testConfig.exclude).toContain("node_modules");
    expect(testConfig.exclude).toContain("dist");
  });

  it("sets a test timeout", () => {
    expect(testConfig.testTimeout).toBeTypeOf("number");
    expect(testConfig.testTimeout).toBeGreaterThan(0);
  });
});
