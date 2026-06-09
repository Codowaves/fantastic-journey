import { getReqId } from "./requestContext";

/** Severity levels for log entries, ordered from least to most severe. */
export type LogLevel = "debug" | "info" | "warn" | "error";

/** Structured representation of a single log line, serialized to JSON by the default sink. */
export interface LogEntry {
  /** Severity of the log entry. */
  level: LogLevel;
  /** Human-readable message with any email addresses already masked. */
  message: string;
  /** ISO-8601 timestamp captured when the entry was created. */
  timestamp: string;
  /** Request correlation id from the ambient request context, if available. */
  reqId?: string;
  /** Additional structured fields supplied by the caller. */
  [key: string]: unknown;
}

/** Minimal leveled-logger interface. Each method writes one entry to the configured sink. */
export interface Logger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

type LogSink = (line: string) => void;

const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

/** Masks the local part of an email address, keeping the domain visible (e.g. `a****@example.com`). Returns the input unchanged when it contains no `@` separator. */
export function maskEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  if (local.length <= 1) return `*${domain}`;
  return `${local[0]}${"*".repeat(local.length - 1)}${domain}`;
}

/** Replaces every email address found in `input` with its [[maskEmail]] form, leaving surrounding text intact. */
export function maskEmails(input: string): string {
  return input.replace(EMAIL_PATTERN, maskEmail);
}

function writeLog(
  level: LogLevel,
  message: string,
  fields: Record<string, unknown> = {},
  sink: LogSink = console.log,
): void {
  const reqId = getReqId();
  const extraFields = { ...fields };
  delete extraFields.reqId;
  const entry: LogEntry = {
    ...extraFields,
    level,
    message: maskEmails(message),
    timestamp: new Date().toISOString(),
  };

  if (reqId) {
    entry.reqId = reqId;
  }

  sink(JSON.stringify(entry));
}

/** Builds a [[Logger]] that writes JSON-encoded [[LogEntry]] values to `sink`, defaulting to `console.log`. */
export function createLogger(sink?: LogSink): Logger {
  return {
    debug: (message, fields) => writeLog("debug", message, fields, sink),
    info: (message, fields) => writeLog("info", message, fields, sink),
    warn: (message, fields) => writeLog("warn", message, fields, sink),
    error: (message, fields) => writeLog("error", message, fields, sink),
  };
}

/** Process-wide [[Logger]] instance backed by `console.log`; reuse this unless you need a custom sink. */
export const logger = createLogger();
