// src/components/product/CustomShippingCalculator.tsx
"use client";

import React, { useState } from "react";
import { Plane, Calculator, CheckCircle } from "lucide-react";

export default function CustomShippingCalculator({ weightKg }: { weightKg: number }) {
  const [country, setCountry] = useState("US");
  const [estimatedCost, setEstimatedCost] = useState(12.50);

  const handleCountryChange = (c: string) => {
    setCountry(c);
    const rates: Record<string, number> = { US: 12.50, GB: 10.00, DE: 11.20, CA: 13.00, AU: 14.50 };
    setEstimatedCost((rates[c] || 12.50) * Math.max(1, weightKg));
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Plane className="w-4 h-4 text-[#2563EB]" />
          <span>India Post International Air Mail Rates</span>
        </div>
        <span className="text-xs bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded">
          {weightKg} kg
        </span>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="bg-white border border-slate-300 rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="US">United States (USPS Direct)</option>
          <option value="GB">United Kingdom (Royal Mail)</option>
          <option value="DE">Germany (Deutsche Post)</option>
          <option value="CA">Canada (Canada Post)</option>
          <option value="AU">Australia (Australia Post)</option>
        </select>

        <div className="text-right ml-auto">
          <span className="text-xs text-slate-400 block">Landed Shipping</span>
          <span className="text-sm font-bold text-[#1E3A8A]">${estimatedCost.toFixed(2)} USD</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Includes automated CBIC PBE-III customs export filing.
      </p>
    </div>
  );
}