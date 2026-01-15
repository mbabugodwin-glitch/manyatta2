# Performance Monitoring Cheat Sheet

## Quick Start

### 1. Check Metrics in Development

Metrics panel auto-shows in development mode (bottom-right corner). Click to expand/collapse.

### 2. Get Metrics in Code

```tsx
import { useWebVitalsMetrics } from '../hooks/usePerformance';

const { report, summary, debugInfo } = useWebVitalsMetrics();
console.log(summary.score); // 0-100%
```

### 3. Send to Analytics

```tsx
import webVitalsMonitor from '../services/webVitalsMonitor';

webVitalsMonitor.onReport((report) => {
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(report),
  });
});
```

---

## Metrics Interpretation

### LCP (Largest Contentful Paint)
- **What**: When main content becomes visible
- **Good**: < 2.5 seconds
- **How to improve**:
  - Use `priority={true}` on hero images
  - Lazy-load below-fold images
  - Minimize render-blocking JavaScript
  - Use Web Fonts optimized

### FID / INP (Interaction)
- **What**: Time to respond to user input
- **Good**: < 100ms (FID) or < 200ms (INP)
- **How to improve**:
  - Keep event handlers fast
  - Break up long tasks
  - Use `requestIdleCallback` for non-urgent work

### CLS (Cumulative Layout Shift)
- **What**: Unexpected layout changes
- **Good**: < 0.1
- **How to improve**:
  - Reserve space for images (aspect ratio)
  - Reserve space for ads/embeds
  - Don't insert content above existing content

### TTFB (Time to First Byte)
- **What**: Server response time
- **Good**: < 800ms
- **How to improve**: (Requires backend optimization)
  - Cache responses
  - Use CDN
  - Optimize server code

---

## Debugging

### Console Output (Dev Mode)

```
[Web Vitals] LCP: 2234.50ms - good
[Web Vitals] FID: 45.23ms - good
[Web Vitals] CLS: 0.05 - good
```

### Copy Debug Info

1. Open metrics panel (bottom-right)
2. Click "Copy Debug Info"
3. Paste in analytics/bug tracker

Contains:
- All metrics
- URL
- Navigation type (navigate/reload/back-forward)
- Timestamp

---

## Accessibility Checklist

- [ ] All modals use focus trap (Tab cycles)
- [ ] Escape key closes modals
- [ ] Keyboard users can access all features
- [ ] Images have alt text
- [ ] Links have descriptive text
- [ ] Form labels are associated
- [ ] Color isn't only indicator (use icons too)
- [ ] Text contrast meets WCAG AA (4.5:1 for normal text)

---

## Code-Splitting Checklist

- [ ] Route pages load on-demand
- [ ] Modals load on-demand
- [ ] Use `<Suspense>` fallbacks
- [ ] Test on slow 3G (DevTools → Network throttling)
- [ ] Verify chunks in bundle analysis
- [ ] Prefetch critical modals on idle

---

## Testing Performance

### Local Testing

1. **Build optimized bundle**:
   ```bash
   npm run build
   npm run preview  # Serves optimized build
   ```

2. **Run Lighthouse**:
   - Chrome DevTools → Lighthouse
   - Target: 90+ on Performance
   - Check Web Vitals scores

3. **Test on slow network**:
   - Chrome DevTools → Network
   - Throttle to "Slow 3G"
   - Reload and check metrics

### Production Monitoring

Use analytics dashboard to track over time:
- Daily average performance score
- Distribution of good/poor ratings
- Trends (improving/degrading)

---

## Common Issues & Fixes

### LCP > 3s?
- [ ] Mark hero images with `priority={true}`
- [ ] Check image size (use WebP)
- [ ] Check font loading (use font-display: swap)
- [ ] Remove render-blocking scripts

### CLS > 0.2?
- [ ] Add aspect ratio to image containers
- [ ] Use CSS height on dynamic content
- [ ] Avoid inserting content above existing content
- [ ] Use `transform` instead of `top`/`left` for animations

### FID/INP > 300ms?
- [ ] Profile with Chrome DevTools
- [ ] Break long JavaScript work
- [ ] Use Web Workers for heavy computation
- [ ] Defer non-critical JavaScript

### Modals slow to open?
- [ ] They should load on-demand (not in initial bundle)
- [ ] Use `lazyModal()` from `codeSplitting.tsx`
- [ ] Prefetch on idle with `prefetchModals()`

---

## File Structure

```
/services
  └── webVitalsMonitor.ts       ← Core monitoring service

/hooks
  ├── usePerformance.tsx        ← React hooks for metrics
  └── useAccessibility.ts       ← Accessibility hooks

/utils
  └── codeSplitting.tsx         ← Lazy-loading utilities
```

---

## Integration Examples

### Send to Google Analytics

```tsx
webVitalsMonitor.onReport((report) => {
  gtag.event('page_view', {
    lcp: report.metrics.lcp,
    fid: report.metrics.fid,
    cls: report.metrics.cls,
  });
});
```

### Send to Custom Backend

```tsx
webVitalsMonitor.onReport((report) => {
  fetch(`${API_BASE}/analytics/vitals`, {
    method: 'POST',
    body: JSON.stringify(report),
    keepalive: true, // Important for unload
  });
});
```

### Conditional Alerts

```tsx
useMetricAlert('LCP', 3000, (value) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(`High LCP: ${value}ms`);
  }
});
```

---

**Last Updated**: January 9, 2026
