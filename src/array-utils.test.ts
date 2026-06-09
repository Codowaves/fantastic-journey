import { describe, expect, it } from "vitest";

import { unique } from "./array-utils";

describe("unique", () => {
  it("removes duplicate primitives, preserving first-occurrence order", () => {
    expect(unique([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
  });

  it("returns an empty array when given an empty array", () => {
    expect(unique([])).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 2, 3];
    unique(input);
    expect(input).toEqual([1, 2, 2, 3]);
  });

  it("works on an array of strings", () => {
    expect(unique(["a", "b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
  });
});
