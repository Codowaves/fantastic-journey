import { describe, expect, it } from "vitest";

import {
  createRequestContext,
  getReqId,
  getRequestContext,
  runWithRequestContext,
} from "./requestContext";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("createRequestContext", () => {
  it("returns a context whose reqId is a UUID", () => {
    const context = createRequestContext();

    expect(context.reqId).toMatch(UUID_PATTERN);
  });

  it("returns a distinct reqId on every call", () => {
    const first = createRequestContext();
    const second = createRequestContext();

    expect(first.reqId).not.toBe(second.reqId);
  });
});

describe("runWithRequestContext", () => {
  it("runs the callback with the provided context and returns its value", () => {
    const result = runWithRequestContext(
      () => getReqId(),
      { reqId: "req_123" },
    );

    expect(result).toBe("req_123");
  });

  it("generates a fresh context when none is provided", () => {
    const reqId = runWithRequestContext(() => getReqId());

    expect(reqId).toMatch(UUID_PATTERN);
  });
});

describe("getRequestContext", () => {
  it("returns the active context inside a request scope", () => {
    const context = { reqId: "req_active" };

    const seen = runWithRequestContext(() => getRequestContext(), context);

    expect(seen).toBe(context);
  });

  it("returns undefined outside any request scope", () => {
    expect(getRequestContext()).toBeUndefined();
  });
});

describe("getReqId", () => {
  it("returns the reqId of the active context", () => {
    const reqId = runWithRequestContext(() => getReqId(), {
      reqId: "req_456",
    });

    expect(reqId).toBe("req_456");
  });

  it("returns undefined outside any request scope", () => {
    expect(getReqId()).toBeUndefined();
  });
});
