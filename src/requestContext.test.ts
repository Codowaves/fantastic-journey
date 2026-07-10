import { describe, expect, it } from "vitest";

import {
  createRequestContext,
  getReqId,
  getRequestContext,
  runWithRequestContext,
} from "./requestContext";

describe("createRequestContext", () => {
  it("generates a non-empty string request id when none is supplied", () => {
    const ctx = createRequestContext();
    expect(typeof ctx.reqId).toBe("string");
    expect(ctx.reqId.length).toBeGreaterThan(0);
  });

  it("generates distinct request ids across calls", () => {
    const a = createRequestContext();
    const b = createRequestContext();
    expect(a.reqId).not.toBe(b.reqId);
  });

  it("preserves a supplied request id", () => {
    const ctx = createRequestContext("supplied-id-123");
    expect(ctx.reqId).toBe("supplied-id-123");
  });

  it("preserves an empty string when explicitly supplied", () => {
    const ctx = createRequestContext("");
    expect(ctx.reqId).toBe("");
  });
});

describe("runWithRequestContext", () => {
  it("makes the context available inside the callback", () => {
    const ctx = createRequestContext("inside-cb");
    let observed: string | undefined;
    runWithRequestContext(() => {
      observed = getReqId();
    }, ctx);
    expect(observed).toBe("inside-cb");
  });

  it("returns the callback's return value", () => {
    const ctx = createRequestContext("return-value");
    const result = runWithRequestContext(() => 42, ctx);
    expect(result).toBe(42);
  });

  it("creates a new context when none is supplied", () => {
    const result = runWithRequestContext(() => getRequestContext());
    expect(result).toBeDefined();
    expect(typeof result?.reqId).toBe("string");
    expect(result?.reqId.length).toBeGreaterThan(0);
  });

  it("isolates context from sibling callbacks running concurrently", async () => {
    const ctxA = createRequestContext("A");
    const ctxB = createRequestContext("B");

    const observed: string[] = [];

    const taskA = runWithRequestContext(
      () =>
        new Promise<void>((resolve) => {
          queueMicrotask(() => {
            observed.push(getReqId() ?? "missing");
            resolve();
          });
        }),
      ctxA,
    );

    const taskB = runWithRequestContext(
      () =>
        new Promise<void>((resolve) => {
          queueMicrotask(() => {
            observed.push(getReqId() ?? "missing");
            resolve();
          });
        }),
      ctxB,
    );

    await Promise.all([taskA, taskB]);

    expect(observed).toContain("A");
    expect(observed).toContain("B");
  });
});

describe("getRequestContext", () => {
  it("returns undefined when no context is active", () => {
    expect(getRequestContext()).toBeUndefined();
  });

  it("returns the active context inside runWithRequestContext", () => {
    const ctx = createRequestContext("active");
    const observed = runWithRequestContext(() => getRequestContext(), ctx);
    expect(observed).toBe(ctx);
  });

  it("is undefined after the callback exits", () => {
    const ctx = createRequestContext("after-cb");
    runWithRequestContext(() => undefined, ctx);
    expect(getRequestContext()).toBeUndefined();
  });
});

describe("getReqId", () => {
  it("returns undefined when no context is active", () => {
    expect(getReqId()).toBeUndefined();
  });

  it("returns the active context's reqId", () => {
    const ctx = createRequestContext("reqid-test");
    const observed = runWithRequestContext(() => getReqId(), ctx);
    expect(observed).toBe("reqid-test");
  });

  it("returns undefined after the callback exits", () => {
    const ctx = createRequestContext("after-cb-reqid");
    runWithRequestContext(() => undefined, ctx);
    expect(getReqId()).toBeUndefined();
  });
});

describe("createRequestContext fallback behavior", () => {
  it("generates a UUID when reqId is undefined", () => {
    const ctx = createRequestContext(undefined);
    expect(typeof ctx.reqId).toBe("string");
    expect(ctx.reqId.length).toBeGreaterThan(0);
  });

  it("preserves a whitespace-only reqId (no trim fallback)", () => {
    const ctx = createRequestContext("   ");
    expect(ctx.reqId).toBe("   ");
  });

  it("preserves a non-UUID string reqId as-is", () => {
    const ctx = createRequestContext("not-a-uuid-format");
    expect(ctx.reqId).toBe("not-a-uuid-format");
  });

  it("preserves a numeric-string reqId", () => {
    const ctx = createRequestContext("12345");
    expect(ctx.reqId).toBe("12345");
  });
});

describe("runWithRequestContext callback throws", () => {
  it("propagates an error thrown by the callback", () => {
    const ctx = createRequestContext("throw-test");
    expect(() =>
      runWithRequestContext(() => {
        throw new Error("boom");
      }, ctx),
    ).toThrow("boom");
  });

  it("clears the active context after a callback throws", () => {
    const ctx = createRequestContext("after-throw");
    expect(() =>
      runWithRequestContext(() => {
        throw new Error("boom");
      }, ctx),
    ).toThrow("boom");
    expect(getRequestContext()).toBeUndefined();
    expect(getReqId()).toBeUndefined();
  });

  it("propagates a thrown non-Error value", () => {
    expect(() =>
      runWithRequestContext(() => {
        throw "string-error";
      }),
    ).toThrow("string-error");
  });

  it("clears context when an async callback rejects", async () => {
    await expect(
      runWithRequestContext(async () => {
        throw new Error("async-boom");
      }),
    ).rejects.toThrow("async-boom");
    expect(getRequestContext()).toBeUndefined();
    expect(getReqId()).toBeUndefined();
  });
});

describe("runWithRequestContext nested contexts", () => {
  it("shadows the outer context with the inner one at 2-level depth", () => {
    const outer = createRequestContext("outer");
    const inner = createRequestContext("inner");
    const observed = runWithRequestContext(() => {
      const beforeInner = getReqId();
      const insideInner = runWithRequestContext(() => getReqId(), inner);
      const afterInner = getReqId();
      return { beforeInner, insideInner, afterInner };
    }, outer);
    expect(observed.beforeInner).toBe("outer");
    expect(observed.insideInner).toBe("inner");
    expect(observed.afterInner).toBe("outer");
  });

  it("shadows correctly at 3-level depth", () => {
    const a = createRequestContext("a");
    const b = createRequestContext("b");
    const c = createRequestContext("c");
    const observed = runWithRequestContext(() => {
      const atA = getReqId();
      const atB = runWithRequestContext(() => getReqId(), b);
      const atC = runWithRequestContext(() => {
        const insideC = getReqId();
        return insideC;
      }, c);
      const backAtA = getReqId();
      return { atA, atB, atC, backAtA };
    }, a);
    expect(observed.atA).toBe("a");
    expect(observed.atB).toBe("b");
    expect(observed.atC).toBe("c");
    expect(observed.backAtA).toBe("a");
  });

  it("restores outer context after a nested throw", () => {
    const outer = createRequestContext("outer-throw");
    const inner = createRequestContext("inner-throw");
    expect(() =>
      runWithRequestContext(() => {
        runWithRequestContext(() => {
          throw new Error("inner-boom");
        }, inner);
        return undefined;
      }, outer),
    ).toThrow("inner-boom");
    expect(getRequestContext()).toBeUndefined();
  });
});

describe("defensive branches for getRequestContext and getReqId", () => {
  it("getRequestContext is undefined when called outside any context", () => {
    expect(getRequestContext()).toBeUndefined();
  });

  it("getReqId is undefined when called outside any context", () => {
    expect(getReqId()).toBeUndefined();
  });
});
