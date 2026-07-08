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

  it("returns false for very large negative numbers", () => {
    expect(isPrime(-97)).toBe(false);
    expect(isPrime(-101)).toBe(false);
    expect(isPrime(-Number.MAX_SAFE_INTEGER)).toBe(false);
  });

  it("returns false for +Infinity and -Infinity", () => {
    expect(isPrime(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isPrime(Number.NEGATIVE_INFINITY)).toBe(false);
  });

  it("returns false at the boundary just below 2", () => {
    expect(isPrime(-1)).toBe(false);
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
  });

  it("returns false for perfect squares of primes", () => {
    expect(isPrime(4)).toBe(false);
    expect(isPrime(9)).toBe(false);
    expect(isPrime(25)).toBe(false);
    expect(isPrime(49)).toBe(false);
    expect(isPrime(121)).toBe(false);
  });

  it("returns false for products of two distinct primes", () => {
    expect(isPrime(6)).toBe(false);
    expect(isPrime(15)).toBe(false);
    expect(isPrime(35)).toBe(false);
    expect(isPrime(143)).toBe(false);
  });

  it("returns true for very large primes", () => {
    expect(isPrime(7919)).toBe(true);
    expect(isPrime(104729)).toBe(true);
  });

  it("returns false for floating-point representations of integers", () => {
    expect(isPrime(7.0)).toBe(true);
    expect(isPrime(4.0)).toBe(false);
    expect(isPrime(2.000001)).toBe(false);
  });

  it("returns false for +0 and -0", () => {
    expect(isPrime(+0)).toBe(false);
    expect(isPrime(-0)).toBe(false);
  });

  it("returns false for values just above Number.MAX_SAFE_INTEGER", () => {
    expect(isPrime(Number.MAX_SAFE_INTEGER + 2)).toBe(false);
    expect(isPrime(Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});
