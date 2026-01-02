"use client";

import { useToast } from "@/app/context/ToastContext";

export default function Toast() {
  const { toast } = useToast();
  if (!toast) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded text-white
      ${
        toast.type === "error"
          ? "bg-red-500"
          : toast.type === "info"
          ? "bg-blue-500"
          : "bg-green-500"
      }`}
    >
      {toast.message}
    </div>
  );
}
