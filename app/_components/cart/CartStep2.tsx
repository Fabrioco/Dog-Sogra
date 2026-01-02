"use client";

import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";

export default function CartStep2() {
  const { payment, setPayment, setStep } = useCart();
  const { showToast } = useToast();

  return (
    <>
      <h3 className="font-bold">💳 Pagamento</h3>

      {["pix", "cartao"].map((p) => (
        <button
          key={p}
          onClick={() => setPayment(p as "pix" | "cartao")}
          className={`w-full py-2 rounded ${
            payment === p ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          {p === "pix" ? "Pix" : "Cartão"}
        </button>
      ))}

      <div className="flex gap-2">
        <button
          onClick={() => setStep(1)}
          className="w-full bg-gray-300 py-2 rounded"
        >
          Voltar
        </button>

        <button
          onClick={() => {
            if (!payment) {
              showToast("Escolha a forma de pagamento", "error");
              return;
            }
            setStep(3);
          }}
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          Continuar
        </button>
      </div>
    </>
  );
}
