import { Link } from 'react-router-dom';

export default function SellerNavbar() {
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
            {/* Logo placeholder */}
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-bold text-gray-900">Campor</span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-6">
          {/* Chat */}
          <Link to="/seller/chat" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Chat</span>
          </Link>

          {/* Me */}
          <Link to="/seller/profile" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Me</span>
          </Link>

          {/* Cart with notification */}
          <Link to="/seller/orders" className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors">
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              {/* Notification badge */}
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
