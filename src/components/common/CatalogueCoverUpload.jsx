import { useState, useRef } from 'react';
import { uploadImage } from '../../services/cloudinaryService';

export default function CatalogueCoverUpload({ 
  coverUrl, 
  onCoverChange, 
  className = "",
  disabled = false 
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB limit for covers)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must not exceed 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {

      // Upload to Cloudinary with catalogue-specific folder
      const result = await uploadImage(file, {
        folder: 'samples/ecommerce/catalogue-covers',
        tags: 'catalogue-cover'
      });

      
      // Update parent component with the new cover URL
      onCoverChange(result.url);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCover = () => {
    onCoverChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`catalogue-cover-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Cover Preview */}
      <div className="relative">
        {coverUrl ? (
          <div className="relative group">
            <img
              src={coverUrl}
              alt="Catalogue cover"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={handleClick}
                    disabled={uploading}
                    className="px-3 py-1 bg-white text-gray-800 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Change'}
                  </button>
                  <button
                    onClick={handleRemoveCover}
                    disabled={uploading}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleClick}
            className={`w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors ${
              disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600 font-medium">Upload Catalogue Cover</span>
                <span className="text-xs text-gray-500 mt-1">Click to browse or drag and drop</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Help Text */}
      {!error && (
        <div className="mt-2 text-xs text-gray-500">
          Recommended: 1200x400px or similar aspect ratio for best display
        </div>
      )}
    </div>
  );
}
