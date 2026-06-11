import { describe, it, expect } from "vitest";
import config from "../vitest.config";

describe("vitest.config.ts", () => {
  describe("configuration structure", () => {
    it("should export a valid Vitest config object", () => {
      expect(config).toBeDefined();
      expect(config).toBeTypeOf("object");
    });

    it("should have a test configuration section", () => {
      expect(config.test).toBeDefined();
      expect(config.test).toBeTypeOf("object");
    });
  });

  describe("test environment", () => {
    it("should use node environment", () => {
      expect(config.test?.environment).toBe("node");
    });
  });

  describe("test file patterns", () => {
    it("should include test files from src and tests directories", () => {
      expect(config.test?.include).toEqual([
        "src/**/*.test.ts",
        "tests/**/*.test.ts",
      ]);
    });

    it("should exclude node_modules and dist directories", () => {
      expect(config.test?.exclude).toEqual(["node_modules", "dist"]);
    });
  });

  describe("test timeout", () => {
    it("should set timeout to 30 seconds", () => {
      expect(config.test?.testTimeout).toBe(30000);
    });

    it("should have a reasonable timeout value (positive number)", () => {
      const timeout = config.test?.testTimeout;
      expect(timeout).toBeTypeOf("number");
      expect(timeout).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle missing optional config properties gracefully", () => {
      // Verify the config doesn't break if properties are accessed
      expect(() => config.test?.globals).not.toThrow();
      expect(() => config.test?.coverage).not.toThrow();
    });

    it("should have include patterns that are non-empty arrays", () => {
      const include = config.test?.include;
      expect(Array.isArray(include)).toBe(true);
      if (Array.isArray(include)) {
        expect(include.length).toBeGreaterThan(0);
      }
    });
  });
});
