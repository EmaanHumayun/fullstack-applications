import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  ArrowRight,
  Code2,
  Calendar,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../lib/api.js';
import { SafeMarkdown } from '../lib/markdown.jsx';
import { EmptyState } from '../components.jsx';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeNote, setActiveNote] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api('/notes');
        setNotes(data || []);
      } catch (err) {
        console.error('Failed to load public notes:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    notes.forEach(n => {
      if (n.category) set.add(n.category);
    });
    return ['All', ...Array.from(set)];
  }, [notes]);

  const filtered = useMemo(() => {
    return notes.filter(n => {
      if (!n.published || n.isArchived) return false;

      const catMatch = selectedCategory === 'All' || n.category === selectedCategory;
      const q = search.toLowerCase();
      const textMatch =
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q));

      return catMatch && textMatch;
    });
  }, [notes, selectedCategory, search]);

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="listing-hero text-center max-w-3xl mx-auto py-8">
        <span className="eyebrow inline-block mb-2 font-mono font-bold tracking-widest text-xs uppercase text-gold">
          PERSONAL KNOWLEDGE MANAGEMENT (PKM)
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-ink leading-tight">
          Engineering notes from the trenches.
        </h1>
        <p className="text-base text-muted mt-4 leading-relaxed">
          Breakdowns of distributed system concepts, backend concurrency patterns, and LLM orchestration
          trade-offs. Learning in public.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search concepts, architectures, tags..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-border bg-surface text-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-border pt-3">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-primary text-[var(--primary-text,#ffffff)] border-primary'
                  : 'bg-secondary-background text-text-secondary border-border hover:bg-hover-surface hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-stone-500">Loading knowledge notes…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notes found"
          description="Try selecting another category or clearing your search term."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(note => (
            <article
              key={note._id}
              onClick={() => setActiveNote(note)}
              className="bg-surface border border-border rounded-2xl p-6 shadow-xs hover:shadow-card hover:border-gold transition flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-secondary-background border border-border px-2 py-0.5 rounded font-mono">
                    {note.category || 'General'}
                  </span>
                  <span className="text-[11px] font-mono text-muted">
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <h3 className="font-bold text-ink text-lg leading-snug group-hover:text-primary transition line-clamp-2 font-display">
                  {note.title}
                </h3>

                <p className="text-xs text-muted mt-2.5 line-clamp-3 leading-relaxed">
                  {note.content.replace(/[#*`_]/g, '')}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-900">
                <span>Read Full Note</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Full Note Reading Modal with SafeMarkdown */}
      {activeNote && (
        <div
          className="modal-backdrop"
          onMouseDown={e => e.target === e.currentTarget && setActiveNote(null)}
        >
          <div className="modal-card max-w-3xl">
            <div className="modal-heading">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                  {activeNote.category || 'Engineering Note'}
                </span>
                <h2 className="text-2xl font-bold font-serif text-stone-900 mt-1">
                  {activeNote.title}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setActiveNote(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-content max-h-[75vh] overflow-y-auto p-6 sm:p-8 space-y-6">
              {activeNote.tags && activeNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-4 border-b border-stone-100">
                  {activeNote.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="prose-container leading-relaxed text-stone-800">
                <SafeMarkdown content={activeNote.content} />
              </div>

              <div className="pt-6 border-t border-stone-100 text-xs text-stone-400 flex items-center justify-between">
                <span>
                  Published:{' '}
                  {activeNote.createdAt ? new Date(activeNote.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveNote(null)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition"
                >
                  Close Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
