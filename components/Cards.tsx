/* eslint-disable @next/next/no-img-element -- otimização com next/image fica para o Prompt 5 */
import type { MouseEvent } from "react";
import { calcularDesconto, formatarPreco } from "@/lib/format";
import { LOJAS } from "@/lib/lojas";
import type { Produto } from "@/lib/types";

// Botões dentro do card não podem abrir o link da loja
function semNavegar(acao: () => void) {
  return (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    acao();
  };
}

type PropsDetalhes = {
  produto: Produto;
  expandido: boolean;
  onAlternarDetalhes: () => void;
};

// "+" só aparece quando há descrição longa; expande o próprio card
function Detalhes({ produto, expandido, onAlternarDetalhes }: PropsDetalhes) {
  if (!produto.descricao_longa) return null;
  return (
    <>
      <button
        type="button"
        className="card-mais"
        aria-expanded={expandido}
        aria-label={expandido ? "Ocultar detalhes" : "Ver mais detalhes"}
        onClick={semNavegar(onAlternarDetalhes)}
      >
        {expandido ? "−" : "+"}
      </button>
      {expandido && <div className="card-desc-longa">{produto.descricao_longa}</div>}
    </>
  );
}

type PropsCard = PropsDetalhes & {
  favorito: boolean;
  onAlternarFavorito: () => void;
};

function BotaoFavorito({ favorito, onAlternarFavorito }: Pick<PropsCard, "favorito" | "onAlternarFavorito">) {
  return (
    <button
      type="button"
      className={`card-heart${favorito ? " ativo" : ""}`}
      aria-pressed={favorito}
      aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={semNavegar(onAlternarFavorito)}
    >
      {favorito ? "♥" : "♡"}
    </button>
  );
}

export function ProductCard({ produto, favorito, onAlternarFavorito, ...detalhes }: PropsCard) {
  const loja = LOJAS[produto.loja];
  const desconto = calcularDesconto(produto.preco_de, produto.preco_por);

  return (
    <a
      href={produto.link}
      className={`product-card${detalhes.expandido ? " expandido" : ""}`}
      data-store={produto.loja}
      target="_blank"
      rel="noopener sponsored"
    >
      <div className="card-img-wrap">
        {produto.imagem_url && <img src={produto.imagem_url} alt={produto.nome} />}
        <BotaoFavorito favorito={favorito} onAlternarFavorito={onAlternarFavorito} />
      </div>
      <div className="card-body">
        <div className="card-name">{produto.nome}</div>
        {produto.descricao && <div className="card-desc">{produto.descricao}</div>}
        <Detalhes produto={produto} {...detalhes} />
        <div className="card-price">
          <div className="price-row">
            <span className="price-main">{formatarPreco(produto.preco_por)}</span>
            {desconto !== null && <span className="price-old-sm">{formatarPreco(produto.preco_de!)}</span>}
          </div>
          {desconto !== null && <span className="discount-badge">−{desconto}%</span>}
        </div>
        <div className="card-store-logo">
          <div className="brand-logo">
            <img src={loja.logo} alt={loja.nome} style={{ height: 28, width: "auto", objectFit: "contain" }} />
          </div>
        </div>
      </div>
      <button type="button" className={`card-cta ${produto.loja}`}>
        {loja.cta}
      </button>
    </a>
  );
}

export function FeaturedCard({ produto, favorito, onAlternarFavorito, ...detalhes }: PropsCard) {
  const loja = LOJAS[produto.loja];
  const desconto = calcularDesconto(produto.preco_de, produto.preco_por);

  return (
    <a
      href={produto.link}
      className={`featured-card${detalhes.expandido ? " expandido" : ""}`}
      data-store={produto.loja}
      target="_blank"
      rel="noopener sponsored"
    >
      <div className={`feat-img ${produto.loja}`}>
        {produto.imagem_url && <img src={produto.imagem_url} alt={produto.nome} />}
        <BotaoFavorito favorito={favorito} onAlternarFavorito={onAlternarFavorito} />
      </div>
      <div className="feat-body">
        <div className={`feat-store ${produto.loja}`}>
          <span className={`feat-dot ${produto.loja}`}></span>
          {loja.nome}
        </div>
        <div className="feat-title">{produto.nome}</div>
        {produto.descricao && <div className="feat-desc">{produto.descricao}</div>}
        <Detalhes produto={produto} {...detalhes} />
        <div className="feat-price-row">
          <span className={`feat-price ${produto.loja}`}>{formatarPreco(produto.preco_por)}</span>
          {desconto !== null && <span className="price-old">{formatarPreco(produto.preco_de!)}</span>}
          {desconto !== null && <span className="discount-badge">−{desconto}%</span>}
        </div>
      </div>
      <button type="button" className={`feat-cta ${produto.loja}`}>
        {loja.cta}
      </button>
    </a>
  );
}
