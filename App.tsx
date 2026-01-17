import React, { useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import SplashCursor from './components/SplashCursor';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';
import webVitalsMonitor from './services/webVitalsMonitor';
import { AuthProvider, useAuth } from './src/auth/AuthContext';

// Lazy load page components for code splitting
const Home = React.lazy(() => import('./pages/Home'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Profile = React.lazy(() => import('./pages/Profile'));
const MountainVillas = React.lazy(() => import('./pages/MountainVillas'));
const Safaris = React.lazy(() => import('./pages/Safaris'));
const UrbanApartments = React.lazy(() => import('./pages/UrbanApartments'));
const Others = React.lazy(() => import('./pages/Others'));

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout component that conditionally shows navbar and footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isAuthPage = pathname === '/auth' || pathname === '/#/auth' || !user;
  
  return (
    <>
      {!isAuthPage && <Navbar />}
      <main 
        id="main-content"
        className={!isAuthPage ? "flex-grow pt-24" : "flex-grow"}
        role="main"
      >
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
};

const AppContent: React.FC = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // Redirect unauthenticated users to Auth page
  if (!user) {
    return (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="*" element={<Auth />} />
          </Routes>
        </Suspense>
      </Layout>
    );
  }

  // Authenticated users see the full app
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mountain-villas"
            element={
              <ProtectedRoute>
                <MountainVillas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/safaris"
            element={
              <ProtectedRoute>
                <Safaris />
              </ProtectedRoute>
            }
          />
          <Route
            path="/urban-apartments"
            element={
              <ProtectedRoute>
                <UrbanApartments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/others"
            element={
              <ProtectedRoute>
                <Others />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  // Initialize Web Vitals monitoring
  useEffect(() => {
    // Setup report callback for Web Vitals
    webVitalsMonitor.onReport((report) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vitals Report]', report);
      }
      // In production, you'd send this to your analytics service:
      // sendToAnalytics(report);
    });

    // Send final report when page is about to unload
    const handleBeforeUnload = () => {
      webVitalsMonitor.sendReport();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Cleanup observers when app unmounts
      webVitalsMonitor.destroy();
    };
  }, []);

  // Initialize Web Vitals monitoring
  useEffect(() => {
    // Setup report callback for Web Vitals
    webVitalsMonitor.onReport((report) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vitals Report]', report);
      }
      // In production, you'd send this to your analytics service:
      // sendToAnalytics(report);
    });

    // Send final report when page is about to unload
    const handleBeforeUnload = () => {
      webVitalsMonitor.sendReport();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Cleanup observers when app unmounts
      webVitalsMonitor.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <Router>
            <SplashCursor />
            <ScrollToTop />
            {/* Skip to main content link for keyboard users */}
            <a 
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded"
            >
              Skip to main content
            </a>
            <div className="flex flex-col min-h-screen bg-white font-sans text-dark selection:bg-primary selection:text-white">
              <AppContent />
            </div>
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;