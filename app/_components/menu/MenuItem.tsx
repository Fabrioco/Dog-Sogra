"use client";

import { useState } from "react";
import { adicionaisDisponiveis } from "@/app/data/adicionalData";
import { LancheItem } from "@/app/types/menu";
import { useFavorites } from "@/app/context/FavoritesContext";
import { useCart } from "@/app/context/CartContext";
import { Adicional } from "@/app/types/adicional";

export default function MenuItem({
  categoria,
  item,
}: {
  categoria: string;
  item: LancheItem;
}) {
  const { favoritos, toggleFavorito } = useFavorites();
  const { setCart } = useCart();

  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const key = `${categoria}-${item.name}`;

  function toggleAdicional(adicional: Adicional) {
    setAdicionais((prev) =>
      prev.some((a) => a.name === adicional.name)
        ? prev.filter((a) => a.name !== adicional.name)
        : [...prev, adicional]
    );
  }

  function addToCart() {
    setCart((prev) => [
      ...prev,
      {
        name: item.name,
        precoBase: item.price,
        adicionais,
        quantidade: 1,
      },
    ]);
    setAdicionais([]);
  }

  return (
    <div className="bg-white p-4 rounded shadow space-y-3">
      <div className="flex justify-between">
        <h4 className="font-semibold">{item.name}</h4>
        <button onClick={() => toggleFavorito(key)}>
          {favoritos.includes(key) ? "❤️" : "🤍"}
        </button>
      </div>

      {item.description && (
        <p className="text-sm text-gray-600">{item.description}</p>
      )}

      {categoria !== "Bebidas" && (
        <div className="flex flex-wrap gap-2">
          {adicionaisDisponiveis.map((a) => (
            <button
              key={a.name}
              onClick={() => toggleAdicional(a)}
              className={`px-3 py-1 text-sm rounded border ${
                adicionais.some((x) => x.name === a.name)
                  ? "bg-green-500 text-white"
                  : "border-gray-300"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="font-bold">R$ {item.price.toFixed(2)}</span>
        <button onClick={addToCart} className="bg-yellow-500 px-4 py-2 rounded">
          Adicionar
        </button>
      </div>
    </div>
  );
}
