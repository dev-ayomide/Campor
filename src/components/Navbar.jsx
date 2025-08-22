import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import MobileSellerMenu from './MobileSellerMenu';

export default function Navbar({ variant = 'default', onSellerMenuToggle, isSellerMenuOpen, setIsSellerMenuOpen }) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Determine if user is signed in for navbar state
  const isSignedIn = !!user;
  
  // Check if we're on a seller page
  const isSellerPage = location.pathname.startsWith('/seller/');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 px-6 py-4" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to={isSignedIn ? "/marketplace" : "/"} className="flex items-center">
              <img 
                src="/src/assets/images/logo.png" 
                alt="Campor Logo" 
                className="w-8 h-8 mr-3 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Campor</span>
            </Link>
          </div>

          {/* Desktop Navigation - Show different navigation based on sign-in status */}
        <div className="hidden lg:flex items-center space-x-8">
          {!isSignedIn ? (
            // Navigation for non-signed-in users (landing page)
            <>
              <Link 
                to="/features" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                How it works
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Products
              </Link>
              <Link 
                to="/client-stories" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Client Stories
              </Link>
            </>
          ) : (
            // Navigation for signed-in users
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
              <Link 
                to="/chat" 
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat
              </Link>

              {/* Me Button */}
              <Link 
                to="/profile" 
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Me
              </Link>

              {/* Cart Button with Counter (hide on seller pages) */}
              {!isSellerPage && (
                <Link 
                  to="/cart" 
                  className="relative flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293a1 1 0 000 1.414L7 19m0-6a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    2
                  </span>
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

        {/* Mobile Actions - Cart and Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Cart Button for Mobile (only show when signed in and NOT on seller pages) */}
          {isSignedIn && !isSellerPage && (
            <Link 
              to="/cart" 
              className="relative flex items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293a1 1 0 000 1.414L7 19m0-6a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                2
              </span>
            </Link>
          )}
          
          {/* Seller Sidebar Menu Button (only on seller pages) */}
          {isSellerPage && onSellerMenuToggle && (
            <button
              onClick={onSellerMenuToggle}
              className="flex items-center justify-center w-10 h-10"
            >
              <svg className={`w-6 h-6 text-gray-700 transition-transform ${isSellerMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {/* Regular Mobile Menu Button (only on non-seller pages) */}
          {!isSellerPage && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10"
            >
              <div className="space-y-1">
                <div className={`w-6 h-0.5 bg-gray-900 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-gray-900 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-gray-900 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu (only show on non-seller pages) */}
      {isMenuOpen && !isSellerPage && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mx-4 mt-2 z-40">
          <div className="py-2">
            {!isSignedIn ? (
              // Mobile navigation for non-signed-in users
              <>
                <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wide border-b border-gray-100">
                  Your Trusted University Marketplace
                </div>
                <Link 
                  to="/features" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How it works
                </Link>
                <Link 
                  to="/products" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  to="/client-stories" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Client Stories
                </Link>
                <div className="border-t border-gray-100">
                  <Link 
                    to="/login" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/auth" 
                    className="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </>
            ) : (
              // Mobile navigation for signed-in users
              <>
                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Campor</div>
                    <div className="text-xs text-gray-500">Your Trusted University Marketplace</div>
                  </div>
                </div>
                
                <Link 
                  to="/marketplace" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                
                <Link 
                  to="/marketplace" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Market Place
                </Link>
                
                <Link 
                  to="/chat" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
                
                <Link 
                  to="/profile" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                
                <Link 
                  to="/cart" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cart
                </Link>
                
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
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
      )}

      {/* Mobile Seller Menu (only show on seller pages) */}
      {isSellerPage && (
        <MobileSellerMenu 
          isOpen={isSellerMenuOpen} 
          onClose={() => setIsSellerMenuOpen && setIsSellerMenuOpen(false)} 
        />
      )}
    </nav>
  );
}
