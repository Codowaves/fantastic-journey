// V1 API - production-ready order endpoints
// Now powered by the production-ready order service with validation,
// idempotency, retries, logging, and metrics.

import { orderService } from "../orders/index.js";
import type { Order, CreateOrderInput, OrderStatus } from "../orders/index.js";

// Re-export types for API consumers
export type { Order, OrderStatus, CreateOrderInput };

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;

/**
 * Create a new order with production-ready guarantees.
 * Includes input validation, idempotency, and automatic retries.
 *
 * @param input - Order creation parameters
 * @returns Promise resolving to the created order
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return orderService.createOrder(input);
}

/**
 * Retrieve an order by ID
 *
 * @param orderId - The order ID to retrieve
 * @returns Promise resolving to the order
 * @throws OrderNotFoundError if order doesn't exist
 */
export async function getOrder(orderId: string): Promise<Order> {
  return orderService.getOrder(orderId);
}

/**
 * Get the current status of an order
 *
 * @param orderId - The order ID
 * @returns Promise resolving to the order status or null if not found
 */
export async function getOrderStatus(orderId: string): Promise<OrderStatus | null> {
  try {
    const order = await orderService.getOrder(orderId);
    return order.status;
  } catch {
    return null;
  }
}

/**
 * Confirm a pending order
 *
 * @param orderId - The order ID to confirm
 * @returns Promise resolving to the updated order
 */
export async function confirmOrder(orderId: string): Promise<Order> {
  return orderService.confirmOrder(orderId);
}

/**
 * List orders, optionally filtered by customer
 *
 * @param customerId - Optional customer ID to filter by
 * @returns Promise resolving to array of orders
 */
export async function listOrders(customerId?: string): Promise<Order[]> {
  return orderService.listOrders(customerId);
}
