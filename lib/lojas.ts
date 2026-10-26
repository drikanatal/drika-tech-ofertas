import type { Loja } from "./types";

type InfoLoja = {
  nome: string;
  cta: string;
  logo: string;
};

export const LOJAS: Record<Loja, InfoLoja> = {
  amazon: { nome: "Amazon", cta: "Ver na Amazon →", logo: "/images/lojas/amazon.png" },
  shopee: { nome: "Shopee", cta: "Ver na Shopee →", logo: "/images/lojas/shopee.png" },
  ml: { nome: "Mercado Livre", cta: "Ver no Mercado Livre →", logo: "/images/lojas/mercadolivre.png" },
};
