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

export async function getUserOrders() {
  try {
    const response = await api.get(API_ENDPOINTS.ORDERS.USER);
    const payload = response.data;
    // Support both shapes: Array or { data: Array }
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch orders.');
  }
}


