"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useFavoritos } from "@/lib/favoritos";
import { normalizar } from "@/lib/format";
import type { Categoria, Loja, Produto } from "@/lib/types";
import { FeaturedCard, ProductCard } from "./Cards";
import { Header } from "./Header";

type FiltroLoja = Loja | "all";

const PILULAS: { valor: FiltroLoja; rotulo: string }[] = [
  { valor: "all", rotulo: "Todas" },
  { valor: "amazon", rotulo: "🟠 Amazon" },
  { valor: "shopee", rotulo: "🔴 Shopee" },
  { valor: "ml", rotulo: "🔵 Mercado Livre" },
];

type Props = {
  produtos: Produto[];
  categorias: Categoria[];
  hero: ReactNode;
  rodape: ReactNode;
};

export function Vitrine({ produtos, categorias, hero, rodape }: Props) {
  const [loja, setLoja] = useState<FiltroLoja>("all");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [painelAberto, setPainelAberto] = useState(false);
  const favoritos = useFavoritos();

  // Só aparecem as categorias que têm produto ativo; sem nenhuma, a barra mostra apenas "Todos"
  const categoriasVisiveis = useMemo(
    () => categorias.filter((c) => produtos.some((p) => p.categoria_id === c.id)),
    [categorias, produtos],
  );

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return produtos.filter(
      (p) =>
        (loja === "all" || p.loja === loja) &&
        (categoria === null || p.categoria_id === categoria) &&
        (termo === "" || normalizar(`${p.nome} ${p.descricao ?? ""}`).includes(termo)),
    );
  }, [produtos, loja, categoria, busca]);

  const destaques = filtrados.filter((p) => p.destaque);
  const demais = filtrados.filter((p) => !p.destaque);
  // Favoritos de produtos desativados somem porque só os produtos ativos chegam aqui
  const listaFavoritos = produtos.filter((p) => favoritos.ids.has(p.id));

  function alternarDetalhes(id: string) {
    setExpandidos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  function propsDetalhes(p: Produto) {
    return {
      produto: p,
      expandido: expandidos.has(p.id),
      onAlternarDetalhes: () => alternarDetalhes(p.id),
    };
  }

  function propsCard(p: Produto) {
    return {
      ...propsDetalhes(p),
      favorito: favoritos.ids.has(p.id),
      onAlternarFavorito: () => favoritos.alternar(p.id),
    };
  }

  useEffect(() => {
    if (!painelAberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setPainelAberto(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [painelAberto]);

  return (
    <>
      <Header
        busca={busca}
        onBusca={setBusca}
        totalFavoritos={listaFavoritos.length}
        onAbrirFavoritos={() => setPainelAberto(true)}
      />

      {hero}

      <div className="store-bar">
        <div className="store-inner">
          <span className="store-label">Loja</span>
          {PILULAS.map((pilula) => (
            <button
              key={pilula.valor}
              type="button"
              className={`store-pill${loja === pilula.valor ? " active" : ""}`}
              data-store={pilula.valor}
              onClick={() => setLoja(pilula.valor)}
            >
              {pilula.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="cat-bar">
        <div className="cat-inner">
          <div className={`cat-tab${categoria === null ? " active" : ""}`} onClick={() => setCategoria(null)}>
            Todos
          </div>
          {categoriasVisiveis.map((c) => (
            <div
              key={c.id}
              className={`cat-tab${categoria === c.id ? " active" : ""}`}
              onClick={() => setCategoria(c.id)}
            >
              {c.nome}
            </div>
          ))}
        </div>
      </div>

      <main className="main">
        {destaques.length > 0 && (
          <div className="featured-section">
            <div className="sec-heading">⚡ Destaques do Dia</div>
            <div className="featured-grid">
              {destaques.map((p) => (
                <FeaturedCard key={p.id} {...propsCard(p)} />
              ))}
            </div>
          </div>
        )}

        <div className="sec-heading">🛍️ Todas as Ofertas</div>
        {busca.trim() !== "" && filtrados.length === 0 ? (
          <p className="sem-resultados">Nenhum produto encontrado</p>
        ) : (
          <div className="product-grid" id="grid">
            {demais.map((p) => (
              <ProductCard key={p.id} {...propsCard(p)} />
            ))}
          </div>
        )}
      </main>

      {rodape}

      <div className="fav-camada">
        <div
          className={`fav-backdrop${painelAberto ? " aberto" : ""}`}
          onClick={() => setPainelAberto(false)}
          aria-hidden="true"
        />
        <aside
          className={`fav-painel${painelAberto ? " aberto" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Meus favoritos"
          aria-hidden={!painelAberto}
          inert={!painelAberto}
        >
          <div className="fav-painel-topo">
            <div className="sec-heading">🤍 Meus favoritos</div>
            <button
              type="button"
              className="fav-fechar"
              aria-label="Fechar favoritos"
              onClick={() => setPainelAberto(false)}
            >
              ×
            </button>
          </div>
          {listaFavoritos.length === 0 ? (
            <p className="fav-vazio">
              Você ainda não favoritou nenhum produto. Toque no ♡ de um card para salvar aqui.
            </p>
          ) : (
            <div className="product-grid fav-grid">
              {listaFavoritos.map((p) => (
                <ProductCard key={p.id} {...propsCard(p)} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
