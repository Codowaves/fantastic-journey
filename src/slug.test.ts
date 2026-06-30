import { describe, expect, it } from "vitest";

import { slug } from "./slug";

describe("slug", () => {
  it("lowercases and hyphenates a simple phrase", () => {
    expect(slug("Hello, World!")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slug("  Hello, World!  ")).toBe("hello-world");
  });

  it("collapses consecutive non-alphanumeric characters into a single hyphen", () => {
    expect(slug("foo   bar---baz")).toBe("foo-bar-baz");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slug("---hello---")).toBe("hello");
  });

  it("preserves digits in the input", () => {
    expect(slug("Article 42: The Answer")).toBe("article-42-the-answer");
  });

  it("returns an empty string for input that has no alphanumeric characters", () => {
    expect(slug("!!! ???")).toBe("");
  });

  it("returns an empty string for an empty input", () => {
    expect(slug("")).toBe("");
  });
});
