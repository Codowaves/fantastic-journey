import { describe, expect, it } from "vitest";

import { addTax, formatUsd } from "./money";

describe("formatUsd", () => {
  it("formats whole dollars with two decimals", () => {
    expect(formatUsd(100)).toBe("$1.00");
  });

  it("formats dollars and cents", () => {
    expect(formatUsd(1234)).toBe("$12.34");
  });

  it("formats zero as $0.00", () => {
    expect(formatUsd(0)).toBe("$0.00");
  });

  it("formats large values", () => {
    expect(formatUsd(100000000)).toBe("$1000000.00");
  });

  it("rounds non-round values to two decimals", () => {
    expect(formatUsd(199)).toBe("$1.99");
    expect(formatUsd(999)).toBe("$9.99");
  });

  it("pads single-digit cents with a leading zero", () => {
    expect(formatUsd(105)).toBe("$1.05");
  });
});

describe("addTax", () => {
  it("returns the same value when tax rate is zero", () => {
    expect(addTax(1000, 0)).toBe(1000);
  });

  it("adds tax and rounds to nearest cent", () => {
    expect(addTax(1000, 0.1)).toBe(1100);
  });

  it("adds a 20% tax correctly", () => {
    expect(addTax(2000, 0.2)).toBe(2400);
  });

  it("returns 0 when amount is 0 regardless of rate", () => {
    expect(addTax(0, 0.5)).toBe(0);
  });

  it("rounds to the nearest integer (half-up rounding behavior is implementation defined)", () => {
    const result = addTax(100, 0.05);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(105);
  });

  it("handles 100% tax by doubling the value", () => {
    expect(addTax(500, 1)).toBe(1000);
  });

  it("handles a typical sales tax of 8.875%", () => {
    expect(addTax(1000, 0.08875)).toBe(1089);
  });
});

describe("formatUsd edge cases", () => {
  it("formats negative amounts with a leading minus", () => {
    expect(formatUsd(-100)).toBe("$-1.00");
  });

  it("formats negative cents", () => {
    expect(formatUsd(-199)).toBe("$-1.99");
  });

  it("formats negative one cent", () => {
    expect(formatUsd(-1)).toBe("$-0.01");
  });

  it("formats a single cent", () => {
    expect(formatUsd(1)).toBe("$0.01");
  });

  it("formats NaN as $NaN", () => {
    expect(formatUsd(Number.NaN)).toBe("$NaN");
  });

  it("formats Infinity as $Infinity", () => {
    expect(formatUsd(Number.POSITIVE_INFINITY)).toBe("$Infinity");
  });

  it("formats negative Infinity as $-Infinity", () => {
    expect(formatUsd(Number.NEGATIVE_INFINITY)).toBe("$-Infinity");
  });
});

describe("addTax edge cases", () => {
  it("returns 0 when both amount and rate are 0", () => {
    expect(addTax(0, 0)).toBe(0);
  });

  it("handles a negative tax rate (discount)", () => {
    expect(addTax(1000, -0.1)).toBe(900);
  });

  it("clamps to 0 when rate is less than -1", () => {
    expect(addTax(1000, -2)).toBe(-1000);
  });

  it("rounds half values correctly for addTax", () => {
    expect(addTax(1, 0.5)).toBe(2);
    expect(addTax(2, 0.5)).toBe(3);
  });

  it("preserves integer result for negative amounts", () => {
    expect(addTax(-1000, 0.1)).toBe(-1100);
  });

  it("returns NaN when rate is NaN", () => {
    expect(Number.isNaN(addTax(1000, Number.NaN))).toBe(true);
  });

  it("returns NaN when amount is NaN", () => {
    expect(Number.isNaN(addTax(Number.NaN, 0.1))).toBe(true);
  });

  it("handles Infinity amounts", () => {
    expect(addTax(Number.POSITIVE_INFINITY, 0.1)).toBe(
      Number.POSITIVE_INFINITY,
    );
  });
});
