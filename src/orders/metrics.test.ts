import { describe, it, expect, beforeEach } from "vitest";
import { metrics } from "./metrics.js";

describe("MetricsCollector", () => {
  beforeEach(() => {
    metrics.reset();
  });

  it("should initialize with zero metrics", () => {
    const m = metrics.getMetrics();
    expect(m.ordersCreated).toBe(0);
    expect(m.ordersConfirmed).toBe(0);
    expect(m.ordersFailed).toBe(0);
    expect(m.totalRevenue).toBe(0);
    expect(m.errorRate).toBe(0);
    expect(m.averageOrderValue).toBe(0);
  });

  it("should increment orders created and track revenue", () => {
    metrics.incrementOrdersCreated(100);
    metrics.incrementOrdersCreated(200);

    const m = metrics.getMetrics();
    expect(m.ordersCreated).toBe(2);
    expect(m.totalRevenue).toBe(300);
    expect(m.averageOrderValue).toBe(150);
  });

  it("should increment orders confirmed", () => {
    metrics.incrementOrdersConfirmed();
    metrics.incrementOrdersConfirmed();

    const m = metrics.getMetrics();
    expect(m.ordersConfirmed).toBe(2);
  });

  it("should increment orders failed and update error rate", () => {
    metrics.incrementOrdersCreated(100);
    metrics.incrementOrdersCreated(100);
    metrics.incrementOrdersFailed();

    const m = metrics.getMetrics();
    expect(m.ordersFailed).toBe(1);
    expect(m.errorRate).toBeGreaterThan(0);
  });

  it("should calculate average order value correctly", () => {
    metrics.incrementOrdersCreated(100);
    metrics.incrementOrdersCreated(50);
    metrics.incrementOrdersCreated(150);

    const m = metrics.getMetrics();
    expect(m.averageOrderValue).toBe(100);
  });

  it("should alert when error rate is high", () => {
    metrics.incrementOrdersCreated(100);
    for (let i = 0; i < 15; i++) {
      metrics.incrementOrdersFailed();
    }

    expect(metrics.shouldAlert()).toBe(true);
  });

  it("should not alert when error rate is low", () => {
    for (let i = 0; i < 100; i++) {
      metrics.incrementOrdersCreated(100);
    }
    metrics.incrementOrdersFailed();

    expect(metrics.shouldAlert()).toBe(false);
  });

  it("should reset all metrics", () => {
    metrics.incrementOrdersCreated(100);
    metrics.incrementOrdersConfirmed();
    metrics.incrementOrdersFailed();

    metrics.reset();

    const m = metrics.getMetrics();
    expect(m.ordersCreated).toBe(0);
    expect(m.ordersConfirmed).toBe(0);
    expect(m.ordersFailed).toBe(0);
    expect(m.totalRevenue).toBe(0);
    expect(m.errorRate).toBe(0);
    expect(m.averageOrderValue).toBe(0);
  });
});
