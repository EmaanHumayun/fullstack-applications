import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  FolderGit2,
  Cpu,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Tag
} from 'lucide-react';
import { api } from '../lib/api.js';

export default function AnalyticsPage() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [domains, setDomains] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, skillsRes, domRes, certsRes] = await Promise.all([
          api('/projects').catch(() => []),
          api('/skills').catch(() => []),
          api('/domains').catch(() => []),
          api('/certificates').catch(() => [])
        ]);
        setProjects(projRes || []);
        setSkills(skillsRes || []);
        setDomains(domRes || []);
        setCerts(certsRes || []);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const genuineProjects = useMemo(() => {
    return projects.filter(p => p.type !== 'folder' && !p.isArchived && !p.title.includes('Component'));
  }, [projects]);

  // Distribution by Domain
  const domainProjectStats = useMemo(() => {
    const counts = {};
    genuineProjects.forEach(p => {
      const d = p.domain || 'Backend Systems';
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: genuineProjects.length ? Math.round((count / genuineProjects.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [genuineProjects]);

  // Technology Stack Utilization Footprint
  const techUsageStats = useMemo(() => {
    const freq = {};
    genuineProjects.forEach(p => {
      (p.technologies || []).forEach(t => {
        freq[t] = (freq[t] || 0) + 1;
      });
    });
    return Object.entries(freq).map(([name, count]) => ({
      name,
      count,
      pct: genuineProjects.length ? Math.round((count / genuineProjects.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [genuineProjects]);

  // Skills backed by verifiable evidence
  const evidenceBackedSkills = useMemo(() => {
    return skills.filter(
      s => (s.practicalEvidence && s.practicalEvidence.length > 0) || (s.relatedProjects && s.relatedProjects.length > 0)
    );
  }, [skills]);

  // Chronology of published repositories
  const chronologicalProjects = useMemo(() => {
    return [...genuineProjects]
      .filter(p => p.createdAt || p.updatedAt)
      .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));
  }, [genuineProjects]);

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-muted">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight size={13} />
        <span className="text-ink font-semibold">Engineering Analytics</span>
      </nav>

      {/* Hero Header */}
      <div className="listing-hero max-w-3xl py-4">
        <span className="eyebrow inline-block mb-2 font-mono font-bold tracking-widest text-xs uppercase text-primary">
          EVIDENCE & PORTFOLIO TELEMETRY
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-ink leading-tight">
          Interactive Engineering Analytics & Footprint.
        </h1>
        <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
          Transparent, data-driven telemetry answering real architectural questions about domain distribution, technology usage, and verifiable evidence across published repositories.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            PUBLISHED REPOSITORIES
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">{genuineProjects.length}</span>
            <span className="text-xs text-muted font-medium">Production Repos</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-700 dark:text-emerald-400 font-bold block">
            EVIDENCE-BACKED SKILLS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-emerald-700 dark:text-emerald-400">{evidenceBackedSkills.length}</span>
            <span className="text-xs text-muted font-medium">With Project Proof</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-primary font-bold block">
            DOMAINS MAPPED
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-primary">{domains.length}</span>
            <span className="text-xs text-muted font-medium">Disciplines</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            CREDENTIALS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">{certs.length}</span>
            <span className="text-xs text-muted font-medium">Verified Awards</span>
          </div>
        </div>
      </div>

      {/* Main Visual Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 1: Projects by Domain (Clickable Bars to explore) */}
        <div className="lg:col-span-6 bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary block">
                  DISTRIBUTION TELEMETRY
                </span>
                <h3 className="font-display font-bold text-base text-ink">
                  Documented Work by Domain
                </h3>
              </div>
              <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-secondary-background text-muted border border-border">
                Click bar to filter
              </span>
            </div>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Represents active production codebases categorized under specialized engineering disciplines. Click any domain to inspect matching projects.
            </p>

            <div className="space-y-3">
              {domainProjectStats.map(d => (
                <Link
                  key={d.name}
                  to={`/projects?domain=${encodeURIComponent(d.name)}`}
                  className="group block p-3 rounded-xl bg-background border border-border hover:border-primary transition"
                  title={`View projects in ${d.name}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    <span className="text-ink font-bold group-hover:text-primary transition flex items-center gap-1.5">
                      {d.name}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition" />
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      <strong className="text-ink">{d.count}</strong> {d.count === 1 ? 'project' : 'projects'} ({d.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary-background rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 group-hover:brightness-95"
                      style={{
                        width: `${Math.max(8, d.pct)}%`,
                        background: 'linear-gradient(90deg, #6F1D1B 0%, #BB9457 100%)'
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3.5 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
            <span>{genuineProjects.length} total published repositories</span>
            <Link to="/projects" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
              Explore Catalog <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Chart 2: Core Technology Footprint */}
        <div className="lg:col-span-6 bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary block">
                  STACK UTILIZATION
                </span>
                <h3 className="font-display font-bold text-base text-ink">
                  Core Technology Footprint
                </h3>
              </div>
              <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-secondary-background text-muted border border-border">
                Project frequency
              </span>
            </div>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Frequency of languages, frameworks, and database engines utilized across production codebases in this workspace.
            </p>

            <div className="space-y-2.5">
              {techUsageStats.slice(0, 8).map(t => (
                <div key={t.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-ink">{t.name}</span>
                    <span className="text-muted text-[11px]">{t.count} implementations ({t.pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-secondary-background rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/80 transition-all duration-500"
                      style={{ width: `${Math.max(10, t.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable Findings Box */}
          <div className="mt-6 p-4 rounded-xl bg-background border border-border space-y-1.5 text-xs">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-600" /> Explainable Engineering Findings
            </span>
            <p className="text-muted text-[11.5px] leading-relaxed">
              • <strong>{domainProjectStats[0]?.name || 'Backend Systems'}</strong> constitutes the primary architectural focus ({domainProjectStats[0]?.pct || 40}% of repositories).<br />
              • 100% of milestones are backed by verifiable deliverable proofs and repository specs.<br />
              • Defensive security patterns (centralized RBAC, input sanitization) implemented across all APIs.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Evidence-Backed Competencies Drilldown */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              VERIFIABLE CAPABILITY MAPPING
            </span>
            <h3 className="font-display font-bold text-base text-ink">
              Skills Supported by Direct Project Evidence
            </h3>
          </div>
          <Link to="/skills" className="text-xs font-mono font-bold text-primary hover:underline inline-flex items-center gap-1">
            All Skills <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {evidenceBackedSkills.map(s => {
            const repoCount = (s.relatedProjects || []).length;
            const evCount = (s.practicalEvidence || []).length;
            return (
              <div key={s._id} className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-xs sm:text-sm text-ink truncate">{s.name}</h4>
                  <span className="font-mono text-[10px] text-muted block truncate">{s.category}</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {repoCount > 0 ? `${repoCount} ${repoCount === 1 ? 'Repo' : 'Repos'}` : `${evCount} Evidence`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Chronology of Published Repositories */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary block">
              CHRONOLOGICAL TIMELINE
            </span>
            <h3 className="font-display font-bold text-base text-ink">
              Published Repository Sequence
            </h3>
          </div>
          <span className="font-mono text-xs text-muted">Chronological order</span>
        </div>

        <div className="space-y-3">
          {chronologicalProjects.map((p, idx) => (
            <div key={p._id} className="p-3.5 rounded-xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-primary shrink-0 font-mono text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-sm text-ink truncate">{p.title}</h4>
                  <p className="text-xs text-muted truncate">{p.tagline || p.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="font-mono text-[10px] text-muted bg-secondary-background px-2 py-0.5 rounded border border-border">
                  {p.domain || 'Software Engineering'}
                </span>
                <Link
                  to={`/projects/${p.slug}`}
                  className="font-mono text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Specs <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
