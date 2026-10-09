import { describe, it, expect } from 'vitest';
import { WeddingStorageService, generateRandomToken, extractQrToken } from './weddingStorage';
import { SEED_EVENTS, heroPhotoUrl, intimatePhotoUrl } from '../data/defaultWeddingData';

const KEY_EVENTS = 'aura_events_v2';
const KEY_SETTINGS = 'aura_settings_v1';

describe('seed e init', () => {
  it('faz seed automático com 3 casais, 3 eventos e 14 convidados', () => {
    expect(WeddingStorageService.getCouples()).toHaveLength(3);
    expect(WeddingStorageService.getEvents()).toHaveLength(3);
    expect(WeddingStorageService.getGuests()).toHaveLength(14);
  });

  it('init é idempotente (nunca duplica o seed)', () => {
    WeddingStorageService.init();
    WeddingStorageService.init();
    expect(WeddingStorageService.getCouples()).toHaveLength(3);
    expect(WeddingStorageService.getEvents()).toHaveLength(3);
    expect(WeddingStorageService.getGuests()).toHaveLength(14);
  });

  it('resetToSeed repõe os dados e limpa as definições', () => {
    WeddingStorageService.getCouples(); // garante seed
    WeddingStorageService.deleteGuest('guest-1');
    WeddingStorageService.saveSettings({ brandName: 'X', supportEmail: 'x@x.pt', supportPhone: '1' });

    WeddingStorageService.resetToSeed();

    expect(WeddingStorageService.getGuests()).toHaveLength(14);
    expect(localStorage.getItem(KEY_SETTINGS)).toBeNull();
    expect(WeddingStorageService.getSettings().brandName).toBe('Aura Nupcial');
  });
});

describe('migrações no arranque', () => {
  it('backfill: eventos sem occasion passam a casamento', () => {
    const { occasion: _omit, ...semOccasion } = SEED_EVENTS[0];
    localStorage.setItem(KEY_EVENTS, JSON.stringify([{ ...semOccasion }]));

    WeddingStorageService.init();

    expect(WeddingStorageService.getEvents()[0].occasion).toBe('casamento');
  });

  it('evento seed Sofia & André em draft é publicado (estava bloqueado por engano)', () => {
    const eventos = SEED_EVENTS.map((e) =>
      e.id === 'event-sofia-andre-2027' ? { ...e, status: 'draft' as const } : e
    );
    localStorage.setItem(KEY_EVENTS, JSON.stringify(eventos));

    WeddingStorageService.init();

    const sofia = WeddingStorageService.getEventById('event-sofia-andre-2027');
    expect(sofia?.status).toBe('active');
  });

  it('fotos com URLs antigas de assets são corrigidas; dataURLs nunca são tocadas', () => {
    const eventos = [
      {
        ...SEED_EVENTS[0],
        heroPhoto: 'https://old.example/wedding_couple_editorial_hero.jpg',
        gallery: [
          { id: 'g1', url: 'data:image/jpeg;base64,ABC123' },
          { id: 'g2', url: 'https://old.example/wedding_couple_intimate_2.jpg' }
        ]
      }
    ];
    localStorage.setItem(KEY_EVENTS, JSON.stringify(eventos));

    WeddingStorageService.init();

    const migrado = WeddingStorageService.getEvents()[0];
    expect(migrado.heroPhoto).toBe(heroPhotoUrl);
    expect(migrado.gallery[0].url).toBe('data:image/jpeg;base64,ABC123');
    expect(migrado.gallery[1].url).toBe(intimatePhotoUrl);
  });

  it('paleta desalinhada do template antigo é corrigida no arranque', () => {
    // Antigo bug: o admin gravava só templateId e a paleta não mudava.
    const eventos = [{ ...SEED_EVENTS[0], templateId: 'romance-rose' as const, paletteId: 'sage' as const }];
    localStorage.setItem(KEY_EVENTS, JSON.stringify(eventos));

    WeddingStorageService.init();

    const depois = WeddingStorageService.getEvents()[0];
    expect(depois.templateId).toBe('romance-rose');
    expect(depois.paletteId).toBe('romance');
  });

  it('eventos já coerentes não são tocados pela migração de paleta', () => {
    const antes = JSON.stringify(WeddingStorageService.getEvents());
    WeddingStorageService.init();
    expect(JSON.stringify(WeddingStorageService.getEvents())).toBe(antes);
  });
});

describe('casais', () => {
  it('saveCouple faz upsert e getCoupleById encontra', () => {
    const novo = {
      id: 'couple-x',
      name: 'Teste & Par',
      email: 'teste@exemplo.com',
      phone: '900',
      createdAt: '2026-01-01',
      plan: 'essential' as const,
      activeEventId: '',
      status: 'active' as const,
      paymentStatus: 'pending' as const,
      password: ''
    };
    WeddingStorageService.saveCouple(novo);
    expect(WeddingStorageService.getCoupleById('couple-x')?.name).toBe('Teste & Par');

    WeddingStorageService.saveCouple({ ...novo, name: 'Alterado' });
    const todos = WeddingStorageService.getCouples().filter((c) => c.id === 'couple-x');
    expect(todos).toHaveLength(1);
    expect(todos[0].name).toBe('Alterado');
  });

  it('setClientStatus e setPaymentStatus alteram o estado', () => {
    WeddingStorageService.setClientStatus('couple-mariana-pedro', 'suspended');
    expect(WeddingStorageService.getCoupleById('couple-mariana-pedro')?.status).toBe('suspended');

    WeddingStorageService.setPaymentStatus('couple-mariana-pedro', 'paid');
    expect(WeddingStorageService.getCoupleById('couple-mariana-pedro')?.paymentStatus).toBe('paid');
  });

  it('deleteCouple remove o casal', () => {
    WeddingStorageService.deleteCouple('couple-joana-miguel');
    expect(WeddingStorageService.getCoupleById('couple-joana-miguel')).toBeUndefined();
    expect(WeddingStorageService.getCouples()).toHaveLength(2);
  });
});

describe('eventos', () => {
  it('getEventBySlug ignora maiúsculas/miniúsculas', () => {
    expect(WeddingStorageService.getEventBySlug('MARIANA-PEDRO')?.id).toBe('event-mariana-pedro-2027');
    expect(WeddingStorageService.getEventBySlug('mariana-pedro')?.id).toBe('event-mariana-pedro-2027');
  });

  it('setEventStatus publica e retira do ar', () => {
    WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'draft');
    expect(WeddingStorageService.getEventById('event-mariana-pedro-2027')?.status).toBe('draft');

    WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'active');
    expect(WeddingStorageService.getEventById('event-mariana-pedro-2027')?.status).toBe('active');
  });

  it('deleteEvent remove o evento', () => {
    WeddingStorageService.deleteEvent('event-joana-miguel-2026');
    expect(WeddingStorageService.getEventById('event-joana-miguel-2026')).toBeUndefined();
    expect(WeddingStorageService.getEvents()).toHaveLength(2);
  });

  it('deleteEvent apaga em cascata os convidados e limpa a referência do casal', () => {
    expect(WeddingStorageService.getGuestsByEventId('event-joana-miguel-2026').length).toBeGreaterThan(0);

    WeddingStorageService.deleteEvent('event-joana-miguel-2026');

    expect(WeddingStorageService.getGuestsByEventId('event-joana-miguel-2026')).toHaveLength(0);
    expect(WeddingStorageService.getCoupleById('couple-joana-miguel')?.activeEventId).toBe('');
    expect(WeddingStorageService.getGuestsByEventId('event-mariana-pedro-2027').length).toBeGreaterThan(0);
  });

  it('deleteCouple apaga em cascata os eventos e convidados do casal', () => {
    WeddingStorageService.deleteCouple('couple-joana-miguel');

    expect(WeddingStorageService.getCoupleById('couple-joana-miguel')).toBeUndefined();
    expect(WeddingStorageService.getEventById('event-joana-miguel-2026')).toBeUndefined();
    expect(WeddingStorageService.getGuestsByEventId('event-joana-miguel-2026')).toHaveLength(0);
    expect(WeddingStorageService.getCouples()).toHaveLength(2);
    expect(WeddingStorageService.getEvents()).toHaveLength(2);
    expect(WeddingStorageService.getGuests().length).toBeGreaterThan(0);
  });
});

describe('convidados', () => {
  it('getGuestsByEventId filtra por evento', () => {
    const doCasal = WeddingStorageService.getGuestsByEventId('event-mariana-pedro-2027');
    expect(doCasal.length).toBeGreaterThan(0);
    expect(doCasal.every((g) => g.eventId === 'event-mariana-pedro-2027')).toBe(true);
  });

  it('getGuestByToken resolve token com maiúsculas e regista o acesso', () => {
    const antes = WeddingStorageService.getGuests().find((g) => g.id === 'guest-1')!;
    const accessCountAntes = antes.accessCount || 0;

    const { event, guest } = WeddingStorageService.getGuestByToken('MARIANA-PEDRO', '8fk92ksp');

    expect(event?.id).toBe('event-mariana-pedro-2027');
    expect(guest?.id).toBe('guest-1');

    const depois = WeddingStorageService.getGuests().find((g) => g.id === 'guest-1')!;
    expect(depois.accessCount).toBe(accessCountAntes + 1);
    expect(depois.accessedAt).toBeTruthy();
  });

  it('getGuestByToken devolve sem convidado para token ou slug errados', () => {
    // Slug válido, token errado → evento encontrado, convidado não
    const semToken = WeddingStorageService.getGuestByToken('mariana-pedro', 'NAOEXISTE');
    expect(semToken.event).toBeDefined();
    expect(semToken.guest).toBeUndefined();

    // Slug inexistente → objecto completamente vazio
    expect(WeddingStorageService.getGuestByToken('slug-inexistente', '8Fk92KsP')).toEqual({});
  });

  it('saveGuest faz upsert e deleteGuest remove', () => {
    const novo = {
      id: 'guest-x',
      eventId: 'event-mariana-pedro-2027',
      name: 'Convidado Novo',
      salutationType: 'individual' as const,
      token: 'NOVO1234',
      maxGuests: 1,
      confirmedGuests: 0,
      rsvpStatus: 'pending' as const,
      accessCount: 0,
      qrStatus: 'active' as const
    };
    WeddingStorageService.saveGuest(novo);
    expect(WeddingStorageService.getGuests().find((g) => g.id === 'guest-x')?.name).toBe('Convidado Novo');

    WeddingStorageService.deleteGuest('guest-x');
    expect(WeddingStorageService.getGuests().find((g) => g.id === 'guest-x')).toBeUndefined();
  });
});

describe('RSVP (updateRsvp)', () => {
  it('grava estado, acompanhantes, grupo, notas e data', () => {
    const antes = WeddingStorageService.getGuests().find((g) => g.id === 'guest-2')!;
    expect(antes.rsvpStatus).toBe('pending');

    const result = WeddingStorageService.updateRsvp({
      guestId: 'guest-2',
      rsvpStatus: 'confirmed',
      confirmedGuests: 3,
      companions: ['Maria Silva', 'João Silva'],
      group: 'Noiva',
      notes: 'Estaremos lá!',
      dietaryRestrictions: 'Vegetariano'
    });

    expect(result.success).toBe(true);
    const depois = WeddingStorageService.getGuests().find((g) => g.id === 'guest-2')!;
    expect(depois.rsvpStatus).toBe('confirmed');
    expect(depois.confirmedGuests).toBe(3);
    expect(depois.companions).toEqual(['Maria Silva', 'João Silva']);
    expect(depois.group).toBe('Noiva');
    expect(depois.rsvpNotes).toBe('Estaremos lá!');
    expect(depois.dietaryRestrictions).toBe('Vegetariano');
    expect(depois.rsvpDate).toBeTruthy();
  });

  it('limpa acompanhantes quando a resposta não é "confirmed"', () => {
    WeddingStorageService.updateRsvp({
      guestId: 'guest-2',
      rsvpStatus: 'confirmed',
      confirmedGuests: 2,
      companions: ['Alguém']
    });
    const comComp = WeddingStorageService.getGuests().find((g) => g.id === 'guest-2')!;
    expect(comComp.companions).toEqual(['Alguém']);

    WeddingStorageService.updateRsvp({
      guestId: 'guest-2',
      rsvpStatus: 'declined',
      confirmedGuests: 0,
      companions: ['Alguém']
    });
    const semComp = WeddingStorageService.getGuests().find((g) => g.id === 'guest-2')!;
    expect(semComp.rsvpStatus).toBe('declined');
    expect(semComp.companions).toEqual([]);
  });

  it('devolve success:false para convidado inexistente', () => {
    const result = WeddingStorageService.updateRsvp({
      guestId: 'nao-existe',
      rsvpStatus: 'confirmed',
      confirmedGuests: 1
    });
    expect(result.success).toBe(false);
    expect(result.guest).toBeUndefined();
  });
});

describe('check-in QR (validateQrCheckIn)', () => {
  it('token desconhecido → NOT_FOUND', () => {
    const result = WeddingStorageService.validateQrCheckIn('QUALQUER');
    expect(result.valid).toBe(false);
    expect(result.status).toBe('NOT_FOUND');
  });

  it('primeira leitura marca como usado; segunda → ALREADY_USED', () => {
    const ativo = WeddingStorageService.getGuests().find((g) => g.qrStatus === 'active')!;

    const primeira = WeddingStorageService.validateQrCheckIn(ativo.token, 'Mesa 1');
    expect(primeira.valid).toBe(true);
    expect(primeira.status).toBe('VALID');

    const depois = WeddingStorageService.getGuests().find((g) => g.id === ativo.id)!;
    expect(depois.qrStatus).toBe('used');
    expect(depois.qrScannedAt).toBeTruthy();
    expect(depois.qrScannedBy).toBe('Mesa 1');

    const segunda = WeddingStorageService.validateQrCheckIn(ativo.token);
    expect(segunda.valid).toBe(false);
    expect(segunda.status).toBe('ALREADY_USED');
    expect(segunda.message).toContain('já utilizado');
  });

  it('passe revogado → REVOKED (nunca entra)', () => {
    const convidado = WeddingStorageService.getGuests().find((g) => g.qrStatus === 'active')!;
    WeddingStorageService.saveGuest({ ...convidado, qrStatus: 'revoked' });

    const result = WeddingStorageService.validateQrCheckIn(convidado.token);
    expect(result.valid).toBe(false);
    expect(result.status).toBe('REVOKED');
  });

  it('aceita o URL completo do convite (como os QRs geram)', () => {
    const convidado = WeddingStorageService.getGuests().find((g) => g.qrStatus === 'active')!;
    const slug = WeddingStorageService.getEventById(convidado.eventId)!.slug;

    const result = WeddingStorageService.validateQrCheckIn(
      `https://auranupcial.pt/convite/${slug}/${convidado.token}`,
      'Portaria'
    );

    expect(result.valid).toBe(true);
    expect(result.status).toBe('VALID');
    expect(result.guest?.id).toBe(convidado.id);
  });

  it('aceita caminho relativo, barra final e query string', () => {
    const activos = WeddingStorageService.getGuests().filter((g) => g.qrStatus === 'active');
    const [primeiro, segundo, terceiro] = activos;
    const slug = WeddingStorageService.getEventById(primeiro.eventId)!.slug;

    const relativo = WeddingStorageService.validateQrCheckIn(`/convite/${slug}/${primeiro.token}`);
    expect(relativo.valid).toBe(true);

    const comBarras = WeddingStorageService.validateQrCheckIn(
      `https://auranupcial.pt/convite/${slug}/${segundo.token}/`
    );
    expect(comBarras.valid).toBe(true);

    const comQuery = WeddingStorageService.validateQrCheckIn(
      `https://auranupcial.pt/convite/${slug}/${terceiro.token}?utm=qr#topo`
    );
    expect(comQuery.valid).toBe(true);
  });

  it('URL com token errado continua a dar NOT_FOUND', () => {
    const result = WeddingStorageService.validateQrCheckIn(
      'https://auranupcial.pt/convite/mariana-pedro/NAOEXISTE'
    );
    expect(result.valid).toBe(false);
    expect(result.status).toBe('NOT_FOUND');
  });
});

describe('extractQrToken', () => {
  it('devolve o token puro intacto', () => {
    expect(extractQrToken('8Fk92KsP')).toBe('8Fk92KsP');
    expect(extractQrToken('  8Fk92KsP  ')).toBe('8Fk92KsP');
  });

  it('extrai o token do URL absoluto', () => {
    expect(extractQrToken('https://aura.pt/convite/mariana-pedro/8Fk92KsP')).toBe('8Fk92KsP');
  });

  it('extrai o token de caminhos relativos com query e hash', () => {
    expect(extractQrToken('convite/slug/ABC12345')).toBe('ABC12345');
    expect(extractQrToken('/convite/slug/ABC12345/')).toBe('ABC12345');
    expect(extractQrToken('/convite/slug/ABC12345?x=1#y')).toBe('ABC12345');
  });
});

describe('definições da plataforma', () => {
  it('devolve valores por omissão e guarda alterações', () => {
    expect(WeddingStorageService.getSettings().brandName).toBe('Aura Nupcial');

    WeddingStorageService.saveSettings({
      brandName: 'Outro Nome',
      supportEmail: 'novo@exemplo.com',
      supportPhone: '+244 900'
    });
    expect(WeddingStorageService.getSettings().brandName).toBe('Outro Nome');
  });
});

describe('planos (requestPlanChange + pagamento)', () => {
  it('upgrade Essential → Pro fica pendente; plan não muda antes do pagamento', () => {
    WeddingStorageService.requestPlanChange('couple-sofia-andre', 'pro');

    const c = WeddingStorageService.getCoupleById('couple-sofia-andre')!;
    expect(c.plan).toBe('essential');
    expect(c.pendingPlan).toBe('pro');
  });

  it('pedido de upgrade repetido é idempotente', () => {
    WeddingStorageService.requestPlanChange('couple-sofia-andre', 'pro');
    WeddingStorageService.requestPlanChange('couple-sofia-andre', 'pro');

    const c = WeddingStorageService.getCoupleById('couple-sofia-andre')!;
    expect(c.plan).toBe('essential');
    expect(c.pendingPlan).toBe('pro');
  });

  it('confirmação de pagamento activa o upgrade pendente', () => {
    WeddingStorageService.requestPlanChange('couple-sofia-andre', 'pro');
    WeddingStorageService.setPaymentStatus('couple-sofia-andre', 'paid');

    const c = WeddingStorageService.getCoupleById('couple-sofia-andre')!;
    expect(c.paymentStatus).toBe('paid');
    expect(c.plan).toBe('pro');
    expect(c.pendingPlan).toBeNull();
  });

  it('pagamento sem pedido pendente não altera o plano', () => {
    WeddingStorageService.setPaymentStatus('couple-joana-miguel', 'paid');

    const c = WeddingStorageService.getCoupleById('couple-joana-miguel')!;
    expect(c.paymentStatus).toBe('paid');
    expect(c.plan).toBe('essential');
    expect(c.pendingPlan).toBeFalsy();
  });

  it('downgrade Pro → Essential é imediato e limpa pedidos pendentes', () => {
    WeddingStorageService.requestPlanChange('couple-mariana-pedro', 'essential');

    const c = WeddingStorageService.getCoupleById('couple-mariana-pedro')!;
    expect(c.plan).toBe('essential');
    expect(c.pendingPlan).toBeFalsy();
  });
});

describe('generateRandomToken', () => {
  it('gera token de 8 caracteres com prefixo opcional', () => {
    expect(generateRandomToken()).toHaveLength(8);
    expect(generateRandomToken('guest')).toMatch(/^guest-[A-Za-z0-9]{8}$/);
  });

  it('gera tokens únicos (sem colisões em 500 gerações)', () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 500; i++) vistos.add(generateRandomToken());
    expect(vistos.size).toBe(500);
  });

  it('não usa caracteres ambíguos (0, O, 1, l, I)', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateRandomToken()).not.toMatch(/[0OlI]/);
    }
  });
});
