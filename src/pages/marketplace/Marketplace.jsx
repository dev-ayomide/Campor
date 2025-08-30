import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProducts, searchProducts, addToCart } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';
import marketplaceImage from '../../assets/images/marketplace.png';
import productImage from '../../assets/images/product.png';

export default function MarketplacePage() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [productImageIndexes, setProductImageIndexes] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');

  // Real data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Cart states
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  // Mock data for categories (will be replaced with real categories later)
  const categories = [
    'All',
    'Electronics',
    'Accessories',
    'Books',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Art & Beauty'
  ];

  const brands = ['All', 'Apple', 'Samsung', 'Sony', 'HP', 'Dell'];
  const priceRanges = [
    'All',
    '₦10,000.00 - ₦15,000.00',
    '₦15,000.00 - ₦25,000.00',
    '₦25,000.00 - ₦50,000.00',
    '₦50,000+'
  ];

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page = 1, filters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Marketplace: Fetching products...');
      const response = await getAllProducts(page, 10, filters);
      
      if (response.data) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        });
        console.log('✅ Marketplace: Products loaded successfully');
      }
    } catch (err) {
      console.error('❌ Marketplace: Failed to fetch products:', err);
      setError(err.message || 'Failed to load products. Please try again.');
      // Fallback to empty products array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // If search is empty, fetch all products
      fetchProducts();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Marketplace: Searching for:', searchQuery);
      const response = await searchProducts(searchQuery);
      
      if (response.data) {
        setProducts(response.data || []);
        // Reset pagination for search results
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data.length || 0,
          itemsPerPage: response.data.length || 0
        });
        console.log('✅ Marketplace: Search completed successfully');
      }
    } catch (err) {
      console.error('❌ Marketplace: Search failed:', err);
      setError(err.message || 'Search failed. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    // Check if user is authenticated
    if (!token || !user) {
      setCartMessage('Please sign in to add items to cart');
      setTimeout(() => setCartMessage(''), 3000);
      navigate('/auth');
      return;
    }

    try {
      setCartLoading(true);
      setCartMessage('');
      
      console.log('🔍 Marketplace: Adding product to cart:', { productId, quantity });
      
      // Get cart ID from user data (assuming it's stored in user.cart.id)
      const cartId = user.cart?.id;
      if (!cartId) {
        setCartMessage('Cart not found. Please try again.');
        return;
      }
      
      const cartItems = [{
        productId: productId,
        quantity: quantity
      }];
      
      await addToCart(cartId, cartItems);
      
      setCartMessage('Product added to cart successfully!');
      setTimeout(() => setCartMessage(''), 3000);
      
      console.log('✅ Marketplace: Product added to cart successfully');
      
    } catch (err) {
      console.error('❌ Marketplace: Failed to add product to cart:', err);
      setCartMessage(err.message || 'Failed to add product to cart. Please try again.');
      setTimeout(() => setCartMessage(''), 3000);
    } finally {
      setCartLoading(false);
    }
  };

  const handlePrevImage = (productId, totalImages) => {
    setProductImageIndexes(prev => ({
      ...prev,
      [productId]: prev[productId] > 0 ? prev[productId] - 1 : totalImages - 1
    }));
  };

  const handleNextImage = (productId, totalImages) => {
    setProductImageIndexes(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) < totalImages - 1 ? (prev[productId] || 0) + 1 : 0
    }));
  };

  const getCurrentImageIndex = (productId) => {
    return productImageIndexes[productId] || 0;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={marketplaceImage} 
            alt="Marketplace" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-blue-900 bg-opacity-60"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-blue-100 mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white">Market Place</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              Market Place
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8">
              Your One Stop Shop for all School items
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-6 py-4 pr-16 text-gray-900 bg-white rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 min-w-0">
          {/* Sidebar - Categories & Filters */}
          <aside className="lg:w-64 flex-shrink-0 min-w-0 overflow-hidden">
            {/* Mobile Filter Toolbar */}
            <div className="lg:hidden mb-4 overflow-hidden">
              {/* Filter Header with View Toggle */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-lg font-semibold text-gray-900">Filter</span>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex gap-3">
                {/* Category Dropdown */}
                <div className="relative flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'category' ? null : 'category');
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <span className="truncate">{selectedCategory === 'All' ? 'All Category' : selectedCategory}</span>
                    <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'category' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Category Options */}
                  {openDropdown === 'category' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[60]">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(category);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedCategory === category ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brand Dropdown */}
                <div className="relative flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'brand' ? null : 'brand');
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <span className="truncate">{selectedBrand === 'All' ? 'All Brand' : selectedBrand}</span>
                    <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'brand' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Brand Options */}
                  {openDropdown === 'brand' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[60]">
                      {brands.map((brand) => (
                        <button
                          key={brand}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBrand(brand);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedBrand === brand ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Dropdown */}
                <div className="relative flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'price' ? null : 'price');
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <span className="truncate">{selectedPrice === 'All' ? 'Price' : selectedPrice}</span>
                    <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'price' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Price Options */}
                  {openDropdown === 'price' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[60]">
                      {priceRanges.map((price) => (
                        <button
                          key={price}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPrice(price);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedPrice === price ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {price}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`bg-white rounded-xl shadow-sm sticky top-4 overflow-hidden ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
              {/* Search Section */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filter Button */}
              <div className="p-4 border-b border-gray-100">
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="font-medium text-gray-700">Filter</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Categories */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">CATEGORIES</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-50 text-blue-600 font-medium border-l-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">PRICE</h3>
                <div className="space-y-2.5">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-3 text-sm text-gray-600">All Price</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-3 text-sm text-gray-600">₦10,000.00 - ₦15,000.00</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-3 text-sm text-gray-600">₦15,000.00 - ₦25,000.00</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-3 text-sm text-gray-600">₦25,000.00 - ₦50,000.00</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-3 text-sm text-gray-600">₦50,000+</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 overflow-hidden">
            {/* Cart Message Display */}
            {cartMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                cartMessage.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {cartMessage}
              </div>
            )}
            
            {/* Products Grid/List */}
            <div className={`overflow-hidden ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' 
                : 'flex flex-col gap-4'
            }`}>
              {loading ? (
                <p className="text-center py-10 text-gray-500">Loading products...</p>
              ) : error ? (
                <p className="text-center py-10 text-red-500">{error}</p>
              ) : products.length === 0 ? (
                <p className="text-center py-10 text-gray-500">No products found.</p>
              ) : (
                products.map((product) => {
                  const currentImageIndex = getCurrentImageIndex(product.id);
                  
                  // Handle real product data structure from API
                  const productImages = product.imageUrls && product.imageUrls.length > 0 
                    ? product.imageUrls 
                    : [productImage]; // Fallback to default image
                  
                  const productPrice = product.price ? `₦${product.price}` : '₦0';
                  const productName = product.name || 'Product Name Unavailable';
                  const productDescription = product.description || 'No description available';
                  const productStock = product.stockQuantity || 0;
                  
                  return (
                    <div key={product.id} className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden min-w-0 ${
                      viewMode === 'list' ? 'flex flex-row items-center p-4 gap-4' : ''
                    }`}>
                      {/* Product Image with Navigation */}
                      <Link to={`/product/${product.id}`} className={`block relative overflow-hidden flex-shrink-0 ${
                        viewMode === 'list' 
                          ? 'w-20 h-20 rounded-lg' 
                          : 'aspect-square rounded-t-lg'
                      }`}>
                        <img 
                          src={productImages[currentImageIndex] || productImage} 
                          alt={productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = productImage; // Fallback to default image
                          }}
                        />
                        
                        {/* Stock Status Badge */}
                        {productStock > 0 ? (
                          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            IN STOCK
                          </div>
                        ) : (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            OUT OF STOCK
                          </div>
                        )}
                        
                        {/* Image Navigation Arrows - Only for grid view */}
                        {productImages.length > 1 && viewMode === 'grid' && (
                          <>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handlePrevImage(product.id, productImages.length);
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 md:p-1 rounded-full shadow-md transition-all"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleNextImage(product.id, productImages.length);
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 md:p-1 rounded-full shadow-md transition-all"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}

                        {/* Favorite Button - Only for grid view */}
                        {viewMode === 'grid' && (
                          <button 
                            onClick={(e) => e.preventDefault()}
                            className="absolute top-3 right-3 p-1.5 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md transition-all"
                          >
                            <svg className="w-4 h-4 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        )}

                        {/* Image indicator dots - Only for grid view */}
                        {productImages.length > 1 && viewMode === 'grid' && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {productImages.map((_, index) => (
                              <div 
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : 'p-4'}`}>
                        {viewMode === 'list' ? (
                          // List View Layout
                          <div className="flex flex-col justify-between h-full">
                            <div className="flex-1">
                              {/* Rating Stars - Smaller for list view */}
                              <div className="flex items-center gap-0.5 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>

                              {/* Product Name - Compact */}
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">{productName}</h3>

                              {/* Price - Prominent */}
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-gray-900">{productPrice}</span>
                                <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                              </div>

                              {/* Seller Info - Compact */}
                              <div className="flex items-center gap-1 mb-2">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="text-xs text-gray-600">{product.seller}</span>
                              </div>
                            </div>

                            {/* Action Buttons - Bottom aligned */}
                            <div className="flex gap-2 items-center">
                              <button 
                                onClick={() => handleAddToCart(product.id)}
                                disabled={cartLoading || productStock === 0}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                  cartLoading || productStock === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {cartLoading ? 'Adding...' : productStock === 0 ? 'Out of Stock' : 'Add to cart'}
                              </button>
                              <button className="p-2 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Grid View Layout (Original)
                          <div>
                            {/* Rating Stars */}
                            <div className="flex items-center gap-0.5 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>

                            {/* Product Name */}
                            <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1 line-clamp-2">{productName}</h3>

                            {/* Price */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg md:text-xl font-bold text-gray-900">{productPrice}</span>
                              <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                            </div>

                            {/* Seller Info */}
                            <div className="flex items-center gap-1 mb-3">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-xs text-gray-600">{product.seller}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAddToCart(product.id)}
                                disabled={cartLoading || productStock === 0}
                                className={`flex-1 py-2.5 md:py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                  cartLoading || productStock === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {cartLoading ? 'Adding...' : productStock === 0 ? 'Out of Stock' : 'Add to cart'}
                              </button>
                              <button className="p-2.5 md:p-2 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center mt-8">
              <nav className="flex items-center gap-2">
                <button 
                  onClick={() => fetchProducts(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className={`px-3 py-2 transition-colors ${
                    pagination.currentPage <= 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Generate page numbers based on real pagination */}
                {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchProducts(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => fetchProducts(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className={`px-3 py-2 transition-colors ${
                    pagination.currentPage >= pagination.totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}