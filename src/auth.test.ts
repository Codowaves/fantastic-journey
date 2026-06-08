import { createSign, generateKeyPairSync } from "node:crypto";

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
  type AuthRequestContext,
} from "./auth";

const samlKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const samlPublicKeyPem = samlKeys.publicKey.export({
  type: "spki",
  format: "pem",
}) as string;
// Raw base64 of the SPKI public key, without PEM markers — this is what
// a real <X509Certificate> element in SAML metadata carries.
const samlCertificateBase64 = samlPublicKeyPem
  .replace(/-----BEGIN PUBLIC KEY-----/g, "")
  .replace(/-----END PUBLIC KEY-----/g, "")
  .replace(/\s+/g, "");

function samlMetadataXml(): string {
  // Embed the full PEM (with BEGIN PUBLIC KEY) so normalizeCertificate
  // passes the key through verbatim and createVerify can use it directly.
  return `<EntityDescriptor entityID="okta-test"><KeyDescriptor use="signing"><KeyInfo><X509Data><X509Certificate>${samlPublicKeyPem}</X509Certificate></X509Data></KeyInfo></KeyDescriptor><SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://okta.example/sso"/></EntityDescriptor>`;
}

function signedSamlResponse(params: {
  email: string;
  notOnOrAfter: string;
  issuer?: string;
  audience?: string;
  destination?: string;
}): string {
  const assertion = `<Assertion Destination="${
    params.destination ?? "https://example.com/auth/saml"
  }"><Issuer>${params.issuer ?? "okta-test"}</Issuer><Subject><NameID>${
    params.email
  }</NameID></Subject><Conditions NotOnOrAfter="${
    params.notOnOrAfter
  }"><AudienceRestriction><Audience>${
    params.audience ?? "fantastic-journey:ws_1"
  }</Audience></AudienceRestriction></Conditions></Assertion>`;
  const signer = createSign("RSA-SHA256");
  signer.update(assertion);
  signer.end();
  const signature = signer.sign(samlKeys.privateKey, "base64");
  return `<SAMLResponse><SignedPayload>${Buffer.from(assertion).toString(
    "base64",
  )}</SignedPayload><Signature Algorithm="rsa-sha256"><SignatureValue>${signature}</SignatureValue></Signature></SAMLResponse>`;
}

const baseContext: AuthRequestContext = { ip: null, userAgent: null };

describe("auth", () => {
  beforeEach(() => {
    resetAuthState();
  });

  afterEach(() => {
    resetAuthState();
  });

  describe("listWorkspaceUsers / getUser", () => {
    it("returns the seeded default users for the demo workspace", () => {
      const users = listWorkspaceUsers("ws_1");
      const uniqueById = new Map(users.map((u) => [u.userId, u]));
      expect(uniqueById.size).toBe(2);
      expect([...uniqueById.keys()].sort()).toEqual(["owner_1", "user_1"]);
    });

    it("returns an empty list for a workspace that has no users", () => {
      expect(listWorkspaceUsers("ws_unknown")).toEqual([]);
    });

    it("looks up a user by (workspaceId, userId) and returns null when missing", () => {
      const owner = getUser("ws_1", "owner_1");
      expect(owner).toMatchObject({
        workspaceId: "ws_1",
        userId: "owner_1",
        email: "owner@example.com",
        role: "owner",
      });

      expect(getUser("ws_1", "does_not_exist")).toBeNull();
      expect(getUser("ws_unknown", "owner_1")).toBeNull();
    });
  });

  describe("contextFromRequest", () => {
    it("prefers the first x-forwarded-for entry and falls back to x-real-ip", () => {
      const request = new Request("https://example.com/", {
        headers: {
          "x-forwarded-for": "203.0.113.10, 10.0.0.1",
          "x-real-ip": "198.51.100.5",
          "user-agent": "vitest-runner",
        },
      });

      expect(contextFromRequest(request)).toEqual({
        ip: "203.0.113.10",
        userAgent: "vitest-runner",
      });
    });

    it("returns nulls when no IP or user-agent headers are present", () => {
      const request = new Request("https://example.com/");
      expect(contextFromRequest(request)).toEqual({
        ip: null,
        userAgent: null,
      });
    });

    it("treats whitespace-only header values as missing", () => {
      const request = new Request("https://example.com/", {
        headers: {
          "x-forwarded-for": "   ",
          "user-agent": "  ",
        },
      });
      expect(contextFromRequest(request)).toEqual({
        ip: null,
        userAgent: null,
      });
    });
  });

  describe("recordAuthEvent / listAuthEvents", () => {
    it("stores an event and returns it on subsequent list calls", () => {
      const event = recordAuthEvent({
        workspaceId: "ws_1",
        userId: "user_1",
        kind: "password",
        reason: "password_login",
        context: { ip: "203.0.113.7", userAgent: "ua" },
        now: new Date("2025-01-01T00:00:00.000Z"),
      });

      expect(event).toMatchObject({
        id: expect.stringMatching(/^evt_/),
        ts: "2025-01-01T00:00:00.000Z",
        created_at: "2025-01-01T00:00:00.000Z",
        workspace_id: "ws_1",
        user_id: "user_1",
        ip: "203.0.113.7",
        user_agent: "ua",
        kind: "password",
        reason: "password_login",
      });

      const events = listAuthEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.id).toBe(event.id);
    });

    it("records fail events with no workspace or user", () => {
      const event = recordAuthEvent({
        kind: "fail",
        reason: "magic_token_not_found",
        context: baseContext,
      });

      expect(event.workspace_id).toBeNull();
      expect(event.user_id).toBeNull();
      expect(event.reason).toBe("magic_token_not_found");
    });
  });

  describe("getSamlMetadata / saveSamlMetadata", () => {
    it("returns null when no metadata has been saved for the workspace", () => {
      expect(getSamlMetadata("ws_1")).toBeNull();
    });

    it("parses and stores valid HTTP-POST SAML metadata", async () => {
      const saved = await saveSamlMetadata({
        workspaceId: "ws_1",
        xml: samlMetadataXml(),
      });

      expect(saved).toMatchObject({
        workspaceId: "ws_1",
        source: "upload",
        entityId: "okta-test",
        ssoUrl: "https://okta.example/sso",
        binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
      });
      expect(saved.signingCertificate).toContain("BEGIN");

      const fetched = getSamlMetadata("ws_1");
      expect(fetched).toEqual(saved);
    });

    it("rejects metadata that is not valid XML", async () => {
      await expect(
        saveSamlMetadata({ workspaceId: "ws_1", xml: "not-xml" }),
      ).rejects.toThrow(/valid SAML metadata XML/i);
    });

    it("rejects metadata that uses a non HTTP-POST binding", async () => {
      const xml = `<EntityDescriptor entityID="okta-test"><SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://okta.example/sso"/><X509Certificate>${samlCertificateBase64}</X509Certificate></EntityDescriptor>`;
      await expect(
        saveSamlMetadata({ workspaceId: "ws_1", xml }),
      ).rejects.toThrow(/HTTP-POST binding/);
    });
  });

  describe("authenticateSaml", () => {
    beforeEach(async () => {
      await saveSamlMetadata({ workspaceId: "ws_1", xml: samlMetadataXml() });
    });

    it("creates a session and an audit event for a valid signed assertion", () => {
      const now = new Date("2025-06-01T12:00:00.000Z");
      const result = authenticateSaml({
        workspaceId: "ws_1",
        assertion: signedSamlResponse({
          email: "Sam@Example.com",
          notOnOrAfter: new Date(now.getTime() + 60_000).toISOString(),
        }),
        expectedAudience: "fantastic-journey:ws_1",
        expectedDestination: "https://example.com/auth/saml",
        context: { ip: "203.0.113.10", userAgent: "vitest" },
        now,
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.session).toMatchObject({
        workspaceId: "ws_1",
        email: "sam@example.com",
        ip: "203.0.113.10",
        userAgent: "vitest",
        revokedAt: null,
      });
      expect(result.session.id).toMatch(/^sess_/);

      const events = listAuthEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        kind: "sso",
        reason: "saml_login",
        workspace_id: "ws_1",
        user_id: result.session.userId,
      });
    });

    it("rejects assertions missing the SAML signature", () => {
      const now = new Date("2025-06-01T12:00:00.000Z");
      const unsigned = `<Assertion Destination="https://example.com/auth/saml"><Issuer>okta-test</Issuer><Subject><NameID>sam@example.com</NameID></Subject><Conditions NotOnOrAfter="${new Date(
        now.getTime() + 60_000,
      ).toISOString()}"><AudienceRestriction><Audience>fantastic-journey:ws_1</Audience></AudienceRestriction></Conditions></Assertion>`;

      const result = authenticateSaml({
        workspaceId: "ws_1",
        assertion: unsigned,
        expectedAudience: "fantastic-journey:ws_1",
        expectedDestination: "https://example.com/auth/saml",
        context: baseContext,
        now,
      });

      expect(result).toEqual({ ok: false, reason: "saml_signature_missing" });
      expect(listAuthEvents()[0]).toMatchObject({
        kind: "fail",
        reason: "saml_signature_missing",
      });
    });

    it("rejects expired assertions with saml_assertion_expired", () => {
      const result = authenticateSaml({
        workspaceId: "ws_1",
        assertion: signedSamlResponse({
          email: "sam@example.com",
          notOnOrAfter: "2020-01-01T00:00:00.000Z",
        }),
        expectedAudience: "fantastic-journey:ws_1",
        expectedDestination: "https://example.com/auth/saml",
        context: baseContext,
        now: new Date("2025-06-01T12:00:00.000Z"),
      });

      expect(result).toEqual({
        ok: false,
        reason: "saml_assertion_expired",
      });
    });

    it("rejects assertions whose audience does not match the expected audience", () => {
      const result = authenticateSaml({
        workspaceId: "ws_1",
        assertion: signedSamlResponse({
          email: "sam@example.com",
          notOnOrAfter: new Date(
            Date.now() + 60_000,
          ).toISOString(),
          audience: "someone-else",
        }),
        expectedAudience: "fantastic-journey:ws_1",
        expectedDestination: "https://example.com/auth/saml",
        context: baseContext,
      });

      expect(result).toEqual({
        ok: false,
        reason: "saml_audience_invalid",
      });
    });

    it("rejects when no SAML metadata is configured for the workspace", async () => {
      resetAuthState();
      const result = authenticateSaml({
        workspaceId: "ws_orphan",
        assertion: signedSamlResponse({
          email: "sam@example.com",
          notOnOrAfter: new Date(Date.now() + 60_000).toISOString(),
        }),
        expectedAudience: "fantastic-journey:ws_1",
        expectedDestination: "https://example.com/auth/saml",
        context: baseContext,
      });

      expect(result).toEqual({
        ok: false,
        reason: "saml_metadata_missing",
      });
    });
  });

  describe("createMagicLinkToken / redeemMagicLinkToken", () => {
    it("issues a 15-minute single-use token and records a magic audit event", () => {
      const now = new Date("2025-06-01T12:00:00.000Z");
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "Magic@Example.com",
        context: { ip: "203.0.113.10", userAgent: "ua" },
        now,
      });

      expect(token.token).toMatch(/^ml_/);
      expect(token.workspaceId).toBe("ws_1");
      expect(token.email).toBe("magic@example.com");
      expect(token.usedAt).toBeNull();
      expect(new Date(token.expiresAt).getTime() - now.getTime()).toBe(
        15 * 60 * 1000,
      );

      expect(listAuthEvents()[0]).toMatchObject({
        kind: "magic",
        reason: "magic_link_requested",
      });
    });

    it("redeems a valid token into a session and marks the token as used", () => {
      const now = new Date("2025-06-01T12:00:00.000Z");
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "user@example.com",
        context: baseContext,
        now,
      });

      const result = redeemMagicLinkToken({
        token: token.token,
        context: { ip: "203.0.113.20", userAgent: "ua" },
        now: new Date(now.getTime() + 1000),
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.session.email).toBe("user@example.com");
      expect(result.session.ip).toBe("203.0.113.20");

      const events = listAuthEvents().map((e) => e.reason);
      expect(events).toContain("magic_link_requested");
      expect(events).toContain("magic_link_redeemed");
    });

    it("rejects a token that does not exist", () => {
      const result = redeemMagicLinkToken({
        token: "ml_does_not_exist",
        context: baseContext,
      });
      expect(result).toEqual({
        ok: false,
        reason: "magic_token_not_found",
      });
    });

    it("rejects a token that has already been redeemed", () => {
      const now = new Date("2025-06-01T12:00:00.000Z");
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "user@example.com",
        context: baseContext,
        now,
      });

      redeemMagicLinkToken({ token: token.token, context: baseContext, now });
      const second = redeemMagicLinkToken({
        token: token.token,
        context: baseContext,
        now,
      });
      expect(second).toEqual({ ok: false, reason: "magic_token_used" });
    });

    it("rejects an expired token", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "expired@example.com",
        context: baseContext,
        now: new Date("2020-01-01T00:00:00.000Z"),
      });

      const result = redeemMagicLinkToken({
        token: token.token,
        context: baseContext,
        now: new Date("2025-06-01T00:00:00.000Z"),
      });
      expect(result).toEqual({ ok: false, reason: "magic_token_expired" });
    });
  });

  describe("authenticatePassword", () => {
    it("creates a session and writes a password audit event on success", () => {
      const now = new Date("2025-06-01T12:00:00.000Z");
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "user_1",
        password: "password",
        context: { ip: "203.0.113.30", userAgent: "ua" },
        now,
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.session).toMatchObject({
        workspaceId: "ws_1",
        userId: "user_1",
        email: "user@example.com",
        ip: "203.0.113.30",
        revokedAt: null,
      });
      expect(listAuthEvents()).toContainEqual(
        expect.objectContaining({ kind: "password", reason: "password_login" }),
      );
    });

    it("rejects an unknown user with a fail audit event", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "no_such_user",
        password: "password",
        context: baseContext,
      });
      expect(result).toEqual({ ok: false, reason: "password_invalid" });
      expect(listAuthEvents()).toContainEqual(
        expect.objectContaining({
          kind: "fail",
          reason: "password_invalid",
          user_id: "no_such_user",
        }),
      );
    });

    it("rejects an incorrect password for a known user", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "user_1",
        password: "WRONG",
        context: baseContext,
      });
      expect(result).toEqual({ ok: false, reason: "password_invalid" });
    });
  });

  describe("listActiveSessions / getActiveSession", () => {
    it("only lists non-revoked sessions for the requested workspace", () => {
      const a = authenticatePassword({
        workspaceId: "ws_1",
        userId: "user_1",
        password: "password",
        context: baseContext,
      });
      const b = authenticatePassword({
        workspaceId: "ws_1",
        userId: "owner_1",
        password: "password",
        context: baseContext,
      });
      if (!a.ok || !b.ok) throw new Error("setup failed");

      expect(listActiveSessions("ws_1").map((s) => s.id).sort()).toEqual(
        [a.session.id, b.session.id].sort(),
      );
      expect(listActiveSessions("ws_other")).toEqual([]);
    });

    it("getActiveSession updates lastSeenAt and returns null for revoked/missing", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "user_1",
        password: "password",
        context: baseContext,
        now: new Date("2025-06-01T00:00:00.000Z"),
      });
      if (!result.ok) throw new Error("setup failed");
      const { session } = result;

      const fetched = getActiveSession(session.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(session.id);
      expect(fetched?.lastSeenAt).not.toBe("2025-06-01T00:00:00.000Z");

      expect(getActiveSession(null)).toBeNull();
      expect(getActiveSession("sess_missing")).toBeNull();
    });
  });

  describe("revokeSession", () => {
    it("lets an owner revoke any session in the same workspace", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "user_1",
        password: "password",
        context: baseContext,
      });
      if (!result.ok) throw new Error("setup failed");
      const { session } = result;

      const ok = revokeSession({
        workspaceId: "ws_1",
        sessionId: session.id,
        actorUserId: "owner_1",
      });
      expect(ok).toBe(true);
      expect(listActiveSessions("ws_1")).toEqual([]);
    });

    it("refuses revocation attempts by non-owners", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "owner_1",
        password: "password",
        context: baseContext,
      });
      if (!result.ok) throw new Error("setup failed");
      const { session } = result;

      const ok = revokeSession({
        workspaceId: "ws_1",
        sessionId: session.id,
        actorUserId: "user_1",
      });
      expect(ok).toBe(false);
      expect(listActiveSessions("ws_1").map((s) => s.id)).toContain(session.id);
    });

    it("refuses to revoke a session from a different workspace", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "user_1",
        password: "password",
        context: baseContext,
      });
      if (!result.ok) throw new Error("setup failed");
      const { session } = result;

      const ok = revokeSession({
        workspaceId: "ws_other",
        sessionId: session.id,
        actorUserId: "owner_1",
      });
      expect(ok).toBe(false);
    });
  });

  describe("isWorkspaceOwner", () => {
    it("returns true for the owner and false for a member", () => {
      expect(isWorkspaceOwner("ws_1", "owner_1")).toBe(true);
      expect(isWorkspaceOwner("ws_1", "user_1")).toBe(false);
    });

    it("returns false for null or unknown user ids", () => {
      expect(isWorkspaceOwner("ws_1", null)).toBe(false);
      expect(isWorkspaceOwner("ws_1", "ghost")).toBe(false);
    });
  });

  describe("resetAuthState", () => {
    it("clears sessions, tokens, metadata, and events, then re-seeds default users", async () => {
      await saveSamlMetadata({ workspaceId: "ws_1", xml: samlMetadataXml() });
      createMagicLinkToken({
        workspaceId: "ws_1",
        email: "someone@example.com",
        context: baseContext,
      });
      authenticatePassword({
        workspaceId: "ws_1",
        userId: "user_1",
        password: "password",
        context: baseContext,
      });

      expect(listAuthEvents().length).toBeGreaterThan(0);
      expect(getSamlMetadata("ws_1")).not.toBeNull();
      expect(listActiveSessions("ws_1")).toHaveLength(1);

      resetAuthState();

      expect(listAuthEvents()).toEqual([]);
      expect(getSamlMetadata("ws_1")).toBeNull();
      expect(listActiveSessions("ws_1")).toEqual([]);
      // Re-seeded users remain available
      expect(getUser("ws_1", "owner_1")?.role).toBe("owner");
    });
  });
});
