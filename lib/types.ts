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

// Produto como o painel vê (inclui os inativos)
export type ProdutoPainel = Produto & { ativo: boolean };

export type UsuarioAutorizado = {
  email: string;
  nome: string | null;
  role: "admin" | "viewer";
  created_at: string;
};

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
};
