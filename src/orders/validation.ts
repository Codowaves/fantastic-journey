import type { CreateOrderInput } from "./types.js";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

function isValidItem(
  item: unknown,
): item is { id: string; name: string; quantity: number; unitPrice: number } {
  if (typeof item !== "object" || item === null) return false;
  const { id, name, quantity, unitPrice } = item as Record<string, unknown>;
  return (
    typeof id === "string" &&
    id.length > 0 &&
    typeof name === "string" &&
    name.length > 0 &&
    typeof quantity === "number" &&
    quantity > 0 &&
    Number.isInteger(quantity) &&
    typeof unitPrice === "number" &&
    unitPrice >= 0
  );
}

export function validateCreateOrderInput(input: unknown): CreateOrderInput {
  if (typeof input !== "object" || input === null) {
    throw new ValidationError("Input must be an object");
  }

  const { customerId, items, currency, idempotencyKey } = input as Record<
    string,
    unknown
  >;

  if (typeof customerId !== "string" || !customerId.trim()) {
    throw new ValidationError("customerId must be a non-empty string");
  }

  if (!isValidUUID(customerId)) {
    throw new ValidationError("customerId must be a valid UUID");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("items must be a non-empty array");
  }

  for (const item of items) {
    if (!isValidItem(item)) {
      throw new ValidationError(
        "Each item must have id (string), name (string), quantity (positive integer), unitPrice (non-negative number)",
      );
    }
  }

  if (currency !== undefined && typeof currency !== "string") {
    throw new ValidationError("currency must be a string");
  }

  if (
    idempotencyKey !== undefined &&
    (typeof idempotencyKey !== "string" || idempotencyKey.length === 0)
  ) {
    throw new ValidationError("idempotencyKey must be a non-empty string");
  }

  return {
    customerId,
    items: items.map((i) => i as CreateOrderInput["items"][number]),
    currency: (currency as string | undefined) ?? "USD",
    idempotencyKey: idempotencyKey as string | undefined,
  };
}
