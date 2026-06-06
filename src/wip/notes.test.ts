import { describe, expect, it } from "vitest";

import { calculateTotal, legacyParse } from "./notes";

describe("wip/notes", () => {
  describe("calculateTotal", () => {
    it("sums price * qty for each item and rounds to 2 decimals", () => {
      const total = calculateTotal([
        { price: 10, qty: 2 },
        { price: 1.5, qty: 3 },
      ]);

      expect(total).toBe(24.5);
    });

    it("returns 0 for an empty cart", () => {
      expect(calculateTotal([])).toBe(0);
    });

    it("handles negative qty by subtracting the line value", () => {
      const total = calculateTotal([
        { price: 10, qty: 2 },
        { price: 5, qty: -1 },
      ]);

      expect(total).toBe(15);
    });

    it("rounds floating-point totals to two decimal places", () => {
      const total = calculateTotal([{ price: 0.1, qty: 3 }]);

      expect(total).toBe(0.3);
    });
  });

  describe("legacyParse", () => {
    it("parses a JSON object string", () => {
      expect(legacyParse('{"a":1,"b":"two"}')).toEqual({ a: 1, b: "two" });
    });

    it("parses a JSON array string", () => {
      expect(legacyParse("[1, 2, 3]")).toEqual([1, 2, 3]);
    });

    it("throws on invalid JSON input", () => {
      expect(() => legacyParse("not json")).toThrow(SyntaxError);
    });
  });
});
