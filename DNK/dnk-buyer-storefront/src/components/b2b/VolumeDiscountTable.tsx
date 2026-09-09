"use client";

interface VolumeDiscountTableProps {
  basePrice: number;
  moq: number;
  currentQuantity: number;
}

export function VolumeDiscountTable({
  basePrice,
  moq,
  currentQuantity,
}: VolumeDiscountTableProps) {
  const slabs = [
    { label: `${moq} - 49 units`, min: moq, max: 49, discount: 0 },
    { label: "50 - 199 units", min: 50, max: 199, discount: 0.08 },
    { label: "200+ units", min: 200, max: Infinity, discount: 0.15 },
  ];

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
      <div className="bg-neutral-100 px-4 py-2.5 font-bold text-neutral-800 border-b border-neutral-200">
        Tiered Bulk Volume Pricing
      </div>
      <table className="w-full text-left">
        <thead className="bg-neutral-50 text-neutral-500">
          <tr>
            <th className="px-4 py-2">Quantity Tier</th>
            <th className="px-4 py-2">Discount</th>
            <th className="px-4 py-2">Unit Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {slabs.map((slab, idx) => {
            const isActive = currentQuantity >= slab.min && currentQuantity <= slab.max;
            const price = Math.round(basePrice * (1 - slab.discount));
            return (
              <tr
                key={idx}
                className={isActive ? "bg-blue-50 font-bold text-blue-900" : "text-neutral-700"}
              >
                <td className="px-4 py-2.5">{slab.label}</td>
                <td className="px-4 py-2.5">{slab.discount === 0 ? "Base Rate" : `${slab.discount * 100}% OFF`}</td>
                <td className="px-4 py-2.5">₹{price.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default VolumeDiscountTable;