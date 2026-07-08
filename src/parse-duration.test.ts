import { describe, it, expect } from "vitest";
import { parseDuration } from "./parse-duration";

describe("parseDuration", () => {
  describe("single units", () => {
    it("parses milliseconds", () => {
      expect(parseDuration("100ms")).toBe(100);
      expect(parseDuration("500ms")).toBe(500);
    });

    it("parses seconds", () => {
      expect(parseDuration("90s")).toBe(90_000);
      expect(parseDuration("1s")).toBe(1_000);
    });

    it("parses minutes", () => {
      expect(parseDuration("5m")).toBe(5 * 60 * 1_000);
      expect(parseDuration("1m")).toBe(60_000);
    });

    it("parses hours", () => {
      expect(parseDuration("2h")).toBe(2 * 60 * 60 * 1_000);
      expect(parseDuration("1h")).toBe(3_600_000);
    });

    it("parses days", () => {
      expect(parseDuration("2d")).toBe(2 * 24 * 60 * 60 * 1_000);
      expect(parseDuration("1d")).toBe(86_400_000);
    });
  });

  describe("combined segments", () => {
    it("parses hours and minutes", () => {
      expect(parseDuration("1h30m")).toBe(5_400_000);
    });

    it("parses multiple segments", () => {
      expect(parseDuration("1d2h30m15s")).toBe(
        1 * 24 * 60 * 60 * 1_000 +
          2 * 60 * 60 * 1_000 +
          30 * 60 * 1_000 +
          15 * 1_000,
      );
    });

    it("parses segments with whitespace", () => {
      expect(parseDuration("1h 30m")).toBe(5_400_000);
      expect(parseDuration("2d 3h 15m")).toBe(
        2 * 24 * 60 * 60 * 1_000 + 3 * 60 * 60 * 1_000 + 15 * 60 * 1_000,
      );
    });
  });

  describe("out-of-order segments", () => {
    it("parses minutes before hours", () => {
      expect(parseDuration("30m1h")).toBe(5_400_000);
    });

    it("parses segments in any order", () => {
      expect(parseDuration("15s30m2h1d")).toBe(
        1 * 24 * 60 * 60 * 1_000 +
          2 * 60 * 60 * 1_000 +
          30 * 60 * 1_000 +
          15 * 1_000,
      );
      expect(parseDuration("1d15s2h30m")).toBe(
        1 * 24 * 60 * 60 * 1_000 +
          2 * 60 * 60 * 1_000 +
          30 * 60 * 1_000 +
          15 * 1_000,
      );
    });
  });

  describe("decimal quantities", () => {
    it("parses decimal hours", () => {
      expect(parseDuration("1.5h")).toBe(5_400_000);
    });

    it("parses decimal minutes", () => {
      expect(parseDuration("2.5m")).toBe(150_000);
    });

    it("parses decimal seconds", () => {
      expect(parseDuration("1.5s")).toBe(1_500);
    });

    it("parses decimal days", () => {
      expect(parseDuration("0.5d")).toBe(12 * 60 * 60 * 1_000);
    });

    it("parses multiple decimals", () => {
      expect(parseDuration("1.5h 30.5s")).toBe(5_400_000 + 30_500);
    });
  });

  describe("error cases", () => {
    it("throws on empty string", () => {
      expect(() => parseDuration("")).toThrow(TypeError);
      expect(() => parseDuration("")).toThrow("cannot be empty");
    });

    it("throws on whitespace-only string", () => {
      expect(() => parseDuration("   ")).toThrow(TypeError);
      expect(() => parseDuration("   ")).toThrow("cannot be empty");
    });

    it("throws on unknown units", () => {
      expect(() => parseDuration("1x")).toThrow(TypeError);
      expect(() => parseDuration("1x")).toThrow("no valid units found");
    });

    it("throws on repeated units", () => {
      expect(() => parseDuration("1h2h")).toThrow(TypeError);
      expect(() => parseDuration("1h2h")).toThrow("appears more than once");
    });

    it("throws on trailing garbage", () => {
      expect(() => parseDuration("1h garbage")).toThrow(TypeError);
      expect(() => parseDuration("1h garbage")).toThrow("trailing garbage");
    });

    it("throws on invalid format", () => {
      expect(() => parseDuration("invalid")).toThrow(TypeError);
      expect(() => parseDuration("invalid")).toThrow("no valid units found");
    });

    it("throws on number without unit", () => {
      expect(() => parseDuration("123")).toThrow(TypeError);
      expect(() => parseDuration("123")).toThrow("no valid units found");
    });

    it("throws on mixed valid and invalid segments", () => {
      expect(() => parseDuration("1h 2x")).toThrow(TypeError);
      expect(() => parseDuration("1h 2x")).toThrow("trailing garbage");
    });
  });

  describe("whitespace edge cases (exercises the regex's \\s* branches)", () => {
    it("accepts tab characters between segments", () => {
      expect(parseDuration("1h\t30m")).toBe(5_400_000);
    });

    it("accepts newline characters between segments", () => {
      expect(parseDuration("1h\n30m")).toBe(5_400_000);
    });

    it("accepts multiple consecutive spaces between segments", () => {
      expect(parseDuration("1h  30m")).toBe(5_400_000);
    });

    it("accepts leading whitespace", () => {
      expect(parseDuration("  1h")).toBe(3_600_000);
    });

    it("accepts trailing whitespace", () => {
      expect(parseDuration("1h  ")).toBe(3_600_000);
    });

    it("accepts leading and trailing whitespace combined", () => {
      expect(parseDuration("  1h30m  ")).toBe(5_400_000);
    });

    it("accepts mixed whitespace characters between segments", () => {
      expect(parseDuration("1h \t\n 30m")).toBe(5_400_000);
    });
  });

  describe("case-sensitivity branches (uppercase units fall through to 'no valid units')", () => {
    it("throws on uppercase hour unit", () => {
      expect(() => parseDuration("1H")).toThrow(TypeError);
      expect(() => parseDuration("1H")).toThrow("no valid units found");
    });

    it("throws on uppercase second unit", () => {
      expect(() => parseDuration("1S")).toThrow(TypeError);
      expect(() => parseDuration("1S")).toThrow("no valid units found");
    });

    it("throws on fully uppercase MS", () => {
      expect(() => parseDuration("100MS")).toThrow(TypeError);
      expect(() => parseDuration("100MS")).toThrow("no valid units found");
    });

    it("throws when only one segment is uppercase and the rest parse", () => {
      expect(() => parseDuration("1h2M")).toThrow(TypeError);
    });
  });

  describe("sign-prefix branches (regex is unanchored, so a sign is skipped over)", () => {
    it("parses despite a positive sign prefix", () => {
      // The regex is unanchored: it skips the '+' and matches "1h" at index 1.
      expect(parseDuration("+1h")).toBe(3_600_000);
    });

    it("parses despite a negative sign prefix", () => {
      // The regex is unanchored: it skips the '-' and matches "1h" at index 1.
      expect(parseDuration("-1h")).toBe(3_600_000);
    });

    it("parses a signed prefix with combined segments", () => {
      // The leading sign is ignored, and "1h30m" at index 1 is parsed normally.
      expect(parseDuration("+1h30m")).toBe(5_400_000);
    });
  });

  describe("malformed numeric branches", () => {
    it("throws on a trailing dot with no following digit before the unit", () => {
      // "1.h" — the regex needs at least one digit after the dot, so
      // the number portion never lands on a valid unit.
      expect(() => parseDuration("1.h")).toThrow(TypeError);
      expect(() => parseDuration("1.h")).toThrow("no valid units found");
    });

    it("parses a leading decimal point because the regex is unanchored", () => {
      // ".5h" — the leading "." fails to anchor the regex, so it scans
      // forward and matches "5h" at index 1. This documents the unanchored
      // fallback branch (regex.match-anywhere) rather than a "no units" path.
      expect(parseDuration(".5h")).toBe(5 * 3_600_000);
    });

    it("throws on a unit with no preceding number", () => {
      expect(() => parseDuration("h")).toThrow(TypeError);
      expect(() => parseDuration("h")).toThrow("no valid units found");
    });
  });

  describe("fallback / non-error behavior on edge inputs", () => {
    it("does not throw on input that starts with whitespace before a valid segment", () => {
      expect(() => parseDuration(" 1h")).not.toThrow();
      expect(parseDuration(" 1h")).toBe(3_600_000);
    });

    it("does not throw on input that ends with whitespace after a valid segment", () => {
      expect(() => parseDuration("1h ")).not.toThrow();
      expect(parseDuration("1h ")).toBe(3_600_000);
    });

    it("does not throw on a single zero-duration segment", () => {
      expect(() => parseDuration("0s")).not.toThrow();
      expect(parseDuration("0s")).toBe(0);
    });

    it("does not throw on a zero decimal segment", () => {
      expect(() => parseDuration("0.5h")).not.toThrow();
      expect(parseDuration("0.5h")).toBe(1_800_000);
    });
  });
});
