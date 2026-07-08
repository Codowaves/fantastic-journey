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
    it("propagates an Error thrown by fn", () => {
      const failing = () => {
        throw new Error("boom");
      };
      expect(() => sumBy([1, 2, 3], failing)).toThrow("boom");
    });

    it("propagates a thrown TypeError", () => {
      const failing = (n: number) => {
        if (n < 0) {
          throw new TypeError("negative input");
        }
        return n;
      };
      expect(() => sumBy([1, -1, 2], failing)).toThrow(TypeError);
      expect(() => sumBy([1, -1, 2], failing)).toThrow("negative input");
    });

    it("propagates a thrown RangeError", () => {
      const failing = () => {
        throw new RangeError("out of range");
      };
      expect(() => sumBy([1, 2], failing)).toThrow(RangeError);
    });

    it("propagates a non-Error throw value (string)", () => {
      const failing = () => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "string-error";
      };
      expect(() => sumBy([1], failing)).toThrow("string-error");
    });

    it("propagates a non-Error throw value (number)", () => {
      const failing = () => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 42;
      };
      let caught: unknown;
      try {
        sumBy([1], failing);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBe(42);
    });

    it("does not invoke fn after a throw", () => {
      let calls = 0;
      const failing = (n: number) => {
        calls += 1;
        if (n === 2) {
          throw new Error("stop");
        }
        return n;
      };
      expect(() => sumBy([1, 2, 3, 4], failing)).toThrow("stop");
      expect(calls).toBe(2);
    });

    it("does not throw on an empty array even if fn would throw", () => {
      const failing = () => {
        throw new Error("should not be called");
      };
      expect(() => sumBy([], failing)).not.toThrow();
      expect(sumBy([], failing)).toBe(0);
    });

    it("propagates a throw from the very first element", () => {
      const failing = () => {
        throw new Error("first");
      };
      expect(() => sumBy([1, 2, 3], failing)).toThrow("first");
    });
  });

  describe("does-not-throw paths", () => {
    it("does not throw on a normal array", () => {
      expect(() => sumBy([1, 2, 3], (n) => n)).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => sumBy([], (n: number) => n)).not.toThrow();
    });

    it("does not throw when fn returns NaN", () => {
      expect(() => sumBy([1, 2, 3], () => Number.NaN)).not.toThrow();
      expect(Number.isNaN(sumBy([1, 2, 3], () => Number.NaN))).toBe(true);
    });

    it("does not throw on a frozen input array", () => {
      const frozen = Object.freeze([1, 2, 3]) as number[];
      expect(() => sumBy(frozen, (n) => n)).not.toThrow();
      expect(sumBy(frozen, (n) => n)).toBe(6);
    });

    it("does not throw on a sealed input array", () => {
      const sealed = Object.seal([1, 2, 3]) as number[];
      expect(() => sumBy(sealed, (n) => n)).not.toThrow();
      expect(sumBy(sealed, (n) => n)).toBe(6);
    });
  });
});
