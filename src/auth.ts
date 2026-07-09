import { createVerify, randomUUID } from "node:crypto";

import { isValidEmail, normalizeEmail } from "./email";

/** Error thrown for authentication/SSO validation failures. The `code` field carries a machine-readable reason (e.g. "saml_metadata_invalid"). */
export class AuthError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = "AuthError";
    this.code = code;
  }
}

/** Auth event category written to the audit log. */
export type AuthEventKind = "sso" | "magic" | "password" | "fail";

/** A single row in the in-memory auth audit log. */
export interface AuthEvent {
  id: string;
  ts: string;
  workspace_id: string | null;
  user_id: string | null;
  ip: string | null;
  user_agent: string | null;
  kind: AuthEventKind;
  reason: string | null;
  created_at: string;
}

/** Caller-derived context (IP and user agent) attached to an auth attempt. */
export interface AuthRequestContext {
  ip: string | null;
  userAgent: string | null;
}

/** Parsed SAML IdP metadata stored per workspace for SSO verification. */
export interface SamlMetadata {
  workspaceId: string;
  xml: string;
  source: "upload" | "url";
  entityId: string | null;
  ssoUrl: string | null;
  binding: string | null;
  signingCertificate: string;
  updatedAt: string;
}

/** An authenticated user session, from login until revocation. */
export interface Session {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  ip: string | null;
  userAgent: string | null;
  startedAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
}

/** Single-use passwordless login token bound to an email and workspace. */
export interface MagicLinkToken {
  token: string;
  workspaceId: string;
  email: string;
  userId: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

/** A user's membership of a workspace, including their role. */
export interface WorkspaceUser {
  workspaceId: string;
  userId: string;
  email: string;
  role: "owner" | "member";
  plan?: string;
  signed_up_at?: string;
  last_active_at?: string;
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const SAML_HTTP_POST_BINDING = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";

const authEvents: AuthEvent[] = [];
const samlMetadataByWorkspace = new Map<string, SamlMetadata>();
const sessionsById = new Map<string, Session>();
const magicTokensByToken = new Map<string, MagicLinkToken>();
const workspaceUsers = new Map<string, WorkspaceUser>();

seedDefaultUsers();

function nowIso(now = new Date()): string {
  return now.toISOString();
}

function requireNonEmptyString(
  value: unknown,
  name: string,
): asserts value is string {
  if (value === null || value === undefined) {
    throw new TypeError(`${name} is required`);
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}

function seedDefaultUsers(): void {
  workspaceUsers.clear();
  addWorkspaceUser({
    workspaceId: "ws_1",
    userId: "owner_1",
    email: "owner@example.com",
    role: "owner",
    plan: "pro",
    signed_up_at: "2024-01-15T10:00:00.000Z",
    last_active_at: "2024-06-01T12:30:00.000Z",
  });
  addWorkspaceUser({
    workspaceId: "ws_1",
    userId: "user_1",
    email: "user@example.com",
    role: "member",
    plan: "free",
    signed_up_at: "2024-03-20T08:45:00.000Z",
    last_active_at: "2024-06-10T09:15:00.000Z",
  });
}

function userKey(workspaceId: string, userId: string): string {
  return `${workspaceId}:${userId}`;
}

function emailKey(workspaceId: string, email: string): string {
  return `${workspaceId}:email:${normalizeEmail(email)}`;
}

function addWorkspaceUser(user: WorkspaceUser): void {
  workspaceUsers.set(userKey(user.workspaceId, user.userId), user);
  workspaceUsers.set(emailKey(user.workspaceId, user.email), user);
}

function getOrCreateUser(
  workspaceId: string,
  email: string,
  role: WorkspaceUser["role"] = "member",
): WorkspaceUser {
  const normalized = normalizeEmail(email);
  const existing = workspaceUsers.get(emailKey(workspaceId, normalized));
  if (existing) return existing;

  const user: WorkspaceUser = {
    workspaceId,
    userId: `usr_${randomUUID()}`,
    email: normalized,
    role,
  };
  addWorkspaceUser(user);
  return user;
}

/** Returns every WorkspaceUser that belongs to the given workspace. */
export function listWorkspaceUsers(workspaceId: string): WorkspaceUser[] {
  requireNonEmptyString(workspaceId, "workspaceId");
  return [...workspaceUsers.values()].filter(
    (u) => u.workspaceId === workspaceId,
  );
}

/** Looks up a WorkspaceUser by workspace + user id, or null if not found. */
export function getUser(
  workspaceId: string,
  userId: string,
): WorkspaceUser | null {
  requireNonEmptyString(workspaceId, "workspaceId");
  requireNonEmptyString(userId, "userId");
  return workspaceUsers.get(userKey(workspaceId, userId)) ?? null;
}

function getHeader(request: Request, name: string): string | null {
  const value = request.headers.get(name);
  return value && value.trim() ? value : null;
}

function extractXmlAttribute(xml: string, attribute: string): string | null {
  const pattern = new RegExp(`${attribute}=["']([^"']+)["']`, "i");
  return pattern.exec(xml)?.[1] ?? null;
}

function extractXmlText(xml: string, tagName: string): string | null {
  const pattern = new RegExp(`<[^>]*${tagName}[^>]*>([^<]+)</[^>]*>`, "i");
  return pattern.exec(xml)?.[1]?.trim() ?? null;
}

function normalizeCertificate(certificate: string | null): string | null {
  if (!certificate) return null;
  const trimmed = certificate.trim();
  if (!trimmed) return null;
  if (
    trimmed.includes("BEGIN CERTIFICATE") ||
    trimmed.includes("BEGIN PUBLIC KEY")
  ) {
    return trimmed;
  }

  const compact = trimmed.replace(/\s+/g, "");
  const lines = compact.match(/.{1,64}/g)?.join("\n");
  return lines
    ? `-----BEGIN CERTIFICATE-----\n${lines}\n-----END CERTIFICATE-----`
    : null;
}

function decodeSamlResponse(input: string): string {
  try {
    return Buffer.from(input, "base64").toString("utf8");
  } catch {
    return input;
  }
}

function parseSamlAssertion(assertion: string): {
  email: string | null;
  userId: string | null;
  issuer: string | null;
  audience: string | null;
  destination: string | null;
  notOnOrAfter: string | null;
} {
  const xml = assertion.includes("<")
    ? assertion
    : decodeSamlResponse(assertion);
  const email =
    extractXmlAttribute(xml, "email") ??
    extractXmlText(xml, "NameID") ??
    extractXmlText(xml, "Email");
  const userId = extractXmlAttribute(xml, "userId") ?? email;
  const issuer = extractXmlText(xml, "Issuer");
  const audience = extractXmlText(xml, "Audience");
  const destination =
    extractXmlAttribute(xml, "Destination") ??
    extractXmlAttribute(xml, "Recipient");
  const notOnOrAfter =
    extractXmlAttribute(xml, "NotOnOrAfter") ??
    extractXmlText(xml, "NotOnOrAfter");

  return { email, userId, issuer, audience, destination, notOnOrAfter };
}

function extractSignedSamlPayload(input: string): {
  payload: string | null;
  signatureValue: string | null;
  algorithm: string | null;
} {
  const xml = input.includes("<") ? input : decodeSamlResponse(input);
  const payloadBase64 = extractXmlText(xml, "SignedPayload");
  const signatureValue = extractXmlText(xml, "SignatureValue");
  const algorithm = extractXmlAttribute(xml, "Algorithm");
  if (!payloadBase64 || !signatureValue) {
    return { payload: null, signatureValue: null, algorithm };
  }

  try {
    return {
      payload: Buffer.from(payloadBase64, "base64").toString("utf8"),
      signatureValue,
      algorithm,
    };
  } catch {
    return { payload: null, signatureValue, algorithm };
  }
}

function verifySamlSignature(params: {
  assertion: string;
  certificate: string;
}): { ok: true; payload: string } | { ok: false; reason: string } {
  const signed = extractSignedSamlPayload(params.assertion);
  if (!signed.payload || !signed.signatureValue) {
    return { ok: false, reason: "saml_signature_missing" };
  }

  const algorithm = signed.algorithm?.toLowerCase() ?? "rsa-sha256";
  if (
    ![
      "rsa-sha256",
      "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    ].includes(algorithm)
  ) {
    return { ok: false, reason: "saml_signature_algorithm_unsupported" };
  }

  const verifier = createVerify("RSA-SHA256");
  verifier.update(signed.payload);
  verifier.end();

  try {
    if (!verifier.verify(params.certificate, signed.signatureValue, "base64")) {
      return { ok: false, reason: "saml_signature_invalid" };
    }
  } catch {
    return { ok: false, reason: "saml_signature_invalid" };
  }

  return { ok: true, payload: signed.payload };
}

function createSession(params: {
  workspaceId: string;
  userId: string;
  email: string;
  context: AuthRequestContext;
  now?: Date;
}): Session {
  const timestamp = nowIso(params.now);
  const session: Session = {
    id: `sess_${randomUUID()}`,
    workspaceId: params.workspaceId,
    userId: params.userId,
    email: params.email,
    ip: params.context.ip,
    userAgent: params.context.userAgent,
    startedAt: timestamp,
    lastSeenAt: timestamp,
    revokedAt: null,
  };
  sessionsById.set(session.id, session);
  return session;
}

/** Extracts the caller's IP and user-agent from a Request into an AuthRequestContext. */
export function contextFromRequest(request: Request): AuthRequestContext {
  return {
    ip:
      getHeader(request, "x-forwarded-for")?.split(",")[0]?.trim() ??
      getHeader(request, "x-real-ip"),
    userAgent: getHeader(request, "user-agent"),
  };
}

/** Appends a row to the in-memory auth audit log and returns the created event. */
export function recordAuthEvent(params: {
  workspaceId?: string | null;
  userId?: string | null;
  kind: AuthEventKind;
  reason?: string | null;
  context: AuthRequestContext;
  now?: Date;
}): AuthEvent {
  const timestamp = nowIso(params.now);
  const event: AuthEvent = {
    id: `evt_${randomUUID()}`,
    ts: timestamp,
    workspace_id: params.workspaceId ?? null,
    user_id: params.userId ?? null,
    ip: params.context.ip,
    user_agent: params.context.userAgent,
    kind: params.kind,
    reason: params.reason ?? null,
    created_at: timestamp,
  };
  authEvents.push(event);
  return event;
}

/** Returns a snapshot copy of every recorded auth event. */
export function listAuthEvents(): AuthEvent[] {
  return [...authEvents];
}

/** Returns the SAML metadata stored for a workspace, or null if none is configured. */
export function getSamlMetadata(workspaceId: string): SamlMetadata | null {
  requireNonEmptyString(workspaceId, "workspaceId");
  return samlMetadataByWorkspace.get(workspaceId) ?? null;
}

/** Stores SAML metadata for a workspace, accepting inline XML or a URL to fetch from, and parses out entity/binding/certificate fields. Throws AuthError on invalid input. */
export async function saveSamlMetadata(params: {
  workspaceId: string;
  xml?: string;
  metadataUrl?: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}): Promise<SamlMetadata> {
  requireNonEmptyString(params.workspaceId, "workspaceId");
  if (
    params.timeoutMs !== undefined &&
    (typeof params.timeoutMs !== "number" ||
      Number.isNaN(params.timeoutMs) ||
      params.timeoutMs <= 0)
  ) {
    throw new TypeError("timeoutMs must be a positive number");
  }
  const timeoutMs = params.timeoutMs ?? 2_000;
  let xml = params.xml;
  let source: SamlMetadata["source"] = "upload";

  if (!xml && params.metadataUrl) {
    source = "url";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await (params.fetcher ?? fetch)(params.metadataUrl, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new AuthError(
          "saml_metadata_fetch_failed",
          `metadata fetch failed with ${response.status}`,
        );
      }
      xml = await response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  if (!xml || !xml.includes("<")) {
    throw new AuthError(
      "saml_metadata_invalid",
      "valid SAML metadata XML is required",
    );
  }

  const metadata: SamlMetadata = {
    workspaceId: params.workspaceId,
    xml,
    source,
    entityId: extractXmlAttribute(xml, "entityID"),
    ssoUrl: extractXmlAttribute(xml, "Location"),
    binding: extractXmlAttribute(xml, "Binding"),
    signingCertificate:
      normalizeCertificate(extractXmlText(xml, "X509Certificate")) ??
      normalizeCertificate(extractXmlText(xml, "SigningCertificate")) ??
      "",
    updatedAt: nowIso(),
  };
  if (!metadata.entityId || !metadata.signingCertificate) {
    throw new AuthError(
      "saml_metadata_incomplete",
      "SAML metadata must include entityID and signing certificate",
    );
  }
  if (metadata.binding !== SAML_HTTP_POST_BINDING) {
    throw new AuthError(
      "saml_metadata_binding_invalid",
      "SAML metadata must use HTTP-POST binding",
    );
  }
  samlMetadataByWorkspace.set(params.workspaceId, metadata);
  return metadata;
}

/** Verifies a SAML assertion against the workspace's stored metadata, validates issuer/audience/destination/expiry, and on success provisions a Session for the asserted user. */
export function authenticateSaml(params: {
  workspaceId: string;
  assertion: string;
  expectedAudience: string;
  expectedDestination: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; session: Session } | { ok: false; reason: string } {
  requireNonEmptyString(params.workspaceId, "workspaceId");
  requireNonEmptyString(params.assertion, "assertion");
  requireNonEmptyString(params.expectedAudience, "expectedAudience");
  requireNonEmptyString(params.expectedDestination, "expectedDestination");
  if (params.context === null || params.context === undefined) {
    throw new TypeError("context is required");
  }
  const metadata = getSamlMetadata(params.workspaceId);

  if (!metadata) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      kind: "fail",
      reason: "saml_metadata_missing",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "saml_metadata_missing" };
  }

  const verified = verifySamlSignature({
    assertion: params.assertion,
    certificate: metadata.signingCertificate,
  });
  if (!verified.ok) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      kind: "fail",
      reason: verified.reason,
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: verified.reason };
  }

  const parsed = parseSamlAssertion(verified.payload);

  if (parsed.issuer !== metadata.entityId) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      userId: parsed.userId,
      kind: "fail",
      reason: "saml_issuer_invalid",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "saml_issuer_invalid" };
  }

  if (parsed.audience !== params.expectedAudience) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      userId: parsed.userId,
      kind: "fail",
      reason: "saml_audience_invalid",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "saml_audience_invalid" };
  }

  if (parsed.destination !== params.expectedDestination) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      userId: parsed.userId,
      kind: "fail",
      reason: "saml_destination_invalid",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "saml_destination_invalid" };
  }

  if (!parsed.email || !isValidEmail(parsed.email)) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      userId: parsed.userId,
      kind: "fail",
      reason: "saml_subject_invalid",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "saml_subject_invalid" };
  }

  const expiresAt = parsed.notOnOrAfter
    ? new Date(parsed.notOnOrAfter).getTime()
    : Number.NaN;
  if (!Number.isFinite(expiresAt)) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      userId: parsed.userId,
      kind: "fail",
      reason: "saml_assertion_expiry_missing",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "saml_assertion_expiry_missing" };
  }

  if (expiresAt <= (params.now ?? new Date()).getTime()) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      userId: parsed.userId,
      kind: "fail",
      reason: "saml_assertion_expired",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "saml_assertion_expired" };
  }

  const user = getOrCreateUser(params.workspaceId, parsed.email);
  const session = createSession({
    workspaceId: params.workspaceId,
    userId: user.userId,
    email: user.email,
    context: params.context,
    now: params.now,
  });
  recordAuthEvent({
    workspaceId: params.workspaceId,
    userId: user.userId,
    kind: "sso",
    reason: "saml_login",
    context: params.context,
    now: params.now,
  });
  return { ok: true, session };
}

/** Mints a single-use 15-minute magic-link token for the given email/workspace, creating the user on first use, and records the request. */
export function createMagicLinkToken(params: {
  workspaceId: string;
  email: string;
  context: AuthRequestContext;
  now?: Date;
}): MagicLinkToken {
  requireNonEmptyString(params.workspaceId, "workspaceId");
  requireNonEmptyString(params.email, "email");
  if (params.context === null || params.context === undefined) {
    throw new TypeError("context is required");
  }
  const now = params.now ?? new Date();
  const user = getOrCreateUser(params.workspaceId, params.email);
  const token: MagicLinkToken = {
    token: `ml_${randomUUID()}`,
    workspaceId: params.workspaceId,
    email: user.email,
    userId: user.userId,
    expiresAt: nowIso(new Date(now.getTime() + FIFTEEN_MINUTES_MS)),
    usedAt: null,
    createdAt: nowIso(now),
  };
  magicTokensByToken.set(token.token, token);
  recordAuthEvent({
    workspaceId: params.workspaceId,
    userId: user.userId,
    kind: "magic",
    reason: "magic_link_requested",
    context: params.context,
    now,
  });
  return token;
}

/** Validates and consumes a magic-link token, then issues a Session. Fails if the token is unknown, already used, or expired. */
export function redeemMagicLinkToken(params: {
  token: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; session: Session } | { ok: false; reason: string } {
  requireNonEmptyString(params.token, "token");
  if (params.context === null || params.context === undefined) {
    throw new TypeError("context is required");
  }
  const magicToken = magicTokensByToken.get(params.token);
  const now = params.now ?? new Date();
  if (!magicToken) {
    recordAuthEvent({
      kind: "fail",
      reason: "magic_token_not_found",
      context: params.context,
      now,
    });
    return { ok: false, reason: "magic_token_not_found" };
  }

  if (magicToken.usedAt) {
    recordAuthEvent({
      workspaceId: magicToken.workspaceId,
      userId: magicToken.userId,
      kind: "fail",
      reason: "magic_token_used",
      context: params.context,
      now,
    });
    return { ok: false, reason: "magic_token_used" };
  }

  if (new Date(magicToken.expiresAt).getTime() <= now.getTime()) {
    recordAuthEvent({
      workspaceId: magicToken.workspaceId,
      userId: magicToken.userId,
      kind: "fail",
      reason: "magic_token_expired",
      context: params.context,
      now,
    });
    return { ok: false, reason: "magic_token_expired" };
  }

  magicToken.usedAt = nowIso(now);
  const session = createSession({
    workspaceId: magicToken.workspaceId,
    userId: magicToken.userId,
    email: magicToken.email,
    context: params.context,
    now,
  });
  recordAuthEvent({
    workspaceId: magicToken.workspaceId,
    userId: magicToken.userId,
    kind: "magic",
    reason: "magic_link_redeemed",
    context: params.context,
    now,
  });
  return { ok: true, session };
}

/** Authenticates a user by workspace + userId + password (test stub: only "password" is accepted) and issues a Session on success. */
export function authenticatePassword(params: {
  workspaceId: string;
  userId: string;
  password: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; session: Session } | { ok: false; reason: string } {
  requireNonEmptyString(params.workspaceId, "workspaceId");
  requireNonEmptyString(params.userId, "userId");
  requireNonEmptyString(params.password, "password");
  if (params.context === null || params.context === undefined) {
    throw new TypeError("context is required");
  }
  const user = getUser(params.workspaceId, params.userId);
  if (!user || params.password !== "password") {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      userId: params.userId,
      kind: "fail",
      reason: "password_invalid",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "password_invalid" };
  }

  const session = createSession({
    workspaceId: params.workspaceId,
    userId: user.userId,
    email: user.email,
    context: params.context,
    now: params.now,
  });
  recordAuthEvent({
    workspaceId: params.workspaceId,
    userId: user.userId,
    kind: "password",
    reason: "password_login",
    context: params.context,
    now: params.now,
  });
  return { ok: true, session };
}

/** Returns non-revoked sessions belonging to a workspace. */
export function listActiveSessions(workspaceId: string): Session[] {
  requireNonEmptyString(workspaceId, "workspaceId");
  return [...sessionsById.values()].filter(
    (session) => session.workspaceId === workspaceId && !session.revokedAt,
  );
}

/** Looks up a session by id, returning null if it is missing or revoked; bumps lastSeenAt on a hit. */
export function getActiveSession(sessionId: string | null): Session | null {
  if (!sessionId) return null;
  const session = sessionsById.get(sessionId);
  if (!session || session.revokedAt) return null;
  session.lastSeenAt = nowIso();
  return session;
}

/** Marks a session as revoked; only a workspace owner may do so. Returns true on success. */
export function revokeSession(params: {
  workspaceId: string;
  sessionId: string;
  actorUserId: string;
  now?: Date;
}): boolean {
  requireNonEmptyString(params.workspaceId, "workspaceId");
  requireNonEmptyString(params.sessionId, "sessionId");
  requireNonEmptyString(params.actorUserId, "actorUserId");
  const actor = getUser(params.workspaceId, params.actorUserId);
  if (actor?.role !== "owner") return false;

  const session = sessionsById.get(params.sessionId);
  if (!session || session.workspaceId !== params.workspaceId) return false;

  session.revokedAt = nowIso(params.now);
  return true;
}

/** Returns true if the given user has the "owner" role in the workspace. */
export function isWorkspaceOwner(
  workspaceId: string,
  userId: string | null,
): boolean {
  requireNonEmptyString(workspaceId, "workspaceId");
  if (!userId) return false;
  return getUser(workspaceId, userId)?.role === "owner";
}

/** Clears all in-memory auth state (events, SAML metadata, sessions, magic-link tokens, users) and re-seeds default users. Intended for tests. */
export function resetAuthState(): void {
  authEvents.length = 0;
  samlMetadataByWorkspace.clear();
  sessionsById.clear();
  magicTokensByToken.clear();
  seedDefaultUsers();
}
