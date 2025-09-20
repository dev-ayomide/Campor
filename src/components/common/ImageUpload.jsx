import React, { useRef, useState } from 'react';
import { uploadMultipleImages } from '../../services/cloudinaryService';

/**
 * ImageUpload component for handling product image uploads
 * @param {Object} props - Component props
 */
export default function ImageUpload({
  images = [],
  onImagesChange,
  maxImages = 3,
  disabled = false,
  className = '',
  showPreview = true,
  uploadOptions = {}
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Use only the images prop from parent
  const allImages = images;
  
  // Calculate canAddMore based on parent's images
  const canAddMore = images.length < maxImages;

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setError(null);
      setUploading(true);
      
      const fileArray = Array.from(files);
      const uploadResults = await uploadMultipleImages(fileArray, uploadOptions);
      
      // Notify parent component of changes
      if (onImagesChange) {
        const newImageUrls = uploadResults.map(result => result.url);
        const allImageUrls = [...images, ...newImageUrls];
        onImagesChange(allImageUrls);
      }
    } catch (err) {
      console.error('Failed to upload images:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemoveImage = async (index) => {
    try {
      // Simply remove the image at the given index
      const newImages = images.filter((_, i) => i !== index);
      if (onImagesChange) {
        onImagesChange(newImages);
      }
    } catch (err) {
      console.error('Failed to remove image:', err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || !canAddMore) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleClick = () => {
    if (!disabled && canAddMore) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || !canAddMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || !canAddMore}
        />
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </div>
          
          <p className="text-gray-600 font-medium">
            {uploading ? 'Uploading...' : 'Click to upload photos'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {canAddMore ? 'or drag and drop' : `Maximum ${maxImages} images allowed`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Error:</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {showPreview && allImages.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Images ({allImages.length}/{maxImages})
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url || image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}