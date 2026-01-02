"use client";

import CartHeader from "./CartHeader";
import CartStep1 from "./CartStep1";
import CartStep2 from "./CartStep2";
import CartStep3 from "./CartStep3";
import CartStep4 from "./CartStep4";

export default function Cart({ step }: { step: number }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white rounded-xl shadow-2xl">
      <CartHeader />

      <div className="p-4 space-y-3">
        {step === 1 && <CartStep1 />}
        {step === 2 && <CartStep2 />}
        {step === 3 && <CartStep3 />}
        {step === 4 && <CartStep4 />}
      </div>
    </div>
  );
}
