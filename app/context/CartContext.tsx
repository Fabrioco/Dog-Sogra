"use client";

import { createContext, useContext, useState } from "react";
import { CartItem } from "../types/cart";

type CartContextType = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  step?: number;
  nextStep?: () => void;
  previousStep?: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<number>(0);

  function nextStep() {
    setStep((prev) => prev + 1);
  }

  function previousStep() {
    setStep((prev) => prev - 1);
  }

  return (
    <CartContext.Provider
      value={{ cart, setCart, step, nextStep, previousStep }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
