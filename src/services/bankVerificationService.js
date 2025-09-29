import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance for bank verification
const bankApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
bankApi.interceptors.request.use(
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

/**
 * Verify bank account details and get account name
 * @param {string} accountNumber - The bank account number
 * @param {string} bankCode - The bank code
 * @returns {Promise<{success: boolean, data?: {account_name: string}, error?: string}>}
 */
export async function verifyBankAccount(accountNumber, bankCode) {
  try {
    
    // Validate inputs
    if (!accountNumber || !bankCode) {
      throw new Error('Account number and bank code are required');
    }
    
    // Clean account number (remove spaces, dashes, etc.)
    const cleanAccountNumber = accountNumber.replace(/\D/g, '');
    
    if (cleanAccountNumber.length !== 10) {
      throw new Error('Account number must be exactly 10 digits');
    }
    
    // Make request to backend API
    const response = await bankApi.get('/payments/account/resolve', {
      params: {
        account_number: cleanAccountNumber,
        bank_code: bankCode
      }
    });
    
    if (response.data.message === 'Account resolved successfully') {
      return {
        success: true,
        data: {
          account_name: response.data.data.account_name,
          account_number: response.data.data.account_number,
          bank_id: response.data.data.bank_id
        }
      };
    } else {
      throw new Error(response.data.message || 'Account verification failed');
    }
    
  } catch (error) {
    
    if (error.response?.status === 400) {
      return {
        success: false,
        error: 'Invalid account number or bank code. Please check your details.'
      };
    } else if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Authentication required. Please log in again.'
      };
    } else if (error.response?.status === 500) {
      return {
        success: false,
        error: 'Bank verification service temporarily unavailable. Please try again later.'
      };
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        success: false,
        error: 'Request timeout. Please try again'
      };
    } else {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unable to verify account'
      };
    }
  }
}

/**
 * Get list of available banks
 * @param {string} currency - Currency code (default: NGN)
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function getBanksList(currency = 'NGN') {
  try {
    
    const response = await bankApi.get('/payments/banks/list', {
      params: { currency }
    });
    
    if (response.data.message === 'Banks retrieved successfully') {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch banks');
    }
    
  } catch (error) {
    
    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Authentication required. Please log in again.'
      };
    } else if (error.response?.status === 500) {
      return {
        success: false,
        error: 'Bank service temporarily unavailable. Please try again later.'
      };
    } else {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unable to fetch banks'
      };
    }
  }
}

/**
 * Get bank code from bank name using the banks list
 * @param {string} bankName - The bank name
 * @param {Array} banksList - The list of banks from API
 * @returns {string} - The bank code
 */
export function getBankCode(bankName, banksList = []) {
  const bank = banksList.find(b => b.name === bankName);
  return bank ? bank.code : '';
}

/**
 * Get bank name from bank code using the banks list
 * @param {string} bankCode - The bank code
 * @param {Array} banksList - The list of banks from API
 * @returns {string} - The bank name
 */
export function getBankName(bankCode, banksList = []) {
  const bank = banksList.find(b => b.code === bankCode);
  return bank ? bank.name : '';
}

/**
 * Validate Nigerian bank account number
 * @param {string} accountNumber - The account number to validate
 * @returns {boolean} - Whether the account number is valid
 */
export function validateAccountNumber(accountNumber) {
  if (!accountNumber) return false;
  
  const cleanNumber = accountNumber.replace(/\D/g, '');
  
  // Nigerian account numbers are exactly 10 digits
  return cleanNumber.length === 10 && /^\d{10}$/.test(cleanNumber);
}
