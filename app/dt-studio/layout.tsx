import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AvisoInstalacao } from "./AvisoInstalacao";
import "./painel.css";

// App instalável (PWA) só no painel: a vitrine nunca recebe o manifesto nem o convite de instalação
export const metadata: Metadata = {
  manifest: "/manifest-painel.webmanifest",
  applicationName: "Drika Tech Studio",
  appleWebApp: {
    capable: true,
    title: "Drika Tech",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icons/favicon-painel.png", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// Barra de status do iPhone na mesma cor do topo do painel
export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function LayoutStudio({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AvisoInstalacao />
    </>
  );
}
