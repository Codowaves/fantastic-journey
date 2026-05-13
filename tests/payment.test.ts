import { describe, expect, it } from "vitest";

import { totalWithTax } from "../src/payment";

describe("totalWithTax", () => {
  it("keeps totals in the original currency", () => {
    expect(
      totalWithTax(
        [
          { amount: 12.5, currency: "USD" },
          { amount: 7.5, currency: "USD" },
        ],
        0.1,
      ),
    ).toEqual({ amount: 22, currency: "USD" });
  });

  it("rejects mixed-currency totals", () => {
    expect(() =>
      totalWithTax(
        [
          { amount: 12.5, currency: "USD" },
          { amount: 7.5, currency: "EUR" },
        ],
        0.1,
      ),
    ).toThrow(RangeError);
  });
});

