/**
 * ENGINEERING HUB PRO — PALETTE DEFINITIONS & SEMANTIC TOKENS
 * 
 * All 8 palettes retain their exact original 5 user-provided hex codes in `raw`.
 * Derived semantic tokens map luminance, contrast, hierarchy, and WCAG AA accessibility.
 */

export const PALETTES = [
  {
    themeId: 'burgundy-gold',
    name: 'Burgundy & Gold Editorial',
    mode: 'light',
    isPreset: true,
    description: 'Warm editorial engineering aesthetic with deep burgundy, antique brass gold, dark umber, russet, and warm parchment.',
    raw: ['#6f1d1b', '#bb9457', '#432818', '#99582a', '#ffe6a7'],
    colors: {
      mode: 'light',
      primary: '#6f1d1b',          // Deep Burgundy Wine
      primaryHover: '#872421',
      primaryText: '#ffffff',
      secondary: '#432818',        // Rich Dark Umber
      accent: '#99582a',           // Russet Brown
      accentWarm: '#6f1d1b',
      gold: '#8a6125',             // Antique Brass Gold (Rich readable tone)
      background: '#fcfaf6',       // Warm Parchment (Light Editorial Canvas)
      secondaryBackground: '#f3ede0',
      surface: '#ffffff',
      elevatedSurface: '#ffffff',
      text: '#221611',             // Deep Umber Ink (15.2:1 contrast)
      textSecondary: '#2d1b12',    // High-contrast Dark Umber
      textMuted: '#4a382e',        // Rich Warm Taupe (Sharp & legible)
      headingText: '#221611',
      border: '#dfd5c2',
      borderSubtle: '#ede5d5',
      hoverSurface: '#f7f1e4',
      selectedSurface: '#ede2ce',
      focusRing: '#6f1d1b',
      linkColor: '#6f1d1b',
      cardBg: '#ffffff',
      chartSeries: ['#6f1d1b', '#bb9457', '#99582a', '#432818', '#ffe6a7']
    }
  },
  {
    themeId: 'fjord-copper',
    name: 'Fjord Copper',
    mode: 'dark',
    isPreset: true,
    description: 'Deep Nordic abyss with dark spruce, parchment gold, copper flame, and plum espresso.',
    raw: ['#04151f', '#183a37', '#efd6ac', '#c44900', '#432534'],
    colors: {
      mode: 'dark',
      primary: '#c44900',          // Copper Flame
      primaryHover: '#d85304',
      primaryText: '#ffffff',
      secondary: '#183a37',        // Dark Spruce Green
      accent: '#efd6ac',           // Parchment Gold
      accentWarm: '#c44900',       // Copper
      gold: '#efd6ac',
      background: '#04151f',       // Deep Abyss (Canvas)
      secondaryBackground: '#091f2c',
      surface: '#0d2836',          // Surface Card
      elevatedSurface: '#133547',  // Elevated Popover / Modal
      text: '#fbf6ee',             // High-contrast Ivory
      textSecondary: '#f7e7cd',    // Bright Parchment Gold
      textMuted: '#cbdcd8',        // High-contrast Spruce Silver
      headingText: '#ffffff',
      border: '#1f4844',           // Spruce Border
      borderSubtle: '#12302d',
      hoverSurface: '#14384a',
      selectedSurface: '#1a455a',
      focusRing: '#c44900',
      linkColor: '#e6651f',
      cardBg: '#0d2836',
      chartSeries: ['#c44900', '#efd6ac', '#2ea398', '#d4659b', '#57968f']
    }
  },
  {
    themeId: 'teal-citrus',
    name: 'Teal Citrus',
    mode: 'light',
    isPreset: true,
    description: 'Fresh Mediterranean balance of deep pine teal, Persian green, saffron, and burnt sienna.',
    raw: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    colors: {
      mode: 'light',
      primary: '#1d8074',          // Persian Green / Deep Teal
      primaryHover: '#17685e',
      primaryText: '#ffffff',
      secondary: '#264653',        // Deep Teal Slate
      accent: '#d45737',           // Burnt Sienna
      accentWarm: '#e68437',       // Sandy Coral
      gold: '#9a7407',             // Saffron Amber Gold
      background: '#f4f8f7',       // Soft Coastal Mist
      secondaryBackground: '#e7f0ee',
      surface: '#ffffff',
      elevatedSurface: '#ffffff',
      text: '#172b33',             // Deep Slate Ink
      textSecondary: '#1a323c',    // Sharp Slate
      textMuted: '#2d505d',        // Crisp Slate Muted
      headingText: '#172b33',
      border: '#c8dcda',
      borderSubtle: '#e0ecea',
      hoverSurface: '#ebf4f2',
      selectedSurface: '#dcedea',
      focusRing: '#1d8074',
      linkColor: '#1b7d71',
      cardBg: '#ffffff',
      chartSeries: ['#2a9d8f', '#e76f51', '#f4a261', '#264653', '#e9c46a']
    }
  },
  {
    themeId: 'editorial-sage',
    name: 'Editorial Sage',
    mode: 'light',
    isPreset: true,
    description: 'Refined long-form reading palette with eggshell cream, terracotta, slate indigo, and laurel sage.',
    raw: ['#f4f1de', '#e07a5f', '#3d405b', '#81b29a', '#f2cc8f'],
    colors: {
      mode: 'light',
      primary: '#c45435',          // Deep Terracotta Coral (High contrast on cream)
      primaryHover: '#ae4428',
      primaryText: '#ffffff',
      secondary: '#3d405b',        // Slate Indigo
      accent: '#477d64',           // Laurel Sage Green
      accentWarm: '#c45435',
      gold: '#9d6614',             // Mellow Amber Gold (Sharp on cream)
      background: '#f4f1de',       // Eggshell Cream (Canvas)
      secondaryBackground: '#e9e4cc',
      surface: '#fffef9',
      elevatedSurface: '#ffffff',
      text: '#1f2233',             // Dark Slate
      textSecondary: '#24273b',    // Deep Indigo Slate
      textMuted: '#353952',        // High-contrast Readable Indigo
      headingText: '#1f2233',
      border: '#d7d0ba',
      borderSubtle: '#e6dfcb',
      hoverSurface: '#eee9d3',
      selectedSurface: '#e4dcbe',
      focusRing: '#c45435',
      linkColor: '#b84628',
      cardBg: '#fffef9',
      chartSeries: ['#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#5e6488']
    }
  },
  {
    themeId: 'warm-minimal',
    name: 'Warm Minimal',
    mode: 'light',
    isPreset: true,
    description: 'Clean architectural minimalism: alabaster warm white, soft silver, dark charcoal, and flame orange.',
    raw: ['#fffcf2', '#ccc5b9', '#403d39', '#252422', '#eb5e28'],
    colors: {
      mode: 'light',
      primary: '#d64c17',          // Flame Orange (High contrast)
      primaryHover: '#b83e0e',
      primaryText: '#ffffff',
      secondary: '#252422',        // Deep Charcoal
      accent: '#d64c17',
      accentWarm: '#d64c17',
      gold: '#736b5c',             // Warm Bronze Umber
      background: '#fffcf2',       // Alabaster White (Canvas)
      secondaryBackground: '#f5eee3',
      surface: '#ffffff',
      elevatedSurface: '#ffffff',
      text: '#252422',             // Deep Charcoal
      textSecondary: '#232220',    // Solid Charcoal
      textMuted: '#3c3934',        // High-contrast Warm Charcoal Muted
      headingText: '#181716',
      border: '#d9d2c5',
      borderSubtle: '#eae3d7',
      hoverSurface: '#f7f1e5',
      selectedSurface: '#ebe3d4',
      focusRing: '#d64c17',
      linkColor: '#b83e0e',
      cardBg: '#ffffff',
      chartSeries: ['#eb5e28', '#252422', '#403d39', '#948d82', '#ccc5b9']
    }
  },
  {
    themeId: 'obsidian-gold',
    name: 'Obsidian Gold',
    mode: 'dark',
    isPreset: true,
    description: 'High-performance engineering terminal: pitch obsidian, oxblood black, midnight navy, and metallic imperial gold.',
    raw: ['#080705', '#3d0c02', '#002147', '#00563b', '#d4af37'],
    colors: {
      mode: 'dark',
      primary: '#d4af37',          // Metallic Imperial Gold
      primaryHover: '#e5c350',
      primaryText: '#080705',      // High-contrast Black on Gold (9.4:1)
      secondary: '#002147',        // Oxford Midnight Navy
      accent: '#00563b',           // Imperial Emerald
      accentWarm: '#3d0c02',       // Oxblood
      gold: '#d4af37',
      background: '#080705',       // Pitch Obsidian (Canvas)
      secondaryBackground: '#12100d',
      surface: '#181512',          // Deep Obsidian Surface
      elevatedSurface: '#221f1a',  // Elevated Popover
      text: '#faf6eb',             // Radiant Ivory
      textSecondary: '#f0d268',    // Bright Imperial Gold
      textMuted: '#d8cfbe',        // Crisp Parchment Muted
      headingText: '#ffffff',
      border: '#383125',
      borderSubtle: '#221e17',
      hoverSurface: '#26221c',
      selectedSurface: '#342f26',
      focusRing: '#d4af37',
      linkColor: '#eec94b',
      cardBg: '#181512',
      chartSeries: ['#d4af37', '#00563b', '#0074bf', '#ba3118', '#ebd173']
    }
  },
  {
    themeId: 'crimson-midnight',
    name: 'Crimson Midnight',
    mode: 'dark',
    isPreset: true,
    description: 'Nocturnal engineering workspace with anthracite midnight, garnet crimson, apricot gold, and deep cobalt.',
    raw: ['#1e1e24', '#92140c', '#fff8f0', '#ffcf99', '#111d4a'],
    colors: {
      mode: 'dark',
      primary: '#92140c',          // Garnet Crimson
      primaryHover: '#ad1a10',
      primaryText: '#ffffff',
      secondary: '#111d4a',        // Deep Cobalt Night
      accent: '#ffcf99',           // Apricot Gold
      accentWarm: '#92140c',
      gold: '#ffcf99',
      background: '#131317',       // Midnight Deep Black
      secondaryBackground: '#1e1e24', // Anthracite
      surface: '#25252e',          // Surface
      elevatedSurface: '#2e2e3a',
      text: '#fff8f0',             // Alabaster Silk
      textSecondary: '#ffe0ba',    // Bright Apricot Gold
      textMuted: '#d0d2e8',        // Bright Cobalt Silver Muted
      headingText: '#ffffff',
      border: '#3c3c4e',
      borderSubtle: '#2a2a37',
      hoverSurface: '#31313e',
      selectedSurface: '#3d3d4f',
      focusRing: '#92140c',
      linkColor: '#ff7b70',
      cardBg: '#25252e',
      chartSeries: ['#92140c', '#ffcf99', '#3e63db', '#e04f43', '#ffdfb8']
    }
  },
  {
    themeId: 'oxford-burgundy',
    name: 'Oxford Burgundy',
    mode: 'dark',
    isPreset: true,
    description: 'Scholarly midnight aesthetic pairing Oxford blue, burgundy wine, cadmium honey gold, and silver parchment.',
    raw: ['#002642', '#840032', '#e59500', '#e5dada', '#02040f'],
    colors: {
      mode: 'dark',
      primary: '#840032',          // Burgundy Wine
      primaryHover: '#9f0640',
      primaryText: '#ffffff',
      secondary: '#002642',        // Oxford Blue
      accent: '#e59500',           // Honey Gold
      accentWarm: '#840032',
      gold: '#e59500',
      background: '#02040f',       // Abyssal Night
      secondaryBackground: '#081324',
      surface: '#0d1d36',          // Oxford Surface
      elevatedSurface: '#14294a',
      text: '#fbf8f8',             // Pure White-Silver
      textSecondary: '#f3eeee',    // Crisp Parchment
      textMuted: '#cad8e6',        // Clear Readable Oxford Muted
      headingText: '#ffffff',
      border: '#1a375a',
      borderSubtle: '#0f243d',
      hoverSurface: '#183154',
      selectedSurface: '#21426f',
      focusRing: '#e59500',
      linkColor: '#f5a616',
      cardBg: '#0d1d36',
      chartSeries: ['#840032', '#e59500', '#005f9e', '#ba1851', '#e5dada']
    }
  },
  {
    themeId: 'heritage-gold',
    name: 'Heritage Gold',
    mode: 'light',
    isPreset: true,
    description: 'Classic university press composition with antique brass gold, bone white, pewter slate, and deep mahogany rust.',
    raw: ['#af9164', '#f7f3e3', '#b3b6b7', '#6f1a07', '#2b2118'],
    colors: {
      mode: 'light',
      primary: '#6f1a07',          // Deep Mahogany Rust
      primaryHover: '#8b220a',
      primaryText: '#ffffff',
      secondary: '#2b2118',        // Espresso Umber
      accent: '#af9164',           // Antique Brass Gold
      accentWarm: '#6f1a07',
      gold: '#af9164',
      background: '#f7f3e3',       // Heritage Bone White
      secondaryBackground: '#ece6cf',
      surface: '#fffef9',
      elevatedSurface: '#ffffff',
      text: '#221912',             // Espresso Roast
      textSecondary: '#201812',    // Solid Dark Umber
      textMuted: '#42372e',        // Readable Deep Sepia
      headingText: '#221912',
      border: '#d6cbb0',
      borderSubtle: '#e7dfc9',
      hoverSurface: '#f1ebcf',
      selectedSurface: '#e6dcba',
      focusRing: '#6f1a07',
      linkColor: '#8b220a',
      cardBg: '#fffef9',
      chartSeries: ['#6f1a07', '#af9164', '#2b2118', '#b3b6b7', '#a6331a']
    }
  }
];

export const DEFAULT_PALETTE_ID = 'burgundy-gold';

export function getPaletteById(id) {
  return PALETTES.find(p => p.themeId === id) || PALETTES.find(p => p.themeId === DEFAULT_PALETTE_ID);
}
