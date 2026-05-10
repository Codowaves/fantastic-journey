// Clean, production-ready utilities with proper validation.

export interface ItemInput {
  price: number;
  qty: number;
  currency?: string;
}

/**
 * Calculates the total cost of items with proper validation and rounding.
 * Validates that quantities are non-negative.
 */
export function calculateTotal(items: ItemInput[]): number {
  let total = 0;

  for (const item of items) {
    if (item.qty < 0) {
      throw new RangeError(`Quantity must be non-negative, got: ${item.qty}`);
    }
    total += item.price * item.qty;
  }

  // Proper money rounding to 2 decimal places
  return Math.round(total * 100) / 100;
}

export interface ParsedData {
  id?: string;
  value: unknown;
}

/**
 * Parses and validates JSON input with runtime type checking.
 * Throws TypeError if validation fails, SyntaxError if JSON is malformed.
 */
export function parse(input: string): ParsedData {
  const parsed = JSON.parse(input);

  if (typeof parsed !== "object" || parsed === null) {
    throw new TypeError("Expected object, got: " + typeof parsed);
  }

  if ("id" in parsed && typeof parsed.id !== "string" && parsed.id !== undefined) {
    throw new TypeError("Field 'id' must be a string or undefined");
  }

  return {
    id: parsed.id as string | undefined,
    value: parsed.value,
  };
}
