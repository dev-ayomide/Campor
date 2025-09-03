import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      firstName: userData.firstName,
      lastName: userData.lastName,
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
      verificationCode
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
    
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
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
    const response = await api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile.');
  }
}

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
