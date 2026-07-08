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

  it("returns 404 with a JSON error body for unknown routes", async () => {
    const response = await handleRequest(
      new Request("https://example.com/this-route-does-not-exist", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({ error: "Not found" });
  });

  it("returns 404 with a JSON error body for unknown methods on known paths", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/projects", { method: "DELETE" }),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({ error: "Not found" });
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

  describe("POST /api/orders edge cases", () => {
    function postOrder(body: unknown, headers: Record<string, string> = {}) {
      return handleRequest(
        new Request("https://example.com/api/orders", {
          method: "POST",
          headers: { "content-type": "application/json", ...headers },
          body: JSON.stringify(body),
        }),
      );
    }

    function postOrderRaw(raw: string, headers: Record<string, string> = {}) {
      return handleRequest(
        new Request("https://example.com/api/orders", {
          method: "POST",
          headers: { "content-type": "application/json", ...headers },
          body: raw,
        }),
      );
    }

    it("returns 400 when the body is empty JSON", async () => {
      const response = await postOrderRaw("{}");

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "customerId is required",
      });
    });

    it("returns 400 when customerId is an empty string", async () => {
      const response = await postOrder({
        customerId: "",
        currency: "USD",
        taxRate: 0,
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "customerId is required",
      });
    });

    it("returns 400 when customerId is whitespace only", async () => {
      const response = await postOrder({
        customerId: "   ",
        currency: "USD",
        taxRate: 0,
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "customerId is required",
      });
    });

    it("returns 400 when customerId is a number instead of a string", async () => {
      const response = await postOrder({
        customerId: 42,
        currency: "USD",
        taxRate: 0,
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "customerId is required",
      });
    });

    it("returns 400 for unsupported currency", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "XYZ",
        taxRate: 0,
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        error: expect.stringContaining("currency must be one of"),
      });
    });

    it("returns 400 when currency is missing entirely", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        taxRate: 0,
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        error: expect.stringContaining("currency must be one of"),
      });
    });

    it("accepts the boundary taxRate value of 0", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        items: [{ id: "sku_1", qty: 1, unitPrice: 100 }],
      });

      expect(response.status).toBe(201);
      await expect(response.json()).resolves.toMatchObject({
        order: { total: 100, currency: "USD" },
      });
    });

    it("rejects negative taxRate", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: -0.01,
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "taxRate must be a non-negative number",
      });
    });

    it("rejects NaN taxRate", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: Number.NaN,
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "taxRate must be a non-negative number",
      });
    });

    it("rejects Infinity taxRate", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: Number.POSITIVE_INFINITY,
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "taxRate must be a non-negative number",
      });
    });

    it("rejects string taxRate", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: "0.08",
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "taxRate must be a non-negative number",
      });
    });

    it("accepts the boundary discountPercent value of 0", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        discountPercent: 0,
        items: [{ id: "sku_1", qty: 1, unitPrice: 200 }],
      });

      expect(response.status).toBe(201);
      await expect(response.json()).resolves.toMatchObject({
        order: { total: 200, currency: "USD" },
      });
    });

    it("rejects discountPercent of 100 because the discounted total is not positive", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        discountPercent: 100,
        items: [{ id: "sku_1", qty: 1, unitPrice: 200 }],
      });

      // 100% discount → total 0, which processPayment rejects.
      expect(response.status).toBe(400);
    });

    it("rejects discountPercent above 100", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        discountPercent: 100.01,
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "discountPercent must be a number between 0 and 100",
      });
    });

    it("rejects discountPercent as a string", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        discountPercent: "10",
        items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "discountPercent must be a number between 0 and 100",
      });
    });

    it("returns 400 when items array is empty", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        items: [],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "items must be a non-empty array",
      });
    });

    it("returns 400 when items is not an array", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        items: "sku_1",
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "items must be a non-empty array",
      });
    });

    it("returns 400 when an item is missing id", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        items: [{ qty: 1, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "item.id is required",
      });
    });

    it("returns 400 when an item has a non-positive qty", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        items: [{ id: "sku_1", qty: 0, unitPrice: 10 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "item.qty must be a positive number",
      });
    });

    it("returns 400 when an item has negative unitPrice", async () => {
      const response = await postOrder({
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        items: [{ id: "sku_1", qty: 1, unitPrice: -1 }],
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "item.unitPrice must be a non-negative number",
      });
    });

    it("returns 404 when GET /api/orders/<missing> looks up a non-existent order", async () => {
      const response = await handleRequest(
        new Request("https://example.com/api/orders/ord_does_not_exist"),
      );

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toEqual({
        error: "order not found",
      });
    });

    it("returns the same order when called twice with the same idempotency key", async () => {
      const idempotencyKey = "idem_edge_1";
      const body = {
        customerId: "cust_1",
        currency: "USD",
        taxRate: 0,
        items: [{ id: "sku_1", qty: 1, unitPrice: 50 }],
      };

      const first = await postOrder(body, {
        "Idempotency-Key": idempotencyKey,
      });
      const second = await postOrder(body, {
        "Idempotency-Key": idempotencyKey,
      });

      expect(first.status).toBe(201);
      expect(second.status).toBe(200);

      const firstBody = (await first.json()) as { order: { id: string } };
      const secondBody = (await second.json()) as { order: { id: string } };
      expect(secondBody.order.id).toBe(firstBody.order.id);
    });
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

describe("api v1 additional edge cases", () => {
  beforeEach(() => {
    resetAuthState();
    resetSentEmails();
  });

  it("rejects OPTIONS preflight when the origin is not in the allow-list", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/projects", {
        method: "OPTIONS",
        headers: { Origin: "https://anywhere.example" },
      }),
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("returns 400 when SAML metadata upload is missing workspaceId", async () => {
    const response = await handleRequest(
      new Request("https://example.com/settings/security/saml/metadata", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ xml: samlMetadataXml() }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "workspaceId is required",
    });
  });

  it("returns 400 when SAML metadata XML is missing or invalid", async () => {
    const response = await handleRequest(
      new Request("https://example.com/settings/security/saml/metadata", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workspaceId: "ws_1", xml: "" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
    });
  });

  it("returns 400 when /auth/saml is missing workspaceId or assertion", async () => {
    const response = await handleRequest(
      new Request("https://example.com/auth/saml", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "workspaceId and assertion are required",
    });
  });

  it("returns 401 when /auth/saml has no SAML metadata configured", async () => {
    const response = await handleRequest(
      new Request("https://example.com/auth/saml", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws_unknown",
          assertionXml: "<Assertion/>",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
    });
  });

  it("returns 400 when /auth/magic-link is missing workspaceId or email", async () => {
    const response = await handleRequest(
      new Request("https://example.com/auth/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "workspaceId and email are required",
    });
  });

  it("returns 400 when /auth/magic-link/verify is missing the token", async () => {
    const response = await handleRequest(
      new Request("https://example.com/auth/magic-link/verify"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "token is required",
    });
  });

  it("returns 401 when /auth/magic-link/verify is given an unknown token", async () => {
    const response = await handleRequest(
      new Request(
        "https://example.com/auth/magic-link/verify?token=ml_does_not_exist",
      ),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "magic_token_not_found",
    });
  });

  it("returns 400 when /auth/password is missing required fields", async () => {
    const response = await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workspaceId: "ws_1" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "workspaceId, userId, and password are required",
    });
  });

  it("returns 401 when /auth/password rejects an invalid password", async () => {
    const response = await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws_1",
          userId: "owner_1",
          password: "wrong",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "password_invalid",
    });
  });

  it("returns 404 when revoking a session that does not exist", async () => {
    const loginResponse = await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws_1",
          userId: "owner_1",
          password: "password",
        }),
      }),
    );
    const ownerCookie = loginResponse.headers.get("set-cookie") ?? "";

    const response = await handleRequest(
      new Request("https://example.com/settings/security/sessions/revoke", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: ownerCookie,
        },
        body: JSON.stringify({ sessionId: "sess_does_not_exist" }),
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ revoked: false });
  });

  it("returns 400 when revoke is missing the sessionId", async () => {
    const loginResponse = await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws_1",
          userId: "owner_1",
          password: "password",
        }),
      }),
    );
    const ownerCookie = loginResponse.headers.get("set-cookie") ?? "";

    const response = await handleRequest(
      new Request("https://example.com/settings/security/sessions/revoke", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: ownerCookie,
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "sessionId is required",
    });
  });

  it("returns 403 for /admin/users when caller is not an owner", async () => {
    const loginResponse = await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws_1",
          userId: "user_1",
          password: "password",
        }),
      }),
    );
    const memberCookie = loginResponse.headers.get("set-cookie") ?? "";

    const response = await handleRequest(
      new Request("https://example.com/admin/users", {
        headers: { cookie: memberCookie },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("returns CSV download with all workspace users for /admin/users/export", async () => {
    const loginResponse = await handleRequest(
      new Request("https://example.com/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws_1",
          userId: "owner_1",
          password: "password",
        }),
      }),
    );
    const ownerCookie = loginResponse.headers.get("set-cookie") ?? "";

    const response = await handleRequest(
      new Request("https://example.com/admin/users/export", {
        headers: { cookie: ownerCookie },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/csv");
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(response.headers.get("content-disposition")).toMatch(
      /filename="users-\d{4}-\d{2}-\d{2}\.csv"/,
    );
    const csv = await response.text();
    const lines = csv.split("\n");
    expect(lines[0]).toBe("id,email,plan,signed_up_at,last_active_at");
    expect(csv).toContain("owner_1");
    expect(csv).toContain("owner@example.com");
    expect(csv).toContain("user_1");
  });

  it("rejects an item with a whitespace-only id", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerId: "cust_ws",
          currency: "USD",
          taxRate: 0,
          items: [{ id: "   ", qty: 1, unitPrice: 10 }],
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "item.id is required",
    });
  });

  it("accepts JPY currency on POST /api/orders", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerId: "cust_jpy",
          currency: "JPY",
          taxRate: 0.1,
          items: [{ id: "sku_jpy", qty: 1, unitPrice: 1000 }],
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      order: { total: 1100, currency: "JPY" },
    });
  });

  it("rejects negative discountPercent", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerId: "cust_neg",
          currency: "USD",
          taxRate: 0,
          discountPercent: -1,
          items: [{ id: "sku_1", qty: 1, unitPrice: 10 }],
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "discountPercent must be a number between 0 and 100",
    });
  });

  it("treats null discountPercent as no discount", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerId: "cust_null",
          currency: "USD",
          taxRate: 0,
          discountPercent: null,
          items: [{ id: "sku_1", qty: 1, unitPrice: 50 }],
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      order: { total: 50, currency: "USD" },
    });
  });

  it("returns 400 when GET /api/orders/ has no id segment", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/orders/"),
    );

    // Path "/api/orders/" still startsWith "/api/orders/", but the slice after
    // the prefix is empty — the handler should respond 400.
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "order id is required",
    });
  });
});
