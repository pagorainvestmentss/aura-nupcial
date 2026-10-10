import { describe, it, expect } from 'vitest';
import { normalizePhone, guestInviteMessage, whatsappShareLink } from './whatsapp';
import { DEFAULT_EVENT, SECOND_EVENT } from '../data/defaultWeddingData';
import { DEFAULT_GUESTS } from '../data/defaultWeddingData';

const guest = DEFAULT_GUESTS[0];

describe('normalizePhone — dígitos para o formato wa.me', () => {
  it('telefone local angolano ganha o prefixo 244', () => {
    expect(normalizePhone('940 989 328')).toBe('244940989328');
    expect(normalizePhone('912345678')).toBe('244912345678');
  });

  it('telefone já internacional é mantido sem o "+"/espaços', () => {
    expect(normalizePhone('+244 940 989 328')).toBe('244940989328');
    expect(normalizePhone('00244940989328')).toBe('244940989328');
    expect(normalizePhone('351 912 345 678')).toBe('351912345678');
  });

  it('campo vazio ou ilegível devolve null', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('abc')).toBeNull();
    expect(normalizePhone('123')).toBeNull();
  });
});

describe('guestInviteMessage — mensagem personalizada com nome do convidado', () => {
  it('inclui o nome do convidado, o casal, a data e o link', () => {
    const msg = guestInviteMessage(DEFAULT_EVENT, guest, 'https://x.test/convite/abc');
    expect(msg).toContain(`Olá ${guest.name}!`);
    expect(msg).toContain('Mariana & Pedro');
    expect(msg).toContain(DEFAULT_EVENT.dateDisplay);
    expect(msg).toContain('https://x.test/convite/abc');
    expect(msg).toContain('casamento');
  });

  it('inclui o prazo RSVP quando definido', () => {
    const msg = guestInviteMessage(DEFAULT_EVENT, guest, 'https://x.test/l');
    expect(msg).toMatch(/Respondam até \d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('aniversário usa a frase certa', () => {
    const aniv = { ...DEFAULT_EVENT, occasion: 'aniversario' as const };
    const msg = guestInviteMessage(aniv, guest, 'https://x.test/l');
    expect(msg).toContain('para o aniversário');
  });

  it('sem prazo não acrescenta a frase de prazo', () => {
    const semPrazo = { ...DEFAULT_EVENT, rsvpDeadline: '' };
    const msg = guestInviteMessage(semPrazo, guest, 'https://x.test/l');
    expect(msg).not.toContain('Respondam até');
  });

  it('evento sem nomes cai num "Nós" de reserva', () => {
    const vazio = { ...SECOND_EVENT, brideName: '', groomName: '' };
    const msg = guestInviteMessage(vazio, guest, 'https://x.test/l');
    expect(msg).toContain('Nós convidam-vos');
  });
});

describe('whatsappShareLink — directa com telefone, selector sem', () => {
  it('com telefone abre a conversa com o convidado', () => {
    const link = whatsappShareLink('+244 940 989 328', 'Olá!');
    expect(link.startsWith('https://wa.me/244940989328?text=')).toBe(true);
    expect(link).toContain(encodeURIComponent('Olá!'));
  });

  it('sem telefone abre o selector de contactos', () => {
    const link = whatsappShareLink(undefined, 'Olá!');
    expect(link.startsWith('https://wa.me/?text=')).toBe(true);
  });

  it('telefone ilegível cai no selector (nunca quebra)', () => {
    const link = whatsappShareLink('???', 'Olá!');
    expect(link.startsWith('https://wa.me/?text=')).toBe(true);
  });
});
