"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, MapPin, ArrowRight } from "lucide-react";
import { PublicProductItem } from "@/services/productStoreService";
import { useCartStore } from "@/store/useCartStore";

interface ProductCardD2CProps {
  product: PublicProductItem;
}

export const ProductCardD2C: React.FC<ProductCardD2CProps> = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const price = product.pricing.retail_price_inr ?? 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-[#F4EDE2]/95 backdrop-blur-md rounded-3xl border border-[#DEBFA3] hover:border-[#183D2E] overflow-hidden shadow-md shadow-[#4A2E18]/5 flex flex-col justify-between"
    >
      <div>
        {/* Verified Badge */}
        <div className="relative aspect-square w-full bg-[#EAE0D0] overflow-hidden">
          <Image
            src={product.enhanced_image_url || product.raw_image_url}
            alt={product.title_en}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 bg-[#FAF6F0]/95 backdrop-blur text-[#183D2E] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#DEBFA3] flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#183D2E]" />
            AI Studio Enhanced
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8C6D53] mb-1">
            <MapPin className="w-3 h-3" />
            <span>{product.artisan.cluster_name}, {product.artisan.state}</span>
          </div>

          <Link href={`/product/${product.id}`}>
            <h3 className="text-base font-bold text-[#2E1D11] hover:text-[#183D2E] transition-colors line-clamp-1">
              {product.title_en}
            </h3>
            <p className="text-xs text-[#8C6D53] line-clamp-1">{product.title_hi}</p>
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-[#DEBFA3]/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-[#8C6D53] block">Artisan Fair Price</span>
            <span className="text-base font-bold text-[#2E1D11]">₹{price.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addToCart("d2c", product, 1)}
              className="p-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#EAE0D0] border border-[#DEBFA3] text-[#183D2E] transition-all"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <Link
              href={`/product/${product.id}`}
              className="py-2.5 px-3.5 rounded-xl bg-[#183D2E] hover:bg-[#112D22] text-[#FAF6F0] text-xs font-semibold shadow-sm flex items-center gap-1 transition-all"
            >
              <span>Buy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
