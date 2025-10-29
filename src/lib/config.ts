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

// Owner-configurable defaults
const DEFAULT_INTEREST_RATE_KEY = 'defaultInterestRate';

export function setDefaultInterestRate(rate: number) {
  if (Number.isFinite(rate) && rate > 0) {
    localStorage.setItem(DEFAULT_INTEREST_RATE_KEY, String(rate));
  }
}

export function getDefaultInterestRate(fallback = 2): number {
  const stored = localStorage.getItem(DEFAULT_INTEREST_RATE_KEY);
  const parsed = stored ? parseFloat(stored) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// Cloudinary configuration (unsigned upload)
export const CLOUDINARY_CLOUD_NAME = 'djka67lh3';
export const CLOUDINARY_UPLOAD_PRESET = 'jewellery';

