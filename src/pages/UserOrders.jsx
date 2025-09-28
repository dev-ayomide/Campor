import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/ordersService';
import { OrderItemSkeleton } from '../components/common';
import { Eye } from 'lucide-react';
import productImage from '../assets/images/product.png';

export default function UserOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isSignedIn = !!user;

  const handleViewOrderDetails = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED':
      case 'SUCCESS':
      case 'RELEASED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SHIPPED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await getUserOrders();
        setOrders(ordersData || []);
        console.log('✅ User Orders: Fetched orders:', ordersData);
      } catch (err) {
        console.error('❌ User Orders: Failed to fetch orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b pt-20" style={{ backgroundColor: '#F7F5F0' }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link to={isSignedIn ? "/marketplace" : "/"} className="hover:text-gray-900 transition-colors">Home</Link>
                <span>›</span>
                <span className="text-gray-900">Orders</span>
              </div>
              <div className="text-sm text-gray-600">
                {orders.length} Orders
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <>
            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                <div className="mb-8">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Desktop Table Skeleton */}
                <div className="hidden md:block">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Card Skeleton */}
                <div className="md:hidden space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-3"></div>
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty Orders State */}
            {!loading && !error && orders.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You haven't placed any orders yet</h2>
                <p className="text-gray-600 mb-8">Start shopping to see your orders here.</p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            )}

            {/* Orders Content */}
            {!loading && !error && orders.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 text-sm font-medium text-gray-600">Order Code</th>
                        <th className="text-left py-4 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left py-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-4 text-sm font-medium text-gray-600">Total</th>
                        <th className="text-center py-4 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 align-top">
                          <td className="py-6">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{order.orderCode || order.id}</span>
                              {order.settlementCode && (
                                <span className="text-xs text-gray-500">Settlement: {order.settlementCode}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-6 text-gray-600">{new Date(order.createdAt).toLocaleString()}</td>
                          <td className="py-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-6">
                            <span className="font-medium text-gray-900">₦{Number(order.totalPrice || 0).toLocaleString()}</span>
                            {Array.isArray(order.orderItems) && order.orderItems.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {order.orderItems.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 text-sm text-gray-700">
                                    <img src={item.product?.imageUrls?.[0] || productImage} alt={item.product?.name} className="w-10 h-10 object-cover rounded" />
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{item.product?.name}</div>
                                      <div className="text-xs text-gray-500">Qty: {item.quantity} × ₦{Number(item.price || 0).toLocaleString()}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-6 text-center">
                            <button
                              onClick={() => handleViewOrderDetails(order)}
                              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View order details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{order.orderCode || order.id}</h3>
                          {order.settlementCode && (
                            <p className="text-xs text-gray-500">Settlement: {order.settlementCode}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                      
                      <div className="font-medium text-gray-900 mb-3">
                        Total: ₦{Number(order.totalPrice || 0).toLocaleString()}
                      </div>
                      
                      {Array.isArray(order.orderItems) && order.orderItems.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Items:</h4>
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm text-gray-700">
                              <img src={item.product?.imageUrls?.[0] || productImage} alt={item.product?.name} className="w-10 h-10 object-cover rounded" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.product?.name}</div>
                                <div className="text-xs text-gray-500">Qty: {item.quantity} × ₦{Number(item.price || 0).toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* View Details Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Full Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    </MainLayout>
  );
}
