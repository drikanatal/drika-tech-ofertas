export type Loja = "amazon" | "shopee" | "ml";

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null; // linha curta exibida no card
  descricao_longa: string | null; // aparece ao clicar no "+"
  imagem_url: string | null;
  preco_de: number | null;
  preco_por: number;
  link: string;
  loja: Loja;
  destaque: boolean;
  categoria_id: string | null;
  ordem: number;
};

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
};
