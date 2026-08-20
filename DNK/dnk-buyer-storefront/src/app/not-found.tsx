// src/app/not-found.tsx
import React from "react";
import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-postal-bg flex flex-col items-center justify-center px-4 text-center">
      <PackageX className="w-12 h-12 text-usps-navy mb-4" />
      <h1 className="text-2xl font-black text-usps-navy mb-2">Listing Not Found</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        This artisan listing or product isn&apos;t in the DNK export catalog. It
        may have been delisted or the link may be incorrect.
      </p>
      <Link
        href="/"
        className="bg-usps-navy hover:bg-usps-slate text-white px-5 py-2.5 rounded font-bold text-sm transition"
      >
        Return to Catalog
      </Link>
    </div>
  );
}
