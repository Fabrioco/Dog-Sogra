"use client";

import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";


export default function CartStep3() {
  const {
    rua,
    numero,
    bairroEndereco,
    complemento,
    setRua,
    setNumero,
    setBairroEndereco,
    setComplemento,
    setStep,
  } = useCart();

  const { showToast } = useToast();

  return (
    <>
      <h3 className="font-bold">📍 Endereço</h3>

      <input
        placeholder="Rua"
        className="w-full border p-2 rounded"
        value={rua}
        onChange={(e) => setRua(e.target.value)}
      />

      <input
        placeholder="Número"
        className="w-full border p-2 rounded"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />

      <input
        placeholder="Bairro"
        className="w-full border p-2 rounded"
        value={bairroEndereco}
        onChange={(e) => setBairroEndereco(e.target.value)}
      />

      <input
        placeholder="Complemento"
        className="w-full border p-2 rounded"
        value={complemento}
        onChange={(e) => setComplemento(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={() => setStep(2)}
          className="w-full bg-gray-300 py-2 rounded"
        >
          Voltar
        </button>

        <button
          onClick={() => {
            if (!rua || !numero || !bairroEndereco) {
              showToast("Preencha rua, número e bairro", "error");
              return;
            }
            setStep(4);
          }}
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          Continuar
        </button>
      </div>
    </>
  );
}
