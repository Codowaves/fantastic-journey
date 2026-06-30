import { describe, expect, it } from "vitest";

import { parseCsvLine } from "./parse-csv-line";

describe("parseCsvLine", () => {
  it("splits a simple comma-separated line", () => {
    expect(parseCsvLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("returns a single field when there are no commas", () => {
    expect(parseCsvLine("hello")).toEqual(["hello"]);
  });

  it("returns an empty array for an empty line", () => {
    expect(parseCsvLine("")).toEqual([""]);
  });

  it("returns empty fields for consecutive commas", () => {
    expect(parseCsvLine("a,,b")).toEqual(["a", "", "b"]);
  });

  it("preserves empty leading and trailing fields", () => {
    expect(parseCsvLine(",a,")).toEqual(["", "a", ""]);
  });

  it("respects commas inside double-quoted fields", () => {
    expect(parseCsvLine('a,"b,c",d')).toEqual(["a", "b,c", "d"]);
  });

  it("handles a quoted field that is the entire line", () => {
    expect(parseCsvLine('"hello, world"')).toEqual(["hello, world"]);
  });

  it("decodes escaped double quotes inside quoted fields", () => {
    expect(parseCsvLine('"she said ""hi""",ok')).toEqual([
      'she said "hi"',
      "ok",
    ]);
  });

  it("keeps quotes-as-content when they appear mid-field", () => {
    expect(parseCsvLine('a"b"c')).toEqual(['a"b"c']);
  });

  it("supports empty quoted fields", () => {
    expect(parseCsvLine('a,"",b')).toEqual(["a", "", "b"]);
  });

  it("handles multiple quoted fields with internal commas", () => {
    expect(parseCsvLine('"1,2","3,4","5,6"')).toEqual(["1,2", "3,4", "5,6"]);
  });

  it("handles whitespace inside quoted fields", () => {
    expect(parseCsvLine('"  spaced  ",plain')).toEqual(["  spaced  ", "plain"]);
  });

  it("handles whitespace around unquoted commas", () => {
    expect(parseCsvLine(" a , b ")).toEqual([" a ", " b "]);
  });

  it("decodes a quoted field that contains only escaped quotes", () => {
    expect(parseCsvLine('""""')).toEqual(['"']);
  });

  it("treats trailing comma as an empty trailing field", () => {
    expect(parseCsvLine("a,b,")).toEqual(["a", "b", ""]);
  });

  it("treats leading comma as an empty leading field", () => {
    expect(parseCsvLine(",a,b")).toEqual(["", "a", "b"]);
  });

  it("throws when a quoted field is not closed", () => {
    expect(() => parseCsvLine('a,"unterminated')).toThrow(
      /unterminated quoted field/,
    );
  });

  it("throws when an escaped quote is not closed", () => {
    expect(() => parseCsvLine('"oops""')).toThrow(/unterminated quoted field/);
  });

  it("handles a single quoted field with no closing quote", () => {
    expect(() => parseCsvLine('"')).toThrow(/unterminated quoted field/);
  });

  it("handles numbers and special characters in unquoted fields", () => {
    expect(parseCsvLine("1,2.5,-3,#tag")).toEqual(["1", "2.5", "-3", "#tag"]);
  });
});
