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

describe("error/throw paths", () => {
  it("createRequestContext does not throw when called with no arguments", () => {
    expect(() => createRequestContext()).not.toThrow();
  });

  it("createRequestContext does not throw when called with an explicit empty string", () => {
    expect(() => createRequestContext("")).not.toThrow();
  });

  it("createRequestContext does not throw when called with a UUID-shaped string", () => {
    expect(() => createRequestContext("not-a-uuid-but-fine")).not.toThrow();
  });

  it("createRequestContext does not throw when called with null (?? falls back to a UUID)", () => {
    // The signature accepts reqId?: string; at runtime, null is not a string,
    // but the `??` operator triggers for both null and undefined, so the
    // supplied null falls back to a freshly generated UUID rather than being
    // stored verbatim.
    expect(() => createRequestContext(null as unknown as string)).not.toThrow();
    const ctx = createRequestContext(null as unknown as string);
    expect(typeof ctx.reqId).toBe("string");
    expect(ctx.reqId.length).toBeGreaterThan(0);
  });

  it("createRequestContext stores undefined when explicitly passed undefined", () => {
    // Passing undefined triggers the `??` fallback to a generated UUID.
    expect(() => createRequestContext(undefined)).not.toThrow();
    const ctx = createRequestContext(undefined);
    expect(typeof ctx.reqId).toBe("string");
    expect(ctx.reqId.length).toBeGreaterThan(0);
  });

  it("runWithRequestContext does not throw when called with only a callback (default context)", () => {
    expect(() => runWithRequestContext(() => getReqId())).not.toThrow();
  });

  it("runWithRequestContext does not throw on a normal callback", () => {
    const ctx = createRequestContext("ok");
    expect(() => runWithRequestContext(() => getReqId(), ctx)).not.toThrow();
  });

  it("runWithRequestContext propagates an Error thrown synchronously from the callback", () => {
    const ctx = createRequestContext("throw-test");
    expect(() =>
      runWithRequestContext(() => {
        throw new Error("boom");
      }, ctx),
    ).toThrow("boom");
  });

  it("runWithRequestContext propagates a non-Error throw value (string) from the callback", () => {
    const ctx = createRequestContext("throw-string");
    expect(() =>
      runWithRequestContext<string>(() => {
        // eslint-disable-next-line no-throw-literal
        throw "thrown-string";
      }, ctx),
    ).toThrow("thrown-string");
  });

  it("runWithRequestContext propagates a TypeError thrown from the callback", () => {
    const ctx = createRequestContext("throw-type");
    expect(() =>
      runWithRequestContext(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new TypeError("bad type");
      }, ctx),
    ).toThrow(TypeError);
  });

  it("getReqId does not throw when called outside any context (returns undefined)", () => {
    // Before any runWithRequestContext has executed, getReqId must be a
    // safe no-throw that simply returns undefined via optional chaining.
    expect(() => getReqId()).not.toThrow();
    expect(getReqId()).toBeUndefined();
  });

  it("getRequestContext does not throw when called outside any context (returns undefined)", () => {
    expect(() => getRequestContext()).not.toThrow();
    expect(getRequestContext()).toBeUndefined();
  });

  it("getReqId does not throw when called after a throwing callback exited", () => {
    const ctx = createRequestContext("after-throw");
    expect(() =>
      runWithRequestContext(() => {
        throw new Error("inside");
      }, ctx),
    ).toThrow("inside");
    // The context scope was torn down by AsyncLocalStorage despite the throw;
    // getReqId must remain a safe no-op.
    expect(() => getReqId()).not.toThrow();
    expect(getReqId()).toBeUndefined();
  });

  it("getRequestContext does not throw when called after a throwing callback exited", () => {
    const ctx = createRequestContext("after-throw-ctx");
    expect(() =>
      runWithRequestContext(() => {
        throw new Error("inside-ctx");
      }, ctx),
    ).toThrow("inside-ctx");
    expect(() => getRequestContext()).not.toThrow();
    expect(getRequestContext()).toBeUndefined();
  });
});

describe("async / nested isolation under errors", () => {
  it("a thrown callback does not leak its context to the surrounding scope", () => {
    const ctx = createRequestContext("leaky");
    let captured: string | undefined;
    try {
      runWithRequestContext(() => {
        captured = getReqId();
        throw new Error("escape");
      }, ctx);
    } catch {
      // expected
    }
    expect(captured).toBe("leaky");
    // After the throw unwinds the scope, no context must remain visible.
    expect(getReqId()).toBeUndefined();
  });

  it("an async callback's rejection propagates through the returned promise", async () => {
    const ctx = createRequestContext("async-throw");
    await expect(
      runWithRequestContext(
        () =>
          new Promise<string>((_resolve, reject) => {
            // Inside a microtask, the context is still observable.
            expect(getReqId()).toBe("async-throw");
            reject(new Error("async-boom"));
          }),
        ctx,
      ),
    ).rejects.toThrow("async-boom");
  });

  it("an awaited throw inside an async callback still tears down the context", async () => {
    const ctx = createRequestContext("awaited-throw");
    await expect(
      runWithRequestContext(async () => {
        await Promise.resolve();
        throw new Error("post-await");
      }, ctx),
    ).rejects.toThrow("post-await");
    expect(getReqId()).toBeUndefined();
  });

  it("nested runWithRequestContext throws without affecting the outer scope's context", () => {
    const outerCtx = createRequestContext("outer");
    expect(() =>
      runWithRequestContext(() => {
        expect(getReqId()).toBe("outer");
        runWithRequestContext(() => {
          throw new Error("inner-throw");
        }, createRequestContext("inner"));
      }, outerCtx),
    ).toThrow("inner-throw");

    // After the exception unwinds both scopes, no context remains.
    expect(getReqId()).toBeUndefined();
  });

  it("a throwing sibling callback does not affect the context of a concurrent sibling", async () => {
    const ctxA = createRequestContext("survivor-A");
    const ctxB = createRequestContext("victim-B");

    const taskA = runWithRequestContext(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 10);
        }),
      ctxA,
    );

    const taskB = runWithRequestContext(
      () =>
        new Promise<void>((_resolve, reject) => {
          setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            reject(new Error("B rejected"));
          }, 5);
        }),
      ctxB,
    );

    // Attach a no-op rejection handler so Node does not flag an unhandled
    // rejection if B fires before the awaits below attach theirs.
    taskB.catch(() => {});

    // A should still resolve cleanly despite B rejecting.
    await expect(taskA).resolves.toBeUndefined();
    await expect(taskB).rejects.toThrow("B rejected");

    // Neither context leaked past the awaits.
    expect(getReqId()).toBeUndefined();
  });
});
