import { describe, expect, it } from "vitest";

import { hexToRgb } from "./hex-to-rgb";

describe("hexToRgb", () => {
  it("converts a basic hex color", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("converts white", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts black", () => {
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts a mid-range color", () => {
    expect(hexToRgb("#1a2b3c")).toEqual({ r: 26, g: 43, b: 60 });
  });

  it("throws on null input", () => {
    expect(() => hexToRgb(null as unknown as string)).toThrow(TypeError);
  });

  it("throws on undefined input", () => {
    expect(() => hexToRgb(undefined as unknown as string)).toThrow(TypeError);
  });

  it("throws on non-string input", () => {
    expect(() => hexToRgb(0xff0000 as unknown as string)).toThrow(TypeError);
  });

  it("throws on malformed hex string", () => {
    expect(() => hexToRgb("#zzzzzz")).toThrow(TypeError);
  });

  it("throws on too-short hex string", () => {
    expect(() => hexToRgb("#fff")).toThrow(TypeError);
  });
});
