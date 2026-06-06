import { describe, expect, it } from "vitest";

import {
  createRequestContext,
  getReqId,
  getRequestContext,
  runWithRequestContext,
} from "./requestContext";

describe("createRequestContext", () => {
  it("returns a context with a non-empty string reqId", () => {
    const ctx = createRequestContext();
    expect(typeof ctx.reqId).toBe("string");
    expect(ctx.reqId.length).toBeGreaterThan(0);
  });

  it("generates a unique reqId on each call", () => {
    const a = createRequestContext();
    const b = createRequestContext();
    expect(a.reqId).not.toBe(b.reqId);
  });
});

describe("runWithRequestContext", () => {
  it("makes the provided context available to the callback", () => {
    const ctx = { reqId: "req_explicit" };
    const result = runWithRequestContext(() => getRequestContext(), ctx);
    expect(result).toEqual(ctx);
  });

  it("invokes and returns the callback's return value", () => {
    const value = runWithRequestContext(
      () => 42,
      { reqId: "req_value" },
    );
    expect(value).toBe(42);
  });

  it("propagates errors thrown inside the callback", () => {
    expect(() =>
      runWithRequestContext(
        () => {
          throw new Error("boom");
        },
        { reqId: "req_throw" },
      ),
    ).toThrow("boom");
  });
});

describe("getRequestContext", () => {
  it("returns undefined outside a request context", () => {
    expect(getRequestContext()).toBeUndefined();
  });

  it("returns the active context inside runWithRequestContext", () => {
    const ctx = { reqId: "req_inside" };
    const seen = runWithRequestContext(() => getRequestContext(), ctx);
    expect(seen).toEqual(ctx);
  });
});

describe("getReqId", () => {
  it("returns undefined when no context is active", () => {
    expect(getReqId()).toBeUndefined();
  });

  it("returns the active context's reqId", () => {
    const id = runWithRequestContext(
      () => getReqId(),
      { reqId: "req_id_lookup" },
    );
    expect(id).toBe("req_id_lookup");
  });

  it("returns the auto-generated reqId when no context is passed", () => {
    const id = runWithRequestContext(() => getReqId());
    expect(typeof id).toBe("string");
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
