import { CLOUDINARY_CONFIG as config } from '../config/cloudinary';

/**
 * Cloudinary Service for client-side image uploads
 * Handles unsigned uploads directly to Cloudinary
 */

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL and public ID
 */
export async function uploadImage(file, options = {}) {
  try {
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // Validate configuration
    if (!config.cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

    if (!config.uploadPreset) {
      throw new Error('Cloudinary upload preset not configured');
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);
    formData.append('cloud_name', config.cloudName);
    
    // Add custom options
    if (options.folder) {
      formData.append('folder', options.folder);
    } else {
      // Use the folder from your Cloudinary preset
      formData.append('folder', 'samples/ecommerce');
    }
    if (options.public_id) {
      formData.append('public_id', options.public_id);
    }
    if (options.tags) {
      formData.append('tags', options.tags);
    }

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const result = await response.json();
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };

  } catch (error) {
    console.error('❌ CloudinaryService: Failed to upload image:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object[]>} Array of upload results
 */
export async function uploadMultipleImages(files, options = {}) {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided');
    }

    // Upload all files in parallel
    const uploadPromises = files.map(file => uploadImage(file, options));
    const results = await Promise.all(uploadPromises);
    
    return results;

  } catch (error) {
    console.error('❌ CloudinaryService: Failed to upload multiple images:', error);
    throw error;
  }
}

/**
 * Delete an image from Cloudinary
 * Note: This should typically be handled server-side for security
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteImage(publicId) {
  console.warn('⚠️ CloudinaryService: Image deletion should be handled server-side for security');
  return { success: false, message: 'Image deletion should be handled server-side' };
}

/**
 * Delete multiple images from Cloudinary
 * Note: This should typically be handled server-side for security
 * @param {string[]} publicIds - Array of public IDs to delete
 * @returns {Promise<Object[]>} Array of deletion results
 */
export async function deleteMultipleImages(publicIds) {
  console.warn('⚠️ CloudinaryService: Image deletion should be handled server-side for security');
  return publicIds.map(publicId => ({ 
    publicId, 
    success: false, 
    message: 'Image deletion should be handled server-side' 
  }));
}

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - The public ID of the image
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(publicId, transformations = {}) {
  const baseUrl = `https://res.cloudinary.com/${config.cloudName}/image/upload`;
  
  // Default transformations
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations
  };
  
  // Build transformation string
  const transformString = Object.entries(defaultTransformations)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');
  
  return `${baseUrl}/${transformString}/${publicId}`;
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export function validateImageFile(file) {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  if (!(file instanceof File)) {
    errors.push('Invalid file type');
  }
  
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported. Use JPEG, PNG, WebP, or GIF');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}