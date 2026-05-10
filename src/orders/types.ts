import { z } from "zod";

export const OrderStatusSchema = z.enum(["pending", "confirmed", "shipped", "delivered", "failed"]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string().min(1),
  qty: z.number().int().positive(),
  pricePerUnit: z.number().nonnegative(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  items: z.array(OrderItemSchema).min(1),
  total: z.number().nonnegative(),
  status: OrderStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  idempotencyKey: z.string().optional(),
});
export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderInputSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
  idempotencyKey: z.string().optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

export interface OrderMetrics {
  ordersCreated: number;
  ordersConfirmed: number;
  ordersFailed: number;
  totalRevenue: number;
  errorRate: number;
  averageOrderValue: number;
}

export class OrderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "OrderError";
  }
}

export class ValidationError extends OrderError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", false);
    this.name = "ValidationError";
  }
}

export class IdempotencyError extends OrderError {
  constructor(message: string, public readonly existingOrder: Order) {
    super(message, "IDEMPOTENCY_ERROR", false);
    this.name = "IdempotencyError";
  }
}

export class TransientError extends OrderError {
  constructor(message: string) {
    super(message, "TRANSIENT_ERROR", true);
    this.name = "TransientError";
  }
}
