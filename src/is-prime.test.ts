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

  it("returns false at the boundary between prime and composite (number just below a square)", () => {
    expect(isPrime(8)).toBe(false);
  });

  it("returns false for inputs coerced via Number(true)/Number(false)", () => {
    expect(isPrime(Number(true))).toBe(false);
    expect(isPrime(Number(false))).toBe(false);
  });

  it("returns false for inputs at the maximum safe integer that are composite", () => {
    expect(isPrime(Number.MAX_SAFE_INTEGER)).toBe(false);
  });

  it("returns false for Infinity", () => {
    expect(isPrime(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("returns false for negative inputs at the boundary", () => {
    expect(isPrime(-2)).toBe(false);
    expect(isPrime(-3)).toBe(false);
  });
});
