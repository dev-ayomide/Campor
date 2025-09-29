import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useState, useEffect } from 'react';
import AcceptOrder from '../seller/AcceptOrder';
import { ShoppingBagIcon, ChatIcon, ProfileIcon } from '../common';

export default function Navbar({ variant = 'default' }) {
  const { user, logout, isSeller } = useAuth();
  const { getItemCount } = useCart();
  const { getItemCount: getWishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSellerNavOpen, setIsSellerNavOpen] = useState(false);
  const [isAcceptOrderModalOpen, setIsAcceptOrderModalOpen] = useState(false);
  const [isInSellerContext, setIsInSellerContext] = useState(false);
  const location = useLocation();
  
  // Debug logging for seller status
  
  // Determine if user is signed in for navbar state
  const isSignedIn = !!user;
  
  // Check if we're on a seller dashboard page (excluding onboarding and catalogue which should show buyer navbar)
  const isSellerPage = location.pathname.startsWith('/seller/') && 
    location.pathname !== '/seller/onboarding' && 
    !location.pathname.includes('/catalogue');

  // Context-aware navigation: Detect seller context and manage state
  useEffect(() => {
    // Set seller context when navigating to seller pages
    if (isSellerPage && isSeller) {
      setIsInSellerContext(true);
    } else if (!isSellerPage) {
      // Reset seller context when leaving seller pages
      setIsInSellerContext(false);
      setIsSellerNavOpen(false);
    }
  }, [location.pathname, isSellerPage, isSeller]);

  // Reset mobile menu states when menu closes
  useEffect(() => {
    if (!isMenuOpen) {
      setIsSellerNavOpen(false);
    }
  }, [isMenuOpen]);

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
              <span className="text-xl font-bold text-gray-900">Campor</span>
            </Link>
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
                Why Choose Us
              </a>
              <a 
                href="#faq" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              >
                FAQs
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
                  <svg className="w-5 h-5" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Market stall icon">
                    <defs>
                      <filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feOffset dx="0" dy="6" result="off"/>
                        <feGaussianBlur in="off" stdDeviation="8" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over" result="composite"/>
                        <feBlend in="SourceGraphic" in2="composite" mode="normal"/>
                      </filter>
                    </defs>
                    <g transform="translate(64,64) scale(0.875)" fill="none" strokeLinejoin="round" strokeLinecap="round">
                      <rect x="168" y="40" rx="16" ry="16" width="688" height="96" fill="#5A5B5D" stroke="#3E3E40" strokeWidth="6"/>
                      <path d="M128 168
                               L896 168
                               C912 168 944 178 964 206
                               C988 238 988 314 964 350
                               C944 378 912 388 896 388
                               L128 388
                               C112 388 80 378 60 350
                               C36 314 36 238 60 206
                               C80 178 112 168 128 168 Z"
                            fill="#4E4F51" stroke="#3A3A3B" strokeWidth="6"/>
                      <g transform="translate(0,0)" fill="#6A6B6D" stroke="#3A3A3B" strokeWidth="4">
                        <path d="M180 176 L300 176 L260 360 L220 360 Z" />
                        <path d="M320 176 L420 176 L380 360 L340 360 Z" />
                        <path d="M460 176 L560 176 L520 360 L480 360 Z" />
                        <path d="M600 176 L700 176 L660 360 L620 360 Z" />
                        <path d="M740 176 L860 176 L820 360 L780 360 Z" />
                      </g>
                      <path d="M140 388
                               C188 444 244 444 292 388
                               C340 444 396 444 444 388
                               C492 444 548 444 596 388
                               C644 444 700 444 748 388
                               L896 388"
                            fill="#4E4F51" stroke="#3A3A3B" strokeWidth="6" opacity="0.95"/>
                      <rect x="200" y="420" width="96" height="320" rx="12" ry="12" fill="#5A5B5D" stroke="#3A3A3B" strokeWidth="6"/>
                      <rect x="728" y="420" width="96" height="320" rx="12" ry="12" fill="#5A5B5D" stroke="#3A3A3B" strokeWidth="6"/>
                      <rect x="320" y="440" width="384" height="248" rx="6" ry="6" fill="#6A6B6D" stroke="#3A3A3B" strokeWidth="6"/>
                      <rect x="152" y="732" width="720" height="144" rx="20" ry="20" fill="#4E4F51" stroke="#2F2F30" strokeWidth="6"/>
                      <rect x="112" y="892" width="800" height="36" rx="18" ry="18" fill="#3E3E40" stroke="#2B2B2C" strokeWidth="4"/>
                      <g stroke="#2E2E30" strokeWidth="2" fill="none">
                        <rect x="168" y="40" rx="16" ry="16" width="688" height="96"/>
                        <path d="M128 168 L896 168 C912 168 944 178 964 206 C988 238 988 314 964 350 C944 378 912 388 896 388 L128 388 C112 388 80 378 60 350 C36 314 36 238 60 206 C80 178 112 168 128 168 Z"/>
                      </g>
                    </g>
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
          
          {/* Mobile Menu Button - Show for all pages on mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10"
            >
              <img 
                src="/nav-icon.svg" 
                alt="Menu" 
                className="w-10 h-10"
              />
            </button>
        </div>
      </div>

      {/* Mobile Menu - Show for all pages */}
      {isMenuOpen && (
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
              <div className="relative overflow-hidden h-full">
                {/* Main Menu - Show normal navigation when not in seller context */}
                <div className={`transition-all duration-300 ease-in-out ${!isSellerNavOpen && !isInSellerContext ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0 absolute inset-0'}`}>
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
                    Why Choose Us
                  </a>
                  <a 
                    href="#faq" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-4 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQs
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
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Marketplace
                  </Link>
                  
                  <Link 
                    to="/chat" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ChatIcon className="w-4 h-4 mr-3" />
                    Chat
                  </Link>
                  
                  {/* Dynamic Sell/Seller Dashboard button */}
                  {(
                    <>
                      {isSeller ? (
                        <button
                          onClick={() => setIsSellerNavOpen(true)}
                          className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2 group"
                        >
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-3" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Market stall icon">
                              <defs>
                                <filter id="inner-shadow-2" x="-50%" y="-50%" width="200%" height="200%">
                                  <feOffset dx="0" dy="6" result="off"></feOffset>
                                  <feGaussianBlur in="off" stdDeviation="8" result="blur"></feGaussianBlur>
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" result="composite"></feComposite>
                                  <feBlend in="SourceGraphic" in2="composite" mode="normal"></feBlend>
                                </filter>
                              </defs>
                              <g transform="translate(64,64) scale(0.875)" fill="none" strokeLinejoin="round" strokeLinecap="round">
                                <rect x="168" y="40" rx="16" ry="16" width="688" height="96" fill="#5A5B5D" stroke="#3E3E40" strokeWidth="6"></rect>
                                <path d="M128 168 L896 168 C912 168 944 178 964 206 C988 238 988 314 964 350 C944 378 912 388 896 388 L128 388 C112 388 80 378 60 350 C36 314 36 238 60 206 C80 178 112 168 128 168 Z" fill="#4E4F51" stroke="#3A3A3B" strokeWidth="6"></path>
                                <g transform="translate(0,0)" fill="#6A6B6D" stroke="#3A3A3B" strokeWidth="4">
                                  <path d="M180 176 L300 176 L260 360 L220 360 Z"></path>
                                  <path d="M320 176 L420 176 L380 360 L340 360 Z"></path>
                                  <path d="M460 176 L560 176 L520 360 L480 360 Z"></path>
                                  <path d="M600 176 L700 176 L660 360 L620 360 Z"></path>
                                  <path d="M740 176 L860 176 L820 360 L780 360 Z"></path>
                                </g>
                                <path d="M140 388 C188 444 244 444 292 388 C340 444 396 444 444 388 C492 444 548 444 596 388 C644 444 700 444 748 388 L896 388" fill="#4E4F51" stroke="#3A3A3B" strokeWidth="6" opacity="0.95"></path>
                                <rect x="200" y="420" width="96" height="320" rx="12" ry="12" fill="#5A5B5D" stroke="#3A3A3B" strokeWidth="6"></rect>
                                <rect x="728" y="420" width="96" height="320" rx="12" ry="12" fill="#5A5B5D" stroke="#3A3A3B" strokeWidth="6"></rect>
                                <rect x="320" y="440" width="384" height="248" rx="6" ry="6" fill="#6A6B6D" stroke="#3A3A3B" strokeWidth="6"></rect>
                                <rect x="152" y="732" width="720" height="144" rx="20" ry="20" fill="#4E4F51" stroke="#2F2F30" strokeWidth="6"></rect>
                                <rect x="112" y="892" width="800" height="36" rx="18" ry="18" fill="#3E3E40" stroke="#2B2B2C" strokeWidth="4"></rect>
                                <g stroke="#2E2E30" strokeWidth="2" fill="none">
                                  <rect x="168" y="40" rx="16" ry="16" width="688" height="96"></rect>
                                  <path d="M128 168 L896 168 C912 168 944 178 964 206 C988 238 988 314 964 350 C944 378 912 388 896 388 L128 388 C112 388 80 378 60 350 C36 314 36 238 60 206 C80 178 112 168 128 168 Z"></path>
                                </g>
                              </g>
                            </svg>
                            <span>Seller Dashboard</span>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                    <Link 
                          to="/seller/onboarding" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Sell
                    </Link>
                      )}
                    </>
                  )}
                  
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ProfileIcon className="w-4 h-4 mr-3" />
                    Profile
                  </Link>
                  
                  {/* Wishlist - show for all signed-in users */}
                  {(
                    <Link 
                      to="/wishlist" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      Wishlist
                    </Link>
                  )}
                  
                  {/* Cart - show for all signed-in users */}
                  {(
                    <Link 
                      to="/cart" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingBagIcon className="w-4 h-4 mr-3" />
                      Cart
                    </Link>
                  )}
                  
                  {/* Orders - show for all signed-in users */}
                  <Link 
                    to="/orders" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
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

                {/* Seller Menu - Show when in seller context or when seller nav is explicitly opened */}
                <div className={`transition-all duration-300 ease-in-out ${isSellerNavOpen || isInSellerContext ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0 absolute inset-0'}`}>
                  {/* Back button */}
                  <button
                    onClick={() => {
                      if (isInSellerContext) {
                        // If we're in seller context, go back to normal navbar
                        setIsInSellerContext(false);
                      } else {
                        // If seller nav was explicitly opened, just close it
                        setIsSellerNavOpen(false);
                      }
                    }}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-4"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">Back</span>
                  </button>

                  {/* Seller Navigation Items */}
                  <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wide border-b border-gray-100 mb-4">
                    Seller Dashboard
                  </div>
                  
                  <Link 
                    to="/seller/dashboard" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSellerNavOpen(false);
                      setIsInSellerContext(true); // Set seller context when navigating to dashboard
                    }}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </Link>
                  
                  <Link 
                    to="/seller/products" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSellerNavOpen(false);
                      setIsInSellerContext(true);
                    }}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Products
                  </Link>
                  
                  <Link 
                    to="/seller/orders" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSellerNavOpen(false);
                      setIsInSellerContext(true);
                    }}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Orders
                  </Link>
                  
                  {/* <Link 
                    to="/seller/customers" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSellerNavOpen(false);
                      setIsInSellerContext(true);
                    }}
                  >
                    <img 
                      src="/customers.svg" 
                      alt="Customers" 
                      className="w-4 h-4 mr-3" 
                    />
                    Customers
                  </Link> */}
                  
                  {/* <Link 
                    to="/seller/analytics" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSellerNavOpen(false);
                      setIsInSellerContext(true);
                    }}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analytics
                  </Link> */}
                  
                  <Link 
                    to="/seller/settings" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mb-4"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSellerNavOpen(false);
                      setIsInSellerContext(true);
                    }}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Accept Order Modal */}
      <AcceptOrder
        isOpen={isAcceptOrderModalOpen}
        onClose={() => setIsAcceptOrderModalOpen(false)}
      />
    </nav>
  );
}

