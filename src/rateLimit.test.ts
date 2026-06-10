import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  consumeRateLimit,
  getRouteLimit,
  resetRateLimitState,
} from "./rateLimit";

describe("rateLimit", () => {
  const identity = { ip: "203.0.113.1", workspaceId: "ws_1" };

  beforeEach(() => {
    resetRateLimitState();
  });

  afterEach(() => {
    resetRateLimitState();
  });

  it("allows requests up to the per-route limit", () => {
    const limit = getRouteLimit("auth_magic_link");
    for (let i = 0; i < limit; i++) {
      const decision = consumeRateLimit("auth_magic_link", identity);
      expect(decision.allowed).toBe(true);
      expect(decision.retryAfterSeconds).toBe(0);
      expect(decision.limit).toBe(limit);
    }
  });

  it("denies the (limit+1)-th request and reports a positive Retry-After", () => {
    const limit = getRouteLimit("auth_password");
    for (let i = 0; i < limit; i++) {
      expect(consumeRateLimit("auth_password", identity).allowed).toBe(true);
    }
    const denied = consumeRateLimit("auth_password", identity);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBeGreaterThan(0);
    expect(denied.remaining).toBe(0);
  });

  it("keeps limits independent across workspaces", () => {
    const wsA = { ip: "203.0.113.2", workspaceId: "ws_A" };
    const wsB = { ip: "203.0.113.2", workspaceId: "ws_B" };
    const limit = getRouteLimit("auth_saml");
    for (let i = 0; i < limit; i++) {
      expect(consumeRateLimit("auth_saml", wsA).allowed).toBe(true);
    }
    expect(consumeRateLimit("auth_saml", wsA).allowed).toBe(false);
    // ws_B still has its full budget.
    expect(consumeRateLimit("auth_saml", wsB).allowed).toBe(true);
  });

  it("keeps limits independent across user ids for the same workspace", () => {
    const userA = { ip: "203.0.113.3", workspaceId: "ws_1", userId: "alice" };
    const userB = { ip: "203.0.113.3", workspaceId: "ws_1", userId: "bob" };
    const limit = getRouteLimit("auth_password");
    for (let i = 0; i < limit; i++) {
      expect(consumeRateLimit("auth_password", userA).allowed).toBe(true);
    }
    expect(consumeRateLimit("auth_password", userA).allowed).toBe(false);
    expect(consumeRateLimit("auth_password", userB).allowed).toBe(true);
  });

  it("refills tokens over time", () => {
    const t0 = new Date("2024-01-01T00:00:00.000Z");
    const limit = getRouteLimit("auth_magic_link_verify");
    for (let i = 0; i < limit; i++) {
      expect(
        consumeRateLimit("auth_magic_link_verify", identity, t0).allowed,
      ).toBe(true);
    }
    expect(
      consumeRateLimit("auth_magic_link_verify", identity, t0).allowed,
    ).toBe(false);

    // After a full window the bucket should be fully refilled.
    const t1 = new Date(t0.getTime() + 60_000);
    expect(
      consumeRateLimit("auth_magic_link_verify", identity, t1).allowed,
    ).toBe(true);
  });

  it("reads route limits from env vars when set", () => {
    process.env["MAGIC_LINK_REQUEST_RPM"] = "2";
    try {
      expect(getRouteLimit("auth_magic_link")).toBe(2);
      const a = consumeRateLimit("auth_magic_link", identity);
      const b = consumeRateLimit("auth_magic_link", identity);
      const c = consumeRateLimit("auth_magic_link", identity);
      expect(a.allowed).toBe(true);
      expect(b.allowed).toBe(true);
      expect(c.allowed).toBe(false);
    } finally {
      delete process.env["MAGIC_LINK_REQUEST_RPM"];
    }
  });

  it("falls back to the default limit when env var is invalid", () => {
    process.env["AUTH_PASSWORD_RPM"] = "not-a-number";
    try {
      const limit = getRouteLimit("auth_password");
      expect(limit).toBeGreaterThan(0);
    } finally {
      delete process.env["AUTH_PASSWORD_RPM"];
    }
  });
});
