"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Settings,
    HelpCircle,
    LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { SettingsModal } from "@/components/shared/SettingsModal";

export const AppSidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { buyer, logout } = useAuthStore();
    const texts = useLanguageStore((state) => state.t)();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    return (
        <>
            <aside className="w-64 bg-[#F4EDE2] text-[#183D2E] flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 py-6 px-4 z-40 border-r border-[#DEBFA3] shadow-lg select-none">
                <div className="space-y-6">
                    {/* Buyer Identity Profile Block */}
                    <div className="flex items-center gap-3 px-2 pb-5 border-b border-[#DEBFA3]">
                        <div className="w-11 h-11 rounded-full bg-[#183D2E] text-[#FAF6F0] flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-[#DEBFA3] flex-shrink-0">
                            {buyer?.name?.[0] || "A"}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xs font-black text-[#2E1D11] truncate">{buyer?.name || "Ananya Deshmukh"}</h2>
                            <span className="text-[10px] text-[#8C6D53] font-semibold block truncate">D2C Domestic Buyer</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                        <Link
                            href="/shop"
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive("/shop")
                                    ? "bg-[#183D2E] text-white shadow-md shadow-[#183D2E]/20"
                                    : "text-[#183D2E] hover:bg-[#EAE0D0]"
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{texts.crafts}</span>
                        </Link>

                        <Link
                            href="/orders"
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive("/orders")
                                    ? "bg-[#183D2E] text-white shadow-md shadow-[#183D2E]/20"
                                    : "text-[#183D2E] hover:bg-[#EAE0D0]"
                                }`}
                        >
                            <Package className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{texts.myOrders}</span>
                        </Link>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#183D2E] hover:bg-[#EAE0D0] transition-all text-left"
                        >
                            <Settings className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{texts.settings}</span>
                        </button>

                        <button
                            onClick={() => alert("Speed Post Helpline: 1800-266-6868\nEmail: support@shilpsetu.gov.in")}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#183D2E] hover:bg-[#EAE0D0] transition-all text-left"
                        >
                            <HelpCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{texts.helpSupport}</span>
                        </button>
                    </nav>
                </div>

                {/* Bottom Log Out in Matching Green */}
                <div className="pt-4 border-t border-[#DEBFA3] px-2">
                    <button
                        onClick={() => {
                            logout();
                            router.push("/");
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#183D2E] hover:bg-[#EAE0D0] transition-colors"
                    >
                        <LogOut className="w-4 h-4 text-[#183D2E] flex-shrink-0" />
                        <span>{texts.logout}</span>
                    </button>
                </div>
            </aside>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
};