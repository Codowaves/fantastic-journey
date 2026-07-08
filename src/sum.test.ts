import { describe, expect, it } from "vitest";

import { sum } from "./sum";

describe("sum", () => {
  it("returns 0 for an empty array", () => {
    expect(sum([])).toBe(0);
  });

  it("returns the single value for a one-element array", () => {
    expect(sum([7])).toBe(7);
  });

  it("returns the total of multiple values", () => {
    expect(sum([1, 2, 3, 4])).toBe(10);
  });

  describe("boundary values", () => {
    it("sums negative numbers", () => {
      expect(sum([-1, -2, -3])).toBe(-6);
    });

    it("returns 0 for an array containing only a single zero", () => {
      expect(sum([0])).toBe(0);
    });

    it("treats positive and negative as cancellation", () => {
      expect(sum([1, -1, 2, -2])).toBe(0);
    });

    it("handles a mix of positive, negative, and zero", () => {
      expect(sum([-5, 0, 5, -10, 10])).toBe(0);
    });

    it("preserves the sign when the total is negative", () => {
      expect(sum([-10, 3, 2])).toBe(-5);
    });

    it("sums integer values exactly up to Number.MAX_SAFE_INTEGER boundaries", () => {
      expect(sum([Number.MAX_SAFE_INTEGER, 0])).toBe(Number.MAX_SAFE_INTEGER);
      expect(sum([Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER])).toBe(0);
    });

    it("propagates IEEE-754 floating-point results (e.g. 0.1 + 0.2)", () => {
      // Documents the standard floating-point behavior — the user is
      // responsible for input precision; sum does not round.
      expect(sum([0.1, 0.2])).toBeCloseTo(0.3, 10);
      expect(sum([0.1, 0.2])).not.toBe(0.3);
    });

    it("treats +0 and -0 as additive inverses", () => {
      expect(sum([0, -0])).toBe(0);
      // 1/-1 cancel; 1 + (-0) stays 1
      expect(sum([1, -1, -0])).toBe(0);
    });

    it("does not mutate the input array", () => {
      const input = [1, 2, 3];
      const snapshot = [...input];
      sum(input);
      expect(input).toEqual(snapshot);
    });
  });

  describe("invalid / IEEE-754 special values", () => {
    it("propagates NaN when any element is NaN", () => {
      const result = sum([1, Number.NaN, 3]);
      expect(Number.isNaN(result)).toBe(true);
    });

    it("returns NaN for an array containing only NaN", () => {
      expect(Number.isNaN(sum([Number.NaN]))).toBe(true);
    });

    it("treats Infinity as an ordinary numeric operand", () => {
      // sum does not throw on Infinity; the result follows IEEE-754 arithmetic.
      expect(sum([Infinity, 1])).toBe(Infinity);
      expect(sum([Infinity, -Infinity])).toBeNaN();
      expect(sum([-Infinity, -Infinity])).toBe(-Infinity);
    });

    it("returns -Infinity for an array containing only -Infinity", () => {
      expect(sum([-Infinity])).toBe(-Infinity);
    });
  });

  describe("type-rejected inputs (cast through any)", () => {
    it("throws when called with null instead of an array", () => {
      expect(() => sum(null as unknown as number[])).toThrow();
    });

    it("throws when called with undefined instead of an array", () => {
      expect(() => sum(undefined as unknown as number[])).toThrow();
    });

    it("throws when called with a plain object", () => {
      expect(() =>
        sum({ length: 2, 0: 1, 1: 2 } as unknown as number[]),
      ).toThrow();
    });

    it("does not throw on empty arrays produced via Array constructor", () => {
      expect(() => sum(Array(0))).not.toThrow();
      expect(sum(Array(0))).toBe(0);
    });
  });
});
