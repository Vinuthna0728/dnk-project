// src/components/layout/CurrencySelector.tsx
"use client";

import React from "react";
import { Globe } from "lucide-react";

interface CurrencySelectorProps {
  currency: "USD" | "EUR" | "GBP" | "INR";
  onCurrencyChange: (currency: "USD" | "EUR" | "GBP" | "INR") => void;
}

export default function CurrencySelector({ currency, onCurrencyChange }: CurrencySelectorProps) {
  return (
    <div className="flex items-center gap-1 cursor-pointer hover:text-white transition">
      <Globe className="w-3.5 h-3.5" />
      <select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value as any)}
        className="bg-transparent text-xs border-none outline-none cursor-pointer text-white font-medium"
      >
        <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
        <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
        <option value="GBP" className="bg-slate-900 text-white">GBP (£)</option>
        <option value="INR" className="bg-slate-900 text-white">INR (₹)</option>
      </select>
    </div>
  );
}