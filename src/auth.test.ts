import { createSign } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  authenticatePassword,
  authenticateSaml,
  contextFromRequest,
  createMagicLinkToken,
  getActiveSession,
  getSamlMetadata,
  getUser,
  isWorkspaceOwner,
  listActiveSessions,
  listAuthEvents,
  listWorkspaceUsers,
  recordAuthEvent,
  redeemMagicLinkToken,
  resetAuthState,
  revokeSession,
  saveSamlMetadata,
  type AuthEvent,
  type AuthRequestContext,
} from "./auth";

const ctx: AuthRequestContext = { ip: "127.0.0.1", userAgent: "vitest" };

function buildSignedSaml(params: {
  issuer: string;
  audience: string;
  destination: string;
  notOnOrAfter: string;
  email: string;
  certPem: string;
  keyPem: string;
}): string {
  const payload = `<Assertion><email="${params.email}"/><Issuer>${params.issuer}</Issuer><Audience>${params.audience}</Audience><NotOnOrAfter>${params.notOnOrAfter}</NotOnOrAfter><Destination>${params.destination}</Destination></Assertion>`;
  const payloadBase64 = Buffer.from(payload).toString("base64");
  const signer = createSign("RSA-SHA256");
  signer.update(payload);
  signer.end();
  const signatureValue = signer.sign(params.keyPem, "base64");
  return `<SignedPayload>${payloadBase64}</SignedPayload><SignatureValue>${signatureValue}</SignatureValue>`;
}

describe("auth module", () => {
  beforeEach(() => {
    resetAuthState();
  });

  afterEach(() => {
    resetAuthState();
  });

  describe("contextFromRequest", () => {
    it("extracts IP from x-forwarded-for (first value) and user-agent", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "203.0.113.5, 10.0.0.1, 10.0.0.2",
          "user-agent": "Mozilla/5.0",
        },
      });
      expect(contextFromRequest(request)).toEqual({
        ip: "203.0.113.5",
        userAgent: "Mozilla/5.0",
      });
    });

    it("falls back to x-real-ip when x-forwarded-for is missing", () => {
      const request = new Request("https://example.com", {
        headers: { "x-real-ip": "198.51.100.1" },
      });
      expect(contextFromRequest(request).ip).toBe("198.51.100.1");
    });

    it("returns null ip and null userAgent when headers are absent or blank", () => {
      const request = new Request("https://example.com", {
        headers: { "x-forwarded-for": "   ", "user-agent": "" },
      });
      expect(contextFromRequest(request)).toEqual({ ip: null, userAgent: null });
    });
  });

  describe("listWorkspaceUsers / getUser", () => {
    it("returns the seeded users for the default workspace", () => {
      const users = listWorkspaceUsers("ws_1");
      const userIds = [...new Set(users.map((u) => u.userId))].sort();
      expect(userIds).toEqual(["owner_1", "user_1"]);
    });

    it("returns an empty list for unknown workspaces", () => {
      expect(listWorkspaceUsers("ws_does_not_exist")).toEqual([]);
    });

    it("retrieves a user by id and returns null for unknown ids", () => {
      expect(getUser("ws_1", "owner_1")?.email).toBe("owner@example.com");
      expect(getUser("ws_1", "nope")).toBeNull();
      expect(getUser("ws_99", "owner_1")).toBeNull();
    });
  });

  describe("recordAuthEvent / listAuthEvents", () => {
    it("stores events with the provided kind and context, including a unique id and timestamps", () => {
      const event = recordAuthEvent({
        workspaceId: "ws_1",
        userId: "user_1",
        kind: "password",
        reason: "password_login",
        context: ctx,
      });
      expect(event.id).toMatch(/^evt_/);
      expect(event.kind).toBe("password");
      expect(event.workspace_id).toBe("ws_1");
      expect(event.user_id).toBe("user_1");
      expect(event.reason).toBe("password_login");
      expect(event.ip).toBe("127.0.0.1");
      expect(event.user_agent).toBe("vitest");
      expect(event.ts).toBe(event.created_at);

      const events = listAuthEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.id).toBe(event.id);
    });

    it("defaults null fields when workspaceId / userId / reason are omitted", () => {
      const event = recordAuthEvent({ kind: "fail", context: ctx });
      expect(event.workspace_id).toBeNull();
      expect(event.user_id).toBeNull();
      expect(event.reason).toBeNull();
    });

    it("accepts an injected now timestamp so timestamps are deterministic", () => {
      const fixed = new Date("2025-04-01T00:00:00.000Z");
      const event = recordAuthEvent({
        kind: "magic",
        reason: "magic_link_requested",
        context: ctx,
        now: fixed,
      });
      expect(event.ts).toBe("2025-04-01T00:00:00.000Z");
      expect(event.created_at).toBe("2025-04-01T00:00:00.000Z");
    });
  });

  describe("getSamlMetadata", () => {
    it("returns null when no metadata has been saved for the workspace", () => {
      expect(getSamlMetadata("ws_1")).toBeNull();
    });
  });

  describe("saveSamlMetadata", () => {
    const validXml = `<?xml version="1.0"?>
<EntityDescriptor entityID="urn:example:entity">
  <IDPSSODescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://idp.example.com/sso"/>
    <KeyDescriptor>
      <KeyInfo>
        <X509Data>
          <X509Certificate>${"A".repeat(64)}${"B".repeat(64)}</X509Certificate>
        </X509Data>
      </KeyInfo>
    </KeyDescriptor>
  </IDPSSODescriptor>
</EntityDescriptor>`;

    it("parses uploaded XML and stores entityID, SSO URL, binding, and certificate", async () => {
      const metadata = await saveSamlMetadata({
        workspaceId: "ws_1",
        xml: validXml,
      });
      expect(metadata.workspaceId).toBe("ws_1");
      expect(metadata.source).toBe("upload");
      expect(metadata.entityId).toBe("urn:example:entity");
      expect(metadata.ssoUrl).toBe("https://idp.example.com/sso");
      expect(metadata.binding).toBe(
        "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
      );
      expect(metadata.signingCertificate).toContain("BEGIN CERTIFICATE");
      expect(getSamlMetadata("ws_1")?.entityId).toBe("urn:example:entity");
    });

    it("fetches metadata from metadataUrl when xml is not provided", async () => {
      const fetcher: typeof fetch = (async () =>
        new Response(validXml, { status: 200 })) as typeof fetch;
      const metadata = await saveSamlMetadata({
        workspaceId: "ws_url",
        metadataUrl: "https://idp.example.com/metadata.xml",
        fetcher,
      });
      expect(metadata.source).toBe("url");
      expect(metadata.entityId).toBe("urn:example:entity");
    });

    it("throws when the URL fetch returns a non-OK status", async () => {
      const fetcher: typeof fetch = (async () =>
        new Response("nope", { status: 500 })) as typeof fetch;
      await expect(
        saveSamlMetadata({
          workspaceId: "ws_url",
          metadataUrl: "https://idp.example.com/metadata.xml",
          fetcher,
        }),
      ).rejects.toThrow(/metadata fetch failed/);
    });

    it("rejects non-XML input", async () => {
      await expect(
        saveSamlMetadata({ workspaceId: "ws_1", xml: "not xml at all" }),
      ).rejects.toThrow(/SAML metadata XML is required/);
    });

    it("rejects metadata missing entityID", async () => {
      const xmlMissingEntity = `<?xml version="1.0"?>
<EntityDescriptor>
  <IDPSSODescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://idp.example.com/sso"/>
  </IDPSSODescriptor>
</EntityDescriptor>`;
      await expect(
        saveSamlMetadata({ workspaceId: "ws_1", xml: xmlMissingEntity }),
      ).rejects.toThrow(/entityID/);
    });

    it("rejects metadata that does not use the HTTP-POST binding", async () => {
      const wrongBinding = validXml.replace(
        "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
        "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
      );
      await expect(
        saveSamlMetadata({ workspaceId: "ws_1", xml: wrongBinding }),
      ).rejects.toThrow(/HTTP-POST/);
    });
  });

  describe("authenticateSaml", () => {
    it("returns saml_metadata_missing when no metadata is configured for the workspace", () => {
      const result = authenticateSaml({
        workspaceId: "ws_no_metadata",
        assertion: "<x/>",
        expectedAudience: "urn:app",
        expectedDestination: "https://app.example.com/acs",
        context: ctx,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("saml_metadata_missing");
      expect(
        listAuthEvents().some(
          (e: AuthEvent) => e.reason === "saml_metadata_missing",
        ),
      ).toBe(true);
    });
  });

  describe("createMagicLinkToken / redeemMagicLinkToken", () => {
    it("creates a token with a 15-minute expiry and records a magic event", () => {
      const fixed = new Date("2025-04-01T12:00:00.000Z");
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "fresh@example.com",
        context: ctx,
        now: fixed,
      });
      expect(token.token).toMatch(/^ml_/);
      expect(token.expiresAt).toBe("2025-04-01T12:15:00.000Z");
      expect(token.usedAt).toBeNull();
      expect(token.email).toBe("fresh@example.com");
      expect(token.userId).toMatch(/^usr_/);
      expect(
        listAuthEvents().some(
          (e: AuthEvent) => e.reason === "magic_link_requested",
        ),
      ).toBe(true);
    });

    it("redeems a valid token, returns a session, and rejects subsequent reuse", () => {
      const issued = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "redeem@example.com",
        context: ctx,
        now: new Date("2025-04-01T12:00:00.000Z"),
      });

      const result = redeemMagicLinkToken({
        token: issued.token,
        context: ctx,
        now: new Date("2025-04-01T12:05:00.000Z"),
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.session.email).toBe("redeem@example.com");
        expect(result.session.revokedAt).toBeNull();
      }

      const replay = redeemMagicLinkToken({
        token: issued.token,
        context: ctx,
        now: new Date("2025-04-01T12:10:00.000Z"),
      });
      expect(replay.ok).toBe(false);
      if (!replay.ok) expect(replay.reason).toBe("magic_token_used");
    });

    it("rejects an unknown token", () => {
      const result = redeemMagicLinkToken({
        token: "ml_unknown",
        context: ctx,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("magic_token_not_found");
    });

    it("rejects an expired token", () => {
      const issued = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "expire@example.com",
        context: ctx,
        now: new Date("2025-04-01T12:00:00.000Z"),
      });
      const result = redeemMagicLinkToken({
        token: issued.token,
        context: ctx,
        now: new Date("2025-04-01T12:20:00.000Z"),
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("magic_token_expired");
    });
  });

  describe("authenticatePassword", () => {
    it("succeeds for the seeded member with the shared password and creates a session", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "user_1",
        password: "password",
        context: ctx,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.session.userId).toBe("user_1");
        expect(result.session.email).toBe("user@example.com");
      }
      expect(
        listAuthEvents().some(
          (e: AuthEvent) => e.reason === "password_login",
        ),
      ).toBe(true);
    });

    it("fails with a bad password and records a fail event", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "user_1",
        password: "wrong",
        context: ctx,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("password_invalid");
      expect(
        listAuthEvents().some(
          (e: AuthEvent) =>
            e.kind === "fail" && e.reason === "password_invalid",
        ),
      ).toBe(true);
    });

    it("fails when the user does not exist in the workspace", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "ghost",
        password: "password",
        context: ctx,
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("sessions: listActiveSessions / getActiveSession / revokeSession", () => {
    function newSession(workspaceId: string, userId: string, email: string) {
      const r = authenticatePassword({
        workspaceId,
        userId,
        password: "password",
        context: ctx,
      });
      if (!r.ok) throw new Error("expected session");
      return r.session;
    }

    it("lists only active sessions for the requested workspace", () => {
      const a = newSession("ws_1", "user_1", "user@example.com");
      newSession("ws_1", "owner_1", "owner@example.com");
      expect(listActiveSessions("ws_1").map((s) => s.id)).toEqual(
        expect.arrayContaining([a.id]),
      );
      expect(listActiveSessions("ws_other")).toEqual([]);
    });

    it("getActiveSession returns the session and bumps lastSeenAt; null/empty input returns null", () => {
      const a = newSession("ws_1", "user_1", "user@example.com");
      const found = getActiveSession(a.id);
      expect(found?.id).toBe(a.id);
      expect(getActiveSession(null)).toBeNull();
      expect(getActiveSession("sess_missing")).toBeNull();
    });

    it("revokeSession succeeds for an owner, fails for non-owners, and hides revoked sessions", () => {
      const a = newSession("ws_1", "user_1", "user@example.com");
      expect(
        revokeSession({
          workspaceId: "ws_1",
          sessionId: a.id,
          actorUserId: "user_1",
        }),
      ).toBe(false);
      expect(
        revokeSession({
          workspaceId: "ws_1",
          sessionId: a.id,
          actorUserId: "owner_1",
        }),
      ).toBe(true);
      expect(getActiveSession(a.id)).toBeNull();
      expect(listActiveSessions("ws_1").map((s) => s.id)).not.toContain(a.id);
    });

    it("revokeSession refuses to revoke sessions belonging to a different workspace", () => {
      const a = newSession("ws_1", "user_1", "user@example.com");
      expect(
        revokeSession({
          workspaceId: "ws_other",
          sessionId: a.id,
          actorUserId: "owner_1",
        }),
      ).toBe(false);
    });
  });

  describe("isWorkspaceOwner", () => {
    it("returns true for the owner, false for members, and false for null/unknown", () => {
      expect(isWorkspaceOwner("ws_1", "owner_1")).toBe(true);
      expect(isWorkspaceOwner("ws_1", "user_1")).toBe(false);
      expect(isWorkspaceOwner("ws_1", null)).toBe(false);
      expect(isWorkspaceOwner("ws_1", "ghost")).toBe(false);
    });
  });
});
