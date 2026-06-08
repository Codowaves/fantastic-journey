import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

import { calculateTotal, legacyParse } from "./notes";

describe("wip/notes helpers", () => {
  describe("calculateTotal", () => {
    let logSpy: MockInstance<[message?: unknown, ...optionalParams: unknown[]], void>;

    beforeEach(() => {
      logSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      logSpy.mockRestore();
    });

    it("sums price * qty for each item and rounds to two decimals", () => {
      const total = calculateTotal([
        { price: 2.5, qty: 3 },
        { price: 1.25, qty: 4 },
      ]);

      expect(total).toBe(12.5);
      expect(logSpy).toHaveBeenCalled();
    });

    it("rounds sub-cent fractional totals to two decimal places", () => {
      const total = calculateTotal([
        { price: 0.1, qty: 1 },
        { price: 0.2, qty: 1 },
      ]);

      expect(total).toBe(0.3);
    });

    it("returns 0 for an empty cart", () => {
      expect(calculateTotal([])).toBe(0);
    });

    it("preserves negative quantities (totals can go below zero)", () => {
      const total = calculateTotal([
        { price: 5, qty: 2 },
        { price: 5, qty: -1 },
      ]);

      expect(total).toBe(5);
    });
  });

  describe("legacyParse", () => {
    let warnSpy: MockInstance<[message?: unknown, ...optionalParams: unknown[]], void>;

    beforeEach(() => {
      warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it("parses valid JSON into the corresponding value", () => {
      expect(legacyParse('{"a":1,"b":[true,null]}')).toEqual({
        a: 1,
        b: [true, null],
      });
      expect(warnSpy).toHaveBeenCalled();
    });

    it("throws a SyntaxError for malformed JSON", () => {
      expect(() => legacyParse("{not json")).toThrow(SyntaxError);
    });
  });
});
