import { normalizar } from "./format";
import type { Loja } from "./types";

export const LOJAS_VALIDAS: Loja[] = ["amazon", "shopee", "ml"];

// Aceita "199,90", "1.299,00", "R$ 21,90" ou "21.90"
export function lerPreco(valor: FormDataEntryValue | null): number | null {
  let texto = String(valor ?? "").replace(/R\$|\s/g, "");
  if (texto === "") return null;
  if (texto.includes(",")) texto = texto.replace(/\./g, "").replace(",", ".");
  const numero = Number(texto);
  return Number.isFinite(numero) && numero >= 0 ? Math.round(numero * 100) / 100 : NaN;
}

export function ehUrl(texto: string): boolean {
  try {
    const url = new URL(texto);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function gerarSlug(nome: string): string {
  return normalizar(nome)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function texto(valor: FormDataEntryValue | null): string {
  return String(valor ?? "").trim();
}
