import { ColorPaletteId, WeddingEvent } from '../types/wedding';

export type TemplateId = WeddingEvent['templateId'];

/**
 * Catálogo de templates do admin → paleta que o convite realmente renderiza.
 * O campo `templateId` identifica o template no admin; a experiência do
 * convidado lê `paletteId` (ver `InvitationExperience`). Atribuir um
 * template tem de escrever AMBOS os campos — este mapa é a fonte única.
 */
export const TEMPLATE_TO_PALETTE: Record<TemplateId, ColorPaletteId> = {
  'botanical-sage': 'sage',
  'elegance-terracotta': 'terra',
  'classic-gold': 'classic',
  'romance-rose': 'romance'
};

export function paletteForTemplate(templateId: TemplateId): ColorPaletteId {
  return TEMPLATE_TO_PALETTE[templateId] ?? 'sage';
}
