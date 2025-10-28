// Centralized fetch utility for API calls with mobile support

const getApiUrl = () => {
  const storedApiUrl = localStorage.getItem('apiUrl');
  if (storedApiUrl) {
    return storedApiUrl;
  }
  
  const hostname = window.location.hostname;
  
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:8099/api`;
  }
  
  return 'http://localhost:8099/api';
};

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

