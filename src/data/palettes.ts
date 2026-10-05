import { ColorPalette, ColorPaletteId } from '../types/wedding';

export const COLOR_PALETTES: Record<ColorPaletteId, ColorPalette> = {
  sage: {
    id: 'sage',
    name: 'Botânico Sálvia',
    paperBg: '#FAF7F2',
    paperWarm: '#F3EFE7',
    primaryText: '#262A28',
    mutedText: '#626863',
    accent: '#4B5848', // Verde sálvia nobre
    accentSoft: '#D8DFD5',
    hairline: 'rgba(75, 88, 72, 0.22)',
    sealColor: '#536350',
    goldAccent: '#B8975A'
  },
  terra: {
    id: 'terra',
    name: 'Terracota & Âmbar',
    paperBg: '#FBF8F4',
    paperWarm: '#F5ECE3',
    primaryText: '#2D2320',
    mutedText: '#72615B',
    accent: '#8C4830', // Terracota nobre
    accentSoft: '#EEDDD4',
    hairline: 'rgba(140, 72, 48, 0.2)',
    sealColor: '#8C4830',
    goldAccent: '#C29853'
  },
  classic: {
    id: 'classic',
    name: 'Clássico Dourado & Ébano',
    paperBg: '#FCFAF7',
    paperWarm: '#F6F2EA',
    primaryText: '#1E1D1C',
    mutedText: '#5A5753',
    accent: '#262422',
    accentSoft: '#E8E3D8',
    hairline: 'rgba(184, 151, 90, 0.3)',
    sealColor: '#2D2A26',
    goldAccent: '#B8975A'
  },
  romance: {
    id: 'romance',
    name: 'Romance Blush & Oliva',
    paperBg: '#FDF9F7',
    paperWarm: '#F7EDE9',
    primaryText: '#2B2325',
    mutedText: '#6E5C60',
    accent: '#8A535F', // Rosé queimado
    accentSoft: '#F2DFE4',
    hairline: 'rgba(138, 83, 95, 0.2)',
    sealColor: '#8A535F',
    goldAccent: '#BFA06C'
  }
};
