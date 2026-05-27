import { describe, expect, it } from "vitest";

import {
  AUTH_EVENTS_MIGRATION_SQL,
  AuthService,
  AuthenticationError,
  AuthorizationError,
} from "./auth";

const metadataXml =
  '<EntityDescriptor entityID="https://idp.okta.com/example"><IDPSSODescriptor /></EntityDescriptor>';

function assertionXml(notOnOrAfter: string): string {
  return `<Assertion><Subject><NameID>user@example.com</NameID><SubjectConfirmation><SubjectConfirmationData NotOnOrAfter="${notOnOrAfter}" /></SubjectConfirmation></Subject></Assertion>`;
}

describe("enterprise authentication", () => {
  it("stores uploaded SAML metadata and authenticates a valid assertion", () => {
    const auth = new AuthService();
    const now = new Date("2026-05-27T12:00:00.000Z");

    auth.saveSamlMetadataXml("workspace_1", metadataXml, now);
    const session = auth.handleSamlAssertion({
      workspaceId: "workspace_1",
      assertionXml: assertionXml("2026-05-27T12:15:00.000Z"),
      ip: "203.0.113.10",
      userAgent: "Vitest",
      now,
    });

    expect(session).toMatchObject({
      workspaceId: "workspace_1",
      userId: "user@example.com",
      ip: "203.0.113.10",
    });
    expect(auth.getAuthEvents()).toHaveLength(1);
    expect(auth.getAuthEvents()[0]).toMatchObject({
      kind: "sso",
      user_id: "user@example.com",
      reason: "ok:https://idp.okta.com/example",
    });
  });

  it("fetches SAML metadata from a URL with a timeout signal", async () => {
    const auth = new AuthService();
    let sawSignal = false;

    const metadata = await auth.fetchAndSaveSamlMetadata("workspace_1", "https://okta.example/metadata", {
      timeoutMs: 100,
      fetch: async (_url, init) => {
        sawSignal = init?.signal instanceof AbortSignal;
        return {
          ok: true,
          status: 200,
          text: async () => metadataXml,
        };
      },
      now: new Date("2026-05-27T12:00:00.000Z"),
    });

    expect(sawSignal).toBe(true);
    expect(metadata).toMatchObject({
      entityId: "https://idp.okta.com/example",
      source: "url",
    });
  });

  it("rejects expired SAML assertions and writes a failed audit row", () => {
    const auth = new AuthService();
    const now = new Date("2026-05-27T12:00:00.000Z");
    auth.saveSamlMetadataXml("workspace_1", metadataXml, now);

    expect(() =>
      auth.handleSamlAssertion({
        workspaceId: "workspace_1",
        assertionXml: assertionXml("2026-05-27T11:59:00.000Z"),
        ip: "203.0.113.10",
        userAgent: "Vitest",
        now,
      }),
    ).toThrow(AuthenticationError);

    expect(auth.getAuthEvents()).toHaveLength(1);
    expect(auth.getAuthEvents()[0]).toMatchObject({
      kind: "fail",
      reason: "expired_saml_assertion",
    });
  });

  it("creates 15-minute single-use magic links and consumes them into sessions", () => {
    const auth = new AuthService();
    const now = new Date("2026-05-27T12:00:00.000Z");
    const email = auth.requestMagicLink({
      workspaceId: "workspace_1",
      email: " User@Example.COM ",
      brandName: "Acme",
      baseUrl: "https://app.example",
      ip: "198.51.100.5",
      userAgent: "Vitest",
      now,
    });
    const token = new URL(email.loginUrl).searchParams.get("token");

    expect(email).toMatchObject({
      to: "user@example.com",
      subject: "Sign in to Acme",
      expiresAt: new Date("2026-05-27T12:15:00.000Z"),
    });
    expect(token).toEqual(expect.any(String));

    const session = auth.consumeMagicLink({
      workspaceId: "workspace_1",
      token: token ?? "",
      ip: "198.51.100.5",
      userAgent: "Vitest",
      now: new Date("2026-05-27T12:03:00.000Z"),
    });

    expect(session.userId).toBe("user@example.com");
    expect(auth.getAuthEvents().map((event) => event.kind)).toEqual([
      "magic",
      "magic",
    ]);
    expect(() =>
      auth.consumeMagicLink({
        workspaceId: "workspace_1",
        token: token ?? "",
        ip: "198.51.100.5",
        userAgent: "Vitest",
        now: new Date("2026-05-27T12:04:00.000Z"),
      }),
    ).toThrow(AuthenticationError);
  });

  it("rejects expired magic-link tokens and audits the attempt", () => {
    const auth = new AuthService();
    const email = auth.requestMagicLink({
      workspaceId: "workspace_1",
      email: "user@example.com",
      brandName: "Acme",
      baseUrl: "https://app.example",
      ip: "198.51.100.5",
      userAgent: "Vitest",
      now: new Date("2026-05-27T12:00:00.000Z"),
    });
    const token = new URL(email.loginUrl).searchParams.get("token");

    expect(() =>
      auth.consumeMagicLink({
        workspaceId: "workspace_1",
        token: token ?? "",
        ip: "198.51.100.5",
        userAgent: "Vitest",
        now: new Date("2026-05-27T12:16:00.000Z"),
      }),
    ).toThrow(AuthenticationError);

    expect(auth.getAuthEvents().at(-1)).toMatchObject({
      kind: "fail",
      reason: "expired_magic_link_token",
    });
  });

  it("provides a zero-downtime auth_events migration shape", () => {
    expect(AUTH_EVENTS_MIGRATION_SQL).toContain("CREATE TABLE IF NOT EXISTS auth_events");
    expect(AUTH_EVENTS_MIGRATION_SQL).toContain("workspace_id TEXT DEFAULT NULL");
    expect(AUTH_EVENTS_MIGRATION_SQL).not.toContain("NOT NULL");
  });

  it("renders owner-only active sessions with revoke controls", () => {
    const auth = new AuthService();
    auth.seedSession({
      id: "sess_1",
      workspaceId: "workspace_1",
      userId: "user@example.com",
      email: "user@example.com",
      ip: "203.0.113.10",
      userAgent: "Vitest",
      startedAt: new Date("2026-05-27T12:00:00.000Z"),
      lastSeenAt: new Date("2026-05-27T12:05:00.000Z"),
      revokedAt: null,
    });

    expect(() => auth.renderSessionsAdminPage("workspace_1", "member")).toThrow(
      AuthorizationError,
    );

    const html = auth.renderSessionsAdminPage("workspace_1", "owner");
    expect(html).toContain("<th>User</th>");
    expect(html).toContain("<th>IP</th>");
    expect(html).toContain("<th>UA</th>");
    expect(html).toContain("<th>Started</th>");
    expect(html).toContain("<th>Last seen</th>");
    expect(html).toContain("data-session-id=\"sess_1\"");

    auth.revokeSession({
      workspaceId: "workspace_1",
      sessionId: "sess_1",
      requesterRole: "owner",
      ownerUserId: "owner@example.com",
      ip: "203.0.113.20",
      userAgent: "Vitest",
      now: new Date("2026-05-27T12:06:00.000Z"),
    });

    expect(auth.listActiveSessions("workspace_1", "owner")).toEqual([]);
  });
});
