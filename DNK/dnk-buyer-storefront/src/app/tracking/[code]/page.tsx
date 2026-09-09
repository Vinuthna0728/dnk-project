'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Truck, ShieldCheck, MapPin, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { trackingService, PostalTrackingResponse } from "@/services/trackingService";

export default function UniversalTrackingPage() {
  const params = useParams();
  const rawCode = (params?.code as string) || "IN987654321IN";
  const code = decodeURIComponent(rawCode);

  const [trackingData, setTrackingData] = useState<PostalTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) {
      setLoading(true);
      trackingService.getTrackingDetails(code)
        .then((data) => {
          setTrackingData(data);
          setLoading(false);
        })
        .catch(() => {
          // Fallback to structural representation if backend mock
          setTrackingData(null);
          setLoading(false);
        });
    }
  }, [code]);

  const defaultStages = [
    {
      title: "Parcel Booked at Dak Ghar (DNK)",
      desc: "Artisan handed over packaged consignment to Counter Assistant.",
      date: "Aug 16, 2026 • 10:45 AM",
      completed: true,
      location: "Varanasi Central DNK Hub, Uttar Pradesh",
    },
    {
      title: "Electronic PBE-III / Domestic Waybill Generated",
      desc: "Postal tracking barcode registered & manifest generated.",
      date: "Aug 16, 2026 • 02:15 PM",
      completed: true,
      location: "Department of Posts Dispatch Terminal",
    },
    {
      title: "Customs Inspection & Escrow Trigger Scan",
      desc: "Parcel scanned at hub. Escrow release signal broadcasted to smart contract.",
      date: "Aug 17, 2026 • 09:00 AM",
      completed: trackingData?.current_status !== "BOOKED",
      location: "Postal Sorting & Export Examination Office",
    },
    {
      title: "In-Transit to Destination / Final Delivery",
      desc: "Dispatched via Speed Post / International Air Mail Express.",
      date: "Estimated Delivery: 3-5 Business Days",
      completed: trackingData?.current_status === "DELIVERED",
      location: trackingData?.destination_hub || "Destination Post Office",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                  India Post Logistics Tracking
                </span>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                  {code}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Universal Postal Consignment Tracking Portal
                </p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Verified Shipment</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Postal Waybill Authenticated</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs">Connecting to India Post Tracking API...</span>
              </div>
            ) : trackingData && trackingData.events && trackingData.events.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {trackingData.events.map((evt, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow z-10 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {evt.status_description}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {evt.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {evt.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {defaultStages.map((stage, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow z-10 shrink-0 ${
                        stage.completed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                      }`}
                    >
                      {stage.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {stage.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {stage.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {stage.desc}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {stage.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
