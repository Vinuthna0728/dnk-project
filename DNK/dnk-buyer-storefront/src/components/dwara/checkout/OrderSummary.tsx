// src/components/checkout/OrderSummary.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/dwara/utils";
import { Product } from "@/lib/dwara/mockData";
import { FileCheck, ShieldCheck, Loader2, Lock } from "lucide-react";
import { useCart } from "@/context/dwara/CartContext";

export default function OrderSummary({ product }: { product: Product }) {
  const router = useRouter();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepText, setStepText] = useState("Securing Escrow Vault...");

  const itemPriceUsd = product.priceUsd;
  const shippingUsd = 12.50;
  const totalUsd = itemPriceUsd + shippingUsd;

  const handleCompleteOrder = () => {
    setIsProcessing(true);

    // Simulate multi-step escrow lock and ICEGATE PBE filing
    setTimeout(() => {
      setStepText("Authorizing Payment & Filing PBE-III with ICEGATE...");
    }, 1200);

    setTimeout(() => {
      setStepText("Escrow Locked! Redirecting to Order Confirmation...");
    }, 2200);

    setTimeout(() => {
      clearCart();
      router.push(`/dwara/order-success?orderId=ORD-DNK-2026-9941&barcode=IN987654321IN&productId=${product.id}`);
    }, 3000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit relative">
      <h3 className="text-base font-bold text-[#1E3A8A] mb-4">Order Summary</h3>

      <div className="flex gap-3 mb-4 pb-4 border-b border-slate-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-16 h-16 rounded object-cover border border-slate-200"
        />
        <div>
          <h4 className="font-bold text-xs text-slate-900 leading-tight">{product.title}</h4>
          <span className="text-[11px] text-slate-500 block mt-1">HS: {product.hsCode}</span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
            Export Facility: {product.dnkFacilityCode}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100">
        <div className="flex justify-between">
          <span>Artisan Price</span>
          <span className="font-bold text-slate-800">{formatCurrency(itemPriceUsd, 'USD')}</span>
        </div>
        <div className="flex justify-between">
          <span>India Post Air Mail Shipping</span>
          <span className="font-bold text-slate-800">${shippingUsd.toFixed(2)} USD</span>
        </div>
        <div className="flex justify-between text-emerald-700 font-semibold">
          <span className="flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" /> PBE-III Filing Fee</span>
          <span>FREE ($0.00)</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="font-bold text-sm text-slate-800">Total Landed Amount</span>
        <span className="text-2xl font-black text-[#1E3A8A]">{formatCurrency(totalUsd, 'USD')}</span>
      </div>

      <button
        onClick={handleCompleteOrder}
        disabled={isProcessing}
        className="w-full bg-[#D92D20] hover:bg-red-700 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-lg transition shadow-md text-sm flex items-center justify-center gap-2"
      >
        <Lock className="w-4 h-4" /> Lock Funds in Escrow & Complete Order
      </button>

      {/* Escrow Processing Pop-up Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
            </div>

            <h3 className="text-lg font-black text-[#1E3A8A] mb-1">
              Redirecting to Escrow Gateway
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please do not close or refresh this tab.
            </p>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-semibold text-[#1E3A8A] flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{stepText}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}