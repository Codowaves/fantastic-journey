import { describe, expect, it } from "vitest";

import { flattenDeep } from "./flatten-deep";

describe("flattenDeep", () => {
  it("returns a flat array unchanged", () => {
    expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("recursively flattens deeply nested arrays", () => {
    expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
  });

  it("returns an empty array for an empty input", () => {
    expect(flattenDeep([])).toEqual([]);
  });

  it("preserves non-array primitives (the fallback else branch)", () => {
    expect(flattenDeep([1, ["a", [true, [null, [undefined]]]]])).toEqual([
      1,
      "a",
      true,
      null,
      undefined,
    ]);
  });

  it("preserves objects as elements (the fallback else branch)", () => {
    const a = { a: 1 };
    const b = { b: 2 };
    const c = { c: 3 };
    expect(flattenDeep([a, [b, [c]]])).toEqual([a, b, c]);
  });

  it("does not mutate the input array", () => {
    const input = [1, [2, [3]]];
    const snapshot = JSON.parse(JSON.stringify(input));
    flattenDeep(input);
    expect(input).toEqual(snapshot);
  });

  it("returns a new array instance", () => {
    const input = [1, [2, 3]];
    const output = flattenDeep(input);
    expect(output).not.toBe(input);
    expect(output).toEqual([1, 2, 3]);
  });

  it("throws a TypeError for non-array top-level input", () => {
    expect(() => flattenDeep(42 as unknown as unknown[])).toThrow(TypeError);
  });

  it("throws a TypeError when the top-level input is null", () => {
    expect(() => flattenDeep(null as unknown as unknown[])).toThrow(TypeError);
    expect(() => flattenDeep(null as unknown as unknown[])).toThrow(
      "flattenDeep expects an array",
    );
  });

  it("throws a TypeError when the top-level input is undefined", () => {
    expect(() => flattenDeep(undefined as unknown as unknown[])).toThrow(
      TypeError,
    );
    expect(() => flattenDeep(undefined as unknown as unknown[])).toThrow(
      "flattenDeep expects an array",
    );
  });

  it("throws a TypeError when the top-level input is a string", () => {
    expect(() => flattenDeep("not-an-array" as unknown as unknown[])).toThrow(
      TypeError,
    );
    expect(() => flattenDeep("not-an-array" as unknown as unknown[])).toThrow(
      "flattenDeep expects an array",
    );
  });

  it("throws a TypeError when the top-level input is a plain object", () => {
    expect(() => flattenDeep({} as unknown as unknown[])).toThrow(TypeError);
    expect(() => flattenDeep({} as unknown as unknown[])).toThrow(
      "flattenDeep expects an array",
    );
  });

  it("preserves non-array primitives inside nested arrays without throwing", () => {
    // The recursion only re-checks `Array.isArray` on actual arrays,
    // so primitive items always take the fallback else branch.
    expect(() => flattenDeep([1, [2, [3, 4]]])).not.toThrow();
    expect(flattenDeep([1, [2, [3, 4]]])).toEqual([1, 2, 3, 4]);
  });
});
