import { describe, expect, it } from "vitest";

import { circleArea, rectArea } from "./geometry";

describe("circleArea", () => {
  it("returns 0 for radius 0", () => {
    expect(circleArea(0)).toBe(0);
  });

  it("computes PI * r^2 for radius 1", () => {
    expect(circleArea(1)).toBeCloseTo(Math.PI);
  });

  it("computes PI * r^2 for radius 5", () => {
    expect(circleArea(5)).toBeCloseTo(78.53981633974483);
  });

  it("throws RangeError for negative radius", () => {
    expect(() => circleArea(-1)).toThrow(RangeError);
    expect(() => circleArea(-1)).toThrow("radius must be non-negative");
  });

  describe("error/throw paths", () => {
    it("throws RangeError for a small negative radius", () => {
      // -0.0001 still satisfies radius < 0, so the guard must trip.
      expect(() => circleArea(-0.0001)).toThrow(RangeError);
      expect(() => circleArea(-0.0001)).toThrow("radius must be non-negative");
    });

    it("throws RangeError for a large negative radius", () => {
      expect(() => circleArea(-1e6)).toThrow(RangeError);
      expect(() => circleArea(-1e6)).toThrow("radius must be non-negative");
    });

    it("throws RangeError for -Infinity", () => {
      expect(() => circleArea(-Infinity)).toThrow(RangeError);
      expect(() => circleArea(-Infinity)).toThrow(
        "radius must be non-negative",
      );
    });

    it("does not throw on the boundary value 0 (guard short-circuits cleanly)", () => {
      expect(() => circleArea(0)).not.toThrow();
      expect(circleArea(0)).toBe(0);
    });

    it("does not throw for NaN (NaN < 0 is false, so the guard does not fire)", () => {
      // Documenting the existing behavior: NaN flows through and yields NaN
      // because radius < 0 is false for NaN.
      expect(() => circleArea(Number.NaN)).not.toThrow();
      expect(Number.isNaN(circleArea(Number.NaN))).toBe(true);
    });

    it("does not throw for +Infinity", () => {
      expect(() => circleArea(Infinity)).not.toThrow();
      expect(circleArea(Infinity)).toBe(Infinity);
    });

    it("produces a RangeError instance (not a generic Error)", () => {
      try {
        circleArea(-2);
        throw new Error("expected circleArea(-2) to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(RangeError);
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("radius must be non-negative");
      }
    });
  });
});

describe("rectArea", () => {
  it("returns 0 when width or height is 0", () => {
    expect(rectArea(0, 5)).toBe(0);
    expect(rectArea(5, 0)).toBe(0);
  });

  it("multiplies width and height", () => {
    expect(rectArea(3, 4)).toBe(12);
    expect(rectArea(2.5, 4)).toBe(10);
  });

  it("throws RangeError for negative width or height", () => {
    expect(() => rectArea(-1, 5)).toThrow(RangeError);
    expect(() => rectArea(5, -1)).toThrow(RangeError);
    expect(() => rectArea(-1, 5)).toThrow(
      "width and height must be non-negative",
    );
  });

  describe("error/throw paths", () => {
    it("throws RangeError when both width and height are negative", () => {
      // width < 0 OR height < 0 evaluates first on width; both negative
      // still trips the guard.
      expect(() => rectArea(-1, -1)).toThrow(RangeError);
      expect(() => rectArea(-1, -1)).toThrow(
        "width and height must be non-negative",
      );
      expect(() => rectArea(-3, -7)).toThrow(RangeError);
    });

    it("throws RangeError for a small negative width", () => {
      expect(() => rectArea(-0.0001, 5)).toThrow(RangeError);
      expect(() => rectArea(-0.0001, 5)).toThrow(
        "width and height must be non-negative",
      );
    });

    it("throws RangeError for a small negative height", () => {
      expect(() => rectArea(5, -0.0001)).toThrow(RangeError);
      expect(() => rectArea(5, -0.0001)).toThrow(
        "width and height must be non-negative",
      );
    });

    it("throws RangeError for a large negative width or height", () => {
      expect(() => rectArea(-1e6, 5)).toThrow(RangeError);
      expect(() => rectArea(5, -1e6)).toThrow(RangeError);
    });

    it("throws RangeError for -Infinity width", () => {
      expect(() => rectArea(-Infinity, 5)).toThrow(RangeError);
      expect(() => rectArea(-Infinity, 5)).toThrow(
        "width and height must be non-negative",
      );
    });

    it("throws RangeError for -Infinity height", () => {
      expect(() => rectArea(5, -Infinity)).toThrow(RangeError);
      expect(() => rectArea(5, -Infinity)).toThrow(
        "width and height must be non-negative",
      );
    });

    it("does not throw on the boundary values 0 (guard short-circuits cleanly)", () => {
      expect(() => rectArea(0, 0)).not.toThrow();
      expect(rectArea(0, 0)).toBe(0);
      expect(() => rectArea(0, 7)).not.toThrow();
      expect(() => rectArea(7, 0)).not.toThrow();
    });

    it("does not throw for NaN width or height (NaN < 0 is false)", () => {
      // Documenting existing behavior: NaN flows through the guard because
      // NaN < 0 is false; the result is NaN.
      expect(() => rectArea(Number.NaN, 5)).not.toThrow();
      expect(() => rectArea(5, Number.NaN)).not.toThrow();
      expect(Number.isNaN(rectArea(Number.NaN, 5))).toBe(true);
      expect(Number.isNaN(rectArea(5, Number.NaN))).toBe(true);
    });

    it("does not throw for +Infinity", () => {
      expect(() => rectArea(Infinity, 5)).not.toThrow();
      expect(rectArea(Infinity, 5)).toBe(Infinity);
      expect(() => rectArea(5, Infinity)).not.toThrow();
      expect(rectArea(5, Infinity)).toBe(Infinity);
    });

    it("produces a RangeError instance (not a generic Error)", () => {
      try {
        rectArea(-2, 3);
        throw new Error("expected rectArea(-2, 3) to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(RangeError);
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "width and height must be non-negative",
        );
      }
    });
  });
});
