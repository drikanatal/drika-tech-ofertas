"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { BUCKET_IMAGENS, caminhoNoBucket, copiarImagemExterna } from "@/lib/imagens";
import { exigirAdmin } from "@/lib/painel";
import { LOJAS_VALIDAS, ehUrl, gerarSlug, lerPreco, texto } from "@/lib/validacao";
import type { Loja } from "@/lib/types";

export type EstadoFormulario = { erros?: Record<string, string>; mensagem?: string };

// A vitrine guarda os dados por 1h com a tag "vitrine"; toda alteração do painel a renova na hora
function atualizarVitrine() {
  updateTag("vitrine");
}

export async function sair() {
  const { supabase } = await exigirAdmin();
  await supabase.auth.signOut();
  redirect("/dt-studio");
}

// ── Produtos ──

export async function salvarProduto(_anterior: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const { supabase } = await exigirAdmin();
  const id = texto(form.get("id"));
  const erros: Record<string, string> = {};

  const nome = texto(form.get("nome"));
  const link = texto(form.get("link"));
  const loja = texto(form.get("loja")) as Loja;
  const imagem = texto(form.get("imagem_url"));
  const precoPor = lerPreco(form.get("preco_por"));
  const precoDe = lerPreco(form.get("preco_de"));
  const ordem = Number(texto(form.get("ordem")) || "0");

  if (!nome) erros.nome = "Informe o nome do produto.";
  if (!ehUrl(link)) erros.link = "Informe o link completo da loja (começando com https://).";
  if (!LOJAS_VALIDAS.includes(loja)) erros.loja = "Escolha a loja.";
  if (imagem && !ehUrl(imagem) && !imagem.startsWith("/")) erros.imagem_url = "Informe uma URL de imagem válida.";
  if (precoPor === null || Number.isNaN(precoPor)) erros.preco_por = "Informe o preço promocional (ex.: 129,90).";
  if (Number.isNaN(precoDe)) erros.preco_de = "Preço inválido (ex.: 199,90).";
  else if (precoDe !== null && precoPor !== null && precoDe <= precoPor)
    erros.preco_de = "O preço original deve ser maior que o promocional.";
  if (!Number.isInteger(ordem)) erros.ordem = "A ordem deve ser um número inteiro.";

  if (Object.keys(erros).length > 0) return { erros };

  // Foto de outro site (ex.: extraída da Amazon) é copiada para o Storage, para não depender da loja
  let imagemFinal = imagem || null;
  if (imagemFinal && ehUrl(imagemFinal) && !caminhoNoBucket(imagemFinal)) {
    const copia = await copiarImagemExterna(supabase, imagemFinal);
    if ("erro" in copia) return { erros: { imagem_url: copia.erro } };
    imagemFinal = copia.url;
  }

  // Na edição, guarda a imagem anterior para apagar do Storage se ela foi trocada
  const anterior = id
    ? (await supabase.from("produtos").select("imagem_url").eq("id", id).maybeSingle()).data?.imagem_url ?? null
    : null;

  const dados = {
    nome,
    link,
    loja,
    descricao: texto(form.get("descricao")) || null,
    descricao_longa: texto(form.get("descricao_longa")) || null,
    imagem_url: imagemFinal,
    preco_por: precoPor,
    preco_de: precoDe,
    categoria_id: texto(form.get("categoria_id")) || null,
    destaque: form.get("destaque") === "on",
    ativo: form.get("ativo") === "on",
    ordem,
  };

  const { error } = id
    ? await supabase.from("produtos").update(dados).eq("id", id)
    : await supabase.from("produtos").insert(dados);
  if (error) return { mensagem: `Não foi possível salvar: ${error.message}` };

  const caminhoAnterior = caminhoNoBucket(anterior);
  if (caminhoAnterior && anterior !== imagemFinal) {
    await supabase.storage.from(BUCKET_IMAGENS).remove([caminhoAnterior]);
  }

  atualizarVitrine();
  redirect("/dt-studio/produtos");
}

export async function alternarProduto(id: string, campo: "destaque" | "ativo", valor: boolean) {
  const { supabase } = await exigirAdmin();
  const { error } = await supabase
    .from("produtos")
    .update({ [campo]: valor })
    .eq("id", id);
  if (error) throw new Error(`Não foi possível atualizar: ${error.message}`);
  atualizarVitrine();
  refresh();
}

export async function excluirProduto(id: string) {
  const { supabase } = await exigirAdmin();
  const { data: produto } = await supabase.from("produtos").select("imagem_url").eq("id", id).maybeSingle();

  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) throw new Error(`Não foi possível excluir: ${error.message}`);

  // Imagem enviada pelo painel não serve para mais nada: sai do Storage junto com o produto
  const caminho = caminhoNoBucket(produto?.imagem_url ?? null);
  if (caminho) await supabase.storage.from(BUCKET_IMAGENS).remove([caminho]);

  atualizarVitrine();
  refresh();
}

// ── Categorias ──

export async function salvarCategoria(_anterior: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const { supabase } = await exigirAdmin();
  const id = texto(form.get("id"));
  const nome = texto(form.get("nome"));
  const ordem = Number(texto(form.get("ordem")) || "0");

  if (!nome) return { erros: { nome: "Informe o nome da categoria." } };
  if (!Number.isInteger(ordem)) return { erros: { ordem: "A ordem deve ser um número inteiro." } };

  const dados = { nome, slug: gerarSlug(nome), ordem };
  const { error } = id
    ? await supabase.from("categorias").update(dados).eq("id", id)
    : await supabase.from("categorias").insert(dados);
  if (error) {
    const duplicada = error.code === "23505";
    return { mensagem: duplicada ? "Já existe uma categoria com esse nome." : `Não foi possível salvar: ${error.message}` };
  }

  atualizarVitrine();
  refresh();
  return { mensagem: id ? "Categoria atualizada." : "Categoria criada." };
}

export async function excluirCategoria(id: string) {
  const { supabase } = await exigirAdmin();
  // Produtos da categoria ficam sem categoria (on delete set null)
  const { error } = await supabase.from("categorias").delete().eq("id", id);
  if (error) throw new Error(`Não foi possível excluir: ${error.message}`);
  atualizarVitrine();
  refresh();
}

// ── E-mails autorizados ──

export async function adicionarUsuario(_anterior: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const { supabase } = await exigirAdmin();
  const email = texto(form.get("email")).toLowerCase();
  const nome = texto(form.get("nome")) || null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erros: { email: "Informe um e-mail válido." } };

  // Por enquanto todo e-mail entra como admin (decisão da Drika: perfil viewer sem uso)
  const { error } = await supabase.from("usuarios_autorizados").insert({ email, nome, role: "admin" });
  if (error) {
    const duplicado = error.code === "23505";
    return { mensagem: duplicado ? "Esse e-mail já está autorizado." : `Não foi possível adicionar: ${error.message}` };
  }

  refresh();
  return { mensagem: "E-mail autorizado." };
}

export async function removerUsuario(email: string) {
  const { supabase, email: emailLogado } = await exigirAdmin();
  if (email.toLowerCase() === emailLogado) throw new Error("Você não pode remover o seu próprio e-mail.");
  const { error } = await supabase.from("usuarios_autorizados").delete().eq("email", email.toLowerCase());
  if (error) throw new Error(`Não foi possível remover: ${error.message}`);
  refresh();
}
