import { Couple, OccasionId, PlanId, WeddingEvent } from '../types/wedding';
import { WeddingStorageService } from './weddingStorage';
import { getOccasion } from '../data/occasions';
import { hasProBenefits } from '../data/site';
import { heroPhotoUrl, intimatePhotoUrl, ringsPhotoUrl } from '../data/defaultWeddingData';

export interface CreateAccountParams {
  name: string;
  email: string;
  whatsapp: string;
  occasion: OccasionId;
  plan?: PlanId;
}

export interface CreateAccountResult {
  ok: boolean;
  error?: string;
  couple?: Couple;
  event?: WeddingEvent;
}

/** Slug legível para URLs: "Mariana & Pedro" → "mariana-pedro". */
export function slugify(value: string): string {
  const base = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'convite';
}

function uniqueSlug(base: string): string {
  let candidate = base;
  let counter = 2;
  while (WeddingStorageService.getEventBySlug(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

/**
 * Evento EM BRANCO para uma conta nova — nunca herda conteúdo demo.
 * Secções vazias (galeria, timeline, manual, versículo, declarações)
 * ficam ocultas no convite até o cliente as preencher.
 */
export function createBlankEvent(coupleId: string, occasion: OccasionId, plan: PlanId, slugBase: string): WeddingEvent {
  const def = getOccasion(occasion);

  return {
    id: `event-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    coupleId,
    occasion,
    slug: uniqueSlug(slugify(slugBase)),
    brideName: '',
    groomName: '',
    conjunction: '&',
    monogram: '',
    dateDisplay: '',
    dateIso: '',
    locationDisplay: '',
    verse: { text: '', citation: '' },
    parentsHonoring: '',
    invitationIntro: def.defaults.invitationIntro,
    ceremony: { title: def.defaults.ceremonyTitle, time: '', venue: '', address: '', mapsUrl: '' },
    reception: { title: def.defaults.receptionTitle, time: '', venue: '', address: '', mapsUrl: '' },
    heroPhoto: heroPhotoUrl,
    intimatePhoto: intimatePhotoUrl,
    ringsPhoto: ringsPhotoUrl,
    gallery: [],
    timeline: [],
    declarations: {
      groom: { author: '', quote: '' },
      bride: { author: '', quote: '' }
    },
    guestManual: [],
    coupleMessage: {
      title: def.defaults.coupleMessageTitle,
      body: '',
      signOff: def.defaults.coupleMessageSignOff
    },
    templateId: 'botanical-sage',
    paletteId: 'sage',
    status: 'draft',
    rsvpDeadline: isoDaysFromNow(90),
    allowPlusOnes: true,
    enableMusic: hasProBenefits(plan),
    enableQrValidation: hasProBenefits(plan)
  };
}

/**
 * Cria conta + evento em branco de uma vez (semi-automático:
 * o sistema monta a estrutura, o cliente só preenche).
 */
export function createAccount(params: CreateAccountParams): CreateAccountResult {
  const email = params.email.trim().toLowerCase();
  const name = params.name.trim();

  if (!name) return { ok: false, error: 'Indique o seu nome.' };
  if (!email || !email.includes('@')) return { ok: false, error: 'Indique um email válido.' };
  if (!params.whatsapp.trim()) return { ok: false, error: 'Indique o seu número de WhatsApp.' };

  const existing = WeddingStorageService.getCouples().find(
    (c) => c.email.trim().toLowerCase() === email
  );
  if (existing) return { ok: false, error: 'Já existe uma conta com este email. Faça login.' };

  const plan: PlanId = params.plan ?? 'starter';
  const coupleId = `couple-${Date.now().toString(36)}`;

  const couple: Couple = {
    id: coupleId,
    name,
    email,
    phone: params.whatsapp.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
    plan,
    activeEventId: '',
    status: 'active',
    paymentStatus: 'pending',
    password: ''
  };

  const event = createBlankEvent(coupleId, params.occasion, plan, name);
  couple.activeEventId = event.id;

  WeddingStorageService.saveCouple(couple);
  WeddingStorageService.saveEvent(event);

  return { ok: true, couple, event };
}
