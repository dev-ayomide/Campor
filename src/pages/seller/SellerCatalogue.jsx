import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageCircle, Copy, Check, Star, Clock, Award, Package, Search } from 'lucide-react';
import { getSellerCatalogue } from '../../services/authService';
import { AddToCartButton } from '../../components/cart';
import { WishlistButton } from '../../components/wishlist';
import { useAuth } from '../../context/AuthContext';
import { debouncedSearch } from '../../services/algoliaService';
import SearchHighlight from '../../components/search/SearchHighlight';

export default function SellerCatalogue() {
  const { sellerId } = useParams();
  const { user } = useAuth();
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

  // Filter products by category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category?.name === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
      <div className="min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading seller catalogue...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className=" rounded-xl shadow-sm p-8 text-center">
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
      {/* Full-width Cover Photo Section - Breaks out of container */}
      <div className="relative w-screen h-80 md:h-96 -mx-4 md:-mx-8 lg:-mx-16 xl:-mx-32">
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
        
        {/* Back Button - Positioned over cover photo */}
        <div className="absolute top-4 left-4 z-20">
          <Link 
            to="/marketplace" 
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
        </div>
      </div>
        
      {/* Profile Info Card - Positioned higher */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        {/* White Card Container with rounded corners */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Main Content Row */}
          <div className="flex items-start gap-4">
            {/* Profile Picture - Left side */}
            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg flex-shrink-0">
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

            {/* Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Left Column - Seller Info */}
              <div className="flex-1">
                {/* Store Name */}
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {sellerData?.catalogueName || 'Store Name'}
                </h1>
                
                {/* Seller Name */}
                <p className="text-base text-gray-600 mb-1">
                  by {sellerData?.user?.name || 'Seller Name'}
                </p>
                
                {/* Rating and Sales */}
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-base font-semibold text-gray-900">
                    {sellerData?.averageRating || '4.7'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({sellerData?.productCount || products.length} sales)
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-gray-700 text-sm max-w-2xl leading-relaxed">
                  {sellerData?.storeDescription || 'Premium electronics and gadgets with authentic warranties. Specializing in phones, laptops, and accessories.'}
                </p>
              </div>
              
              {/* Right Column - Action Buttons - Only show if user is not the seller */}
              {user?.seller?.id !== sellerId && (
                <div className="flex flex-col gap-3">
                  <button 
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap text-sm"
                    onClick={() => {
                      // TODO: Implement messaging functionality
                      alert('Messaging feature coming soon!');
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message Seller
                  </button>
                  
                  {/* Drop a Star rating section */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Drop a Star</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className="text-yellow-400 hover:text-yellow-500 transition-colors"
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

          {/* Stats Section - Integrated into the main card */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Products</h3>
                <p className="text-xl font-bold text-gray-900">{sellerData?.productCount || products.length}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Response Time</h3>
                <p className="text-xl font-bold text-gray-900">&lt; 1 hour</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Member Since</h3>
                <p className="text-xl font-bold text-gray-900">
                  {sellerData?.createdAt ? new Date(sellerData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2022'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className=" rounded-xl shadow-sm">
          {/* Mobile Filter Toolbar */}
          <div className="lg:hidden p-4 border-b border-gray-200">
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

            {/* Search Input for Mobile */}
            <div className="mb-3">
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

            {/* Sort By for Mobile */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="relative flex-1 min-w-0" data-dropdown style={{ zIndex: openDropdown === 'sort' ? 50 : 40 }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'sort' ? null : 'sort');
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'sort' ? null : 'sort');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors touch-manipulation"
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
                        onTouchStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSortBy(option.value);
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

          <div className="p-6">
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
                      
                      {/* Stock Status Badge */}
                      {product.stockQuantity <= 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Out of Stock
                        </div>
                      )}
                      
                      {/* Wishlist Button - Only show if user is not the seller */}
                      {user?.seller?.id !== sellerId && (
                        <div className="absolute top-2 right-2">
                          <WishlistButton 
                            productId={product.id}
                            className="bg-white bg-opacity-80 hover:bg-opacity-100"
                          />
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
                            {product.ratings && product.ratings.length > 0 && (
                              <div className="flex items-center gap-0.5 mb-1">
                                {renderStars(getAverageRating(product.ratings))}
                                <span className="text-xs text-gray-500 ml-1">
                                  ({product.ratings.length})
                                </span>
                              </div>
                            )}

                            {/* Product Name - Compact with highlighting */}
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                              <SearchHighlight 
                                text={product.name} 
                                highlight={searchQuery} 
                                className="text-sm font-semibold text-gray-900"
                              />
                            </h3>

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
                            {product.stockQuantity === 0 ? (
                              <button disabled className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-gray-400 text-white cursor-not-allowed">Out of Stock</button>
                            ) : user?.seller?.id !== sellerId ? (
                              <div className="flex-1">
                                <AddToCartButton productId={product.id} className="w-full" />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        // Grid View Layout
                        <div>
                          {/* Rating Stars */}
                          {product.ratings && product.ratings.length > 0 && (
                            <div className="flex items-center gap-0.5 mb-2">
                              <div className="flex items-center">
                                {renderStars(getAverageRating(product.ratings))}
                              </div>
                              <span className="text-xs text-gray-500 ml-1">
                                ({product.ratings.length})
                              </span>
                            </div>
                          )}

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
                            {product.stockQuantity === 0 ? (
                              <button disabled className="flex-1 py-2.5 md:py-2 px-3 rounded-lg text-sm font-medium bg-gray-400 text-white cursor-not-allowed">Out of Stock</button>
                            ) : user?.seller?.id !== sellerId ? (
                              <div className="flex-1">
                                <AddToCartButton productId={product.id} className="w-full" />
                              </div>
                            ) : null}
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