// ============================================================
// DNK ARTISAN APP API CLIENT SERVICE
// Centralized API client for communicating with dak-ghar-backend
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
  typeof process !== 'undefined' &&
  process.env &&
  process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : 'http://localhost:8000';

// Persistent storage key for JWT
const AUTH_TOKEN_KEY = 'dnk_auth_token';

// In-memory copy for fast access
let authToken: string | null = null;


// ============================================================
// AUTH TOKEN MANAGEMENT
// ============================================================

/**
 * Store JWT token in memory AND persistent storage.
 */
export const setAuthToken = async (
  token: string | null
): Promise<void> => {
  authToken = token;

  if (token) {
    await AsyncStorage.setItem(
      AUTH_TOKEN_KEY,
      token
    );
  } else {
    await AsyncStorage.removeItem(
      AUTH_TOKEN_KEY
    );
  }
};


/**
 * Get JWT token.
 *
 * First checks memory.
 * If not available, loads it from AsyncStorage.
 */
export const getAuthToken = async (): Promise<string | null> => {
  // Fast path
  if (authToken) {
    return authToken;
  }

  // Persistent path
  try {
    const storedToken =
      await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    if (storedToken) {
      authToken = storedToken;
    }

    return authToken;
  } catch (error) {
    console.warn(
      'Failed to read auth token from storage:',
      error
    );

    return null;
  }
};


/**
 * Clear JWT token from memory and storage.
 */
export const clearAuthToken = async (): Promise<void> => {
  authToken = null;

  try {
    await AsyncStorage.removeItem(
      AUTH_TOKEN_KEY
    );
  } catch (error) {
    console.warn(
      'Failed to clear auth token:',
      error
    );
  }
};


// ============================================================
// HELPER FOR HEADERS
// ============================================================

const getHeaders = async (
  isFormData: boolean = false,
  customHeaders: Record<string, string> = {}
): Promise<Record<string, string>> => {

  const headers: Record<string, string> = {
    ...customHeaders,
  };


  // ----------------------------------------------------------
  // CONTENT TYPE
  // ----------------------------------------------------------

  /*
   * IMPORTANT:
   *
   * JSON requests:
   * application/json
   *
   * Login:
   * application/x-www-form-urlencoded
   *
   * FormData:
   * DO NOT manually set Content-Type.
   *
   * fetch() automatically creates:
   *
   * multipart/form-data;
   * boundary=...
   */

  if (
    !isFormData &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] =
      'application/json';
  }


  // ----------------------------------------------------------
  // JWT AUTHORIZATION
  // ----------------------------------------------------------

  const token = await getAuthToken();

  if (token) {
    headers['Authorization'] =
      `Bearer ${token}`;
  }


  return headers;
};


// ============================================================
// SNAKE_CASE → CAMEL_CASE MAPPERS
// ============================================================

export interface BackendProduct {
  id: number;
  seller_id: number;
  title: string;
  description: string | null;
  price_inr: number;
  hs_code: string | null;
  hs_confidence: number | null;
  image_urls: string[] | null;
  created_at: string;
}


export interface ArtisanProduct {
  id: number;
  sellerId: number;
  title: string;
  description: string;
  priceInr: number;
  hsCode: string;
  hsConfidence?: number;
  images: string[];
  createdAt: string;
}


export const mapProduct = (
  p: BackendProduct
): ArtisanProduct => ({
  id: p.id,
  sellerId: p.seller_id,
  title: p.title,
  description: p.description || '',
  priceInr: p.price_inr,
  hsCode: p.hs_code || '',
  hsConfidence:
    p.hs_confidence || undefined,
  images: p.image_urls || [],
  createdAt: p.created_at,
});


// ============================================================
// HTTP REQUEST METHOD
// ============================================================

async function request<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  isFormData: boolean = false,
  customHeaders: Record<string, string> = {}
): Promise<T> {

  const url =
    `${API_BASE_URL}${endpoint}`;


  // IMPORTANT:
  // getHeaders is now async because
  // it loads JWT from AsyncStorage.

  const headers =
    await getHeaders(
      isFormData,
      customHeaders
    );


  const config: RequestInit = {
    method,
    headers,
  };


  // ----------------------------------------------------------
  // REQUEST BODY
  // ----------------------------------------------------------

  if (
    body !== undefined &&
    body !== null
  ) {

    if (isFormData) {

      // FormData must be passed directly.
      config.body = body;

    } else if (
      typeof body === 'string'
    ) {

      // Used for:
      // application/x-www-form-urlencoded

      config.body = body;

    } else {

      // Normal JSON request

      config.body =
        JSON.stringify(body);
    }
  }


  // ----------------------------------------------------------
  // SEND REQUEST
  // ----------------------------------------------------------

  let response: Response;

  try {

    response =
      await fetch(
        url,
        config
      );

  } catch (error: any) {

    throw new Error(
      `Unable to connect to backend at ${url}. ` +
      `Please make sure dak-ghar-backend is running. ` +
      `${error?.message || ''}`
    );
  }


  // ----------------------------------------------------------
  // HANDLE HTTP ERRORS
  // ----------------------------------------------------------

  if (!response.ok) {

    let errorDetail =
      `HTTP ${response.status} ${response.statusText}`;


    try {

      const errorJson =
        await response.json();


      if (
        errorJson?.detail
      ) {

        errorDetail =
          typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(
                errorJson.detail
              );
      }

    } catch (_) {

      // Ignore JSON parsing errors
    }


    // --------------------------------------------------------
    // AUTOMATICALLY CLEAR INVALID JWT
    // --------------------------------------------------------

    if (
      response.status === 401
    ) {

      await clearAuthToken();
    }


    throw new Error(
      errorDetail
    );
  }


  // ----------------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------------

  return response.json() as Promise<T>;
}


// ============================================================
// AUTHENTICATION API
// ============================================================

export interface TokenResponse {
  access_token: string;
  token_type: string;
}


export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  upi_id?: string;
  role: string;
  created_at: string;
}


// ============================================================
// LOGIN
// ============================================================

/**
 * Login artisan using FastAPI OAuth2PasswordRequestForm.
 *
 * FastAPI expects:
 *
 * username=<email>
 * password=<password>
 *
 * Content-Type:
 * application/x-www-form-urlencoded
 */

export async function loginArtisan(
  email: string,
  password: string
): Promise<TokenResponse> {

  const params =
    new URLSearchParams();


  params.append(
    'username',
    email
  );

  params.append(
    'password',
    password
  );


  const res =
    await request<TokenResponse>(
      '/api/v1/auth/login',
      'POST',
      params.toString(),
      false,
      {
        'Content-Type':
          'application/x-www-form-urlencoded',
      }
    );


  // ----------------------------------------------------------
  // SAVE JWT
  // ----------------------------------------------------------

  if (res.access_token) {

    await setAuthToken(
      res.access_token
    );
  }


  return res;
}


// ============================================================
// REGISTER
// ============================================================

/**
 * Register a new artisan.
 */

export async function registerArtisan(
  data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    upi_id?: string;
  }
): Promise<UserResponse> {

  return request<UserResponse>(
    '/api/v1/auth/register',
    'POST',
    data
  );
}


// ============================================================
// USER PROFILE API
// ============================================================

/**
 * Fetch current authenticated artisan profile
 */
export async function fetchCurrentUser(): Promise<UserResponse> {
  return request<UserResponse>(
    '/api/v1/auth/me',
    'GET'
  );
}

/**
 * Update authenticated artisan profile
 */
export async function updateUserProfile(
  data: {
    name?: string;
    phone?: string;
    upi_id?: string;
  }
): Promise<UserResponse> {
  return request<UserResponse>(
    '/api/v1/auth/me',
    'PUT',
    data
  );
}


// ============================================================
// PRODUCT CATALOG API
// ============================================================

export async function fetchProducts(): Promise<
  ArtisanProduct[]
> {

  const raw =
    await request<BackendProduct[]>(
      '/api/v1/products',
      'GET'
    );


  return raw.map(
    mapProduct
  );
}


export async function fetchProductById(
  id: number
): Promise<ArtisanProduct> {

  const raw =
    await request<BackendProduct>(
      `/api/v1/products/${id}`,
      'GET'
    );


  return mapProduct(raw);
}


export async function createProduct(
  data: {
    title: string;
    description?: string;
    price_inr: number;
    hs_code?: string;
    hs_confidence?: number;
    image_urls?: string[];
  }
): Promise<ArtisanProduct> {

  const raw =
    await request<BackendProduct>(
      '/api/v1/products',
      'POST',
      data
    );


  return mapProduct(raw);
}


export async function updateProduct(
  id: number,
  data: Partial<BackendProduct>
): Promise<ArtisanProduct> {

  const raw =
    await request<BackendProduct>(
      `/api/v1/products/${id}`,
      'PUT',
      data
    );


  return mapProduct(raw);
}


export async function deleteProduct(
  id: number
): Promise<{ message: string }> {

  return request<{
    message: string;
  }>(
    `/api/v1/products/${id}`,
    'DELETE'
  );
}


// ============================================================
// AI ENGINE & VOICE API
// ============================================================

export interface AICatalogResponse {

  product_title_en?: string;

  product_description_en?: string;

  translated_title_local?: string;

  hs_code?: string;

  hs_code_confidence?: number;

  category?: string;

  key_features?: string[];

  suggested_tags?: string[];

  [key: string]: any;
}


// ============================================================
// AI CATALOG FROM TEXT
// ============================================================

/**
 * Generate catalog from text.
 */

export async function generateAICatalogFromText(
  rawText: string,
  sourceLanguage: string = 'auto',
  imageBase64?: string,
  imageMimeType: string = 'image/jpeg'
): Promise<AICatalogResponse> {
  const payload: Record<string, any> = {
    raw_text: rawText || '',
    source_language: sourceLanguage || 'auto',
  };

  if (imageBase64) {
    payload.image_base64 = imageBase64;
    payload.image_mime_type = imageMimeType || 'image/jpeg';
  }

  return request<AICatalogResponse>(
    '/api/v1/ai/catalog/generate',
    'POST',
    payload
  );
}


// ============================================================
// AI CATALOG FROM VOICE
// ============================================================

/**
 * Upload voice note to dak-ghar-backend.
 *
 * Backend endpoint:
 *
 * POST /api/v1/artisan/voice-upload
 *
 * Backend then forwards the audio to:
 *
 * DNK AI ENGINE
 *
 * AI Engine:
 *
 * STT
 * ↓
 * Catalog generation
 * ↓
 * HS code
 * ↓
 * Qdrant
 */

export async function generateAICatalogFromVoice(
  formData: FormData
): Promise<AICatalogResponse> {

  return request<AICatalogResponse>(
    '/api/v1/artisan/voice-upload',
    'POST',
    formData,
    true
  );
}


// ============================================================
// ORDERS
// ============================================================

export async function fetchMyOrders(): Promise<
  any[]
> {

  return request<any[]>(
    '/api/v1/orders',
    'GET'
  );
}


// ============================================================
// ESCROW
// ============================================================

export async function fetchMyEscrows(): Promise<
  any[]
> {

  return request<any[]>(
    '/api/v1/escrow',
    'GET'
  );
}


// ============================================================
// PBE / LOGISTICS
// ============================================================

export async function fetchMyPBEFilings(): Promise<
  any[]
> {

  return request<any[]>(
    '/api/v1/logistics/pbe',
    'GET'
  );
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {

  // Authentication
  setAuthToken,
  getAuthToken,
  clearAuthToken,

  // Auth APIs
  loginArtisan,
  registerArtisan,
  fetchCurrentUser,
  updateUserProfile,

  // Products
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,

  // AI
  generateAICatalogFromText,
  generateAICatalogFromVoice,

  // Orders
  fetchMyOrders,

  // Escrow
  fetchMyEscrows,

  // Logistics
  fetchMyPBEFilings,
};