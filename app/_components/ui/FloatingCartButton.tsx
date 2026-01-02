"use client";

import { useCart } from "@/app/context/CartContext";

export default function FloatingCartButton() {
  const { cart } = useCart();

  if (cart.length === 0) return null;

  return (
    <button className="fixed bottom-28 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
      🛒 {cart.length}
    </button>
  );
}
