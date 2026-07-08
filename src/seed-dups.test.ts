import { describe, expect, it } from "vitest";

import { firstDup } from "./seed-dups";

describe("firstDup", () => {
  it("returns the first duplicated element", () => {
    expect(firstDup([1, 2, 3, 2])).toBe(2);
  });

  it("returns the first duplicated element when it appears later", () => {
    expect(firstDup([1, 2, 3, 1, 2])).toBe(1);
  });

  it("returns undefined when all elements are unique", () => {
    expect(firstDup([1, 2, 3])).toBeUndefined();
  });

  it("returns undefined for an empty array", () => {
    expect(firstDup([])).toBeUndefined();
  });

  it("works with strings", () => {
    expect(firstDup(["a", "b", "a"])).toBe("a");
    expect(firstDup(["a", "b", "c"])).toBeUndefined();
  });

  it("throws TypeError when a is null", () => {
    expect(() => firstDup(null as unknown as number[])).toThrow(TypeError);
    expect(() => firstDup(null as unknown as number[])).toThrow(
      "a must be an array",
    );
  });

  it("throws TypeError when a is undefined", () => {
    expect(() => firstDup(undefined as unknown as number[])).toThrow(TypeError);
    expect(() => firstDup(undefined as unknown as number[])).toThrow(
      "a must be an array",
    );
  });

  it("throws TypeError when a is NaN", () => {
    expect(() => firstDup(NaN as unknown as number[])).toThrow(TypeError);
    expect(() => firstDup(NaN as unknown as number[])).toThrow(
      "a must be an array",
    );
  });
});
