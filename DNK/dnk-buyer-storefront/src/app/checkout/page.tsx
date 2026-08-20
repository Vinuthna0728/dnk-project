// src/app/checkout/page.tsx
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AddressForm from "@/components/checkout/AddressForm";
import EscrowPaymentForm from "@/components/checkout/EscrowPaymentForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { MOCK_PRODUCTS, Product } from "@/lib/mockData";
import { fetchStorefrontProductById, StorefrontProduct } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export default async function CheckoutPage({ searchParams }: { searchParams: { productId?: string } }) {
  let product: StorefrontProduct | Product = MOCK_PRODUCTS.find((p) => p.id === searchParams.productId) || MOCK_PRODUCTS[0];

  if (searchParams.productId) {
    try {
      const liveProduct = await fetchStorefrontProductById(searchParams.productId);
      if (liveProduct) {
        product = liveProduct;
      }
    } catch (err) {
      console.warn("Checkout product fetch fallback:", err);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-black text-[#1E3A8A] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Cross-Border Escrow Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-1">Official Postal Bill of Export (PBE-III) clearance powered by Department of Posts & CBIC.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <AddressForm />
            <EscrowPaymentForm />
          </div>
          <div className="lg:col-span-5">
            <OrderSummary product={product} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
