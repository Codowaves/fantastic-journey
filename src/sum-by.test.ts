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
    it("does not throw on a normal array", () => {
      expect(() => sumBy([1, 2, 3], (n) => n)).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => sumBy<number>([], (n) => n)).not.toThrow();
    });

    it("throws a TypeError when arr is null", () => {
      expect(() => sumBy(null as unknown as number[], (n) => n)).toThrow(
        TypeError,
      );
    });

    it("throws a TypeError when arr is undefined", () => {
      expect(() => sumBy(undefined as unknown as number[], (n) => n)).toThrow(
        TypeError,
      );
    });

    it("throws a TypeError when fn is null", () => {
      expect(() =>
        sumBy([1, 2, 3], null as unknown as (item: number) => number),
      ).toThrow(TypeError);
    });

    it("throws a TypeError when fn is undefined", () => {
      expect(() =>
        sumBy([1, 2, 3], undefined as unknown as (item: number) => number),
      ).toThrow(TypeError);
    });

    it("propagates an error thrown by fn", () => {
      const boom = (): number => {
        throw new Error("boom from fn");
      };
      expect(() => sumBy([1, 2, 3], boom)).toThrow("boom from fn");
    });

    it("propagates the first error when fn throws on a later item", () => {
      const items = [1, 2, 3, 4];
      const failOnThird = (n: number): number => {
        if (n === 3) throw new RangeError("third is forbidden");
        return n;
      };
      expect(() => sumBy(items, failOnThird)).toThrow(RangeError);
      expect(() => sumBy(items, failOnThird)).toThrow("third is forbidden");
    });

    it("does not invoke fn when arr is empty (fn errors are never reached)", () => {
      let called = 0;
      const fn = (n: number): number => {
        called++;
        return n;
      };
      expect(() => sumBy<number>([], fn)).not.toThrow();
      expect(called).toBe(0);
    });
  });
});
