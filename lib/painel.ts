import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { DESTINO_SEM_ACESSO } from "./auth";
import { criarClienteServidor } from "./supabase/servidor";
import type { Categoria, ProdutoPainel, UsuarioAutorizado } from "./types";

// Camada de acesso do painel: toda leitura e Server Action passa por exigirAdmin(),
// que confere a sessão e a role no próprio servidor (sem confiar no navegador).
// "sem-sessao" e "sem-acesso" deixam cada chamador decidir a resposta (redirect na página, 401/403 na API)
export const lerAdmin = cache(async () => {
  // A sessão é sempre por requisição: o Supabase consulta o relógio para validar o token,
  // então o pré-render precisa parar aqui (senão o Next acusa Date.now() no pré-render)
  await connection();
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return "sem-sessao" as const;

  const { data: perfil } = await supabase
    .from("usuarios_autorizados")
    .select("email, nome, role")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  if (!perfil || perfil.role !== "admin") return "sem-acesso" as const;

  return { supabase, email: perfil.email as string, nome: (perfil.nome as string | null) ?? "Drika" };
});

export async function exigirAdmin() {
  const admin = await lerAdmin();
  if (admin === "sem-sessao") redirect("/dt-studio");
  if (admin === "sem-acesso") redirect(DESTINO_SEM_ACESSO);
  return admin;
}

const CAMPOS_PRODUTO =
  "id, nome, descricao, descricao_longa, imagem_url, preco_de, preco_por, link, loja, destaque, ativo, categoria_id, ordem";

function normalizarProduto(p: Record<string, unknown>): ProdutoPainel {
  return {
    ...(p as ProdutoPainel),
    preco_por: Number(p.preco_por),
    preco_de: p.preco_de === null ? null : Number(p.preco_de),
  };
}

export async function listarProdutos(): Promise<ProdutoPainel[]> {
  const { supabase } = await exigirAdmin();
  const { data, error } = await supabase.from("produtos").select(CAMPOS_PRODUTO).order("ordem").order("created_at");
  if (error) throw new Error(`Erro ao listar produtos: ${error.message}`);
  return data.map(normalizarProduto);
}

export async function buscarProduto(id: string): Promise<ProdutoPainel | null> {
  const { supabase } = await exigirAdmin();
  const { data, error } = await supabase.from("produtos").select(CAMPOS_PRODUTO).eq("id", id).maybeSingle();
  if (error) throw new Error(`Erro ao buscar produto: ${error.message}`);
  return data ? normalizarProduto(data) : null;
}

export async function listarCategorias(): Promise<Categoria[]> {
  const { supabase } = await exigirAdmin();
  const { data, error } = await supabase.from("categorias").select("id, nome, slug, ordem").order("ordem").order("nome");
  if (error) throw new Error(`Erro ao listar categorias: ${error.message}`);
  return data;
}

export async function listarUsuarios(): Promise<UsuarioAutorizado[]> {
  const { supabase } = await exigirAdmin();
  const { data, error } = await supabase
    .from("usuarios_autorizados")
    .select("email, nome, role, created_at")
    .order("created_at");
  if (error) throw new Error(`Erro ao listar e-mails: ${error.message}`);
  return data as UsuarioAutorizado[];
}
