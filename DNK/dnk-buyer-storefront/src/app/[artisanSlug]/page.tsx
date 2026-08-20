import React from 'react';

// -----------------------------------------------------------------------------
// 1. Imports & Helpers
// -----------------------------------------------------------------------------
// If you already have slugify imported from your project, uncomment your import:
// import { slugify } from '@/lib/utils';
// import { MOCK_PRODUCTS } from '@/data/mockProducts';

// Inline fallback slugify helper in case an external library isn't imported
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

// -----------------------------------------------------------------------------
// 2. Types & Interfaces
// -----------------------------------------------------------------------------
interface Product {
  id: string | number;
  name?: string;
  title?: string;
  artisan?: {
    name?: string;
    facilityCode?: string;
  };
}

interface PageProps {
  params: Promise<{
    artisanSlug: string;
  }>;
}

// Dummy array fallback if MOCK_PRODUCTS isn't imported in this scope
const MOCK_PRODUCTS: Product[] = [];

// -----------------------------------------------------------------------------
// 3. Page Component
// -----------------------------------------------------------------------------
export default async function ArtisanPage({ params }: PageProps) {
  // Await params (Next.js 15+ standard)
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.artisanSlug ?? '';
  const targetSlug = rawSlug.toLowerCase();

  // Safely filter products with complete type checks
  const filteredProducts = MOCK_PRODUCTS.filter((p: Product) => {
    const facilityCode = p.artisan?.facilityCode;
    const artisanName = p.artisan?.name;

    const matchesFacility = facilityCode
      ? slugify(String(facilityCode)) === targetSlug
      : false;

    const matchesName = artisanName
      ? slugify(String(artisanName)) === targetSlug
      : false;

    return matchesFacility || matchesName;
  });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Products for Artisan: {rawSlug}
      </h1>

      {filteredProducts.length === 0 ? (
        <p>No products found for this artisan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold">{product.title || product.name}</h2>
              <p className="text-sm text-gray-600">{product.artisan?.name}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}