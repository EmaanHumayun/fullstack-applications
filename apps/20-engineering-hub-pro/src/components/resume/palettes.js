export const RESUME_PALETTES = [
  {
    id: 'burgundy-gold',
    name: 'Burgundy & Gold (Warm Editorial)',
    primary: '#6f1d1b',
    secondary: '#432818',
    accent: '#bb9457',
    text: '#1f2937',
    muted: '#4b5563',
    background: '#ffffff',
    sidebarBg: '#faf8f5',
    border: '#e7dfd5'
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy (Corporate ATS)',
    primary: '#1e3a8a',
    secondary: '#172554',
    accent: '#3b82f6',
    text: '#111827',
    muted: '#4b5563',
    background: '#ffffff',
    sidebarBg: '#f8fafc',
    border: '#e2e8f0'
  },
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    primary: '#0369a1',
    secondary: '#082f49',
    accent: '#0ea5e9',
    text: '#0f172a',
    muted: '#64748b',
    background: '#ffffff',
    sidebarBg: '#f0f9ff',
    border: '#e0f2fe'
  },
  {
    id: 'forest-green',
    name: 'Forest Green (Modern Tech)',
    primary: '#14532d',
    secondary: '#052e16',
    accent: '#22c55e',
    text: '#1c1917',
    muted: '#57534e',
    background: '#ffffff',
    sidebarBg: '#f4fbf6',
    border: '#dcfce7'
  },
  {
    id: 'charcoal-silver',
    name: 'Charcoal & Slate',
    primary: '#334155',
    secondary: '#0f172a',
    accent: '#64748b',
    text: '#1e293b',
    muted: '#64748b',
    background: '#ffffff',
    sidebarBg: '#f8fafc',
    border: '#e2e8f0'
  },
  {
    id: 'black-white',
    name: 'Monochrome (Pure ATS Standard)',
    primary: '#000000',
    secondary: '#262626',
    accent: '#525252',
    text: '#000000',
    muted: '#404040',
    background: '#ffffff',
    sidebarBg: '#f5f5f5',
    border: '#d4d4d4'
  },
  {
    id: 'warm-beige',
    name: 'Warm Terracotta & Clay',
    primary: '#78350f',
    secondary: '#451a03',
    accent: '#d97706',
    text: '#292524',
    muted: '#57534e',
    background: '#ffffff',
    sidebarBg: '#fef3c7',
    border: '#fde68a'
  },
  {
    id: 'teal-slate',
    name: 'Teal & Emerald Tech',
    primary: '#0f766e',
    secondary: '#134e4a',
    accent: '#14b8a6',
    text: '#0f172a',
    muted: '#475569',
    background: '#ffffff',
    sidebarBg: '#f0fdfa',
    border: '#ccfbf1'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple & Amethyst',
    primary: '#581c87',
    secondary: '#3b0764',
    accent: '#a855f7',
    text: '#1e1b4b',
    muted: '#6b7280',
    background: '#ffffff',
    sidebarBg: '#faf5ff',
    border: '#f3e8ff'
  },
  {
    id: 'custom',
    name: 'Custom Theme',
    primary: '#6f1d1b',
    secondary: '#432818',
    accent: '#bb9457',
    text: '#1f2937',
    muted: '#6b7280',
    background: '#ffffff',
    sidebarBg: '#f9fafb',
    border: '#e5e7eb'
  }
];

export function getPalette(id) {
  return RESUME_PALETTES.find(p => p.id === id) || RESUME_PALETTES[0];
}
