/**
 * Component Code-Splitting & Lazy Loading Utilities
 * Helpers for dynamic imports with error boundaries and loading fallbacks
 */

import React, { ComponentType, lazy, Suspense, ReactNode } from 'react';
import PageLoader from '../components/PageLoader';

/**
 * Enhanced lazy loading with error boundary
 * Wraps lazy components with Suspense and error handling
 */
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  FallbackComponent: ComponentType = PageLoader,
  ErrorComponent?: ComponentType<{ error: Error; retry: () => void }>
) {
  const LazyComponent = lazy(importFn);

  return React.forwardRef<any, P>((props, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const retry = () => {
      setHasError(false);
      setError(null);
    };

    if (hasError && ErrorComponent) {
      return <ErrorComponent error={error!} retry={retry} />;
    }

    return (
      <Suspense fallback={<FallbackComponent />}>
        <ErrorBoundary onError={(err) => {
          setHasError(true);
          setError(err);
        }}>
          <LazyComponent {...props} ref={ref} />
        </ErrorBoundary>
      </Suspense>
    );
  });
}

/**
 * Prefetch a lazy-loaded component
 * Useful for improving perceived performance
 */
export async function prefetchLazyComponent(
  importFn: () => Promise<{ default: ComponentType }>
) {
  try {
    await importFn();
  } catch (error) {
    console.error('Failed to prefetch component:', error);
  }
}

/**
 * Create a lazy-loaded modal component
 */
export function lazyModal<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  const LazyComponent = lazy(importFn);

  return React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={null}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
}

/**
 * Error boundary for component errors
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
    console.error('Component error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error loading component</div>;
    }

    return this.props.children;
  }
}

/**
 * Lazy load modal components (e.g., ImageSlideshowModal, StoryModal)
 * These are only needed when user opens them
 */
export const lazyImageSlideshowModal = lazyModal(
  () => import('../components/ImageSlideshowModal')
);

export const lazyStoryModal = lazyModal(
  () => import('../components/StoryModal')
);

export const lazyImpactReportModal = lazyModal(
  () => import('../components/ImpactReportModal')
);

/**
 * Prefetch common modals on idle (improves perceived performance)
 */
export function prefetchModals() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchLazyComponent(() => import('../components/ImageSlideshowModal'));
      prefetchLazyComponent(() => import('../components/StoryModal'));
      prefetchLazyComponent(() => import('../components/ImpactReportModal'));
    });
  }
}

/**
 * Code-split component by route or feature
 */
export const CodeSplitConfig = {
  pages: {
    home: () => import('../pages/Home'),
    mountainVillas: () => import('../pages/MountainVillas'),
    safaris: () => import('../pages/Safaris'),
    urbanApartments: () => import('../pages/UrbanApartments'),
    others: () => import('../pages/Others'),
  },
  modals: {
    imageSlideshow: () => import('../components/ImageSlideshowModal'),
    story: () => import('../components/StoryModal'),
    impactReport: () => import('../components/ImpactReportModal'),
  },
  components: {
    glareHover: () => import('../components/GlareHover'),
    sectionHeader: () => import('../components/SectionHeader'),
  },
};

export default {
  withLazyLoading,
  prefetchLazyComponent,
  lazyModal,
  lazyImageSlideshowModal,
  lazyStoryModal,
  lazyImpactReportModal,
  prefetchModals,
  CodeSplitConfig,
};
