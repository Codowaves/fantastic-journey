import type { CreateOrderInput, ConfirmOrderInput } from "./types.js";
import { OrderValidationError } from "./errors.js";

const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

function isSupportedCurrency(v: string): v is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(v);
}

export function validateCreateOrderInput(input: unknown): CreateOrderInput {
  if (input === null || input === undefined) {
    throw new OrderValidationError("Input is required");
  }
  if (typeof input !== "object") {
    throw new OrderValidationError("Input must be an object");
  }
  const obj = input as Record<string, unknown>;

  if (typeof obj.customerId !== "string" || obj.customerId.trim() === "") {
    throw new OrderValidationError("customerId must be a non-empty string");
  }
  if (!Array.isArray(obj.items) || obj.items.length === 0) {
    throw new OrderValidationError("items must be a non-empty array");
  }
  for (const item of obj.items) {
    if (typeof item !== "object" || item === null) {
      throw new OrderValidationError("Each item must be an object");
    }
    const it = item as Record<string, unknown>;
    if (typeof it.id !== "string" || it.id.trim() === "") {
      throw new OrderValidationError("item.id must be a non-empty string");
    }
    if (typeof it.qty !== "number" || !Number.isInteger(it.qty) || it.qty <= 0) {
      throw new OrderValidationError("item.qty must be a positive integer");
    }
    if (typeof it.priceUsd !== "number" || it.priceUsd < 0) {
      throw new OrderValidationError("item.priceUsd must be a non-negative number");
    }
  }
  if (obj.currency !== undefined) {
    if (typeof obj.currency !== "string" || !isSupportedCurrency(obj.currency)) {
      throw new OrderValidationError(`currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}`);
    }
  }
  if (obj.idempotencyKey !== undefined && typeof obj.idempotencyKey !== "string") {
    throw new OrderValidationError("idempotencyKey must be a string");
  }

  return {
    customerId: (obj.customerId as string).trim(),
    items: obj.items as CreateOrderInput["items"],
    currency: obj.currency !== undefined ? (obj.currency as SupportedCurrency) : "USD",
    idempotencyKey: obj.idempotencyKey as string | undefined,
  };
}

export function validateOrderId(orderId: unknown): string {
  if (typeof orderId !== "string" || orderId.trim() === "") {
    throw new OrderValidationError("orderId must be a non-empty string");
  }
  return orderId.trim();
}

export function validateConfirmOrderInput(input: unknown): ConfirmOrderInput {
  if (input === null || input === undefined) {
    throw new OrderValidationError("Input is required");
  }
  if (typeof input !== "object") {
    throw new OrderValidationError("Input must be an object");
  }
  const obj = input as Record<string, unknown>;
  if (typeof obj.orderId !== "string" || obj.orderId.trim() === "") {
    throw new OrderValidationError("orderId must be a non-empty string");
  }
  if (obj.idempotencyKey !== undefined && typeof obj.idempotencyKey !== "string") {
    throw new OrderValidationError("idempotencyKey must be a string");
  }
  return {
    orderId: obj.orderId.trim(),
    idempotencyKey: obj.idempotencyKey as string | undefined,
  };
}
