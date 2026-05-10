import {
  CreateOrderInputSchema,
  IdempotencyError,
  OrderSchema,
  TransientError,
  ValidationError,
  type CreateOrderInput,
  type Order,
  type OrderStatus,
} from "./types.js";
import { logger } from "./logger.js";
import { metrics } from "./metrics.js";
import { withRetry } from "./retry.js";

class OrderService {
  private orders = new Map<string, Order>();
  private idempotencyKeys = new Map<string, Order>();

  async createOrder(input: CreateOrderInput): Promise<Order> {
    logger.info("Creating order", { customerId: input.customerId, itemCount: input.items.length });

    try {
      const validatedInput = CreateOrderInputSchema.parse(input);

      if (validatedInput.idempotencyKey) {
        const existing = this.idempotencyKeys.get(validatedInput.idempotencyKey);
        if (existing) {
          logger.info("Idempotency key match, returning existing order", {
            orderId: existing.id,
            idempotencyKey: validatedInput.idempotencyKey,
          });
          throw new IdempotencyError(
            "Order with this idempotency key already exists",
            existing,
          );
        }
      }

      const order = await withRetry(
        async () => this.performCreateOrder(validatedInput),
        { maxAttempts: 3 },
      );

      metrics.incrementOrdersCreated(order.total);

      if (metrics.shouldAlert()) {
        logger.warn("High error rate detected", { metrics: metrics.getMetrics() });
      }

      return order;
    } catch (error) {
      if (error instanceof IdempotencyError) {
        return error.existingOrder;
      }

      metrics.incrementOrdersFailed();
      logger.error("Failed to create order", error as Error, {
        customerId: input.customerId,
      });
      throw error;
    }
  }

  private async performCreateOrder(input: CreateOrderInput): Promise<Order> {
    const total = input.items.reduce((sum, item) => sum + item.pricePerUnit * item.qty, 0);

    if (Math.random() < 0.05) {
      throw new TransientError("Simulated transient failure");
    }

    const now = new Date();
    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      customerId: input.customerId,
      items: input.items,
      total,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      idempotencyKey: input.idempotencyKey,
    };

    const validated = OrderSchema.parse(order);

    this.orders.set(validated.id, validated);
    if (validated.idempotencyKey) {
      this.idempotencyKeys.set(validated.idempotencyKey, validated);
    }

    logger.info("Order created successfully", {
      orderId: validated.id,
      total: validated.total,
      status: validated.status,
    });

    return validated;
  }

  async confirmOrder(orderId: string): Promise<Order> {
    logger.info("Confirming order", { orderId });

    const order = this.orders.get(orderId);
    if (!order) {
      throw new ValidationError(`Order ${orderId} not found`);
    }

    if (order.status !== "pending") {
      throw new ValidationError(`Order ${orderId} cannot be confirmed (status: ${order.status})`);
    }

    const confirmed = await withRetry(
      async () => {
        if (Math.random() < 0.03) {
          throw new TransientError("Simulated transient failure during confirmation");
        }

        const updated: Order = {
          ...order,
          status: "confirmed",
          updatedAt: new Date(),
        };

        this.orders.set(orderId, updated);
        return updated;
      },
      { maxAttempts: 3 },
    );

    metrics.incrementOrdersConfirmed();
    logger.info("Order confirmed successfully", { orderId, status: confirmed.status });

    return confirmed;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    logger.debug("Fetching order", { orderId });
    return this.orders.get(orderId) ?? null;
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus | null> {
    logger.debug("Fetching order status", { orderId });
    const order = this.orders.get(orderId);
    return order?.status ?? null;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    logger.info("Updating order status", { orderId, status });

    const order = this.orders.get(orderId);
    if (!order) {
      throw new ValidationError(`Order ${orderId} not found`);
    }

    const updated: Order = {
      ...order,
      status,
      updatedAt: new Date(),
    };

    this.orders.set(orderId, updated);
    logger.info("Order status updated successfully", { orderId, oldStatus: order.status, newStatus: status });

    return updated;
  }

  getMetrics() {
    return metrics.getMetrics();
  }

  clearOrders(): void {
    this.orders.clear();
    this.idempotencyKeys.clear();
    metrics.reset();
  }
}

export const orderService = new OrderService();
