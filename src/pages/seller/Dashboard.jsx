import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { getSellerCatalogue, getSellerOrders } from '../../services/authService';
import { SellerDashboardSkeleton } from '../../components/common';

export default function SellerDashboardPage({ toggleMobileMenu }) {
  const { user } = useAuth();
  const [sellerData, setSellerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [catalogueLinkCopied, setCatalogueLinkCopied] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        
        // Always use seller data from user context first (this has the latest updates)
        if (user?.seller) {
          setSellerData(user.seller);
          console.log('✅ Dashboard: Using seller data from context:', user.seller);
          console.log('✅ Dashboard: Seller name:', user.seller.catalogueName);
          console.log('✅ Dashboard: Seller description:', user.seller.storeDescription);
        }
        
        // If we have a seller ID, fetch only products and orders (don't override seller profile)
        if (user?.seller?.id) {
          const [catalogueData, ordersData] = await Promise.all([
            getSellerCatalogue(user.seller.id),
            getSellerOrders(user.seller.id)
          ]);
          
          // Only update products and orders, keep the seller profile from context
          setProducts(catalogueData.products || []);
          setOrders(ordersData.data || []);
          console.log('✅ Dashboard: Fetched products:', catalogueData.products?.length || 0);
          console.log('✅ Dashboard: Fetched orders:', ordersData.data?.length || 0);
        }
        
      } catch (err) {
        console.error('❌ Dashboard: Failed to fetch seller data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [user]);

  // Separate effect to update seller data when user context changes
  useEffect(() => {
    if (user?.seller) {
      setSellerData(user.seller);
      console.log('🔄 Dashboard: Seller data updated from context:', user.seller.catalogueName);
    }
  }, [user?.seller]);

  // Calculate stats from real data
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + parseFloat(order.totalPrice || 0);
  }, 0);
  
  // Calculate unique customers (unique userIds)
  const uniqueCustomers = new Set(orders.map(order => order.userId)).size;
  
  // Get recent orders (last 5)
  const recentOrders = orders.slice(0, 5);
  
  // Get status color for orders
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle catalogue link copy
  const handleCopyCatalogueLink = async () => {
    try {
      const catalogueUrl = `${window.location.origin}/seller/${user?.seller?.id}/catalogue`;
      await navigator.clipboard.writeText(catalogueUrl);
      setCatalogueLinkCopied(true);
      setTimeout(() => setCatalogueLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy catalogue link:', err);
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <SellerDashboardSkeleton />
      </SellerLayout>
    );
  }

  if (error) {
    return (
      <SellerLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error loading dashboard</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-full overflow-hidden">
        {/* Descriptive Text */}
        <p className="text-gray-600 mb-6">Welcome back! Here's what's happening with your store today.</p>

        {/* Catalogue Sharing Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Catalogue</h3>
              <p className="text-gray-600 mb-3">
                Let customers view your products and make purchases. Share this link on social media, WhatsApp, or anywhere online.
              </p>
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
                <code className="text-sm text-gray-700 flex-1 break-all">
                  {window.location.origin}/seller/{user?.seller?.id}/catalogue
                </code>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link
                to={`/seller/${user?.seller?.id}/catalogue`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Link>
              
              <button
                onClick={handleCopyCatalogueLink}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {catalogueLinkCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 font-medium">From {totalOrders} orders</p>
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
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-sm text-gray-500 font-medium">All time orders</p>
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
                <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                <p className="text-sm text-gray-500 font-medium">In your catalogue</p>
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
                <p className="text-3xl font-bold text-gray-900">{uniqueCustomers}</p>
                <p className="text-sm text-gray-500 font-medium">Unique customers</p>
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
            {recentOrders.length > 0 ? (
            <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">
                        User: {order.userId} • {order.hostelName} - Block {order.blockNumber}, Room {order.roomNo}
                      </p>
                </div>
                <div className="text-right">
                      <p className="font-semibold text-gray-900">₦{parseFloat(order.totalPrice).toLocaleString()}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                  </span>
                </div>
              </div>
                ))}
                </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-500 mb-4">No orders yet</p>
                <p className="text-sm text-gray-400">Your customer orders will appear here</p>
                </div>
            )}
            <div className="mt-6">
              <Link 
                to="/seller/orders"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors text-center block"
              >
                View All Orders
              </Link>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Products</h3>
            {products.length > 0 ? (
            <div className="space-y-4">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 overflow-hidden">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <img 
                            src={product.imageUrls[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                  </div>
                        )}
              </div>
                  <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.stockQuantity} in stock</p>
                  </div>
                </div>
                    <p className="font-semibold text-gray-900">₦{parseFloat(product.price).toLocaleString()}</p>
              </div>
                ))}
                  </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500 mb-4">No products yet</p>
                <p className="text-sm text-gray-400">Start by adding your first product</p>
                </div>
            )}
            <div className="mt-6">
              <Link 
                to="/seller/products/add"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors text-center block"
              >
                {products.length > 0 ? 'Add New Product' : 'Add Your First Product'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
