import { Cake, Gem, Heart, Sparkles, type LucideIcon } from 'lucide-react';
import { OccasionId, WeddingEvent } from '../types/wedding';

/**
 * As 4 ocasiões suportadas pela Aura Nupcial.
 * Cada ocasião define: copy pública (landing), rótulos do formulário,
 * frases do convite e textos por defeito para um evento em branco.
 * A estrutura de dados (WeddingEvent) NUNCA muda — só muda a apresentação.
 */
export interface OccasionDef {
  id: OccasionId;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  /** Hero do convite (SaveTheDateSection) */
  hero: {
    kicker: string;
    title: string;
  };
  /** Rótulos de todos os campos/formulários */
  labels: {
    navData: string;
    pageTitle: string;
    clientArea: string;
    areaShort: string;
    peopleSection: string;
    person1: string;
    person2: string;
    conjunction: string;
    monogram: string;
    date: string;
    location: string;
    verseSection: string;
    verse: string;
    verseCitation: string;
    intro: string;
    messageFinal: string;
    ceremonySection: string;
    ceremonyVenue: string;
    ceremonyTime: string;
    ceremonyAddress: string;
    ceremonyMaps: string;
    receptionVenue: string;
    receptionTime: string;
    receptionAddress: string;
    receptionMaps: string;
    declarationTitle: string;
    declarationGroomRole: string;
    declarationBrideRole: string;
    rsvpMessageLabel: string;
    /** Pergunta de grupo no RSVP (ex.: "Escolha o grupo"). */
    groupSection: string;
    /** Opções de grupo; vazio → o campo não aparece no RSVP. */
    groupOptions: string[];
  };
  /** Frases do convite formal — {names} é substituído pelos nomes do evento */
  phrases: {
    none: string;
    family: string;
    couple: string;
    individual: string;
  };
  /** Textos por defeito de um evento em branco */
  defaults: {
    invitationIntro: string;
    coupleMessageTitle: string;
    coupleMessageSignOff: string;
    ceremonyTitle: string;
    receptionTitle: string;
  };
}

export const OCCASIONS: Record<OccasionId, OccasionDef> = {
  casamento: {
    id: 'casamento',
    label: 'Casamento',
    tagline: 'O "sim" para a vida',
    description: 'Um convite digital à altura do grande dia, com RSVP e check-in por QR.',
    icon: Heart,
    hero: {
      kicker: 'SAVE THE DATE',
      title: 'NOSSO CASAMENTO'
    },
    labels: {
      navData: 'Dados do casamento',
      pageTitle: 'Dados do casamento',
      clientArea: 'A área dos noivos',
      areaShort: 'Área dos noivos',
      peopleSection: 'O casal e a data',
      person1: 'Nome da noiva',
      person2: 'Nome do noivo',
      conjunction: 'Junção',
      monogram: 'Monograma',
      date: 'Data',
      location: 'Localização',
      verseSection: 'Versículo e convite',
      verse: 'Versículo',
      verseCitation: 'Referência do versículo',
      intro: 'Texto de convite',
      messageFinal: 'Mensagem final do casal',
      ceremonySection: 'Cerimónia e recepção',
      ceremonyVenue: 'Local da cerimónia',
      ceremonyTime: 'Hora da cerimónia',
      ceremonyAddress: 'Morada da cerimónia',
      ceremonyMaps: 'Link do mapa (cerimónia)',
      receptionVenue: 'Local da recepção',
      receptionTime: 'Hora da recepção',
      receptionAddress: 'Morada da recepção',
      receptionMaps: 'Link do mapa (recepção)',
      declarationTitle: 'Nossas Declarações',
      declarationGroomRole: 'O Noivo',
      declarationBrideRole: 'A Noiva',
      rsvpMessageLabel: 'Mensagem para os Noivos',
      groupSection: 'Escolha o grupo',
      groupOptions: ['Noiva', 'Noivo']
    },
    phrases: {
      none: '{names} têm a honra de contar com a sua distinta presença neste dia inesquecível.',
      family: '{names} contam com a vossa honrosa presença e o vosso abraço para celebrar este momento único.',
      couple: 'É com enorme carinho que {names} vos convidam para testemunhar a consagração do seu amor.',
      individual: 'É com imensa alegria no coração que {names} contam com a sua presença indispensável neste dia tão especial.'
    },
    defaults: {
      invitationIntro: 'Têm a alegria de convidar os seus familiares e amigos para testemunhar a celebração do seu casamento',
      coupleMessageTitle: 'Recado dos Noivos',
      coupleMessageSignOff: 'Com todo o nosso carinho e gratidão,',
      ceremonyTitle: 'Cerimónia',
      receptionTitle: 'Recepção'
    }
  },
  noivado: {
    id: 'noivado',
    label: 'Noivado',
    tagline: 'O começo do "sim"',
    description: 'Celebre a sua decisão com um convite elegante para família e amigos.',
    icon: Gem,
    hero: {
      kicker: 'SAVE THE DATE',
      title: 'O NOSSO NOIVADO'
    },
    labels: {
      navData: 'Dados do noivado',
      pageTitle: 'Dados do noivado',
      clientArea: 'A área dos noivos',
      areaShort: 'Área dos noivos',
      peopleSection: 'Os noivos e a data',
      person1: 'Nome da noiva',
      person2: 'Nome do noivo',
      conjunction: 'Junção',
      monogram: 'Monograma',
      date: 'Data',
      location: 'Localização',
      verseSection: 'Versículo e convite',
      verse: 'Versículo',
      verseCitation: 'Referência do versículo',
      intro: 'Texto de convite',
      messageFinal: 'Mensagem final do casal',
      ceremonySection: 'Celebração e festa',
      ceremonyVenue: 'Local da celebração',
      ceremonyTime: 'Hora da celebração',
      ceremonyAddress: 'Morada da celebração',
      ceremonyMaps: 'Link do mapa (celebração)',
      receptionVenue: 'Local da festa',
      receptionTime: 'Hora da festa',
      receptionAddress: 'Morada da festa',
      receptionMaps: 'Link do mapa (festa)',
      declarationTitle: 'Nossas Declarações',
      declarationGroomRole: 'O Noivo',
      declarationBrideRole: 'A Noiva',
      rsvpMessageLabel: 'Mensagem para os Noivos',
      groupSection: 'Escolha o grupo',
      groupOptions: ['Noiva', 'Noivo']
    },
    phrases: {
      none: '{names} têm a honra de contar com a sua distinta presença neste dia tão especial.',
      family: '{names} contam com a vossa honrosa presença para celebrar o início da sua caminhada a dois.',
      couple: 'É com enorme carinho que {names} vos convidam para celebrarem a sua decisão de dar o sim.',
      individual: 'É com imensa alegria no coração que {names} contam com a sua presença indispensável neste dia tão especial.'
    },
    defaults: {
      invitationIntro: 'Têm o prazer de convidar os seus familiares e amigos para celebrarem a sua decisão de dar o sim',
      coupleMessageTitle: 'Recado dos Noivos',
      coupleMessageSignOff: 'Com todo o nosso carinho,',
      ceremonyTitle: 'Celebração',
      receptionTitle: 'Festa'
    }
  },
  aniversario: {
    id: 'aniversario',
    label: 'Aniversário',
    tagline: 'Mais um ano a celebrar',
    description: 'Reúna quem ama num convite digital com confirmação de presença.',
    icon: Cake,
    hero: {
      kicker: 'FAÇA-SE PRESENTE',
      title: 'UM ANO A MAIS'
    },
    labels: {
      navData: 'Dados do aniversário',
      pageTitle: 'Dados do aniversário',
      clientArea: 'A área do aniversariante',
      areaShort: 'Área do aniversariante',
      peopleSection: 'Quem celebra e a data',
      person1: 'Nome do aniversariante',
      person2: 'Nome de quem acompanha (opcional)',
      conjunction: 'Junção',
      monogram: 'Monograma',
      date: 'Data',
      location: 'Localização',
      verseSection: 'Mensagem e convite',
      verse: 'Mensagem especial',
      verseCitation: 'Autor da mensagem',
      intro: 'Texto de convite',
      messageFinal: 'Mensagem final do aniversariante',
      ceremonySection: 'Celebração e festa',
      ceremonyVenue: 'Local principal',
      ceremonyTime: 'Hora da celebração',
      ceremonyAddress: 'Morada da celebração',
      ceremonyMaps: 'Link do mapa (celebração)',
      receptionVenue: 'Local da festa',
      receptionTime: 'Hora da festa',
      receptionAddress: 'Morada da festa',
      receptionMaps: 'Link do mapa (festa)',
      declarationTitle: 'Palavras do Coração',
      declarationGroomRole: 'Quem Acompanha',
      declarationBrideRole: 'O Aniversariante',
      rsvpMessageLabel: 'Mensagem para o Aniversariante',
      groupSection: 'Escolha o grupo',
      groupOptions: []
    },
    phrases: {
      none: '{names} tem o prazer de contar com a sua presença neste dia tão especial.',
      family: '{names} convidam-vos para celebrar juntos mais um ano de vida.',
      couple: 'É com enorme carinho que {names} vos convidam para celebrar este dia tão especial.',
      individual: 'É com imensa alegria no coração que {names} conta com a sua presença neste dia tão especial.'
    },
    defaults: {
      invitationIntro: 'Convida os seus familiares e amigos para celebrar mais um ano de vida',
      coupleMessageTitle: 'Recado do Aniversariante',
      coupleMessageSignOff: 'Com carinho,',
      ceremonyTitle: 'Celebração',
      receptionTitle: 'Festa'
    }
  },
  outra: {
    id: 'outra',
    label: 'Outra celebração',
    tagline: 'Batizado, jantar, empresa…',
    description: 'Qualquer merece um convite digital caprichado, com RSVP à mão.',
    icon: Sparkles,
    hero: {
      kicker: 'FAÇA-SE PRESENTE',
      title: 'CELEBRE CONNOSCO'
    },
    labels: {
      navData: 'Dados da celebração',
      pageTitle: 'Dados da celebração',
      clientArea: 'A área do anfitrião',
      areaShort: 'Área do anfitrião',
      peopleSection: 'Anfitriões e data',
      person1: 'Nome do anfitrião',
      person2: 'Nome do anfitrião 2 (opcional)',
      conjunction: 'Junção',
      monogram: 'Monograma',
      date: 'Data',
      location: 'Localização',
      verseSection: 'Mensagem e convite',
      verse: 'Mensagem especial',
      verseCitation: 'Autor da mensagem',
      intro: 'Texto de convite',
      messageFinal: 'Mensagem final dos anfitriões',
      ceremonySection: 'Celebração e festa',
      ceremonyVenue: 'Local principal',
      ceremonyTime: 'Hora da celebração',
      ceremonyAddress: 'Morada da celebração',
      ceremonyMaps: 'Link do mapa (celebração)',
      receptionVenue: 'Local da festa',
      receptionTime: 'Hora da festa',
      receptionAddress: 'Morada da festa',
      receptionMaps: 'Link do mapa (festa)',
      declarationTitle: 'Palavras do Coração',
      declarationGroomRole: 'Anfitrião',
      declarationBrideRole: 'Anfitriã',
      rsvpMessageLabel: 'Mensagem para os Anfitriões',
      groupSection: 'Escolha o grupo',
      groupOptions: []
    },
    phrases: {
      none: '{names} têm o prazer de contar com a sua presença neste dia tão especial.',
      family: '{names} convidam-vos para celebrar connosco este dia tão especial.',
      couple: 'É com enorme carinho que {names} vos convidam para celebrar este dia tão especial.',
      individual: 'É com imensa alegria no coração que {names} contam com a sua presença neste dia tão especial.'
    },
    defaults: {
      invitationIntro: 'Convidam os seus familiares e amigos para celebrarem este dia tão especial',
      coupleMessageTitle: 'Recado dos Anfitriões',
      coupleMessageSignOff: 'Com carinho,',
      ceremonyTitle: 'Celebração',
      receptionTitle: 'Festa'
    }
  }
};

/** Casamento/noivado → copy de casal (undefined conta como casamento, por herança de dados antigos). */
export function isCoupleOccasion(id?: OccasionId): boolean {
  const key = id && OCCASIONS[id] ? id : 'casamento';
  return key === 'casamento' || key === 'noivado';
}

export const OCCASION_LIST: OccasionDef[] = [
  OCCASIONS.casamento,
  OCCASIONS.noivado,
  OCCASIONS.aniversario,
  OCCASIONS.outra
];

export function getOccasion(id?: OccasionId): OccasionDef {
  return (id && OCCASIONS[id]) || OCCASIONS.casamento;
}

/** Nome completo do evento, sem junção pendente quando só há uma pessoa. */
export function eventNames(event: Pick<WeddingEvent, 'brideName' | 'conjunction' | 'groomName'>): string {
  const parts = [event.brideName, event.groomName].filter((p) => p && p.trim());
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const conj = event.conjunction && event.conjunction.trim() ? event.conjunction : '&';
  return `${parts[0]} ${conj} ${parts[1]}`;
}

/**
 * Nome de reserva quando o evento ainda não tem nomes (pré-visualização).
 * Escolhido para concordar com os verbos das frases da ocasião.
 */
export function fallbackNames(occasion: OccasionId): string {
  switch (occasion) {
    case 'aniversario':
      return 'o aniversariante';
    case 'outra':
      return 'os anfitriões';
    default:
      return 'os noivos';
  }
}

/** Frase do convite formal com {names} substituído. */
export function formalPhrase(occasion: OccasionId, key: keyof OccasionDef['phrases'], names: string): string {
  return getOccasion(occasion).phrases[key].replace('{names}', names);
}
