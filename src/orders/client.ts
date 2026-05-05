import type { Order } from "./types.js";
import { validateCreateOrderInput, validateOrderId, validateConfirmOrderInput } from "./validate.js";
import {
  OrderNotFoundError,
  OrderAlreadyConfirmedError,
  isRetryable,
} from "./errors.js";

export interface Logger {
  info(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  debug(msg: string, data?: Record<string, unknown>): void;
}

const defaultLogger: Logger = {
  info: (msg, data) => console.log("[orders:info]", msg, data ?? {}),
  error: (msg, data) => console.error("[orders:error]", msg, data ?? {}),
  warn: (msg, data) => console.warn("[orders:warn]", msg, data ?? {}),
  debug: (msg, data) => console.debug("[orders:debug]", msg, data ?? {}),
};

export interface MetricsCollector {
  increment(metric: string, tags?: Record<string, string>): void;
  gauge(metric: string, value: number, tags?: Record<string, string>): void;
  histogram(metric: string, value: number, tags?: Record<string, string>): void;
}

const noOpMetrics: MetricsCollector = {
  increment: () => {},
  gauge: () => {},
  histogram: () => {},
};

export interface OrderStore {
  get(id: string): Promise<Order | null>;
  put(order: Order): Promise<void>;
  patch(id: string, patch: Partial<Order>): Promise<Order>;
  listByCustomer(customerId: string): Promise<Order[]>;
}

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export interface PipelineDeps {
  store: OrderStore;
  logger?: Logger;
  metrics?: MetricsCollector;
  retryOptions?: RetryOptions;
}

function generateOrderId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  opts: Required<RetryOptions>,
  logger: Logger,
  metrics: MetricsCollector,
  operation: string,
): Promise<T> {
  let attempt = 0;
  let start = 0;
  while (attempt < opts.maxAttempts) {
    attempt++;
    start = Date.now();
    try {
      const result = await fn();
      if (attempt > 1) {
        metrics.histogram("orders.retry.duration_ms", Date.now() - start, {
          operation,
          attempts: String(attempt),
          success: "true",
        });
        logger.info(`Retry succeeded`, { operation, attempts: attempt });
      }
      return result;
    } catch (err) {
      const isRetryableErr = isRetryable(err);
      if (!isRetryableErr) {
        metrics.histogram("orders.retry.duration_ms", Date.now() - start, {
          operation,
          attempts: String(attempt),
          success: "false",
        });
        if (attempt > 1) logger.error(`Retry exhausted`, { operation, attempts: attempt });
        throw err;
      }
      if (attempt >= opts.maxAttempts) {
        metrics.histogram("orders.retry.duration_ms", Date.now() - start, {
          operation,
          attempts: String(attempt),
          success: "false",
        });
        if (attempt > 1) logger.error(`Retry exhausted`, { operation, attempts: attempt });
        throw err;
      }
      const delay = Math.min(opts.baseDelayMs * Math.pow(2, attempt - 1), opts.maxDelayMs);
      logger.warn(`Retrying after ${delay}ms`, { operation, attempt, error: String(err) });
      metrics.increment("orders.retry.attempts", { operation });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unexpected: retry loop exited without throwing");
}

export class OrdersClient {
  private store: OrderStore;
  private logger: Logger;
  private metrics: MetricsCollector;
  private retryOpts: Required<RetryOptions>;

  constructor(deps: PipelineDeps) {
    this.store = deps.store;
    this.logger = deps.logger ?? defaultLogger;
    this.metrics = deps.metrics ?? noOpMetrics;
    this.retryOpts = {
      maxAttempts: deps.retryOptions?.maxAttempts ?? 3,
      baseDelayMs: deps.retryOptions?.baseDelayMs ?? 200,
      maxDelayMs: deps.retryOptions?.maxDelayMs ?? 10_000,
    };
  }

  async createOrder(input: unknown): Promise<Order> {
    this.metrics.increment("orders.create.attempts");
    this.logger.info("Creating order", { customerId: (input as any)?.customerId });

    const validated = validateCreateOrderInput(input);

    if (validated.idempotencyKey) {
      const idemKey = `idem_${validated.idempotencyKey}`;
      const existingIdem = await this.store.get(idemKey);
      if (existingIdem) {
        this.logger.info("Idempotency hit", { key: validated.idempotencyKey });
        const actualOrderId = existingIdem.idempotencyKey ?? existingIdem.id;
        const actualOrder = await this.store.get(actualOrderId);
        if (actualOrder) return actualOrder;
        return { ...existingIdem, id: actualOrderId };
      }
    }

    const orderId = generateOrderId();
    const now = new Date().toISOString();
    const total = validated.items.reduce((sum, item) => sum + item.priceUsd * item.qty, 0);

    const order: Order = {
      id: orderId,
      customerId: validated.customerId,
      items: validated.items.map((it) => ({
        id: it.id,
        name: it.id,
        qty: it.qty,
        priceUsd: it.priceUsd,
      })),
      total: Math.round(total * 100) / 100,
      currency: validated.currency ?? "USD",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    if (validated.idempotencyKey) {
      const idemRecord: Order = { ...order, id: `idem_${validated.idempotencyKey}`, idempotencyKey: order.id };
      await this.store.put(idemRecord);
    }
    await this.store.put(order);
    this.metrics.increment("orders.create.success");
    this.logger.info("Order created", { orderId, total: order.total, currency: order.currency });
    return order;
  }

  async confirmOrder(input: unknown): Promise<Order> {
    this.metrics.increment("orders.confirm.attempts");
    const validated = validateConfirmOrderInput(input);
    const orderId = validated.orderId;
    this.logger.info("Confirming order", { orderId });

    const order = await this.store.get(orderId);
    if (!order) {
      this.metrics.increment("orders.confirm.error", { type: "not_found" });
      throw new OrderNotFoundError(orderId);
    }
    if (order.status !== "pending") {
      this.metrics.increment("orders.confirm.error", { type: "already_confirmed" });
      throw new OrderAlreadyConfirmedError(orderId);
    }

    const updated = await this.store.patch(orderId, { status: "confirmed", updatedAt: new Date().toISOString() });
    this.metrics.increment("orders.confirm.success");
    this.logger.info("Order confirmed", { orderId });
    return updated;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const id = validateOrderId(orderId);
    return this.store.get(id);
  }

  async listOrders(customerId: string): Promise<Order[]> {
    return this.store.listByCustomer(customerId);
  }
}

export function createOrdersClient(deps: PipelineDeps): OrdersClient {
  return new OrdersClient(deps);
}
