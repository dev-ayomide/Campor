import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  getAllProductsAlgolia, 
  searchProductsAlgolia, 
  getCategoriesAlgolia, 
  debouncedSearch 
} from '../../services/algoliaService';
import { AuthContext } from '../../context/AuthContext';
import { AddToCartButton } from '../../components/cart';
import marketplaceImage from '../../assets/images/marketplace.png';
import productImage from '../../assets/images/product.png';
import SearchHighlight from '../../components/search/SearchHighlight';

export default function MarketplacePage() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
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
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  


  // Categories state - will be fetched from backend
  const [categories, setCategories] = useState(['All']); // Start with 'All' option

  const brands = ['All', 'Apple', 'Samsung', 'Sony', 'HP', 'Dell'];
  const priceRanges = [
    'All',
    '₦10,000.00 - ₦15,000.00',
    '₦15,000.00 - ₦25,000.00',
    '₦25,000.00 - ₦50,000.00',
    '₦50,000+'
  ];

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Refetch products when filters change - more responsive like demo
  useEffect(() => {
    if (!categoriesLoading) {
      // Immediate filter update for better UX
      fetchProducts(1);
    }
  }, [selectedCategory, selectedPrice]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('🔍 Marketplace: Fetching categories from Algolia...');
      const response = await getCategoriesAlgolia();
      
      console.log('🔍 Marketplace: Raw categories response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        // Add 'All' option at the beginning and extract category names
        const categoryNames = ['All', ...response.data.map(cat => cat.name)];
        setCategories(categoryNames);
        console.log('✅ Marketplace: Categories loaded successfully from Algolia:', categoryNames);
      } else {
        console.warn('⚠️ Marketplace: No categories found in response, using default');
        setCategories(['All', 'Electronics', 'Clothing', 'Books', 'Accessories']);
      }
    } catch (err) {
      console.error('❌ Marketplace: Failed to fetch categories from Algolia:', err);
      // Keep 'All' option even if categories fail to load
      setCategories(['All', 'Electronics', 'Clothing', 'Books', 'Accessories']);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Build filters object from selected options for Algolia
  const buildFilters = () => {
    const filters = {};
    
    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filters.category = selectedCategory;
    }
    
    // Price filter - pass the selected price string directly
    if (selectedPrice && selectedPrice !== 'All') {
      filters.price = selectedPrice;
    }
    
    console.log('🔍 Marketplace: Built Algolia filters:', filters);
    return filters;
  };

  const fetchProducts = async (page = 1, filters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use provided filters or build from current state
      const activeFilters = filters || buildFilters();
      
      console.log('🔍 Marketplace: Fetching products from Algolia with filters:', activeFilters);
      const response = await getAllProductsAlgolia(page, 10, activeFilters);
      
      if (response?.data) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        });
        console.log('✅ Marketplace: Products loaded successfully from Algolia');
      }
    } catch (err) {
      console.error('❌ Marketplace: Failed to fetch products from Algolia:', err);
      setError(err.message || 'Failed to load products. Please try again.');
      // Fallback to empty products array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Handle price filter change
  const handlePriceChange = (price) => {
    setSelectedPrice(price);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedPrice('All');
    setSearchQuery('');
    // Reset pagination when clearing filters
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10
    });
    // Fetch all products after clearing filters
    fetchProducts(1);
  };

  // Enhanced search handler with better UX
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // If search is empty, fetch all products with current filters
      fetchProducts(1);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Marketplace: Searching with Algolia for:', searchQuery);
      const response = await searchProductsAlgolia(searchQuery, 1, 10, buildFilters());
      
      if (response.data) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        });
        console.log('✅ Marketplace: Algolia search completed successfully');
      }
    } catch (err) {
      console.error('❌ Marketplace: Algolia search failed:', err);
      setError(err.message || 'Search failed. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced real-time search with better UX
  const handleRealTimeSearch = (query) => {
    setSearchQuery(query);
    
    // Update URL with search query (like demo)
    if (query.trim()) {
      setSearchParams({ query: query.trim() });
    } else {
      setSearchParams({});
    }
    
    if (!query.trim()) {
      // If search is cleared, fetch all products with current filters
      fetchProducts(1);
      return;
    }
    
    // Real-time search with debouncing - more responsive like demo
    // Only show loading if we don't have results yet
    if (products.length === 0) {
      setLoading(true);
    }
    
    debouncedSearch(query, (result) => {
      if (result.data) {
        setProducts(result.data.products || []);
        setPagination(result.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        });
      }
      setLoading(false);
    });
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
    const handleClickOutside = (event) => {
      // Check if click is outside dropdown containers
      const dropdownContainers = document.querySelectorAll('[data-dropdown]');
      let clickedInside = false;
      
      dropdownContainers.forEach(container => {
        if (container.contains(event.target)) {
          clickedInside = true;
        }
      });
      
      if (!clickedInside) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      // Use capture phase to ensure this runs before other click handlers
      document.addEventListener('click', handleClickOutside, true);
      return () => document.removeEventListener('click', handleClickOutside, true);
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
                  onChange={(e) => handleRealTimeSearch(e.target.value)}
                  placeholder="Product, brand, category, seller..."
                  className="w-full px-6 py-4 pr-16 text-gray-900 bg-white rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 min-w-0">
          {/* Sidebar - Categories & Filters */}
          <aside className="lg:w-64 flex-shrink-0 min-w-0">
            {/* Mobile Filter Toolbar */}
            <div className="lg:hidden mb-4">
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
                {/* Clear Filters Button */}
                {(selectedCategory !== 'All' || selectedPrice !== 'All' || searchQuery.trim()) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"
                  >
                    Clear All
                  </button>
                )}
                
                {/* Mobile Dropdown Container */}
                <div className="flex gap-3 flex-1 relative">
                {/* Category Dropdown */}
                <div className="relative flex-1 min-w-0" data-dropdown style={{ zIndex: 1000000 }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 Category dropdown clicked, current state:', openDropdown);
                      setOpenDropdown(openDropdown === 'category' ? null : 'category');
                      console.log('🔍 Category dropdown new state:', openDropdown === 'category' ? null : 'category');
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 Category dropdown touched, current state:', openDropdown);
                      setOpenDropdown(openDropdown === 'category' ? null : 'category');
                      console.log('🔍 Category dropdown new state:', openDropdown === 'category' ? null : 'category');
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors touch-manipulation"
                  >
                    <span className="truncate">{selectedCategory === 'All' ? 'All Category' : selectedCategory}</span>
                    <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'category' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Category Options */}
                  {openDropdown === 'category' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 999999, position: 'absolute !important' }}>

                      {categoriesLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-500">Loading categories...</div>
                      ) : (
                        categories.map((category) => (
                          <button
                            key={category}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCategoryChange(category);
                              setOpenDropdown(null);
                            }}
                            onTouchStart={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCategoryChange(category);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 touch-manipulation ${
                              selectedCategory === category ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {category}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Price Dropdown */}
                <div className="relative flex-1 min-w-0" data-dropdown style={{ zIndex: 1000000 }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'price' ? null : 'price');
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'price' ? null : 'price');
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors touch-manipulation"
                  >
                    <span className="truncate">{selectedPrice === 'All' ? 'Price' : selectedPrice}</span>
                    <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'price' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Price Options */}
                  {openDropdown === 'price' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 999999, position: 'absolute !important' }}>

                      {priceRanges.map((price) => (
                        <button
                          key={price}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePriceChange(price);
                            setOpenDropdown(null);
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePriceChange(price);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 touch-manipulation ${
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
            </div>

            <div className={`bg-white rounded-xl shadow-sm sticky top-4 overflow-hidden ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
              {/* Search Section */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setSearchQuery(query);
                      
                      // Real-time search with debouncing
                      if (query.trim()) {
                        setLoading(true);
                        debouncedSearch(query, (result) => {
                          if (result.data) {
                            setProducts(result.data.products || []);
                            setPagination(result.data.pagination || {
                              currentPage: 1,
                              totalPages: 1,
                              totalItems: 0,
                              itemsPerPage: 10
                            });
                          }
                          setLoading(false);
                        });
                      } else {
                        // If search is cleared, fetch all products
                        fetchProducts(1);
                      }
                    }}
                    placeholder="What are you looking for?"
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all duration-200 hover:shadow-md"
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
                  {categoriesLoading ? (
                    <div className="text-sm text-gray-500 py-2">Loading categories...</div>
                  ) : (
                    categories.map((category) => (
                                              <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === category
                              ? 'bg-blue-50 text-blue-600 font-medium border-l-2 border-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {category}
                        </button>
                    ))
                  )}
                </div>
              </div>

              {/* Price Filter */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">PRICE</h3>
                <div className="space-y-2.5">
                  {priceRanges.map((price) => (
                    <label key={price} className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="price-filter"
                        checked={selectedPrice === price}
                        onChange={() => handlePriceChange(price)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                      />
                      <span className="ml-3 text-sm text-gray-600">{price}</span>
                    </label>
                  ))}
                </div>
                
                {/* Clear Filters Button */}
                {(selectedCategory !== 'All' || selectedPrice !== 'All' || searchQuery.trim()) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            
            {/* Products Grid/List */}
            <div className={`overflow-hidden ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' 
                : 'flex flex-col gap-4'
            }`}>
              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-flex flex-col items-center gap-3 text-gray-500">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200"></div>
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                    </div>
                    <span className="font-medium">{searchQuery.trim() ? 'Searching products...' : 'Loading products...'}</span>
                    <span className="text-sm text-gray-400">Please wait a moment</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-lg font-medium">{error}</p>
                  </div>
                  <button 
                    onClick={() => fetchProducts(1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-lg font-medium">
                      {searchQuery.trim() ? `No products found for "${searchQuery}"` : 'No products available'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchQuery.trim() ? 'Try adjusting your search terms or filters' : 'Check back later for new products'}
                    </p>
                  </div>
                  {searchQuery.trim() && (
                    <button 
                      onClick={clearFilters}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Search & Filters
                    </button>
                  )}
                </div>
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
                    <Link key={product.id} to={`/product/${product.slug || product.id}`} className={`block bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden min-w-0 ${
                      viewMode === 'list' ? 'flex flex-row items-center p-4 gap-4' : ''
                    }`}>
                      {/* Product Image with Navigation */}
                      <div className={`block relative overflow-hidden flex-shrink-0 ${
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
                        
                        {/* Stock Status Badge - Removed for now */}
                        
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
                      </div>

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

                              {/* Product Name - Compact with highlighting */}
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                                <SearchHighlight 
                                  text={productName} 
                                  highlight={searchQuery} 
                                  className="text-sm font-semibold text-gray-900"
                                />
                              </h3>

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
                                <span className="text-xs text-gray-600">{product.seller?.catalogueName || 'Unknown Seller'}</span>
                              </div>
                            </div>

                            {/* Action Buttons - Bottom aligned */}
                            <div className="flex gap-2 items-center">
                              {productStock === 0 ? (
                                <button 
                                  disabled
                                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-gray-400 cursor-not-allowed text-white"
                                >
                                  Out of Stock
                                </button>
                              ) : (
                                <div 
                                  onClick={(e) => e.preventDefault()}
                                  className="flex-1"
                                >
                                  <AddToCartButton 
                                    productId={product.id} 
                                    className="w-full py-2 px-3 text-sm font-medium"
                                  />
                                </div>
                              )}
                              <button 
                                onClick={(e) => e.preventDefault()}
                                className="p-2 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors flex-shrink-0"
                              >
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

                            {/* Product Name with highlighting */}
                            <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1 line-clamp-2">
                              <SearchHighlight 
                                text={productName} 
                                highlight={searchQuery} 
                                className="text-sm md:text-base font-medium text-gray-900"
                              />
                            </h3>

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
                              <span className="text-xs text-gray-600">{product.seller?.catalogueName || 'Unknown Seller'}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {productStock === 0 ? (
                                <button 
                                  disabled
                                  className="flex-1 py-2.5 md:py-2 px-3 rounded-lg text-sm font-medium bg-gray-400 cursor-not-allowed text-white"
                                >
                                  Out of Stock
                                </button>
                              ) : (
                                <div 
                                  onClick={(e) => e.preventDefault()}
                                  className="flex-1"
                                >
                                  <AddToCartButton 
                                    productId={product.id} 
                                    className="w-full py-2.5 md:py-2 px-3 text-sm font-medium"
                                  />
                                </div>
                              )}
                              <button 
                                onClick={(e) => e.preventDefault()}
                                className="p-2.5 md:p-2 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
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