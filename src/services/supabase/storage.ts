import type { WeddingEvent } from '../../types/wedding';
import { getSupabase } from './client';

export const EVENT_PHOTOS_BUCKET = 'event-photos';
export const EVENT_PHOTOS_PREFIX = 'couples/';

export type EventPhotoField = 'heroPhoto' | 'intimatePhoto' | 'ringsPhoto';

const PHOTO_FIELDS: EventPhotoField[] = ['heroPhoto', 'intimatePhoto', 'ringsPhoto'];

/** Caminho de um objecto do bucket (o valor guardado em `events`). */
export function isEventPhotoPath(value: string): boolean {
  return value.startsWith(EVENT_PHOTOS_PREFIX);
}

/** Um valor de foto é base64 ainda por enviar ao bucket? */
export function isPendingPhotoData(value: string): boolean {
  return value.startsWith('data:');
}

/** Caminho estável por foto principal: couples/<casal>/<evento>/<campo>.jpg */
export function eventPhotoPath(event: WeddingEvent, field: EventPhotoField): string {
  const name = field === 'heroPhoto' ? 'hero' : field === 'intimatePhoto' ? 'intimate' : 'rings';
  return `${EVENT_PHOTOS_PREFIX}${event.coupleId}/${event.id}/${name}.jpg`;
}

/** Caminho estável por foto de galeria: couples/<casal>/<evento>/gallery-<id>.jpg */
export function galleryPhotoPath(event: WeddingEvent, photoId: string): string {
  return `${EVENT_PHOTOS_PREFIX}${event.coupleId}/${event.id}/gallery-${photoId}.jpg`;
}

/** URL pública de leitura de um caminho do bucket (síncrona, sem rede). */
export function eventPhotoPublicUrl(path: string): string {
  const { data } = getSupabase().storage.from(EVENT_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Substitui caminhos do bucket pela URL pública de leitura.
 * `dataURL` (antigos) e URLs completas passam intactos — convites já
 * publicados continuam a abrir sem migração.
 */
export function resolveEventPhotos(event: WeddingEvent): WeddingEvent {
  const fix = (value: string): string => (isEventPhotoPath(value) ? eventPhotoPublicUrl(value) : value);
  return {
    ...event,
    heroPhoto: fix(event.heroPhoto),
    intimatePhoto: fix(event.intimatePhoto),
    ringsPhoto: fix(event.ringsPhoto),
    gallery: event.gallery.map((photo) =>
      isEventPhotoPath(photo.url) ? { ...photo, url: eventPhotoPublicUrl(photo.url) } : photo
    )
  };
}

/** dataURL (base64) → Blob, para enviar ao bucket. */
function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, body] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(meta)?.[1] ?? 'image/jpeg';
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Envia uma foto (dataURL) ao bucket e devolve o caminho a guardar na linha. */
export async function uploadEventPhoto(path: string, dataUrl: string): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const { error } = await getSupabase()
    .storage.from(EVENT_PHOTOS_BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) {
    throw new Error(
      'Não foi possível carregar a foto para o servidor. Verifique a sua ligação e tente de novo.'
    );
  }
  return path;
}

/** Remove fotos do bucket — best-effort, nunca derruba a operação principal. */
export async function removeEventPhotos(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    await getSupabase().storage.from(EVENT_PHOTOS_BUCKET).remove(paths);
  } catch {
    // Falha de limpeza não bloqueia o guardado.
  }
}

/** Caminhos do bucket referenciados por um evento (principal + galeria). */
export function collectEventPhotoPaths(event: WeddingEvent): string[] {
  const paths: string[] = [];
  for (const field of PHOTO_FIELDS) {
    const value = event[field];
    if (isEventPhotoPath(value)) paths.push(value);
  }
  for (const photo of event.gallery) {
    if (isEventPhotoPath(photo.url)) paths.push(photo.url);
  }
  return paths;
}

/**
 * Envio das fotos pendentes (dataURL) ao bucket.
 * Devolve o evento com caminhos — só os caminhos ficam na linha da base de dados.
 */
export async function storeEventPhotos(event: WeddingEvent): Promise<WeddingEvent> {
  const uploadIfPending = async (value: string, path: string): Promise<string> =>
    isPendingPhotoData(value) ? uploadEventPhoto(path, value) : value;

  const [heroPhoto, intimatePhoto, ringsPhoto, gallery] = await Promise.all([
    uploadIfPending(event.heroPhoto, eventPhotoPath(event, 'heroPhoto')),
    uploadIfPending(event.intimatePhoto, eventPhotoPath(event, 'intimatePhoto')),
    uploadIfPending(event.ringsPhoto, eventPhotoPath(event, 'ringsPhoto')),
    Promise.all(
      event.gallery.map(async (photo) => ({
        ...photo,
        url: await uploadIfPending(photo.url, galleryPhotoPath(event, photo.id))
      }))
    )
  ]);

  return { ...event, heroPhoto, intimatePhoto, ringsPhoto, gallery };
}

/** Remove do bucket os caminhos que deixaram de existir entre duas versões. */
export async function cleanupRemovedPhotos(
  previous: WeddingEvent | undefined,
  next: WeddingEvent
): Promise<void> {
  if (!previous) return;
  const stillUsed = new Set(collectEventPhotoPaths(next));
  const removed = collectEventPhotoPaths(previous).filter((path) => !stillUsed.has(path));
  await removeEventPhotos(removed);
}

/** Apaga do bucket todas as fotos de um evento (pasta couples/<casal>/<evento>/). */
export async function removeEventFolder(coupleId: string, eventId: string): Promise<void> {
  if (!coupleId || !eventId) return;
  try {
    const folder = `${EVENT_PHOTOS_PREFIX}${coupleId}/${eventId}`;
    const { data: files } = await getSupabase().storage.from(EVENT_PHOTOS_BUCKET).list(folder, {
      limit: 200
    });
    const paths = (files ?? []).map((f) => `${folder}/${f.name}`);
    await removeEventPhotos(paths);
  } catch {
    // Best-effort: apagar a pasta nunca bloqueia a remoção do registo.
  }
}
