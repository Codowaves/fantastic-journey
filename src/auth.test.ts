import { createSign, generateKeyPairSync } from "node:crypto";

import { beforeEach, describe, expect, it } from "vitest";

import {
  AuthError,
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
  redeemMagicLinkToken,
  recordAuthEvent,
  resetAuthState,
  revokeSession,
  saveSamlMetadata,
} from "./auth";
import type { AuthRequestContext } from "./auth";

const CONTEXT: AuthRequestContext = { ip: "127.0.0.1", userAgent: "vitest" };

function makeRequest(headers: Record<string, string>): Request {
  return new Request("https://example.com/", { headers });
}

function makeSamlMetadataXml(
  certificate: string,
  entityId = "https://idp.example.com/entity",
): string {
  return `<?xml version="1.0"?>
<EntityDescriptor entityID="${entityId}">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <KeyInfo>
        <X509Data>
          <X509Certificate>${certificate}</X509Certificate>
        </X509Data>
      </KeyInfo>
    </KeyDescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://idp.example.com/sso"/>
  </IDPSSODescriptor>
</EntityDescriptor>`;
}

function makeSignedSamlAssertion(params: {
  privateKey: string;
  email: string;
  userId: string;
  issuer: string;
  audience: string;
  destination: string;
  notOnOrAfter: string;
}): string {
  const inner = `<Assertion>
  <Issuer>${params.issuer}</Issuer>
  <Subject>
    <NameID>${params.email}</NameID>
  </Subject>
  <Audience>${params.audience}</Audience>
  <Conditions NotOnOrAfter="${params.notOnOrAfter}" Destination="${params.destination}" Recipient="${params.destination}"/>
  <Attribute email="${params.email}" userId="${params.userId}"/>
</Assertion>`;
  const signer = createSign("RSA-SHA256");
  signer.update(inner);
  signer.end();
  const signature = signer.sign(params.privateKey, "base64");
  return `<?xml version="1.0"?>
<Response>
  ${inner}
  <SignedPayload Algorithm="rsa-sha256">${Buffer.from(inner).toString("base64")}</SignedPayload>
  <SignatureValue>${signature}</SignatureValue>
</Response>`;
}

describe("AuthError", () => {
  it("sets the code field on construction", () => {
    const err = new AuthError("saml_metadata_invalid", "bad xml");
    expect(err.code).toBe("saml_metadata_invalid");
    expect(err.message).toBe("bad xml");
    expect(err.name).toBe("AuthError");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AuthError);
  });

  it("defaults the message to the code when none is provided", () => {
    const err = new AuthError("saml_metadata_invalid");
    expect(err.code).toBe("saml_metadata_invalid");
    expect(err.message).toBe("saml_metadata_invalid");
  });

  it("is thrown by saveSamlMetadata with a structured code", async () => {
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1", xml: "not-xml" }),
    ).rejects.toMatchObject({
      name: "AuthError",
      code: "saml_metadata_invalid",
    });
  });
});

describe("contextFromRequest", () => {
  it("prefers the first x-forwarded-for entry as the IP", () => {
    const request = makeRequest({
      "x-forwarded-for": "203.0.113.5, 10.0.0.1, 10.0.0.2",
      "user-agent": "Mozilla/5.0",
    });
    expect(contextFromRequest(request)).toEqual({
      ip: "203.0.113.5",
      userAgent: "Mozilla/5.0",
    });
  });

  it("falls back to x-real-ip when x-forwarded-for is missing", () => {
    const request = makeRequest({ "x-real-ip": "198.51.100.7" });
    expect(contextFromRequest(request)).toEqual({
      ip: "198.51.100.7",
      userAgent: null,
    });
  });

  it("returns nulls when headers are absent or whitespace-only", () => {
    const request = makeRequest({ "x-forwarded-for": "   " });
    expect(contextFromRequest(request)).toEqual({ ip: null, userAgent: null });
  });
});

describe("recordAuthEvent / listAuthEvents", () => {
  it("records an event and returns it via listAuthEvents", () => {
    resetAuthState();
    const event = recordAuthEvent({
      workspaceId: "ws_1",
      userId: "user_1",
      kind: "password",
      reason: "password_login",
      context: CONTEXT,
    });
    expect(event.kind).toBe("password");
    expect(event.workspace_id).toBe("ws_1");
    expect(event.user_id).toBe("user_1");
    expect(event.ip).toBe("127.0.0.1");
    expect(event.reason).toBe("password_login");
    expect(listAuthEvents()).toHaveLength(1);
  });

  it("defaults null fields when not provided", () => {
    resetAuthState();
    const event = recordAuthEvent({ kind: "fail", context: CONTEXT });
    expect(event.workspace_id).toBeNull();
    expect(event.user_id).toBeNull();
    expect(event.reason).toBeNull();
  });
});

describe("saveSamlMetadata / getSamlMetadata", () => {
  let cert: string;

  beforeEach(() => {
    resetAuthState();
    const keyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
    cert = keyPair.publicKey.export({ type: "spki", format: "pem" }).toString();
  });

  it("stores valid metadata and returns it via getSamlMetadata", async () => {
    const xml = makeSamlMetadataXml(cert);
    const meta = await saveSamlMetadata({ workspaceId: "ws_1", xml });
    expect(meta.workspaceId).toBe("ws_1");
    expect(meta.source).toBe("upload");
    expect(meta.entityId).toBe("https://idp.example.com/entity");
    expect(meta.signingCertificate).toContain("BEGIN PUBLIC KEY");
    expect(getSamlMetadata("ws_1")?.entityId).toBe(meta.entityId);
  });

  it("fetches XML from a URL when metadataUrl is provided", async () => {
    const xml = makeSamlMetadataXml(cert);
    const meta = await saveSamlMetadata({
      workspaceId: "ws_1",
      metadataUrl: "https://idp.example.com/metadata",
      fetcher: async () => new Response(xml, { status: 200 }),
    });
    expect(meta.source).toBe("url");
    expect(meta.entityId).toBe("https://idp.example.com/entity");
  });

  it("rejects when the metadataUrl fetch fails", async () => {
    await expect(
      saveSamlMetadata({
        workspaceId: "ws_1",
        metadataUrl: "https://idp.example.com/metadata",
        fetcher: async () => new Response("nope", { status: 500 }),
      }),
    ).rejects.toMatchObject({ code: "saml_metadata_fetch_failed" });
  });

  it("throws saml_metadata_incomplete when entityID is missing", async () => {
    const xml = `<?xml version="1.0"?>
<EntityDescriptor>
  <IDPSSODescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://idp.example.com/sso"/>
    <X509Certificate>${cert}</X509Certificate>
  </IDPSSODescriptor>
</EntityDescriptor>`;
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1", xml }),
    ).rejects.toMatchObject({ code: "saml_metadata_incomplete" });
  });

  it("throws saml_metadata_binding_invalid when binding is not HTTP-POST", async () => {
    const xml = `<?xml version="1.0"?>
<EntityDescriptor entityID="https://idp.example.com/entity">
  <IDPSSODescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/>
    <X509Certificate>${cert}</X509Certificate>
  </IDPSSODescriptor>
</EntityDescriptor>`;
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1", xml }),
    ).rejects.toMatchObject({ code: "saml_metadata_binding_invalid" });
  });

  it("throws saml_metadata_incomplete when signing certificate is missing", async () => {
    const xml = `<?xml version="1.0"?>
<EntityDescriptor entityID="https://idp.example.com/entity">
  <IDPSSODescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://idp.example.com/sso"/>
  </IDPSSODescriptor>
</EntityDescriptor>`;
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1", xml }),
    ).rejects.toMatchObject({ code: "saml_metadata_incomplete" });
  });

  it("throws saml_metadata_invalid when neither xml nor metadataUrl is provided", async () => {
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1" }),
    ).rejects.toMatchObject({ code: "saml_metadata_invalid" });
  });
});

describe("authenticateSaml", () => {
  let cert: string;
  let privateKey: string;

  beforeEach(() => {
    resetAuthState();
    const kp = generateKeyPairSync("rsa", { modulusLength: 2048 });
    cert = kp.publicKey.export({ type: "spki", format: "pem" }).toString();
    privateKey = kp.privateKey
      .export({ type: "pkcs8", format: "pem" })
      .toString();
  });

  async function setupMetadata() {
    const xml = makeSamlMetadataXml(cert);
    await saveSamlMetadata({ workspaceId: "ws_1", xml });
  }

  function makeFutureExpiry(): string {
    return new Date(Date.now() + 60_000).toISOString();
  }

  it("returns a session for a valid signed assertion", async () => {
    await setupMetadata();
    const assertion = makeSignedSamlAssertion({
      privateKey,
      email: "sso-user@example.com",
      userId: "sso-1",
      issuer: "https://idp.example.com/entity",
      audience: "https://sp.example.com",
      destination: "https://sp.example.com/acs",
      notOnOrAfter: makeFutureExpiry(),
    });
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.workspaceId).toBe("ws_1");
      expect(result.session.userId).toMatch(/^usr_/);
      expect(result.session.email).toBe("sso-user@example.com");
    }
  });

  it("rejects when metadata is not configured for the workspace", () => {
    const result = authenticateSaml({
      workspaceId: "ws_unknown",
      assertion: "<xml/>",
      expectedAudience: "x",
      expectedDestination: "y",
      context: CONTEXT,
    });
    expect(result).toEqual({ ok: false, reason: "saml_metadata_missing" });
  });

  it("rejects an expired assertion", async () => {
    await setupMetadata();
    const assertion = makeSignedSamlAssertion({
      privateKey,
      email: "a@b.co",
      userId: "u1",
      issuer: "https://idp.example.com/entity",
      audience: "https://sp.example.com",
      destination: "https://sp.example.com/acs",
      notOnOrAfter: new Date(Date.now() - 60_000).toISOString(),
    });
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("saml_assertion_expired");
  });

  it("rejects an assertion with an invalid audience", async () => {
    await setupMetadata();
    const assertion = makeSignedSamlAssertion({
      privateKey,
      email: "a@b.co",
      userId: "u1",
      issuer: "https://idp.example.com/entity",
      audience: "https://attacker.example.com",
      destination: "https://sp.example.com/acs",
      notOnOrAfter: makeFutureExpiry(),
    });
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("saml_audience_invalid");
  });

  it("rejects when the issuer does not match the metadata entityID", async () => {
    await setupMetadata();
    const assertion = makeSignedSamlAssertion({
      privateKey,
      email: "a@b.co",
      userId: "u1",
      issuer: "https://attacker.example.com/entity",
      audience: "https://sp.example.com",
      destination: "https://sp.example.com/acs",
      notOnOrAfter: makeFutureExpiry(),
    });
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("saml_issuer_invalid");
  });

  it("rejects when the destination does not match the expected destination", async () => {
    await setupMetadata();
    const assertion = makeSignedSamlAssertion({
      privateKey,
      email: "a@b.co",
      userId: "u1",
      issuer: "https://idp.example.com/entity",
      audience: "https://sp.example.com",
      destination: "https://attacker.example.com/acs",
      notOnOrAfter: makeFutureExpiry(),
    });
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("saml_destination_invalid");
  });

  it("rejects when the assertion subject email is missing or invalid", async () => {
    await setupMetadata();
    const inner = `<Assertion>
  <Issuer>https://idp.example.com/entity</Issuer>
  <Audience>https://sp.example.com</Audience>
  <Conditions NotOnOrAfter="${makeFutureExpiry()}" Destination="https://sp.example.com/acs" Recipient="https://sp.example.com/acs"/>
  <Attribute email="not-an-email" userId="u1"/>
</Assertion>`;
    const signer = createSign("RSA-SHA256");
    signer.update(inner);
    signer.end();
    const signature = signer.sign(privateKey, "base64");
    const assertion = `<?xml version="1.0"?>
<Response>
  ${inner}
  <SignedPayload Algorithm="rsa-sha256">${Buffer.from(inner).toString("base64")}</SignedPayload>
  <SignatureValue>${signature}</SignatureValue>
</Response>`;
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("saml_subject_invalid");
  });

  it("rejects when the assertion has no expiry", async () => {
    await setupMetadata();
    const inner = `<Assertion>
  <Issuer>https://idp.example.com/entity</Issuer>
  <Subject>
    <NameID>a@b.co</NameID>
  </Subject>
  <Audience>https://sp.example.com</Audience>
  <Conditions Destination="https://sp.example.com/acs" Recipient="https://sp.example.com/acs"/>
  <Attribute email="a@b.co" userId="u1"/>
</Assertion>`;
    const signer = createSign("RSA-SHA256");
    signer.update(inner);
    signer.end();
    const signature = signer.sign(privateKey, "base64");
    const assertion = `<?xml version="1.0"?>
<Response>
  ${inner}
  <SignedPayload Algorithm="rsa-sha256">${Buffer.from(inner).toString("base64")}</SignedPayload>
  <SignatureValue>${signature}</SignatureValue>
</Response>`;
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("saml_assertion_expiry_missing");
  });

  it("rejects when the signature payload is missing", async () => {
    await setupMetadata();
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion: "<xml/>",
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("saml_signature_missing");
  });

  it("rejects an unsupported signature algorithm", async () => {
    await setupMetadata();
    const inner = `<Assertion>payload</Assertion>`;
    const assertion = `<?xml version="1.0"?>
<Response>
  ${inner}
  <SignedPayload Algorithm="hmac-sha256">${Buffer.from(inner).toString("base64")}</SignedPayload>
  <SignatureValue>deadbeef</SignatureValue>
</Response>`;
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.reason).toBe("saml_signature_algorithm_unsupported");
  });

  it("rejects when the signature does not verify", async () => {
    await setupMetadata();
    const inner = `<Assertion>
  <Issuer>https://idp.example.com/entity</Issuer>
  <Subject>
    <NameID>a@b.co</NameID>
  </Subject>
  <Audience>https://sp.example.com</Audience>
  <Conditions NotOnOrAfter="${makeFutureExpiry()}" Destination="https://sp.example.com/acs" Recipient="https://sp.example.com/acs"/>
  <Attribute email="a@b.co" userId="u1"/>
</Assertion>`;
    // Sign with a different key than the metadata cert.
    const otherKp = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const wrongKey = otherKp.privateKey
      .export({ type: "pkcs8", format: "pem" })
      .toString();
    const signer = createSign("RSA-SHA256");
    signer.update(inner);
    signer.end();
    const signature = signer.sign(wrongKey, "base64");
    const assertion = `<?xml version="1.0"?>
<Response>
  ${inner}
  <SignedPayload Algorithm="rsa-sha256">${Buffer.from(inner).toString("base64")}</SignedPayload>
  <SignatureValue>${signature}</SignatureValue>
</Response>`;
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("saml_signature_invalid");
  });
});

describe("createMagicLinkToken / redeemMagicLinkToken", () => {
  beforeEach(() => {
    resetAuthState();
  });

  it("creates a token that can be redeemed for a session", () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "User@Example.com",
      context: CONTEXT,
    });
    expect(token.token).toMatch(/^ml_/);
    expect(token.email).toBe("user@example.com");
    expect(token.usedAt).toBeNull();

    const result = redeemMagicLinkToken({
      token: token.token,
      context: CONTEXT,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.workspaceId).toBe("ws_1");
      expect(result.session.email).toBe("user@example.com");
    }
  });

  it("rejects a token that has already been used", () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "user@example.com",
      context: CONTEXT,
    });
    const first = redeemMagicLinkToken({
      token: token.token,
      context: CONTEXT,
    });
    expect(first.ok).toBe(true);
    const second = redeemMagicLinkToken({
      token: token.token,
      context: CONTEXT,
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe("magic_token_used");
  });

  it("rejects an unknown token", () => {
    const result = redeemMagicLinkToken({
      token: "ml_unknown",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("magic_token_not_found");
  });

  it("rejects an expired token", () => {
    const past = new Date(Date.now() - 60_000);
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "exp@example.com",
      context: CONTEXT,
      now: past,
    });
    // Manually backdate expiry to simulate expiration.
    token.expiresAt = new Date(past.getTime() - 1).toISOString();
    const result = redeemMagicLinkToken({
      token: token.token,
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("magic_token_expired");
  });
});

describe("authenticatePassword", () => {
  beforeEach(() => {
    resetAuthState();
  });

  it("authenticates a seeded user with the correct password", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "password",
      context: CONTEXT,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.userId).toBe("owner_1");
      expect(result.session.workspaceId).toBe("ws_1");
    }
  });

  it("rejects an unknown user or wrong password", () => {
    const wrong = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "nope",
      context: CONTEXT,
    });
    expect(wrong.ok).toBe(false);
    if (!wrong.ok) expect(wrong.reason).toBe("password_invalid");

    const missing = authenticatePassword({
      workspaceId: "ws_1",
      userId: "ghost",
      password: "password",
      context: CONTEXT,
    });
    expect(missing.ok).toBe(false);
  });
});

describe("listActiveSessions / getActiveSession / revokeSession", () => {
  beforeEach(() => {
    resetAuthState();
  });

  it("lists active sessions for a workspace and not other workspaces", () => {
    authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "password",
      context: CONTEXT,
    });
    authenticatePassword({
      workspaceId: "ws_1",
      userId: "user_1",
      password: "password",
      context: CONTEXT,
    });
    expect(listActiveSessions("ws_1")).toHaveLength(2);
    expect(listActiveSessions("ws_other")).toHaveLength(0);
  });

  it("getActiveSession refreshes lastSeenAt and returns null for revoked/missing", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "password",
      context: CONTEXT,
    });
    if (!result.ok) throw new Error("expected login");
    expect(getActiveSession(result.session.id)).not.toBeNull();
    expect(getActiveSession(null)).toBeNull();
    expect(getActiveSession("sess_does_not_exist")).toBeNull();

    const revoked = revokeSession({
      workspaceId: "ws_1",
      sessionId: result.session.id,
      actorUserId: "owner_1",
    });
    expect(revoked).toBe(true);
    expect(getActiveSession(result.session.id)).toBeNull();
  });

  it("revokeSession returns false when the actor is not an owner", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "password",
      context: CONTEXT,
    });
    if (!result.ok) throw new Error("expected login");
    const revoked = revokeSession({
      workspaceId: "ws_1",
      sessionId: result.session.id,
      actorUserId: "user_1",
    });
    expect(revoked).toBe(false);
  });

  it("revokeSession returns false for a session in a different workspace", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "password",
      context: CONTEXT,
    });
    if (!result.ok) throw new Error("expected login");
    const revoked = revokeSession({
      workspaceId: "ws_other",
      sessionId: result.session.id,
      actorUserId: "owner_1",
    });
    expect(revoked).toBe(false);
  });

  it("revokeSession returns false for a non-existent session", () => {
    const revoked = revokeSession({
      workspaceId: "ws_1",
      sessionId: "sess_does_not_exist",
      actorUserId: "owner_1",
    });
    expect(revoked).toBe(false);
  });
});

describe("listWorkspaceUsers / isWorkspaceOwner", () => {
  beforeEach(() => {
    resetAuthState();
  });

  it("lists seeded users in ws_1", () => {
    const users = listWorkspaceUsers("ws_1");
    const uniqueIds = [...new Set(users.map((u) => u.userId))].sort();
    expect(uniqueIds).toEqual(["owner_1", "user_1"]);
  });

  it("isWorkspaceOwner returns true for owners and false for members", () => {
    expect(isWorkspaceOwner("ws_1", "owner_1")).toBe(true);
    expect(isWorkspaceOwner("ws_1", "user_1")).toBe(false);
    expect(isWorkspaceOwner("ws_1", null)).toBe(false);
    expect(isWorkspaceOwner("ws_1", "missing")).toBe(false);
  });
});

describe("resetAuthState", () => {
  it("clears events, sessions, tokens, and metadata but reseeds users", () => {
    recordAuthEvent({ kind: "fail", context: CONTEXT });
    expect(listAuthEvents()).toHaveLength(1);

    resetAuthState();

    expect(listAuthEvents()).toHaveLength(0);
    expect(listActiveSessions("ws_1")).toHaveLength(0);
    expect(getSamlMetadata("ws_1")).toBeNull();
    // Seeded users are restored.
    expect(
      [...new Set(listWorkspaceUsers("ws_1").map((u) => u.userId))].sort(),
    ).toEqual(["owner_1", "user_1"]);
  });
});

describe("edge cases", () => {
  beforeEach(() => {
    resetAuthState();
  });

  it("contextFromRequest returns nulls for an empty header map", () => {
    expect(contextFromRequest(makeRequest({}))).toEqual({
      ip: null,
      userAgent: null,
    });
  });

  it("contextFromRequest returns null ip for an x-forwarded-for of only commas", () => {
    const request = makeRequest({ "x-forwarded-for": ",, ,," });
    const result = contextFromRequest(request);
    expect(result.ip === null || result.ip === "").toBe(true);
    expect(result.userAgent).toBeNull();
  });

  it("contextFromRequest trims trailing whitespace in the first x-forwarded-for hop", () => {
    const request = makeRequest({ "x-forwarded-for": "  203.0.113.5  " });
    expect(contextFromRequest(request).ip).toBe("203.0.113.5");
  });

  it("contextFromRequest falls back to x-real-ip when x-forwarded-for is whitespace", () => {
    const request = makeRequest({
      "x-forwarded-for": "   ",
      "x-real-ip": "10.0.0.1",
    });
    expect(contextFromRequest(request).ip).toBe("10.0.0.1");
  });

  it("recordAuthEvent accepts null context fields", () => {
    const event = recordAuthEvent({
      workspaceId: null,
      userId: null,
      kind: "fail",
      reason: null,
      context: { ip: null, userAgent: null },
    });
    expect(event.ip).toBeNull();
    expect(event.user_agent).toBeNull();
    expect(event.workspace_id).toBeNull();
    expect(event.user_id).toBeNull();
    expect(event.reason).toBeNull();
  });

  it("getActiveSession returns null for an empty string id", () => {
    expect(getActiveSession("")).toBeNull();
  });

  it("getActiveSession returns null after the session has been revoked", () => {
    const login = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "password",
      context: CONTEXT,
    });
    if (!login.ok) throw new Error("expected login");

    expect(getActiveSession(login.session.id)).not.toBeNull();
    revokeSession({
      workspaceId: "ws_1",
      sessionId: login.session.id,
      actorUserId: "owner_1",
    });
    expect(getActiveSession(login.session.id)).toBeNull();
  });

  it("getActiveSession bumps lastSeenAt on every call", async () => {
    const login = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "password",
      context: CONTEXT,
    });
    if (!login.ok) throw new Error("expected login");

    const first = getActiveSession(login.session.id);
    if (!first) throw new Error("expected session");

    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = getActiveSession(login.session.id);
    if (!second) throw new Error("expected session");

    expect(new Date(second.lastSeenAt).getTime()).toBeGreaterThanOrEqual(
      new Date(first.lastSeenAt).getTime(),
    );
  });

  it("redeemMagicLinkToken rejects an empty string token", () => {
    const result = redeemMagicLinkToken({ token: "", context: CONTEXT });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("magic_token_not_found");
  });

  it("createMagicLinkToken normalizes the email before storing it", () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "  MixedCase@Example.COM  ",
      context: CONTEXT,
    });
    expect(token.email).toBe("mixedcase@example.com");
  });

  it("createMagicLinkToken provisions a user when the email is new", () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_new",
      email: "brand-new@example.com",
      context: CONTEXT,
    });
    expect(token.userId).toMatch(/^usr_/);
    // Users are stored under both id-key and email-key, so listWorkspaceUsers
    // returns duplicates — de-duplicate by userId before asserting.
    const users = listWorkspaceUsers("ws_new");
    const uniqueIds = [...new Set(users.map((u) => u.userId))];
    expect(uniqueIds).toHaveLength(1);
    expect(uniqueIds[0]).toBe(token.userId);
  });

  it("createMagicLinkToken reuses an existing user by email", () => {
    const first = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "reuse@example.com",
      context: CONTEXT,
    });
    const second = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "REUSE@example.com",
      context: CONTEXT,
    });
    expect(first.userId).toBe(second.userId);
  });

  it("authenticatePassword rejects an empty password", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("password_invalid");
  });

  it("authenticatePassword rejects an empty userId", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "",
      password: "password",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
  });

  it("revokeSession returns false when the actorUserId is unknown", () => {
    const login = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "password",
      context: CONTEXT,
    });
    if (!login.ok) throw new Error("expected login");
    expect(
      revokeSession({
        workspaceId: "ws_1",
        sessionId: login.session.id,
        actorUserId: "ghost",
      }),
    ).toBe(false);
  });

  it("listWorkspaceUsers returns an empty array for an unknown workspace", () => {
    expect(listWorkspaceUsers("ws_does_not_exist")).toEqual([]);
  });

  it("listActiveSessions returns an empty array when no sessions exist", () => {
    expect(listActiveSessions("ws_1")).toEqual([]);
    expect(listActiveSessions("ws_other")).toEqual([]);
  });

  it("listAuthEvents returns an empty array after resetAuthState", () => {
    recordAuthEvent({ kind: "fail", context: CONTEXT });
    expect(listAuthEvents()).toHaveLength(1);
    resetAuthState();
    expect(listAuthEvents()).toEqual([]);
  });

  it("listAuthEvents returns a snapshot copy that does not mutate internal state", () => {
    recordAuthEvent({ kind: "fail", context: CONTEXT });
    const snapshot = listAuthEvents();
    snapshot.pop();
    expect(listAuthEvents()).toHaveLength(1);
  });

  it("isWorkspaceOwner returns false for an empty userId string", () => {
    expect(isWorkspaceOwner("ws_1", "")).toBe(false);
  });

  it("isWorkspaceOwner returns false for a user in a different workspace", () => {
    expect(isWorkspaceOwner("ws_other", "owner_1")).toBe(false);
  });

  it("saveSamlMetadata rejects an empty xml string", async () => {
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1", xml: "" }),
    ).rejects.toMatchObject({ code: "saml_metadata_invalid" });
  });

  it("saveSamlMetadata rejects xml with no angle brackets", async () => {
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1", xml: "plain text" }),
    ).rejects.toMatchObject({ code: "saml_metadata_invalid" });
  });

  it("saveSamlMetadata rejects a metadataUrl that returns an empty body", async () => {
    await expect(
      saveSamlMetadata({
        workspaceId: "ws_1",
        metadataUrl: "https://idp.example.com/metadata",
        fetcher: async () => new Response("", { status: 200 }),
      }),
    ).rejects.toMatchObject({ code: "saml_metadata_invalid" });
  });

  it("saveSamlMetadata rejects an empty workspaceId", async () => {
    const { generateKeyPairSync } = await import("node:crypto");
    const kp = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const cert = kp.publicKey
      .export({ type: "spki", format: "pem" })
      .toString();
    const xml = makeSamlMetadataXml(cert);
    // saveSamlMetadata does not validate workspaceId format — it stores under
    // the provided key. Ensure an empty key still produces a stored record.
    const meta = await saveSamlMetadata({ workspaceId: "", xml });
    expect(meta.workspaceId).toBe("");
    expect(getSamlMetadata("")?.entityId).toBe(meta.entityId);
  });

  it("getSamlMetadata returns null for a workspace that was never configured", () => {
    expect(getSamlMetadata("ws_never_set")).toBeNull();
  });

  it("saveSamlMetadata can store metadata under multiple distinct workspaces", async () => {
    const { generateKeyPairSync } = await import("node:crypto");
    const kp1 = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const cert1 = kp1.publicKey
      .export({ type: "spki", format: "pem" })
      .toString();
    const kp2 = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const cert2 = kp2.publicKey
      .export({ type: "spki", format: "pem" })
      .toString();

    await saveSamlMetadata({
      workspaceId: "ws_a",
      xml: makeSamlMetadataXml(cert1, "https://a.example.com/entity"),
    });
    await saveSamlMetadata({
      workspaceId: "ws_b",
      xml: makeSamlMetadataXml(cert2, "https://b.example.com/entity"),
    });

    expect(getSamlMetadata("ws_a")?.entityId).toBe(
      "https://a.example.com/entity",
    );
    expect(getSamlMetadata("ws_b")?.entityId).toBe(
      "https://b.example.com/entity",
    );
  });

  it("authenticateSaml rejects when metadata is missing and records a fail event", () => {
    const result = authenticateSaml({
      workspaceId: "ws_no_metadata",
      assertion: "<x/>",
      expectedAudience: "x",
      expectedDestination: "y",
      context: CONTEXT,
    });
    expect(result).toEqual({ ok: false, reason: "saml_metadata_missing" });
    const events = listAuthEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.kind).toBe("fail");
    expect(events[0]!.reason).toBe("saml_metadata_missing");
  });

  it("redeemMagicLinkToken records a fail event for unknown tokens", () => {
    const result = redeemMagicLinkToken({
      token: "ml_ghost",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    const events = listAuthEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.kind).toBe("fail");
    expect(events[0]!.reason).toBe("magic_token_not_found");
  });

  it("redeemMagicLinkToken records a fail event for expired tokens", () => {
    const past = new Date(Date.now() - 60_000);
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "exp@example.com",
      context: CONTEXT,
      now: past,
    });
    token.expiresAt = new Date(past.getTime() - 1).toISOString();
    const result = redeemMagicLinkToken({
      token: token.token,
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    const events = listAuthEvents();
    expect(events.some((e) => e.reason === "magic_token_expired")).toBe(true);
  });

  it("redeemMagicLinkToken records a fail event for already-used tokens", () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "u@e.co",
      context: CONTEXT,
    });
    redeemMagicLinkToken({ token: token.token, context: CONTEXT });
    const second = redeemMagicLinkToken({
      token: token.token,
      context: CONTEXT,
    });
    expect(second.ok).toBe(false);
    const events = listAuthEvents();
    expect(events.some((e) => e.reason === "magic_token_used")).toBe(true);
  });

  it("redeemMagicLinkToken boundary: token expires exactly at now is rejected", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "boundary@example.com",
      context: CONTEXT,
      now,
    });
    token.expiresAt = now.toISOString();
    const result = redeemMagicLinkToken({
      token: token.token,
      context: CONTEXT,
      now,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("magic_token_expired");
  });

  it("authenticateSaml accepts a base64-encoded (non-XML) assertion string", async () => {
    const { generateKeyPairSync } = await import("node:crypto");
    const kp = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const cert = kp.publicKey
      .export({ type: "spki", format: "pem" })
      .toString();
    const privateKey = kp.privateKey
      .export({ type: "pkcs8", format: "pem" })
      .toString();
    await saveSamlMetadata({
      workspaceId: "ws_1",
      xml: makeSamlMetadataXml(cert),
    });

    const inner = `<Assertion>
  <Issuer>https://idp.example.com/entity</Issuer>
  <Subject>
    <NameID>b64@example.com</NameID>
  </Subject>
  <Audience>https://sp.example.com</Audience>
  <Conditions NotOnOrAfter="${new Date(Date.now() + 60_000).toISOString()}" Destination="https://sp.example.com/acs" Recipient="https://sp.example.com/acs"/>
  <Attribute email="b64@example.com" userId="b64-1"/>
</Assertion>`;
    const { createSign } = await import("node:crypto");
    const signer = createSign("RSA-SHA256");
    signer.update(inner);
    signer.end();
    const signature = signer.sign(privateKey, "base64");
    const xml = `<?xml version="1.0"?>
<Response>
  ${inner}
  <SignedPayload Algorithm="rsa-sha256">${Buffer.from(inner).toString("base64")}</SignedPayload>
  <SignatureValue>${signature}</SignatureValue>
</Response>`;

    const base64Assertion = Buffer.from(xml).toString("base64");
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion: base64Assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(true);
  });

  it("getUser returns null for an unknown user", () => {
    expect(getUser("ws_1", "unknown_user")).toBeNull();
    expect(getUser("ws_unknown", "owner_1")).toBeNull();
  });

  it("getUser returns the user record for a known user", () => {
    const user = getUser("ws_1", "owner_1");
    expect(user).not.toBeNull();
    expect(user?.role).toBe("owner");
    expect(user?.email).toBe("owner@example.com");
  });
});
