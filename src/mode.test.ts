import { describe, expect, it } from "vitest";

import { mode } from "./mode";

describe("mode", () => {
  it("returns undefined for an empty array", () => {
    expect(mode([])).toBeUndefined();
  });

  it("returns the single value for a one-element array", () => {
    expect(mode([7])).toBe(7);
  });

  it("returns the most frequent value", () => {
    expect(mode([1, 2, 2, 3, 3, 3, 4])).toBe(3);
  });

  it("returns the first value seen on a tie", () => {
    expect(mode([1, 1, 2, 2, 3])).toBe(1);
  });

  describe("error/throw paths", () => {
    it("does not throw on a normal array", () => {
      expect(() => mode([1, 2, 3])).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => mode([])).not.toThrow();
    });

    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([1, 2, 2, 3]) as number[];
      expect(() => mode(frozen)).not.toThrow();
      expect(mode(frozen)).toBe(2);
    });

    it("does not throw on a sealed array", () => {
      const sealed = Object.seal([1, 2, 2, 3]) as number[];
      expect(() => mode(sealed)).not.toThrow();
      expect(mode(sealed)).toBe(2);
    });

    it("does not throw on an array containing NaN", () => {
      expect(() =>
        mode([1, Number.NaN, 1, Number.NaN, Number.NaN]),
      ).not.toThrow();
    });

    it("does not throw on a sparse array", () => {
      const sparse: number[] = [1, 2, 2];
      sparse[3] = undefined as unknown as number;
      expect(() => mode(sparse)).not.toThrow();
    });
  });
});
