interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private counters = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  recordCounter(name: string, value = 1, labels?: Record<string, string>) {
    const key = this.getKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    this.metrics.push({ name, value, timestamp: new Date(), labels });
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
    this.metrics.push({ name, value, timestamp: new Date(), labels });
  }

  getCounter(name: string, labels?: Record<string, string>): number {
    const key = this.getKey(name, labels);
    return this.counters.get(key) || 0;
  }

  getHistogramStats(name: string, labels?: Record<string, string>) {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    return {
      count: values.length,
      sum,
      avg: sum / values.length,
      min: sorted[0]!,
      max: sorted[sorted.length - 1]!,
      p50: sorted[Math.floor(sorted.length * 0.5)]!,
      p95: sorted[Math.floor(sorted.length * 0.95)]!,
      p99: sorted[Math.floor(sorted.length * 0.99)]!,
    };
  }

  getRecentMetrics(limit = 100): Metric[] {
    return this.metrics.slice(-limit);
  }

  getErrorRate(windowMs = 60000): number {
    const now = Date.now();
    const recentErrors = this.metrics.filter(
      (m) =>
        m.name === "order.error" && now - m.timestamp.getTime() < windowMs,
    );
    const recentTotal = this.metrics.filter(
      (m) =>
        m.name === "order.created" && now - m.timestamp.getTime() < windowMs,
    );
    if (recentTotal.length === 0) return 0;
    return recentErrors.length / recentTotal.length;
  }

  reset() {
    this.metrics = [];
    this.counters.clear();
    this.histograms.clear();
  }

  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(",");
    return `${name}{${labelStr}}`;
  }
}

export const metrics = new MetricsCollector();

export function recordOrderCreated(status: string) {
  // Record both with and without labels for easier querying
  metrics.recordCounter("order.created", 1);
  metrics.recordCounter("order.created", 1, { status });
}

export function recordOrderStatusChange(from: string, to: string) {
  // Record both with and without labels for easier querying
  metrics.recordCounter("order.status_change", 1);
  metrics.recordCounter("order.status_change", 1, { from, to });
}

export function recordOrderError(errorType: string) {
  metrics.recordCounter("order.error", 1, { type: errorType });
}

export function recordOrderLatency(operation: string, durationMs: number) {
  metrics.recordHistogram("order.latency", durationMs, { operation });
}

export function recordRetry(operation: string, attempt: number) {
  metrics.recordCounter("order.retry", 1, { operation, attempt: String(attempt) });
}

export function getMetricsSummary() {
  return {
    counters: {
      created: metrics.getCounter("order.created"),
      errors: metrics.getCounter("order.error"),
      retries: metrics.getCounter("order.retry"),
    },
    latency: {
      create: metrics.getHistogramStats("order.latency", { operation: "create" }),
      update: metrics.getHistogramStats("order.latency", { operation: "update" }),
    },
    errorRate: metrics.getErrorRate(),
    recentMetrics: metrics.getRecentMetrics(50),
  };
}
