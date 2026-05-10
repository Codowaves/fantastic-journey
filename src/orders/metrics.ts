import type { OrderMetrics } from "./types.js";

class MetricsCollector {
  private metrics: OrderMetrics = {
    ordersCreated: 0,
    ordersConfirmed: 0,
    ordersFailed: 0,
    totalRevenue: 0,
    errorRate: 0,
    averageOrderValue: 0,
  };

  private recentErrors: number[] = [];
  private readonly errorWindowMs = 60000;

  incrementOrdersCreated(orderValue: number): void {
    this.metrics.ordersCreated++;
    this.metrics.totalRevenue += orderValue;
    this.updateAverageOrderValue();
  }

  incrementOrdersConfirmed(): void {
    this.metrics.ordersConfirmed++;
  }

  incrementOrdersFailed(): void {
    this.metrics.ordersFailed++;
    this.recentErrors.push(Date.now());
    this.cleanOldErrors();
    this.updateErrorRate();
  }

  private cleanOldErrors(): void {
    const cutoff = Date.now() - this.errorWindowMs;
    this.recentErrors = this.recentErrors.filter((timestamp) => timestamp > cutoff);
  }

  private updateErrorRate(): void {
    this.cleanOldErrors();
    const totalOrders = this.metrics.ordersCreated;
    if (totalOrders === 0) {
      this.metrics.errorRate = 0;
      return;
    }
    this.metrics.errorRate = this.recentErrors.length / Math.min(totalOrders, 100);
  }

  private updateAverageOrderValue(): void {
    if (this.metrics.ordersCreated === 0) {
      this.metrics.averageOrderValue = 0;
      return;
    }
    this.metrics.averageOrderValue = this.metrics.totalRevenue / this.metrics.ordersCreated;
  }

  getMetrics(): Readonly<OrderMetrics> {
    this.cleanOldErrors();
    this.updateErrorRate();
    return { ...this.metrics };
  }

  shouldAlert(): boolean {
    const metrics = this.getMetrics();
    const HIGH_ERROR_THRESHOLD = 0.1;
    return metrics.errorRate > HIGH_ERROR_THRESHOLD;
  }

  reset(): void {
    this.metrics = {
      ordersCreated: 0,
      ordersConfirmed: 0,
      ordersFailed: 0,
      totalRevenue: 0,
      errorRate: 0,
      averageOrderValue: 0,
    };
    this.recentErrors = [];
  }
}

export const metrics = new MetricsCollector();
