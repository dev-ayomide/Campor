import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChatIcon, ProfileIcon } from '../common';

export default function SellerSidebar({ onMobileClose, isMobile = false }) {
  const location = useLocation();
  const { logout } = useAuth();
  
  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      ),
      label: 'Back to Marketplace',
      path: '/marketplace',
      active: false,
      isSpecial: true
    },
    {
      icon: (
        <img 
          src="/dashboard-icon.svg" 
          alt="Dashboard" 
          className={`w-5 h-5 ${location.pathname === '/seller/dashboard' ? 'brightness-0 invert' : ''}`} 
        />
      ),
      label: 'Dashboard',
      path: '/seller/dashboard',
      active: location.pathname === '/seller/dashboard'
    },
    {
      icon: (
        <img 
          src="/products-icon.svg" 
          alt="Products" 
          className={`w-5 h-5 ${location.pathname.startsWith('/seller/products') ? 'brightness-0 invert' : ''}`} 
        />
      ),
      label: 'Products',
      path: '/seller/products',
      active: location.pathname.startsWith('/seller/products')
    },
    {
      icon: (
        <img 
          src="/orders-icon.svg" 
          alt="Orders" 
          className={`w-5 h-5 ${location.pathname === '/seller/orders' ? 'brightness-0 invert' : ''}`} 
        />
      ),
      label: 'Orders',
      path: '/seller/orders',
      active: location.pathname === '/seller/orders'
    },
    {
      icon: (
        <img 
          src="/customers.svg" 
          alt="Customers" 
          className={`w-5 h-5 ${location.pathname === '/seller/customers' ? 'brightness-0 invert' : ''}`} 
        />
      ),
      label: 'Customers',
      path: '/seller/customers',
      active: location.pathname === '/seller/customers'
    },
    {
      icon: (
        <img 
          src="/analytics-icon.svg" 
          alt="Analytics" 
          className={`w-5 h-5 ${location.pathname === '/seller/analytics' ? 'brightness-0 invert' : ''}`} 
        />
      ),
      label: 'Analytics',
      path: '/seller/analytics',
      active: location.pathname === '/seller/analytics'
    },
    {
      icon: (
        <img 
          src="/settings.svg" 
          alt="Settings" 
          className={`w-5 h-5 ${location.pathname === '/seller/settings' ? 'brightness-0 invert' : ''}`} 
        />
      ),
      label: 'Settings',
      path: '/seller/settings',
      active: location.pathname === '/seller/settings'
    }
  ];

  // Additional mobile menu items (Chat, Me)
  const mobileExtraItems = [
    {
      icon: <ChatIcon className="w-5 h-5" />,
      label: 'Chat',
      path: '/chat',
      active: location.pathname === '/chat'
    },
    {
      icon: <ProfileIcon className="w-5 h-5" />,
      label: 'Me',
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  const handleLogout = () => {
    logout();
    if (onMobileClose) onMobileClose();
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-transparent border-r border-gray-200 shadow-lg flex flex-col overflow-hidden z-40">
      {/* Navigation */}
      <nav className="flex-1 pt-20 px-4 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onMobileClose} // Close mobile menu when item is clicked
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  item.isSpecial
                    ? 'text-blue-600 hover:bg-blue-50 border border-blue-200'
                    : item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-800 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
          
          {/* Mobile-only extra items (Chat, Me) */}
          {isMobile && (
            <>
              <li className="border-t border-gray-200 pt-2 mt-4">
                <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
                  General
                </div>
              </li>
              {mobileExtraItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onMobileClose}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3 font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-transparent">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="ml-3 font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
