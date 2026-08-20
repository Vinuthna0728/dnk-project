// src/components/home/TrustBadges.tsx
import React from "react";
import { Lock, FileCheck, Award, PlaneTakeoff } from "lucide-react";

export default function TrustBadges() {
  return (
    <section id="escrow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <Lock className="w-6 h-6 text-emerald-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Escrow Protected</h4>
            <p className="text-xs text-slate-500 mt-1">Funds released only after first India Post barcode scan.</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <FileCheck className="w-6 h-6 text-[#2563EB] mt-0.5" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">PBE-III Automated</h4>
            <p className="text-xs text-slate-500 mt-1">Official Postal Bill of Export filed with CBIC ICEGATE.</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <Award className="w-6 h-6 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Verified Exporters</h4>
            <p className="text-xs text-slate-500 mt-1">All artisans carry valid IEC numbers and DNK facility codes.</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <PlaneTakeoff className="w-6 h-6 text-[#1E3A8A] mt-0.5" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Air Mail Dispatch</h4>
            <p className="text-xs text-slate-500 mt-1">Shipped via India Post international air priority channels.</p>
          </div>
        </div>
      </div>
    </section>
  );
}