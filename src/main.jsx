import React, { lazy, Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PageLoader from './components/PageLoader';
import './index.css';

// Lazy load pages for code splitting
const MainLandingPage = lazy(() => import('./pages/MainLandingPage'));
const TestRideLandingPage = lazy(() => import('./pages/TestRideLandingPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ViperLandingPage = lazy(() => import('./pages/ViperLandingPage'));
const ViperKidsLandingPage = lazy(() => import('./pages/ViperKidsLandingPage'));
const ViperProductPage = lazy(() => import('./pages/ViperProductPage'));
const AdminPanel = lazy(() => import('./AdminPanel'));

// Lazy-load AuthProvider — only needed for /admin route
const LazyAuthProvider = lazy(() =>
  import('./contexts/AuthContext').then((m) => ({ default: m.AuthProvider }))
);

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Wraps a lazy component with Suspense + glass loader overlay
function LazyPage({ children }) {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Main Landing Page */}
        <Route
          path="/"
          element={
            <Layout headerTransparent={true}>
              <LazyPage><MainLandingPage /></LazyPage>
            </Layout>
          }
        />

        {/* Test Ride Landing Page - New URL */}
        <Route
          path="/test-ride/*"
          element={
            <Layout headerTransparent showFooter>
              <LazyPage><TestRideLandingPage /></LazyPage>
            </Layout>
          }
        />

        {/* Products Catalog Page */}
        <Route
          path="/products"
          element={
            <Layout headerTransparent>
              <LazyPage><ProductsPage /></LazyPage>
            </Layout>
          }
        />

        {/* Product Detail Page */}
        <Route
          path="/products/:productId"
          element={
            <Layout headerTransparent>
              <LazyPage><ProductDetailPage /></LazyPage>
            </Layout>
          }
        />

        {/* EMotorad Viper Landing Page */}
        <Route
          path="/viper"
          element={
            <Layout headerTransparent>
              <LazyPage><ViperLandingPage /></LazyPage>
            </Layout>
          }
        />

        {/* EMotorad Viper Kids Landing Page */}
        <Route
          path="/viper-kids"
          element={
            <Layout headerTransparent showExitPopup={false}>
              <LazyPage><ViperKidsLandingPage /></LazyPage>
            </Layout>
          }
        />

        {/* EMotorad Viper — product detail page (no price, ₹999 reservation) */}
        <Route
          path="/viper-kids/product"
          element={
            <Layout headerTransparent showExitPopup={false}>
              <LazyPage><ViperProductPage /></LazyPage>
            </Layout>
          }
        />

        {/* Redirect old URL to new URL */}
        <Route
          path="/test-5-get-1/*"
          element={<Navigate to="/test-ride" replace />}
        />

        {/* Legal Pages */}
        <Route
          path="/privacy-policy"
          element={
            <Layout>
              <LazyPage><PrivacyPolicy /></LazyPage>
            </Layout>
          }
        />
        <Route
          path="/terms"
          element={
            <Layout>
              <LazyPage><Terms /></LazyPage>
            </Layout>
          }
        />
        <Route
          path="/disclaimer"
          element={
            <Layout>
              <LazyPage><Disclaimer /></LazyPage>
            </Layout>
          }
        />

        {/* Admin Panel — AuthProvider loaded only here (no auth SDK on public pages) */}
        <Route path="/admin" element={
          <Suspense fallback={<PageLoader />}>
            <LazyAuthProvider>
              <AdminPanel />
            </LazyAuthProvider>
          </Suspense>
        } />

        {/* 404 - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
