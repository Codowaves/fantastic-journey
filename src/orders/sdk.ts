import { orderService } from "./service.js";
import type { CreateOrderInput, Order, OrderMetrics, OrderStatus } from "./types.js";

export class OrdersSDK {
  async createOrder(input: CreateOrderInput): Promise<Order> {
    return orderService.createOrder(input);
  }

  async confirmOrder(orderId: string): Promise<Order> {
    return orderService.confirmOrder(orderId);
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return orderService.getOrder(orderId);
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus | null> {
    return orderService.getOrderStatus(orderId);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return orderService.updateOrderStatus(orderId, status);
  }

  getMetrics(): Readonly<OrderMetrics> {
    return orderService.getMetrics();
  }
}

export const sdk = new OrdersSDK();
