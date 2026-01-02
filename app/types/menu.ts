export type LancheItem = {
  name: string;
  price: number;
  description?: string;
};

export type Menu = {
  name: string;
  items: LancheItem[];
};
