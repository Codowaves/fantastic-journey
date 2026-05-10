import type {
  CreateOrderInput,
  Order,
  OrderStatus,
} from "./types.js";
import { orderService } from "./service.js";

export interface OrdersSDKConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export class OrdersSDK {
  private config: Required<OrdersSDKConfig>;

  constructor(config: OrdersSDKConfig = {}) {
    this.config = {
      apiKey: config.apiKey || "",
      baseUrl: config.baseUrl || "http://localhost:3000",
      timeout: config.timeout || 30000,
    };
    // In a real implementation, this would make HTTP calls
    // For now, we use the shared service instance
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    return orderService.createOrder(input);
  }

  async getOrder(orderId: string): Promise<Order> {
    return orderService.getOrder(orderId);
  }

  async listOrders(customerId?: string): Promise<Order[]> {
    return orderService.listOrders(customerId);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return orderService.updateOrderStatus({ orderId, status });
  }

  async confirmOrder(orderId: string): Promise<Order> {
    return orderService.confirmOrder(orderId);
  }

  async shipOrder(orderId: string): Promise<Order> {
    return orderService.shipOrder(orderId);
  }

  async deliverOrder(orderId: string): Promise<Order> {
    return orderService.deliverOrder(orderId);
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return orderService.cancelOrder(orderId);
  }
}

export function createOrdersClient(config?: OrdersSDKConfig): OrdersSDK {
  return new OrdersSDK(config);
}
