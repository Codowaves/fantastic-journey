import { createHash, randomBytes, randomUUID } from "node:crypto";

import { isValidEmail, maskEmail, normalizeEmail } from "./email";

export type AuthEventKind = "sso" | "magic" | "password" | "fail";

export interface AuthEvent {
  id: string;
  ts: Date;
  workspace_id: string;
  user_id: string | null;
  ip: string;
  user_agent: string;
  kind: AuthEventKind;
  reason: string | null;
  created_at: Date;
}

export interface ActiveSession {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  ip: string;
  userAgent: string;
  startedAt: Date;
  lastSeenAt: Date;
  revokedAt: Date | null;
}

export interface SamlMetadata {
  workspaceId: string;
  entityId: string;
  xml: string;
  source: "upload" | "url";
  fetchedAt: Date;
}

export interface MagicLinkEmail {
  to: string;
  subject: string;
  body: string;
  loginUrl: string;
  expiresAt: Date;
}

export interface AuthAttemptContext {
  workspaceId: string;
  ip: string;
  userAgent: string;
  now?: Date;
}

export interface SamlAssertionInput extends AuthAttemptContext {
  assertionXml: string;
}

export interface MagicLinkRequestInput extends AuthAttemptContext {
  email: string;
  brandName: string;
  baseUrl: string;
}

export interface ConsumeMagicLinkInput extends AuthAttemptContext {
  token: string;
}

interface MagicTokenRecord {
  tokenHash: string;
  workspaceId: string;
  userId: string;
  email: string;
  expiresAt: Date;
  usedAt: Date | null;
}

interface FetchLike {
  (
    input: string,
    init?: { signal?: AbortSignal },
  ): Promise<{ ok: boolean; status: number; text(): Promise<string> }>;
}

export const AUTH_EVENTS_MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS auth_events (
  id TEXT PRIMARY KEY,
  ts TIMESTAMP DEFAULT NULL,
  workspace_id TEXT DEFAULT NULL,
  user_id TEXT DEFAULT NULL,
  ip TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  kind TEXT DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS auth_events_workspace_ts_idx
  ON auth_events (workspace_id, ts);
`;

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly reason: string,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Workspace owner access required") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class AuthService {
  private readonly metadataByWorkspace = new Map<string, SamlMetadata>();
  private readonly magicTokensByHash = new Map<string, MagicTokenRecord>();
  private readonly sessionsById = new Map<string, ActiveSession>();
  private readonly events: AuthEvent[] = [];

  saveSamlMetadataXml(
    workspaceId: string,
    xml: string,
    now = new Date(),
  ): SamlMetadata {
    const entityId = readXmlAttribute(xml, "EntityDescriptor", "entityID");
    if (!entityId) {
      throw new AuthenticationError(
        "SAML metadata is missing EntityDescriptor entityID",
        "invalid_saml_metadata",
      );
    }

    const metadata = {
      workspaceId,
      entityId,
      xml,
      source: "upload" as const,
      fetchedAt: now,
    };
    this.metadataByWorkspace.set(workspaceId, metadata);
    return metadata;
  }

  async fetchAndSaveSamlMetadata(
    workspaceId: string,
    metadataUrl: string,
    options?: { timeoutMs?: number; fetch?: FetchLike; now?: Date },
  ): Promise<SamlMetadata> {
    const timeoutMs = options?.timeoutMs ?? 5_000;
    const fetchImpl = options?.fetch ?? fetch;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(metadataUrl, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new AuthenticationError(
          `SAML metadata fetch failed with HTTP ${response.status}`,
          "metadata_fetch_failed",
        );
      }

      const xml = await response.text();
      const metadata = this.saveSamlMetadataXml(
        workspaceId,
        xml,
        options?.now ?? new Date(),
      );
      const remoteMetadata: SamlMetadata = { ...metadata, source: "url" };
      this.metadataByWorkspace.set(workspaceId, remoteMetadata);
      return remoteMetadata;
    } finally {
      clearTimeout(timeout);
    }
  }

  handleSamlAssertion(input: SamlAssertionInput): ActiveSession {
    const now = input.now ?? new Date();
    const metadata = this.metadataByWorkspace.get(input.workspaceId);
    const userId = readXmlTag(input.assertionXml, "NameID");

    try {
      if (!metadata) {
        throw new AuthenticationError(
          "No SAML metadata configured for workspace",
          "missing_saml_metadata",
        );
      }
      if (!userId) {
        throw new AuthenticationError(
          "SAML assertion is missing NameID",
          "missing_name_id",
        );
      }

      const notOnOrAfter = readXmlAttribute(
        input.assertionXml,
        "SubjectConfirmationData",
        "NotOnOrAfter",
      );
      if (notOnOrAfter && new Date(notOnOrAfter).getTime() <= now.getTime()) {
        throw new AuthenticationError(
          "SAML assertion has expired",
          "expired_saml_assertion",
        );
      }

      const session = this.createSession({
        workspaceId: input.workspaceId,
        userId,
        email: userId,
        ip: input.ip,
        userAgent: input.userAgent,
        now,
      });
      this.recordEvent({
        ...input,
        now,
        kind: "sso",
        userId,
        reason: `ok:${metadata.entityId}`,
      });
      return session;
    } catch (error) {
      const reason =
        error instanceof AuthenticationError
          ? error.reason
          : "saml_assertion_failed";
      this.recordEvent({
        ...input,
        now,
        kind: "fail",
        userId,
        reason,
      });
      throw error;
    }
  }

  requestMagicLink(input: MagicLinkRequestInput): MagicLinkEmail {
    const now = input.now ?? new Date();
    const email = normalizeEmail(input.email);

    if (!isValidEmail(email)) {
      this.recordEvent({
        ...input,
        now,
        kind: "fail",
        userId: null,
        reason: "invalid_magic_link_email",
      });
      throw new AuthenticationError(
        "A valid email address is required",
        "invalid_magic_link_email",
      );
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1_000);
    this.magicTokensByHash.set(hashToken(token), {
      tokenHash: hashToken(token),
      workspaceId: input.workspaceId,
      userId: email,
      email,
      expiresAt,
      usedAt: null,
    });

    const loginUrl = `${input.baseUrl.replace(/\/$/, "")}/auth/magic/callback?token=${token}`;
    this.recordEvent({
      ...input,
      now,
      kind: "magic",
      userId: email,
      reason: "magic_link_requested",
    });

    return {
      to: email,
      subject: `Sign in to ${input.brandName}`,
      body: `${input.brandName} sign-in link for ${maskEmail(email)} expires in 15 minutes: ${loginUrl}`,
      loginUrl,
      expiresAt,
    };
  }

  consumeMagicLink(input: ConsumeMagicLinkInput): ActiveSession {
    const now = input.now ?? new Date();
    const tokenHash = hashToken(input.token);
    const token = this.magicTokensByHash.get(tokenHash);

    try {
      if (!token || token.workspaceId !== input.workspaceId) {
        throw new AuthenticationError(
          "Magic link token was not found",
          "invalid_magic_link_token",
        );
      }
      if (token.usedAt) {
        throw new AuthenticationError(
          "Magic link token has already been used",
          "used_magic_link_token",
        );
      }
      if (token.expiresAt.getTime() <= now.getTime()) {
        throw new AuthenticationError(
          "Magic link token has expired",
          "expired_magic_link_token",
        );
      }

      token.usedAt = now;
      const session = this.createSession({
        workspaceId: input.workspaceId,
        userId: token.userId,
        email: token.email,
        ip: input.ip,
        userAgent: input.userAgent,
        now,
      });
      this.recordEvent({
        ...input,
        now,
        kind: "magic",
        userId: token.userId,
        reason: "magic_link_consumed",
      });
      return session;
    } catch (error) {
      const reason =
        error instanceof AuthenticationError
          ? error.reason
          : "magic_link_failed";
      this.recordEvent({
        ...input,
        now,
        kind: "fail",
        userId: token?.userId ?? null,
        reason,
      });
      throw error;
    }
  }

  recordPasswordAttempt(
    input: AuthAttemptContext & { userId: string | null; success: boolean },
  ): void {
    this.recordEvent({
      ...input,
      kind: input.success ? "password" : "fail",
      reason: input.success ? "password_authenticated" : "password_failed",
    });
  }

  listActiveSessions(
    workspaceId: string,
    requesterRole: "owner" | "member",
  ): ActiveSession[] {
    if (requesterRole !== "owner") {
      throw new AuthorizationError();
    }

    return Array.from(this.sessionsById.values()).filter(
      (session) =>
        session.workspaceId === workspaceId && session.revokedAt === null,
    );
  }

  revokeSession(
    input: AuthAttemptContext & {
      sessionId: string;
      requesterRole: "owner" | "member";
      ownerUserId: string;
    },
  ): void {
    if (input.requesterRole !== "owner") {
      throw new AuthorizationError();
    }

    const session = this.sessionsById.get(input.sessionId);
    if (session && session.workspaceId === input.workspaceId) {
      session.revokedAt = input.now ?? new Date();
    }

    this.recordEvent({
      ...input,
      kind: "password",
      userId: input.ownerUserId,
      reason: `session_revoked:${input.sessionId}`,
    });
  }

  renderSessionsAdminPage(
    workspaceId: string,
    requesterRole: "owner" | "member",
  ): string {
    const sessions = this.listActiveSessions(workspaceId, requesterRole);
    const rows = sessions
      .map(
        (session) => `<tr><td>${escapeHtml(session.email)}</td><td>${escapeHtml(
          session.ip,
        )}</td><td>${escapeHtml(session.userAgent)}</td><td>${formatIso(
          session.startedAt,
        )}</td><td>${formatIso(session.lastSeenAt)}</td><td><button data-session-id="${escapeHtml(
          session.id,
        )}">Revoke</button></td></tr>`,
      )
      .join("");

    return `<!doctype html><html><head><title>Active sessions</title></head><body><main><h1>Active sessions</h1><table><thead><tr><th>User</th><th>IP</th><th>UA</th><th>Started</th><th>Last seen</th><th>Revoke</th></tr></thead><tbody>${rows}</tbody></table></main></body></html>`;
  }

  getAuthEvents(): AuthEvent[] {
    return [...this.events];
  }

  seedSession(session: ActiveSession): void {
    this.sessionsById.set(session.id, session);
  }

  private createSession(input: {
    workspaceId: string;
    userId: string;
    email: string;
    ip: string;
    userAgent: string;
    now: Date;
  }): ActiveSession {
    const session = {
      id: `sess_${randomUUID()}`,
      workspaceId: input.workspaceId,
      userId: input.userId,
      email: input.email,
      ip: input.ip,
      userAgent: input.userAgent,
      startedAt: input.now,
      lastSeenAt: input.now,
      revokedAt: null,
    };
    this.sessionsById.set(session.id, session);
    return session;
  }

  private recordEvent(
    input: AuthAttemptContext & {
      kind: AuthEventKind;
      userId: string | null;
      reason: string | null;
    },
  ): void {
    const now = input.now ?? new Date();
    this.events.push({
      id: `evt_${randomUUID()}`,
      ts: now,
      workspace_id: input.workspaceId,
      user_id: input.userId,
      ip: input.ip,
      user_agent: input.userAgent,
      kind: input.kind,
      reason: input.reason,
      created_at: now,
    });
  }
}

export const authService = new AuthService();

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function readXmlTag(xml: string, tagName: string): string | null {
  const match = new RegExp(`<[^:>/]*:?${tagName}[^>]*>([^<]+)</[^>]+>`).exec(
    xml,
  );
  return match?.[1]?.trim() ?? null;
}

function readXmlAttribute(
  xml: string,
  tagName: string,
  attributeName: string,
): string | null {
  const tag = new RegExp(`<[^:>/]*:?${tagName}\\s+[^>]*>`).exec(xml)?.[0];
  if (!tag) return null;
  const attribute = new RegExp(`${attributeName}="([^"]+)"`).exec(tag);
  return attribute?.[1] ?? null;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatIso(input: Date): string {
  return escapeHtml(input.toISOString());
}
