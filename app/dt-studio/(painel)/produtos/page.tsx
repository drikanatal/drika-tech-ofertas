import Link from "next/link";
import { Suspense } from "react";
import { listarCategorias, listarProdutos } from "@/lib/painel";
import { TabelaProdutos } from "./TabelaProdutos";

export default function PaginaProdutos() {
  return (
    <>
      <div className="painel-cabecalho">
        <h1>Produtos</h1>
        <Link href="/dt-studio/produtos/novo" className="painel-botao">
          + Novo produto
        </Link>
      </div>
      <Suspense fallback={<p className="painel-carregando">Carregando produtos…</p>}>
        <ListaProdutos />
      </Suspense>
    </>
  );
}

async function ListaProdutos() {
  const [produtos, categorias] = await Promise.all([listarProdutos(), listarCategorias()]);
  return <TabelaProdutos produtos={produtos} categorias={categorias} />;
}
