import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { getSellerOrders } from '../../services/ordersService';
import { OrderItemSkeleton, Breadcrumb, MobileSearchFilter, ExportOptionsModal, Pagination } from '../../components/common';
import { chatApiService } from '../../services/chatApiService';
import * as XLSX from 'xlsx';
const productImage = '/product.png';

export default function SellerOrdersPage() {
  const { user } = useAuth();
  // Note: Chat context is not available in this component, so we'll handle chat navigation differently
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [exportModal, setExportModal] = useState({ isOpen: false });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        
        // Wait for user context to be fully loaded
        if (!user) {
          console.log('Orders: User not loaded yet');
          return;
        }
        
        console.log('Orders: User loaded:', user);
        console.log('Orders: Seller info:', user.seller);
        
        if (!user.seller?.id) {
          console.log('Orders: No seller ID found');
          setError('Seller information not found. Please complete seller registration.');
          return;
        }
        
        console.log('Orders: Fetching orders for seller ID:', user.seller.id);
        const ordersData = await getSellerOrders(user.seller.id);
        console.log('Orders: Received orders data:', ordersData);
        
        // Handle new data structure - API returns array of OrderSeller objects
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else {
          setOrders([]);
        }
        
      } catch (err) {
        console.error('Orders: Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.seller?.id]); // Only depend on seller ID, not the entire user object

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
    
    // Update pagination when filtered orders change
    const totalPages = Math.ceil(filtered.length / pagination.itemsPerPage);
    setPagination(prev => ({ 
      ...prev, 
      totalPages,
      currentPage: 1 // Reset to first page when filters change
    }));
  }, [orders, searchTerm, statusFilter, pagination.itemsPerPage]);

  // Get paginated orders
  const getPaginatedOrders = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleMessageCustomer = async (orderSeller) => {
    try {
      if (orderSeller.order) {
        
        if (orderSeller.order.user) {
        }
      }
      
      
      // Try multiple possible locations for customer information
      // Based on the actual data structure, we need to get userId from the order
      const customerUserId = orderSeller.order?.userId || 
                            orderSeller.order?.user?.id || 
                            orderSeller.userId ||
                            orderSeller.customerId;
                            
      const customerName = orderSeller.order?.user?.name || 
                          orderSeller.order?.customerName ||
                          orderSeller.customerName ||
                          'Customer';

      // Check if seller is trying to message themselves
      if (customerUserId === user?.id) {
        alert('You cannot message yourself. This order was placed by you.');
        return;
      }
      
      if (!customerUserId) {
        // Show a more helpful error message
        alert(`Unable to find customer information for this order.\n\nBACKEND ISSUE: The order data is missing the customer's userId field.\n\nCurrent data structure:\n- Customer name: ${customerName}\n- Missing: userId field\n\nPlease ask the backend team to include userId in the order.user object.\n\nCheck console for complete data structure.`);
        return;
      }

      // Since chat context is not available in this component,
      // we'll navigate directly to the chat page with the customer ID
      // The chat page will handle setting up the conversation
      window.location.href = `/chat?customerId=${customerUserId}&customerName=${encodeURIComponent(customerName)}`;
      
    } catch (err) {
      alert('Unable to start chat with customer. Please try again.');
    }
  };


  // Retry function for failed requests
  const retryFetch = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      if (!user?.seller?.id) {
        setError('Seller information not found. Please complete seller registration.');
        return;
      }
      
      const ordersData = await getSellerOrders(user.seller.id);
      
      // Handle new data structure - API returns array of OrderSeller objects
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED':
      case 'SUCCESS':
      case 'RELEASED':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SHIPPED':
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Export functions
  const exportToCSV = (data, fields, filename) => {
    const headers = fields.map(field => {
      switch (field) {
        case 'orderCode': return 'Order Code';
        case 'customer': return 'Customer Name';
        case 'date': return 'Order Date';
        case 'status': return 'Status';
        case 'amount': return 'Amount';
        case 'items': return 'Items Count';
        case 'paymentMethod': return 'Payment Method';
        case 'shippingAddress': return 'Shipping Address';
        default: return field;
      }
    });

    const csvContent = [
      headers.join(','),
      ...data.map(order => {
        return fields.map(field => {
          let value = '';
          switch (field) {
            case 'orderCode':
              value = order.order?.orderCode || order.orderId || '';
              break;
            case 'customer':
              value = order.order?.user?.name || 'Customer';
              break;
            case 'date':
              value = new Date(order.order?.createdAt || order.createdAt).toLocaleDateString();
              break;
            case 'status':
              value = order.status || order.order?.orderStatus || '';
              break;
            case 'amount':
              value = parseFloat(order.amountDue || order.order?.totalPrice || 0);
              break;
            case 'items':
              value = order.order?.orderItems?.length || 0;
              break;
            case 'paymentMethod':
              value = order.order?.paymentMethod || 'N/A';
              break;
            case 'shippingAddress':
              value = order.order?.shippingAddress || 'N/A';
              break;
            default:
              value = '';
          }
          // Escape commas and quotes in CSV
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data, fields, filename) => {
    const worksheetData = data.map(order => {
      const row = {};
      fields.forEach(field => {
        switch (field) {
          case 'orderCode':
            row['Order Code'] = order.order?.orderCode || order.orderId || '';
            break;
          case 'customer':
            row['Customer Name'] = order.order?.user?.name || 'Customer';
            break;
          case 'date':
            row['Order Date'] = new Date(order.order?.createdAt || order.createdAt).toLocaleDateString();
            break;
          case 'status':
            row['Status'] = order.status || order.order?.orderStatus || '';
            break;
          case 'amount':
            row['Amount'] = parseFloat(order.amountDue || order.order?.totalPrice || 0);
            break;
          case 'items':
            row['Items Count'] = order.order?.orderItems?.length || 0;
            break;
          case 'paymentMethod':
            row['Payment Method'] = order.order?.paymentMethod || 'N/A';
            break;
          case 'shippingAddress':
            row['Shipping Address'] = order.order?.shippingAddress || 'N/A';
            break;
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, filename);
  };

  const handleExport = async (exportOptions) => {
    try {
      setExportLoading(true);
      setExportSuccess('');

      const { format, data, fields, dateRange } = exportOptions;
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `orders_${dateRange}_${timestamp}.${format === 'excel' ? 'xlsx' : 'csv'}`;

      if (format === 'csv') {
        exportToCSV(data, fields, filename);
      } else {
        exportToExcel(data, fields, filename);
      }

      setExportSuccess(`Orders exported successfully as ${filename}`);
      
      // Auto-dismiss success message
      setTimeout(() => {
        setExportSuccess('');
      }, 5000);

    } catch (error) {
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Auto-dismiss success message
  useEffect(() => {
    if (exportSuccess) {
      const timer = setTimeout(() => {
        setExportSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [exportSuccess]);

  return (
    <SellerLayout>
      <div className="max-w-full overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/seller/dashboard' },
            { label: 'Orders' }
          ]} 
        />


        {/* Descriptive Text */}
        <p className="text-gray-600 mb-4">Track and manage customer orders.</p>
        
        {/* Mobile Search and Filter */}
        <MobileSearchFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'PROCESSING', label: 'Processing' },
            { value: 'SHIPPED', label: 'Shipped' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'FAILED', label: 'Failed' },
            { value: 'REFUNDED', label: 'Refunded' }
          ]}
          onRefresh={() => window.location.reload()}
          onExport={() => setExportModal({ isOpen: true })}
          searchPlaceholder="Search by order code, customer name..."
          loading={loading}
          className="mb-6"
        />

        {/* Desktop Search and Filter */}
        <div className="hidden lg:block mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by order code, customer name, or settlement code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Filter and Actions */}
            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              
              {/* Export Button */}
              <button 
                onClick={() => setExportModal({ isOpen: true })}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error loading orders</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                
                {error.includes('Seller information not found') && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Need to complete seller setup?</p>
                    <p className="text-sm text-blue-700 mt-1">Complete your seller onboarding to start receiving orders.</p>
                    <Link 
                      to="/seller/onboarding"
                      className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Complete Seller Setup
                    </Link>
                  </div>
                )}
                
                <button 
                  onClick={retryFetch}
                  disabled={loading}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Retrying...' : 'Try Again'}
                </button>
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
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
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
                        {getPaginatedOrders().map((orderSeller) => (
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
                                      <img src={item.productImages?.[0] || productImage} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">{item.productName}</div>
                                        <div className="text-xs text-gray-500">Qty: {item.quantity} × ₦{Number(item.priceAtPurchase || 0).toLocaleString()}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(orderSeller.status || orderSeller.order?.orderStatus)}`}>
                                {orderSeller.status || orderSeller.order?.orderStatus}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-900">₦{parseFloat(orderSeller.amountDue || orderSeller.order?.totalPrice || 0).toLocaleString()}</td>
                            <td className="py-4 px-6 text-gray-900">
                              {new Date(orderSeller.order?.createdAt || orderSeller.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const customerUserId = orderSeller.order?.userId || orderSeller.order?.user?.id;
                                  const isOwnOrder = customerUserId === user?.id;
                                  
                                  if (isOwnOrder) {
                                    return (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                          Your Order
                                        </span>
                                        <button 
                                          disabled
                                          className="p-2 text-gray-300 cursor-not-allowed" 
                                          title="Cannot message yourself"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                          </svg>
                                        </button>
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <button 
                                      onClick={() => handleMessageCustomer(orderSeller)}
                                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                      title="Message Customer"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                    </button>
                                  );
                                })()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {getPaginatedOrders().map((orderSeller) => (
                      <div key={orderSeller.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{orderSeller.order?.orderCode || orderSeller.orderId}</h3>
                            {orderSeller.order?.settlementCode && (
                              <p className="text-xs text-gray-500">Settlement: {orderSeller.order.settlementCode}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(orderSeller.status || orderSeller.order?.orderStatus)}`}>
                            {orderSeller.status || orderSeller.order?.orderStatus}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <div className="font-medium text-gray-900">{orderSeller.order?.user?.name || 'Customer'}</div>
                          <div>{new Date(orderSeller.order?.createdAt || orderSeller.createdAt).toLocaleDateString()}</div>
                        </div>
                        
                        <div className="font-medium text-gray-900 mb-3">
                          Amount Due: ₦{parseFloat(orderSeller.amountDue || orderSeller.order?.totalPrice || 0).toLocaleString()}
                        </div>
                        
                        {Array.isArray(orderSeller.order?.orderItems) && orderSeller.order.orderItems.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <h4 className="text-sm font-medium text-gray-700">Items:</h4>
                            {orderSeller.order.orderItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 text-sm text-gray-700">
                                <img src={item.productImages?.[0] || productImage} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{item.productName}</div>
                                  <div className="text-xs text-gray-500">Qty: {item.quantity} × ₦{Number(item.priceAtPurchase || 0).toLocaleString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            {(() => {
                              const customerUserId = orderSeller.order?.userId || orderSeller.order?.user?.id;
                              const isOwnOrder = customerUserId === user?.id;
                              
                              if (isOwnOrder) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      Your Order
                                    </span>
                                    <button 
                                      disabled
                                      className="p-2 text-gray-300 cursor-not-allowed" 
                                      title="Cannot message yourself"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                    </button>
                                  </div>
                                );
                              }
                              
                              return (
                                <button 
                                  onClick={() => handleMessageCustomer(orderSeller)}
                                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  Message Customer
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
              {filteredOrders.length > pagination.itemsPerPage && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              )}
            </div>
          </div>
        )}

        {/* Export Options Modal */}
        <ExportOptionsModal
          isOpen={exportModal.isOpen}
          onClose={() => setExportModal({ isOpen: false })}
          onExport={handleExport}
          data={filteredOrders}
          title="Export Orders"
        />

        {/* Export Success Message */}
        {exportSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{exportSuccess}</span>
            <button
              onClick={() => setExportSuccess('')}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Export Loading Overlay */}
        {exportLoading && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-25 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-gray-700">Exporting orders...</span>
            </div>
          </div>
        )}

      </div>
    </SellerLayout>
  );
}
