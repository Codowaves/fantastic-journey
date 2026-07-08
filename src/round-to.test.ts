import { describe, expect, it } from "vitest";

import { roundTo } from "./round-to";

describe("roundTo", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundTo(1.23456, 2)).toBe(1.23);
  });

  it("rounds the half-up boundary", () => {
    expect(roundTo(1.235, 2)).toBe(1.24);
  });

  it("rounds to zero decimals", () => {
    expect(roundTo(2.5, 0)).toBe(3);
  });

  it("returns the value unchanged when dp is large enough", () => {
    expect(roundTo(1.5, 5)).toBe(1.5);
  });

  it("rounds negative numbers", () => {
    expect(roundTo(-1.236, 2)).toBe(-1.24);
  });

  it("throws TypeError when n is null or undefined", () => {
    expect(() => roundTo(null as unknown as number, 2)).toThrow(TypeError);
    expect(() => roundTo(undefined as unknown as number, 2)).toThrow(TypeError);
  });

  it("throws TypeError when n is NaN", () => {
    expect(() => roundTo(Number.NaN, 2)).toThrow(TypeError);
  });

  it("throws TypeError when dp is null or undefined", () => {
    expect(() => roundTo(1.5, null as unknown as number)).toThrow(TypeError);
    expect(() => roundTo(1.5, undefined as unknown as number)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when dp is NaN", () => {
    expect(() => roundTo(1.5, Number.NaN)).toThrow(TypeError);
  });
});
