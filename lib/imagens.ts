import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET_IMAGENS = "produtos";
export const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"];
export const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;

// Caminho do arquivo dentro do bucket, ou null para imagens de fora (URL externa ou /images/…)
export function caminhoNoBucket(url: string | null): string | null {
  const marcador = `/storage/v1/object/public/${BUCKET_IMAGENS}/`;
  const posicao = url?.indexOf(marcador) ?? -1;
  return url && posicao >= 0 ? decodeURIComponent(url.slice(posicao + marcador.length)) : null;
}

export function extensaoDoTipo(tipo: string): string {
  return tipo.split("/")[1].replace("jpeg", "jpg");
}

// Baixa uma imagem de outro site (ex.: foto da Amazon) e guarda no bucket; devolve a URL pública
export async function copiarImagemExterna(
  supabase: SupabaseClient,
  url: string,
): Promise<{ url: string } | { erro: string }> {
  let resposta: Response;
  try {
    resposta = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    return { erro: "Não foi possível baixar a imagem do link. Envie o arquivo manualmente." };
  }
  if (!resposta.ok) return { erro: "O link da imagem não respondeu. Envie o arquivo manualmente." };

  const tipo = (resposta.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!TIPOS_IMAGEM.includes(tipo)) return { erro: "A imagem do link não é JPG, PNG ou WEBP. Envie outro arquivo." };

  const dados = await resposta.arrayBuffer();
  if (dados.byteLength > TAMANHO_MAXIMO_IMAGEM) return { erro: "A imagem do link tem mais de 5 MB." };

  const caminho = `${crypto.randomUUID()}.${extensaoDoTipo(tipo)}`;
  const { error } = await supabase.storage.from(BUCKET_IMAGENS).upload(caminho, dados, { contentType: tipo });
  if (error) return { erro: `Não foi possível guardar a imagem: ${error.message}` };

  return { url: supabase.storage.from(BUCKET_IMAGENS).getPublicUrl(caminho).data.publicUrl };
}
