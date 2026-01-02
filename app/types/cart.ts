import { Adicional } from "./adicional";

export type CartItem = {
  name: string;
  precoBase: number;
  adicionais: Adicional[];
  quantidade: number;
};
