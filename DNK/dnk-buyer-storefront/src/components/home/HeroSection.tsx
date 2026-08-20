// src/components/home/HeroSection.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ShieldCheck, CheckCircle2, PackageCheck } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [trackingNo, setTrackingNo] = useState("IN987654321IN");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNo.trim()) {
      router.push(`/tracking/${trackingNo.trim()}`);
    }
  };

  return (
    <section className="w-full bg-slate-100 pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="relative rounded-xl overflow-hidden bg-white shadow-xl flex flex-col md:flex-row min-h-[420px] border border-slate-200">

          <div className="w-full md:w-3/5 bg-[#1E3A8A] text-white p-8 sm:p-12 flex flex-col justify-between slanted-hero z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-white/15">
                <ShieldCheck className="w-4 h-4" /> CBIC PBE-III Compliant • Cross-Border Escrow
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
                Buy Directly from Verified Indian Artisans
              </h1>
              <p className="text-slate-200 text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
                Streamlined postal exports backed by Department of Posts. Every order features automated 8-digit HS Code customs filing and zero-fraud escrow payout triggers.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/verified-artisans" className="bg-[#D92D20] text-white px-6 py-3.5 rounded font-bold text-sm hover:bg-red-700 transition flex items-center gap-2 shadow-lg">
                Explore Crafts <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="bg-white/10 text-white border border-white/20 px-6 py-3.5 rounded font-bold text-sm hover:bg-white/20 transition">
                How Escrow Works
              </a>
            </div>
          </div>

          <div
            className="w-full md:w-2/5 bg-cover bg-center min-h-[280px] md:min-h-full relative"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-xl max-w-xs border border-slate-200">
              <div className="flex items-center gap-2 text-[#1E3A8A] font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified DNK Artisan</span>
              </div>
              <p className="text-xs text-slate-600">
                Handcrafted Brass & Woodware • Karan Artisan (DNK-2026-8890)
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Search Form */}
        <div id="tracking" className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
            <label className="block text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-[#D92D20]" />
              Search or Track DNK Overseas Packages
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Enter your official Postal CN23 tracking barcode to inspect real-time dispatch and Let Export Order (LEO) status.
            </p>
            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter CN23 Barcode (e.g., IN987654321IN)"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                className="flex-1 border border-slate-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-mono"
              />
              <button type="submit" className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-[#2563EB] transition flex items-center gap-2">
                <Search className="w-4 h-4" /> Track
              </button>
            </form>
          </div>

          <div className="flex justify-around items-center text-center">
            <div>
              <span className="block text-2xl font-black text-[#1E3A8A]">PBE-III</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Auto Customs</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="block text-2xl font-black text-[#1E3A8A]">Escrow</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Protected</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}