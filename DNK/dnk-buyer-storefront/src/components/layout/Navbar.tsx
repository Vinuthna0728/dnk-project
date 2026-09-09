"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useLanguageStore, LanguageCode } from "@/store/useLanguageStore";

export const Navbar: React.FC = () => {
  const cartItems = useCartStore((state) => state.items);
  const { currentLang, setLanguage } = useLanguageStore();

  const languageOptions: { code: LanguageCode; label: string }[] = [
    { code: "hi", label: "हिंदी (Hindi)" },
    { code: "en", label: "English" },
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "ml", label: "മലയാളം (Malayalam)" },
    { code: "mr", label: "मराठी (Marathi)" },
    { code: "bn", label: "বাংলা (Bengali)" },
    { code: "ta", label: "தமிழ் (Tamil)" },
  ];

  return (
    <header className="w-full sticky top-0 z-30 select-none shadow-md">
      {/* 1. Top Bar: Language Pills + Bag Icon */}
      <div className="w-full bg-[#FAF6F0] border-b border-[#E6D7C3] px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#5A3A22] mr-1">Select Language:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {languageOptions.map((item) => (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${currentLang === item.code
                    ? "bg-[#183D2E] text-white font-bold shadow-sm"
                    : "bg-[#F4EDE2] text-[#4A2E18] hover:bg-[#EAE0D0] border border-[#DEBFA3]"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/cart"
          className="relative p-2 rounded-xl bg-[#F4EDE2] hover:bg-[#EAE0D0] border border-[#DEBFA3] text-[#183D2E] transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Bag</span>
          {cartItems.length > 0 && (
            <span className="w-5 h-5 bg-[#D81B60] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
              {cartItems.length}
            </span>
          )}
        </Link>
      </div>

      {/* 2. Green Banner: Centered Title Only (Removed D2C Inland Retail) */}
      <div className="w-full bg-[#183D2E] text-[#FAF6F0] py-2.5 px-6 flex items-center justify-center border-b border-[#112D22]">
        <div className="text-center">
          <span className="font-serif font-black tracking-widest text-base sm:text-lg text-white">
            SHILP SETU
          </span>
          <span className="text-xs text-[#DEBFA3] font-medium tracking-wider ml-2">
            — BRIDGE OF CRAFTS
          </span>
        </div>
      </div>
    </header>
  );
};