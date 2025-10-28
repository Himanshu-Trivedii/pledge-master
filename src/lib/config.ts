// API Configuration - Dynamically set based on environment
export const getApiUrl = () => {
  // Check if we're on mobile or if API URL is configured
  const storedApiUrl = localStorage.getItem('apiUrl');
  if (storedApiUrl) {
    return storedApiUrl;
  }
  
  // Auto-detect if we're accessing from mobile device on same network
  const hostname = window.location.hostname;
  
  // If accessing via IP address (mobile), use that IP for backend
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:8099/api`;
  }
  
  // Default: localhost for development
  return 'http://localhost:8099/api';
};

export const API_BASE_URL = getApiUrl();

