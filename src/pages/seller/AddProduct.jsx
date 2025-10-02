import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { addProductToCatalogue, getCategoriesOnly, verifySellerExists } from '../../services/authService';
import { formatPriceInput, parsePrice, formatPrice } from '../../utils/formatting';
import { ImageUpload, Breadcrumb } from '../../components/common';

export default function AddProductPage({ toggleMobileMenu }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    imageUrls: []
  });
  const [formattedPrice, setFormattedPrice] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoriesOnly();
        
        // Handle different response structures
        const categories = categoriesData.data || categoriesData || [];
        
        setCategories(Array.isArray(categories) ? categories : []);
      } catch (err) {
        setError('Failed to load categories');
        setCategories([]); // Set empty array as fallback
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Format the input value with commas
      const formatted = formatPriceInput(value);
      setFormattedPrice(formatted);
      
      // Store the numeric value for form submission
      const numericValue = parsePrice(formatted);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImagesChange = (imageUrls) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        imageUrls
      };
      return newData;
    });
    // Reset image index when images change
    setCurrentImageIndex(0);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? formData.imageUrls.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === formData.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const handleNext = (e) => {
    e.preventDefault();
    
    if (formData.name && formData.description && formData.price && formData.stockQuantity && formData.categoryId && formData.imageUrls.length > 0) {
      setCurrentStep(2);
    } else {
      // Show which fields are missing
      const missingFields = [];
      if (!formData.name) missingFields.push('Product Name');
      if (!formData.description) missingFields.push('Description');
      if (!formData.price) missingFields.push('Price');
      if (!formData.stockQuantity) missingFields.push('Stock Quantity');
      if (!formData.categoryId) missingFields.push('Category');
      if (formData.imageUrls.length === 0) missingFields.push('At least 1 image');
      
      setError(`Please fill in: ${missingFields.join(', ')}`);
    }
  };

  const handlePublish = async () => {
    if (!user?.seller?.id) {
      setError('Seller information not found');
      return;
    }

    // Additional validation
    if (!user.seller?.id || user.seller.id === '') {
      setError('Invalid seller ID - please ensure you are properly registered as a seller');
      return;
    }

    if (user.role !== 'SELLER') {
      setError('You are not registered as a seller. Please complete seller registration first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First verify seller exists in backend
      await verifySellerExists(user.seller.id);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stockQuantity: formData.stockQuantity,
        categoryId: formData.categoryId,
        imageUrls: formData.imageUrls
      };

      
      await addProductToCatalogue(user.seller.id, productData);
      
      navigate('/seller/products');
    } catch (err) {
      
      // Provide more specific error messages
      if (err.message.includes('Unauthorized') || err.message.includes('403')) {
        setError('You are not authorized to create products. Please ensure you are properly registered as a seller.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-2xl mx-auto overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/seller/dashboard' },
            { label: 'Products', href: '/seller/products' },
            { label: 'Add Product' }
          ]} 
        />

        {currentStep === 1 ? (
          // Step 1: Product Details Form
          <>
            {/* Header */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
              <h1 className="text-lg font-medium text-gray-900">Add a new product</h1>
            </div>

            <div className="text-sm text-gray-600 mb-6">
              Fill in the details below. Your product will be visible to all Campor users.
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Error:</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleNext} className="space-y-6">
              {/* Add Photo Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Photo</h3>
                <p className="text-sm text-gray-600 mb-4">Add at least 1 photo for this product. You can reorder images by dragging them or using the arrow buttons.</p>
                
                <ImageUpload
                  images={formData.imageUrls}
                  onImagesChange={handleImagesChange}
                  maxImages={3}
                  disabled={loading}
                  uploadOptions={{
                    folder: 'samples/ecommerce'
                    // Remove public_id to let Cloudinary auto-generate unique IDs
                  }}
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-2">Product Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. HP Laptop 15"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pl-12"
                    required
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-2">Description</label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief Description"
                    rows="4"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none pl-12"
                    required
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-2">Category</label>
                <div className="relative">
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pl-12 appearance-none"
                    required
                  >
                    <option value="">Select a category</option>
                    {Array.isArray(categories) && categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <svg className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-2">Price</label>
                <div className="relative">
                  <input
                    type="text"
                    name="price"
                    value={formattedPrice}
                    onChange={handleInputChange}
                    placeholder="e.g. 25,000.00"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pl-12"
                    required
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₦</span>
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-2">Stock Quantity</label>
                <div className="relative">
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="e.g. 10"
                    min="0"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pl-12"
                    required
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors"
              >
                Next
              </button>
            </form>
          </>
        ) : (
          // Step 2: Product Preview
          <>
            {/* Header */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
              <h1 className="text-lg font-medium text-gray-900">Add a new product</h1>
            </div>

            {/* Product Preview Card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
              {/* Product Image Carousel */}
              <div className="relative h-64 bg-gray-100">
                {formData.imageUrls.length > 0 ? (
                  <>
                    <img 
                      src={formData.imageUrls[currentImageIndex]} 
                      alt={`Product ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation arrows - only show if multiple images */}
                    {formData.imageUrls.length > 1 && (
                      <>
                        <button 
                          onClick={handlePreviousImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button 
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* Image counter */}
                    {formData.imageUrls.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {formData.imageUrls.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">No images</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Dot indicators */}
              {formData.imageUrls.length > 1 && (
                <div className="flex justify-center py-3 space-x-2 bg-gray-50">
                  {formData.imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {/* Product Details */}
              <div className="p-4">
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  {formatPrice(formData.price)}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{formData.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
                <p className="text-sm text-gray-500 mb-4">Stock: {formData.stockQuantity} units</p>
                
                {/* Seller Info */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">{user?.seller?.catalogueName || 'Your Store'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePublish}
                disabled={loading}
                className={`w-full font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center ${
                  loading 
                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Product (Draft)'
                )}
              </button>
              
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-4 px-6 rounded-lg transition-colors"
              >
                Back to Edit
              </button>
            </div>
          </>
        )}
      </div>
    </SellerLayout>
  );
}
