// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

/**
 * Represents a monetary amount with currency.
 */
export interface Money {
  /** Numeric amount */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
}

/**
 * Applies a percentage discount to a price.
 * @param price - The original Money object
 * @param percentOff - Discount percentage (0-100)
 * @returns The discounted Money object
 * @throws RangeError if percentOff is outside 0-100 range
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
 * Calculates the total price including tax.
 * @param items - Array of Money objects to sum
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns The total amount with tax applied, in the first item's currency
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
 * Determines whether an order is eligible for a refund based on return window.
 * @param orderDate - Date the order was placed
 * @param returnWindowDays - Number of days allowed for returns (default: 30)
 * @returns True if the order is within the return window
 */
export function isRefundEligible(orderDate: Date, returnWindowDays = 30): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}
