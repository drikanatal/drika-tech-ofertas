-- Projetos novos do Supabase na nuvem não concedem mais acesso automático às tabelas do schema public.
-- Estas permissões só liberam o acesso básico; quem pode ler ou alterar cada linha continua sendo a RLS.

grant usage on schema public to anon, authenticated;

-- Vitrine (visitantes e usuários logados): leitura; a RLS mostra só produtos ativos
grant select on public.produtos, public.categorias to anon, authenticated;

-- Painel (usuário logado): a RLS só deixa a admin alterar e só mostra ao usuário a própria linha da lista
grant insert, update, delete on public.produtos, public.categorias to authenticated;
grant select, insert, update, delete on public.usuarios_autorizados to authenticated;
