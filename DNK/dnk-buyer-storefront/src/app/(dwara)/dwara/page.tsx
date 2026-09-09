// src/app/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function EntryAuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Validation function: must contain at least one letter and at least one digit
  const validateUsername = (value: string) => {
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    return hasLetter && hasNumber;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUsername(username)) {
      setError("Username must be an alphanumeric combination containing both letters and numbers (e.g., buyer123, artisan01).");
      return;
    }

    setError("");
    // Redirects to Marketplace Home upon valid login/signup
    router.push("/dwara/home");
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    if (error && validateUsername(val)) {
      setError("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">

      {/* Background Image Container - Preserved exactly from public/dnk-buyer-storefront.png */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/dnk-buyer-background.png"
          alt="Dak Ghar Niryat Kendra Background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Top Banner Header */}
      <header className="relative z-10 bg-[#1E3A8A] text-white py-3.5 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D92D20] text-white flex items-center justify-center font-black text-xl rounded shadow">
            DNK
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg leading-none block">
              DNK Dwara
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Buy From India
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded text-slate-200 border border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>CBIC Certified Exporter Portal</span>
        </div>
      </header>

      {/* Centered Auth Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="bg-white/95 w-full max-w-md p-8 rounded-2xl shadow-2xl border border-slate-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-[#1E3A8A] tracking-tight">
              {isSignUp ? "Create DNK Account" : "Login"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUp
                ? "Sign up for global buyer access to Indian artisans"
                : "Sign in to access DNK Direct Artisan Marketplace"}
            </p>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. buyer2026 or artisan01"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full pl-9 pr-4 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 bg-white ${error ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#2563EB]"
                    }`}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Must contain both letters and digits.
              </span>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="buyer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1E3A8A] hover:bg-[#2563EB] text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              {isSignUp ? "Sign Up" : "LOGIN"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-col items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-[#2563EB] font-semibold hover:underline"
            >
              {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign up"}
            </button>

            {!isSignUp && (
              <a href="#" className="text-slate-400 hover:text-slate-600">
                Forgot password?
              </a>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 bg-slate-900 text-slate-400 text-xs py-3 text-center border-t border-white/10">
        Department of Posts & CBIC • Dak Ghar Niryat Kendra Portal
      </footer>
    </div>
  );
}