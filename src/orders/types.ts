import { z } from "zod";

export const OrderStatusSchema = z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.number().positive(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const CreateOrderInputSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(OrderItemSchema).min(1),
  currency: z.enum(["USD", "EUR", "GBP", "JPY"]),
  idempotencyKey: z.string().min(1).optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(OrderItemSchema),
  total: z.number(),
  currency: z.string(),
  status: OrderStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  idempotencyKey: z.string().optional(),
});
export type Order = z.infer<typeof OrderSchema>;

export const UpdateOrderStatusInputSchema = z.object({
  orderId: z.string().min(1),
  status: OrderStatusSchema,
});
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusInputSchema>;
