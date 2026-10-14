-- ── Convites de demonstração para /exemplos ─────────────────────────────────
-- A página /exemplos passa a ter cartões clicáveis: cada cartão abre o convite
-- real do convidado de demonstração. A base de produção foi limpa na Fase 2
-- (docs/ARQUITECTURA.md §9.6), por isso os 3 convites demo são aqui recriados
-- com os MESMOS slugs e tokens do seed local (src/data/defaultWeddingData.ts)
-- e da documentação — em desenvolvimento e em produção os links são iguais.
--
-- Idempotente: id, slug e token têm ON CONFLICT DO NOTHING, pelo que correr
-- esta migração duas vezes (ou sobre uma base que já tenha dados demo) não
-- duplica nem substitui nada.

begin;

-- ── Casais demo ─────────────────────────────────────────────────────────────
insert into public.couples
  (id, name, email, phone, plan, status, payment_status, password_reminder)
values
  ('d0000001-0000-4000-8000-000000000001', 'Mariana & Pedro',
   'mariana.pedro@auranupcial.com', '+244 923 000 111',
   'pro', 'active', 'paid', 'demo123'),
  ('d0000001-0000-4000-8000-000000000003', 'Sofia & André',
   'sofia.andre@auranupcial.com', '+351 912 444 555',
   'starter', 'active', 'pending', 'demo123'),
  ('d0000001-0000-4000-8000-000000000005', 'Joana & Miguel',
   'joana.miguel@auranupcial.com', '+244 926 777 888',
   'starter', 'active', 'overdue', 'demo123')
on conflict do nothing;

-- ── Eventos demo (conteúdo igual ao seed local; sem fotos — o convite cai no
--    bloco tipográfico de capa, ver docs/ARQUITECTURA.md §9.5) ───────────────
insert into public.events
  (id, couple_id, slug, status, occasion, template_id, palette_id,
   bride_name, groom_name, conjunction, monogram,
   date_iso, date_display, location_display,
   verse_text, verse_reference, invitation_intro, parents_honoring,
   ceremony_title, ceremony_time, ceremony_location, ceremony_address, ceremony_maps_url,
   reception_title, reception_time, reception_location, reception_address, reception_maps_url,
   timeline, declarations, guest_manual, couple_message, gallery,
   rsvp_deadline, allow_plus_ones, enable_music, enable_qr_validation)
values
  ('d0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000001',
   'mariana-pedro', 'active', 'casamento', 'botanical-sage', 'sage',
   'Mariana', 'Pedro', '&', 'M & P',
   '2027-01-15', '15 JANEIRO 2027', 'LUANDA — ANGOLA',
   'Assim, já não são dois, mas uma só carne. Portanto, o que Deus uniu, não separe o homem.',
   'Mateus 19:6',
   'Têm a honra de convidar Vossa(s) Exa(s) para testemunhar o enlace matrimonial dos seus filhos',
   'Com a bênção de Deus e dos seus queridos pais, António & Teresa Silva e Manuel & Isabel Santos',
   'Cerimónia Religiosa', '15h30',
   'Igreja Nossa Senhora dos Remédios', 'Rua Rainha Ginga, Baixa de Luanda, Angola',
   'https://maps.google.com/?q=Igreja+Nossa+Senhora+dos+Remedios+Luanda',
   $$Copo-d'Água & Recepção$$, '18h00',
   'Quinta das Palmeiras Eventos', 'Avenida Talatona, Sector Residencial Sul, Luanda',
   'https://maps.google.com/?q=Talatona+Luanda',
   $$[
     {"id":"t-1","time":"15h30","title":"Cerimónia Religiosa","description":"Celebração solene e bênção das alianças na Igreja Nossa Senhora dos Remédios.","iconName":"church"},
     {"id":"t-2","time":"17h15","title":"O Cortejo & Felicitações","description":"Saída solene dos noivos, chuva de pétalas e fotografias com os convidados.","iconName":"rings"},
     {"id":"t-3","time":"18h00","title":"Cocktail de Boas-Vindas","description":"Abertura do jardim na Quinta das Palmeiras com canapés, espumante e música ao vivo.","iconName":"cheers"},
     {"id":"t-4","time":"19h45","title":"Jantar Nupcial","description":"Banquete gastronómico em sala climatizada e serviço à mesa.","iconName":"utensils"},
     {"id":"t-5","time":"21h30","title":"Primeira Dança dos Noivos","description":"Momento mágico ao som da nossa canção preferida.","iconName":"heart"},
     {"id":"t-6","time":"22h15","title":"Corte do Bolo & Brinde","description":"Brinde com champanhe e partilha do bolo com todos os presentes.","iconName":"cake"},
     {"id":"t-7","time":"22h45","title":"Abertura da Pista de Dança","description":"Festa com DJ convidado, barra de cocktails e celebração até ao amanhecer.","iconName":"party"}
   ]$$::jsonb,
   $${
     "groom":{"author":"Pedro","quote":"Desde o primeiro olhar soube que a minha busca por paz e significado terminava em ti. Prometo amar-te, honrar-te e ser o teu refúgio em cada aurora da nossa vida."},
     "bride":{"author":"Mariana","quote":"Hoje entrego o meu coração com a serenidade de quem encontrou a sua verdadeira casa. És a minha melhor escolha de ontem, de hoje e de todos os amanhãs."}
   }$$::jsonb,
   $$[
     {"id":"gm-1","title":"Sua presença é essencial","description":"Por favor, chegue com 20 minutos de antecedência para nos acompanhar desde o início.","iconName":"heart","enabled":true},
     {"id":"gm-2","title":"Por favor, seja pontual","description":"O início da cerimónia será rigoroso para desfrutarmos de toda a luz natural do dia.","iconName":"clock","enabled":true},
     {"id":"gm-3","title":"Branco é a cor da noiva","description":"Pedimos gentilmente que evite trajes brancos, off-white ou marfim total.","iconName":"sparkles","enabled":true},
     {"id":"gm-4","title":"Convidado não convida","description":"O convite é estritamente pessoal e intransmissível, conforme o número de lugares indicado.","iconName":"users","enabled":true},
     {"id":"gm-5","title":"Registe o nosso dia","description":"Fotografe e filme com alegria! No entanto, durante as bênçãos, mantenha o telemóvel em silêncio.","iconName":"camera","enabled":true},
     {"id":"gm-6","title":"Comemore connosco até o fim","description":"Venha com o coração aberto, calçado confortável e muita energia para dançar connosco!","iconName":"wine","enabled":true}
   ]$$::jsonb,
   $${
     "title":"Recado dos Noivos",
     "body":"Hoje celebramos muito mais do que o nosso amor. Celebramos a bênção divina de podermos partilhar este momento inesquecível com as pessoas mais queridas da nossa história. A sua presença é o maior presente que poderíamos receber.",
     "signOff":"Com todo o nosso carinho e gratidão,"
   }$$::jsonb,
   '[]'::jsonb,
   '2026-12-15', true, true, true),

  ('d0000001-0000-4000-8000-000000000004', 'd0000001-0000-4000-8000-000000000003',
   'sofia-andre', 'active', 'casamento', 'elegance-terracotta', 'terra',
   'Sofia', 'André', 'e', 'S & A',
   '2027-05-22', '22 MAIO 2027', 'LISBOA — PORTUGAL',
   'Onde o amor reina, ali Deus reina; e onde Deus reina, ali se encontra a paz.',
   'São Francisco de Assis',
   'Têm a alegria de convidar os seus familiares e amigos para celebrarem o início da sua caminhada a dois',
   'Com a bênção dos seus pais, Carlos & Helena Nunes e Rui & Marta Costa',
   'Cerimónia Religiosa', '16h00',
   'Igreja de São Roque', 'Largo Trindade Coelho, Lisboa, Portugal',
   'https://maps.google.com/?q=Igreja+de+Sao+Roque+Lisboa',
   $$Copo-d'Água & Recepção$$, '18h30',
   'Quinta da Bella Vista', 'Estrada da Quinta de São Pedro, Sintra, Portugal',
   'https://maps.google.com/?q=Quinta+Sintra+Lisboa',
   $$[
     {"id":"t-1","time":"16h00","title":"Cerimónia Religiosa","description":"Celebração solene e bênção das alianças na Igreja de São Roque.","iconName":"church"},
     {"id":"t-2","time":"17h45","title":"O Cortejo & Felicitações","description":"Saída dos noivos, chuva de pétalas e fotografias com os convidados.","iconName":"rings"},
     {"id":"t-3","time":"18h30","title":"Cocktail de Boas-Vindas","description":"Recepção no jardim da Quinta da Bella Vista com espumante e música ao vivo.","iconName":"cheers"},
     {"id":"t-4","time":"20h00","title":"Jantar","description":"Banquete em sala climatizada e serviço à mesa.","iconName":"utensils"},
     {"id":"t-5","time":"22h00","title":"Primeira Dança dos Noivos","description":"Momento mágico ao som da nossa canção preferida.","iconName":"heart"},
     {"id":"t-6","time":"23h00","title":"Corte do Bolo & Brinde","description":"Brinde com champanhe e partilha do bolo com todos os presentes.","iconName":"cake"},
     {"id":"t-7","time":"23h30","title":"Abertura da Pista de Dança","description":"Festa até ao amanhecer.","iconName":"party"}
   ]$$::jsonb,
   $${
     "groom":{"author":"André","quote":"Encontrei em ti a serenidade que procurava. Prometo construir contigo dias leves e futuros firmes."},
     "bride":{"author":"Sofia","quote":"Escolho-te nas manhãs difíceis e nas celebrações simples. O nosso sim é o início de tudo o que ainda vamos ser."}
   }$$::jsonb,
   $$[
     {"id":"gm-1","title":"Sua presença é essencial","description":"Por favor, chegue com 20 minutos de antecedência para nos acompanhar desde o início.","iconName":"heart","enabled":true},
     {"id":"gm-2","title":"Por favor, seja pontual","description":"O início da cerimónia será rigoroso para desfrutarmos de toda a luz natural do dia.","iconName":"clock","enabled":true},
     {"id":"gm-3","title":"Branco é a cor da noiva","description":"Pedimos gentilmente que evite trajes brancos, off-white ou marfim total.","iconName":"sparkles","enabled":true},
     {"id":"gm-4","title":"Convidado não convida","description":"O convite é estritamente pessoal e intransmissível, conforme o número de lugares indicado.","iconName":"users","enabled":true},
     {"id":"gm-5","title":"Registe o nosso dia","description":"Fotografe e filme com alegria! No entanto, durante as bênçãos, mantenha o telemóvel em silêncio.","iconName":"camera","enabled":true},
     {"id":"gm-6","title":"Comemore connosco até o fim","description":"Venha com o coração aberto, calçado confortável e muita energia para dançar connosco!","iconName":"wine","enabled":true}
   ]$$::jsonb,
   $${
     "title":"Recado dos Noivos",
     "body":"A vossa presença tornará este dia ainda mais especial. Será uma alegria partilhar connosco este momento tão esperado.",
     "signOff":"Com carinho,"
   }$$::jsonb,
   '[]'::jsonb,
   '2027-04-30', true, false, true),

  ('d0000001-0000-4000-8000-000000000006', 'd0000001-0000-4000-8000-000000000005',
   'joana-miguel', 'active', 'casamento', 'classic-gold', 'classic',
   'Joana', 'Miguel', '&', 'J & M',
   '2026-12-12', '12 DEZEMBRO 2026', 'BENGOLA — ANGOLA',
   'Muitas águas não podem apagar o amor, nem as inundações o levaram.',
   'Cânticos 8:7',
   'Têm a honra de convidar Vossa(s) Exa(s) para acompanhar a celebração do seu enlace matrimonial',
   'Com a bênção de Deus e das suas famílias, Domingos & Rosa e Paulo & Alice',
   'Cerimónia Religiosa', '15h00',
   'Catedral de Santo António', 'Praça do Kamba, Benguela, Angola',
   'https://maps.google.com/?q=Catedral+Benguela+Angola',
   $$Copo-d'Água & Recepção$$, '17h30',
   'Hotel Grande Bahia', 'Avenida Marginal, Benguela, Angola',
   'https://maps.google.com/?q=Benguela+Angola',
   $$[
     {"id":"t-1","time":"15h00","title":"Cerimónia Religiosa","description":"Celebração solene e bênção das alianças na Catedral de Santo António.","iconName":"church"},
     {"id":"t-2","time":"16h45","title":"O Cortejo & Felicitações","description":"Saída dos noivos, chuva de pétalas e fotografias com os convidados.","iconName":"rings"},
     {"id":"t-3","time":"17h30","title":"Cocktail de Boas-Vindas","description":"Recepção no Hotel Grande Bahia com espumante e música ao vivo.","iconName":"cheers"},
     {"id":"t-4","time":"19h00","title":"Jantar","description":"Banquete com serviço à mesa.","iconName":"utensils"},
     {"id":"t-5","time":"21h00","title":"Primeira Dança dos Noivos","description":"Momento mágico ao som da nossa canção preferida.","iconName":"heart"},
     {"id":"t-6","time":"22h00","title":"Corte do Bolo & Brinde","description":"Brinde com champanhe e partilha do bolo com todos os presentes.","iconName":"cake"},
     {"id":"t-7","time":"22h30","title":"Abertura da Pista de Dança","description":"Festa com DJ convidado até ao amanhecer.","iconName":"party"}
   ]$$::jsonb,
   $${
     "groom":{"author":"Miguel","quote":"Ti encontrei o amor que não se apaga. Cada dia ao teu lado é uma confirmação de que Deus me abençoou."},
     "bride":{"author":"Joana","quote":"Digo sim com a leveza de quem encontrou o seu lar no coração de outro."}
   }$$::jsonb,
   $$[
     {"id":"gm-1","title":"Sua presença é essencial","description":"Por favor, chegue com 20 minutos de antecedência para nos acompanhar desde o início.","iconName":"heart","enabled":true},
     {"id":"gm-2","title":"Por favor, seja pontual","description":"O início da cerimónia será rigoroso para desfrutarmos de toda a luz natural do dia.","iconName":"clock","enabled":true},
     {"id":"gm-3","title":"Branco é a cor da noiva","description":"Pedimos gentilmente que evite trajes brancos, off-white ou marfim total.","iconName":"sparkles","enabled":true},
     {"id":"gm-4","title":"Convidado não convida","description":"O convite é estritamente pessoal e intransmissível, conforme o número de lugares indicado.","iconName":"users","enabled":true},
     {"id":"gm-5","title":"Registe o nosso dia","description":"Fotografe e filme com alegria! No entanto, durante as bênçãos, mantenha o telemóvel em silêncio.","iconName":"camera","enabled":true},
     {"id":"gm-6","title":"Comemore connosco até o fim","description":"Venha com o coração aberto, calçado confortável e muita energia para dançar connosco!","iconName":"wine","enabled":true}
   ]$$::jsonb,
   $${
     "title":"Recado dos Noivos",
     "body":"A vossa presença é o maior presente que poderíamos receber. Obrigado por fazerem parte da nossa história.",
     "signOff":"Com todo o nosso carinho,"
   }$$::jsonb,
   '[]'::jsonb,
   '2026-11-30', true, false, true)
on conflict do nothing;

-- ── Convidados demo (os tokens são os links publicados em /exemplos e na
--    documentação). Só entram quando o evento respectivo foi mesmo criado —
--    se o slug já existisse na base, a linha do evento é saltada e o convidado
--    não pode ser inserido (FK). ─────────────────────────────────────────────
insert into public.guests
  (id, event_id, name, salutation_type, relationship, phone, token,
   max_guests, confirmed_guests, rsvp_status, rsvp_date, rsvp_notes,
   access_count, qr_status, companions)
select
  v.id, v.event_id, v.name, v.salutation_type, v.relationship, v.phone, v.token,
  v.max_guests, v.confirmed_guests, v.rsvp_status, v.rsvp_date, v.rsvp_notes,
  v.access_count, v.qr_status, v.companions
from (values
  ('d0000001-0000-4000-8000-000000000007'::uuid, 'd0000001-0000-4000-8000-000000000002'::uuid,
   'João Manuel', 'individual', 'Amigo de infância do noivo', '+244 923 111 222',
   '8Fk92KsP', 1, 1, 'confirmed', '2026-09-20T14:30:00Z'::timestamptz,
   'Parabéns ao casal! Estarei lá com muita alegria.', 3, 'active', '[]'::jsonb),
  ('d0000001-0000-4000-8000-000000000008'::uuid, 'd0000001-0000-4000-8000-000000000002'::uuid,
   'Ana Clara', 'individual', 'Madrinha da noiva', '+244 924 333 444',
   'anaclara-7Tx9Q', 2, 0, 'pending', null::timestamptz, '', 1, 'active', '[]'::jsonb),
  ('d0000001-0000-4000-8000-000000000009'::uuid, 'd0000001-0000-4000-8000-000000000004'::uuid,
   'Marta Figueiredo', 'individual', 'Melhor amiga da noiva', '+351 913 222 333',
   'marta-4Rc8Bn', 1, 1, 'confirmed', '2026-10-03T11:00:00Z'::timestamptz,
   'Não perco este por nada! Já estou a contar os dias.', 2, 'active', '[]'::jsonb),
  ('d0000001-0000-4000-8000-00000000000a'::uuid, 'd0000001-0000-4000-8000-000000000004'::uuid,
   'Família Nunes', 'family', 'Família do noivo', '+351 914 555 666',
   'nunes-7Gf2Ld', 4, 0, 'pending', null::timestamptz, '', 0, 'active', '[]'::jsonb),
  ('d0000001-0000-4000-8000-00000000000b'::uuid, 'd0000001-0000-4000-8000-000000000006'::uuid,
   'Família Domingos', 'family', 'Família da noiva', '+244 931 111 000',
   'domingos-3Vn9Pa', 6, 6, 'confirmed', '2026-09-15T16:30:00Z'::timestamptz,
   'A família toda confirmada. Será uma festa inesquecível.', 5, 'active', '[]'::jsonb),
  ('d0000001-0000-4000-8000-00000000000c'::uuid, 'd0000001-0000-4000-8000-000000000006'::uuid,
   'Dona Esperança', 'individual', 'Madrinha da noiva', '+244 932 222 000',
   'esperanca-5Kj7Wt', 2, 2, 'confirmed', '2026-09-18T10:00:00Z'::timestamptz,
   '', 3, 'active', '[]'::jsonb)
) as v(id, event_id, name, salutation_type, relationship, phone, token,
       max_guests, confirmed_guests, rsvp_status, rsvp_date, rsvp_notes,
       access_count, qr_status, companions)
where exists (select 1 from public.events e where e.id = v.event_id)
on conflict do nothing;

-- ── Liga cada casal demo ao seu evento (só os casais desta migração) ────────
update public.couples c
set active_event_id = e.id
from public.events e
where e.couple_id = c.id
  and c.id in (
    'd0000001-0000-4000-8000-000000000001',
    'd0000001-0000-4000-8000-000000000003',
    'd0000001-0000-4000-8000-000000000005'
  )
  and c.active_event_id is distinct from e.id;

commit;
