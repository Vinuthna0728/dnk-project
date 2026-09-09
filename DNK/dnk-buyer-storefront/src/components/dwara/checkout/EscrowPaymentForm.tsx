// src/components/checkout/EscrowPaymentForm.tsx
"use client";

import React, { useState } from "react";
import { Lock, CreditCard, ShieldCheck } from "lucide-react";

export default function EscrowPaymentForm() {
  const [method, setMethod] = useState<"card" | "paypal">("card");

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-base font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
        <Lock className="w-4 h-4 text-emerald-600" />
        Cross-Border Escrow Vault Checkout
      </h3>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setMethod("card")}
          className={`flex-1 py-2.5 rounded border text-xs font-bold flex items-center justify-center gap-2 ${method === "card" ? "border-[#2563EB] bg-blue-50 text-[#1E3A8A]" : "border-slate-200 text-slate-600"
            }`}
        >
          <CreditCard className="w-4 h-4" /> Credit / Debit Card
        </button>
        <button
          onClick={() => setMethod("paypal")}
          className={`flex-1 py-2.5 rounded border text-xs font-bold flex items-center justify-center gap-2 ${method === "paypal" ? "border-[#2563EB] bg-blue-50 text-[#1E3A8A]" : "border-slate-200 text-slate-600"
            }`}
        >
          PayPal / Global Escrow
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Card Number</label>
          <input type="text" placeholder="4242 •••• •••• 4242" className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#2563EB] outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
            <input type="text" placeholder="12/28" className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#2563EB] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CVC / CVV</label>
            <input type="text" placeholder="123" className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#2563EB] outline-none" />
          </div>
        </div>
      </div>

      <div className="mt-4 bg-emerald-50 border border-emerald-200 p-3 rounded text-[11px] text-emerald-800 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your funds will be held in Escrow and released only after India Post scans the package barcode.</span>
      </div>
    </div>
  );
}