"use client";

/* eslint-disable @next/next/no-img-element -- miniaturas do painel não precisam de next/image */
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { formatarPreco, normalizar } from "@/lib/format";
import { LOJAS } from "@/lib/lojas";
import type { Categoria, Loja, ProdutoPainel } from "@/lib/types";
import { alternarProduto, excluirProduto } from "../acoes";

type Props = { produtos: ProdutoPainel[]; categorias: Categoria[] };

export function TabelaProdutos({ produtos, categorias }: Props) {
  const [loja, setLoja] = useState<Loja | "">("");
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const nomeCategoria = useMemo(() => new Map(categorias.map((c) => [c.id, c.nome])), [categorias]);

  const visiveis = produtos.filter(
    (p) =>
      (loja === "" || p.loja === loja) &&
      (categoria === "" || (categoria === "sem" ? p.categoria_id === null : p.categoria_id === categoria)) &&
      normalizar(p.nome).includes(normalizar(busca.trim())),
  );

  function executar(acao: () => Promise<void>) {
    setErro(null);
    iniciar(async () => {
      try {
        await acao();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Algo deu errado.");
      }
    });
  }

  function excluir(p: ProdutoPainel) {
    if (window.confirm(`Excluir "${p.nome}"? Essa ação não pode ser desfeita.`)) {
      executar(() => excluirProduto(p.id));
    }
  }

  return (
    <>
      <div className="painel-filtros">
        <input
          type="search"
          placeholder="Buscar por nome…"
          aria-label="Buscar por nome"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select aria-label="Filtrar por loja" value={loja} onChange={(e) => setLoja(e.target.value as Loja | "")}>
          <option value="">Todas as lojas</option>
          {(Object.keys(LOJAS) as Loja[]).map((l) => (
            <option key={l} value={l}>
              {LOJAS[l].nome}
            </option>
          ))}
        </select>
        <select aria-label="Filtrar por categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas as categorias</option>
          <option value="sem">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      {erro && <p className="painel-alerta erro">{erro}</p>}

      <div className={`painel-tabela-wrap${pendente ? " pendente" : ""}`}>
        <table className="painel-tabela">
          <thead>
            <tr>
              <th>Ordem</th>
              <th>Produto</th>
              <th>Loja</th>
              <th>Categoria</th>
              <th>Preço por</th>
              <th>Destaque</th>
              <th>Ativo</th>
              <th aria-label="Ações"></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((p) => (
              <tr key={p.id} className={p.ativo ? undefined : "inativo"}>
                <td className="num">{p.ordem}</td>
                <td>
                  <div className="painel-produto">
                    {p.imagem_url ? <img src={p.imagem_url} alt="" /> : <span className="sem-imagem">—</span>}
                    <span>{p.nome}</span>
                  </div>
                </td>
                <td>
                  <span className={`painel-badge ${p.loja}`}>{LOJAS[p.loja].nome}</span>
                </td>
                <td>{p.categoria_id ? nomeCategoria.get(p.categoria_id) : "—"}</td>
                <td className="num">{formatarPreco(p.preco_por)}</td>
                <td>
                  <Interruptor
                    ligado={p.destaque}
                    rotulo={`Destaque do dia: ${p.nome}`}
                    onAlternar={() => executar(() => alternarProduto(p.id, "destaque", !p.destaque))}
                  />
                </td>
                <td>
                  <Interruptor
                    ligado={p.ativo}
                    rotulo={`Ativo na vitrine: ${p.nome}`}
                    onAlternar={() => executar(() => alternarProduto(p.id, "ativo", !p.ativo))}
                  />
                </td>
                <td>
                  <div className="painel-acoes">
                    <Link href={`/dt-studio/produtos/${p.id}`} className="painel-link">
                      Editar
                    </Link>
                    <button type="button" className="painel-link perigo" onClick={() => excluir(p)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visiveis.length === 0 && <p className="painel-vazio">Nenhum produto encontrado.</p>}
      </div>
      <p className="painel-rodape-tabela">
        {visiveis.length} de {produtos.length} produtos
      </p>
    </>
  );
}

export function Interruptor({ ligado, rotulo, onAlternar }: { ligado: boolean; rotulo: string; onAlternar: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      className={`interruptor${ligado ? " ligado" : ""}`}
      onClick={onAlternar}
    >
      <span />
    </button>
  );
}
