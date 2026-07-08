import { describe, expect, it } from "vitest";

import { compact } from "./compact";

describe("compact", () => {
  it("removes falsy values from a mixed array", () => {
    expect(compact([0, 1, false, 2, "", 3, null, undefined, NaN])).toEqual([
      1, 2, 3,
    ]);
  });

  it("returns an empty array when every value is falsy", () => {
    expect(compact([0, false, "", null, undefined, NaN])).toEqual([]);
  });

  it("returns a copy with the same elements when none are falsy", () => {
    const input = [1, 2, 3];
    const result = compact(input);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(input);
  });

  it("returns an empty array for an empty input", () => {
    expect(compact([])).toEqual([]);
  });

  it("throws TypeError when input is null or undefined", () => {
    expect(() => compact(null as unknown as readonly unknown[])).toThrow(
      TypeError,
    );
    expect(() => compact(undefined as unknown as readonly unknown[])).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when input is not an array", () => {
    expect(() =>
      compact("not-an-array" as unknown as readonly unknown[]),
    ).toThrow(TypeError);
    expect(() => compact(42 as unknown as readonly unknown[])).toThrow(
      TypeError,
    );
    expect(() =>
      compact({ length: 0 } as unknown as readonly unknown[]),
    ).toThrow(TypeError);
  });
});
