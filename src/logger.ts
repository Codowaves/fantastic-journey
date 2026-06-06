import { getReqId } from "./requestContext";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  reqId?: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

type LogSink = (line: string) => void;

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

export function maskEmail(value: string): string {
  return value.replace(EMAIL_PATTERN, (match) => {
    const atIndex = match.indexOf("@");
    if (atIndex <= 0) {
      return match;
    }
    return `${match[0]}***${match.slice(atIndex)}`;
  });
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
    message: maskEmail(message),
    timestamp: new Date().toISOString(),
  };

  if (reqId) {
    entry.reqId = reqId;
  }

  sink(JSON.stringify(entry));
}

export function createLogger(sink?: LogSink): Logger {
  return {
    debug: (message, fields) => writeLog("debug", message, fields, sink),
    info: (message, fields) => writeLog("info", message, fields, sink),
    warn: (message, fields) => writeLog("warn", message, fields, sink),
    error: (message, fields) => writeLog("error", message, fields, sink),
  };
}

export const logger = createLogger();
