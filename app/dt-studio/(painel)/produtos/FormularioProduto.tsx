"use client";

import Link from "next/link";
import { useActionState, useState, type ChangeEvent } from "react";
import { FeaturedCard, ProductCard } from "@/components/Cards";
import type { ResultadoExtracao } from "@/lib/extracao";
import { BUCKET_IMAGENS, TAMANHO_MAXIMO_IMAGEM, TIPOS_IMAGEM, extensaoDoTipo } from "@/lib/imagens";
import { LOJAS } from "@/lib/lojas";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import type { Categoria, Loja, Produto, ProdutoPainel } from "@/lib/types";
import { lerPreco } from "@/lib/validacao";
import { salvarProduto, type EstadoFormulario } from "../acoes";

const textoPreco = (v: number | null | undefined) => (v == null ? "" : v.toFixed(2).replace(".", ","));

type Props = { produto?: ProdutoPainel; categorias: Categoria[] };

// Valores do formulário como texto, para os campos de preço aceitarem "129,90"
function valoresIniciais(p?: ProdutoPainel) {
  const preco = textoPreco;
  return {
    link: p?.link ?? "",
    nome: p?.nome ?? "",
    descricao: p?.descricao ?? "",
    descricao_longa: p?.descricao_longa ?? "",
    imagem_url: p?.imagem_url ?? "",
    preco_de: preco(p?.preco_de),
    preco_por: preco(p?.preco_por),
    loja: (p?.loja ?? "amazon") as Loja,
    categoria_id: p?.categoria_id ?? "",
    destaque: p?.destaque ?? false,
    ativo: p?.ativo ?? true,
    ordem: String(p?.ordem ?? 0),
  };
}

export function FormularioProduto({ produto, categorias }: Props) {
  const [campos, setCampos] = useState(() => valoresIniciais(produto));
  const [estado, enviar, salvando] = useActionState<EstadoFormulario, FormData>(salvarProduto, {});
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState<string | null>(null);
  const [detalhesPrevia, setDetalhesPrevia] = useState(false);
  const [extraindo, setExtraindo] = useState(false);
  const [extracao, setExtracao] = useState<{ tipo: "ok" | "aviso"; texto: string } | null>(null);

  // Busca os dados pelo link e substitui os campos do formulário (nada é salvo até clicar em Salvar)
  async function extrairDados() {
    setExtraindo(true);
    setExtracao(null);
    let resultado: Partial<ResultadoExtracao>;
    try {
      const resposta = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: campos.link }),
      });
      resultado = await resposta.json();
    } catch {
      resultado = { sucesso: false, erro: "Não foi possível consultar a loja agora." };
    }
    setExtraindo(false);

    if (resultado.nome) {
      setCampos((atual) => ({
        ...atual,
        nome: resultado.nome ?? "",
        descricao: resultado.descricao ?? "",
        imagem_url: resultado.imagem_url ?? "",
        preco_por: textoPreco(resultado.preco_por),
        preco_de: textoPreco(resultado.preco_de),
        loja: resultado.loja ?? atual.loja,
      }));
    } else if (resultado.loja) {
      setCampos((atual) => ({ ...atual, loja: resultado.loja! }));
    }

    setExtracao(
      resultado.sucesso
        ? { tipo: "ok", texto: "Dados preenchidos. Confira e ajuste antes de salvar." }
        : { tipo: "aviso", texto: `${resultado.erro ?? "Não foi possível extrair os dados"}. Preencha os campos manualmente.` },
    );
  }

  const erros = estado.erros ?? {};
  const alterar = (campo: keyof typeof campos) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setCampos((atual) => ({ ...atual, [campo]: e.target.value }));
  const marcar = (campo: "destaque" | "ativo") => (e: ChangeEvent<HTMLInputElement>) =>
    setCampos((atual) => ({ ...atual, [campo]: e.target.checked }));

  async function enviarImagem(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setErroImagem(null);
    if (!TIPOS_IMAGEM.includes(arquivo.type)) return setErroImagem("Use uma imagem JPG, PNG ou WEBP.");
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) return setErroImagem("A imagem deve ter no máximo 5 MB.");

    setEnviandoImagem(true);
    const caminho = `${crypto.randomUUID()}.${extensaoDoTipo(arquivo.type)}`;
    const supabase = criarClienteNavegador();
    const { error } = await supabase.storage.from(BUCKET_IMAGENS).upload(caminho, arquivo, { contentType: arquivo.type });
    setEnviandoImagem(false);
    if (error) return setErroImagem(`Não foi possível enviar a imagem: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET_IMAGENS).getPublicUrl(caminho);
    setCampos((atual) => ({ ...atual, imagem_url: data.publicUrl }));
  }

  // Produto montado a partir do formulário, para a pré-visualização
  const precoPor = lerPreco(campos.preco_por);
  const precoDe = lerPreco(campos.preco_de);
  const previa: Produto = {
    id: produto?.id ?? "previa",
    nome: campos.nome || "Nome do produto",
    descricao: campos.descricao || null,
    descricao_longa: campos.descricao_longa || null,
    imagem_url: campos.imagem_url || null,
    preco_por: precoPor && !Number.isNaN(precoPor) ? precoPor : 0,
    preco_de: precoDe && !Number.isNaN(precoDe) ? precoDe : null,
    link: campos.link || "#",
    loja: campos.loja,
    destaque: campos.destaque,
    categoria_id: campos.categoria_id || null,
    ordem: Number(campos.ordem) || 0,
  };
  const propsPrevia = {
    produto: previa,
    expandido: detalhesPrevia,
    onAlternarDetalhes: () => setDetalhesPrevia((v) => !v),
    favorito: false,
    onAlternarFavorito: () => {},
  };

  return (
    <div className="painel-form-grade">
      <form action={enviar} className="painel-form" noValidate>
        {produto && <input type="hidden" name="id" value={produto.id} />}

        <Campo rotulo="Link da loja" erro={erros.link} dica="Cole o link e clique em Extrair dados para preencher os campos.">
          <div className="painel-linha">
            <input name="link" type="url" placeholder="https://…" value={campos.link} onChange={alterar("link")} />
            <button
              type="button"
              className="painel-botao secundario"
              onClick={extrairDados}
              disabled={extraindo || !campos.link.trim()}
            >
              {extraindo && <span className="spinner" aria-hidden="true" />}
              {extraindo ? "Extraindo…" : "Extrair dados"}
            </button>
          </div>
        </Campo>
        {extracao && (
          <p className={`painel-alerta ${extracao.tipo}`} role="status">
            {extracao.texto}
          </p>
        )}

        <Campo rotulo="Nome" erro={erros.nome}>
          <input name="nome" value={campos.nome} onChange={alterar("nome")} />
        </Campo>

        <Campo rotulo="Descrição curta" dica="Linha cinza que aparece no card.">
          <input name="descricao" value={campos.descricao} onChange={alterar("descricao")} />
        </Campo>

        <Campo rotulo="Descrição longa" dica='Opcional. Aparece ao clicar no "+" do card.'>
          <textarea name="descricao_longa" rows={4} value={campos.descricao_longa} onChange={alterar("descricao_longa")} />
        </Campo>

        <Campo rotulo="Imagem" erro={erros.imagem_url ?? erroImagem ?? undefined} dica="Envie um arquivo (JPG, PNG ou WEBP, até 5 MB) ou cole uma URL.">
          <div className="painel-linha">
            <input name="imagem_url" placeholder="https://… ou /images/…" value={campos.imagem_url} onChange={alterar("imagem_url")} />
            <label className={`painel-botao secundario${enviandoImagem ? " desativado" : ""}`}>
              {enviandoImagem ? "Enviando…" : "Enviar arquivo"}
              <input type="file" accept={TIPOS_IMAGEM.join(",")} onChange={enviarImagem} disabled={enviandoImagem} hidden />
            </label>
          </div>
        </Campo>

        <div className="painel-colunas">
          <Campo rotulo="Preço de (original)" erro={erros.preco_de} dica="Opcional. Ex.: 199,90">
            <input name="preco_de" inputMode="decimal" value={campos.preco_de} onChange={alterar("preco_de")} />
          </Campo>
          <Campo rotulo="Preço por (promocional)" erro={erros.preco_por} dica="Ex.: 129,90">
            <input name="preco_por" inputMode="decimal" value={campos.preco_por} onChange={alterar("preco_por")} />
          </Campo>
        </div>

        <div className="painel-colunas">
          <Campo rotulo="Loja" erro={erros.loja}>
            <select name="loja" value={campos.loja} onChange={alterar("loja")}>
              {(Object.keys(LOJAS) as Loja[]).map((l) => (
                <option key={l} value={l}>
                  {LOJAS[l].nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Categoria">
            <select name="categoria_id" value={campos.categoria_id} onChange={alterar("categoria_id")}>
              <option value="">Sem categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Ordem" erro={erros.ordem} dica="Menor aparece primeiro.">
            <input name="ordem" type="number" step={1} value={campos.ordem} onChange={alterar("ordem")} />
          </Campo>
        </div>

        <div className="painel-checks">
          <label>
            <input type="checkbox" name="destaque" checked={campos.destaque} onChange={marcar("destaque")} /> Destaque do dia
          </label>
          <label>
            <input type="checkbox" name="ativo" checked={campos.ativo} onChange={marcar("ativo")} /> Ativo (visível na vitrine)
          </label>
        </div>

        {estado.mensagem && <p className="painel-alerta erro">{estado.mensagem}</p>}
        {Object.keys(erros).length > 0 && <p className="painel-alerta erro">Confira os campos destacados.</p>}

        <div className="painel-linha">
          <button type="submit" className="painel-botao" disabled={salvando || enviandoImagem}>
            {salvando ? "Salvando…" : "Salvar"}
          </button>
          <Link href="/dt-studio/produtos" className="painel-botao secundario">
            Cancelar
          </Link>
        </div>
      </form>

      <aside className="painel-previa" aria-label="Pré-visualização">
        <p className="painel-previa-titulo">Pré-visualização {campos.destaque ? "(Destaques do Dia)" : "(Todas as Ofertas)"}</p>
        <div className={campos.destaque ? "painel-previa-destaque" : "painel-previa-card"}>
          {campos.destaque ? <FeaturedCard {...propsPrevia} /> : <ProductCard {...propsPrevia} />}
        </div>
        {!campos.ativo && <p className="painel-dica">Produto inativo: não aparece na vitrine.</p>}
      </aside>
    </div>
  );
}

function Campo({ rotulo, erro, dica, children }: { rotulo: string; erro?: string; dica?: string; children: React.ReactNode }) {
  return (
    <div className={`painel-campo${erro ? " com-erro" : ""}`}>
      <span className="painel-rotulo">{rotulo}</span>
      {children}
      {erro ? <span className="painel-erro">{erro}</span> : dica && <span className="painel-dica">{dica}</span>}
    </div>
  );
}
