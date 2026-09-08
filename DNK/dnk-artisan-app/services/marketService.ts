/**
 * SIH26090 Market Linkage Service
 * Integrates real B2B/Export buyer opportunities and quotation submissions.
 */

import { API_ENDPOINTS } from '../constants/Config';
import { apiRequest } from './api';

export interface MarketOpportunity {
  id: number | string;
  buyer_company: string;
  buyer_country: string;
  country_flag?: string;
  craft_category: string;
  item_title: string;
  required_quantity: number;
  target_price_inr?: number;
  delivery_deadline: string;
  match_score?: number;
  specifications: string;
  status?: string;
  created_at?: string;
}

export interface QuotationPayload {
  opportunity_id: number | string;
  unit_price_inr: number;
  available_quantity: number;
  estimated_production_days: number;
  artisan_notes?: string;
}

export interface QuotationResponse {
  id: number | string;
  opportunity_id: number | string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  message?: string;
}

/**
 * Fetch real buyer requirements matching artisan crafts
 * GET /api/v1/market/opportunities
 */
export async function fetchMarketOpportunities(): Promise<MarketOpportunity[]> {
  try {
    const list = await apiRequest<any[]>(
      'GET',
      API_ENDPOINTS.MARKET_OPPORTUNITIES
    );
    if (!Array.isArray(list)) return [];
    return list.map((item) => ({
      id: item.id,
      buyer_company: item.buyer_company || item.buyer_name || 'Buyer Requirement',
      buyer_country: item.buyer_country || item.country || 'Global Market',
      country_flag: item.country_flag,
      craft_category: item.craft_category || item.category || 'Handicrafts',
      item_title: item.item_title || item.title || 'Craft Requirement',
      required_quantity: item.required_quantity || item.quantity || 1,
      target_price_inr: item.target_price_inr || item.target_unit_price,
      delivery_deadline: item.delivery_deadline || 'Open',
      match_score: item.match_score ? Number(item.match_score) : undefined,
      specifications: item.specifications || item.description || '',
      status: item.status || 'OPEN',
      created_at: item.created_at,
    }));
  } catch (err) {
    // If backend endpoint is not yet mounted, return empty array without fabricating fake data
    return [];
  }
}

/**
 * Submit official artisan quotation for a buyer opportunity
 * POST /api/v1/market/quotations
 */
export async function submitQuotation(
  payload: QuotationPayload
): Promise<QuotationResponse> {
  return apiRequest<QuotationResponse>(
    'POST',
    API_ENDPOINTS.MARKET_QUOTATIONS,
    payload
  );
}

export default {
  fetchMarketOpportunities,
  submitQuotation,
};
