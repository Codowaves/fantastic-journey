/**
 * Orders SDK - Consumer-friendly interface for the orders pipeline
 *
 * @example
 * ```typescript
 * import { createOrdersSdk, OrderStatus } from './orders/sdk.js';
 *
 * const sdk = createOrdersSdk();
 *
 * // Create an order
 * const result = await sdk.createOrder({
 *   customerId: 'cust_123',
 *   items: [{ id: 'item_1', qty: 2 }]
 * });
 *
 * if (result.success && result.data) {
 *   console.log('Order created:', result.data.id);
 * }
 *
 * // Confirm the order
 * const confirmResult = await sdk.confirmOrder(result.data!.id);
 * ```
 */

import { OrdersPipeline } from "./pipeline.js";
import type {
  Order,
  OrderItem,
  OrderStatus,
  ProcessedResult,
} from "./types.js";

export type { Order, OrderItem, OrderStatus, ProcessedResult };

export interface SdkConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export interface CreateOrderResult extends ProcessedResult<Order> {}

export interface ConfirmOrderResult extends ProcessedResult<Order> {}

export interface GetOrderStatusResult extends ProcessedResult<OrderStatus> {}

export class OrdersSdk {
  private pipeline: OrdersPipeline;

  constructor(config: SdkConfig = {}) {
    this.pipeline = new OrdersPipeline(config);
  }

  /**
   * Create a new order with input validation and idempotency support
   */
  async createOrder(input: {
    customerId: string;
    items: OrderItem[];
    idempotencyKey?: string;
  }): Promise<CreateOrderResult> {
    return this.pipeline.processOrder(input);
  }

  /**
   * Confirm a pending order by ID
   */
  async confirmOrder(orderId: string): Promise<ConfirmOrderResult> {
    return this.pipeline.confirmOrder(orderId);
  }

  /**
   * Get current order status
   */
  async getOrderStatus(orderId: string): Promise<GetOrderStatusResult> {
    return this.pipeline.getOrderStatus(orderId);
  }

  /**
   * Get full order details
   */
  async getOrder(orderId: string): Promise<Order | null> {
    return this.pipeline.getOrder(orderId);
  }

  /**
   * Get pipeline metrics for monitoring
   */
  getMetrics() {
    return this.pipeline.getMetrics();
  }

  /**
   * Get structured logs for debugging
   */
  getLogs() {
    return this.pipeline.getLogger().getLogs();
  }
}

/**
 * Factory function to create a new OrdersSdk instance
 */
export function createOrdersSdk(config?: SdkConfig): OrdersSdk {
  return new OrdersSdk(config);
}

export default OrdersSdk;
