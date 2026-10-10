import { WeddingEvent, Guest } from '../types/wedding';
import { eventNames } from '../data/occasions';

/**
 * ENVIO DE CONVITES POR WHATSAPP.
 *
 * Duas estratégias inteligentes:
 *  - Convidado com telefone válido → abre a conversa DIRECTAMENTE com ele
 *    (wa.me/244…) com a mensagem já escrita — o cliente só carrega em enviar.
 *  - Sem telefone (ou número ilegível) → abre o selector de contactos do
 *    WhatsApp (wa.me/?text=…) — o cliente escolhe com quem fala.
 */

/** Dígitos de um telefone para o formato wa.me (sem +, sem espaços). */
export function normalizePhone(raw: string): string | null {
  let digits = (raw || '').replace(/\D/g, '');
  if (!digits) return null;
  // 00244… ou +244… → 244…
  if (digits.startsWith('00')) digits = digits.slice(2);
  // Número local angolano (9 dígitos, começa por 9) → prefixo 244.
  if (digits.length === 9 && digits.startsWith('9')) digits = `244${digits}`;
  // 44… já com código, ou internacional longo — manter.
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

/**
 * Mensagem de convite personalizada: nome do convidado, nomes do casal,
 * ocasião, data, local, link privado e prazo RSVP (quando definido).
 */
export function guestInviteMessage(event: WeddingEvent, guest: Guest, inviteUrl: string): string {
  const names = eventNames(event) || 'Nós';

  const phrase =
    event.occasion === 'casamento'
      ? 'para o casamento'
      : event.occasion === 'noivado'
        ? 'para o noivado'
        : event.occasion === 'aniversario'
          ? 'para o aniversário'
          : 'para uma celebração especial';

  const parts = [`Olá ${guest.name}! ${names} convidam-vos ${phrase}`];

  if (event.dateDisplay) parts.push(`, a ${event.dateDisplay}`);
  if (event.locationDisplay) parts.push(`, em ${event.locationDisplay}`);
  parts.push(`. Confirmem a presença pelo convite: ${inviteUrl}`);

  const message = parts.join('');

  if (event.rsvpDeadline) {
    try {
      const prazo = new Date(event.rsvpDeadline).toLocaleDateString('pt-PT');
      return `${message} Respondam até ${prazo}.`;
    } catch {
      return message;
    }
  }
  return message;
}

/**
 * Link wa.me para partilhar o convite.
 * Com telefone → conversa directa; sem → selector de contactos.
 */
export function whatsappShareLink(phone: string | undefined, message: string): string {
  const digits = phone ? normalizePhone(phone) : null;
  const text = encodeURIComponent(message);
  if (digits) return `https://wa.me/${digits}?text=${text}`;
  return `https://wa.me/?text=${text}`;
}
