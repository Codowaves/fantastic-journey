export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  priceUsd: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  idempotencyKey?: string;
}

export interface CreateOrderInput {
  customerId: string;
  items: Array<{ id: string; qty: number; priceUsd: number }>;
  currency?: string;
  idempotencyKey?: string;
}

export interface ConfirmOrderInput {
  orderId: string;
  idempotencyKey?: string;
}

export interface OrderError {
  code: string;
  message: string;
  retryable: boolean;
}

export const ORDER_ERRORS = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  IDEMPOTENCY_CONFLICT: "IDEMPOTENCY_CONFLICT",
  ALREADY_CONFIRMED: "ALREADY_CONFIRMED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
