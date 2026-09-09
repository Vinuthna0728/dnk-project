"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Building2, FileSpreadsheet, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function B2BLoginPage() {
    const router = useRouter();
    const { setB2BUser } = useAuthStore() as any;

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("procurement@craftveda.com");
    const [password, setPassword] = useState("password123");
    const [companyName, setCompanyName] = useState("CraftVeda Enterprises Pvt Ltd");
    const [gstin, setGstin] = useState("27AAACB2211D1Z4");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all required credentials.");
            return;
        }

        if (isSignUp && (!companyName.trim() || !gstin.trim())) {
            setError("Please provide your Corporate Entity Name and GSTIN.");
            return;
        }

        if (setB2BUser) {
            setB2BUser({
                identifier: email,
                gstin: gstin.toUpperCase(),
                companyName: companyName,
            });
        }

        router.push("/b2b/shop");
    };

    return (
        <div className="h-screen w-screen flex flex-row bg-[#FAF6F0] select-none font-poppins overflow-hidden">
            {/* 1. LEFT EXACT HALF (50% WIDTH) */}
            <div className="relative w-1/2 h-full flex-shrink-0 overflow-hidden">
                <Image
                    src="/b2b-login-bg.png"
                    alt="Shilp Setu - Crafting Opportunities Beyond Borders"
                    fill
                    priority
                    className="object-cover object-left"
                />

                {/* Soft edge fade confined within the left half */}
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent via-[#FAF6F0]/50 to-[#FAF6F0] pointer-events-none" />
            </div>

            {/* 2. RIGHT EXACT HALF (50% WIDTH) - STAGNANT CENTERED CARD */}
            <div className="w-1/2 h-full flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
                {/* Subtle decorative background watermark */}
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[14px] border-[#EADBC8]/30 pointer-events-none" />

                <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-md rounded-[28px] border border-[#EADBCE] shadow-2xl p-8 sm:p-10 flex flex-col justify-between my-auto z-10">
                    {/* Logo & Subtitle */}
                    <div className="text-center space-y-1">
                        <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center text-[#8C4A28]">
                            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 stroke-[#8C4A28]">
                                <path
                                    d="M24 10C24 10 16 18 16 28C16 32.4183 19.5817 36 24 36C28.4183 36 32 32.4183 32 28C32 18 24 10 24 10Z"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M24 18C20 22 10 26 8 32C12 36 18 36 22 34"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M24 18C28 22 38 26 40 32C36 36 30 36 26 34"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M24 6V12"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A180E] tracking-tight">
                            Shilp Setu
                        </h2>
                        <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#8C5D38]">
                            BRIDGE OF CRAFTS
                        </p>

                        <div className="pt-3 pb-1">
                            <h3 className="text-lg font-serif font-bold text-[#2A180E]">
                                {isSignUp ? "Create B2B Account" : "Welcome Back"}
                            </h3>
                            <p className="text-xs text-slate-500 font-normal">
                                {isSignUp ? "Register your enterprise entity" : "Sign in to continue your journey"}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3.5 mt-5">
                        {isSignUp && (
                            <>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Registered Legal Entity Name"
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8C4A28] focus:ring-1 focus:ring-[#8C4A28]"
                                    />
                                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        maxLength={15}
                                        value={gstin}
                                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                                        placeholder="15-Digit GSTIN Number"
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8C4A28] focus:ring-1 focus:ring-[#8C4A28]"
                                    />
                                    <FileSpreadsheet className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                </div>
                            </>
                        )}

                        {/* Email Input */}
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                placeholder="Enter your email"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8C4A28] focus:ring-1 focus:ring-[#8C4A28] transition-all"
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8C4A28] focus:ring-1 focus:ring-[#8C4A28] transition-all"
                            />
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer z-10 p-0.5"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {!isSignUp && (
                            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#8C4A28] focus:ring-[#8C4A28] accent-[#8C4A28]"
                                    />
                                    <span>Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => alert("Password reset link dispatched to your email.")}
                                    className="text-slate-500 hover:text-[#8C4A28] transition-colors cursor-pointer"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {error && (
                            <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 text-center">
                                {error}
                            </p>
                        )}

                        {/* Action Button */}
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-[#8C4A28] hover:bg-[#733B1E] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md shadow-[#8C4A28]/20 flex items-center justify-center gap-2 cursor-pointer mt-3"
                        >
                            <span>{isSignUp ? "Register Account" : "Login"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    {/* Toggle View */}
                    <p className="text-center text-[11px] text-slate-500 mt-6">
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp((prev) => !prev);
                                setError("");
                            }}
                            className="text-[#8C4A28] font-bold hover:underline cursor-pointer ml-1"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}