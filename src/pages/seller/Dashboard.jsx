import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSellerCatalogue, getSellerOrders, getSellerProducts } from '../../services/authService';
import { SellerDashboardSkeleton, Pagination } from '../../components/common';

export default function SellerDashboardPage({ toggleMobileMenu }) {
  const { user } = useAuth();
  const [sellerData, setSellerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [catalogueLinkCopied, setCatalogueLinkCopied] = useState(false);
  
  // Pagination states for dashboard sections
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 5
  });
  const [productsPagination, setProductsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 4
  });

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        
        // Wait for user context to be fully loaded
        if (!user) {
          return;
        }
        
        if (!user.seller?.id) {
          setError('Seller information not found. Please complete seller registration.');
          return;
        }
        
        // Always use seller data from user context first (this has the latest updates)
        if (user?.seller) {
          setSellerData(user.seller);
        }
        
        // If we have a seller ID, fetch only products and orders (don't override seller profile)
        const [productsData, ordersData] = await Promise.all([
          getSellerProducts(user.seller.id),
          getSellerOrders(user.seller.id)
        ]);
        
        // Only update products and orders, keep the seller profile from context
        setProducts(productsData || []);
        
        // Handle orders data structure - getSellerOrders returns response.data directly
        const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData?.data || []);
        setOrders(ordersArray);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [user?.seller?.id]); // Only depend on seller ID, not the entire user object

  // Separate effect to update seller data when user context changes
  useEffect(() => {
    if (user?.seller) {
      setSellerData(user.seller);
      // Seller data updated from context
    }
  }, [user?.seller]);

  // Calculate stats from real data
  const totalProducts = products.length;
  const totalOrders = orders.length;
  
  // Debug orders for revenue calculation
  // Calculate revenue from orders
  
  const totalRevenue = orders.reduce((sum, orderSeller) => {
    // Use the same pattern as Orders page - check for amountDue first, then order.totalPrice
    const price = orderSeller.amountDue || orderSeller.order?.totalPrice || 0;
    const parsedPrice = parseFloat(price) || 0;
    // Calculate revenue from order price fields
    return sum + parsedPrice;
  }, 0);
  
  // Calculate unique customers (unique userIds) - use the same pattern as Orders page
  const uniqueCustomers = new Set(orders.map(orderSeller => orderSeller.order?.user?.id || orderSeller.order?.userId)).size;
  
  // Update pagination when data changes
  useEffect(() => {
    const ordersTotalPages = Math.ceil(orders.length / ordersPagination.itemsPerPage);
    setOrdersPagination(prev => ({ ...prev, totalPages: ordersTotalPages }));
    
    const productsTotalPages = Math.ceil(products.length / productsPagination.itemsPerPage);
    setProductsPagination(prev => ({ ...prev, totalPages: productsTotalPages }));
  }, [orders.length, products.length]);

  // Get paginated orders
  const getPaginatedOrders = () => {
    const startIndex = (ordersPagination.currentPage - 1) * ordersPagination.itemsPerPage;
    const endIndex = startIndex + ordersPagination.itemsPerPage;
    return orders.slice(startIndex, endIndex);
  };

  // Get paginated products
  const getPaginatedProducts = () => {
    const startIndex = (productsPagination.currentPage - 1) * productsPagination.itemsPerPage;
    const endIndex = startIndex + productsPagination.itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  // Handle orders pagination
  const handleOrdersPageChange = (page) => {
    setOrdersPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Handle products pagination
  const handleProductsPageChange = (page) => {
    setProductsPagination(prev => ({ ...prev, currentPage: page }));
  };
  
  // Get status color for orders - use same pattern as Orders page
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

  // Handle catalogue link copy
  const handleCopyCatalogueLink = async () => {
    try {
      const catalogueUrl = `${window.location.origin}/seller/${user?.seller?.id}/catalogue`;
      await navigator.clipboard.writeText(catalogueUrl);
      setCatalogueLinkCopied(true);
      setTimeout(() => setCatalogueLinkCopied(false), 2000);
    } catch (err) {
      // Failed to copy catalogue link
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
      
      // Retrying fetch for seller ID
      const [productsData, ordersData] = await Promise.all([
        getSellerProducts(user.seller.id),
        getSellerOrders(user.seller.id)
      ]);
      
      // Only update products and orders, keep the seller profile from context
      setProducts(productsData || []);
      
      // Handle orders data structure - getSellerOrders returns response.data directly
      const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData?.data || []);
      setOrders(ordersArray);
      // Retry successful
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SellerDashboardSkeleton />;
  }

  if (error) {
    return (
      <SellerLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error loading dashboard</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
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
      </SellerLayout>
    );
  }

  return (
    <div className="max-w-full overflow-hidden">
        {/* Descriptive Text */}
        <p className="text-gray-600 mb-6">Welcome back! Here's what's happening with your store today.</p>

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
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                <img 
                  src="/price-icon.svg" 
                  alt="Revenue" 
                  className="w-6 h-6" 
                />
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
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                <img 
                  src="/orders-icon.svg" 
                  alt="Orders" 
                  className="w-6 h-6" 
                />
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
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                <img 
                  src="/products-icon.svg" 
                  alt="Products" 
                  className="w-6 h-6" 
                />
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
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                <img 
                  src="/customers.svg" 
                  alt="Customers" 
                  className="w-6 h-6" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Catalogue Sharing Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-[#2563EB] rounded-xl p-6 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Catalogue</h3>
              <p className="text-gray-600">
                Let customers view your products and make purchases. Share this link on social media, WhatsApp, or anywhere online.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200 flex-1">
                <code className="text-sm text-gray-700 flex-1 break-all">
                  {window.location.origin}/seller/{user?.seller?.id}/catalogue
                </code>
              </div>
              
              <div className="flex gap-2">
                <Link
                  to={`/seller/${user?.seller?.id}/catalogue`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview
                </Link>
                
                <button
                  onClick={handleCopyCatalogueLink}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
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
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Orders</h3>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {getPaginatedOrders().map((orderSeller) => (
                  <div key={orderSeller.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{orderSeller.order?.orderCode || orderSeller.orderId}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {orderSeller.order?.user?.name || 'Customer'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">₦{parseFloat(orderSeller.amountDue || orderSeller.order?.totalPrice || 0).toLocaleString()}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(orderSeller.status || orderSeller.order?.orderStatus)}`}>
                            {(orderSeller.status || orderSeller.order?.orderStatus)?.toLowerCase() || 'pending'}
                          </span>
                        </div>
                      </div>
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
            
            {/* Orders Pagination */}
            {orders.length > ordersPagination.itemsPerPage && (
              <Pagination
                currentPage={ordersPagination.currentPage}
                totalPages={ordersPagination.totalPages}
                onPageChange={handleOrdersPageChange}
                className="mt-4"
              />
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
                {getPaginatedProducts().map((product) => (
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
            
            {/* Products Pagination */}
            {products.length > productsPagination.itemsPerPage && (
              <Pagination
                currentPage={productsPagination.currentPage}
                totalPages={productsPagination.totalPages}
                onPageChange={handleProductsPageChange}
                className="mt-4"
              />
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
  );
}
