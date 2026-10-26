-- Estrutura da Drika Tech Ofertas: categorias, produtos e e-mails autorizados no painel

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ordem int not null default 0
);

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,                -- linha curta exibida no card
  descricao_longa text,          -- aparece ao clicar no "+"
  imagem_url text,
  preco_de numeric(10,2),
  preco_por numeric(10,2) not null,
  link text not null,
  loja text not null check (loja in ('amazon', 'shopee', 'ml')),
  destaque boolean not null default false,
  ativo boolean not null default true,
  categoria_id uuid references public.categorias (id) on delete set null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create index produtos_vitrine_idx on public.produtos (ativo, ordem);

create table public.usuarios_autorizados (
  email text primary key,
  nome text,
  role text not null check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

-- RLS ligada em tudo; escrita só pelo painel (policies de admin no Prompt 2)
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.usuarios_autorizados enable row level security;

create policy "Vitrine lê produtos ativos"
  on public.produtos for select
  to anon, authenticated
  using (ativo = true);

create policy "Vitrine lê categorias"
  on public.categorias for select
  to anon, authenticated
  using (true);
