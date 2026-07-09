import { describe, it, expect } from "vitest";
import { percentOff } from "./percent-off";
describe("percentOff", () => {
  it("takes 20% off 100", () => expect(percentOff(100, 20)).toBe(80));
  it("takes 0% off 50", () => expect(percentOff(50, 0)).toBe(50));
  it("takes 100% off 100", () => expect(percentOff(100, 100)).toBe(0));
  it("throws on null price", () =>
    expect(() => percentOff(null as unknown as number, 10)).toThrow(TypeError));
  it("throws on undefined pct", () =>
    expect(() => percentOff(100, undefined as unknown as number)).toThrow(
      TypeError,
    ));
  it("throws on NaN price", () =>
    expect(() => percentOff(NaN, 10)).toThrow(TypeError));
  it("throws on NaN pct", () =>
    expect(() => percentOff(100, NaN)).toThrow(TypeError));
});
