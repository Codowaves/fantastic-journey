// Orders SDK — production-ready order pipeline
//
// Usage:
//   import { createOrdersSdk } from "./orders/sdk.js";
//   const sdk = createOrdersSdk({ store: myStore });
//   const order = await sdk.orders.create(input);

export { createOrdersClient as createOrdersSdk } from "./client.js";
export type { OrdersClient } from "./client.js";
export type { Order, OrderStatus, OrderItem, CreateOrderInput, ConfirmOrderInput } from "./types.js";
export type { OrderStore, Logger, MetricsCollector, RetryOptions, PipelineDeps } from "./client.js";
export { createAlertsManager } from "./alerts.js";
export type { AlertConfig, OrderAlert } from "./alerts.js";
export {
  OrderValidationError,
  OrderNotFoundError,
  IdempotencyConflictError,
  OrderAlreadyConfirmedError,
  RetryableOrderError,
  isRetryable,
} from "./errors.js";
export { validateCreateOrderInput, validateOrderId } from "./validate.js";
