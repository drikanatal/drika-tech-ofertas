import { Suspense } from "react";
import { exigirAdmin, listarUsuarios } from "@/lib/painel";
import { GerenciarUsuarios } from "./GerenciarUsuarios";

export default function PaginaUsuarios() {
  return (
    <>
      <div className="painel-cabecalho">
        <h1>E-mails autorizados</h1>
      </div>
      <p className="painel-dica">Quem está nesta lista entra no painel com &quot;Entrar com Google&quot;.</p>
      <Suspense fallback={<p className="painel-carregando">Carregando e-mails…</p>}>
        <Lista />
      </Suspense>
    </>
  );
}

async function Lista() {
  const [{ email }, usuarios] = await Promise.all([exigirAdmin(), listarUsuarios()]);
  return <GerenciarUsuarios usuarios={usuarios} emailLogado={email} />;
}
