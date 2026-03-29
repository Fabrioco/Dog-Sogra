import clsx from "clsx";
import { OrderStepper } from "./OrderStepper";
import { Order } from "@/app/types/order.types";
import { fmtCurrency, fmtDate, getStatusMeta } from "@/utils/orders/order.utils";

interface Props {
  order: Order;
  highlight?: boolean;
}

export function OrderCard({ order, highlight = false }: Props) {
  const status    = getStatusMeta(order.status);
  const cancelled = order.status === "cancelled";

  return (
    <div
      className={clsx(
        "rounded-2xl border p-4 space-y-3",
        highlight
          ? "border-yellow-400 bg-[#1a1400]"
          : "border-yellow-900/40 bg-[#161000]",
      )}
    >
      {/* HEADER */}
      <div className="flex justify-between text-sm">
        <span className="text-yellow-800">#{order.id.slice(0, 6)}</span>
        <span className="text-yellow-700">{fmtDate(order.created_at)}</span>
      </div>

      {/* ITEMS */}
      <div className="space-y-1">
        {order.order_items.map((item, i) => (
          <div key={i}>
            <div className="text-sm flex justify-between">
              <span>
                {item.quantity}x {item.product_name}
              </span>
              <span>R$ {fmtCurrency(item.unit_price)}</span>
            </div>
            {(item.selected_addons?.length ?? 0) > 0 && (
              <p className="text-[11px] text-yellow-800">
                + {item.selected_addons!.map((a) => a.name).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ADDRESS */}
      <div className="text-xs text-yellow-800">
        📍 {order.delivery_address.street}, {order.delivery_address.number} —{" "}
        {order.delivery_address.neighborhood}
      </div>

      {/* STEPPER */}
      <div className="pt-1">
        <p className={clsx("text-xs font-bold mb-3", status.color)}>
          {status.label}
        </p>
        <OrderStepper activeStep={status.step} cancelled={cancelled} />
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-2 border-t border-yellow-900/40">
        <span className="text-yellow-700 text-xs">
          {order.payment_method === "pix" ? "Pix" : "Cartão"}
        </span>
        <span className="font-black text-yellow-400">
          R$ {fmtCurrency(order.total)}
        </span>
      </div>
    </div>
  );
}
