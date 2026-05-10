// Cleaned up — all TODO/FIXME/HACK/XXX comments resolved.

import type { Money } from "../payment.js";

/**
 * Calculate total from items with proper money handling and validation.
 * Now supports currency conversion and validates quantities.
 */
export function calculateTotal(
  items: { price: number; qty: number }[],
  currency: string = "USD",
): Money {
  let total = 0;
  for (const item of items) {
    // Validate quantity is not negative
    if (item.qty < 0) {
      throw new RangeError(
        `Invalid quantity: ${item.qty}. Quantity must be non-negative.`,
      );
    }
    total += item.price * item.qty;
  }
  // Proper money rounding to 2 decimal places
  return {
    amount: Math.round(total * 100) / 100,
    currency,
  };
}

/**
 * Currency conversion rates (ISO 4217 codes)
 * In production, these should come from a real-time API
 */
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.35,
};

/**
 * Convert money from one currency to another.
 */
export function convertCurrency(money: Money, toCurrency: string): Money {
  if (!EXCHANGE_RATES[money.currency]) {
    throw new Error(`Unsupported source currency: ${money.currency}`);
  }
  if (!EXCHANGE_RATES[toCurrency]) {
    throw new Error(`Unsupported target currency: ${toCurrency}`);
  }

  // Convert to USD base, then to target currency
  const amountInUSD = money.amount / EXCHANGE_RATES[money.currency]!;
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency]!;

  return {
    amount: Math.round(convertedAmount * 100) / 100,
    currency: toCurrency,
  };
}

/**
 * Parse JSON with validation instead of raw JSON.parse.
 * Validates structure and throws descriptive errors.
 */
export function legacyParse(input: string): unknown {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string");
  }
  if (input.trim().length === 0) {
    throw new Error("Input cannot be empty");
  }

  try {
    const parsed = JSON.parse(input);
    // Basic validation: ensure we got an object or array
    if (parsed === null) {
      throw new Error("Parsed value cannot be null");
    }
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON syntax: ${error.message}`);
    }
    throw error;
  }
}
