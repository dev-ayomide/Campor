import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug, getSellerCatalogue } from '../../services/authService';
import { useCart } from '../../contexts/CartContext';
import { AddToCartButton } from '../../components/cart';
import { WishlistButton } from '../../components/wishlist';
import { ProductDetailSkeleton } from '../../components/common';
import { Star, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import productImage from '../../assets/images/product.png';
import profileImage from '../../assets/images/profile.png';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { checkProductInCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Reviews');
  const [addingToCart, setAddingToCart] = useState(false);
  const [sellerProfilePicture, setSellerProfilePicture] = useState(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 ProductDetail: Fetching product with slug:', slug);
        const response = await getProductBySlug(slug);
        
        if (response?.data) {
          setProduct(response.data);
          console.log('✅ ProductDetail: Product fetched successfully:', response.data);
          console.log('🔍 ProductDetail: Category data:', response.data.category);
          console.log('🔍 ProductDetail: Full product structure:', JSON.stringify(response.data, null, 2));
          
          // Check if category exists and has required fields
          if (response.data.category) {
            console.log('🔍 ProductDetail: Category ID:', response.data.category.id);
            console.log('🔍 ProductDetail: Category name:', response.data.category.name);
            console.log('🔍 ProductDetail: Category ID type:', typeof response.data.category.id);
          } else if (response.data.categoryId) {
            console.log('🔍 ProductDetail: Found categoryId field:', response.data.categoryId);
            console.log('🔍 ProductDetail: Attempting to fetch category details...');
            
            // Try to fetch category details if only categoryId is available
            try {
              const { getCategoryWithProducts } = await import('../../services/categoryService');
              const categoryResponse = await getCategoryWithProducts(response.data.categoryId);
              if (categoryResponse?.data) {
                response.data.category = {
                  id: categoryResponse.data.id,
                  name: categoryResponse.data.name
                };
                console.log('✅ ProductDetail: Category details fetched and added:', response.data.category);
              }
            } catch (categoryError) {
              console.warn('⚠️ ProductDetail: Failed to fetch category details:', categoryError);
            }
          } else {
            console.warn('⚠️ ProductDetail: No category data found in product');
          }
        } else {
          throw new Error('Product not found');
        }
      } catch (err) {
        console.error('❌ ProductDetail: Failed to fetch product:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Fetch seller profile picture if not available in product data
  useEffect(() => {
    const fetchSellerProfilePicture = async () => {
      if (product?.seller?.id && !product.seller.user?.profilePicture) {
        try {
          const catalogueData = await getSellerCatalogue(product.seller.id);
          if (catalogueData.seller?.user?.profilePicture) {
            setSellerProfilePicture(catalogueData.seller.user.profilePicture);
          }
        } catch (error) {
          console.log('Failed to fetch seller profile picture:', error);
        }
      }
    };

    if (product?.seller?.id) {
      fetchSellerProfilePicture();
    }
  }, [product?.seller?.id]);

  // Handle add to cart (no longer needed; using AddToCartButton controls per item)

  // Check if product is in cart
  const isInCart = product ? checkProductInCart(product.id) : false;

  // Format price
  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handlePrevImage = () => {
    if (!product?.imageUrls || product.imageUrls.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : product.imageUrls.length - 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNextImage = () => {
    if (!product?.imageUrls || product.imageUrls.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex(prev => prev < product.imageUrls.length - 1 ? prev + 1 : 0);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleThumbnailClick = (index) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!product?.imageUrls || product.imageUrls.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product?.imageUrls, isTransitioning]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  // Loading state
  if (loading) {
    return <ProductDetailSkeleton />;
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-4">
              {error || 'Product not found'}
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 overflow-hidden">
            <Link to="/marketplace" className="hover:text-blue-600 transition-colors">
              Marketplace
            </Link>
            <span>/</span>
            {(product.category?.id || product.categoryId) && (
              <>
                <Link 
                  to={`/category/${product.category?.id || product.categoryId}`} 
                  className="hover:text-blue-600 transition-colors truncate max-w-[120px] sm:max-w-none"
                  onClick={() => {
                    console.log('🔍 ProductDetail: Breadcrumb clicked, category data:', product.category);
                    console.log('🔍 ProductDetail: Category ID:', product.category?.id || product.categoryId);
                    console.log('🔍 ProductDetail: Category name:', product.category?.name);
                    console.log('🔍 ProductDetail: Product categoryId field:', product.categoryId);
                  }}
                >
                  {product.category?.name || 'Category'}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image Container */}
            <div className="relative group">
              <div 
                className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img 
                  src={product.imageUrls?.[currentImageIndex] || productImage} 
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isTransitioning ? 'opacity-70 scale-105' : 'opacity-100 scale-100'
                  }`}
                />
                
                {/* Image Counter - Only show if multiple images */}
                {product.imageUrls && product.imageUrls.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {product.imageUrls.length}
                  </div>
                )}
                
                {/* Navigation Arrows - Only show if multiple images */}
                {product.imageUrls && product.imageUrls.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      disabled={isTransitioning}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      disabled={isTransitioning}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}
                
                {/* Loading Overlay */}
                {isTransitioning && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>


            {/* Thumbnail Images - Only show if multiple images */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Product Images</h3>
                  <span className="text-xs text-gray-500">
                    {product.imageUrls.length} {product.imageUrls.length === 1 ? 'image' : 'images'}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2 sm:gap-3">
                  {product.imageUrls.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      disabled={isTransitioning}
                      className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 disabled:cursor-not-allowed ${
                        currentImageIndex === index 
                          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} ${index + 1}`}
                        className={`w-full h-full object-cover transition-all duration-200 ${
                          currentImageIndex === index ? 'scale-105' : 'scale-100'
                        }`}
                      />
                      
                      {/* Active indicator */}
                      {currentImageIndex === index && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Navigation hints */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ChevronLeft className="w-3 h-3" />
                    Swipe or click to navigate
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">←</kbd>
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">→</kbd>
                    Keyboard
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Name */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Category */}
            {product.category && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
                <p className="text-gray-600">{product.category.name}</p>
              </div>
            )}

            {/* Seller Info */}
            {product.seller && (
              <div className="rounded-lg ">
                <h3 className="text-sm font-medium text-gray-900 mb-4">About Seller</h3>
                <div className="space-y-4">
                  {/* Seller Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(product.seller.user?.profilePicture || sellerProfilePicture) ? (
                        <img 
                          src={product.seller.user?.profilePicture || sellerProfilePicture} 
                          alt={product.seller.catalogueName || 'Seller'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-medium text-gray-600">
                          {product.seller.catalogueName?.charAt(0) || 'S'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-base truncate">
                        {product.seller.catalogueName || 'Unknown Seller'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        Seller ID: {product.seller.id?.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link 
                      to={`/seller/${product.seller.id}/catalogue`}
                      className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border border-gray-300 text-center"
                    >
                      View Store
                    </Link>
                    <button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      onClick={() => {
                        // Navigate to chat with this seller
                        navigate(`/chat?sellerId=${product.seller.id}`);
                      }}
                    >
                      Message
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              {/* Unified quantity-aware cart control */}
              <div className="flex flex-col sm:flex-row gap-3">
                <WishlistButton 
                  productId={product.id} 
                  showText={true}
                  className="flex-1 py-3 px-6"
                />
                <div className="flex-1">
                  <AddToCartButton 
                    productId={product.id} 
                    sellerId={product.seller?.id}
                    className="w-full"
                    roundedStyle="lg"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {['Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Reviews Content */}
          {activeTab === 'Reviews' && (
            <div className="py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {product.ratings?.length || 0} Reviews
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Newest</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {product.ratings && product.ratings.length > 0 ? (
                <div className="space-y-6">
                  {product.ratings.map((rating, index) => (
                    <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {rating.user?.firstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {rating.user?.firstName || 'Anonymous User'}
                            </h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">{rating.review}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatDate(rating.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}