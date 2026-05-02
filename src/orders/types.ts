export interface OrderItem {
  id: string;
  qty: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "failed";

export interface CreateOrderInput {
  customerId: string;
  items: OrderItem[];
  currency?: string;
  idempotencyKey: string;
}

export interface OrderMetrics {
  ordersCreated: number;
  ordersConfirmed: number;
  ordersFailed: number;
  retryCount: number;
  averageLatencyMs: number;
}

export interface AlertConfig {
  errorRateThreshold: number;
  latencyThresholdMs: number;
  checkIntervalMs: number;
}