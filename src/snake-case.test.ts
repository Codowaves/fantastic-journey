import { describe, expect, it } from "vitest";

import { snakeCase } from "./snake-case";

describe("snakeCase", () => {
  it("converts camelCase to snake_case", () => {
    expect(snakeCase("helloWorld")).toBe("hello_world");
  });

  it("converts PascalCase to snake_case", () => {
    expect(snakeCase("HelloWorld")).toBe("hello_world");
  });

  it("converts kebab-case to snake_case", () => {
    expect(snakeCase("hello-world")).toBe("hello_world");
  });

  it("converts space-separated words to snake_case", () => {
    expect(snakeCase("Hello World")).toBe("hello_world");
  });

  it("returns an empty string when given an empty string", () => {
    expect(snakeCase("")).toBe("");
  });

  it("strips non-alphanumeric characters", () => {
    expect(snakeCase("Hello, World!")).toBe("hello_world");
  });
});
