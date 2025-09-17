import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { getSellerProducts, deleteProduct, updateProductStatus } from '../../services/authService';
import { getLowStockAlerts } from '../../services/inventoryService';

export default function SellerProductsPage({ toggleMobileMenu }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        if (user?.seller?.id) {
          const [productsData, alertsData] = await Promise.all([
            getSellerProducts(user.seller.id),
            getLowStockAlerts(user.seller.id, 5) // Alert when stock is 5 or below
          ]);
          
          setProducts(productsData || []);
          setLowStockAlerts(alertsData || []);
          console.log('✅ Products: Fetched seller products:', productsData);
          console.log('✅ Products: Low stock alerts:', alertsData);
        }
        
      } catch (err) {
        console.error('❌ Products: Failed to fetch products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

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
  }, [products, searchTerm, statusFilter]);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        console.log('✅ Product deleted successfully');
      } catch (err) {
        console.error('❌ Failed to delete product:', err);
        setError(err.message);
      }
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
    // Use the sales count from the API
    return product._count?.orderItems || 0;
  };

  const handleStatusUpdate = async (productId, newStatus) => {
    try {
      await updateProductStatus(productId, newStatus);
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, status: newStatus } : product
      ));
      console.log('✅ Product status updated successfully');
    } catch (err) {
      console.error('❌ Failed to update product status:', err);
      setError(err.message);
    }
  };

  // Refresh inventory data
  const refreshInventory = async () => {
    try {
      setLoading(true);
      if (user?.seller?.id) {
        const [productsData, alertsData] = await Promise.all([
          getSellerProducts(user.seller.id),
          getLowStockAlerts(user.seller.id, 5)
        ]);
        
        setProducts(productsData || []);
        setLowStockAlerts(alertsData || []);
        console.log('✅ Inventory refreshed successfully');
      }
    } catch (err) {
      console.error('❌ Failed to refresh inventory:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-full overflow-hidden">
        {/* Descriptive Text */}
        <p className="text-gray-600 mb-4">Manage your product inventory and listings.</p>
        
        {/* Low Stock Alerts */}
        {lowStockAlerts.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-orange-800">Low Stock Alert</h3>
            </div>
            <p className="text-orange-700 text-sm mb-3">
              The following products are running low on stock:
            </p>
            <div className="space-y-2">
              {lowStockAlerts.map((product) => (
                <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
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
                      <p className="text-sm text-gray-600">Only {product.stockQuantity} left in stock</p>
                    </div>
                  </div>
                  <Link 
                    to={`/seller/products/edit/${product.id}`}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Mobile Design - Search, Filter, Download, Add */}
        <div className="flex items-center space-x-3 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search...."
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
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
          
          {/* Refresh Button */}
          <button 
            onClick={refreshInventory}
            disabled={loading}
            className="w-12 h-12 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
            title="Refresh inventory"
          >
            <svg className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Add Button */}
          <Link 
            to="/seller/products/add"
            className="w-12 h-12 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mx-2 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Error loading products</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
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
                          {filteredProducts.map((product) => {
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
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                                <td className="py-4 px-4 text-gray-900">₦{parseFloat(product.price).toLocaleString()}</td>
                                <td className="py-4 px-4 text-gray-900">{product.stockQuantity}</td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                      {getStatusDisplayName(status)}
                                    </span>
                                    {status === 'DRAFT' && (
                                      <button 
                                        onClick={() => handleStatusUpdate(product.id, 'ACTIVE')}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                        title="Publish Product"
                                      >
                                        Publish
                                      </button>
                                    )}
                                    {status === 'ACTIVE' && (
                                      <button 
                                        onClick={() => handleStatusUpdate(product.id, 'DRAFT')}
                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                                        title="Unpublish Product"
                                      >
                                        Unpublish
                                      </button>
                                    )}
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
          </div>
                  )}

                  {/* Grid View */}
                  {viewMode === 'grid' && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredProducts.map((product) => {
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
                                <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>

                                {/* Price */}
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-900">₦{parseFloat(product.price).toLocaleString()}</span>
                                  <span className="text-sm text-gray-400 line-through">₦{parseFloat(product.price).toLocaleString()}</span>
                                </div>

                                {/* Stock */}
                                <div className="text-sm text-gray-600">
                                  <span>Stock: {product.stockQuantity}</span>
                                </div>

                                {/* Sales */}
                                <div className="text-sm text-gray-600">
                                  <span>Sales: {sales.toLocaleString()}</span>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                      Status: {getStatusDisplayName(status)}
                                    </span>
                                    {status === 'DRAFT' && (
                                      <button 
                                        onClick={() => handleStatusUpdate(product.id, 'ACTIVE')}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                        title="Publish Product"
                                      >
                                        Publish
                                      </button>
                                    )}
                                    {status === 'ACTIVE' && (
                                      <button 
                                        onClick={() => handleStatusUpdate(product.id, 'DRAFT')}
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
                                <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>

                                {/* Price */}
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-900">₦{parseFloat(product.price).toLocaleString()}</span>
                                  <span className="text-sm text-gray-400 line-through">₦{parseFloat(product.price).toLocaleString()}</span>
                                </div>

                                {/* Stock */}
                                <div className="text-sm text-gray-600">
                                  <span>Stock: {product.stockQuantity}</span>
                                </div>

                                {/* Sales */}
                                <div className="text-sm text-gray-600">
                                  <span>Sales: {sales.toLocaleString()}</span>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                      Status: {getStatusDisplayName(status)}
                                    </span>
                                    {status === 'DRAFT' && (
                                      <button 
                                        onClick={() => handleStatusUpdate(product.id, 'ACTIVE')}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                        title="Publish Product"
                                      >
                                        Publish
                                      </button>
                                    )}
                                    {status === 'ACTIVE' && (
                                      <button 
                                        onClick={() => handleStatusUpdate(product.id, 'DRAFT')}
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
