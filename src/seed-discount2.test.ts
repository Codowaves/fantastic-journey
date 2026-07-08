import { describe, it, expect } from "vitest";
import { discountedPrice } from "./seed-discount2";
describe("discountedPrice", () => {
  it("20% off 100 = 80", () => expect(discountedPrice(100, 20)).toBe(80));
  it("0% = same", () => expect(discountedPrice(40, 0)).toBe(40));
  it("100% off = 0", () => expect(discountedPrice(50, 100)).toBe(0));
  it("negative discount = increases price", () =>
    expect(discountedPrice(100, -10)).toBe(110));
  it("zero price = 0", () => expect(discountedPrice(0, 50)).toBe(0));
  it("full precision 15% off 200 = 170", () =>
    expect(discountedPrice(200, 15)).toBe(170));
});
