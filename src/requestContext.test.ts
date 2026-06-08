import { describe, expect, it } from "vitest";

import { createRequestContext } from "./requestContext";

describe("createRequestContext", () => {
  it("generates a non-empty string request id when none is supplied", () => {
    const ctx = createRequestContext();
    expect(typeof ctx.reqId).toBe("string");
    expect(ctx.reqId.length).toBeGreaterThan(0);
  });

  it("preserves a supplied request id", () => {
    const ctx = createRequestContext("supplied-id-123");
    expect(ctx.reqId).toBe("supplied-id-123");
  });
});
