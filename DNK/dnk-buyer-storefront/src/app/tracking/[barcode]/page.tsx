// src/app/tracking/[barcode]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Package, CheckCircle2, Clock, MapPin, ArrowLeft, ShieldCheck, FileText, Download, Loader2 } from "lucide-react";
import { fetchTrackingByBarcode, TrackingDetails, TrackingEvent } from "@/lib/api";

export default function TrackingPage({ params }: { params: { barcode: string } }) {
  const barcode = decodeURIComponent(params.barcode || "DNK000000026IN");
  const [tracking, setTracking] = useState<TrackingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTracking() {
      try {
        const data = await fetchTrackingByBarcode(barcode);
        if (isMounted && data) {
          setTracking(data);
        }
      } catch (err) {
        console.warn("Using default tracking view for barcode:", barcode, err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadTracking();
    return () => {
      isMounted = false;
    };
  }, [barcode]);

  const originFacility = tracking?.origin_facility || "DNK Belagavi (DNK-KA-BEL-01)";
  const destination = tracking?.destination_country ? `${tracking.destination_country} (USPS / Direct Post)` : "USA (USPS)";
  const escrowHeld = tracking ? tracking.escrow_status : "FUNDS_HELD_ESCROW";
  const events: TrackingEvent[] = tracking?.events && tracking.events.length > 0 ? tracking.events : [
    {
      event_type: "PBE_FILING",
      location: "DNK Electronic Customs Gateway",
      description: "Electronic PBE-III customs declaration registered. Simulated ICEGATE clearance.",
      timestamp: "Aug 17, 2026 • 01:16 PM",
      status: "COMPLETED",
    },
    {
      event_type: "POSTAL_ACCEPTANCE",
      location: "Belagavi DNK Post Office (DNK-KA-BEL-01)",
      description: "Physical parcel drop-off and counter barcode scan at Dak Ghar Niryat Kendra.",
      timestamp: "Awaiting Physical Drop-Off",
      status: "ACTIVE",
    },
    {
      event_type: "FPO_LEO_CLEARANCE",
      location: "CBIC Foreign Post Office (FPO)",
      description: "Customs appraisal and Let Export Order (LEO) grant by CBIC Foreign Post Office.",
      timestamp: "Pending FPO Transfer",
      status: "PENDING",
    },
    {
      event_type: "AIR_MAIL_DISPATCH",
      location: "Bengaluru International Air Mail Transit Hub",
      description: "Air mail container consolidation and international flight uplift.",
      timestamp: "Pending Dispatch",
      status: "PENDING",
    },
    {
      event_type: "DESTINATION_DELIVERY",
      location: "United States (USPS / Partner Post)",
      description: "Final destination carrier delivery to recipient address.",
      timestamp: "Pending Delivery",
      status: "PENDING",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/home" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1E3A8A] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Barcode Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Simulated ICEGATE Gateway Synced
            </div>
            <h1 className="text-2xl font-black text-[#1E3A8A]">
              CN23 Barcode: <span className="font-mono text-slate-900">{tracking?.tracking_number || barcode}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Origin: <span className="font-semibold text-slate-700">{originFacility}</span> → Destination: <span className="font-semibold text-slate-700">{destination}</span>
            </p>
            {tracking?.product_title && (
              <p className="text-xs text-slate-600 mt-0.5">
                Item: <span className="font-medium text-slate-900">{tracking.product_title}</span> (HS: {tracking.hs_code})
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Escrow State: {escrowHeld}</span>
            </div>
            {tracking?.cn23_pdf_url && (
              <a
                href={`http://localhost:8000${tracking.cn23_pdf_url}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#1E3A8A] hover:underline font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> View Generated CN23 PDF
              </a>
            )}
          </div>
        </div>

        {/* Postal Timeline Steps */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#1E3A8A]">Export & Delivery Lifecycle</h2>
            <span className="text-xs text-slate-400">Postal Acceptance Scan triggers Escrow Release</span>
          </div>

          <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((event, idx) => {
              const isCompleted = event.status === "COMPLETED";
              const isActive = event.status === "ACTIVE";

              return (
                <div key={idx} className={`relative pl-10 flex items-start justify-between ${!isCompleted && !isActive ? "opacity-50" : ""}`}>
                  <div
                    className={`absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-[#2563EB] text-white animate-pulse"
                        : "bg-slate-300 text-slate-600"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{event.location}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                    <span className="text-[11px] font-mono text-slate-400 mt-1 block">{event.timestamp}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : isActive
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isCompleted ? "Completed" : isActive ? "Active" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
