import { describe, expect, it } from "vitest";

import { sumBy } from "./sum-by";

describe("sumBy", () => {
  it("returns 0 for an empty array", () => {
    expect(sumBy([], (n: number) => n)).toBe(0);
  });

  it("sums a property extracted from objects", () => {
    const items = [{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }];
    expect(sumBy(items, (x) => x.n)).toBe(10);
  });

  it("applies the transform function before adding", () => {
    expect(sumBy([1, 2, 3, 4], (n) => n * 10)).toBe(100);
  });

  it("returns 0 when fn always returns 0", () => {
    expect(sumBy([1, 2, 3], () => 0)).toBe(0);
  });

  it("handles negative values", () => {
    expect(sumBy([-1, 2, -3, 4], (n) => n)).toBe(2);
  });

  describe("error/throw paths", () => {
    it("does not throw on an empty array", () => {
      expect(() => sumBy([], (n: number) => n)).not.toThrow();
    });

    it("does not throw on a normal array", () => {
      expect(() => sumBy([1, 2, 3], (n) => n)).not.toThrow();
    });

    it("propagates a synchronous throw from the callback", () => {
      expect(() =>
        sumBy([1, 2, 3], (n) => {
          if (n === 2) throw new Error("bad item");
          return n;
        }),
      ).toThrow("bad item");
    });

    it("propagates a TypeError thrown by the callback", () => {
      expect(() =>
        sumBy([1, 2, 3], (n) => {
          if (n === 2) throw new TypeError("not a number");
          return n;
        }),
      ).toThrow(TypeError);
    });

    it("stops iteration once the callback throws and does not yield a partial total", () => {
      let calls = 0;
      expect(() =>
        sumBy([1, 2, 3, 4], (n) => {
          calls++;
          if (n === 3) throw new Error("halt");
          return n;
        }),
      ).toThrow("halt");
      // Items 1, 2, 3 are visited; item 4 is never reached.
      expect(calls).toBe(3);
    });

    it("throws TypeError when called with a non-array value", () => {
      expect(() => sumBy(null as unknown as number[], (n) => n)).toThrow(
        TypeError,
      );
      expect(() => sumBy(undefined as unknown as number[], (n) => n)).toThrow(
        TypeError,
      );
    });

    it("throws TypeError when called with a non-iterable object", () => {
      expect(() => sumBy({} as unknown as number[], (n) => n)).toThrow(
        TypeError,
      );
      expect(() => sumBy(42 as unknown as number[], (n) => n)).toThrow(
        TypeError,
      );
    });

    it("propagates NaN when the callback returns NaN (no throw, but poisoned total)", () => {
      const result = sumBy([1, 2, NaN, 4], (n) => n);
      expect(Number.isNaN(result)).toBe(true);
    });

    it("does not throw when the callback returns a non-finite number", () => {
      expect(() =>
        sumBy([1, 2, 3], (n) => (n === 2 ? Number.POSITIVE_INFINITY : n)),
      ).not.toThrow();
    });
  });
});
