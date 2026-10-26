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

const DESCRICAO =
  "Produtos, ferramentas e dicas reais para o seu dia a dia. Links de lojas seguras pra você acessar de forma simples e segura.";

export const metadata: Metadata = {
  metadataBase: new URL("https://drikatech.com.br"),
  title: "Drika Tech Ofertas",
  description: DESCRICAO,
  // Prévia do link no WhatsApp, Instagram etc.: recorte do banner aprovado pela Drika (1200×630)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Drika Tech Ofertas",
    title: "Drika Tech Ofertas",
    description: DESCRICAO,
    images: [{ url: "/images/og-drikatech.jpg", width: 1200, height: 630, alt: "Tecnologia que facilita sua vida" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drika Tech Ofertas",
    description: DESCRICAO,
    images: ["/images/og-drikatech.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
