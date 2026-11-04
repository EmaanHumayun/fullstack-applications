import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Archive,
  RefreshCw,
  Trash2,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  AlertTriangle,
  Target,
  ArrowUpRight,
  ExternalLink,
  BookOpen,
  Award,
  BarChart3,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ChevronDown,
  Layers,
  Star,
  Activity,
  History,
  TrendingUp,
  FolderGit2,
  X,
  RotateCcw
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { DomainSelector } from '../../components/DomainSelector.jsx';
import { ResourceModal } from '../../components/ResourceModal.jsx';
import { ResourceDetailModal } from '../../components/ResourceDetailModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

const DOMAINS_LIST = [
  'Programming Languages',
  'Frontend Engineering',
  'Backend Engineering',
  'Databases and Data Engineering',
  'Full-Stack Engineering',
  'Integrations and Automation',
  'AI and Machine Learning',
  'Cybersecurity',
  'Computer Networking and Systems',
  'Cloud, DevOps and Infrastructure',
  'Software Engineering Foundations',
  'Data, Analytics and BI',
  'Research and Technical Communication'
];

const PROFICIENCY_LEVELS = ['Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert'];
const LEARNING_STATUSES = ['Planned', 'Learning', 'Practising', 'Demonstrated', 'Needs revision', 'On hold'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const emptySkill = {
  name: '',
  category: 'Backend Engineering',
  subcategory: '',
  tags: '',
  skillType: 'Technical',
  level: 'Intermediate',
  targetProficiency: 'Advanced',
  confidenceRating: 7,
  status: 'Learning',
  proficiencyPercentage: 65,
  priority: 'Medium',
  description: '',
  publicDescription: '',
  nextAction: '',
  visibility: 'public',
  isFeatured: false,
  featuredOrder: 0,
  order: 0
};

export function AdminSkills() {
  const { isViewer } = useAuth();
  const [skills, setSkills] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [goals, setGoals] = useState([]);
  const [certs, setCerts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'table', 'by-domain', 'gaps', 'overview', 'portfolio'
  const [viewArchived, setViewArchived] = useState(false);
  const [sortBy, setSortBy] = useState('order'); // 'order', 'name', 'level', 'recent'

  // Modals & Drawers
  const [modal, setModal] = useState(false);
  const [detailSkill, setDetailSkill] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySkill);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [practiceModal, setPracticeModal] = useState(false);
  const [evidenceModal, setEvidenceModal] = useState(false);

  // Skill-Linked Resources State
  const [skillResources, setSkillResources] = useState([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState(null);
  const [detailResource, setDetailResource] = useState(null);
  const [resourceDeleteTarget, setResourceDeleteTarget] = useState(null);

  const loadSkillResources = useCallback(async (skillId) => {
    if (!skillId) return;
    try {
      const res = await api(`/resources?skillId=${skillId}`);
      setSkillResources(Array.isArray(res) ? res : []);
    } catch (e) {
      setSkillResources([]);
    }
  }, []);

  useEffect(() => {
    if (detailSkill?._id) {
      loadSkillResources(detailSkill._id);
    } else {
      setSkillResources([]);
    }
  }, [detailSkill, loadSkillResources]);

  // Sub-forms
  const [practiceForm, setPracticeForm] = useState({
    durationMinutes: 45,
    topic: '',
    learnings: '',
    challenges: '',
    evidenceUrl: '',
    nextAction: ''
  });
  const [evidenceForm, setEvidenceForm] = useState({
    title: '',
    url: '',
    description: ''
  });

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const load = useCallback(async () => {
    try {
      const url = viewArchived ? '/skills?archived=true' : '/skills?all=true';
      const [skillsData, analyticsData, projectsData, goalsData, certsData] = await Promise.all([
        api(url),
        api('/skills/analytics').catch(() => null),
        api('/projects?all=true').catch(() => []),
        api('/goals?all=true').catch(() => []),
        api('/certificates?all=true').catch(() => [])
      ]);
      setSkills(skillsData || []);
      setAnalytics(analyticsData);
      setProjects(projectsData || []);
      setGoals(goalsData || []);
      setCerts(certsData || []);
    } catch (err) {
      showToast(err.message);
    }
  }, [viewArchived]);

  useEffect(() => {
    load();
  }, [load]);

  // Dynamic Categories list
  const categories = useMemo(() => {
    const fromSkills = skills.map(s => s.category).filter(Boolean);
    return ['All', ...new Set([...DOMAINS_LIST, ...fromSkills])];
  }, [skills]);

  // Filtered skills
  const filtered = useMemo(() => {
    return skills.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.subcategory || '').toLowerCase().includes(q) ||
        (s.tags || []).some(t => t.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
      const matchesLvl = selectedLevel === 'All' || s.level === selectedLevel;
      const matchesSt = selectedStatus === 'All' || s.status === selectedStatus;

      return matchesSearch && matchesCat && matchesLvl && matchesSt;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'level') return (b.proficiencyPercentage || 0) - (a.proficiencyPercentage || 0);
      if (sortBy === 'recent') {
        const dateA = a.lastPractisedDate ? new Date(a.lastPractisedDate) : new Date(0);
        const dateB = b.lastPractisedDate ? new Date(b.lastPractisedDate) : new Date(0);
        return dateB - dateA;
      }
      return (a.order || 0) - (b.order || 0);
    });
  }, [skills, search, selectedCategory, selectedLevel, selectedStatus, sortBy]);

  const isFiltering = Boolean(
    search ||
    selectedCategory !== 'All' ||
    selectedLevel !== 'All' ||
    selectedStatus !== 'All' ||
    sortBy !== 'order'
  );

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSelectedStatus('All');
    setSortBy('order');
  };

  // Open Edit / Create
  function openCreate() {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    setEditing(null);
    setForm({
      ...emptySkill,
      category: selectedCategory !== 'All' ? selectedCategory : 'Backend Engineering'
    });
    setModal(true);
  }

  function openEdit(skill) {
    setEditing(skill);
    setForm({
      ...skill,
      tags: Array.isArray(skill.tags) ? skill.tags.join(', ') : skill.tags || ''
    });
    setModal(true);
  }

  // Quick inline status updater
  async function handleQuickUpdate(skill, field, value) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    try {
      const res = await api(`/skills/${skill._id}/quick-status`, {
        method: 'PATCH',
        body: jsonBody({ [field]: value })
      });
      showToast(`${skill.name} updated to ${value}`);
      setSkills(prev => prev.map(s => (s._id === skill._id ? res : s)));
      if (detailSkill && detailSkill._id === skill._id) setDetailSkill(res);
    } catch (err) {
      showToast(err.message);
    }
  }

  // Save skill
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
        proficiencyPercentage: Number(form.proficiencyPercentage) || 50,
        confidenceRating: Number(form.confidenceRating) || 7,
        order: Number(form.order) || 0,
        featuredOrder: Number(form.featuredOrder) || 0,
        tags: typeof form.tags === 'string'
          ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
          : form.tags
      };

      if (editing) {
        const updated = await api(`/skills/${editing._id}`, {
          method: 'PUT',
          body: jsonBody(payload)
        });
        showToast('Skill updated successfully');
        setSkills(prev => prev.map(s => (s._id === updated._id ? updated : s)));
        if (detailSkill && detailSkill._id === updated._id) setDetailSkill(updated);
      } else {
        const created = await api('/skills', {
          method: 'POST',
          body: jsonBody(payload)
        });
        showToast('Skill created successfully');
        setSkills(prev => [created, ...prev]);
      }
      setModal(false);
      load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Log Practice Session
  async function handleLogPractice(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    if (!detailSkill) return;
    setBusy(true);
    try {
      const res = await api(`/skills/${detailSkill._id}/practice`, {
        method: 'POST',
        body: jsonBody(practiceForm)
      });
      showToast('Practice session recorded');
      setDetailSkill(res.skill);
      setSkills(prev => prev.map(s => (s._id === res.skill._id ? res.skill : s)));
      setPracticeModal(false);
      setPracticeForm({
        durationMinutes: 45,
        topic: '',
        learnings: '',
        challenges: '',
        evidenceUrl: '',
        nextAction: ''
      });
      load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Add Practical Evidence
  async function handleAddEvidence(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    if (!detailSkill) return;
    setBusy(true);
    try {
      const res = await api(`/skills/${detailSkill._id}/evidence`, {
        method: 'POST',
        body: jsonBody(evidenceForm)
      });
      showToast('Practical evidence added');
      setDetailSkill(res.skill);
      setSkills(prev => prev.map(s => (s._id === res.skill._id ? res.skill : s)));
      setEvidenceModal(false);
      setEvidenceForm({ title: '', url: '', description: '' });
      load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Archive / Restore / Delete
  async function handleArchive(skill) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    try {
      await api(`/skills/${skill._id}/archive`, { method: 'PUT' });
      showToast(`Skill "${skill.name}" moved to archive`);
      await load();
      if (detailSkill && detailSkill._id === skill._id) setDetailSkill(null);
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleRestore(skill) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    try {
      await api(`/skills/${skill._id}/restore`, { method: 'PUT' });
      showToast(`Skill "${skill.name}" restored from archive`);
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
      await api(`/skills/${deleteTarget._id}`, { method: 'DELETE' });
      showToast('Skill permanently deleted');
      setSkills(prev => prev.filter(s => s._id !== deleteTarget._id));
      if (detailSkill && detailSkill._id === deleteTarget._id) setDetailSkill(null);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to delete skill');
    }
  }

  // Featured toggle for portfolio
  async function handleToggleFeatured(skill) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    try {
      const updated = await api(`/skills/${skill._id}`, {
        method: 'PUT',
        body: jsonBody({ isFeatured: !skill.isFeatured })
      });
      showToast(`${skill.name} ${!skill.isFeatured ? 'featured on portfolio' : 'unfeatured'}`);
      setSkills(prev => prev.map(s => (s._id === updated._id ? updated : s)));
    } catch (err) {
      showToast(err.message);
    }
  }

  // Link / Unlink Project to Detail Skill
  async function handleToggleProjectLink(projectId) {
    if (isViewer) {
      showToast('Action restricted: Viewers have read-only access.');
      return;
    }
    if (!detailSkill) return;
    const current = (detailSkill.relatedProjects || []).map(p => (typeof p === 'object' ? p._id : p));
    const next = current.includes(projectId)
      ? current.filter(id => id !== projectId)
      : [...current, projectId];

    try {
      const updated = await api(`/skills/${detailSkill._id}`, {
        method: 'PUT',
        body: jsonBody({ relatedProjects: next })
      });
      setDetailSkill(updated);
      setSkills(prev => prev.map(s => (s._id === updated._id ? updated : s)));
      showToast('Project linkage updated');
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div className="admin-page">
      <Toast message={toast} />

      {/* Page Header */}
      <div className="admin-page-top">
        <div>
          <p className="eyebrow">COMPETENCY INVENTORY & MASTERY</p>
          <h1 className="admin-title">Skills & <em>Technical Capabilities</em></h1>
          <p className="admin-subtitle">
            Centralized engineering competency tracker, practice log, skill-gap analysis, and public portfolio showcase manager.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            className="button-secondary"
            onClick={() => setViewArchived(!viewArchived)}
          >
            <Archive size={14} /> {viewArchived ? 'Active Skills' : `Archive (${skills.filter(s => s.isArchived).length || 0})`}
          </button>
          {!isViewer && (
            <button type="button" className="button-primary" onClick={openCreate}>
              <Plus size={16} /> Add Skill
            </button>
          )}
        </div>
      </div>

      {/* Data-Driven Summary Cards Strip */}
      {analytics && !viewArchived && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 my-6">
          <div
            onClick={() => { setSelectedStatus('All'); setSelectedCategory('All'); setViewMode('grid'); }}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Active Skills</span>
            <span className="text-xl font-bold font-display text-ink mt-1 block">{analytics.totalActive}</span>
            <span className="text-[10px] text-primary font-semibold">100% verified</span>
          </div>

          <div
            onClick={() => { setSelectedStatus('Learning'); setViewMode('grid'); }}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Learning</span>
            <span className="text-xl font-bold font-display text-amber-700 mt-1 block">{analytics.byStatus.Learning || 0}</span>
            <span className="text-[10px] text-muted">In progress</span>
          </div>

          <div
            onClick={() => { setSelectedStatus('Practising'); setViewMode('grid'); }}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Practising</span>
            <span className="text-xl font-bold font-display text-primary mt-1 block">{analytics.byStatus.Practising || 0}</span>
            <span className="text-[10px] text-muted">Active drills</span>
          </div>

          <div
            onClick={() => { setSelectedStatus('Demonstrated'); setViewMode('grid'); }}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Demonstrated</span>
            <span className="text-xl font-bold font-display text-emerald-700 mt-1 block">{analytics.byStatus.Demonstrated || 0}</span>
            <span className="text-[10px] text-muted">Production-proven</span>
          </div>

          <div
            onClick={() => { setSelectedStatus('Needs revision'); setViewMode('grid'); }}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Needs Revision</span>
            <span className="text-xl font-bold font-display text-rose-700 mt-1 block">{analytics.byStatus['Needs revision'] || 0}</span>
            <span className="text-[10px] text-muted">Refresh queue</span>
          </div>

          <div
            onClick={() => setViewMode('gaps')}
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Skill Gaps</span>
            <span className="text-xl font-bold font-display text-indigo-700 mt-1 block">{analytics.skillGapsCount || 0}</span>
            <span className="text-[10px] text-muted">vs Target Level</span>
          </div>

          <div
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Linked Goals</span>
            <span className="text-xl font-bold font-display text-primary mt-1 block">{analytics.linkedToGoalsCount || 0}</span>
            <span className="text-[10px] text-muted">Strategic priority</span>
          </div>

          <div
            className="p-3.5 rounded-xl border border-border bg-surface hover:border-primary transition cursor-pointer shadow-xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Avg Mastery</span>
            <span className="text-xl font-bold font-display text-ink mt-1 block">{analytics.averageProficiency}%</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Weighted</span>
          </div>
        </div>
      )}

      {/* Navigation View Modes & Filter Toolbar */}
      <div className="rounded-2xl bg-surface border border-border mb-6 shadow-xs overflow-hidden">
        {/* Tier 1: View Navigation Switcher & Results Summary */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 px-4 py-3 border-b border-border/70 bg-surface">
          {/* Segmented View Mode Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <TableIcon size={14} /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('by-domain')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'by-domain'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <Layers size={14} /> Domains ({analytics?.byCategory?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('gaps')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'gaps'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <Target size={14} /> Gap Analysis
            </button>
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'overview'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <BarChart3 size={14} /> Analytics & Graphs
            </button>
            <button
              type="button"
              onClick={() => setViewMode('portfolio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'portfolio'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <Star size={14} /> Portfolio Showcase
            </button>
          </div>

          {/* Quick Counter & Active Filters Indicator */}
          <div className="flex items-center justify-between lg:justify-end gap-3 text-xs text-muted shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
            <span className="font-mono text-[11px]">
              Showing <strong className="text-ink font-sans font-bold">{filtered.length}</strong> of {skills.length} skills
            </span>
            {isFiltering && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={11} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Dedicated Search & Filter Controls */}
        <div className="p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface/50">
          {/* Search Input with Clear Button */}
          <div className="relative flex-1 min-w-[220px] max-w-full md:max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills, tags, or gaps…"
              className="w-full pl-9 pr-8 py-2 text-xs border border-border bg-background text-text placeholder:text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 rounded-md transition cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Dropdown Filters Group */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Category / Domain Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto sm:max-w-[210px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition truncate cursor-pointer"
                title={selectedCategory}
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Domains' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Proficiency Level Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[120px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition cursor-pointer"
              >
                <option value="All">All Levels</option>
                {PROFICIENCY_LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[160px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition cursor-pointer"
              >
                <option value="recent">Recently Practised</option>
                <option value="order">Custom Order</option>
                <option value="name">Name (A-Z)</option>
                <option value="level">Proficiency %</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW: ANALYTICS & GRAPHS OVERVIEW */}
      {viewMode === 'overview' && analytics && (
        <div className="space-y-6 mb-8">
          {/* Domain Distribution & Proficiency Levels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
              <h3 className="font-display font-bold text-base text-ink mb-1 flex items-center gap-2">
                <Layers size={18} className="text-primary" /> Skills Distribution by Domain
              </h3>
              <p className="text-xs text-muted mb-4">Actual counts and average proficiency across configured domains.</p>
              <div className="space-y-3">
                {analytics.byCategory.map(cat => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-ink">{cat.category}</span>
                      <span className="text-muted">{cat.count} skills · {cat.averageProficiency}% avg</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary-background overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${cat.averageProficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-ink mb-1 flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" /> Proficiency Levels Breakdown
                </h3>
                <p className="text-xs text-muted mb-4">Mutually exclusive distribution across the 5 proficiency tiers.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PROFICIENCY_LEVELS.map(lvl => (
                    <div key={lvl} className="p-4 rounded-xl border border-border bg-background/50">
                      <span className="text-xs font-mono font-bold text-muted block">{lvl}</span>
                      <span className="text-2xl font-black font-display text-ink mt-1 block">
                        {analytics.byLevel[lvl] || 0}
                      </span>
                      <span className="text-[10px] text-muted">
                        {analytics.totalActive > 0 ? Math.round(((analytics.byLevel[lvl] || 0) / analytics.totalActive) * 100) : 0}% of total
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data-Driven Recommendations Alert Box */}
              {analytics.recommendations && analytics.recommendations.length > 0 && (
                <div className="mt-6 p-4 rounded-xl border border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
                  <h4 className="text-xs font-bold font-mono uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={15} /> System-Generated Skill Alerts ({analytics.recommendations.length})
                  </h4>
                  <ul className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 list-disc pl-4">
                    {analytics.recommendations.map((rec, i) => (
                      <li key={i}>{rec.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SKILL-GAP ANALYSIS */}
      {viewMode === 'gaps' && (
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-ink">Skill-Gap Analysis Matrix</h3>
              <p className="text-xs text-muted">Compare current demonstrated capability against target future proficiency.</p>
            </div>
            <span className="text-xs font-mono font-bold text-primary px-3 py-1 rounded-full bg-primary/10">
              {filtered.filter(s => s.level !== s.targetProficiency).length} Active Gaps Detected
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {filtered.map(s => {
              const hasGap = s.level !== s.targetProficiency;
              return (
                <div key={s._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-ink">{s.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary-background text-muted">
                        {s.category}
                      </span>
                      {hasGap ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Gap: {s.level} → {s.targetProficiency}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Target Reached
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {s.nextAction || 'Continue logging production practice sessions to reach target proficiency.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-ink block">{s.proficiencyPercentage}%</span>
                      <span className="text-[10px] font-mono text-muted block">Confidence: {s.confidenceRating || 7}/10</span>
                    </div>
                    <button
                      type="button"
                      className="button-secondary text-xs"
                      onClick={() => setDetailSkill(s)}
                    >
                      View Deep Dive
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: BY-DOMAIN HIERARCHICAL VIEW */}
      {viewMode === 'by-domain' && (
        <div className="space-y-6 mb-8">
          {DOMAINS_LIST.map(domain => {
            const domainSkills = filtered.filter(s => s.category === domain);
            if (domainSkills.length === 0) return null;

            return (
              <div key={domain} className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                      <Layers size={16} className="text-primary" /> {domain}
                    </h3>
                    <span className="text-xs text-muted">{domainSkills.length} active competencies registered</span>
                  </div>
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => {
                      setForm({ ...emptySkill, category: domain });
                      setEditing(null);
                      setModal(true);
                    }}
                  >
                    <Plus size={14} /> Add to {domain.split(' ')[0]}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {domainSkills.map(s => (
                    <div
                      key={s._id}
                      onClick={() => setDetailSkill(s)}
                      className="p-4 rounded-xl border border-border/70 bg-background/50 hover:border-primary transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-sm text-ink">{s.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-border font-bold text-primary">
                            {s.level}
                          </span>
                        </div>
                        <p className="text-xs text-muted line-clamp-2">{s.description || 'No description added.'}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted">
                        <span>{s.status}</span>
                        <span className="text-primary font-bold">{s.proficiencyPercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: PORTFOLIO SHOWCASE & FEATURED MANAGER */}
      {viewMode === 'portfolio' && (
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" /> Public Portfolio Skills Showcase
              </h3>
              <p className="text-xs text-muted">
                Control which skills appear on your public engineering portfolio page. Only public, approved skills are exposed.
              </p>
            </div>
            <a
              href="/#skills"
              target="_blank"
              rel="noreferrer"
              className="button-secondary text-xs inline-flex items-center gap-1.5"
            >
              Live Portfolio Preview <ExternalLink size={13} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <div
                key={s._id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  s.isFeatured
                    ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs'
                    : 'border-border bg-surface'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-primary">
                      {s.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(s)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition flex items-center gap-1 ${
                        s.isFeatured
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-secondary-background text-muted hover:text-ink'
                      }`}
                    >
                      <Star size={11} className={s.isFeatured ? 'fill-current' : ''} />
                      {s.isFeatured ? 'Featured' : 'Feature'}
                    </button>
                  </div>
                  <h4 className="font-display font-bold text-base text-ink mb-1.5">{s.name}</h4>
                  <p className="text-xs text-muted leading-relaxed mb-3">
                    {s.publicDescription || s.description || 'Verified engineering capability documented in public workspace.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold text-ink">
                    Level: <span className="text-primary">{s.level}</span> ({s.proficiencyPercentage}%)
                  </span>
                  {!isViewer && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="text-primary font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        Edit <Pencil size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(s)}
                        className="text-rose-600 hover:text-rose-700 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                        title="Delete Skill"
                      >
                        Delete <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: COMPACT TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="panel-card overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary-background/60 font-mono text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3.5 pl-5">Skill Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Level</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Proficiency</th>
                  <th className="p-3.5">Last Practised</th>
                  <th className="p-3.5">Related</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map(s => (
                  <tr key={s._id} className="hover:bg-hover-surface/50 transition">
                    <td className="p-3.5 pl-5 font-bold text-ink">
                      <div className="flex items-center gap-2">
                        {s.name}
                        {s.isFeatured && <Star size={12} className="text-amber-500 fill-amber-500" />}
                      </div>
                    </td>
                    <td className="p-3.5 text-muted font-mono text-[11px]">{s.category}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface border border-border text-primary">
                        {s.level}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={s.status}
                        onChange={e => handleQuickUpdate(s, 'status', e.target.value)}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-bold text-ink"
                      >
                        {LEARNING_STATUSES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-secondary-background overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${s.proficiencyPercentage || 0}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-ink">{s.proficiencyPercentage}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-muted font-mono text-[11px]">
                      {s.lastPractisedDate ? new Date(s.lastPractisedDate).toLocaleDateString() : 'Never logged'}
                    </td>
                    <td className="p-3.5 text-muted text-[11px]">
                      {s.relatedProjects?.length || 0} Projects · {s.relatedGoals?.length || 0} Goals
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="button-ghost text-xs py-1 px-2"
                          onClick={() => setDetailSkill(s)}
                          title="Open Skill Deep Dive"
                        >
                          Deep Dive
                        </button>
                        {!isViewer && (
                          <>
                            <button
                              type="button"
                              className="button-ghost text-xs p-1.5"
                              onClick={() => openEdit(s)}
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              className="button-ghost text-xs p-1.5 text-amber-700"
                              onClick={() => (s.isArchived ? handleRestore(s) : handleArchive(s))}
                              title={s.isArchived ? 'Restore' : 'Archive'}
                            >
                              <Archive size={13} />
                            </button>
                            <button
                              type="button"
                              className="button-ghost text-xs p-1.5 text-rose-600 hover:text-rose-700"
                              onClick={() => setDeleteTarget(s)}
                              title="Delete Skill"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: ALL SKILLS CARDS GRID (DEFAULT) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {filtered.map(skill => (
            <div
              key={skill._id}
              className="p-5 rounded-2xl border border-border bg-surface shadow-xs hover:border-primary transition flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted">
                    {skill.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {skill.isFeatured && <Star size={13} className="text-amber-500 fill-amber-500" />}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface border border-border text-primary">
                      {skill.level}
                    </span>
                  </div>
                </div>

                <h3
                  onClick={() => setDetailSkill(skill)}
                  className="font-display font-bold text-base text-ink mb-1 cursor-pointer hover:text-primary transition"
                >
                  {skill.name}
                </h3>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-4">
                  {skill.description || 'Technical skill verified in active production projects.'}
                </p>

                {/* Tags */}
                {skill.tags && skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {skill.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary-background text-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Bottom Progress & Action Row */}
              <div>
                <div className="space-y-1.5 pt-3 border-t border-border/70 mb-4">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted">Mastery</span>
                    <span className="font-bold text-ink">{skill.proficiencyPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary-background overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${skill.proficiencyPercentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  {/* Inline quick status selector */}
                  <select
                    value={skill.status}
                    onChange={e => handleQuickUpdate(skill, 'status', e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-bold text-ink"
                  >
                    {LEARNING_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="button-secondary text-xs py-1 px-2.5"
                      onClick={() => setDetailSkill(skill)}
                    >
                      Deep Dive
                    </button>
                    {!isViewer && (
                      <>
                        <button
                          type="button"
                          className="button-ghost text-xs p-1.5"
                          onClick={() => openEdit(skill)}
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          className="button-ghost text-xs p-1.5 text-rose-600 hover:text-rose-700"
                          onClick={() => setDeleteTarget(skill)}
                          title="Delete Skill"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <EmptyState
          title="No skills found"
          description={viewArchived ? 'No archived skills found.' : 'Try adjusting your search query or filters, or add a new skill.'}
        />
      )}

      {/* DETAIL MODAL / DRAWER */}
      {detailSkill && (
        <Modal title={`Skill: ${detailSkill.name}`} onClose={() => setDetailSkill(null)}>
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-primary uppercase">{detailSkill.category}</span>
                  <span className="text-muted/40">·</span>
                  <span className="text-xs font-mono text-muted">{detailSkill.subcategory || 'Core'}</span>
                </div>
                <h2 className="font-display font-black text-xl text-ink">{detailSkill.name}</h2>
                <p className="text-xs text-muted mt-1">{detailSkill.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary text-primary-text">
                  {detailSkill.level} ({detailSkill.proficiencyPercentage}%)
                </span>
                {!isViewer && (
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => {
                      openEdit(detailSkill);
                      setDetailSkill(null);
                    }}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Target level, Confidence, Next Action */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <span className="font-mono text-[10px] uppercase text-muted block">Target Proficiency</span>
                <span className="font-bold text-sm text-ink mt-0.5 block">{detailSkill.targetProficiency || 'Advanced'}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <span className="font-mono text-[10px] uppercase text-muted block">Self Confidence</span>
                <span className="font-bold text-sm text-primary mt-0.5 block">{detailSkill.confidenceRating || 7} / 10</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <span className="font-mono text-[10px] uppercase text-muted block">Last Practised</span>
                <span className="font-bold text-sm text-ink mt-0.5 block">
                  {detailSkill.lastPractisedDate ? new Date(detailSkill.lastPractisedDate).toLocaleDateString() : 'None logged'}
                </span>
              </div>
            </div>

            {/* Next Recommended Action */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
              <span className="text-[10px] font-mono font-bold uppercase text-primary block mb-1">Recommended Next Action</span>
              <p className="text-xs text-ink font-medium leading-relaxed">
                {detailSkill.nextAction || 'Schedule a targeted hands-on drill or link a production repository as evidence.'}
              </p>
            </div>

            {/* Practical Evidence & Practice History Buttons */}
            {!isViewer && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="button-primary text-xs"
                    onClick={() => setPracticeModal(true)}
                  >
                    <Clock size={13} /> Log Practice Session
                  </button>
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => setEvidenceModal(true)}
                  >
                    <FileCheck size={13} /> Add Evidence
                  </button>
                </div>

                <button
                  type="button"
                  className="button-ghost text-xs text-rose-700"
                  onClick={() => setDeleteTarget(detailSkill)}
                >
                  <Trash2 size={13} /> Delete Skill
                </button>
              </div>
            )}

            {/* Evidence List */}
            <div>
              <h4 className="font-display font-bold text-sm text-ink mb-2 flex items-center gap-1.5">
                <FileCheck size={15} className="text-primary" /> Practical Evidence ({detailSkill.practicalEvidence?.length || 0})
              </h4>
              {detailSkill.practicalEvidence && detailSkill.practicalEvidence.length > 0 ? (
                <div className="space-y-2">
                  {detailSkill.practicalEvidence.map((ev, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border bg-background/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-ink block">{ev.title}</span>
                        <span className="text-muted block text-[11px]">{ev.description}</span>
                      </div>
                      {ev.url && (
                        <a href={ev.url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1">
                          Link <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted italic">No practical evidence attached yet.</p>
              )}
            </div>

            {/* Practice History List */}
            <div>
              <h4 className="font-display font-bold text-sm text-ink mb-2 flex items-center gap-1.5">
                <History size={15} className="text-primary" /> Practice History ({detailSkill.practiceHistory?.length || 0} Sessions)
              </h4>
              {detailSkill.practiceHistory && detailSkill.practiceHistory.length > 0 ? (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {detailSkill.practiceHistory.map((sess, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border bg-surface text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-ink">{sess.topic || 'General Practice Drill'}</span>
                        <span className="text-muted">{sess.durationMinutes}m · {new Date(sess.date).toLocaleDateString()}</span>
                      </div>
                      {sess.learnings && <p className="text-muted text-[11px]">Learned: {sess.learnings}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted italic">No practice drills recorded yet.</p>
              )}
            </div>

            {/* Related Projects Linker */}
            <div>
              <h4 className="font-display font-bold text-sm text-ink mb-2 flex items-center gap-1.5">
                <FolderGit2 size={15} className="text-primary" /> Linked Projects
              </h4>
              <div className="flex flex-wrap gap-2">
                {projects.map(p => {
                  const isLinked = (detailSkill.relatedProjects || []).some(rp => (typeof rp === 'object' ? rp._id === p._id : rp === p._id));
                  return (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => handleToggleProjectLink(p._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isLinked
                          ? 'bg-primary text-primary-text'
                          : 'border border-border bg-background text-muted hover:text-ink'
                      }`}
                    >
                      {isLinked && <CheckCircle2 size={13} />} {p.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Related Technical Resources & References */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
                  <BookOpen size={15} className="text-primary" /> Related Learning Resources ({skillResources.length})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setResourceToEdit(null);
                    setResourceModalOpen(true);
                  }}
                  className="button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} /> Add Resource
                </button>
              </div>

              {skillResources.length > 0 ? (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {skillResources.map(r => (
                    <div
                      key={r._id}
                      className="p-3 rounded-xl border border-border bg-background/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-primary uppercase">{r.type}</span>
                          <span className="text-[10px] font-mono text-muted">• {r.status}</span>
                        </div>
                        <span
                          onClick={() => setDetailResource(r)}
                          className="font-bold text-ink cursor-pointer hover:text-primary transition block"
                        >
                          {r.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-muted hover:text-ink rounded"
                          title="Open external link"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api(`/resources/${r._id}/unlink`, {
                                method: 'PATCH',
                                body: jsonBody({ targetType: 'skill', targetId: detailSkill._id })
                              });
                              showToast('Resource unlinked from skill.');
                              loadSkillResources(detailSkill._id);
                            } catch (err) {
                              showToast(err.message || 'Unlink failed');
                            }
                          }}
                          className="p-1 text-muted hover:text-rose-600 rounded cursor-pointer"
                          title="Unlink from this skill"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted italic">No documentation or learning resources linked to this skill yet.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* CANONICAL RESOURCE MODAL PREFILLED WITH SKILL */}
      <ResourceModal
        isOpen={resourceModalOpen}
        onClose={() => {
          setResourceModalOpen(false);
          setResourceToEdit(null);
        }}
        resourceToEdit={resourceToEdit}
        initialContext={{
          skillId: detailSkill?._id,
          primaryDomain: detailSkill?.primaryDomain,
          domainName: detailSkill?.category
        }}
        onSaved={() => {
          if (detailSkill?._id) loadSkillResources(detailSkill._id);
          showToast('Resource saved successfully.');
        }}
      />

      <ResourceDetailModal
        isOpen={!!detailResource}
        onClose={() => setDetailResource(null)}
        resource={detailResource}
        onEdit={(r) => {
          setDetailResource(null);
          setResourceToEdit(r);
          setResourceModalOpen(true);
        }}
        onDelete={(r) => {
          setResourceDeleteTarget(r);
        }}
      />

      <ConfirmModal
        isOpen={!!resourceDeleteTarget}
        title="Delete Learning Resource"
        message={`Are you sure you want to permanently delete "${resourceDeleteTarget?.title}"?`}
        confirmText="Delete Resource"
        onConfirm={async () => {
          if (!resourceDeleteTarget) return;
          try {
            await api(`/resources/${resourceDeleteTarget._id}`, { method: 'DELETE' });
            showToast(`Resource "${resourceDeleteTarget.title}" deleted.`);
            setResourceDeleteTarget(null);
            if (detailSkill?._id) loadSkillResources(detailSkill._id);
          } catch (e) {
            showToast(e.message || 'Failed to delete resource.');
          }
        }}
        onCancel={() => setResourceDeleteTarget(null)}
        danger
      />

      {/* LOG PRACTICE SESSION MODAL */}
      {practiceModal && detailSkill && (
        <Modal title={`Log Practice: ${detailSkill.name}`} onClose={() => setPracticeModal(false)}>
          {isViewer && <ReadOnlyNotice feature="Practice Drills" />}
          <form onSubmit={handleLogPractice} className="space-y-4">
            <fieldset disabled={isViewer} className="contents">
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="480"
                value={practiceForm.durationMinutes}
                onChange={e => setPracticeForm({ ...practiceForm, durationMinutes: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Topic / Activity</label>
              <input
                type="text"
                placeholder="e.g. Async event loop debugging under load"
                value={practiceForm.topic}
                onChange={e => setPracticeForm({ ...practiceForm, topic: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">What Was Learned</label>
              <textarea
                rows="2"
                placeholder="Key takeaways, discoveries, or patterns mastered…"
                value={practiceForm.learnings}
                onChange={e => setPracticeForm({ ...practiceForm, learnings: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Next Practice Action</label>
              <input
                type="text"
                placeholder="e.g. Write integration test suite for websocket reconnects"
                value={practiceForm.nextAction}
                onChange={e => setPracticeForm({ ...practiceForm, nextAction: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="button-secondary text-xs" onClick={() => setPracticeModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  Save Practice Session
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* ADD EVIDENCE MODAL */}
      {evidenceModal && detailSkill && (
        <Modal title={`Add Practical Evidence: ${detailSkill.name}`} onClose={() => setEvidenceModal(false)}>
          {isViewer && <ReadOnlyNotice feature="Practical Evidence" />}
          <form onSubmit={handleAddEvidence} className="space-y-4">
            <fieldset disabled={isViewer} className="contents">
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Evidence Title</label>
              <input
                type="text"
                placeholder="e.g. Production Distributed Rate Limiter Implementation"
                value={evidenceForm.title}
                onChange={e => setEvidenceForm({ ...evidenceForm, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Evidence URL / Repo</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={evidenceForm.url}
                onChange={e => setEvidenceForm({ ...evidenceForm, url: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Description / Proof</label>
              <textarea
                rows="3"
                placeholder="Describe how this evidence demonstrates verifiable competency…"
                value={evidenceForm.description}
                onChange={e => setEvidenceForm({ ...evidenceForm, description: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="button-secondary text-xs" onClick={() => setEvidenceModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  Save Evidence
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* CREATE / EDIT SKILL MODAL */}
      {modal && (
        <Modal title={editing ? `Edit Skill: ${editing.name}` : 'Add New Skill'} onClose={() => setModal(false)}>
          {isViewer && <ReadOnlyNotice feature="Skills" />}
          <form onSubmit={handleSave} className="space-y-4">
            <fieldset disabled={isViewer} className="contents">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Skill Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Distributed System Design"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <DomainSelector
                  primaryDomainId={form.primaryDomain || form.category}
                  subdomainName={form.subdomain || form.subcategory}
                  secondaryDomainIds={form.secondaryDomains || []}
                  showSecondary={true}
                  onChange={({ primaryDomainId, primaryDomainName, subdomainName, subdomainId, secondaryDomainIds }) => {
                    setForm(f => ({
                      ...f,
                      primaryDomain: primaryDomainId,
                      category: primaryDomainName,
                      subdomain: subdomainName,
                      subdomainId,
                      subcategory: subdomainName,
                      secondaryDomains: secondaryDomainIds
                    }));
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Current Level</label>
                <select
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                >
                  {PROFICIENCY_LEVELS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Target Level</label>
                <select
                  value={form.targetProficiency}
                  onChange={e => setForm({ ...form, targetProficiency: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                >
                  {PROFICIENCY_LEVELS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Learning Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                >
                  {LEARNING_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Mastery % (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.proficiencyPercentage}
                  onChange={e => setForm({ ...form, proficiencyPercentage: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Confidence (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.confidenceRating}
                  onChange={e => setForm({ ...form, confidenceRating: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink font-mono"
                />
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

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Technical Description</label>
              <textarea
                rows="2"
                placeholder="Overview of capabilities and technical scope…"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Public Portfolio Description</label>
              <textarea
                rows="2"
                placeholder="Polished description displayed on public portfolio showcase…"
                value={form.publicDescription}
                onChange={e => setForm({ ...form, publicDescription: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="python, backend, distributed"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Next Recommended Action</label>
                <input
                  type="text"
                  placeholder="e.g. Implement distributed caching benchmark"
                  value={form.nextAction}
                  onChange={e => setForm({ ...form, nextAction: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-border"
                />
                Feature on Public Portfolio
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.visibility === 'public'}
                  onChange={e => setForm({ ...form, visibility: e.target.checked ? 'public' : 'private' })}
                  className="rounded border-border"
                />
                Public Visibility
              </label>
            </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" className="button-secondary text-xs" onClick={() => setModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  {editing ? 'Update Skill' : 'Create Skill'}
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
          title="Delete Skill"
          message={`Are you sure you want to permanently delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmText="Delete Skill"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminSkills;
