// src/components/product/EscrowExplainer.tsx
import React from "react";
import { ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function EscrowExplainer() {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 my-6">
      <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <span>How Cross-Border Escrow Protects Your Purchase</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-800 mt-3">
        <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
          <span className="font-bold block text-emerald-950 mb-0.5">1. Payment Locked</span>
          Your payment stays in a secure vault upon checkout.
        </div>
        <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
          <span className="font-bold block text-emerald-950 mb-0.5">2. Counter Handover</span>
          Artisan drops package at local Post Office counter.
        </div>
        <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
          <span className="font-bold block text-emerald-950 mb-0.5">3. First Barcode Scan</span>
          Scanner executes webhook release to artisan's account.
        </div>
      </div>
    </div>
  );
}