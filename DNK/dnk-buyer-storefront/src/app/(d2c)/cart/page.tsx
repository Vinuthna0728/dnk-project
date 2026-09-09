"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRight, ShieldCheck, ShoppingBag, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
    const router = useRouter();
    const { items, getTotalAmount, updateQuantity, removeFromCart } = useCartStore();
    const total = getTotalAmount();

    const handleBuyAllItems = () => {
        router.push("/checkout");
    };

    return (
        <div className="min-h-screen bg-[#FAF6F0] flex font-poppins select-none">
            <AppSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />

                <main className="p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#2E1D11]">
                            Your Shopping Bag ({items.length})
                        </h1>
                        <button
                            onClick={() => router.push("/shop")}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#5A3A22] hover:text-[#183D2E]"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Continue Browsing
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-16 bg-[#F4EDE2] rounded-3xl border border-[#DEBFA3]">
                            <ShoppingBag className="w-12 h-12 text-[#8C6D53] mx-auto mb-3" />
                            <p className="text-sm font-bold text-[#2E1D11]">Your shopping bag is currently empty.</p>
                            <button
                                onClick={() => router.push("/shop")}
                                className="mt-4 px-5 py-2.5 rounded-xl bg-[#183D2E] text-white text-xs font-bold shadow-md"
                            >
                                Browse Crafts
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Bag Items List */}
                            <div className="lg:col-span-8 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.product.id}
                                        className="bg-[#F4EDE2] p-4 sm:p-5 rounded-3xl border border-[#DEBFA3] shadow-sm flex items-center gap-4"
                                    >
                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#EAE0D0] flex-shrink-0 border border-[#DEBFA3]">
                                            <Image
                                                src={item.product.enhanced_image_url || item.product.raw_image_url}
                                                alt={item.product.title_en}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-bold text-[#8C6D53] uppercase tracking-wider">
                                                {item.product.artisan.cluster_name}
                                            </span>
                                            <h3 className="text-sm font-bold text-[#2E1D11] truncate">{item.product.title_en}</h3>
                                            <p className="text-xs font-black text-[#183D2E] mt-1">
                                                ₹{item.unitPrice.toLocaleString("en-IN")}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center border border-[#DEBFA3] bg-[#FAF6F0] rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="px-2.5 py-1 text-xs font-bold text-[#2E1D11] hover:bg-[#EAE0D0]"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 text-xs font-black text-[#183D2E]">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="px-2.5 py-1 text-xs font-bold text-[#2E1D11] hover:bg-[#EAE0D0]"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary with "Buy All Items" button */}
                            <div className="lg:col-span-4">
                                <div className="bg-[#F4EDE2] p-6 rounded-3xl border border-[#DEBFA3] shadow-sm space-y-4">
                                    <h2 className="text-sm font-black text-[#2E1D11] pb-3 border-b border-[#DEBFA3]">
                                        Bag Summary
                                    </h2>
                                    <div className="space-y-2 text-xs text-[#6B4E3D]">
                                        <div className="flex justify-between">
                                            <span>Total Items ({items.length})</span>
                                            <span className="font-bold text-[#2E1D11]">₹{total.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Speed Post Pan-India</span>
                                            <span className="font-bold text-[#183D2E]">FREE</span>
                                        </div>
                                        <div className="flex justify-between pt-3 border-t border-[#DEBFA3] text-sm font-black text-[#2E1D11]">
                                            <span>Total Amount</span>
                                            <span className="text-base text-[#183D2E]">₹{total.toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>

                                    {/* BUY ALL ITEMS BUTTON */}
                                    <button
                                        onClick={handleBuyAllItems}
                                        className="w-full py-3.5 px-4 rounded-2xl bg-[#183D2E] hover:bg-[#112D22] text-white text-xs font-bold tracking-wide shadow-md flex items-center justify-center gap-2 transition-all"
                                    >
                                        <span>Buy All Items</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center gap-2 text-[10px] text-[#8C6D53] pt-2">
                                        <ShieldCheck className="w-4 h-4 text-[#183D2E]" />
                                        <span>ONDC & India Post Buyer Protection</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}