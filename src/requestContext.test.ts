import { describe, expect, it } from "vitest";

import {
  createRequestContext,
  getReqId,
  runWithRequestContext,
} from "./requestContext";

describe("requestContext", () => {
  it("generates a non-empty string reqId when none is supplied", () => {
    const context = createRequestContext();

    expect(typeof context.reqId).toBe("string");
    expect(context.reqId.length).toBeGreaterThan(0);
  });

  it("preserves a supplied reqId", () => {
    runWithRequestContext(() => {
      expect(getReqId()).toBe("req_supplied_42");
    }, { reqId: "req_supplied_42" });
  });
});
