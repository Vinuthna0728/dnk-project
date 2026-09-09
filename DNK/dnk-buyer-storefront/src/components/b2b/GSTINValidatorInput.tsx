"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export function GSTINValidatorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string, isValid: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  // Standard Indian GSTIN Regex
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uppercaseVal = e.target.value.toUpperCase();
    if (uppercaseVal.length === 0) {
      setError(null);
      onChange(uppercaseVal, false);
      return;
    }

    if (uppercaseVal.length === 15) {
      if (gstinRegex.test(uppercaseVal)) {
        setError(null);
        onChange(uppercaseVal, true);
      } else {
        setError("Invalid GSTIN format (e.g., 22AAAAA0000A1Z5)");
        onChange(uppercaseVal, false);
      }
    } else {
      setError("GSTIN must be 15 alphanumeric characters");
      onChange(uppercaseVal, false);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-neutral-700 block">Buyer GSTIN (Optional for Tax Invoice)</label>
      <div className="relative">
        <input
          type="text"
          maxLength={15}
          value={value}
          onChange={handleInputChange}
          placeholder="22AAAAA0000A1Z5"
          className="border border-neutral-300 rounded-lg p-2.5 text-sm w-full uppercase font-mono"
        />
        {value.length === 15 && !error && (
          <CheckCircle className="w-5 h-5 text-emerald-600 absolute right-3 top-2.5" />
        )}
        {error && (
          <AlertCircle className="w-5 h-5 text-rose-500 absolute right-3 top-2.5" />
        )}
      </div>
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

export default GSTINValidatorInput;