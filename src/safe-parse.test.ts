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
    }
  });

  it("returns an Err for a whitespace-only string", () => {
    const res = safeParseInt("   ");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("parses zero", () => {
    expect(safeParseInt("0")).toEqual({ ok: true, value: 0 });
  });

  it("parses negative numbers", () => {
    expect(safeParseInt("-7")).toEqual({ ok: true, value: -7 });
  });

  it("parses numbers with a leading +", () => {
    expect(safeParseInt("+5")).toEqual({ ok: true, value: 5 });
  });

  it("truncates a decimal prefix", () => {
    expect(safeParseInt("3.14")).toEqual({ ok: true, value: 3 });
  });

  it("parses a numeric prefix and ignores trailing non-digits", () => {
    expect(safeParseInt("123abc")).toEqual({ ok: true, value: 123 });
  });

  it("returns an Err when the first character is non-numeric", () => {
    const res = safeParseInt("a123");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns Ok for hex-looking input and parses the digit prefix (radix is 10)", () => {
    // parseInt with radix 10 stops at the first non-digit, so "0x10" yields 0.
    expect(safeParseInt("0x10")).toEqual({ ok: true, value: 0 });
  });

  it("returns an Err for the literal string 'NaN'", () => {
    const res = safeParseInt("NaN");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for the literal string 'Infinity'", () => {
    const res = safeParseInt("Infinity");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
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

  it("returns an Err for the empty string", () => {
    const res = safeParseFloat("");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for a whitespace-only string", () => {
    const res = safeParseFloat("   ");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("parses zero", () => {
    expect(safeParseFloat("0")).toEqual({ ok: true, value: 0 });
  });

  it("parses zero with a decimal point", () => {
    expect(safeParseFloat("0.0")).toEqual({ ok: true, value: 0 });
  });

  it("parses negative numbers", () => {
    expect(safeParseFloat("-2.5")).toEqual({ ok: true, value: -2.5 });
  });

  it("parses numbers with a leading +", () => {
    expect(safeParseFloat("+1.25")).toEqual({ ok: true, value: 1.25 });
  });

  it("parses exponent notation", () => {
    expect(safeParseFloat("1e3")).toEqual({ ok: true, value: 1000 });
    expect(safeParseFloat("1.5e-2")).toEqual({ ok: true, value: 0.015 });
  });

  it("parses integers (no decimal point)", () => {
    expect(safeParseFloat("42")).toEqual({ ok: true, value: 42 });
  });

  it("parses a numeric prefix and ignores trailing characters", () => {
    expect(safeParseFloat("3.14abc")).toEqual({ ok: true, value: 3.14 });
  });

  it("parses leading whitespace before the number", () => {
    expect(safeParseFloat("  2.5")).toEqual({ ok: true, value: 2.5 });
  });

  it("returns an Err when the first character is non-numeric", () => {
    const res = safeParseFloat("x1.5");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Ok for 'Infinity'", () => {
    const res = safeParseFloat("Infinity");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(Number.POSITIVE_INFINITY);
    }
  });

  it("returns an Ok for negative infinity", () => {
    const res = safeParseFloat("-Infinity");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(Number.NEGATIVE_INFINITY);
    }
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

  it("parses a JSON array", () => {
    expect(safeParseJson<number[]>("[1,2,3]")).toEqual({
      ok: true,
      value: [1, 2, 3],
    });
  });

  it("parses an empty JSON array", () => {
    expect(safeParseJson<unknown[]>("[]")).toEqual({ ok: true, value: [] });
  });

  it("parses an empty JSON object", () => {
    expect(safeParseJson<Record<string, unknown>>("{}")).toEqual({
      ok: true,
      value: {},
    });
  });

  it("parses a JSON string value", () => {
    expect(safeParseJson<string>('"hello"')).toEqual({
      ok: true,
      value: "hello",
    });
  });

  it("parses a JSON number value", () => {
    expect(safeParseJson<number>("42")).toEqual({ ok: true, value: 42 });
  });

  it("parses a JSON null value", () => {
    expect(safeParseJson<null>("null")).toEqual({ ok: true, value: null });
  });

  it("parses a JSON boolean value", () => {
    expect(safeParseJson<boolean>("true")).toEqual({ ok: true, value: true });
    expect(safeParseJson<boolean>("false")).toEqual({
      ok: true,
      value: false,
    });
  });

  it("parses a nested JSON structure", () => {
    const input = '{"a":{"b":[1,2]}}';
    expect(safeParseJson<{ a: { b: number[] } }>(input)).toEqual({
      ok: true,
      value: { a: { b: [1, 2] } },
    });
  });

  it("returns an Err for an incomplete JSON object", () => {
    const res = safeParseJson('{"a":');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for an incomplete JSON array", () => {
    const res = safeParseJson("[1,2,");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for JSON with single quotes", () => {
    const res = safeParseJson("{'a':1}");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });
});
