import { describe, expect, it } from "vitest";

import { kebabCase } from "./kebab-case";

describe("kebabCase", () => {
  it("lowercases and hyphenates a space-separated phrase", () => {
    expect(kebabCase("Hello World")).toBe("hello-world");
  });

  it("converts camelCase to kebab-case", () => {
    expect(kebabCase("helloWorld")).toBe("hello-world");
  });

  it("collapses consecutive non-alphanumeric characters into a single hyphen", () => {
    expect(kebabCase("foo___bar---baz")).toBe("foo-bar-baz");
  });

  it("strips leading and trailing hyphens", () => {
    expect(kebabCase("---hello---")).toBe("hello");
  });

  it("returns an empty string for an empty input", () => {
    expect(kebabCase("")).toBe("");
  });

  it("returns an empty string for input that has no alphanumeric characters", () => {
    expect(kebabCase("!!! ???")).toBe("");
  });
});
