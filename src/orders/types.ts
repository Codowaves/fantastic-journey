export interface OrderItem {
  id: string;
  qty: number;
}

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
  idempotencyKey?: string;
}

export type OrderStatus = Order["status"];

export interface OrderInput {
  customerId: string;
  items: OrderItem[];
  idempotencyKey?: string;
}

export interface ProcessedResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  retryable: boolean;
  idempotencyKey?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: OrderInput;
}

export function validateOrderItem(
  item: unknown,
): { valid: true; data: OrderItem } | { valid: false; error: string } {
  if (item === null || item === undefined) {
    return { valid: false, error: "item is required" };
  }
  const obj = item as Record<string, unknown>;

  if (typeof obj.id !== "string" || obj.id.length === 0) {
    return { valid: false, error: "item.id must be a non-empty string" };
  }
  if (
    typeof obj.qty !== "number" ||
    !Number.isInteger(obj.qty) ||
    obj.qty <= 0
  ) {
    return { valid: false, error: "item.qty must be a positive integer" };
  }

  return { valid: true, data: { id: obj.id, qty: obj.qty } };
}

export function validateOrderInput(input: unknown): ValidationResult {
  if (input === null || input === undefined || typeof input !== "object") {
    return { valid: false, error: "input must be an object" };
  }

  const obj = input as Record<string, unknown>;

  if (typeof obj.customerId !== "string" || obj.customerId.length === 0) {
    return {
      valid: false,
      error: "customerId is required and must be a non-empty string",
    };
  }

  if (!Array.isArray(obj.items) || obj.items.length === 0) {
    return { valid: false, error: "items must be a non-empty array" };
  }

  const validatedItems: OrderItem[] = [];
  const errors: string[] = [];

  for (let i = 0; i < obj.items.length; i++) {
    const itemResult = validateOrderItem(obj.items[i]);
    if (itemResult.valid) {
      validatedItems.push(itemResult.data);
    } else {
      errors.push(`items[${i}]: ${itemResult.error}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join("; ") };
  }

  return {
    valid: true,
    data: {
      customerId: obj.customerId as string,
      items: validatedItems,
      idempotencyKey:
        typeof obj.idempotencyKey === "string" ? obj.idempotencyKey : undefined,
    },
  };
}
