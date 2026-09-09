"use client";

import React, { useState } from "react";
import { X, Save, UserCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { buyer, loginSuccess } = useAuthStore();
    const texts = useLanguageStore((state) => state.t)();

    const [name, setName] = useState(buyer?.name || "Ananya Deshmukh");
    const [contact, setContact] = useState(buyer?.contact || "+91 9845012345");
    const [address, setAddress] = useState(buyer?.address || "Flat 402, Lotus Residency, Kothrud");
    const [pincode, setPincode] = useState(buyer?.pincode || "411038");
    const [saved, setSaved] = useState(false);

    if (!isOpen) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        loginSuccess({
            name,
            contact,
            channel: buyer?.channel || "d2c",
            address,
            pincode,
        });
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 900);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-[#FAF6F0] rounded-3xl border-2 border-[#DEBFA3] p-6 max-w-md w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F0E4D3] text-[#5A3A22]"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-serif font-black text-[#2E1D11] mb-1">
                    {texts.profileDetails}
                </h2>
                <p className="text-xs text-[#6B4E3D] mb-4">
                    Update your default shipping address and recipient details.
                </p>

                <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                    <div>
                        <label className="block font-bold text-[#4A2E18] mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-white border border-[#DEBFA3] focus:border-[#245A44] outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div>
                            <label className="block font-bold text-[#4A2E18] mb-1">Contact Phone</label>
                            <input
                                type="text"
                                required
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-white border border-[#DEBFA3] focus:border-[#245A44] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-[#4A2E18] mb-1">Postal Pincode</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-white border border-[#DEBFA3] focus:border-[#245A44] outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-[#4A2E18] mb-1">Delivery Address</label>
                        <textarea
                            rows={2}
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-white border border-[#DEBFA3] focus:border-[#245A44] outline-none resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 py-3 rounded-xl bg-[#245A44] hover:bg-[#1C4736] text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                        {saved ? (
                            <>
                                <UserCheck className="w-4 h-4 text-emerald-300" />
                                <span>Saved Successfully!</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>{texts.saveChanges}</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};