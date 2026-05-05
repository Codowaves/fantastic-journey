export interface AlertConfig {
  errorRateThreshold?: number;
  errorRateWindowMs?: number;
  alertCallback?: (alert: OrderAlert) => void;
}

export interface OrderAlert {
  metric: string;
  message: string;
  value: number;
  threshold: number;
}

interface ErrorRateTracker {
  count: number;
  total: number;
  lastCheck: number;
}

export class AlertsManager {
  private config: Required<AlertConfig>;
  private errorRates: Map<string, ErrorRateTracker> = new Map();
  private intervalHandle?: ReturnType<typeof setInterval>;

  constructor(config: AlertConfig) {
    this.config = {
      errorRateThreshold: config.errorRateThreshold ?? 0.05,
      errorRateWindowMs: config.errorRateWindowMs ?? 300_000,
      alertCallback: config.alertCallback ?? (() => {}),
    };
  }

  private track(metric: string, success: boolean): void {
    const tracker = this.errorRates.get(metric) ?? { count: 0, total: 0, lastCheck: Date.now() };
    tracker.total++;
    if (!success) tracker.count++;
    this.errorRates.set(metric, tracker);
  }

  private checkRates(): void {
    const now = Date.now();
    for (const [metric, tracker] of this.errorRates.entries()) {
      if (now - tracker.lastCheck >= this.config.errorRateWindowMs) {
        const rate = tracker.count / tracker.total;
        if (rate > this.config.errorRateThreshold) {
          this.config.alertCallback({
            metric,
            message: `Error rate exceeded threshold for ${metric}`,
            value: rate,
            threshold: this.config.errorRateThreshold,
          });
        }
        tracker.count = 0;
        tracker.total = 0;
        tracker.lastCheck = now;
      }
    }
  }

  start(): void {
    this.intervalHandle = setInterval(() => this.checkRates(), 30_000);
  }

  stop(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }
}

export function createAlertsManager(config?: AlertConfig): AlertsManager {
  return new AlertsManager(config ?? {});
}
