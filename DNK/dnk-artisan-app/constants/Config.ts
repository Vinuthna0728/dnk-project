import { Platform } from 'react-native';

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

const rawBaseUrl =
  process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '')
    : typeof process !== 'undefined' &&
      process.env &&
      process.env.EXPO_PUBLIC_API_URL
      ? process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '')
      : 'http://localhost:8000';

export const API_BASE_URL =
  Platform.OS === 'android' && rawBaseUrl.includes('localhost')
    ? rawBaseUrl.replace('localhost', '10.0.2.2')
    : rawBaseUrl;

/**
 * Isolated Development / Demo Authentication Mode Flag
 * Strictly defaults to false in production.
 * Enabled only when EXPO_PUBLIC_DEMO_MODE=true.
 */
export const IS_DEMO_MODE =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ||
  (typeof process !== 'undefined' &&
    Boolean(process.env && process.env.EXPO_PUBLIC_DEMO_MODE === 'true'));

export const DEMO_CREDENTIALS = {
  PHONE: '9999999999',
  ALTERNATIVE_PHONE: '9876543210',
  EMAIL: 'demo@dnk.local',
  OTP: '123456',
  DEMO_TOKEN: 'demo_dev_session_token_local',
  DEMO_USER: {
    id: 'DEMO-001',
    name: 'Master Artisan',
    email: 'demo@dnk.local',
    phone: '9999999999',
    role: 'artisan',
    dnk_centre: 'Varanasi Head Post Office DNK',
    is_demo: true,
  },
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH_OTP_SEND: '/api/v1/auth/otp/send',
  AUTH_OTP_VERIFY: '/api/v1/auth/otp/verify',
  AUTH_ME: '/api/v1/auth/me',
  AUTH_REFRESH: '/api/v1/auth/refresh',
  AUTH_LOGIN: '/api/v1/auth/login', // legacy fallback if needed

  // AI Microservices
  AI_ENHANCE_IMAGE: '/api/v1/ai/enhance-image',
  AI_VOICE_CATALOG: '/api/v1/ai/voice-catalog',
  AI_CATALOG_GENERATE: '/api/v1/ai/catalog/generate',
  AI_VOICE_UPLOAD: '/api/v1/artisan/voice-upload', // legacy voice endpoint

  // Product Catalog
  PRODUCTS: '/api/v1/products',
  PRODUCT_BY_ID: (id: string | number) => `/api/v1/products/${id}`,

  // Orders & Fulfillment
  ORDERS: '/api/v1/orders',
  ORDER_BY_ID: (id: string | number) => `/api/v1/orders/${id}`,

  // Logistics & Postal Drop-off
  NEAREST_DNK: '/api/v1/logistics/nearest-dnk',
  DNK_NEARBY: '/api/v1/dnk/nearby',
  ESCROW: '/api/v1/escrow',

  // SIH26090 Market Linkage
  MARKET_OPPORTUNITIES: '/api/v1/market/opportunities',
  MARKET_QUOTATIONS: '/api/v1/market/quotations',
} as const;

export const STANDARD_BOX_SIZES = [
  {
    id: 'small',
    label: 'Small Box',
    labelHi: 'छोटा डिब्बा',
    dimensions: { length: 20, width: 15, height: 10 }, // cm
    maxWeightGrams: 1000,
    icon: '📦',
    description: 'Jewelry, miniature figurines, small brass items',
  },
  {
    id: 'medium',
    label: 'Medium Box',
    labelHi: 'मध्यम डिब्बा',
    dimensions: { length: 30, width: 20, height: 15 }, // cm
    maxWeightGrams: 3000,
    icon: '📦',
    description: 'Textiles, sarees, blue pottery vases, wooden artifacts',
  },
  {
    id: 'large',
    label: 'Large Box',
    labelHi: 'बड़ा डिब्बा',
    dimensions: { length: 40, width: 30, height: 20 }, // cm
    maxWeightGrams: 7000,
    icon: '📦',
    description: 'Carpets, large metal statues, bulk craft packs',
  },
] as const;

export const CRAFT_CATEGORIES = [
  { id: 'pottery', nameEn: 'Blue Pottery & Terracotta', nameHi: 'ब्लू पॉटरी एवं टेराकोटा', icon: '🏺', defaultHs: '6913.90.00' },
  { id: 'textiles', nameEn: 'Handloom & Silk Textiles', nameHi: 'हथकरघा एवं रेशम वस्त्र', icon: '🧵', defaultHs: '6214.20.00' },
  { id: 'woodcraft', nameEn: 'Woodcraft & Inlay Carving', nameHi: 'काष्ठ कला एवं नक्काशी', icon: '🪵', defaultHs: '4420.10.00' },
  { id: 'brassware', nameEn: 'Brass & Metal Sculptures', nameHi: 'पीतल एवं धातु शिल्प', icon: '🪔', defaultHs: '8306.29.00' },
  { id: 'painting', nameEn: 'Traditional Folk Paintings', nameHi: 'पारंपरिक लोक चित्रकला', icon: '🎨', defaultHs: '9701.10.00' },
  { id: 'leather', nameEn: 'Artisan Leather Craft', nameHi: 'हस्तनिर्मित चमड़ा शिल्प', icon: '👝', defaultHs: '4202.21.00' },
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', label: 'हिंदी', englishLabel: 'Hindi', script: 'देवनागरी', icon: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', englishLabel: 'Kannada', script: 'ಕನ್ನಡ', icon: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', englishLabel: 'Tamil', script: 'தமிழ்', icon: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', englishLabel: 'Bengali', script: 'বাংলা', icon: '🇮🇳' },
  { code: 'en', label: 'English', englishLabel: 'English', script: 'Latin', icon: '🌐' },
] as const;

export const APP_CONFIG = {
  MAX_IMAGE_UPLOAD_BYTES: 2 * 1024 * 1024, // 2MB on-device compression limit
  WEIGHT_INCREMENT_GRAMS: 50,
  DEFAULT_WEIGHT_GRAMS: 500,
  STORAGE_KEYS: {
    AUTH_TOKEN: 'dnk_auth_token',
    USER_PROFILE: 'dnk_user_profile',
    CATALOG_DRAFT: 'dnk_catalog_draft_v2',
    SELECTED_LANGUAGE: 'dnk_selected_language',
    CACHED_LOCATION: 'dnk_cached_location',
  },
} as const;

export default {
  API_BASE_URL,
  IS_DEMO_MODE,
  DEMO_CREDENTIALS,
  API_ENDPOINTS,
  STANDARD_BOX_SIZES,
  CRAFT_CATEGORIES,
  SUPPORTED_LANGUAGES,
  APP_CONFIG,
};
