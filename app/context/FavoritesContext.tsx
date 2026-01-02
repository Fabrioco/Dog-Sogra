"use client";

import { createContext, useContext, useEffect, useState } from "react";

type FavoritesContextType = {
  favoritos: string[];
  toggleFavorito: (key: string) => void;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favoritos");
    if (saved) setFavoritos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  function toggleFavorito(key: string) {
    setFavoritos((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  }

  return (
    <FavoritesContext.Provider value={{ favoritos, toggleFavorito }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside provider");
  return ctx;
}
