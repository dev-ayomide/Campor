import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import productImage from '../assets/images/product.png';
import profileImage from '../assets/images/profile.png';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Reviews');

  // Mock product data
  const product = {
    id: id,
    name: 'ICEORB Floating Bluetooth Speaker',
    price: 'N 25,000',
    originalPrice: 'N400.00',
    rating: 5,
    reviews: 11,
    description: 'Buy one or get a few and elevate every space with futuristic sound and style. Compact, wireless, and magically floating perfect for immersive music, anytime, anywhere.',
    measurements: '17 1/2 x 20 5/8 "',
    seller: {
      name: 'Fatima Abdullahi',
      shop: "Fatima's Finds",
      rating: 4.7,
      sales: 23,
      image: profileImage
    },
    images: [
      productImage,
      productImage,
      productImage,
      productImage
    ],
    colors: [
      { name: 'Black', color: '#1f2937' },
      { name: 'Blue', color: '#3b82f6' }
    ],
    badges: ['NEW', '-50%']
  };

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      user: 'Sofia Harvetz',
      avatar: profileImage,
      rating: 5,
      date: '3 weeks ago',
      comment: 'I bought it 3 weeks ago and now come back just to say "Awesome Product". I really enjoy it. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti et quas molestias excepturi sint non provident.'
    },
    {
      id: 2,
      user: 'Nicolas Jensen',
      avatar: profileImage,
      rating: 5,
      date: '3 weeks ago',
      comment: 'I bought it 3 weeks ago and now come back just to say "Awesome Product". I really enjoy it. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti et quas molestias excepturi sint non provident.'
    },
    {
      id: 3,
      user: 'Nicolas Jensen',
      avatar: profileImage,
      rating: 5,
      date: '3 weeks ago',
      comment: 'I bought it 3 weeks ago and now come back just to say "Awesome Product". I really enjoy it. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti et quas molestias excepturi sint non provident.'
    },
    {
      id: 4,
      user: 'Nicolas Jensen',
      avatar: profileImage,
      rating: 5,
      date: '3 weeks ago',
      comment: 'I bought it 3 weeks ago and now come back just to say "Awesome Product". I really enjoy it. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti et quas molestias excepturi sint non provident.'
    },
    {
      id: 5,
      user: 'Nicolas Jensen',
      avatar: profileImage,
      rating: 5,
      date: '3 weeks ago',
      comment: 'I bought it 3 weeks ago and now come back just to say "Awesome Product". I really enjoy it. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti et quas molestias excepturi sint non provident.'
    }
  ];

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0);
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span>›</span>
            <Link to="/marketplace" className="hover:text-gray-900 transition-colors">Market Place</Link>
            <span>›</span>
            <span className="text-gray-900">ICEORB Floating Bluetooth Speaker</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm">
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  NEW
                </div>
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -50%
                </div>
              </div>

              {/* Navigation Arrows */}
              <button 
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
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
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-blue-600 underline cursor-pointer">{product.reviews} Reviews</span>
            </div>

            {/* Product Name */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">{product.price}</span>
              <span className="text-lg text-gray-500 line-through">{product.originalPrice}</span>
            </div>

            {/* Measurements */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Measurements</h3>
              <p className="text-gray-600">{product.measurements}</p>
            </div>

            {/* Seller Info */}
            <div className="rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">About Seller</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={product.seller.image} 
                    alt={product.seller.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{product.seller.name}</p>
                    <p className="text-sm text-gray-600">{product.seller.shop}</p>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Message
                </button>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">{product.seller.rating}</span>
                <span className="text-sm text-gray-600">({product.seller.sales} sales)</span>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Choose Color</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      selectedColor === color.name ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">{selectedColor}</p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-medium min-w-[2rem] text-center">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-white border border-gray-300 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                  Add to Cart
                </button>
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
                <h2 className="text-xl font-bold text-gray-900">{product.reviews} Reviews</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Newest</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <img 
                        src={review.avatar} 
                        alt={review.user}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{review.user}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="hover:text-blue-600 transition-colors">Like</button>
                          <button className="hover:text-blue-600 transition-colors">Reply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Load more
                </button>
              </div>
            </div>
          )}

          {/* Additional Info Content */}
          {activeTab === 'Additional Info' && (
            <div className="py-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
              <p className="text-gray-600">Additional product information would go here...</p>
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
