"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/dt-studio/produtos", rotulo: "🛍️ Produtos" },
  { href: "/dt-studio/categorias", rotulo: "🏷️ Categorias" },
  { href: "/dt-studio/usuarios", rotulo: "✉️ E-mails autorizados" },
] as const;

// Menu sem item ativo: vai no pré-render (fallback do Suspense) enquanto a URL não é conhecida
export function MenuLinks({ caminho = "" }: { caminho?: string }) {
  return (
    <nav className="painel-menu" aria-label="Seções do painel">
      {ITENS.map((item) => {
        const ativo = caminho.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={ativo ? "ativo" : undefined}
            aria-current={ativo ? "page" : undefined}
          >
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

export function MenuPainel() {
  return <MenuLinks caminho={usePathname()} />;
}
