// Helper to safely access env variables in both Vite and Node.js
const getEnv = (key: string, defaultValue: string): string => {
  // Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || defaultValue;
  }
  // Node.js environment (SSG)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

/**
 * Medusa Backend URL.
 * Set VITE_MEDUSA_BACKEND_URL in .env file.
 */
export const MEDUSA_BACKEND_URL = getEnv('VITE_MEDUSA_BACKEND_URL', 'http://localhost:9000');

/**
 * Stripe Public Key.
 * Set VITE_STRIPE_PUBLIC_KEY in .env file (format: pk_test_...).
 * If not provided, Stripe features will operate in placeholder mode.
 */
export const STRIPE_PUBLIC_KEY = getEnv('VITE_STRIPE_PUBLIC_KEY', '');

export const API_CONFIG = {
  baseUrl: MEDUSA_BACKEND_URL,
  endpoints: {
    products: '/store/products',
    collections: '/store/collections',
    cart: '/store/carts',
    auth: '/store/auth',
    customers: '/store/customers',
    regions: '/store/regions',
    orders: '/store/orders'
  }
};
