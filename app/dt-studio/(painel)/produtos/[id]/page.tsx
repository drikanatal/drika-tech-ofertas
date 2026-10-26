import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buscarProduto, listarCategorias } from "@/lib/painel";
import { FormularioProduto } from "../FormularioProduto";

export default function EditarProduto({ params }: PageProps<"/dt-studio/produtos/[id]">) {
  return (
    <>
      <div className="painel-cabecalho">
        <h1>Editar produto</h1>
      </div>
      <Suspense fallback={<p className="painel-carregando">Carregando…</p>}>
        <Formulario params={params} />
      </Suspense>
    </>
  );
}

async function Formulario({ params }: Pick<PageProps<"/dt-studio/produtos/[id]">, "params">) {
  const { id } = await params;
  const [produto, categorias] = await Promise.all([buscarProduto(id), listarCategorias()]);
  if (!produto) notFound();
  return <FormularioProduto produto={produto} categorias={categorias} />;
}
