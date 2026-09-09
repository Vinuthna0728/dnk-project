"use client";

import React, { useState } from "react";
import { X, QrCode, Smartphone, CheckCircle2, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const artisanVPA = "dnk.artisan@gov.in";
  const upiPayload = `upi://pay?pa=${artisanVPA}&pn=ArtisanBeneficiary&am=${amount}&cu=INR&tn=${orderId}`;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // Directly and smoothly trigger success without artificial lagging delays
    onPaymentSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-poppins">
      <div className="relative w-full max-w-sm bg-[#FCF8F2] rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[#DEBFA3] text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F3E7D7] text-[#8C6D53] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#FCE4EC] text-[#D81B60] flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-serif font-black text-[#2E1D11]">
          Scan & Pay via UPI
        </h3>
        <p className="text-[11px] text-[#6B4E3D] mt-1 mb-4 leading-relaxed">
          Instant 100% direct remittance to the artisan's Dak Ghar linked account.
        </p>

        {/* QR Frame */}
        <div className="p-4 bg-white rounded-2xl border border-[#DEBFA3] shadow-inner inline-block mx-auto mb-3">
          <QRCodeSVG value={upiPayload} size={180} level="M" />
          <p className="text-[10px] font-mono text-[#8C6D53] mt-2 font-bold">
            VPA: {artisanVPA}
          </p>
        </div>

        <div className="mb-5">
          <span className="text-[10px] font-semibold text-[#8C6D53] uppercase tracking-wider block">
            Total Payable Amount
          </span>
          <span className="text-2xl font-black text-[#2E1D11]">
            ₹{amount.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="space-y-2.5">
          <a
            href={upiPayload}
            className="w-full py-3 px-4 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open UPI App (GPay / BHIM / PhonePe)</span>
          </a>

          {/* Instant Confirmation (Zero delay) */}
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isProcessing ? "Confirming..." : "Simulate Payment Confirmation"}</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-[#DEBFA3]/60 flex items-center justify-center gap-1.5 text-[10px] text-[#8C6D53]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#183D2E]" />
          <span>Secured via India Post Payment Protocol</span>
        </div>
      </div>
    </div>
  );
};