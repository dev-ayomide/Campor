import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { AuthenticatedRedirect, RequireAuth } from './components/ProtectedRoute';

// Import the verify image
import verifyImage from './assets/images/verifyscreen.png';

// Import pages from new organized structure
import { Landing, Marketplace, ProductDetail } from './pages/marketplace';
import { Cart } from './pages/cart';
import Profile from './pages/Profile';
import { 
  Onboarding, 
  Dashboard, 
  Products, 
  Orders, 
  Customers, 
  Analytics, 
  AddProduct 
} from './pages/seller';
import { AuthLanding, Login, Register, Verify } from './pages/auth';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AuthenticatedRedirect>
            <MainLayout><Landing /></MainLayout>
          </AuthenticatedRedirect>
        } />
        <Route path="/marketplace" element={<MainLayout><Marketplace /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
        <Route path="/cart" element={
          <RequireAuth>
            <MainLayout><Cart /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth>
            <MainLayout><Profile /></MainLayout>
          </RequireAuth>
        } />
        
        {/* Seller Routes */}
        <Route path="/seller/onboarding" element={<MainLayout><Onboarding /></MainLayout>} />
        <Route path="/seller/dashboard" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
        <Route path="/seller/products" element={
          <RequireAuth>
            <Products />
          </RequireAuth>
        } />
        <Route path="/seller/orders" element={
          <RequireAuth>
            <Orders />
          </RequireAuth>
        } />
        <Route path="/seller/customers" element={
          <RequireAuth>
            <Customers />
          </RequireAuth>
        } />
        <Route path="/seller/analytics" element={
          <RequireAuth>
            <Analytics />
          </RequireAuth>
        } />
        <Route path="/seller/products/add" element={
          <RequireAuth>
            <AddProduct />
          </RequireAuth>
        } />

        <Route path="/auth" element={<AuthLayout><AuthLanding /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/verify" element={<AuthLayout heroImage={verifyImage}><Verify /></AuthLayout>} />

        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Routes>
    </Router>
  );
}
