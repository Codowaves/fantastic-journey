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

describe("edge cases", () => {
  describe("ok", () => {
    it("wraps null in an Ok variant", () => {
      const res = ok(null);
      expect(res).toEqual({ ok: true, value: null });
    });

    it("wraps undefined in an Ok variant", () => {
      const res = ok(undefined);
      expect(res).toEqual({ ok: true, value: undefined });
    });

    it("wraps 0 in an Ok variant (falsy boundary value)", () => {
      const res = ok(0);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toBe(0);
      }
    });

    it("wraps an empty string in an Ok variant", () => {
      const res = ok("");
      expect(res).toEqual({ ok: true, value: "" });
    });

    it("wraps an empty array in an Ok variant", () => {
      const res = ok<number[]>([]);
      expect(res).toEqual({ ok: true, value: [] });
    });
  });

  describe("err", () => {
    it("wraps null as an error", () => {
      const res = err(null);
      expect(res).toEqual({ ok: false, error: null });
    });

    it("wraps undefined as an error", () => {
      const res = err(undefined);
      expect(res).toEqual({ ok: false, error: undefined });
    });

    it("wraps an empty string as an error", () => {
      const res = err("");
      expect(res).toEqual({ ok: false, error: "" });
    });

    it("wraps 0 as an error (falsy boundary value)", () => {
      const res = err(0);
      expect(res).toEqual({ ok: false, error: 0 });
    });
  });

  describe("map", () => {
    it("maps an Ok containing 0 (falsy boundary)", () => {
      const res = map(ok(0), (n) => n + 1);
      expect(res).toEqual({ ok: true, value: 1 });
    });

    it("maps an Ok containing an empty string", () => {
      const res = map(ok(""), (s) => `${s}hi`);
      expect(res).toEqual({ ok: true, value: "hi" });
    });

    it("maps an Ok containing null to a non-null value", () => {
      const res = map(ok(null), () => "fallback");
      expect(res).toEqual({ ok: true, value: "fallback" });
    });

    it("maps an Ok containing undefined to a defined value", () => {
      const res = map(ok(undefined), () => 42);
      expect(res).toEqual({ ok: true, value: 42 });
    });

    it("passes an Err through even when the error is null", () => {
      let called = false;
      const res: Result<number, null> = err(null);
      const mapped = map(res, (n) => {
        called = true;
        return n + 1;
      });
      expect(called).toBe(false);
      expect(mapped).toEqual({ ok: false, error: null });
    });

    it("maps to a function value", () => {
      const inner = () => "inner";
      const res = map(ok(1), () => inner);
      if (res.ok) {
        expect(res.value()).toBe("inner");
      } else {
        throw new Error("expected Ok");
      }
    });
  });

  describe("unwrap", () => {
    it("returns 0 from an Ok containing 0 (falsy boundary)", () => {
      expect(unwrap(ok(0))).toBe(0);
    });

    it("returns an empty string from an Ok containing an empty string", () => {
      expect(unwrap(ok(""))).toBe("");
    });

    it("returns null from an Ok containing null", () => {
      expect(unwrap(ok(null))).toBeNull();
    });

    it("returns undefined from an Ok containing undefined", () => {
      expect(unwrap(ok(undefined))).toBeUndefined();
    });

    it("returns an empty array from an Ok containing an empty array", () => {
      expect(unwrap(ok<number[]>([]))).toEqual([]);
    });

    it("throws null when unwrapping an Err containing null", () => {
      let caught: unknown = "not-thrown";
      try {
        unwrap(err<null>(null));
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeNull();
    });

    it("throws undefined when unwrapping an Err containing undefined", () => {
      let caught: unknown = "not-thrown";
      try {
        unwrap(err<undefined>(undefined));
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeUndefined();
    });

    it("throws 0 when unwrapping an Err containing 0", () => {
      let caught: unknown = "not-thrown";
      try {
        unwrap(err<number>(0));
      } catch (e) {
        caught = e;
      }
      expect(caught).toBe(0);
    });
  });
});
