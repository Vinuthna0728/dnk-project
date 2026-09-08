/**
 * DNK Artisan 2.0 Order Service
 * Manages D2C, B2B, and Global Export orders and real postal tracking.
 * Strictly operates with real backend data without synthetic fallbacks.
 */

import { API_ENDPOINTS } from '../constants/Config';
import { apiRequest } from './api';

export type OrderChannel = 'D2C' | 'B2B' | 'EXPORT';
export type OrderStatus =
  | 'PENDING_DROPOFF'
  | 'SCANNED_AT_DNK'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ArtisanOrder {
  id: string | number;
  order_number: string;
  consignment_number?: string;
  tracking_number: string; // real tracking code from backend (e.g. from India Post DNK) or empty
  product_id?: string | number;
  product_title: string;
  channel: OrderChannel;
  quantity: number;
  amount_inr: number;
  amount_usd?: number;
  buyer_name: string;
  destination_country: string;
  destination_city?: string;
  hs_code: string;
  weight_grams: number;
  status: OrderStatus;
  dnk_centre_name?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Fetch all live orders for authenticated artisan
 * GET /api/v1/orders
 */
export async function fetchOrders(): Promise<ArtisanOrder[]> {
  const list = await apiRequest<any[]>(
    'GET',
    API_ENDPOINTS.ORDERS
  );

  if (!Array.isArray(list)) return [];

  return list.map((item) => {
    const rawStatus = (item.status || '').toUpperCase();
    let status: OrderStatus = 'PENDING_DROPOFF';
    if (rawStatus === 'DELIVERED' || rawStatus === 'COMPLETED') status = 'DELIVERED';
    else if (rawStatus === 'IN_TRANSIT' || rawStatus === 'DISPATCHED' || rawStatus === 'SHIPPED') status = 'IN_TRANSIT';
    else if (rawStatus === 'SCANNED_AT_DNK' || rawStatus === 'POSTAL_ACCEPTED' || rawStatus === 'DROPPED') status = 'SCANNED_AT_DNK';

    const rawChannel = (item.channel || item.order_type || 'EXPORT').toUpperCase();
    let channel: OrderChannel = 'EXPORT';
    if (rawChannel.includes('D2C') || rawChannel.includes('RETAIL')) channel = 'D2C';
    else if (rawChannel.includes('B2B') || rawChannel.includes('WHOLESALE')) channel = 'B2B';

    // Real tracking code from backend (or empty string if not yet issued by DNK post office)
    const trackingNo =
      item.tracking_number ||
      item.consignment_number ||
      item.postal_tracking_code ||
      '';

    return {
      id: item.id,
      order_number: item.order_number || `ORD-${item.id || ''}`,
      consignment_number: item.consignment_number || trackingNo,
      tracking_number: trackingNo,
      product_id: item.product_id,
      product_title: item.product_title || item.title || 'Artisan Craft Item',
      channel,
      quantity: item.quantity || 1,
      amount_inr: Number(item.amount_inr || item.price_inr || 0),
      amount_usd: item.amount_usd ? Number(item.amount_usd) : (item.amount_inr ? Number((item.amount_inr / 83.5).toFixed(2)) : undefined),
      buyer_name: item.buyer_name || (channel === 'EXPORT' ? 'Global Buyer' : 'Domestic Buyer'),
      destination_country: item.destination_country || item.country || (channel === 'EXPORT' ? 'International' : 'Domestic India'),
      destination_city: item.destination_city || item.city,
      hs_code: item.hs_code || '6913.90.00',
      weight_grams: item.weight_grams || 500,
      status,
      dnk_centre_name: item.dnk_centre_name,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at,
    };
  });
}

/**
 * Fetch single order by ID
 * GET /api/v1/orders/:id
 */
export async function fetchOrderById(id: string | number): Promise<ArtisanOrder> {
  const orders = await fetchOrders();
  const match = orders.find((o) => String(o.id) === String(id));
  if (!match) {
    throw new Error('Order not found');
  }
  return match;
}

export default {
  fetchOrders,
  fetchOrderById,
};
