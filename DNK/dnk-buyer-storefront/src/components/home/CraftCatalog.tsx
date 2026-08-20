// src/components/home/CraftCatalog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, MapPin, ShoppingBag, Zap, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MOCK_PRODUCTS, Product } from "@/lib/mockData";
import { fetchStorefrontProducts, StorefrontProduct, resolveProductImage } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function CraftCatalog() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<(StorefrontProduct | Product)[]>(MOCK_PRODUCTS);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const liveProducts = await fetchStorefrontProducts();
        if (isMounted && liveProducts && liveProducts.length > 0) {
          // Defensive composite deduplication: seller_id + normalized title + normalized HS code
          const uniqueMap = new Map<string, StorefrontProduct | Product>();
          for (const p of liveProducts) {
            const sellerKey = (p as any).sellerId || '1';
            const normTitle = (p.title || '').trim().replace(/\s+/g, ' ').toLowerCase();
            const normHs = (p.hsCode || '').trim();
            const compositeKey = `${sellerKey}_${normTitle}_${normHs}`;
            if (!uniqueMap.has(compositeKey)) {
              uniqueMap.set(compositeKey, p);
            }
          }
          setProducts(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        console.warn("Failed to load products from API, using fallback:", err);
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (product: Product | StorefrontProduct) => {
    addToCart(product as Product);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleBuyNow = (productId: string) => {
    router.push(`/checkout?productId=${productId}`);
  };

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold text-[#D92D20] uppercase tracking-wider block mb-1">
          Verified Postal Export Listings
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1E3A8A]">
          Featured Direct Artisan Collection
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition group flex flex-col justify-between"
          >
            <div>
              <div
                className="relative h-64 w-full bg-slate-100 overflow-hidden cursor-pointer"
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = resolveProductImage(null, product.title);
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#1E3A8A]/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded backdrop-blur flex items-center gap-1 shadow">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> HS: {product.hsCode}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D92D20]" />
                  <span>{product.location}</span>
                </div>
                <h3
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="font-bold text-slate-900 text-lg leading-snug mb-2 group-hover:text-[#1E3A8A] transition cursor-pointer"
                >
                  {product.title}
                </h3>
                <p className="text-xs text-slate-500">
                  By <span className="font-semibold text-slate-700">{product.artisanName}</span> • {product.dnkFacilityCode}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 mt-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Landed Price</span>
                  <span className="text-xl font-black text-[#1E3A8A]">
                    {formatCurrency(product.priceUsd, 'USD')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono ml-1.5">(₹{product.priceInr})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${addedItems[product.id]
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                    }`}
                >
                  {addedItems[product.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 text-[#1E3A8A]" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleBuyNow(product.id)}
                  className="bg-[#1E3A8A] hover:bg-[#2563EB] text-white px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" /> Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}