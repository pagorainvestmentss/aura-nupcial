import type { ClientStatus, Couple, EventStatus, Guest, PaymentStatus, PlanId, WeddingEvent } from '../types/wedding';
import { WeddingStorageService } from './weddingStorage';
import type { PlatformSettings, QrValidationResult, UpdateRsvpParams, UpdateRsvpResult, WeddingRepository } from './repository';

/** Micro-deferência para que o estado React assente entre renders (como uma rede). */
const tick = <T>(value: T): Promise<T> => Promise.resolve(value);

/**
 * Implementação local: mesmo comportamento de sempre (localStorage),
 * envolvido em Promises para o resto da app ser `async` de forma uniforme.
 * Usada em desenvolvimento e nos testes (`VITE_DATA_BACKEND=local`).
 */
export const localRepository: WeddingRepository = {
  init: () => tick(WeddingStorageService.init()),

  getCouples: () => tick(WeddingStorageService.getCouples()),
  getCoupleById: (coupleId) => tick(WeddingStorageService.getCoupleById(coupleId)),
  saveCouple: (couple: Couple) => tick(WeddingStorageService.saveCouple(couple)),
  updateCouple: (couple: Couple) => tick(WeddingStorageService.updateCouple(couple)),
  deleteCouple: (coupleId: string) => tick(WeddingStorageService.deleteCouple(coupleId)),
  setClientStatus: (coupleId: string, status: ClientStatus) => tick(WeddingStorageService.setClientStatus(coupleId, status)),
  setPaymentStatus: (coupleId: string, paymentStatus: PaymentStatus) => tick(WeddingStorageService.setPaymentStatus(coupleId, paymentStatus)),
  requestPlanChange: (coupleId: string, plan: PlanId) => tick(WeddingStorageService.requestPlanChange(coupleId, plan)),

  getEvents: () => tick(WeddingStorageService.getEvents()),
  getEventById: (eventId: string) => tick(WeddingStorageService.getEventById(eventId)),
  getEventBySlug: (slug: string) => tick(WeddingStorageService.getEventBySlug(slug)),
  saveEvent: (event: WeddingEvent) => tick(WeddingStorageService.saveEvent(event)),
  deleteEvent: (eventId: string) => tick(WeddingStorageService.deleteEvent(eventId)),
  setEventStatus: (eventId: string, status: EventStatus) => tick(WeddingStorageService.setEventStatus(eventId, status)),

  getGuests: () => tick(WeddingStorageService.getGuests()),
  getGuestsByEventId: (eventId: string) => tick(WeddingStorageService.getGuestsByEventId(eventId)),
  // NOTA: NÃO usamos WeddingStorageService.getGuestByToken — esse método regista
  // o acesso como efeito lateral, o que inflaria "Convites abertos" para convites
  // ainda bloqueados (rascunho/suspenso). O registo de acesso é responsabilidade
  // da InvitationPage, depois de todos os gates, e da RPC do servidor em produção.
  getGuestByToken: async (coupleSlug: string, token: string) => {
    const event = WeddingStorageService.getEventBySlug(coupleSlug);
    const guest = event
      ? WeddingStorageService.getGuestsByEventId(event.id).find(
          (g) => g.token.toLowerCase() === token.toLowerCase()
        )
      : undefined;
    const couple = event ? WeddingStorageService.getCoupleById(event.coupleId) : undefined;
    return { event, guest, coupleStatus: couple?.status };
  },
  saveGuest: (guest: Guest) => tick(WeddingStorageService.saveGuest(guest)),
  deleteGuest: (guestId: string) => tick(WeddingStorageService.deleteGuest(guestId)),

  // O token e o convidado em memória só são usados pelo Supabase, onde o RLS
  // impede a leitura; o local lê e escreve o localStorage à vontade.
  updateRsvp: ({
    guestId,
    guestToken: _guestToken,
    currentGuest: _currentGuest,
    ...rest
  }: UpdateRsvpParams): Promise<UpdateRsvpResult> =>
    tick(WeddingStorageService.updateRsvp({ guestId, ...rest })),
  validateQrCheckIn: (input: string, scannedBy?: string): Promise<QrValidationResult> =>
    tick(WeddingStorageService.validateQrCheckIn(input, scannedBy)),

  getSettings: (): Promise<PlatformSettings> => tick(WeddingStorageService.getSettings()),
  saveSettings: (settings: PlatformSettings) => tick(WeddingStorageService.saveSettings(settings))
};
