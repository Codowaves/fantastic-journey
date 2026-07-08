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

describe("error path fallbacks (batch2)", () => {
  beforeEach(() => {
    resetAuthState();
  });

  it("contextFromRequest returns null ip/ua when no headers are present", () => {
    const request = makeRequest({});
    expect(contextFromRequest(request)).toEqual({ ip: null, userAgent: null });
  });

  it("contextFromRequest treats empty string headers as absent", () => {
    const request = makeRequest({
      "x-forwarded-for": "",
      "x-real-ip": "",
      "user-agent": "",
    });
    expect(contextFromRequest(request)).toEqual({ ip: null, userAgent: null });
  });

  it("authenticateSaml records a fail event when metadata is missing", () => {
    const result = authenticateSaml({
      workspaceId: "ws_unknown",
      assertion: "<xml/>",
      expectedAudience: "x",
      expectedDestination: "y",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    const events = listAuthEvents();
    expect(events).toHaveLength(1);
    const ev = events[0]!;
    expect(ev.kind).toBe("fail");
    expect(ev.reason).toBe("saml_metadata_missing");
    expect(ev.workspace_id).toBe("ws_unknown");
  });

  it("authenticateSaml records an issuer mismatch fail event with parsed userId", async () => {
    const kp = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const cert = kp.publicKey
      .export({ type: "spki", format: "pem" })
      .toString();
    const privateKey = kp.privateKey
      .export({ type: "pkcs8", format: "pem" })
      .toString();
    const xml = makeSamlMetadataXml(cert);
    await saveSamlMetadata({ workspaceId: "ws_1", xml });
    const assertion = makeSignedSamlAssertion({
      privateKey,
      email: "a@b.co",
      userId: "u1",
      issuer: "https://attacker.example.com/entity",
      audience: "https://sp.example.com",
      destination: "https://sp.example.com/acs",
      notOnOrAfter: new Date(Date.now() + 60_000).toISOString(),
    });
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion,
      expectedAudience: "https://sp.example.com",
      expectedDestination: "https://sp.example.com/acs",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    const events = listAuthEvents();
    expect(events).toHaveLength(1);
    const ev = events[0]!;
    expect(ev.kind).toBe("fail");
    expect(ev.reason).toBe("saml_issuer_invalid");
    expect(ev.user_id).toBe("u1");
  });

  it("authenticateSaml records a signature invalid fail event", async () => {
    const kp = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const cert = kp.publicKey
      .export({ type: "spki", format: "pem" })
      .toString();
    const xml = makeSamlMetadataXml(cert);
    await saveSamlMetadata({ workspaceId: "ws_1", xml });
    const otherKp = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const wrongKey = otherKp.privateKey
      .export({ type: "pkcs8", format: "pem" })
      .toString();
    const inner = `<Assertion>
  <Issuer>https://idp.example.com/entity</Issuer>
  <Subject><NameID>a@b.co</NameID></Subject>
  <Audience>https://sp.example.com</Audience>
  <Conditions NotOnOrAfter="${new Date(Date.now() + 60_000).toISOString()}" Destination="https://sp.example.com/acs" Recipient="https://sp.example.com/acs"/>
  <Attribute email="a@b.co" userId="u1"/>
</Assertion>`;
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
    const events = listAuthEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.reason).toBe("saml_signature_invalid");
  });

  it("redeemMagicLinkToken records a fail event for an unknown token", () => {
    const result = redeemMagicLinkToken({
      token: "ml_unknown",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    const events = listAuthEvents();
    expect(events).toHaveLength(1);
    const event = events[0]!;
    expect(event.kind).toBe("fail");
    expect(event.reason).toBe("magic_token_not_found");
    expect(event.workspace_id).toBeNull();
    expect(event.user_id).toBeNull();
  });

  it("redeemMagicLinkToken records a fail event for an already-used token", () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "user@example.com",
      context: CONTEXT,
    });
    redeemMagicLinkToken({ token: token.token, context: CONTEXT });

    const second = redeemMagicLinkToken({
      token: token.token,
      context: CONTEXT,
    });
    expect(second.ok).toBe(false);
    const failEvents = listAuthEvents().filter(
      (e) => e.reason === "magic_token_used",
    );
    expect(failEvents).toHaveLength(1);
    const failEvent = failEvents[0]!;
    expect(failEvent.kind).toBe("fail");
    expect(failEvent.workspace_id).toBe("ws_1");
  });

  it("redeemMagicLinkToken records a fail event for an expired token", () => {
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
    const failEvents = listAuthEvents().filter(
      (e) => e.reason === "magic_token_expired",
    );
    expect(failEvents).toHaveLength(1);
  });

  it("authenticatePassword records a fail event on invalid credentials", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "owner_1",
      password: "wrong",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    const events = listAuthEvents();
    expect(events).toHaveLength(1);
    const ev = events[0]!;
    expect(ev.kind).toBe("fail");
    expect(ev.reason).toBe("password_invalid");
    expect(ev.user_id).toBe("owner_1");
  });

  it("authenticatePassword records a fail event for unknown user", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "ghost",
      password: "password",
      context: CONTEXT,
    });
    expect(result.ok).toBe(false);
    const events = listAuthEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.reason).toBe("password_invalid");
  });

  it("revokeSession returns false when the actor does not exist", () => {
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
      actorUserId: "missing_actor",
    });
    expect(revoked).toBe(false);
    // Session should remain unrevoked.
    expect(getActiveSession(result.session.id)).not.toBeNull();
  });

  it("saveSamlMetadata throws saml_metadata_invalid when fetched body is not XML", async () => {
    await expect(
      saveSamlMetadata({
        workspaceId: "ws_1",
        metadataUrl: "https://idp.example.com/metadata",
        fetcher: async () => new Response("not xml at all", { status: 200 }),
      }),
    ).rejects.toMatchObject({ code: "saml_metadata_invalid" });
  });
});
