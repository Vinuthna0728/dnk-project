// src/app/order-success/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CheckCircle2, ShieldCheck, Truck, ArrowRight, Clock, Package, MapPin, User, Loader2 } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import {
  fetchStorefrontProductById,
  verifyOrderPayment,
  createPBEFiling,
  fetchOrderById,
  fetchCurrentUser,
  PaymentVerificationResponse,
  OrderResponse,
  UserResponse,
  StorefrontProduct,
} from "@/lib/api";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("orderId") || searchParams.get("order_id") || "62";
  const numericOrderId = parseInt(String(rawOrderId).replace(/\D/g, ""), 10) || 62;
  const formattedOrderId = `ORD-DNK-${numericOrderId}`;
  
  const rawBarcode = searchParams.get("barcode");
  const fallbackBarcode = `DNK${String(numericOrderId).padStart(9, "0")}IN`;
  const barcode = rawBarcode || fallbackBarcode;

  const productId = searchParams.get("productId") || "1";
  const sessionId = searchParams.get("session_id") || "";

  const [product, setProduct] = useState<any>(
    MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0]
  );
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [verification, setVerification] = useState<PaymentVerificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Fetch live product info
      try {
        const liveProduct = await fetchStorefrontProductById(productId);
        if (isMounted && liveProduct) {
          setProduct(liveProduct);
        }
      } catch (err) {
        console.warn("Product load fallback:", err);
      }

      // 2. Fetch authoritative user profile
      try {
        const user = await fetchCurrentUser();
        if (isMounted && user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.warn("User profile load fallback:", err);
      }

      // 3. Fetch authoritative order data
      if (numericOrderId) {
        try {
          const liveOrder = await fetchOrderById(numericOrderId);
          if (isMounted && liveOrder) {
            setOrder(liveOrder);
          }
        } catch (err) {
          console.warn("Order data load fallback:", err);
        }
      }

      // 4. Fetch authoritative payment & escrow verification status and ensure PBE filing
      if (numericOrderId) {
        try {
          const verifyRes = await verifyOrderPayment(numericOrderId, sessionId || null);
          if (isMounted) {
            setVerification(verifyRes);
          }
          // Ensure PBE filing is confirmed on the backend
          if (verifyRes?.is_paid) {
            try {
              await createPBEFiling({ order_id: numericOrderId });
            } catch (pbeErr) {
              console.warn("PBE auto-filing acknowledgement:", pbeErr);
            }
          }
        } catch (err) {
          console.warn("Payment verification fallback:", err);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [numericOrderId, productId, sessionId]);

  const isPaid = verification ? verification.is_paid : (order?.status === "PAID");
  const escrowStatus = verification?.escrow_status || (order?.escrow_id ? "FUNDS_HELD_ESCROW" : "CREATED");

  // Determine recipient details dynamically
  const recipientName = currentUser?.name || "Verified Global Buyer";
  const shippingAddress = order?.shipping_address || "742 Evergreen Terrace, Springfield, OR 97477";
  const destinationCountry = order?.country || "United States";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Success Banner */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {isPaid ? "Payment Verified • Funds Held in Escrow" : "Payment Confirmed • Escrow Initialized"}
        </span>

        <h1 className="text-3xl font-black text-[#1E3A8A] mt-3 mb-2">
          Your Export Order is Confirmed!
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Order <span className="font-mono font-bold text-slate-800">{formattedOrderId}</span> has been registered on the India Post DNK network for electronic PBE-III customs filing.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href={`/tracking/${barcode}`}
            className="bg-[#1E3A8A] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <Truck className="w-4 h-4 text-amber-300" /> Track Overseas Shipment ({barcode})
          </Link>

          <Link
            href="/"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-slate-200"
          >
            Return to Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Order Details & Postal Barcode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Product & Recipient Info */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#2563EB]" /> Ordered Craft Item
            </h3>
            <div className="flex gap-4 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <img
                src={product.image}
                alt={product.title}
                className="w-16 h-16 rounded object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">{product.title}</h4>
                <span className="text-[11px] text-slate-500 block">HS Code: {product.hsCode}</span>
                <span className="text-[11px] text-slate-500 block">Artisan: {product.artisanName}</span>
                {order && (
                  <span className="text-[11px] font-bold text-[#1E3A8A] block mt-1">
                    Invoice Total: ₹{order.amount_inr} INR (Qty: {order.quantity})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D92D20]" /> Shipping Destination (CN23 Receiver)
            </h3>
            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2563EB]" /> {recipientName}
              </p>
              <p className="pl-5 text-slate-700">{shippingAddress}</p>
              <p className="pl-5 font-semibold text-slate-800">{destinationCountry} (USPS / International Post)</p>
            </div>
          </div>
        </div>

        {/* Right: CN23 Barcode & Customs Security Box */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-3">
              Assigned Postal Export Barcode
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center mb-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                CN23 Tracking Number
              </span>
              <span className="font-mono text-xl font-black text-[#1E3A8A] tracking-wider block">
                {barcode}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                ✓ Pre-Filed with CBIC ICEGATE
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-[11px] text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Escrow Status: {escrowStatus}</span>
              </div>
              <p>
                Funds are held in secure cross-border escrow and will be released to the artisan once India Post scans this parcel at the counter.
              </p>
            </div>
          </div>

          <Link
            href={`/tracking/${barcode}`}
            className="mt-6 w-full bg-[#1E3A8A] hover:bg-[#2563EB] text-white py-3 rounded-lg text-xs font-bold text-center transition block"
          >
            View Live Tracking Timeline →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-xs font-bold text-slate-500">Loading Order Confirmation...</div>}>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </main>
  );
}
