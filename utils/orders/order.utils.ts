import { STATUS_META, StatusMeta } from "@/app/constants/order.constants";
import { OrderStatus } from "@/app/types/order.types";

export const fmtCurrency = (value: number): string =>
  value.toFixed(2).replace(".", ",");

export const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export const getStatusMeta = (status: string): StatusMeta =>
  STATUS_META[status as OrderStatus] ?? {
    label: "Desconhecido",
    color: "text-gray-400",
    step: 0,
  };

export const getLastPhone = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    JSON.parse(localStorage.getItem("ultimoPedido") || "{}")?.telefone || null
  );
};

export const normalizePhone = (raw: string): string =>
  `55${raw.replace(/\D/g, "")}`;
