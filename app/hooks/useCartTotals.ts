import { CartItem } from "../types/cart";

export function useCartTotals(cart: CartItem[], taxa?: number) {
  const totalLanches = cart.reduce((sum, item) => {
    const adicionais = item.adicionais.reduce((s, a) => s + a.price, 0);
    return sum + (item.precoBase + adicionais) * item.quantidade;
  }, 0);

  return {
    totalLanches,
    totalFinal: totalLanches + (taxa ?? 0),
  };
}
