"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/dt-studio/produtos", rotulo: "🛍️ Produtos" },
  { href: "/dt-studio/categorias", rotulo: "🏷️ Categorias" },
  { href: "/dt-studio/usuarios", rotulo: "✉️ E-mails autorizados" },
] as const;

export function MenuPainel() {
  const caminho = usePathname();
  return (
    <nav className="painel-menu" aria-label="Seções do painel">
      {ITENS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={caminho.startsWith(item.href) ? "ativo" : undefined}
          aria-current={caminho.startsWith(item.href) ? "page" : undefined}
        >
          {item.rotulo}
        </Link>
      ))}
    </nav>
  );
}
