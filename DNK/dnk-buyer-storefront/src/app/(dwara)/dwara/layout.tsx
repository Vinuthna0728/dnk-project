import React from "react";
import { CartProvider } from "@/context/dwara/CartContext";
import { CurrencyProvider } from "@/context/dwara/CurrencyContext";

export default function DwaraLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </CartProvider>
  );
}
