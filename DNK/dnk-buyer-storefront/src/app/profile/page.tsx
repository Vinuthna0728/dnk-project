// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  User,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  LogOut,
  Save,
  CheckCircle,
  Package,
  LogIn,
  UserPlus,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  fetchCurrentUser,
  updateUserProfile,
  loginBuyer,
  registerBuyer,
  clearAuthToken,
  getAuthToken,
  fetchMyOrders,
  OrderResponse,
  UserResponse,
} from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Login / Register Modal or Tabs
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("buyer@dakghar.local");
  const [loginPassword, setLoginPassword] = useState("DakGhar@123");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");

  // Profile Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "United States",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
  });

  const loadUserData = async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      setCurrentUser(null);
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const user = await fetchCurrentUser();
      setCurrentUser(user);

      // Load saved shipping preferences from localStorage if exists
      let savedAddress = "742 Evergreen Terrace, Springfield, OR 97477";
      let savedCountry = "United States";
      if (typeof window !== "undefined") {
        const storedPref = localStorage.getItem("dnk_buyer_shipping_pref");
        if (storedPref) {
          try {
            const parsed = JSON.parse(storedPref);
            if (parsed.address) savedAddress = parsed.address;
            if (parsed.country) savedCountry = parsed.country;
          } catch (_) {}
        }
      }

      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: savedCountry,
        address: savedAddress,
      });

      // Load Buyer Orders
      try {
        const myOrders = await fetchMyOrders();
        setOrders(myOrders);
      } catch (err) {
        console.warn("Failed to load orders:", err);
      }
    } catch (err) {
      console.warn("Auth token invalid or expired:", err);
      clearAuthToken();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    try {
      await loginBuyer(loginEmail.trim(), loginPassword);
      setAuthSuccess("Logged in successfully!");
      await loadUserData();
    } catch (err: any) {
      setAuthError(err.message || "Failed to login. Please check credentials.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    try {
      await registerBuyer({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim() || undefined,
      });
      await loginBuyer(regEmail.trim(), regPassword);
      setAuthSuccess("Account registered and logged in successfully!");
      await loadUserData();
    } catch (err: any) {
      setAuthError(err.message || "Failed to register account.");
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateUserProfile({
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
      });
      setCurrentUser(updated);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "dnk_buyer_shipping_pref",
          JSON.stringify({
            name: formData.fullName.trim(),
            address: formData.address.trim(),
            country: formData.country.trim(),
            phone: formData.phone.trim(),
          })
        );
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Failed to save profile: " + (err.message || "Unknown error"));
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setOrders([]);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500">Loading profile session...</p>
          </div>
        ) : !currentUser ? (
          /* Login / Register Card */
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-100 font-black text-lg">
                DNK
              </div>
              <h1 className="text-xl font-black text-[#1E3A8A]">
                {authMode === "login" ? "Buyer Account Sign In" : "Register Buyer Account"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Access cross-border escrow orders and CN23 delivery tracking.
              </p>
            </div>

            {authError && (
              <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
            )}

            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                  authMode === "login"
                    ? "border-[#1E3A8A] text-[#1E3A8A]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                  authMode === "register"
                    ? "border-[#1E3A8A] text-[#1E3A8A]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Create Account
              </button>
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                    placeholder="buyer@dakghar.local"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E3A8A] hover:bg-[#2563EB] text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow"
                >
                  <LogIn className="w-4 h-4" /> Sign In to Buyer Account
                </button>

                <div className="pt-2 text-center">
                  <span className="text-[11px] text-slate-400">Quick Test Credentials:</span>
                  <div className="flex gap-2 justify-center mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("buyer@dakghar.local");
                        setLoginPassword("DakGhar@123");
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-700 font-mono"
                    >
                      Buyer A (buyer@dakghar.local)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                    placeholder="Vinuthna"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                    placeholder="vinuthna@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                    placeholder="+1-555-0199"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E3A8A] hover:bg-[#2563EB] text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow"
                >
                  <UserPlus className="w-4 h-4" /> Create Buyer Account
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Logged In Profile Dashboard */
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-[#1E3A8A] flex items-center gap-2">
                    <User className="w-6 h-6 text-[#2563EB]" />
                    Buyer Profile & Personal Details
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Authenticated Account: <span className="font-bold text-slate-800">{currentUser.email}</span> (ID: #{currentUser.id}, Role: {currentUser.role})
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

              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address (Read-Only)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-xs text-slate-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Destination Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#2563EB] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Default CN23 Delivery Address
                  </label>
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

            {/* My Orders History Table */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
              <h2 className="text-lg font-black text-[#1E3A8A] flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-[#2563EB]" />
                My Verified Orders ({orders.length})
              </h2>

              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Product ID</th>
                        <th className="p-3">Amount (INR)</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Tracking</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-[#1E3A8A]">
                            ORD-DNK-{o.id}
                          </td>
                          <td className="p-3">Product #{o.product_id}</td>
                          <td className="p-3 font-bold">₹{o.amount_inr}</td>
                          <td className="p-3">
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            DNK{String(o.id).padStart(9, "0")}IN
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/tracking/DNK${String(o.id).padStart(9, "0")}IN`}
                              className="text-[#1E3A8A] hover:text-[#2563EB] font-bold inline-flex items-center gap-1"
                            >
                              Track <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">No orders placed under this account yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
