// Service
export { OrderService, orderService } from "./service.js";

// SDK
export { OrdersSDK, createOrdersClient } from "./sdk.js";

// Types
export type {
  Order,
  OrderStatus,
  OrderItem,
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "./types.js";
export {
  OrderSchema,
  OrderStatusSchema,
  OrderItemSchema,
  CreateOrderInputSchema,
  UpdateOrderStatusInputSchema,
} from "./types.js";

// Errors
export {
  OrderError,
  ValidationError,
  OrderNotFoundError,
  DuplicateOrderError,
  TransientError,
  InvalidStateTransitionError,
} from "./errors.js";

// Utilities
export { logger, createOrderLogger, logOrderEvent, logOrderError } from "./logger.js";
export { metrics, getMetricsSummary } from "./metrics.js";
export { withRetry } from "./retry.js";
export { alertManager } from "./alerts.js";
