import { describe, expect, it } from "vitest";

import { parseBool } from "./parse-bool";

describe("parseBool", () => {
  it("returns true for 'true'", () => {
    expect(parseBool("true")).toBe(true);
  });

  it("returns true for '1'", () => {
    expect(parseBool("1")).toBe(true);
  });

  it("returns true for 'yes'", () => {
    expect(parseBool("yes")).toBe(true);
  });

  it("is case-insensitive for truthy strings", () => {
    expect(parseBool("TRUE")).toBe(true);
    expect(parseBool("True")).toBe(true);
    expect(parseBool("YES")).toBe(true);
    expect(parseBool("Yes")).toBe(true);
  });

  it("trims surrounding whitespace for truthy strings", () => {
    expect(parseBool("  true  ")).toBe(true);
    expect(parseBool("\t1\n")).toBe(true);
    expect(parseBool(" yes ")).toBe(true);
  });

  it("returns false for 'false'", () => {
    expect(parseBool("false")).toBe(false);
  });

  it("returns false for '0'", () => {
    expect(parseBool("0")).toBe(false);
  });

  it("returns false for 'no'", () => {
    expect(parseBool("no")).toBe(false);
  });

  it("returns false for arbitrary strings", () => {
    expect(parseBool("maybe")).toBe(false);
    expect(parseBool("truthy")).toBe(false);
    expect(parseBool("nope")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(parseBool("")).toBe(false);
  });

  it("returns false for whitespace-only strings", () => {
    expect(parseBool("   ")).toBe(false);
  });

  it("returns false for null", () => {
    expect(parseBool(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(parseBool(undefined)).toBe(false);
  });

  it("returns false for numbers", () => {
    expect(parseBool(1)).toBe(false);
    expect(parseBool(0)).toBe(false);
  });

  it("returns false for booleans", () => {
    expect(parseBool(true)).toBe(false);
    expect(parseBool(false)).toBe(false);
  });
});
