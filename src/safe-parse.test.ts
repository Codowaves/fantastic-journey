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
      expect(res.error).toBeInstanceOf(Error);
      expect(res.error.message).toBe("Invalid integer: ");
    }
  });

  it("returns an Err for whitespace-only input", () => {
    const res = safeParseInt("   ");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("parses a negative integer", () => {
    expect(safeParseInt("-7")).toEqual({ ok: true, value: -7 });
  });

  it("parses zero", () => {
    expect(safeParseInt("0")).toEqual({ ok: true, value: 0 });
  });

  it("parses a leading-integer substring, dropping the trailing suffix", () => {
    expect(safeParseInt("123abc")).toEqual({ ok: true, value: 123 });
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
      expect(res.error).toBeInstanceOf(Error);
      expect(res.error.message).toBe("Invalid float: ");
    }
  });

  it("parses a negative decimal", () => {
    expect(safeParseFloat("-2.5")).toEqual({ ok: true, value: -2.5 });
  });

  it("parses an integer-valued string as a float", () => {
    expect(safeParseFloat("10")).toEqual({ ok: true, value: 10 });
  });

  it("parses Infinity as a float", () => {
    expect(safeParseFloat("Infinity")).toEqual({ ok: true, value: Infinity });
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

  it("returns an Err for a trailing-comma JSON object", () => {
    const res = safeParseJson('{"a":1,}');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("parses a JSON array", () => {
    expect(safeParseJson<number[]>("[1,2,3]")).toEqual({
      ok: true,
      value: [1, 2, 3],
    });
  });

  it("parses a JSON null literal", () => {
    expect(safeParseJson("null")).toEqual({ ok: true, value: null });
  });
});
