"use client";

import React, { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  Smartphone,
  Banknote,
  ShieldCheck,
  User,
  MapPin,
  Edit3,
  CheckCircle2,
  Package,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { UPIPaymentModal } from "@/components/d2c/UPIPaymentModal";

function D2CCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirectBuy = searchParams.get("type") === "direct";

  const { items, directBuyItem } = useCartStore();
  const { buyer, loginSuccess } = useAuthStore();

  // Keep a persistent local reference so state updates never empty this screen
  const [lockedItems, setLockedItems] = useState<any[]>([]);

  useEffect(() => {
    if (isDirectBuy && directBuyItem) {
      setLockedItems([directBuyItem]);
    } else if (items.length > 0) {
      setLockedItems(items);
    }
  }, [isDirectBuy, directBuyItem, items]);

  const checkoutList = lockedItems.length > 0 ? lockedItems : (isDirectBuy && directBuyItem ? [directBuyItem] : items);
  const total = checkoutList.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const [fullName, setFullName] = useState(buyer?.name || "Ananya Deshmukh");
  const [phone, setPhone] = useState(buyer?.contact || "+91 9845012345");
  const [address, setAddress] = useState(buyer?.address || "Flat 402, Lotus Residency, Kothrud");
  const [pincode, setPincode] = useState(buyer?.pincode || "411038");

  const [isEditingBuyer, setIsEditingBuyer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");
  const [isUPIOpen, setIsUPIOpen] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleSaveBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    loginSuccess({
      name: fullName,
      contact: phone,
      channel: buyer?.channel || "d2c",
      address,
      pincode,
    });
    setIsEditingBuyer(false);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `ORD-IN-${Date.now().toString().slice(-6)}`;
    setOrderId(generatedId);

    if (paymentMethod === "UPI") {
      setIsUPIOpen(true);
    } else {
      // DO NOT clear items here. Route immediately.
      router.replace(`/confirmation/${generatedId}?method=COD&source=${isDirectBuy ? "direct" : "cart"}`);
    }
  };

  const handleUPISuccess = () => {
    setIsUPIOpen(false);
    // DO NOT clear items here. Route immediately.
    router.replace(`/confirmation/${orderId}?method=UPI&source=${isDirectBuy ? "direct" : "cart"}`);
  };

  if (checkoutList.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between font-poppins select-none">
        <Navbar />
        <div className="max-w-md mx-auto my-auto p-8 text-center bg-[#F4EDE2] rounded-3xl border border-[#DEBFA3]">
          <Package className="w-12 h-12 text-[#8C6D53] mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#2E1D11]">No item selected for checkout</h2>
          <p className="text-xs text-[#6B4E3D] mt-1 mb-5">Please pick a handcrafted product from our catalog.</p>
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-xl bg-[#183D2E] text-white text-xs font-bold shadow-md"
          >
            Explore Crafts
          </Link>
        </div>
        <footer className="p-4 text-center text-xs text-[#8C6D53]">Shilp Setu D2C Checkout</footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between font-poppins select-none">
      <div>
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A3A22] hover:text-[#183D2E] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Crafts
          </Link>

          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#2E1D11] mb-6">
            D2C Dedicated Order & Payment Gateway
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {/* Buyer Details */}
              <div className="bg-[#F4EDE2] p-6 rounded-3xl border border-[#DEBFA3] shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#DEBFA3] mb-4">
                  <h2 className="text-sm font-black text-[#2E1D11] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#183D2E]" />
                    Buyer & Delivery Details
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingBuyer(!isEditingBuyer)}
                    className="text-xs font-bold text-[#183D2E] hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingBuyer ? "Close Edit" : "Edit Details"}</span>
                  </button>
                </div>

                {isEditingBuyer ? (
                  <form onSubmit={handleSaveBuyer} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-[#4A2E18] mb-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#FAF6F0] border border-[#DEBFA3] focus:border-[#183D2E] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#4A2E18] mb-1">Phone Number</label>
                        <input
                          required
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#FAF6F0] border border-[#DEBFA3] focus:border-[#183D2E] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#4A2E18] mb-1">Postal Pincode</label>
                        <input
                          required
                          type="text"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#FAF6F0] border border-[#DEBFA3] focus:border-[#183D2E] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-[#4A2E18] mb-1">Shipping Street Address</label>
                      <textarea
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#FAF6F0] border border-[#DEBFA3] focus:border-[#183D2E] outline-none resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2 px-4 rounded-xl bg-[#183D2E] text-white font-bold text-xs shadow-sm"
                    >
                      Save Buyer Details
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2 text-xs text-[#4A2E18]">
                    <div className="flex justify-between">
                      <span className="text-[#8C6D53]">Customer Name:</span>
                      <strong className="text-[#2E1D11]">{fullName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C6D53]">Contact Phone:</span>
                      <strong className="text-[#2E1D11]">{phone}</strong>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[#8C6D53] flex-shrink-0">Destination:</span>
                      <span className="text-right text-[#2E1D11] font-medium">
                        {address}, Pincode: <strong>{pincode}</strong>
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#DEBFA3]/50 flex items-center gap-1.5 text-[11px] text-[#183D2E] font-semibold">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Fulfilled via India Post Speed Post (Insured Delivery)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <form onSubmit={handlePlaceOrder} className="bg-[#F4EDE2] p-6 rounded-3xl border border-[#DEBFA3] shadow-sm">
                <h2 className="text-sm font-black text-[#2E1D11] mb-4">Select Direct Settlement Method</h2>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === "UPI"
                        ? "border-[#183D2E] bg-[#FAF6F0] text-[#183D2E] font-bold shadow-sm"
                        : "border-[#DEBFA3] bg-[#F4EDE2] text-[#6B4E3D]"
                      }`}
                  >
                    <Smartphone className="w-5 h-5 text-[#183D2E] mb-2" />
                    <span className="text-xs font-bold block">Instant UPI QR</span>
                    <span className="text-[10px] text-[#8C6D53]">Zero fee • 100% Dak Ghar Remittance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === "COD"
                        ? "border-[#183D2E] bg-[#FAF6F0] text-[#183D2E] font-bold shadow-sm"
                        : "border-[#DEBFA3] bg-[#F4EDE2] text-[#6B4E3D]"
                      }`}
                  >
                    <Banknote className="w-5 h-5 text-[#183D2E] mb-2" />
                    <span className="text-xs font-bold block">Cash on Delivery</span>
                    <span className="text-[10px] text-[#8C6D53]">Pay postman at doorstep</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 py-3.5 rounded-2xl bg-[#183D2E] hover:bg-[#112D22] text-white text-xs font-bold shadow-lg shadow-[#183D2E]/25 tracking-wide transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Complete Order (₹{total.toLocaleString("en-IN")})</span>
                </button>
              </form>
            </div>

            {/* Product Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#F4EDE2] p-6 rounded-3xl border border-[#DEBFA3] shadow-sm space-y-4">
                <h2 className="text-sm font-black text-[#2E1D11] pb-3 border-b border-[#DEBFA3] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#183D2E]" />
                  Product Details ({checkoutList.length})
                </h2>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {checkoutList.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-[#FAF6F0] p-3 rounded-2xl border border-[#DEBFA3] flex items-center gap-3"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#EAE0D0] flex-shrink-0 border border-[#DEBFA3]">
                        <Image
                          src={item.product.enhanced_image_url || item.product.raw_image_url}
                          alt={item.product.title_en}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-[#2E1D11] truncate">{item.product.title_en}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-[#8C6D53] mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{item.product.artisan.cluster_name}</span>
                        </div>
                        <p className="text-[11px] font-black text-[#183D2E] mt-1">
                          ₹{item.unitPrice.toLocaleString("en-IN")} × {item.quantity} = ₹
                          {(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#DEBFA3] space-y-2 text-xs text-[#6B4E3D]">
                  <div className="flex justify-between">
                    <span>Products Subtotal</span>
                    <span className="font-bold text-[#2E1D11]">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed Post Pan-India</span>
                    <span className="font-bold text-[#183D2E]">FREE (Govt Subsidized)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Commission</span>
                    <span className="font-bold text-[#183D2E]">₹0 (100% to Artisan)</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#DEBFA3] text-sm font-black text-[#2E1D11]">
                    <span>Total Cost</span>
                    <span className="text-base text-[#183D2E]">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 text-[10px] text-[#8C6D53]">
                  <ShieldCheck className="w-4 h-4 text-[#183D2E] flex-shrink-0" />
                  <span>ONDC & India Post Secure Settlement Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UPIPaymentModal
        isOpen={isUPIOpen}
        onClose={() => setIsUPIOpen(false)}
        orderId={orderId}
        amount={total}
        onPaymentSuccess={handleUPISuccess}
      />

      <footer className="p-4 text-center text-xs text-[#8C6D53]">
        Shilp Setu Secure Dedicated Payment Portal
      </footer>
    </div>
  );
}

export default function DedicatedCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading checkout...</div>}>
      <D2CCheckoutContent />
    </Suspense>
  );
}
