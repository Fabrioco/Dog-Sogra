"use client";

import Link from "next/link";
import { OrderCard } from "@/app/_components/meus-pedidos/OrderCard";
import { useOrders } from "@/hooks/useOrders";

export default function MeusPedidosPage() {
  const { loading, currentOrder, history, refresh } = useOrders();

  return (
    <main className="min-h-screen bg-[#111008] text-white px-4 py-6 w-full mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black text-yellow-400">📦 Meus Pedidos</h1>
        <div className="flex gap-2">
          <button onClick={refresh} className="text-yellow-700 text-sm">
            Atualizar
          </button>
          <Link href="/" className="text-yellow-700 text-sm">
            ← Voltar
          </Link>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-yellow-800 text-sm">Carregando pedidos...</p>
      )}

      {/* EMPTY */}
      {!loading && !currentOrder && history.length === 0 && (
        <div className="text-center py-10 text-yellow-700 text-sm">
          Nenhum pedido encontrado
        </div>
      )}

      {/* PEDIDO ATUAL */}
      {currentOrder && (
        <div className="mb-8">
          <h2 className="text-xs uppercase text-yellow-800 mb-2">Pedido atual</h2>
          <OrderCard order={currentOrder} highlight />
        </div>
      )}

      {/* HISTÓRICO */}
      {history.length > 0 && (
        <div>
          <h2 className="text-xs uppercase text-yellow-800 mb-2">Histórico</h2>
          <div className="space-y-3">
            {history.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
