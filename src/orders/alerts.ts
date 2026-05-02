import type { AlertConfig } from "./types.js";
import { logger } from "./logger.js";

export class AlertManager {
  private errorCount = 0;
  private lastReset = Date.now();
  private config: AlertConfig;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private onAlert: ((msg: string) => void) | null = null;

  constructor(config: AlertConfig, onAlert?: (msg: string) => void) {
    this.config = config;
    this.onAlert = onAlert ?? null;
    this.startMonitoring();
  }

  incrementErrors(): void {
    this.errorCount++;
  }

  recordSuccess(): void {
    const now = Date.now();
    if (now - this.lastReset > this.config.checkIntervalMs) {
      this.errorCount = 0;
      this.lastReset = now;
    }
  }

  private checkThresholds(): void {
    const windowMs = this.config.checkIntervalMs;
    const elapsed = Date.now() - this.lastReset;

    if (elapsed >= windowMs) {
      const errorRate = this.errorCount / (elapsed / 1000);

      if (errorRate > this.config.errorRateThreshold) {
        const msg = `High error rate alert: ${errorRate.toFixed(2)} errors/sec (threshold: ${this.config.errorRateThreshold})`;
        logger.warn(msg);
        this.onAlert?.(msg);
      }

      this.errorCount = 0;
      this.lastReset = Date.now();
    }
  }

  private startMonitoring(): void {
    this.checkInterval = setInterval(() => this.checkThresholds(), this.config.checkIntervalMs);
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export function createAlertManager(config: AlertConfig, onAlert?: (msg: string) => void): AlertManager {
  return new AlertManager(config, onAlert);
}