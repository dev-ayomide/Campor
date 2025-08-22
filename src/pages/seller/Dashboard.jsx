import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';

export default function SellerDashboardPage({ toggleMobileMenu }) {
  return (
    <SellerLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-700">Home</Link>
              <span className="mx-2">›</span>
              <Link to="/seller" className="hover:text-gray-700">Sell</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900">Dashboard</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₦2,450,000</p>
                <p className="text-sm text-green-600 font-medium">+12.5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">1,234</p>
                <p className="text-sm text-green-600 font-medium">+8.2% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Products</p>
                <p className="text-3xl font-bold text-gray-900">89</p>
                <p className="text-sm text-green-600 font-medium">+5 from last month</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="text-3xl font-bold text-gray-900">456</p>
                <p className="text-sm text-green-600 font-medium">+23% from last month</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Orders</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">ORD-001</p>
                  <p className="text-sm text-gray-500">John Doe</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦45,000</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    completed
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">ORD-002</p>
                  <p className="text-sm text-gray-500">John Doe</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦32,500</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    pending
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-gray-900">ORD-003</p>
                  <p className="text-sm text-gray-500">John Doe</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦78,900</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    completed
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                View All Orders
              </button>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Floating Speaker</p>
                    <p className="text-sm text-gray-500">145 sales</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">₦725,000</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Smart Watch</p>
                    <p className="text-sm text-gray-500">132 sales</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">₦650,000</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Wireless Headphones</p>
                    <p className="text-sm text-gray-500">98 sales</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">₊580,000</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Phone Case</p>
                    <p className="text-sm text-gray-500">87 sales</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">₦435,000</p>
              </div>
            </div>
            <div className="mt-6">
              <Link 
                to="/seller/products/add"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors text-center block"
              >
                Add New Product
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
