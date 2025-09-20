// Cloudinary Configuration
// Uses environment variables for security
// Make sure to set these in your .env file

export const CLOUDINARY_CONFIG = {
  // Your Cloudinary cloud name (found in dashboard)
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  
  // Upload preset for unsigned uploads (created in Cloudinary dashboard)
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
  
  // Upload folder for organization
  uploadFolder: 'samples/ecommerce',
  
  // Default transformations for product images
  defaultTransformations: {
    quality: 'auto',
    fetch_format: 'auto',
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'auto'
  }
};

// Instructions for setup:
// 1. Go to https://cloudinary.com/ and create an account
// 2. In your dashboard, find your Cloud Name
// 3. Create an Upload Preset in Settings > Upload > Upload presets
// 4. Create a .env file in your project root and add these variables:
//    VITE_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
//    VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset-name
// 5. This uses unsigned uploads which are more secure for client-side uploads
