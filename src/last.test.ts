import { describe, expect, it } from "vitest";

import { last } from "./last";

describe("last", () => {
  it("returns the final element of a non-empty array", () => {
    expect(last([1, 2, 3])).toBe(3);
  });

  it("returns undefined for an empty array", () => {
    expect(last([])).toBeUndefined();
  });
});
