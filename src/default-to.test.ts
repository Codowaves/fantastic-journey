import { describe, expect, it } from "vitest";

import { defaultTo } from "./default-to";

describe("defaultTo", () => {
  it("returns the value when it is defined and not NaN", () => {
    expect(defaultTo(1, 10)).toBe(1);
    expect(defaultTo("hello", "fallback")).toBe("hello");
  });

  it("returns the fallback for null", () => {
    expect(defaultTo(null, "fallback")).toBe("fallback");
  });

  it("returns the fallback for undefined", () => {
    expect(defaultTo(undefined, 99)).toBe(99);
  });

  it("returns the fallback for NaN", () => {
    expect(defaultTo(NaN, 0)).toBe(0);
  });
});
