import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Server,
  Layers,
  Cpu,
  Cloud,
  Code2,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Workflow,
  Sparkles,
  GitBranch,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { Toast, EmptyState } from '../../components.jsx';

const ICON_MAP = {
  server: Server,
  layers: Layers,
  cpu: Cpu,
  cloud: Cloud,
  code: Code2
};

export default function AdminEcosystems() {
  const [ecosystems, setEcosystems] = useState([]);
  const [nextAction, setNextAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [ecoRes, nextRes] = await Promise.all([
        api('/ecosystems'),
        api('/ecosystems/next-action').catch(() => null)
      ]);
      setEcosystems(ecoRes || []);
      setNextAction(nextRes || null);
    } catch (err) {
      console.error('Failed to load ecosystems:', err);
      showToast(err.message || 'Failed to load ecosystems');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-stone-900 text-white">
              <Boxes size={18} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
              Engineering Learning Ecosystems
            </h1>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Integrated architecture hubs, progressive 20-project tracks, and automated skill mapping across all engineering disciplines.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>Sync Ecosystems</span>
        </button>
      </div>

      {/* Recommended Next Action Banner */}
      {nextAction?.primaryRecommendation && (
        <div className="bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-700 text-white">
                  <Zap size={11} /> Recommended Next Action
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  {nextAction.primaryRecommendation.ecosystem}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-mono">
                  {nextAction.primaryRecommendation.project.level}
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900">
                {nextAction.primaryRecommendation.project.title}
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed max-w-2xl">
                {nextAction.primaryRecommendation.reason}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {nextAction.primaryRecommendation.project.githubUrl && (
                <a
                  href={nextAction.primaryRecommendation.project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition"
                >
                  <ExternalLink size={13} />
                  <span>GitHub Directory</span>
                </a>
              )}
              <Link
                to={`/admin/projects`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-800 transition"
              >
                <span>View in Projects</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Ecosystem Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500">
          Loading engineering ecosystems...
        </div>
      ) : ecosystems.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No Ecosystems Found"
          description="Ecosystem definitions could not be retrieved from the server."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {ecosystems.map(eco => {
            const Icon = ICON_MAP[eco.icon] || Boxes;
            return (
              <div
                key={eco.slug}
                className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: eco.accentColor || '#3b82f6' }}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold font-serif text-stone-900">
                          {eco.name}
                        </h2>
                        <span className="text-[11px] text-stone-500 font-mono">
                          {eco.domainSlug}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-stone-100 text-stone-700">
                      {eco.progressPercentage}% Complete
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                    {eco.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium text-stone-600">
                      <span>Curriculum Progression</span>
                      <span>{eco.completedProjects} of {eco.totalProjects} Projects Verified</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(5, eco.progressPercentage)}%`,
                          backgroundColor: eco.accentColor || '#3b82f6'
                        }}
                      />
                    </div>
                  </div>

                  {/* Repositories Matrix */}
                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                        Central Hub
                      </span>
                      <a
                        href={`https://github.com/EmaanHumayun/${eco.hubRepo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-stone-800 hover:text-blue-600 font-medium"
                      >
                        {eco.hubRepo}
                        <ExternalLink size={10} />
                      </a>
                    </div>

                    <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mt-2">
                      Level Repositories
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {eco.levels?.map(lvl => (
                        <div
                          key={lvl.repo}
                          className="p-1.5 rounded bg-stone-50 border border-stone-100 text-[10px] space-y-0.5"
                        >
                          <div className="font-semibold text-stone-800 flex items-center justify-between">
                            <span>{lvl.level}</span>
                            <span className="text-stone-400 font-normal">{lvl.range}</span>
                          </div>
                          <div className="text-stone-500 truncate" title={lvl.focus}>
                            {lvl.focus}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                  {eco.roadmap ? (
                    <Link
                      to={`/admin/roadmaps`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900"
                    >
                      <Workflow size={13} />
                      <span>Roadmap: {eco.roadmap.title}</span>
                    </Link>
                  ) : (
                    <span className="text-[11px] text-stone-400">Roadmap Active</span>
                  )}

                  <Link
                    to={`/admin/ecosystems/${eco.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition"
                  >
                    <span>Explore Ecosystem</span>
                    <ArrowRight size={13} />
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
