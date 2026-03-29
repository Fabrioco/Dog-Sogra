import { OrderStatus } from "../types/order.types";

export type StatusMeta = {
  label: string;
  color: string;
  step: number; // índice da etapa ativa (0-based). -1 = cancelado
};

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending:          { label: "Aguardando confirmação", color: "text-yellow-400", step: 0 },
  accepted:         { label: "Aceito",                 color: "text-green-400",  step: 1 },
  confirmed:        { label: "Confirmado",             color: "text-green-400",  step: 1 },
  preparing:        { label: "Em preparo",             color: "text-orange-400", step: 2 },
  out_for_delivery: { label: "Saiu para entrega",      color: "text-blue-400",   step: 3 },
  delivered:        { label: "Entregue",               color: "text-green-500",  step: 4 },
  cancelled:        { label: "Cancelado",              color: "text-red-500",    step: -1 },
};

// Etapas exibidas no stepper (excluindo "cancelado")
export type Step = { label: string; icon: string };

export const ORDER_STEPS: Step[] = [
  { label: "Recebido",  icon: "📋" },
  { label: "Aceito",    icon: "✅" },
  { label: "Preparo",   icon: "🍳" },
  { label: "Entrega",   icon: "🛵" },
  { label: "Entregue",  icon: "🎉" },
];
