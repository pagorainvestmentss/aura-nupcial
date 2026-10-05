import { WeddingEvent, Guest, Couple, RsvpStatus, QrStatus, PaymentStatus, ClientStatus } from '../types/wedding';
import { SEED_COUPLES, SEED_EVENTS, SEED_GUESTS, heroPhotoUrl, intimatePhotoUrl, ringsPhotoUrl } from '../data/defaultWeddingData';

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

export class WeddingStorageService {
  // --- Initialization & Seed ---
  public static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.COUPLES)) {
      localStorage.setItem(STORAGE_KEYS.COUPLES, JSON.stringify(SEED_COUPLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GUESTS)) {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(SEED_GUESTS));
    }
    this.migrateEventOccasions();
    this.migrateLegacyPhotos();
    this.migrateSeedEventStatus();
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
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(migrated));
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
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(migrated));
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
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(migrated));
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
    localStorage.setItem(STORAGE_KEYS.COUPLES, JSON.stringify(list));
  }

  public static deleteCouple(coupleId: string): void {
    const couples = this.getCouples().filter(c => c.id !== coupleId);
    localStorage.setItem(STORAGE_KEYS.COUPLES, JSON.stringify(couples));
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

  public static saveEvent(event: WeddingEvent): void {
    const list = this.getEvents();
    const index = list.findIndex(e => e.id === event.id);
    if (index >= 0) {
      list[index] = event;
    } else {
      list.push(event);
    }
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
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
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
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
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(list));
  }

  public static deleteGuest(guestId: string): void {
    const list = this.getGuests().filter(g => g.id !== guestId);
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(list));
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
  }): { success: boolean; guest?: Guest } {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === params.guestId);
    if (index === -1) return { success: false };

    const guest = guests[index];
    guest.rsvpStatus = params.rsvpStatus;
    guest.confirmedGuests = params.confirmedGuests;
    guest.rsvpNotes = params.notes || '';
    guest.dietaryRestrictions = params.dietaryRestrictions || '';
    guest.companions = params.rsvpStatus === 'confirmed' ? (params.companions || []) : [];
    guest.group = params.group || '';
    guest.rsvpDate = new Date().toISOString();

    guests[index] = guest;
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));

    return { success: true, guest };
  }

  // --- QR Code Verification & Check-in ---
  public static validateQrCheckIn(token: string, scannedBy = 'Recepção / Check-in'): {
    valid: boolean;
    status: 'VALID' | 'ALREADY_USED' | 'NOT_FOUND' | 'REVOKED';
    message: string;
    guest?: Guest;
    event?: WeddingEvent;
  } {
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
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));

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
      this.saveCouple(couple);
    }
  }

  // --- Admin: event lifecycle ---
  public static deleteEvent(eventId: string): void {
    const events = this.getEvents().filter(e => e.id !== eventId);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  public static setEventStatus(eventId: string, status: WeddingEvent['status']): void {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index >= 0) {
      events[index].status = status;
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
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
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Reset to original seed
  public static resetToSeed(): void {
    localStorage.setItem(STORAGE_KEYS.COUPLES, JSON.stringify(SEED_COUPLES));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(SEED_GUESTS));
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}
