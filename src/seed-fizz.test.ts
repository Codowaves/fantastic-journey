import { describe, expect, it } from "vitest";

import { fizzbuzz } from "./seed-fizz";

describe("fizzbuzz", () => {
  it("15->FizzBuzz", () => {
    expect(fizzbuzz(15)).toBe("FizzBuzz");
  });

  it("3->Fizz", () => {
    expect(fizzbuzz(3)).toBe("Fizz");
  });

  it("5->Buzz", () => {
    expect(fizzbuzz(5)).toBe("Buzz");
  });

  it("7->7", () => {
    expect(fizzbuzz(7)).toBe("7");
  });

  it("30->FizzBuzz (multiple-of-15 branch with larger value)", () => {
    expect(fizzbuzz(30)).toBe("FizzBuzz");
  });

  it("45->FizzBuzz (large multiple of 15)", () => {
    expect(fizzbuzz(45)).toBe("FizzBuzz");
  });

  it("9->Fizz (non-multiple-of-5 multiple-of-3 branch)", () => {
    expect(fizzbuzz(9)).toBe("Fizz");
  });

  it("25->Buzz (non-multiple-of-3 multiple-of-5 branch)", () => {
    expect(fizzbuzz(25)).toBe("Buzz");
  });

  it("0->FizzBuzz (zero is a multiple of 15, the divisible-by-zero edge)", () => {
    expect(fizzbuzz(0)).toBe("FizzBuzz");
  });

  it("negative multiple of 3 -> Fizz", () => {
    expect(fizzbuzz(-3)).toBe("Fizz");
  });

  it("negative multiple of 5 -> Buzz", () => {
    expect(fizzbuzz(-5)).toBe("Buzz");
  });

  it("negative multiple of 15 -> FizzBuzz", () => {
    expect(fizzbuzz(-15)).toBe("FizzBuzz");
  });

  describe("fallback branch (non-divisible)", () => {
    it("returns the number as a string when not divisible by 3 or 5", () => {
      expect(fizzbuzz(1)).toBe("1");
      expect(fizzbuzz(2)).toBe("2");
      expect(fizzbuzz(7)).toBe("7");
      expect(fizzbuzz(11)).toBe("11");
    });

    it("returns the negative number as a string when not divisible by 3 or 5", () => {
      expect(fizzbuzz(-1)).toBe("-1");
      expect(fizzbuzz(-7)).toBe("-7");
    });
  });

  describe("error/throw paths", () => {
    it("does not throw for any finite integer", () => {
      expect(() => fizzbuzz(0)).not.toThrow();
      expect(() => fizzbuzz(1)).not.toThrow();
      expect(() => fizzbuzz(15)).not.toThrow();
      expect(() => fizzbuzz(-15)).not.toThrow();
      expect(() => fizzbuzz(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    it("does not throw on NaN (NaN modulo anything is NaN, so the fallback branch fires)", () => {
      expect(() => fizzbuzz(Number.NaN)).not.toThrow();
      expect(fizzbuzz(Number.NaN)).toBe("NaN");
    });

    it("does not throw on Infinity (Infinity modulo 15 is NaN, fallback branch fires)", () => {
      expect(() => fizzbuzz(Number.POSITIVE_INFINITY)).not.toThrow();
      expect(fizzbuzz(Number.POSITIVE_INFINITY)).toBe("Infinity");
    });

    it("does not throw on -Infinity", () => {
      expect(() => fizzbuzz(Number.NEGATIVE_INFINITY)).not.toThrow();
      expect(fizzbuzz(Number.NEGATIVE_INFINITY)).toBe("-Infinity");
    });

    it("does not throw for non-finite numbers that fall through all divisibility checks", () => {
      expect(() => fizzbuzz(Number.NaN)).not.toThrow();
      expect(() => fizzbuzz(Number.POSITIVE_INFINITY)).not.toThrow();
      expect(() => fizzbuzz(Number.NEGATIVE_INFINITY)).not.toThrow();
    });
  });
});
