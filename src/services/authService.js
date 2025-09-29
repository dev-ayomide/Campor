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
    console.log('🔍 Login attempt for:', email);
    console.log('🔍 Login payload being sent:', { email, password });
    console.log('🔍 Login endpoint:', API_ENDPOINTS.AUTH.LOGIN);
    console.log('🔍 Full login URL:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`);
    
    // Validate email format
    if (!email || !email.includes('@run.edu.ng')) {
      throw new Error('Please use a valid RUN email address (your.name@run.edu.ng)');
    }
    
    // Test backend connectivity first
    try {
      console.log('🔍 Testing backend connectivity...');
      console.log('🔍 Testing URL:', `${API_BASE_URL}/auth/me`);
      const testResponse = await axios.get(`${API_BASE_URL}/auth/me`, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Backend is accessible (expected 401 for unauthenticated request)');
    } catch (testError) {
      console.log('🔍 Backend test response:', testError.response?.status, testError.message);
      if (testError.response?.status === 401) {
        console.log('✅ Backend is accessible (401 is expected for unauthenticated request)');
      } else if (testError.code === 'ECONNABORTED') {
        console.error('❌ Backend timeout - server might be slow or unavailable');
        throw new Error('Backend server is not responding. Please try again later.');
      } else if (testError.code === 'ERR_NETWORK') {
        console.error('❌ Network error - cannot reach backend server');
        throw new Error('Cannot connect to backend server. Please check your internet connection.');
      } else {
        console.error('❌ Backend connectivity issue:', testError.message);
        throw new Error('Cannot connect to backend. Please check if the server is running.');
      }
    }
    
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    console.log('✅ Login successful, token received');
    console.log('✅ Login response:', response.data);
    
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
    
    console.log('🔍 AuthService: Token format:', token);
    console.log('🔍 AuthService: Authorization header:', `Bearer ${token}`);
    
    // Fetch user profile using the token
    let userData = null;
    try {
      console.log('🔍 AuthService: Fetching user profile...');
      const userResponse = await tempApi.get(API_ENDPOINTS.AUTH.ME);
      userData = userResponse.data;
      console.log('✅ AuthService: User profile fetched successfully:', userData);
    } catch (profileError) {
      console.error('❌ AuthService: Failed to fetch user profile:', profileError);
      // If profile fetch fails, we still have the token, so we can proceed
      // The user will be redirected to complete their profile
    }
    
    return {
      token,
      user: userData
    };
  } catch (error) {
    console.error('❌ Login failed:', error);
    
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
    console.log('🔍 Register attempt for:', userData.email);
    
    // Validate email format
    if (!userData.email || !userData.email.includes('@run.edu.ng')) {
      throw new Error('Please use a valid RUN email address (your.name@run.edu.ng)');
    }
    
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
      name: userData.name,
      email: userData.email,
      password: userData.password
    });
    
    console.log('✅ Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed:', error);
    
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
    console.log('🔍 Email verification attempt for:', email);
    
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      email,
      code: verificationCode
    });
    
    console.log('✅ Email verification successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Email verification failed:', error);
    
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
    console.log('🔍 Resending verification code for:', email);
    
    const response = await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      email
    });
    
    console.log('✅ Verification code resent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to resend verification code:', error);
    throw new Error(error.response?.data?.message || 'Failed to resend verification code. Please try again.');
  }
}

export async function getCurrentUser() {
  try {
    console.log('🔍 Fetching current user profile...');
    
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // First get user ID from /auth/me endpoint
    const authResponse = await api.get(API_ENDPOINTS.AUTH.ME);
    const userId = authResponse.data.id;
    
    // Then get full user details from /users/{id} endpoint
    const response = await api.get(`${API_ENDPOINTS.USER.GET_BY_ID}/${userId}`);
    console.log('✅ User profile fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch user profile:', error);
    throw new Error('Failed to fetch user profile. Please log in again.');
  }
}

export async function forgotPassword(email) {
  try {
    console.log('🔍 Forgot password request for:', email);
    
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email
    });
    
    console.log('✅ Password reset email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error(error.response?.data?.message || 'Failed to send password reset email. Please try again.');
  }
}

export async function resetPassword(token, newPassword) {
  try {
    console.log('🔍 Resetting password...');
    
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword
    });
    
    console.log('✅ Password reset successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to reset password:', error);
    throw new Error(error.response?.data?.message || 'Failed to reset password. Please try again.');
  }
}

// ===== USER SERVICES =====

export async function updateProfile(userData) {
  try {
    console.log('🔍 Updating user profile...');
    console.log('🔍 Profile data:', { name: userData.name, hasProfilePicture: !!userData.profilePicture });
    
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add name field
    if (userData.name) {
      formData.append('name', userData.name);
    }
    
    // Add profile picture if provided
    if (userData.profilePicture) {
      console.log('🔍 Profile picture file:', {
        name: userData.profilePicture.name,
        size: userData.profilePicture.size,
        type: userData.profilePicture.type
      });
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
    console.log('🔍 FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    console.log('🔍 Making request to:', `${API_BASE_URL}${API_ENDPOINTS.USER.UPDATE_PROFILE}`);
    
    const response = await multipartApi.put(API_ENDPOINTS.USER.UPDATE_PROFILE, formData);
    console.log('✅ User profile updated successfully:', response.data);
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', response.headers);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    
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
    console.log('🔍 SellerService: Testing seller endpoint connectivity...');
    
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
    console.log('🔍 SellerService: Testing basic connectivity...');
    const testResponse = await testApi.get('/auth/me');
    console.log('✅ SellerService: Basic connectivity test passed');
    
    return {
      success: true,
      message: 'Seller endpoint connectivity test passed'
    };
  } catch (error) {
    console.error('❌ SellerService: Connectivity test failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// Import bank verification service for bank code mapping
import { getBankCode } from './bankVerificationService';

export async function registerSeller(sellerData) {
  try {
    console.log('🔍 SellerService: Registering seller...');
    console.log('🔍 SellerService: Seller data received:', sellerData);
    
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
    
    console.log('🔍 SellerService: Payload prepared:', payload);
    
    console.log('🔍 SellerService: Making request to:', `${API_BASE_URL}${API_ENDPOINTS.SELLER.REGISTER}`);
    
    const response = await api.post(API_ENDPOINTS.SELLER.REGISTER, payload);
    console.log('✅ SellerService: Seller registered successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to register seller:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid seller data. Please check your information.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 409) {
      throw new Error('You are already registered as a seller.');
    } else if (error.response?.status >= 500) {
      // Log more details for 500 errors to help with debugging
      console.error('🔍 Server Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to register as seller.');
    }
  }
}

export async function getSellerCatalogue(sellerId) {
  try {
    console.log('🔍 SellerService: Fetching seller catalogue for ID:', sellerId);
    
    const response = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/catalogue`);
    console.log('✅ SellerService: Seller catalogue fetched successfully:', response.data);
    console.log('🔍 SellerService: Raw API response data:', JSON.stringify(response.data, null, 2));
    
    // The API now returns updated structure with user profile and catalogue cover
    const data = response.data;
    console.log('🔍 SellerService: Mapping userId to user.id:', data.userId);
    console.log('🔍 SellerService: User data from API:', data.user);
    
    const mappedData = {
      seller: {
        id: sellerId,
        user: {
          ...data.user, // Contains name and profilePicture
          id: data.userId // Map userId to user.id for consistency
        },
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
      products: data.products || [],
      rawApiResponse: data // Store raw API response for debugging
    };
    
    console.log('🔍 SellerService: Final mapped data:', JSON.stringify(mappedData, null, 2));
    return mappedData;
  } catch (error) {
    console.error('❌ SellerService: Failed to fetch seller catalogue:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch seller catalogue.');
  }
}

// Function to get seller products with status information
// This endpoint returns ALL products (DRAFT, ACTIVE, OUT_OF_STOCK) for seller management
export async function getSellerProducts(sellerId, retryCount = 0) {
  const requestKey = `seller-products-${sellerId}`;
  
  // If there's already a pending request for this seller, wait for it
  if (pendingRequests.has(requestKey)) {
    console.log('⏳ SellerService: Waiting for pending request...');
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {
      console.log('🔍 SellerService: Fetching seller products for ID:', sellerId);
      
      // Validate sellerId before making the request
      if (!sellerId) {
        throw new Error('Seller ID is required');
      }
      
      // Use the products endpoint - this returns ALL products regardless of status
      const response = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/products`);
      console.log('✅ SellerService: Seller products fetched successfully:', response.data);
      
      // The response should be an array of products directly
      const products = Array.isArray(response.data) ? response.data : [];
      console.log('✅ SellerService: Products extracted:', products.length);
      
      // Log product details to debug the missing name issue
      console.log('🔍 SellerService: Sample product structure:', products[0]);
      console.log('🔍 SellerService: Product fields:', products[0] ? Object.keys(products[0]) : 'No products');
      
      return products;
    } catch (error) {
      console.error('❌ SellerService: Failed to fetch seller products:', error);
      
      // Retry logic for network errors
      if (retryCount < 2 && (
        error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' ||
        error.response?.status >= 500 ||
        error.message.includes('timeout')
      )) {
        console.log(`🔄 SellerService: Retrying request (attempt ${retryCount + 1}/2)`);
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
    console.log('🔍 SellerService: Fetching product by ID:', productId);
    
    // Get the seller ID from the current user context
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Get user data to extract seller ID
    const authResponse = await api.get(API_ENDPOINTS.AUTH.ME);
    console.log('🔍 SellerService: Auth response:', authResponse.data);
    
    const user = authResponse.data.user || authResponse.data;
    const sellerId = user.seller?.id;
    
    if (!sellerId) {
      throw new Error('Seller ID not found in user data');
    }
    
    console.log('🔍 SellerService: Seller ID:', sellerId);
    
    // Get seller products with full details
    const productsResponse = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/products`);
    console.log('🔍 SellerService: Products response:', productsResponse.data);
    
    const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
    
    // Find the specific product
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error('Product not found in seller products');
    }
    
    console.log('✅ SellerService: Product fetched successfully:', product);
    console.log('🔍 SellerService: Product description:', product.description);
    console.log('🔍 SellerService: Product createdAt:', product.createdAt);
    
    return product;
  } catch (error) {
    console.error('❌ SellerService: Failed to fetch product:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product.');
  }
}

// Function to get seller user ID from seller ID
export async function getSellerUserId(sellerId) {
  try {
    console.log('🔍 SellerService: Getting user ID for seller:', sellerId);
    
    const catalogueData = await getSellerCatalogue(sellerId);
    console.log('🔍 SellerService: Raw catalogue data:', catalogueData);
    console.log('🔍 SellerService: Seller object:', catalogueData.seller);
    console.log('🔍 SellerService: User object:', catalogueData.seller?.user);
    
    const userId = catalogueData.seller?.user?.id;
    console.log('🔍 SellerService: Extracted user ID:', userId);
    
    if (!userId) {
      console.error('❌ SellerService: User ID not found in catalogue data');
      console.error('❌ SellerService: Available seller fields:', Object.keys(catalogueData.seller || {}));
      console.error('❌ SellerService: Available user fields:', Object.keys(catalogueData.seller?.user || {}));
      throw new Error('User ID not found for seller');
    }
    
    // Check if the userId is actually the seller ID (this shouldn't happen but let's handle it)
    if (userId === sellerId) {
      console.error('❌ SellerService: API returned seller ID as userId - this is incorrect');
      console.error('❌ SellerService: Seller ID:', sellerId);
      console.error('❌ SellerService: Returned userId:', userId);
      
      // Try to get the actual user ID from the raw API response
      console.log('🔍 SellerService: Checking raw API response for actual user ID...');
      const rawResponse = catalogueData.rawApiResponse || catalogueData;
      console.log('🔍 SellerService: Raw API response:', rawResponse);
      
      // Look for user ID in different possible fields
      const possibleUserIds = [
        rawResponse.userId,
        rawResponse.user?.id,
        rawResponse.ownerId,
        rawResponse.owner_id
      ].filter(Boolean);
      
      console.log('🔍 SellerService: Possible user IDs found:', possibleUserIds);
      
      // Find a user ID that's different from the seller ID
      const actualUserId = possibleUserIds.find(id => id !== sellerId);
      
      if (actualUserId) {
        console.log('✅ SellerService: Found actual user ID:', actualUserId);
        return actualUserId;
      } else {
        // If we can't find a different user ID, this is a backend API issue
        // For now, let's throw a more helpful error
        throw new Error(`Backend API issue: The seller catalogue endpoint is returning the seller ID (${sellerId}) as the userId field instead of the actual user ID. Please contact the backend team to fix this.`);
      }
    }
    
    console.log('✅ SellerService: Found user ID for seller:', userId);
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ SellerService: User ID is not a valid UUID format:', userId);
      throw new Error('Invalid user ID format');
    }
    
    console.log('✅ SellerService: User ID validation passed');
    return userId;
  } catch (error) {
    console.error('❌ SellerService: Failed to get seller user ID:', error);
    throw new Error(error.response?.data?.message || 'Failed to get seller user ID.');
  }
}

// Alternative function to get seller user ID with fallback
export async function getSellerUserIdWithFallback(sellerId) {
  try {
    // First try the normal method
    return await getSellerUserId(sellerId);
  } catch (error) {
    console.log('🔍 SellerService: Normal method failed, trying alternative approach...');
    
    // If the normal method fails, try to use the seller ID directly
    // This is a temporary workaround for the backend API issue
    console.log('⚠️ SellerService: Using seller ID as fallback (this may not work for chat)');
    console.log('⚠️ SellerService: Seller ID:', sellerId);
    
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
    console.log('🔍 SellerService: Updating product status:', { productId, status });
    
    const response = await api.put(`${API_ENDPOINTS.SELLER.UPDATE}/${productId}/status`, { status });
    console.log('✅ SellerService: Product status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to update product status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update product status.');
  }
}

// Function to publish product
export async function publishProduct(productId) {
  try {
    console.log('🔍 SellerService: Publishing product:', productId);
    
    const response = await api.patch(`/sellers/publish/${productId}`);
    console.log('✅ SellerService: Product published successfully:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to publish product:', error);
    throw new Error(error.response?.data?.message || 'Failed to publish product.');
  }
}

// Function to unpublish product
export async function unpublishProduct(productId) {
  try {
    console.log('🔍 SellerService: Unpublishing product:', productId);
    
    const response = await api.patch(`/sellers/unpublish/${productId}`);
    console.log('✅ SellerService: Product unpublished successfully:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to unpublish product:', error);
    throw new Error(error.response?.data?.message || 'Failed to unpublish product.');
  }
}

// Public seller catalogue - can be used for public viewing (if needed without auth)
export async function getPublicSellerCatalogue(sellerId) {
  try {
    console.log('🔍 SellerService: Fetching public seller catalogue for ID:', sellerId);
    
    // Use the same endpoint but could be modified for public access in the future
    const response = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/catalogue`);
    console.log('✅ SellerService: Public seller catalogue fetched successfully:', response.data);
    
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
    console.error('❌ SellerService: Failed to fetch public seller catalogue:', error);
    throw new Error(error.response?.data?.message || 'Seller catalogue not found or not available.');
  }
}


// Function to verify seller exists in backend
export async function verifySellerExists(sellerId) {
  try {
    console.log('🔍 SellerService: Verifying seller exists:', sellerId);
    
    // Try to get seller products to verify seller exists
    const response = await api.get(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/products`);
    console.log('✅ SellerService: Seller exists and is accessible');
    return true;
  } catch (error) {
    console.error('❌ SellerService: Seller verification failed:', error);
    
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
    console.log('🔍 SellerService: Adding product to catalogue...');
    console.log('🔍 SellerService: Seller ID:', sellerId);
    
    // Prepare product data as JSON (backend now expects application/json)
    const payload = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stockQuantity: productData.stockQuantity,
      categoryId: productData.categoryId,
      imageUrls: productData.imageUrls || []
    };
    
    console.log('🔍 SellerService: Product payload:', {
      ...payload,
      imageUrlsCount: payload.imageUrls.length
    });
    
    console.log('🔍 SellerService: Making request to:', `${API_BASE_URL}${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/catalogue`);
    
    const response = await api.post(`${API_ENDPOINTS.SELLER.CATALOGUE}/${sellerId}/catalogue`, payload);
    console.log('✅ SellerService: Product added to catalogue successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to add product to catalogue:', error);
    
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
    console.log('🔍 SellerService: Updating product in catalogue...');
    
    // Prepare product data as JSON (backend now expects application/json)
    const payload = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stockQuantity: productData.stockQuantity,
      categoryId: productData.categoryId,
      imageUrls: productData.imageUrls || []
    };
    
    console.log('🔍 SellerService: Product update payload:', {
      ...payload,
      imageUrlsCount: payload.imageUrls.length
    });
    
    const response = await api.put(`${API_ENDPOINTS.SELLER.UPDATE}/${productId}/catalogue`, payload);
    console.log('✅ SellerService: Product updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to update product:', error);
    
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
    console.log('🔍 SellerService: Updating seller basic information...');
    console.log('🔍 SellerService: Seller ID:', sellerId);
    console.log('🔍 SellerService: Seller data received:', sellerData);
    
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add fields that are being updated (only basic seller info, not bank details)
    if (sellerData.catalogueName) {
      formData.append('catalogueName', sellerData.catalogueName);
      console.log('🔍 SellerService: Added catalogueName:', sellerData.catalogueName);
    }
    if (sellerData.storeDescription) {
      formData.append('storeDescription', sellerData.storeDescription);
      console.log('🔍 SellerService: Added storeDescription:', sellerData.storeDescription);
    }
    if (sellerData.phoneNumber) {
      formData.append('phoneNumber', sellerData.phoneNumber);
      console.log('🔍 SellerService: Added phoneNumber:', sellerData.phoneNumber);
    }
    if (sellerData.whatsappNumber) {
      formData.append('whatsappNumber', sellerData.whatsappNumber);
      console.log('🔍 SellerService: Added whatsappNumber:', sellerData.whatsappNumber);
    }
    if (sellerData.location) {
      formData.append('location', sellerData.location);
      console.log('🔍 SellerService: Added location:', sellerData.location);
    }
    
    // Add catalogue cover if provided
    if (sellerData.catalogueCover) {
      formData.append('catalogueCover', sellerData.catalogueCover);
      console.log('🔍 SellerService: Added catalogueCover:', sellerData.catalogueCover);
    }
    
    // Create a new axios instance for multipart/form-data
    const multipartApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // Longer timeout for file uploads
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Add auth token
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (token) {
      multipartApi.defaults.headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await multipartApi.put(`${API_ENDPOINTS.SELLER.UPDATE}/${sellerId}`, formData);
    console.log('✅ SellerService: Seller basic information updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to update seller basic information:', error);
    throw new Error(error.response?.data?.message || 'Failed to update seller information.');
  }
}

export async function deleteProduct(productId) {
  try {
    console.log('🔍 SellerService: Deleting product:', productId);
    
    const response = await api.delete(`${API_ENDPOINTS.SELLER.DELETE_PRODUCT}/${productId}`);
    console.log('✅ SellerService: Product deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to delete product:', error);
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
    console.log('🔍 ProductService: Fetching all products...');
    
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
    console.log('✅ ProductService: Products fetched successfully');
    return response.data;
  } catch (error) {
    console.error('❌ ProductService: Failed to fetch products:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products.');
  }
}

export async function searchProducts(query, page = 1, limit = 10) {
  try {
    console.log('🔍 ProductService: Searching products with query:', query);
    
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
    console.log('✅ ProductService: Search successful');
    return response.data;
  } catch (error) {
    console.error('❌ ProductService: Failed to search products:', error);
    throw new Error(error.response?.data?.message || 'Failed to search products.');
  }
}

export async function getProductBySlug(slug) {
  try {
    console.log('🔍 ProductService: Fetching product by slug:', slug);
    console.log('🔍 ProductService: Full URL:', `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BY_SLUG}/${slug}`);
    
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.BY_SLUG}/${slug}`);
    console.log('✅ ProductService: Product fetched successfully');
    return response.data;
  } catch (error) {
    console.error('❌ ProductService: Failed to fetch product:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product.');
  }
}

// Test function to verify endpoint functionality
export const testProductEndpoints = async () => {
  try {
    console.log('🔍 Testing product endpoints...');
    
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.ALL}?page=1&limit=1`);
    console.log('✅ Product endpoints are functional');
    return {
      success: true,
      message: 'Product endpoints are functional'
    };
  } catch (error) {
    console.error('❌ Endpoint test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ===== CART SERVICES =====

export async function getCart() {
  try {
    console.log('🔍 CartService: Fetching user cart...');
    
    const response = await api.get(API_ENDPOINTS.CART.GET);
    
    console.log('✅ CartService: Cart fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to fetch cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch cart.');
  }
}

export async function addToCart(cartId, items) {
  try {
    console.log('🔍 CartService: Adding items to cart:', { cartId, items });
    
    const payload = {
      cartId: cartId,
      items: items
    };
    
    const response = await api.post(API_ENDPOINTS.CART.ADD, payload);
    
    console.log('✅ CartService: Items added to cart successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to add items to cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to add items to cart.');
  }
}

export async function updateCartItemQuantity(itemId, quantity) {
  try {
    console.log('🔍 CartService: Updating cart item quantity:', { itemId, quantity });
    
    const response = await api.patch(`${API_ENDPOINTS.CART.UPDATE_ITEM}/${itemId}`, {
      quantity
    });
    
    console.log('✅ CartService: Cart item quantity updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to update cart item quantity:', error);
    throw new Error(error.response?.data?.message || 'Failed to update cart item quantity.');
  }
}

export async function removeFromCart(itemId) {
  try {
    console.log('🔍 CartService: Removing item from cart:', itemId);
    
    const response = await api.delete(`${API_ENDPOINTS.CART.REMOVE_ITEM}/${itemId}`);
    
    console.log('✅ CartService: Item removed from cart successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to remove item from cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart.');
  }
}

export async function clearCart() {
  try {
    console.log('🔍 CartService: Clearing cart...');
    
    const response = await api.delete(API_ENDPOINTS.CART.CLEAR);
    
    console.log('✅ CartService: Cart cleared successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to clear cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to clear cart.');
  }
}

// ===== CATEGORY SERVICES =====

export async function getAllCategories() {
  try {
    console.log('🔍 CategoryService: Fetching all categories...');
    
    const response = await api.get(API_ENDPOINTS.CATEGORIES.ALL);
    
    console.log('✅ CategoryService: Categories fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CategoryService: Failed to fetch categories:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
  }
}

export async function getCategoriesOnly() {
  try {
    console.log('🔍 CategoryService: Fetching categories only...');
    
    const response = await api.get(API_ENDPOINTS.CATEGORIES.ONLY);
    
    console.log('✅ CategoryService: Categories fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CategoryService: Failed to fetch categories:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
  }
}

export async function getCategoryById(categoryId) {
  try {
    console.log('🔍 CategoryService: Fetching category by ID:', categoryId);
    
    const response = await api.get(`${API_ENDPOINTS.CATEGORIES.BY_ID}/${categoryId}`);
    
    console.log('✅ CategoryService: Category fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CategoryService: Failed to fetch category:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch category.');
  }
}

export async function createCategories(categoryNames) {
  try {
    console.log('🔍 CategoryService: Creating categories:', categoryNames);
    
    const payload = {
      names: categoryNames
    };
    
    const response = await api.post(API_ENDPOINTS.CATEGORIES.CREATE, payload);
    
    console.log('✅ CategoryService: Categories created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CategoryService: Failed to create categories:', error);
    throw new Error(error.response?.data?.message || 'Failed to create categories.');
  }
}

export async function updateCategory(categoryId, categoryData) {
  try {
    console.log('🔍 CategoryService: Updating category:', { categoryId, categoryData });
    
    const response = await api.put(`${API_ENDPOINTS.CATEGORIES.UPDATE}/${categoryId}`, categoryData);
    
    console.log('✅ CategoryService: Category updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CategoryService: Failed to update category:', error);
    throw new Error(error.response?.data?.message || 'Failed to update category.');
  }
}

export async function deleteCategory(categoryId) {
  try {
    console.log('🔍 CategoryService: Deleting category:', categoryId);
    
    const response = await api.delete(`${API_ENDPOINTS.CATEGORIES.DELETE}/${categoryId}`);
    
    console.log('✅ CategoryService: Category deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CategoryService: Failed to delete category:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete category.');
  }
}

// Seller Orders Functions
export const getSellerOrders = async (sellerId, retryCount = 0) => {
  const requestKey = `seller-orders-${sellerId}`;
  
  // If there's already a pending request for this seller, wait for it
  if (pendingRequests.has(requestKey)) {
    console.log('⏳ SellerService: Waiting for pending orders request...');
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {
      console.log('📦 SellerService: Fetching seller orders for seller:', sellerId);
      console.log('📦 SellerService: Full URL:', `/orders/${sellerId}/seller`);
      
      // Validate sellerId before making the request
      if (!sellerId) {
        throw new Error('Seller ID is required');
      }
      
      const response = await api.get(`/orders/${sellerId}/seller`);
      console.log('✅ SellerService: Seller orders fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ SellerService: Failed to fetch seller orders:', error);
      console.error('❌ SellerService: Error details:', error.response?.data);
      console.error('❌ SellerService: Status:', error.response?.status);
      
      // Retry logic for network errors
      if (retryCount < 2 && (
        error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' ||
        error.response?.status >= 500 ||
        error.message.includes('timeout')
      )) {
        console.log(`🔄 SellerService: Retrying orders request (attempt ${retryCount + 1}/2)`);
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
    console.log('📦 SellerService: Fetching order details for order:', orderId);
    const response = await api.get(`/orders/${orderId}`);
    console.log('✅ SellerService: Order details fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to fetch order details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch order details');
  }
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  try {
    console.log('📦 SellerService: Updating order status:', { orderId, orderStatus });
    const response = await api.put(`/orders/${orderId}/status`, { orderStatus });
    console.log('✅ SellerService: Order status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SellerService: Failed to update order status:', error);
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
    console.log('🔍 TransferService: Initiating transfer for order seller:', orderSellerId);
    
    const response = await api.post('/payments/transfer', {
      orderSellerId: orderSellerId
    });
    
    console.log('✅ TransferService: Transfer initiated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ TransferService: Failed to initiate transfer:', error);
    throw new Error(error.response?.data?.message || 'Failed to initiate transfer.');
  }
}

