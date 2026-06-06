import { createVerify, randomUUID } from "node:crypto";

import { isValidEmail, normalizeEmail } from "./email";

/**
 * Discriminator for an {@link AuthEvent}, indicating the authentication method
 * that produced it (`sso`, `magic`, `password`) or that the attempt failed (`fail`).
 */
export type AuthEventKind = "sso" | "magic" | "password" | "fail";

/**
 * An audit-log record of an authentication attempt. The `kind` and `reason`
 * together describe what happened; `reason` is populated for failure events.
 */
export interface AuthEvent {
  /** Unique event identifier (e.g. `evt_…`). */
  id: string;
  /** ISO-8601 timestamp of when the event occurred. */
  ts: string;
  /** Workspace the attempt was scoped to, or `null` for unscoped attempts. */
  workspace_id: string | null;
  /** Resolved user id, or `null` if the attempt failed before a user was identified. */
  user_id: string | null;
  /** Client IP extracted from the request, or `null` if unavailable. */
  ip: string | null;
  /** Client `User-Agent` header, or `null` if unavailable. */
  user_agent: string | null;
  /** Category of authentication that produced this event. */
  kind: AuthEventKind;
  /** Free-form reason string, typically set on `fail` events. */
  reason: string | null;
  /** ISO-8601 timestamp the event row was created (mirrors `ts`). */
  created_at: string;
}

/**
 * Request-scoped context derived from an inbound HTTP request, used as
 * {@link AuthRequestContext} parameter when recording auth events or
 * creating sessions.
 */
export interface AuthRequestContext {
  /** Client IP, taken from `x-forwarded-for` / `x-real-ip` headers. */
  ip: string | null;
  /** Client `User-Agent` header, trimmed; `null` if missing. */
  userAgent: string | null;
}

/**
 * Parsed SAML 2.0 service-provider metadata for a workspace, used to verify
 * inbound SSO assertions.
 */
export interface SamlMetadata {
  /** Workspace this metadata applies to. */
  workspaceId: string;
  /** Raw metadata XML, stored for re-parsing and audit purposes. */
  xml: string;
  /** Origin of the metadata — either pasted/uploaded or fetched from a URL. */
  source: "upload" | "url";
  /** SAML `entityID` of the IdP, used to verify the assertion issuer. */
  entityId: string | null;
  /** SSO endpoint `Location` URL extracted from the metadata. */
  ssoUrl: string | null;
  /** SAML binding; only `HTTP-POST` is currently accepted. */
  binding: string | null;
  /** PEM-encoded IdP signing certificate used to verify assertion signatures. */
  signingCertificate: string;
  /** ISO-8601 timestamp the metadata was last written. */
  updatedAt: string;
}

/**
 * An active authentication session for a user within a workspace. Sessions
 * are created on successful login and can be looked up or revoked.
 */
export interface Session {
  /** Unique session identifier (e.g. `sess_…`). */
  id: string;
  /** Workspace the session is scoped to. */
  workspaceId: string;
  /** Authenticated user id. */
  userId: string;
  /** Email of the authenticated user at login time. */
  email: string;
  /** Client IP recorded at session start. */
  ip: string | null;
  /** Client user-agent recorded at session start. */
  userAgent: string | null;
  /** ISO-8601 timestamp the session was created. */
  startedAt: string;
  /** ISO-8601 timestamp updated on each {@link getActiveSession} lookup. */
  lastSeenAt: string;
  /** ISO-8601 timestamp if the session was revoked, otherwise `null`. */
  revokedAt: string | null;
}

/**
 * A single-use magic-link token issued for passwordless email login.
 * Tokens expire after a short window and are invalidated on first use.
 */
export interface MagicLinkToken {
  /** Opaque token string (e.g. `ml_…`) presented by the user to redeem. */
  token: string;
  /** Workspace the token is scoped to. */
  workspaceId: string;
  /** Normalized email address the token was issued for. */
  email: string;
  /** Resolved user id the token will authenticate as. */
  userId: string;
  /** ISO-8601 timestamp after which the token is no longer valid. */
  expiresAt: string;
  /** ISO-8601 timestamp the token was redeemed, or `null` if unused. */
  usedAt: string | null;
  /** ISO-8601 timestamp the token was issued. */
  createdAt: string;
}

/**
 * A user's membership in a workspace, including their role and optional
 * billing / activity metadata.
 */
export interface WorkspaceUser {
  /** Workspace the user belongs to. */
  workspaceId: string;
  /** Stable user id within the workspace. */
  userId: string;
  /** Normalized email address. */
  email: string;
  /** `owner` can revoke sessions; `member` cannot. */
  role: "owner" | "member";
  /** Billing plan name, if known (e.g. `pro`, `free`). */
  plan?: string;
  /** ISO-8601 timestamp the user signed up, if known. */
  signed_up_at?: string;
  /** ISO-8601 timestamp the user was last active, if known. */
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

/**
 * Returns every {@link WorkspaceUser} that belongs to the given workspace.
 *
 * @param workspaceId - Workspace whose users should be listed.
 */
export function listWorkspaceUsers(workspaceId: string): WorkspaceUser[] {
  return [...workspaceUsers.values()].filter(
    (u) => u.workspaceId === workspaceId,
  );
}

/**
 * Looks up a {@link WorkspaceUser} by workspace and user id.
 *
 * @returns The matching user, or `null` if no such user exists.
 */
export function getUser(
  workspaceId: string,
  userId: string,
): WorkspaceUser | null {
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

/**
 * Extracts an {@link AuthRequestContext} from an inbound `Request`, reading
 * `x-forwarded-for` (first hop), `x-real-ip`, and `user-agent` headers.
 *
 * @param request - The incoming HTTP request.
 */
export function contextFromRequest(request: Request): AuthRequestContext {
  return {
    ip:
      getHeader(request, "x-forwarded-for")?.split(",")[0]?.trim() ??
      getHeader(request, "x-real-ip"),
    userAgent: getHeader(request, "user-agent"),
  };
}

/**
 * Appends an {@link AuthEvent} to the in-memory audit log and returns it.
 * Callers should provide `workspaceId`/`userId` whenever they are known
 * (even on failure) to aid incident triage.
 *
 * @returns The newly created event.
 */
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

/**
 * Returns a snapshot of all recorded {@link AuthEvent}s in insertion order.
 */
export function listAuthEvents(): AuthEvent[] {
  return [...authEvents];
}

/**
 * Returns the stored {@link SamlMetadata} for a workspace, or `null` if
 * none has been configured.
 */
export function getSamlMetadata(workspaceId: string): SamlMetadata | null {
  return samlMetadataByWorkspace.get(workspaceId) ?? null;
}

/**
 * Ingests SAML 2.0 metadata for a workspace, either from a pasted XML
 * string or by fetching it from `metadataUrl`, and stores the parsed
 * result. The metadata must declare an `entityID`, an HTTP-POST binding,
 * and a signing certificate.
 *
 * @throws If the XML is missing, the URL fetch fails/times out, or required
 *   SAML fields are absent.
 */
export async function saveSamlMetadata(params: {
  workspaceId: string;
  xml?: string;
  metadataUrl?: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}): Promise<SamlMetadata> {
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
        throw new Error(`metadata fetch failed with ${response.status}`);
      }
      xml = await response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  if (!xml || !xml.includes("<")) {
    throw new Error("valid SAML metadata XML is required");
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
    throw new Error(
      "SAML metadata must include entityID and signing certificate",
    );
  }
  if (metadata.binding !== SAML_HTTP_POST_BINDING) {
    throw new Error("SAML metadata must use HTTP-POST binding");
  }
  samlMetadataByWorkspace.set(params.workspaceId, metadata);
  return metadata;
}

/**
 * Verifies a SAML 2.0 assertion and, on success, creates a {@link Session}
 * for the asserted user. Validation checks signature, issuer, audience,
 * destination, subject (email), and `NotOnOrAfter` expiry in that order.
 *
 * @returns `{ ok: true, session }` on success, or `{ ok: false, reason }`
 *   with a stable `reason` string on failure. A `recordAuthEvent` call with
 *   `kind: "fail"` is recorded for each failure path.
 */
export function authenticateSaml(params: {
  workspaceId: string;
  assertion: string;
  expectedAudience: string;
  expectedDestination: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; session: Session } | { ok: false; reason: string } {
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

/**
 * Issues a new {@link MagicLinkToken} for the given workspace and email,
 * creating the {@link WorkspaceUser} on demand. The token expires after
 * 15 minutes and can be redeemed at most once.
 *
 * @returns The newly created, unused token.
 */
export function createMagicLinkToken(params: {
  workspaceId: string;
  email: string;
  context: AuthRequestContext;
  now?: Date;
}): MagicLinkToken {
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

/**
 * Redeems a previously issued {@link MagicLinkToken}, marking it used and
 * creating a {@link Session} for the associated user.
 *
 * @returns `{ ok: true, session }` on success, or `{ ok: false, reason }`
 *   with one of `magic_token_not_found`, `magic_token_used`, or
 *   `magic_token_expired`.
 */
export function redeemMagicLinkToken(params: {
  token: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; session: Session } | { ok: false; reason: string } {
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

/**
 * Authenticates a user with a password and, on success, creates a
 * {@link Session}.
 *
 * @returns `{ ok: true, session }` on success, or `{ ok: false, reason }`
 *   with `reason: "password_invalid"` if the user is unknown or the
 *   password does not match.
 */
export function authenticatePassword(params: {
  workspaceId: string;
  userId: string;
  password: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; session: Session } | { ok: false; reason: string } {
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

/**
 * Returns all non-revoked {@link Session}s in a workspace.
 */
export function listActiveSessions(workspaceId: string): Session[] {
  return [...sessionsById.values()].filter(
    (session) => session.workspaceId === workspaceId && !session.revokedAt,
  );
}

/**
 * Looks up a {@link Session} by id and, if it is still active, refreshes
 * its `lastSeenAt` timestamp as a side effect (touch-on-read).
 *
 * @returns The active session, or `null` if the id is missing, unknown, or revoked.
 */
export function getActiveSession(sessionId: string | null): Session | null {
  if (!sessionId) return null;
  const session = sessionsById.get(sessionId);
  if (!session || session.revokedAt) return null;
  session.lastSeenAt = nowIso();
  return session;
}

/**
 * Revokes a {@link Session} within a workspace. Only a user with role
 * `owner` in that workspace can perform the revocation.
 *
 * @returns `true` if the session was revoked; `false` if the actor is not
 *   an owner, or the session does not exist / belongs to another workspace.
 */
export function revokeSession(params: {
  workspaceId: string;
  sessionId: string;
  actorUserId: string;
  now?: Date;
}): boolean {
  const actor = getUser(params.workspaceId, params.actorUserId);
  if (actor?.role !== "owner") return false;

  const session = sessionsById.get(params.sessionId);
  if (!session || session.workspaceId !== params.workspaceId) return false;

  session.revokedAt = nowIso(params.now);
  return true;
}

/**
 * Returns whether the given user has the `owner` role in a workspace.
 * Returns `false` (never throws) when `userId` is `null` or unknown.
 */
export function isWorkspaceOwner(
  workspaceId: string,
  userId: string | null,
): boolean {
  if (!userId) return false;
  return getUser(workspaceId, userId)?.role === "owner";
}

/**
 * Clears all in-memory auth state — events, SAML metadata, sessions,
 * magic-link tokens — and re-seeds the default workspace users. Intended
 * for use in tests.
 */
export function resetAuthState(): void {
  authEvents.length = 0;
  samlMetadataByWorkspace.clear();
  sessionsById.clear();
  magicTokensByToken.clear();
  seedDefaultUsers();
}
