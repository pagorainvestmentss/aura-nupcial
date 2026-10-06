import { describe, it, expect } from 'vitest';
import { createAccount } from './onboarding';
import { WeddingStorageService } from './weddingStorage';

/**
 * Fluxo integral coberto na Issue #5:
 *   conta → gate de pagamento → publicar → convidado abre link →
 *   RSVP → reflecte nos painéis → check-in QR (válido → já usado).
 * Nível de serviço: os painéis admin/cliente leem exactamente esta fonte.
 */
describe('cadeia demo (admin → cliente → convidado → RSVP → QR)', () => {
  it('percorre o fluxo completo com os invariantes críticos', () => {
    // 1. Casal cria conta pelo funil público
    const { ok, couple, event } = createAccount({
      name: 'Fluxo & Teste',
      email: 'fluxo.teste@exemplo.com',
      whatsapp: '900 000 000',
      occasion: 'casamento'
    });
    expect(ok).toBe(true);

    // Invariantes iniciais: por publicar e por pagar
    expect(event!.status).toBe('draft');
    expect(WeddingStorageService.getCoupleById(couple!.id)!.paymentStatus).toBe('pending');

    // 2. Gate de publicação: o casal só publica depois de o admin confirmar
    //    pagamento (ClientVisaoGeralPage.publish exige paymentStatus === 'paid').
    WeddingStorageService.setPaymentStatus(couple!.id, 'paid');
    WeddingStorageService.setEventStatus(event!.id, 'active');
    expect(WeddingStorageService.getEventById(event!.id)!.status).toBe('active');

    // 3. Convidado recebe o link individual /convite/:slug/:token
    WeddingStorageService.saveGuest({
      id: 'guest-fluxo',
      eventId: event!.id,
      name: 'Convidado do Fluxo',
      salutationType: 'individual',
      token: 'FLUXO1234',
      maxGuests: 2,
      confirmedGuests: 0,
      rsvpStatus: 'pending',
      accessCount: 0,
      qrStatus: 'active'
    });

    const aberto = WeddingStorageService.getGuestByToken(event!.slug, 'fluxo1234');
    expect(aberto.event?.id).toBe(event!.id);
    expect(aberto.guest?.id).toBe('guest-fluxo');
    // O acesso é registado no armazenamento (o objecto devolvido é o estado anterior)
    expect(
      WeddingStorageService.getGuests().find((g) => g.id === 'guest-fluxo')?.accessCount
    ).toBe(1);

    // 4. RSVP do convidado (sem sessão, só com o token)
    const rsvp = WeddingStorageService.updateRsvp({
      guestId: 'guest-fluxo',
      rsvpStatus: 'confirmed',
      confirmedGuests: 2,
      companions: ['Acompanhante Um'],
      notes: 'Até lá!'
    });
    expect(rsvp.success).toBe(true);

    // 5. Reflecte nos painéis: cliente (por evento) e admin (global)
    const painelCliente = WeddingStorageService.getGuestsByEventId(event!.id);
    expect(painelCliente.find((g) => g.id === 'guest-fluxo')?.rsvpStatus).toBe('confirmed');
    expect(painelCliente.find((g) => g.id === 'guest-fluxo')?.companions).toEqual([
      'Acompanhante Um'
    ]);
    expect(WeddingStorageService.getGuests().some((g) => g.id === 'guest-fluxo')).toBe(true);

    // 6. Check-in QR no dia: primeira leitura entra, segunda é bloqueada
    const entrada = WeddingStorageService.validateQrCheckIn('FLUXO1234', 'Mesa 2');
    expect(entrada).toMatchObject({ valid: true, status: 'VALID' });

    const repetida = WeddingStorageService.validateQrCheckIn('fluxo1234');
    expect(repetida).toMatchObject({ valid: false, status: 'ALREADY_USED' });
  });

  it('sem pagamento confirmado o evento mantém-se draft até o admin agir', () => {
    const { couple, event } = createAccount({
      name: 'Por Pagar & Casal',
      email: 'por.pagar@exemplo.com',
      whatsapp: '901 000 000',
      occasion: 'noivado'
    });

    // Estado inicial do funil F1–F8: conta criada, tudo pendente
    expect(WeddingStorageService.getCoupleById(couple!.id)!.paymentStatus).toBe('pending');
    expect(WeddingStorageService.getEventById(event!.id)!.status).toBe('draft');

    // Admin confirma pagamento → o casal pode publicar
    WeddingStorageService.setPaymentStatus(couple!.id, 'paid');
    expect(WeddingStorageService.getCoupleById(couple!.id)!.paymentStatus).toBe('paid');
  });

  it('convite de evento suspenso continua bloqueado após suspensão', () => {
    WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'suspended');
    const { event } = WeddingStorageService.getGuestByToken('mariana-pedro', '8Fk92KsP');
    expect(event?.status).toBe('suspended');
  });
});
