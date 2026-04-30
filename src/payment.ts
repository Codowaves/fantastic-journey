// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

export { type Money, applyDiscount, totalWithTax } from "./money/index.js";

export function isRefundEligible(orderDate: Date, returnWindowDays = 30): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}
