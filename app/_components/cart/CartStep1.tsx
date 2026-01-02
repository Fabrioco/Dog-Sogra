"use client";

import { useCart } from "@/app/context/CartContext";

export default function CartStep1() {
  const { cart, setCart } = useCart();

  return (
    <>
      {cart.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span>
            {item.name} x{item.quantidade}
          </span>
          <button
            onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
            className="text-red-500"
          >
            X
          </button>
        </div>
      ))}
    </>
  );
}
