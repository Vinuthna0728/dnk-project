// src/app/customs-pbe3/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, ShieldCheck, CheckCircle2, ArrowLeft, Download, RefreshCw, ExternalLink } from "lucide-react";
import { fetchPBEFilings, PBEResponse, ensureBuyerAuthenticated } from "@/lib/api";

const DEMO_PBES: Array<{
    pbeNumber: string;
    exporter: string;
    hsCode: string;
    barcode: string;
    cbicStatus: string;
    cn23Url?: string;
}> = [
    {
        pbeNumber: "PBE-2026-99102",
        exporter: "Ramesh Kumar (DNK-KA-BEL-01)",
        hsCode: "8306.29.00",
        barcode: "IN987654321IN",
        cbicStatus: "LEO GRANTED",
    },
    {
        pbeNumber: "PBE-2026-99103",
        exporter: "Fatima Begum (DNK-JK-SRN-02)",
        hsCode: "6214.20.20",
        barcode: "IN882193019IN",
        cbicStatus: "SUBMITTED TO ICEGATE",
    },
];

export default function CustomsPbe3Page() {
    const [filings, setFilings] = useState<PBEResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function loadData() {
            try {
                await ensureBuyerAuthenticated();
                const liveFilings = await fetchPBEFilings();
                if (isMounted && liveFilings && liveFilings.length > 0) {
                    setFilings(liveFilings);
                }
            } catch (err) {
                console.warn("Using offline demo PBE filings:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        loadData();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <Link href="/home" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1E3A8A] mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 mb-6 gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-2 border border-emerald-200">
                                <ShieldCheck className="w-4 h-4" /> Simulated ICEGATE Gateway (SIH Prototype Mode)
                            </div>
                            <h1 className="text-2xl font-black text-[#1E3A8A]">
                                Postal Bill of Export (PBE-III) Compliance Engine
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Zero-barrier automated export filings for micro-MSMEs and Indian artisans.
                            </p>
                        </div>
                        {filings.length > 0 && (
                            <a
                                href={`http://localhost:8000/api/v1/logistics/pbe/${filings[0].id}/cn23-pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#2563EB] transition shrink-0"
                            >
                                <Download className="w-4 h-4" /> Download Latest CN23 PDF
                            </a>
                        )}
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

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-bold text-[#1E3A8A]">Recent Automated Electronic Filings</h2>
                        <span className="text-xs text-slate-500">
                            {filings.length > 0 ? `${filings.length} Active Filings` : "2 Demo Filings"}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="p-3">PBE Filing ID</th>
                                    <th className="p-3">Order Ref</th>
                                    <th className="p-3">HS Code</th>
                                    <th className="p-3">CN23 Barcode</th>
                                    <th className="p-3">CBIC Status</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filings.length > 0 ? (
                                    filings.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-mono text-[#1E3A8A] font-bold">
                                                {p.pbe_number || `PBE-${String(p.id).padStart(6, "0")}`}
                                            </td>
                                            <td className="p-3 font-medium text-slate-900">
                                                ORD-DNK-{p.order_id} ({p.country})
                                            </td>
                                            <td className="p-3 font-mono">{p.hs_code}</td>
                                            <td className="p-3 font-mono">
                                                <Link
                                                    href={`/tracking/${p.tracking_number || p.barcode}`}
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    {p.tracking_number || p.barcode || `DNK${String(p.order_id).padStart(9, "0")}IN`}
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </td>
                                            <td className="p-3">
                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                    {p.icegate_status || p.status || "LEO GRANTED"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <a
                                                    href={`http://localhost:8000/api/v1/logistics/pbe/${p.id}/cn23-pdf`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-[#1E3A8A] hover:text-[#2563EB] font-bold inline-flex items-center gap-1"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> PDF
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    DEMO_PBES.map((d, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="p-3 font-mono text-[#1E3A8A] font-bold">{d.pbeNumber}</td>
                                            <td className="p-3 font-medium text-slate-900">{d.exporter}</td>
                                            <td className="p-3 font-mono">{d.hsCode}</td>
                                            <td className="p-3 font-mono">
                                                <Link
                                                    href={`/tracking/${d.barcode}`}
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    {d.barcode}
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </td>
                                            <td className="p-3">
                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                    {d.cbicStatus}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <span className="text-[11px] text-slate-400">Demo</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
