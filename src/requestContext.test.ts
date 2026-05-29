import { describe, expect, it } from "vitest";

import {
  createRequestContext,
  getReqId,
  getRequestContext,
  runWithRequestContext,
} from "./requestContext";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("createRequestContext", () => {
  it("returns a context whose reqId is a UUID", () => {
    const context = createRequestContext();

    expect(context.reqId).toMatch(UUID_PATTERN);
  });

  it("returns a distinct reqId on each call", () => {
    const first = createRequestContext();
    const second = createRequestContext();

    expect(first.reqId).not.toBe(second.reqId);
  });
});

describe("runWithRequestContext", () => {
  it("exposes the explicit context to code running inside the callback", () => {
    const result = runWithRequestContext(
      () => getRequestContext(),
      { reqId: "req_explicit" },
    );

    expect(result).toEqual({ reqId: "req_explicit" });
  });

  it("generates a context with a UUID reqId when none is provided", () => {
    const reqId = runWithRequestContext(() => getReqId());

    expect(reqId).toMatch(UUID_PATTERN);
  });

  it("returns the callback's return value", () => {
    const value = runWithRequestContext(() => 42, { reqId: "req_value" });

    expect(value).toBe(42);
  });

  it("restores the outer context after a nested scope returns", () => {
    runWithRequestContext(
      () => {
        runWithRequestContext(
          () => {
            expect(getReqId()).toBe("req_inner");
          },
          { reqId: "req_inner" },
        );

        expect(getReqId()).toBe("req_outer");
      },
      { reqId: "req_outer" },
    );
  });
});

describe("getRequestContext", () => {
  it("returns the active context inside a request scope", () => {
    runWithRequestContext(
      () => {
        expect(getRequestContext()).toEqual({ reqId: "req_active" });
      },
      { reqId: "req_active" },
    );
  });

  it("returns undefined outside of any request scope", () => {
    expect(getRequestContext()).toBeUndefined();
  });
});

describe("getReqId", () => {
  it("returns the reqId of the active context", () => {
    runWithRequestContext(
      () => {
        expect(getReqId()).toBe("req_id_only");
      },
      { reqId: "req_id_only" },
    );
  });

  it("returns undefined outside of any request scope", () => {
    expect(getReqId()).toBeUndefined();
  });
});
