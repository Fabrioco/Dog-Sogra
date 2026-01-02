"use client";

import { createContext, useContext, useState } from "react";

type Toast = {
  message: string;
  type?: "success" | "info" | "error";
};

type ToastContextType = {
  toast: Toast | null;
  showToast: (message: string, type?: "success" | "info" | "error") => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(message: string, type: Toast["type"] = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
