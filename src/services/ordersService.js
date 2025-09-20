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

// Get seller orders
export async function getSellerOrders(sellerId) {
  try {
    const response = await api.get(`/orders/${sellerId}/seller`);
    
    const payload = response.data;
    // Support both shapes: Array or { data: Array }
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    if (error.response?.status === 403) {
      throw new Error('Forbidden - Seller access required');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch seller orders.');
  }
}

// Get order details
export async function getOrderDetails(orderId) {
  try {
    console.log('📦 OrdersService: Fetching order details for order:', orderId);
    const response = await api.get(`/orders/${orderId}`);
    console.log('✅ OrdersService: Order details fetched successfully:', response.data);
    
    const payload = response.data;
    // Support both shapes: Object or { data: Object }
    if (payload && payload.data) return payload.data;
    return payload;
  } catch (error) {
    console.error('❌ OrdersService: Failed to fetch order details:', error);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    if (error.response?.status === 404) {
      throw new Error('Order not found');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch order details.');
  }
}

// Update order status
export async function updateOrderStatus(orderId, orderStatus) {
  try {
    console.log('📦 OrdersService: Updating order status:', { orderId, orderStatus });
    const response = await api.put(`/orders/${orderId}/status`, { orderStatus });
    console.log('✅ OrdersService: Order status updated successfully:', response.data);
    
    const payload = response.data;
    // Support both shapes: Object or { data: Object }
    if (payload && payload.data) return payload.data;
    return payload;
  } catch (error) {
    console.error('❌ OrdersService: Failed to update order status:', error);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    if (error.response?.status === 403) {
      throw new Error('Forbidden - Seller access required');
    }
    if (error.response?.status === 404) {
      throw new Error('Order not found');
    }
    throw new Error(error.response?.data?.message || 'Failed to update order status.');
  }
}

// Note: Order creation is handled by backend webhook after successful payment
// Frontend only needs to verify payment and clear cart


