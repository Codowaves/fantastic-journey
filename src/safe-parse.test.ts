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
      expect(res.error.message).toContain("Invalid integer");
    }
  });

  it("returns an Err for a string with only whitespace", () => {
    const res = safeParseInt("   ");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("parses zero as 0", () => {
    expect(safeParseInt("0")).toEqual({ ok: true, value: 0 });
  });

  it("parses negative integers", () => {
    expect(safeParseInt("-17")).toEqual({ ok: true, value: -17 });
  });

  it("parses leading-signed positive integers", () => {
    expect(safeParseInt("+17")).toEqual({ ok: true, value: 17 });
  });

  it("parses a trailing non-digit and ignores it", () => {
    expect(safeParseInt("42abc")).toEqual({ ok: true, value: 42 });
  });

  it("parses a leading whitespace prefix", () => {
    expect(safeParseInt("  7")).toEqual({ ok: true, value: 7 });
  });

  it("returns an Err when only a sign is provided", () => {
    const res = safeParseInt("-");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("does not parse octal/h literals as octal/hex", () => {
    expect(safeParseInt("0x10")).toEqual({ ok: true, value: 0 });
    expect(safeParseInt("0b10")).toEqual({ ok: true, value: 0 });
    expect(safeParseInt("010")).toEqual({ ok: true, value: 10 });
  });

  it("parses large integers safely within Number range", () => {
    expect(safeParseInt("9007199254740991")).toEqual({
      ok: true,
      value: 9007199254740991,
    });
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
      expect(res.error.message).toContain("Invalid float");
    }
  });

  it("returns an Err for a whitespace-only string", () => {
    const res = safeParseFloat("   \t\n");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("parses zero as 0", () => {
    expect(safeParseFloat("0")).toEqual({ ok: true, value: 0 });
  });

  it("parses a negative float", () => {
    expect(safeParseFloat("-2.5")).toEqual({ ok: true, value: -2.5 });
  });

  it("parses integers as floats", () => {
    expect(safeParseFloat("42")).toEqual({ ok: true, value: 42 });
  });

  it("parses leading whitespace before a number", () => {
    expect(safeParseFloat("  3.14")).toEqual({ ok: true, value: 3.14 });
  });

  it("parses a numeric prefix and ignores trailing garbage", () => {
    expect(safeParseFloat("3.14xyz")).toEqual({ ok: true, value: 3.14 });
  });

  it("parses scientific notation", () => {
    expect(safeParseFloat("1e3")).toEqual({ ok: true, value: 1000 });
  });

  it("parses Infinity as the literal word", () => {
    const res = safeParseFloat("Infinity");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(Number.POSITIVE_INFINITY);
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

  it("returns an Err for unquoted keys", () => {
    const res = safeParseJson("{a:1}");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for trailing commas in arrays", () => {
    const res = safeParseJson("[1,2,]");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for trailing garbage after a valid value", () => {
    const res = safeParseJson('{"a":1} garbage');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("parses a JSON array of numbers", () => {
    expect(safeParseJson<number[]>("[1,2,3]")).toEqual({
      ok: true,
      value: [1, 2, 3],
    });
  });

  it("parses a JSON null literal", () => {
    expect(safeParseJson("null")).toEqual({ ok: true, value: null });
  });

  it("parses a JSON boolean literal", () => {
    expect(safeParseJson("true")).toEqual({ ok: true, value: true });
    expect(safeParseJson("false")).toEqual({ ok: true, value: false });
  });

  it("parses a JSON number literal", () => {
    expect(safeParseJson("0")).toEqual({ ok: true, value: 0 });
    expect(safeParseJson("-3.14")).toEqual({ ok: true, value: -3.14 });
    expect(safeParseJson("1e3")).toEqual({ ok: true, value: 1000 });
  });

  it("parses a JSON string literal", () => {
    expect(safeParseJson('"hello"')).toEqual({ ok: true, value: "hello" });
  });

  it("parses nested JSON structures", () => {
    expect(safeParseJson<{ items: number[] }>('{"items":[1,2,3]}')).toEqual({
      ok: true,
      value: { items: [1, 2, 3] },
    });
  });

  it("parses unicode escape sequences in strings", () => {
    expect(safeParseJson<string>('"\\u00e9"')).toEqual({
      ok: true,
      value: "é",
    });
  });
});
