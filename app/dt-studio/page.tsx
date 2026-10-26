import type { Metadata } from "next";
import { BotaoGoogle } from "./BotaoGoogle";

// Tela neutra: não menciona painel nem admin
export const metadata: Metadata = {
  title: "Drika Tech Ofertas",
  robots: { index: false, follow: false },
};

export default function Entrar() {
  return (
    <main className="studio-entrar">
      <div className="studio-cartao">
        <div className="logo">
          <span className="logo-icon">💡</span>Drika Tech <span>Ofertas</span>
        </div>
        <BotaoGoogle />
      </div>
    </main>
  );
}
