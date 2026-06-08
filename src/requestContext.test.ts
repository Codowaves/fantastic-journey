import { describe, expect, it } from "vitest";

import {
  createRequestContext,
  getReqId,
  getRequestContext,
  runWithRequestContext,
} from "./requestContext";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("requestContext", () => {
  describe("createRequestContext", () => {
    it("returns an object with a UUID-formatted reqId", () => {
      const context = createRequestContext();
      expect(context).toMatchObject({ reqId: expect.any(String) });
      expect(context.reqId).toMatch(UUID_PATTERN);
    });

    it("returns a unique reqId on each call", () => {
      const a = createRequestContext();
      const b = createRequestContext();
      expect(a.reqId).not.toBe(b.reqId);
    });
  });

  describe("runWithRequestContext", () => {
    it("makes the provided context available via getRequestContext inside the callback", () => {
      const provided = { reqId: "req_abc" };
      const seen = runWithRequestContext(() => getRequestContext(), provided);
      expect(seen).toEqual(provided);
    });

    it("returns the callback's return value", () => {
      const result = runWithRequestContext(
        () => 42,
        { reqId: "req_return" },
      );
      expect(result).toBe(42);
    });

    it("isolates the context — getRequestContext is undefined outside the callback", () => {
      runWithRequestContext(() => {
        expect(getRequestContext()).toBeDefined();
      }, { reqId: "req_isolated" });
      expect(getRequestContext()).toBeUndefined();
    });

    it("uses a freshly created context when none is provided", () => {
      const seen = runWithRequestContext(() => getRequestContext());
      expect(seen).toBeDefined();
      expect(seen?.reqId).toMatch(UUID_PATTERN);
    });
  });

  describe("getRequestContext", () => {
    it("returns undefined when called outside a request context", () => {
      expect(getRequestContext()).toBeUndefined();
    });
  });

  describe("getReqId", () => {
    it("returns undefined when no request context is active", () => {
      expect(getReqId()).toBeUndefined();
    });

    it("returns the active context's reqId inside runWithRequestContext", () => {
      const id = runWithRequestContext(() => getReqId(), {
        reqId: "req_lookup",
      });
      expect(id).toBe("req_lookup");
    });

    it("returns undefined after the callback resolves (edge case: post-exit access)", () => {
      let capturedInside: string | undefined;
      runWithRequestContext(
        () => {
          capturedInside = getReqId();
        },
        { reqId: "req_post" },
      );
      expect(capturedInside).toBe("req_post");
      expect(getReqId()).toBeUndefined();
    });
  });
});
