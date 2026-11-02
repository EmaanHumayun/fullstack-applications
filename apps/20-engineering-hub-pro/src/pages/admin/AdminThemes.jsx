import React, { useState, useEffect, useCallback } from 'react';
import {
  Palette,
  Check,
  Plus,
  RefreshCw,
  Trash2,
  Sparkles,
  Eye,
  CheckCircle2,
  Sun,
  Moon,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { applyThemeColors, setActiveTheme } from '../../lib/theme.js';
import { PALETTES, DEFAULT_PALETTE_ID, getPaletteById } from '../../lib/palettes.js';
import { Modal, Toast } from '../../components.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

const emptyTheme = {
  name: 'My Custom Architecture Palette',
  mode: 'light',
  description: 'Custom user-designed architectural color tokens.',
  raw: ['#1e1e24', '#2a9d8f', '#e9c46a', '#ffffff', '#04151f'],
  colors: {
    mode: 'light',
    primary: '#2a9d8f',
    primaryHover: '#23877b',
    primaryText: '#ffffff',
    secondary: '#1e1e24',
    accent: '#e9c46a',
    accentWarm: '#e76f51',
    gold: '#e9c46a',
    background: '#f4f8f7',
    secondaryBackground: '#e7f0ee',
    surface: '#ffffff',
    elevatedSurface: '#ffffff',
    text: '#172b33',
    textSecondary: '#264653',
    textMuted: '#517482',
    headingText: '#172b33',
    border: '#c8dcda',
    borderSubtle: '#e0ecea',
    hoverSurface: '#ebf4f2',
    selectedSurface: '#dcedea',
    focusRing: '#2a9d8f',
    linkColor: '#1b7d71',
    cardBg: '#ffffff',
    chartSeries: ['#2a9d8f', '#e76f51', '#e9c46a', '#1e1e24', '#517482']
  }
};

export function AdminThemes() {
  const { isViewer, canEdit } = useAuth();
  const [themes, setThemes] = useState([]);
  const [activeThemeId, setActiveThemeId] = useState(DEFAULT_PALETTE_ID);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyTheme);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const load = useCallback(async () => {
    try {
      const data = await api('/themes');
      
      // Ensure all 8 canonical palettes exist in the list
      const merged = PALETTES.map(preset => {
        const dbMatch = data.find(t => t.themeId === preset.themeId || t.name?.toLowerCase() === preset.name.toLowerCase());
        if (dbMatch) {
          return {
            ...preset,
            ...dbMatch,
            raw: dbMatch.raw?.length === 5 ? dbMatch.raw : preset.raw,
            colors: { ...preset.colors, ...(dbMatch.colors || {}) }
          };
        }
        return preset;
      });

      // Include any user-created custom themes from DB
      const customThemes = data.filter(t => !PALETTES.some(p => p.themeId === t.themeId || p.name?.toLowerCase() === t.name?.toLowerCase()));
      const allThemes = [...merged, ...customThemes];
      setThemes(allThemes);

      const active = allThemes.find(t => t.isActive);
      if (active) {
        setActiveThemeId(active.themeId || active._id);
        applyThemeColors(active.colors, active.mode, active.themeId || active._id);
      }
    } catch (err) {
      // Fallback to local presets if offline
      setThemes(PALETTES);
      const active = PALETTES.find(p => p.themeId === DEFAULT_PALETTE_ID);
      if (active) {
        setActiveThemeId(active.themeId);
        applyThemeColors(active.colors, active.mode, active.themeId);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleActivate(theme) {
    if (isViewer) {
      showToast('Viewer mode: activating palettes is disabled.');
      return;
    }
    try {
      setActiveThemeId(theme.themeId || theme._id);
      await setActiveTheme(theme);
      showToast(`Activated palette "${theme.name}" (${theme.mode === 'dark' ? 'Dark Mode' : 'Light Editorial'})`);
      await load();
    } catch (err) {
      showToast(err.message || 'Error activating palette');
    }
  }

  function handleLivePreview(theme) {
    applyThemeColors(theme.colors, theme.mode, theme.themeId || theme._id);
    showToast(`Previewing "${theme.name}" — Click "Activate Palette" to save`);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewer mode: creating themes is disabled.');
      return;
    }
    setBusy(true);
    try {
      await api('/themes', { method: 'POST', body: jsonBody(form) });
      showToast(`Custom theme "${form.name}" created`);
      setModal(false);
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(theme) {
    if (isViewer) {
      showToast('Viewer mode: deleting themes is disabled.');
      return;
    }
    if (!confirm(`Delete custom theme "${theme.name}"?`)) return;
    try {
      await api(`/themes/${theme._id}`, { method: 'DELETE' });
      showToast('Theme deleted');
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleResetPresets() {
    if (isViewer) {
      showToast('Viewer mode: resetting themes is disabled.');
      return;
    }
    if (!confirm('Reset all 8 official color palettes to their original definitions and activate Editorial Sage?')) return;
    try {
      await api('/themes/reset', { method: 'POST' });
      const defaultP = getPaletteById(DEFAULT_PALETTE_ID);
      if (defaultP) {
        await setActiveTheme(defaultP);
      }
      showToast('All 8 official color palettes restored');
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-top">
        <div>
          <p className="eyebrow">VISUAL IDENTITY & TOKENS</p>
          <h1 className="admin-title">Themes & <em>Multi-Palette System</em></h1>
          <p className="admin-subtitle">
            Switch between all eight exact color palettes. Every token — surfaces, typography, contrast, chart series, borders, and tactile actions — instantly cascades across the entire platform.
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2.5">
            <button type="button" className="button-secondary" onClick={handleResetPresets}>
              <RefreshCw size={14} /> Reset 8 Official Palettes
            </button>
            <button type="button" className="button-primary" onClick={() => { setForm(emptyTheme); setModal(true); }}>
              <Plus size={16} /> New Custom Theme
            </button>
          </div>
        )}
      </div>

      {isViewer && <ReadOnlyNotice featureName="Themes & Multi-Palette System" />}

      {/* Grid of All 8 Palettes */}
      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {themes.map(t => {
          const isActive = t.isActive || t.themeId === activeThemeId;
          const isDark = t.mode === 'dark' || t.colors?.mode === 'dark';
          const swatches = t.raw && t.raw.length === 5 ? t.raw : [
            t.colors?.primary || '#e07a5f',
            t.colors?.secondary || '#3d405b',
            t.colors?.accent || '#81b29a',
            t.colors?.gold || '#f2cc8f',
            t.colors?.background || '#f4f1de'
          ];

          return (
            <div
              key={t.themeId || t._id}
              className={`panel-card transition-all duration-300 flex flex-col justify-between relative rounded-2xl p-5 border-2 ${
                isActive
                  ? 'border-primary ring-2 ring-primary/30 shadow-elevated scale-[1.01]'
                  : 'border-border hover:border-gold/60'
              }`}
            >
              <div>
                {/* Header: Name, Mode Badge, Active Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isDark
                          ? 'bg-stone-900 text-amber-200 border border-amber-300/30'
                          : 'bg-amber-100/80 text-amber-900 border border-amber-300/50'
                      }`}
                    >
                      {isDark ? <Moon size={11} className="text-amber-300" /> : <Sun size={11} className="text-amber-600" />}
                      {isDark ? 'Dark Mode' : 'Light Editorial'}
                    </span>
                    {t.isPreset && (
                      <span className="text-[10px] font-mono font-bold text-muted uppercase">
                        Preset
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary text-[var(--primary-text,#ffffff)] px-3 py-1 text-[10px] font-extrabold shadow-sm">
                      <Check size={12} strokeWidth={3} /> ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-xl font-extrabold text-ink font-display tracking-tight">
                  {t.name}
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">
                  {t.description || 'Full application palette with strict WCAG AA contrast semantics.'}
                </p>

                {/* Section A: The Exact 5 Original Swatches */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-1.5">
                    <span>5 Exact Original Colors</span>
                    <span className="opacity-70">User Specification</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {swatches.map((hex, idx) => (
                      <div key={idx} className="group/swatch relative text-center">
                        <div
                          className="h-11 w-full rounded-lg shadow-inner border border-black/15 transition-transform duration-200 group-hover/swatch:scale-105"
                          style={{ backgroundColor: hex }}
                          title={`Color #${idx + 1}: ${hex}`}
                        />
                        <span className="text-[9px] font-mono font-bold text-ink mt-1 block uppercase truncate">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section F Preview: Mini Surface, Typography & Button Sandbox */}
                <div
                  className="mt-4 rounded-xl p-3.5 border transition-all text-xs"
                  style={{
                    backgroundColor: t.colors?.background || '#f4f1de',
                    borderColor: t.colors?.border || '#d7d0ba',
                    color: t.colors?.text || '#1f2233'
                  }}
                >
                  <div className="text-[9px] font-mono font-bold tracking-widest uppercase opacity-70 mb-2">
                    Live UI Micro-Sandbox
                  </div>

                  {/* Surface Card Sample */}
                  <div
                    className="rounded-lg p-3 border shadow-xs"
                    style={{
                      backgroundColor: t.colors?.surface || '#ffffff',
                      borderColor: t.colors?.borderSubtle || t.colors?.border || '#e0ecea'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <strong
                        className="text-sm font-extrabold font-display leading-tight"
                        style={{ color: t.colors?.headingText || t.colors?.text || '#1f2233' }}
                      >
                        System Architecture
                      </strong>
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: t.colors?.hoverSurface || 'rgba(0,0,0,0.05)',
                          color: t.colors?.primary || '#e07a5f'
                        }}
                      >
                        99.98%
                      </span>
                    </div>

                    <p
                      className="text-[11px] leading-relaxed mt-1 line-clamp-2"
                      style={{ color: t.colors?.textMuted || t.colors?.textSecondary || '#606482' }}
                    >
                      Real-time telemetry, idempotent workers, and deterministic query pipeline.
                    </p>

                    {/* Button Samples */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition shadow-xs"
                        style={{
                          backgroundColor: t.colors?.primary || '#e07a5f',
                          color: t.colors?.primaryText || '#ffffff'
                        }}
                        onClick={() => handleLivePreview(t)}
                      >
                        Primary Action
                      </button>

                      <button
                        type="button"
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg border transition"
                        style={{
                          backgroundColor: t.colors?.surface || '#ffffff',
                          borderColor: t.colors?.border || '#d7d0ba',
                          color: t.colors?.text || '#1f2233'
                        }}
                        onClick={() => handleLivePreview(t)}
                      >
                        Secondary
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Activate / Applied / Delete */}
              <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  {!isActive ? (
                    canEdit ? (
                      <button
                        type="button"
                        className="button-primary text-xs flex-1 justify-center py-2"
                        onClick={() => handleActivate(t)}
                      >
                        <Check size={14} /> Activate Palette
                      </button>
                    ) : null
                  ) : (
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-primary py-2 px-1">
                      <CheckCircle2 size={16} /> Currently Active System-Wide
                    </div>
                  )}

                  {!isActive && (
                    <button
                      type="button"
                      className="button-secondary text-xs px-2.5 py-2"
                      title="Preview across app without saving"
                      onClick={() => handleLivePreview(t)}
                    >
                      <Eye size={14} />
                    </button>
                  )}
                </div>

                {!t.isPreset && canEdit && (
                  <button
                    type="button"
                    className="p-2 text-muted hover:text-red-600 transition rounded-lg hover:bg-hover-surface"
                    onClick={() => handleDelete(t)}
                    title="Delete custom theme"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Theme Creator Modal */}
      {modal && (
        <Modal title="Create Custom Architectural Palette" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate} className="editor-form space-y-4">
            {isViewer && <ReadOnlyNotice featureName="Themes & Multi-Palette System" />}
            <fieldset disabled={isViewer} className="contents space-y-4">
            <div className="form-grid">
              <label className="field-span-2">
                Palette Name *
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Cobalt & Nordic Umber"
                />
              </label>

              <label className="field-span-2">
                Color Mode
                <select
                  value={form.mode}
                  onChange={e => setForm(f => ({ ...f, mode: e.target.value, colors: { ...f.colors, mode: e.target.value } }))}
                >
                  <option value="light">Light Mode (Crisp Editorial Canvas)</option>
                  <option value="dark">Dark Mode (Nocturnal Engineering Terminal)</option>
                </select>
              </label>

              <label>
                Primary Accent Color
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="color"
                    value={form.colors.primary}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, primary: e.target.value } }))}
                  />
                  <input
                    value={form.colors.primary}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, primary: e.target.value } }))}
                    className="font-mono text-xs"
                  />
                </div>
              </label>

              <label>
                Secondary Structure Color
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="color"
                    value={form.colors.secondary}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, secondary: e.target.value } }))}
                  />
                  <input
                    value={form.colors.secondary}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, secondary: e.target.value } }))}
                    className="font-mono text-xs"
                  />
                </div>
              </label>

              <label>
                Canvas Background
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="color"
                    value={form.colors.background}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, background: e.target.value } }))}
                  />
                  <input
                    value={form.colors.background}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, background: e.target.value } }))}
                    className="font-mono text-xs"
                  />
                </div>
              </label>

              <label>
                Card Surface
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="color"
                    value={form.colors.surface}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, surface: e.target.value } }))}
                  />
                  <input
                    value={form.colors.surface}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, surface: e.target.value } }))}
                    className="font-mono text-xs"
                  />
                </div>
              </label>

              <label>
                Primary Text Ink
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="color"
                    value={form.colors.text}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, text: e.target.value } }))}
                  />
                  <input
                    value={form.colors.text}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, text: e.target.value } }))}
                    className="font-mono text-xs"
                  />
                </div>
              </label>

              <label>
                Gold / Warm Accent
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="color"
                    value={form.colors.gold}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, gold: e.target.value } }))}
                  />
                  <input
                    value={form.colors.gold}
                    onChange={e => setForm(f => ({ ...f, colors: { ...f.colors, gold: e.target.value } }))}
                    className="font-mono text-xs"
                  />
                </div>
              </label>
            </div>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="button-secondary" onClick={() => setModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {canEdit && (
                <button type="submit" className="button-primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save Theme'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      <Toast message={toast} />
    </div>
  );
}

export default AdminThemes;
