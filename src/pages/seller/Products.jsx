import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { getSellerProducts, deleteProduct, updateProductStatus, publishProduct, unpublishProduct } from '../../services/authService';
import { SellerDashboardSkeleton, Breadcrumb, MobileSearchFilter, ConfirmationModal, Pagination } from '../../components/common';

export default function SellerProductsPage({ toggleMobileMenu }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 12
  });
  
  // Modal and notification states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Yes',
    confirmButtonColor: 'red'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const fetchProducts = async () => {
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
        
        const response = await getSellerProducts(user.seller.id);
        
        // Handle both array response and paginated response
        if (Array.isArray(response)) {
          setProducts(response);
        } else if (response?.products) {
          setProducts(response.products);
          // Update pagination with API data if available
          if (response.pagination) {
            setPagination(prev => ({
              ...prev,
              totalPages: response.pagination.totalPages,
              totalItems: response.pagination.totalItems,
              itemsPerPage: response.pagination.itemsPerPage
            }));
          }
        } else {
          setProducts([]);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user?.seller?.id]); // Only depend on seller ID, not the entire user object

  // Filter products based on search term and status
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => {
        const status = getProductStatus(product);
        return status === statusFilter;
      });
    }

    setFilteredProducts(filtered);
    
    // Only update pagination if we don't have API pagination data
    // If we have API pagination, use it as-is
    if (!pagination.totalItems || pagination.totalItems === 0) {
      const totalPages = Math.ceil(filtered.length / pagination.itemsPerPage);
      setPagination(prev => ({ 
        ...prev, 
        totalPages,
        currentPage: 1 // Reset to first page when filters change
      }));
    }
  }, [products, searchTerm, statusFilter, pagination.itemsPerPage]);

  // Get paginated products
  const getPaginatedProducts = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product?.name || 'this product'}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteProduct(productId),
      confirmText: 'Delete',
      confirmButtonColor: 'red'
    });
  };

  const confirmDeleteProduct = async (productId) => {
    try {
      setActionLoading(true);
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSuccessMessage('Product deleted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getProductStatus = (product) => {
    // Use the status field from the API, with fallback logic
    if (product.status) {
      return product.status;
    }
    // Fallback logic for products without status field
    if (product.stockQuantity === 0) return 'OUT_OF_STOCK';
    return 'DRAFT';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'OUT_OF_STOCK':
        return 'Out of Stock';
      case 'DRAFT':
        return 'Draft';
      default:
        return status;
    }
  };

  const getSalesCount = (product) => {
    // Use the soldQuantity from the API
    return product.soldQuantity || 0;
  };

  const isLowStock = (product) => {
    return product.stockQuantity <= 5 && product.stockQuantity > 0;
  };

  const isOutOfStock = (product) => {
    return product.stockQuantity === 0;
  };

  const handleStatusUpdate = async (productId, newStatus) => {
    try {
      setActionLoading(true);
      await updateProductStatus(productId, newStatus);
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, status: newStatus } : product
      ));
      setSuccessMessage('Product status updated successfully');

    } catch (err) {

      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    setConfirmationModal({
      isOpen: true,
      title: 'Publish Product',
      message: `Are you sure you want to publish "${product?.name || 'this product'}"? It will be visible to customers.`,
      onConfirm: () => confirmPublishProduct(productId),
      confirmText: 'Publish',
      confirmButtonColor: 'green'
    });
  };

  const confirmPublishProduct = async (productId) => {
    try {
      setActionLoading(true);
      await publishProduct(productId);
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, status: 'ACTIVE' } : product
      ));
      setSuccessMessage('Product published successfully');

    } catch (err) {

      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublishProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    setConfirmationModal({
      isOpen: true,
      title: 'Unpublish Product',
      message: `Are you sure you want to unpublish "${product?.name || 'this product'}"? It will no longer be visible to customers.`,
      onConfirm: () => confirmUnpublishProduct(productId),
      confirmText: 'Unpublish',
      confirmButtonColor: 'gray'
    });
  };

  const confirmUnpublishProduct = async (productId) => {
    try {
      setActionLoading(true);
      await unpublishProduct(productId);
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, status: 'DRAFT' } : product
      ));
      setSuccessMessage('Product unpublished successfully');

    } catch (err) {

      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Refresh inventory data
  const refreshInventory = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      if (!user?.seller?.id) {
        setError('Seller information not found. Please complete seller registration.');
        return;
      }
      
      const productsData = await getSellerProducts(user.seller.id);
      setProducts(productsData || []);

    } catch (err) {

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Retry function for failed requests
  const retryFetch = () => {
    refreshInventory();
  };

  return (
    <SellerLayout>
      <div className="max-w-full overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/seller/dashboard' },
            { label: 'Products' }
          ]} 
        />
        <p className="text-gray-600 mb-4">Manage your product inventory and listings.</p>
        
        {/* Mobile Search and Filter */}
        <MobileSearchFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={[
            { value: 'DRAFT', label: 'Draft' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'OUT_OF_STOCK', label: 'Out of Stock' }
          ]}
          onRefresh={refreshInventory}
          addLink="/seller/products/add"
          addLabel="Add Product"
          searchPlaceholder="Search products..."
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
                  placeholder="Search products..."
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
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
              
              {/* Refresh Button */}
              <button 
                onClick={refreshInventory}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Refresh inventory"
              >
                <svg className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              
              {/* Add Product Button */}
              <Link 
                to="/seller/products/add"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && <SellerDashboardSkeleton />}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mx-2 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error loading products</p>
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
        )}

        {/* Products Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
          </div>
          
              {filteredProducts.length > 0 ? (
                <>
                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Sales</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
                        <tbody>
                          {getPaginatedProducts().map((product) => {
                            const status = getProductStatus(product);
                            const sales = getSalesCount(product);
                            return (
                              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-4 px-4">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex-shrink-0">
                                      {product.imageUrls && product.imageUrls.length > 0 ? (
                                        <img 
                                          src={product.imageUrls[0]} 
                                          alt={product.name}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                        <span className="font-medium text-gray-900">{product.name || 'Unnamed Product'}</span>
                      </div>
                    </td>
                                <td className="py-4 px-4 text-gray-900">₦{parseFloat(product.price).toLocaleString()}</td>
                                <td className="py-4 px-4 text-gray-900">
                                  <div className="text-sm">
                                    <div className={`font-medium ${isLowStock(product) ? 'text-orange-600' : isOutOfStock(product) ? 'text-red-600' : 'text-gray-900'}`}>
                                      {product.stockQuantity} in stock
                                      {isLowStock(product) && ' ⚠️'}
                                      {isOutOfStock(product) && ' ❌'}
                                    </div>
                                    {product.soldQuantity > 0 && (
                                      <div className="text-gray-500 text-xs">{product.soldQuantity} sold</div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-[120px]">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(status)}`}>
                                      {getStatusDisplayName(status)}
                                    </span>
                                    <div className="flex flex-col sm:flex-row gap-1">
                                      {status === 'DRAFT' && (
                                        <button 
                                          onClick={() => handlePublishProduct(product.id)}
                                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors whitespace-nowrap"
                                          title="Publish Product"
                                        >
                                          Publish
                                        </button>
                                      )}
                                      {status === 'ACTIVE' && (
                                        <button 
                                          onClick={() => handleUnpublishProduct(product.id)}
                                          className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap"
                                          title="Unpublish Product"
                                        >
                                          Unpublish
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-gray-900">{sales.toLocaleString()}</td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => window.location.href = `/seller/products/${product.id}`}
                                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                                    <button
                                      onClick={() => window.location.href = `/seller/products/edit/${product.id}`}
                                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                                    <button
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                            );
                          })}
              </tbody>
            </table>
            
            {/* Pagination for List View */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </div>
                  )}

                  {/* Grid View */}
                  {viewMode === 'grid' && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getPaginatedProducts().map((product) => {
                        const status = getProductStatus(product);
                        const sales = getSalesCount(product);
                        return (
                          <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            {/* Mobile Layout: Stacked (image on top, details below) */}
                            <div className="md:hidden">
                              {/* Product Image */}
                              <div className="w-full h-48 bg-gray-200 overflow-hidden">
                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                  <img 
                                    src={product.imageUrls[0]} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="p-4 space-y-3">
                                {/* Product Title */}
                                <h3 className="font-semibold text-gray-900 text-lg">{product.name || 'Unnamed Product'}</h3>

                                {/* Price */}
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-900">₦{parseFloat(product.price).toLocaleString()}</span>
                                  <span className="text-sm text-gray-400 line-through">₦{parseFloat(product.price).toLocaleString()}</span>
                                </div>

                                {/* Stock */}
                                <div className="text-sm text-gray-600">
                                  <div className={`font-medium ${isLowStock(product) ? 'text-orange-600' : isOutOfStock(product) ? 'text-red-600' : 'text-gray-900'}`}>
                                    Stock: {product.stockQuantity}
                                    {isLowStock(product) && ' ⚠️'}
                                    {isOutOfStock(product) && ' ❌'}
                                </div>
                                  {product.soldQuantity > 0 && (
                                    <div className="text-gray-500 text-xs">Sold: {product.soldQuantity}</div>
                                  )}
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                      Status: {getStatusDisplayName(status)}
                                    </span>
                                    {status === 'DRAFT' && (
                                      <button 
                                        onClick={() => handlePublishProduct(product.id)}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                        title="Publish Product"
                                      >
                                        Publish
                                      </button>
                                    )}
                                    {status === 'ACTIVE' && (
                                      <button 
                                        onClick={() => handleUnpublishProduct(product.id)}
                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                                        title="Unpublish Product"
                                      >
                                        Unpublish
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-2">
                                  <button 
                                    onClick={() => window.location.href = `/seller/products/edit/${product.id}`}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => window.location.href = `/seller/products/${product.id}`}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Desktop Layout: Side-by-side (image left, details right) */}
                            <div className="hidden md:flex">
                              {/* Product Image */}
                              <div className="w-48 h-48 bg-gray-200 flex-shrink-0 overflow-hidden">
                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                  <img 
                                    src={product.imageUrls[0]} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 p-4 space-y-3">
                                {/* Product Title */}
                                <h3 className="font-semibold text-gray-900 text-lg">{product.name || 'Unnamed Product'}</h3>

                                {/* Price */}
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-900">₦{parseFloat(product.price).toLocaleString()}</span>
                                  <span className="text-sm text-gray-400 line-through">₦{parseFloat(product.price).toLocaleString()}</span>
                                </div>

                                {/* Stock */}
                                <div className="text-sm text-gray-600">
                                  <div className={`font-medium ${isLowStock(product) ? 'text-orange-600' : isOutOfStock(product) ? 'text-red-600' : 'text-gray-900'}`}>
                                    Stock: {product.stockQuantity}
                                    {isLowStock(product) && ' ⚠️'}
                                    {isOutOfStock(product) && ' ❌'}
                                </div>
                                  {product.soldQuantity > 0 && (
                                    <div className="text-gray-500 text-xs">Sold: {product.soldQuantity}</div>
                                  )}
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                      Status: {getStatusDisplayName(status)}
                                    </span>
                                    {status === 'DRAFT' && (
                                      <button 
                                        onClick={() => handlePublishProduct(product.id)}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                        title="Publish Product"
                                      >
                                        Publish
                                      </button>
                                    )}
                                    {status === 'ACTIVE' && (
                                      <button 
                                        onClick={() => handleUnpublishProduct(product.id)}
                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                                        title="Unpublish Product"
                                      >
                                        Unpublish
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-2">
                                  <button 
                                    onClick={() => window.location.href = `/seller/products/edit/${product.id}`}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => window.location.href = `/seller/products/${product.id}`}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        className="mt-8"
                      />
                    )}
                  </div>
                )}

                </>
              ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No products found' : 'No products yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first product to the marketplace'}
                </p>
                {!searchTerm && (
                  <Link 
                    to="/seller/products/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Your First Product
                  </Link>
                )}
              </div>
              )}

            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          confirmButtonColor={confirmationModal.confirmButtonColor}
        />

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Action Loading Overlay */}
        {actionLoading && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-25 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}

      </div>
    </SellerLayout>
  );
}
