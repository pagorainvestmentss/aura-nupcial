import { describe, it, expect } from 'vitest';
import {
  COUPLE_VERSE_PRESETS,
  SOLO_VERSE_PRESETS,
  getVersePresets,
  applyVersePreset,
  isPresetActive,
  VersePreset
} from './versePresets';
import { DEFAULT_EVENT } from './defaultWeddingData';

const ALL: VersePreset[] = [...COUPLE_VERSE_PRESETS, ...SOLO_VERSE_PRESETS];

describe('versePresets — pares conjugados de versículo e mensagem final', () => {
  it('ids são únicos em todas as listas', () => {
    const ids = ALL.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos os presets têm tema, texto, referência e mensagem', () => {
    for (const p of ALL) {
      expect(p.theme.trim()).not.toBe('');
      expect(p.text.trim()).not.toBe('');
      expect(p.reference.trim()).not.toBe('');
      expect(p.message.trim()).not.toBe('');
    }
  });

  it('casamento e noivado recebem a lista de casal', () => {
    expect(getVersePresets('casamento')).toBe(COUPLE_VERSE_PRESETS);
    expect(getVersePresets('noivado')).toBe(COUPLE_VERSE_PRESETS);
  });

  it('aniversário e outra recebem a lista de celebrações', () => {
    expect(getVersePresets('aniversario')).toBe(SOLO_VERSE_PRESETS);
    expect(getVersePresets('outra')).toBe(SOLO_VERSE_PRESETS);
  });

  it('applyVersePreset preenche versículo, referência e mensagem final', () => {
    const base = DEFAULT_EVENT;
    const preset = COUPLE_VERSE_PRESETS[2];
    const next = applyVersePreset(base, preset);

    expect(next.verse.text).toBe(preset.text);
    expect(next.verse.citation).toBe(preset.reference);
    expect(next.coupleMessage.body).toBe(preset.message);
  });

  it('applyVersePreset preserva título, assinatura e o resto do form', () => {
    const base = DEFAULT_EVENT;
    const next = applyVersePreset(base, SOLO_VERSE_PRESETS[0]);

    expect(next.coupleMessage.title).toBe(base.coupleMessage.title);
    expect(next.coupleMessage.signOff).toBe(base.coupleMessage.signOff);
    expect(next.brideName).toBe(base.brideName);
    expect(next.groomName).toBe(base.groomName);
    expect(next.invitationIntro).toBe(base.invitationIntro);
    expect(next.ceremony).toEqual(base.ceremony);
  });

  it('isPresetActive detecta o preset aplicado e o estado vazio', () => {
    const base = DEFAULT_EVENT;
    const preset = COUPLE_VERSE_PRESETS[0];

    const empty = { ...base, verse: { text: '', citation: '' }, coupleMessage: { ...base.coupleMessage, body: '' } };
    expect(isPresetActive(empty, preset)).toBe(false);

    const applied = applyVersePreset(base, preset);
    expect(isPresetActive(applied, preset)).toBe(true);
    expect(isPresetActive(applied, COUPLE_VERSE_PRESETS[1])).toBe(false);
  });
});
