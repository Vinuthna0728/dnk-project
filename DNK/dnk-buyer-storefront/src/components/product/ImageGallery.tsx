// src/components/product/ImageGallery.tsx
"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { resolveProductImage } from "@/lib/api";

interface ImageGalleryProps {
  images: string[];
  title: string;
  hsCode: string;
}

export default function ImageGallery({ images, title, hsCode }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=800&q=80");

  return (
    <div className="space-y-4">
      <div className="relative h-96 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <img
          src={resolveProductImage(selectedImage, title)}
          alt={title}
          onError={(e) => {
            const target = e.currentTarget;
            const fallback = resolveProductImage(null, title);
            if (target.src !== fallback) {
              target.src = fallback;
            }
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 bg-[#1E3A8A]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-md backdrop-blur flex items-center gap-1.5 shadow">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> CBIC Verified HS: {hsCode}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === img ? "border-[#2563EB]" : "border-slate-200 hover:border-slate-300"
                }`}
            >
              <img src={img} alt={`${title} ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}