// src/components/home/OndcSection.tsx
import React from "react";
import { Network, Globe2, ShieldAlert } from "lucide-react";

export default function OndcSection() {
  return (
    <section id="ondc" className="bg-slate-900 text-white py-12 my-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            Open Network Integration
          </span>
          <h2 className="text-2xl font-black leading-tight">
            ONDC International Node Integration
          </h2>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
            <Network className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="font-bold text-white mb-1">Decentralized Buyer Discovery</h4>
            <p>Products broadcast across ONDC global buyer apps without 30% marketplace fees.</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
            <Globe2 className="w-5 h-5 text-sky-400 mb-2" />
            <h4 className="font-bold text-white mb-1">Vector Semantic Search</h4>
            <p>Global buyers can search crafts in natural language with automated HS code lookup.</p>
          </div>
        </div>
      </div>
    </section>
  );
}