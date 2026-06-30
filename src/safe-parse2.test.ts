import { describe, expect, it } from "vitest";

import { safeFloat, safeInt, safeJson } from "./safe-parse2";

describe("safeInt", () => {
  it("parses a numeric string into an Ok integer", () => {
    expect(safeInt("42")).toEqual({ ok: true, value: 42 });
  });

  it("returns an Err for a non-numeric string", () => {
    const res = safeInt("not-a-number");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });

  it("returns an Err for the empty string", () => {
    const res = safeInt("");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });
});

describe("safeFloat", () => {
  it("parses a decimal string into an Ok float", () => {
    expect(safeFloat("3.14")).toEqual({ ok: true, value: 3.14 });
  });

  it("returns an Err for a string that has no numeric prefix", () => {
    const res = safeFloat("abc");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });
});

describe("safeJson", () => {
  it("parses a valid JSON object into an Ok value", () => {
    expect(safeJson<{ a: number }>('{"a":1}')).toEqual({
      ok: true,
      value: { a: 1 },
    });
  });

  it("returns an Err for malformed JSON", () => {
    const res = safeJson("{not json}");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBeInstanceOf(Error);
    }
  });
});
