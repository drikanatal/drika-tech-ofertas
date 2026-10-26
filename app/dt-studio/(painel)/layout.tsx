import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { exigirAdmin } from "@/lib/painel";
import { sair } from "./acoes";
import { MenuLinks, MenuPainel } from "./MenuPainel";

export const metadata: Metadata = {
  title: "Drika Tech Ofertas",
  robots: { index: false, follow: false },
};

export default function LayoutPainel({ children }: { children: ReactNode }) {
  return (
    <div className="painel">
      <header className="painel-topo">
        <div className="logo">
          <span className="logo-icon">💡</span>Drika Tech <span>Ofertas</span>
        </div>
        <div className="painel-usuaria">
          <Suspense fallback={<span className="painel-nome">…</span>}>
            <NomeUsuaria />
          </Suspense>
          <form action={sair}>
            <button type="submit" className="painel-botao secundario">
              Sair
            </button>
          </form>
        </div>
      </header>
      <div className="painel-corpo">
        <Suspense fallback={<MenuLinks />}>
          <MenuPainel />
        </Suspense>
        <main className="painel-conteudo">{children}</main>
      </div>
    </div>
  );
}

async function NomeUsuaria() {
  const { nome } = await exigirAdmin();
  return <span className="painel-nome">Olá, {nome}</span>;
}
