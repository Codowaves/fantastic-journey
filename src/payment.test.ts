import { describe, expect, it } from "vitest";

import { processPayment } from "./payment";

describe("processPayment", () => {
  it("accepts a positive finite amount", () => {
    expect(processPayment({ amount: 10, currency: "USD" })).toEqual({
      amount: 10,
      currency: "USD",
    });
  });

  it("rejects zero", () => {
    expect(() => processPayment({ amount: 0, currency: "USD" })).toThrow(
      RangeError,
    );
  });

  it("rejects negative amounts", () => {
    expect(() => processPayment({ amount: -5, currency: "USD" })).toThrow(
      RangeError,
    );
  });

  it("rejects NaN", () => {
    expect(() => processPayment({ amount: NaN, currency: "USD" })).toThrow(
      RangeError,
    );
  });
});
