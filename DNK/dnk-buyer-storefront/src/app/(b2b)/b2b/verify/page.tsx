"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Building2, KeyRound } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

function B2BVerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const identifier = searchParams.get("id") || "";
    const type = searchParams.get("type") || "contact";
    const gstin = searchParams.get("gstin") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { setB2BUser } = useAuthStore() as any; // Using auth store

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const token = otp.join("");
        if (token.length < 6) {
            setError("Enter the 6-digit verification code sent to your credentials.");
            return;
        }

        // Persist authenticated state
        if (setB2BUser) {
            setB2BUser({
                identifier,
                gstin,
                role: "B2B_BUYER",
                isAuthenticated: true,
            });
        }

        // Navigate to the B2B catalog feed
        router.push("/b2b/shop");
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF7F2]">
            {/* Left Panel - Corporate Branding */}
            <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-screen bg-slate-900 flex flex-col justify-between p-8 lg:p-14 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/b2b-procurement-office.jpg"
                        alt="Procurement professional"
                        fill
                        className="object-cover opacity-40 mix-blend-luminosity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
                </div>

                <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-amber-900/60 text-amber-200 border border-amber-700/50">
                        <Building2 className="w-3.5 h-3.5" /> Corporate Security Desk
                    </span>
                    <h2 className="mt-4 text-3xl font-serif text-slate-100">
                        Verifying Organization Credentials
                    </h2>
                    <p className="text-slate-300 text-sm mt-2">
                        A temporary 6-digit one-time passcode was dispatched to{" "}
                        <span className="text-amber-400 font-mono font-medium">{identifier}</span>
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Encrypted Session • Ministry Handicraft Gateway</span>
                </div>
            </div>

            {/* Right Panel - OTP Code Inputs */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl shadow-slate-200/60 border border-slate-200 p-8">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-800">
                            <KeyRound className="w-6 h-6 text-[#713F12]" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Enter Security Code</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Enter any 6 digits to authenticate in test sandbox mode.
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="flex justify-center gap-2 sm:gap-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#713F12] focus:border-transparent transition-all"
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="text-xs font-medium text-center text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3.5 px-4 bg-[#713F12] hover:bg-[#58310E] text-white rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg"
                        >
                            Verify & Enter Wholesale Portal
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <button
                            onClick={() => router.back()}
                            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            ← Re-enter Email or Mobile Number
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function B2BVerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-slate-600">Loading auth...</div>}>
            <B2BVerifyContent />
        </Suspense>
    );
}