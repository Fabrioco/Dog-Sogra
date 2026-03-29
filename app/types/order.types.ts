export type OrderStatus =
  | "pending"
  | "accepted"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  selected_addons?: { name: string; price: number }[];
};

export type DeliveryAddress = {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
};

export type Order = {
  id: string;
  created_at: string;
  total: number;
  delivery_fee: number;
  payment_method: string;
  status: OrderStatus;
  delivery_address: DeliveryAddress;
  order_items: OrderItem[];
};
