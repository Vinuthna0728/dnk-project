"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    Boxes,
    Layers,
    FileSpreadsheet,
    ShieldCheck,
    Search,
    LayoutGrid,
    Table as TableIcon,
    Plus,
    Minus,
    Truck,
    CheckCircle2,
    FileText,
    ArrowRight,
    AlertTriangle,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { PublicProductItem } from "@/services/productStoreService";

interface B2BTier {
    minQty: number;
    maxQty: number | null;
    unitPrice: number;
    discountLabel: string;
}

export interface B2BExtendedProduct extends PublicProductItem {
    sku: string;
    leadTimeDays: number;
    gstRate: number;
    capacityPerMonth: number;
    tiers: B2BTier[];
    multilingualTitles?: Record<string, string>;
}

const B2B_CATALOG: B2BExtendedProduct[] = [
    {
        id: "b2b-001",
        sku: "SS-POT-KHP-01",
        title_en: "Hand-Thrown Terracotta Acoustic Pitchers",
        title_hi: "हाथ से बने टेराकोटा घड़े",
        multilingualTitles: {
            en: "Hand-Thrown Terracotta Acoustic Pitchers",
            hi: "हाथ से बने टेराकोटा घड़े",
            kn: "ಕೈಯಿಂದ ಮಾಡಿದ ಮಣ್ಣಿನ ಪಾತ್ರೆಗಳು",
            te: "చేతితో తయారు చేసిన మట్టి పాత్రలు",
            ml: "കൈകൊണ്ട് നിർമ്മിച്ച ടെറാക്കോട്ട പാത്രങ്ങൾ",
            mr: "हाताने तयार केलेले टेराकोटा भांडी",
            bn: "হাতে তৈরি পোড়ামাটির কলসি",
            ta: "கைவினை டெரகோட்டா பானைகள்",
        },
        description_en: "Traditional terracotta pitchers crafted by master potters.",
        description_hi: "कारीगरों द्वारा तैयार किए गए पारंपरिक मिट्टी के घड़े।",
        category: "Pottery",
        hs_code: "6912.00.10",
        gstRate: 5,
        enhanced_image_url: "/products/terracotta-pitcher.png",
        raw_image_url: "/products/terracotta-pitcher.png",
        pricing: {
            retail_price_inr: 550,
            wholesale_price_inr: 420,
            export_price_usd: 15,
            b2b_moq: 50,
        },
        logistics: {
            weight_grams: 1400,
            is_fragile: true,
        },
        artisan: {
            id: "art-01",
            cluster_name: "Gorakhpur Terracotta Cluster",
            state: "Uttar Pradesh",
        },
        leadTimeDays: 14,
        capacityPerMonth: 2500,
        tiers: [
            { minQty: 50, maxQty: 100, unitPrice: 420, discountLabel: "Base Bulk" },
            { minQty: 101, maxQty: 300, unitPrice: 360, discountLabel: "14% Volume Off" },
            { minQty: 301, maxQty: null, unitPrice: 295, discountLabel: "30% Institutional" },
        ],
    },
    {
        id: "b2b-002",
        sku: "SS-MTL-BID-04",
        title_en: "Silver-Inlaid Bidriware Corporate Desk Decors",
        title_hi: "चांदी की नक्काशी वाले बिदरीवेयर डेकोर",
        multilingualTitles: {
            en: "Silver-Inlaid Bidriware Corporate Desk Decors",
            hi: "चांदी की नक्काशी वाले बिदरीवेयर डेकोर",
            kn: "ಬೆಳ್ಳಿ ಕೆತ್ತನೆಯ ಬಿದ್ರಿವೇರ್ ಡೆಸ್ಕ್ ಡೆಕೋರ್",
            te: "వెండి తాపడం చేసిన బిద్రివేర్ డెస్క్ డెకార్",
            ml: "വെള്ളി കൊത്തുപണികളുള്ള ബിദ്രി ഡെസ്ക് ഡെക്കോർ",
            mr: "चांदीची नक्षीकाम केलेली बिद्रीवेअर कलाकृती",
            bn: "রুপার কারুকাজ করা বিদ্রিওয়্যার ডেস্ক সজ্জা",
            ta: "வெள்ளி வேலைப்பாடுகள் கொண்ட பித்ரிவேர் மேஜை அலங்காரம்",
        },
        description_en: "Exquisite silver inlay bidriware artifacts for premium gifting.",
        description_hi: "प्रीमियम कॉर्पोरेट उपहारों के लिए बिदरीवेयर कलाकृतियां।",
        category: "Metalcraft",
        hs_code: "8306.29.00",
        gstRate: 12,
        enhanced_image_url: "/products/bidriware-vessel.png",
        raw_image_url: "/products/bidriware-vessel.png",
        pricing: {
            retail_price_inr: 2200,
            wholesale_price_inr: 1650,
            export_price_usd: 40,
            b2b_moq: 25,
        },
        logistics: {
            weight_grams: 850,
            is_fragile: false,
        },
        artisan: {
            id: "art-02",
            cluster_name: "Bidar Metalcraft Guild",
            state: "Karnataka",
        },
        leadTimeDays: 21,
        capacityPerMonth: 800,
        tiers: [
            { minQty: 25, maxQty: 75, unitPrice: 1650, discountLabel: "Tier 1 MOQ" },
            { minQty: 76, maxQty: 200, unitPrice: 1420, discountLabel: "14% Corporate" },
            { minQty: 201, maxQty: null, unitPrice: 1190, discountLabel: "28% Bulk Export" },
        ],
    },
    {
        id: "b2b-003",
        sku: "SS-TEX-MDB-09",
        title_en: "GI-Certified Madhubani Tussar Silk Stoles",
        title_hi: "जीआई-प्रमाणित मधुबनी टसर सिल्क स्टोल",
        multilingualTitles: {
            en: "GI-Certified Madhubani Tussar Silk Stoles",
            hi: "जीआई-प्रमाणित मधुबनी टसर सिल्क स्टोल",
            kn: "ಜಿಐ-ಪ್ರಮಾಣೀಕೃತ ಮಧುಬನಿ ರೇಷ್ಮೆ ಶಾಲು",
            te: "ಜಿಐ-ధృవీకరించబడిన మధుబని పట్టు శాలువా",
            ml: "ജിഐ സർട്ടിഫൈഡ് മധുബാനി പട്ട് ഷാൾ",
            mr: "जीआय-प्रमाणित मधुबनी सिल्क स्टोल",
            bn: "জিআই-প্রত্যয়িত মধুবাণী সিল্ক স্টোল",
            ta: "ஜிஐ-சான்றளிக்கப்பட்ட மதுபானி பட்டு சால்வை",
        },
        description_en: "Hand-painted organic silk stoles with GI-certified authentication.",
        description_hi: "जीआई-प्रमाणित हाथ से पेंट किए गए रेशमी स्टोल।",
        category: "Textiles",
        hs_code: "5007.20.10",
        gstRate: 5,
        enhanced_image_url: "/products/madhubani-scarf.png",
        raw_image_url: "/products/madhubani-scarf.png",
        pricing: {
            retail_price_inr: 1600,
            wholesale_price_inr: 1150,
            export_price_usd: 28,
            b2b_moq: 30,
        },
        logistics: {
            weight_grams: 220,
            is_fragile: false,
        },
        artisan: {
            id: "art-03",
            cluster_name: "Madhubani Artisan Cluster",
            state: "Bihar",
        },
        leadTimeDays: 18,
        capacityPerMonth: 1200,
        tiers: [
            { minQty: 30, maxQty: 100, unitPrice: 1150, discountLabel: "Wholesale MOQ" },
            { minQty: 101, maxQty: 250, unitPrice: 980, discountLabel: "15% Guild Rate" },
            { minQty: 251, maxQty: null, unitPrice: 840, discountLabel: "27% Volume Off" },
        ],
    },
];

export default function B2BShopPage() {
    const { currentLang } = useLanguageStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

    // String state allows empty field without displaying 0
    const [rawQuantities, setRawQuantities] = useState<Record<string, string>>(
        B2B_CATALOG.reduce((acc, p) => ({ ...acc, [p.id]: "" }), {})
    );

    const addToCart = useCartStore((state) => state.addToCart);

    const getProductTitle = (product: B2BExtendedProduct): string => {
        return (
            product.multilingualTitles?.[currentLang] ||
            (currentLang === "hi" && product.title_hi ? product.title_hi : product.title_en) ||
            product.title_en ||
            "Artisan Product"
        );
    };

    const handleManualQtyChange = (productId: string, val: string) => {
        // Only accept numeric inputs or empty string
        if (val === "" || /^[0-9]+$/.test(val)) {
            setRawQuantities((prev) => ({ ...prev, [productId]: val }));
        }
    };

    const handleStep = (productId: string, delta: number, moq: number) => {
        const current = parseInt(rawQuantities[productId] || "0", 10);
        const nextVal = Math.max(moq, (current === 0 ? moq : current) + delta);
        setRawQuantities((prev) => ({ ...prev, [productId]: String(nextVal) }));
    };

    const getNumericQty = (productId: string) => {
        return parseInt(rawQuantities[productId] || "0", 10);
    };

    const getActiveTier = (product: B2BExtendedProduct, qty: number) => {
        const effectiveQty = qty > 0 ? qty : product.pricing.b2b_moq || 25;
        return (
            product.tiers
                .slice()
                .reverse()
                .find((tier) => effectiveQty >= tier.minQty) || product.tiers[0]
        );
    };

    const handleAddToCartAction = (product: B2BExtendedProduct) => {
        const moq = product.pricing.b2b_moq || 25;
        const qty = getNumericQty(product.id);

        if (qty < moq) {
            alert(`Minimum Order Quantity (MOQ) for this craft is ${moq} units. Please enter ${moq} or more.`);
            return;
        }

        const activeTier = getActiveTier(product, qty);
        const productWithActiveTier: PublicProductItem = {
            ...product,
            pricing: {
                ...product.pricing,
                wholesale_price_inr: activeTier.unitPrice,
            },
        };

        addToCart("b2b", productWithActiveTier, qty);
        alert(`Added ${qty} units of "${getProductTitle(product)}" to Cart.`);
    };

    const handleRequestSampleAction = (product: B2BExtendedProduct) => {
        alert(
            `Sample RFQ Generated for SKU: ${product.sku}.\nCluster Lead Time: ${product.leadTimeDays} days.\nConsignment will be dispatched from Dak Ghar.`
        );
    };

    const filteredProducts = B2B_CATALOG.filter((p) => {
        const query = searchQuery.toLowerCase();
        const title = getProductTitle(p).toLowerCase();
        return (
            title.includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.hs_code.toLowerCase().includes(query) ||
            (p.artisan?.cluster_name || '').toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
            {/* 1. SEARCH & VIEW CONTROLS */}
            <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-auto flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="Search SKU, HSN, Craft, or Cluster..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                    />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300">
                    <button
                        onClick={() => setViewMode("cards")}
                        className={`p-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${viewMode === "cards"
                                ? "bg-white text-[#713F12] shadow-sm font-bold"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" /> Spec Cards
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={`p-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${viewMode === "table"
                                ? "bg-white text-[#713F12] shadow-sm font-bold"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <TableIcon className="w-3.5 h-3.5" /> Data Table
                    </button>
                </div>
            </div>

            {/* 2. PRODUCT CATALOG FEED */}
            {viewMode === "cards" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                        const moq = product.pricing.b2b_moq || 25;
                        const currentQty = getNumericQty(product.id);
                        const isBelowMoq = currentQty < moq;
                        const activeTier = getActiveTier(product, currentQty);
                        const lineTotal = currentQty > 0 ? activeTier.unitPrice * currentQty : 0;
                        const title = getProductTitle(product);

                        return (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-400 transition-all"
                            >
                                <div>
                                    <div className="relative h-48 w-full bg-slate-100">
                                        <Image
                                            src={product.enhanced_image_url || product.raw_image_url || '/vase.png'}
                                            alt={title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md">
                                            SKU: {product.sku}
                                        </div>
                                        <div className="absolute top-3 right-3 bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border border-slate-200">
                                            MOQ: {moq} units
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                                            {product.artisan.cluster_name} • {product.artisan.state}
                                        </div>
                                        <h3 className="text-base font-serif font-bold text-slate-900 mt-1 leading-snug">
                                            {title}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                                            <div>
                                                <span className="text-slate-400">HSN:</span>{" "}
                                                <span className="font-mono font-semibold">{product.hs_code}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">GST:</span>{" "}
                                                <span className="font-semibold">{product.gstRate}% ITC</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Lead Time:</span>{" "}
                                                <span className="font-semibold">{product.leadTimeDays} Days</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Capacity:</span>{" "}
                                                <span className="font-semibold">{product.capacityPerMonth}/mo</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                Tiered Bulk Pricing Slabs
                                            </div>
                                            <div className="space-y-1 text-xs">
                                                {product.tiers.map((tier, idx) => {
                                                    const isTierActive = activeTier.minQty === tier.minQty;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`flex justify-between items-center px-2 py-1 rounded-md transition-colors ${isTierActive
                                                                    ? "bg-amber-100/70 border border-amber-300 font-bold text-amber-950"
                                                                    : "text-slate-600"
                                                                }`}
                                                        >
                                                            <span>
                                                                {tier.minQty}
                                                                {tier.maxQty ? ` - ${tier.maxQty}` : "+"} units
                                                            </span>
                                                            <span className="font-mono">
                                                                ₹{tier.unitPrice}/pc{" "}
                                                                <span className="text-[10px] font-normal text-slate-500">
                                                                    ({tier.discountLabel})
                                                                </span>
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Quantity Box: Default empty (no 0 shown) */}
                                        <div className="mt-4 pt-3 border-t border-slate-200">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <label className="text-xs font-bold text-slate-700">Order Quantity:</label>
                                                <span className="text-[11px] text-slate-500 font-mono">
                                                    MOQ: {moq} units
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                                                    <button
                                                        onClick={() => handleStep(product.id, -25, moq)}
                                                        className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder={String(moq)}
                                                        value={rawQuantities[product.id] ?? ""}
                                                        onChange={(e) => handleManualQtyChange(product.id, e.target.value)}
                                                        className="w-16 text-center text-xs font-mono font-bold bg-transparent focus:outline-none placeholder:text-slate-400"
                                                    />
                                                    <button
                                                        onClick={() => handleStep(product.id, +25, moq)}
                                                        className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => setRawQuantities((prev) => ({ ...prev, [product.id]: "100" }))}
                                                    className="px-2.5 py-1.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300"
                                                >
                                                    100
                                                </button>
                                                <button
                                                    onClick={() => setRawQuantities((prev) => ({ ...prev, [product.id]: "250" }))}
                                                    className="px-2.5 py-1.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300"
                                                >
                                                    250
                                                </button>
                                                <button
                                                    onClick={() => setRawQuantities((prev) => ({ ...prev, [product.id]: "500" }))}
                                                    className="px-2.5 py-1.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300"
                                                >
                                                    500+
                                                </button>
                                            </div>

                                            {/* Warning & Batch total */}
                                            {currentQty > 0 && isBelowMoq && (
                                                <div className="mt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>Must be at least {moq} units</span>
                                                </div>
                                            )}

                                            <div className="mt-3 flex justify-between items-center text-xs font-semibold text-slate-800">
                                                <span>Est. Batch Total:</span>
                                                <span className="font-mono text-sm text-[#713F12] font-bold">
                                                    {lineTotal > 0 ? `₹${lineTotal.toLocaleString("en-IN")} + GST` : "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleRequestSampleAction(product)}
                                        className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all text-center"
                                    >
                                        Request Sample
                                    </button>
                                    <button
                                        onClick={() => handleAddToCartAction(product)}
                                        disabled={isBelowMoq}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center shadow-sm ${isBelowMoq
                                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                : "bg-[#713F12] hover:bg-[#522D0C] text-white"
                                            }`}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* TABLE VIEW */
                <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 border-collapse">
                        <thead className="bg-[#5F6F52]/15 text-[#2C3E1F] border-b border-[#5F6F52]/30 font-mono uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-3.5 pl-5">SKU & Item Name</th>
                                <th className="p-3.5">Cluster Origin</th>
                                <th className="p-3.5">HSN & Tax</th>
                                <th className="p-3.5">MOQ</th>
                                <th className="p-3.5">Tier 1 Price</th>
                                <th className="p-3.5">Max Vol. Price</th>
                                <th className="p-3.5">Lead Time</th>
                                <th className="p-3.5 pr-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium">
                            {filteredProducts.map((product) => {
                                const lowestTier = product.tiers[product.tiers.length - 1];
                                const moq = product.pricing.b2b_moq || 25;
                                const title = getProductTitle(product);

                                return (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3.5 pl-5">
                                            <div className="font-bold text-slate-900">{title}</div>
                                            <div className="font-mono text-[10px] text-slate-400">{product.sku}</div>
                                        </td>
                                        <td className="p-3.5">
                                            <div className="text-slate-800">{product.artisan.cluster_name}</div>
                                            <div className="text-[10px] text-slate-400">{product.artisan.state}</div>
                                        </td>
                                        <td className="p-3.5 font-mono">
                                            <div>{product.hs_code}</div>
                                            <div className="text-[10px] text-emerald-700 font-semibold">
                                                {product.gstRate}% GST
                                            </div>
                                        </td>
                                        <td className="p-3.5 font-mono font-bold text-slate-900">{moq} pcs</td>
                                        <td className="p-3.5 font-mono">₹{product.tiers[0].unitPrice}</td>
                                        <td className="p-3.5 font-mono text-emerald-700 font-bold">
                                            ₹{lowestTier.unitPrice}
                                        </td>
                                        <td className="p-3.5">{product.leadTimeDays} Days</td>
                                        <td className="p-3.5 pr-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleRequestSampleAction(product)}
                                                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold"
                                            >
                                                Sample
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const currentVal = getNumericQty(product.id);
                                                    const qty = currentVal >= moq ? currentVal : moq;
                                                    addToCart("b2b", product, qty);
                                                    alert(`Added ${qty} units of "${title}" to Cart.`);
                                                }}
                                                className="px-3 py-1.5 bg-[#713F12] text-white rounded-lg font-bold hover:bg-[#522D0C]"
                                            >
                                                Add to Cart
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 3. THE 4 KPI BOXES: Grey background, identical alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-300">
                <div className="bg-[#F1F5F9] rounded-2xl p-5 border border-slate-300 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider">Cluster Capacity</span>
                        <Boxes className="w-4 h-4 text-[#713F12]" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold font-mono text-slate-900">4,500+ Units/Mo</div>
                        <p className="text-[11px] text-slate-500 mt-1">Directly available for Institutional orders</p>
                    </div>
                </div>

                <div className="bg-[#F1F5F9] rounded-2xl p-5 border border-slate-300 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider">Tax & Compliance</span>
                        <FileSpreadsheet className="w-4 h-4 text-[#713F12]" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold font-mono text-slate-900">B2B E-Way Ready</div>
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">Auto-CGST / SGST / IGST Proformas</p>
                    </div>
                </div>

                <div className="bg-[#F1F5F9] rounded-2xl p-5 border border-slate-300 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider">Logistics Channel</span>
                        <Layers className="w-4 h-4 text-[#713F12]" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold font-mono text-slate-900">Dak Ghar Freight</div>
                        <p className="text-[11px] text-slate-500 mt-1">India Post commercial bulk crating</p>
                    </div>
                </div>

                <div className="bg-[#F1F5F9] rounded-2xl p-5 border border-slate-300 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span className="font-semibold uppercase tracking-wider">Escrow Protection</span>
                        <ShieldCheck className="w-4 h-4 text-[#713F12]" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold font-mono text-slate-900">100% Protected</div>
                        <p className="text-[11px] text-amber-800 mt-1">Payment released upon verified intake</p>
                    </div>
                </div>
            </div>

            {/* 4. ENTERPRISE PROCUREMENT GUIDELINES */}
            <section className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                    <span className="text-[11px] font-mono font-bold text-[#713F12] uppercase tracking-wider">
                        Institutional Procurement Framework
                    </span>
                    <h2 className="text-xl font-serif font-bold text-slate-900 mt-1">
                        B2B Compliance, Escrow & Bulk Logistics Guidelines
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Official operational safeguards governed under the Ministry Handicraft Direct Linkage & India Post Escrow Protocol.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                            <FileText className="w-4 h-4 text-[#713F12]" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase">1. GST Input Tax Credit (ITC)</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Every wholesale dispatch includes a computerized GST tax invoice with statutory HSN codes. B2B buyers can offset full CGST, SGST, or IGST credits directly on the GST portal.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                            <Truck className="w-4 h-4 text-[#713F12]" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase">2. India Post Commercial Logistics</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Consignments above 25 units are crated in impact-resistant packaging under Postal Superintendent oversight and dispatched directly from the cluster’s Nodal Dak Ghar.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                            <ShieldCheck className="w-4 h-4 text-[#713F12]" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase">3. Dak Ghar Escrow Protection</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Advance milestone payments remain locked in the official Shilp Setu Escrow. Final artisan payout is released only after the consignment undergoes destination hub barcode verification.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Need custom cluster branding, bespoke packaging, or institutional contracts above 1,000 units?</span>
                    </div>
                    <button
                        onClick={() =>
                            alert("Connecting to Cluster Nodal Officer Desk:\nHelpline: 1800-266-6868\nEmail: corporate-desk@shilpsetu.gov.in")
                        }
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0"
                    >
                        <span>Contact Desk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </section>

            {/* 5. SOLID TERRACOTTA FOOTER */}
            <footer className="rounded-2xl bg-[#713F12] text-white py-5 px-6 text-center space-y-1.5 shadow-md">
                <p className="font-serif font-black tracking-widest text-base sm:text-lg text-white">
                    SHILP SETU
                    <span className="text-xs text-[#DEBFA3] font-medium tracking-wider ml-2">
                        — BRIDGE OF CRAFTS (B2B WHOLESALE PORTAL)
                    </span>
                </p>
                <p className="text-[11px] text-amber-200/80 tracking-wide">
                    Empowering Indian Artisan Guilds • Direct-from-Cluster Institutional Linkage • Certified ONDC Compliant
                </p>
            </footer>
        </div>
    );
}