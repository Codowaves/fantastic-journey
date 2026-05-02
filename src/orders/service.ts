import { validateCreateOrderInput } from "./validation.js";
import { checkIdempotency, recordIdempotency } from "./idempotency.js";
import { withRetry } from "./retries.js";
import { logger } from "./logger.js";
import { metrics } from "./metrics.js";
import { AlertManager } from "./alerts.js";
import { OrderNotFoundError, TransientFailureError } from "./errors.js";
import type { Order, OrderStatus, CreateOrderInput, AlertConfig } from "./types.js";

function calculateTotal(items: CreateOrderInput["items"], _currency: string): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export class OrderService {
  private orders = new Map<string, Order>();
  private alertManager: AlertManager | null = null;

  constructor(alertConfig?: AlertConfig) {
    if (alertConfig) {
      this.alertManager = new AlertManager(alertConfig);
    }
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const startTime = Date.now();
    logger.info("Creating order", { customerId: input.customerId, idempotencyKey: input.idempotencyKey });

    const existing = checkIdempotency(input.idempotencyKey);
    if (existing) {
      logger.info("Order retrieved from idempotency cache", { orderId: existing.id });
      return existing;
    }

    validateCreateOrderInput(input);

    try {
      const order = await withRetry(async () => {
        const now = Date.now();
        const order: Order = {
          id: `ord_${now}_${Math.random().toString(36).slice(2, 9)}`,
          customerId: input.customerId,
          items: input.items,
          total: calculateTotal(input.items, input.currency ?? "USD"),
          currency: input.currency ?? "USD",
          status: "pending",
          createdAt: now,
          updatedAt: now,
        };
        return order;
      });

      recordIdempotency(input.idempotencyKey, order);
      this.orders.set(order.id, order);
      metrics.incrementOrdersCreated();
      metrics.recordLatency("createOrder", Date.now() - startTime);
      this.alertManager?.recordSuccess();

      logger.info("Order created", { orderId: order.id, status: order.status });
      return order;
    } catch (err) {
      metrics.incrementOrdersFailed();
      this.alertManager?.incrementErrors();
      logger.error("Order creation failed", { error: (err as Error).message });
      throw err;
    }
  }

  async confirmOrder(orderId: string): Promise<Order> {
    const startTime = Date.now();
    logger.info("Confirming order", { orderId });

    const order = this.orders.get(orderId);
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    if (order.status !== "pending") {
      throw new TransientFailureError(`Order ${orderId} cannot be confirmed in status ${order.status}`, false);
    }

    order.status = "confirmed";
    order.updatedAt = Date.now();
    metrics.incrementOrdersConfirmed();
    metrics.recordLatency("confirmOrder", Date.now() - startTime);

    logger.info("Order confirmed", { orderId, status: order.status });
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    order.status = status;
    order.updatedAt = Date.now();
    logger.info("Order status updated", { orderId, status });

    return order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) ?? null;
  }

  async listOrders(customerId?: string): Promise<Order[]> {
    const all = Array.from(this.orders.values());
    if (customerId) {
      return all.filter((o) => o.customerId === customerId);
    }
    return all;
  }

  getMetrics() {
    return metrics.getMetrics();
  }

  stopAlerts(): void {
    this.alertManager?.stop();
  }
}

export function createOrderService(alertConfig?: AlertConfig): OrderService {
  return new OrderService(alertConfig);
}