import clsx from "clsx";
import { ORDER_STEPS } from "@/app/constants/order.constants";

interface Props {
  activeStep: number; // -1 = cancelled
  cancelled?: boolean;
}

export function OrderStepper({ activeStep, cancelled = false }: Props) {
  if (cancelled) {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="text-xs text-red-400 font-semibold">✕ Pedido cancelado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {ORDER_STEPS.map((step, index) => {
        const isDone    = index < activeStep;
        const isActive  = index === activeStep;
        const isPending = index > activeStep;

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            {/* Bolinha */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                  isDone   && "bg-yellow-400 border-yellow-400 text-black",
                  isActive && "bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]",
                  isPending && "bg-transparent border-yellow-900/40 text-yellow-900",
                )}
              >
                {isDone ? "✓" : step.icon}
              </div>
              <span
                className={clsx(
                  "text-[9px] font-semibold leading-tight text-center whitespace-nowrap",
                  isDone   && "text-yellow-400",
                  isActive && "text-yellow-400",
                  isPending && "text-yellow-900",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Linha conectora */}
            {index < ORDER_STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full overflow-hidden bg-yellow-900/30">
                <div
                  className="h-full bg-yellow-400 transition-all duration-500"
                  style={{ width: isDone ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
