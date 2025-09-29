// Bank resolution and bank list service
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance for bank services
const bankApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
bankApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rate limiting for account resolution
let lastResolutionTime = 0;
const RESOLUTION_COOLDOWN = 5000; // 5 seconds cooldown between resolutions

class BankResolutionService {
  // Get list of available banks
  async getBanksList(currency = 'NGN') {
    try {
      
      const response = await bankApi.get('/payments/banks/list', {
        params: { currency }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch banks list.');
    }
  }

  // Resolve bank account details with rate limiting
  async resolveAccount(accountNumber, bankCode) {
    try {
      // Check rate limiting
      const now = Date.now();
      const timeSinceLastResolution = now - lastResolutionTime;
      
      if (timeSinceLastResolution < RESOLUTION_COOLDOWN) {
        const waitTime = RESOLUTION_COOLDOWN - timeSinceLastResolution;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      
      const response = await bankApi.get('/payments/account/resolve', {
        params: {
          account_number: accountNumber,
          bank_code: bankCode
        }
      });
      
      lastResolutionTime = Date.now();
      return response.data;
    } catch (error) {
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Invalid account number or bank code. Please check your details.';
        throw new Error(errorMsg);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait 5 seconds before trying again.');
      } else if (error.response?.status === 500) {
        const serverError = error.response?.data?.message || 'Server error occurred while resolving account.';
        throw new Error(`Server error: ${serverError}. Please try again or contact support if the issue persists.`);
      } else if (error.response?.status === 404) {
        throw new Error('Bank resolution service not found. Please try again later.');
      } else if (error.response?.status === 503) {
        throw new Error('Bank resolution service is temporarily unavailable. Please try again later.');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to resolve account details.';
        throw new Error(errorMsg);
      }
    }
  }

  // Update seller bank details
  async updateSellerBankDetails(sellerId, bankDetails) {
    try {
      
      const response = await bankApi.patch(`/sellers/${sellerId}/bank-details`, bankDetails);
      
      return response.data;
    } catch (error) {
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid bank details provided.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You must be a seller to update bank details.');
      } else if (error.response?.status === 404) {
        throw new Error('Seller not found.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to update bank details.');
      }
    }
  }

  // Helper method to find bank by code
  findBankByCode(banks, bankCode) {
    return banks.find(bank => bank.code === bankCode);
  }

  // Helper method to find bank by name
  findBankByName(banks, bankName) {
    return banks.find(bank => bank.name.toLowerCase() === bankName.toLowerCase());
  }
}

export const bankResolutionService = new BankResolutionService();
export default bankResolutionService;
