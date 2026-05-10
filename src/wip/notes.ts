// Calculation utilities for order processing

export interface CurrencyAmount {
  value: number;
  currency: string;
}

export function calculateTotal(
  items: { price: number; qty: number }[],
  currency = "USD"
): CurrencyAmount {
  let total = 0;
  for (const item of items) {
    // Validate quantity is not negative
    if (item.qty < 0) {
      throw new Error(`Invalid quantity: ${item.qty}. Quantity must be non-negative.`);
    }
    total += item.price * item.qty;
  }
  // Round to 2 decimal places for currency precision
  return {
    value: Math.round(total * 100) / 100,
    currency,
  };
}

export function legacyParse(input: string): unknown {
  // Input validation - ensure non-empty string
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error("Invalid input: expected non-empty string");
  }

  try {
    const parsed = JSON.parse(input);
    // Basic validation - ensure result is an object or array
    if (parsed === null || typeof parsed !== "object") {
      throw new Error("Invalid JSON: expected object or array");
    }
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON parse error: ${error.message}`);
    }
    throw error;
  }
}
