import { describe, it, expect } from "vitest";
import { percentOf } from "./percent-of";

describe("percentOf", () => {
  it("returns 50 when part is half of whole", () => {
    expect(percentOf(50, 100)).toBe(50);
  });

  it("returns 0 when part is zero", () => {
    expect(percentOf(0, 100)).toBe(0);
  });

  it("returns 100 when part equals whole", () => {
    expect(percentOf(100, 100)).toBe(100);
  });

  it("returns 0 when whole is zero", () => {
    expect(percentOf(10, 0)).toBe(0);
  });

  it("returns values greater than 100 when part exceeds whole", () => {
    expect(percentOf(150, 100)).toBe(150);
  });
});
