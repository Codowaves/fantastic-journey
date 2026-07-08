import { describe, it, expect } from "vitest";
import { percentOf } from "./percent-of";

describe("percentOf", () => {
  it("returns 50 when part is half of whole", () => {
    expect(percentOf(50, 100)).toBe(50);
  });

  it("returns 0 when part is zero", () => {
    expect(percentOf(0, 100)).toBe(0);
  });

  it("returns 100 when part equals whole", () => {
    expect(percentOf(100, 100)).toBe(100);
  });

  it("returns 0 when whole is zero", () => {
    expect(percentOf(10, 0)).toBe(0);
  });

  it("returns values greater than 100 when part exceeds whole", () => {
    expect(percentOf(150, 100)).toBe(150);
  });

  it("throws TypeError when part is null", () => {
    expect(() => percentOf(null as unknown as number, 100)).toThrow(TypeError);
  });

  it("throws TypeError when part is undefined", () => {
    expect(() => percentOf(undefined as unknown as number, 100)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when whole is null", () => {
    expect(() => percentOf(50, null as unknown as number)).toThrow(TypeError);
  });

  it("throws TypeError when whole is undefined", () => {
    expect(() => percentOf(50, undefined as unknown as number)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when part is NaN", () => {
    expect(() => percentOf(NaN, 100)).toThrow(TypeError);
  });

  it("throws TypeError when whole is NaN", () => {
    expect(() => percentOf(50, NaN)).toThrow(TypeError);
  });

  it("throws TypeError when part is Infinity", () => {
    expect(() => percentOf(Infinity, 100)).toThrow(TypeError);
  });

  it("throws TypeError when whole is Infinity", () => {
    expect(() => percentOf(50, Infinity)).toThrow(TypeError);
  });

  it("throws TypeError when part is a string", () => {
    expect(() => percentOf("50" as unknown as number, 100)).toThrow(TypeError);
  });

  it("throws TypeError when whole is a string", () => {
    expect(() => percentOf(50, "100" as unknown as number)).toThrow(TypeError);
  });
});
