'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { productStoreService } from '@/services/productStoreService';
import { PublicProductItem } from '@/types/marketplace';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useCartStore } from '@/store/useCartStore';
import { MOQCounter } from '@/components/b2b/MOQCounter';
import { VolumeDiscountTable } from '@/components/b2b/VolumeDiscountTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, ArrowLeft, Building2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function B2BProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<PublicProductItem | null>(null);
  const [quantity, setQuantity] = useState(10);
  const { formatPrice } = useCurrencyStore();
  const { addToCart, setDirectBuy } = useCartStore();

  useEffect(() => {
    if (id) {
      productStoreService.getProductById(id).then((p) => {
        setProduct(p);
        const minOrder = p?.pricing?.b2b_moq || 5;
        setQuantity(minOrder);
      }).catch(() => {});
    }
  }, [id]);

  if (!product) {
    return <div className="py-12 text-center text-slate-500">Loading wholesale item details...</div>;
  }

  const basePrice = product.pricing?.wholesale_price_inr || product.pricing?.retail_price_inr || 1000;
  const moq = product.pricing?.b2b_moq || 5;
  const imageUrl = product.enhanced_image_url || product.raw_image_url || product.imageUrl || '/vase.png';
  const title = product.title_en || product.name || 'Artisan Craft Item';
  const description = product.description_en || product.description || '';

  const handleAddB2BToCart = () => {
    addToCart('b2b', product, quantity);
    router.push('/b2b/cart');
  };

  const handleBuyNow = () => {
    setDirectBuy('b2b', product, quantity);
    router.push('/b2b/checkout');
  };

  return (
    <div className="space-y-8">
      <Link
        href="/b2b"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to B2B Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="purple" className="mb-2">B2B Bulk Direct</Badge>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
            <p className="text-xs text-slate-500 font-mono mt-1">HSN Code: {product.hs_code || product.hsnCode || '83062900'}</p>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>

          {/* Volume Discount Matrix Component */}
          <VolumeDiscountTable basePrice={basePrice} moq={moq} currentQuantity={quantity} />

          {/* MOQ Counter Component */}
          <MOQCounter moq={moq} value={quantity} onChange={setQuantity} />

          <div className="pt-4 border-t flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Bulk Order Cost</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{(basePrice * quantity).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" variant="secondary" onClick={handleAddB2BToCart} className="gap-2">
                <ShoppingBag className="w-5 h-5" /> Add to B2B Cart
              </Button>
              <Button size="lg" onClick={handleBuyNow} className="bg-blue-600 hover:bg-blue-700 text-white">
                Checkout Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
