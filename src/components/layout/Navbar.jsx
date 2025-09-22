import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useState } from 'react';
import MobileSellerMenu from './MobileSellerMenu';
import AcceptOrder from '../seller/AcceptOrder';
import { ShoppingBagIcon, ChatIcon, ProfileIcon } from '../common';

export default function Navbar({ variant = 'default', onSellerMenuToggle, isSellerMenuOpen, setIsSellerMenuOpen }) {
  const { user, logout, isSeller } = useAuth();
  const { getItemCount } = useCart();
  const { getItemCount: getWishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAcceptOrderModalOpen, setIsAcceptOrderModalOpen] = useState(false);
  const location = useLocation();
  
  // Debug logging for seller status
  console.log('🔍 Navbar: User:', user);
  console.log('🔍 Navbar: isSeller:', isSeller);
  console.log('🔍 Navbar: user.sellerCompleted:', user?.sellerCompleted);
  console.log('🔍 Navbar: user.isSeller:', user?.isSeller);
  console.log('🔍 Navbar: user.seller:', user?.seller);
  
  // Determine if user is signed in for navbar state
  const isSignedIn = !!user;
  
  // Check if we're on a seller dashboard page (excluding onboarding and catalogue which should show buyer navbar)
  const isSellerPage = location.pathname.startsWith('/seller/') && 
    location.pathname !== '/seller/onboarding' && 
    !location.pathname.includes('/catalogue');

  // Handle complete order with inventory deduction
  // Handle Accept Order modal
  const handleAcceptOrder = () => {
    setIsAcceptOrderModalOpen(true);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 pl-0 pr-6 py-4 ${!isSignedIn ? 'font-montserrat' : ''}`} style={{ backgroundColor: '#F7F5F0' }}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center pl-6">
            <Link to="/marketplace" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Campor Logo" 
                className="w-6 h-6 mr-3 object-contain"
              />
              <span className="text-xl font-bold text-gray-900 mr-12">Campor</span>
            </Link>
            {/* Dynamic Page Title - only show on seller pages and desktop */}
            {isSellerPage && (
              <span className="hidden md:block text-xl font-bold text-gray-900">
                {location.pathname === '/seller/dashboard' && 'Seller Dashboard'}
                {location.pathname.startsWith('/seller/products') && 'Products Management'}
                {location.pathname === '/seller/orders' && 'Orders Management'}
                {location.pathname === '/seller/customers' && 'Customers Management'}
                {location.pathname === '/seller/analytics' && 'Analytics'}
                {location.pathname === '/seller/settings' && 'Settings'}
              </span>
            )}
          </div>

          {/* Desktop Navigation - Show different navigation based on sign-in status */}
        <div className="hidden lg:flex items-center space-x-8">
          {!isSignedIn ? (
            // Navigation for non-signed-in users (landing page)
            <>
              <a 
                href="#features" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                How it works
              </a>
              <a 
                href="#core-features" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                Products
              </a>
              <a 
                href="#faq" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                Client Stories
              </a>
            </>
          ) : (
            // Navigation for signed-in users - Keep this empty for clean design
            <>
            </>
          )}
        </div>

        {/* Desktop Auth Buttons - Different layout based on sign-in status */}
        <div className="hidden lg:flex items-center space-x-6">
          {!isSignedIn ? (
            // Buttons for non-signed-in users
            <>
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/auth" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Get Started
              </Link>
            </>
          ) : (
            // Buttons for signed-in users
            <>
              {/* Chat Button */}
              {/* Accept Order Button - only show on seller pages */}
              {isSellerPage && (
                <button 
                  onClick={handleAcceptOrder}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Accept Order
                </button>
              )}

              <Link 
                to="/chat" 
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <ChatIcon className="w-5 h-5" />
                Chat
              </Link>

              {/* Sell/Seller Dashboard Button - only show on non-seller pages */}
              {!isSellerPage && (
                <Link 
                  to={isSeller ? "/seller/dashboard" : "/seller/onboarding"} 
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {isSeller ? "Seller Dashboard" : "Sell"}
                </Link>
              )}

              {/* Me Button */}
              <Link 
                to="/profile" 
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <ProfileIcon className="w-5 h-5" />
                Me
              </Link>

              {/* Wishlist Button with Counter (hide on seller pages) */}
              {!isSellerPage && (
                <Link 
                  to="/wishlist" 
                  className="relative flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {getWishlistCount() > 99 ? '99+' : getWishlistCount()}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart Button with Counter (hide on seller pages) */}
              {!isSellerPage && (
                <Link 
                  to="/cart" 
                  className="relative flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ShoppingBagIcon className="w-6 h-6" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {getItemCount() > 99 ? '99+' : getItemCount()}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={logout}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign out
              </button>
            </>
          )}
        </div>

        {/* Mobile Actions - Wishlist, Cart and Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Get Started Button for Mobile (only show when NOT signed in) */}
          {!isSignedIn && (
            <Link 
              to="/auth" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors text-sm"
            >
              Get Started
            </Link>
          )}
          
          {/* Wishlist Button for Mobile (only show when signed in and NOT on seller pages) */}
          {isSignedIn && !isSellerPage && (
            <Link 
              to="/wishlist" 
              className="relative flex items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {getWishlistCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {getWishlistCount() > 99 ? '99+' : getWishlistCount()}
                </span>
              )}
            </Link>
          )}
          
          {/* Cart Button for Mobile (only show when signed in and NOT on seller pages) */}
          {isSignedIn && !isSellerPage && (
            <Link 
              to="/cart" 
              className="relative flex items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingBagIcon className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {getItemCount() > 99 ? '99+' : getItemCount()}
                </span>
              )}
            </Link>
          )}
          
          {/* Accept Order Button for Mobile (only on seller pages) */}
          {isSellerPage && (
            <button 
              onClick={handleAcceptOrder}
              className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Complete</span>
            </button>
          )}
          
          {/* Seller Sidebar Menu Button (only on seller pages) */}
          {isSellerPage && onSellerMenuToggle && (
            <button
              onClick={onSellerMenuToggle}
              className="flex items-center justify-center w-10 h-10"
            >
              <img 
                src="/nav-icon.svg" 
                alt="Menu" 
                className={`w-10 h-10 transition-transform ${isSellerMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
          )}
          
          {/* Regular Mobile Menu Button (only on non-seller pages) */}
          {!isSellerPage && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10"
            >
              <img 
                src="/nav-icon.svg" 
                alt="Menu" 
                className="w-10 h-10"
              />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu (only show on non-seller pages) */}
      {!isSellerPage && (
        <>
          {/* Overlay */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          {/* Mobile Menu */}
          <div
            className={`
              fixed inset-0 z-50 flex flex-col
              transition-transform duration-300 ease-in-out
              ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
            style={{ backgroundColor: '#F7F5F0' }}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between px-4 pt-4 pb-0">
              <div className="flex items-center">
                <img 
                  src="/logo.svg" 
                  alt="Campor Logo" 
                  className="w-6 h-6 mr-3 object-contain"
                />
                <span className="text-xl font-bold text-gray-900">Campor</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {!isSignedIn ? (
                // Mobile navigation for non-signed-in users
                <>
                  <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wide border-b border-gray-100 mb-4">
                    Your Trusted University Marketplace
                  </div>
                  <a 
                    href="#features" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a 
                    href="#how-it-works" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How it works
                  </a>
                  <a 
                    href="#core-features" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Products
                  </a>
                  <a 
                    href="#faq" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-4 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Client Stories
                  </a>
                  <div className="border-t border-gray-100 pt-4">
                    <Link 
                      to="/login" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/auth" 
                      className="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 font-medium transition-colors rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              ) : (
                // Mobile navigation for signed-in users
                <>
                  <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wide border-b border-gray-100 mb-4">
                    Your Trusted University Marketplace
                  </div>
                  
                  <Link 
                    to="/marketplace" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  
                  <Link 
                    to="/marketplace" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Market Place
                  </Link>
                  
                  <Link 
                    to="/chat" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Chat
                  </Link>
                  
                  {/* Dynamic Sell/Seller Dashboard button */}
                  {!isSellerPage && (
                    <Link 
                      to={isSeller ? "/seller/dashboard" : "/seller/onboarding"} 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {isSeller ? "Seller Dashboard" : "Sell"}
                    </Link>
                  )}
                  
                  {/* Back to Marketplace link (only show on seller pages) */}
                  {isSellerPage && (
                    <Link 
                      to="/marketplace" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Back to Marketplace
                    </Link>
                  )}
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  {/* Wishlist - only show on buyer pages */}
                  {!isSellerPage && (
                    <Link 
                      to="/wishlist" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                  )}
                  
                  {/* Cart - only show on buyer pages */}
                  {!isSellerPage && (
                    <Link 
                      to="/cart" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cart
                    </Link>
                  )}
                  
                  {/* Orders - show for all signed-in users */}
                  <Link 
                    to="/orders" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile Seller Menu (only show on seller pages) */}
      {isSellerPage && (
        <MobileSellerMenu 
          isOpen={isSellerMenuOpen} 
          onClose={() => setIsSellerMenuOpen && setIsSellerMenuOpen(false)} 
        />
      )}

      {/* Accept Order Modal */}
      <AcceptOrder
        isOpen={isAcceptOrderModalOpen}
        onClose={() => setIsAcceptOrderModalOpen(false)}
      />
    </nav>
  );
}

