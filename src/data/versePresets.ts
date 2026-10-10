import { isCoupleOccasion } from './occasions';
import { OccasionId, WeddingEvent } from '../types/wedding';

/**
 * EXEMPLOS CONJUGADOS DE VERSÍCULO E MENSAGEM FINAL.
 *
 * Cada preset é um PAR: o versículo (ou mensagem especial) e a mensagem
 * final do casal foram escritos para conversar entre si — o cliente escolhe
 * um tema e os três campos enchem-se de uma vez, sem esforço.
 *
 * Regras:
 *  - Sem nomes do casal nos textos: se o cliente mudar nomes depois, a
 *    mensagem continua correcta.
 *  - Textos em PT-PT, neutros (Angola/Portugal).
 *  - `applyVersePreset` só toca em verse.text/citation e coupleMessage.body —
 *    o resto do formulário (título, assinatura, nomes…) fica intacto.
 */
export interface VersePreset {
  id: string;
  /** Etiqueta curta do cartão (ex.: 'Amor e união'). */
  theme: string;
  /** Versículo (casal) ou mensagem especial (celebrações). */
  text: string;
  /** Referência bíblica ou autor da mensagem. */
  reference: string;
  /** Mensagem final do casal — conjugada com o texto acima. */
  message: string;
}

/** Casamento e noivado — versículos bíblicos com mensagem final em pares. */
export const COUPLE_VERSE_PRESETS: VersePreset[] = [
  {
    id: 'amor-paciente',
    theme: 'Amor e união',
    text: 'O amor é paciente, é benigno… Tudo sofre, tudo crê, tudo espera, tudo suporta.',
    reference: '1 Coríntios 13:4-7',
    message:
      'Que o amor paciente que nos trouxe até aqui continue a ser o alicerce de todos os nossos dias.'
  },
  {
    id: 'uniao-por-deus',
    theme: 'Casamento por Deus',
    text: 'Assim, já não são dois, mas uma só carne. Portanto, o que Deus uniu, não o separe o homem.',
    reference: 'Mateus 19:6',
    message:
      'Unidos por Deus e cheios de gratidão, contamos consigo para abençoar o início da nossa vida a dois.'
  },
  {
    id: 'caminhada-a-dois',
    theme: 'Caminhada a dois',
    text: 'Para onde fores, irei; onde pousares, pousarei. O teu povo será o meu povo, e o teu Deus o meu Deus.',
    reference: 'Rute 1:16',
    message:
      'Prometemos caminhar juntos para onde a vida nos levar — com fé, lealdade e o coração na mesma direcção.'
  },
  {
    id: 'corda-de-tres',
    theme: 'Força e futuro',
    text: 'Uma corda de três dobras não se rompe depressa.',
    reference: 'Eclesiastes 4:12',
    message:
      'A nossa corda de três dobras — nós e Deus — é a nossa promessa de nunca enfrentar sozinhos os dias que virão.'
  },
  {
    id: 'bênção-de-aarão',
    theme: 'Bênção e paz',
    text: 'O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti.',
    reference: 'Números 6:24-25',
    message:
      'Recebemos este dia com o coração cheio de paz, e pedimos a mesma bênção sobre todos que nos amam.'
  },
  {
    id: 'amor-inextinguível',
    theme: 'Amor que permanece',
    text: 'As águas grandes não podem apagar o amor, nem os rios chegarão sobre ele.',
    reference: 'Cânticos 8:7',
    message:
      'Muitas águas passarão, e o nosso amor continuará exactamente aqui — firme, inteiro e para sempre.'
  }
];

/** Aniversário e outras celebrações — mensagens especiais com autor. */
export const SOLO_VERSE_PRESETS: VersePreset[] = [
  {
    id: 'momentos-para-sempre',
    theme: 'Momentos que ficam',
    text: 'Há momentos que a memória guarda para sempre e o coração leva por toda a vida.',
    reference: 'Provérbio popular',
    message:
      'Queremos celebrar este dia cercados de quem faz parte desses momentos — incluindo você.'
  },
  {
    id: 'felicidade-propria',
    theme: 'Alegria de viver',
    text: 'A felicidade não é algo pronto. Vem das vossas próprias acções.',
    reference: 'Dalai Lama',
    message:
      'Comemoramos mais um ano de histórias, conquistas e alegria — e queremos partilhá-la consigo.'
  },
  {
    id: 'novo-capitulo',
    theme: 'Novos começos',
    text: 'Cada dia é uma nova oportunidade para ser feliz.',
    reference: 'Charlie Chaplin',
    message:
      'Mais um ano a começar, e melhor forma de começar do que reunir os nossos num só lugar.'
  },
  {
    id: 'gratidao',
    theme: 'Gratidão',
    text: 'A gratidão transforma o que temos em abundância.',
    reference: 'Melody Beattie',
    message:
      'Gratos pela vida e por cada pessoa que a enche de sentido, celebramos à nossa maneira — consigo.'
  }
];

/** Lista certa para a ocasião do evento. */
export function getVersePresets(occasion: OccasionId): VersePreset[] {
  return isCoupleOccasion(occasion) ? COUPLE_VERSE_PRESETS : SOLO_VERSE_PRESETS;
}

/**
 * Aplica um preset ao formulário: preenche versículo, referência e mensagem
 * final, preservando título e assinatura da mensagem e todo o resto do form.
 */
export function applyVersePreset(form: WeddingEvent, preset: VersePreset): WeddingEvent {
  return {
    ...form,
    verse: {
      text: preset.text,
      citation: preset.reference
    },
    coupleMessage: {
      ...form.coupleMessage,
      body: preset.message
    }
  };
}

/** O preset está exactamente o que está aplicado no formulário? (estado "em uso") */
export function isPresetActive(form: WeddingEvent, preset: VersePreset): boolean {
  return (
    form.verse.text === preset.text &&
    form.verse.citation === preset.reference &&
    form.coupleMessage.body === preset.message
  );
}
