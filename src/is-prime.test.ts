import { describe, expect, it } from "vitest";

import { isPrime } from "./is-prime";

describe("isPrime", () => {
  it("returns false for numbers less than 2", () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(-5)).toBe(false);
  });

  it("returns false for non-integer inputs", () => {
    expect(isPrime(2.5)).toBe(false);
    expect(isPrime(Number.NaN)).toBe(false);
  });

  it("returns true for small primes", () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(3)).toBe(true);
    expect(isPrime(5)).toBe(true);
  });

  it("returns false for composite numbers", () => {
    expect(isPrime(4)).toBe(false);
    expect(isPrime(9)).toBe(false);
    expect(isPrime(25)).toBe(false);
  });

  it("returns true for larger primes", () => {
    expect(isPrime(97)).toBe(true);
    expect(isPrime(101)).toBe(true);
  });
});
