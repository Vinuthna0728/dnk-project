// DNK Buyer Storefront API Client Service
// Centralized API client for communicating with dak-ghar-backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

let authToken: string | null = null;

// Read cached token on client side if available
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('dnk_buyer_token');
}

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('dnk_buyer_token', token);
    } else {
      localStorage.removeItem('dnk_buyer_token');
    }
  }
};

export const getAuthToken = () => {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('dnk_buyer_token');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dnk_buyer_token');
    localStorage.removeItem('dnk_buyer_profile');
  }
};

// ============================================================
// HELPER FOR HEADERS
// ============================================================
const getHeaders = (isFormData: boolean = false, customHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  Object.assign(headers, customHeaders);

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

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
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders(isFormData, customHeaders);

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (isFormData) {
      config.body = body;
    } else if (typeof body === 'string') {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, config);

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    clearAuthToken();
    const freshToken = await ensureBuyerAuthenticated(true);
    if (freshToken) {
      const retryHeaders = getHeaders(isFormData, customHeaders);
      const retryConfig: RequestInit = {
        method,
        headers: retryHeaders,
        body: config.body,
      };
      const retryResponse = await fetch(url, retryConfig);
      if (retryResponse.ok) {
        return retryResponse.json() as Promise<T>;
      }
    }
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch (_) {}
    throw new Error(errorDetail);
  }

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
  phone?: string | null;
  upi_id?: string | null;
  role: string;
}

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  upi_id?: string;
}

/**
 * Login user using application/x-www-form-urlencoded format
 * (Compatible with FastAPI OAuth2PasswordRequestForm)
 */
export async function loginBuyer(email: string, password: string): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  const res = await request<TokenResponse>(
    '/api/v1/auth/login',
    'POST',
    params.toString(),
    false,
    { 'Content-Type': 'application/x-www-form-urlencoded' }
  );

  if (res.access_token) {
    setAuthToken(res.access_token);
  }

  return res;
}

/**
 * Register a new buyer user
 */
export async function registerBuyer(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  upi_id?: string;
}): Promise<UserResponse> {
  return request<UserResponse>('/api/v1/auth/register', 'POST', data);
}

/**
 * Fetch current authenticated user profile
 */
export async function fetchCurrentUser(): Promise<UserResponse> {
  return request<UserResponse>('/api/v1/auth/me', 'GET');
}

/**
 * Update current authenticated user profile
 */
export async function updateUserProfile(data: UserProfileUpdate): Promise<UserResponse> {
  return request<UserResponse>('/api/v1/auth/me', 'PUT', data);
}

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return payload.exp < (Date.now() / 1000) + 10;
  } catch (e) {
    return true;
  }
};

/**
 * Automatically authenticate the buyer session if not already logged in
 */
export async function ensureBuyerAuthenticated(forceRefresh: boolean = false): Promise<string> {
  const currentToken = getAuthToken();
  if (currentToken && !forceRefresh && !isTokenExpired(currentToken)) {
    return currentToken;
  }

  clearAuthToken();

  try {
    const res = await loginBuyer('buyer@dakghar.local', 'DakGhar@123');
    if (res && res.access_token) {
      setAuthToken(res.access_token);
      return res.access_token;
    }
  } catch (err) {
    try {
      await registerBuyer({
        name: 'John Doe (Buyer)',
        email: 'buyer@dakghar.local',
        password: 'DakGhar@123',
        phone: '+1-555-0199'
      });
      const loginRes = await loginBuyer('buyer@dakghar.local', 'DakGhar@123');
      if (loginRes && loginRes.access_token) {
        setAuthToken(loginRes.access_token);
        return loginRes.access_token;
      }
    } catch (_) {}
  }
  return '';
}

// ============================================================
// DATA INTERFACES & MAPPING
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

export interface StorefrontProduct {
  id: string;
  sellerId?: number;
  title: string;
  artisanName: string;
  location: string;
  hsCode: string;
  priceInr: number;
  priceUsd: number;
  image: string;
  dnkFacilityCode: string;
  rating: number;
  reviewsCount: number;
  description: string;
  weightKg: number;
}

/**
 * Robust Product Image Resolver
 * 1. Base64 data URIs -> rendered directly
 * 2. Absolute HTTP/HTTPS URLs -> rendered directly
 * 3. Local relative paths (e.g. /diya.png, /toys.png) -> rendered directly
 * 4. Fallback -> safely inferred by craft title / category
 */
export function resolveProductImage(img: string | null | undefined, title: string = ""): string {
  if (img && typeof img === "string") {
    const trimmed = img.trim();
    if (trimmed.startsWith("data:image/") && trimmed.includes(";base64,")) {
      return trimmed;
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return trimmed;
    }
  }

  const t = (title || "").toLowerCase();
  if (t.includes("toy") || t.includes("wood") || t.includes("horse") || t.includes("channapatna") || t.includes("lacquer")) {
    return "/toys.png";
  }
  if (t.includes("pottery") || t.includes("vase") || t.includes("ceramic") || t.includes("clay") || t.includes("blue pottery")) {
    return "/vase.png";
  }
  if (t.includes("saree") || t.includes("silk") || t.includes("scarf") || t.includes("textile") || t.includes("cotton") || t.includes("shawl")) {
    return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";
  }
  if (t.includes("tea") || t.includes("darjeeling") || t.includes("green tea") || t.includes("organic")) {
    return "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80";
  }
  return "/diya.png";
}

export const mapProductToStorefront = (p: BackendProduct): StorefrontProduct => {
  const usdPrice = Number((p.price_inr / 83.5).toFixed(2));
  
  const rawImg = (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : null;
  const mainImage = resolveProductImage(rawImg, p.title);

  return {
    id: String(p.id),
    sellerId: p.seller_id,
    title: p.title,
    artisanName: `Master Artisan (DNK-${(p.seller_id || 1).toString().padStart(4, '0')})`,
    location: "Belagavi, Karnataka",
    hsCode: p.hs_code || "9503.00.90",
    priceInr: p.price_inr,
    priceUsd: usdPrice,
    image: mainImage,
    dnkFacilityCode: "DNK-KA-BEL-01",
    rating: 4.9,
    reviewsCount: 38,
    description: p.description || "Authentic handcrafted product certified by Dak Ghar Niryat Kendra.",
    weightKg: 0.85,
  };
};

// ============================================================
// PRODUCT CATALOG API
// ============================================================
export async function fetchStorefrontProducts(): Promise<StorefrontProduct[]> {
  const raw = await request<BackendProduct[]>('/api/v1/products', 'GET');
  return raw.map(mapProductToStorefront);
}

export async function fetchStorefrontProductById(id: string | number): Promise<StorefrontProduct> {
  const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) || 1 : id;
  const raw = await request<BackendProduct>(`/api/v1/products/${numericId}`, 'GET');
  return mapProductToStorefront(raw);
}

// ============================================================
// ORDERS & ESCROW VAULT API
// ============================================================
export interface OrderCreatePayload {
  product_id: number;
  quantity: number;
  shipping_address: string;
  country: string;
}

export interface OrderResponse {
  id: number;
  buyer_id: number;
  product_id: number;
  quantity: number;
  amount_inr: number;
  shipping_address: string;
  country: string;
  status: string;
  created_at: string;
  checkout_url?: string | null;
  stripe_session_id?: string | null;
  escrow_id?: number | null;
}

export interface EscrowResponse {
  id: number;
  order_id: number;
  buyer_id: number;
  seller_id: number;
  amount_inr: number;
  status: string;
  created_at: string;
}

export interface PaymentVerificationResponse {
  order_id: number;
  escrow_id?: number | null;
  order_status: string;
  escrow_status: string;
  amount_inr: number;
  is_paid: boolean;
}

export async function createBuyerOrder(payload: OrderCreatePayload): Promise<OrderResponse> {
  return request<OrderResponse>('/api/v1/orders/create', 'POST', payload);
}

export async function fetchMyOrders(): Promise<OrderResponse[]> {
  return request<OrderResponse[]>('/api/v1/orders', 'GET');
}

export async function fetchOrderById(id: number): Promise<OrderResponse> {
  return request<OrderResponse>(`/api/v1/orders/${id}`, 'GET');
}

export async function verifyOrderPayment(orderId: number, sessionId?: string | null): Promise<PaymentVerificationResponse> {
  const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
  return request<PaymentVerificationResponse>(`/api/v1/orders/${orderId}/verify-payment${query}`, 'GET');
}

export async function createEscrowVault(orderId: number): Promise<EscrowResponse> {
  return request<EscrowResponse>('/api/v1/escrow/create', 'POST', { order_id: orderId });
}

export async function payEscrowVault(escrowId: number): Promise<EscrowResponse> {
  return request<EscrowResponse>(`/api/v1/escrow/${escrowId}/payment`, 'POST');
}

export async function fetchMyEscrows(): Promise<EscrowResponse[]> {
  return request<EscrowResponse[]>('/api/v1/escrow', 'GET');
}

// ============================================================
// LOGISTICS & PBE-III FILINGS API
// ============================================================
export interface PBEResponse {
  id: number;
  order_id: number;
  seller_id?: number;
  buyer_id?: number;
  product_id?: number;
  pbe_number: string | null;
  pbe_type?: string;
  tracking_number: string | null;
  barcode?: string | null;
  hs_code: string;
  invoice_value_inr?: number;
  currency?: string;
  exchange_rate?: number | null;
  country: string;
  cbic_status?: string;
  icegate_reference?: string | null;
  icegate_status?: string | null;
  status: string;
  created_at: string;
  cn23_pdf_url?: string | null;
}

export interface PBECreateRequest {
  order_id: number;
  currency?: string;
  exchange_rate?: number;
  pbe_type?: string;
}

export async function createPBEFiling(data: PBECreateRequest): Promise<PBEResponse> {
  return request<PBEResponse>('/api/v1/logistics/pbe-submit', 'POST', data);
}

export const submitPBE = createPBEFiling;

export async function fetchMyPBEFilings(): Promise<PBEResponse[]> {
  return request<PBEResponse[]>('/api/v1/logistics/pbe', 'GET');
}

export const fetchPBEFilings = fetchMyPBEFilings;

export async function fetchPBEById(id: number): Promise<PBEResponse> {
  return request<PBEResponse>(`/api/v1/logistics/pbe/${id}`, 'GET');
}

// ============================================================
// TRACKING & DNK POSTAL LIFECYCLE API
// ============================================================
export interface TrackingEvent {
  event_type: string;
  location: string;
  description: string;
  timestamp: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING";
}

export interface TrackingDetails {
  tracking_number: string;
  order_id: number;
  product_title: string;
  destination_country: string;
  shipping_address: string;
  hs_code: string;
  pbe_number?: string | null;
  pbe_status?: string | null;
  icegate_status?: string | null;
  escrow_status: string;
  cn23_pdf_url?: string | null;
  origin_facility?: string;
  events: TrackingEvent[];
}

export async function fetchTrackingByBarcode(barcode: string): Promise<TrackingDetails> {
  return request<TrackingDetails>(`/api/v1/logistics/track/${barcode}`, 'GET');
}

export default {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  loginBuyer,
  registerBuyer,
  fetchCurrentUser,
  updateUserProfile,
  ensureBuyerAuthenticated,
  fetchStorefrontProducts,
  fetchStorefrontProductById,
  createBuyerOrder,
  fetchMyOrders,
  fetchOrderById,
  verifyOrderPayment,
  createEscrowVault,
  payEscrowVault,
  fetchMyEscrows,
  createPBEFiling,
  submitPBE,
  fetchMyPBEFilings,
  fetchPBEFilings,
  fetchPBEById,
  fetchTrackingByBarcode,
};
