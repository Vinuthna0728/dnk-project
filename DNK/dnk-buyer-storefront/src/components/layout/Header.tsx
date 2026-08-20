// src/components/layout/Header.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  ShoppingBag,
  User,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import CurrencySelector from "./CurrencySelector";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const router = useRouter();
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    totalQuantity,
    totalAmountInr,
  } = useCart();

  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "INR">("INR");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsCode.includes(searchQuery)
  );

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Top Utility Bar */}
      <div className="bg-[#1E3A8A] text-slate-200 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-medium tracking-wide">
            Official India Post DNK Export Gateway • Verified Artisans
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
          <span className="hidden md:inline-block text-slate-500">|</span>
          <Link href="/profile" className="flex items-center gap-1 hover:text-white font-semibold">
            <User className="w-3.5 h-3.5" /> Profile / Logout
          </Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#D92D20] text-white flex items-center justify-center font-black text-2xl rounded shadow-md">
            DNK
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#1E3A8A] block leading-none">
              DNK Dwara
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1 block">
              Buy from India
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 font-bold text-xs uppercase tracking-wider text-slate-700">
          <Link href="/home" className="hover:text-[#2563EB] transition">Home</Link>
          <Link href="/verified-artisans" className="hover:text-[#2563EB] transition">Verified Artisans</Link>
          <Link href="/ondc-network" className="hover:text-[#2563EB] transition">ONDC Network</Link>
          <Link href="/customs-pbe3" className="hover:text-[#2563EB] transition">Customs PBE-III</Link>
        </nav>

        {/* Search & Cart Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-600 hover:text-[#1E3A8A] rounded-full hover:bg-slate-100 transition"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2.5 rounded font-semibold text-sm hover:bg-[#2563EB] transition shadow"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            <span className="bg-[#D92D20] text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
              {totalQuantity}
            </span>
          </button>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search handicrafts, HS Codes (e.g. 8306.29.00), or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-slate-800"
              />
              <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-4 divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push(`/product/${product.id}`);
                    }}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-3 rounded-lg cursor-pointer transition"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{product.title}</h4>
                      <p className="text-[11px] text-slate-500">{product.location} • HS: {product.hsCode}</p>
                    </div>
                    <span className="text-xs font-black text-[#1E3A8A]">₹{product.priceInr}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No matching artisan crafts found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 border-l border-slate-200">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
                <h2 className="text-lg font-black text-[#1E3A8A] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#D92D20]" /> Your Export Cart ({totalQuantity})
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {cartItems.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 items-center justify-between"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                        <span className="text-[11px] text-slate-500 block">HS: {item.hsCode}</span>
                        <span className="text-xs font-black text-[#1E3A8A] mt-1 block">
                          ₹{item.priceInr * item.quantity}
                        </span>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-400 text-xs transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-400 text-xs transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex justify-between text-sm font-bold text-slate-800 mb-4">
                <span>Total Amount</span>
                <span className="text-xl font-black text-[#1E3A8A]">₹{totalAmountInr}</span>
              </div>
              <button
                disabled={cartItems.length === 0}
                onClick={() => {
                  setIsCartOpen(false);
                  router.push(`/checkout?productId=${cartItems[0]?.id || ''}`);
                }}
                className="w-full bg-[#1E3A8A] hover:bg-[#2563EB] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                Proceed to Checkout ({totalQuantity}) <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}