// src/app/profile/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/dwara/layout/Header";
import Footer from "@/components/dwara/layout/Footer";
import { User, Mail, MapPin, Phone, ShieldCheck, LogOut, Save, CheckCircle } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "John Doe",
        email: "john.buyer@globalexports.com",
        phone: "+1 (555) 019-2834",
        country: "United States",
        address: "742 Evergreen Terrace, Springfield, OR 97477",
        passportIec: "IEC-GLOBAL-99120",
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleLogout = () => {
        router.push("/dwara/home");
    };

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 mb-6">
                        <div>
                            <h1 className="text-2xl font-black text-[#1E3A8A] flex items-center gap-2">
                                <User className="w-6 h-6 text-[#2563EB]" />
                                Buyer Profile & Personal Details
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Manage your cross-border escrow profile and CN23 shipping addresses.
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="bg-red-50 hover:bg-red-100 text-[#D92D20] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-red-200 transition"
                        >
                            <LogOut className="w-4 h-4" /> Logout Account
                        </button>
                    </div>

                    {saved && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Personal details and shipping preferences updated successfully!</span>
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Default CN23 Delivery Address</label>
                            <textarea
                                rows={3}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                className="bg-[#1E3A8A] hover:bg-[#2563EB] text-white font-bold px-6 py-3 rounded-lg text-xs flex items-center gap-2 transition shadow"
                            >
                                <Save className="w-4 h-4" /> Save Profile Details
                            </button>
                        </div>
                    </form>

                </div>
            </div>

            <Footer />
        </main>
    );
}