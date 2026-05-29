import { describe, expect, it } from "vitest";

import {
  createRequestContext,
  getReqId,
  getRequestContext,
  runWithRequestContext,
  type RequestContext,
} from "./requestContext";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("createRequestContext", () => {
  it("returns a context with a fresh UUID reqId", () => {
    const context = createRequestContext();

    expect(context.reqId).toMatch(UUID_PATTERN);
  });

  it("generates a distinct reqId on each call", () => {
    expect(createRequestContext().reqId).not.toBe(createRequestContext().reqId);
  });
});

describe("runWithRequestContext", () => {
  it("returns the callback's return value", () => {
    const result = runWithRequestContext(() => 42);

    expect(result).toBe(42);
  });

  it("exposes the provided context inside the callback", () => {
    const context: RequestContext = { reqId: "req_123" };

    runWithRequestContext(() => {
      expect(getRequestContext()).toBe(context);
      expect(getReqId()).toBe("req_123");
    }, context);
  });

  it("generates a fresh context when none is provided", () => {
    runWithRequestContext(() => {
      expect(getReqId()).toMatch(UUID_PATTERN);
    });
  });

  it("does not leak the context after the callback returns", () => {
    runWithRequestContext(() => undefined, { reqId: "req_456" });

    expect(getRequestContext()).toBeUndefined();
  });
});

describe("getRequestContext", () => {
  it("returns undefined outside any request context", () => {
    expect(getRequestContext()).toBeUndefined();
  });

  it("returns the active context inside a request context", () => {
    const context: RequestContext = { reqId: "req_789" };

    runWithRequestContext(() => {
      expect(getRequestContext()).toEqual(context);
    }, context);
  });
});

describe("getReqId", () => {
  it("returns undefined outside any request context", () => {
    expect(getReqId()).toBeUndefined();
  });

  it("returns the active reqId inside a request context", () => {
    runWithRequestContext(() => {
      expect(getReqId()).toBe("req_abc");
    }, { reqId: "req_abc" });
  });
});
