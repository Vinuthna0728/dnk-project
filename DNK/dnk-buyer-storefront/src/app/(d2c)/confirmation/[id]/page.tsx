'use client';

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Truck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useCartStore } from "@/store/useCartStore";

function OrderConfirmationContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const orderId = (params?.id as string) || "ORD-IN-100234";
    const method = searchParams.get("method") || "UPI";
    const source = searchParams.get("source");
    const trackingCode = "SP984321098IN";

    const { clearDirectBuy, clearCart } = useCartStore();

    useEffect(() => {
        if (source === "direct") {
            clearDirectBuy();
        } else {
            clearCart();
        }

        // Intercept browser back button so it routes directly to /shop
        window.history.pushState(null, "", window.location.href);
        const handlePopState = () => {
            router.replace("/shop");
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [source, clearDirectBuy, clearCart, router]);

    return (
        <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between font-poppins select-none">
            <div>
                <Navbar />

                <main className="max-w-2xl mx-auto px-4 py-16 text-center">
                    {/* Success Check Badge */}
                    <div className="w-20 h-20 rounded-full bg-[#183D2E] text-white flex items-center justify-center mx-auto mb-6 shadow-xl ring-8 ring-[#183D2E]/10">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#2E1D11]">
                        Order Successfully Placed!
                    </h1>
                    <p className="text-xs sm:text-sm text-[#6B4E3D] mt-2 max-w-md mx-auto">
                        Payment via <strong className="text-[#183D2E] font-bold">{method}</strong> verified. The master artisan is packaging your handcrafted consignment.
                    </p>

                    {/* Details Box */}
                    <div className="bg-[#F4EDE2] rounded-3xl p-6 sm:p-7 border border-[#DEBFA3] shadow-sm my-8 text-left space-y-3.5">
                        <div className="flex justify-between items-center text-xs pb-3 border-b border-[#DEBFA3]">
                            <span className="text-[#8C6D53] font-medium">Order Reference</span>
                            <span className="font-mono font-bold text-[#2E1D11] text-sm">{orderId}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#8C6D53] font-medium">Speed Post Tracking Barcode</span>
                            <span className="font-mono font-bold text-[#183D2E] bg-[#FAF6F0] px-3 py-1 rounded-xl border border-[#DEBFA3]">
                                {trackingCode}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3.5 max-w-md mx-auto">
                        <Link
                            href={`/tracking/${trackingCode}`}
                            className="flex-1 py-3.5 px-5 rounded-2xl bg-[#183D2E] hover:bg-[#112D22] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#183D2E]/20 transition-all"
                        >
                            <Truck className="w-4 h-4" />
                            <span>Track with India Post</span>
                        </Link>
                        <button
                            onClick={() => router.replace("/shop")}
                            className="flex-1 py-3.5 px-5 rounded-2xl bg-[#F4EDE2] hover:bg-[#EAE0D0] text-[#2E1D11] text-xs font-bold border border-[#DEBFA3] flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                            <span>Back to Crafts</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </main>
            </div>

            <footer className="p-4 text-center text-xs text-[#8C6D53] border-t border-[#DEBFA3]/50">
                Shilp Setu D2C • Direct Artisan Remittance Completed
            </footer>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading order confirmation...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
