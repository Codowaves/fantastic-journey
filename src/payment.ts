// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

export interface Money {
  amount: number;
  currency: string;
}

/**
 * Apply a percentage discount to a price.
 *
 * @param price - The original price to discount.
 * @param percentOff - The discount percentage, from 0 to 100 inclusive.
 * @returns A new {@link Money} value with the discounted amount and the same currency.
 * @throws RangeError If `percentOff` is outside the 0–100 range.
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
 * Sum a list of monetary amounts and apply a tax rate.
 *
 * @param items - The monetary amounts to total; assumed to share a currency.
 * @param taxRate - The tax rate as a decimal fraction (e.g. `0.07` for 7%).
 * @returns A {@link Money} value with the taxed total, using the first item's currency, or `0 USD` when `items` is empty.
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
 * Determine whether an order is still within its refund window.
 *
 * @param orderDate - The date the order was placed.
 * @param returnWindowDays - The length of the refund window in days; defaults to 30.
 * @returns `true` if the elapsed time since `orderDate` is less than the return window, otherwise `false`.
 */
export function isRefundEligible(orderDate: Date, returnWindowDays = 30): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}
