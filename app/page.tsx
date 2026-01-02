"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { menuData } from "@/app/data/menuData";
import { Adicional } from "./types/adicional";
import { adicionaisDisponiveis } from "./data/adicionalData";
import { taxasEntrega } from "./data/taxasEntrega";

/* =====================
   TYPES
===================== */

type CartItem = {
  name: string;
  precoBase: number;
  adicionais: Adicional[];
  quantidade: number;
};

type TaxaEntrega = {
  bairro: string;
  valor: number;
};

/* =====================
   COMPONENT
===================== */

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState<"pix" | "cartao" | "">("");

  const [nomeCliente, setNomeCliente] = useState("");
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

  const categoriasSemAdicionais = ["Bebidas"];

  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);

  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "info" | "error";
  } | null>(null);

  const carrinhoRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");

  /* =====================
     FUNCTIONS
  ===================== */

  function showToast(
    message: string,
    type: "success" | "info" | "error" = "success"
  ) {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  function toggleFavorito(itemKey: string) {
    setFavoritos((prev) => {
      const isFav = prev.includes(itemKey);

      showToast(
        isFav ? "Removido dos favoritos" : "Adicionado aos favoritos",
        "info"
      );

      return isFav ? prev.filter((f) => f !== itemKey) : [...prev, itemKey];
    });
  }

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartY(e.touches[0].clientY);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;

    if (diff > 50) {
      // swipe pra cima
      setCarrinhoAberto(true);
    } else if (diff < -50) {
      // swipe pra baixo
      setCarrinhoAberto(false);
    }

    setTouchStartY(null);
  }

  function toggleAdicional(itemKey: string, adicional: Adicional) {
    setAdicionaisPorLanche((prev) => {
      const atuais = prev[itemKey] || [];
      const existe = atuais.some((a) => a.name === adicional.name);

      return {
        ...prev,
        [itemKey]: existe
          ? atuais.filter((a) => a.name !== adicional.name)
          : [...atuais, adicional],
      };
    });
  }

  function addToCart(categoria: string, item: { name: string; price: number }) {
    const key = `${categoria}-${item.name}`;
    const adicionaisSelecionados = adicionaisPorLanche[key] || [];

    setCart((prev) => {
      const existente = prev.find(
        (i) =>
          i.name === item.name &&
          JSON.stringify(i.adicionais) ===
            JSON.stringify(adicionaisSelecionados)
      );

      if (existente) {
        return prev.map((i) =>
          i === existente ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }

      return [
        ...prev,
        {
          name: item.name,
          precoBase: item.price,
          adicionais: adicionaisSelecionados,
          quantidade: 1,
        },
      ];
    });

    setAdicionaisPorLanche((prev) => ({
      ...prev,
      [key]: [],
    }));
  }

  function removeFromCart(item: CartItem) {
    setCart((prev) => prev.filter((i) => i !== item));
  }

  const totalLanches = cart.reduce((sum, item) => {
    const adicionais = item.adicionais.reduce((s, a) => s + a.price, 0);
    return sum + (item.precoBase + adicionais) * item.quantidade;
  }, 0);

  const totalFinal = totalLanches + (taxaEntrega?.valor ?? 0);

  function toggleDescricao(itemKey: string) {
    setDescricaoExpandida((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  }

  function sendWhatsApp() {
    const itens = cart
      .map((i) => {
        const adds = i.adicionais.map((a) => `+ ${a.name}`).join(", ");
        const preco =
          (i.precoBase + i.adicionais.reduce((s, a) => s + a.price, 0)) *
          i.quantidade;

        return `• ${i.name} x${i.quantidade} ${
          adds ? `(${adds})` : ""
        } - R$ ${preco.toFixed(2)}`;
      })
      .join("\n");

    const msg = `
🌭 *Novo Pedido*
👤 *Cliente:* ${nomeCliente || "Não informado"}

${itens}

🚚 *Entrega:* ${taxaEntrega?.bairro} - R$ ${taxaEntrega?.valor.toFixed(2)}
💳 *Pagamento:* ${payment === "pix" ? "Pix" : "Cartão"} (presencial)

📍 *Endereço:*
${rua}, ${numero} - ${bairroEndereco}
${complemento ? `Comp.: ${complemento}` : ""}

💰 *Total:* R$ ${totalFinal.toFixed(2)}
`;

    showToast("Redirecionando para o WhatsApp...");

    window.open(
      `https://wa.me/5519995254199?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    localStorage.setItem(
      "ultimoPedido",
      JSON.stringify({
        cart,
        payment,
        nomeCliente,
        endereco: {
          rua,
          numero,
          bairroEndereco,
          complemento,
        },
        taxaEntrega,
      })
    );

    showToast("Pedido salvo com sucesso");
  }

  function refazerUltimoPedido() {
    const pedidoSalvo = localStorage.getItem("ultimoPedido");
    if (!pedidoSalvo) return;

    const data = JSON.parse(pedidoSalvo);

    setCart(data.cart || []);
    setPayment(data.payment || "");
    setRua(data.endereco?.rua || "");
    setNumero(data.endereco?.numero || "");
    setBairroEndereco(data.endereco?.bairroEndereco || "");
    setComplemento(data.endereco?.complemento || "");
    setTaxaEntrega(data.taxaEntrega || null);
    setStep(1);

    showToast("Último pedido restaurado");
  }

  useEffect(() => {
    const pedidoSalvo = localStorage.getItem("ultimoPedido");

    if (pedidoSalvo) {
      const data = JSON.parse(pedidoSalvo);

      setNomeCliente(data.nomeCliente || "");
      setCart(data.cart || []);
      setPayment(data.payment || "");
      setRua(data.endereco?.rua || "");
      setNumero(data.endereco?.numero || "");
      setBairroEndereco(data.endereco?.bairroEndereco || "");
      setComplemento(data.endereco?.complemento || "");
      setTaxaEntrega(data.taxaEntrega || null);
    }
  }, []);

  useEffect(() => {
    const favs = localStorage.getItem("favoritos");
    if (favs) {
      setFavoritos(JSON.parse(favs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
    carrinhoRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [step]);

  /* =====================
     UI
  ===================== */

  return (
    <main className="flex min-h-screen flex-col items-center py-8">
      <section className="w-full max-w-md px-4 space-y-4 pb-40">
        {/* BUSCA */}
        <input
          type="text"
          className="w-full border p-2 rounded border-gray-300 placeholder:text-gray-400"
          placeholder="Buscar lanche ou bebida..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <h2 className="text-2xl font-bold">🌭 Cardápio</h2>

        {/* FILTRO */}
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFavoritos(false)}
            className={`flex-1 py-2 rounded text-sm ${
              !mostrarFavoritos ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => setMostrarFavoritos(true)}
            className={`flex-1 py-2 rounded text-sm ${
              mostrarFavoritos ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            ❤️ Favoritos
          </button>
        </div>

        {/* LISTA */}
        {menuData.map((categoria) => {
          const itensFiltrados = categoria.items.filter((item) => {
            const key = `${categoria.name}-${item.name}`;

            if (mostrarFavoritos && !favoritos.includes(key)) return false;

            if (search.trim()) {
              const termo = search.toLowerCase();
              return (
                item.name.toLowerCase().includes(termo) ||
                item.description?.toLowerCase().includes(termo)
              );
            }

            return true;
          });

          if (itensFiltrados.length === 0) return null;

          return (
            <div key={categoria.name} className="space-y-3">
              <h2 className="text-xl font-bold">{categoria.name}</h2>

              {itensFiltrados.map((item) => {
                const itemKey = `${categoria.name}-${item.name}`;
                const ativos = adicionaisPorLanche[itemKey] || [];

                return (
                  <div
                    key={item.name}
                    className="bg-white p-4 rounded shadow space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{item.name}</h3>

                        <button
                          onClick={() => toggleFavorito(itemKey)}
                          className="text-xl"
                        >
                          {favoritos.includes(itemKey) ? "❤️" : "🤍"}
                        </button>
                      </div>

                      {item.description && (
                        <div className="text-sm text-gray-600">
                          <p
                            className={`overflow-hidden transition-all ${
                              descricaoExpandida[itemKey]
                                ? "max-h-40"
                                : "max-h-10 line-clamp-2"
                            }`}
                          >
                            {item.description}
                          </p>

                          {item.description.length > 60 && (
                            <button
                              onClick={() => toggleDescricao(itemKey)}
                              className="text-green-600 text-xs mt-1 font-semibold"
                            >
                              {descricaoExpandida[itemKey]
                                ? "Ver menos"
                                : "Ver mais"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {!categoriasSemAdicionais.includes(categoria.name) && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Adicionais</p>
                        <div className="flex flex-wrap gap-2">
                          {adicionaisDisponiveis.map((a) => {
                            const ativo = ativos.some((x) => x.name === a.name);

                            return (
                              <button
                                key={a.name}
                                onClick={() => toggleAdicional(itemKey, a)}
                                className={`px-3 py-1 text-sm rounded border ${
                                  ativo
                                    ? "bg-green-500 text-white"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {a.name} (+R$ {a.price.toFixed(2)})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="font-bold">
                        R$ {item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(categoria.name, item)}
                        className="bg-yellow-500 px-4 py-2 rounded"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {search && (
          <p className="text-center text-sm text-gray-500">
            🔍 Resultados para `{search}`
          </p>
        )}
      </section>

      {/* BOTÃO MINI CARRINHO */}
      {cart.length > 0 && !carrinhoAberto && (
        <button
          onClick={() => setCarrinhoAberto(true)}
          className="fixed bottom-28 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold"
        >
          🛒 {cart.length} • R$ {totalFinal.toFixed(2)}
        </button>
      )}

      {/* CARRINHO */}
      {cart.length > 0 && (
        <div
          ref={carrinhoRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm
          bg-white/95 backdrop-blur-md rounded-xl shadow-2xl
          transition-all duration-300
          ${carrinhoAberto ? "max-h-[80dvh]" : "max-h-24"}
        `}
        >
          <div className="p-4 overflow-y-auto max-h-[70vh] space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">🛒 Pedido</h3>
              {carrinhoAberto ? (
                <button
                  onClick={() => setCarrinhoAberto(false)}
                  className="text-sm text-gray-500"
                >
                  Fechar
                </button>
              ) : (
                <button
                  onClick={() => setCarrinhoAberto(true)}
                  className="text-sm text-gray-500"
                >
                  Abrir
                </button>
              )}
            </div>

            {/* STEP INDICATOR */}
            <div className="flex justify-between text-xs text-gray-500">
              <span className={step >= 1 ? "font-bold text-green-600" : ""}>
                Carrinho
              </span>
              <span className={step >= 2 ? "font-bold text-green-600" : ""}>
                Pagamento
              </span>
              <span className={step >= 3 ? "font-bold text-green-600" : ""}>
                Endereço
              </span>
              <span className={step >= 4 ? "font-bold text-green-600" : ""}>
                Confirmar
              </span>
            </div>

            {/* STEP 1 – CARRINHO */}
            {step === 1 && (
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-3 flex justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.name} x{item.quantidade}
                      </p>

                      {item.adicionais.length > 0 && (
                        <p className="text-xs text-gray-500">
                          + {item.adicionais.map((a) => a.name).join(", ")}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item)}
                      className="text-red-500 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))}

                <p className="font-bold text-right">
                  Subtotal: R$ {totalLanches.toFixed(2)}
                </p>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-green-500 text-white py-2 rounded font-semibold"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* STEP 2 – PAGAMENTO */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="font-semibold">Forma de pagamento</p>

                <button
                  onClick={() => setPayment("pix")}
                  className={`w-full py-2 rounded border ${
                    payment === "pix" ? "bg-green-500 text-white" : ""
                  }`}
                >
                  Pix (presencial)
                </button>

                <button
                  onClick={() => setPayment("cartao")}
                  className={`w-full py-2 rounded border ${
                    payment === "cartao" ? "bg-green-500 text-white" : ""
                  }`}
                >
                  Cartão (presencial)
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full border py-2 rounded"
                  >
                    Voltar
                  </button>

                  <button
                    disabled={!payment}
                    onClick={() => setStep(3)}
                    className="w-full bg-green-500 text-white py-2 rounded disabled:opacity-50"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 – ENDEREÇO */}
            {step === 3 && (
              <div className="space-y-2">
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Nome"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                />

                <input
                  className="w-full border p-2 rounded"
                  placeholder="Rua"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                />

                <input
                  className="w-full border p-2 rounded"
                  placeholder="Número"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                />

                <select
                  className="w-full border p-2 rounded"
                  value={bairroEndereco}
                  onChange={(e) => {
                    const bairro = e.target.value;
                    setBairroEndereco(bairro);
                    setTaxaEntrega(
                      taxasEntrega.find((t) => t.bairro === bairro) || null
                    );
                  }}
                >
                  <option value="">Selecione o bairro</option>
                  {taxasEntrega.map((t) => (
                    <option key={t.bairro} value={t.bairro}>
                      {t.bairro} – R$ {t.valor.toFixed(2)}
                    </option>
                  ))}
                </select>

                <input
                  className="w-full border p-2 rounded"
                  placeholder="Complemento (opcional)"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full border py-2 rounded"
                  >
                    Voltar
                  </button>

                  <button
                    onClick={() => setStep(4)}
                    className="w-full bg-green-500 text-white py-2 rounded"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 – CONFIRMAÇÃO */}
            {step === 4 && (
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Cliente:</strong> {nomeCliente}
                </p>
                <p>
                  <strong>Pagamento:</strong>{" "}
                  {payment === "pix" ? "Pix" : "Cartão"} (presencial)
                </p>
                <p>
                  <strong>Endereço:</strong> {rua}, {numero} – {bairroEndereco}
                </p>

                <p className="font-bold">Total: R$ {totalFinal.toFixed(2)}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(3)}
                    className="w-full border py-2 rounded"
                  >
                    Voltar
                  </button>

                  <button
                    onClick={sendWhatsApp}
                    className="w-full bg-green-600 text-white py-2 rounded font-semibold"
                  >
                    Enviar no WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold
        ${
          toast.type === "success"
            ? "bg-green-500 text-white"
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
