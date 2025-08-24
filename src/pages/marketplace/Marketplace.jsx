import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import marketplaceImage from '../../assets/images/marketplace.png';
import productImage from '../../assets/images/product.png';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [productImageIndexes, setProductImageIndexes] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');

  // Mock data for categories
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

  // Mock data for products
  const mockProducts = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    name: 'Apple Iphone 13 Pro max purple',
    price: 'N3,500',
    originalPrice: 'N8,500',
    rating: 5,
    reviews: 128,
    images: [productImage, productImage, productImage], // Multiple images for navigation
    seller: "Fatima's Finds",
    condition: 'New',
    currentImageIndex: 0
  }));

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchQuery);
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
            {/* Products Grid/List */}
            <div className={`overflow-hidden ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' 
                : 'flex flex-col gap-4'
            }`}>
              {mockProducts.map((product) => {
                const currentImageIndex = getCurrentImageIndex(product.id);
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
                        src={product.images[currentImageIndex]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badges for list view - positioned differently */}
                      {viewMode === 'list' ? (
                        <div className="absolute top-1 left-1 flex flex-col gap-1">
                          <div className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded text-[10px]">
                            NEW
                          </div>
                          <div className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded text-[10px]">
                            -30%
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* NEW Badge */}
                          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            NEW
                          </div>
                          
                          {/* Discount Badge */}
                          <div className="absolute top-3 left-3 mt-8 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -30%
                          </div>
                        </>
                      )}
                      
                      {/* Image Navigation Arrows - Only for grid view */}
                      {product.images.length > 1 && viewMode === 'grid' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              handlePrevImage(product.id, product.images.length);
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
                              handleNextImage(product.id, product.images.length);
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
                      {product.images.length > 1 && viewMode === 'grid' && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {product.images.map((_, index) => (
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
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">{product.name}</h3>

                            {/* Price - Prominent */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-bold text-gray-900">{product.price}</span>
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
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                              Add to cart
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
                          <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg md:text-xl font-bold text-gray-900">{product.price}</span>
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
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 md:py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                              Add to cart
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
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center mt-12">
              <nav className="flex items-center gap-2">
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <span className="px-2 text-gray-400">...</span>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  10
                </button>
                
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
