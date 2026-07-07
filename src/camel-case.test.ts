import { describe, expect, it } from "vitest";

import { camelCase } from "./camel-case";

describe("camelCase", () => {
  it("lowercases a single word", () => {
    expect(camelCase("Hello")).toBe("hello");
  });

  it("joins a hyphen-separated phrase without leaving a capital first letter", () => {
    expect(camelCase("hello-world")).toBe("helloWorld");
  });

  it("joins a snake_case phrase", () => {
    expect(camelCase("hello_world")).toBe("helloWorld");
  });

  it("joins a space-separated phrase", () => {
    expect(camelCase("hello world")).toBe("helloWorld");
  });

  it("collapses runs of mixed separators into a single word boundary", () => {
    expect(camelCase("foo__bar--baz qux")).toBe("fooBarBazQux");
  });

  it("preserves digits inside words", () => {
    expect(camelCase("item 42 price")).toBe("item42Price");
  });

  it("forces the first character to lowercase even after leading punctuation", () => {
    expect(camelCase("-Hello-World-")).toBe("helloWorld");
  });

  it("returns an empty string for an empty input", () => {
    expect(camelCase("")).toBe("");
  });

  it("returns an empty string for input that has no alphanumeric characters", () => {
    expect(camelCase("!!! ??? ---")).toBe("");
  });

  it("throws on null input", () => {
    expect(() => camelCase(null as unknown as string)).toThrow(TypeError);
    expect(() => camelCase(null as unknown as string)).toThrow(
      "cannot be null or undefined",
    );
  });

  it("throws on undefined input", () => {
    expect(() => camelCase(undefined as unknown as string)).toThrow(TypeError);
    expect(() => camelCase(undefined as unknown as string)).toThrow(
      "cannot be null or undefined",
    );
  });

  it("throws when given a non-string type", () => {
    expect(() => camelCase(42 as unknown as string)).toThrow(TypeError);
    expect(() => camelCase(42 as unknown as string)).toThrow(
      "must be a string",
    );
  });
});
