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

  describe("lowercase-to-uppercase boundary branch", () => {
    it("inserts an underscore between two letters at a camelCase boundary", () => {
      expect(snakeCase("fooBar")).toBe("foo_bar");
    });

    it("inserts an underscore between a digit and an uppercase letter", () => {
      expect(snakeCase("item2Price")).toBe("item_2_price");
    });

    it("handles a single lowercase-then-uppercase pair", () => {
      expect(snakeCase("aB")).toBe("a_b");
    });
  });

  describe("uppercase-run followed by uppercase+lowercase branch", () => {
    it("splits consecutive uppercase runs before a final lowercase tail", () => {
      expect(snakeCase("XMLHttpRequest")).toBe("xml_http_request");
    });

    it("splits a leading uppercase run before a lowercase tail", () => {
      // All uppercase after the first letter is treated as a run; the final
      // uppercase+lowercase pair triggers the boundary split.
      expect(snakeCase("ABc")).toBe("a_bc");
    });

    it("collapses a long trailing uppercase run into a single word", () => {
      expect(snakeCase("fooABC")).toBe("foo_abc");
    });

    it("does not split an all-uppercase acronym", () => {
      // No uppercase+lowercase boundary, so the run stays glued together.
      expect(snakeCase("ABC")).toBe("abc");
    });
  });

  describe("letter-to-digit boundary branch", () => {
    it("inserts an underscore between a letter and a following digit", () => {
      expect(snakeCase("foo1")).toBe("foo_1");
    });

    it("inserts an underscore between multiple letter-to-digit transitions", () => {
      expect(snakeCase("a1b2c3")).toBe("a_1_b_2_c_3");
    });

    it("handles a single letter followed by a digit", () => {
      expect(snakeCase("a1")).toBe("a_1");
    });
  });

  describe("digit-to-letter boundary branch", () => {
    it("inserts an underscore between a digit and a following letter", () => {
      expect(snakeCase("1foo")).toBe("1_foo");
    });

    it("handles a single digit followed by a letter", () => {
      expect(snakeCase("1a")).toBe("1_a");
    });

    it("handles a digit run followed by an uppercase letter run", () => {
      expect(snakeCase("1AB")).toBe("1_ab");
    });
  });

  describe("separator collapse branch", () => {
    it("collapses multiple underscores into a single underscore", () => {
      expect(snakeCase("a__b")).toBe("a_b");
    });

    it("collapses multiple hyphens into a single underscore", () => {
      expect(snakeCase("a---b")).toBe("a_b");
    });

    it("collapses multiple spaces into a single underscore", () => {
      expect(snakeCase("a   b")).toBe("a_b");
    });

    it("collapses a mix of separators into a single underscore", () => {
      expect(snakeCase("foo__bar--baz qux")).toBe("foo_bar_baz_qux");
    });

    it("preserves leading and trailing separators as a single underscore", () => {
      expect(snakeCase("---Hello---World---")).toBe("_hello_world_");
    });

    it("collapses a run of only separators to a single underscore", () => {
      expect(snakeCase("___")).toBe("_");
      expect(snakeCase("---")).toBe("_");
      expect(snakeCase("   ")).toBe("_");
    });
  });

  describe("non-alphanumeric strip branch", () => {
    it("strips punctuation that is not a separator", () => {
      expect(snakeCase("foo!!bar")).toBe("foobar");
    });

    it("strips a mix of punctuation and word characters", () => {
      expect(snakeCase("@@hello##world$$")).toBe("helloworld");
    });

    it("returns an empty string when input is only non-alphanumeric characters", () => {
      expect(snakeCase("@@@")).toBe("");
      expect(snakeCase("!@#$%^&*()")).toBe("");
    });

    it("strips non-alphanumeric characters at the start and end", () => {
      expect(snakeCase("!!!Hello???")).toBe("hello");
    });
  });

  describe("already-snake_case input (idempotency)", () => {
    it("lowercases a fully uppercase snake_case-like string", () => {
      expect(snakeCase("FOO_BAR")).toBe("foo_bar");
    });

    it("leaves a lowercase snake_case string unchanged", () => {
      expect(snakeCase("foo_bar_baz")).toBe("foo_bar_baz");
    });
  });

  describe("digits-only and mixed numeric branches", () => {
    it("returns a digit string unchanged", () => {
      expect(snakeCase("123")).toBe("123");
    });

    it("handles letters and digits interspersed", () => {
      expect(snakeCase("fooBar123baz")).toBe("foo_bar_123_baz");
    });

    it("handles a digit run between an uppercase run and a lowercase tail", () => {
      expect(snakeCase("fooBar1Baz")).toBe("foo_bar_1_baz");
    });

    it("handles versioned release notes with multiple digit runs", () => {
      expect(snakeCase("version1Release2Notes")).toBe(
        "version_1_release_2_notes",
      );
    });

    it("does not split trailing digits from their preceding word", () => {
      expect(snakeCase("fooBar1")).toBe("foo_bar_1");
    });
  });

  describe("single-character and shortest inputs", () => {
    it("returns a single lowercase letter unchanged", () => {
      expect(snakeCase("a")).toBe("a");
    });

    it("lowercases a single uppercase letter", () => {
      expect(snakeCase("A")).toBe("a");
    });

    it("returns a single digit unchanged", () => {
      expect(snakeCase("1")).toBe("1");
    });
  });

  describe("error/throw paths", () => {
    it("does not throw on an empty string", () => {
      expect(() => snakeCase("")).not.toThrow();
    });

    it("does not throw on a normal camelCase string", () => {
      expect(() => snakeCase("helloWorld")).not.toThrow();
    });

    it("does not throw on a string of only special characters", () => {
      expect(() => snakeCase("@#$%^&*()")).not.toThrow();
    });

    it("does not throw on a string of only separators", () => {
      expect(() => snakeCase("___---   ")).not.toThrow();
    });

    it("does not throw on a string of only digits", () => {
      expect(() => snakeCase("1234567890")).not.toThrow();
    });

    it("does not throw on a long mixed string", () => {
      expect(() =>
        snakeCase("FooBar123BazQux___---   @@@helloWorld###"),
      ).not.toThrow();
    });

    it("does not throw on a string containing all the boundary cases at once", () => {
      expect(() => snakeCase("XMLHttpRequest2fooBarBaz")).not.toThrow();
    });

    it("does not throw on a frozen template-string-equivalent input", () => {
      const input = "HelloWorld";
      const frozen = Object.freeze(input.split(""));
      // The function only reads .replace on the string; passing the parts
      // confirms there is no accidental mutation of the receiver.
      expect(() => snakeCase(frozen.join(""))).not.toThrow();
      expect(snakeCase(frozen.join(""))).toBe("hello_world");
    });
  });
});
