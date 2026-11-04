import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sun, Moon, ChevronDown } from 'lucide-react';
import { PALETTES, DEFAULT_PALETTE_ID } from '../lib/palettes.js';
import { setActiveTheme, getLocalTheme, applyThemeColors } from '../lib/theme.js';

export function PaletteSwitcher({ className = '', compact = false }) {
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(DEFAULT_PALETTE_ID);
  const ref = useRef(null);

  // Sync state with active theme
  useEffect(() => {
    const local = getLocalTheme();
    if (local?.themeId) {
      setCurrentId(local.themeId);
    }

    const handler = (e) => {
      if (e.detail?.themeId) {
        setCurrentId(e.detail.themeId);
      }
    };
    window.addEventListener('engineering-hub-theme-change', handler);
    return () => window.removeEventListener('engineering-hub-theme-change', handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activePalette = PALETTES.find(p => p.themeId === currentId) || PALETTES[2]; // Editorial Sage default

  async function handleSelect(palette) {
    setCurrentId(palette.themeId);
    setOpen(false);
    try {
      await setActiveTheme(palette);
    } catch (err) {
      console.error('Failed to activate theme:', err);
    }
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface text-ink hover:border-gold hover:text-primary transition-all duration-150 text-xs font-bold shadow-xs select-none"
        aria-label="Select color palette"
        aria-expanded={open}
      >
        <Palette size={14} className="text-primary shrink-0" />
        <span className="hidden sm:inline font-mono text-[11px] font-bold truncate max-w-[110px]">
          {activePalette.name}
        </span>
        <div className="flex items-center -space-x-1 shrink-0">
          {activePalette.raw.slice(0, 3).map((hex, i) => (
            <span
              key={i}
              className="inline-block w-2.5 h-2.5 rounded-full border border-black/20"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Color Palette Options"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-surface shadow-popover z-50 p-3 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2 pb-2.5 mb-2 border-b border-border/80 flex items-center justify-between">
            <div>
              <strong className="block text-xs font-extrabold text-ink font-display">
                8 Official Color Palettes
              </strong>
              <span className="text-[10px] text-muted font-mono">
                WCAG AA Accessible · Instant Reactive Cascade
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Active: {activePalette.name}
            </span>
          </div>

          <div className="space-y-1.5" role="none">
            {PALETTES.map(p => {
              const isSelected = p.themeId === currentId;
              const isDark = p.mode === 'dark';

              return (
                <button
                  key={p.themeId}
                  role="menuitemradio"
                  aria-checked={isSelected}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 flex flex-col gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-hover-surface ring-1 ring-primary/40 shadow-xs'
                      : 'border-border/60 hover:border-gold hover:bg-hover-surface/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-ink">
                        {p.name}
                      </strong>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          isDark ? 'bg-stone-900 text-amber-200' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isDark ? <Moon size={9} /> : <Sun size={9} />}
                        {isDark ? 'Dark' : 'Light'}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary font-mono">
                        <Check size={12} strokeWidth={3} /> ACTIVE
                      </span>
                    )}
                  </div>

                  {/* 5 Exact Raw Swatches */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {p.raw.map((hex, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className="w-full h-5 rounded-md border border-black/15 shadow-2xs"
                          style={{ backgroundColor: hex }}
                          title={`Color ${idx + 1}: ${hex}`}
                        />
                        <span className="text-[8px] font-mono text-muted uppercase mt-0.5">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PaletteSwitcher;
