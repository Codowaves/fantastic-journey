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

  it("formats a single cent as $0.01", () => {
    expect(formatUsd(1)).toBe("$0.01");
  });

  it("formats negative amounts with a leading minus", () => {
    expect(formatUsd(-500)).toBe("$-5.00");
  });

  it("formats negative single cent as $-0.01", () => {
    expect(formatUsd(-1)).toBe("$-0.01");
  });

  it("handles one cent below a round dollar", () => {
    expect(formatUsd(99)).toBe("$0.99");
  });

  it("formats one cent above a round dollar", () => {
    expect(formatUsd(101)).toBe("$1.01");
  });

  it("produces NaN output for NaN input", () => {
    expect(formatUsd(Number.NaN)).toBe("$NaN");
  });

  it("produces Infinity output for Infinity input", () => {
    expect(formatUsd(Number.POSITIVE_INFINITY)).toBe("$Infinity");
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

  it("returns a negative amount when cents is negative and rate is zero", () => {
    expect(addTax(-1000, 0)).toBe(-1000);
  });

  it("reduces a negative amount when tax is applied (becomes less negative)", () => {
    expect(addTax(-1000, 0.1)).toBe(-1100);
  });

  it("negates the amount when rate is negative (discount)", () => {
    expect(addTax(1000, -0.5)).toBe(500);
  });

  it("returns 0 when rate is 0 and amount is 0", () => {
    expect(addTax(0, 0)).toBe(0);
  });

  it("handles a single cent amount with 0% tax", () => {
    expect(addTax(1, 0)).toBe(1);
  });

  it("handles a single cent amount with 50% tax", () => {
    expect(addTax(1, 0.5)).toBe(2);
  });

  it("handles a rate greater than 1 (e.g. 200%)", () => {
    expect(addTax(1000, 2)).toBe(3000);
  });

  it("returns NaN when cents is NaN", () => {
    expect(Number.isNaN(addTax(Number.NaN, 0.1))).toBe(true);
  });

  it("returns NaN when rate is NaN", () => {
    expect(Number.isNaN(addTax(1000, Number.NaN))).toBe(true);
  });
});
