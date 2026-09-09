// src/lib/utils.ts
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'USD' | 'EUR' | 'GBP' | 'INR' = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
  const rates = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5 };
  const converted = amount * rates[currency];

  if (currency === 'INR') {
    return `${symbols[currency]}${Math.round(converted).toLocaleString('en-IN')}`;
  }
  return `${symbols[currency]}${converted.toFixed(2)}`;
}