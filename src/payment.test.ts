import { describe, expect, it } from "vitest";

import { processPayment } from "./payment";

describe("processPayment", () => {
  it("accepts a positive amount and rounds to two decimal places", () => {
    expect(processPayment(19.999, "USD")).toEqual({ amount: 20, currency: "USD" });
    expect(processPayment(5, "EUR")).toEqual({ amount: 5, currency: "EUR" });
  });

  it("rejects a zero amount", () => {
    expect(() => processPayment(0, "USD")).toThrow(RangeError);
  });

  it("rejects a negative amount", () => {
    expect(() => processPayment(-1, "USD")).toThrow(RangeError);
  });

  it("rejects NaN", () => {
    expect(() => processPayment(NaN, "USD")).toThrow(RangeError);
  });

  it("rejects Infinity", () => {
    expect(() => processPayment(Infinity, "USD")).toThrow(RangeError);
  });
});
