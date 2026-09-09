import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PublicProductItem } from "@/services/productStoreService";

export interface CartItem {
  product: PublicProductItem;
  quantity: number;
  unitPrice: number;
}

interface CartStore {
  channel: "d2c" | "b2b" | "dwara" | null;
  items: CartItem[];
  directBuyItem: CartItem | null;
  addToCart: (channel: "d2c" | "b2b" | "dwara", product: PublicProductItem, quantity?: number) => void;
  setDirectBuy: (channel: "d2c" | "b2b" | "dwara", product: PublicProductItem, quantity?: number) => void;
  clearDirectBuy: () => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      channel: null,
      items: [],
      directBuyItem: null,

      // Bag addition ONLY (Used by the shopping bag icon)
      addToCart: (targetChannel, product, quantity = 1) => {
        const { channel, items } = get();
        let currentItems = items;
        if (channel && channel !== targetChannel) {
          currentItems = [];
        }

        const unitPrice =
          targetChannel === "d2c"
            ? product.pricing.retail_price_inr || 0
            : targetChannel === "b2b"
              ? product.pricing.wholesale_price_inr || 0
              : product.pricing.export_price_usd || 0;

        const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += quantity;
          set({ channel: targetChannel, items: updated });
        } else {
          set({
            channel: targetChannel,
            items: [...currentItems, { product, quantity, unitPrice }],
          });
        }
      },

      // DIRECT BUY ONLY: Zero connection to the bag items
      setDirectBuy: (targetChannel, product, quantity = 1) => {
        const unitPrice =
          targetChannel === "d2c"
            ? product.pricing.retail_price_inr || 0
            : targetChannel === "b2b"
              ? product.pricing.wholesale_price_inr || 0
              : product.pricing.export_price_usd || 0;

        set({
          channel: targetChannel,
          directBuyItem: { product, quantity, unitPrice },
        });
      },

      clearDirectBuy: () => set({ directBuyItem: null }),

      removeFromCart: (productId) => {
        const updated = get().items.filter((item) => item.product.id !== productId);
        set({
          items: updated,
          channel: updated.length === 0 ? null : get().channel,
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ channel: null, items: [] }),

      getTotalAmount: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },
    }),
    {
      name: "dnk-isolated-cart-storage",
    }
  )
);