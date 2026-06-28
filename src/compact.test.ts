import { describe, expect, it } from "vitest";

import { compact } from "./compact";

describe("compact", () => {
  it("removes all falsy values from a mixed array", () => {
    expect(compact([0, 1, false, 2, "", 3, null, undefined, NaN])).toEqual([
      1, 2, 3,
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(compact([])).toEqual([]);
  });

  it("returns an empty array when all values are falsy", () => {
    expect(compact([0, false, "", null, undefined, NaN])).toEqual([]);
  });

  it("preserves truthy values in their original order", () => {
    expect(compact(["a", "b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("preserves truthy non-zero numbers", () => {
    expect(compact<number>([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("does not mutate the input array", () => {
    const input = [0, 1, false, 2];
    compact(input);
    expect(input).toEqual([0, 1, false, 2]);
  });
});
