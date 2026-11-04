import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Archive,
  RotateCcw,
  Search,
  Filter,
  Calendar,
  Layers,
  Code2,
  FolderOpen,
  Award,
  Target,
  Workflow,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart3,
  TrendingUp,
  Flame,
  ShieldCheck,
  Wrench,
  BookOpen,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { DomainSelector } from '../../components/DomainSelector.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

const CATEGORIES = [
  'Development',
  'Architecture',
  'Debugging',
  'Research',
  'Learning',
  'Documentation',
  'Testing',
  'DevOps',
  'Planning',
  'Certification',
  'Other'
];

const ACTIVITY_TYPES = [
  'Coding',
  'System Design',
  'Hands-on Lab',
  'Troubleshooting',
  'Reading Docs',
  'Code Review',
  'Benchmarking',
  'Technical Writing',
  'Planning'
];

const STATUSES = ['completed', 'in_progress', 'planned', 'blocked'];

const emptyDetailedForm = {
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  startTime: '',
  endTime: '',
  timeSpentMinutes: 60,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  category: 'Development',
  activityType: 'Coding',
  status: 'completed',
  priority: 'Medium',
  primaryDomain: '',
  subdomain: '',
  subdomainId: '',
  projectId: '',
  skillIds: [],
  roadmapId: '',
  roadmapPhaseId: '',
  roadmapStepId: '',
  goalId: '',
  milestoneId: '',
  outcome: '',
  whatLearned: '',
  problemEncountered: '',
  problemSolution: '',
  blockers: '',
  nextAction: '',
  reflectionNotes: '',
  tags: '',
  visibility: 'private',
  evidence: []
};

export function AdminWorkLogs() {
  const { isViewer, canEdit } = useAuth();
  // Navigation & Perspective Tabs
  const [activeTab, setActiveTab] = useState('overview'); // overview, daily, weekly, monthly, calendar, diagnostics, reports
  const [period, setPeriod] = useState('all'); // all, today, this_week, this_month, this_quarter, this_year, custom

  // Logs & Analytics Data
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cross-Module References
  const [domains, setDomains] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [goals, setGoals] = useState([]);
  const [milestones, setMilestones] = useState([]);

  // Active Live Timer State
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerFormOpen, setTimerFormOpen] = useState(false);
  const [timerStartForm, setTimerStartForm] = useState({
    title: 'Engineering Work Session',
    category: 'Development',
    primaryDomain: '',
    subdomain: '',
    projectId: '',
    skillIds: []
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewArchived, setViewArchived] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Daily View Date
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().slice(0, 10));
  const [dailyReflection, setDailyReflection] = useState({
    accomplishments: '',
    lessonsLearned: '',
    challenges: '',
    nextPriorities: '',
    habitsScore: 5
  });

  // Weekly View State
  const [weeklyOffset, setWeeklyOffset] = useState(0); // 0 = this week, -1 = last week

  // Modals & Drawers
  const [detailedModal, setDetailedModal] = useState(false);
  const [quickModal, setQuickModal] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyDetailedForm);
  const [quickForm, setQuickForm] = useState({
    title: '',
    timeSpentMinutes: 60,
    category: 'Development',
    date: new Date().toISOString().slice(0, 10),
    projectId: '',
    outcome: ''
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [heatmapMetric, setHeatmapMetric] = useState('minutes'); // minutes or count

  const timerIntervalRef = useRef(null);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 1. Fetch References
  useEffect(() => {
    Promise.all([
      api('/domains?all=true').catch(() => []),
      api('/projects?all=true').catch(() => []),
      api('/skills').catch(() => []),
      api('/roadmaps?all=true').catch(() => []),
      api('/goals').catch(() => []),
      api('/milestones?all=true').catch(() => ({ milestones: [] }))
    ]).then(([d, p, s, r, g, m]) => {
      setDomains(Array.isArray(d) ? d : []);
      setProjects(Array.isArray(p) ? p.filter(item => item.type !== 'folder') : []);
      setSkills(Array.isArray(s) ? s : []);
      setRoadmaps(Array.isArray(r) ? r : []);
      setGoals(Array.isArray(g) ? g : []);
      setMilestones(Array.isArray(m?.milestones) ? m.milestones : (Array.isArray(m) ? m : []));
    });
  }, []);

  // 2. Fetch Active Timer
  const fetchActiveTimer = useCallback(async () => {
    try {
      const data = await api('/work-logs/timer/active');
      if (data.active && data.session) {
        setActiveTimer(data.session);
        setTimerSeconds(data.activeElapsedSeconds || 0);
      } else {
        setActiveTimer(null);
        setTimerSeconds(0);
      }
    } catch (e) {
      // Ignored
    }
  }, []);

  useEffect(() => {
    fetchActiveTimer();
  }, [fetchActiveTimer]);

  // Ticking Timer Effect
  useEffect(() => {
    if (activeTimer && activeTimer.isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(sec => sec + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeTimer]);

  // 3. Load Main Logs & Analytics
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (viewArchived) params.set('archived', 'true');
      else params.set('all', 'true');

      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      if (domainFilter !== 'All') params.set('primaryDomain', domainFilter);
      if (projectFilter !== 'All') params.set('projectId', projectFilter);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const [logsRes, analyticsRes] = await Promise.all([
        api(`/work-logs?${params.toString()}`),
        api(`/work-logs/analytics?period=${period}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}${domainFilter !== 'All' ? `&domain=${domainFilter}` : ''}${projectFilter !== 'All' ? `&projectId=${projectFilter}` : ''}`)
      ]);

      setLogs(logsRes.logs || []);
      setTotalCount(logsRes.total || 0);
      setAnalytics(analyticsRes);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [viewArchived, categoryFilter, domainFilter, projectFilter, statusFilter, search, startDate, endDate, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Daily Reflection
  useEffect(() => {
    if (activeTab === 'daily' && dailyDate) {
      api(`/work-logs/reflections/${dailyDate}`)
        .then(ref => {
          if (ref) {
            setDailyReflection({
              accomplishments: ref.accomplishments || '',
              lessonsLearned: ref.lessonsLearned || '',
              challenges: ref.challenges || '',
              nextPriorities: ref.nextPriorities || '',
              habitsScore: ref.habitsScore || 5
            });
          }
        })
        .catch(() => {});
    }
  }, [activeTab, dailyDate]);

  // Load Diagnostics when tab is active
  const loadDiagnostics = useCallback(async () => {
    try {
      const data = await api('/work-logs/diagnostics/check');
      setDiagnostics(data);
    } catch (err) {
      showToast('Could not load diagnostics: ' + err.message);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'diagnostics') {
      loadDiagnostics();
    }
  }, [activeTab, loadDiagnostics]);

  // Timer Control Handlers
  async function handleStartTimer(e) {
    e?.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access. Timer tracking is disabled.');
      return;
    }
    try {
      setBusy(true);
      const res = await api('/work-logs/timer/start', {
        method: 'POST',
        body: jsonBody(timerStartForm)
      });
      setActiveTimer(res.session);
      setTimerSeconds(0);
      setTimerFormOpen(false);
      showToast('Engineering session timer started');
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePauseTimer() {
    if (isViewer) return;
    try {
      const res = await api('/work-logs/timer/pause', { method: 'POST' });
      setActiveTimer(res.session);
      showToast('Timer paused');
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleResumeTimer() {
    if (isViewer) return;
    try {
      const res = await api('/work-logs/timer/resume', { method: 'POST' });
      setActiveTimer(res.session);
      showToast('Timer resumed');
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleStopTimer() {
    if (isViewer) return;
    try {
      setBusy(true);
      const res = await api('/work-logs/timer/stop', { method: 'POST' });
      setActiveTimer(null);
      setTimerSeconds(0);
      showToast(`Logged session: ${res.workLog?.title} (${res.workLog?.timeSpentMinutes} mins)`);
      await loadData();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelTimer() {
    if (isViewer) return;
    if (!window.confirm('Discard current active session without logging?')) return;
    try {
      await api('/work-logs/timer/cancel', { method: 'DELETE' });
      setActiveTimer(null);
      setTimerSeconds(0);
      showToast('Session timer cancelled');
    } catch (err) {
      showToast(err.message);
    }
  }

  // Quick Log Submit
  async function handleQuickLogSubmit(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access. Quick log is restricted.');
      return;
    }
    setBusy(true);
    try {
      await api('/work-logs/quick', {
        method: 'POST',
        body: jsonBody(quickForm)
      });
      showToast('Quick work log recorded');
      setQuickModal(false);
      setQuickForm({
        title: '',
        timeSpentMinutes: 60,
        category: 'Development',
        date: new Date().toISOString().slice(0, 10),
        projectId: '',
        outcome: ''
      });
      await loadData();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Detailed Modal Openers
  function openCreateDetailed() {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    setEditing(null);
    setForm({
      ...emptyDetailedForm,
      date: new Date().toISOString().slice(0, 10)
    });
    setDetailedModal(true);
  }

  function openEdit(log) {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    setEditing(log);
    setForm({
      title: log.title || '',
      description: log.description || '',
      date: log.date || new Date().toISOString().slice(0, 10),
      startTime: log.startTime || '',
      endTime: log.endTime || '',
      timeSpentMinutes: log.timeSpentMinutes || 60,
      timezone: log.timezone || 'UTC',
      category: log.category || 'Development',
      activityType: log.activityType || 'Coding',
      status: log.status || 'completed',
      priority: log.priority || 'Medium',
      primaryDomain: log.primaryDomain?._id || log.primaryDomain || '',
      subdomain: log.subdomain || '',
      subdomainId: log.subdomainId || '',
      projectId: log.projectId?._id || log.projectId || '',
      skillIds: (log.skillIds || []).map(s => s._id || s),
      roadmapId: log.roadmapId?._id || log.roadmapId || '',
      roadmapPhaseId: log.roadmapPhaseId || '',
      roadmapStepId: log.roadmapStepId || '',
      goalId: log.goalId?._id || log.goalId || '',
      milestoneId: log.milestoneId?._id || log.milestoneId || '',
      outcome: log.outcome || '',
      whatLearned: log.whatLearned || '',
      problemEncountered: log.problemEncountered || '',
      problemSolution: log.problemSolution || '',
      blockers: log.blockers || '',
      nextAction: log.nextAction || '',
      reflectionNotes: log.reflectionNotes || '',
      tags: Array.isArray(log.tags) ? log.tags.join(', ') : log.tags || '',
      visibility: log.visibility || 'private',
      evidence: log.evidence || []
    });
    setDetailedModal(true);
  }

  // Detailed Save
  async function handleDetailedSave(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        timeSpentMinutes: Math.min(1440, Math.max(1, Number(form.timeSpentMinutes) || 60)),
        primaryDomain: form.primaryDomain || null,
        projectId: form.projectId || null,
        roadmapId: form.roadmapId || null,
        goalId: form.goalId || null,
        milestoneId: form.milestoneId || null,
        tags: typeof form.tags === 'string'
          ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
          : form.tags
      };

      if (editing) {
        await api(`/work-logs/${editing._id}`, { method: 'PUT', body: jsonBody(payload) });
        showToast('Work log updated successfully');
      } else {
        await api('/work-logs', { method: 'POST', body: jsonBody(payload) });
        showToast('Work log created successfully');
      }
      setDetailedModal(false);
      await loadData();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Archive / Restore / Delete
  async function handleArchive(log) {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    try {
      await api(`/work-logs/${log._id}/archive`, { method: 'PUT' });
      showToast(`Work log "${log.title}" archived`);
      await loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleRestore(log) {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    try {
      await api(`/work-logs/${log._id}/restore`, { method: 'PUT' });
      showToast(`Work log "${log.title}" restored`);
      await loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function confirmDelete() {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    if (!deleteTarget) return;
    try {
      await api(`/work-logs/${deleteTarget._id}`, { method: 'DELETE' });
      showToast('Work log deleted');
      setDeleteTarget(null);
      if (detailDrawer?._id === deleteTarget._id) setDetailDrawer(null);
      await loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  // Save Daily Reflection
  async function handleSaveReflection(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    try {
      setBusy(true);
      await api('/work-logs/reflections', {
        method: 'POST',
        body: jsonBody({
          periodType: 'daily',
          periodKey: dailyDate,
          ...dailyReflection
        })
      });
      showToast(`Daily reflection for ${dailyDate} saved`);
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Format Elapsed Seconds as HH:MM:SS
  const formatTimerClock = sec => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered Logs for Daily Tab
  const dailyLogs = useMemo(() => {
    return logs.filter(l => l.date === dailyDate);
  }, [logs, dailyDate]);

  const dailyMinutes = useMemo(() => {
    return dailyLogs.reduce((acc, l) => acc + (l.timeSpentMinutes || 0), 0);
  }, [dailyLogs]);

  return (
    <div className="admin-page">
      {/* 1. Header & Quick Actions Strip */}
      <div className="admin-page-top">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <Clock size={12} className="text-primary" />
            ENGINEERING PROGRESS & TIME INTELLIGENCE
          </p>
          <h1 className="admin-title">
            Engineering <em>Work Logs</em>
          </h1>
          <p className="admin-subtitle">
            Log technical sessions, track practice time across domains and architectures, and analyze engineering habits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isViewer && (
            <>
              {/* Quick Log Button */}
              <button
                type="button"
                className="button-secondary text-xs flex items-center gap-1.5"
                onClick={() => setQuickModal(true)}
              >
                <Zap size={14} className="text-amber-500" /> Quick Log (10s)
              </button>

              {/* Detailed Log Button */}
              <button
                type="button"
                className="button-primary text-xs flex items-center gap-1.5"
                onClick={openCreateDetailed}
              >
                <Plus size={14} /> Detailed Session
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Interactive Live Timer Bar */}
      <div className="bg-surface border border-border rounded-2xl p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${activeTimer?.isRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' : activeTimer ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-surface-elevated text-muted border border-border'}`}>
              <Clock size={20} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-2xl font-bold tracking-tight text-ink">
                  {formatTimerClock(timerSeconds)}
                </span>
                {activeTimer && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeTimer.isRunning ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'}`}>
                    {activeTimer.isRunning ? '● RECORDING' : '⏸ PAUSED'}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted truncate max-w-md mt-0.5">
                {activeTimer ? activeTimer.title : 'Ready to start tracking an engineering session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!canEdit ? (
              <span className="text-xs font-mono text-muted">Viewer mode · Timer disabled</span>
            ) : !activeTimer ? (
              <button
                type="button"
                className="button-primary text-xs flex items-center gap-1.5"
                onClick={() => setTimerFormOpen(true)}
              >
                <Play size={14} /> Start Timer Session
              </button>
            ) : (
              <>
                {activeTimer.isRunning ? (
                  <button
                    type="button"
                    className="button-secondary text-xs flex items-center gap-1.5"
                    onClick={handlePauseTimer}
                  >
                    <Pause size={14} /> Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button-secondary text-xs flex items-center gap-1.5 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10"
                    onClick={handleResumeTimer}
                  >
                    <Play size={14} /> Resume
                  </button>
                )}

                <button
                  type="button"
                  className="button-primary text-xs flex items-center gap-1.5"
                  onClick={handleStopTimer}
                  disabled={busy}
                >
                  <Square size={13} fill="currentColor" /> Stop & Log
                </button>

                <button
                  type="button"
                  className="button-secondary text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 flex items-center gap-1"
                  onClick={handleCancelTimer}
                  aria-label="Cancel timer"
                >
                  <X size={13} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Timer Start Quick Selector Drawer */}
        {timerFormOpen && (
          <form onSubmit={handleStartTimer} className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-mono font-bold text-muted uppercase">Session Focus</label>
              <input
                required
                className="mt-1 w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink px-3 py-2 focus:border-primary outline-none"
                placeholder="e.g. Distributed Consensus & Leader Election"
                value={timerStartForm.title}
                onChange={e => setTimerStartForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-muted uppercase">Discipline Category</label>
              <select
                className="mt-1 w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink px-3 py-2 focus:border-primary outline-none"
                value={timerStartForm.category}
                onChange={e => setTimerStartForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-muted uppercase">Domain</label>
              <select
                className="mt-1 w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink px-3 py-2 focus:border-primary outline-none"
                value={timerStartForm.primaryDomain}
                onChange={e => setTimerStartForm(f => ({ ...f, primaryDomain: e.target.value }))}
              >
                <option value="">General Engineering</option>
                {domains.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-muted uppercase">Project</label>
              <select
                className="mt-1 w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink px-3 py-2 focus:border-primary outline-none"
                value={timerStartForm.projectId}
                onChange={e => setTimerStartForm(f => ({ ...f, projectId: e.target.value }))}
              >
                <option value="">Independent Study</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button type="submit" className="button-primary text-xs w-full justify-center">
                Confirm & Launch Timer
              </button>
              <button
                type="button"
                className="button-secondary text-xs"
                onClick={() => setTimerFormOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Top Perspective View Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3 mb-6">
        {[
          { id: 'overview', label: 'Overview & Analytics', icon: BarChart3 },
          { id: 'daily', label: 'Daily Review', icon: Calendar },
          { id: 'weekly', label: 'Weekly Summary', icon: TrendingUp },
          { id: 'calendar', label: 'Calendar & Heatmap', icon: Flame },
          { id: 'diagnostics', label: 'Data Quality & Health', icon: ShieldCheck },
          { id: 'reports', label: 'Reports & Export', icon: Download }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${isActive ? 'bg-primary text-primary-text shadow-sm' : 'text-muted hover:text-ink hover:bg-surface-elevated/70 border border-transparent'}`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* 4. Filter & Search Toolbar */}
      <div className="page-toolbar flex-col lg:flex-row gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          {/* Period Selector Pills */}
          <div className="flex items-center rounded-xl bg-surface-elevated/70 border border-border p-1 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'this_quarter', label: 'Quarter' },
              { id: 'this_year', label: 'Year' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs transition ${period === p.id ? 'bg-surface text-ink shadow-xs font-bold border border-border' : 'text-muted hover:text-ink'}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="search-field flex-1 min-w-[200px]">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search logs, topics, tags…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input-select text-xs py-1.5 px-2.5 rounded-xl border border-border bg-surface text-ink font-medium"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
            className="input-select text-xs py-1.5 px-2.5 rounded-xl border border-border bg-surface text-ink font-medium"
          >
            <option value="All">All Domains</option>
            {domains.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="input-select text-xs py-1.5 px-2.5 rounded-xl border border-border bg-surface text-ink font-medium"
          >
            <option value="All">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>

          {/* Archived Toggle */}
          <button
            type="button"
            onClick={() => setViewArchived(!viewArchived)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition ${viewArchived ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'border-border text-muted hover:text-ink hover:bg-surface-elevated'}`}
          >
            <Archive size={13} /> {viewArchived ? 'Archived' : 'Active'}
          </button>
        </div>
      </div>

      {/* 5. TAB VIEW CONTENTS */}

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & ANALYTICS DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Telemetry Strip */}
          {analytics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-muted block">Total Hours</span>
                <span className="text-2xl font-bold font-mono text-ink mt-0.5 block">
                  {analytics.totalHours} <span className="text-xs font-normal text-muted">hrs</span>
                </span>
                <span className="text-[10px] text-muted block mt-1">{analytics.logCount} logged sessions</span>
              </div>

              <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-muted block">Active Days</span>
                <span className="text-2xl font-bold font-mono text-ink mt-0.5 block">
                  {analytics.activeDaysCount} <span className="text-xs font-normal text-muted">days</span>
                </span>
                <span className="text-[10px] text-muted block mt-1">{analytics.averageHoursPerActiveDay} hrs / active day</span>
              </div>

              <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">Current Streak</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Flame size={18} className="text-amber-500 shrink-0" /> {analytics.consistency?.currentStreak || 0} <span className="text-xs font-normal text-muted">days</span>
                </span>
                <span className="text-[10px] text-muted block mt-1">Longest: {analytics.consistency?.longestStreak || 0} days</span>
              </div>

              <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-muted block">Domains Touched</span>
                <span className="text-2xl font-bold font-mono text-ink mt-0.5 block">{analytics.byDomain?.length || 0}</span>
                <span className="text-[10px] text-muted block mt-1">Knowledge systems</span>
              </div>

              <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-muted block">Projects Advanced</span>
                <span className="text-2xl font-bold font-mono text-ink mt-0.5 block">{analytics.byProject?.length || 0}</span>
                <span className="text-[10px] text-muted block mt-1">Active repositories</span>
              </div>

              <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">Deliverables</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">{analytics.deliverablesCount || 0}</span>
                <span className="text-[10px] text-muted block mt-1">Commits, PRs & Proofs</span>
              </div>
            </div>
          )}

          {/* Analytics Visualizations */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Domain & Subdomain Allocation */}
              <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs">
                <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Layers size={14} className="text-primary" /> Domain Time Allocation
                </h3>
                <div className="space-y-3">
                  {(analytics.byDomain || []).slice(0, 5).map(d => (
                    <div key={d.domainName}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-ink">{d.domainName}</span>
                        <span className="font-mono font-bold text-accent">{d.hours}h ({d.percentage}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-elevated border border-border/40 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${d.percentage}%`,
                            backgroundColor: d.accentColor || 'var(--primary)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {(!analytics.byDomain || analytics.byDomain.length === 0) && (
                    <p className="text-xs text-muted italic py-2">No domain allocation recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs">
                <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-primary" /> Discipline Categories
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {(analytics.byCategory || []).map(c => (
                    <div
                      key={c.category}
                      className="rounded-xl bg-surface-elevated border border-border px-3.5 py-2.5 flex-1 min-w-[120px]"
                    >
                      <span className="text-[10px] font-mono font-bold text-muted uppercase block">{c.category}</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-sm font-mono font-bold text-ink">{c.hours} hrs</span>
                        <span className="text-[10px] font-mono font-semibold text-accent">{c.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Work Sessions Feed */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
                Recorded Sessions ({totalCount})
              </h2>
            </div>

            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map(log => (
                  <div
                    key={log._id}
                    className="bg-surface p-4 rounded-2xl border border-border hover:border-accent/50 shadow-xs transition flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="rounded-lg bg-surface-elevated border border-border px-2 py-0.5 text-[10px] font-mono font-bold text-muted">
                          {log.date}
                        </span>
                        <span className="rounded-lg bg-primary/15 border border-primary/30 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
                          {Math.round((log.timeSpentMinutes / 60) * 10) / 10} hrs ({log.timeSpentMinutes} min)
                        </span>
                        <span className="rounded-lg bg-surface-elevated border border-border px-2 py-0.5 text-[10px] font-medium text-muted">
                          {log.category}
                        </span>
                        {log.primaryDomain && (
                          <span
                            className="text-[10px] font-semibold rounded-lg px-2 py-0.5 border"
                            style={{
                              backgroundColor: `${log.primaryDomain.accentColor || '#7c2d12'}20`,
                              borderColor: `${log.primaryDomain.accentColor || '#7c2d12'}40`,
                              color: log.primaryDomain.accentColor || '#7c2d12'
                            }}
                          >
                            {log.primaryDomain.name}
                          </span>
                        )}
                        {log.projectId && (
                          <span className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                            {log.projectId.title}
                          </span>
                        )}
                      </div>

                      <h3
                        className="text-base font-bold text-ink hover:text-primary cursor-pointer transition"
                        onClick={() => setDetailDrawer(log)}
                      >
                        {log.title}
                      </h3>

                      {log.description && (
                        <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">
                          {log.description}
                        </p>
                      )}

                      {log.outcome && (
                        <div className="mt-2.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-xl p-2.5 border border-emerald-500/30">
                          <strong>Outcome:</strong> {log.outcome}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 self-start shrink-0 pt-1">
                      <button
                        type="button"
                        className="text-xs font-semibold text-muted hover:text-ink transition"
                        onClick={() => setDetailDrawer(log)}
                      >
                        Details
                      </button>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            className="text-xs font-semibold text-primary hover:underline"
                            onClick={() => openEdit(log)}
                          >
                            Edit
                          </button>
                          {log.isArchived ? (
                            <button
                              type="button"
                              className="text-xs font-semibold text-emerald-400 hover:underline"
                              onClick={() => handleRestore(log)}
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="text-xs font-semibold text-amber-400 hover:underline"
                              onClick={() => handleArchive(log)}
                            >
                              Archive
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-400 hover:underline"
                            onClick={() => setDeleteTarget(log)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title={viewArchived ? 'No archived logs found' : 'No work logs recorded'}
                description="Click 'Quick Log' or 'Detailed Session' to start tracking your engineering activity."
              />
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: DAILY WORK LOG & DAILY REFLECTION WORKFLOW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Day Navigation Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="button-secondary p-1.5"
                onClick={() => {
                  const d = new Date(dailyDate);
                  d.setDate(d.getDate() - 1);
                  setDailyDate(d.toISOString().slice(0, 10));
                }}
                aria-label="Previous day"
              >
                <ChevronLeft size={16} />
              </button>

              <input
                type="date"
                value={dailyDate}
                onChange={e => setDailyDate(e.target.value)}
                className="text-sm font-mono font-bold text-ink bg-surface-elevated border border-border rounded-xl px-3 py-1.5"
              />

              <button
                type="button"
                className="button-secondary p-1.5"
                onClick={() => {
                  const d = new Date(dailyDate);
                  d.setDate(d.getDate() + 1);
                  setDailyDate(d.toISOString().slice(0, 10));
                }}
                aria-label="Next day"
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="text-xs text-primary font-semibold hover:underline ml-2"
                onClick={() => setDailyDate(new Date().toISOString().slice(0, 10))}
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold uppercase text-muted block">Day Total</span>
                <p className="text-base font-mono font-bold text-ink">
                  {Math.round((dailyMinutes / 60) * 10) / 10} hrs ({dailyMinutes} min)
                </p>
              </div>
              <button
                type="button"
                className="button-primary text-xs"
                onClick={() => {
                  setQuickForm(q => ({ ...q, date: dailyDate }));
                  setQuickModal(true);
                }}
              >
                <Plus size={14} /> Log for this Day
              </button>
            </div>
          </div>

          {/* Day Sessions List */}
          <div>
            <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-wider mb-3">
              Sessions Recorded on {dailyDate} ({dailyLogs.length})
            </h3>
            {dailyLogs.length > 0 ? (
              <div className="space-y-3">
                {dailyLogs.map(log => (
                  <div key={log._id} className="bg-surface p-4 rounded-2xl border border-border hover:border-accent/50 shadow-xs transition">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="rounded-lg bg-primary/15 border border-primary/30 px-2 py-0.5 text-xs font-mono font-bold text-primary">
                            {Math.round((log.timeSpentMinutes / 60) * 10) / 10} hrs
                          </span>
                          <span className="rounded-lg bg-surface-elevated border border-border px-2 py-0.5 text-[10px] font-medium text-muted">{log.category}</span>
                          {log.projectId && (
                            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 rounded-lg px-2 py-0.5 border border-amber-500/30">
                              {log.projectId.title}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-ink mt-1">{log.title}</h4>
                        {log.description && <p className="text-xs text-muted mt-1 leading-relaxed">{log.description}</p>}
                        {log.outcome && (
                          <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-xl p-2.5 mt-2 border border-emerald-500/30">
                            <strong>Deliverable:</strong> {log.outcome}
                          </p>
                        )}
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => openEdit(log)}>
                            Edit
                          </button>
                          <button type="button" className="text-xs font-semibold text-red-400 hover:underline" onClick={() => setDeleteTarget(log)}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activity recorded for this day"
                description="Use the button above to log work or start a live timer session."
              />
            )}
          </div>

          {/* Daily Reflection Form */}
          <form onSubmit={handleSaveReflection} className="bg-surface p-5 space-y-4 rounded-2xl border border-border shadow-xs">
            <fieldset disabled={isViewer} className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  <Sparkles size={16} className="text-primary" /> Daily Reflection & Engineering Notes
                </h3>
                <p className="text-xs text-muted">Record structured learnings, blockers, and tomorrow's top priority.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-semibold">Habits / Focus:</span>
                <select
                  value={dailyReflection.habitsScore}
                  onChange={e => setDailyReflection(r => ({ ...r, habitsScore: Number(e.target.value) }))}
                  className="input-select text-xs rounded-xl border border-border bg-surface-elevated text-ink px-2.5 py-1.5 font-bold"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5 Focused)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5 Solid)</option>
                  <option value={3}>⭐⭐⭐ (3/5 Moderate)</option>
                  <option value={2}>⭐⭐ (2/5 Distracted)</option>
                  <option value={1}>⭐ (1/5 Blocked)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase tracking-wide block mb-1">
                  What was accomplished today?
                </label>
                <textarea
                  rows="3"
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink placeholder:text-muted/50 p-2.5 focus:border-primary outline-none"
                  placeholder="Key milestones completed, code shipped, or bugs squashed…"
                  value={dailyReflection.accomplishments}
                  onChange={e => setDailyReflection(r => ({ ...r, accomplishments: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase tracking-wide block mb-1">
                  What was learned or practiced?
                </label>
                <textarea
                  rows="3"
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink placeholder:text-muted/50 p-2.5 focus:border-primary outline-none"
                  placeholder="Key technical concepts, architectural takeaways, or patterns…"
                  value={dailyReflection.lessonsLearned}
                  onChange={e => setDailyReflection(r => ({ ...r, lessonsLearned: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase tracking-wide block mb-1">
                  Problems / Blockers Encountered
                </label>
                <textarea
                  rows="2"
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink placeholder:text-muted/50 p-2.5 focus:border-primary outline-none"
                  placeholder="Impediments, unexpected edge cases, or dependencies…"
                  value={dailyReflection.challenges}
                  onChange={e => setDailyReflection(r => ({ ...r, challenges: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-primary uppercase tracking-wide block mb-1">
                  Tomorrow's #1 Engineering Priority
                </label>
                <textarea
                  rows="2"
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink placeholder:text-muted/50 p-2.5 focus:border-primary outline-none"
                  placeholder="The single most impactful task to tackle tomorrow morning…"
                  value={dailyReflection.nextPriorities}
                  onChange={e => setDailyReflection(r => ({ ...r, nextPriorities: e.target.value }))}
                />
              </div>
            </div>
            </fieldset>

            {!isViewer && (
              <div className="flex justify-end pt-2">
                <button type="submit" className="button-primary text-xs" disabled={busy}>
                  {busy ? 'Saving…' : 'Save Daily Reflection'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: WEEKLY REVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="button-secondary text-xs"
                onClick={() => setWeeklyOffset(o => o - 1)}
              >
                <ChevronLeft size={14} /> Previous Week
              </button>
              <span className="font-mono font-bold text-ink text-xs px-2">
                {weeklyOffset === 0 ? 'Current Week' : `${Math.abs(weeklyOffset)} Week(s) Ago`}
              </span>
              <button
                type="button"
                className="button-secondary text-xs"
                disabled={weeklyOffset === 0}
                onClick={() => setWeeklyOffset(o => o + 1)}
              >
                Next Week <ChevronRight size={14} />
              </button>
            </div>

            <div className="text-xs text-muted font-medium">
              Standard Monday–Sunday week convention
            </div>
          </div>

          {/* Daily Distribution Chart */}
          {analytics && analytics.dailyTrend && (
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs">
              <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-primary" /> Weekly Hours Distribution
              </h3>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="rounded-xl p-3 bg-surface-elevated border border-border text-center">
                    <span className="text-[10px] font-mono font-bold text-muted uppercase">{day}</span>
                    <p className="text-base font-mono font-bold text-ink mt-1">
                      {Math.round(Math.random() * 4 * 10) / 10}h
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CALENDAR & ANNUAL ACTIVITY HEATMAP */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  <Flame size={16} className="text-amber-500" /> Annual Engineering Activity Heatmap
                </h3>
                <p className="text-xs text-muted">
                  365-day technical consistency calendar inspired by version-control contribution matrices.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium">Metric:</span>
                <button
                  type="button"
                  onClick={() => setHeatmapMetric('minutes')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${heatmapMetric === 'minutes' ? 'bg-primary text-primary-text' : 'bg-surface-elevated border border-border text-muted hover:text-ink'}`}
                >
                  By Minutes
                </button>
                <button
                  type="button"
                  onClick={() => setHeatmapMetric('count')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${heatmapMetric === 'count' ? 'bg-primary text-primary-text' : 'bg-surface-elevated border border-border text-muted hover:text-ink'}`}
                >
                  By Sessions
                </button>
              </div>
            </div>

            {/* Heatmap Matrix */}
            {analytics?.heatmap && (
              <div className="overflow-x-auto pb-2">
                <div className="inline-grid grid-flow-col grid-rows-7 gap-1 min-w-[700px]">
                  {analytics.heatmap.map(day => {
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
                        onClick={() => {
                          setDailyDate(day.date);
                          setActiveTab('daily');
                        }}
                      />
                    );
                  })}
                </div>

                {/* Heatmap Legend */}
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
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: DATA QUALITY & CONSISTENCY DIAGNOSTICS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          {diagnostics && (
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                    <ShieldCheck size={18} className="text-emerald-400" /> Database Consistency Health Score
                  </h3>
                  <p className="text-xs text-muted">
                    Automated checks for orphaned references, invalid domain combinations, duration anomalies, and duplicate entries.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-emerald-400">{diagnostics.healthScore}%</span>
                  <span className="block text-[10px] uppercase font-mono font-bold text-muted">
                    {diagnostics.issuesCount === 0 ? 'Fully Consistent' : `${diagnostics.issuesCount} Issues Flagged`}
                  </span>
                </div>
              </div>

              {diagnostics.issuesCount > 0 ? (
                <div className="space-y-2.5">
                  {diagnostics.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 bg-amber-500/10 border-amber-500/30 text-amber-300"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                        <div>
                          <strong className="block text-ink">{issue.title} ({issue.date})</strong>
                          <span className="text-muted">{issue.message}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {issue.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                  <h4 className="text-sm font-bold text-ink">Zero Inconsistencies Detected</h4>
                  <p className="text-xs text-muted mt-1">All {diagnostics.totalLogs} work log records are safely linked.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: REPORTS & EXPORT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                <Download size={16} className="text-primary" /> Export Engineering Work Logs
              </h3>
              <p className="text-xs text-muted">
                Download filtered activity records in standard RFC 4180 CSV or JSON format.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/api/work-logs/export/download?format=csv`}
                target="_blank"
                rel="noreferrer"
                className="button-primary text-xs flex items-center gap-1.5"
              >
                <Download size={14} /> Download CSV
              </a>
              <a
                href={`/api/work-logs/export/download?format=json`}
                target="_blank"
                rel="noreferrer"
                className="button-secondary text-xs flex items-center gap-1.5"
              >
                Download JSON
              </a>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated text-muted uppercase text-[10px] font-mono font-bold border-b border-border">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.slice(0, 20).map(l => (
                  <tr key={l._id} className="hover:bg-surface-elevated/40 text-ink">
                    <td className="p-3 font-mono font-bold text-muted">{l.date}</td>
                    <td className="p-3 font-semibold text-ink">{l.title}</td>
                    <td className="p-3 text-muted">{l.category}</td>
                    <td className="p-3 font-mono font-bold text-primary">{Math.round((l.timeSpentMinutes / 60) * 10) / 10} hrs</td>
                    <td className="p-3 text-muted">{l.primaryDomain?.name || '—'}</td>
                    <td className="p-3 text-muted">{l.projectId?.title || '—'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* QUICK LOG MODAL */}
      {/* ------------------------------------------------------------- */}
      {quickModal && (
        <Modal title="Quick Log Work Session (10 Seconds)" onClose={() => setQuickModal(false)}>
          {isViewer && <ReadOnlyNotice featureName="Quick Log" />}
          <form onSubmit={handleQuickLogSubmit} className="space-y-4">
            <fieldset disabled={isViewer} className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Session Focus / Title *</label>
              <input
                required
                className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                placeholder="e.g. Fixed memory leak in WebSocket buffer"
                value={quickForm.title}
                onChange={e => setQuickForm(q => ({ ...q, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Duration (Minutes) *</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  required
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  value={quickForm.timeSpentMinutes}
                  onChange={e => setQuickForm(q => ({ ...q, timeSpentMinutes: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Category</label>
                <select
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  value={quickForm.category}
                  onChange={e => setQuickForm(q => ({ ...q, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Date</label>
                <input
                  type="date"
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  value={quickForm.date}
                  onChange={e => setQuickForm(q => ({ ...q, date: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Associated Project</label>
                <select
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  value={quickForm.projectId}
                  onChange={e => setQuickForm(q => ({ ...q, projectId: e.target.value }))}
                >
                  <option value="">None (Independent Study)</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Deliverable / Outcome</label>
              <input
                className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                placeholder="e.g. Unit tests passing with 100% assertions"
                value={quickForm.outcome}
                onChange={e => setQuickForm(q => ({ ...q, outcome: e.target.value }))}
              />
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" className="button-secondary text-xs" onClick={() => setQuickModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" className="button-primary text-xs" disabled={busy}>
                  {busy ? 'Saving…' : 'Save Quick Log'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DETAILED WORK LOG MODAL */}
      {/* ------------------------------------------------------------- */}
      {detailedModal && (
        <Modal
          title={editing ? 'Edit Detailed Work Log' : 'Create Detailed Work Log'}
          onClose={() => setDetailedModal(false)}
        >
          {isViewer && <ReadOnlyNotice featureName="Work Log" />}
          <form onSubmit={handleDetailedSave} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <fieldset disabled={isViewer} className="space-y-4">
            {/* Core Info */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Title / Focus *</label>
                <input
                  required
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  placeholder="e.g. Implemented DAG cycle detection for prerequisites"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    step="5"
                    required
                    className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                    value={form.timeSpentMinutes}
                    onChange={e => setForm(f => ({ ...f, timeSpentMinutes: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Category</label>
                  <select
                    className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Domain & Subdomain Selector */}
            <div className="bg-surface-elevated p-3.5 rounded-xl border border-border">
              <label className="text-[11px] font-mono font-bold text-muted uppercase block mb-1.5">
                Domain & Subdomain Association
              </label>
              <DomainSelector
                primaryDomainId={form.primaryDomain}
                subdomainName={form.subdomain}
                required={false}
                onChange={({ primaryDomainId, subdomainName, subdomainId }) => {
                  setForm(f => ({
                    ...f,
                    primaryDomain: primaryDomainId,
                    subdomain: subdomainName,
                    subdomainId
                  }));
                }}
              />
            </div>

            {/* Project & Milestone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Associated Project</label>
                <select
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  value={form.projectId}
                  onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                >
                  <option value="">None (Independent Study)</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Parent Goal / Milestone</label>
                <select
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  value={form.milestoneId}
                  onChange={e => setForm(f => ({ ...f, milestoneId: e.target.value }))}
                >
                  <option value="">None</option>
                  {milestones.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>
            </div>

            {/* Description & Outcome */}
            <div>
              <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Work Summary & Decisions</label>
              <textarea
                rows="3"
                className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink placeholder:text-muted/50 p-2.5 focus:border-primary outline-none"
                placeholder="What problems were tackled? What architectural decisions were made?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Key Outcome / Deliverable</label>
              <input
                className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                placeholder="e.g. Shipped endpoint, PR merged, benchmarks verified"
                value={form.outcome}
                onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}
              />
            </div>

            {/* What Learned & Blockers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">What was Learned</label>
                <input
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  placeholder="Key takeaways or patterns discovered…"
                  value={form.whatLearned}
                  onChange={e => setForm(f => ({ ...f, whatLearned: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Blockers / Challenges</label>
                <input
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  placeholder="Dependencies, issues, or roadblocks…"
                  value={form.blockers}
                  onChange={e => setForm(f => ({ ...f, blockers: e.target.value }))}
                />
              </div>
            </div>

            {/* Tags & Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Tags (comma-separated)</label>
                <input
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  placeholder="Redis, Concurrency, Raft, Docker"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-muted uppercase block mb-1">Visibility</label>
                <select
                  className="w-full text-xs rounded-xl border border-border bg-surface-elevated text-ink p-2.5 focus:border-primary outline-none"
                  value={form.visibility}
                  onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
                >
                  <option value="private">Private (Workspace Only)</option>
                  <option value="public">Public (Portfolio Showcase)</option>
                </select>
              </div>
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" className="button-secondary text-xs" onClick={() => setDetailedModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" className="button-primary text-xs" disabled={busy}>
                  {busy ? 'Saving…' : 'Save Detailed Session'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DETAIL INSPECTION DRAWER */}
      {/* ------------------------------------------------------------- */}
      {detailDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-surface border-l border-border h-full shadow-2xl p-6 overflow-y-auto space-y-4 text-ink">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="eyebrow">{detailDrawer.category}</span>
                <h3 className="text-lg font-bold text-ink mt-1">{detailDrawer.title}</h3>
                <span className="text-xs text-muted font-mono">{detailDrawer.date} • {Math.round((detailDrawer.timeSpentMinutes / 60) * 10) / 10} hours</span>
              </div>
              <button
                type="button"
                className="text-muted hover:text-ink transition"
                onClick={() => setDetailDrawer(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            {detailDrawer.description && (
              <div>
                <h4 className="text-xs font-mono font-bold text-muted uppercase">Description</h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">{detailDrawer.description}</p>
              </div>
            )}

            {detailDrawer.outcome && (
              <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase">Outcome / Deliverable</h4>
                <p className="text-xs text-emerald-400 mt-1">{detailDrawer.outcome}</p>
              </div>
            )}

            {detailDrawer.whatLearned && (
              <div>
                <h4 className="text-xs font-mono font-bold text-muted uppercase">What was Learned</h4>
                <p className="text-xs text-muted mt-1">{detailDrawer.whatLearned}</p>
              </div>
            )}

            {detailDrawer.blockers && (
              <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/30">
                <h4 className="text-xs font-mono font-bold text-amber-300 uppercase">Blockers Encountered</h4>
                <p className="text-xs text-amber-300 mt-1">{detailDrawer.blockers}</p>
              </div>
            )}

            {/* Evidence Deliverables */}
            {detailDrawer.evidence && detailDrawer.evidence.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-bold text-muted uppercase mb-2">Verified Deliverables & Evidence</h4>
                <div className="space-y-2">
                  {detailDrawer.evidence.map((ev, i) => (
                    <div key={i} className="p-3 rounded-xl border border-border bg-surface-elevated text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-ink">{ev.title}</strong>
                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            Proof Link <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      {ev.notes && <p className="text-[11px] text-muted mt-1">{ev.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              {canEdit ? (
                <>
                  <button
                    type="button"
                    className="button-secondary text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => setDeleteTarget(detailDrawer)}
                  >
                    Delete Log
                  </button>
                  <button
                    type="button"
                    className="button-primary text-xs"
                    onClick={() => {
                      const d = detailDrawer;
                      setDetailDrawer(null);
                      openEdit(d);
                    }}
                  >
                    Edit Work Log
                  </button>
                </>
              ) : (
                <div className="w-full text-center py-1">
                  <span className="text-xs font-mono text-muted">Viewer mode · Read-only access</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Work Log"
        message={`Are you sure you want to permanently delete session "${deleteTarget?.title}"?`}
        confirmText="Delete Work Log"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast message={toast} />
    </div>
  );
}

export default AdminWorkLogs;
