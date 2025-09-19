import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { updateProductInCatalogue, getSellerProducts, getProductById, getCategoriesOnly } from '../../services/authService';
import { getCategories } from '../../services/categoryService';
import { formatPriceInput, parsePrice, formatPrice } from '../../utils/formatting';
import { Skeleton } from '../../components/common';

const EditProduct = ({ toggleMobileMenu }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    files: [] // New files to upload
  });
  
  // Track existing images separately
  const [existingImages, setExistingImages] = useState([]);
  const [formattedPrice, setFormattedPrice] = useState('');
  
  // Available categories
  const [categories, setCategories] = useState([]);
  
  // Current product data
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Image previews
  const [imagePreviews, setImagePreviews] = useState([]);

  // Fetch product data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔍 EditProduct: Fetching data for product ID:', productId);
        
        // Fetch categories using the correct endpoint
        try {
          console.log('🔍 EditProduct: Fetching categories...');
          const categoriesData = await getCategoriesOnly();
          console.log('🔍 EditProduct: Categories response:', categoriesData);
          
          // The API returns { data: [...] } structure
        const categoriesList = categoriesData.data || categoriesData || [];
          console.log('🔍 EditProduct: Categories list:', categoriesList);
          
          if (Array.isArray(categoriesList)) {
            setCategories(categoriesList);
            console.log('✅ EditProduct: Categories loaded:', categoriesList.length);
          } else {
            console.error('❌ EditProduct: Categories is not an array:', categoriesList);
            setCategories([]);
          }
        } catch (categoryError) {
          console.error('❌ EditProduct: Failed to fetch categories:', categoryError);
          setCategories([]);
        }
        
        // Try to fetch product directly by ID first
        try {
          console.log('🔍 EditProduct: Attempting to fetch product by ID...');
          const productData = await getProductById(productId);
          console.log('✅ EditProduct: Product fetched by ID:', productData);
          
          if (productData) {
            setCurrentProduct(productData);
            console.log('🔍 EditProduct: Product data structure:', productData);
            console.log('🔍 EditProduct: Product data keys:', Object.keys(productData));
            
            setFormData({
              name: productData.name || '',
              description: productData.description || '',
              price: productData.price || '',
              stockQuantity: productData.stockQuantity || '',
              categoryId: productData.category?.id || '',
              files: []
            });
            // Set formatted price for display
            setFormattedPrice(formatPriceInput(productData.price || ''));
            
            // Set current images as previews and track existing images
            if (productData.imageUrls && productData.imageUrls.length > 0) {
              setImagePreviews(productData.imageUrls);
              setExistingImages(productData.imageUrls);
            }
            console.log('✅ EditProduct: Form data populated successfully');
            return;
          }
        } catch (idError) {
          console.log('⚠️ EditProduct: Failed to fetch by ID, trying fallback method:', idError.message);
          console.log('⚠️ EditProduct: Full error details:', idError);
        }
        
        // Fallback: Fetch seller products to get current product data
        if (user?.seller?.id) {
          console.log('🔍 EditProduct: Using fallback method - fetching seller products...');
          const productsData = await getSellerProducts(user.seller.id);
          console.log('🔍 EditProduct: All seller products:', productsData);
          console.log('🔍 EditProduct: Looking for product ID:', productId);
          console.log('🔍 EditProduct: Available product IDs:', productsData.map(p => ({ id: p.id, name: p.name })));
          
          const product = productsData.find(p => p.id === productId);
          console.log('🔍 EditProduct: Found product:', product);
          
          if (product) {
            setCurrentProduct(product);
            console.log('🔍 EditProduct: Fallback product data structure:', product);
            console.log('🔍 EditProduct: Fallback product data keys:', Object.keys(product));
            
            setFormData({
              name: product.name || '',
              description: product.description || '',
              price: product.price || '',
              stockQuantity: product.stockQuantity || '',
              categoryId: product.category?.id || '',
              files: []
            });
            // Set formatted price for display
            setFormattedPrice(formatPriceInput(product.price || ''));
            
            // Set current images as previews
            if (product.imageUrls && product.imageUrls.length > 0) {
              setImagePreviews(product.imageUrls);
            }
            console.log('✅ EditProduct: Form data populated via fallback');
          } else {
            console.error('❌ EditProduct: Product not found in seller products');
            console.error('❌ EditProduct: Available products:', productsData.map(p => ({ id: p.id, name: p.name })));
            setError('Product not found in your products list');
          }
        }
      } catch (err) {
        console.error('❌ EditProduct: Error fetching data:', err);
        setError('Failed to load product data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
    fetchData();
    }
  }, [productId, user?.seller?.id]);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // IMPORTANT: The backend replaces ALL images when files are provided
    // So we need to include existing images as files too
    // For now, we'll show a warning to the user
    
    // Add new files to formData
    setFormData(prev => ({
      ...prev,
      files: [...(prev.files || []), ...files]
    }));
    
    // Create previews for new files
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === files.length) {
          // Add new previews to existing ones
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    // Remove from previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // If removing an existing image (not a new file), we need to track it differently
    // For now, we'll just remove from previews and let the backend handle the logic
    // The backend should preserve existing images unless explicitly told to replace them
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.stockQuantity || !formData.categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stockQuantity: formData.stockQuantity,
        categoryId: formData.categoryId,
        files: formData.files, // New files to upload
        existingImageUrls: existingImages // Existing image URLs to preserve
      };

      console.log('🔍 EditProduct: Submitting product data:', {
        ...productData,
        filesCount: productData.files?.length || 0,
        existingImagesCount: existingImages.length
      });

      await updateProductInCatalogue(productId, productData);
      
      setSuccess('Product updated successfully!');
      
      // Redirect to products page after 2 seconds
      setTimeout(() => {
        navigate('/seller/products');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentProduct) {
    return (
      <SellerLayout toggleMobileMenu={toggleMobileMenu}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-24 w-full rounded" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-28 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 rounded" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded" />
                  ))}
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32 rounded" />
                <Skeleton className="h-12 w-24 rounded" />
              </div>
            </div>
          </div>
        </div>
      </SellerLayout>
    );
  }

  if (error && !currentProduct) {
    return (
      <SellerLayout toggleMobileMenu={toggleMobileMenu}>
        <div className="min-h-screen  flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/seller/products')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Products
            </button>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout toggleMobileMenu={toggleMobileMenu}>
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Home </span>
              <span>›</span>
              <span>Sell</span>
              <span>›</span>
              <span className="text-gray-900 font-medium">Edit Product</span>
            </div>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
            <p className="text-gray-600">Update your product details. Your changes will be visible to all Campor users.</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}


          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Add Photo */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Add Photo</label>
                <p className="text-sm text-gray-600 mb-4">Add up to 3 photos for this product</p>
                
                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="files"
                    name="files"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <label htmlFor="files" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">Click to upload photos</p>
                      <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                    </div>
                  </label>
                </div>
                
                <div className="mt-3 text-sm text-gray-500">
                  <p>Supported formats are *.jpg and *.png</p>
                  <p className="text-red-500">Picture size must not exceed 5 mb</p>
                  <p className="text-blue-600">Maximum 3 images allowed</p>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Current images ({imagePreviews.length} total)
                      {existingImages.length > 0 && (
                        <span className="text-blue-600 ml-2">
                          ({existingImages.length} existing, {imagePreviews.length - existingImages.length} new)
                        </span>
                      )}
                    </p>
                    
                    {/* Warning about image replacement */}
                    {formData.files && formData.files.length > 0 && existingImages.length > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Warning:</strong> Adding new images will replace all existing images. 
                              Make sure to include all images you want to keep.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3">Product Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. HP Laptop 15"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-3">Description</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Brief Description"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-900 mb-3">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                  </div>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-3">Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">₦</span>
                  </div>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formattedPrice}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 25,000.00"
                    required
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label htmlFor="stockQuantity" className="block text-sm font-semibold text-gray-900 mb-3">Stock Quantity</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    id="stockQuantity"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 10"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Updating Product...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default EditProduct;