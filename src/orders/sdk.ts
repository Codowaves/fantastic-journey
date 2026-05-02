import { createOrderService, type Order, type CreateOrderInput, type OrderMetrics, type AlertConfig } from "./index.js";

export interface OrdersSDKConfig {
  alertConfig?: AlertConfig;
}

export class OrdersSDK {
  private service = createOrderService();

  constructor(config: OrdersSDKConfig = {}) {
    if (config.alertConfig) {
      this.service = createOrderService(config.alertConfig);
    }
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    return this.service.createOrder(input);
  }

  async confirmOrder(orderId: string): Promise<Order> {
    return this.service.confirmOrder(orderId);
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.service.getOrder(orderId);
  }

  async listOrders(customerId?: string): Promise<Order[]> {
    return this.service.listOrders(customerId);
  }

  async updateStatus(orderId: string, status: Order["status"]): Promise<Order> {
    return this.service.updateStatus(orderId, status);
  }

  getMetrics(): OrderMetrics {
    return this.service.getMetrics();
  }

  shutdown(): void {
    this.service.stopAlerts();
  }
}

export function createOrdersSDK(config?: OrdersSDKConfig): OrdersSDK {
  return new OrdersSDK(config);
}
