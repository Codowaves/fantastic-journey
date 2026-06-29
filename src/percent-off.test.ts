import { describe, it, expect } from "vitest";
import { percentOff } from "./percent-off";
describe("percentOff", () => {
  it("takes 20% off 100", () => expect(percentOff(100, 20)).toBe(80));
  it("takes 0% off 50", () => expect(percentOff(50, 0)).toBe(50));
  it("takes 100% off 100", () => expect(percentOff(100, 100)).toBe(0));
});
