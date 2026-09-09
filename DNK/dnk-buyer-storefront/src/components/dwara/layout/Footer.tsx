// src/components/layout/Footer.tsx
import React from "react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#1E3A8A] text-slate-300 text-xs py-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="font-bold text-white">Dak Ghar Niryat Kendra (DNK) Cross-Border Portal</p>
          <p className="mt-1 text-slate-300">Joint Initiative of Department of Posts & CBIC India</p>
        </div>
        <div className="flex gap-6 text-slate-200">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Customs & PBE Rules</a>
          <a href="#" className="hover:underline">Escrow Guarantee</a>
        </div>
      </div>
    </footer>
  );
}