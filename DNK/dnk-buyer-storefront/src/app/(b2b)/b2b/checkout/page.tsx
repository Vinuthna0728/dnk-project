"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  FileCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function B2BCheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { buyer, updateBuyerProfile } = useAuthStore();

  const [companyName, setCompanyName] = useState(
    buyer?.companyName || "CraftVeda Enterprises Pvt Ltd"
  );
  // Valid Maharashtra GSTIN
  const [gstin, setGstin] = useState(buyer?.gstin || "27AAACB2211D1Z4");
  const [poNumber, setPoNumber] = useState("PO-2026-Q3-0881");
  const [contactPerson, setContactPerson] = useState(
    buyer?.name || "Corporate Procurement Manager"
  );
  const [officerContact, setOfficerContact] = useState(
    buyer?.contact || "+91 9845012345"
  );
  const [streetAddress, setStreetAddress] = useState(
    buyer?.address || "Flat 402, Lotus Residency, Kothrud"
  );
  const [destinationState, setDestinationState] = useState("Karnataka");
  const [pincode, setPincode] = useState(buyer?.pincode || "411038");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gstError, setGstError] = useState("");
  const [contactError, setContactError] = useState("");

  const subtotal = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const freight = subtotal > 0 ? Math.max(1200, Math.round(subtotal * 0.025)) : 0;

  const isInterState = destinationState !== "Uttar Pradesh";
  const gstRate = 0.05;
  const totalTax = Math.round(subtotal * gstRate);
  const cgst = isInterState ? 0 : totalTax / 2;
  const sgst = isInterState ? 0 : totalTax / 2;
  const igst = isInterState ? totalTax : 0;
  const grandTotal = subtotal + freight + totalTax;

  // Comprehensive Indian GSTIN validation regex
  const validateGSTIN = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean.length !== 15) return false;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(clean);
  };

  const handleCreatePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Verify GSTIN
    if (!validateGSTIN(gstin)) {
      setGstError("Invalid 15-digit GSTIN format. Example: 27AAACB2211D1Z4");
      return;
    }
    setGstError("");

    // 2. Validate Contact (Email or Mobile)
    const cleanContact = officerContact.trim().replace(/\s+/g, "");
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);
    const isPhone = /^(\+91)?[6-9]\d{9}$/.test(cleanContact);

    if (!isEmail && !isPhone) {
      setContactError("Enter a valid Corporate Email or 10-digit Mobile Number.");
      return;
    }
    setContactError("");

    updateBuyerProfile({
      companyName,
      gstin: gstin.toUpperCase(),
      name: contactPerson,
      contact: cleanContact,
      address: streetAddress,
      pincode,
    });

    setIsSubmitting(true);

    const generatedPoId = `B2B-PO-${Math.floor(100000 + Math.random() * 900000)}`;

    // Store in localStorage so /b2b/orders renders immediately
    const newOrder = {
      id: generatedPoId,
      poNumber: poNumber || generatedPoId,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      companyName,
      gstin: gstin.toUpperCase(),
      items: items.map((i) => ({
        title: i.product.title_en,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        cluster: i.product.artisan?.cluster_name || "Artisan Guild",
      })),
      subtotal,
      freight,
      tax: totalTax,
      grandTotal,
      status: "Dispatched to Dak Ghar Hub",
      trackingCode: `CP${Math.floor(100000000 + Math.random() * 900000000)}IN`,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("b2b_orders") || "[]");
      localStorage.setItem("b2b_orders", JSON.stringify([newOrder, ...existing]));
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      clearCart();
      router.push("/b2b/orders");
    }, 1000);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="text-xl font-serif font-bold text-slate-900">
          No Bulk Order Items in Cart
        </h2>
        <Link
          href="/b2b/shop"
          className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-[#713F12] text-white text-xs font-bold uppercase tracking-wider"
        >
          ← Return to Bulk Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="border-b border-slate-200 pb-4">
        <Link
          href="/b2b/cart"
          className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Back to Cart
        </Link>
        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-2">
          Enterprise Purchase Order & Proforma Invoice Desk
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify corporate GSTIN tax credit parameters and authorized Dak Ghar freight unloading hub.
        </p>
      </div>

      <form onSubmit={handleCreatePurchaseOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Corporate Entity & Tax Registration */}
          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-[#713F12]" />
              1. Corporate Entity & Tax Registration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Registered Company Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  15-Digit GSTIN Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => {
                    setGstin(e.target.value.toUpperCase());
                    setGstError("");
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                />
                {gstError && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {gstError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Internal Corporate PO Number
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Procurement Officer Email or Mobile *
                </label>
                <input
                  type="text"
                  required
                  value={officerContact}
                  onChange={(e) => {
                    setOfficerContact(e.target.value);
                    setContactError("");
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                />
                {contactError && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {contactError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Warehouse Destination */}
          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-[#713F12]" />
              2. Consignment Delivery Warehouse
            </h2>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Warehouse Dock / Facility Address *
              </label>
              <textarea
                rows={2}
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Destination State (Determines IGST/CGST) *
                </label>
                <select
                  value={destinationState}
                  onChange={(e) => setDestinationState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Uttar Pradesh">Uttar Pradesh (Cluster Origin Hub)</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Postal Delivery Pincode *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tax Summary & Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#713F12]" />
                Tax Invoice Preview
              </h2>
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                Proforma Draft
              </span>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between items-start text-xs border-b border-slate-100 pb-2"
                >
                  <div className="pr-2">
                    <p className="font-bold text-slate-800 line-clamp-1">
                      {item.product.title_en}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.quantity} units × ₹{item.unitPrice}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 flex-shrink-0">
                    ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Bulk Goods Value:</span>
                <span className="font-bold text-slate-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight Transit (India Post):</span>
                <span className="font-bold text-slate-900">
                  ₹{freight.toLocaleString("en-IN")}
                </span>
              </div>

              {isInterState ? (
                <div className="flex justify-between text-emerald-800 pt-1 border-t border-slate-200">
                  <span>IGST @ 5.0% (Inter-state ITC):</span>
                  <span className="font-bold">₹{igst.toLocaleString("en-IN")}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-emerald-800 pt-1 border-t border-slate-200">
                    <span>CGST @ 2.5%:</span>
                    <span className="font-bold">₹{cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>SGST @ 2.5%:</span>
                    <span className="font-bold">₹{sgst.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-300 flex justify-between items-baseline text-slate-900">
                <span className="font-sans font-bold text-sm">Proforma Value:</span>
                <span className="text-xl font-bold text-[#713F12]">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#713F12] hover:bg-[#522D0C] disabled:bg-slate-400 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <span>Generating Proforma PO...</span>
              ) : (
                <>
                  <span>Issue Purchase Order & Dispatch Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>30-Day Credit Escrow / Direct Remittance Option</span>
              </div>
              <p>
                Artisan clusters begin batch production immediately upon Dak Ghar commercial verification.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}