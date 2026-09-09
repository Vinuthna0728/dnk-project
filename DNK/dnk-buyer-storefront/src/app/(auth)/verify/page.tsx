"use client";

import React, { Suspense, useState  } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

function VerifyOtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channel = (searchParams.get("channel") as "d2c" | "b2b" | "dwara") || "d2c";

  // Pick up the phone number passed in the URL parameter, fallback to store
  const phoneFromUrl = searchParams.get("phone");
  const { pendingContact, loginSuccess } = useAuthStore();

  const activeContact = phoneFromUrl || pendingContact || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const handleChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < 6) {
      setError("Please fill in the entire 6-digit code.");
      return;
    }

    loginSuccess({
      name: "Ananya Deshmukh",
      contact: activeContact,
      channel: channel,
      address: "Flat 402, Lotus Residency, Kothrud",
      pincode: "411038",
    });

    router.push("/shop");
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex flex-col justify-between font-poppins select-none">
      {/* Blurred Backdrop */}
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

      <header className="p-6 max-w-6xl mx-auto w-full">
        <Link
          href={`/login?channel=${channel}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FAF6F0] hover:text-[#DEBFA3] transition-colors bg-[#183D2E]/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Mobile Number
        </Link>
      </header>

      <div className="w-full max-w-md mx-auto px-4 z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#F4EDE2]/95 backdrop-blur-xl rounded-3xl p-7 sm:p-9 shadow-2xl border-2 border-[#DEBFA3]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#183D2E] text-white flex items-center justify-center mx-auto mb-4 shadow-md ring-4 ring-[#FAF6F0]/80">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif font-black text-[#2E1D11]">
              Enter Security OTP
            </h1>
            <p className="text-xs text-[#6B4E3D] mt-1">
              One-time code sent to <strong className="text-[#183D2E] font-bold">{activeContact}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  className="w-11 h-12 text-center text-lg font-bold bg-[#FAF6F0] border-2 border-[#DEBFA3] focus:border-[#183D2E] focus:outline-none rounded-xl text-[#183D2E] shadow-inner"
                />
              ))}
            </div>

            {error && <p className="text-center text-xs text-rose-600 font-bold">{error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#183D2E] hover:bg-[#112D22] text-[#FAF6F0] text-xs font-bold tracking-wider shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Verify & Enter Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-[#8C6D53] mt-5">
            Didn't receive code?{" "}
            <button
              onClick={() => alert(`A new OTP has been resent to ${activeContact}`)}
              className="font-bold text-[#183D2E] underline"
            >
              Resend OTP
            </button>
          </p>
        </motion.div>
      </div>

      <footer className="p-4 text-center text-xs text-[#FAF6F0]/90">
        Shilp Setu • Digital Commerce Infrastructure
      </footer>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading...</div>}>
      <VerifyOtpPageContent />
    </Suspense>
  );
}
