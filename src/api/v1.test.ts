import { createSign, generateKeyPairSync } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMagicLinkToken,
  listActiveSessions,
  listAuthEvents,
  resetAuthState,
} from "../auth";
import { listSentEmails, resetSentEmails } from "../email";
import { handleRequest } from "./v1";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const samlKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const samlPublicKey = samlKeys.publicKey.export({
  type: "spki",
  format: "pem",
});

function samlMetadataXml(): string {
  return `<EntityDescriptor entityID="okta-test"><KeyDescriptor use="signing"><KeyInfo><X509Data><X509Certificate>${samlPublicKey}</X509Certificate></X509Data></KeyInfo></KeyDescriptor><SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://okta.example/sso"/></EntityDescriptor>`;
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

describe("api v1 route handler", () => {
  beforeEach(() => {
    resetAuthState();
    resetSentEmails();
  });

  it("returns healthy JSON for GET /healthz and its /health alias", async () => {
    for (const path of ["/healthz", "/health"]) {
      const response = await handleRequest(
        new Request(`https://example.com${path}`),
      );
      const body = await response.json();

      // When DB is reachable the server should return 200+db:up;
      // if no DB is running the probe returns 503+db:down so that
      // monitoring tools notice before users do.
      if (response.status === 200) {
        expect(body).toMatchObject({
          status: "ok",
          db: "up",
          uptimeSeconds: expect.any(Number),
        });
      } else {
        expect(response.status).toBe(503);
        expect(body).toMatchObject({
          status: "degraded",
          db: "down",
        });
      }
    }
  });

  it("returns a distinct request ID header for each request", async () => {
    const firstResponse = await handleRequest(
      new Request("https://example.com/api/projects"),
    );
    const secondResponse = await handleRequest(
      new Request("https://example.com/api/projects"),
    );

    const firstReqId = firstResponse.headers.get("X-Request-Id");
    const secondReqId = secondResponse.headers.get("X-Request-Id");

    expect(firstReqId).toMatch(UUID_PATTERN);
    expect(secondReqId).toMatch(UUID_PATTERN);
    expect(secondReqId).not.toBe(firstReqId);
  });

  it("returns a request ID header on not found responses", async () => {
    const response = await handleRequest(
      new Request("https://example.com/not-found"),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("X-Request-Id")).toMatch(UUID_PATTERN);
  });

  it("includes the request ID in logs emitted after async route handling", async () => {
    const logs: string[] = [];
    const consoleSpy = vi.spyOn(console, "log").mockImplementation((line) => {
      logs.push(String(line));
    });

    try {
      const response = await handleRequest(
        new Request("https://example.com/api/projects"),
      );
      const reqId = response.headers.get("X-Request-Id");

      expect(reqId).toMatch(UUID_PATTERN);
      expect(logs).toHaveLength(1);
      expect(JSON.parse(logs[0] ?? "{}")).toMatchObject({
        level: "info",
        message: "request handled",
        method: "GET",
        path: "/api/projects",
        status: 200,
        reqId,
        timestamp: expect.any(String),
      });
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("returns 503 degraded when DB is unreachable", async () => {
    const origHost = process.env["DATABASE_HOST"];
    const origPort = process.env["DATABASE_PORT"];
    process.env["DATABASE_HOST"] = "invalid-host";
    process.env["DATABASE_PORT"] = "5432";
    try {
      for (const path of ["/healthz", "/health"]) {
        const response = await handleRequest(
          new Request(`https://example.com${path}`),
        );

        expect(response.status).toBe(503);
        const body = await response.json();
        expect(body).toMatchObject({
          status: "degraded",
          db: "down",
          error: expect.any(String),
        });
      }
    } finally {
      if (origHost !== undefined) {
        process.env["DATABASE_HOST"] = origHost;
      } else {
        delete process.env["DATABASE_HOST"];
      }
      if (origPort !== undefined) {
        process.env["DATABASE_PORT"] = origPort;
      } else {
        delete process.env["DATABASE_PORT"];
      }
    }
  });

  it("accepts SAML metadata XML upload and authenticates a valid assertion", async () => {
    const metadataResponse = await handleRequest(
      new Request("https://example.com/settings/security/saml/metadata", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          xml: samlMetadataXml(),
        }),
      }),
    );

    expect(metadataResponse.status).toBe(200);

    const response = await handleRequest(
      new Request("https://example.com/auth/saml", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "vitest",
          "x-forwarded-for": "203.0.113.10",
        },
        body: JSON.stringify({
          workspaceId: "ws_1",
          assertionXml: signedSamlResponse({
            email: "sam@example.com",
            notOnOrAfter: new Date(Date.now() + 60_000).toISOString(),
          }),
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("fj_session=");
    await expect(response.json()).resolves.toMatchObject({
      session: {
        workspaceId: "ws_1",
        email: "sam@example.com",
        ip: "203.0.113.10",
        userAgent: "vitest",
      },
    });
    expect(listAuthEvents()).toEqual([
      expect.objectContaining({
        workspace_id: "ws_1",
        kind: "sso",
        reason: "saml_login",
        ip: "203.0.113.10",
        user_agent: "vitest",
      }),
    ]);
  });

  it("rejects expired SAML assertions and writes a failed audit event", async () => {
    await handleRequest(
      new Request("https://example.com/settings/security/saml/metadata", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          xml: samlMetadataXml(),
        }),
      }),
    );

    const response = await handleRequest(
      new Request("https://example.com/auth/saml", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          assertionXml: signedSamlResponse({
            email: "sam@example.com",
            notOnOrAfter: "2020-01-01T00:00:00.000Z",
          }),
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "saml_assertion_expired",
    });
    expect(listAuthEvents()).toEqual([
      expect.objectContaining({
        kind: "fail",
        reason: "saml_assertion_expired",
      }),
    ]);
  });

  it("rejects unsigned SAML assertions", async () => {
    await handleRequest(
      new Request("https://example.com/settings/security/saml/metadata", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          xml: samlMetadataXml(),
        }),
      }),
    );

    const response = await handleRequest(
      new Request("https://example.com/auth/saml", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          assertionXml: `<Assertion Destination="https://example.com/auth/saml"><Issuer>okta-test</Issuer><Subject><NameID>sam@example.com</NameID></Subject><Conditions NotOnOrAfter="${new Date(
            Date.now() + 60_000,
          ).toISOString()}"><AudienceRestriction><Audience>fantastic-journey:ws_1</Audience></AudienceRestriction></Conditions></Assertion>`,
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "saml_signature_missing",
    });
    expect(listAuthEvents()).toEqual([
      expect.objectContaining({
        kind: "fail",
        reason: "saml_signature_missing",
      }),
    ]);
  });

  it("sends and redeems a 15-minute single-use magic link", async () => {
    const requestResponse = await handleRequest(
      new Request("https://example.com/auth/magic-link", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          email: "Magic.User@Example.com",
          brandName: "Acme Workspace",
        }),
      }),
    );

    expect(requestResponse.status).toBe(202);
    await expect(requestResponse.json()).resolves.toMatchObject({
      sent: true,
      email: "ma********@example.com",
      expiresAt: expect.any(String),
    });

    const [email] = listSentEmails();
    expect(email).toMatchObject({
      to: "magic.user@example.com",
      subject: "Acme Workspace sign-in link",
    });
    expect(email?.text).toContain("15 minutes");

    const token = new URL(
      email?.text.match(/https:\/\/\S+/)?.[0] ?? "",
    ).searchParams.get("token");
    const redeemResponse = await handleRequest(
      new Request(
        `https://example.com/auth/magic-link/verify?token=${token ?? ""}`,
      ),
    );

    expect(redeemResponse.status).toBe(200);
    await expect(redeemResponse.json()).resolves.toMatchObject({
      session: {
        workspaceId: "ws_1",
        email: "magic.user@example.com",
      },
    });

    const reuseResponse = await handleRequest(
      new Request(
        `https://example.com/auth/magic-link/verify?token=${token ?? ""}`,
      ),
    );
    expect(reuseResponse.status).toBe(401);
    await expect(reuseResponse.json()).resolves.toEqual({
      error: "magic_token_used",
    });
  });

  it("rejects expired magic-link tokens", async () => {
    const token = createMagicLinkToken({
      workspaceId: "ws_1",
      email: "expired@example.com",
      context: { ip: null, userAgent: null },
      now: new Date("2020-01-01T00:00:00.000Z"),
    });

    const response = await handleRequest(
      new Request(
        `https://example.com/auth/magic-link/verify?token=${token.token}`,
      ),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "magic_token_expired",
    });
    expect(listAuthEvents()).toContainEqual(
      expect.objectContaining({
        kind: "fail",
        reason: "magic_token_expired",
      }),
    );
  });

  it("restricts active sessions UI to owners and lets owners revoke sessions", async () => {
    const loginResponse = await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        headers: { "user-agent": '<script>alert("x")</script>' },
        body: JSON.stringify({
          workspaceId: "ws_1",
          userId: "user_1",
          password: "password",
        }),
      }),
    );
    const loginBody = (await loginResponse.json()) as {
      session: { id: string };
    };

    const spoofedHeaderResponse = await handleRequest(
      new Request("https://example.com/settings/security/sessions", {
        headers: { "x-workspace-id": "ws_1", "x-user-id": "owner_1" },
      }),
    );
    expect(spoofedHeaderResponse.status).toBe(403);

    const ownerLoginResponse = await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          userId: "owner_1",
          password: "password",
        }),
      }),
    );
    const ownerCookie = ownerLoginResponse.headers.get("set-cookie") ?? "";

    const pageResponse = await handleRequest(
      new Request("https://example.com/settings/security/sessions", {
        headers: { cookie: ownerCookie },
      }),
    );
    expect(pageResponse.status).toBe(200);
    const html = await pageResponse.text();
    expect(html).toContain("<th>User</th>");
    expect(html).toContain("<th>IP</th>");
    expect(html).toContain("<th>UA</th>");
    expect(html).toContain("<th>Started</th>");
    expect(html).toContain("<th>Last seen</th>");
    expect(html).toContain("<th>Revoke</th>");
    expect(html).toContain("user@example.com");
    expect(html).not.toContain('<script>alert("x")</script>');
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");

    const revokeResponse = await handleRequest(
      new Request("https://example.com/settings/security/sessions/revoke", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: ownerCookie,
        },
        body: JSON.stringify({ sessionId: loginBody.session.id }),
      }),
    );

    expect(revokeResponse.status).toBe(200);
    await expect(revokeResponse.json()).resolves.toEqual({ revoked: true });
    expect(listActiveSessions("ws_1")).not.toContainEqual(
      expect.objectContaining({ id: loginBody.session.id }),
    );
  });

  it("writes an audit row for SSO, magic, password, and failed attempts", async () => {
    await handleRequest(
      new Request("https://example.com/settings/security/saml/metadata", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          xml: samlMetadataXml(),
        }),
      }),
    );
    await handleRequest(
      new Request("https://example.com/auth/saml", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          assertionXml: signedSamlResponse({
            email: "sso@example.com",
            notOnOrAfter: new Date(Date.now() + 60_000).toISOString(),
          }),
        }),
      }),
    );
    await handleRequest(
      new Request("https://example.com/auth/magic-link", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          email: "magic@example.com",
        }),
      }),
    );
    await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          userId: "owner_1",
          password: "password",
        }),
      }),
    );
    await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_1",
          userId: "owner_1",
          password: "wrong",
        }),
      }),
    );

    expect(listAuthEvents().map((event) => event.kind)).toEqual([
      "sso",
      "magic",
      "password",
      "fail",
    ]);
  });
});
