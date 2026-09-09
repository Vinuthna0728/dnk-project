"use client";

import React from "react";
import {
    X,
    ShieldCheck,
    Lock,
    Truck,
    CheckCircle2,
    FileCheck,
    BadgeIndianRupee,
} from "lucide-react";

interface EscrowModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EscrowModal({ isOpen, onClose }: EscrowModalProps) {
    if (!isOpen) return null;

    const steps = [
        {
            step: "01",
            title: "Buyer Places Order & Funds Escrow",
            desc: "Payment is securely held in an RBI-compliant multi-currency escrow account backed by India Post. The artisan is notified to prepare the consignment.",
            icon: Lock,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            step: "02",
            title: "Cluster Craft Inspection & Postal Dispatch",
            desc: "The verified artisan delivers the item to the Dak Ghar export center. Staff inspect the product against GI-tag authentications and pack it with tamper-evident sealing.",
            icon: Truck,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            step: "03",
            title: "CBIC Postal Bill of Export (PBE-III) Cleared",
            desc: "India Post generates the automated electronic CN23 customs declaration and 8-digit HS Code classification, obtaining instantaneous Let Export Order (LEO).",
            icon: FileCheck,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
        },
        {
            step: "04",
            title: "Overseas Delivery & Automated Release",
            desc: "Upon confirmed delivery tracking via Universal Postal Union (UPU) networks, escrow funds are automatically disbursed to the artisan's Dak Ghar savings account.",
            icon: BadgeIndianRupee,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#1E3A8A] text-white p-6 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                            <ShieldCheck className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">How Cross-Border Escrow Protects You</h3>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Department of Posts & CBIC Compliant Zero-Fraud Mechanism
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Steps Grid */}
                <div className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                    {steps.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
                            >
                                <div className={`p-3 rounded-xl ${item.bg} ${item.color} shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            STEP {item.step}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}

                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>
                            100% Refund Guarantee: If export inspection fails or transit tracking stalls, full reimbursement is issued back to your source currency account without hassle.
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152B52] text-white text-xs font-bold transition shadow"
                    >
                        Understood
                    </button>
                </div>
            </div>
        </div>
    );
}