// @ts-ignore
import MedusaSDK from '@medusajs/js-sdk';
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from './config';

//(Vite vs Node/tsx)
const Medusa = (MedusaSDK as any).default || MedusaSDK;

/**
 * Official Medusa SDK Instance.
 * We'll gradually migrate all API calls to use this.
 */
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
  debug: true,
});

export interface RequestOptions extends RequestInit {
  idempotencyKey?: string;
  retries?: number;
}

export class ApiError extends Error {
  public status: number;
  public override message: string;
  public data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.message = message;
    this.data = data;
    this.name = 'ApiError';
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const request = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { idempotencyKey, retries = 3, ...fetchOptions } = options;

  const url = `${MEDUSA_BACKEND_URL}${path}`;

  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-publishable-api-key', MEDUSA_PUBLISHABLE_KEY);

  // Add Idempotency-Key for POST
  if (fetchOptions.method === 'POST' && idempotencyKey) {
    headers.set('Idempotency-Key', idempotencyKey);
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    // Include credentials only in browser environment
    credentials: typeof window !== 'undefined' ? 'include' : 'omit',
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || 'Errore API',
          errorData,
        );
      }

      // 204 No Content
      if (response.status === 204) return {} as T;

      return await response.json();
    } catch (error: any) {
      lastError = error;

      // Retry on 5xx
      const isNetworkError = error instanceof TypeError;
      const isServerError = error instanceof ApiError && error.status >= 500;

      if ((isNetworkError || isServerError) && attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Esponenziale: 1s, 2s, 4s
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Unknown error during request');
};

export const medusa = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),

  put: <T>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};
