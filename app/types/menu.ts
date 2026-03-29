export type LancheItem = {
  id:string
  name: string;
  price: number;
  description?: string;
  category?: string;
};

export type Menu = {
  name: string;
  items: LancheItem[];
};
