import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  authenticatePassword,
  createMagicLinkToken,
  redeemMagicLinkToken,
  authenticateSaml,
  saveSamlMetadata,
  getSamlMetadata,
  listActiveSessions,
  getActiveSession,
  revokeSession,
  isWorkspaceOwner,
  listAuthEvents,
  listWorkspaceUsers,
  getUser,
  resetAuthState,
} from "./auth.js";

const dummyContext = {
  ip: "127.0.0.1",
  userAgent: "vitest/0.1",
};

function buildSignedSamlAssertion(
  overrides: Record<string, string> = {},
): string {
  const attrs = {
    email: "sso@example.com",
    userId: "sso_user_id",
    issuer: "https://idp.example.com",
    audience: "https://sp.example.com",
    Destination: "https://sp.example.com/sso",
    NotOnOrAfter: new Date(Date.now() + 60_000).toISOString(),
    Algorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    ...overrides,
  };

  const payload = [
    `<SignedPayload email="${attrs.email}" userId="${attrs.userId}" Destination="${attrs.Destination}" NotOnOrAfter="${attrs.NotOnOrAfter}" Algorithm="${attrs.Algorithm}">`,
    `<Issuer>${attrs.issuer}</Issuer>`,
    `<Audience>${attrs.audience}</Audience>`,
    `<NameID>${attrs.email}</NameID>`,
    `</SignedPayload>`,
  ].join("");

  const payloadB64 = Buffer.from(payload).toString("base64");

  // We can't produce a valid RSA signature without a private key, so we
  // construct a SignedInfo block with a fake SignatureValue.  The real
  // verifySamlSignature will fail — we test those failure paths directly.
  return Buffer.from(
    `<Response>` +
      `<SignedPayload>${payloadB64}</SignedPayload>` +
      `<SignatureValue>invalid_signature_base64</SignatureValue>` +
      `</Response>`,
  ).toString("base64");
}

describe("auth module", () => {
  beforeEach(() => {
    resetAuthState();
  });

  afterEach(() => {
    resetAuthState();
  });

  // -------------------------------------------------------------------------
  // password-auth
  // -------------------------------------------------------------------------
  describe("authenticatePassword", () => {
    it("happy path: valid owner credentials returns session", () => {
      // seedDefaultUsers creates owner_1 in ws_1
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "owner_1",
        password: "password",
        context: dummyContext,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.session.workspaceId).toBe("ws_1");
        expect(result.session.userId).toBe("owner_1");
        expect(result.session.email).toBe("owner@example.com");
      }
    });

    it("edge: wrong password returns fail result", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "owner_1",
        password: "wrong",
        context: dummyContext,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe("password_invalid");
        return;
      }
    });

    it("edge: nonexistent user returns fail result", () => {
      const result = authenticatePassword({
        workspaceId: "ws_1",
        userId: "nobody",
        password: "password",
        context: dummyContext,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe("password_invalid");
        return;
      }
    });

    it("records auth events on failed attempt", () => {
      authenticatePassword({
        workspaceId: "ws_1",
        userId: "owner_1",
        password: "wrong",
        context: dummyContext,
      });
      const events = listAuthEvents();
      expect(
        events.some(
          (e) => e.kind === "fail" && e.reason === "password_invalid",
        ),
      ).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // magic-link
  // -------------------------------------------------------------------------
  describe("createMagicLinkToken", () => {
    it("happy path: creates token for known user", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      expect(token.token).toMatch(/^ml_/);
      expect(token.email).toBe("owner@example.com");
      expect(token.workspaceId).toBe("ws_1");
    });

    it("creates user on-the-fly if unknown", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "new@example.com",
        context: dummyContext,
      });
      expect(token.token).toMatch(/^ml_/);
      expect(token.email).toBe("new@example.com");
    });

    it("records magic_link_requested auth event", () => {
      createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      const events = listAuthEvents();
      expect(
        events.some(
          (e) => e.kind === "magic" && e.reason === "magic_link_requested",
        ),
      ).toBe(true);
    });
  });

  describe("redeemMagicLinkToken", () => {
    it("happy path: exchange valid token for session", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      const result = redeemMagicLinkToken({
        token: token.token,
        context: dummyContext,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.session.email).toBe("owner@example.com");
      }
    });

    it("edge: nonexistent token returns fail result", () => {
      const result = redeemMagicLinkToken({
        token: "ml_does_not_exist",
        context: dummyContext,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe("magic_token_not_found");
        return;
      }
      expect.fail("expected failure result");
    });

    it("edge: double-exchange of same token returns fail result", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      const first = redeemMagicLinkToken({
        token: token.token,
        context: dummyContext,
      });
      expect(first.ok).toBe(true);
      const second = redeemMagicLinkToken({
        token: token.token,
        context: dummyContext,
      });
      expect(second.ok).toBe(false);
      if (!second.ok) {
        expect(second.reason).toBe("magic_token_used");
        return;
      }
      expect.fail("expected failure result");
    });

    it("edge: expired token returns fail result", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
        now: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      });
      const result = redeemMagicLinkToken({
        token: token.token,
        context: dummyContext,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe("magic_token_expired");
        return;
      }
      expect.fail("expected failure result");
    });

    it("records magic_link_redeemed auth event on success", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      redeemMagicLinkToken({ token: token.token, context: dummyContext });
      const events = listAuthEvents();
      expect(
        events.some(
          (e) => e.kind === "magic" && e.reason === "magic_link_redeemed",
        ),
      ).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // SAML metadata
  // -------------------------------------------------------------------------
  describe("saveSamlMetadata", () => {
    it("happy path: saves metadata from XML string", async () => {
      const xml =
        `<EntityDescriptor entityID="https://idp.example.com" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">` +
        `<X509Certificate>MIIDXTCCAkWgAwIBAgIJAJCAAAAAAUI</X509Certificate>` +
        `</EntityDescriptor>`;
      const result = await saveSamlMetadata({ workspaceId: "ws_test", xml });
      expect(result.workspaceId).toBe("ws_test");
      expect(result.entityId).toBe("https://idp.example.com");
      expect(result.binding).toBe(
        "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
      );
    });

    it("edge: non-HTTP-POST binding throws", async () => {
      const xml =
        `<EntityDescriptor entityID="https://idp.example.com" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect">` +
        `<X509Certificate>MIIDXTCCAkWgAwIBAgIJAJCAAAAAAUI</X509Certificate>` +
        `</EntityDescriptor>`;
      let threw = false;
      let message = "";
      try {
        await saveSamlMetadata({ workspaceId: "ws_test2", xml });
      } catch (e: unknown) {
        threw = true;
        message = e instanceof Error ? e.message : String(e);
      }
      expect(threw).toBe(true);
      expect(message).toBe("SAML metadata must use HTTP-POST binding");
    });

    it("edge: missing entityID throws", async () => {
      const xml =
        `<EntityDescriptor Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">` +
        `<X509Certificate>MIIDXTCCAkWgAwIBAgIJAJCAAAAAAUI</X509Certificate>` +
        `</EntityDescriptor>`;
      let threw = false;
      let message = "";
      try {
        await saveSamlMetadata({ workspaceId: "ws_test3", xml });
      } catch (e: unknown) {
        threw = true;
        message = e instanceof Error ? e.message : String(e);
      }
      expect(threw).toBe(true);
      expect(message).toBe(
        "SAML metadata must include entityID and signing certificate",
      );
    });

    it("happy path: fetches metadata from URL with mocked fetch", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            `<EntityDescriptor entityID="https://idp.example.com" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">` +
              `<X509Certificate>MIIDXTCCAkWgAwIBAgIJAJCAAAAAAUI</X509Certificate>` +
              `</EntityDescriptor>`,
          ),
      });
      const result = await saveSamlMetadata({
        workspaceId: "ws_fetch",
        metadataUrl: "https://idp.example.com/metadata",
        fetcher: mockFetch as unknown as typeof fetch,
      });
      expect(result.source).toBe("url");
      expect(result.entityId).toBe("https://idp.example.com");
      expect(mockFetch).toHaveBeenCalled();
    });

    it("edge: fetch failure throws", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });
      let threw = false;
      let message = "";
      try {
        await saveSamlMetadata({
          workspaceId: "ws_fail",
          metadataUrl: "https://idp.example.com/metadata",
          fetcher: mockFetch as unknown as typeof fetch,
        });
      } catch (e: unknown) {
        threw = true;
        message = e instanceof Error ? e.message : String(e);
      }
      expect(threw).toBe(true);
      expect(message).toContain("metadata fetch failed");
    });
  });

  describe("getSamlMetadata", () => {
    it("happy path: returns stored metadata", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            `<EntityDescriptor entityID="https://idp.example.com" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">` +
              `<X509Certificate>MIIDXTCCAkWgAwIBAgIJA</X509Certificate>` +
              `</EntityDescriptor>`,
          ),
      });
      await saveSamlMetadata({
        workspaceId: "ws_get",
        metadataUrl: "https://idp.example.com/metadata",
        fetcher: mockFetch as unknown as typeof fetch,
      });
      const meta = getSamlMetadata("ws_get");
      expect(meta).not.toBeNull();
      expect(meta?.entityId).toBe("https://idp.example.com");
    });

    it("edge: returns null for unknown workspace", () => {
      expect(getSamlMetadata("ws_nonexistent")).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // SAML authentication
  // -------------------------------------------------------------------------
  describe("authenticateSaml", () => {
    // Note: all assertions below use a fake signature, so authenticateSaml
    // returns saml_signature_invalid before reaching the field-level checks.
    // We keep these tests to document actual behavior; in a real integration
    // test with a properly signed assertion these would test issuer/audience/
    // destination/subject/expiry specifically.

    it("edge: missing metadata returns saml_metadata_missing", () => {
      const result = authenticateSaml({
        workspaceId: "ws_unknown",
        assertion: buildSignedSamlAssertion(),
        expectedAudience: "https://sp.example.com",
        expectedDestination: "https://sp.example.com/sso",
        context: dummyContext,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe("saml_metadata_missing");
        return;
      }
      expect.fail("expected failure result");
    });

    it("edge: fake signature returns saml_signature_invalid", async () => {
      const xml =
        `<EntityDescriptor entityID="https://idp.example.com" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">` +
        `<X509Certificate>MIIDXTCCAkWgAwIBAgIJAJCAAAAAAUI</X509Certificate>` +
        `</EntityDescriptor>`;
      await saveSamlMetadata({ workspaceId: "ws_sig_invalid", xml });

      const result = authenticateSaml({
        workspaceId: "ws_sig_invalid",
        assertion: buildSignedSamlAssertion({
          issuer: "https://wrong-issuer.com",
        }),
        expectedAudience: "https://sp.example.com",
        expectedDestination: "https://sp.example.com/sso",
        context: dummyContext,
      });
      expect(result.ok).toBe(false);
      // Signature is fake so we hit saml_signature_invalid before issuer check
      if (!result.ok) {
        expect(result.reason).toBe("saml_signature_invalid");
        return;
      }
      expect.fail("expected failure result");
    });
  });

  // -------------------------------------------------------------------------
  // sessions
  // -------------------------------------------------------------------------
  describe("getActiveSession", () => {
    it("happy path: retrieves active session", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      const redeemResult = redeemMagicLinkToken({
        token: token.token,
        context: dummyContext,
      });
      expect(redeemResult.ok).toBe(true);
      if (redeemResult.ok) {
        const session = getActiveSession(redeemResult.session.id);
        expect(session).not.toBeNull();
        expect(session?.email).toBe("owner@example.com");
      }
    });

    it("edge: null sessionId returns null", () => {
      expect(getActiveSession(null)).toBeNull();
    });

    it("edge: revoked session returns null", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      const redeemResult = redeemMagicLinkToken({
        token: token.token,
        context: dummyContext,
      });
      expect(redeemResult.ok).toBe(true);
      if (redeemResult.ok) {
        const sessionId = redeemResult.session.id;
        revokeSession({
          workspaceId: "ws_1",
          sessionId,
          actorUserId: "owner_1",
        });
        expect(getActiveSession(sessionId)).toBeNull();
      }
    });
  });

  describe("revokeSession", () => {
    it("happy path: owner can revoke session", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      const redeemResult = redeemMagicLinkToken({
        token: token.token,
        context: dummyContext,
      });
      expect(redeemResult.ok).toBe(true);
      if (redeemResult.ok) {
        const ok = revokeSession({
          workspaceId: "ws_1",
          sessionId: redeemResult.session.id,
          actorUserId: "owner_1",
        });
        expect(ok).toBe(true);
      }
    });

    it("edge: non-owner cannot revoke session", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "user@example.com",
        context: dummyContext,
      });
      const redeemResult = redeemMagicLinkToken({
        token: token.token,
        context: dummyContext,
      });
      expect(redeemResult.ok).toBe(true);
      if (redeemResult.ok) {
        const ok = revokeSession({
          workspaceId: "ws_1",
          sessionId: redeemResult.session.id,
          actorUserId: "user_1", // member, not owner
        });
        expect(ok).toBe(false);
      }
    });
  });

  describe("listActiveSessions", () => {
    it("happy path: lists active sessions for workspace", () => {
      const token = createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      redeemMagicLinkToken({ token: token.token, context: dummyContext });
      const sessions = listActiveSessions("ws_1");
      expect(sessions.length).toBeGreaterThan(0);
    });

    it("edge: unknown workspace returns empty list", () => {
      expect(listActiveSessions("ws_unknown")).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // workspace / user helpers
  // -------------------------------------------------------------------------
  describe("isWorkspaceOwner", () => {
    it("happy path: owner returns true", () => {
      expect(isWorkspaceOwner("ws_1", "owner_1")).toBe(true);
    });

    it("edge: member returns false", () => {
      expect(isWorkspaceOwner("ws_1", "user_1")).toBe(false);
    });

    it("edge: null userId returns false", () => {
      expect(isWorkspaceOwner("ws_1", null)).toBe(false);
    });

    it("edge: nonexistent user returns false", () => {
      expect(isWorkspaceOwner("ws_1", "nobody")).toBe(false);
    });
  });

  describe("listWorkspaceUsers", () => {
    it("happy path: lists users for a workspace", () => {
      const users = listWorkspaceUsers("ws_1");
      expect(users.length).toBeGreaterThan(0);
      expect(users.some((u) => u.email === "owner@example.com")).toBe(true);
    });

    it("edge: unknown workspace returns empty list", () => {
      expect(listWorkspaceUsers("ws_unknown")).toEqual([]);
    });
  });

  describe("getUser", () => {
    it("happy path: returns user by workspace and userId", () => {
      const user = getUser("ws_1", "owner_1");
      expect(user).not.toBeNull();
      expect(user?.email).toBe("owner@example.com");
    });

    it("edge: nonexistent user returns null", () => {
      expect(getUser("ws_1", "nobody")).toBeNull();
    });
  });

  describe("listAuthEvents", () => {
    it("happy path: returns auth events", () => {
      createMagicLinkToken({
        workspaceId: "ws_1",
        email: "owner@example.com",
        context: dummyContext,
      });
      const events = listAuthEvents();
      expect(Array.isArray(events)).toBe(true);
    });
  });
});
