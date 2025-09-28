import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Copy, Check, Star, Clock, Award, Package, Search } from 'lucide-react';
import { ChatIcon } from '../../components/common';
import filterIcon from '../../../public/filter.svg';
import { getSellerCatalogue, getSellerUserId, getSellerUserIdWithFallback } from '../../services/authService';
import { AddToCartButton } from '../../components/cart';
import { WishlistButton } from '../../components/wishlist';
import { ProductGridSkeleton } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { debouncedSearch } from '../../services/algoliaService';
import SearchHighlight from '../../components/search/SearchHighlight';

export default function SellerCatalogue() {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('[data-dropdown]')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  useEffect(() => {
    const fetchSellerCatalogue = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getSellerCatalogue(sellerId);
        setSellerData(data.seller);
        setProducts(data.products || []);
        
        console.log('✅ Seller Catalogue: Data fetched successfully:', data);
      } catch (err) {
        console.error('❌ Seller Catalogue: Failed to fetch data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerCatalogue();
    }
  }, [sellerId]);

  // Get unique categories from products
  const categories = ['All', ...new Set(products.map(product => product.category?.name).filter(Boolean))];

  // Filter products by category, search query, and status (only show ACTIVE products)
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category?.name === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = product.status === 'ACTIVE' || (!product.status && product.stockQuantity > 0);
    return matchesCategory && matchesSearch && isActive;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'rating':
        const aRating = a.averageRating || getAverageRating(a.ratings);
        const bRating = b.averageRating || getAverageRating(b.ratings);
        return bRating - aRating;
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Copy catalogue link
  const handleCopyLink = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Handle search input change
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <ProductGridSkeleton count={9} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className=" p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Seller Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              to="/marketplace" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Full-width Cover Photo Section */}
      <section className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
        {/* Cover Photo/Banner - Full Screen Width */}
        {sellerData?.catalogueCover ? (
          <img 
            src={sellerData.catalogueCover} 
            alt="Catalogue Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-teal-400 to-teal-600"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </section>

      {/* Profile Info Card - Responsive positioning */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32 -mt-20 sm:-mt-24 md:-mt-32 relative z-10">
        <div className="flex justify-center lg:justify-start">
          {/* White Card Container with responsive sizing */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none">
          {/* Main Content Row - Mobile: vertical, Desktop: horizontal */}
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            {/* Profile Picture */}
            <div className="w-20 h-20 sm:w-20 sm:h-20 bg-white rounded-full p-1 shadow-lg flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {sellerData?.user?.profilePicture ? (
                      <img 
                        src={sellerData.user.profilePicture} 
                        alt={sellerData.user.name || sellerData.catalogueName} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        {sellerData?.user?.name?.charAt(0) || sellerData?.catalogueName?.charAt(0) || 'S'}
                      </span>
                    )}
                  </div>
                </div>

            {/* Content Area - Mobile: centered, Desktop: left-aligned */}
            <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              {/* Seller Info */}
              <div className="flex-1 text-center sm:text-left">
                    {/* Store Name */}
                <h1 className="text-xl sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                      {sellerData?.catalogueName || 'Store Name'}
                    </h1>
                    
                    {/* Seller Name */}
                <p className="text-base sm:text-base text-gray-600 mb-1">
                      by {sellerData?.user?.name || 'Seller Name'}
                    </p>
                    
                    {/* Rating and Sales */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-base font-semibold text-gray-900">
                    {sellerData?.averageRating || '4.7'}
                        </span>
                  <span className="text-gray-500 text-sm">
                    ({sellerData?.productCount || products.length} sales)
                        </span>
                      </div>
                    
                    {/* Description */}
                <p className="text-gray-700 text-sm leading-relaxed">
                  {sellerData?.storeDescription || 'Premium electronics and gadgets with authentic warranties. Specializing in phones, laptops, and accessories.'}
                      </p>
                  </div>
                  
              {/* Action Buttons - Mobile: centered, Desktop: right-aligned */}
                  {user?.seller?.id !== sellerId && (
                <div className="flex flex-col gap-3 items-center sm:items-end">
                      <button 
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap text-sm touch-manipulation"
                        onClick={async () => {
                          try {
                            // Get seller's user ID for chat with fallback
                            const sellerUserId = await getSellerUserIdWithFallback(sellerId);
                            // Navigate to chat with seller's user ID
                            navigate(`/chat?sellerId=${sellerUserId}`);
                          } catch (error) {
                            console.error('Failed to get seller user ID:', error);
                            // Show error message
                            alert(`Unable to start chat: ${error.message}. Please try refreshing the page or contact support.`);
                          }
                        }}
                      >
                    <ChatIcon className="w-4 h-4" />
                        Message {sellerData?.catalogueName || 'Seller'}
                      </button>
                      
                      {/* Drop a Star rating section */}
                      <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Drop a Star</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                          className="text-yellow-400 hover:text-yellow-500 transition-colors touch-manipulation p-1"
                              onClick={() => {
                                // TODO: Implement rating functionality
                                alert(`You rated ${star} stars!`);
                              }}
                            >
                          <Star className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
        </div>
      </div>

          {/* Stats Section - Responsive grid */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
            <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Products</h3>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{sellerData?.productCount || products.length}</p>
            </div>
            <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Response Time</h3>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">&lt; 1 hour</p>
            </div>
            <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Member Since</h3>
                <p className="text-xs sm:text-sm lg:text-xl font-bold text-gray-900">
                  {sellerData?.createdAt ? new Date(sellerData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2022'}
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32 mt-6 sm:mt-8 pb-6">
        <div className=" rounded-xl shadow-sm">
          {/* Mobile Filter Toolbar - Improved layout */}
          <div className="lg:hidden p-3 sm:p-4 border-b border-gray-200">
            {/* Search Input - Full width on mobile */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm touch-manipulation"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="flex items-center justify-between gap-3">
              {/* Filter Label and Sort */}
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <img src={filterIcon} alt="Filter" className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-900">Filter</span>
                </div>
                
                {/* Sort Dropdown */}
                <div className="relative flex-1 min-w-0" data-dropdown style={{ zIndex: openDropdown === 'sort' ? 50 : 40 }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'sort' ? null : 'sort');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:border-gray-400 transition-colors touch-manipulation"
                  >
                    <span className="truncate">
                      {sortBy === 'newest' ? 'Newest' :
                       sortBy === 'oldest' ? 'Oldest' :
                       sortBy === 'price-low' ? 'Price: Low to High' :
                       sortBy === 'price-high' ? 'Price: High to Low' :
                       sortBy === 'rating' ? 'Highest Rated' : 'Newest'}
                    </span>
                    <svg className={`w-3 h-3 transition-transform flex-shrink-0 ml-1 ${openDropdown === 'sort' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Sort Options */}
                  {openDropdown === 'sort' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                      {[
                        { value: 'newest', label: 'Newest' },
                        { value: 'oldest', label: 'Oldest' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' },
                        { value: 'rating', label: 'Highest Rated' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSortBy(option.value);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors touch-manipulation`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors touch-manipulation`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden lg:block p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Search Input */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Sort By */}
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
                          {sortBy === 'newest' ? 'Newest' :
                           sortBy === 'oldest' ? 'Oldest' :
                           sortBy === 'price-low' ? 'Price: Low to High' :
                           sortBy === 'price-high' ? 'Price: High to Low' :
                           sortBy === 'rating' ? 'Highest Rated' : 'Newest'}
                        </span>
                        <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${openDropdown === 'sort' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Sort Options */}
                      {openDropdown === 'sort' && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                          {[
                            { value: 'newest', label: 'Newest' },
                            { value: 'oldest', label: 'Oldest' },
                            { value: 'price-low', label: 'Price: Low to High' },
                            { value: 'price-high', label: 'Price: High to Low' },
                            { value: 'rating', label: 'Highest Rated' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSortBy(option.value);
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
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Category Filter */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {sortedProducts.length > 0 ? (
            <div className={`overflow-hidden ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' 
                : 'flex flex-col gap-4'
            }`}>
                {sortedProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.slug}`} className={`block bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden min-w-0 ${
                    viewMode === 'list' ? 'flex flex-row items-center p-4 gap-4' : ''
                  }`}>
                    {/* Product Image with Navigation */}
                    <div className={`block relative overflow-hidden flex-shrink-0 ${
                      viewMode === 'list' 
                        ? 'w-20 h-20 rounded-lg' 
                        : 'aspect-square rounded-t-lg'
                    }`}>
                        <img
                          src={product.imageUrls?.[0] || '/placeholder-product.png'}
                          alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.png';
                        }}
                        />
                        
                      {/* Stock Status Badge - Only for grid view */}
                        {product.stockQuantity <= 0 && viewMode === 'grid' && (
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
                            {/* Rating Stars - Smaller for list view */}
                            <div className="flex items-center gap-0.5 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>

                            {/* Product Name - Compact with highlighting */}
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight flex-1">
                                <SearchHighlight 
                                  text={product.name} 
                                  highlight={searchQuery} 
                                  className="text-sm font-semibold text-gray-900"
                                />
                              </h3>
                              {/* Out of Stock Badge for list view */}
                              {product.stockQuantity <= 0 && (
                                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                  Out of Stock
                                </div>
                              )}
                            </div>

                            {/* Price - Prominent */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                              {product.stockQuantity > 0 && (
                                <span className="text-xs text-gray-500">
                                  {product.stockQuantity} left
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons - Bottom aligned */}
                          <div className="flex gap-2 items-center">
                            <div className={`flex-1 ${product.stockQuantity === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                              <AddToCartButton productId={product.id} className="w-full" />
                            </div>
                            <WishlistButton 
                              productId={product.id}
                              className="flex-shrink-0"
                            />
                          </div>
                        </div>
                      ) : (
                        // Grid View Layout
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
                              text={product.name} 
                              highlight={searchQuery} 
                              className="text-sm md:text-base font-medium text-gray-900"
                            />
                          </h3>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg md:text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                            {product.stockQuantity > 0 && (
                              <span className="text-xs text-gray-500">
                                {product.stockQuantity} left
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <div className={`flex-1 ${product.stockQuantity === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                              <AddToCartButton productId={product.id} className="w-full" />
                            </div>
                            <WishlistButton 
                              productId={product.id}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery.trim() 
                    ? `No products found for "${searchQuery}"` 
                    : 'No Products Available'
                  }
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery.trim() 
                    ? 'Try adjusting your search terms or filters'
                    : selectedCategory === 'All' 
                    ? 'This seller hasn\'t added any products to their catalogue yet.' 
                    : `No products found in "${selectedCategory}" category.`
                  }
                </p>
                {(selectedCategory !== 'All' || searchQuery.trim()) && (
                  <div className="flex gap-2 justify-center">
                    {searchQuery.trim() && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Clear Search
                      </button>
                    )}
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View All Products
                  </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
