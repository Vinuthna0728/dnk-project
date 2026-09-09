"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Truck,
    Clock,
    Boxes,
    CreditCard,
    QrCode,
    ShieldCheck,
    Eye,
    X,
    ReceiptText,
    Download,
} from "lucide-react";

interface B2BOrderItem {
    title: string;
    quantity: number;
    unitPrice: number;
    cluster: string;
    hsnCode?: string;
}

interface B2BOrder {
    id: string;
    poNumber: string;
    date: string;
    companyName: string;
    gstin: string;
    items: B2BOrderItem[];
    subtotal: number;
    freight: number;
    tax: number;
    grandTotal: number;
    status:
    | "Pending Settlement"
    | "Settled / Escrow Locked"
    | "Dispatched to Dak Ghar Hub"
    | "In Transit"
    | "Cancelled";
    trackingCode: string;
    paymentMethod?: "UPI" | "Card" | "Credit Line / Escrow";
    paidAt?: string;
}

export default function B2BOrdersPage() {
    const [orders, setOrders] = useState<B2BOrder[]>([]);
    const [viewProformaOrder, setViewProformaOrder] = useState<B2BOrder | null>(null);
    const [activeTrackingOrder, setActiveTrackingOrder] = useState<B2BOrder | null>(null);
    const [paymentModalOrder, setPaymentModalOrder] = useState<B2BOrder | null>(null);
    const [selectedPaymentTab, setSelectedPaymentTab] = useState<"upi" | "card">("upi");

    // Card Form State
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem("b2b_orders") || "[]");
            if (stored.length > 0) {
                setOrders(stored);
            } else {
                const initialOrder: B2BOrder = {
                    id: "B2B-PO-842910",
                    poNumber: "PO-2026-Q3-0881",
                    date: "05 Sep 2026",
                    companyName: "CraftVeda Enterprises Pvt Ltd",
                    gstin: "27AAACB2211D1Z4",
                    items: [
                        {
                            title: "Silver-Inlaid Bidriware Corporate Desk Decors",
                            quantity: 25,
                            unitPrice: 1650,
                            cluster: "Bidar Metalcraft Guild, Karnataka",
                            hsnCode: "8306.29.00",
                        },
                        {
                            title: "Hand-Thrown Terracotta Acoustic Pitchers",
                            quantity: 50,
                            unitPrice: 420,
                            cluster: "Gorakhpur Terracotta Cluster, Uttar Pradesh",
                            hsnCode: "6912.00.10",
                        },
                    ],
                    subtotal: 62250,
                    freight: 1556,
                    tax: 3113,
                    grandTotal: 66919,
                    status: "Dispatched to Dak Ghar Hub",
                    trackingCode: "CP183011708IN",
                };
                setOrders([initialOrder]);
                localStorage.setItem("b2b_orders", JSON.stringify([initialOrder]));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const saveOrders = (updated: B2BOrder[]) => {
        setOrders(updated);
        try {
            localStorage.setItem("b2b_orders", JSON.stringify(updated));
        } catch (e) {
            console.error(e);
        }
    };

    const handleCancelOrder = (orderId: string) => {
        if (confirm("Are you sure you want to cancel this Institutional Purchase Order?")) {
            const updated = orders.map((o) =>
                o.id === orderId ? { ...o, status: "Cancelled" as const } : o
            );
            saveOrders(updated);
        }
    };

    const handleCompletePayment = (method: "UPI" | "Card") => {
        if (!paymentModalOrder) return;
        setIsProcessingPayment(true);

        setTimeout(() => {
            const updated = orders.map((o) =>
                o.id === paymentModalOrder.id
                    ? {
                        ...o,
                        status: "Settled / Escrow Locked" as const,
                        paymentMethod: method,
                        paidAt: new Date().toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    }
                    : o
            );
            saveOrders(updated);
            setIsProcessingPayment(false);
            setPaymentModalOrder(null);
            alert(`Payment successful via ${method}. Amount held securely under Dak Ghar Escrow.`);
        }, 1000);
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    return (
        <>
            {/* Isolated Print Styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #proforma-modal-container,
          #proforma-modal-container * {
            visibility: visible !important;
          }
          #proforma-modal-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .modal-print-actions {
            display: none !important;
          }
        }
      `}</style>

            {/* DASHBOARD VIEW */}
            <div className="max-w-6xl mx-auto space-y-8 pb-28">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-5">
                    <div>
                        <span className="text-[11px] font-mono font-bold text-[#713F12] uppercase tracking-wider">
                            Ministry Handicraft Procurement Desk
                        </span>
                        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
                            Purchase Orders & Tax Invoices (POs)
                        </h1>
                    </div>

                    <Link
                        href="/b2b/shop"
                        className="px-4 py-2.5 bg-[#713F12] hover:bg-[#522D0C] text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 self-start sm:self-auto shadow-sm transition-all"
                    >
                        <Boxes className="w-4 h-4" />
                        <span>Browse Wholesale Catalog</span>
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-300 p-12 text-center">
                        <ReceiptText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-800">No Purchase Orders Issued Yet</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Explore bulk craft batches and generate your statutory proforma.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const isSettled = order.status === "Settled / Escrow Locked";
                            const isCancelled = order.status === "Cancelled";

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden hover:border-slate-400 transition-all"
                                >
                                    <div className="bg-[#FAF7F2] border-b border-[#EAE0D0] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-amber-300 font-mono text-xs font-bold">
                                                    {order.id}
                                                </span>
                                                <span className="font-mono text-slate-600 font-semibold">
                                                    Ref: {order.poNumber}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-slate-500 block">Issued on: {order.date}</span>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Status Indicator */}
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${isSettled
                                                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                                        : isCancelled
                                                            ? "bg-red-100 text-red-800 border border-red-300"
                                                            : "bg-amber-100 text-amber-900 border border-amber-300"
                                                    }`}
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                {order.status}
                                            </span>

                                            {/* Settle Payment Button: Appears for all older/unsettled orders */}
                                            {!isSettled && !isCancelled && (
                                                <button
                                                    onClick={() => setPaymentModalOrder(order)}
                                                    className="px-3.5 py-1.5 rounded-lg bg-[#713F12] hover:bg-[#522D0C] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span>Settle Payment</span>
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setViewProformaOrder(order)}
                                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-[#713F12]" />
                                                <span>View Proforma</span>
                                            </button>

                                            <button
                                                onClick={() => setActiveTrackingOrder(order)}
                                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <Truck className="w-3.5 h-3.5 text-[#713F12]" />
                                                <span>Track Freight</span>
                                            </button>

                                            {!isCancelled && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    Cancel PO
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-6 divide-y divide-slate-100">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                                                <div>
                                                    <span className="font-bold text-slate-900">{item.title}</span>
                                                    <p className="text-[11px] text-slate-500">{item.cluster}</p>
                                                </div>
                                                <div className="font-mono text-right">
                                                    <span className="text-slate-500">{item.quantity} units × ₹{item.unitPrice} = </span>
                                                    <strong className="text-slate-900">₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}</strong>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-2 text-slate-600 font-mono">
                                                <Truck className="w-4 h-4 text-[#713F12]" />
                                                <span>India Post Tracking: <strong>{order.trackingCode}</strong></span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-slate-500 font-medium">Invoiced Proforma Total: </span>
                                                <strong className="text-base font-mono font-black text-[#713F12]">
                                                    ₹{order.grandTotal.toLocaleString("en-IN")}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* DEDICATED PROFORMA MODAL VIEWER */}
            {viewProformaOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
                    <div
                        id="proforma-modal-container"
                        className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
                    >
                        <div className="modal-print-actions p-4 px-6 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ReceiptText className="w-5 h-5 text-[#713F12]" />
                                <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                                    Official Proforma Tax Invoice Preview
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="px-3.5 py-1.5 bg-[#713F12] hover:bg-[#522D0C] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" /> Save / Download as PDF
                                </button>
                                <button
                                    onClick={() => setViewProformaOrder(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 sm:p-10 overflow-y-auto font-sans text-xs text-slate-800 space-y-6 bg-white">
                            <div className="text-center border-b-2 border-slate-800 pb-4">
                                <h2 className="text-2xl font-serif font-black tracking-widest text-[#713F12] uppercase">
                                    PROFORMA TAX INVOICE
                                </h2>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                                    Issued under Rule 46 of the Central Goods and Services Tax Rules, 2017
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-b border-slate-200 pb-6">
                                <div>
                                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                                        Seller / Consignor
                                    </span>
                                    <h4 className="font-bold text-slate-900 text-sm">Shilp Setu Artisan Linkage Federation</h4>
                                    <p className="text-slate-600">Nodal Dak Ghar Central Freight Terminal, GPO</p>
                                    <p className="text-slate-600">New Delhi - 110001, India</p>
                                    <p className="font-mono text-slate-700 mt-1"><strong>GSTIN:</strong> 07AAACS1429K1Z2</p>
                                    <p className="font-mono text-slate-700"><strong>State:</strong> Delhi (07) • <strong>Reverse Charge:</strong> No</p>
                                </div>
                                <div className="border-l border-slate-200 pl-8">
                                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                                        Buyer / Consignee
                                    </span>
                                    <h4 className="font-bold text-slate-900 text-sm">{viewProformaOrder.companyName}</h4>
                                    <p className="text-slate-600">Authorized Commercial Unloading Facility</p>
                                    <p className="font-mono text-slate-700 mt-1"><strong>GSTIN:</strong> {viewProformaOrder.gstin}</p>
                                    <p className="font-mono text-slate-700"><strong>PO Date:</strong> {viewProformaOrder.date} • <strong>PO Ref:</strong> {viewProformaOrder.poNumber}</p>
                                </div>
                            </div>

                            <div className="border border-slate-300 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-[#5F6F52]/15 text-[#2C3E1F] border-b border-[#5F6F52]/30 font-mono text-[10px] uppercase">
                                        <tr>
                                            <th className="p-3">#</th>
                                            <th className="p-3">Item Description</th>
                                            <th className="p-3">HSN Code</th>
                                            <th className="p-3 text-center">Qty</th>
                                            <th className="p-3 text-right">Rate (₹)</th>
                                            <th className="p-3 text-right">Taxable Value (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {viewProformaOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                                                <td className="p-3">
                                                    <strong className="text-slate-900 block">{item.title}</strong>
                                                    <span className="text-[10px] text-slate-500">{item.cluster}</span>
                                                </td>
                                                <td className="p-3 font-mono text-slate-600">{item.hsnCode || "6912.00.10"}</td>
                                                <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                                                <td className="p-3 text-right font-mono">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                                                <td className="p-3 text-right font-mono font-bold">₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid grid-cols-2 gap-8 items-start pt-2">
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-600">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        <span>Dak Ghar Escrow Endorsement</span>
                                    </div>
                                    <p>Amount held in escrow until India Post barcode verification at recipient dock.</p>
                                    <p className="font-mono text-[10px] pt-1 text-slate-500">
                                        Postal Consignment Code: <strong>{viewProformaOrder.trackingCode}</strong>
                                    </p>
                                </div>

                                <div className="space-y-1.5 text-xs font-mono">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Taxable Value:</span>
                                        <span className="font-bold text-slate-900">₹{viewProformaOrder.subtotal.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>India Post Commercial Heavy Freight:</span>
                                        <span className="font-bold text-slate-900">₹{viewProformaOrder.freight.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-800">
                                        <span>IGST / CGST+SGST @ 5.0%:</span>
                                        <span className="font-bold">₹{viewProformaOrder.tax.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-[#713F12] border-t-2 border-slate-900 pt-2 font-sans">
                                        <span>Proforma Total Value:</span>
                                        <span className="font-mono font-black">₹{viewProformaOrder.grandTotal.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TRACKING MODAL */}
            {activeTrackingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-lg p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-[#713F12]" />
                                <h3 className="font-serif font-bold text-slate-900 text-base">
                                    India Post Freight Tracking
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveTrackingOrder(null)}
                                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono flex justify-between">
                            <span>Article ID: <strong>{activeTrackingOrder.trackingCode}</strong></span>
                            <span className="text-emerald-700 font-bold">Speed Post Cargo</span>
                        </div>

                        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                            <div className="flex items-start gap-3 relative z-10">
                                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow">
                                    ✓
                                </div>
                                <div className="text-xs">
                                    <strong className="text-slate-900 block">Dak Ghar Bulk Consignment Booked</strong>
                                    <span className="text-slate-500">Gorakhpur Nodal Head Office • 05 Sep, 09:30 AM</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 relative z-10">
                                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow">
                                    ✓
                                </div>
                                <div className="text-xs">
                                    <strong className="text-slate-900 block">Commercial Crating & Seal Verified</strong>
                                    <span className="text-slate-500">Direct artisan federation release • 05 Sep, 02:15 PM</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 relative z-10">
                                <div className="w-7 h-7 rounded-full bg-[#713F12] text-white flex items-center justify-center flex-shrink-0 text-xs shadow animate-pulse">
                                    ●
                                </div>
                                <div className="text-xs">
                                    <strong className="text-slate-900 block">National Sorting Hub Transit (Delhi)</strong>
                                    <span className="text-amber-800 font-medium">In Transit under GPS Seal Tracking</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 relative z-10">
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0 text-xs">
                                    ○
                                </div>
                                <div className="text-xs">
                                    <strong className="text-slate-400 block">Unloading Dock Delivery Hub</strong>
                                    <span className="text-slate-400">Whitefield Freight Hub, Bengaluru (Expected 09 Sep)</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveTrackingOrder(null)}
                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                            Close Tracker
                        </button>
                    </div>
                </div>
            )}

            {/* SETTLEMENT MODAL (Applicable to any unsettled order) */}
            {paymentModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-md p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div>
                                <h3 className="font-serif font-bold text-slate-900 text-base">
                                    Settle Proforma PO
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Amount: <strong className="text-[#713F12]">₹{paymentModalOrder.grandTotal.toLocaleString("en-IN")}</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setPaymentModalOrder(null)}
                                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

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

                        {selectedPaymentTab === "upi" ? (
                            <div className="text-center space-y-4 py-2">
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
                                    <div className="w-44 h-44 bg-white border border-slate-300 rounded-xl p-2 mx-auto flex flex-col items-center justify-center">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=shilpsetuescrow@sbi&pn=ShilpSetuFederation&am=${paymentModalOrder.grandTotal}&cu=INR`}
                                            alt="UPI Payment QR Code"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-800">Scan via any Corporate UPI App</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        UPI ID: <span className="font-mono text-slate-600">shilpsetuescrow@sbi</span>
                                    </p>
                                </div>

                                <button
                                    disabled={isProcessingPayment}
                                    onClick={() => handleCompletePayment("UPI")}
                                    className="w-full py-3 bg-[#713F12] hover:bg-[#522D0C] disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                                >
                                    {isProcessingPayment ? "Verifying Transaction..." : "I Have Completed UPI Payment"}
                                </button>
                            </div>
                        ) : (
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
                                        Cardholder / Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        placeholder="CraftVeda Enterprises Pvt Ltd"
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
                                            placeholder="08/29"
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
                                    disabled={isProcessingPayment}
                                    onClick={() => handleCompletePayment("Card")}
                                    className="w-full py-3 bg-[#713F12] hover:bg-[#522D0C] disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all mt-2 cursor-pointer"
                                >
                                    {isProcessingPayment
                                        ? "Authorizing Bank Escrow..."
                                        : `Authorize Payment of ₹${paymentModalOrder.grandTotal.toLocaleString("en-IN")}`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}