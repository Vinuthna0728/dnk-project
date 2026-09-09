// src/app/customs-pbe3/page.tsx
import React from "react";
import Link from "next/link";
import Header from "@/components/dwara/layout/Header";
import Footer from "@/components/dwara/layout/Footer";
import { FileText, ShieldCheck, CheckCircle2, ArrowLeft, Download, RefreshCw } from "lucide-react";

export default function CustomsPbe3Page() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <Link href="/dwara/home" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1E3A8A] mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 mb-8">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-2 border border-emerald-200">
                                <ShieldCheck className="w-4 h-4" /> Automated ICEGATE Gateway
                            </div>
                            <h1 className="text-2xl font-black text-[#1E3A8A]">
                                Postal Bill of Export (PBE-III) Compliance Engine
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Zero-barrier automated export filings for micro-MSMEs and Indian artisans.
                            </p>
                        </div>
                        <button className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#2563EB] transition">
                            <Download className="w-4 h-4" /> Download Sample PBE-III PDF
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-400 uppercase block">Filing Mode</span>
                            <span className="text-sm font-bold text-[#1E3A8A] mt-1 block">Commercial Export (PBE-III)</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-400 uppercase block">HS Code Matching</span>
                            <span className="text-sm font-bold text-[#1E3A8A] mt-1 block">Vector DB Automated 8-Digit</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-400 uppercase block">Export Benefits</span>
                            <span className="text-sm font-bold text-emerald-600 mt-1 block">RoDTEP & Drawback Auto-Claim</span>
                        </div>
                    </div>

                    <h2 className="text-base font-bold text-[#1E3A8A] mb-4">Recent Automated Electronic Filings</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="p-3">PBE Filing ID</th>
                                    <th className="p-3">Artisan Exporter</th>
                                    <th className="p-3">HS Code</th>
                                    <th className="p-3">CN23 Barcode</th>
                                    <th className="p-3">CBIC Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-[#1E3A8A] font-bold">PBE-2026-99102</td>
                                    <td className="p-3 font-medium text-slate-900">Ramesh Kumar (DNK-KA-BEL-01)</td>
                                    <td className="p-3 font-mono">8306.29.00</td>
                                    <td className="p-3 font-mono">IN987654321IN</td>
                                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">LEO GRANTED</span></td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-[#1E3A8A] font-bold">PBE-2026-99103</td>
                                    <td className="p-3 font-medium text-slate-900">Fatima Begum (DNK-JK-SRN-02)</td>
                                    <td className="p-3 font-mono">6214.20.20</td>
                                    <td className="p-3 font-mono">IN882193019IN</td>
                                    <td className="p-3"><span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">SUBMITTED TO ICEGATE</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}