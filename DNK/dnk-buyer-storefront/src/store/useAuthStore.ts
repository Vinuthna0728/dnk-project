import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BuyerProfile {
  name: string;
  contact: string; // phone or email
  channel: "d2c" | "b2b" | "dwara";
  address?: string;
  pincode?: string;
  // B2B & Corporate specific fields
  companyName?: string;
  gstin?: string;
  pan?: string;
  businessType?: "Retailer" | "Wholesaler" | "Corporate" | "Exporter" | "Other";
}

interface AuthState {
  isAuthenticated: boolean;
  buyer: BuyerProfile | null;
  pendingContact: string | null;
  pendingGstin: string | null;
  targetChannel: "d2c" | "b2b" | "dwara";

  // Actions
  setPendingContact: (
    contact: string,
    channel: "d2c" | "b2b" | "dwara",
    gstin?: string
  ) => void;
  loginSuccess: (profile: BuyerProfile) => void;
  setB2BUser: (payload: {
    identifier: string;
    gstin?: string;
    companyName?: string;
    role?: string;
    isAuthenticated?: boolean;
  }) => void;
  updateBuyerProfile: (updates: Partial<BuyerProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      buyer: null,
      pendingContact: null,
      pendingGstin: null,
      targetChannel: "d2c",

      setPendingContact: (contact, channel, gstin) =>
        set({
          pendingContact: contact,
          targetChannel: channel,
          pendingGstin: gstin || null,
        }),

      loginSuccess: (profile) =>
        set({
          isAuthenticated: true,
          buyer: profile,
          pendingContact: null,
          pendingGstin: null,
        }),

      setB2BUser: ({ identifier, gstin, companyName }) =>
        set((state) => ({
          isAuthenticated: true,
          targetChannel: "b2b",
          pendingContact: null,
          pendingGstin: null,
          buyer: {
            name: companyName || state.buyer?.name || "Corporate Buyer",
            contact: identifier,
            channel: "b2b",
            gstin: gstin || state.buyer?.gstin || "",
            companyName: companyName || state.buyer?.companyName || "Registered Enterprise",
            address: state.buyer?.address || "",
            pincode: state.buyer?.pincode || "",
          },
        })),

      updateBuyerProfile: (updates) =>
        set((state) => ({
          buyer: state.buyer ? { ...state.buyer, ...updates } : null,
        })),

      logout: () =>
        set({
          isAuthenticated: false,
          buyer: null,
          pendingContact: null,
          pendingGstin: null,
          targetChannel: "d2c",
        }),
    }),
    {
      name: "shilp-setu-auth",
    }
  )
);