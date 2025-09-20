import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { getSellerOrders, updateOrderStatus, getOrderDetails } from '../../services/ordersService';
import { OrderItemSkeleton } from '../../components/common';
import productImage from '../../assets/images/product.png';

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        if (user?.seller?.id) {
          const ordersData = await getSellerOrders(user.seller.id);
          console.log('✅ Orders: Raw API response:', ordersData);
          
          // Handle new data structure - API returns array of OrderSeller objects
          if (Array.isArray(ordersData)) {
            setOrders(ordersData);
            console.log('✅ Orders: Processed seller orders:', ordersData.length);
          } else {
            console.log('⚠️ Orders: Unexpected data structure:', ordersData);
            setOrders([]);
          }
        }
        
      } catch (err) {
        console.error('❌ Orders: Failed to fetch orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Filter orders based on search term and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(orderSeller =>
        orderSeller.order?.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderSeller.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderSeller.order?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderSeller.order?.settlementCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(orderSeller =>
        orderSeller.status?.toLowerCase() === statusFilter.toLowerCase() ||
        orderSeller.order?.orderStatus?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(orderSeller => 
        orderSeller.orderId === orderId 
          ? { 
              ...orderSeller, 
              status: newStatus,
              order: { ...orderSeller.order, orderStatus: newStatus }
            } 
          : orderSeller
      ));
      console.log('✅ Order status updated successfully');
    } catch (err) {
      console.error('❌ Failed to update order status:', err);
      setError(err.message);
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const orderDetails = await getOrderDetails(orderId);
      console.log('✅ Order details fetched:', orderDetails);
      // You can implement a modal or navigate to a details page here
      alert(`Order Details:\n\nOrder ID: ${orderDetails.id}\nStatus: ${orderDetails.orderStatus}\nTotal: ₦${parseFloat(orderDetails.totalPrice).toLocaleString()}\nItems: ${orderDetails.items?.length || 0}`);
    } catch (err) {
      console.error('❌ Failed to fetch order details:', err);
      setError(err.message);
    }
  };

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

  return (
    <SellerLayout>
      <div className="max-w-full overflow-hidden">


        {/* Descriptive Text */}
        <p className="text-gray-600 mb-4">Track and manage customer orders.</p>
        
        {/* Mobile Design - Search, Filter, Export */}
        <div className="flex items-center space-x-3 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by order code, customer name, or settlement code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          
          {/* Export Button */}
          <button className="w-12 h-12 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <OrderItemSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Error loading orders</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">All Orders</h3>
          
              {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Order Code</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Items</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Amount Due</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map((orderSeller) => (
                  <tr key={orderSeller.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{orderSeller.order?.orderCode || orderSeller.orderId}</span>
                    </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="text-gray-900 font-medium">{orderSeller.order?.user?.name || 'Customer'}</div>
                              <div className="text-sm text-gray-500">
                                {orderSeller.order?.settlementCode && (
                                  <span>Settlement: {orderSeller.order.settlementCode}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-900">
                            {Array.isArray(orderSeller.order?.orderItems) && orderSeller.order.orderItems.length > 0 && (
                              <div className="space-y-2">
                                {orderSeller.order.orderItems.map((item) => (
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
                    <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(orderSeller.status || orderSeller.order?.orderStatus)}`}>
                              {orderSeller.status || orderSeller.order?.orderStatus}
                      </span>
                    </td>
                          <td className="py-4 px-6 text-gray-900">₦{parseFloat(orderSeller.amountDue || orderSeller.order?.totalPrice || 0).toLocaleString()}</td>
                          <td className="py-4 px-6 text-gray-900">
                            {new Date(orderSeller.order?.createdAt || orderSeller.createdAt).toLocaleDateString()}
                          </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                              {(orderSeller.status || orderSeller.order?.orderStatus) === 'PENDING' && (
                                <button 
                                  onClick={() => handleStatusUpdate(orderSeller.orderId, 'CONFIRMED')}
                                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                  title="Confirm Order"
                                >
                                  Confirm
                                </button>
                              )}
                              {(orderSeller.status || orderSeller.order?.orderStatus) === 'CONFIRMED' && (
                                <button 
                                  onClick={() => handleStatusUpdate(orderSeller.orderId, 'PROCESSING')}
                                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                                  title="Mark as Processing"
                                >
                                  Process
                                </button>
                              )}
                        <button 
                          onClick={() => handleViewOrderDetails(orderSeller.orderId)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                          title="View Order Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Your customer orders will appear here when you start making sales'
                    }
                  </p>
        </div>
              )}

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8">
          <nav className="flex items-center space-x-1">
            <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">1</button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">2</button>
            <span className="px-3 py-2 text-sm text-gray-500">...</span>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">9</button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">10</button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
            </div>
          </div>
        )}

      </div>
    </SellerLayout>
  );
}
