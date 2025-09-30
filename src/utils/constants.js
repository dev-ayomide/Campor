// Validate that API_BASE_URL is set
if (!import.meta.env.VITE_API_BASE_URL) {
  // Environment variable not set - this is a development configuration issue
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const RUN_EMAIL_REGEX = /^[^\s@]+@run\.edu\.ng$/i;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/email/verify',
    RESEND_VERIFICATION: '/auth/email/resend-verification',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/password/forgot',
    RESET_PASSWORD: '/auth/password/reset',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/update',
    GET_BY_ID: '/users',
  },
  SELLER: {
    REGISTER: '/sellers/register',
    ONBOARDING: '/seller/onboarding',
    PROFILE: '/seller/profile',
    CATALOGUE: '/sellers',
    UPDATE: '/sellers',
    DELETE_PRODUCT: '/sellers',
  },
  PRODUCTS: {
    ALL: '/products/all',
    SEARCH: '/products/search',
    BY_SLUG: '/products',
  },
  CATEGORIES: {
    ALL: '/categories/all',
    ONLY: '/categories/only',
    BY_ID: '/categories',
    CREATE: '/categories/create',
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE_ITEM: '/cart/item/update',
    REMOVE_ITEM: '/cart/item/remove',
    CLEAR: '/cart/clear',
    FIX: '/cart',
  },
  PAYMENTS: {
    INITIATE: '/payments/initiate',
    VERIFY: '/payments/verify',
  },
  NEWSLETTER: {
    SUBSCRIBE: '/users/newsletter/subscribe',
    UNSUBSCRIBE: '/users/newsletter/unsubscribe',
    STATUS: '/users/newsletter/status',
  },
  WISHLIST: {
    ADD: '/wishlist/add',
    GET: '/wishlist',
    REMOVE: '/wishlist/remove',
  },
  ORDERS: {
    USER: '/orders/user',
    SELLER: '/orders',
    CREATE: '/orders',
    UPDATE_STATUS: '/orders',
  }
};
