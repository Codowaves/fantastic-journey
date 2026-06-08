# Payment flow

`src/payment.ts` defines the small set of money utilities that build a bill from a cart and decide whether an order is refundable. A typical payment flows through three steps:

1. **Discount** -- `applyDiscount(price, percentOff)` reduces a `Money` line by a percentage (0-100), returning a new `Money` with the same currency and the amount rounded to two decimals. Throws `RangeError` for percentages outside 0-100.
2. **Total with tax** -- `totalWithTax(items, taxRate)` sums the `amount` fields across an array of `Money` (all assumed to share the first item's currency), applies `taxRate`, and rounds to two decimals. An empty list returns `{ amount: 0, currency: "USD" }`.
3. **Refund eligibility** -- `isRefundEligible(orderDate, returnWindowDays = 30)` checks whether the order falls within the return window by comparing the order timestamp to `Date.now()`.

All values flow through the `Money` interface (`{ amount: number; currency: string }`), so every step preserves the currency of the input it received.
