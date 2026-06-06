import { createVerify, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import { isValidEmail, normalizeEmail } from "./email";

export type AuthEventKind = "sso" | "magic" | "password" | "fail" | "signup" | "reset";

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

export interface AuthRequestContext {
  ip: string | null;
  userAgent: string | null;
}

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

export interface MagicLinkToken {
  token: string;
  workspaceId: string;
  email: string;
  userId: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface PasswordResetToken {
  token: string;
  workspaceId: string;
  email: string;
  userId: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface WorkspaceUser {
  workspaceId: string;
  userId: string;
  email: string;
  role: "owner" | "member";
  plan?: string;
  signed_up_at?: string;
  last_active_at?: string;
  passwordHash?: string;
  passwordSalt?: string;
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const SAML_HTTP_POST_BINDING = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";

const authEvents: AuthEvent[] = [];
const samlMetadataByWorkspace = new Map<string, SamlMetadata>();
const sessionsById = new Map<string, Session>();
const magicTokensByToken = new Map<string, MagicLinkToken>();
const passwordResetTokensByToken = new Map<string, PasswordResetToken>();
const passwordHashesByEmailKey = new Map<string, { hash: string; salt: string }>();
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

export function listWorkspaceUsers(workspaceId: string): WorkspaceUser[] {
  return [...workspaceUsers.values()].filter(
    (u) => u.workspaceId === workspaceId,
  );
}

export function getUser(
  workspaceId: string,
  userId: string,
): WorkspaceUser | null {
  return workspaceUsers.get(userKey(workspaceId, userId)) ?? null;
}

export function getUserByEmail(
  workspaceId: string,
  email: string,
): WorkspaceUser | null {
  return workspaceUsers.get(emailKey(workspaceId, normalizeEmail(email))) ?? null;
}

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomUUID().replaceAll("-", "");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function verifyPasswordHash(
  password: string,
  storedHash: string,
  salt: string,
): boolean {
  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
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

export function contextFromRequest(request: Request): AuthRequestContext {
  return {
    ip:
      getHeader(request, "x-forwarded-for")?.split(",")[0]?.trim() ??
      getHeader(request, "x-real-ip"),
    userAgent: getHeader(request, "user-agent"),
  };
}

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

export function listAuthEvents(): AuthEvent[] {
  return [...authEvents];
}

export function getSamlMetadata(workspaceId: string): SamlMetadata | null {
  return samlMetadataByWorkspace.get(workspaceId) ?? null;
}

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

export function authenticatePassword(params: {
  workspaceId: string;
  userId: string;
  password: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; session: Session } | { ok: false; reason: string } {
  const user = getUser(params.workspaceId, params.userId);
  let passwordOk = false;

  if (user?.passwordHash && user.passwordSalt) {
    passwordOk = verifyPasswordHash(
      params.password,
      user.passwordHash,
      user.passwordSalt,
    );
  } else if (user) {
    // Legacy/back-compat: seed users authenticate with the literal "password".
    passwordOk = params.password === "password";
  }

  if (!user || !passwordOk) {
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

export function signupUser(params: {
  workspaceId: string;
  email: string;
  password: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; session: Session; user: WorkspaceUser } | { ok: false; reason: string } {
  const normalized = normalizeEmail(params.email);
  if (!isValidEmail(normalized)) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      kind: "fail",
      reason: "signup_email_invalid",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "signup_email_invalid" };
  }
  if (params.password.length < 8) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      kind: "fail",
      reason: "signup_password_too_short",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "signup_password_too_short" };
  }

  const existing = getUserByEmail(params.workspaceId, normalized);
  if (existing) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      userId: existing.userId,
      kind: "fail",
      reason: "signup_email_taken",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "signup_email_taken" };
  }

  const now = params.now ?? new Date();
  const { hash, salt } = hashPassword(params.password);
  const user: WorkspaceUser = {
    workspaceId: params.workspaceId,
    userId: `usr_${randomUUID()}`,
    email: normalized,
    role: "member",
    plan: "free",
    signed_up_at: nowIso(now),
    last_active_at: nowIso(now),
    passwordHash: hash,
    passwordSalt: salt,
  };
  addWorkspaceUser(user);
  passwordHashesByEmailKey.set(emailKey(params.workspaceId, normalized), {
    hash,
    salt,
  });

  const session = createSession({
    workspaceId: params.workspaceId,
    userId: user.userId,
    email: user.email,
    context: params.context,
    now,
  });
  recordAuthEvent({
    workspaceId: params.workspaceId,
    userId: user.userId,
    kind: "signup",
    reason: "signup_completed",
    context: params.context,
    now,
  });
  return { ok: true, session, user };
}

export function createPasswordResetToken(params: {
  workspaceId: string;
  email: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; token: PasswordResetToken; email: string | null } | { ok: false; reason: string } {
  const normalized = normalizeEmail(params.email);
  if (!isValidEmail(normalized)) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      kind: "fail",
      reason: "password_reset_email_invalid",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "password_reset_email_invalid" };
  }

  const user = getUserByEmail(params.workspaceId, normalized);
  if (!user) {
    recordAuthEvent({
      workspaceId: params.workspaceId,
      kind: "fail",
      reason: "password_reset_user_not_found",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "password_reset_user_not_found" };
  }

  const now = params.now ?? new Date();
  const token: PasswordResetToken = {
    token: `pr_${randomUUID()}`,
    workspaceId: params.workspaceId,
    email: user.email,
    userId: user.userId,
    expiresAt: nowIso(new Date(now.getTime() + FIFTEEN_MINUTES_MS)),
    usedAt: null,
    createdAt: nowIso(now),
  };
  passwordResetTokensByToken.set(token.token, token);
  recordAuthEvent({
    workspaceId: params.workspaceId,
    userId: user.userId,
    kind: "reset",
    reason: "password_reset_requested",
    context: params.context,
    now,
  });
  return { ok: true, token, email: user.email };
}

export function redeemPasswordResetToken(params: {
  token: string;
  newPassword: string;
  context: AuthRequestContext;
  now?: Date;
}): { ok: true; session: Session } | { ok: false; reason: string } {
  if (params.newPassword.length < 8) {
    recordAuthEvent({
      kind: "fail",
      reason: "password_reset_too_short",
      context: params.context,
      now: params.now,
    });
    return { ok: false, reason: "password_reset_too_short" };
  }

  const resetToken = passwordResetTokensByToken.get(params.token);
  const now = params.now ?? new Date();

  if (!resetToken) {
    recordAuthEvent({
      kind: "fail",
      reason: "password_reset_token_not_found",
      context: params.context,
      now,
    });
    return { ok: false, reason: "password_reset_token_not_found" };
  }

  if (resetToken.usedAt) {
    recordAuthEvent({
      workspaceId: resetToken.workspaceId,
      userId: resetToken.userId,
      kind: "fail",
      reason: "password_reset_token_used",
      context: params.context,
      now,
    });
    return { ok: false, reason: "password_reset_token_used" };
  }

  if (new Date(resetToken.expiresAt).getTime() <= now.getTime()) {
    recordAuthEvent({
      workspaceId: resetToken.workspaceId,
      userId: resetToken.userId,
      kind: "fail",
      reason: "password_reset_token_expired",
      context: params.context,
      now,
    });
    return { ok: false, reason: "password_reset_token_expired" };
  }

  const user = getUser(resetToken.workspaceId, resetToken.userId);
  if (!user) {
    recordAuthEvent({
      workspaceId: resetToken.workspaceId,
      kind: "fail",
      reason: "password_reset_user_missing",
      context: params.context,
      now,
    });
    return { ok: false, reason: "password_reset_user_missing" };
  }

  const { hash, salt } = hashPassword(params.newPassword);
  user.passwordHash = hash;
  user.passwordSalt = salt;
  user.last_active_at = nowIso(now);
  passwordHashesByEmailKey.set(
    emailKey(resetToken.workspaceId, user.email),
    { hash, salt },
  );
  resetToken.usedAt = nowIso(now);

  // Revoke any other active sessions for this user, but keep the new one
  // we'll create below valid.
  for (const session of sessionsById.values()) {
    if (
      session.workspaceId === user.workspaceId &&
      session.userId === user.userId &&
      !session.revokedAt
    ) {
      session.revokedAt = nowIso(now);
    }
  }

  const session = createSession({
    workspaceId: user.workspaceId,
    userId: user.userId,
    email: user.email,
    context: params.context,
    now,
  });
  recordAuthEvent({
    workspaceId: user.workspaceId,
    userId: user.userId,
    kind: "reset",
    reason: "password_reset_completed",
    context: params.context,
    now,
  });
  return { ok: true, session };
}

export function listActiveSessions(workspaceId: string): Session[] {
  return [...sessionsById.values()].filter(
    (session) => session.workspaceId === workspaceId && !session.revokedAt,
  );
}

export function getActiveSession(sessionId: string | null): Session | null {
  if (!sessionId) return null;
  const session = sessionsById.get(sessionId);
  if (!session || session.revokedAt) return null;
  session.lastSeenAt = nowIso();
  return session;
}

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

export function logoutSession(params: {
  sessionId: string | null;
  now?: Date;
}): { ok: true } | { ok: false; reason: string } {
  if (!params.sessionId) {
    return { ok: false, reason: "session_missing" };
  }
  const session = sessionsById.get(params.sessionId);
  if (!session) {
    return { ok: false, reason: "session_not_found" };
  }
  if (session.revokedAt) {
    return { ok: true };
  }
  session.revokedAt = nowIso(params.now);
  return { ok: true };
}

export function isWorkspaceOwner(
  workspaceId: string,
  userId: string | null,
): boolean {
  if (!userId) return false;
  return getUser(workspaceId, userId)?.role === "owner";
}

export function resetAuthState(): void {
  authEvents.length = 0;
  samlMetadataByWorkspace.clear();
  sessionsById.clear();
  magicTokensByToken.clear();
  passwordResetTokensByToken.clear();
  passwordHashesByEmailKey.clear();
  seedDefaultUsers();
}
