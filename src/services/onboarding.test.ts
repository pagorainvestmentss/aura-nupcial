import { describe, it, expect } from 'vitest';
import { createAccount, createBlankEvent, slugify } from './onboarding';
import { WeddingStorageService } from './weddingStorage';

describe('slugify', () => {
  it('converte nomes com acentos e "&" em slug legível', () => {
    expect(slugify('Mariana & Pedro')).toBe('mariana-pedro');
    expect(slugify('Ana & José')).toBe('ana-jose');
    expect(slugify('  Sofia   e  André  ')).toBe('sofia-e-andre');
  });

  it('devolve "convite" quando não há caracteres válidos', () => {
    expect(slugify('')).toBe('convite');
    expect(slugify('!!!')).toBe('convite');
  });
});

describe('createAccount', () => {
  const params = {
    name: 'Teste & Novo Casal',
    email: 'novo.casal@exemplo.com',
    whatsapp: '912 345 678',
    occasion: 'casamento' as const
  };

  it('valida nome, email e whatsapp em falta', () => {
    expect(createAccount({ ...params, name: '   ' }).ok).toBe(false);
    expect(createAccount({ ...params, email: 'sem-arroba' }).ok).toBe(false);
    expect(createAccount({ ...params, whatsapp: '  ' }).ok).toBe(false);
  });

  it('rejeita email duplicado', () => {
    const result = createAccount({ ...params, email: 'mariana.pedro@auranupcial.com' });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Já existe');
  });

  it('cria casal + evento em branco e persiste ambos', () => {
    const result = createAccount(params);

    expect(result.ok).toBe(true);
    const { couple, event } = result;
    expect(couple!.plan).toBe('starter'); // por omissão
    expect(couple!.paymentStatus).toBe('pending');
    expect(couple!.status).toBe('active');
    expect(couple!.activeEventId).toBe(event!.id);
    expect(event!.status).toBe('draft');
    expect(event!.occasion).toBe('casamento');
    expect(event!.slug).toBe('teste-novo-casal');

    // Persistidos no armazenamento
    expect(WeddingStorageService.getCoupleById(couple!.id)?.email).toBe('novo.casal@exemplo.com');
    expect(WeddingStorageService.getEventById(event!.id)?.id).toBe(event!.id);
  });

  it('plano pro/premium activam música e QR; starter mantém desactivados', () => {
    const pro = createAccount({ ...params, email: 'pro@exemplo.com', plan: 'pro' });
    expect(pro.couple!.plan).toBe('pro');
    expect(pro.event!.enableMusic).toBe(true);
    expect(pro.event!.enableQrValidation).toBe(true);

    const premium = createAccount({ ...params, email: 'premium@exemplo.com', plan: 'premium' });
    expect(premium.couple!.plan).toBe('premium');
    expect(premium.event!.enableMusic).toBe(true);
    expect(premium.event!.enableQrValidation).toBe(true);

    const starter = createAccount({ ...params, email: 'starter@exemplo.com', plan: 'starter' });
    expect(starter.couple!.plan).toBe('starter');
    expect(starter.event!.enableMusic).toBe(false);
    expect(starter.event!.enableQrValidation).toBe(false);
  });

  it('slug duplicado recebe sufixo numérico (nunca sobrescreve)', () => {
    const primeiro = createAccount({ ...params, email: 'um@exemplo.com' });
    const segundo = createAccount({ ...params, email: 'dois@exemplo.com' });

    expect(primeiro.event!.slug).toBe('teste-novo-casal');
    expect(segundo.event!.slug).toBe('teste-novo-casal-2');
    // ambos persistidos
    expect(WeddingStorageService.getEventBySlug('teste-novo-casal-2')?.id).toBe(segundo.event!.id);
  });
});

describe('createBlankEvent', () => {
  it('cria evento vazio (sem conteúdo demo) com prazo de RSVP a 90 dias', () => {
    const event = createBlankEvent('couple-x', 'noivado', 'starter', 'Fulano & Beltrana');

    expect(event.occasion).toBe('noivado');
    expect(event.gallery).toEqual([]);
    expect(event.timeline).toEqual([]);
    expect(event.guestManual).toEqual([]);
    expect(event.verse.text).toBe('');
    expect(event.brideName).toBe('');
    expect(event.groomName).toBe('');
    expect(event.status).toBe('draft');

    const dias = Math.round(
      (new Date(event.rsvpDeadline).getTime() - Date.now()) / 86400000
    );
    expect(dias).toBeGreaterThanOrEqual(89);
    expect(dias).toBeLessThanOrEqual(90);
  });
});
