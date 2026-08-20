// src/app/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { loginBuyer, registerBuyer, setAuthToken } from "@/lib/api";

export default function EntryAuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      setError("Please enter your email or username.");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Register new buyer account
        await registerBuyer({
          name: fullName.trim() || cleanIdentifier.split("@")[0] || "Verified Buyer",
          email: cleanIdentifier.includes("@") ? cleanIdentifier : `${cleanIdentifier}@dakghar.local`,
          password: password,
        });

        // Automatically login after signup
        const loginRes = await loginBuyer(
          cleanIdentifier.includes("@") ? cleanIdentifier : `${cleanIdentifier}@dakghar.local`,
          password
        );
        if (loginRes.access_token) {
          setAuthToken(loginRes.access_token);
        }
      } else {
        // Login existing buyer account
        const loginRes = await loginBuyer(cleanIdentifier, password);
        if (loginRes.access_token) {
          setAuthToken(loginRes.access_token);
        }
      }

      router.push("/home");
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please verify your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
      {/* Background Image Container */}
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
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vinuthna"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="buyer@dakghar.local or vinuthna@example.com"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError("");
                  }}
                  className={`w-full pl-9 pr-4 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                    error ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-[#2563EB]"
                  }`}
                />
              </div>
            </div>

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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1E3A8A] hover:bg-[#2563EB] disabled:bg-slate-400 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  {isSignUp ? "Sign Up" : "LOGIN"} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper Credentials */}
          {!isSignUp && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">Demo Test Credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setIdentifier("buyer@dakghar.local");
                  setPassword("DakGhar@123");
                  setError("");
                }}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded font-mono transition"
              >
                buyer@dakghar.local / DakGhar@123
              </button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-col items-center gap-2 text-xs">
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
          </div>
        </div>
      </main>

      <footer className="relative z-10 bg-slate-900 text-slate-400 text-xs py-3 text-center border-t border-white/10">
        Department of Posts & CBIC • Dak Ghar Niryat Kendra Portal
      </footer>
    </div>
  );
}
