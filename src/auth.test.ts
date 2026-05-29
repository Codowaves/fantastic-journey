import { createSign, generateKeyPairSync } from "node:crypto";

import { beforeEach, describe, expect, it } from "vitest";

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
} from "./auth";

const ENTITY_ID = "https://idp.example.com/entity";
const AUDIENCE = "https://sp.example.com";
const DESTINATION = "https://sp.example.com/acs";
const FUTURE = "2999-01-01T00:00:00.000Z";
const HTTP_POST_BINDING = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";

const context = { ip: "203.0.113.7", userAgent: "vitest-agent" };

// A real RSA keypair so authenticateSaml's signature check exercises live crypto.
const signingKeyPair = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// A second, unrelated key used to forge an assertion the metadata cert rejects.
const wrongKeyPair = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

function buildMetadataXml(
  overrides: {
    entityId?: string | null;
    certificate?: string | null;
    binding?: string;
  } = {},
): string {
  const entityAttr =
    overrides.entityId === null
      ? ""
      : ` entityID="${overrides.entityId ?? ENTITY_ID}"`;
  const binding = overrides.binding ?? HTTP_POST_BINDING;
  const cert =
    overrides.certificate === null
      ? ""
      : `<X509Certificate>${overrides.certificate ?? signingKeyPair.publicKey}</X509Certificate>`;
  return `<EntityDescriptor${entityAttr}><IDPSSODescriptor><SingleSignOnService Binding="${binding}" Location="https://idp.example.com/sso"/>${cert}</IDPSSODescriptor></EntityDescriptor>`;
}

function buildSignedAssertion(
  options: {
    privateKey?: string;
    issuer?: string;
    audience?: string;
    destination?: string;
    email?: string | null;
    notOnOrAfter?: string | null;
    algorithm?: string;
  } = {},
): string {
  const issuer = options.issuer ?? ENTITY_ID;
  const audience = options.audience ?? AUDIENCE;
  const destination = options.destination ?? DESTINATION;
  const notOnOrAfter =
    options.notOnOrAfter === null ? null : (options.notOnOrAfter ?? FUTURE);
  const email =
    options.email === null ? null : (options.email ?? "user@example.com");

  const attrs = [`Destination="${destination}"`];
  if (notOnOrAfter) attrs.push(`NotOnOrAfter="${notOnOrAfter}"`);
  const nameId = email ? `<NameID>${email}</NameID>` : "";
  const innerXml = `<Assertion ${attrs.join(" ")}><Issuer>${issuer}</Issuer><Audience>${audience}</Audience>${nameId}</Assertion>`;

  const signer = createSign("RSA-SHA256");
  signer.update(innerXml);
  signer.end();
  const signature = signer.sign(
    options.privateKey ?? signingKeyPair.privateKey,
    "base64",
  );
  const payload = Buffer.from(innerXml, "utf8").toString("base64");
  const algorithm = options.algorithm ?? "rsa-sha256";
  return `<SamlResponse Algorithm="${algorithm}"><SignedPayload>${payload}</SignedPayload><SignatureValue>${signature}</SignatureValue></SamlResponse>`;
}

async function saveDefaultMetadata(): Promise<void> {
  await saveSamlMetadata({ workspaceId: "ws_1", xml: buildMetadataXml() });
}

beforeEach(() => {
  // Reset all in-module state between cases so nothing leaks across tests.
  resetAuthState();
});

describe("listWorkspaceUsers", () => {
  it("returns the seeded users for a workspace", () => {
    const users = listWorkspaceUsers("ws_1");
    expect(users.some((u) => u.userId === "owner_1")).toBe(true);
    expect(users.some((u) => u.userId === "user_1")).toBe(true);
    expect(users.every((u) => u.workspaceId === "ws_1")).toBe(true);
  });

  it("returns an empty list for an unknown workspace", () => {
    expect(listWorkspaceUsers("ws_unknown")).toEqual([]);
  });
});

describe("getUser", () => {
  it("returns the seeded owner with its role", () => {
    expect(getUser("ws_1", "owner_1")?.role).toBe("owner");
  });

  it("returns null for an unknown user", () => {
    expect(getUser("ws_1", "ghost")).toBeNull();
  });
});

describe("contextFromRequest", () => {
  it("extracts the first forwarded ip and the user agent", () => {
    const request = new Request("https://app.example.com", {
      headers: {
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
        "user-agent": "Mozilla/5.0",
      },
    });
    expect(contextFromRequest(request)).toEqual({
      ip: "1.2.3.4",
      userAgent: "Mozilla/5.0",
    });
  });

  it("falls back to x-real-ip and yields nulls when headers are absent", () => {
    const withRealIp = new Request("https://app.example.com", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(contextFromRequest(withRealIp).ip).toBe("9.9.9.9");

    const bare = new Request("https://app.example.com");
    expect(contextFromRequest(bare)).toEqual({ ip: null, userAgent: null });
  });
});

describe("recordAuthEvent", () => {
  it("returns a populated event and stores it", () => {
    const event = recordAuthEvent({
      workspaceId: "ws_1",
      userId: "user_1",
      kind: "password",
      reason: "password_login",
      context,
    });
    expect(event.id).toMatch(/^evt_/);
    expect(event.kind).toBe("password");
    expect(event.ip).toBe(context.ip);
    expect(listAuthEvents()).toHaveLength(1);
  });

  it("defaults workspace, user, and reason to null when omitted", () => {
    const event = recordAuthEvent({ kind: "fail", context });
    expect(event.workspace_id).toBeNull();
    expect(event.user_id).toBeNull();
    expect(event.reason).toBeNull();
  });
});

describe("listAuthEvents", () => {
  it("is empty after a reset", () => {
    expect(listAuthEvents()).toEqual([]);
  });

  it("reflects recorded events as an independent copy", () => {
    recordAuthEvent({ kind: "fail", context });
    const events = listAuthEvents();
    expect(events).toHaveLength(1);
    events.length = 0;
    expect(listAuthEvents()).toHaveLength(1);
  });
});

describe("getSamlMetadata", () => {
  it("returns saved metadata for the workspace", async () => {
    await saveDefaultMetadata();
    expect(getSamlMetadata("ws_1")?.entityId).toBe(ENTITY_ID);
  });

  it("returns null when no metadata is stored", () => {
    expect(getSamlMetadata("ws_none")).toBeNull();
  });
});

describe("saveSamlMetadata", () => {
  it("parses uploaded XML into structured metadata", async () => {
    const metadata = await saveSamlMetadata({
      workspaceId: "ws_1",
      xml: buildMetadataXml(),
    });
    expect(metadata.source).toBe("upload");
    expect(metadata.entityId).toBe(ENTITY_ID);
    expect(metadata.binding).toBe(HTTP_POST_BINDING);
    expect(metadata.signingCertificate).toContain("BEGIN PUBLIC KEY");
  });

  it("fetches metadata from a url using the injected fetcher", async () => {
    const fetcher = (async () =>
      new Response(buildMetadataXml(), { status: 200 })) as typeof fetch;
    const metadata = await saveSamlMetadata({
      workspaceId: "ws_1",
      metadataUrl: "https://idp.example.com/metadata",
      fetcher,
    });
    expect(metadata.source).toBe("url");
    expect(metadata.entityId).toBe(ENTITY_ID);
  });

  it("rejects a failed metadata fetch", async () => {
    const fetcher = (async () =>
      new Response("nope", { status: 500 })) as typeof fetch;
    await expect(
      saveSamlMetadata({
        workspaceId: "ws_1",
        metadataUrl: "https://idp.example.com/metadata",
        fetcher,
      }),
    ).rejects.toThrow(/metadata fetch failed/);
  });

  it("rejects XML that is not valid markup", async () => {
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1", xml: "not xml" }),
    ).rejects.toThrow(/valid SAML metadata XML/);
  });

  it("rejects metadata without an entityID or certificate", async () => {
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1", xml: buildMetadataXml({ entityId: null }) }),
    ).rejects.toThrow(/entityID and signing certificate/);
    await expect(
      saveSamlMetadata({
        workspaceId: "ws_1",
        xml: buildMetadataXml({ certificate: null }),
      }),
    ).rejects.toThrow(/entityID and signing certificate/);
  });

  it("rejects metadata that does not use the HTTP-POST binding", async () => {
    await expect(
      saveSamlMetadata({
        workspaceId: "ws_1",
        xml: buildMetadataXml({ binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" }),
      }),
    ).rejects.toThrow(/HTTP-POST binding/);
  });
});

describe("authenticateSaml", () => {
  it("creates a session for a valid signed assertion", async () => {
    await saveDefaultMetadata();
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion: buildSignedAssertion(),
      expectedAudience: AUDIENCE,
      expectedDestination: DESTINATION,
      context,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reason);
    expect(result.session.email).toBe("user@example.com");
    expect(listAuthEvents().some((e) => e.kind === "sso")).toBe(true);
  });

  it("fails and records an event when metadata is missing", () => {
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion: buildSignedAssertion(),
      expectedAudience: AUDIENCE,
      expectedDestination: DESTINATION,
      context,
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.reason).toBe("saml_metadata_missing");
    expect(listAuthEvents().some((e) => e.kind === "fail")).toBe(true);
  });

  it("rejects an assertion signed by the wrong key", async () => {
    await saveDefaultMetadata();
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion: buildSignedAssertion({ privateKey: wrongKeyPair.privateKey }),
      expectedAudience: AUDIENCE,
      expectedDestination: DESTINATION,
      context,
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.reason).toBe("saml_signature_invalid");
  });

  it("rejects an unsupported signature algorithm", async () => {
    await saveDefaultMetadata();
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion: buildSignedAssertion({ algorithm: "rsa-sha1" }),
      expectedAudience: AUDIENCE,
      expectedDestination: DESTINATION,
      context,
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.reason).toBe("saml_signature_algorithm_unsupported");
  });

  it("rejects an expired assertion", async () => {
    await saveDefaultMetadata();
    const result = authenticateSaml({
      workspaceId: "ws_1",
      assertion: buildSignedAssertion({
        notOnOrAfter: "2000-01-01T00:00:00.000Z",
      }),
      expectedAudience: AUDIENCE,
      expectedDestination: DESTINATION,
      context,
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.reason).toBe("saml_assertion_expired");
  });
});

describe("createMagicLinkToken", () => {
  it("issues a token that expires fifteen minutes later", () => {
    const now = new Date("2024-01-01T00:00:00.000Z");
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "user@example.com",
      context,
      now,
    });
    expect(token.token).toMatch(/^ml_/);
    expect(token.createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(token.expiresAt).toBe("2024-01-01T00:15:00.000Z");
    expect(token.usedAt).toBeNull();
    expect(listAuthEvents().some((e) => e.reason === "magic_link_requested")).toBe(
      true,
    );
  });

  it("normalizes the email of the resolved user", () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "  USER@Example.COM ",
      context,
    });
    expect(token.email).toBe("user@example.com");
    expect(token.userId).toBe("user_1");
  });
});

describe("redeemMagicLinkToken", () => {
  it("redeems a fresh token into a session and marks it used", () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "user@example.com",
      context,
    });
    const result = redeemMagicLinkToken({ token: token.token, context });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reason);
    expect(result.session.workspaceId).toBe("ws_1");
  });

  it("fails for an unknown token", () => {
    const result = redeemMagicLinkToken({ token: "ml_missing", context });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.reason).toBe("magic_token_not_found");
  });

  it("fails when the token was already used", () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "user@example.com",
      context,
    });
    redeemMagicLinkToken({ token: token.token, context });
    const second = redeemMagicLinkToken({ token: token.token, context });
    expect(second.ok).toBe(false);
    if (second.ok) throw new Error("expected failure");
    expect(second.reason).toBe("magic_token_used");
  });

  it("fails when the token has expired", () => {
    const now = new Date("2024-01-01T00:00:00.000Z");
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "user@example.com",
      context,
      now,
    });
    const result = redeemMagicLinkToken({
      token: token.token,
      context,
      now: new Date("2024-01-01T00:16:00.000Z"),
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.reason).toBe("magic_token_expired");
  });
});

describe("authenticatePassword", () => {
  it("creates a session for the seeded credentials", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "user_1",
      password: "password",
      context,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reason);
    expect(result.session.email).toBe("user@example.com");
  });

  it("fails for a wrong password or unknown user", () => {
    const wrong = authenticatePassword({
      workspaceId: "ws_1",
      userId: "user_1",
      password: "nope",
      context,
    });
    expect(wrong.ok).toBe(false);
    if (wrong.ok) throw new Error("expected failure");
    expect(wrong.reason).toBe("password_invalid");

    const unknown = authenticatePassword({
      workspaceId: "ws_1",
      userId: "ghost",
      password: "password",
      context,
    });
    expect(unknown.ok).toBe(false);
  });
});

describe("listActiveSessions", () => {
  it("lists sessions created in the workspace", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "user_1",
      password: "password",
      context,
    });
    if (!result.ok) throw new Error(result.reason);
    const active = listActiveSessions("ws_1");
    expect(active.some((s) => s.id === result.session.id)).toBe(true);
  });

  it("returns an empty list for a workspace with no sessions", () => {
    expect(listActiveSessions("ws_empty")).toEqual([]);
  });
});

describe("getActiveSession", () => {
  it("returns the session for a live id", () => {
    const result = authenticatePassword({
      workspaceId: "ws_1",
      userId: "user_1",
      password: "password",
      context,
    });
    if (!result.ok) throw new Error(result.reason);
    expect(getActiveSession(result.session.id)?.id).toBe(result.session.id);
  });

  it("returns null for a null or unknown id", () => {
    expect(getActiveSession(null)).toBeNull();
    expect(getActiveSession("sess_missing")).toBeNull();
  });
});

describe("revokeSession", () => {
  it("lets an owner revoke a session", () => {
    const login = authenticatePassword({
      workspaceId: "ws_1",
      userId: "user_1",
      password: "password",
      context,
    });
    if (!login.ok) throw new Error(login.reason);
    const revoked = revokeSession({
      workspaceId: "ws_1",
      sessionId: login.session.id,
      actorUserId: "owner_1",
    });
    expect(revoked).toBe(true);
    expect(getActiveSession(login.session.id)).toBeNull();
  });

  it("refuses a non-owner actor and an unknown session", () => {
    const login = authenticatePassword({
      workspaceId: "ws_1",
      userId: "user_1",
      password: "password",
      context,
    });
    if (!login.ok) throw new Error(login.reason);
    expect(
      revokeSession({
        workspaceId: "ws_1",
        sessionId: login.session.id,
        actorUserId: "user_1",
      }),
    ).toBe(false);
    expect(
      revokeSession({
        workspaceId: "ws_1",
        sessionId: "sess_missing",
        actorUserId: "owner_1",
      }),
    ).toBe(false);
  });
});

describe("isWorkspaceOwner", () => {
  it("is true for the workspace owner", () => {
    expect(isWorkspaceOwner("ws_1", "owner_1")).toBe(true);
  });

  it("is false for a member or a null user", () => {
    expect(isWorkspaceOwner("ws_1", "user_1")).toBe(false);
    expect(isWorkspaceOwner("ws_1", null)).toBe(false);
  });
});

describe("resetAuthState", () => {
  it("clears events, sessions, and metadata while reseeding users", async () => {
    await saveDefaultMetadata();
    authenticatePassword({
      workspaceId: "ws_1",
      userId: "user_1",
      password: "password",
      context,
    });
    expect(listAuthEvents().length).toBeGreaterThan(0);
    expect(listActiveSessions("ws_1").length).toBeGreaterThan(0);

    resetAuthState();

    expect(listAuthEvents()).toEqual([]);
    expect(listActiveSessions("ws_1")).toEqual([]);
    expect(getSamlMetadata("ws_1")).toBeNull();
    expect(getUser("ws_1", "owner_1")?.role).toBe("owner");
  });
});
