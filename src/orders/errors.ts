export class OrderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "OrderError";
  }
}

export class ValidationError extends OrderError {
  constructor(message: string, public readonly details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, false);
    this.name = "ValidationError";
  }
}

export class OrderNotFoundError extends OrderError {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`, "ORDER_NOT_FOUND", 404, false);
    this.name = "OrderNotFoundError";
  }
}

export class DuplicateOrderError extends OrderError {
  constructor(idempotencyKey: string) {
    super(`Duplicate order detected: ${idempotencyKey}`, "DUPLICATE_ORDER", 409, false);
    this.name = "DuplicateOrderError";
  }
}

export class TransientError extends OrderError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message, "TRANSIENT_ERROR", 503, true);
    this.name = "TransientError";
  }
}

export class InvalidStateTransitionError extends OrderError {
  constructor(from: string, to: string) {
    super(`Invalid state transition from ${from} to ${to}`, "INVALID_STATE_TRANSITION", 400, false);
    this.name = "InvalidStateTransitionError";
  }
}
