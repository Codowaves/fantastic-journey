import { describe, expect, it } from "vitest";

import {
  InvalidPaymentAmountError,
  processPayment,
  validatePaymentAmount,
} from "./payment";

describe("validatePaymentAmount", () => {
  it("accepts positive finite amounts", () => {
    expect(() => validatePaymentAmount(0.01)).not.toThrow();
    expect(() => validatePaymentAmount(100)).not.toThrow();
  });

  it("rejects zero", () => {
    expect(() => validatePaymentAmount(0)).toThrow(InvalidPaymentAmountError);
  });

  it("rejects negative amounts", () => {
    expect(() => validatePaymentAmount(-0.01)).toThrow(
      InvalidPaymentAmountError,
    );
    expect(() => validatePaymentAmount(-100)).toThrow(
      InvalidPaymentAmountError,
    );
  });

  it("rejects NaN", () => {
    expect(() => validatePaymentAmount(Number.NaN)).toThrow(
      InvalidPaymentAmountError,
    );
  });

  it("rejects non-finite amounts (Infinity and -Infinity)", () => {
    expect(() => validatePaymentAmount(Number.POSITIVE_INFINITY)).toThrow(
      InvalidPaymentAmountError,
    );
    expect(() => validatePaymentAmount(Number.NEGATIVE_INFINITY)).toThrow(
      InvalidPaymentAmountError,
    );
  });

  it("produces an error with a clear message", () => {
    try {
      validatePaymentAmount(0);
      throw new Error("expected validatePaymentAmount to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(InvalidPaymentAmountError);
      expect((err as Error).message).toMatch(/Invalid payment amount/);
    }
  });
});

describe("processPayment", () => {
  it("returns a processed result for a valid amount", () => {
    expect(processPayment(42, "USD")).toEqual({
      amount: 42,
      currency: "USD",
      status: "processed",
    });
  });

  it("refuses to process zero, negative, and NaN amounts", () => {
    expect(() => processPayment(0, "USD")).toThrow(InvalidPaymentAmountError);
    expect(() => processPayment(-1, "USD")).toThrow(InvalidPaymentAmountError);
    expect(() => processPayment(Number.NaN, "USD")).toThrow(
      InvalidPaymentAmountError,
    );
  });
});
