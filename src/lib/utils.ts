import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number in Indian locale format (e.g., 100000 -> 1,00,000)
 * @param value - The number to format
 * @param options - Optional formatting options
 * @returns Formatted string
 */
export function formatIndianCurrency(
  value: number | string | null | undefined,
  options?: {
    showCurrency?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  if (value === null || value === undefined || value === '') {
    return options?.showCurrency ? '₹0' : '0';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return options?.showCurrency ? '₹0' : '0';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(numValue);

  return options?.showCurrency ? `₹${formatted}` : formatted;
}

export async function uploadToCloudinary(fileOrDataUrl: File | string, folder?: string): Promise<string> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = await import('./config');
  const form = new FormData();
  form.append('upload_preset', (CLOUDINARY_UPLOAD_PRESET as any) || 'jewellery');
  if (folder) form.append('folder', folder);
  form.append('file', fileOrDataUrl as any);

  const endpoint = `https://api.cloudinary.com/v1_1/${(CLOUDINARY_CLOUD_NAME as any) || 'djka67lh3'}/upload`;
  const res = await fetch(endpoint, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.secure_url || data.url;
}