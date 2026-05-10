// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

/**
 * Represents a monetary value with an amount and currency code.
 */
export interface Money {
  /** The numeric amount (e.g., 19.99) */
  amount: number;
  /** ISO 4217 currency code (e.g., "USD", "EUR") */
  currency: string;
}

/**
 * Applies a percentage discount to a price.
 * @param price - The original price
 * @param percentOff - Discount percentage (0–100)
 * @returns New Money object with discounted amount
 * @throws {RangeError} If percentOff is outside 0–100 range
 */
export function applyDiscount(price: Money, percentOff: number): Money {
  if (percentOff < 0 || percentOff > 100) {
    throw new RangeError("percentOff must be 0–100");
  }
  return {
    amount: Math.round(price.amount * (100 - percentOff)) / 100,
    currency: price.currency,
  };
}

/**
 * Calculates the total with tax for a list of items.
 * @param items - Array of Money objects to sum (all must share the same currency)
 * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns Total amount including tax, or {amount: 0, currency: "USD"} for empty array
 */
export function totalWithTax(items: Money[], taxRate: number): Money {
  if (!items.length) {
    return { amount: 0, currency: "USD" };
  }
  const currency = items[0]!.currency;
  const subtotal = items.reduce((sum, m) => sum + m.amount, 0);
  return {
    amount: Math.round(subtotal * (1 + taxRate) * 100) / 100,
    currency,
  };
}

/**
 * Checks if an order is still within the refund eligibility window.
 * @param orderDate - The date the order was placed
 * @param returnWindowDays - Number of days allowed for returns (default: 30)
 * @returns true if the order is still eligible for refund
 */
export function isRefundEligible(orderDate: Date, returnWindowDays = 30): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}
