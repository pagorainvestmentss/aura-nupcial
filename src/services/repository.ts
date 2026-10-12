import type {
  ClientStatus,
  Couple,
  EventStatus,
  Guest,
  PaymentStatus,
  PlanId,
  RsvpStatus,
  WeddingEvent
} from '../types/wedding';

export interface PlatformSettings {
  brandName: string;
  supportEmail: string;
  supportPhone: string;
}

export interface UpdateRsvpParams {
  guestId: string;
  rsvpStatus: RsvpStatus;
  confirmedGuests: number;
  notes?: string;
  dietaryRestrictions?: string;
  companions?: string[];
  group?: string;
}

export interface UpdateRsvpResult {
  success: boolean;
  guest?: Guest;
  error?: 'prazo' | 'armazenamento';
}

export interface QrValidationResult {
  valid: boolean;
  status: 'VALID' | 'ALREADY_USED' | 'NOT_FOUND' | 'REVOKED';
  message: string;
  guest?: Guest;
  event?: WeddingEvent;
}

/**
 * Contrato único de dados da aplicação. Duas implementações:
 *  - local    → localStorage (dev/testes), síncrona por baixo
 *  - supabase → base de dados real (produção)
 * Todas as páginas usam este contrato em modo `async`.
 */
export interface WeddingRepository {
  init(): Promise<void>;

  // Casais
  getCouples(): Promise<Couple[]>;
  getCoupleById(coupleId: string): Promise<Couple | undefined>;
  saveCouple(couple: Couple): Promise<void>;
  updateCouple(couple: Couple): Promise<void>;
  deleteCouple(coupleId: string): Promise<void>;
  setClientStatus(coupleId: string, status: ClientStatus): Promise<void>;
  setPaymentStatus(coupleId: string, paymentStatus: PaymentStatus): Promise<void>;
  requestPlanChange(coupleId: string, plan: PlanId): Promise<void>;

  // Eventos
  getEvents(): Promise<WeddingEvent[]>;
  getEventById(eventId: string): Promise<WeddingEvent | undefined>;
  getEventBySlug(slug: string): Promise<WeddingEvent | undefined>;
  saveEvent(event: WeddingEvent): Promise<boolean>;
  deleteEvent(eventId: string): Promise<void>;
  setEventStatus(eventId: string, status: EventStatus): Promise<void>;

  // Convidados
  getGuests(): Promise<Guest[]>;
  getGuestsByEventId(eventId: string): Promise<Guest[]>;
  getGuestByToken(
    coupleSlug: string,
    token: string
  ): Promise<{ event?: WeddingEvent; guest?: Guest; coupleStatus?: ClientStatus }>;
  recordAccess(guestId: string): Promise<void>;
  saveGuest(guest: Guest): Promise<void>;
  deleteGuest(guestId: string): Promise<void>;

  // RSVP + QR
  updateRsvp(params: UpdateRsvpParams): Promise<UpdateRsvpResult>;
  validateQrCheckIn(input: string, scannedBy?: string): Promise<QrValidationResult>;

  // Definições da plataforma
  getSettings(): Promise<PlatformSettings>;
  saveSettings(settings: PlatformSettings): Promise<void>;
}
