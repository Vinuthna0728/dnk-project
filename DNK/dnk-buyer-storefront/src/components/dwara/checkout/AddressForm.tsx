// src/components/checkout/AddressForm.tsx
"use client";

import React from "react";
import { User, Globe, MapPin, Mail, Phone } from "lucide-react";

export default function AddressForm() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <h3 className="text-base font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#D92D20]" />
        International Shipping Destination (CN23 Customs Receiver)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
          <input type="text" defaultValue="John Doe" className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
          <input type="email" defaultValue="john.doe@example.com" className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Street Address</label>
          <input type="text" defaultValue="742 Evergreen Terrace" className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
          <input type="text" defaultValue="Springfield" className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Postal / Zip Code</label>
          <input type="text" defaultValue="97477" className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none font-mono" />
        </div>
      </div>
    </div>
  );
}