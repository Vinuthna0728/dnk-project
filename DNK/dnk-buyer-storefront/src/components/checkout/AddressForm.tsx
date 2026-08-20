// src/components/checkout/AddressForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { User, Globe, MapPin, Mail, Phone } from "lucide-react";
import { fetchCurrentUser, getAuthToken } from "@/lib/api";

export default function AddressForm() {
  const [form, setForm] = useState({
    fullName: "Vinuthna",
    email: "buyer@dakghar.local",
    streetAddress: "742 Evergreen Terrace",
    city: "Springfield",
    zipCode: "97477",
    country: "United States",
  });

  useEffect(() => {
    // 1. Try loading from saved preference
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dnk_buyer_shipping_pref");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setForm((prev) => ({
            ...prev,
            ...parsed,
          }));
        } catch (_) {}
      }
    }

    // 2. Fetch authenticated user profile
    async function loadUser() {
      if (getAuthToken()) {
        try {
          const user = await fetchCurrentUser();
          if (user) {
            setForm((prev) => {
              const updated = {
                ...prev,
                fullName: prev.fullName || user.name || "Verified Buyer",
                email: user.email || prev.email,
              };
              if (typeof window !== "undefined") {
                localStorage.setItem("dnk_buyer_shipping_pref", JSON.stringify(updated));
              }
              return updated;
            });
          }
        } catch (_) {}
      }
    }

    loadUser();
  }, []);

  const handleChange = (field: string, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("dnk_buyer_shipping_pref", JSON.stringify(updated));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <h3 className="text-base font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#D92D20]" />
        International Shipping Destination (CN23 Customs Receiver)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Full Name (Receiver)
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
            placeholder="Recipient Full Name"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Street Address
          </label>
          <input
            type="text"
            value={form.streetAddress}
            onChange={(e) => handleChange("streetAddress", e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Postal / Zip Code
          </label>
          <input
            type="text"
            value={form.zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Destination Country
          </label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => handleChange("country", e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
          />
        </div>
      </div>
    </div>
  );
}
