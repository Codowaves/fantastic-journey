import { nanoid } from "nanoid";
import {
  CreateOrderInput,
  CreateOrderInputSchema,
  Order,
  OrderStatus,
  UpdateOrderStatusInput,
  UpdateOrderStatusInputSchema,
} from "./types.js";
import {
  OrderNotFoundError,
  DuplicateOrderError,
  InvalidStateTransitionError,
  TransientError,
} from "./errors.js";
import { logOrderEvent, logOrderError } from "./logger.js";
import {
  recordOrderCreated,
  recordOrderStatusChange,
  recordOrderError,
  recordOrderLatency,
} from "./metrics.js";
import { withRetry } from "./retry.js";

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export class OrderService {
  private orders = new Map<string, Order>();
  private idempotencyCache = new Map<string, string>();

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const startTime = Date.now();

    try {
      // Input validation
      const validated = CreateOrderInputSchema.parse(input);

      // Idempotency check
      if (validated.idempotencyKey) {
        const existingOrderId = this.idempotencyCache.get(validated.idempotencyKey);
        if (existingOrderId) {
          const existingOrder = this.orders.get(existingOrderId);
          if (existingOrder) {
            logOrderEvent(existingOrder.id, "duplicate_request_prevented", {
              idempotencyKey: validated.idempotencyKey,
            });
            throw new DuplicateOrderError(validated.idempotencyKey);
          }
        }
      }

      // Execute order creation with retry
      const order = await withRetry(
        async () => this.executeOrderCreation(validated),
        "create_order",
      );

      // Cache idempotency key
      if (validated.idempotencyKey) {
        this.idempotencyCache.set(validated.idempotencyKey, order.id);
      }

      recordOrderCreated(order.status);
      recordOrderLatency("create", Date.now() - startTime);
      logOrderEvent(order.id, "order_created", {
        customerId: order.customerId,
        total: order.total,
        itemCount: order.items.length,
      });

      return order;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      recordOrderError(err.name);
      logOrderError(undefined, err, { input });
      throw err;
    }
  }

  private async executeOrderCreation(input: CreateOrderInput): Promise<Order> {
    // Simulate potential transient failure
    if (Math.random() < 0.01) {
      throw new TransientError("Database temporarily unavailable");
    }

    const total = input.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const order: Order = {
      id: `ord_${nanoid(16)}`,
      customerId: input.customerId,
      items: input.items,
      total,
      currency: input.currency,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      idempotencyKey: input.idempotencyKey,
    };

    this.orders.set(order.id, order);
    return order;
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }
    return order;
  }

  async listOrders(customerId?: string): Promise<Order[]> {
    const orders = Array.from(this.orders.values());
    if (customerId) {
      return orders.filter((o) => o.customerId === customerId);
    }
    return orders;
  }

  async updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
    const startTime = Date.now();

    try {
      const validated = UpdateOrderStatusInputSchema.parse(input);
      const order = await this.getOrder(validated.orderId);

      // Validate state transition
      const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status];
      if (!allowedTransitions.includes(validated.status)) {
        throw new InvalidStateTransitionError(order.status, validated.status);
      }

      // Execute update with retry
      const updatedOrder = await withRetry(
        async () => this.executeStatusUpdate(order, validated.status),
        "update_status",
      );

      recordOrderStatusChange(order.status, validated.status);
      recordOrderLatency("update", Date.now() - startTime);
      logOrderEvent(updatedOrder.id, "status_updated", {
        from: order.status,
        to: validated.status,
      });

      return updatedOrder;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      recordOrderError(err.name);
      logOrderError(input.orderId, err, { input });
      throw err;
    }
  }

  private async executeStatusUpdate(order: Order, newStatus: OrderStatus): Promise<Order> {
    // Simulate potential transient failure
    if (Math.random() < 0.01) {
      throw new TransientError("Database temporarily unavailable");
    }

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      updatedAt: new Date(),
    };

    this.orders.set(order.id, updatedOrder);
    return updatedOrder;
  }

  async confirmOrder(orderId: string): Promise<Order> {
    return this.updateOrderStatus({ orderId, status: "confirmed" });
  }

  async shipOrder(orderId: string): Promise<Order> {
    return this.updateOrderStatus({ orderId, status: "shipped" });
  }

  async deliverOrder(orderId: string): Promise<Order> {
    return this.updateOrderStatus({ orderId, status: "delivered" });
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.updateOrderStatus({ orderId, status: "cancelled" });
  }

  // For testing
  _reset() {
    this.orders.clear();
    this.idempotencyCache.clear();
  }
}

export const orderService = new OrderService();
