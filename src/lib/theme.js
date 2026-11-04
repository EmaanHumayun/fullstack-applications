import { api } from './api.js';
import { PALETTES, DEFAULT_PALETTE_ID, getPaletteById } from './palettes.js';

const STORAGE_KEY = 'engineering_hub_theme';

/**
 * Apply all semantic tokens and CSS variables to the document.
 * Sets data-theme-mode, data-theme-id, color-scheme, and individual CSS custom properties.
 */
export function applyThemeColors(colors = {}, mode = null, themeId = null) {
  if (!colors || typeof document === 'undefined') return;
  const root = document.documentElement;

  // Determine mode (dark | light)
  const finalMode = mode || colors.mode || 'light';
  root.setAttribute('data-theme-mode', finalMode);
  if (themeId) {
    root.setAttribute('data-theme-id', themeId);
  }
  root.style.colorScheme = finalMode;

  // Primary & Actions
  if (colors.primary) root.style.setProperty('--primary', colors.primary);
  if (colors.primaryHover) {
    root.style.setProperty('--primary-hover', colors.primaryHover);
  } else if (colors.primary) {
    root.style.setProperty('--primary-hover', colors.primary);
  }
  if (colors.primaryText) {
    root.style.setProperty('--primary-text', colors.primaryText);
  } else {
    root.style.setProperty('--primary-text', finalMode === 'dark' ? '#ffffff' : '#ffffff');
  }

  // Supporting & Accent Colors
  if (colors.secondary) root.style.setProperty('--secondary', colors.secondary);
  if (colors.accent) root.style.setProperty('--accent', colors.accent);
  if (colors.accentWarm) root.style.setProperty('--accent-warm', colors.accentWarm);
  if (colors.gold) {
    root.style.setProperty('--gold', colors.gold);
    root.style.setProperty('--warm-cream', colors.gold);
  }

  // Surfaces & Backgrounds
  if (colors.background) root.style.setProperty('--background', colors.background);
  if (colors.secondaryBackground) {
    root.style.setProperty('--secondary-background', colors.secondaryBackground);
  } else if (colors.background) {
    root.style.setProperty('--secondary-background', colors.background);
  }
  if (colors.surface) root.style.setProperty('--surface', colors.surface);
  if (colors.elevatedSurface) {
    root.style.setProperty('--elevated-surface', colors.elevatedSurface);
  } else if (colors.surface) {
    root.style.setProperty('--elevated-surface', colors.surface);
  }
  if (colors.cardBg) {
    root.style.setProperty('--card-bg', colors.cardBg);
  } else if (colors.surface) {
    root.style.setProperty('--card-bg', colors.cardBg || colors.surface);
  }

  // Typography & Text
  if (colors.text) root.style.setProperty('--text', colors.text);
  if (colors.textSecondary) {
    root.style.setProperty('--text-secondary', colors.textSecondary);
  } else if (colors.text) {
    root.style.setProperty('--text-secondary', colors.text);
  }
  if (colors.textMuted) {
    root.style.setProperty('--text-muted', colors.textMuted);
  }
  if (colors.headingText) {
    root.style.setProperty('--heading-text', colors.headingText);
  } else if (colors.text) {
    root.style.setProperty('--heading-text', colors.text);
  }

  // Borders, Rings & Interactive States
  if (colors.border) root.style.setProperty('--border', colors.border);
  if (colors.borderSubtle) {
    root.style.setProperty('--border-subtle', colors.borderSubtle);
  } else if (colors.border) {
    root.style.setProperty('--border-subtle', colors.border);
  }
  if (colors.hoverSurface) root.style.setProperty('--hover-surface', colors.hoverSurface);
  if (colors.selectedSurface) root.style.setProperty('--selected-surface', colors.selectedSurface);
  if (colors.focusRing) {
    root.style.setProperty('--focus-ring', colors.focusRing);
  } else if (colors.primary) {
    root.style.setProperty('--focus-ring', colors.primary);
  }
  if (colors.linkColor) {
    root.style.setProperty('--link-color', colors.linkColor);
  } else if (colors.primary) {
    root.style.setProperty('--link-color', colors.primary);
  }

  // Chart Series Colors
  if (Array.isArray(colors.chartSeries)) {
    colors.chartSeries.forEach((color, i) => {
      root.style.setProperty(`--chart-${i + 1}`, color);
    });
  } else if (colors.primary) {
    root.style.setProperty('--chart-1', colors.primary);
    root.style.setProperty('--chart-2', colors.gold || colors.accent || '#BB9457');
    root.style.setProperty('--chart-3', colors.secondary || '#432818');
    root.style.setProperty('--chart-4', colors.accent || '#99582A');
    root.style.setProperty('--chart-5', colors.accentWarm || '#BC3908');
  }

  // Broadcast theme change for real-time reactivity without page refresh
  try {
    window.dispatchEvent(
      new CustomEvent('engineering-hub-theme-change', {
        detail: { colors, mode: finalMode, themeId }
      })
    );
  } catch (e) {}
}

/**
 * Save theme to localStorage for instant, zero-FOUC reload
 */
export function persistThemeLocally(theme) {
  if (typeof localStorage === 'undefined' || !theme) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        themeId: theme.themeId || theme._id,
        name: theme.name,
        mode: theme.mode || theme.colors?.mode,
        colors: theme.colors,
        raw: theme.raw
      })
    );
  } catch (e) {}
}

/**
 * Get locally stored theme if present
 */
export function getLocalTheme() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Activate a theme application-wide.
 * 1. Applies colors immediately to DOM.
 * 2. Persists to localStorage.
 * 3. Asynchronously tells backend to mark theme as active if _id is present.
 */
export async function setActiveTheme(theme) {
  if (!theme || !theme.colors) return;
  
  const targetId = theme.themeId || theme._id;

  // 1. Instant DOM application
  applyThemeColors(theme.colors, theme.mode || theme.colors?.mode, targetId);
  
  // 2. Local persistence
  persistThemeLocally(theme);

  // 3. Backend persistence in MongoDB if targetId is present
  if (targetId) {
    try {
      const res = await api(`/themes/${targetId}/activate`, { method: 'PUT' });
      if (res?.activeTheme) {
        persistThemeLocally(res.activeTheme);
      }
    } catch (e) {
      // Local theme stays active even if offline or viewer
    }
  }
}

/**
 * Initialize active theme on app launch.
 * Synchronous local read guarantees 0ms FOUC.
 * Subsequent API call syncs with database.
 */
export async function initActiveTheme() {
  // Phase 1: Zero-FOUC local check
  const local = getLocalTheme();
  if (local && local.colors) {
    applyThemeColors(local.colors, local.mode, local.themeId);
  } else {
    // Default preset
    const defaultPalette = getPaletteById(DEFAULT_PALETTE_ID);
    if (defaultPalette) {
      applyThemeColors(defaultPalette.colors, defaultPalette.mode, defaultPalette.themeId);
    }
  }

  // Phase 2: Async server sync
  try {
    const themes = await api('/themes');
    const active = themes.find(t => t.isActive);
    if (active && active.colors) {
      applyThemeColors(active.colors, active.mode, active.themeId || active._id);
      persistThemeLocally(active);
      return active;
    }
  } catch (err) {
    // Offline or public visitor without API reach: local theme holds
  }

  return local || getPaletteById(DEFAULT_PALETTE_ID);
}
