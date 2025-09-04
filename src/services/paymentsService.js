import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export async function initiatePayment({ email, amount, cartId }) {
  try {
    const payload = {
      email,
      amount: String(amount), // backend expects string
      metadata: { cartId },
    };
    const response = await api.post(API_ENDPOINTS.PAYMENTS.INITIATE, payload);
    // Expecting { authorization_url, access_code, reference }
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(error.response?.data?.message || 'Failed to initiate payment.');
  }
}


