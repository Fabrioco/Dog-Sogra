"use client";

import { useState } from "react";

export default function FavoritosFiltro() {
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setMostrarFavoritos(false)}
        className={`flex-1 py-2 rounded ${
          !mostrarFavoritos ? "bg-green-500 text-white" : "bg-gray-200"
        }`}
      >
        Todos
      </button>

      <button
        onClick={() => setMostrarFavoritos(true)}
        className={`flex-1 py-2 rounded ${
          mostrarFavoritos ? "bg-green-500 text-white" : "bg-gray-200"
        }`}
      >
        ❤️ Favoritos
      </button>
    </div>
  );
}
