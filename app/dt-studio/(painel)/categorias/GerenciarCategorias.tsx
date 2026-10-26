"use client";

import { useActionState, useState, useTransition } from "react";
import type { Categoria } from "@/lib/types";
import { gerarSlug } from "@/lib/validacao";
import { excluirCategoria, salvarCategoria, type EstadoFormulario } from "../acoes";

type Props = { categorias: Categoria[]; produtosPorCategoria: Record<string, number> };

export function GerenciarCategorias({ categorias, produtosPorCategoria }: Props) {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function excluir(c: Categoria) {
    const qtd = produtosPorCategoria[c.id] ?? 0;
    const aviso = qtd > 0 ? ` ${qtd} produto(s) ficarão sem categoria.` : "";
    if (!window.confirm(`Excluir a categoria "${c.nome}"?${aviso}`)) return;
    setErro(null);
    iniciar(async () => {
      try {
        await excluirCategoria(c.id);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Algo deu errado.");
      }
    });
  }

  return (
    <div className={pendente ? "pendente" : undefined}>
      <FormCategoria titulo="Nova categoria" />
      {erro && <p className="painel-alerta erro">{erro}</p>}
      {categorias.length === 0 ? (
        <p className="painel-vazio">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="painel-lista">
          {categorias.map((c) => (
            <FormCategoria key={c.id} categoria={c} produtos={produtosPorCategoria[c.id] ?? 0} onExcluir={() => excluir(c)} />
          ))}
        </div>
      )}
    </div>
  );
}

type PropsForm = { categoria?: Categoria; titulo?: string; produtos?: number; onExcluir?: () => void };

// Mesmo formulário para criar (sem categoria) e editar (com categoria)
function FormCategoria({ categoria, titulo, produtos, onExcluir }: PropsForm) {
  const [estado, enviar, salvando] = useActionState<EstadoFormulario, FormData>(salvarCategoria, {});
  const [nome, setNome] = useState(categoria?.nome ?? "");
  const erros = estado.erros ?? {};

  return (
    // O React limpa o formulário após salvar; onReset mantém a prévia do slug em sincronia
    <form action={enviar} onReset={() => setNome(categoria?.nome ?? "")} className="painel-cartao painel-linha-form">
      {titulo && <p className="painel-rotulo">{titulo}</p>}
      {categoria && <input type="hidden" name="id" value={categoria.id} />}
      <label className="painel-campo">
        <span className="painel-rotulo">Nome</span>
        <input name="nome" defaultValue={categoria?.nome ?? ""} onChange={(e) => setNome(e.target.value)} />
        {erros.nome ? (
          <span className="painel-erro">{erros.nome}</span>
        ) : (
          <span className="painel-dica">slug: {gerarSlug(nome) || "—"}</span>
        )}
      </label>
      <label className="painel-campo curto">
        <span className="painel-rotulo">Ordem</span>
        <input name="ordem" type="number" step={1} defaultValue={categoria?.ordem ?? 0} />
        {erros.ordem && <span className="painel-erro">{erros.ordem}</span>}
      </label>
      <div className="painel-linha">
        <button type="submit" className="painel-botao" disabled={salvando}>
          {salvando ? "Salvando…" : categoria ? "Salvar" : "Adicionar"}
        </button>
        {onExcluir && (
          <button type="button" className="painel-link perigo" onClick={onExcluir}>
            Excluir
          </button>
        )}
      </div>
      {categoria && <span className="painel-dica">{produtos} produto(s)</span>}
      {estado.mensagem && <span className="painel-dica">{estado.mensagem}</span>}
    </form>
  );
}
