import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Workflow,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  BookOpen,
  Target,
  ExternalLink
} from 'lucide-react';
import { api } from '../lib/api.js';
import { EmptyState } from '../components.jsx';

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        const [rRes, mRes] = await Promise.all([
          api('/roadmaps').catch(() => []),
          api('/milestones').catch(() => [])
        ]);
        setRoadmaps(rRes || []);
        setMilestones(mRes || []);
      } catch (err) {
        console.error('Failed to load roadmaps data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const domainsList = useMemo(() => {
    const set = new Set(['All']);
    roadmaps.forEach(r => {
      if (r.domainAssociations && r.domainAssociations.length > 0) {
        r.domainAssociations.forEach(da => {
          if (da.domainId?.name) set.add(da.domainId.name);
        });
      }
      const d = r.primaryDomainId?.name || r.primaryDomain?.name || r.domain || r.category;
      if (d) set.add(d);
    });
    return Array.from(set);
  }, [roadmaps]);

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(r => {
      const matchesDom =
        selectedDomain === 'All' ||
        (r.domainAssociations || []).some(da => da.domainId?.name === selectedDomain) ||
        (r.primaryDomainId?.name || r.primaryDomain?.name || r.domain || r.category) === selectedDomain;

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.domainAssociations || []).some(da =>
          (da.domainId?.name || '').toLowerCase().includes(q) ||
          (da.subdomains || []).some(s => (s.name || '').toLowerCase().includes(q))
        ) ||
        (r.primaryDomainId?.name || r.primaryDomain?.name || r.domain || r.category || '').toLowerCase().includes(q);

      return matchesDom && matchesSearch;
    });
  }, [roadmaps, selectedDomain, search]);

  const totalPhases = useMemo(() => {
    return roadmaps.reduce((acc, r) => acc + (r.phases?.length || r.stages?.length || 0), 0);
  }, [roadmaps]);

  const completedMilestones = useMemo(() => {
    return milestones.filter(m => m.status === 'completed');
  }, [milestones]);

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-muted">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight size={13} />
        <span className="text-ink font-semibold">Learning Roadmaps</span>
      </nav>

      {/* Hero Header */}
      <div className="listing-hero max-w-3xl py-4">
        <span className="eyebrow inline-block mb-2 font-mono font-bold tracking-widest text-xs uppercase text-primary">
          CONTINUOUS MASTERY & CURRICULA
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-ink leading-tight">
          Learning Roadmaps & Progression.
        </h1>
        <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
          Transparent technical learning paths, progressive curriculum phases, and verifiable competency milestones built while studying complex engineering systems.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            PUBLISHED ROADMAPS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">{roadmaps.length}</span>
            <span className="text-xs text-muted font-medium">Curricula</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-primary font-bold block">
            CURRICULUM PHASES
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-primary">{totalPhases}</span>
            <span className="text-xs text-muted font-medium">Distinct Stages</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-700 dark:text-emerald-400 font-bold block">
            VERIFIED OUTCOMES
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-emerald-700 dark:text-emerald-400">{completedMilestones.length}</span>
            <span className="text-xs text-muted font-medium">Achieved</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            DOMAINS COVERED
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">{domainsList.length - 1}</span>
            <span className="text-xs text-muted font-medium">Disciplines</span>
          </div>
        </div>
      </div>

      {/* Search & Domain Filter Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search learning roadmaps (e.g. Distributed, AI, Security)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-border bg-background text-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="text-xs font-mono text-muted self-end sm:self-auto">
            Showing <strong className="text-ink">{filteredRoadmaps.length}</strong> of {roadmaps.length} roadmaps
          </div>
        </div>

        {domainsList.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-border/80 scrollbar-thin">
            {domainsList.map(dom => (
              <button
                key={dom}
                type="button"
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer whitespace-nowrap ${
                  selectedDomain === dom
                    ? 'bg-primary text-primary-text border-primary shadow-2xs'
                    : 'bg-background text-muted hover:text-ink border-border hover:border-gold'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Roadmaps Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-muted">Loading learning paths…</div>
      ) : filteredRoadmaps.length === 0 ? (
        roadmaps.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-dashed border-border rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Workflow size={24} />
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-ink">
              No Learning Roadmaps Yet
            </h3>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto mt-1 mb-5 leading-relaxed">
              No learning roadmaps have been added yet. Add structured engineering milestones and learning paths in the Admin Workspace to track them here.
            </p>
            <Link
              to="/admin/roadmaps"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-105 transition shadow-xs"
            >
              <span>Add Roadmaps in Admin</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <EmptyState title="No roadmaps found" description="Try clearing your search query or domain filter." />
        )
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredRoadmaps.map(r => {
            const displayPhases = r.phases?.length ? r.phases : r.stages || [];
            const domainName = r.primaryDomainId?.name || r.domain || r.category;
            return (
              <div key={r._id} className="panel-card bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {r.domainAssociations && r.domainAssociations.length > 0 ? (
                        r.domainAssociations.map((da, idx) => {
                          const dName = da.domainId?.name || r.category;
                          const accent = da.domainId?.accentColor || '#bb9457';
                          const subCount = da.subdomains?.length || da.subdomainIds?.length || 0;
                          return (
                            <span
                              key={idx}
                              className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border inline-flex items-center gap-1"
                              style={{
                                backgroundColor: `${accent}15`,
                                borderColor: `${accent}40`,
                                color: accent
                              }}
                              title={da.subdomains?.map(s => s.name).join(', ') || dName}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                              <span>{dName}</span>
                              {subCount > 0 && <span className="opacity-75 font-normal">({subCount})</span>}
                            </span>
                          );
                        })
                      ) : domainName ? (
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                          {domainName}
                        </span>
                      ) : null}
                      {r.subdomainName && !r.domainAssociations?.length && (
                        <span className="text-[10px] font-mono text-muted">
                          / {r.subdomainName}
                        </span>
                      )}
                      {r.difficulty && (
                        <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {r.difficulty}
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                      {Math.round(r.progress || 0)}% Complete
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-ink mt-1 font-display">{r.title}</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                    {r.description || r.purpose}
                  </p>

                  <div className="mt-4 h-2 w-full rounded-full bg-secondary-background overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, r.progress || 0))}%` }}
                    />
                  </div>

                  {/* Phases and steps overview */}
                  <div className="mt-5 space-y-3 border-t border-border pt-4">
                    {displayPhases.map((phase, idx) => (
                      <div key={phase._id || idx} className="text-xs">
                        <strong className="block text-ink font-semibold flex items-center justify-between">
                          <span>{idx + 1}. {phase.title}</span>
                          <span className="text-[10px] font-mono text-muted font-normal">
                            {(phase.steps || []).filter(s => s.completed || s.status === 'completed').length}/{(phase.steps || []).length} steps
                          </span>
                        </strong>
                        <div className="mt-1 space-y-1 pl-2 border-l-2 border-border">
                          {(phase.steps || []).map((st, sIdx) => {
                            const isDone = st.completed || st.status === 'completed';
                            return (
                              <div key={st._id || sIdx} className="flex items-center gap-2 text-[11px] text-muted">
                                {isDone ? (
                                  <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                                ) : (
                                  <span className="h-2 w-2 rounded-full border border-border shrink-0" />
                                )}
                                <span className={isDone ? 'line-through text-muted/70' : ''}>
                                  {st.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {r.primaryDomainId?.slug && (
                  <div className="mt-6 pt-3.5 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-muted">
                      {r.estimatedDuration || `${displayPhases.length} phases`}
                    </span>
                    <Link
                      to={`/domains/${r.primaryDomainId.slug}`}
                      className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Explore Domain Hub <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
