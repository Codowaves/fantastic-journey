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

  it("returns an empty string Ok value", () => {
    expect(unwrap(ok(""))).toBe("");
  });

  it("returns zero as an Ok number value", () => {
    expect(unwrap(ok(0))).toBe(0);
  });

  it("returns false as an Ok boolean value", () => {
    expect(unwrap(ok(false))).toBe(false);
  });

  it("returns null as an Ok value", () => {
    expect(unwrap(ok(null))).toBeNull();
  });

  it("returns undefined as an Ok value", () => {
    expect(unwrap(ok(undefined))).toBeUndefined();
  });

  it("returns an empty array as an Ok value", () => {
    expect(unwrap(ok([]))).toEqual([]);
  });

  it("throws an empty string error", () => {
    let thrown: unknown;
    try {
      unwrap(err(""));
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBe("");
  });

  it("throws a numeric error", () => {
    let thrown: unknown;
    try {
      unwrap(err(0));
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBe(0);
  });

  it("throws a null error", () => {
    let thrown: unknown;
    try {
      unwrap(err(null));
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeNull();
  });
});

describe("edge cases: ok / err constructors", () => {
  it("ok preserves NaN values", () => {
    const res = ok(NaN);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Number.isNaN(res.value)).toBe(true);
    }
  });

  it("ok preserves Infinity", () => {
    const res = ok(Infinity);
    expect(res).toEqual({ ok: true, value: Infinity });
  });

  it("ok preserves negative zero", () => {
    const res: Result<number, never> = ok(-0);
    expect(res).toEqual({ ok: true, value: -0 });
    if (res.ok) {
      expect(Object.is(res.value, -0)).toBe(true);
    }
  });

  it("err preserves an Error with no message", () => {
    const error = new Error();
    const res = err(error);
    expect(res).toEqual({ ok: false, error });
  });

  it("err preserves a falsy numeric error", () => {
    const res = err(0);
    expect(res).toEqual({ ok: false, error: 0 });
    if (!res.ok) {
      expect(res.error).toBe(0);
    }
  });

  it("err preserves a nested object error", () => {
    const error = { code: 500, msg: "fail" };
    const res = err(error);
    expect(res).toEqual({ ok: false, error });
  });
});

describe("edge cases: map", () => {
  it("maps an Ok wrapping zero through an identity-like function", () => {
    const res = map(ok(0), (n) => n + 1);
    expect(res).toEqual({ ok: true, value: 1 });
  });

  it("maps an Ok wrapping an empty string to its length", () => {
    const res = map(ok(""), (s) => s.length);
    expect(res).toEqual({ ok: true, value: 0 });
  });

  it("maps an Ok wrapping an empty array to its length", () => {
    const res = map(ok([] as number[]), (arr) => arr.length);
    expect(res).toEqual({ ok: true, value: 0 });
  });

  it("map callback can return null", () => {
    const res = map(ok(1), () => null);
    expect(res).toEqual({ ok: true, value: null });
  });

  it("map callback can return undefined", () => {
    const res = map(ok(1), () => undefined);
    expect(res).toEqual({ ok: true, value: undefined });
  });

  it("map callback can return another Result (does not flatten)", () => {
    const inner = ok(99);
    const res = map(ok(1), () => inner);
    expect(res).toEqual({ ok: true, value: inner });
  });

  it("map preserves the original Err error reference (identity)", () => {
    const sentinel = { reason: "sentinel" };
    const res: Result<number, { reason: string }> = err(sentinel);
    const mapped = map(res, (n) => n * 2);
    expect(mapped).toEqual({ ok: false, error: sentinel });
    if (!mapped.ok) {
      expect(mapped.error).toBe(sentinel);
    }
  });
});
