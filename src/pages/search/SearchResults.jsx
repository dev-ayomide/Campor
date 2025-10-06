import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { searchProductsAlgolia, getAllProductsAlgolia, getCategoriesAlgolia } from '../../services/algoliaService';
import { Pagination, Loader, Breadcrumb } from '../../components/common';
import { SearchIcon } from 'lucide-react';

export default function SearchResultsPage() {
  const { user, token } = useContext(AuthContext);
  const { addProductToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get search query from URL
  const query = searchParams.get('q') || '';
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  
  // Filter and sort states
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Cart states
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  // Price ranges - match marketplace format
  const priceRanges = [
    'All Price',
    '₦0.00 - 9,999.99',
    '₦10,000.00 - 19,999.99',
    '₦20,000.00 - 29,999.99',
    '₦30,000.00 - 39,999.99',
    '₦40,000.00+'
  ];

  // Build filters object - match marketplace logic
  const buildFilters = () => {
    const filters = {};
    
    // Category filter - use category name like marketplace
    if (selectedCategory !== 'all') {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category) {
        filters.category = category.name;
      }
    }
    
    // Price filter - pass the selected price string directly
    if (selectedPrice !== 'all') {
      filters.price = selectedPrice;
    }
    
    return filters;
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await getCategoriesAlgolia();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      // Categories are optional, don't show error
    }
  };

  // Fetch search results
  const fetchSearchResults = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!query.trim()) {
        // If no query, show all products
        const response = await getAllProductsAlgolia(page, pagination.itemsPerPage, buildFilters());
        if (response.data) {
          setProducts(response.data.products || []);
          setPagination(response.data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 12
          });
        }
      } else {
        // Search with query
        const response = await searchProductsAlgolia(query, page, pagination.itemsPerPage, buildFilters());
        if (response.data) {
          setProducts(response.data.products || []);
          setPagination(response.data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 12
          });
        }
      }
    } catch (err) {
      setError('Search is temporarily unavailable. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchSearchResults(page);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filter changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePriceChange = (price) => {
    setSelectedPrice(price);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPrice('all');
    setPriceRange([0, 100000]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Clear URL parameters for filters
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    setSearchParams(params);
    
    // Fetch fresh results with cleared filters
    fetchSearchResults(1);
  };

  // Handle add to cart
  const handleAddToCart = async (productId, sellerId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setCartLoading(true);
      setCartMessage('');
      
      await addProductToCart(productId, sellerId, 1);
      setCartMessage('Product added to cart successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setCartMessage(''), 3000);
    } catch (error) {
      setCartMessage('Failed to add product to cart. Please try again.');
      setTimeout(() => setCartMessage(''), 3000);
    } finally {
      setCartLoading(false);
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.relative')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
        document.removeEventListener('touchstart', handleClickOutside, true);
      };
    }
  }, [openDropdown]);

  // Load search results and categories on component mount and when query or filters change
  useEffect(() => {
    fetchSearchResults(1);
    fetchCategories();
  }, [query, selectedCategory, selectedPrice]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedPrice !== 'all') params.set('price', selectedPrice);
    
    setSearchParams(params);
  }, [query, selectedCategory, selectedPrice, setSearchParams]);

  return (
    <div className="min-h-screen ">
      {/* Header Section */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Search Results', href: null }
            ]}
          />
          
           {/* Search Header */}
           <div className="mb-6">
             {/* Desktop Layout */}
             <div className="hidden sm:flex sm:items-center sm:justify-between mb-2">
               <div className="flex items-center gap-4">
                 {query && (
                   <div className="text-md text-gray-600">
                     Showing results for <span className="font-medium text-black">"{query}"</span>
                   </div>
                 )}
                 <div className="text-sm text-gray-600">
                   {pagination.totalItems > 0 ? (
                     <span>
                       {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems.toLocaleString()} results
                     </span>
                   ) : (
                     <span>No results found</span>
                   )}
                 </div>
               </div>
               
               {/* View Mode Toggle - Desktop */}
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

             {/* Mobile Layout */}
             <div className="sm:hidden mb-4">
               {query && (
                 <div className="text-md text-gray-600 mb-2">
                   Showing results for <span className="font-medium text-black">"{query}"</span>
                 </div>
               )}
               <div className="flex items-center justify-between mb-3">
                 <div className="text-sm text-gray-600">
                   {pagination.totalItems > 0 ? (
                     <span>
                       {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems.toLocaleString()} results
                     </span>
                   ) : (
                     <span>No results found</span>
                   )}
                 </div>
                 
                 {/* View Mode Toggle - Mobile */}
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
             </div>
           </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'category' ? null : 'category');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors touch-manipulation min-w-[160px]"
                >
                  <span className="truncate">
                    {selectedCategory === 'all' ? 'All Categories' : categories.find(cat => cat.id === selectedCategory)?.name || 'All Categories'}
                  </span>
                  <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'category' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Category Options */}
                {openDropdown === 'category' && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-40">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCategoryChange('all');
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 ${
                        selectedCategory === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCategoryChange(category.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                          selectedCategory === category.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Filter */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'price' ? null : 'price');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors touch-manipulation min-w-[160px]"
                >
                  <span className="truncate">{selectedPrice === 'all' ? 'All Price' : selectedPrice}</span>
                  <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'price' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Price Options */}
                {openDropdown === 'price' && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-40">
                    {priceRanges.map((price) => (
                      <button
                        key={price}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePriceChange(price === 'All Price' ? 'all' : price);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 touch-manipulation ${
                          selectedPrice === (price === 'All Price' ? 'all' : price) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {(selectedCategory !== 'all' || selectedPrice !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cart Message */}
        {cartMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            cartMessage.includes('successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {cartMessage}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
            <button
              onClick={() => fetchSearchResults(1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {query ? `No results found for "${query}"` : 'No products found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {query 
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'No products are currently available.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/marketplace')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Products
              </button>
              {query && (
                <button
                  onClick={clearFilters}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => {
                const productImages = product.imageUrls && product.imageUrls.length > 0 
                  ? product.imageUrls 
                  : ['/product.png'];
                
                const productPrice = `₦${parseFloat(product.price || 0).toLocaleString()}`;
                const productName = product.name || 'Product Name Unavailable';
                const productDescription = product.description || 'No description available';
                const productStock = product.stockQuantity || 0;
                
                return (
                  <Link key={product.id} to={`/product/${product.slug || product.id}`} className={`block bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden min-w-0 ${
                    viewMode === 'list' ? 'flex flex-row items-center p-4 gap-4' : ''
                  }`}>
                    {/* Product Image */}
                    <div className={`block relative overflow-hidden flex-shrink-0 ${
                      viewMode === 'list' 
                        ? 'w-20 h-20 rounded-lg' 
                        : 'aspect-square rounded-t-lg'
                    }`}>
                      <img 
                        src={productImages[0]} 
                        alt={productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/product.png';
                        }}
                      />
                      
                      {/* Stock Status Badge - Only for grid view */}
                      {(!product.inStock || product.stockQuantity <= 0 || !product.stockQuantity) && viewMode === 'grid' && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : 'p-4'}`}>
                      {viewMode === 'list' ? (
                        // List View Layout
                        <div className="flex flex-col justify-between h-full">
                          <div className="flex-1">
                            {/* Product Name */}
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight flex-1 mb-1">
                              {productName}
                            </h3>
                            
                            {/* Price */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base font-bold text-gray-900">{productPrice}</span>
                            </div>
                            
                            {/* Seller Info */}
                            <div className="flex items-center gap-1 mb-2">
                              <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                <span className="text-xs font-medium text-gray-600">
                                  {product.seller?.catalogueName?.charAt(0) || 'S'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-600 truncate">
                                {product.seller?.catalogueName || 'Unknown Seller'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Add to Cart Button for List View */}
                          <div className="mt-2">
                            {product.stockQuantity > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddToCart(product.id, product.seller?.id);
                                }}
                                disabled={cartLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Add to Cart
                              </button>
                            ) : (
                              <button 
                                disabled 
                                className="w-full bg-gray-400 text-white text-xs py-2 px-3 rounded-lg cursor-not-allowed"
                              >
                                Out of Stock
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Grid View Layout
                        <div>
                          {/* Product Name */}
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
                            {productName}
                          </h3>
                          
                          {/* Price */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-900">{productPrice}</span>
                          </div>
                          
                          {/* Seller Info */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              <span className="text-xs font-medium text-gray-600">
                                {product.seller?.catalogueName?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600 truncate">
                              {product.seller?.catalogueName || 'Unknown Seller'}
                            </span>
                          </div>
                          
                          {/* Add to Cart Button for Grid View */}
                          {product.stockQuantity > 0 ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(product.id, product.seller?.id);
                              }}
                              disabled={cartLoading}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <button 
                              disabled 
                              className="w-full bg-gray-400 text-white text-sm py-2 px-4 rounded-lg cursor-not-allowed"
                            >
                              Out of Stock
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
