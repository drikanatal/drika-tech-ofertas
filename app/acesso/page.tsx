import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drika Tech Ofertas",
  robots: { index: false, follow: false },
};

// Página em branco para quem tentou entrar sem autorização (não revela que existe painel)
export default function AcessoIndisponivel() {
  return (
    <main className="acesso-indisponivel">
      <p>Acesso não disponível!</p>
    </main>
  );
}
