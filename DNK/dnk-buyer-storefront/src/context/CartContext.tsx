// src/context/CartContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { Product, MOCK_PRODUCTS } from "@/lib/mockData";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalQuantity: number;
  totalAmountInr: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize with 1 sample item of quantity 1
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { ...MOCK_PRODUCTS[0], quantity: 1 },
  ]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const clearCart = () => setCartItems([]);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmountInr = cartItems.reduce(
    (acc, item) => acc + item.priceInr * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalQuantity,
        totalAmountInr,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}