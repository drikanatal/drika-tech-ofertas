-- Escrita no banco só para quem está em usuarios_autorizados com role 'admin'

-- security definer: consulta a lista sem cair na própria RLS (evita recursão)
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.usuarios_autorizados
    where email = lower(auth.jwt() ->> 'email')
      and role = 'admin'
  );
$$;

revoke all on function public.eh_admin() from public;
grant execute on function public.eh_admin() to authenticated;

-- usuarios_autorizados: cada um vê a própria linha (checagem do login); admin vê e altera tudo
create policy "Usuário vê o próprio e-mail"
  on public.usuarios_autorizados for select
  to authenticated
  using (email = lower(auth.jwt() ->> 'email') or public.eh_admin());

create policy "Admin cadastra e-mails"
  on public.usuarios_autorizados for insert
  to authenticated
  with check (public.eh_admin());

create policy "Admin altera e-mails"
  on public.usuarios_autorizados for update
  to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

create policy "Admin remove e-mails"
  on public.usuarios_autorizados for delete
  to authenticated
  using (public.eh_admin());

-- produtos: admin vê também os inativos e pode cadastrar, editar e excluir
create policy "Admin vê todos os produtos"
  on public.produtos for select
  to authenticated
  using (public.eh_admin());

create policy "Admin cadastra produtos"
  on public.produtos for insert
  to authenticated
  with check (public.eh_admin());

create policy "Admin altera produtos"
  on public.produtos for update
  to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

create policy "Admin remove produtos"
  on public.produtos for delete
  to authenticated
  using (public.eh_admin());

-- categorias
create policy "Admin cadastra categorias"
  on public.categorias for insert
  to authenticated
  with check (public.eh_admin());

create policy "Admin altera categorias"
  on public.categorias for update
  to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

create policy "Admin remove categorias"
  on public.categorias for delete
  to authenticated
  using (public.eh_admin());
