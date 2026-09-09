import { create } from "zustand";

export type SupportedCurrency = "USD" | "EUR" | "GBP" | "AUD" | "AED" | "INR";

interface CurrencyStore {
  selectedCurrency: SupportedCurrency;
  exchangeRates: Record<SupportedCurrency, number>; // Base: INR
  setCurrency: (currency: SupportedCurrency) => void;
  formatPrice: (amountInInr: number) => string;
  convertPrice: (amountInInr: number) => number;
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  selectedCurrency: "USD",
  exchangeRates: {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AUD: 0.018,
    AED: 0.044,
  },
  setCurrency: (currency) => set({ selectedCurrency: currency }),
  convertPrice: (amountInInr: number) => {
    const rate = get().exchangeRates[get().selectedCurrency] || 1;
    return Number((amountInInr * rate).toFixed(2));
  },
  formatPrice: (amountInInr: number) => {
    const currency = get().selectedCurrency;
    const converted = get().convertPrice(amountInInr);
    const symbols: Record<SupportedCurrency, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      AUD: "A$",
      AED: "AED ",
    };
    return `${symbols[currency]}${converted.toLocaleString()}`;
  },
}));