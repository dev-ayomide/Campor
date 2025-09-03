export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://campor-aa1452bb8116.herokuapp.com/api/v1';
export const RUN_EMAIL_REGEX = /^[^\s@]+@run\.edu\.ng$/i;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/email/verify',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  SELLER: {
    ONBOARDING: '/seller/onboarding',
    PROFILE: '/seller/profile',
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
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE_ITEM: '/cart/item/update',
    REMOVE_ITEM: '/cart/item/remove',
    CLEAR: '/cart/clear',
  }
};
