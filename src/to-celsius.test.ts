import { describe, it, expect } from "vitest";
import { toCelsius } from "./to-celsius";
describe("toCelsius", () => {
  it("freezing", () => expect(toCelsius(32)).toBe(0));
  it("boiling", () => expect(toCelsius(212)).toBe(100));
});
