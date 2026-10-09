import { Couple, WeddingEvent, Guest } from '../types/wedding';

// High-fidelity image paths generated for this wedding experience
import heroPhotoUrl from '../assets/images/couple_editorial.jpg';
import intimatePhotoUrl from '../assets/images/couple_intimate.jpg';
import ringsPhotoUrl from '../assets/images/wedding_rings_couple.jpg';
import paperTextureUrl from '../assets/images/luxury_paper_texture_1791141333707.jpg';

export { heroPhotoUrl, intimatePhotoUrl, ringsPhotoUrl, paperTextureUrl };

export const DEFAULT_COUPLE: Couple = {
  id: 'couple-mariana-pedro',
  name: 'Mariana & Pedro',
  email: 'mariana.pedro@auranupcial.com',
  phone: '+244 923 000 111',
  createdAt: '2026-08-15',
  plan: 'pro',
  activeEventId: 'event-mariana-pedro-2027',
  status: 'active',
  paymentStatus: 'paid',
  password: 'demo123'
};

export const SECOND_COUPLE: Couple = {
  id: 'couple-sofia-andre',
  name: 'Sofia & André',
  email: 'sofia.andre@auranupcial.com',
  phone: '+351 912 444 555',
  createdAt: '2026-09-02',
  plan: 'starter',
  activeEventId: 'event-sofia-andre-2027',
  status: 'active',
  paymentStatus: 'pending',
  password: 'demo123'
};

export const THIRD_COUPLE: Couple = {
  id: 'couple-joana-miguel',
  name: 'Joana & Miguel',
  email: 'joana.miguel@auranupcial.com',
  phone: '+244 926 777 888',
  createdAt: '2026-06-20',
  plan: 'starter',
  activeEventId: 'event-joana-miguel-2026',
  status: 'active',
  paymentStatus: 'overdue',
  password: 'demo123'
};

export const SEED_COUPLES: Couple[] = [DEFAULT_COUPLE, SECOND_COUPLE, THIRD_COUPLE];

export const DEFAULT_EVENT: WeddingEvent = {
  id: 'event-mariana-pedro-2027',
  coupleId: 'couple-mariana-pedro',
  occasion: 'casamento',
  slug: 'mariana-pedro',
  brideName: 'Mariana',
  groomName: 'Pedro',
  conjunction: '&',
  monogram: 'M & P',
  dateDisplay: '15 JANEIRO 2027',
  dateIso: '2027-01-15',
  locationDisplay: 'LUANDA — ANGOLA',

  verse: {
    text: 'Assim, já não são dois, mas uma só carne. Portanto, o que Deus uniu, não o separe o homem.',
    citation: 'Mateus 19:6'
  },
  parentsHonoring: 'Com a bênção de Deus e dos seus queridos pais, António & Teresa Silva e Manuel & Isabel Santos',
  invitationIntro: 'Têm a honra de convidar Vossa(s) Exa(s) para testemunhar o enlace matrimonial dos seus filhos',

  ceremony: {
    title: 'Cerimónia Religiosa',
    time: '15h30',
    venue: 'Igreja Nossa Senhora dos Remédios',
    address: 'Rua Rainha Ginga, Baixa de Luanda, Angola',
    mapsUrl: 'https://maps.google.com/?q=Igreja+Nossa+Senhora+dos+Remedios+Luanda'
  },
  reception: {
    title: 'Copo-d\'Água & Recepção',
    time: '18h00',
    venue: 'Quinta das Palmeiras Eventos',
    address: 'Avenida Talatona, Sector Residencial Sul, Luanda',
    mapsUrl: 'https://maps.google.com/?q=Talatona+Luanda'
  },

  heroPhoto: heroPhotoUrl,
  intimatePhoto: intimatePhotoUrl,
  ringsPhoto: ringsPhotoUrl,
  gallery: [
    {
      id: 'gal-1',
      url: heroPhotoUrl,
      caption: 'Ensaio fotográfico no centro histórico',
      aspect: 'portrait'
    },
    {
      id: 'gal-2',
      url: intimatePhotoUrl,
      caption: 'O pôr do sol na Costa do Miradouro',
      aspect: 'landscape'
    },
    {
      id: 'gal-3',
      url: ringsPhotoUrl,
      caption: 'As alianças e detalhes da papelaria',
      aspect: 'square'
    }
  ],

  timeline: [
    {
      id: 't-1',
      time: '15h30',
      title: 'Cerimónia Religiosa',
      description: 'Celebração solene e bênção das alianças na Igreja Nossa Senhora dos Remédios.',
      iconName: 'church'
    },
    {
      id: 't-2',
      time: '17h15',
      title: 'O Cortejo & Felicitações',
      description: 'Saída solene dos noivos, chuva de pétalas e fotografias com os convidados.',
      iconName: 'rings'
    },
    {
      id: 't-3',
      time: '18h00',
      title: 'Cocktail de Boas-Vindas',
      description: 'Abertura do jardim na Quinta das Palmeiras com canapés, espumante e música ao vivo.',
      iconName: 'cheers'
    },
    {
      id: 't-4',
      time: '19h45',
      title: 'Jantar Nupcial',
      description: 'Banquete gastronómico em sala climatizada e serviço à mesa.',
      iconName: 'utensils'
    },
    {
      id: 't-5',
      time: '21h30',
      title: 'Primeira Dança dos Noivos',
      description: 'Momento mágico ao som da nossa canção preferida.',
      iconName: 'heart'
    },
    {
      id: 't-6',
      time: '22h15',
      title: 'Corte do Bolo & Brinde',
      description: 'Brinde com champanhe e partilha do bolo com todos os presentes.',
      iconName: 'cake'
    },
    {
      id: 't-7',
      time: '22h45',
      title: 'Abertura da Pista de Dança',
      description: 'Festa com DJ convidado, barra de cocktails e celebração até ao amanhecer.',
      iconName: 'party'
    }
  ],

  declarations: {
    groom: {
      author: 'Pedro',
      quote: 'Desde o primeiro olhar soube que a minha busca por paz e significado terminava em ti. Prometo amar-te, honrar-te e ser o teu refúgio em cada aurora da nossa vida.'
    },
    bride: {
      author: 'Mariana',
      quote: 'Hoje entrego o meu coração com a serenidade de quem encontrou a sua verdadeira casa. És a minha melhor escolha de ontem, de hoje e de todos os amanhãs.'
    }
  },

  guestManual: [
    {
      id: 'gm-1',
      title: 'Sua presença é essencial',
      description: 'Por favor, chegue com 20 minutos de antecedência para nos acompanhar desde o início.',
      iconName: 'heart',
      enabled: true
    },
    {
      id: 'gm-2',
      title: 'Por favor, seja pontual',
      description: 'O início da cerimónia será rigoroso para desfrutarmos de toda a luz natural do dia.',
      iconName: 'clock',
      enabled: true
    },
    {
      id: 'gm-3',
      title: 'Branco é a cor da noiva',
      description: 'Pedimos gentilmente que evite trajes brancos, off-white ou marfim total.',
      iconName: 'sparkles',
      enabled: true
    },
    {
      id: 'gm-4',
      title: 'Convidado não convida',
      description: 'O convite é estritamente pessoal e intransmissível, conforme o número de lugares indicado.',
      iconName: 'users',
      enabled: true
    },
    {
      id: 'gm-5',
      title: 'Registe o nosso dia',
      description: 'Fotografe e filme com alegria! No entanto, durante as bênçãos, mantenha o telemóvel em silêncio.',
      iconName: 'camera',
      enabled: true
    },
    {
      id: 'gm-6',
      title: 'Comemore connosco até o fim',
      description: 'Venha com o coração aberto, calçado confortável e muita energia para dançar connosco!',
      iconName: 'wine',
      enabled: true
    }
  ],

  coupleMessage: {
    title: 'Recado dos Noivos',
    body: 'Hoje celebramos muito mais do que o nosso amor. Celebramos a bênção divina de podermos partilhar este momento inesquecível com as pessoas mais queridas da nossa história. A sua presença é o maior presente que poderíamos receber.',
    signOff: 'Com todo o nosso carinho e gratidão,'
  },

  templateId: 'botanical-sage',
  paletteId: 'sage',
  status: 'active',
  rsvpDeadline: '2026-12-15',
  allowPlusOnes: true,
  enableMusic: true,
  enableQrValidation: true
};

export const SECOND_EVENT: WeddingEvent = {
  ...DEFAULT_EVENT,
  id: 'event-sofia-andre-2027',
  coupleId: 'couple-sofia-andre',
  occasion: 'casamento',
  slug: 'sofia-andre',
  brideName: 'Sofia',
  groomName: 'André',
  conjunction: 'e',
  monogram: 'S & A',
  dateDisplay: '22 MAIO 2027',
  dateIso: '2027-05-22',
  locationDisplay: 'LISBOA — PORTUGAL',
  verse: {
    text: 'Onde o amor reina, ali Deus reina; e onde Deus reina, ali se encontra a paz.',
    citation: 'São Francisco de Assis'
  },
  parentsHonoring: 'Com a bênção dos seus pais, Carlos & Helena Nunes e Rui & Marta Costa',
  invitationIntro: 'Têm a alegria de convidar os seus familiares e amigos para celebrarem o início da sua caminhada a dois',
  ceremony: {
    ...DEFAULT_EVENT.ceremony,
    time: '16h00',
    venue: 'Igreja de São Roque',
    address: 'Largo Trindade Coelho, Lisboa, Portugal',
    mapsUrl: 'https://maps.google.com/?q=Igreja+de+Sao+Roque+Lisboa'
  },
  reception: {
    ...DEFAULT_EVENT.reception,
    time: '18h30',
    venue: 'Quinta da Bella Vista',
    address: 'Estrada da Quinta de São Pedro, Sintra, Portugal',
    mapsUrl: 'https://maps.google.com/?q=Quinta+Sintra+Lisboa'
  },
  declarations: {
    groom: {
      author: 'André',
      quote: 'Encontrei em ti a serenidade que procurava. Prometo construir contigo dias leves e futuros firmes.'
    },
    bride: {
      author: 'Sofia',
      quote: 'Escolho-te nas manhãs difíceis e nas celebrações simples. O nosso sim é o início de tudo o que ainda vamos ser.'
    }
  },
  coupleMessage: {
    title: 'Recado dos Noivos',
    body: 'A vossa presença tornará este dia ainda mais especial. Será uma alegria partilhar connosco este momento tão esperado.',
    signOff: 'Com carinho,'
  },
  templateId: 'elegance-terracotta',
  paletteId: 'terra',
  status: 'active',
  rsvpDeadline: '2027-04-30',
  enableMusic: false
};

export const THIRD_EVENT: WeddingEvent = {
  ...DEFAULT_EVENT,
  id: 'event-joana-miguel-2026',
  coupleId: 'couple-joana-miguel',
  occasion: 'casamento',
  slug: 'joana-miguel',
  brideName: 'Joana',
  groomName: 'Miguel',
  conjunction: '&',
  monogram: 'J & M',
  dateDisplay: '12 DEZEMBRO 2026',
  dateIso: '2026-12-12',
  locationDisplay: 'BENGOLA — ANGOLA',
  verse: {
    text: 'Muitas águas não podem apagar o amor, nem as inundações o levaram.',
    citation: 'Cânticos 8:7'
  },
  parentsHonoring: 'Com a bênção de Deus e das suas famílias, Domingos & Rosa e Paulo & Alice',
  invitationIntro: 'Têm a honra de convidar Vossa(s) Exa(s) para acompanhar a celebração do seu enlace matrimonial',
  ceremony: {
    ...DEFAULT_EVENT.ceremony,
    time: '15h00',
    venue: 'Catedral de Santo António',
    address: 'Praça do Kamba, Benguela, Angola',
    mapsUrl: 'https://maps.google.com/?q=Catedral+Benguela+Angola'
  },
  reception: {
    ...DEFAULT_EVENT.reception,
    time: '17h30',
    venue: 'Hotel Grande Bahia',
    address: 'Avenida Marginal, Benguela, Angola',
    mapsUrl: 'https://maps.google.com/?q=Benguela+Angola'
  },
  declarations: {
    groom: {
      author: 'Miguel',
      quote: 'Ti encontrei o amor que não se apaga. Cada dia ao teu lado é uma confirmação de que Deus me abençoou.'
    },
    bride: {
      author: 'Joana',
      quote: 'Digo sim com a leveza de quem encontrou o seu lar no coração de outro.'
    }
  },
  templateId: 'classic-gold',
  paletteId: 'classic',
  status: 'active',
  rsvpDeadline: '2026-11-30',
  enableQrValidation: true
};

export const SEED_EVENTS: WeddingEvent[] = [DEFAULT_EVENT, SECOND_EVENT, THIRD_EVENT];

export const DEFAULT_GUESTS: Guest[] = [
  {
    id: 'guest-1',
    eventId: 'event-mariana-pedro-2027',
    name: 'João Manuel',
    salutationType: 'individual',
    relationship: 'Amigo de infância do noivo',
    phone: '+244 923 111 222',
    token: '8Fk92KsP',
    maxGuests: 1,
    confirmedGuests: 1,
    rsvpStatus: 'confirmed',
    rsvpDate: '2026-09-20T14:30:00Z',
    rsvpNotes: 'Parabéns ao casal! Estarei lá com muita alegria.',
    dietaryRestrictions: 'Nenhuma',
    accessedAt: '2026-09-20T14:15:00Z',
    accessCount: 3,
    qrStatus: 'active'
  },
  {
    id: 'guest-2',
    eventId: 'event-mariana-pedro-2027',
    name: 'Ana Clara',
    salutationType: 'individual',
    relationship: 'Madrinha da noiva',
    phone: '+244 924 333 444',
    token: 'anaclara-7Tx9Q',
    maxGuests: 2,
    confirmedGuests: 0,
    rsvpStatus: 'pending',
    accessedAt: '2026-09-28T10:00:00Z',
    accessCount: 1,
    qrStatus: 'active'
  },
  {
    id: 'guest-3',
    eventId: 'event-mariana-pedro-2027',
    name: 'Família Silva',
    salutationType: 'family',
    relationship: 'Tios e Primos da noiva',
    phone: '+244 925 555 666',
    token: 'familiasilva-3Kz8W',
    maxGuests: 4,
    confirmedGuests: 4,
    rsvpStatus: 'confirmed',
    rsvpDate: '2026-09-22T18:00:00Z',
    rsvpNotes: 'Iremos todos os 4! Muito ansiosos por este grande dia.',
    dietaryRestrictions: '1 opção vegetariana',
    accessedAt: '2026-09-22T17:40:00Z',
    accessCount: 4,
    qrStatus: 'active'
  },
  {
    id: 'guest-4',
    eventId: 'event-mariana-pedro-2027',
    name: 'Padrinho Tião',
    salutationType: 'individual',
    relationship: 'Padrinho do noivo',
    phone: '+244 926 121 212',
    token: 'tiao-9Lm2Rt',
    maxGuests: 2,
    confirmedGuests: 2,
    rsvpStatus: 'confirmed',
    rsvpDate: '2026-09-30T09:15:00Z',
    rsvpNotes: 'Levo a minha esposa. Contem connosco!',
    accessedAt: '2026-09-30T09:00:00Z',
    accessCount: 2,
    qrStatus: 'active'
  },
  {
    id: 'guest-5',
    eventId: 'event-mariana-pedro-2027',
    name: 'Carla Mendes',
    salutationType: 'individual',
    relationship: 'Colega de trabalho da noiva',
    phone: '+244 927 343 343',
    token: 'carla-5Pq7Xz',
    maxGuests: 1,
    confirmedGuests: 0,
    rsvpStatus: 'declined',
    rsvpDate: '2026-10-01T20:10:00Z',
    rsvpNotes: 'Infelizmente estarei fora do país nessa data. Os meus melhores votos!',
    accessedAt: '2026-10-01T20:00:00Z',
    accessCount: 1,
    qrStatus: 'revoked'
  },
  {
    id: 'guest-6',
    eventId: 'event-mariana-pedro-2027',
    name: 'Família dos Avós',
    salutationType: 'family',
    relationship: 'Avós e tios do noivo',
    phone: '+244 928 565 565',
    token: 'avos-2Wd4Yn',
    maxGuests: 5,
    confirmedGuests: 0,
    rsvpStatus: 'pending',
    accessCount: 0,
    qrStatus: 'active'
  },
  {
    id: 'guest-7',
    eventId: 'event-mariana-pedro-2027',
    name: 'Rui & Beatriz',
    salutationType: 'couple',
    relationship: 'Amigos dos noivos',
    phone: '+244 929 787 787',
    token: 'rui-beatriz-6Hj1Vk',
    maxGuests: 2,
    confirmedGuests: 0,
    rsvpStatus: 'pending',
    accessedAt: '2026-10-02T12:00:00Z',
    accessCount: 1,
    qrStatus: 'active'
  },
  {
    id: 'guest-8',
    eventId: 'event-mariana-pedro-2027',
    name: 'Equipa Nova Vida',
    salutationType: 'family',
    relationship: 'Ministério juvenil',
    phone: '+244 930 909 909',
    token: 'equipa-8Tb3Qs',
    maxGuests: 6,
    confirmedGuests: 0,
    rsvpStatus: 'pending',
    accessCount: 0,
    qrStatus: 'active'
  },
  {
    id: 'guest-9',
    eventId: 'event-sofia-andre-2027',
    name: 'Marta Figueiredo',
    salutationType: 'individual',
    relationship: 'Melhor amiga da noiva',
    phone: '+351 913 222 333',
    token: 'marta-4Rc8Bn',
    maxGuests: 1,
    confirmedGuests: 1,
    rsvpStatus: 'confirmed',
    rsvpDate: '2026-10-03T11:00:00Z',
    rsvpNotes: 'Não perco este por nada! Já estou a contar os dias.',
    accessedAt: '2026-10-03T10:50:00Z',
    accessCount: 2,
    qrStatus: 'active'
  },
  {
    id: 'guest-10',
    eventId: 'event-sofia-andre-2027',
    name: 'Família Nunes',
    salutationType: 'family',
    relationship: 'Família do noivo',
    phone: '+351 914 555 666',
    token: 'nunes-7Gf2Ld',
    maxGuests: 4,
    confirmedGuests: 0,
    rsvpStatus: 'pending',
    accessCount: 0,
    qrStatus: 'active'
  },
  {
    id: 'guest-11',
    eventId: 'event-sofia-andre-2027',
    name: 'Tomás Ribeiro',
    salutationType: 'individual',
    relationship: 'Colega do noivo',
    phone: '+351 915 777 888',
    token: 'tomas-1Zx6Mk',
    maxGuests: 2,
    confirmedGuests: 0,
    rsvpStatus: 'pending',
    accessCount: 0,
    qrStatus: 'active'
  },
  {
    id: 'guest-12',
    eventId: 'event-joana-miguel-2026',
    name: 'Família Domingos',
    salutationType: 'family',
    relationship: 'Família da noiva',
    phone: '+244 931 111 000',
    token: 'domingos-3Vn9Pa',
    maxGuests: 6,
    confirmedGuests: 6,
    rsvpStatus: 'confirmed',
    rsvpDate: '2026-09-15T16:30:00Z',
    rsvpNotes: 'A família toda confirmada. Será uma festa inesquecível!',
    accessedAt: '2026-09-15T16:00:00Z',
    accessCount: 5,
    qrStatus: 'used',
    qrScannedAt: '2026-09-16T09:00:00Z',
    qrScannedBy: 'Recepção / Check-in'
  },
  {
    id: 'guest-13',
    eventId: 'event-joana-miguel-2026',
    name: 'Dona Esperança',
    salutationType: 'individual',
    relationship: 'Madrinha da noiva',
    phone: '+244 932 222 000',
    token: 'esperanca-5Kj7Wt',
    maxGuests: 2,
    confirmedGuests: 2,
    rsvpStatus: 'confirmed',
    rsvpDate: '2026-09-18T10:00:00Z',
    dietaryRestrictions: 'Sem glúten',
    accessedAt: '2026-09-18T09:45:00Z',
    accessCount: 3,
    qrStatus: 'active'
  },
  {
    id: 'guest-14',
    eventId: 'event-joana-miguel-2026',
    name: 'Nelson Chissola',
    salutationType: 'individual',
    relationship: 'Amigo do noivo',
    phone: '+244 933 333 000',
    token: 'nelson-8Dq4Rf',
    maxGuests: 1,
    confirmedGuests: 0,
    rsvpStatus: 'declined',
    rsvpDate: '2026-09-25T19:00:00Z',
    rsvpNotes: 'Em viagem de trabalho nessa semana. Bebam por mim!',
    accessedAt: '2026-09-25T18:50:00Z',
    accessCount: 1,
    qrStatus: 'revoked'
  }
];

export const SEED_GUESTS: Guest[] = DEFAULT_GUESTS;
