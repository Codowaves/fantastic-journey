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

describe("snakeCase error/fallback paths", () => {
  it("does not throw on an empty string", () => {
    expect(() => snakeCase("")).not.toThrow();
  });

  it("does not throw on a string of only non-alphanumeric characters", () => {
    // Whitespace/hyphen/underscore collapse to a single underscore; symbols get
    // stripped. The function must not throw on either edge case.
    expect(() => snakeCase("   ---___")).not.toThrow();
    expect(() => snakeCase("!@#$%^&*()")).not.toThrow();
    expect(snakeCase("!@#$%^&*()")).toBe("");
  });

  it("does not throw on a single character", () => {
    expect(() => snakeCase("a")).not.toThrow();
    expect(() => snakeCase("A")).not.toThrow();
    expect(() => snakeCase("1")).not.toThrow();
    expect(snakeCase("a")).toBe("a");
    expect(snakeCase("A")).toBe("a");
    expect(snakeCase("1")).toBe("1");
  });

  it("does not throw on consecutive uppercase letters (acronym handling)", () => {
    expect(() => snakeCase("HTTPRequest")).not.toThrow();
    expect(snakeCase("HTTPRequest")).toBe("http_request");
  });

  it("does not throw on a trailing uppercase letter", () => {
    expect(() => snakeCase("helloWorlD")).not.toThrow();
    expect(snakeCase("helloWorlD")).toBe("hello_worl_d");
  });

  it("does not throw on leading/trailing digits", () => {
    expect(() => snakeCase("123abc456")).not.toThrow();
    expect(() => snakeCase("abc123")).not.toThrow();
    expect(() => snakeCase("123abc")).not.toThrow();
  });

  it("does not throw on alternating letters and digits", () => {
    expect(() => snakeCase("a1b2c3")).not.toThrow();
    expect(snakeCase("a1b2c3")).toBe("a_1_b_2_c_3");
  });

  it("does not throw on consecutive digits", () => {
    expect(() => snakeCase("abc123def")).not.toThrow();
    expect(snakeCase("abc123def")).toBe("abc_123_def");
  });

  it("does not throw on unicode characters", () => {
    expect(() => snakeCase("caféLatté")).not.toThrow();
    expect(() => snakeCase("naïveApproach")).not.toThrow();
  });

  it("does not throw on emoji and other non-ASCII symbols", () => {
    expect(() => snakeCase("hello🌍World")).not.toThrow();
    expect(() => snakeCase("foo🎉bar")).not.toThrow();
  });

  it("does not throw on newline and tab characters", () => {
    expect(() => snakeCase("hello\tworld")).not.toThrow();
    expect(() => snakeCase("hello\nworld")).not.toThrow();
    expect(() => snakeCase("hello\r\nworld")).not.toThrow();
  });

  it("does not throw on a long string", () => {
    const longStr = "a".repeat(1000) + "B" + "c".repeat(1000);
    expect(() => snakeCase(longStr)).not.toThrow();
  });

  it("does not throw on a string with only a digit", () => {
    expect(() => snakeCase("0")).not.toThrow();
    expect(snakeCase("0")).toBe("0");
  });

  it("does not throw on strings with mixed separators", () => {
    expect(() => snakeCase("hello-world_test case")).not.toThrow();
    expect(snakeCase("hello-world_test case")).toBe("hello_world_test_case");
  });

  it("does not throw on deeply nested case patterns", () => {
    expect(() => snakeCase("XMLHttpRequest2Parser")).not.toThrow();
    expect(snakeCase("XMLHttpRequest2Parser")).toBe(
      "xml_http_request_2_parser",
    );
  });
});
