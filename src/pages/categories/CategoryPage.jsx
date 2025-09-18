import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryWithProducts, getCategories } from '../../services/categoryService';
import { getAllProducts } from '../../services/authService';
import { ProductGridSkeleton, CategoryListSkeleton } from '../../components/common';
import productImage from '../../assets/images/product.png';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    console.log('🔍 CategoryPage: useEffect triggered with categoryId:', categoryId);
    console.log('🔍 CategoryPage: categoryId type:', typeof categoryId);
    console.log('🔍 CategoryPage: categoryId is undefined?', categoryId === undefined);
    
    if (categoryId && categoryId !== 'undefined') {
      loadCategoryData();
    } else {
      console.error('❌ CategoryPage: Invalid categoryId:', categoryId);
      setError(`Invalid category ID: "${categoryId}". Please check the URL and try again.`);
      setLoading(false);
    }
  }, [categoryId]);

  // Debug products state changes
  useEffect(() => {
    console.log('🔍 CategoryPage: Products state changed:', {
      productsLength: products.length,
      products: products
    });
  }, [products]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('[data-dropdown]')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 CategoryPage: Loading category data for:', categoryId);
      console.log('🔍 CategoryPage: CategoryId type:', typeof categoryId);
      console.log('🔍 CategoryPage: CategoryId value:', JSON.stringify(categoryId));
      console.log('🔍 CategoryPage: API Base URL:', import.meta.env.VITE_API_BASE_URL);
      
      let response;
      
      // Check if categoryId is a UUID (which is what we expect from breadcrumb navigation)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
      
      if (isUUID) {
        // This is a valid UUID, use it directly with the API
        console.log('🔍 CategoryPage: Valid UUID detected, fetching category directly:', categoryId);
        response = await getCategoryWithProducts(categoryId);
      } else {
        // This might be a category name, try to find the category first
        console.log('🔍 CategoryPage: Non-UUID detected, treating as category name:', categoryId);
        
        const categoriesResponse = await getCategories();
        console.log('🔍 CategoryPage: Categories response:', categoriesResponse);
        
        if (!categoriesResponse || !categoriesResponse.data || !Array.isArray(categoriesResponse.data)) {
          throw new Error('Failed to fetch categories list');
        }
        
        // Try to find by name (case-insensitive)
        const category = categoriesResponse.data.find(cat => 
          cat.name.toLowerCase() === categoryId.toLowerCase()
        );
        
        if (!category) {
          throw new Error(`Category '${categoryId}' not found`);
        }
        
        console.log('🔍 CategoryPage: Found category:', category);
        response = await getCategoryWithProducts(category.id);
      }
      
      console.log('🔍 CategoryPage: Raw response from getCategoryWithProducts:', response);
      
      // Debug the response structure thoroughly
      console.log('🔍 CategoryPage: Raw response:', response);
      console.log('🔍 CategoryPage: Response type:', typeof response);
      console.log('🔍 CategoryPage: Response has data property:', 'data' in response);
      console.log('🔍 CategoryPage: Response.data:', response.data);
      
      // Based on API documentation, the response structure is:
      // { "data": { "id": "string", "name": "string", "products": [...] } }
      const categoryData = response.data;
      
      if (!categoryData) {
        throw new Error('Invalid response: missing category data');
      }
      
      if (!categoryData.id || !categoryData.name) {
        throw new Error('Invalid category data: missing required fields (id, name)');
      }
      
      console.log('🔍 CategoryPage: Category data:', categoryData);
      console.log('🔍 CategoryPage: Category data.products:', categoryData.products);
      console.log('🔍 CategoryPage: Category data.products type:', typeof categoryData.products);
      console.log('🔍 CategoryPage: Category data.products length:', categoryData.products?.length);
      
      setCategory(categoryData);
      setProducts(categoryData.products || []);
      
      console.log('✅ CategoryPage: Category data loaded:', categoryData);
      console.log('✅ CategoryPage: Products set:', categoryData.products || []);
    } catch (error) {
      console.error('❌ CategoryPage: Failed to load category data:', error);
      setError(error.message || 'Failed to load category data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortBy) => {
    console.log('🔍 CategoryPage: Sorting products, current count:', products.length);
    setSortBy(newSortBy);
    // Implement sorting logic here
    const sortedProducts = [...products];
    
    switch (newSortBy) {
      case 'price-low':
        sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Keep original order for 'relevance'
        break;
    }
    
    setProducts(sortedProducts);
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <ProductGridSkeleton count={12} viewMode={viewMode} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <button
            onClick={loadCategoryData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link
            to="/marketplace"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Marketplace
          </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
              <Link to="/marketplace" className="text-gray-500 hover:text-gray-700">
                  Marketplace
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                <span className="ml-4 text-gray-500">{category.name}</span>
                </div>
              </li>
            </ol>
          </nav>

      {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden mb-4">
          {/* Sort By for Mobile */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="relative flex-1 min-w-0" data-dropdown style={{ zIndex: openDropdown === 'sort' ? 50 : 40 }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'sort' ? null : 'sort');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors touch-manipulation"
                >
                  <span className="truncate">
                    {sortBy === 'relevance' ? 'Relevance' : 
                     sortBy === 'newest' ? 'Newest' :
                     sortBy === 'name' ? 'Name: A to Z' :
                     sortBy === 'price-low' ? 'Price: Low to High' :
                     sortBy === 'price-high' ? 'Price: High to Low' : 'Relevance'}
                  </span>
                  <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'sort' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Sort Options */}
                {openDropdown === 'sort' && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                    {[
                      { value: 'relevance', label: 'Relevance' },
                      { value: 'newest', label: 'Newest' },
                      { value: 'name', label: 'Name: A to Z' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSortChange(option.value);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 touch-manipulation ${
                          sortBy === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View Mode Toggle for Mobile */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex items-center gap-2">
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

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center justify-between mb-4">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="relative min-w-0" data-dropdown style={{ zIndex: openDropdown === 'sort' ? 50 : 40 }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'sort' ? null : 'sort');
                }}
                className="flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors min-w-[200px]"
              >
                <span className="truncate">
                  {sortBy === 'relevance' ? 'Relevance' : 
                   sortBy === 'newest' ? 'Newest' :
                   sortBy === 'name' ? 'Name: A to Z' :
                   sortBy === 'price-low' ? 'Price: Low to High' :
                   sortBy === 'price-high' ? 'Price: High to Low' : 'Relevance'}
                </span>
                <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'sort' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sort Options */}
              {openDropdown === 'sort' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {[
                    { value: 'relevance', label: 'Relevance' },
                    { value: 'newest', label: 'Newest' },
                    { value: 'name', label: 'Name: A to Z' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSortChange(option.value);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                        sortBy === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
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

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {category ? `There are no products in the "${category.name}" category yet.` : 'There are no products in this category yet.'}
            </p>
            <Link
              to="/marketplace"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className={`overflow-hidden ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' 
              : 'flex flex-col gap-4'
          }`}>
            {products.map((product) => (
              <div
                key={product.id}
                className={`block bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden min-w-0 ${
                  viewMode === 'list' ? 'flex flex-row items-center p-4 gap-4' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`block relative overflow-hidden flex-shrink-0 ${
                  viewMode === 'list' 
                    ? 'w-20 h-20 rounded-lg' 
                    : 'aspect-square rounded-t-lg'
                }`}>
                  <img 
                    src={product.imageUrls?.[0] || productImage} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = productImage; // Fallback to default image
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    <Link
                      to={`/product/${product.slug || product.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                    {product.name}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Stock: {product.stockQuantity}</span>
                  </div>
                  </div>

                  {viewMode === 'list' && (
                    <div className="mt-3">
                      <Link
                        to={`/product/${product.slug || product.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
