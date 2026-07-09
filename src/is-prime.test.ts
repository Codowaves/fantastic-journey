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

  it("returns false for negative integers below the prime threshold", () => {
    expect(isPrime(-1)).toBe(false);
    expect(isPrime(-2)).toBe(false);
    expect(isPrime(-3)).toBe(false);
    expect(isPrime(-4)).toBe(false);
  });

  it("returns false for Infinity", () => {
    expect(isPrime(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isPrime(Number.NEGATIVE_INFINITY)).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isPrime(null as unknown as number)).toBe(false);
    expect(isPrime(undefined as unknown as number)).toBe(false);
  });

  it("handles the boundary at n = 2 (smallest prime)", () => {
    expect(isPrime(2)).toBe(true);
  });

  it("handles the boundary at n = 4 (smallest composite above 2)", () => {
    expect(isPrime(4)).toBe(false);
  });

  it("returns false for squares of primes", () => {
    expect(isPrime(49)).toBe(false);
    expect(isPrime(121)).toBe(false);
    expect(isPrime(169)).toBe(false);
  });

  it("returns true for twin primes around 1000", () => {
    expect(isPrime(1019)).toBe(true);
    expect(isPrime(1021)).toBe(true);
  });

  it("returns false for a large composite near the search boundary", () => {
    expect(isPrime(1000003 * 2)).toBe(false);
  });
});
