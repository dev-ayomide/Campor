import { Navbar, Footer } from '../components/layout';
import { useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const location = useLocation();
  const isMarketplace = location.pathname === '/marketplace';
  const isSellerCatalogue = location.pathname.includes('/seller/') && location.pathname.includes('/catalogue');
  const isOrdersPage = location.pathname === '/orders' || location.pathname.startsWith('/orders/');
  const isCartPage = location.pathname === '/cart';
  const isWishlistPage = location.pathname === '/wishlist';
  const isTermsPage = location.pathname === '/terms';
  
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F0' }}>
      <Navbar />
      {isMarketplace || isSellerCatalogue ? (
        <main className="flex-1 pt-20">
          {children}
        </main>
      ) : isCartPage || isWishlistPage || isOrdersPage ? (
        <main className="flex-1">
          {children}
        </main>
      ) : isTermsPage ? (
        <main className="flex-1 py-8 pt-16">
          {children}
        </main>
      ) : (
        <main className="flex-1 py-8 pt-16">
          {children}
        </main>
      )}
      <Footer />
    </div>
  );
}
