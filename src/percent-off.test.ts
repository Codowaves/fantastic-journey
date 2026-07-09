import { describe, it, expect } from "vitest";
import { percentOff } from "./percent-off";
describe("percentOff", () => {
  it("takes 20% off 100", () => expect(percentOff(100, 20)).toBe(80));
  it("takes 0% off 50", () => expect(percentOff(50, 0)).toBe(50));
  it("takes 100% off 100", () => expect(percentOff(100, 100)).toBe(0));

  it("throws TypeError when either argument is null or undefined", () => {
    expect(() => percentOff(null as unknown as number, 20)).toThrow(TypeError);
    expect(() => percentOff(100, null as unknown as number)).toThrow(TypeError);
    expect(() => percentOff(undefined as unknown as number, 20)).toThrow(
      TypeError,
    );
    expect(() => percentOff(100, undefined as unknown as number)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when either argument is NaN", () => {
    expect(() => percentOff(Number.NaN, 20)).toThrow(TypeError);
    expect(() => percentOff(100, Number.NaN)).toThrow(TypeError);
  });
});
