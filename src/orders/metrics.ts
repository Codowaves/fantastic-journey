import type { OrderMetrics } from "./types.js";

interface MetricBucket {
  count: number;
  sum: number;
  min: number;
  max: number;
}

class MetricsCollector {
  private ordersCreated = 0;
  private ordersConfirmed = 0;
  private ordersFailed = 0;
  private retryCount = 0;
  private latencyBuckets = new Map<string, MetricBucket>();

  incrementOrdersCreated(): void {
    this.ordersCreated++;
  }

  incrementOrdersConfirmed(): void {
    this.ordersConfirmed++;
  }

  incrementOrdersFailed(): void {
    this.ordersFailed++;
  }

  incrementRetries(): void {
    this.retryCount++;
  }

  recordLatency(operation: string, latencyMs: number): void {
    const bucket = this.latencyBuckets.get(operation) ?? { count: 0, sum: 0, min: Infinity, max: -Infinity };
    bucket.count++;
    bucket.sum += latencyMs;
    bucket.min = Math.min(bucket.min, latencyMs);
    bucket.max = Math.max(bucket.max, latencyMs);
    this.latencyBuckets.set(operation, bucket);
  }

  getMetrics(): OrderMetrics {
    let totalLatency = 0;
    let totalOps = 0;
    for (const bucket of this.latencyBuckets.values()) {
      totalLatency += bucket.sum;
      totalOps += bucket.count;
    }

    return {
      ordersCreated: this.ordersCreated,
      ordersConfirmed: this.ordersConfirmed,
      ordersFailed: this.ordersFailed,
      retryCount: this.retryCount,
      averageLatencyMs: totalOps > 0 ? totalLatency / totalOps : 0,
    };
  }

  reset(): void {
    this.ordersCreated = 0;
    this.ordersConfirmed = 0;
    this.ordersFailed = 0;
    this.retryCount = 0;
    this.latencyBuckets.clear();
  }
}

export const metrics = new MetricsCollector();

export function createMetricsCollector(): MetricsCollector {
  return new MetricsCollector();
}