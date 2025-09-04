import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncateText = (text, limit = 100) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.substring(0, limit) + '...';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const getImageUrl = (imagePath, opts = { auto: true }) => {
  if (!imagePath) return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#f3f4f6"/><text x="200" y="210" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="16">Product</text></svg>');
  // Absolute URL
  if (imagePath.startsWith('http')) {
    // If Cloudinary URL, add delivery transformations
    if (imagePath.includes('res.cloudinary.com') && opts.auto !== false) {
      return imagePath.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    return imagePath;
  }
  // Data URL should be returned as-is
  if (imagePath.startsWith('data:')) return imagePath;
  // Derive API origin even if VITE_API_URL includes /api suffix
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  // Ensure imagePath starts with /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${origin}${path}`;
};