import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WeddingEvent } from '../../types/wedding';
import { SEED_EVENTS } from '../../data/defaultWeddingData';

const { upload, remove, list } = vi.hoisted(() => ({
  upload: vi.fn(),
  remove: vi.fn(),
  list: vi.fn()
}));

vi.mock('./client', () => ({
  getSupabase: () => ({
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/${bucket}/${path}` }
        }),
        upload,
        remove,
        list
      })
    }
  })
}));

import {
  EVENT_PHOTOS_BUCKET,
  collectEventPhotoPaths,
  cleanupRemovedPhotos,
  eventPhotoPath,
  galleryPhotoPath,
  isEventPhotoPath,
  resolveEventPhotos,
  storeEventPhotos,
  uploadEventPhoto
} from './storage';

const DATA_URL = 'data:image/jpeg;base64,SGVsbG8=';
const PUBLIC = 'https://mock.supabase.co/storage/v1/object/public/event-photos';

function makeEvent(overrides: Partial<WeddingEvent> = {}): WeddingEvent {
  return {
    ...SEED_EVENTS[0],
    coupleId: 'couple-1',
    id: 'event-1',
    heroPhoto: '',
    intimatePhoto: '',
    ringsPhoto: '',
    gallery: [],
    ...overrides
  } as WeddingEvent;
}

beforeEach(() => {
  upload.mockReset().mockResolvedValue({ error: null });
  remove.mockReset().mockResolvedValue({ error: null });
  list.mockReset().mockResolvedValue({ data: [], error: null });
});

describe('caminhos do bucket', () => {
  it('reconhece caminhos do bucket e ignora dataURL/URLs', () => {
    expect(isEventPhotoPath('couples/c1/e1/hero.jpg')).toBe(true);
    expect(isEventPhotoPath(DATA_URL)).toBe(false);
    expect(isEventPhotoPath('https://exemplo/foto.jpg')).toBe(false);
    expect(isEventPhotoPath('')).toBe(false);
  });

  it('constrói caminhos estáveis por evento e por foto', () => {
    const event = makeEvent();
    expect(eventPhotoPath(event, 'heroPhoto')).toBe('couples/couple-1/event-1/hero.jpg');
    expect(eventPhotoPath(event, 'intimatePhoto')).toBe('couples/couple-1/event-1/intimate.jpg');
    expect(eventPhotoPath(event, 'ringsPhoto')).toBe('couples/couple-1/event-1/rings.jpg');
    expect(galleryPhotoPath(event, 'photo-abc')).toBe('couples/couple-1/event-1/gallery-photo-abc.jpg');
  });
});

describe('resolveEventPhotos (leitura)', () => {
  it('resolve caminhos para URLs públicas e deixa o resto intacto', () => {
    const event = makeEvent({
      heroPhoto: 'couples/couple-1/event-1/hero.jpg',
      gallery: [
        { id: 'p1', url: 'couples/couple-1/event-1/gallery-p1.jpg' },
        { id: 'p2', url: DATA_URL },
        { id: 'p3', url: 'https://exemplo/antiga.jpg' }
      ]
    });

    const resolved = resolveEventPhotos(event);
    expect(resolved.heroPhoto).toBe(`${PUBLIC}/couples/couple-1/event-1/hero.jpg`);
    expect(resolved.gallery[0].url).toBe(`${PUBLIC}/couples/couple-1/event-1/gallery-p1.jpg`);
    expect(resolved.gallery[1].url).toBe(DATA_URL);
    expect(resolved.gallery[2].url).toBe('https://exemplo/antiga.jpg');
  });

  it('convites antigos com base64 abrem sem alterações', () => {
    const event = makeEvent({ heroPhoto: DATA_URL, gallery: [{ id: 'p1', url: DATA_URL }] });
    const resolved = resolveEventPhotos(event);
    expect(resolved.heroPhoto).toBe(DATA_URL);
    expect(resolved.gallery[0].url).toBe(DATA_URL);
    expect(upload).not.toHaveBeenCalled();
  });
});

describe('storeEventPhotos (escrita)', () => {
  it('envia dataURLs ao bucket e guarda só o caminho', async () => {
    const event = makeEvent({
      heroPhoto: DATA_URL,
      gallery: [{ id: 'photo-abc', url: DATA_URL }]
    });

    const stored = await storeEventPhotos(event);

    expect(upload).toHaveBeenCalledTimes(2);
    expect(upload).toHaveBeenCalledWith(
      'couples/couple-1/event-1/hero.jpg',
      expect.any(Blob),
      { contentType: 'image/jpeg', upsert: true }
    );
    expect(upload).toHaveBeenCalledWith(
      'couples/couple-1/event-1/gallery-photo-abc.jpg',
      expect.any(Blob),
      { contentType: 'image/jpeg', upsert: true }
    );
    expect(stored.heroPhoto).toBe('couples/couple-1/event-1/hero.jpg');
    expect(stored.gallery[0].url).toBe('couples/couple-1/event-1/gallery-photo-abc.jpg');
  });

  it('não reenvia fotos que já são caminho ou URL', async () => {
    const event = makeEvent({
      heroPhoto: 'couples/couple-1/event-1/hero.jpg',
      intimatePhoto: 'https://exemplo/intima.jpg',
      gallery: [{ id: 'p1', url: DATA_URL }]
    });

    const stored = await storeEventPhotos(event);

    expect(upload).toHaveBeenCalledTimes(1);
    expect(stored.heroPhoto).toBe('couples/couple-1/event-1/hero.jpg');
    expect(stored.intimatePhoto).toBe('https://exemplo/intima.jpg');
  });

  it('falha de upload lança mensagem amigável com "foto"', async () => {
    upload.mockResolvedValue({ error: { message: 'boom' } });
    await expect(uploadEventPhoto('couples/c1/e1/hero.jpg', DATA_URL)).rejects.toThrow(/foto/);
  });
});

describe('collectEventPhotoPaths e cleanupRemovedPhotos', () => {
  it('recolhe só os caminhos do bucket', () => {
    const event = makeEvent({
      heroPhoto: 'couples/couple-1/event-1/hero.jpg',
      intimatePhoto: DATA_URL,
      gallery: [{ id: 'p1', url: 'couples/couple-1/event-1/gallery-p1.jpg' }]
    });
    expect(collectEventPhotoPaths(event)).toEqual([
      'couples/couple-1/event-1/hero.jpg',
      'couples/couple-1/event-1/gallery-p1.jpg'
    ]);
  });

  it('remove do bucket apenas as fotos que deixaram de existir', async () => {
    const previous = makeEvent({
      heroPhoto: 'couples/couple-1/event-1/hero.jpg',
      gallery: [{ id: 'p1', url: 'couples/couple-1/event-1/gallery-p1.jpg' }]
    });
    const next = makeEvent({
      heroPhoto: 'couples/couple-1/event-1/hero.jpg',
      gallery: []
    });

    await cleanupRemovedPhotos(previous, next);

    expect(remove).toHaveBeenCalledWith(['couples/couple-1/event-1/gallery-p1.jpg']);
  });

  it('sem evento anterior não há limpeza', async () => {
    await cleanupRemovedPhotos(undefined, makeEvent());
    expect(remove).not.toHaveBeenCalled();
  });
});

describe('bucket', () => {
  it('usa o bucket event-photos', () => {
    expect(EVENT_PHOTOS_BUCKET).toBe('event-photos');
  });
});
