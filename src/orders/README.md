# Orders Service SDK

Production-ready orders pipeline with input validation, idempotency, retries, structured logging, and metrics.

## Features

- ✅ **Input validation** with Zod schemas
- ✅ **Idempotency** support via idempotency keys
- ✅ **Automatic retries** on transient failures with exponential backoff
- ✅ **Structured logging** in JSON format
- ✅ **Real-time metrics** tracking with error-rate alerting
- ✅ **Type-safe** TypeScript implementation
- ✅ **Comprehensive test coverage** (50 unit + integration tests)

## Installation

```bash
npm install
```

## Quick Start

```typescript
import { sdk } from "./orders";

// Create an order with idempotency
const order = await sdk.createOrder({
  customerId: "cust_123",
  items: [
    { id: "item_1", qty: 2, pricePerUnit: 29.99 },
    { id: "item_2", qty: 1, pricePerUnit: 19.99 },
  ],
  idempotencyKey: "unique-key-123", // Optional but recommended
});

// Confirm the order
const confirmed = await sdk.confirmOrder(order.id);

// Update order status
const shipped = await sdk.updateOrderStatus(order.id, "shipped");

// Get order details
const orderDetails = await sdk.getOrder(order.id);

// Check order status
const status = await sdk.getOrderStatus(order.id);

// Get service metrics
const metrics = sdk.getMetrics();
console.log(`Orders created: ${metrics.ordersCreated}`);
console.log(`Error rate: ${metrics.errorRate}`);
```

## API Reference

### SDK Methods

#### `createOrder(input: CreateOrderInput): Promise<Order>`

Creates a new order with automatic validation and retry logic.

**Input:**
```typescript
{
  customerId: string;        // Required, min length 1
  items: OrderItem[];        // Required, min 1 item
  idempotencyKey?: string;   // Optional, for duplicate prevention
}
```

**Item Structure:**
```typescript
{
  id: string;           // Product/item ID
  qty: number;          // Positive integer
  pricePerUnit: number; // Non-negative number
}
```

**Returns:** Order object with status "pending"

**Throws:**
- `ValidationError` - Invalid input data
- `IdempotencyError` - Duplicate idempotency key (returns existing order)
- `TransientError` - Temporary failure (automatically retried)

**Example:**
```typescript
const order = await sdk.createOrder({
  customerId: "cust_abc",
  items: [{ id: "prod_1", qty: 1, pricePerUnit: 99.99 }],
  idempotencyKey: "checkout_session_xyz",
});
```

#### `confirmOrder(orderId: string): Promise<Order>`

Confirms a pending order.

**Throws:**
- `ValidationError` - Order not found or not in pending status

**Example:**
```typescript
const confirmed = await sdk.confirmOrder("ord_123");
```

#### `getOrder(orderId: string): Promise<Order | null>`

Retrieves order details by ID.

**Returns:** Order object or `null` if not found

**Example:**
```typescript
const order = await sdk.getOrder("ord_123");
if (order) {
  console.log(`Order total: ${order.total}`);
}
```

#### `getOrderStatus(orderId: string): Promise<OrderStatus | null>`

Gets the current status of an order.

**Returns:** One of: `"pending" | "confirmed" | "shipped" | "delivered" | "failed"` or `null`

**Example:**
```typescript
const status = await sdk.getOrderStatus("ord_123");
```

#### `updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>`

Updates an order's status.

**Valid statuses:** `"pending"`, `"confirmed"`, `"shipped"`, `"delivered"`, `"failed"`

**Throws:**
- `ValidationError` - Order not found

**Example:**
```typescript
const updated = await sdk.updateOrderStatus("ord_123", "shipped");
```

#### `getMetrics(): Readonly<OrderMetrics>`

Returns current service metrics.

**Returns:**
```typescript
{
  ordersCreated: number;
  ordersConfirmed: number;
  ordersFailed: number;
  totalRevenue: number;
  errorRate: number;          // 0.0 - 1.0
  averageOrderValue: number;
}
```

**Example:**
```typescript
const metrics = sdk.getMetrics();
if (metrics.errorRate > 0.1) {
  alert("High error rate detected!");
}
```

## Types

### Order

```typescript
interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  idempotencyKey?: string;
}
```

### OrderItem

```typescript
interface OrderItem {
  id: string;
  qty: number;
  pricePerUnit: number;
}
```

### OrderStatus

```typescript
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "failed";
```

## Error Handling

The SDK provides specific error types for different failure scenarios:

### ValidationError

Input validation failed or business rule violation (e.g., order not found, invalid status transition).

```typescript
try {
  await sdk.createOrder({ customerId: "", items: [] });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Invalid input:", error.message);
  }
}
```

### IdempotencyError

Duplicate idempotency key detected. The existing order is available in `error.existingOrder`.

```typescript
try {
  await sdk.createOrder({ ...input, idempotencyKey: "duplicate" });
} catch (error) {
  if (error instanceof IdempotencyError) {
    console.log("Order already exists:", error.existingOrder.id);
    return error.existingOrder; // Safe to use
  }
}
```

### TransientError

Temporary failure that will be automatically retried. Usually you don't need to catch this as retries are automatic.

```typescript
// Automatic retry with exponential backoff
const order = await sdk.createOrder(input); // Retries up to 3 times
```

## Retry Configuration

Retries are automatic for transient failures with the following defaults:

- **Max attempts:** 3
- **Initial delay:** 100ms
- **Max delay:** 5000ms
- **Backoff multiplier:** 2x

To customize retry behavior, use `withRetry` directly:

```typescript
import { withRetry } from "./orders";

const result = await withRetry(
  async () => {
    // Your operation
  },
  {
    maxAttempts: 5,
    initialDelayMs: 200,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  }
);
```

## Structured Logging

All operations emit structured JSON logs:

```json
{
  "timestamp": "2026-05-10T12:34:56.789Z",
  "level": "info",
  "service": "orders-service",
  "message": "Order created successfully",
  "orderId": "ord_123",
  "total": 149.97,
  "status": "pending"
}
```

**Log levels:**
- `debug` - Detailed diagnostic info (fetches, queries)
- `info` - Important business events (order created, confirmed)
- `warn` - Recoverable issues (retries, high error rate)
- `error` - Failures and exceptions

## Metrics & Monitoring

### Real-time Metrics

```typescript
const metrics = sdk.getMetrics();

console.log(`Total orders: ${metrics.ordersCreated}`);
console.log(`Confirmed: ${metrics.ordersConfirmed}`);
console.log(`Failed: ${metrics.ordersFailed}`);
console.log(`Revenue: $${metrics.totalRevenue.toFixed(2)}`);
console.log(`Error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
console.log(`Avg order value: $${metrics.averageOrderValue.toFixed(2)}`);
```

### Error Rate Alerting

The metrics system automatically tracks error rate over a 60-second sliding window. Error rate > 10% triggers a warning log.

```typescript
import { metrics } from "./orders";

if (metrics.shouldAlert()) {
  // Send alert to monitoring system
  console.warn("High error rate detected!", metrics.getMetrics());
}
```

## Best Practices

### 1. Always Use Idempotency Keys

Prevent duplicate orders in case of retries or network issues:

```typescript
const order = await sdk.createOrder({
  customerId: user.id,
  items: cart.items,
  idempotencyKey: `checkout_${sessionId}_${Date.now()}`,
});
```

### 2. Handle IdempotencyError Gracefully

```typescript
try {
  return await sdk.createOrder(input);
} catch (error) {
  if (error instanceof IdempotencyError) {
    return error.existingOrder;
  }
  throw error;
}
```

### 3. Monitor Metrics Continuously

```typescript
setInterval(() => {
  const metrics = sdk.getMetrics();
  sendToMonitoring({
    errorRate: metrics.errorRate,
    ordersPerMinute: metrics.ordersCreated / uptimeMinutes,
  });
}, 60000);
```

### 4. Use Structured Logging

The SDK automatically logs in JSON format. Parse logs with tools like:
- CloudWatch Logs Insights
- Elasticsearch/Kibana
- Datadog
- Splunk

### 5. Validate Inputs Early

While the SDK validates inputs, validate at your API layer too for better UX:

```typescript
// API layer
if (!customerId || items.length === 0) {
  return res.status(400).json({ error: "Invalid request" });
}

// Then use SDK
const order = await sdk.createOrder({ customerId, items });
```

## Testing

Run the test suite:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run typecheck     # Type checking
npm run lint          # Linting
```

The SDK includes 50 comprehensive tests covering:
- Input validation
- Idempotency handling
- Order lifecycle
- Error scenarios
- Retry logic
- Metrics tracking
- SDK interface

## License

MIT
