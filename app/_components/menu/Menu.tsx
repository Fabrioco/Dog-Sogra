"use client";

import { menuData } from "@/app/data/menuData";
import FavoritosFiltro from "./FavoritosFiltro";
import MenuItem from "./MenuItem";

export default function Menu() {
  return (
    <section className="w-full max-w-md px-4 space-y-4 pb-40">
      <h2 className="text-2xl font-bold">🌭 Cardápio</h2>
      <FavoritosFiltro />

      {menuData.map((categoria) => (
        <div key={categoria.name} className="space-y-3">
          <h3 className="text-xl font-bold">{categoria.name}</h3>

          {categoria.items.map((item) => (
            <MenuItem key={item.name} categoria={categoria.name} item={item} />
          ))}
        </div>
      ))}
    </section>
  );
}
