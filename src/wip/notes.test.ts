import { describe, it, expect } from "vitest";

import { calculateTotal, legacyParse } from "./notes";

describe("calculateTotal", () => {
  it("sums price times quantity across all items", () => {
    const total = calculateTotal([
      { price: 10, qty: 2 },
      { price: 5, qty: 3 },
    ]);
    expect(total).toBe(35);
  });

  it("returns 0 for an empty list", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("rounds the result to two decimal places", () => {
    const total = calculateTotal([{ price: 0.1, qty: 3 }]);
    expect(total).toBe(0.3);
  });
});

describe("legacyParse", () => {
  it("parses a valid JSON string into its value", () => {
    expect(legacyParse('{"a":1,"b":[2,3]}')).toEqual({ a: 1, b: [2, 3] });
  });

  it("throws on malformed JSON input", () => {
    expect(() => legacyParse("{not valid json}")).toThrow();
  });
});
