import { describe, expect, it } from "vitest";

import { parseBool } from "./parse-bool";

describe("parseBool", () => {
  it("returns true for recognized truthy strings", () => {
    expect(parseBool("true")).toBe(true);
    expect(parseBool("TRUE")).toBe(true);
    expect(parseBool("True")).toBe(true);
    expect(parseBool("1")).toBe(true);
    expect(parseBool("yes")).toBe(true);
    expect(parseBool("YES")).toBe(true);
    expect(parseBool("on")).toBe(true);
    expect(parseBool("ON")).toBe(true);
  });

  it("returns false for recognized falsy strings", () => {
    expect(parseBool("false")).toBe(false);
    expect(parseBool("FALSE")).toBe(false);
    expect(parseBool("0")).toBe(false);
    expect(parseBool("no")).toBe(false);
    expect(parseBool("NO")).toBe(false);
    expect(parseBool("off")).toBe(false);
    expect(parseBool("OFF")).toBe(false);
  });

  it("trims whitespace before parsing", () => {
    expect(parseBool("  true  ")).toBe(true);
    expect(parseBool("\tfalse\n")).toBe(false);
  });

  it("returns false for the empty string", () => {
    expect(parseBool("")).toBe(false);
  });

  it("returns false for unrecognized string content", () => {
    expect(parseBool("maybe")).toBe(false);
    expect(parseBool("truthy")).toBe(false);
    expect(parseBool("2")).toBe(false);
    expect(parseBool("not-a-bool")).toBe(false);
  });

  it("returns false for non-string input without throwing", () => {
    expect(parseBool(null)).toBe(false);
    expect(parseBool(undefined)).toBe(false);
    expect(parseBool(1)).toBe(false);
    expect(parseBool(0)).toBe(false);
    expect(parseBool(true)).toBe(false);
    expect(parseBool(false)).toBe(false);
    expect(parseBool({})).toBe(false);
    expect(parseBool([])).toBe(false);
    expect(parseBool(42)).toBe(false);
    expect(parseBool(NaN)).toBe(false);
  });

  describe("edge cases", () => {
    it("returns false for whitespace-only strings", () => {
      expect(parseBool(" ")).toBe(false);
      expect(parseBool("   ")).toBe(false);
      expect(parseBool("\t")).toBe(false);
      expect(parseBool("\n")).toBe(false);
      expect(parseBool("\r\n")).toBe(false);
      expect(parseBool(" \t \n ")).toBe(false);
    });

    it("handles leading and trailing whitespace around every truthy variant", () => {
      expect(parseBool("  true  ")).toBe(true);
      expect(parseBool(" 1 ")).toBe(true);
      expect(parseBool("\tyes\n")).toBe(true);
      expect(parseBool(" on ")).toBe(true);
    });

    it("handles leading and trailing whitespace around every falsy variant", () => {
      expect(parseBool(" false ")).toBe(false);
      expect(parseBool(" 0 ")).toBe(false);
      expect(parseBool("\tno\n")).toBe(false);
      expect(parseBool(" off ")).toBe(false);
    });

    it("returns false for numeric strings that are not exactly '1' or '0'", () => {
      expect(parseBool("2")).toBe(false);
      expect(parseBool("-1")).toBe(false);
      expect(parseBool("1.0")).toBe(false);
      expect(parseBool("01")).toBe(false);
      expect(parseBool("00")).toBe(false);
      expect(parseBool("100")).toBe(false);
      expect(parseBool("Infinity")).toBe(false);
    });

    it("returns false for partial-match abbreviations", () => {
      expect(parseBool("t")).toBe(false);
      expect(parseBool("f")).toBe(false);
      expect(parseBool("y")).toBe(false);
      expect(parseBool("n")).toBe(false);
      expect(parseBool("ye")).toBe(false);
      expect(parseBool("tru")).toBe(false);
      expect(parseBool("onoff")).toBe(false);
    });

    it("returns false for strings with extra content attached to a recognized word", () => {
      expect(parseBool("true!")).toBe(false);
      expect(parseBool("xtrue")).toBe(false);
      expect(parseBool("truefalse")).toBe(false);
      expect(parseBool("yesno")).toBe(false);
      expect(parseBool("  true false  ")).toBe(false);
    });

    it("returns false for mixed-case partial matches", () => {
      expect(parseBool("TrueX")).toBe(false);
      expect(parseBool("Yess")).toBe(false);
      expect(parseBool("ONN")).toBe(false);
      expect(parseBool("Offish")).toBe(false);
    });

    it("returns false for additional non-string input types without throwing", () => {
      const symbol = Symbol("true");
      expect(parseBool(symbol)).toBe(false);
      expect(parseBool(1n)).toBe(false);
      expect(parseBool(0n)).toBe(false);
      expect(parseBool(new Date())).toBe(false);
      expect(parseBool(new Map())).toBe(false);
      expect(parseBool(new Set())).toBe(false);
      expect(parseBool(/true/)).toBe(false);
      expect(parseBool(() => "true")).toBe(false);
    });

    it("returns false for arrays and array-like input without throwing", () => {
      expect(parseBool(["true"])).toBe(false);
      expect(parseBool(["false", "true"])).toBe(false);
      expect(parseBool([1])).toBe(false);
      expect(parseBool({ valueOf: () => "true" })).toBe(false);
    });
  });
});
