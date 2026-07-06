import { describe, expect, it } from "vitest";

import { safeParseFloat, safeParseInt, safeParseJson } from "./safe-parse";

describe("safeParseInt", () => {
  it("parses a numeric string into an Ok integer", () => {
    expect(safeParseInt("42")).toEqual({ ok: true, value: 42 });
  });

  it("returns an Err for a non-numeric string", () => {
    const res = safeParseInt("not-a-number");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for trailing garbage", () => {
    const res = safeParseInt("42abc");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
      expect(res.error.message).toMatch(/trailing garbage/);
    }
  });

  it("returns an Err for an empty string", () => {
    const res = safeParseInt("");
    expect(res.ok).toBe(false);
  });

  it("returns an Err for non-string input", () => {
    const res = safeParseInt(42 as unknown as string);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toMatch(/expected string/);
    }
  });
});

describe("safeParseFloat", () => {
  it("parses a decimal string into an Ok float", () => {
    expect(safeParseFloat("3.14")).toEqual({ ok: true, value: 3.14 });
  });

  it("returns an Err for a string that has no numeric prefix", () => {
    const res = safeParseFloat("abc");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for trailing garbage", () => {
    const res = safeParseFloat("3.14xyz");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toMatch(/trailing garbage/);
    }
  });

  it("returns an Err for an empty string", () => {
    const res = safeParseFloat("");
    expect(res.ok).toBe(false);
  });
});

describe("safeParseJson", () => {
  it("parses a valid JSON object into an Ok value", () => {
    expect(safeParseJson<{ a: number }>('{"a":1}')).toEqual({
      ok: true,
      value: { a: 1 },
    });
  });

  it("returns an Err for malformed JSON", () => {
    const res = safeParseJson("{not json}");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });
});
