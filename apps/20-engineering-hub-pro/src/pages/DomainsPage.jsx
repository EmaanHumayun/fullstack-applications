import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Search,
  Server,
  Cpu,
  Shield,
  Database,
  Code2,
  FolderGit2,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../lib/api.js';
import { EmptyState } from '../components.jsx';
import { getDomainIcon } from './admin/AdminDomains.jsx';

export default function DomainsPage() {
  const [domains, setDomains] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [domRes, projRes, skillsRes] = await Promise.all([
          api('/domains').catch(() => []),
          api('/projects').catch(() => []),
          api('/skills').catch(() => [])
        ]);
        setDomains(domRes || []);
        setProjects(projRes || []);
        setSkills(skillsRes || []);
      } catch (err) {
        console.error('Failed to load domains page data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSubdomains = useMemo(() => {
    return domains.reduce((acc, d) => acc + (d.fields?.length || 0), 0);
  }, [domains]);

  const filteredDomains = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return domains;
    return domains.filter(d => {
      const matchName = d.name.toLowerCase().includes(q);
      const matchDesc = (d.description || '').toLowerCase().includes(q);
      const matchSub = (d.fields || []).some(f => (f.name || '').toLowerCase().includes(q));
      return matchName || matchDesc || matchSub;
    });
  }, [domains, search]);

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-muted">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight size={13} />
        <span className="text-ink font-semibold">Technical Domains</span>
      </nav>

      {/* Hero Header */}
      <div className="listing-hero max-w-3xl py-4">
        <span className="eyebrow inline-block mb-2 font-mono font-bold tracking-widest text-xs uppercase text-primary">
          TECHNICAL SPECIALIZATIONS & ARCHITECTURES
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-ink leading-tight">
          Specialized Domains & Engineering Hierarchy.
        </h1>
        <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
          Explore specialized disciplines across software engineering, distributed systems, applied artificial intelligence, and application security.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            CORE DOMAINS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">{domains.length}</span>
            <span className="text-xs text-muted font-medium">Specializations</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-primary font-bold block">
            ACTIVE SUBDOMAINS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-primary">{totalSubdomains}</span>
            <span className="text-xs text-muted font-medium">Sub-Disciplines</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-700 dark:text-emerald-400 font-bold block">
            VERIFIED SKILLS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-emerald-700 dark:text-emerald-400">{skills.length}</span>
            <span className="text-xs text-muted font-medium">Technologies</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            CONNECTED WORK
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">{projects.length}</span>
            <span className="text-xs text-muted font-medium">Repositories</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search domains, subdomains (e.g. Backend, AI, Security)..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-border bg-background text-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="text-xs font-mono text-muted self-end sm:self-auto">
          Showing <strong className="text-ink">{filteredDomains.length}</strong> of {domains.length} domains
        </div>
      </div>

      {/* Domain Collection Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-muted">Loading technical domains…</div>
      ) : filteredDomains.length === 0 ? (
        <EmptyState title="No domains found" description="Try adjusting your search criteria." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filteredDomains.map(dom => {
            const IconComp = getDomainIcon(dom.icon);
            const domProjectsCount = projects.filter(p => p.domain === dom.name).length;

            return (
              <div
                key={dom._id}
                className="group p-6 rounded-2xl bg-surface border border-border shadow-xs hover:border-primary hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                style={{ borderTopWidth: 4, borderTopColor: dom.accentColor || '#6f1d1b' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform"
                      style={{ background: dom.accentColor || '#6f1d1b' }}
                    >
                      <IconComp size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-secondary-background text-muted px-2.5 py-1 rounded-full border border-border">
                        {dom.fields?.length || 0} Subdomains
                      </span>
                      {domProjectsCount > 0 && (
                        <span className="font-mono text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                          {domProjectsCount} Repos
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-display text-ink group-hover:text-primary transition">
                    <Link to={`/domains/${dom.slug}`} className="hover:underline flex items-center justify-between">
                      <span>{dom.name}</span>
                      <ArrowRight size={15} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition" />
                    </Link>
                  </h3>

                  <p className="text-xs text-muted mt-2 leading-relaxed line-clamp-2">
                    {dom.description || 'Specialized focus area and production architecture collection.'}
                  </p>

                  {/* Subdomains Explorer Pills */}
                  {dom.fields && dom.fields.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted block mb-2">
                        Subdomains & Focus Areas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dom.fields.map(f => (
                          <Link
                            key={f._id}
                            to={`/domains/${dom.slug}?subdomain=${encodeURIComponent(f.slug || f.name)}`}
                            className="font-mono text-[10.5px] px-2.5 py-1 rounded-lg bg-background text-ink border border-border hover:border-primary hover:text-primary transition"
                          >
                            {f.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono">
                  <Link
                    to={`/domains/${dom.slug}`}
                    className="font-bold text-primary inline-flex items-center gap-1.5 hover:underline"
                  >
                    <span>Explore Domain Hub</span>
                    <ArrowRight size={13} />
                  </Link>

                  <Link
                    to={`/projects?domain=${encodeURIComponent(dom.name)}`}
                    className="text-muted hover:text-ink transition flex items-center gap-1"
                  >
                    <FolderGit2 size={13} />
                    <span>View Projects</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
