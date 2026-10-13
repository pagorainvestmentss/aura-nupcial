import type {
  ClientStatus,
  Couple,
  EventStatus,
  Guest,
  PaymentRequest,
  PaymentRequestKind,
  PaymentRequestStatus,
  PaymentStatus,
  PlanId,
  RsvpStatus,
  WeddingEvent
} from '../types/wedding';

export interface PlatformSettings {
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  paymentIban?: string;
  paymentMcxPhone?: string;
  paymentHolderName?: string;
}

export interface CreatePaymentRequestParams {
  coupleId: string;
  plan: PlanId;
  kind: PaymentRequestKind;
  amountKz: number;
}

export interface UpdateRsvpParams {
  guestId: string;
  /**
   * Token do convidado. No convite público (anónimo) não há sessão e o RLS
   * bloqueia qualquer SELECT em `guests`; a RPC `submit_rsvp` identifica o
   * convidado **só pelo token**, por isso ele é passado em vez de ser lido
   * da base. Obrigatório no Supabase, ignorado no modo local.
   */
  guestToken?: string;
  /**
   * Convidado carregado pela RPC inicial (`resolve_invitation`). No modo
   * Supabase ele é a base sobre a qual se projecta a resposta: a RPC do RSVP
   * só devolve `{ ok, status }` e voltar a ler a linha falharia com o RLS.
   * Guarda-se aqui o que não muda (nome, saudação, lugares) para a UI não
   * perder a saudação personalizada depois de responder. Ignorado no local.
   */
  currentGuest?: Guest;
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

  // Pedidos de pagamento (Fase 0)
  createPaymentRequest(params: CreatePaymentRequestParams): Promise<PaymentRequest>;
  /** Todos os pedidos (admin) ou só os de um casal (cliente). */
  getPaymentRequests(coupleId?: string): Promise<PaymentRequest[]>;
  /**
   * Confirma (`paid`) ou cancela um pedido. A confirmação marca também o casal
   * como pago (activando `pendingPlan` quando exista) — auditar `confirmedBy`.
   */
  setPaymentRequestStatus(
    requestId: string,
    status: Exclude<PaymentRequestStatus, 'pending'>,
    confirmedBy?: string
  ): Promise<void>;

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
  saveGuest(guest: Guest): Promise<void>;
  deleteGuest(guestId: string): Promise<void>;

  // RSVP + QR
  updateRsvp(params: UpdateRsvpParams): Promise<UpdateRsvpResult>;
  validateQrCheckIn(input: string, scannedBy?: string): Promise<QrValidationResult>;

  // Definições da plataforma
  getSettings(): Promise<PlatformSettings>;
  saveSettings(settings: PlatformSettings): Promise<void>;
}
