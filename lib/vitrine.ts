import { cacheLife, cacheTag } from "next/cache";
import { criarClientePublico } from "./supabase/publico";
import type { Categoria, Produto } from "./types";

const CAMPOS_PRODUTO =
  "id, nome, descricao, descricao_longa, imagem_url, preco_de, preco_por, link, loja, destaque, categoria_id, ordem";

// Produtos ativos e categorias da vitrine, revalidados a cada hora (tag "vitrine" para o painel revalidar ao salvar)
export async function buscarVitrine(): Promise<{ produtos: Produto[]; categorias: Categoria[] }> {
  "use cache";
  cacheLife("hours");
  cacheTag("vitrine");

  const supabase = criarClientePublico();
  const [produtos, categorias] = await Promise.all([
    supabase.from("produtos").select(CAMPOS_PRODUTO).eq("ativo", true).order("ordem").order("created_at"),
    supabase.from("categorias").select("id, nome, slug, ordem").order("ordem"),
  ]);

  if (produtos.error) throw new Error(`Erro ao buscar produtos: ${produtos.error.message}`);
  if (categorias.error) throw new Error(`Erro ao buscar categorias: ${categorias.error.message}`);

  return {
    produtos: produtos.data.map((p) => ({
      ...p,
      preco_por: Number(p.preco_por),
      preco_de: p.preco_de === null ? null : Number(p.preco_de),
    })) as Produto[],
    categorias: categorias.data as Categoria[],
  };
}
