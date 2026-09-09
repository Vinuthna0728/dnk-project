"use client";

import React from "react";
import Link from "next/link";
import { Package, Truck, Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useLanguageStore } from "@/store/useLanguageStore";

interface OrderItem {
    id: string;
    orderNumber: string;
    date: string;
    trackingCode: string;
    status: "In Transit" | "Delivered" | "Dispatched";
    total: number;
    items: { name: string; quantity: number }[];
}

const PAST_ORDERS: OrderItem[] = [
    {
        id: "1",
        orderNumber: "ORD-IN-982144",
        date: "02 Sep 2026",
        trackingCode: "SP984321098IN",
        status: "In Transit",
        total: 2450,
        items: [{ name: "Hand-Painted Madhubani Silk Scarf", quantity: 1 }],
    },
    {
        id: "2",
        orderNumber: "ORD-IN-784112",
        date: "14 Aug 2026",
        trackingCode: "SP773210041IN",
        status: "Delivered",
        total: 1780,
        items: [{ name: "Terracotta Hand-Carved Water Pitcher", quantity: 2 }],
    },
];

export default function MyOrdersPage() {
    const texts = useLanguageStore((state) => state.t)();

    return (
        <div className="min-h-screen bg-[#FAF6F0] flex font-poppins select-none">
            <AppSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />

                <main className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
                    <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#2E1D11]">
                        {texts.myOrders}
                    </h1>

                    <div className="space-y-4">
                        {PAST_ORDERS.map((order) => (
                            <div
                                key={order.id}
                                className="bg-[#F4EDE2] p-5 sm:p-6 rounded-3xl border-2 border-[#DEBFA3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-[#183D2E]" />
                                        <span className="font-bold text-sm text-[#2E1D11]">{order.orderNumber}</span>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${order.status === "Delivered"
                                                    ? "bg-emerald-100 text-[#183D2E]"
                                                    : "bg-amber-100 text-amber-900"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-[#8C6D53]">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {order.date}
                                        </span>
                                        <span>
                                            Total: <strong className="text-[#2E1D11]">₹{order.total.toLocaleString("en-IN")}</strong>
                                        </span>
                                    </div>

                                    <p className="text-xs text-[#4A2E18] font-medium pt-1">
                                        {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                                    </p>
                                </div>

                                <Link
                                    href={`/tracking/${order.trackingCode}`}
                                    className="py-2.5 px-4 rounded-xl bg-[#183D2E] hover:bg-[#112D22] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span>{texts.trackShipment}</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}