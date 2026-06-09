import { describe, expect, it } from "vitest";

import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates a simple phrase", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
  });

  it("collapses consecutive non-alphanumeric characters into a single hyphen", () => {
    expect(slugify("foo   bar---baz")).toBe("foo-bar-baz");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("---hello---")).toBe("hello");
  });

  it("preserves digits in the input", () => {
    expect(slugify("Article 42: The Answer")).toBe("article-42-the-answer");
  });

  it("returns an empty string for input that has no alphanumeric characters", () => {
    expect(slugify("!!! ???")).toBe("");
  });

  it("returns an empty string for an empty input", () => {
    expect(slugify("")).toBe("");
  });
});
