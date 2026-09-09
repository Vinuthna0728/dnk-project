"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    ShoppingBag,
    ShieldCheck,
    Truck,
    FileText,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function B2BBulkCartPage() {
    const router = useRouter();
    const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();

    const subtotal = items.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
    );
    const estimatedFreight = subtotal > 0 ? Math.max(1200, Math.round(subtotal * 0.025)) : 0;
    const estimatedTax = Math.round(subtotal * 0.05);
    const totalPayable = subtotal + estimatedFreight + estimatedTax;

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-[#713F12]" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                    Your Bulk Cart is Empty
                </h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Explore the institutional wholesale catalog to add GI-certified craft batches, verify MOQs, and generate formal proforma tax invoices.
                </p>
                <Link
                    href="/b2b/shop"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-[#713F12] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#522D0C] transition-all shadow-sm"
                >
                    Return to Wholesale Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-800">
                        Institutional Procurement Desk
                    </span>
                    <h1 className="text-2xl font-serif font-bold text-slate-900">
                        Bulk Order Batch Summary
                    </h1>
                </div>
                <button
                    onClick={clearCart}
                    className="text-xs font-medium text-slate-500 hover:text-red-700 transition-colors self-start sm:self-auto cursor-pointer"
                >
                    Clear Entire Order Batch
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
                            <span>Item Specifications & Unit Tier</span>
                            <span>Batch Total</span>
                        </div>

                        <div className="divide-y divide-slate-200">
                            {items.map((item) => {
                                const lineTotal = item.unitPrice * item.quantity;
                                const imageSrc =
                                    item.product.enhanced_image_url ||
                                    item.product.raw_image_url ||
                                    "/products/terracotta-pitcher.png";

                                return (
                                    <div
                                        key={item.product.id}
                                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                                <Image
                                                    src={imageSrc}
                                                    alt={item.product.title_en}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                                    {item.product.title_en}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Cluster: {item.product.artisan?.cluster_name || "Artisan Guild"} (
                                                    {item.product.artisan?.state || "India"})
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                                                    <span className="text-amber-900 font-bold">
                                                        ₹{item.unitPrice.toLocaleString("en-IN")}/unit
                                                    </span>
                                                    <span className="text-slate-400">•</span>
                                                    <span className="text-slate-500">Tier Applied</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6">
                                            <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.product.id,
                                                            Math.max(
                                                                item.product.pricing?.b2b_moq || 25,
                                                                item.quantity - 25
                                                            )
                                                        )
                                                    }
                                                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-14 text-center font-mono font-bold text-xs text-slate-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.product.id, item.quantity + 25)
                                                    }
                                                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <div className="text-right min-w-[100px]">
                                                <div className="text-sm font-mono font-bold text-slate-900">
                                                    ₹{lineTotal.toLocaleString("en-IN")}
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-1 mt-1 justify-end font-medium transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-start gap-3 shadow-sm text-xs text-slate-600">
                        <Truck className="w-5 h-5 text-[#713F12] flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold text-slate-800">
                                Commercial Crating & Seal Inspection:
                            </span>
                            <p className="mt-0.5">
                                Bulk consignments are packaged in weather-resistant wooden or double-corrugated crates under the supervision of India Post Postal Nodal Officers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Direct Proforma Action */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#713F12]" />
                            Proforma Valuation
                        </h2>

                        <div className="space-y-2.5 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span>Net Goods Value:</span>
                                <span className="font-mono font-bold text-slate-900">
                                    ₹{subtotal.toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Dak Ghar Heavy Freight:</span>
                                <span className="font-mono font-bold text-slate-900">
                                    ₹{estimatedFreight.toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Estimated GST (ITC Eligible):</span>
                                <span className="font-mono font-bold text-slate-900">
                                    ₹{estimatedTax.toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                                <span className="text-sm font-bold text-slate-900">Proforma Total:</span>
                                <div className="text-right">
                                    <div className="text-lg font-mono font-black text-[#713F12]">
                                        ₹{totalPayable.toLocaleString("en-IN")}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-normal">
                                        Inclusive of all freight & taxes
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Direct transition to Proforma */}
                        <button
                            onClick={() => router.push("/b2b/proforma")}
                            className="w-full py-3.5 px-4 bg-[#713F12] hover:bg-[#522D0C] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md mt-4 cursor-pointer"
                        >
                            <span>Generate Official Proforma Invoice</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Direct Proforma Generation • No Retail Gateway</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}