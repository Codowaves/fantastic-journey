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

  it("returns the single character unchanged for a one-letter lowercase input", () => {
    expect(kebabCase("a")).toBe("a");
  });

  it("lowercases a one-letter uppercase input", () => {
    expect(kebabCase("A")).toBe("a");
  });

  it("preserves a digits-only input", () => {
    expect(kebabCase("123")).toBe("123");
  });

  it("converts PascalCase to kebab-case", () => {
    expect(kebabCase("HelloWorld")).toBe("hello-world");
  });

  it("converts snake_case to kebab-case", () => {
    expect(kebabCase("hello_world")).toBe("hello-world");
  });

  it("preserves digits inside words", () => {
    expect(kebabCase("item 42 price")).toBe("item-42-price");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(kebabCase("   ")).toBe("");
  });

  it("throws on null input", () => {
    expect(() => kebabCase(null as unknown as string)).toThrow(TypeError);
  });

  it("throws on undefined input", () => {
    expect(() => kebabCase(undefined as unknown as string)).toThrow(TypeError);
  });

  it("throws when given a non-string type", () => {
    expect(() => kebabCase(42 as unknown as string)).toThrow(TypeError);
  });

  it("converts an acronym followed by a word boundary to kebab-case", () => {
    expect(kebabCase("ABCDef")).toBe("abc-def");
  });

  it("converts consecutive uppercase letters followed by a lowercase word", () => {
    expect(kebabCase("XMLHttpRequest")).toBe("xml-http-request");
  });

  it("handles a leading digit", () => {
    expect(kebabCase("123abc")).toBe("123abc");
  });

  it("handles digits immediately followed by uppercase letters", () => {
    expect(kebabCase("foo2Bar")).toBe("foo2-bar");
  });

  it("normalizes tabs and newlines like other non-alphanumeric characters", () => {
    expect(kebabCase("foo\tbar\nbaz")).toBe("foo-bar-baz");
  });

  it("strips hyphens produced by adjacent uppercase-digits-uppercase boundaries", () => {
    expect(kebabCase("A1B")).toBe("a1-b");
  });

  it("handles mixed underscores, dashes, and spaces as a single separator", () => {
    expect(kebabCase("foo_bar-baz qux")).toBe("foo-bar-baz-qux");
  });

  it("preserves a single alphanumeric character surrounded by separators", () => {
    expect(kebabCase("___a___")).toBe("a");
  });

  it("handles a string containing only hyphens", () => {
    expect(kebabCase("---")).toBe("");
  });

  it("returns an empty string for input containing only non-alphanumeric punctuation", () => {
    expect(kebabCase("!@#$%^&*()")).toBe("");
  });

  it("throws when given an object", () => {
    expect(() => kebabCase({} as unknown as string)).toThrow(TypeError);
  });

  it("throws when given an array", () => {
    expect(() => kebabCase([] as unknown as string)).toThrow(TypeError);
  });

  it("throws when given a boolean", () => {
    expect(() => kebabCase(true as unknown as string)).toThrow(TypeError);
  });
});
