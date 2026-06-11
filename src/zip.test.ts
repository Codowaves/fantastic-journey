import { describe, it, expect } from "vitest";
import { zip } from "./zip";

describe("zip", () => {
  it("zips two arrays of equal length", () => {
    const result = zip([1, 2, 3], ["a", "b", "c"]);
    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);
  });

  it("truncates to the shorter array when first is longer", () => {
    const result = zip([1, 2, 3, 4], ["a", "b"]);
    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
    ]);
  });

  it("truncates to the shorter array when second is longer", () => {
    const result = zip([1, 2], ["a", "b", "c", "d"]);
    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
    ]);
  });

  it("returns empty array when first array is empty", () => {
    const result = zip([], ["a", "b", "c"]);
    expect(result).toEqual([]);
  });

  it("returns empty array when second array is empty", () => {
    const result = zip([1, 2, 3], []);
    expect(result).toEqual([]);
  });

  it("returns empty array when both arrays are empty", () => {
    const result = zip([], []);
    expect(result).toEqual([]);
  });

  it("does not mutate input arrays", () => {
    const a = [1, 2, 3];
    const b = ["a", "b", "c"];
    const aCopy = [...a];
    const bCopy = [...b];

    zip(a, b);

    expect(a).toEqual(aCopy);
    expect(b).toEqual(bCopy);
  });
});
