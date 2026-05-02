import { OrderValidationError } from "./errors.js";
import type { CreateOrderInput } from "./types.js";

const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
const MAX_ITEMS = 100;
const MAX_QTY_PER_ITEM = 10000;

export function validateCreateOrderInput(input: CreateOrderInput): void {
  if (!input.customerId || typeof input.customerId !== "string") {
    throw new OrderValidationError("customerId is required and must be a string", "customerId");
  }

  if (input.customerId.length < 3 || input.customerId.length > 50) {
    throw new OrderValidationError("customerId must be between 3 and 50 characters", "customerId");
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new OrderValidationError("items must be a non-empty array", "items");
  }

  if (input.items.length > MAX_ITEMS) {
    throw new OrderValidationError(`items cannot exceed ${MAX_ITEMS} items`, "items");
  }

  for (const item of input.items) {
    if (!item.id || typeof item.id !== "string") {
      throw new OrderValidationError("each item must have a string id", "items");
    }
    if (typeof item.qty !== "number" || item.qty <= 0 || item.qty > MAX_QTY_PER_ITEM) {
      throw new OrderValidationError(`item qty must be between 1 and ${MAX_QTY_PER_ITEM}`, "items");
    }
  }

  const currency = input.currency ?? "USD";
  if (!SUPPORTED_CURRENCIES.includes(currency as typeof SUPPORTED_CURRENCIES[number])) {
    throw new OrderValidationError(`currency must be one of ${SUPPORTED_CURRENCIES.join(", ")}`, "currency");
  }

  if (!input.idempotencyKey || typeof input.idempotencyKey !== "string") {
    throw new OrderValidationError("idempotencyKey is required and must be a string", "idempotencyKey");
  }
}