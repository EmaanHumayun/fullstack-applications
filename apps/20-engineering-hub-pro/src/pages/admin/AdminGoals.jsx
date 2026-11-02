import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Archive,
  Trash2,
  Target,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  FolderGit2,
  Layers,
  ChevronRight,
  TrendingUp,
  BarChart3,
  ListTodo,
  CalendarDays,
  FileText,
  Sparkles,
  Search,
  ExternalLink,
  Flame,
  CheckSquare,
  Square
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { MultiDomainSubdomainSelector } from '../../components/MultiDomainSubdomainSelector.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

const GOAL_CATEGORIES = [
  'Career and Professional Growth',
  'Technical Mastery',
  'Projects and Portfolio',
  'Learning and Certifications',
  'Research and Innovation',
  'Professional Branding and Networking',
  'Personal Development'
];

const TIME_HORIZONS = ['Long-term Vision', 'Strategic Goal', 'Short-term Goal', 'Weekly Action'];
const PRIORITIES = ['Critical', 'High', 'Normal', 'Low'];
const GOAL_STATUSES = ['Active', 'Planned', 'Draft', 'On hold', 'Completed', 'Cancelled'];

const emptyGoal = {
  title: '',
  description: '',
  whyItMatters: '',
  category: 'Technical Mastery',
  domainAssociations: [],
  timeHorizon: 'Strategic Goal',
  status: 'Active',
  priority: 'High',
  targetDate: '',
  deadline: '',
  progress: 0,
  progressMode: 'milestones',
  measurableSuccessCriteria: '',
  targetOutcome: '',
  visibility: 'public'
};

export function AdminGoals() {
  const { isViewer } = useAuth();
  const [goals, setGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [domains, setDomains] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'milestones', 'tasks', 'reviews', 'analytics'
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedSubdomain, setSelectedSubdomain] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHorizon, setSelectedHorizon] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyGoal);
  const [detailGoal, setDetailGoal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Milestone & Task sub-forms
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    weight: 1,
    evidenceUrl: ''
  });

  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Normal',
    estimatedHours: 2,
    associatedSkill: ''
  });

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    completedSummary: '',
    uncompletedSummary: '',
    blockers: '',
    learnings: '',
    isDeadlineRealistic: true,
    nextCommitments: ''
  });

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const load = useCallback(async () => {
    try {
      const url = viewArchived ? '/goals?archived=true' : '/goals?all=true';
      const [goalsData, analyticsData, skillsData, projectsData, domainsData] = await Promise.all([
        api(url),
        api('/goals/analytics').catch(() => null),
        api('/skills?all=true').catch(() => []),
        api('/projects?all=true').catch(() => []),
        api('/domains?all=true').catch(() => [])
      ]);
      setGoals(goalsData || []);
      setAnalytics(analyticsData);
      setSkills(skillsData || []);
      setProjects(projectsData || []);
      setDomains(domainsData || []);
    } catch (err) {
      showToast(err.message);
    }
  }, [viewArchived]);

  useEffect(() => {
    load();
  }, [load]);

  // Available subdomains for selected domain filter
  const filterAvailableSubdomains = useMemo(() => {
    if (selectedDomain === 'All') {
      const allSubs = [];
      domains.forEach(d => {
        (d.fields || []).forEach(f => {
          if (!allSubs.some(s => s._id === f._id)) allSubs.push(f);
        });
      });
      return allSubs;
    }
    const dom = domains.find(d => String(d._id) === selectedDomain || d.name === selectedDomain);
    return dom?.fields || [];
  }, [domains, selectedDomain]);

  // Filtered goals
  const filtered = useMemo(() => {
    return goals.filter(g => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        g.title.toLowerCase().includes(q) ||
        (g.description || '').toLowerCase().includes(q) ||
        (g.targetOutcome || '').toLowerCase().includes(q) ||
        (g.domainAssociations || []).some(da =>
          (da.domainId?.name || '').toLowerCase().includes(q) ||
          (da.subdomains || []).some(s => s.name?.toLowerCase().includes(q))
        );

      const matchesDom = selectedDomain === 'All' || (() => {
        if (!g.domainAssociations || g.domainAssociations.length === 0) {
          const pId = String(g.primaryDomain?._id || g.primaryDomain || '');
          const pName = g.primaryDomain?.name || g.category || '';
          return pId === selectedDomain || pName === selectedDomain;
        }
        return g.domainAssociations.some(da => {
          const dId = String(da.domainId?._id || da.domainId || '');
          const dName = da.domainId?.name || '';
          return dId === selectedDomain || dName === selectedDomain;
        });
      })();

      const matchesSub = selectedSubdomain === 'All' || (() => {
        if (!g.domainAssociations || g.domainAssociations.length === 0) {
          const sId = String(g.subdomainId?._id || g.subdomainId || '');
          const sName = g.subdomain || '';
          return sId === selectedSubdomain || sName === selectedSubdomain;
        }
        return g.domainAssociations.some(da => {
          const subIds = (da.subdomainIds || []).map(s => String(s?._id || s));
          const subNames = (da.subdomains || []).map(s => s.name);
          return subIds.includes(selectedSubdomain) || subNames.includes(selectedSubdomain);
        });
      })();

      const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
      const matchesHor = selectedHorizon === 'All' || g.timeHorizon === selectedHorizon;
      const matchesPri = selectedPriority === 'All' || g.priority === selectedPriority;
      const matchesSt = selectedStatus === 'All' || g.status === selectedStatus;

      return matchesSearch && matchesDom && matchesSub && matchesCat && matchesHor && matchesPri && matchesSt;
    });
  }, [goals, search, selectedDomain, selectedSubdomain, selectedCategory, selectedHorizon, selectedPriority, selectedStatus]);

  function openCreate() {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    setEditing(null);
    setForm(emptyGoal);
    setModal(true);
  }

  function openEdit(g) {
    setEditing(g);
    const existingAssocs = g.domainAssociations && g.domainAssociations.length > 0
      ? g.domainAssociations.map(da => ({
          domainId: String(da.domainId?._id || da.domainId),
          subdomainIds: (da.subdomainIds || []).map(s => String(s?._id || s))
        }))
      : (g.primaryDomain ? [{
          domainId: String(g.primaryDomain?._id || g.primaryDomain),
          subdomainIds: g.subdomainId ? [String(g.subdomainId?._id || g.subdomainId)] : []
        }] : []);

    setForm({
      ...g,
      domainAssociations: existingAssocs,
      targetDate: g.targetDate || (g.deadline ? g.deadline.slice(0, 10) : '')
    });
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        progress: Number(form.progress) || 0
      };

      if (editing) {
        const updated = await api(`/goals/${editing._id}`, {
          method: 'PUT',
          body: jsonBody(payload)
        });
        showToast('Goal updated successfully');
        setGoals(prev => prev.map(g => (g._id === updated._id ? updated : g)));
        if (detailGoal && detailGoal._id === updated._id) setDetailGoal(updated);
      } else {
        const created = await api('/goals', {
          method: 'POST',
          body: jsonBody(payload)
        });
        showToast('Goal created successfully');
        setGoals(prev => [created, ...prev]);
      }
      setModal(false);
      load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Toggle Milestone
  async function handleToggleMilestone(goalId, milestoneId) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    try {
      const res = await api(`/goals/${goalId}/milestones/${milestoneId}/toggle`, {
        method: 'PATCH'
      });
      showToast('Milestone status updated');
      setGoals(prev => prev.map(g => (g._id === goalId ? res.goal : g)));
      if (detailGoal && detailGoal._id === goalId) setDetailGoal(res.goal);
    } catch (err) {
      showToast(err.message);
    }
  }

  // Add Milestone
  async function handleAddMilestone(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    if (!detailGoal) return;
    setBusy(true);
    try {
      const res = await api(`/goals/${detailGoal._id}/milestones`, {
        method: 'POST',
        body: jsonBody(milestoneForm)
      });
      showToast('Milestone added');
      setDetailGoal(res.goal);
      setGoals(prev => prev.map(g => (g._id === res.goal._id ? res.goal : g)));
      setMilestoneModal(false);
      setMilestoneForm({ title: '', description: '', dueDate: '', weight: 1, evidenceUrl: '' });
      load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Toggle Task
  async function handleToggleTask(goalId, taskId) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    try {
      const res = await api(`/goals/${goalId}/tasks/${taskId}/toggle`, {
        method: 'PATCH'
      });
      showToast('Task updated');
      setGoals(prev => prev.map(g => (g._id === goalId ? res.goal : g)));
      if (detailGoal && detailGoal._id === goalId) setDetailGoal(res.goal);
    } catch (err) {
      showToast(err.message);
    }
  }

  // Add Task
  async function handleAddTask(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    if (!detailGoal) return;
    setBusy(true);
    try {
      const res = await api(`/goals/${detailGoal._id}/tasks`, {
        method: 'POST',
        body: jsonBody(taskForm)
      });
      showToast('Task added');
      setDetailGoal(res.goal);
      setGoals(prev => prev.map(g => (g._id === res.goal._id ? res.goal : g)));
      setTaskModal(false);
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'Normal', estimatedHours: 2, associatedSkill: '' });
      load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Add Weekly Review
  async function handleAddReview(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    if (!detailGoal) return;
    setBusy(true);
    try {
      const res = await api(`/goals/${detailGoal._id}/reviews`, {
        method: 'POST',
        body: jsonBody(reviewForm)
      });
      showToast('Weekly review recorded');
      setDetailGoal(res.goal);
      setGoals(prev => prev.map(g => (g._id === res.goal._id ? res.goal : g)));
      setReviewModal(false);
      setReviewForm({
        completedSummary: '',
        uncompletedSummary: '',
        blockers: '',
        learnings: '',
        isDeadlineRealistic: true,
        nextCommitments: ''
      });
      load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Link Skills or Projects to Goal
  async function handleToggleSkillLink(skillId) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    if (!detailGoal) return;
    const current = (detailGoal.linkedSkills || []).map(s => (typeof s === 'object' ? s._id : s));
    const next = current.includes(skillId)
      ? current.filter(id => id !== skillId)
      : [...current, skillId];

    try {
      const updated = await api(`/goals/${detailGoal._id}`, {
        method: 'PUT',
        body: jsonBody({ linkedSkills: next })
      });
      setDetailGoal(updated);
      setGoals(prev => prev.map(g => (g._id === updated._id ? updated : g)));
      showToast('Linked skills updated');
    } catch (err) {
      showToast(err.message);
    }
  }

  // Archive / Restore / Delete
  async function handleArchive(g) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    try {
      await api(`/goals/${g._id}/archive`, { method: 'PUT' });
      showToast(`Goal "${g.title}" moved to archive`);
      await load();
      if (detailGoal && detailGoal._id === g._id) setDetailGoal(null);
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleRestore(g) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    try {
      await api(`/goals/${g._id}/restore`, { method: 'PUT' });
      showToast(`Goal "${g.title}" restored`);
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function confirmDelete() {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    if (!deleteTarget) return;
    try {
      await api(`/goals/${deleteTarget._id}`, { method: 'DELETE' });
      showToast('Goal permanently deleted');
      setGoals(prev => prev.filter(g => g._id !== deleteTarget._id));
      if (detailGoal && detailGoal._id === deleteTarget._id) setDetailGoal(null);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to delete goal');
    }
  }

  return (
    <div className="admin-page">
      <Toast message={toast} />

      {/* Header */}
      <div className="admin-page-top">
        <div>
          <p className="eyebrow">STRATEGIC EXECUTION & ROADMAPS</p>
          <h1 className="admin-title">Goals & <em>Execution Roadmaps</em></h1>
          <p className="admin-subtitle">
            Long-term vision, strategic objectives, milestone tracking, weekly tasks, and skill development integration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            className="button-secondary"
            onClick={() => setViewArchived(!viewArchived)}
          >
            <Archive size={14} /> {viewArchived ? 'Active Goals' : 'View Archived'}
          </button>
          {!isViewer && (
            <button type="button" className="button-primary" onClick={openCreate}>
              <Plus size={16} /> New Goal
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics Cards */}
      {analytics && !viewArchived && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
          <div
            onClick={() => { setSelectedStatus('All'); setViewMode('cards'); }}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Active Goals</span>
            <span className="text-xl font-bold font-display text-ink mt-1 block">{analytics.totalActive}</span>
            <span className="text-[10px] text-primary font-semibold">Tracked</span>
          </div>

          <div
            onClick={() => { setSelectedPriority('Critical'); setViewMode('cards'); }}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Critical Priority</span>
            <span className="text-xl font-bold font-display text-rose-700 mt-1 block">{analytics.byPriority.Critical || 0}</span>
            <span className="text-[10px] text-muted">Immediate focus</span>
          </div>

          <div
            onClick={() => setViewMode('milestones')}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Milestone Rate</span>
            <span className="text-xl font-bold font-display text-emerald-700 mt-1 block">{analytics.milestoneCompletionRate}%</span>
            <span className="text-[10px] text-muted">{analytics.completedMilestonesCount}/{analytics.totalMilestonesCount} done</span>
          </div>

          <div
            onClick={() => setViewMode('tasks')}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Overdue Tasks</span>
            <span className={`text-xl font-bold font-display mt-1 block ${analytics.overdueTasksCount > 0 ? 'text-amber-700' : 'text-ink'}`}>
              {analytics.overdueTasksCount}
            </span>
            <span className="text-[10px] text-muted">Action items</span>
          </div>

          <div
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Average Progress</span>
            <span className="text-xl font-bold font-display text-primary mt-1 block">{analytics.averageProgress}%</span>
            <span className="text-[10px] text-muted">Across active</span>
          </div>

          <div
            onClick={() => setViewMode('analytics')}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Skills in Demand</span>
            <span className="text-xl font-bold font-display text-indigo-700 mt-1 block">{analytics.skillsDemand?.length || 0}</span>
            <span className="text-[10px] text-muted">Required by goals</span>
          </div>
        </div>
      )}

      {/* Toolbar & View Modes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border mb-6 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'cards' ? 'bg-primary text-primary-text shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            <Target size={14} /> Goal Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('milestones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'milestones' ? 'bg-primary text-primary-text shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            <CheckCircle2 size={14} /> Milestones Checklist
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'tasks' ? 'bg-primary text-primary-text shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            <ListTodo size={14} /> Tasks Execution
          </button>
          <button
            type="button"
            onClick={() => setViewMode('reviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'reviews' ? 'bg-primary text-primary-text shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            <FileText size={14} /> Weekly Reviews
          </button>
          <button
            type="button"
            onClick={() => setViewMode('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'analytics' ? 'bg-primary text-primary-text shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            <BarChart3 size={14} /> Roadmap Analytics
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search goals or outcomes…"
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-border bg-background text-text placeholder:text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={e => {
              setSelectedDomain(e.target.value);
              setSelectedSubdomain('All');
            }}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-ink outline-none"
          >
            <option value="All">All Domains</option>
            {domains.map(d => (
              <option key={d._id} value={String(d._id)}>{d.name}</option>
            ))}
          </select>

          {/* Subdomain Filter */}
          {filterAvailableSubdomains.length > 0 && (
            <select
              value={selectedSubdomain}
              onChange={e => setSelectedSubdomain(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-ink outline-none"
            >
              <option value="All">All Subdomains</option>
              {filterAvailableSubdomains.map(s => (
                <option key={s._id} value={String(s._id)}>{s.name}</option>
              ))}
            </select>
          )}

          <select
            value={selectedHorizon}
            onChange={e => setSelectedHorizon(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-ink outline-none"
          >
            <option value="All">All Horizons</option>
            {TIME_HORIZONS.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-ink outline-none"
          >
            <option value="All">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW: ROADMAP ANALYTICS & SKILLS DEMAND */}
      {viewMode === 'analytics' && analytics && (
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
              <h3 className="font-display font-bold text-base text-ink mb-1 flex items-center gap-2">
                <Target size={17} className="text-primary" /> Goals by Time Horizon
              </h3>
              <p className="text-xs text-muted mb-4">Breakdown across long-term vision down to short-term actions.</p>
              <div className="space-y-3">
                {TIME_HORIZONS.map(hz => (
                  <div key={hz} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-ink">{hz}</span>
                      <span className="text-muted">{analytics.byHorizon[hz] || 0} goals</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary-background overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${analytics.totalActive > 0 ? ((analytics.byHorizon[hz] || 0) / analytics.totalActive) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
              <h3 className="font-display font-bold text-base text-ink mb-1 flex items-center gap-2">
                <Sparkles size={17} className="text-primary" /> Skills Required Across Active Goals
              </h3>
              <p className="text-xs text-muted mb-4">Identifies competencies needed to complete strategic goals.</p>
              {analytics.skillsDemand && analytics.skillsDemand.length > 0 ? (
                <div className="space-y-2.5">
                  {analytics.skillsDemand.map(sk => (
                    <div key={sk.name} className="p-3 rounded-xl border border-border bg-background/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-ink block">{sk.name}</span>
                        <span className="text-[10px] text-muted font-mono">Target: {sk.targetLevel}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary">
                        Required in {sk.goalsCount} goal(s)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted italic">No specific skill requirements linked yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MILESTONES CHECKLIST VIEW */}
      {viewMode === 'milestones' && (
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs mb-8 space-y-6">
          <div className="border-b border-border pb-3">
            <h3 className="font-display font-bold text-base text-ink">Master Milestone Execution Plan</h3>
            <p className="text-xs text-muted">Complete milestones directly to drive progress across related goals.</p>
          </div>

          <div className="space-y-6">
            {filtered.map(goal => (
              <div key={goal._id} className="p-5 rounded-xl border border-border bg-background/40 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-ink">{goal.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary-background text-muted">
                      {goal.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary">{goal.progress}% Complete</span>
                </div>

                <div className="space-y-2">
                  {(goal.milestonesList || []).map(m => (
                    <div
                      key={m._id}
                      onClick={() => handleToggleMilestone(goal._id, m._id)}
                      className="p-3 rounded-lg border border-border bg-surface hover:border-primary transition cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {m.isCompleted ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Square size={16} className="text-muted shrink-0" />
                        )}
                        <div>
                          <span className={`font-bold block ${m.isCompleted ? 'line-through text-muted' : 'text-ink'}`}>
                            {m.title}
                          </span>
                          {m.description && <span className="text-[11px] text-muted block">{m.description}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-muted shrink-0">
                        {m.dueDate && <span>Due {new Date(m.dueDate).toLocaleDateString()}</span>}
                        <span className="px-2 py-0.5 rounded bg-secondary-background">Weight: {m.weight || 1}</span>
                      </div>
                    </div>
                  ))}

                  {(!goal.milestonesList || goal.milestonesList.length === 0) && (
                    <p className="text-xs text-muted italic">No milestones defined for this goal.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TASKS EXECUTION VIEW */}
      {viewMode === 'tasks' && (
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs mb-8 space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-ink">Actionable Task Execution</h3>
              <p className="text-xs text-muted">Granular tasks connected to goals and strategic roadmaps.</p>
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map(goal => (
              <div key={goal._id} className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                <span className="text-xs font-bold text-primary font-mono uppercase block">{goal.title}</span>
                <div className="space-y-1.5">
                  {(goal.tasks || []).map(task => (
                    <div
                      key={task._id}
                      onClick={() => handleToggleTask(goal._id, task._id)}
                      className="p-3 rounded-lg border border-border bg-surface hover:border-primary transition cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {task.isCompleted ? (
                          <CheckSquare size={15} className="text-emerald-600" />
                        ) : (
                          <Square size={15} className="text-muted" />
                        )}
                        <span className={task.isCompleted ? 'line-through text-muted' : 'text-ink font-bold'}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
                        <span>{task.estimatedHours}h est</span>
                        <span className="px-1.5 py-0.5 rounded bg-secondary-background uppercase">{task.priority}</span>
                      </div>
                    </div>
                  ))}

                  {(!goal.tasks || goal.tasks.length === 0) && (
                    <p className="text-xs text-muted italic">No active tasks created for this goal.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: WEEKLY REVIEWS VIEW */}
      {viewMode === 'reviews' && (
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs mb-8 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-display font-bold text-base text-ink">Goal Review Archive</h3>
            <p className="text-xs text-muted">Weekly retrospective notes, blocker audits, and commitments preserved over time.</p>
          </div>

          <div className="space-y-4">
            {filtered.map(goal => {
              if (!goal.reviews || goal.reviews.length === 0) return null;
              return (
                <div key={goal._id} className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
                  <span className="text-xs font-bold text-primary font-mono uppercase block">{goal.title}</span>
                  {goal.reviews.map((rev, i) => (
                    <div key={i} className="p-4 rounded-lg border border-border bg-surface text-xs space-y-2">
                      <div className="flex items-center justify-between font-mono text-[11px] text-muted border-b border-border/50 pb-1.5">
                        <span>Review recorded: {new Date(rev.date).toLocaleDateString()}</span>
                        <span className={rev.isDeadlineRealistic ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                          {rev.isDeadlineRealistic ? 'On Track' : 'Needs Schedule Adjustment'}
                        </span>
                      </div>
                      {rev.completedSummary && <p className="text-ink"><strong>Accomplished:</strong> {rev.completedSummary}</p>}
                      {rev.blockers && <p className="text-rose-700"><strong>Blockers:</strong> {rev.blockers}</p>}
                      {rev.learnings && <p className="text-muted"><strong>Learnings:</strong> {rev.learnings}</p>}
                      {rev.nextCommitments && <p className="text-primary font-semibold"><strong>Commitment:</strong> {rev.nextCommitments}</p>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: GOAL CARDS (DEFAULT) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {filtered.map(goal => (
            <div
              key={goal._id}
              className="p-5 rounded-2xl border border-border bg-surface shadow-xs hover:border-primary transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted">
                    {goal.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface border border-border text-primary">
                    {goal.timeHorizon}
                  </span>
                </div>

                {/* Multi-Domain Associations Badges */}
                {goal.domainAssociations && goal.domainAssociations.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {goal.domainAssociations.map((da, idx) => {
                      const dName = da.domainId?.name || goal.category;
                      const accent = da.domainId?.accentColor || '#bb9457';
                      const subCount = da.subdomains?.length || da.subdomainIds?.length || 0;
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border"
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
                    })}
                  </div>
                ) : goal.subdomain ? (
                  <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-mono text-muted">
                    <span>{goal.subdomain}</span>
                  </div>
                ) : null}

                <h3
                  onClick={() => setDetailGoal(goal)}
                  className="font-display font-bold text-base text-ink mb-1 cursor-pointer hover:text-primary transition"
                >
                  {goal.title}
                </h3>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-4">
                  {goal.description || goal.whyItMatters || 'Strategic goal mapped to technical competency growth.'}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted">Progress ({goal.progressMode || 'milestones'})</span>
                    <span className="font-bold text-ink">{goal.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary-background overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Linked Skills Badges */}
                {goal.linkedSkills && goal.linkedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {goal.linkedSkills.slice(0, 3).map((sk, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary-background text-muted">
                        {typeof sk === 'object' ? sk.name : 'Skill'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-muted">
                  {goal.targetDate ? `Due ${goal.targetDate}` : 'Open Timeline'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="button-secondary text-xs py-1 px-2.5"
                    onClick={() => setDetailGoal(goal)}
                  >
                    Roadmap & Tasks
                  </button>
                  {!isViewer && (
                    <>
                      <button
                        type="button"
                        className="button-ghost text-xs p-1.5"
                        onClick={() => openEdit(goal)}
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="button-ghost text-xs p-1.5 text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteTarget(goal)}
                        title="Delete Goal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <EmptyState
          title="No goals found"
          description={viewArchived ? 'No archived goals found.' : 'Create your first strategic goal to start tracking milestones and tasks.'}
        />
      )}

      {/* GOAL DETAIL DRAWER / MODAL */}
      {detailGoal && (
        <Modal title={`Goal: ${detailGoal.title}`} onClose={() => setDetailGoal(null)}>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-primary uppercase block mb-1">
                  {detailGoal.category} · {detailGoal.timeHorizon}
                </span>
                <h2 className="font-display font-black text-xl text-ink">{detailGoal.title}</h2>
                <p className="text-xs text-muted mt-1">{detailGoal.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-2xl font-bold font-display text-primary block">{detailGoal.progress}%</span>
                <span className="text-[10px] font-mono text-muted uppercase">Overall Progress</span>
              </div>
            </div>

            {/* Why it matters */}
            {detailGoal.whyItMatters && (
              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <span className="text-[10px] font-mono font-bold uppercase text-muted block mb-1">Strategic Justification</span>
                <p className="text-xs text-ink leading-relaxed">{detailGoal.whyItMatters}</p>
              </div>
            )}

            {/* Associated Engineering Domains & Subdomains */}
            {detailGoal.domainAssociations && detailGoal.domainAssociations.length > 0 && (
              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-muted block">
                  Associated Domains & Specializations ({detailGoal.domainAssociations.length})
                </span>
                <div className="space-y-2">
                  {detailGoal.domainAssociations.map((da, idx) => {
                    const domName = da.domainId?.name || 'Domain';
                    const accentColor = da.domainId?.accentColor || '#bb9457';
                    const subs = da.subdomains || [];
                    return (
                      <div key={idx} className="p-2.5 rounded-lg bg-background border border-border/70 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                          <span className="text-xs font-bold text-ink">{domName}</span>
                          <span className="text-[10px] font-mono text-muted">
                            ({subs.length} {subs.length === 1 ? 'subdomain' : 'subdomains'})
                          </span>
                        </div>
                        {subs.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pl-4">
                            {subs.map(s => (
                              <span key={s._id} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-200">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted italic pl-4">No specific subdomains selected</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Milestones Action & List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-primary" /> Goal Milestones ({detailGoal.milestonesList?.length || 0})
                </h4>
                {!isViewer && (
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => setMilestoneModal(true)}
                  >
                    <Plus size={12} /> Add Milestone
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {(detailGoal.milestonesList || []).map(m => (
                  <div
                    key={m._id}
                    onClick={() => !isViewer && handleToggleMilestone(detailGoal._id, m._id)}
                    className={`p-3 rounded-lg border border-border bg-background/50 transition flex items-center justify-between text-xs ${
                      isViewer ? 'cursor-default' : 'hover:border-primary cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {m.isCompleted ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Square size={16} className="text-muted shrink-0" />
                      )}
                      <div>
                        <span className={`font-bold block ${m.isCompleted ? 'line-through text-muted' : 'text-ink'}`}>
                          {m.title}
                        </span>
                        {m.description && <span className="text-[11px] text-muted block">{m.description}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-muted">Weight: {m.weight || 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Action & List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
                  <ListTodo size={15} className="text-primary" /> Execution Tasks ({detailGoal.tasks?.length || 0})
                </h4>
                {!isViewer && (
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => setTaskModal(true)}
                  >
                    <Plus size={12} /> Add Task
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {(detailGoal.tasks || []).map(t => (
                  <div
                    key={t._id}
                    onClick={() => !isViewer && handleToggleTask(detailGoal._id, t._id)}
                    className={`p-3 rounded-lg border border-border bg-background/50 transition flex items-center justify-between text-xs ${
                      isViewer ? 'cursor-default' : 'hover:border-primary cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {t.isCompleted ? (
                        <CheckSquare size={15} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Square size={15} className="text-muted shrink-0" />
                      )}
                      <span className={t.isCompleted ? 'line-through text-muted' : 'font-bold text-ink'}>
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-muted">{t.estimatedHours}h</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Review Action */}
            {!isViewer && (
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  className="button-primary text-xs"
                  onClick={() => setReviewModal(true)}
                >
                  <FileText size={13} /> Log Weekly Goal Review
                </button>

                <button
                  type="button"
                  className="button-ghost text-xs text-rose-700"
                  onClick={() => setDeleteTarget(detailGoal)}
                >
                  <Trash2 size={13} /> Delete Goal
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ADD MILESTONE MODAL */}
      {milestoneModal && detailGoal && (
        <Modal title={`Add Milestone: ${detailGoal.title}`} onClose={() => setMilestoneModal(false)}>
          {isViewer && <ReadOnlyNotice feature="Goal Milestones" />}
          <form onSubmit={handleAddMilestone} className="space-y-4">
            <fieldset disabled={isViewer} className="contents">
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Milestone Title *</label>
              <input
                type="text"
                placeholder="e.g. Design Event-Driven Architecture Blueprint"
                value={milestoneForm.title}
                onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Description</label>
              <textarea
                rows="2"
                placeholder="Scope of work and completion criteria…"
                value={milestoneForm.description}
                onChange={e => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Due Date</label>
                <input
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={e => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Progress Weight (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={milestoneForm.weight}
                  onChange={e => setMilestoneForm({ ...milestoneForm, weight: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink font-mono"
                />
              </div>
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="button-secondary text-xs" onClick={() => setMilestoneModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  Save Milestone
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* ADD TASK MODAL */}
      {taskModal && detailGoal && (
        <Modal title={`Add Task: ${detailGoal.title}`} onClose={() => setTaskModal(false)}>
          {isViewer && <ReadOnlyNotice feature="Execution Tasks" />}
          <form onSubmit={handleAddTask} className="space-y-4">
            <fieldset disabled={isViewer} className="contents">
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Task Title *</label>
              <input
                type="text"
                placeholder="e.g. Write integration test suite for websocket worker"
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Estimated Hours</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={taskForm.estimatedHours}
                  onChange={e => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="button-secondary text-xs" onClick={() => setTaskModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  Save Task
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* LOG WEEKLY REVIEW MODAL */}
      {reviewModal && detailGoal && (
        <Modal title={`Weekly Goal Review: ${detailGoal.title}`} onClose={() => setReviewModal(false)}>
          {isViewer && <ReadOnlyNotice feature="Weekly Reviews" />}
          <form onSubmit={handleAddReview} className="space-y-4">
            <fieldset disabled={isViewer} className="contents">
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Completed This Week</label>
              <textarea
                rows="2"
                placeholder="What was completed and verified…"
                value={reviewForm.completedSummary}
                onChange={e => setReviewForm({ ...reviewForm, completedSummary: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Current Blockers / Risks</label>
              <textarea
                rows="2"
                placeholder="Any technical or operational hurdles…"
                value={reviewForm.blockers}
                onChange={e => setReviewForm({ ...reviewForm, blockers: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Next Week's Commitments</label>
              <input
                type="text"
                placeholder="Specific tangible deliverables for the upcoming week…"
                value={reviewForm.nextCommitments}
                onChange={e => setReviewForm({ ...reviewForm, nextCommitments: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="deadlineRealistic"
                checked={reviewForm.isDeadlineRealistic}
                onChange={e => setReviewForm({ ...reviewForm, isDeadlineRealistic: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="deadlineRealistic" className="text-xs font-bold text-ink cursor-pointer">
                Target deadline remains realistic and achievable
              </label>
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="button-secondary text-xs" onClick={() => setReviewModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  Save Review
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* CREATE / EDIT GOAL MODAL */}
      {modal && (
        <Modal title={editing ? `Edit Goal: ${editing.title}` : 'Create New Goal'} onClose={() => setModal(false)}>
          {isViewer && <ReadOnlyNotice feature="Goals" />}
          <form onSubmit={handleSave} className="space-y-4">
            <fieldset disabled={isViewer} className="contents">
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Goal Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Master Production Distributed Systems"
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <MultiDomainSubdomainSelector
                value={form.domainAssociations || []}
                disabled={isViewer}
                onChange={(newAssocs) => {
                  const first = newAssocs[0];
                  setForm(f => ({
                    ...f,
                    domainAssociations: newAssocs,
                    primaryDomain: first?.domainId || null,
                    subdomainId: first?.subdomainIds?.[0] || null
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Time Horizon</label>
                <select
                  value={form.timeHorizon}
                  onChange={e => setForm({ ...form, timeHorizon: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                >
                  {TIME_HORIZONS.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Target Date / Deadline</label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={e => setForm({ ...form, targetDate: e.target.value, deadline: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Progress Calculation Mode</label>
                <select
                  value={form.progressMode || 'milestones'}
                  onChange={e => setForm({ ...form, progressMode: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                >
                  <option value="milestones">Milestones Weighted Average</option>
                  <option value="tasks">Tasks Completion Ratio</option>
                  <option value="manual">Manual Outcome %</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Why This Matters (Strategic Justification)</label>
              <textarea
                rows="2"
                placeholder="Explain the technical or career impact of achieving this goal…"
                value={form.whyItMatters}
                onChange={e => setForm({ ...form, whyItMatters: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Measurable Success Criteria</label>
              <input
                type="text"
                placeholder="e.g. Sub-50ms p95 latency, 99.9% uptime, 90% test coverage"
                value={form.measurableSuccessCriteria}
                onChange={e => setForm({ ...form, measurableSuccessCriteria: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" className="button-secondary text-xs" onClick={() => setModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  {editing ? 'Update Goal' : 'Create Goal'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Goal"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}"?`}
          confirmText="Delete Goal"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminGoals;
