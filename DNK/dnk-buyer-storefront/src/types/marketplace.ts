export type ChannelType = "D2C_INLAND" | "B2B_INLAND" | "EXPORT_DNK";
export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AUD" | "AED";

export interface PublicProductItem {
  id: string;
  title_en: string;
  title_hi?: string;
  description_en: string;
  description_hi?: string;
  category: string;
  hs_code: string;
  enhanced_image_url: string;
  raw_image_url: string;
  audio_story_url?: string;
  is_export_viable?: boolean;
  pricing: {
    retail_price_inr?: number;
    wholesale_price_inr?: number;
    b2b_moq?: number;
    export_price_usd?: number;
  };
  logistics: {
    weight_grams: number;
    is_fragile: boolean;
  };
  artisan: {
    id: string;
    cluster_name: string;
    state: string;
    story_snippet?: string;
    name?: string;
  };
  // UI and legacy compatibility aliases
  name?: string;
  imageUrl?: string;
  hsnCode?: string;
  description?: string;
  priceUSD?: number;
  moq?: number;
  volumeDiscounts?: Array<{ minQuantity: number; maxQuantity?: number; discountPercent: number }>;
}

export interface CartItem {
  product: PublicProductItem;
  quantity: number;
  unitPrice: number;
  channel?: ChannelType;
}

export interface CheckoutPayload {
  channel_type: ChannelType;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  customer: {
    full_name: string;
    email: string;
    phone: string;
    shipping_address: {
      address_line: string;
      city: string;
      state: string;
      pincode: string;
      country_code: string;
    };
    tax_identifier?: string;
  };
  payment_method: "UPI" | "CARD_STRIPE" | "COD";
}

export interface PostalTrackingEvent {
  timestamp: string;
  location: string;
  status_description: string;
}

export interface PostalTrackingResponse {
  tracking_code: string;
  order_id: string;
  channel_type: string;
  current_status: "BOOKED" | "CUSTOMS_CLEARED" | "IN_TRANSIT" | "DELIVERED";
  origin_dnk: string;
  destination_hub: string;
  events: PostalTrackingEvent[];
}
