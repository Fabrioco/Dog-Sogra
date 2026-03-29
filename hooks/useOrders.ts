"use client";

import { supabase } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { Order } from "../types/order.types";
import { getLastPhone, normalizePhone } from "../utils/orders/order.utils";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const telefone = getLastPhone();

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    if (!telefone) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const phone = normalizePhone(telefone);

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .single();

    if (!customer) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items (*)")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setOrders([]);
    } else {
      setOrders((data as Order[]) || []);
    }

    setLoading(false);
  }, [telefone]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    loading,
    currentOrder: orders[0] ?? null,
    history: orders.slice(1),
    refresh: fetchOrders,
  };
}
