export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://campor-service-production.up.railway.app';
export const RUN_EMAIL_REGEX = /^[^\s@]+@run\.edu\.ng$/i;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    VERIFY_EMAIL: '/api/v1/auth/email/verify',
    ME: '/api/v1/auth/me',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  USER: {
    PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
  },
  SELLER: {
    ONBOARDING: '/api/v1/seller/onboarding',
    PROFILE: '/api/v1/seller/profile',
  }
};
