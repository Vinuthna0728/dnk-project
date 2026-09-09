"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    Boxes,
    FileSpreadsheet,
    FileCheck,
    Building2,
    HelpCircle,
    LogOut,
    ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { SettingsModal } from "@/components/shared/SettingsModal";

export const B2BSidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { buyer, logout } = useAuthStore();
    const { currentLang } = useLanguageStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const labels: Record<string, Record<string, string>> = {
        catalog: {
            en: "Wholesale Catalog",
            hi: "थोक कैटलॉग",
            kn: "ಸಗಟು ಕ್ಯಾಟಲಾಗ್",
            te: "టోకు కేటలాగ్",
            ml: "മൊത്തവ്യാപാര കാറ്റലോഗ്",
            mr: "घाऊक कॅटलॉग",
            bn: "পাইকারি ক্যাটালগ",
            ta: "மொத்த விற்பனை பட்டியல்",
        },
        rfq: {
            en: "Active RFQs & Cart",
            hi: "सक्रिय RFQ और कार्ट",
            kn: "ಸಕ್ರಿಯ RFQ ಮತ್ತು ಕಾರ್ಟ್",
            te: "యాక్టివ్ RFQ మరియు కార్ట్",
            ml: "സജീവ RFQ & കാർട്ട്",
            mr: "सक्रिय RFQ आणि कार्ट",
            bn: "সক্রিয় RFQ এবং কার্ট",
            ta: "செயலில் உள்ள RFQ & கார்ட்",
        },
        orders: {
            en: "Purchase Orders & POs",
            hi: "खरीद आदेश (PO)",
            kn: "ಖರೀದಿ ಆದೇಶಗಳು",
            te: "కొనుగోలు ఆర్డర్లు",
            ml: "പർച്ചേസ് ഓർഡറുകൾ",
            mr: "खरेदी ऑर्डर",
            bn: "ক্রয় আদেশ",
            ta: "கொள்முதல் ஆர்டர்கள்",
        },
        profile: {
            en: "Company Profile & GST",
            hi: "कंपनी प्रोफाइल और GST",
            kn: "ಕಂಪನಿ ಪ್ರೊಫೈಲ್ ಮತ್ತು GST",
            te: "ಕಂಪನಿ ಪ್ರೊಫೈಲ್ ಮತ್ತು GST",
            ml: "കമ്പനി പ്രൊഫൈലും GST യും",
            mr: "कंपनी प्रोफाइल आणि GST",
            bn: "কোম্পানি প্রোফাইল ও GST",
            ta: "நிறுவனத்தின் விவரக்குறிப்பு & GST",
        },
        support: {
            en: "Wholesale Desk Support",
            hi: "थोक सहायता डेस्क",
            kn: "ಸಗಟು ಬೆಂಬಲ ಡೆಸ್ಕ್",
            te: "టోకు సపోర్ట్ డెస్క్",
            ml: "ഹെൽപ്പ് ഡെസ്ക് പിന്തുണ",
            mr: "घाऊक डेस्क सपोर्ट",
            bn: "পাইকারি ডেস্ক সাপোর্ট",
            ta: "மொத்த விற்பனை உதவி",
        },
        logout: {
            en: "Log Out",
            hi: "लॉग आउट",
            kn: "ಲಾಗ್ ಔಟ್",
            te: "లాగ్ అవుట్",
            ml: "ലോഗ് ഔട്ട്",
            mr: "लॉग आउट",
            bn: "লগ আউট",
            ta: "வெளியேறு",
        },
    };

    const getLabel = (key: string) => labels[key]?.[currentLang] || labels[key]?.["en"];

    return (
        <>
            <aside className="w-64 bg-[#F4EDE2] text-[#713F12] flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 py-6 px-4 z-40 border-r border-[#DEBFA3] shadow-lg select-none">
                <div className="space-y-6">
                    {/* Buyer Identity Profile Block */}
                    <div className="flex items-center gap-3 px-2 pb-5 border-b border-[#DEBFA3]">
                        <div className="w-11 h-11 rounded-full bg-[#713F12] text-[#FAF6F0] flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-[#DEBFA3] flex-shrink-0">
                            {buyer?.name?.[0] || "A"}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xs font-black text-[#2E1D11] truncate">
                                {buyer?.name || "Ananya Deshmukh"}
                            </h2>
                            <span className="text-[10px] text-[#8C6D53] font-semibold block truncate">
                                B2B Verified Entity
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                        <Link
                            href="/b2b/shop"
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive("/b2b/shop")
                                    ? "bg-[#713F12] text-white shadow-md shadow-[#713F12]/20"
                                    : "text-[#713F12] hover:bg-[#EAE0D0]"
                                }`}
                        >
                            <Boxes className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{getLabel("catalog")}</span>
                        </Link>

                        <Link
                            href="/b2b/cart"
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive("/b2b/cart")
                                    ? "bg-[#713F12] text-white shadow-md shadow-[#713F12]/20"
                                    : "text-[#713F12] hover:bg-[#EAE0D0]"
                                }`}
                        >
                            <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{getLabel("rfq")}</span>
                        </Link>

                        <Link
                            href="/b2b/orders"
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive("/b2b/orders")
                                    ? "bg-[#713F12] text-white shadow-md shadow-[#713F12]/20"
                                    : "text-[#713F12] hover:bg-[#EAE0D0]"
                                }`}
                        >
                            <FileCheck className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{getLabel("orders")}</span>
                        </Link>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#713F12] hover:bg-[#EAE0D0] transition-all text-left cursor-pointer"
                        >
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{getLabel("profile")}</span>
                        </button>

                        <button
                            onClick={() =>
                                alert(
                                    "India Post Commercial Logistics Desk:\nHelpline: 1800-266-6868\nEmail: b2b@shilpsetu.gov.in"
                                )
                            }
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#713F12] hover:bg-[#EAE0D0] transition-all text-left cursor-pointer"
                        >
                            <HelpCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{getLabel("support")}</span>
                        </button>
                    </nav>
                </div>

                {/* Bottom Log Out */}
                <div className="pt-4 border-t border-[#DEBFA3] px-2">
                    <button
                        onClick={() => {
                            logout();
                            router.push("/");
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#713F12] hover:bg-[#EAE0D0] transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 text-[#713F12] flex-shrink-0" />
                        <span>{getLabel("logout")}</span>
                    </button>
                </div>
            </aside>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
};