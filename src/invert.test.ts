import { describe, expect, it } from "vitest";

import { invert } from "./invert";

describe("invert", () => {
  it("swaps keys and values", () => {
    expect(invert({ a: 1, b: 2, c: 3 })).toEqual({ 1: "a", 2: "b", 3: "c" });
  });

  it("coerces numeric values to string keys", () => {
    expect(invert({ x: 42 })).toEqual({ 42: "x" });
  });

  it("returns an empty object when given an empty object", () => {
    expect(invert({})).toEqual({});
  });

  it("does not mutate the source object", () => {
    const source = { a: 1, b: 2 };
    invert(source);
    expect(source).toEqual({ a: 1, b: 2 });
  });

  it("later entries overwrite earlier ones when values collide", () => {
    expect(invert({ a: 1, b: 1 })).toEqual({ 1: "b" });
  });

  it("supports string values", () => {
    expect(invert({ a: "x", b: "y" })).toEqual({ x: "a", y: "b" });
  });
});
