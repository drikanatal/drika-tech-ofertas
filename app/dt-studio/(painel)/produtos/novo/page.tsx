import { Suspense } from "react";
import { listarCategorias } from "@/lib/painel";
import { FormularioProduto } from "../FormularioProduto";

export default function NovoProduto() {
  return (
    <>
      <div className="painel-cabecalho">
        <h1>Novo produto</h1>
      </div>
      <Suspense fallback={<p className="painel-carregando">Carregando…</p>}>
        <Formulario />
      </Suspense>
    </>
  );
}

async function Formulario() {
  const categorias = await listarCategorias();
  return <FormularioProduto categorias={categorias} />;
}
