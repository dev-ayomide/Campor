import { Link } from 'react-router-dom';

export default function SellerNavbar() {
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo - clicking returns to marketplace */}
        <div className="flex items-center">
          <Link to="/marketplace" className="flex items-center">
            <img 
              src="/logo.svg" 
              alt="Campor Logo" 
              className="w-6 h-6 mr-3 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Campor</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-6">
          {/* Back to Marketplace */}
          <Link to="/marketplace" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Marketplace</span>
          </Link>

          {/* Chat with Buyers */}
          <Link to="/seller/chat" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Buyers</span>
          </Link>

          {/* Seller Profile */}
          <Link to="/seller/profile" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Profile</span>
          </Link>

          {/* Orders with notification */}
          <Link to="/seller/orders" className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {/* Notification badge for new orders */}
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                2
              </span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
