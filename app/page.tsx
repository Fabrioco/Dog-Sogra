"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function RedirectPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const targetUrl =
    "https://orderflow-coral.vercel.app/cachorro-quente-imperador/cardapio";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    const redirect = setTimeout(() => {
      window.location.href = targetUrl;
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-sans flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      <main className="relative z-10 max-w-lg w-full px-6 text-center">
        {/* Logo/Icon Area */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C084FC] to-accent flex items-center justify-center shadow-2xl shadow-accent/20 animate-pulse">
            <GlobeAltIcon className="w-10 h-10 text-[#25005A]" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          O Sistema Evoluiu!
        </h1>

        <p className="text-text-muted text-base leading-relaxed mb-10">
          Para oferecer uma experiência mais rápida e segura, o cardápio do
          <span className="text-white font-bold">
            {" "}
            Cachorro Quente Imperador{" "}
          </span>
          mudou para um novo endereço.
        </p>

        {/* Redirect Card */}
        <div className="bg-surface border border-white/5 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <DevicePhoneMobileIcon className="w-5 h-5 text-accent" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-accent">
              Redirecionando em {countdown}s
            </span>
          </div>

          <a
            href={targetUrl}
            className="group w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-accent hover:text-white active:scale-95"
          >
            ACESSAR NOVO CARDÁPIO
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          <p className="mt-6 text-[10px] text-text-muted uppercase tracking-widest">
            orderflow-coral.vercel.app
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-12 opacity-40">
          <p className="text-xs">© 2026 OrderFlow System</p>
        </footer>
      </main>
    </div>
  );
}
