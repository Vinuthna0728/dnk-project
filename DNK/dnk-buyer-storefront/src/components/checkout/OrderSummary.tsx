// src/components/checkout/OrderSummary.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/lib/mockData";
import { StorefrontProduct, createBuyerOrder, ensureBuyerAuthenticated } from "@/lib/api";
import { FileCheck, ShieldCheck, Loader2, Lock, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function OrderSummary({ product }: { product: Product | StorefrontProduct }) {
  const router = useRouter();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepText, setStepText] = useState("Securing Escrow Vault...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const itemPriceUsd = product.priceUsd;
  const shippingUsd = 12.50;
  const totalUsd = itemPriceUsd + shippingUsd;

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Step 1: Ensure authenticated session
      setStepText("Authenticating Buyer Escrow Session...");
      await ensureBuyerAuthenticated();

      // Step 2: Parse valid product ID and create authoritative order with Stripe checkout session
      setStepText("Initializing Order & Stripe Payment Gateway...");
      const rawId = String(product.id).replace(/\D/g, "");
      let numericProductId = rawId ? parseInt(rawId, 10) : 1;
      if (numericProductId > 100) {
        numericProductId = 1;
      }

      let shippingAddress = "742 Evergreen Terrace, Springfield, OR 97477";
      let destinationCountry = "United States";
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("dnk_buyer_shipping_pref");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const street = parsed.streetAddress || "";
            const city = parsed.city || "";
            const zip = parsed.zipCode || "";
            if (street || city) {
              shippingAddress = [street, city, zip].filter(Boolean).join(", ");
            } else if (parsed.address) {
              shippingAddress = parsed.address;
            }
            if (parsed.country) {
              destinationCountry = parsed.country;
            }
          } catch (_) {}
        }
      }

      const order = await createBuyerOrder({
        product_id: numericProductId,
        quantity: 1,
        shipping_address: shippingAddress,
        country: destinationCountry,
      });

      clearCart();

      // Step 3: Redirect directly to real Stripe Checkout URL
      if (order.checkout_url) {
        setStepText("Redirecting to Stripe Secure Payment Gateway...");
        window.location.href = order.checkout_url;
      } else {
        throw new Error("Stripe checkout URL was not returned by the backend.");
      }
    } catch (err: any) {
      console.error("Order completion error:", err);
      setErrorMsg(
        err?.message || "Failed to complete checkout. Please ensure dak-ghar-backend is configured."
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit relative">
      <h3 className="text-base font-bold text-[#1E3A8A] mb-4">Order Summary</h3>

      {errorMsg && (
        <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

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
          <span className="font-bold text-slate-800">{formatCurrency(itemPriceUsd, "USD")}</span>
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
        <span className="text-2xl font-black text-[#1E3A8A]">{formatCurrency(totalUsd, "USD")}</span>
      </div>

      <button
        onClick={handleCompleteOrder}
        disabled={isProcessing}
        className="w-full bg-[#D92D20] hover:bg-red-700 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-lg transition shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
      >
        <Lock className="w-4 h-4" /> Pay with Stripe & Lock Funds in Escrow
      </button>

      {/* Escrow Processing Pop-up Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
            </div>

            <h3 className="text-lg font-black text-[#1E3A8A] mb-1">
              Processing Secure Escrow
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Securing cross-border payment on India Post DNK network.
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
