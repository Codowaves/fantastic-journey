import { describe, expect, it } from "vitest";

import { isEven } from "./numbers";

describe("isEven", () => {
  it("returns true for even positive integers", () => {
    expect(isEven(2)).toBe(true);
  });

  it("returns false for odd positive integers", () => {
    expect(isEven(3)).toBe(false);
  });

  it("returns true for zero", () => {
    expect(isEven(0)).toBe(true);
  });

  it("returns true for negative even integers", () => {
    expect(isEven(-4)).toBe(true);
  });

  it("returns false for negative odd integers", () => {
    expect(isEven(-7)).toBe(false);
  });
});
