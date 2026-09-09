"use client";

import React, { Suspense, useState  } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, ArrowRight, ShieldCheck, ArrowLeft, HeartHandshake } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channel = (searchParams.get("channel") as "d2c" | "b2b" | "dwara") || "d2c";

  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const setPendingContact = useAuthStore((state) => state.setPendingContact);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = contact.trim().replace(/\D/g, "");
    if (!cleanNumber || cleanNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    const fullContact = `+91 ${cleanNumber.slice(-10)}`;
    setPendingContact(fullContact, channel);

    // Pass the exact phone number directly in the URL query parameters
    router.push(`/verify?channel=${channel}&phone=${encodeURIComponent(fullContact)}`);
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex flex-col justify-between font-poppins select-none">
      {/* Blurred Backdrop of the Initial Entry UI */}
      <div className="fixed inset-0 -z-10 w-full h-full">
        <Image
          src="/shilp-setu.png"
          alt="Shilp Setu Backdrop"
          fill
          priority
          className="object-fill w-full h-full scale-105"
        />
        <div className="absolute inset-0 bg-[#2E1D11]/30 backdrop-blur-md" />
      </div>

      {/* Top Header */}
      <header className="p-6 max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#FAF6F0] hover:text-[#DEBFA3] transition-colors bg-[#183D2E]/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portals
        </Link>
        <span className="text-xs font-bold text-[#FAF6F0] tracking-wider uppercase bg-[#183D2E]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
          D2C Domestic Retail
        </span>
      </header>

      {/* Centered Login Card */}
      <div className="w-full max-w-md mx-auto px-4 z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="bg-[#F4EDE2]/95 backdrop-blur-xl rounded-3xl p-7 sm:p-9 shadow-2xl border-2 border-[#DEBFA3]"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#183D2E] text-[#FAF6F0] flex items-center justify-center mx-auto mb-4 shadow-md ring-4 ring-[#FAF6F0]/80">
            <HeartHandshake className="w-7 h-7 text-[#FAF6F0]" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#2E1D11]">
              Namaste! Welcome
            </h1>
            <p className="text-xs text-[#6B4E3D] mt-1.5 font-medium">
              Login with your mobile number to explore handicrafts and verified cluster arts.
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4A2E18] mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs font-bold text-[#8C6D53] border-r border-[#DEBFA3] pr-2">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter 10-digit number"
                  className="w-full pl-16 pr-4 py-3 bg-[#FAF6F0] border border-[#DEBFA3] focus:border-[#183D2E] focus:outline-none rounded-2xl text-xs font-semibold text-[#2E1D11] placeholder:text-[#9C8270] shadow-inner"
                />
              </div>
              {error && <p className="text-[11px] text-rose-600 mt-1 font-bold">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#183D2E] hover:bg-[#112D22] text-[#FAF6F0] text-xs font-bold tracking-wide transition-all shadow-lg shadow-[#183D2E]/25 flex items-center justify-center gap-2 group"
            >
              <span>Get 6-Digit OTP</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#DEBFA3]/60 flex items-center justify-center gap-2 text-[11px] text-[#6B4E3D]">
            <ShieldCheck className="w-4 h-4 text-[#183D2E]" />
            <span>Ministry of Social Justice & Empowerment Verified</span>
          </div>
        </motion.div>
      </div>

      <footer className="p-4 text-center text-xs text-[#FAF6F0]/90 drop-shadow-sm">
        Speed Post Pan-India Delivery • Direct Beneficiary Payouts
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
