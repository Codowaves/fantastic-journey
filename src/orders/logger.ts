import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: "orders",
    env: process.env.NODE_ENV || "development",
  },
});

export function createOrderLogger(orderId: string) {
  return logger.child({ orderId });
}

export function logOrderEvent(
  orderId: string,
  event: string,
  metadata?: Record<string, unknown>,
) {
  logger.info({ orderId, event, ...metadata }, `Order event: ${event}`);
}

export function logOrderError(
  orderId: string | undefined,
  error: Error,
  context?: Record<string, unknown>,
) {
  logger.error(
    {
      orderId,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
      ...context,
    },
    `Order error: ${error.message}`,
  );
}
