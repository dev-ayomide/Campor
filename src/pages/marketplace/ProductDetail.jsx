import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug } from '../../services/authService';
import { useCart } from '../../contexts/CartContext';
import { AddToCartButton } from '../../components/cart';
import { Star, ChevronLeft, ChevronRight, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import productImage from '../../assets/images/product.png';
import profileImage from '../../assets/images/profile.png';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { checkProductInCart, getCartItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Reviews');

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

  // Check if product is in cart and get cart item details
  const isInCart = product ? checkProductInCart(product.id) : false;
  const cartItem = product ? getCartItem(product.id) : null;
  const cartQuantity = cartItem?.quantity || 0;

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
    if (!product?.imageUrls) return;
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : product.imageUrls.length - 1);
  };

  const handleNextImage = () => {
    if (!product?.imageUrls) return;
    setCurrentImageIndex(prev => prev < product.imageUrls.length - 1 ? prev + 1 : 0);
  };



  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <span className="mt-4 text-gray-600 font-medium">Loading product details...</span>
            <span className="mt-1 text-sm text-gray-500">This might take a moment</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/marketplace" className="hover:text-blue-600 transition-colors">
              Marketplace
            </Link>
            <span>/</span>
            {product.category && (
              <>
                <Link 
                  to={`/category/${product.category.id}`} 
                  className="hover:text-blue-600 transition-colors"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm">
              <img 
                src={product.imageUrls?.[currentImageIndex] || productImage} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows - Only show if multiple images */}
              {product.imageUrls && product.imageUrls.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images - Only show if multiple images */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.imageUrls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
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
              <div className="rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">About Seller</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {product.seller.catalogueName?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.seller.catalogueName || 'Unknown Seller'}</p>
                      <p className="text-sm text-gray-600">Seller ID: {product.seller.id?.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Message
                  </button>
                </div>
              </div>
            )}

            {/* Cart Status and Actions */}
            <div className="space-y-4">
              {/* Show current cart quantity if product is in cart */}
              {isInCart && cartQuantity > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                      You have {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'} of this product in your cart
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-white border border-gray-300 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Wishlist
                </button>
                
                {product.stockQuantity <= 0 ? (
                  <button 
                    disabled
                    className="flex-1 bg-gray-400 text-white py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <div className="flex-1">
                    <AddToCartButton 
                      productId={product.id} 
                      className="w-full py-3 px-6 font-medium"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Free shipping on orders over ₦50,000</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Secure payment</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {['Additional Info', 'Questions', 'Reviews'].map((tab) => (
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

          {/* Additional Info Content */}
          {activeTab === 'Additional Info' && (
            <div className="py-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Product Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Product Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product ID:</span>
                      <span className="font-medium">{product.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{product.category?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock Quantity:</span>
                      <span className="font-medium">{product.stockQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatPrice(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(product.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{formatDate(product.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Seller Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seller ID:</span>
                      <span className="font-medium">{product.seller?.id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Catalogue Name:</span>
                      <span className="font-medium">{product.seller?.catalogueName || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Content */}
          {activeTab === 'Questions' && (
            <div className="py-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Questions</h2>
              <p className="text-gray-600">Product questions and answers would go here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}