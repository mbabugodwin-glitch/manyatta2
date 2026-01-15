/**
 * Web Vitals Monitoring Service
 * Tracks Core Web Vitals (LCP, FID/INP, CLS) and sends reports
 * Based on: https://web.dev/vitals/
 */

export interface WebVitalsMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'INP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender';
  entries?: PerformanceEntry[];
}

export interface WebVitalsReport {
  timestamp: number;
  url: string;
  metrics: {
    lcp?: number;
    fid?: number;
    inp?: number;
    cls?: number;
    ttfb?: number;
  };
  ratings: {
    lcp?: 'good' | 'needs-improvement' | 'poor';
    fid?: 'good' | 'needs-improvement' | 'poor';
    inp?: 'good' | 'needs-improvement' | 'poor';
    cls?: 'good' | 'needs-improvement' | 'poor';
    ttfb?: 'good' | 'needs-improvement' | 'poor';
  };
}

// Thresholds for Web Vitals (based on Core Web Vitals guidelines)
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },    // milliseconds
  FID: { good: 100, needsImprovement: 300 },      // milliseconds
  INP: { good: 200, needsImprovement: 500 },      // milliseconds
  CLS: { good: 0.1, needsImprovement: 0.25 },     // unitless
  TTFB: { good: 800, needsImprovement: 1800 },    // milliseconds
};

class WebVitalsMonitor {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private reportCallback?: (report: WebVitalsReport) => void;
  private observers: PerformanceObserver[] = [];
  private previousValues: Map<string, number> = new Map();

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize performance observers for each metric
   */
  private initializeObservers() {
    // LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // INP (Interaction to Next Paint) - newer metric replacing FID
    try {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const maxDuration = Math.max(...entries.map((e) => e.duration));
        this.recordMetric('INP', maxDuration);
      });
      inpObserver.observe({ entryTypes: ['event'] });
      this.observers.push(inpObserver);
    } catch (e) {
      console.warn('INP observer not supported');
    }

    // CLS (Cumulative Layout Shift)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let clsValue = 0;
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // TTFB (Time to First Byte)
    this.recordTTFB();
  }

  /**
   * Record TTFB from performance navigation timing
   */
  private recordTTFB() {
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
      this.recordMetric('TTFB', ttfb);
    }
  }

  /**
   * Record a metric and determine its rating
   */
  private recordMetric(name: 'LCP' | 'FID' | 'INP' | 'CLS' | 'TTFB', value: number) {
    const previous = this.previousValues.get(name) || 0;
    const delta = value - previous;
    const rating = this.getRating(name, value);

    const metric: WebVitalsMetric = {
      name,
      value,
      rating,
      delta,
      id: `${name}-${Date.now()}`,
      navigationType: this.getNavigationType(),
    };

    this.metrics.set(name, metric);
    this.previousValues.set(name, value);

    // Log metric
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${name}: ${value.toFixed(2)}ms - ${rating}`);
    }
  }

  /**
   * Determine if a metric value is good/needs-improvement/poor
   */
  private getRating(
    name: string,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get current navigation type
   */
  private getNavigationType(): WebVitalsMetric['navigationType'] {
    if (!performance.navigation) return 'navigate';
    
    const type = performance.navigation.type;
    const typeMap: { [key: number]: WebVitalsMetric['navigationType'] } = {
      0: 'navigate',
      1: 'reload',
      2: 'back-forward',
      255: 'navigate',
    };
    return typeMap[type] || 'navigate';
  }

  /**
   * Get a specific metric value
   */
  getMetric(name: 'LCP' | 'FID' | 'INP' | 'CLS' | 'TTFB'): WebVitalsMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): Map<string, WebVitalsMetric> {
    return new Map(this.metrics);
  }

  /**
   * Generate a report of current metrics
   */
  generateReport(): WebVitalsReport {
    const report: WebVitalsReport = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: {},
      ratings: {},
    };

    this.metrics.forEach((metric) => {
      const key = metric.name.toLowerCase() as keyof WebVitalsReport['metrics'];
      report.metrics[key] = metric.value;
      report.ratings[key] = metric.rating;
    });

    return report;
  }

  /**
   * Set callback for metric reports
   */
  onReport(callback: (report: WebVitalsReport) => void) {
    this.reportCallback = callback;
  }

  /**
   * Send report to backend or analytics
   */
  async sendReport(report?: WebVitalsReport) {
    const reportToSend = report || this.generateReport();

    if (this.reportCallback) {
      this.reportCallback(reportToSend);
    }

    // Example: Send to analytics backend
    try {
      // await fetch('/api/analytics/web-vitals', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reportToSend),
      //   keepalive: true, // Important for unload handler
      // });
    } catch (error) {
      console.error('Failed to send Web Vitals report:', error);
    }
  }

  /**
   * Get performance summary as percentage breakdown
   */
  getPerformanceSummary(): {
    goodCount: number;
    needsImprovementCount: number;
    poorCount: number;
    score: number;
  } {
    let goodCount = 0;
    let needsImprovementCount = 0;
    let poorCount = 0;

    this.metrics.forEach((metric) => {
      if (metric.rating === 'good') goodCount++;
      else if (metric.rating === 'needs-improvement') needsImprovementCount++;
      else poorCount++;
    });

    const total = this.metrics.size;
    const score = total > 0 ? ((goodCount / total) * 100) : 0;

    return {
      goodCount,
      needsImprovementCount,
      poorCount,
      score,
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.previousValues.clear();
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  /**
   * Get detailed metric info for debugging
   */
  debugInfo(): string {
    const summary = this.getPerformanceSummary();
    const metrics = Array.from(this.metrics.values())
      .map((m) => `${m.name}: ${m.value.toFixed(2)} (${m.rating})`)
      .join('\n');

    return `
=== Web Vitals Report ===
Performance Score: ${summary.score.toFixed(1)}%
Good: ${summary.goodCount} | Needs Improvement: ${summary.needsImprovementCount} | Poor: ${summary.poorCount}

Metrics:
${metrics}

URL: ${window.location.href}
Navigation Type: ${this.getNavigationType()}
Timestamp: ${new Date().toISOString()}
    `;
  }
}

// Create singleton instance
export const webVitalsMonitor = new WebVitalsMonitor();

/**
 * Hook-friendly function to use Web Vitals
 */
export function useWebVitals() {
  return {
    getMetric: webVitalsMonitor.getMetric.bind(webVitalsMonitor),
    getAllMetrics: webVitalsMonitor.getAllMetrics.bind(webVitalsMonitor),
    generateReport: webVitalsMonitor.generateReport.bind(webVitalsMonitor),
    getPerformanceSummary: webVitalsMonitor.getPerformanceSummary.bind(webVitalsMonitor),
    debugInfo: webVitalsMonitor.debugInfo.bind(webVitalsMonitor),
  };
}

export default webVitalsMonitor;
