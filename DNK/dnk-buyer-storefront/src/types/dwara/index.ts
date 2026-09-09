// src/types/index.ts

export type Currency = "USD" | "EUR" | "GBP";

export interface Artisan {
  id: string;
  name: string;
  facilityCode: string;
  location: string;
  state: string;
  iecNumber: string;
  rating: number;
  totalExports: number;
  avatarUrl: string;
}

export interface Product {
  id: string;
  title: string;
  descriptionEn: string;
  descriptionRaw?: string;
  artisan: Artisan;
  hsCode: string;
  hsCodeConfidence: number;
  priceInr: number;
  weightKg: number;
  dimensionsCm: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  category: string;
  isOndcSynced: boolean;
  estimatedAirMailDays: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface EscrowDetails {
  orderId: string;
  amountInr: number;
  amountConverted: number;
  currency: Currency;
  status: "LOCKED" | "RELEASED_TO_SELLER" | "REFUNDED";
  payoutTriggerEvent: "POSTAL_EVENT_ACCEPTANCE";
  barcodeCn23: string;
}
