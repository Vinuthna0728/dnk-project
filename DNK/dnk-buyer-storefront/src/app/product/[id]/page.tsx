// src/app/product/[id]/page.tsx
import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ImageGallery from "@/components/product/ImageGallery";
import EscrowExplainer from "@/components/product/EscrowExplainer";
import CustomShippingCalculator from "@/components/product/CustomShippingCalculator";
import { MOCK_PRODUCTS, Product } from "@/lib/mockData";
import { fetchStorefrontProductById, StorefrontProduct } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { MapPin, ShieldCheck, ShoppingBag, ArrowLeft, Star } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function ProductDetailPage(props: PageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const productId = resolvedParams?.id || "3";

  // Default fallback product
  let product: StorefrontProduct | Product =
    MOCK_PRODUCTS.find((p) => String(p.id) === String(productId)) || MOCK_PRODUCTS[0];

  try {
    const liveProduct = await fetchStorefrontProductById(productId);
    if (liveProduct && liveProduct.title) {
      product = liveProduct;
    }
  } catch (err) {
    console.warn(`Failed to fetch live product ${productId} from backend, using fallback:`, err);
  }

  const mainImage =
    product.image && product.image.trim().length > 0
      ? product.image
      : "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=800&q=80";

  const priceUsd = Number(product.priceUsd) || Number((Number(product.priceInr || 1200) / 83.5).toFixed(2));
  const priceInr = Number(product.priceInr) || 1200;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1E3A8A] mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Direct Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7">
            <ImageGallery images={[mainImage]} title={product.title} hsCode={product.hsCode || "8306.29.00"} />
            <EscrowExplainer />
          </div>

          {/* Right Column: Checkout Details */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm h-fit">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
              <MapPin className="w-4 h-4 text-[#D92D20]" />
              <span>{product.location || "India Post Craft Cluster"}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#1E3A8A]">{product.dnkFacilityCode || "DNK-KA-BEL-01"}</span>
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
              <span className="text-xs font-bold text-slate-700">{product.rating || 4.9}</span>
              <span className="text-xs text-slate-400">
                ({product.reviewsCount || 24} verified export reviews)
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {product.description || "Authentic handcrafted product certified by Dak Ghar Niryat Kendra."}
            </p>

            <div className="border-t border-b border-slate-100 py-4 my-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Export Item Price</span>
                <span className="text-3xl font-black text-[#1E3A8A]">
                  {formatCurrency(priceUsd, "USD")}
                </span>
                <span className="text-xs text-slate-500 font-mono ml-2">
                  (₹{priceInr.toLocaleString()})
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> In Stock
              </span>
            </div>

            <CustomShippingCalculator weightKg={product.weightKg || 0.85} />

            <Link
              href={`/checkout?productId=${product.id}`}
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