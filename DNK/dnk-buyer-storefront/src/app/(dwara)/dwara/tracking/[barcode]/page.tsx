// src/app/tracking/[barcode]/page.tsx
import React from "react";
import Link from "next/link";
import Header from "@/components/dwara/layout/Header";
import Footer from "@/components/dwara/layout/Footer";
import { Package, CheckCircle2, Clock, MapPin, ArrowLeft, ShieldCheck, FileText } from "lucide-react";

export default function TrackingPage({ params }: { params: { barcode: string } }) {
  const barcode = params.barcode || "IN987654321IN";

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/dwara/home" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1E3A8A] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Barcode Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> CBIC ICEGATE Synced
            </div>
            <h1 className="text-2xl font-black text-[#1E3A8A]">
              CN23 Barcode: <span className="font-mono text-slate-900">{barcode}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Origin Facility: DNK Belagavi (DNK-KA-BEL-01) → Destination: USA (USPS)</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Escrow Payout Triggered to Artisan</span>
          </div>
        </div>

        {/* Postal Timeline Steps */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
          <h2 className="text-lg font-bold text-[#1E3A8A] mb-6">Real-Time Export & Delivery Lifecycle</h2>

          <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">

            {/* Step 1 */}
            <div className="relative pl-10 flex items-start justify-between">
              <div className="absolute left-0 top-1 w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">1. Postal Counter Acceptance & Scan</h4>
                <p className="text-xs text-slate-500 mt-0.5">Scanned at Belagavi DNK Post Office. Escrow released ₹1,200 to seller bank account.</p>
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">Aug 14, 2026 • 10:30 AM</span>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded">Completed</span>
            </div>

            {/* Step 2 */}
            <div className="relative pl-10 flex items-start justify-between">
              <div className="absolute left-0 top-1 w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">2. Electronic PBE-III Filing Cleared</h4>
                <p className="text-xs text-slate-500 mt-0.5">Customs Let Export Order (LEO) granted by CBIC Foreign Post Office (FPO).</p>
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">Aug 14, 2026 • 01:15 PM</span>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded">Completed</span>
            </div>

            {/* Step 3 */}
            <div className="relative pl-10 flex items-start justify-between">
              <div className="absolute left-0 top-1 w-7 h-7 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold text-xs animate-pulse">
                •
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">3. Air Mail Customs Transit</h4>
                <p className="text-xs text-slate-500 mt-0.5">Dispatched to Air Freight Hub (Bengaluru FPO). Outbound to International Destination.</p>
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">In Progress</span>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded">Active</span>
            </div>

            {/* Step 4 */}
            <div className="relative pl-10 flex items-start justify-between opacity-50">
              <div className="absolute left-0 top-1 w-7 h-7 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">4. Destination Delivery (USPS / Partner Post)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Final delivery to overseas buyer address.</p>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded">Pending</span>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}