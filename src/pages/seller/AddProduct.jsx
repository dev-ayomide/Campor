import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';

export default function AddProductPage({ toggleMobileMenu }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [files[0]] // Only take the first image for simplicity
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.price && formData.images.length > 0) {
      setCurrentStep(2);
    }
  };

  const handlePublish = () => {
    console.log('Publishing product:', formData);
    // Handle product publishing
    navigate('/seller/products');
  };

  return (
    <SellerLayout>
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/seller" className="hover:text-gray-700">Sell</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Post Product</span>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

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

            <form onSubmit={handleNext} className="space-y-6">
              {/* Add Photo Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Photo</h3>
                <p className="text-sm text-gray-600 mb-4">Add at least 1 photo for this category</p>
                
                <div className="flex gap-4 mb-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {formData.images.length < 3 && (
                    <label className="w-16 h-16 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </label>
                  )}
                </div>
                
                <p className="text-xs text-gray-500">
                  Supported formats are *.jpg and *.png
                </p>
                <p className="text-xs text-red-500">
                  Picture size must not exceed 5 mb
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-2">Title</label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
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

              {/* Price */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-2">Price</label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 25,000"
                    min="0"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pl-12"
                    required
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₦</span>
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
              {/* Product Image */}
              <div className="relative h-64 bg-gray-100">
                {formData.images.length > 0 && (
                  <img 
                    src={URL.createObjectURL(formData.images[0])} 
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Navigation arrows */}
                <button className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Product Details */}
              <div className="p-4">
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  ₦ {parseInt(formData.price).toLocaleString()}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{formData.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{formData.description}</p>
                
                {/* Seller Info */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Fatima Abdullahi</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePublish}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors"
              >
                Publish
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
