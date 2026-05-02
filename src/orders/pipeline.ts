import type {
  Order,
  OrderInput,
  ProcessedResult,
  OrderStatus,
} from "./types.js";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  operation: string;
  orderId?: string;
  idempotencyKey?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export class StructuredLogger {
  private logs: LogEntry[] = [];

  private log(
    level: LogLevel,
    operation: string,
    data?: Partial<LogEntry>,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      operation,
      ...data,
    };
    this.logs.push(entry);
    if (level === "ERROR" || level === "WARN") {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  info(operation: string, data?: Partial<LogEntry>): void {
    this.log("INFO", operation, data);
  }

  error(operation: string, data?: Partial<LogEntry>): void {
    this.log("ERROR", operation, data);
  }

  warn(operation: string, data?: Partial<LogEntry>): void {
    this.log("WARN", operation, data);
  }

  debug(operation: string, data?: Partial<LogEntry>): void {
    this.log("DEBUG", operation, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

export interface MetricsData {
  ordersProcessed: number;
  ordersSucceeded: number;
  ordersFailed: number;
  retries: number;
  idempotencyHits: number;
  totalDurationMs: number;
}

export class MetricsCollector {
  private metrics: MetricsData = {
    ordersProcessed: 0,
    ordersSucceeded: 0,
    ordersFailed: 0,
    retries: 0,
    idempotencyHits: 0,
    totalDurationMs: 0,
  };

  incrementCounter(name: keyof MetricsData, value = 1): void {
    this.metrics[name] += value;
  }

  recordDuration(durationMs: number): void {
    this.metrics.totalDurationMs += durationMs;
  }

  getMetrics(): MetricsData & { avgDurationMs: number } {
    const {
      ordersProcessed,
      totalDurationMs,
      ordersSucceeded,
      ordersFailed,
      retries,
      idempotencyHits,
    } = this.metrics;
    return {
      ordersProcessed,
      ordersSucceeded,
      ordersFailed,
      retries,
      idempotencyHits,
      totalDurationMs,
      avgDurationMs:
        ordersProcessed > 0 ? Math.round(totalDurationMs / ordersProcessed) : 0,
    };
  }

  reset(): void {
    this.metrics = {
      ordersProcessed: 0,
      ordersSucceeded: 0,
      ordersFailed: 0,
      retries: 0,
      idempotencyHits: 0,
      totalDurationMs: 0,
    };
  }
}

export interface PipelineConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_CONFIG: PipelineConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
};

type TransientFailure = "network" | "timeout" | "conflict" | "rate_limit";

function isTransientFailure(error: string): error is TransientFailure {
  const transientTypes: TransientFailure[] = [
    "network",
    "timeout",
    "conflict",
    "rate_limit",
  ];
  return transientTypes.includes(error as TransientFailure);
}

export class OrdersPipeline {
  private logger: StructuredLogger;
  private metrics: MetricsCollector;
  private config: PipelineConfig;
  private orderStore: Map<string, Order> = new Map();
  private processedKeys: Map<string, Order> = new Map();

  constructor(config: Partial<PipelineConfig> = {}) {
    this.logger = new StructuredLogger();
    this.metrics = new MetricsCollector();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private calculateDelay(attempt: number): number {
    const delay = this.config.baseDelayMs * Math.pow(2, attempt);
    return Math.min(delay, this.config.maxDelayMs);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(
    operation: string,
    fn: () => Promise<T>,
    maxAttempts?: number,
  ): Promise<{ result: T; attempts: number }> {
    let attempts = 0;
    let lastError: string = "unknown";

    while (attempts < (maxAttempts ?? this.config.maxRetries)) {
      const startTime = Date.now();

      try {
        const result = await fn();
        this.logger.debug(operation, {
          duration: Date.now() - startTime,
          metadata: { attempts: attempts + 1 },
        });
        return { result, attempts: attempts + 1 };
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        this.logger.warn(operation, {
          error: lastError,
          duration: Date.now() - startTime,
          metadata: { attempt: attempts + 1 },
        });

        if (
          !isTransientFailure(lastError) ||
          attempts >= (maxAttempts ?? this.config.maxRetries) - 1
        ) {
          throw error;
        }

        attempts++;
        const delay = this.calculateDelay(attempts);
        this.logger.info("retry_scheduled", {
          metadata: { delay, attempt: attempts + 1 },
        });
        await this.sleep(delay);
        this.metrics.incrementCounter("retries");
      }
    }

    throw new Error(`Operation failed after ${attempts} retries: ${lastError}`);
  }

  async validateInput(
    input: unknown,
  ): Promise<
    { valid: true; data: OrderInput } | { valid: false; error: string }
  > {
    const { validateOrderInput } = await import("./types.js");
    const result = validateOrderInput(input);
    if (!result.valid) {
      return { valid: false, error: result.error ?? "validation failed" };
    }
    if (!result.data) {
      return { valid: false, error: "invalid input" };
    }
    return { valid: true, data: result.data };
  }

  async processOrder(input: unknown): Promise<ProcessedResult<Order>> {
    const startTime = Date.now();
    this.metrics.incrementCounter("ordersProcessed");

    const validation = await this.validateInput(input);
    if (!validation.valid) {
      this.metrics.incrementCounter("ordersFailed");
      return { success: false, error: validation.error, retryable: false };
    }

    const orderInput = validation.data;

    if (orderInput.idempotencyKey) {
      const existingOrder = this.processedKeys.get(orderInput.idempotencyKey);
      if (existingOrder) {
        this.metrics.incrementCounter("idempotencyHits");
        this.logger.info("idempotency_hit", {
          idempotencyKey: orderInput.idempotencyKey,
          orderId: existingOrder.id,
        });
        return {
          success: true,
          data: existingOrder,
          retryable: false,
          idempotencyKey: orderInput.idempotencyKey,
        };
      }
    }

    try {
      const { result: order } = await this.executeWithRetry(
        "create_order",
        async () => {
          const newOrder: Order = {
            id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            customerId: orderInput.customerId,
            items: orderInput.items,
            total: orderInput.items.reduce((sum, item) => sum + item.qty, 0),
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            idempotencyKey: orderInput.idempotencyKey,
          };

          this.orderStore.set(newOrder.id, newOrder);
          return newOrder;
        },
      );

      if (orderInput.idempotencyKey) {
        this.processedKeys.set(orderInput.idempotencyKey, order);
      }

      this.metrics.incrementCounter("ordersSucceeded");
      this.metrics.recordDuration(Date.now() - startTime);

      this.logger.info("order_created", {
        orderId: order.id,
        idempotencyKey: orderInput.idempotencyKey,
        duration: Date.now() - startTime,
        metadata: { customerId: order.customerId, total: order.total },
      });

      return {
        success: true,
        data: order,
        retryable: false,
        idempotencyKey: orderInput.idempotencyKey,
      };
    } catch (error) {
      this.metrics.incrementCounter("ordersFailed");
      this.logger.error("order_creation_failed", {
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        retryable: true,
        idempotencyKey: orderInput.idempotencyKey,
      };
    }
  }

  async confirmOrder(orderId: string): Promise<ProcessedResult<Order>> {
    const startTime = Date.now();

    try {
      const { result: order } = await this.executeWithRetry(
        "confirm_order",
        async () => {
          const existingOrder = this.orderStore.get(orderId);
          if (!existingOrder) {
            throw new Error("order_not_found");
          }

          const confirmedOrder: Order = {
            ...existingOrder,
            status: "confirmed",
            updatedAt: new Date().toISOString(),
          };

          this.orderStore.set(orderId, confirmedOrder);
          return confirmedOrder;
        },
      );

      this.logger.info("order_confirmed", {
        orderId,
        duration: Date.now() - startTime,
      });

      return { success: true, data: order, retryable: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const retryable = isTransientFailure(message);

      this.logger.error("order_confirmation_failed", {
        orderId,
        error: message,
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        error: message,
        retryable,
      };
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orderStore.get(orderId) ?? null;
  }

  async getOrderStatus(orderId: string): Promise<ProcessedResult<OrderStatus>> {
    const order = await this.getOrder(orderId);

    if (!order) {
      return {
        success: false,
        error: "order_not_found",
        retryable: false,
      };
    }

    return {
      success: true,
      data: order.status,
      retryable: false,
    };
  }

  getLogger(): StructuredLogger {
    return this.logger;
  }

  getMetrics(): ReturnType<MetricsCollector["getMetrics"]> {
    return this.metrics.getMetrics();
  }

  reset(): void {
    this.orderStore.clear();
    this.processedKeys.clear();
    this.logger.clear();
    this.metrics.reset();
  }
}
