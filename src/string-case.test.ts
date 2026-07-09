import { describe, expect, it } from "vitest";

import { toCamel, toKebab, toSnake } from "./string-case";

describe("toCamel", () => {
  it("throws TypeError when str is null", () => {
    expect(() => toCamel(null as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when str is undefined", () => {
    expect(() => toCamel(undefined as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when str is NaN", () => {
    expect(() => toCamel(NaN as unknown as string)).toThrow(TypeError);
  });

  it("lowercases a single word", () => {
    expect(toCamel("Hello")).toBe("hello");
  });

  it("joins a hyphen-separated phrase", () => {
    expect(toCamel("hello-world")).toBe("helloWorld");
  });

  it("joins a snake_case phrase", () => {
    expect(toCamel("hello_world")).toBe("helloWorld");
  });

  it("joins a space-separated phrase", () => {
    expect(toCamel("hello world")).toBe("helloWorld");
  });

  it("collapses runs of mixed separators into a single word boundary", () => {
    expect(toCamel("foo__bar--baz qux")).toBe("fooBarBazQux");
  });

  it("preserves digits inside words", () => {
    expect(toCamel("item 42 price")).toBe("item42Price");
  });

  it("forces the first character to lowercase after leading punctuation", () => {
    expect(toCamel("-Hello-World-")).toBe("helloWorld");
  });

  it("converts PascalCase to camelCase", () => {
    expect(toCamel("HelloWorld")).toBe("helloWorld");
  });

  it("returns an empty string for an empty input", () => {
    expect(toCamel("")).toBe("");
  });

  it("returns an empty string for input that has no alphanumeric characters", () => {
    expect(toCamel("!!! ??? ---")).toBe("");
  });
});

describe("toSnake", () => {
  it("throws TypeError when str is null", () => {
    expect(() => toSnake(null as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when str is undefined", () => {
    expect(() => toSnake(undefined as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when str is NaN", () => {
    expect(() => toSnake(NaN as unknown as string)).toThrow(TypeError);
  });

  it("converts camelCase to snake_case", () => {
    expect(toSnake("helloWorld")).toBe("hello_world");
  });

  it("converts PascalCase to snake_case", () => {
    expect(toSnake("HelloWorld")).toBe("hello_world");
  });

  it("converts kebab-case to snake_case", () => {
    expect(toSnake("hello-world")).toBe("hello_world");
  });

  it("converts a space-separated phrase to snake_case", () => {
    expect(toSnake("Hello World")).toBe("hello_world");
  });

  it("collapses runs of mixed separators into a single underscore", () => {
    expect(toSnake("foo__bar--baz qux")).toBe("foo_bar_baz_qux");
  });

  it("inserts a separator between letters and adjacent digits", () => {
    expect(toSnake("Item42Price")).toBe("item_42_price");
  });

  it("returns an empty string for an empty input", () => {
    expect(toSnake("")).toBe("");
  });

  it("returns an empty string for input that has no alphanumeric characters", () => {
    expect(toSnake("!!! ??? ---")).toBe("");
  });
});

describe("toKebab", () => {
  it("throws TypeError when str is null", () => {
    expect(() => toKebab(null as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when str is undefined", () => {
    expect(() => toKebab(undefined as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError when str is NaN", () => {
    expect(() => toKebab(NaN as unknown as string)).toThrow(TypeError);
  });

  it("lowercases and hyphenates a space-separated phrase", () => {
    expect(toKebab("Hello World")).toBe("hello-world");
  });

  it("converts camelCase to kebab-case", () => {
    expect(toKebab("helloWorld")).toBe("hello-world");
  });

  it("converts PascalCase to kebab-case", () => {
    expect(toKebab("HelloWorld")).toBe("hello-world");
  });

  it("converts snake_case to kebab-case", () => {
    expect(toKebab("hello_world")).toBe("hello-world");
  });

  it("collapses consecutive non-alphanumeric characters into a single hyphen", () => {
    expect(toKebab("foo___bar---baz")).toBe("foo-bar-baz");
  });

  it("strips leading and trailing hyphens", () => {
    expect(toKebab("---hello---")).toBe("hello");
  });

  it("inserts a separator between letters and adjacent digits", () => {
    expect(toKebab("Item42Price")).toBe("item-42-price");
  });

  it("returns an empty string for an empty input", () => {
    expect(toKebab("")).toBe("");
  });

  it("returns an empty string for input that has no alphanumeric characters", () => {
    expect(toKebab("!!! ???")).toBe("");
  });
});
