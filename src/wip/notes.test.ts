import { describe, expect, it } from "vitest";

import { calculateTotal, legacyParse } from "./notes";

describe("notes helpers", () => {
  describe("calculateTotal", () => {
    it("sums price times quantity across all items", () => {
      expect(
        calculateTotal([
          { price: 1.5, qty: 2 },
          { price: 3, qty: 1 },
        ]),
      ).toBe(6);
    });

    it("rounds the total to two decimal places", () => {
      expect(calculateTotal([{ price: 10.1, qty: 3 }])).toBe(30.3);
    });

    it("returns 0 for an empty list of items", () => {
      expect(calculateTotal([])).toBe(0);
    });
  });

  describe("legacyParse", () => {
    it("parses a valid JSON string into its value", () => {
      expect(legacyParse('{"a":1,"b":[2,3]}')).toEqual({ a: 1, b: [2, 3] });
    });

    it("throws on malformed JSON input", () => {
      expect(() => legacyParse("{not json}")).toThrow();
    });
  });
});
