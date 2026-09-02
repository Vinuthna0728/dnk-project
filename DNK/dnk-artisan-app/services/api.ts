/**
 * DNK ARTISAN 2.0 BASE API CLIENT SERVICE
 * Centralized HTTP service using Axios with JWT interceptors,
 * AsyncStorage token persistence, and sanitized low-literacy error normalization.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, APP_CONFIG } from '../constants/Config';

// In-memory token cache for high-speed synchronous access
let inMemoryAuthToken: string | null = null;

/**
 * Set the active JWT authentication token.
 * Updates both in-memory cache and persistent AsyncStorage.
 */
export async function setAuthToken(token: string | null): Promise<void> {
  inMemoryAuthToken = token;
  try {
    if (token) {
      await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }
  } catch (err) {
    console.warn('[API Client] Failed to persist auth token:', err);
  }
}

/**
 * Retrieve the current JWT authentication token.
 */
export async function getAuthToken(): Promise<string | null> {
  if (inMemoryAuthToken) {
    return inMemoryAuthToken;
  }
  try {
    const stored = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (stored) {
      inMemoryAuthToken = stored;
    }
    return stored;
  } catch (err) {
    console.warn('[API Client] Failed to load auth token:', err);
    return null;
  }
}

/**
 * Clear the authentication token and session.
 */
export async function clearAuthToken(): Promise<void> {
  inMemoryAuthToken = null;
  try {
    await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_PROFILE);
  } catch (err) {
    console.warn('[API Client] Failed to clear auth token:', err);
  }
}

/**
 * Create Axios instance with default config.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout for rural low-bandwidth network handling
  headers: {
    'Accept': 'application/json',
  },
});

// Request Interceptor: Inject JWT Bearer token into Authorization header
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s and standardize errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Clear invalid session
      await clearAuthToken();
    }
    return Promise.reject(normalizeApiError(error));
  }
);

/**
 * Normalize any API or network error into a clean, safe Error object.
 * Strictly prevents leaking localhost, Axios stack traces, or endpoint internals.
 */
export function normalizeApiError(error: any): Error {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      // Network unreachable or timeout
      return new Error('कनेक्शन नहीं हो पाया | Unable to connect to server. Please check your internet connection and try again.');
    }

    const status = error.response.status;
    const detail = error.response.data?.detail;

    if (detail) {
      const message = typeof detail === 'string' ? detail : JSON.stringify(detail);
      return new Error(message);
    }

    if (status === 401) {
      return new Error('सत्र समाप्त हो गया | Session expired. Please log in again.');
    }
    if (status === 403) {
      return new Error('अनुमति नहीं है | You do not have permission for this action.');
    }
    if (status === 404) {
      return new Error('रिकॉर्ड नहीं मिला | Requested item not found.');
    }
    if (status >= 500) {
      return new Error('सर्वर में समस्या है | Server error. Please try again later.');
    }

    return new Error(`अनपेक्षित त्रुटि (${status}) | Request failed. Please try again.`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('अनपेक्षित समस्या उत्पन्न हुई | An unexpected error occurred.');
}

/**
 * Generic API request wrapper
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any,
  isFormData: boolean = false,
  customHeaders?: Record<string, string>
): Promise<T> {
  const headers: Record<string, string> = { ...customHeaders };
  if (isFormData) {
    // Let browser/runtime set multipart boundary
    delete headers['Content-Type'];
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await apiClient.request<T>({
    url: endpoint,
    method,
    data,
    headers,
  });

  return response.data;
}

export default {
  client: apiClient,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  normalizeApiError,
  apiRequest,
};