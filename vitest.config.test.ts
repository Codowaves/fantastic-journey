import { describe, expect, it } from "vitest";

import config from "./vitest.config";

describe("vitest.config", () => {
  it("exports a test block with the expected top-level keys", () => {
    expect(config).toBeDefined();
    expect(config).toHaveProperty("test");
  });

  it("configures the node environment", () => {
    expect(config.test?.environment).toBe("node");
  });

  it("matches .test.ts files under src and tests directories", () => {
    const include = config.test?.include;
    expect(include).toBeDefined();
    expect(include).toContain("src/**/*.test.ts");
    expect(include).toContain("tests/**/*.test.ts");
  });

  it("excludes node_modules and dist from the test run", () => {
    const exclude = config.test?.exclude;
    expect(exclude).toBeDefined();
    expect(exclude).toContain("node_modules");
    expect(exclude).toContain("dist");
  });

  it("sets a 30 second test timeout", () => {
    expect(config.test?.testTimeout).toBe(30000);
  });

  it("does not configure jsdom or browser environments", () => {
    expect(config.test?.environment).not.toBe("jsdom");
    expect(config.test?.environment).not.toBe("happy-dom");
  });

  it("does not include the legacy or wip source trees when missing from include patterns", () => {
    const include = config.test?.include ?? [];
    const joined = include.join("|");
    expect(joined).not.toMatch(/legacy/);
    expect(joined).not.toMatch(/wip/);
  });
});
