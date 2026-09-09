"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ShoppingBag,
    Store,
    Globe2,
    ArrowRight,
    Truck,
    ShieldCheck,
    Layers,
    TrendingDown,
    ReceiptText,
    Coins,
    ShieldCheck as CustomsShield,
} from "lucide-react";

export default function OmnichannelLandingPage() {
    const portals = [
        {
            id: "d2c",
            title: "D2C",
            subtitle: "DOMESTIC RETAIL",
            description:
                "Shop unique handmade products directly from artisans across India.",
            href: "/login?channel=d2c",
            buttonBg: "bg-[#183d2e] hover:bg-[#112d22]",
            buttonText: "Enter D2C Store",
            icon: ShoppingBag,
            iconBg: "bg-[#183d2e]",
            features: [
                { icon: ShoppingBag, label: "Single-Piece Buying" },
                { icon: Truck, label: "Pan-India Delivery" },
                { icon: ShieldCheck, label: "Secure Payments" },
            ],
        },
        {
            id: "b2b",
            title: "B2B",
            subtitle: "WHOLESALE",
            description:
                "Bulk orders, volume discounts and business solutions for institutions.",
            href: "/b2b/login",
            buttonBg: "bg-[#713f12] hover:bg-[#522d0c]",
            buttonText: "Enter B2B Portal",
            icon: Store,
            iconBg: "bg-[#713f12]",
            features: [
                { icon: Layers, label: "MOQ Orders" },
                { icon: TrendingDown, label: "Best Wholesale Prices" },
                { icon: ReceiptText, label: "GST Invoice Available" },
            ],
        },
        {
            id: "dwara",
            title: "DNK Dwara",
            subtitle: "GLOBAL EXPORT",
            description:
                "Bringing Indian handicrafts to the world with trusted export solutions.",
            href: "/dwara/login",
            buttonBg: "bg-[#102a45] hover:bg-[#0b1c2e]",
            buttonText: "Enter Export Portal",
            icon: Globe2,
            iconBg: "bg-[#102a45]",
            features: [
                { icon: Globe2, label: "Worldwide Shipping" },
                { icon: Coins, label: "Multi-currency Payments" },
                { icon: CustomsShield, label: "Customs Support & Compliance" },
            ],
        },
    ];

    return (
        <main className="relative h-screen w-screen overflow-hidden flex flex-col justify-end pb-[14vh] select-none font-poppins">
            {/* Exact Screen-Fitted Backdrop */}
            <div className="absolute inset-0 -z-10 w-full h-full">
                <Image
                    src="/shilp-setu.png"
                    alt="Shilp Setu Marketplace Backdrop"
                    fill
                    priority
                    className="object-fill w-full h-full"
                    quality={100}
                />
            </div>

            {/* Main Interactive Layer */}
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 z-10 flex flex-col">
                {/* 3 Deep-Cream / Parchment Channel Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 w-full items-end">
                    {portals.map((portal) => {
                        const Icon = portal.icon;
                        return (
                            <motion.div
                                key={portal.id}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="relative bg-[#f4ede2]/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl shadow-[#4a2e18]/15 border border-[#debfa3] flex flex-col justify-between"
                            >
                                {/* Header Icon */}
                                <div className="flex flex-col items-center text-center">
                                    <div
                                        className={`w-12 h-12 rounded-full ${portal.iconBg} text-white flex items-center justify-center shadow-md -mt-11 mb-3 ring-4 ring-[#f4ede2]`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {/* Text Details */}
                                    <h2 className="text-2xl font-bold text-[#2e1d11] tracking-tight leading-tight">
                                        {portal.title}
                                    </h2>
                                    <p className="text-[10px] font-semibold text-[#8c6b51] tracking-[0.05em] uppercase mt-0.5 mb-2">
                                        {portal.subtitle}
                                    </p>
                                    <p className="text-[11px] sm:text-xs font-normal text-[#5a483a] leading-relaxed min-h-[34px] px-1">
                                        {portal.description}
                                    </p>
                                </div>

                                {/* 3 Feature Pills */}
                                <div className="grid grid-cols-3 gap-1 my-3.5 pt-3 border-t border-[#debfa3]/60 text-center">
                                    {portal.features.map((feat, idx) => {
                                        const FeatIcon = feat.icon;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-center justify-center gap-1"
                                            >
                                                <FeatIcon className="w-3.5 h-3.5 text-[#6b4e3d]" />
                                                <span className="text-[9.5px] font-medium text-[#5a483a] leading-tight">
                                                    {feat.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Channel Entry Action */}
                                <Link
                                    href={portal.href}
                                    className={`w-full py-2.5 px-4 rounded-2xl ${portal.buttonBg} text-white text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group`}
                                >
                                    <span>{portal.buttonText}</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}