import { describe, expect, it } from "vitest";

import { parseCsvLine } from "./parse-csv-line";

describe("parseCsvLine", () => {
  it("splits a simple comma-separated line", () => {
    expect(parseCsvLine("a,b,c")).toEqual({ ok: true, value: ["a", "b", "c"] });
  });

  it("returns a single field when there are no commas", () => {
    expect(parseCsvLine("hello")).toEqual({ ok: true, value: ["hello"] });
  });

  it("returns an empty array for an empty line", () => {
    expect(parseCsvLine("")).toEqual({ ok: true, value: [""] });
  });

  it("returns empty fields for consecutive commas", () => {
    expect(parseCsvLine("a,,b")).toEqual({ ok: true, value: ["a", "", "b"] });
  });

  it("preserves empty leading and trailing fields", () => {
    expect(parseCsvLine(",a,")).toEqual({ ok: true, value: ["", "a", ""] });
  });

  it("respects commas inside double-quoted fields", () => {
    expect(parseCsvLine('a,"b,c",d')).toEqual({
      ok: true,
      value: ["a", "b,c", "d"],
    });
  });

  it("handles a quoted field that is the entire line", () => {
    expect(parseCsvLine('"hello, world"')).toEqual({
      ok: true,
      value: ["hello, world"],
    });
  });

  it("decodes escaped double quotes inside quoted fields", () => {
    expect(parseCsvLine('"she said ""hi""",ok')).toEqual({
      ok: true,
      value: ['she said "hi"', "ok"],
    });
  });

  it("keeps quotes-as-content when they appear mid-field", () => {
    expect(parseCsvLine('a"b"c')).toEqual({ ok: true, value: ['a"b"c'] });
  });

  it("supports empty quoted fields", () => {
    expect(parseCsvLine('a,"",b')).toEqual({ ok: true, value: ["a", "", "b"] });
  });

  it("handles multiple quoted fields with internal commas", () => {
    expect(parseCsvLine('"1,2","3,4","5,6"')).toEqual({
      ok: true,
      value: ["1,2", "3,4", "5,6"],
    });
  });

  it("handles whitespace inside quoted fields", () => {
    expect(parseCsvLine('"  spaced  ",plain')).toEqual({
      ok: true,
      value: ["  spaced  ", "plain"],
    });
  });

  it("handles whitespace around unquoted commas", () => {
    expect(parseCsvLine(" a , b ")).toEqual({
      ok: true,
      value: [" a ", " b "],
    });
  });

  it("decodes a quoted field that contains only escaped quotes", () => {
    expect(parseCsvLine('""""')).toEqual({ ok: true, value: ['"'] });
  });

  it("treats trailing comma as an empty trailing field", () => {
    expect(parseCsvLine("a,b,")).toEqual({ ok: true, value: ["a", "b", ""] });
  });

  it("treats leading comma as an empty leading field", () => {
    expect(parseCsvLine(",a,b")).toEqual({ ok: true, value: ["", "a", "b"] });
  });

  it("returns an Err when a quoted field is not closed", () => {
    const res = parseCsvLine('a,"unterminated');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
      expect(res.error.message).toMatch(/unterminated quoted field/);
    }
  });

  it("returns an Err when an escaped quote is not closed", () => {
    const res = parseCsvLine('"oops""');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toMatch(/unterminated quoted field/);
    }
  });

  it("returns an Err for a single quoted field with no closing quote", () => {
    const res = parseCsvLine('"');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toMatch(/unterminated quoted field/);
    }
  });

  it("handles numbers and special characters in unquoted fields", () => {
    expect(parseCsvLine("1,2.5,-3,#tag")).toEqual({
      ok: true,
      value: ["1", "2.5", "-3", "#tag"],
    });
  });
});
