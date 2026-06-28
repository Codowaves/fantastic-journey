import { describe, it, expect } from "vitest";
import { hasDuplicates } from "./has-duplicates";

describe("hasDuplicates", () => {
  it("detects a duplicate", () => {
    expect(hasDuplicates([1, 2, 3, 2])).toBe(true);
  });
  it("returns false when all unique", () => {
    expect(hasDuplicates([1, 2, 3, 4])).toBe(false);
  });
  it("handles an empty array", () => {
    expect(hasDuplicates([])).toBe(false);
  });
});
