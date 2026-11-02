import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Archive,
  Trash2,
  Trophy,
  ExternalLink,
  Search,
  X,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Layers,
  Target,
  Workflow,
  Code2,
  FolderOpen,
  Calendar,
  FileCheck2,
  ChevronRight,
  GitBranch,
  ShieldAlert,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
  Award,
  RefreshCw,
  Eye,
  CheckSquare,
  Square
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { DomainSelector } from '../../components/DomainSelector.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

const emptyMilestone = {
  title: '',
  description: '',
  category: 'Career',
  priority: 'Medium',
  status: 'planned',
  parentGoalId: '',
  primaryDomain: '',
  subdomain: '',
  subdomainId: '',
  startDate: '',
  dueDate: '',
  targetDate: '',
  successCriteria: [],
  subtasks: [],
  dependsOn: [],
  relatedRoadmapId: '',
  relatedPhaseId: '',
  relatedStepId: '',
  relatedSkills: [],
  relatedProjects: [],
  relatedCertifications: [],
  relatedResources: [],
  notes: '',
  tags: [],
  visibility: 'public'
};

export function AdminMilestones() {
  const { isViewer, canEdit } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [goals, setGoals] = useState([]);
  const [domains, setDomains] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [viewArchived, setViewArchived] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'by_goal' | 'by_domain' | 'timeline' | 'dependencies'

  // Filtering state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [goalFilter, setGoalFilter] = useState('All');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);
  const [filterDueSoonOnly, setFilterDueSoonOnly] = useState(false);

  // Modals & Drawers
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyMilestone);
  const [activeModalTab, setActiveModalTab] = useState('overview');

  const [detailMilestone, setDetailMilestone] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [evidenceModal, setEvidenceModal] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({ title: '', url: '', notes: '', type: 'repository' });

  // Input states for arrays inside modal
  const [newCriterion, setNewCriterion] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskMinutes, setNewSubtaskMinutes] = useState(30);

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // 1. Data Loader
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const url = viewArchived ? '/milestones?archived=true' : '/milestones?all=true';
      const [mList, gList, dList, rList, sList, pList, anData] = await Promise.all([
        api(url),
        api('/goals?all=true').catch(() => []),
        api('/domains').catch(() => []),
        api('/roadmaps?all=true').catch(() => []),
        api('/skills').catch(() => []),
        api('/projects').catch(() => []),
        api('/milestones/analytics').catch(() => null)
      ]);

      setMilestones(mList || []);
      setGoals(gList || []);
      setDomains(dList || []);
      setRoadmaps(rList || []);
      setSkills(sList || []);
      setProjects((pList || []).filter(p => p.type !== 'folder'));
      setAnalytics(anData);
    } catch (err) {
      showToast(err.message || 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  }, [viewArchived]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync detailMilestone whenever milestones list updates
  useEffect(() => {
    if (detailMilestone) {
      const refreshed = milestones.find(m => m._id === detailMilestone._id);
      if (refreshed) {
        setDetailMilestone(refreshed);
      }
    }
  }, [milestones]);

  // 2. Computed Filtered List
  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const sevenDaysLater = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return d;
  }, [now]);

  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = (m.title || '').toLowerCase().includes(q);
        const matchesDesc = (m.description || '').toLowerCase().includes(q);
        const matchesDomain = (m.primaryDomain?.name || m.subdomain || '').toLowerCase().includes(q);
        const matchesGoal = (m.parentGoalId?.title || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesDomain && !matchesGoal) return false;
      }

      // Status
      if (statusFilter !== 'All' && m.status !== statusFilter) return false;

      // Category
      if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;

      // Priority
      if (priorityFilter !== 'All' && m.priority !== priorityFilter) return false;

      // Domain
      if (domainFilter !== 'All') {
        const domId = m.primaryDomain?._id || m.primaryDomain;
        if (String(domId) !== String(domainFilter)) return false;
      }

      // Goal
      if (goalFilter !== 'All') {
        const gId = m.parentGoalId?._id || m.parentGoalId;
        if (String(gId) !== String(goalFilter)) return false;
      }

      // Overdue
      if (filterOverdueOnly) {
        if (m.status === 'completed' || m.status === 'archived') return false;
        const target = m.dueDate || m.targetDate;
        if (!target) return false;
        const d = new Date(target);
        if (isNaN(d.getTime()) || d >= now) return false;
      }

      // Due soon
      if (filterDueSoonOnly) {
        if (m.status === 'completed' || m.status === 'archived') return false;
        const target = m.dueDate || m.targetDate;
        if (!target) return false;
        const d = new Date(target);
        if (isNaN(d.getTime()) || d < now || d > sevenDaysLater) return false;
      }

      return true;
    });
  }, [milestones, search, statusFilter, categoryFilter, priorityFilter, domainFilter, goalFilter, filterOverdueOnly, filterDueSoonOnly, now, sevenDaysLater]);

  // 3. Modal Open Handlers
  function openCreate() {
    if (isViewer) {
      showToast('Viewers have read-only access. Milestone mutations are restricted to Admins.');
      return;
    }
    setEditing(null);
    setForm(emptyMilestone);
    setActiveModalTab('overview');
    setNewCriterion('');
    setNewSubtaskTitle('');
    setModal(true);
  }

  function openEdit(m) {
    if (isViewer) {
      showToast('Viewers have read-only access. Milestone mutations are restricted to Admins.');
      return;
    }
    setEditing(m);
    setForm({
      title: m.title || '',
      description: m.description || '',
      category: m.category || 'Career',
      priority: m.priority || 'Medium',
      status: m.status || 'planned',
      parentGoalId: m.parentGoalId?._id || m.parentGoalId || '',
      primaryDomain: m.primaryDomain?._id || m.primaryDomain || '',
      subdomain: m.subdomain || '',
      subdomainId: m.subdomainId || '',
      startDate: m.startDate ? m.startDate.split('T')[0] : '',
      dueDate: m.dueDate ? m.dueDate.split('T')[0] : (m.targetDate ? m.targetDate.split('T')[0] : ''),
      targetDate: m.targetDate ? m.targetDate.split('T')[0] : '',
      successCriteria: Array.isArray(m.successCriteria) ? [...m.successCriteria] : [],
      subtasks: Array.isArray(m.subtasks) ? [...m.subtasks] : [],
      dependsOn: Array.isArray(m.dependsOn) ? m.dependsOn.map(d => d._id || d) : [],
      relatedRoadmapId: m.relatedRoadmapId?._id || m.relatedRoadmapId || '',
      relatedPhaseId: m.relatedPhaseId || '',
      relatedStepId: m.relatedStepId || '',
      relatedSkills: Array.isArray(m.relatedSkills) ? m.relatedSkills.map(s => s._id || s) : (m.relatedSkillId ? [m.relatedSkillId] : []),
      relatedProjects: Array.isArray(m.relatedProjects) ? m.relatedProjects.map(p => p._id || p) : (m.relatedProjectId ? [m.relatedProjectId] : []),
      relatedCertifications: Array.isArray(m.relatedCertifications) ? m.relatedCertifications.map(c => c._id || c) : [],
      relatedResources: Array.isArray(m.relatedResources) ? m.relatedResources.map(r => r._id || r) : [],
      notes: m.notes || '',
      tags: Array.isArray(m.tags) ? [...m.tags] : [],
      visibility: m.visibility || 'public'
    });
    setActiveModalTab('overview');
    setNewCriterion('');
    setNewSubtaskTitle('');
    setModal(true);
  }

  // Auto-inherit goal domain
  const handleGoalSelect = (goalId) => {
    const parent = goals.find(g => g._id === goalId);
    setForm(f => ({
      ...f,
      parentGoalId: goalId,
      primaryDomain: parent?.primaryDomain?._id || parent?.primaryDomain || f.primaryDomain,
      subdomain: parent?.subdomain || f.subdomain,
      subdomainId: parent?.subdomainId || f.subdomainId
    }));
  };

  // Add / remove criteria in modal
  const addCriterion = () => {
    if (!newCriterion.trim()) return;
    setForm(f => ({ ...f, successCriteria: [...f.successCriteria, newCriterion.trim()] }));
    setNewCriterion('');
  };

  const removeCriterion = (idx) => {
    setForm(f => ({ ...f, successCriteria: f.successCriteria.filter((_, i) => i !== idx) }));
  };

  // Add / remove subtasks in modal
  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setForm(f => ({
      ...f,
      subtasks: [
        ...f.subtasks,
        {
          title: newSubtaskTitle.trim(),
          completed: false,
          estimatedMinutes: Number(newSubtaskMinutes) || 30
        }
      ]
    }));
    setNewSubtaskTitle('');
  };

  const removeSubtask = (idx) => {
    setForm(f => ({ ...f, subtasks: f.subtasks.filter((_, i) => i !== idx) }));
  };

  // Save Milestone
  async function handleSave(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access. Milestone mutations are restricted to Admins.');
      return;
    }
    if (!form.title.trim()) {
      showToast('Title is required');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        ...form,
        targetDate: form.dueDate || form.targetDate,
        parentGoalId: (form.parentGoalId && form.parentGoalId.trim() && form.parentGoalId !== 'none') ? form.parentGoalId : null,
        primaryDomain: (form.primaryDomain && form.primaryDomain.trim()) ? form.primaryDomain : null,
        subdomainId: (form.subdomainId && form.subdomainId.trim()) ? form.subdomainId : null,
        relatedRoadmapId: (form.relatedRoadmapId && form.relatedRoadmapId.trim()) ? form.relatedRoadmapId : null,
        relatedSkillId: (form.relatedSkillId && form.relatedSkillId.trim()) ? form.relatedSkillId : null,
        relatedProjectId: (form.relatedProjectId && form.relatedProjectId.trim()) ? form.relatedProjectId : null,
        dependsOn: Array.isArray(form.dependsOn) ? form.dependsOn.filter(Boolean) : [],
        secondaryDomains: Array.isArray(form.secondaryDomains) ? form.secondaryDomains.filter(Boolean) : [],
        relatedSkills: Array.isArray(form.relatedSkills) ? form.relatedSkills.filter(Boolean) : [],
        relatedProjects: Array.isArray(form.relatedProjects) ? form.relatedProjects.filter(Boolean) : [],
        relatedCertifications: Array.isArray(form.relatedCertifications) ? form.relatedCertifications.filter(Boolean) : [],
        relatedResources: Array.isArray(form.relatedResources) ? form.relatedResources.filter(Boolean) : []
      };

      if (editing) {
        await api(`/milestones/${editing._id}`, { method: 'PUT', body: jsonBody(payload) });
        showToast('Milestone updated successfully');
      } else {
        await api('/milestones', { method: 'POST', body: jsonBody(payload) });
        showToast('Milestone created successfully');
      }
      setModal(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save milestone');
    } finally {
      setBusy(false);
    }
  }

  // Toggle Subtask Completion from Drawer
  async function handleToggleSubtask(milestoneId, subtaskId, currentCompleted) {
    if (isViewer) {
      showToast('Viewers have read-only access. Subtasks cannot be toggled.');
      return;
    }
    try {
      const res = await api(`/milestones/${milestoneId}/toggle-subtask`, {
        method: 'PUT',
        body: jsonBody({ subtaskId, completed: !currentCompleted })
      });
      if (res?.milestone) {
        setMilestones(prev => prev.map(m => m._id === milestoneId ? res.milestone : m));
        setDetailMilestone(res.milestone);
      }
      showToast('Subtask state updated');
    } catch (err) {
      showToast(err.message || 'Failed to toggle subtask');
    }
  }

  // Quick Status Toggle (Complete / Reopen)
  async function handleQuickStatusToggle(m) {
    if (isViewer) {
      showToast('Viewers have read-only access. Milestone state cannot be changed.');
      return;
    }
    const nextStatus = m.status === 'completed' ? 'in_progress' : 'completed';
    try {
      const updated = await api(`/milestones/${m._id}`, {
        method: 'PUT',
        body: jsonBody({ status: nextStatus })
      });
      setMilestones(prev => prev.map(item => item._id === m._id ? updated : item));
      if (detailMilestone?._id === m._id) setDetailMilestone(updated);
      showToast(`Milestone marked as ${nextStatus.replace('_', ' ')}`);
    } catch (err) {
      showToast(err.message || 'Failed to update status');
    }
  }

  // Evidence Logging
  async function handleAddEvidence(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access. Evidence cannot be attached.');
      return;
    }
    if (!detailMilestone || !evidenceForm.title.trim()) return;

    setBusy(true);
    try {
      await api(`/milestones/${detailMilestone._id}/evidence`, {
        method: 'POST',
        body: jsonBody(evidenceForm)
      });
      showToast('Verified evidence logged successfully');
      setEvidenceModal(false);
      setEvidenceForm({ title: '', url: '', notes: '', type: 'repository' });
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to attach evidence');
    } finally {
      setBusy(false);
    }
  }

  // Archive & Restore
  async function handleArchive(m) {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    try {
      await api(`/milestones/${m._id}/archive`, { method: 'PUT' });
      showToast(`Milestone "${m.title}" archived`);
      if (detailMilestone?._id === m._id) setDetailMilestone(null);
      await loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleRestore(m) {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    try {
      await api(`/milestones/${m._id}/restore`, { method: 'PUT' });
      showToast(`Milestone "${m.title}" restored`);
      await loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  // Delete
  async function confirmDelete() {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    if (!deleteTarget) return;
    try {
      await api(`/milestones/${deleteTarget._id}`, { method: 'DELETE' });
      showToast('Milestone deleted');
      if (detailMilestone?._id === deleteTarget._id) setDetailMilestone(null);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      showToast(err.message);
    }
  }

  // Helper to render milestone status badge
  const renderStatusBadge = (m) => {
    const isOverdue = m.status !== 'completed' && m.status !== 'archived' && (m.dueDate || m.targetDate) && new Date(m.dueDate || m.targetDate) < now;

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
          <AlertCircle size={10} /> Overdue
        </span>
      );
    }

    switch (m.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={10} /> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
            <Clock size={10} /> In Progress
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle size={10} /> Blocked
          </span>
        );
      case 'not_started':
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
            Planned
          </span>
        );
    }
  };

  return (
    <div className="admin-page space-y-6 animate-fade-in pb-16">
      {/* 1. Header & Quick Actions */}
      <div className="admin-page-top">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-800" />
            COMPETENCY & ARCHITECTURE ACHIEVEMENTS
          </p>
          <h1 className="admin-title">
            Engineering <em>Milestones</em>
          </h1>
          <p className="admin-subtitle">
            Orchestrate major architectural milestones, link goals and roadmaps, track blocker dependencies, and verify deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className={`button-secondary text-xs font-semibold ${viewArchived ? 'bg-stone-900 text-white' : ''}`}
            onClick={() => setViewArchived(!viewArchived)}
          >
            <Archive size={14} /> {viewArchived ? 'View Active' : 'View Archived'}
          </button>
          {!isViewer && (
            <button type="button" className="button-primary text-xs font-semibold" onClick={openCreate}>
              <Plus size={16} /> New Milestone
            </button>
          )}
        </div>
      </div>

      {/* 2. Executive Analytics Strip */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] font-mono uppercase font-bold text-stone-500 block">Total Target</span>
            <span className="text-2xl font-bold font-mono text-ink mt-0.5 block">{analytics.total || 0}</span>
            <span className="text-[10px] text-stone-400">across all goals</span>
          </div>
          <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-800 block">In Progress</span>
            <span className="text-2xl font-bold font-mono text-amber-900 mt-0.5 block">
              {analytics.statusCounts?.in_progress || 0}
            </span>
            <span className="text-[10px] text-stone-400">actively moving</span>
          </div>
          <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 block">Completed</span>
            <span className="text-2xl font-bold font-mono text-emerald-800 mt-0.5 block">
              {analytics.statusCounts?.completed || 0}
            </span>
            <span className="text-[10px] text-stone-400 font-mono font-bold">
              {analytics.completionRate || 0}% rate
            </span>
          </div>
          <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] font-mono uppercase font-bold text-red-700 block">Blocked</span>
            <span className="text-2xl font-bold font-mono text-red-800 mt-0.5 block">
              {analytics.statusCounts?.blocked || 0}
            </span>
            <span className="text-[10px] text-stone-400">prerequisite wait</span>
          </div>
          <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] font-mono uppercase font-bold text-red-800 block">Overdue</span>
            <span className="text-2xl font-bold font-mono text-red-800 mt-0.5 block">
              {analytics.overdueCount || 0}
            </span>
            <span className="text-[10px] text-red-600 font-semibold">past deadline</span>
          </div>
          <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-800 block">Due Soon</span>
            <span className="text-2xl font-bold font-mono text-amber-900 mt-0.5 block">
              {analytics.dueSoonCount || 0}
            </span>
            <span className="text-[10px] text-stone-400">next 7 days</span>
          </div>
        </div>
      )}

      {/* 3. Filter Bar & View Layout Switcher */}
      <div className="page-toolbar flex-col lg:flex-row gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-2.5 w-full">
          {/* Search Field */}
          <div className="search-field flex-1 min-w-[200px]">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search milestones, goals, domains, tags…"
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
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <select
            className="input-select text-xs py-1.5 px-2.5 rounded-lg border border-border bg-surface text-ink"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Category Dropdown */}
          <select
            className="input-select text-xs py-1.5 px-2.5 rounded-lg border border-border bg-surface text-ink"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Career">Career</option>
            <option value="Project">Project</option>
            <option value="Learning">Learning</option>
            <option value="Architecture">Architecture</option>
            <option value="Certification">Certification</option>
          </select>

          {/* Domain Dropdown */}
          <select
            className="input-select text-xs py-1.5 px-2.5 rounded-lg border border-border bg-surface text-ink"
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
          >
            <option value="All">All Domains</option>
            {domains.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>

          {/* Quick Overdue Toggle */}
          <button
            type="button"
            onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition flex items-center gap-1 ${
              filterOverdueOnly
                ? 'bg-red-800 text-white border-red-900 shadow-xs'
                : 'bg-surface text-stone-700 border-border hover:bg-stone-50'
            }`}
          >
            <AlertCircle size={13} /> Overdue
          </button>

          {/* Quick Due Soon Toggle */}
          <button
            type="button"
            onClick={() => setFilterDueSoonOnly(!filterDueSoonOnly)}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition flex items-center gap-1 ${
              filterDueSoonOnly
                ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                : 'bg-surface text-stone-700 border-border hover:bg-stone-50'
            }`}
          >
            <Clock size={13} /> Due Soon
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start lg:self-center shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('by_goal')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              viewMode === 'by_goal' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            By Goal
          </button>
          <button
            type="button"
            onClick={() => setViewMode('by_domain')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              viewMode === 'by_domain' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            By Domain
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              viewMode === 'timeline' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Timeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('dependencies')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1 ${
              viewMode === 'dependencies' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <GitBranch size={12} /> Graph
          </button>
        </div>
      </div>

      {/* 4. Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-stone-500">Loading engineering milestones & dependencies…</p>
        </div>
      ) : filteredMilestones.length === 0 ? (
        <EmptyState
          title="No milestones match your criteria"
          description="Try relaxing your filters or create a new milestone target."
          action={!isViewer ? <button className="button-primary text-xs" onClick={openCreate}><Plus size={14} /> Add Milestone</button> : null}
        />
      ) : (
        <>
          {/* VIEW 1: GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMilestones.map(m => (
                <MilestoneCard
                  key={m._id}
                  milestone={m}
                  canEdit={canEdit}
                  onOpenDetail={() => setDetailMilestone(m)}
                  onEdit={() => openEdit(m)}
                  onQuickToggle={() => handleQuickStatusToggle(m)}
                  onArchive={() => handleArchive(m)}
                  onRestore={() => handleRestore(m)}
                  onDelete={() => setDeleteTarget(m)}
                  renderBadge={renderStatusBadge}
                />
              ))}
            </div>
          )}

          {/* VIEW 2: GROUPED BY GOAL */}
          {viewMode === 'by_goal' && (
            <div className="space-y-6">
              {goals.map(g => {
                const groupMilestones = filteredMilestones.filter(m => {
                  const gId = m.parentGoalId?._id || m.parentGoalId;
                  return String(gId) === String(g._id);
                });
                if (groupMilestones.length === 0) return null;

                return (
                  <div key={g._id} className="bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Target size={18} className="text-amber-800" />
                        <div>
                          <h3 className="text-base font-bold text-ink">{g.title}</h3>
                          <span className="text-xs text-stone-500 font-mono">
                            Goal Progress: {g.progress || 0}% · {groupMilestones.length} milestones
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {g.priority} Priority
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {groupMilestones.map(m => (
                        <MilestoneCard
                          key={m._id}
                          milestone={m}
                          canEdit={canEdit}
                          onOpenDetail={() => setDetailMilestone(m)}
                          onEdit={() => openEdit(m)}
                          onQuickToggle={() => handleQuickStatusToggle(m)}
                          onArchive={() => handleArchive(m)}
                          onRestore={() => handleRestore(m)}
                          onDelete={() => setDeleteTarget(m)}
                          renderBadge={renderStatusBadge}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Standalone Milestones (without Parent Goal) */}
              {(() => {
                const standalones = filteredMilestones.filter(m => !m.parentGoalId);
                if (standalones.length === 0) return null;
                return (
                  <div className="bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-xs">
                    <div className="pb-3 border-b border-border">
                      <h3 className="text-base font-bold text-ink flex items-center gap-2">
                        <Trophy size={18} className="text-stone-400" />
                        Standalone Career & Architecture Milestones
                      </h3>
                      <span className="text-xs text-stone-500 font-mono">
                        {standalones.length} unattached to broader strategic goals
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {standalones.map(m => (
                        <MilestoneCard
                          key={m._id}
                          milestone={m}
                          canEdit={canEdit}
                          onOpenDetail={() => setDetailMilestone(m)}
                          onEdit={() => openEdit(m)}
                          onQuickToggle={() => handleQuickStatusToggle(m)}
                          onArchive={() => handleArchive(m)}
                          onRestore={() => handleRestore(m)}
                          onDelete={() => setDeleteTarget(m)}
                          renderBadge={renderStatusBadge}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW 3: GROUPED BY DOMAIN */}
          {viewMode === 'by_domain' && (
            <div className="space-y-6">
              {domains.map(dom => {
                const groupMilestones = filteredMilestones.filter(m => {
                  const dId = m.primaryDomain?._id || m.primaryDomain;
                  return String(dId) === String(dom._id);
                });
                if (groupMilestones.length === 0) return null;

                return (
                  <div key={dom._id} className="bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: dom.accentColor || '#bb9457' }}
                        >
                          <Layers size={14} />
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-ink">{dom.name}</h3>
                          <span className="text-xs text-stone-500 font-mono">
                            {groupMilestones.length} milestones in domain
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {groupMilestones.map(m => (
                        <MilestoneCard
                          key={m._id}
                          milestone={m}
                          canEdit={canEdit}
                          onOpenDetail={() => setDetailMilestone(m)}
                          onEdit={() => openEdit(m)}
                          onQuickToggle={() => handleQuickStatusToggle(m)}
                          onArchive={() => handleArchive(m)}
                          onRestore={() => handleRestore(m)}
                          onDelete={() => setDeleteTarget(m)}
                          renderBadge={renderStatusBadge}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 4: TIMELINE VIEW */}
          {viewMode === 'timeline' && (
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-6">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <Calendar size={18} className="text-amber-800" />
                  Chronological Milestone Sequence
                </h3>
                <p className="text-xs text-stone-500">Ordered by scheduled deadline and target completion dates.</p>
              </div>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {filteredMilestones
                  .slice()
                  .sort((a, b) => new Date(a.dueDate || a.targetDate || '9999') - new Date(b.dueDate || b.targetDate || '9999'))
                  .map(m => {
                    const isDone = m.status === 'completed';
                    return (
                      <div key={m._id} className="relative group flex items-start justify-between gap-4">
                        <div
                          className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                            isDone ? 'bg-emerald-600 border-white text-white' : 'bg-white border-amber-800 text-amber-800'
                          }`}
                        >
                          {isDone ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        </div>

                        <div className="flex-1 bg-stone-50/60 p-4 rounded-xl border border-border hover:border-amber-300 transition">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10px] font-mono uppercase font-bold text-stone-500">
                              Target: {m.dueDate || m.targetDate || 'No date set'}
                            </span>
                            {renderStatusBadge(m)}
                          </div>
                          <h4 className="text-sm font-bold text-ink mt-1 cursor-pointer hover:text-amber-900 transition" onClick={() => setDetailMilestone(m)}>
                            {m.title}
                          </h4>
                          {m.description && (
                            <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                              {m.description}
                            </p>
                          )}
                          <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[11px] text-stone-500 font-mono">
                            {m.parentGoalId?.title && <span>↳ Goal: {m.parentGoalId.title}</span>}
                            {m.primaryDomain?.name && <span>· Domain: {m.primaryDomain.name}</span>}
                            {(m.subtasks || []).length > 0 && <span>· {(m.subtasks || []).filter(s => s.completed).length}/{(m.subtasks || []).length} subtasks</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="button-secondary text-xs px-2.5 py-1.5 shrink-0"
                          onClick={() => setDetailMilestone(m)}
                        >
                          <Eye size={13} /> Inspect
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* VIEW 5: DEPENDENCIES GRAPH VIEW */}
          {viewMode === 'dependencies' && (
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-6">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <GitBranch size={18} className="text-amber-800" />
                  Milestone Dependency & Blocker Topology
                </h3>
                <p className="text-xs text-stone-500">
                  Prerequisites and downstream deliverables. Blue/green items are unblocked or completed; red indicates blocked targets.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMilestones.map(m => {
                  const deps = m.dependsOn || [];
                  const isBlocked = deps.some(d => d.status !== 'completed');

                  return (
                    <div
                      key={m._id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        isBlocked ? 'bg-red-50/40 border-red-200' : 'bg-surface border-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-mono uppercase font-bold text-stone-500">
                            {m.category}
                          </span>
                          {renderStatusBadge(m)}
                        </div>
                        <h4 className="text-sm font-bold text-ink">{m.title}</h4>

                        {/* Dependencies list */}
                        <div className="mt-3 pt-3 border-t border-border/70 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase font-bold text-stone-400 block">
                            Prerequisites ({deps.length}):
                          </span>
                          {deps.length === 0 ? (
                            <span className="text-xs text-stone-400 italic">No prerequisites (Independent)</span>
                          ) : (
                            deps.map(d => {
                              const dDone = d.status === 'completed';
                              return (
                                <div key={d._id} className="flex items-center gap-1.5 text-xs">
                                  {dDone ? (
                                    <CheckCircle2 size={12} className="text-emerald-700 shrink-0" />
                                  ) : (
                                    <AlertCircle size={12} className="text-red-700 shrink-0" />
                                  )}
                                  <span className={dDone ? 'line-through text-stone-400' : 'font-semibold text-ink'}>
                                    {d.title}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-border flex items-center justify-between">
                        <span className="text-[11px] font-mono text-stone-500">{m.progress || 0}% done</span>
                        <button
                          type="button"
                          className="text-xs font-semibold text-wine hover:underline"
                          onClick={() => setDetailMilestone(m)}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. INTERACTIVE MILESTONE DETAIL DRAWER */}
      {detailMilestone && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-2xl bg-surface border-l border-border h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6 space-y-6">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {detailMilestone.category}
                    </span>
                    <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      {detailMilestone.priority} Priority
                    </span>
                    {renderStatusBadge(detailMilestone)}
                  </div>
                  <h2 className="text-xl font-bold font-serif text-ink">{detailMilestone.title}</h2>
                </div>
                <button
                  type="button"
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
                  onClick={() => setDetailMilestone(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Progress Summary Bar */}
              <div className="bg-stone-50 p-4 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-stone-700">Milestone Completion</span>
                  <span className="font-bold text-ink">{detailMilestone.progress || 0}%</span>
                </div>
                <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, detailMilestone.progress || 0))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-stone-500 pt-1">
                  <span>Start: {detailMilestone.startDate || 'Not specified'}</span>
                  <span>Due: {detailMilestone.dueDate || detailMilestone.targetDate || 'Open'}</span>
                </div>
              </div>

              {/* Description */}
              {detailMilestone.description && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">Description & Objective</h4>
                  <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">{detailMilestone.description}</p>
                </div>
              )}

              {/* Success Acceptance Criteria */}
              {(detailMilestone.successCriteria || []).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
                    Success Criteria & Acceptance Targets
                  </h4>
                  <div className="space-y-1.5">
                    {detailMilestone.successCriteria.map((sc, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 bg-stone-50/80 p-2.5 rounded-lg border border-border/80">
                        <CheckCircle2 size={13} className="text-amber-800 mt-0.5 shrink-0" />
                        <span>{sc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Subtasks Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
                    Subtasks Checklist ({(detailMilestone.subtasks || []).length})
                  </h4>
                  <span className="text-[10px] font-mono text-stone-400">Click to toggle progress</span>
                </div>

                {(detailMilestone.subtasks || []).length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No discrete subtasks logged.</p>
                ) : (
                  <div className="space-y-1.5">
                    {detailMilestone.subtasks.map(st => (
                      <button
                        type="button"
                        key={st._id}
                        disabled={!canEdit}
                        onClick={() => canEdit && handleToggleSubtask(detailMilestone._id, st._id, st.completed)}
                        className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-lg border transition ${
                          !canEdit ? 'cursor-default' : ''
                        } ${
                          st.completed ? 'bg-emerald-50/50 border-emerald-200 text-stone-500' : 'bg-surface border-border text-ink hover:bg-stone-50'
                        }`}
                      >
                        {st.completed ? (
                          <CheckSquare size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                        ) : (
                          <Square size={16} className="text-stone-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <span className={`text-xs ${st.completed ? 'line-through' : 'font-medium'}`}>{st.title}</span>
                          {st.estimatedMinutes && (
                            <span className="block text-[10px] font-mono text-stone-400">~{st.estimatedMinutes}m effort</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dependencies & Blockers */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
                  Prerequisites & Blockers ({(detailMilestone.dependsOn || []).length})
                </h4>
                {(detailMilestone.dependsOn || []).length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No prerequisite milestone blockers.</p>
                ) : (
                  <div className="space-y-1.5">
                    {detailMilestone.dependsOn.map(dep => {
                      const isComplete = dep.status === 'completed';
                      return (
                        <div key={dep._id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-stone-50 text-xs">
                          <div className="flex items-center gap-2">
                            {isComplete ? (
                              <CheckCircle2 size={14} className="text-emerald-700" />
                            ) : (
                              <AlertCircle size={14} className="text-red-700" />
                            )}
                            <span className={isComplete ? 'line-through text-stone-400' : 'font-semibold text-ink'}>
                              {dep.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                            {dep.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Verified Deliverables & Evidence */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
                    Verified Deliverables & Evidence ({(detailMilestone.evidence || []).length + (detailMilestone.evidenceUrl ? 1 : 0)})
                  </h4>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setEvidenceModal(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-wine hover:underline"
                    >
                      <Plus size={12} /> Log Evidence
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {detailMilestone.evidenceUrl && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-border flex items-center justify-between text-xs">
                      <div>
                        <strong className="block text-ink font-semibold">Primary Proof Artifact</strong>
                        <span className="text-[11px] text-stone-500 font-mono line-clamp-1">{detailMilestone.evidenceUrl}</span>
                      </div>
                      <a href={detailMilestone.evidenceUrl} target="_blank" rel="noreferrer" className="button-secondary text-xs px-2.5 py-1">
                        View <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {(detailMilestone.evidence || []).map(ev => (
                    <div key={ev._id} className="p-3 bg-stone-50 rounded-xl border border-border flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                            {ev.type}
                          </span>
                          <strong className="text-ink font-semibold">{ev.title}</strong>
                        </div>
                        {ev.notes && <p className="text-[11px] text-stone-600 mt-1">{ev.notes}</p>}
                      </div>
                      {ev.url && (
                        <a href={ev.url} target="_blank" rel="noreferrer" className="button-secondary text-xs px-2.5 py-1">
                          View <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-Module Linked Records */}
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">
                  Associated System Records
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {detailMilestone.parentGoalId?.title && (
                    <div className="p-2.5 rounded-lg border border-border bg-stone-50">
                      <span className="text-[10px] font-mono text-stone-400 block">Parent Goal</span>
                      <strong className="text-ink line-clamp-1">{detailMilestone.parentGoalId.title}</strong>
                    </div>
                  )}

                  {detailMilestone.primaryDomain?.name && (
                    <div className="p-2.5 rounded-lg border border-border bg-stone-50">
                      <span className="text-[10px] font-mono text-stone-400 block">Technical Domain</span>
                      <strong className="text-ink line-clamp-1">
                        {detailMilestone.primaryDomain.name} {detailMilestone.subdomain ? `↳ ${detailMilestone.subdomain}` : ''}
                      </strong>
                    </div>
                  )}

                  {detailMilestone.relatedRoadmapId?.title && (
                    <div className="p-2.5 rounded-lg border border-border bg-stone-50 col-span-2">
                      <span className="text-[10px] font-mono text-stone-400 block">Connected Learning Roadmap</span>
                      <strong className="text-ink line-clamp-1">{detailMilestone.relatedRoadmapId.title}</strong>
                    </div>
                  )}
                </div>

                {/* Linked Skills Chips */}
                {(detailMilestone.relatedSkills || []).length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 block mb-1">Demonstrated Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {detailMilestone.relatedSkills.map(s => (
                        <span key={s._id} className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Internal Notes */}
              {detailMilestone.notes && (
                <div className="space-y-1 pt-3 border-t border-border">
                  <h4 className="text-xs font-mono uppercase font-bold text-stone-500 tracking-wider">Internal Notes</h4>
                  <p className="text-xs text-stone-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 leading-relaxed whitespace-pre-wrap">
                    {detailMilestone.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
              {canEdit ? (
                <>
                  <button
                    type="button"
                    className="button-primary text-xs"
                    onClick={() => handleQuickStatusToggle(detailMilestone)}
                  >
                    {detailMilestone.status === 'completed' ? 'Reopen Milestone' : 'Mark Completed'}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="button-secondary text-xs"
                      onClick={() => {
                        openEdit(detailMilestone);
                      }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className="button-secondary text-xs text-red-600"
                      onClick={() => setDeleteTarget(detailMilestone)}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full text-center py-1">
                  <span className="text-xs font-mono text-stone-400">Viewer mode · Read-only access</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATE / EDIT MULTI-TAB MODAL */}
      {modal && (
        <Modal
          title={editing ? 'Edit Engineering Milestone' : 'Create Engineering Milestone'}
          onClose={() => setModal(false)}
          maxWidth="max-w-3xl"
        >
        {isViewer && <ReadOnlyNotice featureName="Milestone Management" />}
        <form onSubmit={handleSave} className="space-y-5">
          <fieldset disabled={isViewer} className="space-y-5">
          {/* Tabs header inside modal */}
          <div className="flex border-b border-border text-xs font-semibold gap-1">
            <button
              type="button"
              className={`px-3 py-2 border-b-2 transition ${
                activeModalTab === 'overview' ? 'border-amber-800 text-amber-900 font-bold' : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
              onClick={() => setActiveModalTab('overview')}
            >
              Overview & Domain
            </button>
            <button
              type="button"
              className={`px-3 py-2 border-b-2 transition ${
                activeModalTab === 'subtasks' ? 'border-amber-800 text-amber-900 font-bold' : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
              onClick={() => setActiveModalTab('subtasks')}
            >
              Criteria & Subtasks ({form.subtasks.length + form.successCriteria.length})
            </button>
            <button
              type="button"
              className={`px-3 py-2 border-b-2 transition ${
                activeModalTab === 'dependencies' ? 'border-amber-800 text-amber-900 font-bold' : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
              onClick={() => setActiveModalTab('dependencies')}
            >
              Blockers & Roadmaps
            </button>
            <button
              type="button"
              className={`px-3 py-2 border-b-2 transition ${
                activeModalTab === 'connections' ? 'border-amber-800 text-amber-900 font-bold' : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
              onClick={() => setActiveModalTab('connections')}
            >
              Connected Entities
            </button>
            <button
              type="button"
              className={`px-3 py-2 border-b-2 transition ${
                activeModalTab === 'evidence' ? 'border-amber-800 text-amber-900 font-bold' : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
              onClick={() => setActiveModalTab('evidence')}
            >
              Evidence & Notes
            </button>
          </div>

          {/* TAB 1: OVERVIEW & DOMAIN */}
          {activeModalTab === 'overview' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  className="input-text w-full text-xs"
                  placeholder="e.g. Implement Raft Log Replication & Consensus State Machine"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Description & Objective</label>
                <textarea
                  rows={2}
                  className="input-text w-full text-xs"
                  placeholder="Summarize the core technical deliverable or career milestone..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Category</label>
                  <select
                    className="input-select w-full text-xs"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Career">Career</option>
                    <option value="Project">Project</option>
                    <option value="Learning">Learning</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Certification">Certification</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Priority</label>
                  <select
                    className="input-select w-full text-xs"
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Status</label>
                  <select
                    className="input-select w-full text-xs"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              {/* Parent Goal Selector with Auto-Inherit */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Parent Goal (Optional)</label>
                <select
                  className="input-select w-full text-xs"
                  value={form.parentGoalId}
                  onChange={e => handleGoalSelect(e.target.value)}
                >
                  <option value="">None (Standalone Milestone)</option>
                  {goals.map(g => (
                    <option key={g._id} value={g._id}>{g.title} ({g.progress || 0}%)</option>
                  ))}
                </select>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Selecting a parent goal will automatically inherit its domain and subdomain.
                </span>
              </div>

              {/* Central Domain & Subdomain Selector */}
              <div className="pt-2 border-t border-border">
                <DomainSelector
                  primaryDomainId={form.primaryDomain}
                  subdomainName={form.subdomain}
                  onChange={({ primaryDomainId, subdomainName, subdomainId }) => {
                    setForm(f => ({
                      ...f,
                      primaryDomain: primaryDomainId,
                      subdomain: subdomainName,
                      subdomainId: subdomainId || ''
                    }));
                  }}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Start Date</label>
                  <input
                    type="date"
                    className="input-text w-full text-xs"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Due Date / Target Date</label>
                  <input
                    type="date"
                    className="input-text w-full text-xs"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value, targetDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRITERIA & SUBTASKS */}
          {activeModalTab === 'subtasks' && (
            <div className="space-y-5 animate-fade-in">
              {/* Success Criteria */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-ink">Measurable Success Criteria</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-text flex-1 text-xs"
                    placeholder="e.g. Must handle 3 concurrent node crashes without log divergence"
                    value={newCriterion}
                    onChange={e => setNewCriterion(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCriterion(); } }}
                  />
                  <button type="button" className="button-secondary text-xs" onClick={addCriterion}>
                    Add
                  </button>
                </div>
                <div className="space-y-1.5 mt-2">
                  {form.successCriteria.map((sc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-stone-50 border border-border text-xs">
                      <span>• {sc}</span>
                      <button type="button" className="text-red-600 hover:text-red-800" onClick={() => removeCriterion(idx)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtasks */}
              <div className="space-y-2 pt-3 border-t border-border">
                <label className="block text-xs font-semibold text-ink">Subtasks Checklist</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-text flex-1 text-xs"
                    placeholder="Subtask deliverable..."
                    value={newSubtaskTitle}
                    onChange={e => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                  />
                  <input
                    type="number"
                    className="input-text w-20 text-xs"
                    placeholder="Minutes"
                    value={newSubtaskMinutes}
                    onChange={e => setNewSubtaskMinutes(e.target.value)}
                  />
                  <button type="button" className="button-secondary text-xs" onClick={addSubtask}>
                    Add Task
                  </button>
                </div>
                <div className="space-y-1.5 mt-2">
                  {form.subtasks.map((st, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-stone-50 border border-border text-xs">
                      <span>{idx + 1}. {st.title} (~{st.estimatedMinutes}m)</span>
                      <button type="button" className="text-red-600 hover:text-red-800" onClick={() => removeSubtask(idx)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BLOCKERS & ROADMAPS */}
          {activeModalTab === 'dependencies' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Milestone Dependencies (Must complete before this milestone)
                </label>
                <select
                  multiple
                  className="input-select w-full text-xs h-32"
                  value={form.dependsOn}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, o => o.value);
                    setForm({ ...form, dependsOn: selected });
                  }}
                >
                  {milestones
                    .filter(m => !editing || m._id !== editing._id)
                    .map(m => (
                      <option key={m._id} value={m._id}>
                        {m.title} ({m.status})
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Hold Ctrl/Cmd to select multiple dependencies. Circular dependencies are automatically prevented.
                </span>
              </div>

              {/* Roadmap & Phase Integration */}
              <div className="pt-3 border-t border-border space-y-3">
                <label className="block text-xs font-semibold text-ink">Associated Learning Roadmap</label>
                <select
                  className="input-select w-full text-xs"
                  value={form.relatedRoadmapId}
                  onChange={e => setForm({ ...form, relatedRoadmapId: e.target.value, relatedPhaseId: '', relatedStepId: '' })}
                >
                  <option value="">None (Independent Milestone)</option>
                  {roadmaps.map(r => (
                    <option key={r._id} value={r._id}>{r.title} ({r.progress || 0}%)</option>
                  ))}
                </select>

                {form.relatedRoadmapId && (
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Roadmap Phase</label>
                    <select
                      className="input-select w-full text-xs"
                      value={form.relatedPhaseId}
                      onChange={e => setForm({ ...form, relatedPhaseId: e.target.value })}
                    >
                      <option value="">Select Phase</option>
                      {(() => {
                        const selRoadmap = roadmaps.find(r => r._id === form.relatedRoadmapId);
                        const phases = selRoadmap?.phases || selRoadmap?.stages || [];
                        return phases.map((p, idx) => (
                          <option key={p._id || idx} value={p._id || idx}>Phase {idx + 1}: {p.title}</option>
                        ));
                      })()}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTED ENTITIES */}
          {activeModalTab === 'connections' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Demonstrated Skills</label>
                <select
                  multiple
                  className="input-select w-full text-xs h-28"
                  value={form.relatedSkills}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, o => o.value);
                    setForm({ ...form, relatedSkills: selected });
                  }}
                >
                  {skills.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.level || 'Intermediate'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Associated Practical Projects</label>
                <select
                  multiple
                  className="input-select w-full text-xs h-28"
                  value={form.relatedProjects}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, o => o.value);
                    setForm({ ...form, relatedProjects: selected });
                  }}
                >
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: EVIDENCE & NOTES */}
          {activeModalTab === 'evidence' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Primary Proof / Deliverable URL</label>
                <input
                  type="url"
                  className="input-text w-full text-xs"
                  placeholder="https://github.com/..."
                  value={form.evidenceUrl || ''}
                  onChange={e => setForm({ ...form, evidenceUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Internal Notes & Review Notes</label>
                <textarea
                  rows={4}
                  className="input-text w-full text-xs"
                  placeholder="Private architecture notes, lessons learned, or review feedback..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Visibility</label>
                <select
                  className="input-select w-full text-xs"
                  value={form.visibility}
                  onChange={e => setForm({ ...form, visibility: e.target.value })}
                >
                  <option value="public">Public (Showcase on Public Portfolio)</option>
                  <option value="private">Private (Workspace Only)</option>
                </select>
              </div>
            </div>
          )}
          </fieldset>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <button type="button" className="button-secondary text-xs" onClick={() => setModal(false)}>
              {isViewer ? 'Close' : 'Cancel'}
            </button>
            {!isViewer && (
              <button type="submit" className="button-primary text-xs" disabled={busy}>
                {busy ? 'Saving…' : editing ? 'Update Milestone' : 'Record Milestone'}
              </button>
            )}
          </div>
        </form>
      </Modal>
      )}

      {/* 7. QUICK EVIDENCE MODAL */}
      {evidenceModal && (
        <Modal
          title="Log Verified Deliverable / Evidence"
          onClose={() => setEvidenceModal(false)}
          maxWidth="max-w-md"
        >
          {isViewer && <ReadOnlyNotice featureName="Evidence Logging" />}
          <form onSubmit={handleAddEvidence} className="space-y-4">
            <fieldset disabled={isViewer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Evidence Title *</label>
              <input
                type="text"
                required
                className="input-text w-full text-xs"
                placeholder="e.g. Jepsen Partition Benchmark Test Suite"
                value={evidenceForm.title}
                onChange={e => setEvidenceForm({ ...evidenceForm, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Artifact / Repository URL</label>
              <input
                type="url"
                className="input-text w-full text-xs"
                placeholder="https://github.com/..."
                value={evidenceForm.url}
                onChange={e => setEvidenceForm({ ...evidenceForm, url: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Artifact Type</label>
              <select
                className="input-select w-full text-xs"
                value={evidenceForm.type}
                onChange={e => setEvidenceForm({ ...evidenceForm, type: e.target.value })}
              >
                <option value="repository">GitHub Repository</option>
                <option value="pull_request">Merged Pull Request</option>
                <option value="deployment">Live Deployment</option>
                <option value="test_results">Automated Test Results</option>
                <option value="benchmark">Performance Benchmark</option>
                <option value="certification">Official Certificate</option>
                <option value="document">Architecture Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Verification Notes</label>
              <textarea
                rows={2}
                className="input-text w-full text-xs"
                placeholder="What criteria or metric did this deliverable satisfy?"
                value={evidenceForm.notes}
                onChange={e => setEvidenceForm({ ...evidenceForm, notes: e.target.value })}
              />
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" className="button-secondary text-xs" onClick={() => setEvidenceModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" className="button-primary text-xs" disabled={busy}>
                  {busy ? 'Attaching…' : 'Log Evidence'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* 8. CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Milestone Record?"
          message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? All dependency links from other milestones will be safely unlinked.`}
          confirmText="Delete Milestone"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// Sub-component: Individual Milestone Card
function MilestoneCard({ milestone, onOpenDetail, onEdit, onQuickToggle, onArchive, onRestore, onDelete, renderBadge, canEdit = true }) {
  const m = milestone;
  const isCompleted = m.status === 'completed';

  return (
    <div className="panel-card flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="eyebrow">{m.category}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
              {m.priority}
            </span>
            {renderBadge(m)}
          </div>
        </div>

        <h3
          className="mt-2 text-base font-bold text-ink group-hover:text-amber-900 transition cursor-pointer font-serif line-clamp-2"
          onClick={onOpenDetail}
        >
          {m.title}
        </h3>

        {m.description && (
          <p className="mt-1 text-xs text-stone-600 line-clamp-2 leading-relaxed">{m.description}</p>
        )}

        {/* Domain & Goal chips */}
        <div className="mt-2.5 flex flex-wrap gap-1 text-[10px]">
          {m.parentGoalId?.title && (
            <span className="px-1.5 py-0.5 rounded bg-amber-50 font-medium text-amber-900 border border-amber-200 line-clamp-1 max-w-[180px]">
              ↳ {m.parentGoalId.title}
            </span>
          )}
          {m.primaryDomain && (
            <span className="px-1.5 py-0.5 rounded bg-stone-100 font-medium text-stone-700">
              {m.primaryDomain?.name || m.primaryDomain}
            </span>
          )}
          {m.subdomain && (
            <span className="px-1.5 py-0.5 rounded bg-stone-50 font-medium text-stone-600 border border-stone-200">
              {m.subdomain}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3.5 space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
            <span>Progress</span>
            <span className="font-bold text-stone-800">{m.progress || 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, m.progress || 0))}%` }}
            />
          </div>
        </div>

        {/* Dates and dependency tags */}
        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-stone-500">
          <span>Due: <strong>{m.dueDate || m.targetDate || 'None'}</strong></span>
          {(m.dependsOn || []).length > 0 && (
            <span className="text-[10px] text-amber-800 font-semibold flex items-center gap-0.5">
              <GitBranch size={10} /> {m.dependsOn.length} prereqs
            </span>
          )}
        </div>
      </div>

      {/* Bottom action buttons */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        {canEdit ? (
          <button
            type="button"
            onClick={onQuickToggle}
            className={`text-xs font-semibold px-2 py-0.5 rounded transition ${
              isCompleted ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {isCompleted ? 'Reopen' : 'Complete'}
          </button>
        ) : (
          <span className="text-[10px] font-mono text-stone-400">Read-Only</span>
        )}

        <div className="flex items-center gap-2">
          <button type="button" className="text-xs font-semibold text-wine hover:underline" onClick={onOpenDetail}>
            Inspect
          </button>
          {canEdit && (
            <>
              <button type="button" className="text-xs font-semibold text-stone-600 hover:text-stone-900" onClick={onEdit}>
                Edit
              </button>
              {m.isArchived ? (
                <button type="button" className="text-xs font-semibold text-emerald-700" onClick={onRestore}>
                  Restore
                </button>
              ) : (
                <button type="button" className="text-xs font-semibold text-amber-700" onClick={onArchive}>
                  Archive
                </button>
              )}
              <button type="button" className="text-xs font-semibold text-red-600" onClick={onDelete}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMilestones;
