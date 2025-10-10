import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication to prevent multiple simultaneous requests
const pendingRequests = new Map();

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if this is a login attempt - let the login form handle the error
      const isLoginAttempt = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/login');
      
      if (!isLoginAttempt) {
        // Clear stored auth data
        localStorage.removeItem('campor_token');
        localStorage.removeItem('campor_user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH SERVICES =====

export async function login(email, password) {
  try {
    
    // Validate email format
    if (!email || !email.includes('@run.edu.ng')) {
      throw new Error('Please use a valid RUN email address (your.name@run.edu.ng)');
    }
    
    // Test backend connectivity first
    try {
      const testResponse = await axios.get(`${API_BASE_URL}/auth/me`, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (testError) {
      if (testError.response?.status === 401) {
      } else if (testError.code === 'ECONNABORTED') {
        throw new Error('We\'re experiencing some technical difficulties. Please try again in a moment.');
      } else if (testError.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect. Please check your internet connection and try again.');
      } else {
        throw new Error('We\'re having trouble connecting. Please try again in a moment.');
      }
    }
    
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    
    // Backend only returns token, we need to fetch user data separately
    // Expected response: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
    const token = response.data.token;
    
    // Store token temporarily for this request
    const tempApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    
    // Fetch user profile using the token
    let userData = null;
    try {
      const userResponse = await tempApi.get(API_ENDPOINTS.AUTH.ME);
      userData = userResponse.data;
    } catch (profileError) {
      // If profile fetch fails, we still have the token, so we can proceed
      // The user will be redirected to complete their profile
    }
    
    return {
      token,
      user: userData
    };
  } catch (error) {
    
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password. Please check your credentials.');
    } else if (error.response?.status === 403) {
      throw new Error('Email not verified. Please check your email for verification instructions.');
    } else if (error.response?.status === 404) {
      throw new Error('User not found. Please check your email address.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Login failed. Please try again.');
    }
  }
}

export async function register(userData) {
  try {
    
    // Validate email format
    if (!userData.email || !userData.email.includes('@run.edu.ng')) {
      throw new Error('Please use a valid RUN email address (your.name@run.edu.ng)');
    }
    
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
      name: userData.name,
      email: userData.email,
      password: userData.password
    });
    
    return response.data;
  } catch (error) {
    
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid registration data. Please check your information.');
    } else if (error.response?.status === 409) {
      throw new Error('Email already exists. Please use a different email or try logging in.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
    }
  }
}

export async function verifyEmail(email, verificationCode) {
  try {
    
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      email,
      code: verificationCode
    });
    
    return response.data;
  } catch (error) {
    
    if (error.response?.status === 400) {
      throw new Error('Invalid verification code. Please check your email and try again.');
    } else if (error.response?.status === 404) {
      throw new Error('Email not found. Please check your email address.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Email verification failed. Please try again.');
    }
  }
}

export async function resendVerificationCode(email) {
  try {
    
    const response = await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      email
    });
    
    return response.data;
  } catch (error) {
    
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Email is already verified or invalid format.');
    } else if (error.response?.status === 404) {
      throw new Error('User not found. Please check your email address.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to resend verification code. Please try again.');
    }
  }
}

export async function getCurrentUser() {
  try {
    
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // First get user ID from /auth/me endpoint
    const authResponse = await api.get(API_ENDPOINTS.AUTH.ME);
    const userId = authResponse.data.id;
    
    // Then get full user details from /users/{id} endpoint
    const response = await api.get(`${API_ENDPOINTS.USER.GET_BY_ID}/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch user profile. Please log in again.');
  }
}

export async function forgotPassword(email) {
  try {
    
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email
    });
    
    return response.data;
  } catch (error) {
    
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid email format. Please check your email address.');
    } else if (error.response?.status === 404) {
      throw new Error('Email not found. Please check your email address or register for an account.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to send password reset email. Please try again.');
    }
  }
}

export async function resetPassword(token, newPassword) {
  try {
    
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword
    });
    
    return response.data;
  } catch (error) {
    
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid input data. Please check your password requirements.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid or expired reset token. Please request a new password reset.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  }
}

// ===== USER SERVICES =====

export async function updateProfile(userData) {
  try {
    
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add name field
    if (userData.name) {
      formData.append('name', userData.name);
    }
    
    // Add profile picture if provided
    if (userData.profilePicture) {
      formData.append('profilePicture', userData.profilePicture);
    }
    
    // Create a new axios instance for multipart/form-data
    const multipartApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // Increased timeout to 60 seconds for file uploads
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Add auth token
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (token) {
      multipartApi.defaults.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log FormData contents for debugging
    
    const response = await multipartApi.put(API_ENDPOINTS.USER.UPDATE_PROFILE, formData);
    return response.data;
  } catch (error) {
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again with a smaller image or check your internet connection.');
    } else if (error.response?.status === 413) {
      throw new Error('File too large. Please choose a smaller image.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid data provided. Please check your information.');
    } else if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  }
}

// ===== SELLER SERVICES =====

// Test function to check seller endpoint connectivity
export async function testSellerEndpoint() {
  try {
    
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Test with a simple GET request first (if available)
    const testApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    // Try to access a simple endpoint first
    const testResponse = await testApi.get('/auth/me');
    
    return {
      success: true,
      message: 'Seller endpoint connectivity test passed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// Import bank verification service for bank code mapping
import { getBankCode } from './bankVerificationService';

export async function checkCatalogueNameAvailability(catalogueName) {
  try {
    const response = await api.get(API_ENDPOINTS.SELLER.CHECK_CATALOGUE_NAME, {
      params: { catalogueName }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid catalogue name');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to check catalogue name availability.');
    }
  }
}

export async function registerSeller(sellerData) {
  try {
    
    // Prepare JSON payload for the API
    const payload = {
      catalogueName: sellerData.catalogueName,
      storeDescription: sellerData.storeDescription,
      phoneNumber: sellerData.phoneNumber,
      whatsappNumber: sellerData.whatsappNumber,
      location: sellerData.location,
      bankName: sellerData.bankName,
      bankCode: sellerData.bankCode,
      accountNumber: sellerData.accountNumber,
      accountName: sellerData.accountName,
      catalogueCover: sellerData.catalogueCover
    };
    
    
    const response = await api.post(API_ENDPOINTS.SELLER.REGISTER, payload);
    return response.data;
  } catch (error) {
    
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid seller data. Please check your information.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 409) {
      throw new Error('You are already registered as a seller.');
    } else if (error.response?.status >= 500) {
      // Log more details for 500 errors to help with debugging
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to register as seller.');
    }
  }
}

export async function getSellerCatalogueBySlug(slug) {
  try {
    
    const response = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/catalogue/${slug}`);
    
    // The API now returns updated structure with user profile and catalogue cover
    const data = response.data;
    
    const mappedData = {
      seller: {
        id: data.userId, // Use userId as the seller ID since there's no separate seller ID
        slug: slug, // Use the provided slug
        user: {
          ...data.user, // Contains name and profilePicture
          id: data.userId // Map userId to user.id for consistency
        },
        catalogueName: data.catalogueName,
        catalogueCover: data.catalogueCover || '', // Handle empty string
        cataloguePicture: data.catalogueCover || '', // Also map to cataloguePicture for backward compatibility
        storeDescription: data.storeDescription,
        phoneNumber: data.phoneNumber || '',
        whatsappNumber: data.whatsappNumber || '',
        location: data.location,
        bankName: data.bankName || '',
        bankCode: data.bankCode || '',
        accountNumber: data.accountNumber || '',
        accountName: data.accountName || '',
        createdAt: data.createdAt,
        averageRating: data.averageRating || 0,
        productCount: data._count?.products || 0
      },
      products: data.products || [],
      rawApiResponse: data // Store raw API response for debugging
    };
    
    return mappedData;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch seller catalogue.');
  }
}

export async function getSellerCatalogue(sellerId) {
  try {
    
    const response = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/catalogue`);
    
    // The API now returns updated structure with user profile and catalogue cover
    const data = response.data;
    
    const mappedData = {
      seller: {
        id: sellerId,
        slug: data.slug || '', // Handle missing slug
        user: {
          ...data.user, // Contains name and profilePicture
          id: data.userId // Map userId to user.id for consistency
        },
        catalogueName: data.catalogueName,
        catalogueCover: data.catalogueCover || '', // Handle empty string
        cataloguePicture: data.catalogueCover || '', // Also map to cataloguePicture for backward compatibility
        storeDescription: data.storeDescription,
        phoneNumber: data.phoneNumber || '',
        whatsappNumber: data.whatsappNumber || '',
        location: data.location,
        bankName: data.bankName || '',
        bankCode: data.bankCode || '',
        accountNumber: data.accountNumber || '',
        accountName: data.accountName || '',
        createdAt: data.createdAt,
        averageRating: data.averageRating || 0,
        productCount: data._count?.products || 0
      },
      products: data.products || [],
      rawApiResponse: data // Store raw API response for debugging
    };
    
    return mappedData;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch seller catalogue.');
  }
}

// Function to get seller products with status information
// This endpoint returns ALL products (DRAFT, ACTIVE, OUT_OF_STOCK) for seller management
export async function getSellerProducts(sellerId, retryCount = 0) {
  const requestKey = `seller-products-${sellerId}`;
  
  // If there's already a pending request for this seller, wait for it
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {
      
      // Validate sellerId before making the request
      if (!sellerId) {
        throw new Error('Seller ID is required');
      }
      
      // Use the products endpoint - this returns ALL products regardless of status
      const response = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/products`);
      
      // Handle paginated response structure
      const products = response.data?.products || response.data || [];
      
      return products;
    } catch (error) {
      
      // Retry logic for network errors
      if (retryCount < 2 && (
        error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' ||
        error.response?.status >= 500 ||
        error.message.includes('timeout')
      )) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return getSellerProducts(sellerId, retryCount + 1);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch seller products.');
    } finally {
      // Clean up the pending request
      pendingRequests.delete(requestKey);
    }
  })();
  
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}

// Function to get a single product by ID for editing
export async function getProductById(productId) {
  try {
    
    // Get the seller ID from the current user context
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Get user data to extract seller ID
    const authResponse = await api.get(API_ENDPOINTS.AUTH.ME);
    
    const user = authResponse.data.user || authResponse.data;
    const sellerId = user.seller?.id;
    
    if (!sellerId) {
      throw new Error('Seller ID not found in user data');
    }
    
    
    // Get seller products with full details
    const productsResponse = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/products`);
    
    // Handle paginated response structure
    const products = productsResponse.data?.products || productsResponse.data || [];
    
    // Find the specific product
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error('Product not found in seller products');
    }
    
    
    return product;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product.');
  }
}

// Function to get seller user ID from seller ID
export async function getSellerUserId(sellerId) {
  try {
    
    const catalogueData = await getSellerCatalogue(sellerId);
    
    const userId = catalogueData.seller?.user?.id;
    
    if (!userId) {
      throw new Error('User ID not found for seller');
    }
    
    // Check if the userId is actually the seller ID (this shouldn't happen but let's handle it)
    if (userId === sellerId) {
      
      // Try to get the actual user ID from the raw API response
      const rawResponse = catalogueData.rawApiResponse || catalogueData;
      
      // Look for user ID in different possible fields
      const possibleUserIds = [
        rawResponse.userId,
        rawResponse.user?.id,
        rawResponse.ownerId,
        rawResponse.owner_id
      ].filter(Boolean);
      
      
      // Find a user ID that's different from the seller ID
      const actualUserId = possibleUserIds.find(id => id !== sellerId);
      
      if (actualUserId) {
        return actualUserId;
      } else {
        // If we can't find a different user ID, this is a backend API issue
        // For now, let's throw a more helpful error
        throw new Error(`Backend API issue: The seller catalogue endpoint is returning the seller ID (${sellerId}) as the userId field instead of the actual user ID. Please contact the backend team to fix this.`);
      }
    }
    
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new Error('Invalid user ID format');
    }
    
    return userId;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get seller user ID.');
  }
}

// Alternative function to get seller user ID with fallback
export async function getSellerUserIdWithFallback(sellerId) {
  try {
    // First try the normal method
    return await getSellerUserId(sellerId);
  } catch (error) {
    
    // If the normal method fails, try to use the seller ID directly
    // This is a temporary workaround for the backend API issue
    
    // Validate that the seller ID is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sellerId)) {
      throw new Error('Invalid seller ID format');
    }
    
    return sellerId;
  }
}

// Function to update product status
export async function updateProductStatus(productId, status) {
  try {
    
    const response = await api.put(`${API_ENDPOINTS.SELLER.UPDATE}/${productId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update product status.');
  }
}

// Function to publish product
export async function publishProduct(productId) {
  try {
    
    const response = await api.patch(`/sellers/publish/${productId}`);
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to publish product.');
  }
}

// Function to unpublish product
export async function unpublishProduct(productId) {
  try {
    
    const response = await api.patch(`/sellers/unpublish/${productId}`);
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to unpublish product.');
  }
}

// Public seller catalogue - can be used for public viewing (if needed without auth)
export async function getPublicSellerCatalogue(sellerId) {
  try {
    
    // Use the same endpoint but could be modified for public access in the future
    const response = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/catalogue`);
    
    // Transform response to match the new API structure
    const data = response.data;
    return {
      seller: {
        id: sellerId,
        user: data.user, // Contains name and profilePicture
        catalogueName: data.catalogueName,
        catalogueCover: data.catalogueCover, // New cover photo field
        cataloguePicture: data.catalogueCover, // Also map to cataloguePicture for backward compatibility
        storeDescription: data.storeDescription,
        phoneNumber: data.phoneNumber,
        whatsappNumber: data.whatsappNumber,
        location: data.location,
        bankName: data.bankName,
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        createdAt: data.createdAt,
        averageRating: data.averageRating,
        productCount: data._count?.products || 0
      },
      products: data.products || []
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Seller catalogue not found or not available.');
  }
}


// Function to verify seller exists in backend
export async function verifySellerExists(sellerId) {
  try {
    
    // Try to get seller products to verify seller exists
    const response = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/products`);
    return true;
  } catch (error) {
    
    if (error.response?.status === 404) {
      throw new Error('Seller not found. Please ensure you are properly registered as a seller.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You are not authorized to access this seller account.');
    } else {
      throw new Error('Failed to verify seller: ' + (error.response?.data?.message || error.message));
    }
  }
}

export async function addProductToCatalogue(sellerId, productData) {
  try {
    
    // Prepare product data as JSON (backend now expects application/json)
    const payload = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stockQuantity: productData.stockQuantity,
      categoryId: productData.categoryId,
      imageUrls: productData.imageUrls || []
    };
    
    
    const response = await api.post(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/catalogue`, payload);
    return response.data;
  } catch (error) {
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error occurred';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error(error.message || 'Failed to add product to catalogue');
    }
  }
}

export async function updateProductInCatalogue(productId, productData) {
  try {
    
    // Prepare product data as JSON (backend now expects application/json)
    const payload = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stockQuantity: productData.stockQuantity,
      categoryId: productData.categoryId,
      imageUrls: productData.imageUrls || []
    };
    
    const response = await api.put(`${API_ENDPOINTS.SELLER.UPDATE}/${productId}/catalogue`, payload);
    return response.data;
  } catch (error) {
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error occurred';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error(error.message || 'Failed to update product');
    }
  }
}

// Update seller basic information (store details, contact info, location)
export async function updateSellerInfo(sellerId, sellerData) {
  try {
    
    // Prepare JSON payload for the API (not FormData)
    const payload = {
      catalogueName: sellerData.catalogueName,
      storeDescription: sellerData.storeDescription,
      phoneNumber: sellerData.phoneNumber,
      whatsappNumber: sellerData.whatsappNumber,
      location: sellerData.location,
      catalogueCover: sellerData.catalogueCover
    };
    
    const response = await api.put(`${API_ENDPOINTS.SELLER.UPDATE}/${sellerId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update seller information.');
  }
}

export async function deleteProduct(productId) {
  try {
    
    const response = await api.delete(`${API_ENDPOINTS.SELLER.DELETE_PRODUCT}/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete product.');
  }
}

// Legacy functions for backward compatibility
export async function completeSellerOnboarding(sellerData) {
  try {
    const response = await api.post(API_ENDPOINTS.SELLER.ONBOARDING, sellerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to complete seller onboarding.');
  }
}

export async function getSellerInfo(sellerId) {
  try {
    const response = await api.get(`${API_ENDPOINTS.SELLER.INFO}/${sellerId}/info`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch seller information.');
  }
}

export async function getSellerProfile() {
  try {
    const response = await api.get(API_ENDPOINTS.SELLER.PROFILE);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch seller profile.');
  }
}

// ===== PRODUCT SERVICES =====

export async function getAllProducts(page = 1, limit = 10, filters = {}) {
  try {
    
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (filters && Object.keys(filters).length > 0) {
      params.append('filters', JSON.stringify(filters));
    }
    
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.ALL}?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products.');
  }
}

export async function searchProducts(query, page = 1, limit = 10) {
  try {
    
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.SEARCH}?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search products.');
  }
}

export async function getProductBySlug(slug) {
  try {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.BY_SLUG}/${slug}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product.');
  }
}

// Test function to verify endpoint functionality
export const testProductEndpoints = async () => {
  try {
    
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.ALL}?page=1&limit=1`);
    return {
      success: true,
      message: 'Product endpoints are functional'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};


// ===== CATEGORY SERVICES =====

export async function getAllCategories() {
  try {

    
    const response = await api.get(API_ENDPOINTS.CATEGORIES.ALL);
    
    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
  }
}

export async function getCategoriesOnly() {
  try {
    
    const response = await api.get(API_ENDPOINTS.CATEGORIES.ONLY);
    
    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
  }
}

export async function getCategoryById(categoryId) {
  try {

    
    const response = await api.get(`${API_ENDPOINTS.CATEGORIES.BY_ID}/${categoryId}`);
    

    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || 'Failed to fetch category.');
  }
}

export async function createCategories(categoryNames) {
  try {

    
    const payload = {
      names: categoryNames
    };
    
    const response = await api.post(API_ENDPOINTS.CATEGORIES.CREATE, payload);
    

    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || 'Failed to create categories.');
  }
}

export async function updateCategory(categoryId, categoryData) {
  try {

    
    const response = await api.put(`${API_ENDPOINTS.CATEGORIES.UPDATE}/${categoryId}`, categoryData);
    

    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || 'Failed to update category.');
  }
}

export async function deleteCategory(categoryId) {
  try {

    
    const response = await api.delete(`${API_ENDPOINTS.CATEGORIES.DELETE}/${categoryId}`);
    

    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || 'Failed to delete category.');
  }
}

// Seller Orders Functions
export const getSellerOrders = async (sellerId, retryCount = 0) => {
  const requestKey = `seller-orders-${sellerId}`;
  
  // If there's already a pending request for this seller, wait for it
  if (pendingRequests.has(requestKey)) {

    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {


      
      // Validate sellerId before making the request
      if (!sellerId) {
        throw new Error('Seller ID is required');
      }
      
      const response = await api.get(`/orders/${sellerId}/seller`);

      // Handle paginated response structure
      const orders = response.data?.orders || response.data || [];
      return orders;
    } catch (error) {



      
      // Retry logic for network errors
      if (retryCount < 2 && (
        error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' ||
        error.response?.status >= 500 ||
        error.message.includes('timeout')
      )) {

        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return getSellerOrders(sellerId, retryCount + 1);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch seller orders');
    } finally {
      // Clean up the pending request
      pendingRequests.delete(requestKey);
    }
  })();
  
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
};

export const getOrderDetails = async (orderId) => {
  try {

    const response = await api.get(`/orders/${orderId}`);

    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || 'Failed to fetch order details');
  }
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  try {

    const response = await api.put(`/orders/${orderId}/status`, { orderStatus });

    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

// Get order by settlement code for seller
export async function getOrderBySettlementCode(sellerId, settlementCode) {
  try {
    // Use the correct endpoint: GET /sellers/{id}/orders/{settlementCode}
    const endpoint = `${API_ENDPOINTS.SELLER.UPDATE}/${sellerId}/orders/${settlementCode}`;
    
    // Use GET request with settlement code in URL path
    const response = await api.get(endpoint);
    
    return response.data;
    
  } catch (error) {
    // More specific error messages
    if (error.response?.status === 404) {
      throw new Error('Order not found or you don\'t have access to this order');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid settlement code or code expired');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('You don\'t have permission to access this order');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to retrieve order.');
  }
}

// Initiate transfer to seller
export async function initiateTransferToSeller(orderSellerId) {
  try {

    
    const response = await api.post('/payments/transfer', {
      orderSellerId: orderSellerId
    });
    

    return response.data;
  } catch (error) {

    throw new Error(error.response?.data?.message || 'Failed to initiate transfer.');
  }
}

