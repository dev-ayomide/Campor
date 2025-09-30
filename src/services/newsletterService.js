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

export async function subscribeToNewsletter(email) {
  const response = await api.post(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, { email });
  return response.data;
}

export async function unsubscribeFromNewsletter(email) {
  const response = await api.post(API_ENDPOINTS.NEWSLETTER.UNSUBSCRIBE, { email });
  return response.data;
}

export async function getNewsletterStatus(email) {
  const response = await api.get(`${API_ENDPOINTS.NEWSLETTER.STATUS}?email=${encodeURIComponent(email)}`);
  return response.data;
}


