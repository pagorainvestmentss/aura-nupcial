import { WeddingEvent, Guest, Couple, RsvpStatus, QrStatus, PaymentStatus, ClientStatus, PlanId } from '../types/wedding';
import { SEED_COUPLES, SEED_EVENTS, SEED_GUESTS, heroPhotoUrl, intimatePhotoUrl, ringsPhotoUrl } from '../data/defaultWeddingData';
import { paletteForTemplate } from '../data/templates';

const STORAGE_KEYS = {
  COUPLES: 'aura_couples_v2',
  EVENTS: 'aura_events_v2',
  GUESTS: 'aura_guests_v2',
  SETTINGS: 'aura_settings_v1'
};

// Cryptographically safe random token generator for unique guest links
export function generateRandomToken(prefix = ''): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let token = '';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    token += chars[array[i] % chars.length];
  }
  return prefix ? `${prefix}-${token}` : token;
}

/**
 * Extrai o token de convidado de um input de check-in.
 * Aceita o token puro ("8Fk92KsP") ou o URL completo/relativo que os QRs
 * geram ("https://exemplo.pt/convite/slug/8Fk92KsP" ou "convite/slug/8Fk92KsP").
 * Os tokens nunca contêm "/", por isso a última parcela do caminho é o token.
 */
export function extractQrToken(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  let path = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      path = new URL(trimmed).pathname;
    } catch {
      return trimmed;
    }
  } else if (trimmed.includes('/')) {
    path = trimmed.split(/[?#]/)[0];
  } else {
    return trimmed;
  }

  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : trimmed;
}

export class WeddingStorageService {
  /**
   * Escrita segura no localStorage. Armazenamento cheio (cota) NÃO rebenta
   * a aplicação: fica apenas um aviso na consola e a escrita é ignorada.
   * Devolve `false` quando não foi possível guardar.
   */
  private static persist(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[Aura Nupcial] Armazenamento local sem espaço — não foi possível guardar "${key}".`, err);
      return false;
    }
  }

  // --- Initialization & Seed ---
  public static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.COUPLES)) {
      this.persist(STORAGE_KEYS.COUPLES, SEED_COUPLES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      this.persist(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GUESTS)) {
      this.persist(STORAGE_KEYS.GUESTS, SEED_GUESTS);
    }
    this.migrateEventOccasions();
    this.migrateLegacyPhotos();
    this.migrateSeedEventStatus();
    this.migrateTemplatePalettes();
  }

  /**
   * Migração: o convite demo "Sofia & André" (publicado em /exemplos) foi
   * criado como rascunho e ficava bloqueado para os convidados ("Convite
   * Indisponível"). Só toca no evento seed — eventos de clientes reais
   * mantêm o estado que definirem na área de cliente/admin.
   */
  private static migrateSeedEventStatus(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!raw) return;
      const events: WeddingEvent[] = JSON.parse(raw);
      let changed = false;
      const migrated = events.map((e) => {
        if (e.id === 'event-sofia-andre-2027' && e.status === 'draft') {
          changed = true;
          return { ...e, status: 'active' as const };
        }
        return e;
      });
      if (changed) {
        this.persist(STORAGE_KEYS.EVENTS, migrated);
      }
    } catch {
      // storage corrompido — mantém como está
    }
  }

  /**
   * Migração: atribuir um template no admin gravava só `templateId`, mas o
   * convite renderiza `paletteId` — alinha a paleta ao template do evento.
   */
  private static migrateTemplatePalettes(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!raw) return;
      const events: WeddingEvent[] = JSON.parse(raw);
      let changed = false;
      const migrated = events.map((e) => {
        if (!e.templateId) return e;
        const esperada = paletteForTemplate(e.templateId);
        if (e.paletteId !== esperada) {
          changed = true;
          return { ...e, paletteId: esperada };
        }
        return e;
      });
      if (changed) {
        this.persist(STORAGE_KEYS.EVENTS, migrated);
      }
    } catch {
      // storage corrompido — mantém como está
    }
  }

  /** Migração: eventos guardados antes da Fase 1 não têm `occasion` (eram todos casamento). */
  private static migrateEventOccasions(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!raw) return;
      const events: WeddingEvent[] = JSON.parse(raw);
      let changed = false;
      const migrated = events.map((e) => {
        if (!e.occasion) {
          changed = true;
          return { ...e, occasion: 'casamento' as const };
        }
        return e;
      });
      if (changed) {
        this.persist(STORAGE_KEYS.EVENTS, migrated);
      }
    } catch {
      // storage corrompido — mantém como está
    }
  }

  /**
   * Migração: fotos guardadas com os nomes de ficheiro antigos dos assets
   * (renomeados nesta fase) passam a apontar para os ficheiros novos.
   * Fotos enviadas pelo cliente (dataURL) nunca são tocadas.
   */
  private static migrateLegacyPhotos(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!raw) return;
      const events: WeddingEvent[] = JSON.parse(raw);
      let changed = false;

      const fixUrl = (value?: string): string | undefined => {
        if (!value || value.startsWith('data:')) return undefined;
        if (value.includes('wedding_couple_editorial')) return heroPhotoUrl;
        if (value.includes('wedding_couple_intimate')) return intimatePhotoUrl;
        if (value.includes('wedding_rings_botanical')) return ringsPhotoUrl;
        return undefined;
      };

      const migrated = events.map((e) => {
        const hero = fixUrl(e.heroPhoto);
        const intimate = fixUrl(e.intimatePhoto);
        const rings = fixUrl(e.ringsPhoto);
        if (hero || intimate || rings) changed = true;

        const gallery = (e.gallery || []).map((photo) => {
          const url = fixUrl(photo.url);
          if (url) {
            changed = true;
            return { ...photo, url };
          }
          return photo;
        });

        return {
          ...e,
          heroPhoto: hero || e.heroPhoto,
          intimatePhoto: intimate || e.intimatePhoto,
          ringsPhoto: rings || e.ringsPhoto,
          gallery
        };
      });

      if (changed) {
        this.persist(STORAGE_KEYS.EVENTS, migrated);
      }
    } catch {
      // storage corrompido — mantém como está
    }
  }

  // --- Couples ---
  public static getCouples(): Couple[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUPLES);
      return data ? JSON.parse(data) : SEED_COUPLES;
    } catch {
      return SEED_COUPLES;
    }
  }

  public static getCoupleById(coupleId: string): Couple | undefined {
    return this.getCouples().find(c => c.id === coupleId);
  }

  public static saveCouple(couple: Couple): void {
    const list = this.getCouples();
    const index = list.findIndex(c => c.id === couple.id);
    if (index >= 0) {
      list[index] = couple;
    } else {
      list.push(couple);
    }
    this.persist(STORAGE_KEYS.COUPLES, list);
  }

  public static deleteCouple(coupleId: string): void {
    // Cascata: casal → os seus eventos → os convidados desses eventos.
    const events = this.getEvents();
    const removedEventIds = new Set(events.filter(e => e.coupleId === coupleId).map(e => e.id));
    const keptEvents = events.filter(e => e.coupleId !== coupleId);
    this.persist(STORAGE_KEYS.EVENTS, keptEvents);

    if (removedEventIds.size > 0) {
      const keptGuests = this.getGuests().filter(g => !removedEventIds.has(g.eventId));
      this.persist(STORAGE_KEYS.GUESTS, keptGuests);
    }

    const couples = this.getCouples().filter(c => c.id !== coupleId);
    this.persist(STORAGE_KEYS.COUPLES, couples);
  }

  // --- Event Operations ---
  public static getEvents(): WeddingEvent[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : SEED_EVENTS;
    } catch {
      return SEED_EVENTS;
    }
  }

  public static getEventById(eventId: string): WeddingEvent | undefined {
    return this.getEvents().find(e => e.id === eventId);
  }

  public static getEventBySlug(slug: string): WeddingEvent | undefined {
    return this.getEvents().find(e => e.slug.toLowerCase() === slug.toLowerCase());
  }

  public static saveEvent(event: WeddingEvent): boolean {
    const list = this.getEvents();
    const index = list.findIndex(e => e.id === event.id);
    if (index >= 0) {
      list[index] = event;
    } else {
      list.push(event);
    }
    return this.persist(STORAGE_KEYS.EVENTS, list);
  }

  // --- Guest Operations ---
  public static getGuests(): Guest[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GUESTS);
      return data ? JSON.parse(data) : SEED_GUESTS;
    } catch {
      return SEED_GUESTS;
    }
  }

  public static getGuestsByEventId(eventId: string): Guest[] {
    return this.getGuests().filter(g => g.eventId === eventId);
  }

  public static getGuestByToken(coupleSlug: string, token: string): { event?: WeddingEvent; guest?: Guest } {
    const event = this.getEventBySlug(coupleSlug);
    if (!event) return {};

    const guests = this.getGuestsByEventId(event.id);
    const guest = guests.find(g => g.token.toLowerCase() === token.toLowerCase());

    if (guest) {
      // Record access log without disrupting UI
      this.recordAccess(guest.id);
    }

    return { event, guest };
  }

  public static recordAccess(guestId: string): void {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === guestId);
    if (index >= 0) {
      guests[index].accessedAt = new Date().toISOString();
      guests[index].accessCount = (guests[index].accessCount || 0) + 1;
      this.persist(STORAGE_KEYS.GUESTS, guests);
    }
  }

  public static saveGuest(guest: Guest): void {
    const list = this.getGuests();
    const index = list.findIndex(g => g.id === guest.id);
    if (index >= 0) {
      list[index] = guest;
    } else {
      list.push(guest);
    }
    this.persist(STORAGE_KEYS.GUESTS, list);
  }

  public static deleteGuest(guestId: string): void {
    const list = this.getGuests().filter(g => g.id !== guestId);
    this.persist(STORAGE_KEYS.GUESTS, list);
  }

  // --- RSVP Submission ---
  public static updateRsvp(params: {
    guestId: string;
    rsvpStatus: RsvpStatus;
    confirmedGuests: number;
    notes?: string;
    dietaryRestrictions?: string;
    companions?: string[];
    group?: string;
  }): { success: boolean; guest?: Guest; error?: 'prazo' | 'armazenamento' } {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === params.guestId);
    if (index === -1) return { success: false };

    const guest = guests[index];

    // Prazo de resposta: depois do fim do dia de rsvpDeadline não se aceitam respostas.
    const event = this.getEventById(guest.eventId);
    if (event?.rsvpDeadline) {
      const fimDoPrazo = new Date(`${event.rsvpDeadline}T23:59:59`);
      if (!isNaN(fimDoPrazo.getTime()) && Date.now() > fimDoPrazo.getTime()) {
        return { success: false, error: 'prazo' };
      }
    }

    guest.rsvpStatus = params.rsvpStatus;
    guest.confirmedGuests = params.confirmedGuests;
    guest.rsvpNotes = params.notes || '';
    guest.dietaryRestrictions = params.dietaryRestrictions || '';
    guest.companions = params.rsvpStatus === 'confirmed' ? (params.companions || []) : [];
    guest.group = params.group || '';
    guest.rsvpDate = new Date().toISOString();

    guests[index] = guest;
    if (!this.persist(STORAGE_KEYS.GUESTS, guests)) {
      return { success: false, error: 'armazenamento' };
    }

    return { success: true, guest };
  }

  // --- QR Code Verification & Check-in ---
  public static validateQrCheckIn(input: string, scannedBy = 'Recepção / Check-in'): {
    valid: boolean;
    status: 'VALID' | 'ALREADY_USED' | 'NOT_FOUND' | 'REVOKED';
    message: string;
    guest?: Guest;
    event?: WeddingEvent;
  } {
    const token = extractQrToken(input);
    const guests = this.getGuests();
    const guestIndex = guests.findIndex(g => g.token.toLowerCase() === token.toLowerCase());

    if (guestIndex === -1) {
      return {
        valid: false,
        status: 'NOT_FOUND',
        message: 'Convite não encontrado no sistema.'
      };
    }

    const guest = guests[guestIndex];
    const event = this.getEventById(guest.eventId);

    if (guest.qrStatus === 'revoked') {
      return {
        valid: false,
        status: 'REVOKED',
        message: 'Este convite foi revogado pela organização.',
        guest,
        event
      };
    }

    if (guest.qrStatus === 'used') {
      return {
        valid: false,
        status: 'ALREADY_USED',
        message: `Convite já utilizado em ${new Date(guest.qrScannedAt || '').toLocaleString('pt-PT')}.`,
        guest,
        event
      };
    }

    // First scan -> Mark as USED
    guest.qrStatus = 'used';
    guest.qrScannedAt = new Date().toISOString();
    guest.qrScannedBy = scannedBy;
    guests[guestIndex] = guest;
    this.persist(STORAGE_KEYS.GUESTS, guests);

    return {
      valid: true,
      status: 'VALID',
      message: 'Convite válido! Entrada autorizada.',
      guest,
      event
    };
  }

  // --- Admin: client commercial state ---
  public static updateCouple(couple: Couple): void {
    this.saveCouple(couple);
  }

  public static setClientStatus(coupleId: string, status: ClientStatus): void {
    const couple = this.getCoupleById(coupleId);
    if (couple) {
      couple.status = status;
      this.saveCouple(couple);
    }
  }

  public static setPaymentStatus(coupleId: string, paymentStatus: PaymentStatus): void {
    const couple = this.getCoupleById(coupleId);
    if (couple) {
      couple.paymentStatus = paymentStatus;
      // Upgrade pendente só fica activo quando a equipa confirma o pagamento.
      if (paymentStatus === 'paid' && couple.pendingPlan) {
        couple.plan = couple.pendingPlan;
        couple.pendingPlan = null;
      }
      this.saveCouple(couple);
    }
  }

  /**
   * Pedido de mudança de plano pelo cliente.
   * - Upgrade (→ Pro): NÃO altera `plan` — fica `pendingPlan` até a equipa
   *   confirmar o pagamento (activação em `setPaymentStatus('paid')`).
   * - Downgrade (→ Essential): aplicado de imediato (só retira benefícios).
   */
  public static requestPlanChange(coupleId: string, plan: PlanId): void {
    const couple = this.getCoupleById(coupleId);
    if (!couple) return;

    const upgrade = couple.plan === 'essential' && plan === 'pro';
    if (upgrade) {
      if (couple.pendingPlan === 'pro') return;
      couple.pendingPlan = 'pro';
      this.saveCouple(couple);
      return;
    }

    // Downgrade ou cancelamento de um pedido pendente.
    couple.plan = plan === 'pro' ? 'pro' : 'essential';
    couple.pendingPlan = null;
    this.saveCouple(couple);
  }

  // --- Admin: event lifecycle ---
  public static deleteEvent(eventId: string): void {
    // Cascata: evento → convidados do evento → referência no casal.
    const events = this.getEvents().filter(e => e.id !== eventId);
    this.persist(STORAGE_KEYS.EVENTS, events);

    const guests = this.getGuests().filter(g => g.eventId !== eventId);
    this.persist(STORAGE_KEYS.GUESTS, guests);

    const couples = this.getCouples().map(c =>
      c.activeEventId === eventId ? { ...c, activeEventId: '' } : c
    );
    this.persist(STORAGE_KEYS.COUPLES, couples);
  }

  public static setEventStatus(eventId: string, status: WeddingEvent['status']): void {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index >= 0) {
      events[index].status = status;
      this.persist(STORAGE_KEYS.EVENTS, events);
    }
  }

  // --- Platform settings (demo) ---
  public static getSettings(): { brandName: string; supportEmail: string; supportPhone: string } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch {
      /* fallthrough */
    }
    return {
      brandName: 'Aura Nupcial',
      supportEmail: 'ola@auranupcial.com',
      supportPhone: '+244 923 000 000'
    };
  }

  public static saveSettings(settings: { brandName: string; supportEmail: string; supportPhone: string }): void {
    this.persist(STORAGE_KEYS.SETTINGS, settings);
  }

  // Reset to original seed
  public static resetToSeed(): void {
    this.persist(STORAGE_KEYS.COUPLES, SEED_COUPLES);
    this.persist(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    this.persist(STORAGE_KEYS.GUESTS, SEED_GUESTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}
