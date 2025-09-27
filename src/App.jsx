import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ChatLayout from './layouts/ChatLayout';
import AuthLayout from './layouts/AuthLayout';
import SellerLayout from './layouts/SellerLayout';
import { AuthenticatedRedirect, RequireAuth } from './components/ProtectedRoute';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ScrollToTop } from './components/common';

// Import the verify image
import verifyImage from './assets/images/verifyscreen.png';

// Import pages from new organized structure
import { Landing, Marketplace, ProductDetail } from './pages/marketplace';
import { Cart } from './pages/cart';
import { Wishlist } from './pages/wishlist';
import Profile from './pages/Profile';
import UserOrders from './pages/UserOrders';
import CategoryPage from './pages/categories/CategoryPage';
import { 
  Onboarding, 
  Dashboard, 
  Products, 
  Orders, 
  Customers, 
  Analytics, 
  AddProduct,
  EditProduct,
  ViewProduct,
  Settings
} from './pages/seller';
import SellerCatalogue from './pages/seller/SellerCatalogue';
import { AuthLanding, Login, Register, Verify, ForgotPassword, ResetPassword } from './pages/auth';
import { Chat } from './pages/chat';
import NotFound from './pages/NotFound';
import PaymentVerification from './pages/PaymentVerification';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <WishlistProvider>
          <Routes>
        <Route path="/" element={
          <AuthenticatedRedirect>
            <MainLayout><Landing /></MainLayout>
          </AuthenticatedRedirect>
        } />
        <Route path="/marketplace" element={
          <RequireAuth>
            <MainLayout><Marketplace /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/product/:slug" element={
          <RequireAuth>
            <MainLayout><ProductDetail /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/cart" element={
          <RequireAuth>
            <MainLayout><Cart /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/wishlist" element={
          <RequireAuth>
            <MainLayout><Wishlist /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth>
            <MainLayout><Profile /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/orders" element={
          <RequireAuth>
            <MainLayout><UserOrders /></MainLayout>
          </RequireAuth>
        } />
        
        {/* Chat Route */}
        <Route path="/chat" element={
          <RequireAuth>
            <ChatLayout><Chat /></ChatLayout>
          </RequireAuth>
        } />
        
        {/* Category Routes */}
        <Route path="/category/:categoryId" element={
          <RequireAuth>
            <MainLayout><CategoryPage /></MainLayout>
          </RequireAuth>
        } />
        
        {/* Seller Catalogue Route - Public */}
        <Route path="/seller/:sellerId/catalogue" element={
          <RequireAuth>
            <MainLayout><SellerCatalogue /></MainLayout>
          </RequireAuth>
        } />
        
        {/* Payment Verification Route - No auth required */}
        <Route path="/payment/verify" element={<PaymentVerification />} />
        
        {/* Seller Routes */}
        <Route path="/seller/onboarding" element={
          <RequireAuth>
            <MainLayout><Onboarding /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/seller/dashboard" element={
          <RequireAuth>
            <SellerLayout><Dashboard /></SellerLayout>
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
        <Route path="/seller/products/edit/:productId" element={
          <RequireAuth>
            <EditProduct />
          </RequireAuth>
        } />
        <Route path="/seller/products/:productId" element={
          <RequireAuth>
            <ViewProduct />
          </RequireAuth>
        } />
        <Route path="/seller/settings" element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        } />

        <Route path="/auth" element={<AuthLayout><AuthLanding /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/verify" element={<AuthLayout heroImage={verifyImage}><Verify /></AuthLayout>} />
        <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
        <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />

        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}



