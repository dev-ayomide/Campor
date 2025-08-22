// simple service that uses axios if you set API_BASE_URL, otherwise falls back to a mock
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export async function login(email, password) {
  // Mock when using default placeholder backend URL
  if (API_BASE_URL.includes('your-backend')) {
    // For testing: seller users (emails containing 'seller') will have seller status
    const isSeller = email.toLowerCase().includes('seller');
    
    return new Promise((resolve) =>
      setTimeout(
        () => {
          const user = { 
            id: 'u1', 
            name: 'Sofia Havertz', 
            email,
            isSeller,
            ...(isSeller && {
              sellerProfile: {
                storeName: 'Mock Store',
                storeDescription: 'A mock seller store for testing'
              }
            })
          };
          
          console.log('🔍 Mock Login - User Role:', isSeller ? 'Seller' : 'Buyer');
          console.log('💡 Testing tip: Use email containing "seller" to test seller features');
          
          resolve({
            user,
            token: 'mock-token-123',
          });
        },
        600
      )
    );
  }
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function register(payload) {
  if (API_BASE_URL.includes('your-backend')) {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            user: { id: 'u2', name: payload.fullName, email: payload.email },
            token: 'mock-token-456',
          }),
        800
      )
    );
  }
  const res = await api.post('/auth/register', payload);
  return res.data;
}

export async function verifyEmail(email, code) {
  if (API_BASE_URL.includes('your-backend')) {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 400)
    );
  }
  const res = await api.post('/auth/verify', { email, code });
  return res.data;
}
