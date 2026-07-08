import { describe, it, expect } from "vitest";
import { subtotal, applyCoupon, type Line } from "./seed-cart";

describe("subtotal", () => {
  it("sums price * qty across lines", () => {
    const lines: Line[] = [
      { price: 10, qty: 2 },
      { price: 5.5, qty: 3 },
    ];
    expect(subtotal(lines)).toBeCloseTo(10 * 2 + 5.5 * 3);
  });

  it("returns 0 for empty cart", () => {
    expect(subtotal([])).toBe(0);
  });

  it("ignores lines with zero qty", () => {
    expect(subtotal([{ price: 99, qty: 0 }])).toBe(0);
  });

  it("handles a single line", () => {
    expect(subtotal([{ price: 12, qty: 4 }])).toBe(48);
  });

  it("handles fractional prices", () => {
    expect(subtotal([{ price: 1.99, qty: 3 }])).toBeCloseTo(5.97);
  });

  it("throws TypeError when ls is null or undefined", () => {
    expect(() => subtotal(null as unknown as Line[])).toThrow(TypeError);
    expect(() => subtotal(undefined as unknown as Line[])).toThrow(TypeError);
  });

  it("throws TypeError when a line has a NaN price", () => {
    expect(() => subtotal([{ price: Number.NaN, qty: 1 }])).toThrow(TypeError);
  });

  it("throws TypeError when a line has a NaN qty", () => {
    expect(() => subtotal([{ price: 10, qty: Number.NaN }])).toThrow(TypeError);
  });

  it("throws TypeError when a line is null or undefined", () => {
    expect(() => subtotal([null as unknown as Line])).toThrow(TypeError);
    expect(() => subtotal([undefined as unknown as Line])).toThrow(TypeError);
  });
});

describe("applyCoupon", () => {
  it("applies a 20% coupon to 100", () => {
    expect(applyCoupon(100, 20)).toBe(80);
  });

  it("0% coupon returns total unchanged", () => {
    expect(applyCoupon(50, 0)).toBe(50);
  });

  it("100% coupon yields 0", () => {
    expect(applyCoupon(100, 100)).toBe(0);
  });

  it("clamps to 0 when discount exceeds total", () => {
    expect(applyCoupon(50, 200)).toBe(0);
  });

  it("handles fractional coupons", () => {
    expect(applyCoupon(10, 12.5)).toBeCloseTo(8.75);
  });

  it("keeps total unchanged at 0", () => {
    expect(applyCoupon(0, 50)).toBe(0);
  });

  it("throws TypeError when total is null, undefined, or NaN", () => {
    expect(() => applyCoupon(null as unknown as number, 10)).toThrow(TypeError);
    expect(() => applyCoupon(undefined as unknown as number, 10)).toThrow(
      TypeError,
    );
    expect(() => applyCoupon(Number.NaN, 10)).toThrow(TypeError);
  });

  it("throws TypeError when pct is null, undefined, or NaN", () => {
    expect(() => applyCoupon(100, null as unknown as number)).toThrow(
      TypeError,
    );
    expect(() => applyCoupon(100, undefined as unknown as number)).toThrow(
      TypeError,
    );
    expect(() => applyCoupon(100, Number.NaN)).toThrow(TypeError);
  });
});
