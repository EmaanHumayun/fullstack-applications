import React, { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  BookOpen,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Paperclip,
  Award,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api.js';
import { SafeMarkdown } from '../lib/markdown.jsx';

export default function PracticeLabsPage() {
  const [labs, setLabs] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [activeLab, setActiveLab] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [labsRes, domRes] = await Promise.all([
          api('/practice-labs').catch(() => []),
          api('/domains').catch(() => [])
        ]);
        setLabs(labsRes || []);
        setDomains(domRes || []);
      } catch (err) {
        console.error('Failed to load practice labs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const domainsList = useMemo(() => {
    const list = new Set(['All']);
    domains.forEach(d => list.add(d.name));
    labs.forEach(l => {
      (l.domainAssociations || []).forEach(da => {
        if (da.domainId?.name) list.add(da.domainId.name);
      });
      if (l.primaryDomain?.name) list.add(l.primaryDomain.name);
    });
    return Array.from(list);
  }, [domains, labs]);

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const labTypes = ['All', 'Guided Lab', 'Challenge Lab', 'Simulation', 'Troubleshooting', 'Experiment', 'Practical Exercise'];

  const filteredLabs = useMemo(() => {
    return labs.filter(lab => {
      const matchesSearch =
        !search.trim() ||
        lab.title.toLowerCase().includes(search.toLowerCase()) ||
        (lab.shortDescription || '').toLowerCase().includes(search.toLowerCase()) ||
        (lab.technologies || []).some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        (lab.domainAssociations || []).some(da =>
          (da.domainId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (da.subdomains || []).some(s => (s.name || '').toLowerCase().includes(search.toLowerCase()))
        );

      const matchesDomain =
        selectedDomain === 'All' ||
        (lab.domainAssociations || []).some(da => da.domainId?.name === selectedDomain) ||
        lab.primaryDomain?.name === selectedDomain;

      const matchesDifficulty =
        selectedDifficulty === 'All' || lab.difficulty === selectedDifficulty;

      const matchesType =
        selectedType === 'All' || lab.labType === selectedType;

      return matchesSearch && matchesDomain && matchesDifficulty && matchesType;
    });
  }, [labs, search, selectedDomain, selectedDifficulty, selectedType]);

  // Overall metrics
  const stats = useMemo(() => {
    const total = labs.length;
    const completed = labs.filter(l => l.status === 'Completed').length;
    const inProgress = labs.filter(l => l.status === 'In Progress').length;
    const totalEstMins = labs.reduce((acc, l) => acc + (parseInt(l.estimatedDuration) || 0), 0);
    const estHours = Math.round(totalEstMins / 60);
    return { total, completed, inProgress, estHours };
  }, [labs]);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header Banner */}
      <div className="bg-surface border-b border-border py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                <FlaskConical className="w-3.5 h-3.5" />
                Hands-On Engineering Practice
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
                Practice Labs & Technical Sandboxes
              </h1>
              <p className="mt-2 text-base text-text-muted max-w-2xl">
                Rigorous, hands-on engineering tutorials, simulations, troubleshooting scenarios, and systems experiments across cloud, infrastructure, and backend engineering.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-background/80 p-4 rounded-xl border border-border">
              <div className="text-center px-2">
                <div className="text-2xl font-black text-text">{stats.total}</div>
                <div className="text-xs text-text-muted font-medium">Total Labs</div>
              </div>
              <div className="text-center px-2 border-l border-border">
                <div className="text-2xl font-black text-emerald-600">{stats.completed}</div>
                <div className="text-xs text-text-muted font-medium">Completed</div>
              </div>
              <div className="text-center px-2 border-l border-border">
                <div className="text-2xl font-black text-blue-600">{stats.inProgress}</div>
                <div className="text-xs text-text-muted font-medium">In Flight</div>
              </div>
              <div className="text-center px-2 border-l border-border">
                <div className="text-2xl font-black text-amber-600">{stats.estHours}h</div>
                <div className="text-xs text-text-muted font-medium">Hands-On Est.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filters Bar */}
        <div className="bg-surface rounded-2xl border border-border p-4 mb-8 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search labs by title, technology, domain, or commands..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text placeholder-text-muted"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                aria-label="Filter labs by difficulty"
                className="px-3 py-2 text-sm bg-background border border-border rounded-xl text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {difficulties.map(d => (
                  <option key={d} value={d}>
                    Difficulty: {d}
                  </option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                aria-label="Filter labs by type"
                className="px-3 py-2 text-sm bg-background border border-border rounded-xl text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {labTypes.map(t => (
                  <option key={t} value={t}>
                    Type: {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Domain Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Domains:
            </span>
            {domainsList.map(domain => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedDomain === domain
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-background hover:bg-border/60 text-text-muted hover:text-text border border-border'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Labs Grid */}
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
            <p className="text-sm text-text-muted">Loading practice labs catalog...</p>
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center max-w-lg mx-auto">
            <FlaskConical className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-text">No Practice Labs Found</h3>
            <p className="text-sm text-text-muted mt-1">
              No technical labs matched your search filters. Try adjusting domain, difficulty, or search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs.map(lab => (
              <div
                key={lab._id}
                onClick={() => setActiveLab(lab)}
                className="group bg-surface rounded-2xl border border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer overflow-hidden relative"
              >
                {/* Status indicator bar */}
                <div
                  className={`h-1.5 w-full ${
                    lab.status === 'Completed'
                      ? 'bg-emerald-500'
                      : lab.status === 'In Progress'
                      ? 'bg-blue-500'
                      : lab.status === 'On Hold'
                      ? 'bg-amber-500'
                      : 'bg-gray-300'
                  }`}
                />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Category & Difficulty Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                      {lab.labType || 'Practice Lab'}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        lab.difficulty === 'Beginner'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : lab.difficulty === 'Intermediate'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : lab.difficulty === 'Advanced'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {lab.difficulty}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors line-clamp-1 mb-2">
                    {lab.title}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-2 mb-4 flex-1">
                    {lab.shortDescription || 'No description provided.'}
                  </p>

                  {/* Domains and Subdomains */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(lab.domainAssociations || []).slice(0, 2).map((da, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] bg-background border border-border px-2 py-0.5 rounded text-text-muted"
                      >
                        <span className="font-semibold text-text">{da.domainId?.name}</span>
                        {da.subdomains && da.subdomains.length > 0 && (
                          <span className="text-primary font-medium">
                            / {da.subdomains[0].name}
                            {da.subdomains.length > 1 && ` +${da.subdomains.length - 1}`}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Technologies tags */}
                  {lab.technologies && lab.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {lab.technologies.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-border/40 text-text px-2 py-0.5 rounded font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                      {lab.technologies.length > 4 && (
                        <span className="text-[11px] text-text-muted px-1.5 py-0.5">
                          +{lab.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer Stats & Progress */}
                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lab.estimatedDuration || '45m'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {lab.githubUrl && (
                        <a
                          href={lab.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> GitHub
                        </a>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-background rounded-full h-2 border border-border overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${lab.completionPercentage || 0}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-text">
                          {lab.completionPercentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lab Detail Interactive Modal */}
      {activeLab && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-start justify-between gap-4 bg-background/50">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                    {activeLab.labType}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeLab.difficulty}
                  </span>
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {activeLab.estimatedDuration || '45m'}
                  </span>
                  <span className="text-xs font-mono text-text-muted bg-border/40 px-2 py-0.5 rounded">
                    ID: {activeLab.labId || 'LAB'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-text">{activeLab.title}</h2>
              </div>
              <button
                onClick={() => setActiveLab(null)}
                className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-border/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Short & Detailed Description */}
              <div>
                <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">
                  Learning Objective & Scope
                </h4>
                <p className="text-text leading-relaxed font-medium mb-3">
                  {activeLab.learningObjective || activeLab.shortDescription}
                </p>
                {activeLab.detailedDescription && (
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <SafeMarkdown content={activeLab.detailedDescription} />
                  </div>
                )}
              </div>

              {/* Multi-Domain Associations */}
              {activeLab.domainAssociations && activeLab.domainAssociations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">
                    Associated Engineering Domains & Subdomains
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeLab.domainAssociations.map((da, i) => (
                      <div
                        key={i}
                        className="p-3 bg-background border border-border rounded-xl flex flex-col gap-1"
                      >
                        <div className="font-bold text-text flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-primary" />
                          {da.domainId?.name || 'Primary Domain'}
                        </div>
                        {da.subdomains && da.subdomains.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {da.subdomains.map(s => (
                              <span
                                key={s._id}
                                className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Checklist */}
              {activeLab.tasks && activeLab.tasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">
                    Hands-On Tasks & Milestones ({activeLab.tasks.filter(t => t.completed).length}/
                    {activeLab.tasks.length})
                  </h4>
                  <div className="space-y-2">
                    {activeLab.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-background border border-border rounded-xl"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            task.completed ? 'text-emerald-500' : 'text-text-muted/40'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-text">{task.title}</div>
                          {task.description && (
                            <div className="text-xs text-text-muted mt-0.5">{task.description}</div>
                          )}
                          {task.command && (
                            <pre className="mt-2 text-xs font-mono bg-border/40 p-2 rounded text-text overflow-x-auto">
                              <code>{task.command}</code>
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commands & Configuration */}
              {activeLab.commands && activeLab.commands.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-primary" /> Technical Commands & Snippets
                  </h4>
                  <div className="space-y-2">
                    {activeLab.commands.map((cmd, i) => (
                      <div key={i} className="bg-background rounded-xl p-3 border border-border">
                        <div className="text-xs font-semibold text-text mb-1">{cmd.description}</div>
                        <pre className="text-xs font-mono bg-border/40 p-2.5 rounded text-text overflow-x-auto">
                          <code>{cmd.command}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Markdown Documentation Preview */}
              {activeLab.markdownFiles && activeLab.markdownFiles.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" /> Documentation Files ({activeLab.markdownFiles.length})
                  </h4>
                  <div className="border border-border rounded-xl overflow-hidden bg-background divide-y divide-border">
                    {activeLab.markdownFiles.map(doc => (
                      <div key={doc._id} className="p-4">
                        <div className="font-bold text-text text-sm flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {doc.title} ({doc.fileName})
                        </div>
                        <div className="max-h-60 overflow-y-auto bg-surface p-3 rounded-lg border border-border">
                          <SafeMarkdown content={doc.content} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Log */}
              {activeLab.evidence && activeLab.evidence.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" /> Practical Evidence & Verifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeLab.evidence.map(ev => (
                      <div key={ev._id} className="p-3 bg-background border border-border rounded-xl">
                        <div className="font-semibold text-text">{ev.title}</div>
                        <div className="text-xs text-text-muted mt-1">{ev.description}</div>
                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Evidence Artifact
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-background/50 border-t border-border flex items-center justify-between gap-3">
              {activeLab.githubUrl ? (
                <a
                  href={activeLab.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Module on GitHub
                </a>
              ) : (
                <div />
              )}
              <button
                onClick={() => setActiveLab(null)}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-all"
              >
                Close Lab Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
