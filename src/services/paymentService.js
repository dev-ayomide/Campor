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

// ===== PAYMENT SERVICES =====

/**
 * Initiate a payment transaction
 * @param {string} email - Customer email address
 * @param {string} amount - Payment amount in kobo (multiply by 100)
 * @param {string} cartId - Cart ID for the transaction
 * @returns {Promise<Object>} Payment response with authorization URL
 */
export async function initiatePayment(email, amount, cartId) {
  try {
    console.log('🔍 PaymentService: Initiating payment...', { email, amount, cartId });
    
    // Validate required parameters
    if (!email) {
      throw new Error('Email is required for payment initiation');
    }
    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required for payment initiation');
    }
    if (!cartId) {
      throw new Error('Cart ID is required for payment initiation');
    }
    
    // Convert amount to kobo (Paystack expects amount in kobo)
    const amountInKobo = Math.round(parseFloat(amount) * 100);
    
    const payload = {
      email: email,
      amount: amountInKobo.toString(),
      metadata: {
        cartId: cartId
      }
    };
    
    console.log('🔍 PaymentService: Payment payload:', payload);
    
    const response = await api.post(API_ENDPOINTS.PAYMENTS.INITIATE, payload);
    
    console.log('✅ PaymentService: Payment initiated successfully:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ PaymentService: Failed to initiate payment:', error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid payment data. Please check your information.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Payment service is currently unavailable. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to initiate payment. Please try again.');
    }
  }
}

/**
 * Redirect user to payment URL
 * @param {string} authorizationUrl - The payment authorization URL from Paystack
 */
export function redirectToPayment(authorizationUrl) {
  try {
    console.log('🔍 PaymentService: Redirecting to payment URL:', authorizationUrl);
    
    if (!authorizationUrl) {
      throw new Error('Payment URL is required for redirection');
    }
    
    // Redirect to payment page
    window.location.href = authorizationUrl;
  } catch (error) {
    console.error('❌ PaymentService: Failed to redirect to payment:', error);
    throw new Error('Failed to redirect to payment page. Please try again.');
  }
}

/**
 * Helper function to format amount for display
 * @param {number} amount - Amount in naira
 * @returns {string} Formatted amount string
 */
export function formatPaymentAmount(amount) {
  return `₦${parseFloat(amount).toLocaleString()}`;
}

/**
 * Helper function to validate payment amount
 * @param {number} amount - Amount to validate
 * @returns {boolean} True if amount is valid
 */
export function validatePaymentAmount(amount) {
  return amount && amount > 0 && !isNaN(amount);
}

/**
 * Handle payment success callback
 * @param {string} reference - Payment reference from Paystack
 * @returns {Promise<Object>} Payment verification response
 */
export async function handlePaymentSuccess(reference) {
  try {
    console.log('🔍 PaymentService: Handling payment success:', { reference });
    
    if (!reference) {
      throw new Error('Payment reference is required');
    }
    
    // Verify payment with backend (which calls Paystack API)
    const verificationResult = await verifyPayment(reference);
    
    console.log('✅ PaymentService: Payment verified successfully:', verificationResult);
    
    return verificationResult;
  } catch (error) {
    console.error('❌ PaymentService: Failed to handle payment success:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to process payment success.');
  }
}

/**
 * Verify payment status with Paystack
 * @param {string} reference - Payment reference
 * @returns {Promise<Object>} Payment verification response
 */
export async function verifyPayment(reference) {
  try {
    console.log('🔍 PaymentService: Verifying payment:', reference);
    
    if (!reference) {
      throw new Error('Payment reference is required');
    }
    
    const response = await api.get(`/payments/verify/${reference}`);
    
    console.log('✅ PaymentService: Payment verified successfully:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ PaymentService: Failed to verify payment:', error);
    throw new Error(error.response?.data?.message || 'Failed to verify payment.');
  }
}

export default {
  initiatePayment,
  redirectToPayment,
  formatPaymentAmount,
  validatePaymentAmount,
  handlePaymentSuccess,
  verifyPayment
};
