const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// "R$ 1.234,56" com espaço comum, igual ao HTML original
export function formatarPreco(valor: number): string {
  return reais.format(valor).replace(/ /g, " ");
}

// Percentual inteiro de desconto, ou null quando não há preço "de"
export function calcularDesconto(precoDe: number | null, precoPor: number): number | null {
  if (!precoDe || precoDe <= precoPor) return null;
  return Math.round((1 - precoPor / precoDe) * 100);
}

// Minúsculas e sem acentos, para a busca
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
