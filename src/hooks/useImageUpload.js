import { useState, useCallback } from 'react';
import { uploadImage, uploadMultipleImages, deleteImage, validateImageFile } from '../services/cloudinaryService';

/**
 * Custom hook for managing image uploads to Cloudinary
 * @param {Object} options - Configuration options
 * @returns {Object} Upload state and methods
 */
export function useImageUpload(options = {}) {
  const {
    maxImages = 3,
    maxFileSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } = options;

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  /**
   * Upload a single image
   * @param {File} file - The file to upload
   * @param {Object} uploadOptions - Upload options
   */
  const uploadSingleImage = useCallback(async (file, uploadOptions = {}) => {
    try {
      setError(null);
      setUploading(true);
      setProgress(0);

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check if we've reached the maximum number of images
      if (images.length >= maxImages) {
        throw new Error(`Maximum ${maxImages} images allowed`);
      }

      // Upload the image
      const result = await uploadImage(file, uploadOptions);
      
      // Don't add to images array - let parent component handle this
      setProgress(100);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [images.length, maxImages]);

  /**
   * Upload multiple images
   * @param {File[]} files - Array of files to upload
   * @param {Object} uploadOptions - Upload options
   */
  const uploadMultipleImageFiles = useCallback(async (files, uploadOptions = {}) => {
    try {
      setError(null);
      setUploading(true);
      setProgress(0);

      // Validate number of files (let parent component handle this validation)
      if (files.length > maxImages) {
        throw new Error(`Maximum ${maxImages} images allowed per upload.`);
      }

      // Validate all files
      const validationErrors = [];
      files.forEach((file, index) => {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          validationErrors.push(`File ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('; '));
      }

      // Upload all images
      const results = await uploadMultipleImages(files, uploadOptions);
      
      // Don't add to images array - let the parent component handle this
      setProgress(100);
      
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [maxImages]);

  // removeImage function removed - parent component handles removal

  /**
   * Remove multiple images
   * @param {number[]} indices - Array of indices to remove
   * @param {boolean} deleteFromCloudinary - Whether to delete from Cloudinary
   */
  const removeMultipleImages = useCallback(async (indices, deleteFromCloudinary = false) => {
    try {
      const imagesToRemove = indices.map(index => images[index]).filter(Boolean);
      
      if (imagesToRemove.length === 0) {
        throw new Error('No images found to remove');
      }

      // Delete from Cloudinary if requested
      if (deleteFromCloudinary) {
        const publicIds = imagesToRemove
          .map(img => img.publicId)
          .filter(Boolean);
        
        if (publicIds.length > 0) {
          await Promise.all(publicIds.map(publicId => deleteImage(publicId)));
        }
      }

      // Don't remove from images array - let parent component handle this
      
      return imagesToRemove;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [images]);

  /**
   * Clear all images
   * @param {boolean} deleteFromCloudinary - Whether to delete from Cloudinary
   */
  const clearImages = useCallback(async (deleteFromCloudinary = false) => {
    try {
      if (deleteFromCloudinary) {
        const publicIds = images
          .map(img => img.publicId)
          .filter(Boolean);
        
        if (publicIds.length > 0) {
          await Promise.all(publicIds.map(publicId => deleteImage(publicId)));
        }
      }

      // Don't clear images array - let parent component handle this
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Set images from existing URLs (for editing existing products)
   * @param {string[]} urls - Array of image URLs
   */
  const setExistingImages = useCallback((urls) => {
    const existingImages = urls.map(url => ({
      url,
      publicId: null, // We don't have the public ID for existing images
      isExisting: true
    }));
    
    // Don't set images - let parent component handle this
  }, []);

  /**
   * Get image URLs for API submission
   * @returns {string[]} Array of image URLs
   */
  const getImageUrls = useCallback(() => {
    return images.map(img => img.url);
  }, [images]);

  /**
   * Get new images (not existing ones) for API submission
   * @returns {Object[]} Array of new image objects
   */
  const getNewImages = useCallback(() => {
    return images.filter(img => !img.isExisting);
  }, [images]);

  /**
   * Get existing images for API submission
   * @returns {string[]} Array of existing image URLs
   */
  const getExistingImages = useCallback(() => {
    return images.filter(img => img.isExisting).map(img => img.url);
  }, [images]);

  return {
    // State
    // images - removed, parent component manages this
    uploading,
    error,
    progress,
    
    // Methods
    uploadSingleImage,
    uploadMultipleImageFiles,
    // removeImage, removeMultipleImages, clearImages, setExistingImages - removed, parent handles these
    
    // Getters - removed, parent component handles these
    // getImageUrls, getNewImages, getExistingImages
    
    // Computed properties
    maxImages
    // canAddMore, imageCount - removed, parent component handles these
  };
}
