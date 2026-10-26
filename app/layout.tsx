import type { Metadata } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Drika Tech Ofertas",
  description:
    "Produtos, ferramentas e dicas reais para o seu dia a dia. Links de lojas seguras pra você acessar de forma simples e segura.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
