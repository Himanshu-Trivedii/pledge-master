// API Configuration - Dynamically set based on environment
export const getApiUrl = () => {
  // 1) Manual override from localStorage (admin-configurable at runtime)
  const storedApiUrl = (typeof window !== 'undefined') ? localStorage.getItem('apiUrl') : null;
  if (storedApiUrl && /^https?:\/\//i.test(storedApiUrl)) {
    return storedApiUrl.replace(/\/$/, '');
  }

  // 2) Environment variable (Vite): VITE_API_URL
  const envApiUrl = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  if (envApiUrl && /^https?:\/\//i.test(envApiUrl)) {
    return envApiUrl.replace(/\/$/, '');
  }

  // 3) Smart defaults based on current host (browser only)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // If not localhost/loopback, prefer using the same host on port 8099 for LAN/mobile testing
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || /^(\d+\.){3}\d+$/.test(hostname);
    if (isLocal) {
      return 'http://localhost:8099/api';
    }

    // Production default (when env not set): assume a dedicated API subdomain
    return `https://api.${hostname}/api`;
  }

  // 4) Final fallback (SSR/non-browser)
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

