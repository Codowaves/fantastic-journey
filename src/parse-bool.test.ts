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
});
