import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  Award,
  Target,
  CheckCircle2,
  BookOpen,
  Code2,
  FolderOpen,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Search,
  Trophy,
  BarChart3,
  Globe,
  Shield,
  FileBadge,
  Terminal,
  Cpu,
  Workflow
} from 'lucide-react';
import { api } from '../lib/api.js';
import { ProjectBlueprintCover } from '../components.jsx';

export default function PublicDomainDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubdomain = searchParams.get('subdomain') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Search and filters within tabs
  const [skillSearch, setSkillSearch] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const query = activeSubdomain ? `?subdomain=${encodeURIComponent(activeSubdomain)}` : '';
    api(`/domains/${slug}/deep-dive${query}`)
      .then(res => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load domain details');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [slug, activeSubdomain]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-mono">Loading technical domain telemetry…</p>
      </div>
    );
  }

  if (error || !data || !data.domain) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto">
          <Layers size={22} />
        </div>
        <h2 className="text-xl font-bold font-serif text-stone-900">Domain Not Found</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          The requested engineering domain does not exist or has been archived.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition"
        >
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
      </div>
    );
  }

  const {
    domain,
    subdomain,
    siblingSubdomains = [],
    skills = [],
    goals = [],
    milestones = [],
    certifications = [],
    projects = [],
    resources = [],
    achievements = [],
    roadmaps = [],
    counts = {},
    analytics = {}
  } = data;

  const accentColor = domain.accentColor || '#bb9457';

  // Filtered lists
  const filteredSkills = skills.filter(s =>
    !skillSearch ||
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(skillSearch.toLowerCase()))
  );

  const filteredResources = resources.filter(r =>
    resourceTypeFilter === 'All' || r.type === resourceTypeFilter
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'skills', label: `Skills (${counts.skills || 0})`, icon: Code2 },
    { id: 'roadmaps', label: `Roadmaps (${roadmaps.length || counts.roadmaps || 0})`, icon: Workflow },
    { id: 'goals', label: `Goals (${(counts.activeGoals || 0) + (counts.completedGoals || 0)})`, icon: Target },
    { id: 'milestones', label: `Milestones (${counts.milestones || 0})`, icon: Clock },
    { id: 'certifications', label: `Certifications (${counts.certifications || 0})`, icon: FileBadge },
    { id: 'projects', label: `Projects (${counts.projects || 0})`, icon: FolderOpen },
    { id: 'workLogs', label: `Engineering Practice (${(data.workLogs || []).length || counts.workLogs || 0})`, icon: Clock },
    { id: 'resources', label: `Resources (${counts.resources || 0})`, icon: BookOpen },
    { id: 'achievements', label: `Achievements (${counts.achievements || 0})`, icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
        <Link to="/" className="hover:text-stone-900 transition">Portfolio</Link>
        <ChevronRight size={12} className="text-stone-400" />
        <Link to="/#domains" className="hover:text-stone-900 transition">Domains</Link>
        <ChevronRight size={12} className="text-stone-400" />
        <span className="font-semibold text-stone-900">{domain.name}</span>
        {subdomain && (
          <>
            <ChevronRight size={12} className="text-stone-400" />
            <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {subdomain.name}
            </span>
          </>
        )}
      </nav>

      {/* Domain Header Hero */}
      <header
        className="relative overflow-hidden rounded-3xl bg-surface border border-border p-6 sm:p-8 lg:p-10 shadow-sm"
        style={{ borderTopWidth: 5, borderTopColor: accentColor }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-sm"
                style={{ backgroundColor: accentColor }}
              >
                <Layers size={16} />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-stone-500 uppercase">
                Technical Knowledge Hub
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-ink">
              {domain.name}
              {subdomain && (
                <span className="block text-xl sm:text-2xl font-sans font-medium text-amber-800 mt-1">
                  ↳ {subdomain.name}
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {subdomain?.description || domain.description || 'Dedicated technical domain encompassing architecture, demonstrated competencies, verifiable projects, and ongoing engineering milestones.'}
            </p>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50/80 p-3 rounded-2xl border border-stone-200/70 shrink-0">
            <div className="text-center px-3 py-1.5 bg-white rounded-xl shadow-xs border border-stone-100">
              <span className="block text-xl font-bold font-mono text-stone-900">{counts.skills || 0}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Skills</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-white rounded-xl shadow-xs border border-stone-100">
              <span className="block text-xl font-bold font-mono text-stone-900">{roadmaps.length || counts.roadmaps || 0}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Roadmaps</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-white rounded-xl shadow-xs border border-stone-100">
              <span className="block text-xl font-bold font-mono text-stone-900">{counts.projects || 0}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Projects</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-white rounded-xl shadow-xs border border-stone-100">
              <span className="block text-xl font-bold font-mono text-emerald-700">{counts.achievements || 0}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Achievements</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-white rounded-xl shadow-xs border border-stone-100">
              <span className="block text-xl font-bold font-mono text-stone-900">{counts.completedGoals || 0}/{counts.activeGoals || 0}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Goals Done</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-white rounded-xl shadow-xs border border-stone-100">
              <span className="block text-xl font-bold font-mono text-stone-900">{counts.certifications || 0}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Certs</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-white rounded-xl shadow-xs border border-stone-100">
              <span className="block text-xl font-bold font-mono text-stone-900">{counts.resources || 0}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Resources</span>
            </div>
          </div>
        </div>

        {/* Subdomains Explorer Pills */}
        {siblingSubdomains.length > 0 && (
          <div className="mt-6 pt-5 border-t border-stone-200/60">
            <span className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Areas of Specialization (Subdomains):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSearchParams({})}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                  !activeSubdomain
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                All {domain.name}
              </button>
              {siblingSubdomains.map(sub => {
                const isSelected = activeSubdomain === sub.slug || activeSubdomain === sub.name;
                return (
                  <button
                    key={sub._id || sub.slug}
                    onClick={() => setSearchParams({ subdomain: sub.slug })}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-border">
        <div className="tab-scroll-container" role="tablist" aria-label="Domain Sections">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-amber-800 text-amber-900 bg-amber-50/60 font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-amber-800' : 'text-stone-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panes */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Achievements Highlight */}
          {achievements.length > 0 && (
            <section className="bg-gradient-to-br from-amber-50/60 via-stone-50 to-emerald-50/40 p-6 rounded-2xl border border-amber-200/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                  <Trophy size={18} className="text-amber-700" />
                  Verified Domain Milestones & Achievements
                </h3>
                <span className="text-[11px] font-mono text-stone-500">
                  {achievements.length} verified records
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.slice(0, 6).map((ach) => (
                  <div key={ach.id} className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {ach.type}
                      </span>
                      {ach.date && (
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(ach.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-stone-900">{ach.title}</h4>
                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Featured Projects in Domain */}
          {projects.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                  <FolderOpen size={18} className="text-amber-800" />
                  Domain Projects ({projects.length})
                </h3>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1"
                >
                  View all projects <ArrowRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {projects.slice(0, 4).map(p => (
                  <div key={p._id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between p-5 space-y-3 h-full">
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden border border-stone-100">
                      <ProjectBlueprintCover project={p} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {p.subdomain || p.fieldName || domain.name}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          {p.status || 'Active'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-stone-900 hover:text-amber-800 transition">
                        <Link to={`/projects/${p.slug}`}>{p.title}</Link>
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {p.summary || p.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-100">
                      {(p.technologies || []).slice(0, 4).map(t => (
                        <span key={t} className="text-[10px] font-mono bg-stone-50 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Core Competencies Preview */}
          {skills.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                  <Code2 size={18} className="text-amber-800" />
                  Key Skills & Competencies ({skills.length})
                </h3>
                <button
                  onClick={() => setActiveTab('skills')}
                  className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1"
                >
                  Explore skill details <ArrowRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {skills.slice(0, 9).map(s => (
                  <div key={s._id} className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-2 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">{s.name}</span>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {s.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-2">
                      {s.description || 'Core engineering proficiency'}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] font-mono text-stone-400">
                      <span>Status: <strong className="text-stone-700">{s.status}</strong></span>
                      <span>{s.proficiencyPercentage || 70}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* TAB 2: SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search skills in domain…"
                value={skillSearch}
                onChange={e => setSkillSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
              />
            </div>
            <span className="text-xs font-mono text-stone-500 self-end sm:self-auto">
              Showing {filteredSkills.length} of {skills.length} skills
            </span>
          </div>

          {filteredSkills.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              No skills match the current search or subdomain filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSkills.map(s => (
                <div key={s._id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900">{s.name}</h4>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                          {s.level}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">
                        {s.subdomain || s.subcategory || domain.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold">
                      {s.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {s.description || 'Engineered competency applied across system implementations.'}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-stone-500">
                      <span>Proficiency assessment</span>
                      <span>{s.proficiencyPercentage || 70}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-800 rounded-full"
                        style={{ width: `${s.proficiencyPercentage || 70}%` }}
                      />
                    </div>
                  </div>

                  {/* Linked project pills */}
                  {s.relatedProjects && s.relatedProjects.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-stone-400">Demonstrated in:</span>
                      {s.relatedProjects.map(rp => (
                        <Link
                          key={rp._id}
                          to={`/projects/${rp.slug}`}
                          className="text-[10px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 hover:underline"
                        >
                          {rp.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GOALS */}
      {activeTab === 'goals' && (
        <div className="space-y-6 animate-fade-in">
          {goals.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              No active or public goals recorded under this domain.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map(g => (
                <div key={g._id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-stone-400">
                        {g.timeHorizon || 'Strategic Goal'}
                      </span>
                      <h4 className="text-base font-bold text-stone-900">{g.title}</h4>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      g.status === 'Completed' || g.status === 'Achieved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {g.status}
                    </span>
                  </div>

                  {g.description && (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {g.description}
                    </p>
                  )}

                  {/* Progress Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-stone-500">
                      <span>Execution progress</span>
                      <span>{g.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${g.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-stone-400">
                    <span>Priority: <strong className="text-stone-700">{g.priority || 'Normal'}</strong></span>
                    {g.deadline && (
                      <span>Target: {new Date(g.deadline).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4 animate-fade-in">
          {milestones.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              No milestones associated with this domain.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestones.map(m => (
                <div key={m._id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-stone-400">
                        {m.category || 'Career'} · {m.priority || 'Normal'}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        m.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 font-serif">{m.title}</h4>

                    {m.description && (
                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">{m.description}</p>
                    )}

                    {/* Progress bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-mono text-stone-400">
                        <span>Milestone Progress</span>
                        <span>{m.progress || (m.status === 'completed' ? 100 : 0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${m.progress || (m.status === 'completed' ? 100 : 0)}%` }}
                        />
                      </div>
                    </div>

                    {m.parentGoalId && (
                      <p className="text-[11px] text-stone-500 font-mono pt-1">
                        ↳ Goal: {m.parentGoalId.title}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span>Due: {m.dueDate || m.targetDate || 'Flexible'}</span>
                    {(m.evidenceUrl || (m.evidence && m.evidence.length > 0)) && (
                      <a
                        href={m.evidenceUrl || m.evidence[0]?.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-wine font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Proof <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="space-y-6 animate-fade-in">
          {certifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              No public certifications associated with this domain.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map(c => (
                <div key={c._id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                        <FileBadge size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">{c.title}</h4>
                        <span className="text-xs text-stone-500">{c.issuer || 'Accredited Authority'}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {c.status || 'Verified'}
                    </span>
                  </div>

                  {c.description && (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {c.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">
                      {c.issuedAt ? `Issued: ${c.issuedAt}` : ''}
                    </span>
                    {c.credentialUrl && (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-800 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        Verify Credential <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-fade-in">
          {projects.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              No public projects published under this domain.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(p => (
                <div key={p._id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between p-5 space-y-4">
                  <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-stone-100">
                    <ProjectBlueprintCover project={p} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                        {p.subdomain || p.fieldName || domain.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {p.status || 'Active'}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold font-serif text-stone-900 hover:text-amber-800 transition">
                      <Link to={`/projects/${p.slug}`}>{p.title}</Link>
                    </h4>

                    <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                      {p.summary || p.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-stone-100">
                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1">
                      {(p.technologies || []).map(t => (
                        <span key={t} className="text-[10px] font-mono bg-stone-50 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <Link
                        to={`/projects/${p.slug}`}
                        className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1"
                      >
                        View Architecture Spec <ArrowRight size={13} />
                      </Link>

                      <div className="flex items-center gap-2">
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-stone-500 hover:text-stone-900" title="Source Code">
                            <Github size={15} />
                          </a>
                        )}
                        {p.liveUrl && (
                          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-stone-500 hover:text-stone-900" title="Live Deployment">
                            <Globe size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: LEARNING RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-6 animate-fade-in">
          {/* Resource Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {['All', 'Documentation', 'Courses', 'Practical labs', 'Books and papers', 'Tools'].map(t => (
              <button
                key={t}
                onClick={() => setResourceTypeFilter(t)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition whitespace-nowrap ${
                  resourceTypeFilter === t
                    ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {filteredResources.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              No learning resources in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(r => (
                <div key={r._id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/70">
                        {r.type}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        {r.difficulty || 'Intermediate'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">
                      <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-amber-800 transition inline-flex items-center gap-1.5">
                        {r.title} <ExternalLink size={12} className="shrink-0 text-stone-400" />
                      </a>
                    </h4>
                    {r.description && (
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {r.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span>Status: <strong className="text-stone-800">{r.status || 'Active'}</strong></span>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-800 hover:underline font-semibold"
                    >
                      Access Material →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: WORK LOGS / ENGINEERING PRACTICE */}
      {activeTab === 'workLogs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs font-mono text-stone-600">
              Verified Practice History • <strong>{data.totalLoggedHours || 0} hours</strong> logged in this domain
            </span>
          </div>

          {(data.workLogs || []).length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              No public work logs recorded yet under this domain context.
            </div>
          ) : (
            <div className="space-y-3">
              {(data.workLogs || []).map(w => (
                <div key={w._id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">{w.date}</span>
                    <span className="rounded bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                      {Math.round((w.timeSpentMinutes / 60) * 10) / 10} hrs ({w.timeSpentMinutes} min)
                    </span>
                    <span className="text-[10px] font-semibold text-stone-600 bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5">{w.category}</span>
                    {w.projectId && (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 border border-amber-200">{w.projectId.title}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">{w.title}</h4>
                  {w.outcome && (
                    <p className="text-xs text-emerald-800 bg-emerald-50 rounded p-1.5 border border-emerald-200">
                      <strong>Deliverable:</strong> {w.outcome}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-4 animate-fade-in">
          {achievements.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              No verified achievements recorded yet under this domain.
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold mt-0.5">
                      <Trophy size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {ach.type}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900">{ach.title}</h4>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  {ach.date && (
                    <span className="text-[10px] font-mono text-stone-400 whitespace-nowrap shrink-0">
                      {new Date(ach.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ROADMAPS */}
      {activeTab === 'roadmaps' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div>
              <h3 className="text-xl font-bold font-serif text-ink flex items-center gap-2">
                <Workflow size={20} className="text-amber-800" />
                Structured Learning Roadmaps
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Step-by-step technical paths and progressive mastery curriculums within {domain.name}
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-stone-100 text-stone-700 rounded-full border border-stone-200">
              {roadmaps.length} paths available
            </span>
          </div>

          {roadmaps.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-stone-200">
              <Workflow size={32} className="mx-auto text-stone-300 mb-2" />
              <h4 className="text-sm font-bold text-ink">No Roadmaps Published Yet</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                Technical roadmaps for this domain are currently being curated or tested internally.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {roadmaps.map((rm) => (
                <div key={rm._id || rm.slug} className="group p-5 rounded-2xl bg-surface border border-border shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        {rm.difficulty || 'Intermediate'}
                      </span>
                      <span className="text-[11px] font-mono text-stone-500">
                        {rm.estimatedDuration || `${(rm.phases || []).length} phases`}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-ink group-hover:text-amber-900 transition font-serif">
                        {rm.title}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                        {rm.description || rm.purpose || 'Structured technical learning roadmap.'}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-stone-500 mb-1">
                        <span>Curriculum Progress</span>
                        <span className="font-bold text-stone-800">{Math.round(rm.progress || 0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, rm.progress || 0))}%` }}
                        />
                      </div>
                    </div>

                    {/* Phases overview summary */}
                    {(rm.phases || []).length > 0 && (
                      <div className="pt-2 border-t border-border/60">
                        <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block mb-1.5">
                          Curriculum Phases ({(rm.phases || []).length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rm.phases.slice(0, 4).map((p, idx) => (
                            <span key={p._id || idx} className="text-[11px] px-2 py-0.5 rounded bg-stone-50 text-stone-700 border border-stone-200">
                              {idx + 1}. {p.title}
                            </span>
                          ))}
                          {rm.phases.length > 4 && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-500">
                              +{rm.phases.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-stone-500">
                      {(rm.linkedSkills || []).length} linked skills
                    </span>
                    <a
                      href={`/#roadmaps`}
                      className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-900"
                    >
                      View on Portfolio <ChevronRight size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: DOMAIN ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proficiency Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                Skill Proficiency Distribution
              </h4>
              <div className="space-y-2">
                {(analytics.proficiencyDistribution || []).map(item => {
                  const maxSkills = Math.max(...(analytics.proficiencyDistribution || []).map(x => x.count), 1);
                  const pct = Math.round((item.count / maxSkills) * 100);
                  return (
                    <div key={item.level} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-stone-700">{item.level}</span>
                        <span className="font-bold text-stone-900">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-800 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skill Learning Status Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                Competency Lifecycle Status
              </h4>
              <div className="space-y-2">
                {(analytics.skillStatusDistribution || []).map(item => {
                  const maxCount = Math.max(...(analytics.skillStatusDistribution || []).map(x => x.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-stone-700">{item.status}</span>
                        <span className="font-bold text-stone-900">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Goal Progress Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                Goal Execution Distribution
              </h4>
              <div className="space-y-2">
                {(analytics.goalProgressDistribution || []).map(item => (
                  <div key={item.range} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-stone-700">Progress {item.range}</span>
                      <span className="font-bold text-stone-900">{item.count} goals</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full"
                        style={{ width: `${item.count > 0 ? (item.count / (counts.activeGoals + counts.completedGoals || 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification Status Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                Credentials & Exam Readiness
              </h4>
              <div className="space-y-2">
                {(analytics.certStatusDistribution || []).map(item => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-stone-700 capitalize">{item.status.replace('_', ' ')}</span>
                      <span className="font-bold text-stone-900">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${item.count > 0 ? (item.count / (counts.certifications || 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
