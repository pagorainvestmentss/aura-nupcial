import { describe, it, expect } from 'vitest';
import { TEMPLATE_TO_PALETTE, paletteForTemplate, TemplateId } from './templates';
import { COLOR_PALETTES } from './palettes';
import { WeddingEvent } from '../types/wedding';

const TODOS_TEMPLATE_IDS: TemplateId[] = [
  'botanical-sage',
  'elegance-terracotta',
  'classic-gold',
  'romance-rose'
];

describe('templates → paletas', () => {
  it('o mapa cobre exactamente os quatro templates do catálogo', () => {
    expect(Object.keys(TEMPLATE_TO_PALETTE).sort()).toEqual([...TODOS_TEMPLATE_IDS].sort());
  });

  it('cada template aponta para uma paleta existente', () => {
    for (const id of TODOS_TEMPLATE_IDS) {
      expect(COLOR_PALETTES[paletteForTemplate(id)]).toBeTruthy();
    }
  });

  it('os pares do mapa coincidem com os pares do seed', () => {
    expect(paletteForTemplate('botanical-sage')).toBe('sage');
    expect(paletteForTemplate('elegance-terracotta')).toBe('terra');
    expect(paletteForTemplate('classic-gold')).toBe('classic');
    expect(paletteForTemplate('romance-rose')).toBe('romance');
  });

  it('template desconhecido cai para a paleta base (sage)', () => {
    expect(paletteForTemplate('qualquer-coisa' as TemplateId)).toBe('sage');
  });

  it('é sempre um ColorPaletteId válido', () => {
    const validos = Object.keys(COLOR_PALETTES);
    for (const id of TODOS_TEMPLATE_IDS) {
      expect(validos).toContain(paletteForTemplate(id));
    }
  });

  it('tipo WeddingEvent aceita templateId e paletteId em conjunto', () => {
    const evento = { templateId: 'romance-rose', paletteId: paletteForTemplate('romance-rose') } as Pick<
      WeddingEvent,
      'templateId' | 'paletteId'
    >;
    expect(evento.paletteId).toBe('romance');
  });
});
