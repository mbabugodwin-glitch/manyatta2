# Quick Start: Testing Performance & Accessibility

## 🚀 Start Development Server

```bash
npm run dev
```

The app will start with performance metrics panel in bottom-right corner.

---

## 🎯 Test Code-Splitting

### 1. Open Chrome DevTools
- **F12** or Right-click → Inspect

### 2. Go to Network Tab
- Reload page (Ctrl+R)
- Watch chunks load

### 3. Navigate Between Pages
- Click "Mountain Villas", "Safaris", etc.
- Each page loads its own chunk (~50-100KB)
- Routes don't include all pages in initial bundle

### 4. Check Bundle Size
```bash
npm run build
# Check dist/assets/ folder
# Look for file sizes - should be much smaller
```

---

## ♿ Test Accessibility

### 1. Close Mouse & Use Keyboard Only

**In any modal (Image Gallery, Story Modal)**:
- **Tab** - Move to next element
- **Shift + Tab** - Move to previous element
- **Arrow Keys** - Navigate images
- **Space** - Toggle autoplay (gallery)
- **Esc** - Close modal

### 2. Test Focus Trap
- Open image gallery modal
- Press Tab repeatedly
- Focus should cycle between buttons/elements
- Focus should NOT leave the modal

### 3. Test with Screen Reader
- **Windows**: NVDA (free) or JAWS
- **Mac**: VoiceOver (built-in, Cmd+F5)
- **Chrome**: Built-in screen reader
- Verify it reads:
  - Modal title
  - Button labels
  - Image descriptions

### 4. Check ARIA Labels
- Open DevTools → Elements
- Click element
- Look for:
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-labelledby="..."`
  - `aria-label="..."`

---

## 📊 Test Performance Metrics

### 1. View Metrics Panel (Dev Mode)

Bottom-right corner shows:
- **Performance Score** (0-100%)
- **LCP**: Largest Contentful Paint (2.5s target)
- **FID**: First Input Delay (100ms target)
- **INP**: Interaction to Next Paint (200ms target)
- **CLS**: Cumulative Layout Shift (0.1 target)
- **TTFB**: Time to First Byte (800ms target)

### 2. Check Individual Metrics

Click "Show Metrics" to expand panel and see:
- Each metric value
- Rating (good/needs-improvement/poor)
- Color coding (green/yellow/red)

### 3. Simulate Slow Network

In DevTools → Network tab:
1. Click "No throttling" dropdown
2. Select "Slow 3G" or "Fast 3G"
3. Reload page
4. Watch metrics update
5. Check if they still meet targets

### 4. Copy Debug Info

In metrics panel:
1. Click "Copy Debug Info"
2. Paste in text editor
3. See all metrics, timestamp, URL

### 5. Test Modal Performance

1. Open image gallery modal
2. Check metrics while scrolling images
3. Check INP metric (should be < 200ms)
4. Images should load smoothly

---

## 🔧 Common Tests

### Test 1: Verify Code-Splitting Works

```
1. Open DevTools → Network
2. Filter by "js"
3. Reload page
4. Should see main chunk loaded
5. Click "Mountain Villas"
6. Should see new chunk loaded (mountain-villas.xxx.js)
7. Don't see all pages loaded at once ✓
```

### Test 2: Verify Accessibility Works

```
1. Put hand on keyboard, away from mouse
2. Press Tab multiple times
3. Should see visual focus indicator
4. Open modal
5. Tab should cycle between modal elements only
6. Escape should close modal
```

### Test 3: Verify Performance Monitoring

```
1. Look at metrics panel
2. See "Performance Score" percentage
3. See individual metrics (LCP, FID, CLS, etc.)
4. Each has rating: green (good), yellow (needs improvement), red (poor)
5. Metrics should update as you interact
```

---

## 📱 Mobile Testing

### 1. On Same Device
- Use DevTools device emulation
- Chrome DevTools → click device icon
- Select "iPhone 12" or similar
- Test touch interactions

### 2. On Real Device
- Get local IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
- Access: `http://YOUR_IP:3000`
- Test on actual phone

### Expected on Mobile:
- ✅ Metrics panel hides (or shows at bottom)
- ✅ Image gallery works with swipe
- ✅ Touch keyboard closes modal
- ✅ All buttons accessible with touch

---

## 🏗️ Build & Production Testing

### Build Optimized Version
```bash
npm run build
npm run preview  # Serves optimized build locally
```

### Run Lighthouse Audit
1. Open `http://localhost:4173` (from preview)
2. Chrome DevTools → Lighthouse tab
3. Click "Analyze page load"
4. Wait for results
5. Check scores:
   - Performance: Target > 90
   - Accessibility: Target > 95
   - Best Practices: Target > 90
   - SEO: Target > 90

### View Bundle Analysis
```bash
npm run build
ls dist/assets/
# Should see ~3-5 chunk files (not one giant bundle)
```

---

## 🐛 Debugging Tips

### Check Metrics Console Log
```bash
# In DevTools → Console, you'll see logs like:
[Web Vitals] LCP: 2234.50ms - good
[Web Vitals] FID: 45.23ms - good
[Web Vitals] CLS: 0.05 - good
```

### Check Network Waterfall
- DevTools → Network
- Look for blue (JS parse), purple (render), green (paint)
- Images should start loading early

### Check JavaScript Execution
- DevTools → Performance tab
- Click record, reload, stop
- Look for long tasks (red flags)
- Mouse over events to see duration

### Monitor Over Time
```tsx
// In browser console:
webVitalsMonitor.debugInfo()
// Copies all metrics to clipboard
```

---

## ✅ Sign-Off Checklist

### Code-Splitting ✓
- [ ] Initial bundle < 200KB
- [ ] Pages load on-demand
- [ ] Modal chunks load when needed
- [ ] No "js" waterfall in Network (spread out)

### Accessibility ✓
- [ ] Keyboard-only navigation works
- [ ] Focus visible on all elements
- [ ] Tab trap works in modal
- [ ] Escape closes modal
- [ ] Screen reader can use app

### Performance ✓
- [ ] LCP < 2.5s (green metric)
- [ ] FID < 100ms (green metric)
- [ ] CLS < 0.1 (green metric)
- [ ] Performance score > 90
- [ ] Metrics panel shows in dev mode

---

## 📞 Common Issues & Solutions

### Problem: Metrics panel not showing
**Solution**: Make sure `process.env.NODE_ENV === 'development'`

### Problem: Modals load slowly
**Solution**: Use `prefetchModals()` to load on idle

### Problem: Performance score low
**Solution**: 
- Check LCP (mark hero image with `priority={true}`)
- Check CLS (add aspect ratio to images)
- Check FID (keep handlers fast)

### Problem: Focus doesn't trap in modal
**Solution**: Ensure modal has `ref={modalRef}` from `useFocusTrap()`

### Problem: ESC doesn't close modal
**Solution**: Ensure using `useEscapeKey(isOpen, onClose)`

---

## 🎬 Demo Scenario

**Best way to see everything working**:

1. Start dev server: `npm run dev`
2. Open in Chrome
3. Check metrics panel (bottom-right) → shows good scores
4. Click "Mountain Villas" → watch chunk load in Network tab
5. Click "Open Gallery" → image modal opens lazily
6. Use arrow keys to navigate images
7. Press ESC to close
8. All without using mouse!

---

## 📈 Performance Baseline

After running through all tests, you should see:

```
Initial Load:
✓ LCP: 2.0-2.5s (good)
✓ FID: <50ms (good)
✓ CLS: <0.05 (good)
✓ Bundle: <150KB initial

Interaction:
✓ Modal opens: <300ms
✓ Image navigation: <100ms
✓ Page transitions: <500ms (with code-split chunk load)

Accessibility:
✓ Keyboard-only: Fully functional
✓ Screen reader: All content readable
✓ Focus trap: Working in modals
```

---

## 🚀 Ready for Backend?

Once all tests pass:
- ✅ Code-splitting reduces bundle → Backend can integrate routes
- ✅ Accessibility done → No blocking issues
- ✅ Performance monitored → Baseline established
- ✅ Ready to connect API endpoints

Start backend work in parallel!

---

**Happy Testing! 🎉**
