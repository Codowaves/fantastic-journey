export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  idempotencyKey?: string;
}

export interface CreateOrderInput {
  customerId: string;
  items: OrderItem[];
  currency?: string;
  idempotencyKey?: string;
}

export interface OrderEvent {
  orderId: string;
  type:
    | "order_created"
    | "order_confirmed"
    | "order_processing"
    | "order_shipped"
    | "order_delivered"
    | "order_cancelled"
    | "order_refunded";
  timestamp: Date;
  payload?: unknown;
}

export interface ProcessedOrder {
  order: Order;
  events: OrderEvent[];
}
