-- Os 4 produtos que estavam escritos à mão no HTML (legacy/index.html), copiados sem alteração

insert into public.produtos
  (nome, descricao, descricao_longa, imagem_url, preco_de, preco_por, link, loja, destaque, ativo, ordem)
values
  ('Câmera Ip Sem Fio 360°', 'Visão noturna · Wi-Fi · Monitoramento via app', null,
   '/images/camera-ip-360.png', null, 81.37, 'https://link.amazon/B0elyg7RC', 'amazon', true, true, 1),
  ('Descubra seus pontos fortes 2.0', 'StrengthsFinder 2.0 · Instituto Gallup, Tom Rath', null,
   '/images/pontos-fortes-2.png', 149.90, 103.40, 'https://link.amazon/B06mpnXto', 'amazon', true, true, 2),
  ('Controle passador de slides para Aulas e Palestras', 'Apresentador sem fio · USB receptor', null,
   '/images/passador-slides.png', null, 21.90, 'https://link.amazon/B0748brIv', 'amazon', false, true, 3),
  ('Controle sem fio PlayStation DualSense', 'Edição Limitada · PS5, PC/Mac, Mobile', null,
   '/images/dualsense-marathon.png', 599.90, 409.90, 'https://link.amazon/B02PklJ4K', 'amazon', false, true, 4);

insert into public.usuarios_autorizados (email, nome, role)
values ('drikapontonatal@gmail.com', 'Drika', 'admin');
