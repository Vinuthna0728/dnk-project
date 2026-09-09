"use client";

import { Plus, Minus } from "lucide-react";

interface MOQCounterProps {
  moq: number;
  value: number;
  onChange: (val: number) => void;
}

export function MOQCounter({ moq, value, onChange }: MOQCounterProps) {
  const increment = () => onChange(value + 1);
  const decrement = () => {
    if (value > moq) {
      onChange(value - 1);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= moq}
          className="p-2.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          min={moq}
          value={value}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= moq) {
              onChange(val);
            }
          }}
          className="w-16 text-center border-none focus:ring-0 text-sm font-semibold text-neutral-900"
        />
        <button
          type="button"
          onClick={increment}
          className="p-2.5 text-neutral-600 hover:bg-neutral-100"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <span className="text-xs font-medium text-neutral-500">Min. order: {moq} units</span>
    </div>
  );
}

export default MOQCounter;