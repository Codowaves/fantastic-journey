import { describe, expect, it } from "vitest";

import { err, map, ok, unwrap, type Result } from "./result";

describe("ok", () => {
  it("wraps a value in an Ok variant", () => {
    const res = ok(42);
    expect(res).toEqual({ ok: true, value: 42 });
  });

  it("preserves the literal type of the value", () => {
    const res = ok("hello");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe("hello");
    }
  });

  it("works with object values", () => {
    const value = { name: "alice" };
    const res = ok(value);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(value);
    }
  });
});

describe("err", () => {
  it("wraps an error in an Err variant", () => {
    const res = err("boom");
    expect(res).toEqual({ ok: false, error: "boom" });
  });

  it("preserves the literal type of the error", () => {
    const error = new Error("nope");
    const res = err(error);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe(error);
    }
  });
});

describe("map", () => {
  it("maps the success value of an Ok result", () => {
    const res = ok(2);
    const mapped = map(res, (n) => n * 3);
    expect(mapped).toEqual({ ok: true, value: 6 });
  });

  it("passes an Err through without calling the function", () => {
    let called = false;
    const res: Result<number, string> = err("nope");
    const mapped = map(res, (n) => {
      called = true;
      return n * 3;
    });
    expect(called).toBe(false);
    expect(mapped).toEqual({ ok: false, error: "nope" });
  });

  it("supports chaining map calls on Ok", () => {
    const step1 = map(ok(1), (n: number) => n + 1);
    const step2 = map(step1, (n) => n * 10);
    expect(step2).toEqual({ ok: true, value: 20 });
  });

  it("supports chaining map calls and short-circuits on the first Err", () => {
    let secondCalled = false;
    const step1: Result<number, string> = err("stop");
    const step2 = map(step1, (n) => n + 1);
    const step3 = map(step2, (n) => {
      secondCalled = true;
      return n * 10;
    });
    expect(secondCalled).toBe(false);
    expect(step3).toEqual({ ok: false, error: "stop" });
  });

  it("can change the success type", () => {
    const res = map(ok(123), (n) => `value=${n}`);
    expect(res).toEqual({ ok: true, value: "value=123" });
  });

  it("keeps the error type stable across map calls", () => {
    const res: Result<number, string> = err("e1");
    const mapped = map(res, (n: number) => n.toString());
    const mapped2 = map(mapped, (s) => s.length);
    expect(mapped2).toEqual({ ok: false, error: "e1" });
  });
});

describe("unwrap", () => {
  it("returns the value of an Ok result", () => {
    expect(unwrap(ok(7))).toBe(7);
  });

  it("throws the error of an Err result", () => {
    expect(() => unwrap(err("failure"))).toThrow("failure");
  });

  it("throws a custom Error instance when wrapped via err", () => {
    const error = new Error("custom");
    expect(() => unwrap(err(error))).toThrow(error);
  });

  it("works after a map call on Ok", () => {
    const value = unwrap(map(ok(5), (n) => n + 5));
    expect(value).toBe(10);
  });

  it("throws after a map call when the source is Err", () => {
    const res: Result<number, string> = err("bad");
    expect(() => unwrap(map(res, (n) => n + 1))).toThrow("bad");
  });
});

describe("ok edge cases", () => {
  it("wraps the empty string as a valid Ok value", () => {
    const res = ok("");
    expect(res).toEqual({ ok: true, value: "" });
    if (res.ok) {
      expect(res.value).toBe("");
    }
  });

  it("wraps zero as a valid Ok value", () => {
    const res = ok(0);
    expect(res).toEqual({ ok: true, value: 0 });
  });

  it("wraps false as a valid Ok value", () => {
    const res = ok(false);
    expect(res).toEqual({ ok: true, value: false });
  });

  it("wraps null as a valid Ok value", () => {
    const res = ok(null);
    expect(res).toEqual({ ok: true, value: null });
  });

  it("wraps undefined as a valid Ok value", () => {
    const res = ok(undefined);
    expect(res).toEqual({ ok: true, value: undefined });
  });

  it("wraps NaN as a valid Ok value", () => {
    const res = ok(NaN);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Number.isNaN(res.value)).toBe(true);
    }
  });

  it("wraps an empty array", () => {
    const res = ok<number[]>([]);
    expect(res).toEqual({ ok: true, value: [] });
  });

  it("wraps an empty object", () => {
    const res = ok<Record<string, unknown>>({});
    expect(res).toEqual({ ok: true, value: {} });
  });
});

describe("err edge cases", () => {
  it("wraps the empty string as a valid Err error", () => {
    const res = err("");
    expect(res).toEqual({ ok: false, error: "" });
  });

  it("wraps zero as a valid Err error", () => {
    const res = err(0);
    expect(res).toEqual({ ok: false, error: 0 });
  });

  it("wraps false as a valid Err error", () => {
    const res = err(false);
    expect(res).toEqual({ ok: false, error: false });
  });

  it("wraps null as a valid Err error", () => {
    const res = err(null);
    expect(res).toEqual({ ok: false, error: null });
  });

  it("wraps undefined as a valid Err error", () => {
    const res = err(undefined);
    expect(res).toEqual({ ok: false, error: undefined });
  });

  it("wraps an Error subclass preserving prototype", () => {
    class CustomError extends Error {
      constructor(public code: number) {
        super(`code=${code}`);
        this.name = "CustomError";
      }
    }
    const e = new CustomError(42);
    const res = err(e);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe(e);
      expect(res.error).toBeInstanceOf(CustomError);
      expect(res.error.code).toBe(42);
    }
  });
});

describe("map edge cases", () => {
  it("maps an Ok containing 0 to a new value", () => {
    const res = map(ok(0), (n) => n + 1);
    expect(res).toEqual({ ok: true, value: 1 });
  });

  it("maps an Ok containing empty string to a new value", () => {
    const res = map(ok(""), (s) => `${s}appended`);
    expect(res).toEqual({ ok: true, value: "appended" });
  });

  it("maps an Ok containing null to a new value", () => {
    const res = map<string | null, number, never>(ok(null), (s) =>
      s === null ? -1 : s.length,
    );
    expect(res).toEqual({ ok: true, value: -1 });
  });

  it("preserves the exact error reference through map on Err", () => {
    const error = new Error("original");
    const res: Result<number, Error> = err(error);
    const mapped = map(res, (n) => n + 1);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe(error);
    }
  });

  it("does not invoke the mapper when the source is Err with falsy error", () => {
    let called = false;
    const res: Result<number, null> = err(null);
    const mapped = map(res, (n) => {
      called = true;
      return n;
    });
    expect(called).toBe(false);
    expect(mapped).toEqual({ ok: false, error: null });
  });

  it("supports mapping an Ok of undefined", () => {
    const res = map(ok(undefined), () => "fallback");
    expect(res).toEqual({ ok: true, value: "fallback" });
  });
});

describe("unwrap edge cases", () => {
  it("returns 0 from an Ok containing 0", () => {
    expect(unwrap(ok(0))).toBe(0);
  });

  it("returns empty string from an Ok containing empty string", () => {
    expect(unwrap(ok(""))).toBe("");
  });

  it("returns false from an Ok containing false", () => {
    expect(unwrap(ok(false))).toBe(false);
  });

  it("returns null from an Ok containing null", () => {
    expect(unwrap(ok(null))).toBeNull();
  });

  it("returns undefined from an Ok containing undefined", () => {
    expect(unwrap(ok(undefined))).toBeUndefined();
  });

  it("returns NaN from an Ok containing NaN", () => {
    const value = unwrap(ok(NaN));
    expect(Number.isNaN(value)).toBe(true);
  });

  it("throws an error with empty message when Err holds empty string", () => {
    let caught: unknown;
    try {
      unwrap(err(""));
    } catch (e) {
      caught = e;
    }
    expect(caught).toBe("");
  });

  it("throws null when Err holds null", () => {
    let caught: unknown;
    try {
      unwrap(err(null));
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeNull();
  });

  it("throws undefined when Err holds undefined", () => {
    let caught: unknown;
    try {
      unwrap(err(undefined));
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeUndefined();
  });

  it("throws a non-Error value as-is when Err holds 0", () => {
    let caught: unknown;
    try {
      unwrap(err(0));
    } catch (e) {
      caught = e;
    }
    expect(caught).toBe(0);
  });

  it("propagates the original Error instance through chained map and unwrap", () => {
    const error = new Error("source failure");
    const res: Result<number, Error> = err(error);
    const mapped = map(res, (n) => n + 1);
    expect(() => unwrap(mapped)).toThrow(error);
  });
});
