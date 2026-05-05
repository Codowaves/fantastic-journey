export class OrderValidationError extends Error {
  readonly code = "VALIDATION_FAILED";
  readonly retryable = false;
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

export class OrderNotFoundError extends Error {
  readonly code = "NOT_FOUND";
  readonly retryable = false;
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
    this.name = "OrderNotFoundError";
  }
}

export class IdempotencyConflictError extends Error {
  readonly code = "IDEMPOTENCY_CONFLICT";
  readonly retryable = false;
  constructor(key: string) {
    super(`Idempotency key already used: ${key}`);
    this.name = "IdempotencyConflictError";
  }
}

export class OrderAlreadyConfirmedError extends Error {
  readonly code = "ALREADY_CONFIRMED";
  readonly retryable = false;
  constructor(orderId: string) {
    super(`Order already confirmed: ${orderId}`);
    this.name = "OrderAlreadyConfirmedError";
  }
}

export class RetryableOrderError extends Error {
  readonly code = "INTERNAL_ERROR";
  readonly retryable = true;
  constructor(message: string) {
    super(message);
    this.name = "RetryableOrderError";
  }
}

export function isRetryable(err: unknown): boolean {
  if (err instanceof RetryableOrderError) return true;
  if (err instanceof Error && "retryable" in err && (err as any).retryable === true) return true;
  return false;
}
