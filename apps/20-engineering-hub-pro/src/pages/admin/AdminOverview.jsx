import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  FolderOpen,
  Sparkles,
  Workflow,
  Clock,
  Trophy,
  Target,
  GraduationCap,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Database,
  Cpu,
  Server,
  Layers,
  Palette,
  Calendar,
  Filter,
  RotateCcw,
  TrendingUp,
  BarChart3,
  PieChart,
  Network,
  GitBranch,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Search,
  Flame,
  CheckSquare,
  ExternalLink,
  X,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { Modal, Toast, EmptyState } from '../../components.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

export default function AdminOverview({ currentUser }) {
  const { isViewer } = useAuth();
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // FILTER STATES
  // ---------------------------------------------------------------------------
  const [preset, setPreset] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedDomainId, setSelectedDomainId] = useState('all');
  const [selectedSubdomain, setSelectedSubdomain] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  // Perspective tab: 'dashboard' | 'trends' | 'domains' | 'execution' | 'competency' | 'heatmap' | 'relationships' | 'activity'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Time-series metric toggle: 'hours' | 'sessions' | 'deliverables'
  const [timeSeriesMetric, setTimeSeriesMetric] = useState('hours');

  // Selected node for Relationship Map Inspector Drawer
  const [inspectNode, setInspectNode] = useState(null);
  const [graphSearch, setGraphSearch] = useState('');
  const [graphTypeFilter, setGraphTypeFilter] = useState('all');

  // Heatmap day selection for drill-down
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState(null);

  // Raw data from API
  const [data, setData] = useState(null);
  const [domainList, setDomainList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');

  // ---------------------------------------------------------------------------
  // DATA LOADER
  // ---------------------------------------------------------------------------
  const loadCommandCenter = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('preset', preset);
      if (preset === 'custom' && customStart && customEnd) {
        params.set('startDate', customStart);
        params.set('endDate', customEnd);
      }
      if (selectedDomainId !== 'all') params.set('domainId', selectedDomainId);
      if (selectedSubdomain !== 'all') params.set('subdomain', selectedSubdomain);
      if (selectedProjectId !== 'all') params.set('projectId', selectedProjectId);

      const [ccRes, domRes, projRes] = await Promise.all([
        api(`/analytics/command-center?${params.toString()}`),
        api('/domains').catch(() => []),
        api('/projects?all=true').catch(() => [])
      ]);

      setData(ccRes);
      setDomainList(domRes || []);
      setProjectList(projRes || []);
    } catch (err) {
      console.error('Failed to load command center:', err);
      setToast(err.message || 'Failed to update telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [preset, customStart, customEnd, selectedDomainId, selectedSubdomain, selectedProjectId]);

  useEffect(() => {
    loadCommandCenter();
  }, [loadCommandCenter]);

  // Reset Filters
  const handleResetFilters = () => {
    setPreset('monthly');
    setCustomStart('');
    setCustomEnd('');
    setSelectedDomainId('all');
    setSelectedSubdomain('all');
    setSelectedProjectId('all');
  };

  // Subdomain options for selected domain
  const availableSubdomains = useMemo(() => {
    if (selectedDomainId === 'all') return [];
    const dom = domainList.find(d => String(d._id) === selectedDomainId);
    return dom?.fields || dom?.subdomains || [];
  }, [selectedDomainId, domainList]);

  const summary = data?.summary || {
    totalLoggedHours: 0,
    totalLoggedMinutes: 0,
    workSessionCount: 0,
    deliverablesCompleted: 0,
    activeProjectsCount: 0,
    completedProjectsCount: 0,
    totalProjectsCount: 0,
    activeGoalsCount: 0,
    completedGoalsCount: 0,
    totalGoalsCount: 0,
    completedMilestonesPeriodCount: 0,
    totalCompletedMilestonesCount: 0,
    totalMilestonesCount: 0,
    overallRoadmapProgress: 0,
    skillsPracticedCount: 0,
    skillsWithEvidenceCount: 0,
    totalSkillsCount: 0,
    certificatesEarnedCount: 0,
    totalCertificatesCount: 0,
    deltas: { hasComparison: false, hoursPercent: null, sessionsPercent: null }
  };

  const timeSeries = data?.timeSeries || [];
  const domainsData = data?.domains || [];
  const goalsData = data?.goals || { statusCounts: {}, activeGoals: [] };
  const milestonesData = data?.milestones || { statusCounts: {}, upcomingDeadlines: [], overdueMilestones: [], blockedMilestones: [] };
  const skillsData = data?.skills || { topPracticed: [], levels: {} };
  const roadmapsData = data?.roadmaps || { activeCount: 0, completedCount: 0, totalSteps: 0, completedSteps: 0, availableSteps: 0, blockedSteps: 0, nextActions: [] };
  const projectsData = data?.projects || { statusDistribution: {}, recentDeliverables: [] };
  const workLogsData = data?.workLogs || { heatmap: [], categoryBreakdown: [], recentLogs: [] };
  const relationshipMap = data?.relationshipMap || { nodes: [], edges: [] };
  const activityFeed = data?.activityFeed || [];

  // Filtered nodes for Relationship Map
  const filteredGraphNodes = useMemo(() => {
    let nodes = relationshipMap.nodes || [];
    if (graphTypeFilter !== 'all') {
      nodes = nodes.filter(n => n.type === graphTypeFilter);
    }
    if (graphSearch.trim()) {
      const q = graphSearch.toLowerCase();
      nodes = nodes.filter(n => n.label.toLowerCase().includes(q) || (n.domain && n.domain.toLowerCase().includes(q)));
    }
    return nodes;
  }, [relationshipMap.nodes, graphTypeFilter, graphSearch]);

  return (
    <div className="space-y-6 select-none-text">
      {isViewer && <ReadOnlyNotice featureName="Overview & Analytics Telemetry" />}

      {/* ------------------------------------------------------------------- */}
      {/* 1. COMMAND CENTER HEADER & TELEMETRY SCOPE BANNER                    */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Sparkles size={13} /> Engineering Command Center
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted font-mono">
                <ShieldCheck size={13} className="text-emerald-600" /> Live Production Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight">
              Operational Overview & Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl leading-relaxed">
              Synthesizing real engineering work, roadmap execution, project delivery, and verifiable competency across all active domains.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => loadCommandCenter(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface-elevated text-ink hover:border-primary transition"
              title="Refresh telemetry"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-primary' : ''} />
              {refreshing ? 'Syncing…' : 'Refresh'}
            </button>

            <Link
              to="/projects"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-text hover:bg-primary-hover transition shadow-sm"
            >
              Public Portfolio <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Global Controls & Scope Bar */}
        <div className="mt-6 pt-5 border-t border-border/70 flex flex-wrap items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex items-center flex-wrap gap-1.5 bg-surface-elevated p-1 rounded-xl border border-border">
            {[
              { id: 'daily', label: 'Today' },
              { id: 'weekly', label: '7 Days' },
              { id: 'monthly', label: '30 Days' },
              { id: 'quarterly', label: '90 Days' },
              { id: 'yearly', label: '365 Days' },
              { id: 'all', label: 'All History' },
              { id: 'custom', label: 'Custom' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPreset(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  preset === tab.id
                    ? 'bg-primary text-primary-text shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Domain & Project Filters */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Domain Filter */}
            <div className="flex items-center gap-1.5 bg-surface-elevated px-2.5 py-1.5 rounded-lg border border-border text-xs">
              <Layers size={13} className="text-muted" />
              <select
                className="bg-transparent border-none text-ink font-semibold focus:outline-none cursor-pointer"
                value={selectedDomainId}
                onChange={e => {
                  setSelectedDomainId(e.target.value);
                  setSelectedSubdomain('all');
                }}
              >
                <option value="all">All Domains ({domainList.length})</option>
                {domainList.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subdomain Filter */}
            {selectedDomainId !== 'all' && availableSubdomains.length > 0 && (
              <div className="flex items-center gap-1.5 bg-surface-elevated px-2.5 py-1.5 rounded-lg border border-border text-xs">
                <GitBranch size={13} className="text-muted" />
                <select
                  className="bg-transparent border-none text-ink font-semibold focus:outline-none cursor-pointer"
                  value={selectedSubdomain}
                  onChange={e => setSelectedSubdomain(e.target.value)}
                >
                  <option value="all">All Subdomains</option>
                  {availableSubdomains.map((sub, idx) => (
                    <option key={sub.slug || idx} value={sub.slug || sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Project Filter */}
            <div className="flex items-center gap-1.5 bg-surface-elevated px-2.5 py-1.5 rounded-lg border border-border text-xs">
              <Code2 size={13} className="text-muted" />
              <select
                className="bg-transparent border-none text-ink font-semibold focus:outline-none cursor-pointer max-w-[160px] truncate"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
              >
                <option value="all">All Projects ({projectList.length})</option>
                {projectList.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(preset !== 'monthly' || selectedDomainId !== 'all' || selectedProjectId !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-muted hover:text-primary transition font-medium px-2 py-1"
                title="Reset all filters"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Picker Dropdown/Inputs */}
        {preset === 'custom' && (
          <div className="mt-3 p-3 bg-surface-elevated rounded-xl border border-primary/30 flex items-center gap-3 text-xs flex-wrap">
            <span className="font-semibold text-ink">Custom Date Boundaries:</span>
            <div className="flex items-center gap-2">
              <label className="text-muted text-[11px]">Start:</label>
              <input
                type="date"
                className="input-text text-xs py-1 px-2"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-muted text-[11px]">End:</label>
              <input
                type="date"
                className="input-text text-xs py-1 px-2"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
              />
            </div>
            <span className="text-[11px] text-muted italic ml-auto">
              Telemetry recalculates automatically on boundary changes.
            </span>
          </div>
        )}

        {/* Active Reporting Scope Pill */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted font-mono bg-surface-elevated/60 px-3 py-1.5 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-primary" />
            <span>Scope: {data?.dateRange?.label || 'Past 30 Days'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Domain: {selectedDomainId === 'all' ? 'Universal' : domainList.find(d => String(d._id) === selectedDomainId)?.name}</span>
            <span>·</span>
            <span>Total Units: {summary.workSessionCount} sessions</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. EXECUTIVE SUMMARY METRIC TILES (9 STRATEGIC KPIS)                 */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* KPI 1: Logged Time */}
        <div
          onClick={() => navigate('/admin/work-logs')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Logged Hours</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <Clock size={16} />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-ink">
                {loading ? '—' : `${summary.totalLoggedHours}h`}
              </span>
              {summary.deltas?.hasComparison && summary.deltas.hoursPercent !== null && (
                <span className={`text-[11px] font-bold font-mono flex items-center ${summary.deltas.hoursPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {summary.deltas.hoursPercent >= 0 ? '+' : ''}{summary.deltas.hoursPercent}%
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted mt-0.5 block truncate">
              {summary.totalLoggedMinutes} minutes logged in scope
            </span>
          </div>
        </div>

        {/* KPI 2: Work Sessions */}
        <div
          onClick={() => navigate('/admin/work-logs')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Work Activities</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <Flame size={16} />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-ink">
                {loading ? '—' : summary.workSessionCount}
              </span>
              {summary.deltas?.hasComparison && summary.deltas.sessionsPercent !== null && (
                <span className={`text-[11px] font-bold font-mono flex items-center ${summary.deltas.sessionsPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {summary.deltas.sessionsPercent >= 0 ? '+' : ''}{summary.deltas.sessionsPercent}%
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted mt-0.5 block truncate">
              Recorded engineering sessions
            </span>
          </div>
        </div>

        {/* KPI 3: Verified Deliverables */}
        <div
          onClick={() => navigate('/admin/work-logs')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Deliverables</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <CheckSquare size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-ink">
              {loading ? '—' : summary.deliverablesCompleted}
            </span>
            <span className="text-[11px] text-muted mt-0.5 block truncate">
              Verified code & benchmarks
            </span>
          </div>
        </div>

        {/* KPI 4: Active Projects */}
        <div
          onClick={() => navigate('/admin/projects')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Active Projects</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <Code2 size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-ink">
              {loading ? '—' : `${summary.activeProjectsCount} / ${summary.totalProjectsCount}`}
            </span>
            <span className="text-[11px] text-muted mt-0.5 block truncate">
              {summary.completedProjectsCount} completed to date
            </span>
          </div>
        </div>

        {/* KPI 5: Active Goals */}
        <div
          onClick={() => navigate('/admin/goals')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Active Goals</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <Target size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-ink">
              {loading ? '—' : `${summary.activeGoalsCount} / ${summary.totalGoalsCount}`}
            </span>
            <span className="text-[11px] text-muted mt-0.5 block truncate">
              {summary.completedGoalsCount} achieved milestones
            </span>
          </div>
        </div>

        {/* KPI 6: Milestones Achieved */}
        <div
          onClick={() => navigate('/admin/milestones')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Milestones</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <Trophy size={16} />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-ink">
                {loading ? '—' : summary.completedMilestonesPeriodCount}
              </span>
              <span className="text-xs text-muted font-mono">
                ({summary.totalCompletedMilestonesCount} total)
              </span>
            </div>
            <span className="text-[11px] text-muted mt-0.5 block truncate">
              Completed in active scope
            </span>
          </div>
        </div>

        {/* KPI 7: Roadmap Progress */}
        <div
          onClick={() => navigate('/admin/roadmaps')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Roadmaps</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <Workflow size={16} />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-ink">
                {loading ? '—' : `${summary.overallRoadmapProgress}%`}
              </span>
            </div>
            <div className="w-full bg-surface-elevated h-1.5 rounded-full mt-1.5 overflow-hidden border border-border/50">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${summary.overallRoadmapProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 8: Skills Practiced */}
        <div
          onClick={() => navigate('/admin/skills')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Skills Practiced</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <Sparkles size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-ink">
              {loading ? '—' : summary.skillsPracticedCount}
            </span>
            <span className="text-[11px] text-muted mt-0.5 block truncate">
              {summary.skillsWithEvidenceCount} verified with proof
            </span>
          </div>
        </div>

        {/* KPI 9: Certifications */}
        <div
          onClick={() => navigate('/admin/certificates')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Certifications</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <GraduationCap size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-ink">
              {loading ? '—' : `${summary.certificatesEarnedCount} / ${summary.totalCertificatesCount}`}
            </span>
            <span className="text-[11px] text-muted mt-0.5 block truncate">
              Earned licenses & badges
            </span>
          </div>
        </div>

        {/* KPI 10: Knowledge Notes */}
        <div
          onClick={() => navigate('/admin/notes')}
          className="bg-surface border border-border hover:border-primary rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Knowledge Base</span>
            <span className="p-1.5 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-muted group-hover:text-primary transition">
              <BookOpen size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-ink">
              {loading ? '—' : data?.counts?.notes || 0}
            </span>
            <span className="text-[11px] text-muted mt-0.5 block truncate">
              Architectural PKM docs
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. PERSPECTIVES / SECTION NAVIGATION TABS                           */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-1">
        {[
          { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
          { id: 'trends', label: 'Activity & Progress Trends', icon: TrendingUp },
          { id: 'domains', label: 'Domain Intelligence', icon: Layers },
          { id: 'execution', label: 'Execution Matrix (Goals & Wins)', icon: Target },
          { id: 'competency', label: 'Competency & Roadmaps', icon: Sparkles },
          { id: 'heatmap', label: 'Annual Activity Heatmap', icon: Flame },
          { id: 'relationships', label: 'Engineering Relationship Map', icon: Network },
          { id: 'activity', label: 'Live Activity Stream', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg shrink-0 transition ${
                isActive
                  ? 'bg-primary text-primary-text font-bold shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. TAB CONTENT: COMMAND DASHBOARD (COMPREHENSIVE EXECUTIVE VIEW)     */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Row 1: Time Series Trend & Domain Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Activity Time Series Chart */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" /> Engineering Work Telemetry
                  </h2>
                  <p className="text-xs text-muted">
                    Activity volume across {data?.dateRange?.label || 'selected reporting period'}.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-elevated p-1 rounded-lg border border-border text-xs">
                  <button
                    type="button"
                    onClick={() => setTimeSeriesMetric('hours')}
                    className={`px-2.5 py-1 rounded font-semibold transition ${timeSeriesMetric === 'hours' ? 'bg-primary text-primary-text' : 'text-muted hover:text-ink'}`}
                  >
                    Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeSeriesMetric('sessions')}
                    className={`px-2.5 py-1 rounded font-semibold transition ${timeSeriesMetric === 'sessions' ? 'bg-primary text-primary-text' : 'text-muted hover:text-ink'}`}
                  >
                    Sessions
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeSeriesMetric('deliverables')}
                    className={`px-2.5 py-1 rounded font-semibold transition ${timeSeriesMetric === 'deliverables' ? 'bg-primary text-primary-text' : 'text-muted hover:text-ink'}`}
                  >
                    Deliverables
                  </button>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="py-4">
                {timeSeries.length === 0 ? (
                  <EmptyState title="No activity recorded in this scope" description="Try selecting a broader date range or logging a work session." />
                ) : (
                  <TimeSeriesSvgChart data={timeSeries} metric={timeSeriesMetric} />
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted font-mono">
                <span>Aggregated from authoritative work logs</span>
                <Link to="/admin/work-logs" className="text-primary hover:underline flex items-center gap-1">
                  Inspect All Logs <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Right 1 Col: Domain Distribution Donut */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="pb-3 border-b border-border">
                <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                  <PieChart size={16} className="text-primary" /> Time by Engineering Domain
                </h2>
                <p className="text-xs text-muted">Invested hours allocation across domains.</p>
              </div>

              <div className="py-4 flex flex-col items-center justify-center">
                <DomainDonutChart domains={domainsData} totalHours={summary.totalLoggedHours} onSelectDomain={id => setSelectedDomainId(id)} />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
                <span>Primary domain allocation</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('domains')}
                  className="text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  Full Breakdown <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Urgent Deadlines, Blockers, & Next Learning Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Upcoming Milestone Deadlines */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-amber-600" />
                  <h3 className="text-sm font-bold text-ink">Upcoming Deadlines</h3>
                </div>
                <Link to="/admin/milestones" className="text-xs text-primary font-semibold hover:underline">
                  View all
                </Link>
              </div>

              {milestonesData.upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-muted italic py-4 text-center">No impending deadlines within scope.</p>
              ) : (
                <div className="space-y-2.5">
                  {milestonesData.upcomingDeadlines.map(m => (
                    <div
                      key={m.id}
                      onClick={() => navigate('/admin/milestones')}
                      className="p-2.5 rounded-lg bg-surface-elevated border border-border hover:border-primary transition cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <strong className="block text-ink font-semibold truncate">{m.title}</strong>
                        <span className="text-[11px] text-muted">{m.domain}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                          {m.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box 2: Overdue / Blocked Alerts */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <h3 className="text-sm font-bold text-ink">Execution Alerts</h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-600">
                  {milestonesData.overdueMilestones.length + milestonesData.blockedMilestones.length} items
                </span>
              </div>

              {milestonesData.overdueMilestones.length === 0 && milestonesData.blockedMilestones.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-1.5" />
                  <p className="text-xs text-ink font-semibold">Zero Critical Blockers</p>
                  <p className="text-[11px] text-muted">All active milestones and roadmap steps on schedule.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {milestonesData.overdueMilestones.map(m => (
                    <div key={`od-${m.id}`} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
                      <div className="min-w-0 flex-1 pr-2">
                        <strong className="block text-ink font-semibold truncate">{m.title}</strong>
                        <span className="text-[11px] text-rose-600 font-mono">Overdue since {m.dueDate}</span>
                      </div>
                      <Link to="/admin/milestones" className="text-xs font-bold text-rose-600 hover:underline shrink-0">
                        Resolve
                      </Link>
                    </div>
                  ))}

                  {milestonesData.blockedMilestones.map(m => (
                    <div key={`blk-${m.id}`} className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                      <div className="min-w-0 flex-1 pr-2">
                        <strong className="block text-ink font-semibold truncate">{m.title}</strong>
                        <span className="text-[11px] text-amber-600 font-mono">Blocked milestone</span>
                      </div>
                      <Link to="/admin/milestones" className="text-xs font-bold text-amber-600 hover:underline shrink-0">
                        Unblock
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box 3: Next Available Learning Actions */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-ink">Next Learning Actions</h3>
                </div>
                <Link to="/admin/roadmaps" className="text-xs text-primary font-semibold hover:underline">
                  Roadmaps
                </Link>
              </div>

              {roadmapsData.nextActions.length === 0 ? (
                <p className="text-xs text-muted italic py-4 text-center">No available uncompleted steps.</p>
              ) : (
                <div className="space-y-2">
                  {roadmapsData.nextActions.slice(0, 4).map(action => (
                    <div
                      key={action.stepId}
                      onClick={() => navigate('/admin/roadmaps')}
                      className="p-2.5 rounded-lg bg-surface-elevated border border-border hover:border-primary transition cursor-pointer flex items-start justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <strong className="block text-ink font-semibold truncate">{action.title}</strong>
                        <span className="text-[11px] text-muted block truncate">{action.roadmapTitle} · {action.domain}</span>
                      </div>
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded font-mono shrink-0">
                        {action.estimatedEffort}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Split Section: Top Practiced Skills & Recent Deliverables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Skills */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-ink">Top Practiced Competencies</h3>
                </div>
                <Link to="/admin/skills" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  Skill Matrix <ArrowRight size={13} />
                </Link>
              </div>

              {skillsData.topPracticed.length === 0 ? (
                <EmptyState title="No skills logged in this period" description="Link skills to work logs to track practice hours and evidence." />
              ) : (
                <div className="space-y-2.5">
                  {skillsData.topPracticed.slice(0, 6).map(skill => (
                    <div
                      key={skill.id}
                      onClick={() => navigate('/admin/skills')}
                      className="p-3 rounded-lg bg-surface-elevated border border-border hover:border-primary transition cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <strong className="text-ink font-semibold truncate">{skill.name}</strong>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-muted font-mono">
                            {skill.level}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted mt-0.5 block">{skill.domain}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-ink">{skill.hours}h</span>
                        {skill.evidenceCount > 0 && (
                          <span className="block text-[10px] text-emerald-600 font-bold">
                            ✓ {skill.evidenceCount} verified evidence
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Deliverables */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-ink">Recent Verified Deliverables</h3>
                </div>
                <Link to="/admin/projects" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  Projects <ArrowRight size={13} />
                </Link>
              </div>

              {projectsData.recentDeliverables.length === 0 ? (
                <EmptyState title="No deliverables recorded in this scope" description="Attach pull requests, test benchmarks, or repo links to milestones." />
              ) : (
                <div className="space-y-2.5">
                  {projectsData.recentDeliverables.slice(0, 6).map(deliv => (
                    <div
                      key={deliv.id}
                      className="p-3 rounded-lg bg-surface-elevated border border-border flex items-center justify-between text-xs gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <strong className="text-ink font-semibold block truncate">{deliv.title}</strong>
                        <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                          <span>{deliv.source}: {deliv.sourceTitle}</span>
                          <span>·</span>
                          <span className="font-mono">{deliv.date}</span>
                        </div>
                      </div>

                      {deliv.url ? (
                        <a
                          href={deliv.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface border border-border text-primary hover:border-primary text-xs font-semibold shrink-0"
                        >
                          View Artifact <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted font-mono uppercase bg-surface px-2 py-0.5 rounded border border-border shrink-0">
                          {deliv.type}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 5. TAB CONTENT: ACTIVITY TRENDS (TIME-SERIES DEEP DIVE)             */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" /> Chronological Engineering Trajectory
                </h2>
                <p className="text-xs text-muted">
                  Interactive multi-measure time-series analysis comparing hours, sessions, and milestone deliverables.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTimeSeriesMetric('hours')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${timeSeriesMetric === 'hours' ? 'bg-primary text-primary-text' : 'bg-surface-elevated border border-border text-muted hover:text-ink'}`}
                >
                  By Hours
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSeriesMetric('sessions')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${timeSeriesMetric === 'sessions' ? 'bg-primary text-primary-text' : 'bg-surface-elevated border border-border text-muted hover:text-ink'}`}
                >
                  By Sessions
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSeriesMetric('deliverables')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${timeSeriesMetric === 'deliverables' ? 'bg-primary text-primary-text' : 'bg-surface-elevated border border-border text-muted hover:text-ink'}`}
                >
                  By Deliverables
                </button>
              </div>
            </div>

            <div className="py-6">
              <TimeSeriesSvgChart data={timeSeries} metric={timeSeriesMetric} height={320} />
            </div>

            {/* Granular Bucket Table */}
            <div className="overflow-x-auto pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Time-Series Data Points</h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted font-mono">
                    <th className="py-2 font-medium">Period / Date</th>
                    <th className="py-2 font-medium">Logged Hours</th>
                    <th className="py-2 font-medium">Sessions</th>
                    <th className="py-2 font-medium">Deliverables</th>
                    <th className="py-2 font-medium">Milestones Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {timeSeries.slice(-14).reverse().map(b => (
                    <tr key={b.date} className="hover:bg-surface-elevated transition font-mono">
                      <td className="py-2 text-ink font-semibold">{b.label}</td>
                      <td className="py-2 text-primary font-bold">{b.hours}h ({b.minutes}m)</td>
                      <td className="py-2 text-ink">{b.sessions}</td>
                      <td className="py-2 text-ink">{b.deliverables}</td>
                      <td className="py-2 text-emerald-600 font-bold">{b.milestonesCompleted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 6. TAB CONTENT: DOMAIN INTELLIGENCE                                 */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2 pb-3 border-b border-border">
                <PieChart size={16} className="text-primary" /> Domain Distribution Donut
              </h2>
              <div className="py-6 flex items-center justify-center">
                <DomainDonutChart domains={domainsData} totalHours={summary.totalLoggedHours} onSelectDomain={id => setSelectedDomainId(id)} />
              </div>
              <p className="text-[11px] text-muted border-t border-border pt-3">
                Clicking a segment or label filters the entire Command Center to that specific architectural discipline.
              </p>
            </div>

            <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2 pb-3 border-b border-border">
                <Layers size={16} className="text-primary" /> Ranked Domain & Subdomain Investment
              </h2>

              <div className="space-y-4">
                {domainsData.map(d => (
                  <div key={d.domainId} className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.accentColor }} />
                        <strong className="text-sm font-bold text-ink">{d.domainName}</strong>
                        <span className="text-[11px] text-muted font-mono">({d.percentage}%)</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="font-bold text-ink">{d.hours}h</span>
                        <span className="text-muted">·</span>
                        <span className="text-muted">{d.sessionCount} sessions</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${d.percentage}%`, backgroundColor: d.accentColor }}
                      />
                    </div>

                    {/* Subdomains tags */}
                    {d.subdomains && d.subdomains.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {d.subdomains.map(sub => (
                          <span
                            key={sub.name}
                            className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-muted font-mono"
                          >
                            {sub.name}: {sub.hours}h
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 7. TAB CONTENT: EXECUTION MATRIX (GOALS & MILESTONES)               */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'execution' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goals Overview */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-primary" />
                  <h2 className="text-sm font-bold text-ink">Goals Strategic Execution</h2>
                </div>
                <Link to="/admin/goals" className="text-xs text-primary font-semibold hover:underline">
                  Manage Goals
                </Link>
              </div>

              {/* Status Ring / Badges */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-lg font-bold font-mono text-emerald-600 block">{goalsData.statusCounts?.Active || 0}</span>
                  <span className="text-[10px] text-muted uppercase">Active</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-lg font-bold font-mono text-primary block">{goalsData.statusCounts?.InProgress || 0}</span>
                  <span className="text-[10px] text-muted uppercase">In Progress</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-lg font-bold font-mono text-indigo-600 block">{goalsData.statusCounts?.Achieved || 0}</span>
                  <span className="text-[10px] text-muted uppercase">Achieved</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-lg font-bold font-mono text-muted block">{goalsData.statusCounts?.OnHold || 0}</span>
                  <span className="text-[10px] text-muted uppercase">On Hold</span>
                </div>
              </div>

              {/* Active Goals List */}
              <div className="space-y-2 pt-2">
                {goalsData.activeGoals.map(g => (
                  <div
                    key={g.id}
                    onClick={() => navigate('/admin/goals')}
                    className="p-3 rounded-lg bg-surface-elevated border border-border hover:border-primary transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <strong className="text-ink font-semibold block truncate">{g.title}</strong>
                      <span className="text-[11px] text-muted">{g.domain} · Priority: {g.priority}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary shrink-0">{g.progress}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones Overview */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-primary" />
                  <h2 className="text-sm font-bold text-ink">Milestones & Wins Status</h2>
                </div>
                <Link to="/admin/milestones" className="text-xs text-primary font-semibold hover:underline">
                  Manage Milestones
                </Link>
              </div>

              {/* Status Ring / Badges */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-lg font-bold font-mono text-amber-600 block">{milestonesData.statusCounts?.planned || 0}</span>
                  <span className="text-[10px] text-muted uppercase">Planned</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-lg font-bold font-mono text-primary block">{milestonesData.statusCounts?.in_progress || 0}</span>
                  <span className="text-[10px] text-muted uppercase">In Progress</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-lg font-bold font-mono text-emerald-600 block">{milestonesData.statusCounts?.completed || 0}</span>
                  <span className="text-[10px] text-muted uppercase">Completed</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-lg font-bold font-mono text-rose-600 block">{milestonesData.statusCounts?.blocked || 0}</span>
                  <span className="text-[10px] text-muted uppercase">Blocked</span>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Upcoming Milestone Target Dates</h3>
                {milestonesData.upcomingDeadlines.slice(0, 5).map(m => (
                  <div
                    key={m.id}
                    onClick={() => navigate('/admin/milestones')}
                    className="p-3 rounded-lg bg-surface-elevated border border-border hover:border-primary transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <strong className="text-ink font-semibold block truncate">{m.title}</strong>
                      <span className="text-[11px] text-muted">{m.domain}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded shrink-0">
                      Due: {m.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 8. TAB CONTENT: ANNUAL 365-DAY ACTIVITY HEATMAP                     */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <Flame size={18} className="text-primary" /> 365-Day Engineering Contribution Heatmap
                </h2>
                <p className="text-xs text-muted">
                  Year-round software engineering focus inspired by high-output version control matrices.
                </p>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="inline-grid grid-flow-col grid-rows-7 gap-1 min-w-[720px]">
                {workLogsData.heatmap.map(day => {
                  const colors = [
                    'bg-surface-elevated border border-border/50 hover:border-primary',
                    'bg-emerald-900/40 border border-emerald-700/40',
                    'bg-emerald-700/60 border border-emerald-500/60',
                    'bg-emerald-500 border border-emerald-400',
                    'bg-emerald-400 border border-emerald-300'
                  ];
                  return (
                    <div
                      key={day.date}
                      className={`w-3.5 h-3.5 rounded-xs transition cursor-pointer ${colors[day.intensity] || colors[0]}`}
                      title={`${day.date}: ${day.hours} hrs (${day.count} sessions)`}
                      onClick={() => setSelectedHeatmapDay(day)}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-1.5 text-xs text-muted mt-3 font-mono">
                <span>Less</span>
                <span className="w-3 h-3 rounded-xs bg-surface-elevated border border-border/50" />
                <span className="w-3 h-3 rounded-xs bg-emerald-900/40 border border-emerald-700/40" />
                <span className="w-3 h-3 rounded-xs bg-emerald-700/60 border border-emerald-500/60" />
                <span className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-400" />
                <span className="w-3 h-3 rounded-xs bg-emerald-400 border border-emerald-300" />
                <span>More Activity</span>
              </div>
            </div>

            {/* Selected Day Drill-down modal/drawer */}
            {selectedHeatmapDay && (
              <div className="mt-4 p-4 rounded-xl bg-surface-elevated border border-primary/40 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-ink font-bold block">Selected Date: {selectedHeatmapDay.date}</strong>
                  <span className="text-muted text-[11px]">
                    Invested {selectedHeatmapDay.hours} hours across {selectedHeatmapDay.count} recorded sessions.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreset('custom');
                      setCustomStart(selectedHeatmapDay.date);
                      setCustomEnd(selectedHeatmapDay.date);
                      setSelectedHeatmapDay(null);
                    }}
                    className="button-primary text-xs py-1 px-3"
                  >
                    Filter Scope To This Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHeatmapDay(null)}
                    className="button-secondary text-xs py-1 px-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Activity Category Breakdown */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 pb-2 border-b border-border">
              <Activity size={16} className="text-primary" /> Work Log Activity Categories
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {workLogsData.categoryBreakdown.map(cat => (
                <div key={cat.name} className="p-3.5 rounded-xl bg-surface-elevated border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-ink font-semibold text-xs">{cat.name}</strong>
                    <span className="text-[11px] font-mono text-muted">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border/50">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${cat.percentage}%` }} />
                  </div>
                  <span className="text-[11px] text-muted block font-mono">
                    {cat.hours}h · {cat.count} sessions
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 9. TAB CONTENT: ENGINEERING RELATIONSHIP MAP (GRAPH VIEW)           */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'relationships' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <Network size={18} className="text-primary" /> Engineering Relationship Map
                </h2>
                <p className="text-xs text-muted">
                  Interactive multi-entity knowledge network linking Domains, Projects, Skills, Roadmaps, Goals, and Milestones.
                </p>
              </div>

              {/* Graph Toolbar */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 bg-surface-elevated px-2.5 py-1 rounded-lg border border-border text-xs">
                  <Search size={13} className="text-muted" />
                  <input
                    type="text"
                    placeholder="Search node..."
                    className="bg-transparent border-none text-ink focus:outline-none w-28 text-xs"
                    value={graphSearch}
                    onChange={e => setGraphSearch(e.target.value)}
                  />
                  {graphSearch && (
                    <button type="button" onClick={() => setGraphSearch('')} className="text-muted hover:text-ink">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <select
                  className="bg-surface-elevated border border-border text-xs font-semibold rounded-lg px-2 py-1 text-ink focus:outline-none"
                  value={graphTypeFilter}
                  onChange={e => setGraphTypeFilter(e.target.value)}
                >
                  <option value="all">All Entity Types</option>
                  <option value="domain">Domains</option>
                  <option value="project">Projects</option>
                  <option value="skill">Skills</option>
                  <option value="roadmap">Roadmaps</option>
                  <option value="goal">Goals</option>
                  <option value="milestone">Milestones</option>
                </select>
              </div>
            </div>

            {/* Interactive Graph Canvas */}
            <div className="relative w-full h-[540px] bg-surface-elevated rounded-xl border border-border overflow-hidden flex items-center justify-center">
              <RelationshipGraphSvg
                nodes={filteredGraphNodes}
                edges={relationshipMap.edges}
                onSelectNode={node => setInspectNode(node)}
              />
            </div>

            {/* Graph Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs text-muted pt-2 border-t border-border font-mono">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" /> Domain
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" /> Project
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Skill
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500" /> Roadmap
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" /> Goal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-700" /> Milestone
                </span>
              </div>
              <span>Click any node to inspect connected dependencies</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 10. TAB CONTENT: LIVE ACTIVITY STREAM                               */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'activity' && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Activity size={18} className="text-primary" /> Real-Time Cross-Module Activity Feed
            </h2>
            <p className="text-xs text-muted">
              Chronological event stream synthesizing work sessions, completed milestones, published repositories, and roadmap victories.
            </p>
          </div>

          {activityFeed.length === 0 ? (
            <EmptyState title="No recent activity recorded" description="Logged events and milestone achievements will appear here." />
          ) : (
            <div className="divide-y divide-border">
              {activityFeed.map(evt => (
                <div
                  key={evt.id}
                  onClick={() => evt.link && navigate(evt.link)}
                  className="py-3.5 flex items-start justify-between gap-4 hover:bg-surface-elevated px-2 rounded-lg transition cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="p-2 rounded-lg bg-surface-elevated group-hover:bg-primary/10 text-primary border border-border shrink-0 mt-0.5">
                      {evt.type === 'milestone' ? <Trophy size={15} /> : evt.type === 'project' ? <Code2 size={15} /> : <Clock size={15} />}
                    </span>
                    <div className="min-w-0">
                      <strong className="text-ink font-semibold text-xs group-hover:text-primary transition block truncate">
                        {evt.title}
                      </strong>
                      <span className="text-[11px] text-muted block mt-0.5">{evt.subtitle}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-muted">{evt.date}</span>
                    <span className="text-[10px] text-primary group-hover:underline block mt-0.5 flex items-center gap-0.5 justify-end">
                      Inspect <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 11. NODE INSPECTOR MODAL (FOR RELATIONSHIP MAP)                      */}
      {/* ------------------------------------------------------------------- */}
      {inspectNode && (
        <Modal
          title={`Entity Inspector: ${inspectNode.label}`}
          onClose={() => setInspectNode(null)}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-surface-elevated border border-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                  {inspectNode.type}
                </span>
                <span className="text-xs font-semibold text-muted">{inspectNode.domain}</span>
              </div>
              <h3 className="text-base font-bold text-ink mt-2">{inspectNode.label}</h3>
              {inspectNode.status && (
                <span className="text-xs text-muted block mt-1">Status: {inspectNode.status}</span>
              )}
              {inspectNode.progress !== null && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-muted">Progress</span>
                    <span className="text-primary font-bold">{inspectNode.progress}%</span>
                  </div>
                  <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${inspectNode.progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                className="button-secondary text-xs"
                onClick={() => setInspectNode(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="button-primary text-xs"
                onClick={() => {
                  const t = inspectNode.type;
                  setInspectNode(null);
                  if (t === 'project') navigate('/admin/projects');
                  else if (t === 'skill') navigate('/admin/skills');
                  else if (t === 'roadmap') navigate('/admin/roadmaps');
                  else if (t === 'goal') navigate('/admin/goals');
                  else if (t === 'milestone') navigate('/admin/milestones');
                  else if (t === 'domain') navigate('/admin/domains');
                }}
              >
                Open in {inspectNode.type.toUpperCase()} Module
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: TIME-SERIES SVG CHART
// ---------------------------------------------------------------------------
function TimeSeriesSvgChart({ data = [], metric = 'hours', height = 220 }) {
  const svgRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const values = data.map(d => Number(d[metric]) || 0);
  const maxVal = Math.max(...values, metric === 'hours' ? 4 : 2);

  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;
  const width = 640;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;
  const barWidth = Math.max(6, Math.min(28, (chartW / Math.max(data.length, 1)) * 0.65));

  return (
    <div className="w-full overflow-x-auto select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible font-mono"
      >
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
          const y = paddingTop + chartH * (1 - frac);
          const gridVal = Math.round(maxVal * frac * 10) / 10;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={paddingLeft - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="var(--text-muted)"
              >
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const val = Number(item[metric]) || 0;
          const barH = (val / maxVal) * chartH;
          const x = paddingLeft + (chartW / data.length) * idx + ((chartW / data.length) - barWidth) / 2;
          const y = paddingTop + chartH - barH;
          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={item.date}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 2)}
                rx="3"
                fill={isHovered ? 'var(--primary)' : 'var(--chart-1, #e07a5f)'}
                opacity={isHovered ? 1 : 0.85}
                className="transition-all duration-200"
              />

              {/* Label every few bars if dense */}
              {(data.length <= 14 || idx % Math.ceil(data.length / 10) === 0) && (
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="var(--text-muted)"
                >
                  {item.label?.slice(5) || item.date?.slice(5)}
                </text>
              )}
            </g>
          );
        })}

        {/* Hover Tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <g>
            <rect
              x={Math.min(width - 120, Math.max(paddingLeft, paddingLeft + (chartW / data.length) * hoveredIndex - 40))}
              y={paddingTop - 15}
              width="100"
              height="26"
              rx="4"
              fill="var(--secondary, #3d405b)"
              className="shadow-md"
            />
            <text
              x={Math.min(width - 70, Math.max(paddingLeft + 50, paddingLeft + (chartW / data.length) * hoveredIndex + 10))}
              y={paddingTop + 2}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#ffffff"
            >
              {data[hoveredIndex].date}: {data[hoveredIndex][metric]} {metric}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: DOMAIN DONUT CHART
// ---------------------------------------------------------------------------
function DomainDonutChart({ domains = [], totalHours = 0, onSelectDomain }) {
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const validDomains = domains.filter(d => d.hours > 0);
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="none"
            opacity="0.3"
          />

          {validDomains.map(d => {
            const pct = d.percentage / 100;
            const strokeDashoffset = circumference - pct * circumference;
            const rotationOffset = accumulatedPercent * 360;
            accumulatedPercent += pct;

            return (
              <circle
                key={d.domainId}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={d.accentColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                fill="none"
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${rotationOffset}deg)`
                }}
                className="transition-all duration-700 ease-out cursor-pointer hover:opacity-85"
                onClick={() => onSelectDomain && onSelectDomain(d.domainId)}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono pointer-events-none">
          <span className="text-xl font-bold text-ink">{totalHours}h</span>
          <span className="text-[10px] text-muted uppercase tracking-wider">Invested</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs">
        {domains.slice(0, 5).map(d => (
          <button
            key={d.domainId}
            type="button"
            onClick={() => onSelectDomain && onSelectDomain(d.domainId)}
            className="flex items-center gap-1.5 hover:text-primary transition"
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.accentColor }} />
            <span className="text-ink font-semibold">{d.domainName}:</span>
            <span className="text-muted font-mono">{d.percentage}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: RELATIONSHIP GRAPH SVG
// ---------------------------------------------------------------------------
function RelationshipGraphSvg({ nodes = [], edges = [], onSelectNode }) {
  const width = 800;
  const height = 520;

  // Layout node positions in deterministic cluster orbits
  const positionedNodes = useMemo(() => {
    const center = { x: width / 2, y: height / 2 };
    const typeRadius = {
      domain: 75,
      goal: 145,
      roadmap: 155,
      project: 195,
      milestone: 220,
      skill: 240
    };

    const typeGroups = {};
    for (const n of nodes) {
      if (!typeGroups[n.type]) typeGroups[n.type] = [];
      typeGroups[n.type].push(n);
    }

    const posMap = new Map();
    for (const [type, group] of Object.entries(typeGroups)) {
      const r = typeRadius[type] || 180;
      const step = (2 * Math.PI) / Math.max(group.length, 1);
      group.forEach((node, i) => {
        const theta = i * step;
        posMap.set(node.id, {
          ...node,
          x: Math.round(center.x + r * Math.cos(theta)),
          y: Math.round(center.y + r * Math.sin(theta))
        });
      });
    }

    return Array.from(posMap.values());
  }, [nodes]);

  const posMap = useMemo(() => {
    const m = new Map();
    for (const n of positionedNodes) m.set(n.id, n);
    return m;
  }, [positionedNodes]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none font-mono">
      {/* Background grid */}
      <defs>
        <pattern id="graphGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="var(--border)" opacity="0.4" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#graphGrid)" />

      {/* Edges */}
      {edges.map((e, idx) => {
        const s = posMap.get(e.source);
        const t = posMap.get(e.target);
        if (!s || !t) return null;
        return (
          <line
            key={`${e.source}-${e.target}-${idx}`}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke="var(--border)"
            strokeWidth="1.2"
            strokeDasharray={e.relationship === 'delivers' ? '3 3' : 'none'}
            opacity="0.6"
          />
        );
      })}

      {/* Nodes */}
      {positionedNodes.map(n => {
        const typeColors = {
          domain: '#f59e0b',
          project: '#3b82f6',
          skill: '#10b981',
          roadmap: '#a855f7',
          goal: '#f43f5e',
          milestone: '#b45309'
        };
        const color = typeColors[n.type] || '#6b7280';

        return (
          <g
            key={n.id}
            className="cursor-pointer transition-transform hover:scale-110"
            onClick={() => onSelectNode(n)}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r={n.type === 'domain' ? 16 : 11}
              fill={color}
              stroke="var(--surface)"
              strokeWidth="2.5"
              className="shadow-sm"
            />
            <text
              x={n.x}
              y={n.y + (n.type === 'domain' ? 24 : 19)}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill="var(--text)"
              className="pointer-events-none drop-shadow-xs"
            >
              {n.label.length > 14 ? `${n.label.slice(0, 13)}…` : n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
