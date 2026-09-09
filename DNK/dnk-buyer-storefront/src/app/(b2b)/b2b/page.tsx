'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productStoreService } from '@/services/productStoreService';
import { PublicProductItem } from '@/types/marketplace';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Building2, Tag, ShieldCheck, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function B2BPage() {
  const [products, setProducts] = useState<PublicProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    productStoreService.getProductsByChannel('B2B_INLAND').then((data) => {
      setProducts(data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-500/30 rounded-xl">
            <Building2 className="w-6 h-6 text-blue-300" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            B2B Inland Wholesale Portal
          </span>
        </div>
        <h1 className="text-3xl font-extrabold">Inland Bulk Artisan Sourcing</h1>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">
          Direct bulk purchase from artisan clusters with Minimum Order Quantity (MOQ) pricing tiers, tax-deductible GST invoices, and India Post bulk cargo dispatch.
        </p>
      </div>

      {/* Product List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="purple">B2B Bulk Item</Badge>
                  <span className="text-xs font-mono text-slate-400">HSN: {product.hs_code || product.hsnCode || 'N/A'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{product.title_en || product.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{product.description_en || product.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block">Base Wholesale Unit Price</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      ₹{(product.pricing?.wholesale_price_inr || product.pricing?.retail_price_inr || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">MOQ Requirement</span>
                    <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {product.pricing?.b2b_moq || product.moq || 5} units
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Link
                  href={`/b2b/product/${product.id}`}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                  View Tier Pricing & Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
