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
});
