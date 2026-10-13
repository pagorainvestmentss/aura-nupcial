-- Issue #32: fotos de evento via bucket event-photos.
--
-- O bucket passa a PÚBLICO para a leitura ser síncrona: o mapeamento de
-- leitura resolve caminho → URL com getPublicUrl (sem rede, sem URLs
-- assinadas por foto por cada abertura de convite). Os caminhos contêm UUIDs
-- de casal e evento, não são enumeráveis, e as fotografias já são servidas
-- dentro do convite partilhado.
-- A ESCRITA continua protegida pelas políticas event_photos_owner_* (RLS),
-- e a leitura anónima já era concedida por event_photos_public_read.
update storage.buckets
set public = true
where id = 'event-photos';
