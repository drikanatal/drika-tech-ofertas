import { Suspense } from "react";
import { listarCategorias, listarProdutos } from "@/lib/painel";
import { GerenciarCategorias } from "./GerenciarCategorias";

export default function PaginaCategorias() {
  return (
    <>
      <div className="painel-cabecalho">
        <h1>Categorias</h1>
      </div>
      <p className="painel-dica">
        Na vitrine, a barra de categorias mostra &quot;Todos&quot; e só as categorias que têm produto ativo.
      </p>
      <Suspense fallback={<p className="painel-carregando">Carregando categorias…</p>}>
        <Lista />
      </Suspense>
    </>
  );
}

async function Lista() {
  const [categorias, produtos] = await Promise.all([listarCategorias(), listarProdutos()]);
  const uso = new Map<string, number>();
  produtos.forEach((p) => p.categoria_id && uso.set(p.categoria_id, (uso.get(p.categoria_id) ?? 0) + 1));
  return <GerenciarCategorias categorias={categorias} produtosPorCategoria={Object.fromEntries(uso)} />;
}
