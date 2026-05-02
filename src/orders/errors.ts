export class OrderValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
    this.name = "OrderNotFoundError";
  }
}

export class IdempotencyError extends Error {
  constructor(key: string) {
    super(`Duplicate idempotency key: ${key}`);
    this.name = "IdempotencyError";
  }
}

export class TransientFailureError extends Error {
  constructor(message: string, public retryable = true) {
    super(message);
    this.name = "TransientFailureError";
  }
}