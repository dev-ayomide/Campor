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

// ===== INVENTORY MANAGEMENT SERVICES =====

/**
 * Deduct inventory when order is successfully paid
 * @param {string} orderId - Order ID
 * @param {Array} orderItems - Array of order items with productId and quantity
 * @returns {Promise<Object>} Response data
 */
export async function deductInventoryOnOrderCompletion(orderId, orderItems) {
  try {
    console.log('🔍 InventoryService: Deducting inventory for order:', { orderId, orderItems });
    
    const payload = {
      orderId,
      items: orderItems.map(item => ({
        productId: item.productId || item.product?.id,
        quantity: item.quantity
      }))
    };
    
    const response = await api.post('/inventory/deduct', payload);
    
    console.log('✅ InventoryService: Inventory deducted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ InventoryService: Failed to deduct inventory:', error);
    throw new Error(error.response?.data?.message || 'Failed to deduct inventory.');
  }
}

/**
 * Update product inventory (for sellers)
 * @param {string} productId - Product ID
 * @param {number} newStockQuantity - New stock quantity
 * @returns {Promise<Object>} Response data
 */
export async function updateProductInventory(productId, newStockQuantity) {
  try {
    console.log('🔍 InventoryService: Updating product inventory:', { productId, newStockQuantity });
    
    const payload = {
      stockQuantity: newStockQuantity
    };
    
    const response = await api.patch(`/products/${productId}/inventory`, payload);
    
    console.log('✅ InventoryService: Product inventory updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ InventoryService: Failed to update product inventory:', error);
    throw new Error(error.response?.data?.message || 'Failed to update product inventory.');
  }
}

/**
 * Get inventory history for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} Inventory history
 */
export async function getInventoryHistory(productId) {
  try {
    console.log('🔍 InventoryService: Fetching inventory history for product:', productId);
    
    const response = await api.get(`/products/${productId}/inventory/history`);
    
    console.log('✅ InventoryService: Inventory history fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ InventoryService: Failed to fetch inventory history:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch inventory history.');
  }
}

/**
 * Restore inventory when order is cancelled or refunded
 * @param {string} orderId - Order ID
 * @param {Array} orderItems - Array of order items with productId and quantity
 * @returns {Promise<Object>} Response data
 */
export async function restoreInventoryOnOrderCancellation(orderId, orderItems) {
  try {
    console.log('🔍 InventoryService: Restoring inventory for cancelled order:', { orderId, orderItems });
    
    const payload = {
      orderId,
      items: orderItems.map(item => ({
        productId: item.productId || item.product?.id,
        quantity: item.quantity
      }))
    };
    
    const response = await api.post('/inventory/restore', payload);
    
    console.log('✅ InventoryService: Inventory restored successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ InventoryService: Failed to restore inventory:', error);
    throw new Error(error.response?.data?.message || 'Failed to restore inventory.');
  }
}

/**
 * Get low stock alerts for seller products
 * @param {string} sellerId - Seller ID
 * @param {number} threshold - Low stock threshold (default: 5)
 * @returns {Promise<Array>} Low stock products
 */
export async function getLowStockAlerts(sellerId, threshold = 5) {
  try {
    console.log('🔍 InventoryService: Fetching low stock alerts for seller:', { sellerId, threshold });
    
    const response = await api.get(`/sellers/${sellerId}/inventory/alerts?threshold=${threshold}`);
    
    console.log('✅ InventoryService: Low stock alerts fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ InventoryService: Failed to fetch low stock alerts:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch low stock alerts.');
  }
}

/**
 * Bulk update inventory for multiple products
 * @param {Array} inventoryUpdates - Array of {productId, stockQuantity} objects
 * @returns {Promise<Object>} Response data
 */
export async function bulkUpdateInventory(inventoryUpdates) {
  try {
    console.log('🔍 InventoryService: Bulk updating inventory:', inventoryUpdates);
    
    const payload = {
      updates: inventoryUpdates
    };
    
    const response = await api.post('/inventory/bulk-update', payload);
    
    console.log('✅ InventoryService: Bulk inventory update successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ InventoryService: Failed to bulk update inventory:', error);
    throw new Error(error.response?.data?.message || 'Failed to bulk update inventory.');
  }
}
