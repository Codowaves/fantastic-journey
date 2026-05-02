// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

/**
 * Represents a monetary amount in a specific currency.
 */
export interface Money {
  amount: number;
  currency: string;
}

/**
 * Applies a percentage discount to a price.
 * @param price - The original Money object.
 * @param percentOff - Discount percentage (0–100).
 * @returns A new Money object with the discounted amount.
 * @throws RangeError if percentOff is outside the valid range.
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
 * Calculates the total cost of a list of items including tax.
 * @param items - Array of Money objects, all in the same currency.
 * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%).
 * @returns A Money object with the after-tax total.
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
 * Determines whether an order is eligible for a refund based on its date.
 * @param orderDate - The date the order was placed.
 * @param returnWindowDays - Number of days after purchase during which returns are accepted (default: 30).
 * @returns true if the order falls within the return window, false otherwise.
 */
export function isRefundEligible(orderDate: Date, returnWindowDays = 30): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}
