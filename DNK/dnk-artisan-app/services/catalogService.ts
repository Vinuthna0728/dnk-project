/**
 * DNK Artisan 2.0 Catalog Service
 * Strictly implements the exact CreateProductPayload JSON contract
 * and AI microservices (image enhancement, voice cataloging).
 */

import { API_ENDPOINTS } from '../constants/Config';
import { apiRequest } from './api';

// ============================================================
// EXACT CREATE PRODUCT CONTRACT (DEV 2 primary SPEC)
// DO NOT ALTER THIS CONTRACT
// ============================================================
export interface CreateProductPayload {
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  category: string;
  hs_code: string;
  channels: {
    is_d2c: boolean;
    is_b2b: boolean;
    is_export: boolean;
  };
  pricing: {
    cost_price_inr: number;
    retail_price_inr: number;
    wholesale_price_inr: number;
    b2b_moq: number;
    export_price_usd: number;
  };
  logistics: {
    weight_grams: number;
    dimensions_cm: {
      length: number;
      width: number;
      height: number;
    };
    is_fragile: boolean;
  };
  images: {
    raw_url: string;
    enhanced_url: string;
  };
}

export interface ArtisanProduct {
  id: string | number;
  seller_id?: number | string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  category: string;
  hs_code: string;
  channels: {
    is_d2c: boolean;
    is_b2b: boolean;
    is_export: boolean;
  };
  pricing: {
    cost_price_inr: number;
    retail_price_inr: number;
    wholesale_price_inr: number;
    b2b_moq: number;
    export_price_usd: number;
  };
  logistics: {
    weight_grams: number;
    dimensions_cm: {
      length: number;
      width: number;
      height: number;
    };
    is_fragile: boolean;
  };
  images: {
    raw_url: string;
    enhanced_url: string;
  };
  status?: string;
  created_at?: string;
}

export interface EnhanceImageResponse {
  raw_url: string;
  enhanced_url: string;
  background_removed?: boolean;
  shadow_synthesized?: boolean;
}

export interface VoiceCatalogExtractionResponse {
  craft_category?: string;
  category?: string;
  material_weave?: string;
  materials?: string[];
  estimated_labor_days?: number;
  production_cost_inr?: number;
  estimated_price_inr?: number;
  title_en?: string;
  product_title_en?: string;
  title_hi?: string;
  translated_title_local?: string;
  description_en?: string;
  product_description_en?: string;
  description_hi?: string;
  translated_desc_local?: string;
  hs_code?: string;
  hs_code_confidence?: number;
  weight_grams?: number;
}

/**
 * Send compressed raw craft image (≤2MB) to AI Vision Studio
 * POST /api/v1/ai/enhance-image
 */
export async function enhanceImage(
  formData: FormData
): Promise<EnhanceImageResponse> {
  return apiRequest<EnhanceImageResponse>(
    'POST',
    API_ENDPOINTS.AI_ENHANCE_IMAGE,
    formData,
    true
  );
}

/**
 * Send audio recording to Bhashini/Whisper Voice Catalog pipeline
 * POST /api/v1/ai/voice-catalog
 */
export async function uploadVoiceCatalog(
  formData: FormData
): Promise<VoiceCatalogExtractionResponse> {
  try {
    return await apiRequest<VoiceCatalogExtractionResponse>(
      'POST',
      API_ENDPOINTS.AI_VOICE_CATALOG,
      formData,
      true
    );
  } catch (err) {
    // Fallback to legacy voice upload route if proxy differs
    return await apiRequest<VoiceCatalogExtractionResponse>(
      'POST',
      API_ENDPOINTS.AI_VOICE_UPLOAD,
      formData,
      true
    );
  }
}

/**
 * Publish product with exact CreateProductPayload JSON contract
 * POST /api/v1/products
 */
export async function createProduct(
  payload: CreateProductPayload
): Promise<ArtisanProduct> {
  return apiRequest<ArtisanProduct>(
    'POST',
    API_ENDPOINTS.PRODUCTS,
    payload
  );
}

/**
 * Fetch all verified products of authenticated artisan
 * GET /api/v1/products
 */
export async function fetchProducts(): Promise<ArtisanProduct[]> {
  const rawList = await apiRequest<any[]>(
    'GET',
    API_ENDPOINTS.PRODUCTS
  );

  if (!Array.isArray(rawList)) return [];

  // Normalize backend schema if legacy flat schema was returned
  return rawList.map((item) => {
    if (item.channels && item.pricing && item.logistics) {
      return item as ArtisanProduct;
    }

    // Adapt flat backend products into full locked contract format
    return {
      id: item.id,
      seller_id: item.seller_id,
      title_en: item.title_en || item.title || 'Artisan Craft',
      title_hi: item.title_hi || item.title || 'हस्तशिल्प उत्पाद',
      description_en: item.description_en || item.description || '',
      description_hi: item.description_hi || item.description || '',
      category: item.category || 'Handicrafts',
      hs_code: item.hs_code || '6913.90.00',
      channels: {
        is_d2c: item.is_d2c ?? true,
        is_b2b: item.is_b2b ?? false,
        is_export: item.is_export ?? true,
      },
      pricing: {
        cost_price_inr: item.cost_price_inr || Math.round((item.price_inr || 1200) * 0.7),
        retail_price_inr: item.retail_price_inr || item.price_inr || 1200,
        wholesale_price_inr: item.wholesale_price_inr || Math.round((item.price_inr || 1200) * 0.8),
        b2b_moq: item.b2b_moq || 10,
        export_price_usd: item.export_price_usd || Number(((item.price_inr || 1200) / 83.5).toFixed(2)),
      },
      logistics: {
        weight_grams: item.weight_grams || 500,
        dimensions_cm: item.dimensions_cm || { length: 20, width: 15, height: 10 },
        is_fragile: item.is_fragile ?? false,
      },
      images: {
        raw_url: item.images?.raw_url || (Array.isArray(item.image_urls) ? item.image_urls[0] : item.image_url) || '',
        enhanced_url: item.images?.enhanced_url || (Array.isArray(item.image_urls) ? item.image_urls[0] : item.image_url) || '',
      },
      created_at: item.created_at,
    };
  });
}

/**
 * Fetch product by ID
 * GET /api/v1/products/:id
 */
export async function fetchProductById(
  id: string | number
): Promise<ArtisanProduct> {
  const item = await apiRequest<any>(
    'GET',
    API_ENDPOINTS.PRODUCT_BY_ID(id)
  );

  if (item.channels && item.pricing && item.logistics) {
    return item as ArtisanProduct;
  }

  return {
    id: item.id,
    seller_id: item.seller_id,
    title_en: item.title_en || item.title || 'Artisan Craft',
    title_hi: item.title_hi || item.title || 'हस्तशिल्प उत्पाद',
    description_en: item.description_en || item.description || '',
    description_hi: item.description_hi || item.description || '',
    category: item.category || 'Handicrafts',
    hs_code: item.hs_code || '6913.90.00',
    channels: {
      is_d2c: item.is_d2c ?? true,
      is_b2b: item.is_b2b ?? false,
      is_export: item.is_export ?? true,
    },
    pricing: {
      cost_price_inr: item.cost_price_inr || Math.round((item.price_inr || 1200) * 0.7),
      retail_price_inr: item.retail_price_inr || item.price_inr || 1200,
      wholesale_price_inr: item.wholesale_price_inr || Math.round((item.price_inr || 1200) * 0.8),
      b2b_moq: item.b2b_moq || 10,
      export_price_usd: item.export_price_usd || Number(((item.price_inr || 1200) / 83.5).toFixed(2)),
    },
    logistics: {
      weight_grams: item.weight_grams || 500,
      dimensions_cm: item.dimensions_cm || { length: 20, width: 15, height: 10 },
      is_fragile: item.is_fragile ?? false,
    },
    images: {
      raw_url: item.images?.raw_url || (Array.isArray(item.image_urls) ? item.image_urls[0] : item.image_url) || '',
      enhanced_url: item.images?.enhanced_url || (Array.isArray(item.image_urls) ? item.image_urls[0] : item.image_url) || '',
    },
    created_at: item.created_at,
  };
}

/**
 * Update product
 * PUT /api/v1/products/:id
 */
export async function updateProduct(
  id: string | number,
  payload: Partial<CreateProductPayload>
): Promise<ArtisanProduct> {
  return apiRequest<ArtisanProduct>(
    'PUT',
    API_ENDPOINTS.PRODUCT_BY_ID(id),
    payload
  );
}

/**
 * Delete product
 * DELETE /api/v1/products/:id
 */
export async function deleteProduct(
  id: string | number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    'DELETE',
    API_ENDPOINTS.PRODUCT_BY_ID(id)
  );
}

export default {
  enhanceImage,
  uploadVoiceCatalog,
  createProduct,
  fetchProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
};
