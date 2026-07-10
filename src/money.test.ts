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

  it("handles the smallest non-zero cent amount", () => {
    expect(addTax(1, 0)).toBe(1);
    expect(addTax(1, 1)).toBe(2);
  });

  it("handles negative tax rate (discount)", () => {
    expect(addTax(1000, -0.1)).toBe(900);
  });

  it("handles negative amount", () => {
    expect(addTax(-1000, 0.1)).toBe(-1100);
  });

  it("rounds half-cent values to the nearest cent", () => {
    expect(addTax(1, 0.5)).toBe(2);
    expect(addTax(2, 0.5)).toBe(3);
  });

  it("returns NaN when given NaN inputs", () => {
    expect(Number.isNaN(addTax(Number.NaN, 0.1))).toBe(true);
    expect(Number.isNaN(addTax(100, Number.NaN))).toBe(true);
  });

  it("returns Infinity for very large tax rate", () => {
    expect(addTax(1000, Number.POSITIVE_INFINITY)).toBe(
      Number.POSITIVE_INFINITY,
    );
  });

  it("handles a very small tax rate", () => {
    expect(addTax(10000, 0.001)).toBe(10010);
  });
});

describe("formatUsd edge cases", () => {
  it("formats one cent as $0.01", () => {
    expect(formatUsd(1)).toBe("$0.01");
  });

  it("formats negative values with a leading minus", () => {
    expect(formatUsd(-199)).toBe("$-1.99");
  });

  it("formats 1 cent through 99 cents with leading zero", () => {
    expect(formatUsd(1)).toBe("$0.01");
    expect(formatUsd(10)).toBe("$0.10");
    expect(formatUsd(99)).toBe("$0.99");
  });

  it("formats very large values", () => {
    expect(formatUsd(Number.MAX_SAFE_INTEGER)).toBe("$90071992547409.91");
  });

  it("returns $NaN for NaN input", () => {
    expect(formatUsd(Number.NaN)).toBe("$NaN");
  });

  it("returns $Infinity for Infinity input", () => {
    expect(formatUsd(Number.POSITIVE_INFINITY)).toBe("$Infinity");
  });
});
