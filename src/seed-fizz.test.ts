import { describe, it, expect } from "vitest";
import { fizzbuzz } from "./seed-fizz";

describe("fizzbuzz", () => {
  it("15->FizzBuzz", () => {
    expect(fizzbuzz(15)).toBe("FizzBuzz");
  });
  it("3->Fizz", () => {
    expect(fizzbuzz(3)).toBe("Fizz");
  });
  it("7->7", () => {
    expect(fizzbuzz(7)).toBe("7");
  });

  it("throws TypeError when n is null or undefined", () => {
    expect(() => fizzbuzz(null as unknown as number)).toThrow(TypeError);
    expect(() => fizzbuzz(undefined as unknown as number)).toThrow(TypeError);
  });

  it("throws TypeError when n is NaN", () => {
    expect(() => fizzbuzz(Number.NaN)).toThrow(TypeError);
  });
});
