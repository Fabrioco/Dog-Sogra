import { CartItem } from "./cart";

export type PedidoSalvo = {
  cart: CartItem[];
  payment: "pix" | "cartao" | "";
  nomeCliente: string;
  endereco: {
    rua: string;
    numero: string;
    bairroEndereco: string;
    complemento?: string;
  };
  taxaEntrega: {
    bairro: string;
    valor: number;
  } | null;
};
