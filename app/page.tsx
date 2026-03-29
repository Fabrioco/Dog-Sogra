"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { menuData } from "@/app/data/menuData";
import { adicionaisDisponiveis } from "@/app/data/adicionalData";
import { taxasEntrega } from "@/app/data/taxasEntrega";
import { supabase } from "@/utils/supabase/client";
import { LancheItem, Menu } from "./types/menu";
import Link from "next/link";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */

type Adicional = { name: string; price: number };

type CartItem = {
  id: string;
  name: string;
  precoBase: number;
  adicionais: Adicional[];
  quantidade: number;
};

type TaxaEntrega = { bairro: string; valor: number };

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const categoriasSemAdicionais = ["Bebidas"];

const categoryEmoji: Record<string, string> = {
  "Cachorro Quente no Pão": "🌭",
  "Cachorro Quente Prensado": "🥪",
  "Cachorro Quente na Bandeja": "🍽️",
  Bebidas: "🥤",
};

/* ─────────────────────────────────────────
   HELPERS (fora do componente — não recriadas a cada render)
───────────────────────────────────────── */

function fmt(v: number) {
  return v.toFixed(2).replace(".", ",");
}

function groupByCategory(products: LancheItem[]): Menu[] {
  const map: Record<string, LancheItem[]> = {};
  products.forEach((p) => {
    const category = p.category || "Cachorro Quente";
    if (!map[category]) map[category] = [];
    map[category].push(p);
  });
  return Object.entries(map).map(([name, items]) => ({ name, items }));
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

export default function CardapioPage() {
  /* ── state ── */
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState<"pix" | "cartao" | "">("");
  const [products, setProducts] = useState<LancheItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairroEndereco, setBairroEndereco] = useState("");
  const [complemento, setComplemento] = useState("");
  const [taxaEntrega, setTaxaEntrega] = useState<TaxaEntrega | null>(null);

  const [adicionaisPorLanche, setAdicionaisPorLanche] = useState<
    Record<string, Adicional[]>
  >({});
  const [descricaoExpandida, setDescricaoExpandida] = useState<
    Record<string, boolean>
  >({});
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(menuData[0].name);

  const carrinhoRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* ── derived (memoizado para evitar recálculo a cada render) ── */
  const categorias = useMemo(() => groupByCategory(products), [products]);

  const totalLanches = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const adds = item.adicionais.reduce((s, a) => s + a.price, 0);
        return sum + (item.precoBase + adds) * item.quantidade;
      }, 0),
    [cart],
  );

  const totalFinal = totalLanches + (taxaEntrega?.valor ?? 0);
  const totalItens = cart.reduce((s, i) => s + i.quantidade, 0);

  /* ── toast ── */
  function showToast(
    message: string,
    type: "success" | "info" | "error" = "success",
  ) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  /* ── favoritos ── */
  function toggleFavorito(key: string) {
    setFavoritos((prev) => {
      const isFav = prev.includes(key);
      showToast(
        isFav ? "Removido dos favoritos" : "Adicionado aos favoritos ❤️",
        "info",
      );
      return isFav ? prev.filter((f) => f !== key) : [...prev, key];
    });
  }

  /* ── swipe carrinho ── */
  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartY(e.touches[0].clientY);
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY === null) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (diff > 50) setCarrinhoAberto(true);
    else if (diff < -50) setCarrinhoAberto(false);
    setTouchStartY(null);
  }

  /* ── adicionais ── */
  function toggleAdicional(key: string, a: Adicional) {
    setAdicionaisPorLanche((prev) => {
      const atuais = prev[key] || [];
      const existe = atuais.some((x) => x.name === a.name);
      return {
        ...prev,
        [key]: existe
          ? atuais.filter((x) => x.name !== a.name)
          : [...atuais, a],
      };
    });
  }

  /* ── cart ── */
  function addToCart(categoria: string, item: LancheItem) {
    const key = `${categoria}-${item.name}`;
    const adds = adicionaisPorLanche[key] || [];

    setCart((prev) => {
      const existente = prev.find(
        (i) =>
          i.id === item.id &&
          JSON.stringify(i.adicionais) === JSON.stringify(adds),
      );
      if (existente) {
        return prev.map((i) =>
          i === existente ? { ...i, quantidade: i.quantidade + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          precoBase: item.price,
          adicionais: adds,
          quantidade: 1,
        },
      ];
    });

    setAdicionaisPorLanche((prev) => ({ ...prev, [key]: [] }));
    showToast(`${item.name} adicionado! 🛒`);
    setCarrinhoAberto(true);
  }

  function removeFromCart(item: CartItem) {
    setCart((prev) => prev.filter((i) => i !== item));
  }

  function increment(item: CartItem) {
    setCart((prev) =>
      prev.map((i) =>
        i === item ? { ...i, quantidade: i.quantidade + 1 } : i,
      ),
    );
  }

  function decrement(item: CartItem) {
    setCart((prev) =>
      prev
        .map((i) => (i === item ? { ...i, quantidade: i.quantidade - 1 } : i))
        .filter((i) => i.quantidade > 0),
    );
  }

  /* ── validação do step 3 ── */
  function validarEndereco(): boolean {
    if (!nomeCliente.trim()) {
      showToast("Informe seu nome", "error");
      return false;
    }
    if (!telefone.trim()) {
      showToast("Informe seu WhatsApp", "error");
      return false;
    }
    if (!rua.trim()) {
      showToast("Informe a rua", "error");
      return false;
    }
    if (!numero.trim()) {
      showToast("Informe o número", "error");
      return false;
    }
    if (!bairroEndereco) {
      showToast("Selecione o bairro", "error");
      return false;
    }
    return true;
  }

  /* ── criar pedido ── */
  async function handleConfirmarPedido() {
    if (cart.length === 0) {
      showToast("Carrinho vazio", "error");
      return;
    }
    if (submitting) return; // evita duplo clique

    setSubmitting(true);

    try {
      // 1. CUSTOMER
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .upsert(
          { name: nomeCliente, phone: `55${telefone.replace(/\D/g, "")}` },
          { onConflict: "phone" },
        )
        .select()
        .single();

      if (customerError) throw customerError;

      // 2. ORDER
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customer.id,
          delivery_address: {
            street: rua,
            number: numero,
            neighborhood: bairroEndereco,
            complement: complemento,
          },
          payment_method: payment === "pix" ? "pix" : "credit_card",
          subtotal: totalLanches,
          delivery_fee: taxaEntrega?.valor ?? 0,
          total: totalFinal,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. ORDER ITEMS
      const items = cart.map((item) => {
        if (!item.id) throw new Error(`Produto sem ID: ${item.name}`);
        return {
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantidade,
          unit_price: item.precoBase,
          selected_addons: item.adicionais,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(items);

      if (itemsError) throw itemsError;

      // 4. Salva no localStorage para "refazer pedido"
      localStorage.setItem(
        "ultimoPedido",
        JSON.stringify({
          cart,
          payment,
          nomeCliente,
          telefone,
          taxaEntrega,
          endereco: { rua, numero, bairroEndereco, complemento },
        }),
      );

      // 5. Limpa carrinho e mostra confirmação
      setCart([]);
      setStep(1);
      setCarrinhoAberto(false);
      setPedidoConfirmado(true);
      showToast("Pedido enviado com sucesso! 🚀");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      showToast("Erro ao salvar pedido. Tente novamente.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── refazer pedido ── */
  function refazerUltimoPedido() {
    const saved = localStorage.getItem("ultimoPedido");
    if (!saved) {
      showToast("Nenhum pedido salvo", "error");
      return;
    }
    const d = JSON.parse(saved);
    setCart(d.cart || []);
    setPayment(d.payment || "");
    setNomeCliente(d.nomeCliente || "");
    setTelefone(d.telefone || "");
    setRua(d.endereco?.rua || "");
    setNumero(d.endereco?.numero || "");
    setBairroEndereco(d.endereco?.bairroEndereco || "");
    setComplemento(d.endereco?.complemento || "");
    setTaxaEntrega(d.taxaEntrega || null);
    setPedidoConfirmado(false);
    setStep(1);
    setCarrinhoAberto(true);
    showToast("Último pedido restaurado ✅");
  }

  /* ── scroll to category ── */
  function scrollToCategory(name: string) {
    setActiveCategory(name);
    categoryRefs.current[name]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  /* ── persist favoritos (leitura antes da escrita) ── */
  useEffect(() => {
    const f = localStorage.getItem("favoritos");
    if (f) setFavoritos(JSON.parse(f));

    const saved = localStorage.getItem("ultimoPedido");
    if (saved) setNomeCliente(JSON.parse(saved).nomeCliente || "");
  }, []);

  useEffect(() => {
    // Só persiste após a leitura inicial (favoritos nunca é [] depois do mount)
    if (favoritos.length === 0) return;
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  /* ── carregar produtos ── */
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Erro ao carregar produtos:", error);
      } else {
        setProducts(data ?? []);
      }
    }
    load();
  }, []);

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */

  return (
    <main className="min-h-screen bg-[#111008] text-white pb-52">
      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#111008]/95 backdrop-blur-lg border-b border-yellow-900/30">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-yellow-400 leading-none">
              🌭 Cachorro Quente
            </h1>
            <p className="text-[11px] text-yellow-700 font-bold tracking-widest uppercase mt-0.5">
              Imperador
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refazerUltimoPedido}
              className="text-xs text-yellow-700 border border-yellow-900/60 rounded-full px-3 py-1.5 hover:bg-yellow-900/20 transition font-semibold"
            >
              ↩ Refazer
            </button>

            {totalItens > 0 && (
              <button
                onClick={() => setCarrinhoAberto((v) => !v)}
                className="relative bg-yellow-400 hover:bg-yellow-300 text-black rounded-full px-4 py-1.5 text-xs font-black flex items-center gap-1 shadow-lg shadow-yellow-900/40 transition"
              >
                🛒 R$ {fmt(totalFinal)}
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItens}
                </span>
              </button>
            )}
          </div>

          <Link href="/meus-pedidos">
            <span className="text-xs text-yellow-700 font-semibold">
              Meus Pedidos
            </span>
          </Link>
        </div>

        {/* SEARCH */}
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-800 text-sm">
              🔍
            </span>
            <input
              type="text"
              className="w-full bg-[#1e1600] border border-yellow-900/40 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-yellow-900 focus:outline-none focus:border-yellow-600 transition"
              placeholder="Buscar lanche ou bebida..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-800 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY TABS — usa categorias do banco, não menuData estático */}
        <div className="max-w-lg mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categorias.map((cat) => (
            <button
              key={cat.name}
              onClick={() => scrollToCategory(cat.name)}
              className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
                activeCategory === cat.name
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-yellow-900/40 text-yellow-800 hover:border-yellow-700"
              }`}
            >
              {categoryEmoji[cat.name] ?? "🌭"} {cat.name}
            </button>
          ))}

          <button
            onClick={() => setMostrarFavoritos((v) => !v)}
            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
              mostrarFavoritos
                ? "bg-red-500 text-white border-red-500"
                : "border-yellow-900/40 text-yellow-800 hover:border-yellow-700"
            }`}
          >
            ❤️ Favoritos
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          CONFIRMAÇÃO DE PEDIDO
      ══════════════════════════════════════ */}
      {pedidoConfirmado && (
        <div className="max-w-lg mx-auto px-4 pt-6">
          <div className="bg-green-900/30 border border-green-700/50 rounded-2xl p-6 text-center space-y-3">
            <p className="text-4xl">🎉</p>
            <p className="font-black text-green-400 text-lg">Pedido enviado!</p>
            <p className="text-sm text-green-600">
              Seu pedido foi recebido e está sendo preparado.
            </p>
            <button
              onClick={() => setPedidoConfirmado(false)}
              className="text-xs text-green-700 underline"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MENU LIST
      ══════════════════════════════════════ */}
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-10">
        {categorias.map((categoria) => {
          const itensFiltrados = categoria.items.filter((item) => {
            const key = `${categoria.name}-${item.name}`;
            if (mostrarFavoritos && !favoritos.includes(key)) return false;
            if (search.trim()) {
              const t = search.toLowerCase();
              return (
                item.name.toLowerCase().includes(t) ||
                item.description?.toLowerCase().includes(t)
              );
            }
            return true;
          });

          if (itensFiltrados.length === 0) return null;

          const semAdicionais = categoriasSemAdicionais.includes(
            categoria.name,
          );

          return (
            <section
              key={categoria.name}
              ref={(el) => {
                categoryRefs.current[categoria.name] =
                  (el as HTMLDivElement) || null;
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">
                  {categoryEmoji[categoria.name] ?? "🌭"}
                </span>
                <div>
                  <h2 className="text-sm font-black text-yellow-400 uppercase tracking-widest leading-none">
                    {categoria.name}
                  </h2>
                  <p className="text-[11px] text-yellow-900 mt-0.5">
                    {itensFiltrados.length}{" "}
                    {itensFiltrados.length === 1 ? "item" : "itens"}
                  </p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-900/50 to-transparent" />
              </div>

              <div className="space-y-3">
                {itensFiltrados.map((item) => {
                  const itemKey = `${categoria.name}-${item.name}`;
                  const ativos = adicionaisPorLanche[itemKey] || [];
                  const isFav = favoritos.includes(itemKey);
                  const expanded = descricaoExpandida[itemKey];
                  const totalAdicionais = ativos.reduce(
                    (s, a) => s + a.price,
                    0,
                  );

                  return (
                    <div
                      key={item.name}
                      className="group bg-[#1a1400] border border-yellow-900/30 rounded-2xl overflow-hidden hover:border-yellow-700/50 transition-all duration-200"
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-black text-white text-[15px] leading-tight flex-1">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => toggleFavorito(itemKey)}
                            className="text-lg shrink-0 hover:scale-110 transition-transform"
                          >
                            {isFav ? "❤️" : "🤍"}
                          </button>
                        </div>

                        {item.description && (
                          <div>
                            <p
                              className={`text-xs text-yellow-900/80 leading-relaxed ${
                                expanded ? "" : "line-clamp-2"
                              }`}
                            >
                              {item.description}
                            </p>
                            {item.description.length > 80 && (
                              <button
                                onClick={() =>
                                  setDescricaoExpandida((prev) => ({
                                    ...prev,
                                    [itemKey]: !prev[itemKey],
                                  }))
                                }
                                className="text-yellow-700 text-[11px] font-semibold mt-1 hover:text-yellow-500 transition"
                              >
                                {expanded ? "Ver menos ▲" : "Ver mais ▼"}
                              </button>
                            )}
                          </div>
                        )}

                        {!semAdicionais && (
                          <div>
                            <p className="text-[10px] font-black text-yellow-800 uppercase tracking-widest mb-2">
                              Adicionais
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {adicionaisDisponiveis.map((a) => {
                                const ativo = ativos.some(
                                  (x) => x.name === a.name,
                                );
                                return (
                                  <button
                                    key={a.name}
                                    onClick={() => toggleAdicional(itemKey, a)}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition ${
                                      ativo
                                        ? "bg-yellow-400 text-black border-yellow-400"
                                        : "border-yellow-900/50 text-yellow-800 hover:border-yellow-700"
                                    }`}
                                  >
                                    {a.name}{" "}
                                    <span className="opacity-70">
                                      +R${fmt(a.price)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-col">
                            <span className="text-yellow-400 font-black text-xl leading-none">
                              R$ {fmt(item.price)}
                            </span>
                            {totalAdicionais > 0 && (
                              <span className="text-yellow-700 text-[11px] mt-0.5">
                                + R$ {fmt(totalAdicionais)} em adicionais
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(categoria.name, item)}
                            className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-sm px-5 py-2.5 rounded-xl transition-all duration-150 shadow-md shadow-yellow-900/30"
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {search.trim() && (
          <p className="text-center text-sm text-yellow-900 py-6">
            🔍 Resultados para &quot;{search}&quot;
          </p>
        )}
      </div>

      {/* ══════════════════════════════════════
          CARRINHO FLUTUANTE
      ══════════════════════════════════════ */}
      {cart.length > 0 && (
        <div
          ref={carrinhoRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg
            bg-[#161000]/98 backdrop-blur-xl border border-yellow-900/50
            rounded-2xl shadow-2xl shadow-black/70 z-50
            transition-all duration-300 overflow-hidden
            ${carrinhoAberto ? "max-h-[85dvh]" : "max-h-[58px]"}
          `}
        >
          {/* header / handle */}
          <button
            onClick={() => setCarrinhoAberto((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <span className="text-sm font-black text-yellow-400">
              🛒 {totalItens} {totalItens === 1 ? "item" : "itens"}
              {!carrinhoAberto && (
                <span className="text-yellow-800 font-normal text-xs ml-2">
                  — toque para ver
                </span>
              )}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-black text-yellow-400">
                R$ {fmt(totalFinal)}
              </span>
              <span className="text-yellow-800 text-xs">
                {carrinhoAberto ? "▼" : "▲"}
              </span>
            </div>
          </button>

          {/* scrollable content */}
          <div className="overflow-y-auto max-h-[74dvh] px-4 pb-5 space-y-4">
            {/* step indicator */}
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
              {["Carrinho", "Pagamento", "Endereço", "Confirmar"].map(
                (label, i) => (
                  <span
                    key={label}
                    className={
                      step >= i + 1 ? "text-yellow-400" : "text-yellow-900"
                    }
                  >
                    {step > i + 1 ? "✓ " : step === i + 1 ? "● " : "○ "}
                    {label}
                  </span>
                ),
              )}
            </div>

            {/* ── STEP 1 – CARRINHO ── */}
            {step === 1 && (
              <div className="space-y-3">
                {cart.map((item, idx) => {
                  const adds = item.adicionais.reduce((s, a) => s + a.price, 0);
                  const subtotal = (item.precoBase + adds) * item.quantidade;
                  return (
                    <div
                      key={idx}
                      className="bg-[#221a00] border border-yellow-900/30 rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">
                          {item.name}
                        </p>
                        {item.adicionais.length > 0 && (
                          <p className="text-[11px] text-yellow-800 truncate">
                            + {item.adicionais.map((a) => a.name).join(", ")}
                          </p>
                        )}
                        <p className="text-yellow-400 font-black text-sm mt-0.5">
                          R$ {fmt(subtotal)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decrement(item)}
                          className="w-7 h-7 rounded-full bg-yellow-900/40 text-yellow-400 font-black flex items-center justify-center hover:bg-yellow-900/70 transition"
                        >
                          −
                        </button>
                        <span className="text-white font-bold text-sm w-4 text-center">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => increment(item)}
                          className="w-7 h-7 rounded-full bg-yellow-900/40 text-yellow-400 font-black flex items-center justify-center hover:bg-yellow-900/70 transition"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item)}
                        className="text-red-500 text-xl font-black hover:text-red-400 transition"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                <div className="flex justify-between text-sm border-t border-yellow-900/30 pt-3">
                  <span className="text-yellow-800">Subtotal dos itens</span>
                  <span className="font-black text-white">
                    R$ {fmt(totalLanches)}
                  </span>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-xl transition"
                >
                  Continuar →
                </button>
              </div>
            )}

            {/* ── STEP 2 – PAGAMENTO ── */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="font-black text-yellow-400 text-xs uppercase tracking-widest">
                  Forma de pagamento
                </p>

                {(["pix", "cartao"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPayment(p)}
                    className={`w-full py-3 rounded-xl border text-sm font-bold transition ${
                      payment === p
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "border-yellow-900/40 text-yellow-800 hover:border-yellow-700"
                    }`}
                  >
                    {p === "pix"
                      ? "🏦 Pix (presencial)"
                      : "💳 Cartão (presencial)"}
                  </button>
                ))}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-yellow-900/40 text-yellow-800 py-2.5 rounded-xl text-sm font-bold"
                  >
                    ← Voltar
                  </button>
                  <button
                    disabled={!payment}
                    onClick={() => setStep(3)}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-30 text-black font-black py-2.5 rounded-xl text-sm transition"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 – ENDEREÇO ── */}
            {step === 3 && (
              <div className="space-y-2">
                <p className="font-black text-yellow-400 text-xs uppercase tracking-widest mb-1">
                  Seus dados
                </p>

                {[
                  {
                    placeholder: "Seu nome *",
                    value: nomeCliente,
                    onChange: setNomeCliente,
                  },
                  {
                    placeholder: "WhatsApp * (ex: 19999999999)",
                    value: telefone,
                    onChange: setTelefone,
                  },
                  {
                    placeholder: "Rua / Avenida *",
                    value: rua,
                    onChange: setRua,
                  },
                  {
                    placeholder: "Número *",
                    value: numero,
                    onChange: setNumero,
                  },
                  {
                    placeholder: "Complemento (opcional)",
                    value: complemento,
                    onChange: setComplemento,
                  },
                ].map((field) => (
                  <input
                    key={field.placeholder}
                    className="w-full bg-[#221a00] border border-yellow-900/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-yellow-900 focus:outline-none focus:border-yellow-600 transition"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                ))}

                <select
                  className="w-full bg-[#221a00] border border-yellow-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-600 transition"
                  value={bairroEndereco}
                  onChange={(e) => {
                    const b = e.target.value;
                    setBairroEndereco(b);
                    setTaxaEntrega(
                      taxasEntrega.find((t) => t.bairro === b) || null,
                    );
                  }}
                >
                  <option value="">Selecione o bairro *</option>
                  {taxasEntrega.map((t) => (
                    <option key={t.bairro} value={t.bairro}>
                      {t.bairro} — R$ {fmt(t.valor)}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-yellow-900/40 text-yellow-800 py-2.5 rounded-xl text-sm font-bold"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={() => {
                      if (validarEndereco()) setStep(4);
                    }}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black py-2.5 rounded-xl text-sm transition"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4 – CONFIRMAR ── */}
            {step === 4 && (
              <div className="space-y-3">
                <p className="font-black text-yellow-400 text-xs uppercase tracking-widest">
                  Confirmar pedido
                </p>

                <div className="bg-[#221a00] border border-yellow-900/30 rounded-xl p-4 space-y-2.5 text-sm">
                  {[
                    { label: "Cliente", value: nomeCliente || "—" },
                    { label: "Telefone", value: telefone || "—" },
                    {
                      label: "Pagamento",
                      value: payment === "pix" ? "Pix" : "Cartão",
                    },
                    {
                      label: "Endereço",
                      value: `${rua}, ${numero} — ${bairroEndereco}`,
                    },
                    {
                      label: "Entrega",
                      value: `R$ ${fmt(taxaEntrega?.valor ?? 0)}`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-yellow-800 shrink-0">{label}</span>
                      <span className="font-semibold text-white text-right">
                        {value}
                      </span>
                    </div>
                  ))}

                  {/* itens resumidos */}
                  <div className="border-t border-yellow-900/40 pt-2.5 space-y-1">
                    {cart.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-yellow-800 truncate flex-1 pr-2">
                          {item.quantidade}× {item.name}
                        </span>
                        <span className="text-yellow-700 shrink-0">
                          R${" "}
                          {fmt(
                            (item.precoBase +
                              item.adicionais.reduce(
                                (s, a) => s + a.price,
                                0,
                              )) *
                              item.quantidade,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-yellow-900/40 pt-2.5 flex justify-between">
                    <span className="font-black text-yellow-400">Total</span>
                    <span className="font-black text-yellow-400 text-base">
                      R$ {fmt(totalFinal)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(3)}
                    disabled={submitting}
                    className="flex-1 border border-yellow-900/40 text-yellow-800 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={handleConfirmarPedido}
                    disabled={submitting}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      "✓ Confirmar pedido"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TOAST
      ══════════════════════════════════════ */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-2xl shadow-xl text-sm font-bold whitespace-nowrap pointer-events-none
            ${
              toast.type === "success"
                ? "bg-yellow-400 text-black"
                : toast.type === "info"
                  ? "bg-blue-500 text-white"
                  : "bg-red-500 text-white"
            }`}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}
