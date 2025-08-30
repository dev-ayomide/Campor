import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🔍 Axios interceptor: Response error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔍 Axios interceptor: 401 error detected, checking if it\'s a login issue');
      
      // Only clear storage and redirect if this is not a login request
      const isLoginRequest = error.config?.url?.includes('/login');
      const isRegisterRequest = error.config?.url?.includes('/register');
      const isVerifyRequest = error.config?.url?.includes('/verify');
      
      if (!isLoginRequest && !isRegisterRequest && !isVerifyRequest) {
        console.log('🔍 Axios interceptor: Clearing storage and redirecting to auth');
        // Token expired or invalid, clear local storage
        localStorage.removeItem('campor_token');
        localStorage.removeItem('campor_user');
        window.location.href = '/auth';
      } else {
        console.log('🔍 Axios interceptor: This is an auth request, not clearing storage');
      }
    }
    return Promise.reject(error);
  }
);

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
      const testResponse = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, { timeout: 5000 });
      console.log('✅ Backend is accessible (expected 401 for unauthenticated request)');
    } catch (testError) {
      if (testError.response?.status === 401) {
        console.log('✅ Backend is accessible (401 is expected for unauthenticated request)');
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
      const userResponse = await tempApi.get(API_ENDPOINTS.AUTH.ME);
      userData = userResponse.data;
      
      console.log('✅ User profile fetched successfully:', userData);
    } catch (profileError) {
      console.error('❌ Failed to fetch user profile:', profileError.response?.status, profileError.response?.data);
      console.error('❌ Profile error details:', profileError);
      
      // If profile fetch fails, still return the token but log the error
      console.warn('⚠️ Returning token without user profile due to fetch error');
      return {
        user: null,
        token: token,
        profileError: profileError.message
      };
    }
    
    // Check if userData exists before transforming
    if (!userData) {
      console.error('❌ No user data received from profile fetch');
      return {
        user: null,
        token: token,
        profileError: 'No user data received'
      };
    }
    
    // Transform the user data to match our frontend expectations
    const transformedUser = {
      id: userData.id || 'unknown',
      firstName: userData.firstName || 'Unknown',
      lastName: userData.lastName || 'User',
      fullName: `${userData.firstName || 'Unknown'} ${userData.lastName || 'User'}`.trim(),
      email: userData.email || 'unknown@email.com',
      role: userData.role || 'CUSTOMER',
      sellerCompleted: userData.sellerCompleted || false,
      seller: userData.seller || null,
      cart: userData.cart || null,
    };
    
    console.log('✅ User data transformed successfully:', transformedUser);
    
    return {
      user: transformedUser,
      token: token,
    };
  } catch (error) {
    console.error('❌ Login error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    let errorMessage = 'Login failed. Please check your credentials.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 403) {
      errorMessage = 'Email not verified. Please check your email for verification code.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid email or password.';
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid login data. Please check your information.';
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    throw new Error(errorMessage);
  }
}

export async function register(payload) {
  try {
    console.log('🔍 Registration attempt for:', payload.email);
    
    // Backend expects firstName, lastName, email, password
    const apiPayload = {
      firstName: payload.fullName.split(' ')[0] || payload.fullName,
      lastName: payload.fullName.split(' ').slice(1).join(' ') || '',
      email: payload.email,
      password: payload.password,
    };
    
    console.log('🔍 Registration payload:', apiPayload);
    
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, apiPayload);
    console.log('✅ Registration successful:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Registration error:', error.response?.status, error.response?.data);
    
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 409) {
      errorMessage = 'User with this email already exists.';
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid registration data. Please check your information.';
    }
    
    throw new Error(errorMessage);
  }
}

export async function verifyEmail(email, code) {
  try {
    console.log('🔍 Email verification attempt for:', email);
    
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, code });
    console.log('✅ Email verification successful:', response.data);
    
    // Backend returns message and token upon successful verification
    return response.data;
  } catch (error) {
    console.error('❌ Email verification error:', error.response?.status, error.response?.data);
    
    let errorMessage = 'Email verification failed. Please check your code.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    throw new Error(errorMessage);
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    
    // Transform the response to match our frontend expectations
    const transformedUser = {
      id: response.data.id,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      fullName: `${response.data.firstName} ${response.data.lastName}`.trim(),
      email: response.data.email,
      role: response.data.role,
      sellerCompleted: response.data.sellerCompleted || false,
      seller: response.data.seller,
      cart: response.data.cart,
    };
    
    return transformedUser;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile.');
  }
}

export async function forgotPassword(email) {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send reset email.');
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reset password.');
  }
}

export async function resendVerificationCode(email) {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to resend verification code.');
  }
}

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

export async function getAllProducts(page = 1, limit = 10, filters = null) {
  try {
    console.log('🔍 ProductService: Fetching products with params:', { page, limit, filters });
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }
    
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.ALL}?${params}`);
    console.log('✅ ProductService: Products fetched successfully:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ ProductService: Failed to fetch products:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products.');
  }
}

export async function searchProducts(query) {
  try {
    console.log('🔍 ProductService: Searching products for:', query);
    
    const params = new URLSearchParams({ q: query });
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.SEARCH}?${params}`);
    
    console.log('✅ ProductService: Search results fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ ProductService: Failed to search products:', error);
    throw new Error(error.response?.data?.message || 'Failed to search products.');
  }
}

export async function getProductById(id) {
  try {
    console.log('🔍 ProductService: Fetching product details for ID:', id);
    
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.BY_ID}/${id}`);
    
    console.log('✅ ProductService: Product details fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ ProductService: Failed to fetch product details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product details.');
  }
}

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
    
    const payload = { quantity: quantity };
    const response = await api.patch(`${API_ENDPOINTS.CART.UPDATE_ITEM}/${itemId}`, payload);
    
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
