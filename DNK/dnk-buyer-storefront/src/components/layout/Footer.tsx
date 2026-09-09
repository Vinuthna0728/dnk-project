import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold mb-3">DNK Buyer Storefront</h3>
          <p className="text-sm leading-relaxed">
            Dak Ghar Niryat Kendra multi-channel buyer platform empowering Indian artisans, B2B wholesalers, and international export buyers through Department of Posts.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Storefront Channels</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-white transition-colors">D2C Inland Consumer Store</Link></li>
            <li><Link href="/b2b" className="hover:text-white transition-colors">B2B Bulk Wholesale Hub</Link></li>
            <li><Link href="/dwara" className="hover:text-white transition-colors">Dwara Global Export Portal</Link></li>
            <li><Link href="/tracking/POST-88291039IN" className="hover:text-white transition-colors">Postal Tracking Portal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Logistics & Compliance</h4>
          <ul className="space-y-2 text-sm">
            <li>India Post Export Logistics</li>
            <li>Customs Pre-Clearance</li>
            <li>HSN Code Validation</li>
            <li>GSTIN Verification</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support & Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>Artisan Fair Trade Guidelines</li>
            <li>Export Duty Policy</li>
            <li>Postal COD & UPI Payments</li>
            <li>Contact DNK Helpdesk</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 text-xs text-center">
        © {new Date().getFullYear()} DNK Multi-Storefront Marketplace. Powered by Department of Posts & Ministry of Communications.
      </div>
    </footer>
  );
};

export default Footer;
