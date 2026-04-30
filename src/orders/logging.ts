export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  orderId?: string;
  customerId?: string;
  attempt?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

export type LogHandler = (entry: LogEntry) => void;

const handlers: Set<LogHandler> = new Set();

export function addLogHandler(handler: LogHandler): void {
  handlers.add(handler);
}

export function removeLogHandler(handler: LogHandler): void {
  handlers.delete(handler);
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };
  for (const h of handlers) {
    h(entry);
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit("error", msg, ctx),
};

export interface Metric {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: string;
}

const metricHandlers: Set<(m: Metric) => void> = new Set();

export function addMetricHandler(h: (m: Metric) => void): void {
  metricHandlers.add(h);
}

export function recordMetric(
  name: string,
  value: number,
  labels: Record<string, string> = {},
): void {
  const m: Metric = {
    name,
    value,
    labels,
    timestamp: new Date().toISOString(),
  };
  for (const h of metricHandlers) h(m);
}

export const metrics = {
  orderCreated: (labels: Record<string, string> = {}) =>
    recordMetric("order_created_total", 1, labels),
  orderConfirmed: (labels: Record<string, string> = {}) =>
    recordMetric("order_confirmed_total", 1, labels),
  orderFailed: (labels: Record<string, string> = {}) =>
    recordMetric("order_failed_total", 1, labels),
  orderProcessingMs: (ms: number, labels: Record<string, string> = {}) =>
    recordMetric("order_processing_ms", ms, labels),
  retryAttempt: (labels: Record<string, string> = {}) =>
    recordMetric("retry_attempt_total", 1, labels),
  idempotencyHit: (labels: Record<string, string> = {}) =>
    recordMetric("idempotency_hit_total", 1, labels),
};

export interface AlertConfig {
  errorRateThreshold: number;
  windowMs: number;
  onAlert: (message: string) => void;
}

export function createErrorRateAlert(config: AlertConfig) {
  const errors: { time: number }[] = [];

  return {
    recordError: () => {
      errors.push({ time: Date.now() });
    },
    check: () => {
      const now = Date.now();
      const windowStart = now - config.windowMs;
      const recentErrors = errors.filter((e) => e.time >= windowStart);
      if (recentErrors.length >= config.errorRateThreshold) {
        config.onAlert(
          `Error rate alert: ${recentErrors.length} errors in ${config.windowMs}ms window`,
        );
      }
    },
  };
}
