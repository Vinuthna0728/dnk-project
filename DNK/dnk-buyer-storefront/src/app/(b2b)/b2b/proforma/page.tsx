"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FileCheck,
    Building2,
    Truck,
    ShieldCheck,
    Download,
    CreditCard,
    QrCode,
    CheckCircle2,
    ArrowRight,
    Printer,
    ChevronLeft,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function B2BDirectProformaPage() {
    const router = useRouter();
    const { items, clearCart } = useCartStore();
    const { buyer } = useAuthStore();

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPaymentTab, setSelectedPaymentTab] = useState<"upi" | "card">("upi");
    const [isProcessing, setIsProcessing] = useState(false);

    // Card fields
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState(buyer?.name || "CraftVeda Enterprises Pvt Ltd");
    const [cardExpiry, setCardExpiry] = useState("08/29");
    const [cardCvv, setCardCvv] = useState("");

    const subtotal = items.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
    );
    const freight = subtotal > 0 ? Math.max(1200, Math.round(subtotal * 0.025)) : 0;
    const tax = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + freight + tax;

    const proformaNumber = `PRO-${Math.floor(100000 + Math.random() * 900000)}`;
    const poRefNumber = "PO-2026-Q3-0881";
    const currentDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const trackingNumber = `CP${Math.floor(100000000 + Math.random() * 900000000)}IN`;

    const handleSettleAndSaveOrder = (method: "UPI" | "Card") => {
        setIsProcessing(true);

        setTimeout(() => {
            const newOrder = {
                id: `B2B-${proformaNumber}`,
                poNumber: poRefNumber,
                date: currentDate,
                companyName: buyer?.companyName || "CraftVeda Enterprises Pvt Ltd",
                gstin: buyer?.gstin || "27AAACB2211D1Z4",
                items: items.map((i) => ({
                    title: i.product.title_en,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    cluster: i.product.artisan?.cluster_name || "Artisan Guild",
                    hsnCode: i.product.hs_code || "6912.00.10",
                })),
                subtotal,
                freight,
                tax,
                grandTotal,
                status: "Settled / Escrow Locked" as const,
                trackingCode: trackingNumber,
                paymentMethod: method,
                paidAt: new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };

            try {
                const existing = JSON.parse(localStorage.getItem("b2b_orders") || "[]");
                localStorage.setItem("b2b_orders", JSON.stringify([newOrder, ...existing]));
            } catch (err) {
                console.error(err);
            }

            clearCart();
            setIsProcessing(false);
            setPaymentModalOpen(false);
            router.push("/b2b/orders");
        }, 1200);
    };

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto py-24 text-center">
                <h2 className="text-xl font-serif font-bold text-slate-900">
                    No Items in Bulk Cart to Generate Proforma
                </h2>
                <Link
                    href="/b2b/shop"
                    className="inline-block mt-4 px-6 py-2.5 bg-[#713F12] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                    Return to Wholesale Catalog
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Isolated Print Styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-proforma-document,
          #printable-proforma-document * {
            visibility: visible !important;
          }
          #printable-proforma-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .proforma-actions-bar {
            display: none !important;
          }
        }
      `}</style>

            <div className="max-w-5xl mx-auto space-y-6 pb-24">
                {/* Navigation & Controls Bar */}
                <div className="proforma-actions-bar flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-4">
                    <Link
                        href="/b2b/cart"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Cart
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                            <Download className="w-4 h-4 text-[#713F12]" />
                            <span>Download PDF / Print</span>
                        </button>

                        <button
                            onClick={() => setPaymentModalOpen(true)}
                            className="px-5 py-2.5 rounded-xl bg-[#713F12] hover:bg-[#522D0C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span>Settle Proforma & Escrow</span>
                        </button>
                    </div>
                </div>

                {/* OFFICIAL A4 PROFORMA INVOICE SHEET */}
                <div
                    id="printable-proforma-document"
                    className="bg-white rounded-2xl border border-slate-300 shadow-xl p-8 sm:p-12 space-y-6 font-sans text-xs text-slate-800"
                >
                    {/* Header */}
                    <div className="text-center border-b-2 border-slate-900 pb-4">
                        <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-widest text-[#713F12] uppercase">
                            PROFORMA TAX INVOICE
                        </h1>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                            Statutory Procurement Document • Rule 46 of Central Goods and Services Tax Rules, 2017
                        </p>
                    </div>

                    {/* Parties Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-200 pb-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                                Seller / Consignor
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm">Shilp Setu Artisan Linkage Federation</h3>
                            <p className="text-slate-600">Nodal Dak Ghar Central Freight Terminal, GPO</p>
                            <p className="text-slate-600">New Delhi - 110001, India</p>
                            <p className="font-mono text-slate-700 mt-1"><strong>GSTIN:</strong> 07AAACS1429K1Z2</p>
                            <p className="font-mono text-slate-700"><strong>State Code:</strong> 07 (Delhi) • <strong>Reverse Charge:</strong> No</p>
                        </div>

                        <div className="space-y-1 md:border-l md:border-slate-200 md:pl-8">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                                Buyer / Consignee
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm">
                                {buyer?.companyName || "CraftVeda Enterprises Pvt Ltd"}
                            </h3>
                            <p className="text-slate-600">Authorized Commercial Unloading Facility</p>
                            <p className="font-mono text-slate-700 mt-1">
                                <strong>GSTIN:</strong> {buyer?.gstin || "27AAACB2211D1Z4"}
                            </p>
                            <p className="font-mono text-slate-700">
                                <strong>Date:</strong> {currentDate} • <strong>Proforma No:</strong> {proformaNumber}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-[#5F6F52]/15 text-[#2C3E1F] border-b border-[#5F6F52]/30 font-mono text-[10px] uppercase">
                                <tr>
                                    <th className="p-3">#</th>
                                    <th className="p-3">Handicraft Description</th>
                                    <th className="p-3">HSN Code</th>
                                    <th className="p-3 text-center">Quantity</th>
                                    <th className="p-3 text-right">Unit Rate (₹)</th>
                                    <th className="p-3 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                                        <td className="p-3">
                                            <strong className="text-slate-900 block">{item.product.title_en}</strong>
                                            <span className="text-[10px] text-slate-500">
                                                Origin: {item.product.artisan?.cluster_name || "Cluster Guild"}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono text-slate-600">
                                            {item.product.hs_code || "6912.00.10"}
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                                        <td className="p-3 text-right font-mono">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                                        <td className="p-3 text-right font-mono font-bold">
                                            ₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Calculations & Escrow Footer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-2">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-600">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Dak Ghar Escrow Endorsement</span>
                            </div>
                            <p>
                                Funds remain locked in the official Escrow nodal account until container barcode intake is registered at the delivery hub.
                            </p>
                            <p className="font-mono text-[10px] pt-1 text-slate-500">
                                Assigned Logistics Article ID: <strong>{trackingNumber}</strong>
                            </p>
                        </div>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between text-slate-600">
                                <span>Total Taxable Value:</span>
                                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>India Post Freight & Container Crating:</span>
                                <span className="font-bold text-slate-900">₹{freight.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-emerald-800">
                                <span>Statutory GST @ 5.0%:</span>
                                <span className="font-bold">₹{tax.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-[#713F12] border-t-2 border-slate-900 pt-2 font-sans">
                                <span>Total Invoiced Proforma:</span>
                                <span className="font-mono font-black">₹{grandTotal.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SETTLEMENT MODAL (UPI & Corporate Card) */}
            {paymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-md p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div>
                                <h3 className="font-serif font-bold text-slate-900 text-base">
                                    Settle Proforma Invoice
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Total Invoiced: <strong className="text-[#713F12]">₹{grandTotal.toLocaleString("en-IN")}</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setPaymentModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Payment Tabs */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setSelectedPaymentTab("upi")}
                                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${selectedPaymentTab === "upi"
                                        ? "bg-white text-[#713F12] shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                    }`}
                            >
                                <QrCode className="w-4 h-4" /> Instant UPI QR
                            </button>
                            <button
                                onClick={() => setSelectedPaymentTab("card")}
                                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${selectedPaymentTab === "card"
                                        ? "bg-white text-[#713F12] shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                    }`}
                            >
                                <CreditCard className="w-4 h-4" /> Corporate Card
                            </button>
                        </div>

                        {/* Tab 1: UPI QR */}
                        {selectedPaymentTab === "upi" ? (
                            <div className="text-center space-y-4 py-2">
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
                                    <div className="w-44 h-44 bg-white border border-slate-300 rounded-xl p-2 mx-auto flex flex-col items-center justify-center">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=shilpsetuescrow@sbi&pn=ShilpSetuFederation&am=${grandTotal}&cu=INR`}
                                            alt="UPI Payment QR Code"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-800">Scan via any Corporate UPI App</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                        UPI ID: shilpsetuescrow@sbi
                                    </p>
                                </div>

                                <button
                                    disabled={isProcessing}
                                    onClick={() => handleSettleAndSaveOrder("UPI")}
                                    className="w-full py-3 bg-[#713F12] hover:bg-[#522D0C] disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                                >
                                    {isProcessing ? "Verifying Transaction..." : "I Have Completed UPI Payment"}
                                </button>
                            </div>
                        ) : (
                            /* Tab 2: Card */
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                        Corporate Card Number
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={19}
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="4123 •••• •••• 9812"
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                        Cardholder Entity Name
                                    </label>
                                    <input
                                        type="text"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                            Expiry (MM/YY)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={5}
                                            value={cardExpiry}
                                            onChange={(e) => setCardExpiry(e.target.value)}
                                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                            CVV
                                        </label>
                                        <input
                                            type="password"
                                            maxLength={4}
                                            value={cardCvv}
                                            onChange={(e) => setCardCvv(e.target.value)}
                                            placeholder="•••"
                                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#713F12]"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={isProcessing}
                                    onClick={() => handleSettleAndSaveOrder("Card")}
                                    className="w-full py-3 bg-[#713F12] hover:bg-[#522D0C] disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all mt-2 cursor-pointer"
                                >
                                    {isProcessing
                                        ? "Authorizing Bank Escrow..."
                                        : `Authorize Payment of ₹${grandTotal.toLocaleString("en-IN")}`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}