// Centralized fetch utility for API calls with mobile support
import { getApiUrl } from './apiConfig';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const apiUrl = getApiUrl();
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  return fetch(url, {
    ...options,
    headers,
  });
};

export default apiFetch;

