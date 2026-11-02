import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Boxes,
  Server,
  Layers,
  Cpu,
  Cloud,
  Code2,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  Workflow,
  Sparkles,
  FolderTree,
  GitBranch,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  CheckSquare,
  AlertCircle,
  FileCode,
  Folder,
  Terminal,
  Trophy,
  Share2
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Toast, EmptyState, Modal } from '../../components.jsx';

const ICON_MAP = {
  server: Server,
  layers: Layers,
  cpu: Cpu,
  cloud: Cloud,
  code: Code2
};

export default function AdminEcosystemDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'repositories' | 'roadmap' | 'skills'
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [toast, setToast] = useState('');
  const [promotingProject, setPromotingProject] = useState(null);
  const [promotingLoading, setPromotingLoading] = useState(false);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api(`/ecosystems/${slug}`);
      setData(res);
    } catch (err) {
      console.error('Failed to load ecosystem detail:', err);
      showToast(err.message || 'Failed to load ecosystem details');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handlePromote(project) {
    setPromotingLoading(true);
    try {
      await api(`/ecosystems/${project._id}/promote`, {
        method: 'POST',
        ...jsonBody({
          portfolioStatus: 'public_portfolio',
          featured: true
        })
      });
      showToast(`Promoted "${project.title}" to public portfolio!`);
      setPromotingProject(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to promote project');
    } finally {
      setPromotingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-stone-500">
        Loading ecosystem specification...
      </div>
    );
  }

  if (!data || !data.definition) {
    return (
      <EmptyState
        icon={Boxes}
        title="Ecosystem Not Found"
        description="The requested ecosystem could not be identified."
        action={
          <Link
            to="/admin/ecosystems"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold"
          >
            <ArrowLeft size={13} /> Back to Ecosystems
          </Link>
        }
      />
    );
  }

  const { definition, hubProject, levelProjects, subprojects, roadmap, skills, metrics } = data;
  const Icon = ICON_MAP[definition.icon] || Boxes;

  // Filter subprojects
  const filteredSubprojects = (subprojects || []).filter(p => {
    const matchesSearch = !projectSearch ||
      p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      (p.technologies && p.technologies.some(t => t.toLowerCase().includes(projectSearch.toLowerCase()))) ||
      (p.relatedConcepts && p.relatedConcepts.some(c => c.toLowerCase().includes(projectSearch.toLowerCase())));

    const matchesLevel = selectedLevel === 'all' || p.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/admin/ecosystems" className="hover:text-stone-900 transition flex items-center gap-1">
          <ArrowLeft size={13} /> Ecosystems
        </Link>
        <span>/</span>
        <span className="font-semibold text-stone-800">{definition.shortName}</span>
      </div>

      {/* Hero Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: definition.accentColor || '#3b82f6' }}
            >
              <Icon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                  {definition.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-stone-100 text-stone-700">
                  {metrics.completed} / {metrics.total} Verified
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                {definition.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://github.com/EmaanHumayun/${definition.hubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition shadow-sm"
            >
              <ExternalLink size={13} />
              <span>Main Hub Repo</span>
            </a>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block">Total Projects</span>
            <span className="text-base font-bold text-stone-900">{metrics.subprojectsCount || 20} Progressive</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block">Verified Completed</span>
            <span className="text-base font-bold text-emerald-700">{metrics.completed} Verified</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block">Active Roadmap</span>
            <span className="text-base font-bold text-stone-900">{roadmap ? `${roadmap.phases?.length || 4} Phases` : 'In Progress'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block">Taught Skills</span>
            <span className="text-base font-bold text-stone-900">{skills?.length || 0} Skills Mapped</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-2.5 border-b-2 transition ${activeTab === 'projects' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          20 Progressive Projects ({subprojects.length})
        </button>
        <button
          onClick={() => setActiveTab('repositories')}
          className={`pb-2.5 border-b-2 transition ${activeTab === 'repositories' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Repositories & Levels ({definition.levels?.length + 1})
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`pb-2.5 border-b-2 transition ${activeTab === 'roadmap' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Roadmap & Phases
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-2.5 border-b-2 transition ${activeTab === 'skills' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Skills Matrix ({skills?.length || 0})
        </button>
      </div>

      {/* Tab Content: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-stone-200">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search projects, technologies, or concepts..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-stone-500">Level:</span>
              {['all', 'Beginner', 'Intermediate', 'Advanced', 'Professional'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${selectedLevel === lvl ? 'bg-stone-900 text-white font-semibold' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
                >
                  {lvl === 'all' ? 'All Levels' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Project Cards List */}
          {filteredSubprojects.length === 0 ? (
            <EmptyState
              icon={Code2}
              title="No Projects Match Filter"
              description="Adjust your search query or level filter."
            />
          ) : (
            <div className="space-y-3">
              {filteredSubprojects.map(proj => {
                const isCompleted = proj.status === 'Completed';
                const isReady = proj.status === 'Ready to Start';

                return (
                  <div
                    key={proj.slug}
                    className={`bg-white border rounded-xl p-4 transition shadow-sm ${isCompleted ? 'border-emerald-200 bg-emerald-50/20' : isReady ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200'}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-900 text-white">
                            #{String(proj.projectNumber).padStart(2, '0')}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${proj.level === 'Beginner' ? 'bg-blue-100 text-blue-800' : proj.level === 'Intermediate' ? 'bg-indigo-100 text-indigo-800' : proj.level === 'Advanced' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'}`}>
                            {proj.level}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isCompleted ? 'bg-emerald-100 text-emerald-800' : isReady ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'}`}>
                            {proj.status}
                          </span>
                          {proj.portfolioStatus === 'public_portfolio' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              Public Portfolio
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-stone-900">
                          {proj.title}
                        </h3>

                        <p className="text-xs text-stone-600 leading-relaxed">
                          {proj.realWorldUseCase || proj.summary}
                        </p>

                        {/* Concepts & Tech Stack */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {proj.technologies?.map(tech => (
                            <span key={tech} className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[10px]">
                              {tech}
                            </span>
                          ))}
                          {proj.relatedConcepts?.map(concept => (
                            <span key={concept} className="px-2 py-0.5 rounded bg-stone-50 border border-stone-200 text-stone-600 text-[10px]">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition"
                          >
                            <ExternalLink size={12} />
                            <span>GitHub Directory</span>
                          </a>
                        )}

                        {isCompleted && proj.portfolioStatus !== 'public_portfolio' && (
                          <button
                            onClick={() => setPromotingProject(proj)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition"
                          >
                            <Trophy size={12} />
                            <span>Promote to Portfolio</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: REPOSITORIES */}
      {activeTab === 'repositories' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">
              Central Master Hub Repository
            </h2>
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong className="text-sm font-bold text-stone-900 block font-mono">
                  {definition.hubRepo}
                </strong>
                <span className="text-xs text-stone-500">
                  Documentation, architectural roadmaps, concept catalog, and global progress index.
                </span>
              </div>
              <a
                href={`https://github.com/EmaanHumayun/${definition.hubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition shrink-0"
              >
                <ExternalLink size={13} />
                <span>Open Hub on GitHub</span>
              </a>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">
              The 4 Level Repositories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {definition.levels?.map(lvl => (
                <div key={lvl.repo} className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">{lvl.level} Repository</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-700">{lvl.range}</span>
                  </div>
                  <strong className="font-mono text-xs text-blue-700 block">
                    {lvl.repo}
                  </strong>
                  <p className="text-xs text-stone-600">
                    {lvl.focus}
                  </p>
                  <div className="pt-2">
                    <a
                      href={`https://github.com/EmaanHumayun/${lvl.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-800 hover:text-blue-600"
                    >
                      <span>Explore Repository on GitHub</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                {roadmap ? roadmap.title : 'Ecosystem Roadmap'}
              </h2>
              <span className="text-xs text-stone-500">
                {roadmap?.description || 'Phased curriculum roadmap tracking milestones and concepts.'}
              </span>
            </div>
            <Link
              to="/admin/roadmaps"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-800 hover:text-stone-900"
            >
              <span>Manage in Roadmaps</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          {roadmap?.phases ? (
            <div className="space-y-4">
              {roadmap.phases.map((phase, pIdx) => (
                <div key={phase.id || pIdx} className="border border-stone-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Phase {pIdx + 1}: {phase.title}
                    </h3>
                    <span className="text-[11px] text-stone-500">
                      {phase.steps?.length || 0} Steps
                    </span>
                  </div>
                  <div className="space-y-2">
                    {phase.steps?.map(step => (
                      <div key={step.id} className="p-2.5 rounded bg-stone-50 flex items-start gap-2.5 text-xs">
                        <CheckSquare size={14} className={step.completed ? 'text-emerald-600 mt-0.5' : 'text-stone-300 mt-0.5'} />
                        <div className="flex-1">
                          <strong className="text-stone-900 block">{step.title}</strong>
                          <span className="text-stone-500">{step.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-stone-500 py-6 text-center">
              No detailed roadmap steps found for this ecosystem.
            </div>
          )}
        </div>
      )}

      {/* Tab Content: SKILLS */}
      {activeTab === 'skills' && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Core Competencies & Skills
              </h2>
              <span className="text-xs text-stone-500">
                Technical skills directly cultivated through this engineering ecosystem.
              </span>
            </div>
            <Link
              to="/admin/skills"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-800 hover:text-stone-900"
            >
              <span>Manage in Skills Library</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          {skills && skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map(s => (
                <div key={s._id} className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-stone-900">{s.name}</strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {s.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-stone-500 font-mono">
                    <span>Proficiency: {s.proficiencyPercentage || 80}%</span>
                    <span>Level: {s.level}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-stone-500 py-6 text-center">
              No skills mapped to this ecosystem category yet.
            </div>
          )}
        </div>
      )}

      {/* Promote to Portfolio Modal */}
      {promotingProject && (
        <Modal
          title={`Promote to Public Portfolio: ${promotingProject.title}`}
          onClose={() => setPromotingProject(null)}
        >
          <div className="space-y-4 text-xs text-stone-700">
            <p>
              You are about to promote this completed project into your public portfolio. This makes the project visible on your public portfolio page (<code className="font-mono">/projects</code>).
            </p>
            <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
              <div><strong>Project:</strong> {promotingProject.title}</div>
              <div><strong>Status:</strong> {promotingProject.status}</div>
              <div><strong>GitHub URL:</strong> {promotingProject.githubUrl}</div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setPromotingProject(null)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={promotingLoading}
                onClick={() => handlePromote(promotingProject)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition"
              >
                {promotingLoading ? 'Promoting...' : 'Confirm Promotion'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
