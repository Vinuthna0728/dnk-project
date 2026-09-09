// src/app/product/[id]/page.tsx
import React from "react";
import Link from "next/link";
import Header from "@/components/dwara/layout/Header";
import Footer from "@/components/dwara/layout/Footer";
import ImageGallery from "@/components/dwara/product/ImageGallery";
import EscrowExplainer from "@/components/dwara/product/EscrowExplainer";
import CustomShippingCalculator from "@/components/dwara/product/CustomShippingCalculator";
import { MOCK_PRODUCTS } from "@/lib/dwara/mockData";
import { formatCurrency } from "@/lib/dwara/utils";
import { MapPin, ShieldCheck, ShoppingBag, ArrowLeft, Star } from "lucide-react";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = MOCK_PRODUCTS.find((p) => p.id === params.id) || MOCK_PRODUCTS[0];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/dwara/home" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1E3A8A] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Direct Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7">
            <ImageGallery images={[product.image]} title={product.title} hsCode={product.hsCode} />
            <EscrowExplainer />
          </div>

          {/* Right Column: Checkout Details */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm h-fit">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
              <MapPin className="w-4 h-4 text-[#D92D20]" />
              <span>{product.location}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#1E3A8A]">{product.dnkFacilityCode}</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 leading-snug mb-3">
              {product.title}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewsCount} verified export reviews)</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="border-t border-b border-slate-100 py-4 my-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Export Item Price</span>
                <span className="text-3xl font-black text-[#1E3A8A]">
                  {formatCurrency(product.priceUsd, 'USD')}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-2">(₹{product.priceInr})</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> In Stock
              </span>
            </div>

            <CustomShippingCalculator weightKg={product.weightKg} />

            <Link
              href={`/dwara/checkout?productId=${product.id}`}
              className="mt-6 w-full bg-[#1E3A8A] hover:bg-[#2563EB] text-white font-bold py-3.5 rounded-lg transition shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingBag className="w-4 h-4" /> Proceed to Escrow Checkout
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}