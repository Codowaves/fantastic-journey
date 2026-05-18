import { describe, expect, it } from "vitest";
import { totalWithTax } from "./payment";

describe("totalWithTax", () => {
  it("returns empty-list behavior with USD currency", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("sums matching currencies with tax", () => {
    const result = totalWithTax(
      [
        { amount: 10, currency: "USD" },
        { amount: 20, currency: "USD" },
      ],
      0.1
    );
    expect(result).toEqual({ amount: 33, currency: "USD" });
  });

  it("throws RangeError on mixed currencies", () => {
    expect(() =>
      totalWithTax(
        [
          { amount: 10, currency: "USD" },
          { amount: 10, currency: "EUR" },
        ],
        0.1
      )
    ).toThrow(RangeError);
  });
});