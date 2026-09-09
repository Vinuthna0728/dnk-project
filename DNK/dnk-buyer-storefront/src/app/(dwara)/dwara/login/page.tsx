"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, ArrowRight } from "lucide-react";

export default function DwaraLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError("Please enter your username and password");
            return;
        }

        // Redirect to Dwara export home
        router.push("/dwara/home");
    };

    return (
        <div className="relative min-h-screen w-screen overflow-hidden flex flex-col justify-between font-sans select-none">
            {/* 1. Fullscreen Background Image */}
            <div className="fixed inset-0 -z-10 w-full h-full">
                <Image
                    src="/dnk-buyer-background.png"
                    alt="DNK Dwara Background"
                    fill
                    priority
                    className="object-cover w-full h-full"
                />
            </div>

            {/* 2. Top Header Bar */}
            <header className="w-full bg-[#173870] text-white px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-md z-20">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D92D20] text-white flex items-center justify-center font-black text-xl rounded shadow">
                        DNK
                    </div>
                    <div className="leading-tight">
                        <span className="text-lg font-bold tracking-tight text-white block">
                            DNK Dwara
                        </span>
                        <span className="text-[11px] font-medium text-slate-300 block">
                            Buy From India
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-1.5 bg-[#0F2850] px-3 py-1.5 rounded-full border border-blue-400/30 text-xs font-semibold text-blue-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>CBIC Certified Exporter Portal</span>
                </div>
            </header>

            {/* 3. Centered Login Card */}
            <main className="flex-1 w-full flex items-center justify-center px-4 z-10 my-auto">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-[#1E3A8A]">Login</h2>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            Sign in to access DNK Direct Artisan Marketplace
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setError("");
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-[11px] text-red-600 font-bold text-center">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172D6B] text-white text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
                        >
                            <span>Login</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    <div className="text-center mt-6 space-y-1.5 text-xs">
                        <p className="text-slate-600">
                            Don't have an account?{" "}
                            <Link
                                href="/dwara/signup"
                                className="text-[#1E3A8A] font-bold hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                        <div>
                            <button
                                type="button"
                                onClick={() => alert("Password reset link sent to registered email.")}
                                className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}