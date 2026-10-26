-- Bucket público para as imagens enviadas pelo painel: até 5 MB, JPG/PNG/WEBP

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura é pública pela URL do bucket; envio, troca e remoção só para admin
create policy "Admin envia imagens de produtos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produtos' and public.eh_admin());

create policy "Admin troca imagens de produtos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produtos' and public.eh_admin())
  with check (bucket_id = 'produtos' and public.eh_admin());

create policy "Admin remove imagens de produtos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produtos' and public.eh_admin());
