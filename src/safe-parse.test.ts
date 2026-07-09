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

  it("returns an Err for the empty string", () => {
    const res = safeParseInt("");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toBe("Invalid integer: ");
    }
  });

  it("returns an Err for whitespace-only input", () => {
    const res = safeParseInt("   ");
    expect(res.ok).toBe(false);
  });

  it("returns an Err for a leading-non-digit string", () => {
    const res = safeParseInt("abc123");
    expect(res.ok).toBe(false);
  });

  it("truncates a float prefix and returns the integer part", () => {
    expect(safeParseInt("3.14")).toEqual({ ok: true, value: 3 });
  });

  it("parses a negative integer", () => {
    expect(safeParseInt("-7")).toEqual({ ok: true, value: -7 });
  });

  it("parses zero", () => {
    expect(safeParseInt("0")).toEqual({ ok: true, value: 0 });
  });

  it("returns an Err for a single plus sign", () => {
    const res = safeParseInt("+");
    expect(res.ok).toBe(false);
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

  it("returns an Err for the empty string", () => {
    const res = safeParseFloat("");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toBe("Invalid float: ");
    }
  });

  it("returns an Err for whitespace-only input", () => {
    const res = safeParseFloat("   ");
    expect(res.ok).toBe(false);
  });

  it("parses an integer-valued string as a float", () => {
    expect(safeParseFloat("42")).toEqual({ ok: true, value: 42 });
  });

  it("parses a negative float", () => {
    expect(safeParseFloat("-2.5")).toEqual({ ok: true, value: -2.5 });
  });

  it("parses zero", () => {
    expect(safeParseFloat("0")).toEqual({ ok: true, value: 0 });
  });

  it("parses a leading-numeric string and ignores trailing junk", () => {
    expect(safeParseFloat("1.5xyz")).toEqual({ ok: true, value: 1.5 });
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

  it("returns an Err for the empty string", () => {
    const res = safeParseJson("");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for whitespace-only input", () => {
    const res = safeParseJson("   ");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("parses a JSON null literal", () => {
    expect(safeParseJson("null")).toEqual({ ok: true, value: null });
  });

  it("parses a JSON boolean literal", () => {
    expect(safeParseJson("true")).toEqual({ ok: true, value: true });
  });

  it("parses a JSON array", () => {
    expect(safeParseJson("[1,2,3]")).toEqual({
      ok: true,
      value: [1, 2, 3],
    });
  });

  it("parses a JSON string", () => {
    expect(safeParseJson('"hello"')).toEqual({ ok: true, value: "hello" });
  });

  it("parses a JSON number", () => {
    expect(safeParseJson("2.5")).toEqual({ ok: true, value: 2.5 });
  });

  it("returns an Err for a trailing-comma JSON object", () => {
    const res = safeParseJson('{"a":1,}');
    expect(res.ok).toBe(false);
  });

  it("returns an Err for an unterminated JSON string", () => {
    const res = safeParseJson('"unterminated');
    expect(res.ok).toBe(false);
  });

  it("returns an Err when JSON.parse throws a non-Error value", () => {
    const res = safeParseJson("__proto__");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });
});
