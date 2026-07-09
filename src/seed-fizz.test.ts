import { describe, it, expect } from "vitest";
import { fizzbuzz } from "./seed-fizz";
describe("fizzbuzz", () => {
  it("15->FizzBuzz", () => expect(fizzbuzz(15)).toBe("FizzBuzz"));
  it("3->Fizz", () => expect(fizzbuzz(3)).toBe("Fizz"));
  it("7->7", () => expect(fizzbuzz(7)).toBe("7"));
  it("null throws", () =>
    expect(() => fizzbuzz(null as unknown as number)).toThrow(TypeError));
  it("undefined throws", () =>
    expect(() => fizzbuzz(undefined as unknown as number)).toThrow(TypeError));
  it("NaN throws", () => expect(() => fizzbuzz(NaN)).toThrow(TypeError));
});
