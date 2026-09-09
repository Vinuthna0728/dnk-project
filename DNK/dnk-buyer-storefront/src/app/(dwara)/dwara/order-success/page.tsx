// src/app/order-success/page.tsx
"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/dwara/layout/Header";
import Footer from "@/components/dwara/layout/Footer";
import { CheckCircle2, ShieldCheck, Package, Truck, ArrowRight, Download, MapPin } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/dwara/mockData";

function OrderSuccessPageContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId") || "ORD-DNK-2026-9941";
    const barcode = searchParams.get("barcode") || "IN987654321IN";
    const productId = searchParams.get("productId") || "prod_882391";

    const product = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

                {/* Success Banner */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Payment Confirmed • Funds Held in Escrow
                    </span>

                    <h1 className="text-3xl font-black text-[#1E3A8A] mt-3 mb-2">
                        Your Export Order is Confirmed!
                    </h1>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Order <span className="font-mono font-bold text-slate-800">{orderId}</span> has been transmitted to India Post DNK for pickup and electronic PBE-III filing.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Link
                            href={`/dwara/tracking/${barcode}`}
                            className="bg-[#1E3A8A] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow"
                        >
                            <Truck className="w-4 h-4 text-amber-300" /> Track Overseas Shipment
                        </Link>

                        <Link
                            href="/dwara/home"
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
                            <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-3">
                                Ordered Craft Item
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
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                                Shipping Destination (CN23 Receiver)
                            </h3>
                            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                                <p className="font-bold text-slate-900">John Doe</p>
                                <p>742 Evergreen Terrace, Springfield, OR 97477</p>
                                <p>United States (USPS Direct Delivery)</p>
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
                                    <span>Escrow Protection Active</span>
                                </div>
                                <p>
                                    Funds will only be released to the artisan once India Post scans this parcel at the counter.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={`/dwara/tracking/${barcode}`}
                            className="mt-6 w-full bg-[#1E3A8A] hover:bg-[#2563EB] text-white py-3 rounded-lg text-xs font-bold text-center transition block"
                        >
                            View Live Tracking Timeline →
                        </Link>
                    </div>

                </div>

            </div>

            <Footer />
        </main>
    );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading...</div>}>
      <OrderSuccessPageContent />
    </Suspense>
  );
}
