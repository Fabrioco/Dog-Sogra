"use client";

import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";


export default function CartStep4() {
  const {
    taxaEntrega,
    setTaxaEntrega,
    totalFinal,
    sendWhatsApp,
    setStep,
  } = useCart();

  const { showToast } = useToast();

  return (
    <>
      <h3 className="font-bold">🚚 Taxa de Entrega</h3>

      {taxasEntrega.map((t) => (
        <label
          key={t.bairro}
          className="flex justify-between items-center border p-2 rounded"
        >
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={taxaEntrega?.bairro === t.bairro}
              onChange={() => setTaxaEntrega(t)}
            />
            <span>{t.bairro}</span>
          </div>
          <span>R$ {t.valor.toFixed(2)}</span>
        </label>
      ))}

      <p className="font-bold mt-2">Total: R$ {totalFinal.toFixed(2)}</p>

      <div className="flex gap-2">
        <button
          onClick={() => setStep(3)}
          className="w-full bg-gray-300 py-2 rounded"
        >
          Voltar
        </button>

        <button
          onClick={() => {
            if (!taxaEntrega) {
              showToast("Selecione a taxa de entrega", "error");
              return;
            }
            sendWhatsApp();
          }}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Enviar WhatsApp
        </button>
      </div>
    </>
  );
}
