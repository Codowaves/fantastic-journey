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
