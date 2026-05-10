import { metrics } from "./metrics.js";
import { logger } from "./logger.js";

export interface AlertConfig {
  errorRateThreshold: number;
  windowMs: number;
  checkIntervalMs: number;
  enabled: boolean;
}

const defaultConfig: AlertConfig = {
  errorRateThreshold: 0.05, // 5% error rate
  windowMs: 60000, // 1 minute window
  checkIntervalMs: 30000, // Check every 30 seconds
  enabled: true,
};

export class AlertManager {
  private config: AlertConfig;
  private intervalHandle?: NodeJS.Timeout;
  private alertsSent = new Set<string>();

  constructor(config: Partial<AlertConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  start() {
    if (!this.config.enabled || this.intervalHandle) return;

    this.intervalHandle = setInterval(() => {
      this.checkAlerts();
    }, this.config.checkIntervalMs);

    logger.info({ config: this.config }, "Alert manager started");
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
      logger.info("Alert manager stopped");
    }
  }

  private checkAlerts() {
    const errorRate = metrics.getErrorRate(this.config.windowMs);

    if (errorRate > this.config.errorRateThreshold) {
      this.sendAlert(
        "high_error_rate",
        `Order error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold (${(this.config.errorRateThreshold * 100).toFixed(2)}%)`,
        { errorRate, threshold: this.config.errorRateThreshold },
      );
    } else {
      // Clear alert if error rate is back to normal
      this.clearAlert("high_error_rate");
    }
  }

  private sendAlert(alertId: string, message: string, metadata?: Record<string, unknown>) {
    if (this.alertsSent.has(alertId)) return;

    logger.error({ alert: alertId, ...metadata }, `🚨 ALERT: ${message}`);

    // In a real implementation, this would send to PagerDuty, Slack, etc.
    // For now, we just log it
    this.alertsSent.add(alertId);
  }

  private clearAlert(alertId: string) {
    if (this.alertsSent.has(alertId)) {
      logger.info({ alert: alertId }, "Alert cleared");
      this.alertsSent.delete(alertId);
    }
  }

  getActiveAlerts(): string[] {
    return Array.from(this.alertsSent);
  }
}

export const alertManager = new AlertManager();
