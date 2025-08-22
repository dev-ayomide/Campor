import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { AuthenticatedRedirect, RequireAuth } from './components/ProtectedRoute';

// Import the verify image
import verifyImage from './assets/images/verifyscreen.png';

import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import SellerOnboardingPage from './pages/seller/SellerOnboardingPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerCustomersPage from './pages/seller/SellerCustomersPage';
import SellerAnalyticsPage from './pages/seller/SellerAnalyticsPage';
import AddProductPage from './pages/seller/AddProductPage';
import AuthLandingPage from './pages/AuthLandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AuthenticatedRedirect>
            <MainLayout><LandingPage /></MainLayout>
          </AuthenticatedRedirect>
        } />
        <Route path="/marketplace" element={<MainLayout><MarketplacePage /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
        <Route path="/cart" element={
          <RequireAuth>
            <MainLayout><CartPage /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth>
            <MainLayout><ProfilePage /></MainLayout>
          </RequireAuth>
        } />
        
        {/* Seller Routes */}
        <Route path="/seller-onboarding" element={<MainLayout><SellerOnboardingPage /></MainLayout>} />
        <Route path="/seller/dashboard" element={
          <RequireAuth>
            <SellerDashboardPage />
          </RequireAuth>
        } />
        <Route path="/seller/products" element={
          <RequireAuth>
            <SellerProductsPage />
          </RequireAuth>
        } />
        <Route path="/seller/orders" element={
          <RequireAuth>
            <SellerOrdersPage />
          </RequireAuth>
        } />
        <Route path="/seller/customers" element={
          <RequireAuth>
            <SellerCustomersPage />
          </RequireAuth>
        } />
        <Route path="/seller/analytics" element={
          <RequireAuth>
            <SellerAnalyticsPage />
          </RequireAuth>
        } />
        <Route path="/seller/products/add" element={
          <RequireAuth>
            <AddProductPage />
          </RequireAuth>
        } />

        <Route path="/auth" element={<AuthLayout><AuthLandingPage /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="/verify" element={<AuthLayout heroImage={verifyImage}><VerifyAccountPage /></AuthLayout>} />

        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Routes>
    </Router>
  );
}
