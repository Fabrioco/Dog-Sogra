import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const InterFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cachorro-Quente Imperador Cardápio",
  description: "A melhor lanchonete do Imperador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${InterFont.className} antialiased`}>
        <main className=" bg-gray-100">{children}</main>
      </body>
    </html>
  );
}
