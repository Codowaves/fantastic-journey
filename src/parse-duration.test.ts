import { describe, it, expect } from "vitest";
import { parseDuration } from "./parse-duration";

describe("parseDuration", () => {
  describe("single units", () => {
    it("parses milliseconds", () => {
      expect(parseDuration("100ms")).toEqual({ ok: true, value: 100 });
      expect(parseDuration("500ms")).toEqual({ ok: true, value: 500 });
    });

    it("parses seconds", () => {
      expect(parseDuration("90s")).toEqual({ ok: true, value: 90_000 });
      expect(parseDuration("1s")).toEqual({ ok: true, value: 1_000 });
    });

    it("parses minutes", () => {
      expect(parseDuration("5m")).toEqual({
        ok: true,
        value: 5 * 60 * 1_000,
      });
      expect(parseDuration("1m")).toEqual({ ok: true, value: 60_000 });
    });

    it("parses hours", () => {
      expect(parseDuration("2h")).toEqual({
        ok: true,
        value: 2 * 60 * 60 * 1_000,
      });
      expect(parseDuration("1h")).toEqual({ ok: true, value: 3_600_000 });
    });

    it("parses days", () => {
      expect(parseDuration("2d")).toEqual({
        ok: true,
        value: 2 * 24 * 60 * 60 * 1_000,
      });
      expect(parseDuration("1d")).toEqual({
        ok: true,
        value: 86_400_000,
      });
    });
  });

  describe("combined segments", () => {
    it("parses hours and minutes", () => {
      expect(parseDuration("1h30m")).toEqual({ ok: true, value: 5_400_000 });
    });

    it("parses multiple segments", () => {
      expect(parseDuration("1d2h30m15s")).toEqual({
        ok: true,
        value:
          1 * 24 * 60 * 60 * 1_000 +
          2 * 60 * 60 * 1_000 +
          30 * 60 * 1_000 +
          15 * 1_000,
      });
    });

    it("parses segments with whitespace", () => {
      expect(parseDuration("1h 30m")).toEqual({ ok: true, value: 5_400_000 });
      expect(parseDuration("2d 3h 15m")).toEqual({
        ok: true,
        value: 2 * 24 * 60 * 60 * 1_000 + 3 * 60 * 60 * 1_000 + 15 * 60 * 1_000,
      });
    });
  });

  describe("out-of-order segments", () => {
    it("parses minutes before hours", () => {
      expect(parseDuration("30m1h")).toEqual({ ok: true, value: 5_400_000 });
    });

    it("parses segments in any order", () => {
      expect(parseDuration("15s30m2h1d")).toEqual({
        ok: true,
        value:
          1 * 24 * 60 * 60 * 1_000 +
          2 * 60 * 60 * 1_000 +
          30 * 60 * 1_000 +
          15 * 1_000,
      });
      expect(parseDuration("1d15s2h30m")).toEqual({
        ok: true,
        value:
          1 * 24 * 60 * 60 * 1_000 +
          2 * 60 * 60 * 1_000 +
          30 * 60 * 1_000 +
          15 * 1_000,
      });
    });
  });

  describe("decimal quantities", () => {
    it("parses decimal hours", () => {
      expect(parseDuration("1.5h")).toEqual({ ok: true, value: 5_400_000 });
    });

    it("parses decimal minutes", () => {
      expect(parseDuration("2.5m")).toEqual({ ok: true, value: 150_000 });
    });

    it("parses decimal seconds", () => {
      expect(parseDuration("1.5s")).toEqual({ ok: true, value: 1_500 });
    });

    it("parses decimal days", () => {
      expect(parseDuration("0.5d")).toEqual({
        ok: true,
        value: 12 * 60 * 60 * 1_000,
      });
    });

    it("parses multiple decimals", () => {
      expect(parseDuration("1.5h 30.5s")).toEqual({
        ok: true,
        value: 5_400_000 + 30_500,
      });
    });
  });

  describe("error cases", () => {
    it("returns an Err on empty string", () => {
      const res = parseDuration("");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(TypeError);
        expect(res.error.message).toMatch("cannot be empty");
      }
    });

    it("returns an Err on whitespace-only string", () => {
      const res = parseDuration("   ");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(TypeError);
        expect(res.error.message).toMatch("cannot be empty");
      }
    });

    it("returns an Err on unknown units", () => {
      const res = parseDuration("1x");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(TypeError);
        expect(res.error.message).toMatch("no valid units found");
      }
    });

    it("returns an Err on repeated units", () => {
      const res = parseDuration("1h2h");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(TypeError);
        expect(res.error.message).toMatch("appears more than once");
      }
    });

    it("returns an Err on trailing garbage", () => {
      const res = parseDuration("1h garbage");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(TypeError);
        expect(res.error.message).toMatch("trailing garbage");
      }
    });

    it("returns an Err on invalid format", () => {
      const res = parseDuration("invalid");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(TypeError);
        expect(res.error.message).toMatch("no valid units found");
      }
    });

    it("returns an Err on number without unit", () => {
      const res = parseDuration("123");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(TypeError);
        expect(res.error.message).toMatch("no valid units found");
      }
    });

    it("returns an Err on mixed valid and invalid segments", () => {
      const res = parseDuration("1h 2x");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(TypeError);
        expect(res.error.message).toMatch("trailing garbage");
      }
    });
  });
});
