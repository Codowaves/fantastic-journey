import { describe, expect, it } from "vitest";

import { gcd } from "./gcd";

describe("gcd", () => {
  it("returns the larger value when one argument is zero", () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(7, 0)).toBe(7);
  });

  it("returns the gcd of two coprime numbers", () => {
    expect(gcd(14, 15)).toBe(1);
  });

  it("returns the gcd of two numbers with a common factor", () => {
    expect(gcd(48, 18)).toBe(6);
  });

  it("handles equal inputs", () => {
    expect(gcd(12, 12)).toBe(12);
  });

  it("treats negative inputs as their absolute values", () => {
    expect(gcd(-48, 18)).toBe(6);
    expect(gcd(48, -18)).toBe(6);
  });

  it("treats both inputs negative as their absolute values", () => {
    expect(gcd(-48, -18)).toBe(6);
  });

  it("returns 0 when both arguments are zero", () => {
    // After normalization x = 0 and y = 0, the while loop is skipped, so x (0) is returned.
    expect(gcd(0, 0)).toBe(0);
  });

  it("truncates non-integer inputs before computing (the abs/trunc fallback branch)", () => {
    expect(gcd(7.4, 2.6)).toBe(1);
    expect(gcd(10.5, 4.5)).toBe(2);
  });

  it("treats negative non-integer inputs via the abs/trunc fallback branch", () => {
    expect(gcd(-7.4, 2.6)).toBe(1);
    expect(gcd(7.4, -2.6)).toBe(1);
  });

  it("exercises the loop body branch for multi-step Euclidean reductions", () => {
    // 100 and 36 require more than one iteration: 100 % 36 = 28, 36 % 28 = 8,
    // 28 % 8 = 4, 8 % 4 = 0.
    expect(gcd(100, 36)).toBe(4);
    expect(gcd(252, 105)).toBe(21);
  });

  it("returns 1 as the gcd when one argument is 1", () => {
    expect(gcd(1, 17)).toBe(1);
    expect(gcd(99, 1)).toBe(1);
    expect(gcd(1, 1)).toBe(1);
  });

  it("handles large numbers via repeated modulo reduction", () => {
    expect(gcd(1071, 462)).toBe(21);
    expect(gcd(123456, 7890)).toBe(6);
  });

  it("does not throw on well-defined edge inputs", () => {
    expect(() => gcd(0, 0)).not.toThrow();
    expect(() => gcd(-0, 0)).not.toThrow();
    expect(() => gcd(0, -0)).not.toThrow();
    expect(() => gcd(-0, -0)).not.toThrow();
  });

  it("exits the while loop on the first iteration when the smaller argument divides evenly", () => {
    // 20 % 10 = 0 on the first iteration, so y becomes 0 immediately after one
    // step of the loop body (t = 10; y = 20 % 10 = 0; x = 10).
    expect(gcd(20, 10)).toBe(10);
    expect(gcd(100, 25)).toBe(25);
  });

  it("exits the loop after exactly one iteration when the smaller divides the larger", () => {
    expect(gcd(9, 3)).toBe(3);
    expect(gcd(3, 9)).toBe(3);
  });

  it("coerces boolean inputs through the abs/trunc fallback to 0 or 1", () => {
    // true -> 1, false -> 0 via Number() in Math.abs/Math.trunc. The cast is
    // only to satisfy TypeScript — at runtime the abs/trunc fallback path
    // accepts booleans and coerces them to 0 or 1.
    expect(gcd(true as unknown as number, 5)).toBe(1);
    expect(gcd(5, false as unknown as number)).toBe(5);
    expect(gcd(true as unknown as number, true as unknown as number)).toBe(1);
    expect(gcd(false as unknown as number, false as unknown as number)).toBe(0);
  });

  it("does not throw when one argument is the string form of a number (abs/trunc fallback coerces)", () => {
    // "12" -> 12, "8" -> 8 via the implicit Number() conversion inside
    // Math.abs/Math.trunc. The cast is only to satisfy TypeScript.
    expect(() =>
      gcd("12" as unknown as number, "8" as unknown as number),
    ).not.toThrow();
    expect(gcd("12" as unknown as number, "8" as unknown as number)).toBe(4);
  });

  it("does not throw on Number-like wrapper objects", () => {
    const twelve = new Number(12);
    const eight = new Number(8);
    expect(() =>
      gcd(twelve as unknown as number, eight as unknown as number),
    ).not.toThrow();
    expect(gcd(twelve as unknown as number, eight as unknown as number)).toBe(
      4,
    );
  });

  it("handles a single-step loop body where y becomes 1", () => {
    // gcd(7, 5): 7 % 5 = 2; 5 % 2 = 1; 2 % 1 = 0. y hits 1 mid-loop before
    // the final iteration drops it to 0.
    expect(gcd(7, 5)).toBe(1);
    expect(gcd(5, 7)).toBe(1);
  });
});
