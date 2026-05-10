# Orders Service - Production-Ready Order Pipeline

A production-ready order processing system with comprehensive validation, idempotency, retry logic, structured logging, metrics collection, and error-rate alerting.

## Features

- ✅ **Input Validation**: Zod-based schema validation for all inputs
- ✅ **Idempotency**: Prevent duplicate orders using idempotency keys
- ✅ **Retry Logic**: Automatic retries with exponential backoff for transient failures
- ✅ **Structured Logging**: JSON-formatted logs with Pino
- ✅ **Metrics Collection**: Track order creation, status changes, latency, and error rates
- ✅ **Error-Rate Alerts**: Automatic alerting when error thresholds are exceeded
- ✅ **SDK**: Consumer-friendly SDK for easy integration
- ✅ **Comprehensive Tests**: Full unit and integration test coverage

## Installation

```typescript
import { createOrdersClient } from './orders';
```

## Quick Start

### Using the SDK

```typescript
import { createOrdersClient } from './orders';

// Create a client
const client = createOrdersClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.example.com',
  timeout: 30000,
});

// Create an order
const order = await client.createOrder({
  customerId: 'cust_123',
  items: [
    { id: 'item_1', qty: 2, price: 15.0 },
    { id: 'item_2', qty: 1, price: 30.0 },
  ],
  currency: 'USD',
  idempotencyKey: 'unique-request-id', // Optional but recommended
});

// Progress through order lifecycle
await client.confirmOrder(order.id);
await client.shipOrder(order.id);
await client.deliverOrder(order.id);

// Get order status
const retrieved = await client.getOrder(order.id);
console.log(retrieved.status); // 'delivered'

// List customer orders
const orders = await client.listOrders('cust_123');
```

### Using the Service Directly

```typescript
import { orderService } from './orders';

const order = await orderService.createOrder({
  customerId: 'cust_123',
  items: [{ id: 'item_1', qty: 1, price: 10.0 }],
  currency: 'USD',
});
```

## Order Lifecycle

```
pending → confirmed → shipped → delivered
   ↓          ↓
cancelled  cancelled
```

Valid transitions:
- `pending` → `confirmed` or `cancelled`
- `confirmed` → `shipped` or `cancelled`
- `shipped` → `delivered`
- `delivered` and `cancelled` are terminal states

## Idempotency

Prevent duplicate orders by providing an `idempotencyKey`:

```typescript
const order = await client.createOrder({
  customerId: 'cust_123',
  items: [{ id: 'item_1', qty: 1, price: 10.0 }],
  currency: 'USD',
  idempotencyKey: 'request-123', // Same key = same order
});

// Second call with same key will throw DuplicateOrderError
```

## Error Handling

```typescript
import {
  ValidationError,
  OrderNotFoundError,
  DuplicateOrderError,
  InvalidStateTransitionError,
  TransientError,
} from './orders';

try {
  await client.createOrder(input);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors (400)
  } else if (error instanceof DuplicateOrderError) {
    // Handle duplicate order (409)
  } else if (error instanceof TransientError) {
    // Transient errors are auto-retried, but can still fail
    // Consider retrying at a higher level
  }
}
```

## Monitoring

### Metrics

```typescript
import { getMetricsSummary } from './orders';

const metrics = getMetricsSummary();
console.log(metrics.counters.created); // Total orders created
console.log(metrics.counters.errors); // Total errors
console.log(metrics.errorRate); // Current error rate
console.log(metrics.latency.create); // Create operation latency stats
```

### Alerts

```typescript
import { alertManager } from './orders';

// Start monitoring (checks every 30 seconds)
alertManager.start();

// Get active alerts
const alerts = alertManager.getActiveAlerts();

// Stop monitoring
alertManager.stop();
```

### Logging

All operations are logged with structured JSON:

```json
{
  "level": "info",
  "time": "2026-05-10T16:53:19.136Z",
  "service": "orders",
  "orderId": "ord_C0QEO_esig0V6Pux",
  "event": "order_created",
  "customerId": "cust_123",
  "total": 45,
  "itemCount": 2
}
```

## Configuration

### Retry Configuration

```typescript
import { withRetry } from './orders';

const result = await withRetry(
  async () => someOperation(),
  'operation_name',
  {
    maxAttempts: 5,
    initialDelayMs: 200,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  }
);
```

### Alert Configuration

```typescript
import { AlertManager } from './orders';

const alertManager = new AlertManager({
  errorRateThreshold: 0.05, // Alert at 5% error rate
  windowMs: 60000, // 1 minute window
  checkIntervalMs: 30000, // Check every 30 seconds
  enabled: true,
});
```

## Testing

Run the test suite:

```bash
npm test
```

The test suite includes:
- Unit tests for all service methods
- Integration tests for end-to-end flows
- Idempotency verification
- Error handling validation
- Metrics and monitoring tests

## API Reference

See the exported types in `src/orders/types.ts` for full API documentation.
