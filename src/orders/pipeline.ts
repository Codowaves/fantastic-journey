import { randomUUID } from "crypto";
import type {
  Order,
  CreateOrderInput,
  OrderEvent,
  ProcessedOrder,
} from "./types.js";
import { validateCreateOrderInput, ValidationError } from "./validation.js";
import {
  IdempotencyError,
  type IdempotencyStore,
  checkIdempotency,
} from "./idempotency.js";
import { withRetry, RetryExhaustedError, isRetryableError } from "./retry.js";
import { logger, metrics, createErrorRateAlert } from "./logging.js";

export interface PipelineConfig {
  idempotencyStore: IdempotencyStore;
  enableRetry?: boolean;
  errorRateAlert?: ReturnType<typeof createErrorRateAlert>;
}

function computeTotal(items: CreateOrderInput["items"]): number {
  const sum = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );
  return Math.round(sum * 100) / 100;
}

function makeEvent(
  type: OrderEvent["type"],
  orderId: string,
  payload?: unknown,
): OrderEvent {
  return { orderId, type, timestamp: new Date(), payload };
}

export class OrdersPipeline {
  private store: IdempotencyStore;
  private enableRetry: boolean;
  private errorRateAlert?: ReturnType<typeof createErrorRateAlert>;

  constructor(config: PipelineConfig) {
    this.store = config.idempotencyStore;
    this.enableRetry = config.enableRetry ?? true;
    this.errorRateAlert = config.errorRateAlert;
  }

  async createOrder(rawInput: unknown): Promise<ProcessedOrder> {
    const input = validateCreateOrderInput(rawInput);

    if (input.idempotencyKey) {
      const existing = checkIdempotency(this.store, input.idempotencyKey);
      if (existing) {
        logger.info("Idempotency hit", {
          orderId: existing.id,
          customerId: existing.customerId,
        });
        metrics.idempotencyHit({ currency: existing.currency });
        return { order: existing, events: [] };
      }
    }

    const orderId = `ord_${randomUUID()}`;
    const now = new Date();
    const total = computeTotal(input.items);

    const order: Order = {
      id: orderId,
      customerId: input.customerId,
      items: input.items,
      total,
      currency: input.currency ?? "USD",
      status: "pending",
      createdAt: now,
      updatedAt: now,
      idempotencyKey: input.idempotencyKey,
    };

    const event = makeEvent("order_created", orderId);
    logger.info("Order created", { orderId, customerId: order.customerId });

    if (input.idempotencyKey) {
      this.store.set(input.idempotencyKey, order);
    }
    this.store.set(order.id, order);

    metrics.orderCreated({ currency: order.currency });

    return { order, events: [event] };
  }

  async confirmOrder(orderId: string): Promise<ProcessedOrder> {
    return this.transitionOrder(orderId, "confirmed", "order_confirmed");
  }

  async processOrder(orderId: string): Promise<ProcessedOrder> {
    return this.transitionOrder(orderId, "processing", "order_processing");
  }

  async shipOrder(orderId: string): Promise<ProcessedOrder> {
    return this.transitionOrder(orderId, "shipped", "order_shipped");
  }

  async deliverOrder(orderId: string): Promise<ProcessedOrder> {
    return this.transitionOrder(orderId, "delivered", "order_delivered");
  }

  async cancelOrder(orderId: string): Promise<ProcessedOrder> {
    return this.transitionOrder(orderId, "cancelled", "order_cancelled");
  }

  private async transitionOrder(
    orderId: string,
    newStatus: Order["status"],
    eventType: OrderEvent["type"],
  ): Promise<ProcessedOrder> {
    const fn = async (): Promise<ProcessedOrder> => {
      const existing = this.store.get(orderId);
      if (!existing) {
        throw new Error(`Order ${orderId} not found`);
      }

      const updated: Order = {
        ...existing,
        status: newStatus,
        updatedAt: new Date(),
      };
      this.store.set(orderId, updated);

      const evt = makeEvent(eventType, orderId);
      logger.info(`Order ${eventType.replace("order_", "")}`, {
        orderId,
        customerId: updated.customerId,
      });

      if (eventType === "order_confirmed")
        metrics.orderConfirmed({ currency: updated.currency });

      return { order: updated, events: [evt] };
    };

    if (this.enableRetry) {
      return withRetry(fn, { maxAttempts: 3 });
    }
    return fn();
  }
}

export {
  ValidationError,
  IdempotencyError,
  RetryExhaustedError,
  isRetryableError,
};
export { validateCreateOrderInput, checkIdempotency, withRetry };
