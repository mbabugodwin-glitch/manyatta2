/**
 * Performance Monitoring Hook & Components
 * Displays Web Vitals metrics for debugging and monitoring
 */

import React, { useEffect, useState } from 'react';
import { webVitalsMonitor, WebVitalsReport } from '../services/webVitalsMonitor';

/**
 * Hook to access Web Vitals data and subscribe to updates
 */
export function useWebVitalsMetrics() {
  const [report, setReport] = useState<WebVitalsReport | null>(null);
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    webVitalsMonitor.onReport((newReport) => {
      setReport(newReport);
    });

    // Also manually generate report after short delay
    const timer = setTimeout(() => {
      setReport(webVitalsMonitor.generateReport());
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return {
    report,
    summary: report ? webVitalsMonitor.getPerformanceSummary() : null,
    isVisible,
    setIsVisible,
    debugInfo: webVitalsMonitor.debugInfo(),
  };
}

/**
 * Performance badge that shows metric status
 */
export const PerformanceBadge: React.FC<{
  metric: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit?: string;
}> = ({ metric, value, rating, unit = 'ms' }) => {
  const colorMap = {
    good: 'bg-green-500',
    'needs-improvement': 'bg-yellow-500',
    poor: 'bg-red-500',
  };

  return (
    <div className={`${colorMap[rating]} px-3 py-1 rounded-full text-white text-xs font-semibold`}>
      {metric}: {value.toFixed(2)}{unit} ({rating})
    </div>
  );
};

/**
 * Performance metrics panel for development
 */
export const PerformanceMetricsPanel: React.FC<{ isDev?: boolean }> = ({ isDev = true }) => {
  const { report, summary, isVisible, setIsVisible, debugInfo } = useWebVitalsMetrics();

  if (!isDev || !report) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[999]">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
        aria-label="Toggle performance metrics"
      >
        {isVisible ? 'Hide' : 'Show'} Metrics
      </button>

      {isVisible && (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold mb-3">Web Vitals</h3>

          {/* Summary Score */}
          {summary && (
            <div className="mb-4 p-3 bg-gray-800 rounded">
              <p className="text-sm">Performance Score: <span className="font-bold">{summary.score.toFixed(1)}%</span></p>
              <div className="text-xs text-gray-400 mt-1">
                Good: {summary.goodCount} | Needs Improvement: {summary.needsImprovementCount} | Poor: {summary.poorCount}
              </div>
            </div>
          )}

          {/* Individual Metrics */}
          <div className="space-y-2 mb-4">
            {Object.entries(report.metrics).map(([key, value]) => {
              const rating = report.ratings[key as keyof typeof report.ratings];
              if (!rating) return null;
              return (
                <PerformanceBadge
                  key={key}
                  metric={key.toUpperCase()}
                  value={value}
                  rating={rating}
                  unit={key === 'cls' ? '' : 'ms'}
                />
              );
            })}
          </div>

          {/* Debug Info */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(debugInfo);
              alert('Debug info copied to clipboard');
            }}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-mono transition-colors"
          >
            Copy Debug Info
          </button>

          <div className="mt-3 text-xs text-gray-400">
            <p>URL: {window.location.href.substring(0, 50)}...</p>
            <p>Updated: {new Date(report.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Custom hook for tracking specific metric thresholds
 */
export function useMetricAlert(
  metricName: 'LCP' | 'FID' | 'INP' | 'CLS' | 'TTFB',
  threshold: number,
  onAlert?: (value: number) => void
) {
  useEffect(() => {
    const metric = webVitalsMonitor.getMetric(metricName);
    if (metric && metric.value > threshold) {
      onAlert?.(metric.value);
    }
  }, [metricName, threshold, onAlert]);
}

/**
 * Performance monitoring context
 */
interface PerformanceContextType {
  report: WebVitalsReport | null;
  summary: { goodCount: number; needsImprovementCount: number; poorCount: number; score: number } | null;
}

const PerformanceContext = React.createContext<PerformanceContextType>({
  report: null,
  summary: null,
});

export const usePerformanceContext = () => React.useContext(PerformanceContext);

/**
 * Provider component for performance monitoring
 */
export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [report, setReport] = useState<WebVitalsReport | null>(null);

  useEffect(() => {
    webVitalsMonitor.onReport((newReport) => {
      setReport(newReport);
    });

    // Generate initial report
    const timer = setTimeout(() => {
      setReport(webVitalsMonitor.generateReport());
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const summary = report ? webVitalsMonitor.getPerformanceSummary() : null;

  return (
    <PerformanceContext.Provider value={{ report, summary }}>
      {children}
      {process.env.NODE_ENV === 'development' && <PerformanceMetricsPanel />}
    </PerformanceContext.Provider>
  );
};

export default {
  useWebVitalsMetrics,
  PerformanceBadge,
  PerformanceMetricsPanel,
  useMetricAlert,
  PerformanceProvider,
  usePerformanceContext,
};
