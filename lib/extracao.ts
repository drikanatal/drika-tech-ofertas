import * as cheerio from "cheerio";
import type { Loja } from "./types";
import { lerPreco } from "./validacao";

// Dados sugeridos para o formulário: nada é salvo sem a Drika clicar em Salvar
export type ResultadoExtracao = {
  nome: string | null;
  descricao: string | null;
  imagem_url: string | null;
  preco_de: number | null;
  preco_por: number | null;
  loja: Loja | null;
  link: string | null; // link final, depois dos redirecionamentos
  sucesso: boolean;
  parcial?: boolean;
  erro: string | null;
};

const TEMPO_LIMITE_MS = 10_000;
const NAVEGADOR = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9",
  Accept: "text/html,application/xhtml+xml",
};

function vazio(parcial: Partial<ResultadoExtracao>): ResultadoExtracao {
  return {
    nome: null,
    descricao: null,
    imagem_url: null,
    preco_de: null,
    preco_por: null,
    loja: null,
    link: null,
    sucesso: false,
    erro: null,
    ...parcial,
  };
}

function identificarLoja(url: URL): Loja | null {
  const host = url.hostname.toLowerCase();
  if (host.includes("amazon") || host === "amzn.to" || host === "a.co") return "amazon";
  if (host.includes("shopee") || host === "shp.ee") return "shopee";
  if (host.includes("mercadolivre") || host.includes("mercadolibre") || host === "meli.la") return "ml";
  return null;
}

// Segue os redirecionamentos (link.amazon, amzn.to, s.shopee…) e devolve a página final
async function baixarPagina(url: string): Promise<{ urlFinal: string; html: string }> {
  const resposta = await fetch(url, {
    headers: NAVEGADOR,
    redirect: "follow",
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
  });
  return { urlFinal: resposta.url || url, html: resposta.ok ? await resposta.text() : "" };
}

const precoValido = (texto: string) => {
  const valor = lerPreco(texto);
  return valor === null || Number.isNaN(valor) || valor === 0 ? null : valor;
};

function primeiroTexto($: cheerio.CheerioAPI, seletores: string[]): string {
  for (const seletor of seletores) {
    const texto = $(seletor).first().text().trim().replace(/\s+/g, " ");
    if (texto) return texto;
  }
  return "";
}

function resumir(texto: string, limite = 90): string | null {
  if (!texto) return null;
  return texto.length <= limite ? texto : `${texto.slice(0, limite).replace(/\s+\S*$/, "")}…`;
}

function extrairAmazon(html: string, link: string): ResultadoExtracao {
  const $ = cheerio.load(html);
  const nome = primeiroTexto($, ["#productTitle", "#title"]);
  const bloqueado = !nome && (html.includes("validateCaptcha") || html.toLowerCase().includes("captcha"));
  if (!nome) {
    return vazio({
      loja: "amazon",
      link,
      parcial: true,
      erro: bloqueado ? "Amazon bloqueou a requisição" : "Não foi possível ler os dados da Amazon",
    });
  }

  const precoPor = precoValido(
    primeiroTexto($, [
      "#corePriceDisplay_desktop_feature_div .priceToPay .a-offscreen",
      "#corePrice_feature_div .a-offscreen",
      "#corePrice_desktop .a-price .a-offscreen",
      ".priceToPay .a-offscreen",
      "#apex_desktop .a-price .a-offscreen",
    ]),
  );
  const precoDe = precoValido(
    primeiroTexto($, [
      "#corePriceDisplay_desktop_feature_div .basisPrice .a-offscreen",
      "#corePriceDisplay_desktop_feature_div .a-text-price[data-a-strike=true] .a-offscreen",
      "#corePrice_desktop .a-text-price .a-offscreen",
      ".basisPrice .a-offscreen",
    ]),
  );

  // Maior versão da foto principal
  const imagem = $("#landingImage, #imgBlkFront").first();
  let imagemUrl = imagem.attr("data-old-hires") || null;
  const dinamica = imagem.attr("data-a-dynamic-image");
  if (!imagemUrl && dinamica) {
    try {
      const opcoes = Object.entries(JSON.parse(dinamica) as Record<string, [number, number]>);
      imagemUrl = opcoes.sort((a, b) => b[1][0] - a[1][0])[0]?.[0] ?? null;
    } catch {
      // atributo malformado: fica sem imagem
    }
  }
  imagemUrl ??= imagem.attr("src") ?? null;

  const descricao = resumir(primeiroTexto($, ["#feature-bullets li span.a-list-item"]));

  return {
    nome,
    descricao,
    imagem_url: imagemUrl,
    preco_por: precoPor,
    preco_de: precoDe !== null && precoPor !== null && precoDe > precoPor ? precoDe : null,
    loja: "amazon",
    link,
    sucesso: precoPor !== null,
    parcial: precoPor === null,
    erro: precoPor === null ? "Não encontrei o preço; confira na página da Amazon" : null,
  };
}

// A Shopee monta a página com JavaScript; só às vezes há metatags úteis no HTML
function extrairShopee(html: string, link: string): ResultadoExtracao {
  const $ = cheerio.load(html);
  const nome = $('meta[property="og:title"]').attr("content")?.trim() || null;
  const imagem = $('meta[property="og:image"]').attr("content") || null;
  if (!nome) return vazio({ loja: "shopee", link, parcial: true, erro: "Extração não disponível para Shopee" });
  return vazio({
    nome: nome.replace(/\s*\|\s*Shopee.*$/i, ""),
    imagem_url: imagem,
    loja: "shopee",
    link,
    parcial: true,
    erro: "Shopee: só consegui o nome e a imagem; preencha os preços",
  });
}

export async function extrairProduto(entrada: string): Promise<ResultadoExtracao> {
  let url: URL;
  try {
    url = new URL(entrada.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    return vazio({ erro: "Link inválido" });
  }

  let pagina: { urlFinal: string; html: string };
  try {
    pagina = await baixarPagina(url.href);
  } catch (e) {
    const tempo = e instanceof Error && e.name === "TimeoutError";
    return vazio({ loja: identificarLoja(url), erro: tempo ? "A loja demorou demais para responder" : "Não foi possível abrir o link" });
  }

  const final = new URL(pagina.urlFinal);
  const loja = identificarLoja(final) ?? identificarLoja(url);
  // Mantém o link de afiliada que a Drika colou; o final serve só para identificar a loja
  const link = url.href;

  switch (loja) {
    case "amazon":
      return extrairAmazon(pagina.html, link);
    case "shopee":
      return extrairShopee(pagina.html, link);
    case "ml":
      // A API pública do ML passou a exigir autenticação e as páginas têm verificação anti-robô
      return vazio({ loja: "ml", link, parcial: true, erro: "Extração não disponível para Mercado Livre por enquanto" });
    default:
      return vazio({ link, erro: "Loja não reconhecida (use links da Amazon, Shopee ou Mercado Livre)" });
  }
}
