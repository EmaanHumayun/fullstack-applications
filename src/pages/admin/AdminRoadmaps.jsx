import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Archive,
  Trash2,
  Workflow,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Copy,
  ExternalLink,
  Target,
  Clock,
  Code2,
  FolderOpen,
  FileBadge,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Lock,
  AlertCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  Eye,
  Shield,
  HelpCircle
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { MultiDomainSubdomainSelector } from '../../components/MultiDomainSubdomainSelector.jsx';
import { ResourceModal } from '../../components/ResourceModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

const emptyPhase = {
  id: '',
  title: 'Phase 1: Foundations',
  description: '',
  order: 1,
  steps: [
    {
      id: '',
      title: 'Core concepts & architecture blueprint',
      description: '',
      acceptanceCriteria: ['Read architecture documentation', 'Implement working prototype'],
      prerequisites: [],
      estimatedEffort: '4h',
      priority: 'Medium',
      weight: 1,
      status: 'available',
      completed: false,
      linkedSkills: [],
      linkedProjects: [],
      linkedResources: [],
      linkedGoals: [],
      completionEvidence: [],
      reflectionNotes: ''
    }
  ]
};

const emptyRoadmap = {
  title: '',
  slug: '',
  description: '',
  purpose: '',
  learningOutcomes: ['Design production-ready systems', 'Validate architecture with automated tests'],
  category: 'Backend Engineering',
  difficulty: 'Intermediate',
  status: 'in_progress',
  estimatedDuration: '6 weeks',
  targetDate: '',
  prerequisites: [],
  coverImage: '',
  visibility: 'public',
  published: true,
  primaryDomain: '',
  subdomain: '',
  subdomainId: '',
  secondaryDomains: [],
  domainAssociations: [],
  phases: [emptyPhase],
  linkedSkills: [],
  linkedGoals: [],
  linkedMilestones: [],
  relatedProjects: [],
  linkedCertifications: [],
  linkedResources: [],
  notes: ''
};

export function AdminRoadmaps() {
  const { isViewer, canEdit } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedSubdomain, setSelectedSubdomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Related entity lookup caches
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableGoals, setAvailableGoals] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableCerts, setAvailableCerts] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);

  // Modals & Active state
  const [modal, setModal] = useState(false);
  const [modalTab, setModalTab] = useState('overview'); // overview, outcomes, phases, relationships, notes
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyRoadmap);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailRoadmap, setDetailRoadmap] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  // Roadmap-Linked Resource Creation Modal
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceModalInitial, setResourceModalInitial] = useState({});

  // Contextual modals
  const [createGoalModal, setCreateGoalModal] = useState(null); // roadmap target
  const [goalForm, setGoalForm] = useState({ title: '', timeHorizon: 'Strategic Goal', priority: 'High', targetDate: '' });

  const [createMilestoneModal, setCreateMilestoneModal] = useState(null); // { roadmap, phaseId, stepId }
  const [milestoneForm, setMilestoneForm] = useState({ title: '', targetDate: '', description: '', category: 'Learning' });

  const [linkGoalModal, setLinkGoalModal] = useState(null);
  const [selectedGoalToLink, setSelectedGoalToLink] = useState('');

  const [evidenceModal, setEvidenceModal] = useState(null); // { roadmapId, phaseId, stepId }
  const [evidenceForm, setEvidenceForm] = useState({ title: '', url: '', notes: '' });

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Load all master lookup data
  useEffect(() => {
    Promise.all([
      api('/domains?all=true').catch(() => []),
      api('/skills?all=true').catch(() => []),
      api('/goals?all=true').catch(() => []),
      api('/projects?all=true').catch(() => []),
      api('/certificates?all=true').catch(() => []),
      api('/resources?all=true').catch(() => [])
    ]).then(([doms, sk, gl, pr, cr, res]) => {
      setAvailableDomains(Array.isArray(doms) ? doms : []);
      setAvailableSkills(Array.isArray(sk) ? sk : []);
      setAvailableGoals(Array.isArray(gl) ? gl : []);
      setAvailableProjects(Array.isArray(pr) ? pr : []);
      setAvailableCerts(Array.isArray(cr) ? cr : []);
      setAvailableResources(Array.isArray(res) ? res : []);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = viewArchived ? '/roadmaps?archived=true' : '/roadmaps?all=true';
      const data = await api(url);
      setRoadmaps(Array.isArray(data) ? data : []);
      // If inspecting a roadmap in detail view, refresh it
      if (detailRoadmap) {
        const refreshed = data.find(r => r._id === detailRoadmap._id);
        if (refreshed) setDetailRoadmap(refreshed);
      }
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [viewArchived, detailRoadmap?._id]);

  useEffect(() => {
    load();
  }, [viewArchived]);

  // Step Toggle Handler with Dependency Checks
  async function handleToggleStep(roadmapId, phaseId, stepId, currentVal) {
    if (isViewer) {
      showToast('Viewers have read-only access. Step progression cannot be toggled.');
      return;
    }
    try {
      const res = await api(`/roadmaps/${roadmapId}/toggle-step`, {
        method: 'PUT',
        body: jsonBody({ phaseId, stepId, completed: !currentVal })
      });

      // Update state locally
      setRoadmaps(prev =>
        prev.map(r => {
          if (r._id !== roadmapId) return r;
          const phases = (r.phases || r.stages || []).map(ph => {
            if (String(ph.id) !== String(phaseId) && String(ph._id) !== String(phaseId)) return ph;
            const updatedSteps = (ph.steps || []).map(st => {
              if (String(st.id) !== String(stepId) && String(st._id) !== String(stepId)) return st;
              return { ...st, completed: !currentVal, status: !currentVal ? 'completed' : 'available' };
            });
            return { ...ph, steps: updatedSteps };
          });
          return { ...r, progress: res.progress, phases, stages: phases };
        })
      );

      if (detailRoadmap && detailRoadmap._id === roadmapId) {
        setDetailRoadmap(prev => {
          const phases = (prev.phases || prev.stages || []).map(ph => {
            if (String(ph.id) !== String(phaseId) && String(ph._id) !== String(phaseId)) return ph;
            const updatedSteps = (ph.steps || []).map(st => {
              if (String(st.id) !== String(stepId) && String(st._id) !== String(stepId)) return st;
              return { ...st, completed: !currentVal, status: !currentVal ? 'completed' : 'available' };
            });
            return { ...ph, steps: updatedSteps };
          });
          return { ...prev, progress: res.progress, phases, stages: phases };
        });
      }

      showToast(!currentVal ? 'Step completed! 🎉' : 'Step marked incomplete');
    } catch (err) {
      showToast(err.message);
    }
  }

  // Duplicate Roadmap
  async function handleDuplicate(r) {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    try {
      setBusy(true);
      const cloned = await api(`/roadmaps/${r._id}/duplicate`, { method: 'POST' });
      showToast(`Roadmap duplicated as "${cloned.title}"`);
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Archive & Restore
  async function handleArchive(r) {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    try {
      await api(`/roadmaps/${r._id}/archive`, { method: 'PUT' });
      showToast(`Roadmap "${r.title}" archived`);
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleRestore(r) {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    try {
      await api(`/roadmaps/${r._id}/restore`, { method: 'PUT' });
      showToast(`Roadmap "${r.title}" restored`);
      await load();
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
      await api(`/roadmaps/${deleteTarget._id}`, { method: 'DELETE' });
      showToast('Roadmap permanently deleted');
      setRoadmaps(prev => prev.filter(r => r._id !== deleteTarget._id));
      if (detailRoadmap && detailRoadmap._id === deleteTarget._id) {
        setDetailRoadmap(null);
      }
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to delete roadmap');
    }
  }

  // Open Create
  function openCreate() {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    setEditing(null);
    setForm(emptyRoadmap);
    setModalTab('overview');
    setModal(true);
  }

  // Open Edit
  function openEdit(r) {
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    setEditing(r);
    const phases = (r.phases && r.phases.length > 0)
      ? r.phases
      : (r.stages && r.stages.length > 0)
        ? r.stages
        : [emptyPhase];

    const associations = (r.domainAssociations && r.domainAssociations.length > 0)
      ? r.domainAssociations.map(da => ({
          domainId: da.domainId?._id || da.domainId || '',
          subdomainIds: (da.subdomainIds || []).map(s => s?._id || s)
        }))
      : (r.primaryDomain ? [{
          domainId: r.primaryDomain?._id || r.primaryDomain,
          subdomainIds: (r.subdomainId ? [r.subdomainId] : [])
        }] : []);

    setForm({
      ...emptyRoadmap,
      ...r,
      primaryDomain: r.primaryDomain?._id || r.primaryDomain || '',
      subdomainId: r.subdomainId || '',
      domainAssociations: associations,
      phases: phases.map(ph => ({
        ...ph,
        id: ph.id || ph._id || Math.random().toString(36).substring(2, 9),
        steps: (ph.steps || []).map(st => ({
          ...st,
          id: st.id || st._id || Math.random().toString(36).substring(2, 9),
          acceptanceCriteria: Array.isArray(st.acceptanceCriteria) ? st.acceptanceCriteria : [],
          prerequisites: Array.isArray(st.prerequisites) ? st.prerequisites : [],
          linkedSkills: (st.linkedSkills || []).map(s => s._id || s),
          linkedProjects: (st.linkedProjects || []).map(p => p._id || p),
          linkedResources: (st.linkedResources || []).map(res => res._id || res),
          linkedGoals: (st.linkedGoals || []).map(g => g._id || g),
          completionEvidence: Array.isArray(st.completionEvidence) ? st.completionEvidence : []
        }))
      })),
      linkedSkills: (r.linkedSkills || []).map(s => s._id || s),
      linkedGoals: (r.linkedGoals || []).map(g => g._id || g),
      linkedMilestones: (r.linkedMilestones || []).map(m => m._id || m),
      relatedProjects: (r.relatedProjects || []).map(p => p._id || p),
      linkedCertifications: (r.linkedCertifications || []).map(c => c._id || c),
      linkedResources: (r.linkedResources || []).map(res => res._id || res)
    });
    setModalTab('overview');
    setModal(true);
  }

  // Save Roadmap
  async function handleSave(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access. Roadmap cannot be saved.');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await api(`/roadmaps/${editing._id}`, { method: 'PUT', body: jsonBody(form) });
        showToast('Roadmap updated successfully');
      } else {
        await api('/roadmaps', { method: 'POST', body: jsonBody(form) });
        showToast('Roadmap created successfully');
      }
      setModal(false);
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Phase & Step Mutation Helpers
  function addPhase() {
    setForm(f => {
      const nextNum = (f.phases || []).length + 1;
      const newPh = {
        id: Math.random().toString(36).substring(2, 9),
        title: `Phase ${nextNum}: New Milestone`,
        description: '',
        order: nextNum,
        steps: [
          {
            id: Math.random().toString(36).substring(2, 9),
            title: 'Actionable step title',
            description: '',
            acceptanceCriteria: [],
            prerequisites: [],
            estimatedEffort: '2h',
            priority: 'Medium',
            weight: 1,
            status: 'available',
            completed: false,
            linkedSkills: [],
            linkedProjects: [],
            linkedResources: [],
            linkedGoals: [],
            completionEvidence: [],
            reflectionNotes: ''
          }
        ]
      };
      return { ...f, phases: [...(f.phases || []), newPh] };
    });
  }

  function removePhase(idx) {
    setForm(f => {
      const copy = [...f.phases];
      copy.splice(idx, 1);
      return { ...f, phases: copy };
    });
  }

  function movePhase(idx, dir) {
    setForm(f => {
      const copy = [...f.phases];
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= copy.length) return f;
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      copy.forEach((ph, i) => { ph.order = i + 1; });
      return { ...f, phases: copy };
    });
  }

  function addStep(phaseIdx) {
    setForm(f => {
      const copy = [...f.phases];
      copy[phaseIdx].steps.push({
        id: Math.random().toString(36).substring(2, 9),
        title: 'New learning step',
        description: '',
        acceptanceCriteria: [],
        prerequisites: [],
        estimatedEffort: '2h',
        priority: 'Medium',
        weight: 1,
        status: 'available',
        completed: false,
        linkedSkills: [],
        linkedProjects: [],
        linkedResources: [],
        linkedGoals: [],
        completionEvidence: [],
        reflectionNotes: ''
      });
      return { ...f, phases: copy };
    });
  }

  function removeStep(phaseIdx, stepIdx) {
    setForm(f => {
      const copy = [...f.phases];
      copy[phaseIdx].steps.splice(stepIdx, 1);
      return { ...f, phases: copy };
    });
  }

  function moveStep(phaseIdx, stepIdx, dir) {
    setForm(f => {
      const copy = [...f.phases];
      const steps = copy[phaseIdx].steps;
      const targetIdx = stepIdx + dir;
      if (targetIdx < 0 || targetIdx >= steps.length) return f;
      const [moved] = steps.splice(stepIdx, 1);
      steps.splice(targetIdx, 0, moved);
      return { ...f, phases: copy };
    });
  }

  // Contextual Goal Creation
  async function submitCreateGoal(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    if (!createGoalModal) return;
    setBusy(true);
    try {
      const res = await api(`/roadmaps/${createGoalModal._id}/create-goal`, {
        method: 'POST',
        body: jsonBody(goalForm)
      });
      showToast(`Goal "${res.goal.title}" created & linked!`);
      setCreateGoalModal(null);
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Contextual Milestone Creation
  async function submitCreateMilestone(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    if (!createMilestoneModal) return;
    setBusy(true);
    try {
      const { roadmap, phaseId, stepId } = createMilestoneModal;
      const res = await api(`/roadmaps/${roadmap._id}/create-milestone`, {
        method: 'POST',
        body: jsonBody({ ...milestoneForm, phaseId, stepId })
      });
      showToast(`Milestone "${res.milestone.title}" created & linked!`);
      setCreateMilestoneModal(null);
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Link Goal
  async function submitLinkGoal(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    if (!linkGoalModal || !selectedGoalToLink) return;
    setBusy(true);
    try {
      await api(`/roadmaps/${linkGoalModal._id}/link-goal`, {
        method: 'PUT',
        body: jsonBody({ goalId: selectedGoalToLink })
      });
      showToast('Goal linked to roadmap');
      setLinkGoalModal(null);
      setSelectedGoalToLink('');
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Step Evidence Submission
  async function submitEvidence(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewers have read-only access.');
      return;
    }
    if (!evidenceModal) return;
    setBusy(true);
    try {
      const { roadmapId, phaseId, stepId } = evidenceModal;
      await api(`/roadmaps/${roadmapId}/toggle-step`, {
        method: 'PUT',
        body: jsonBody({
          phaseId,
          stepId,
          completed: true,
          evidence: evidenceForm
        })
      });
      showToast('Evidence logged & step verified!');
      setEvidenceModal(null);
      setEvidenceForm({ title: '', url: '', notes: '' });
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Available Subdomains for Filter based on selected Domain
  const availableSubdomainsForFilter = useMemo(() => {
    if (selectedDomain === 'All') {
      const set = new Map();
      availableDomains.forEach(d => {
        (d.fields || []).forEach(f => {
          if (!set.has(f.name)) set.set(f.name, f);
        });
      });
      return Array.from(set.values());
    }
    const dom = availableDomains.find(d => d.name === selectedDomain || d._id === selectedDomain);
    return dom?.fields || [];
  }, [availableDomains, selectedDomain]);

  // Filtered roadmaps
  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(r => {
      // Domain filter
      if (selectedDomain !== 'All') {
        const matchesMulti = (r.domainAssociations || []).some(da =>
          (da.domainId?._id || da.domainId) === selectedDomain ||
          da.domainId?.name === selectedDomain
        );
        const matchesLegacy =
          (r.primaryDomain?._id || r.primaryDomain) === selectedDomain ||
          (r.primaryDomain?.name || r.category) === selectedDomain ||
          (r.secondaryDomains || []).some(sd => (sd._id || sd) === selectedDomain || sd.name === selectedDomain);

        if (!matchesMulti && !matchesLegacy) return false;
      }
      // Subdomain filter
      if (selectedSubdomain !== 'All') {
        const matchesMultiSub = (r.domainAssociations || []).some(da =>
          (da.subdomainIds || []).some(sId => (sId._id || sId) === selectedSubdomain) ||
          (da.subdomains || []).some(s => s._id === selectedSubdomain || s.name === selectedSubdomain)
        );
        const matchesLegacySub =
          (r.subdomainId?._id || r.subdomainId) === selectedSubdomain ||
          r.subdomain === selectedSubdomain;

        if (!matchesMultiSub && !matchesLegacySub) return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'All' && r.difficulty !== selectedDifficulty) return false;
      // Status filter
      if (selectedStatus !== 'All' && r.status !== selectedStatus) return false;
      // Search
      if (search.trim()) {
        const s = search.toLowerCase();
        const titleMatch = (r.title || '').toLowerCase().includes(s);
        const descMatch = (r.description || '').toLowerCase().includes(s);
        const purpMatch = (r.purpose || '').toLowerCase().includes(s);
        const domainMatch = (r.domainAssociations || []).some(da =>
          (da.domainId?.name || '').toLowerCase().includes(s) ||
          (da.subdomains || []).some(sub => (sub.name || '').toLowerCase().includes(s))
        );
        const phaseMatch = (r.phases || r.stages || []).some(ph =>
          (ph.title || '').toLowerCase().includes(s) ||
          (ph.steps || []).some(st => (st.title || '').toLowerCase().includes(s))
        );
        if (!titleMatch && !descMatch && !purpMatch && !domainMatch && !phaseMatch) return false;
      }
      return true;
    });
  }, [roadmaps, selectedDomain, selectedSubdomain, selectedDifficulty, selectedStatus, search]);

  return (
    <div className="admin-page space-y-6 animate-fade-in">
      <Toast message={toast} />

      {/* Top Header */}
      <div className="admin-page-top">
        <div>
          <p className="eyebrow">LEARNING JOURNEY & SKILLS SYSTEM</p>
          <h1 className="admin-title">Interactive Skills <em>Roadmaps</em></h1>
          <p className="admin-subtitle">
            Curated engineering paths with verifiable stages, dependency checks, and live progress calculations connected across domains, skills, goals, projects, and credentials.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="button-secondary"
            onClick={() => setViewArchived(!viewArchived)}
          >
            <Archive size={14} /> {viewArchived ? 'View Active' : 'View Archived'}
          </button>
          {!isViewer && (
            <button type="button" className="button-primary" onClick={openCreate}>
              <Plus size={16} /> New Roadmap
            </button>
          )}
        </div>
      </div>

      {/* Domain Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2 no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setSelectedDomain('All');
            setSelectedSubdomain('All');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
            selectedDomain === 'All'
              ? 'bg-primary text-primary-text border-primary shadow-xs'
              : 'bg-surface text-muted border-border hover:bg-hover hover:text-text'
          }`}
        >
          All Domains ({roadmaps.length})
        </button>
        {availableDomains.map(d => {
          const isSelected = selectedDomain === d.name || selectedDomain === d._id;
          const count = roadmaps.filter(r =>
            (r.domainAssociations || []).some(da => (da.domainId?._id || da.domainId) === d._id || da.domainId?.name === d.name) ||
            (r.primaryDomain?._id || r.primaryDomain) === d._id ||
            r.category === d.name
          ).length;
          return (
            <button
              key={d._id}
              type="button"
              onClick={() => {
                setSelectedDomain(d.name);
                setSelectedSubdomain('All');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-primary text-primary-text border-primary shadow-xs'
                  : 'bg-surface text-muted border-border hover:bg-hover hover:text-text'
              }`}
            >
              <span>{d.name}</span>
              <span className="opacity-70 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Modern Search & Multi-Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Box with Clear Button */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search roadmaps, phases, steps, or outcomes…"
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm border border-border bg-background text-text placeholder:text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition p-0.5 rounded-full"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Subdomain Filter */}
          <select
            value={selectedSubdomain}
            onChange={e => setSelectedSubdomain(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-text outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="All">All Subdomains</option>
            {availableSubdomainsForFilter.map(sub => (
              <option key={sub._id || sub.name} value={sub._id || sub.name}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-text outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-text outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="All">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-between lg:justify-end gap-3 text-xs text-muted px-1">
          <span className="font-mono font-medium">
            <strong className="text-text font-bold">{filteredRoadmaps.length}</strong> {filteredRoadmaps.length === 1 ? 'roadmap' : 'roadmaps'} {viewArchived ? '(Archived)' : ''}
          </span>
          <span className="hidden sm:inline-block opacity-40">·</span>
          <span className="hidden sm:inline-block text-[11px] text-muted">
            Weighted checklist progress
          </span>
        </div>
      </div>

      {/* DETAIL INSPECTION DRAWER (IF ACTIVE) */}
      {detailRoadmap && (
        <div className="bg-surface rounded-2xl border-2 border-primary/40 shadow-card p-6 space-y-6 animate-fade-in relative">
          <button
            type="button"
            onClick={() => setDetailRoadmap(null)}
            className="absolute right-4 top-4 text-muted hover:text-text p-1.5 rounded-xl border border-border bg-background hover:bg-hover transition"
            title="Close Detail View"
          >
            <X size={16} />
          </button>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <span>Roadmaps</span>
            <span>/</span>
            <span className="text-text font-bold">{detailRoadmap.title}</span>
          </div>

          {/* Roadmap Header Summary */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {detailRoadmap.domainAssociations && detailRoadmap.domainAssociations.length > 0 ? (
                  detailRoadmap.domainAssociations.map((da, idx) => {
                    const dName = da.domainId?.name || detailRoadmap.category || 'General';
                    const accent = da.domainId?.accentColor || '#bb9457';
                    const subCount = da.subdomains?.length || da.subdomainIds?.length || 0;
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: `${accent}15`,
                          borderColor: `${accent}40`,
                          color: accent
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                        <span>{dName}</span>
                        {subCount > 0 && <span className="opacity-75">({subCount})</span>}
                      </span>
                    );
                  })
                ) : (
                  <>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {detailRoadmap.primaryDomain?.name || detailRoadmap.category || 'General'}
                    </span>
                    {detailRoadmap.subdomain && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-surface text-muted border border-border">
                        {detailRoadmap.subdomain}
                      </span>
                    )}
                  </>
                )}
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  {detailRoadmap.difficulty || 'Intermediate'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  detailRoadmap.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {detailRoadmap.status || 'in_progress'}
                </span>
                {detailRoadmap.estimatedDuration && (
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Clock size={12} /> {detailRoadmap.estimatedDuration}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-text font-display">{detailRoadmap.title}</h2>
              {detailRoadmap.purpose && (
                <p className="text-xs font-semibold text-primary">{detailRoadmap.purpose}</p>
              )}
              {detailRoadmap.description && (
                <p className="text-xs text-muted leading-relaxed">{detailRoadmap.description}</p>
              )}
            </div>

            {/* Contextual Action Buttons */}
            {canEdit ? (
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setGoalForm({
                      title: `Mastery: ${detailRoadmap.title}`,
                      timeHorizon: 'Strategic Goal',
                      priority: 'High',
                      targetDate: detailRoadmap.targetDate || ''
                    });
                    setCreateGoalModal(detailRoadmap);
                  }}
                  className="button-secondary text-xs flex items-center gap-1.5"
                  title="Create a strategic Goal from this Roadmap"
                >
                  <Target size={14} className="text-wine" /> Create Goal
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGoalToLink('');
                    setLinkGoalModal(detailRoadmap);
                  }}
                  className="button-secondary text-xs flex items-center gap-1.5"
                  title="Link an existing Goal"
                >
                  <Layers size={14} /> Link Goal
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(detailRoadmap)}
                  className="button-primary text-xs flex items-center gap-1.5"
                >
                  <Pencil size={13} /> Edit Roadmap
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(detailRoadmap)}
                  className="button-ghost text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
                  title="Delete Roadmap"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            ) : (
              <div className="self-start lg:self-center">
                <span className="text-xs font-mono text-muted">Viewer mode · Read-only access</span>
              </div>
            )}
          </div>

          {/* Progress Bar & Telemetry Card */}
          <div className="bg-background p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-text">
              <span className="flex items-center gap-1.5">
                <Workflow size={15} className="text-primary" />
                Track Completion & Milestones
              </span>
              <span className="font-mono text-sm text-primary">{detailRoadmap.progress}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${detailRoadmap.progress}%` }}
              />
            </div>
          </div>

          {/* Associated Engineering Domains & Specializations */}
          {detailRoadmap.domainAssociations && detailRoadmap.domainAssociations.length > 0 && (
            <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted block">
                Associated Domains & Specializations ({detailRoadmap.domainAssociations.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {detailRoadmap.domainAssociations.map((da, idx) => {
                  const domName = da.domainId?.name || 'Domain';
                  const accentColor = da.domainId?.accentColor || '#bb9457';
                  const subs = da.subdomains || [];
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-background border border-border shadow-xs space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                        <span className="text-xs font-bold text-text truncate">{domName}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {subs.length > 0 ? (
                          subs.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface border border-border text-muted"
                            >
                              {s.name || s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted italic">All core specializations</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Learning Outcomes & Prerequisites Grid */}
          {((detailRoadmap.learningOutcomes || []).length > 0 || (detailRoadmap.prerequisites || []).length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(detailRoadmap.learningOutcomes || []).length > 0 && (
                <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" /> Target Learning Outcomes
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {detailRoadmap.learningOutcomes.map((out, idx) => (
                      <li key={idx} className="text-xs text-muted flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(detailRoadmap.prerequisites || []).length > 0 && (
                <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                    <Lock size={14} className="text-primary" /> Roadmap Prerequisites
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {detailRoadmap.prerequisites.map((pr, idx) => (
                      <li key={idx} className="text-xs text-muted flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span>{pr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Structured Phases & Step Checklists */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text font-mono">
              Curated Learning Phases & Step Timeline
            </h3>

            {(detailRoadmap.phases || detailRoadmap.stages || []).map((phase, pIdx) => {
              const phaseSteps = phase.steps || [];
              const phaseCompletedCount = phaseSteps.filter(st => st.completed).length;
              const phasePct = phaseSteps.length > 0 ? Math.round((phaseCompletedCount / phaseSteps.length) * 100) : 0;

              return (
                <div
                  key={phase._id || phase.id || pIdx}
                  className="rounded-xl border border-border bg-background overflow-hidden shadow-xs"
                >
                  {/* Phase Header */}
                  <div className="p-4 bg-surface border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">PHASE {pIdx + 1}</span>
                        <span className="text-xs text-muted">·</span>
                        <h4 className="text-sm font-bold text-text">{phase.title}</h4>
                      </div>
                      {phase.description && (
                        <p className="text-xs text-muted">{phase.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-muted">
                          {phaseCompletedCount}/{phaseSteps.length} Steps
                        </span>
                        <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${phasePct}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setResourceModalInitial({
                              roadmapId: detailRoadmap._id,
                              domainName: detailRoadmap.category,
                              milestone: `Phase: ${phase.title}`
                            });
                            setResourceModalOpen(true);
                          }}
                          className="button-secondary text-[11px] py-1 px-2 flex items-center gap-1 cursor-pointer"
                          title="Add technical resource for this roadmap phase"
                        >
                          <BookOpen size={11} /> + Resource
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMilestoneForm({
                              title: `Phase Outcome: ${phase.title}`,
                              targetDate: '',
                              description: phase.description || '',
                              category: 'Learning'
                            });
                            setCreateMilestoneModal({ roadmap: detailRoadmap, phaseId: phase.id || phase._id });
                          }}
                          className="button-secondary text-[11px] py-1 px-2 flex items-center gap-1"
                          title="Link or create a milestone for this phase"
                        >
                          <Clock size={11} /> + Milestone
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Phase Steps Checklist */}
                  <div className="divide-y divide-border">
                    {phaseSteps.map((step, stIdx) => {
                      const isCompleted = step.completed || step.status === 'completed';
                      const isLocked = step.status === 'locked';

                      return (
                        <div
                          key={step._id || step.id || stIdx}
                          className={`p-3.5 sm:p-4 transition flex items-start gap-3.5 hover:bg-surface/60 ${
                            isCompleted ? 'bg-surface/30' : ''
                          }`}
                        >
                          {/* Toggle Checkbox */}
                          <button
                            type="button"
                            disabled={isLocked || !canEdit}
                            onClick={() => canEdit && !isLocked && handleToggleStep(detailRoadmap._id, phase._id || phase.id, step._id || step.id, isCompleted)}
                            className={`mt-0.5 shrink-0 transition ${
                              isLocked || !canEdit
                                ? 'text-muted/40 cursor-not-allowed'
                                : isCompleted
                                  ? 'text-primary hover:scale-105'
                                  : 'text-muted hover:text-text hover:scale-105'
                            }`}
                            title={isLocked ? 'Prerequisites not met' : !canEdit ? 'Read-only access' : 'Toggle step completion'}
                          >
                            {isLocked ? (
                              <Lock size={18} className="text-muted/60" />
                            ) : isCompleted ? (
                              <CheckSquare size={19} className="text-primary" />
                            ) : (
                              <Square size={19} className="text-border" />
                            )}
                          </button>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className={`text-xs sm:text-sm font-bold ${
                                isCompleted ? 'line-through text-muted' : 'text-text'
                              }`}>
                                {step.title}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {step.weight && step.weight > 1 && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                                    Weight: {step.weight}
                                  </span>
                                )}
                                {step.estimatedEffort && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-muted flex items-center gap-1">
                                    <Clock size={10} /> {step.estimatedEffort}
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  step.priority === 'Critical'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : step.priority === 'High'
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                      : 'bg-surface text-muted border border-border'
                                }`}>
                                  {step.priority || 'Medium'}
                                </span>
                              </div>
                            </div>

                            {step.description && (
                              <p className="text-xs text-muted leading-relaxed">{step.description}</p>
                            )}

                            {/* Acceptance Criteria */}
                            {(step.acceptanceCriteria || []).length > 0 && (
                              <div className="pt-1">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block mb-1">
                                  Acceptance Criteria:
                                </span>
                                <div className="space-y-1 pl-1">
                                  {step.acceptanceCriteria.map((ac, acIdx) => (
                                    <div key={acIdx} className="text-[11px] text-muted flex items-center gap-1.5">
                                      <CheckCircle2 size={11} className={isCompleted ? 'text-primary' : 'text-muted/60'} />
                                      <span>{ac}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Linked Entities Bar: Skills, Projects, Resources */}
                            <div className="flex flex-wrap items-center gap-2 pt-1.5">
                              {/* Skills */}
                              {(step.linkedSkills || []).map(sk => {
                                const skillObj = typeof sk === 'object' ? sk : availableSkills.find(s => s._id === sk);
                                if (!skillObj) return null;
                                return (
                                  <span
                                    key={skillObj._id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200"
                                    title={`Skill: ${skillObj.name} (${skillObj.level})`}
                                  >
                                    <Code2 size={10} /> {skillObj.name}
                                  </span>
                                );
                              })}

                              {/* Projects */}
                              {(step.linkedProjects || []).map(pr => {
                                const projObj = typeof pr === 'object' ? pr : availableProjects.find(p => p._id === pr);
                                if (!projObj) return null;
                                return (
                                  <span
                                    key={projObj._id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-50 text-purple-800 border border-purple-200"
                                    title={`Project Evidence: ${projObj.title}`}
                                  >
                                    <FolderOpen size={10} /> {projObj.title}
                                  </span>
                                );
                              })}

                              {/* Resources */}
                              {(step.linkedResources || []).map(res => {
                                const resObj = typeof res === 'object' ? res : availableResources.find(r => r._id === res);
                                if (!resObj) return null;
                                return (
                                  <a
                                    key={resObj._id}
                                    href={resObj.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 hover:underline"
                                    title={`Resource: ${resObj.title}`}
                                  >
                                    <BookOpen size={10} /> {resObj.title} <ExternalLink size={9} />
                                  </a>
                                );
                              })}

                              {/* Action to log evidence */}
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEvidenceForm({ title: '', url: '', notes: '' });
                                    setEvidenceModal({
                                      roadmapId: detailRoadmap._id,
                                      phaseId: phase.id || phase._id,
                                      stepId: step.id || step._id
                                    });
                                  }}
                                  className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 ml-auto"
                                >
                                  + Log Evidence
                                </button>
                              )}
                            </div>

                            {/* Completed Evidence Records */}
                            {(step.completionEvidence || []).length > 0 && (
                              <div className="bg-surface/80 p-2.5 rounded-lg border border-border mt-2 space-y-1">
                                <span className="text-[10px] font-mono uppercase font-bold text-muted block">
                                  Verified Evidence & Notes:
                                </span>
                                {step.completionEvidence.map((ev, evIdx) => (
                                  <div key={evIdx} className="text-[11px] text-text flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <CheckCircle2 size={12} className="text-primary shrink-0" />
                                      <strong className="truncate">{ev.title}</strong>
                                      {ev.notes && <span className="text-muted truncate">({ev.notes})</span>}
                                    </div>
                                    {ev.url && (
                                      <a
                                        href={ev.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0"
                                      >
                                        Inspect <ExternalLink size={10} />
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ROADMAPS GRID / LIST VIEW */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-muted">
          Loading roadmap telemetry and structured phases…
        </div>
      ) : filteredRoadmaps.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRoadmaps.map(r => {
            const phases = r.phases || r.stages || [];
            let totalSteps = 0;
            let completedSteps = 0;
            phases.forEach(ph => {
              (ph.steps || []).forEach(st => {
                totalSteps++;
                if (st.completed || st.status === 'completed') completedSteps++;
              });
            });

            return (
              <div
                key={r._id}
                className="panel-card bg-surface rounded-2xl border border-border p-5 shadow-xs hover:shadow-card transition flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Card Header & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {r.domainAssociations && r.domainAssociations.length > 0 ? (
                        r.domainAssociations.map((da, idx) => {
                          const dName = da.domainId?.name || r.category || 'General';
                          const accent = da.domainId?.accentColor || '#bb9457';
                          const subCount = da.subdomains?.length || da.subdomainIds?.length || 0;
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border"
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
                        })
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {r.primaryDomain?.name || r.category || 'General'}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                        {r.difficulty || 'Intermediate'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        r.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {r.status || 'in_progress'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      onClick={() => setDetailRoadmap(r)}
                      className="text-base font-bold text-text font-display hover:text-primary transition cursor-pointer line-clamp-1"
                    >
                      {r.title}
                    </h3>
                    {r.description && (
                      <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                        {r.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar & Ratio */}
                  <div className="space-y-1.5 bg-background p-3 rounded-xl border border-border">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-muted font-mono text-[11px]">
                        {completedSteps}/{totalSteps} steps completed
                      </span>
                      <span className="font-mono text-primary text-xs font-black">{r.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${r.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Connected Entity Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-muted pt-1">
                    <span className="px-1.5 py-0.5 rounded bg-surface border border-border flex items-center gap-1">
                      <Layers size={10} /> {phases.length} phases
                    </span>
                    {(r.linkedSkills || []).length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-surface border border-border flex items-center gap-1">
                        <Code2 size={10} /> {r.linkedSkills.length} skills
                      </span>
                    )}
                    {(r.linkedGoals || []).length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-surface border border-border flex items-center gap-1">
                        <Target size={10} /> {r.linkedGoals.length} goals
                      </span>
                    )}
                    {(r.relatedProjects || []).length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-surface border border-border flex items-center gap-1">
                        <FolderOpen size={10} /> {r.relatedProjects.length} projects
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 border-t border-border mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailRoadmap(r)}
                    className="button-secondary text-xs flex items-center gap-1"
                  >
                    <Eye size={13} /> Timeline
                  </button>

                  {canEdit ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(r)}
                        className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-hover transition"
                        title="Duplicate Roadmap"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-hover transition"
                        title="Edit Roadmap"
                      >
                        <Pencil size={13} />
                      </button>
                      {r.isArchived ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(r)}
                          className="px-2 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleArchive(r)}
                          className="p-1.5 rounded-lg border border-border text-muted hover:text-amber-700 hover:bg-hover transition"
                          title="Archive Roadmap"
                        >
                          <Archive size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r)}
                        className="p-1.5 rounded-lg border border-border text-muted hover:text-red-600 hover:bg-hover transition"
                        title="Delete Roadmap"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-muted">Read-Only</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={viewArchived ? 'No archived roadmaps' : 'No learning roadmaps found'}
          description="Create your first structured engineering roadmap connected with your domains, skills, and goals."
        />
      )}

      {/* FULL ROADMAP EDIT / CREATE MODAL */}
      {modal && (
        <Modal
          title={editing ? `Edit Roadmap: ${editing.title}` : 'Create Advanced Engineering Roadmap'}
          onClose={() => setModal(false)}
        >
          {isViewer && <ReadOnlyNotice featureName="Roadmap Architecture" />}
          <form onSubmit={handleSave} className="space-y-6">
            <fieldset disabled={isViewer} className="space-y-6">
            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setModalTab('overview')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  modalTab === 'overview' ? 'bg-primary text-primary-text' : 'text-muted hover:text-text'
                }`}
              >
                1. Overview & Taxonomy
              </button>
              <button
                type="button"
                onClick={() => setModalTab('outcomes')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  modalTab === 'outcomes' ? 'bg-primary text-primary-text' : 'text-muted hover:text-text'
                }`}
              >
                2. Outcomes & Prereqs
              </button>
              <button
                type="button"
                onClick={() => setModalTab('phases')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  modalTab === 'phases' ? 'bg-primary text-primary-text' : 'text-muted hover:text-text'
                }`}
              >
                3. Phases & Steps ({(form.phases || []).length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('relationships')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  modalTab === 'relationships' ? 'bg-primary text-primary-text' : 'text-muted hover:text-text'
                }`}
              >
                4. Connected Entities
              </button>
              <button
                type="button"
                onClick={() => setModalTab('notes')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  modalTab === 'notes' ? 'bg-primary text-primary-text' : 'text-muted hover:text-text'
                }`}
              >
                5. Private Notes
              </button>
            </div>

            {/* TAB 1: OVERVIEW & DOMAIN */}
            {modalTab === 'overview' && (
              <div className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-text">Roadmap Title *</span>
                  <input
                    required
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Distributed Backend Architecture Mastery"
                    className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-text">Slug (Optional)</span>
                    <input
                      value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="e.g. distributed-backend-mastery"
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-text">Estimated Duration</span>
                    <input
                      value={form.estimatedDuration}
                      onChange={e => setForm(f => ({ ...f, estimatedDuration: e.target.value }))}
                      placeholder="e.g. 8 weeks / 60 hours"
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                </div>

                {/* Multi-Domain & Multi-Subdomain Cascading Selector */}
                <div className="p-4 bg-background rounded-xl border border-border space-y-2">
                  <span className="text-xs font-bold text-text block">
                    Engineering Domains & Subdomain Specializations
                  </span>
                  <MultiDomainSubdomainSelector
                    value={form.domainAssociations || []}
                    onChange={associations => {
                      setForm(f => {
                        const primaryAssoc = associations[0];
                        const primaryId = primaryAssoc?.domainId || '';
                        const primDoc = availableDomains.find(d => d._id === primaryId);
                        return {
                          ...f,
                          domainAssociations: associations,
                          primaryDomain: primaryId,
                          category: primDoc?.name || f.category,
                          subdomainId: primaryAssoc?.subdomainIds?.[0] || '',
                          secondaryDomains: associations.slice(1).map(a => a.domainId)
                        };
                      });
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-text">Difficulty</span>
                    <select
                      value={form.difficulty}
                      onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-text">Status</span>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="planned">Planned</option>
                      <option value="completed">Completed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-text">Visibility</span>
                    <select
                      value={form.visibility}
                      onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="public">Public (Showcase)</option>
                      <option value="private">Private (Workspace Only)</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-bold text-text">High-Level Purpose & Intent</span>
                  <input
                    value={form.purpose}
                    onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                    placeholder="Why this roadmap exists and what practical capability it unlocks..."
                    className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-bold text-text">Detailed Description</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Comprehensive description of the curriculum and engineering path..."
                    className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              </div>
            )}

            {/* TAB 2: OUTCOMES & PREREQUISITES */}
            {modalTab === 'outcomes' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text">Target Learning Outcomes</span>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, learningOutcomes: [...f.learningOutcomes, ''] }))}
                      className="button-secondary text-[11px] py-1 px-2.5"
                    >
                      + Add Outcome
                    </button>
                  </div>
                  {form.learningOutcomes.map((out, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={out}
                        onChange={e => {
                          const val = e.target.value;
                          setForm(f => {
                            const copy = [...f.learningOutcomes];
                            copy[idx] = val;
                            return { ...f, learningOutcomes: copy };
                          });
                        }}
                        placeholder={`Outcome #${idx + 1}`}
                        className="flex-1 px-3 py-1.5 text-xs border border-border bg-background rounded-xl text-text outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm(f => {
                            const copy = [...f.learningOutcomes];
                            copy.splice(idx, 1);
                            return { ...f, learningOutcomes: copy };
                          });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text">Roadmap Prerequisites</span>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, prerequisites: [...f.prerequisites, ''] }))}
                      className="button-secondary text-[11px] py-1 px-2.5"
                    >
                      + Add Prerequisite
                    </button>
                  </div>
                  {form.prerequisites.map((pr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={pr}
                        onChange={e => {
                          const val = e.target.value;
                          setForm(f => {
                            const copy = [...f.prerequisites];
                            copy[idx] = val;
                            return { ...f, prerequisites: copy };
                          });
                        }}
                        placeholder={`Prerequisite #${idx + 1}`}
                        className="flex-1 px-3 py-1.5 text-xs border border-border bg-background rounded-xl text-text outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm(f => {
                            const copy = [...f.prerequisites];
                            copy.splice(idx, 1);
                            return { ...f, prerequisites: copy };
                          });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: STRUCTURED PHASES & STEPS */}
            {modalTab === 'phases' && (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Ordered Learning Phases</span>
                  <button
                    type="button"
                    onClick={addPhase}
                    className="button-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Phase
                  </button>
                </div>

                {(form.phases || []).map((phase, pIdx) => (
                  <div key={phase.id || pIdx} className="p-4 bg-background rounded-xl border border-border space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-mono text-xs font-black text-primary">#{pIdx + 1}</span>
                        <input
                          value={phase.title}
                          onChange={e => {
                            const val = e.target.value;
                            setForm(f => {
                              const copy = [...f.phases];
                              copy[pIdx].title = val;
                              return { ...f, phases: copy };
                            });
                          }}
                          placeholder="Phase title..."
                          className="font-bold text-xs bg-surface px-2.5 py-1 rounded-lg border border-border text-text flex-1"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => movePhase(pIdx, -1)}
                          disabled={pIdx === 0}
                          className="p-1 rounded text-muted hover:text-text disabled:opacity-30"
                          title="Move phase up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePhase(pIdx, 1)}
                          disabled={pIdx === (form.phases || []).length - 1}
                          className="p-1 rounded text-muted hover:text-text disabled:opacity-30"
                          title="Move phase down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePhase(pIdx)}
                          className="p-1 rounded text-red-500 hover:text-red-700"
                          title="Delete Phase"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Steps inside Phase */}
                    <div className="space-y-3 pl-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase font-bold text-muted">
                          Steps in Phase ({phase.steps?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => addStep(pIdx)}
                          className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1"
                        >
                          + Add Step
                        </button>
                      </div>

                      {(phase.steps || []).map((step, stIdx) => (
                        <div key={step.id || stIdx} className="p-3 bg-surface rounded-xl border border-border space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              value={step.title}
                              onChange={e => {
                                const val = e.target.value;
                                setForm(f => {
                                  const copy = [...f.phases];
                                  copy[pIdx].steps[stIdx].title = val;
                                  return { ...f, phases: copy };
                                });
                              }}
                              placeholder="Step title..."
                              className="text-xs font-semibold bg-background px-2.5 py-1 rounded-lg border border-border text-text flex-1"
                            />
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveStep(pIdx, stIdx, -1)}
                                disabled={stIdx === 0}
                                className="p-1 rounded text-muted hover:text-text disabled:opacity-30"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveStep(pIdx, stIdx, 1)}
                                disabled={stIdx === (phase.steps || []).length - 1}
                                className="p-1 rounded text-muted hover:text-text disabled:opacity-30"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeStep(pIdx, stIdx)}
                                className="p-1 rounded text-red-500 hover:text-red-700"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <label className="block">
                              <span className="text-[10px] font-mono text-muted">Effort:</span>
                              <input
                                value={step.estimatedEffort || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setForm(f => {
                                    const copy = [...f.phases];
                                    copy[pIdx].steps[stIdx].estimatedEffort = val;
                                    return { ...f, phases: copy };
                                  });
                                }}
                                placeholder="e.g. 2h"
                                className="w-full text-xs bg-background px-2 py-0.5 rounded border border-border"
                              />
                            </label>

                            <label className="block">
                              <span className="text-[10px] font-mono text-muted">Weight:</span>
                              <input
                                type="number"
                                min="1"
                                value={step.weight || 1}
                                onChange={e => {
                                  const val = Number(e.target.value) || 1;
                                  setForm(f => {
                                    const copy = [...f.phases];
                                    copy[pIdx].steps[stIdx].weight = val;
                                    return { ...f, phases: copy };
                                  });
                                }}
                                className="w-full text-xs bg-background px-2 py-0.5 rounded border border-border"
                              />
                            </label>

                            <label className="block">
                              <span className="text-[10px] font-mono text-muted">Priority:</span>
                              <select
                                value={step.priority || 'Medium'}
                                onChange={e => {
                                  const val = e.target.value;
                                  setForm(f => {
                                    const copy = [...f.phases];
                                    copy[pIdx].steps[stIdx].priority = val;
                                    return { ...f, phases: copy };
                                  });
                                }}
                                className="w-full text-xs bg-background px-1.5 py-0.5 rounded border border-border"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </label>

                            <label className="block">
                              <span className="text-[10px] font-mono text-muted">Link Skill:</span>
                              <select
                                value={step.linkedSkills?.[0] || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setForm(f => {
                                    const copy = [...f.phases];
                                    copy[pIdx].steps[stIdx].linkedSkills = val ? [val] : [];
                                    return { ...f, phases: copy };
                                  });
                                }}
                                className="w-full text-xs bg-background px-1.5 py-0.5 rounded border border-border truncate"
                              >
                                <option value="">None</option>
                                {availableSkills.map(sk => (
                                  <option key={sk._id} value={sk._id}>{sk.name}</option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: RELATIONSHIPS */}
            {modalTab === 'relationships' && (
              <div className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-text">Linked Strategic Goals</span>
                  <select
                    multiple
                    value={form.linkedGoals}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, o => o.value);
                      setForm(f => ({ ...f, linkedGoals: selected }));
                    }}
                    className="w-full h-28 px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none"
                  >
                    {availableGoals.map(g => (
                      <option key={g._id} value={g._id}>{g.title} ({g.status})</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-muted block">Hold Ctrl (Cmd) to select multiple goals.</span>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-bold text-text">Related Projects & Evidence</span>
                  <select
                    multiple
                    value={form.relatedProjects}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, o => o.value);
                      setForm(f => ({ ...f, relatedProjects: selected }));
                    }}
                    className="w-full h-28 px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none"
                  >
                    {availableProjects.map(p => (
                      <option key={p._id} value={p._id}>{p.title} ({p.status})</option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-bold text-text">Associated Certifications</span>
                  <select
                    multiple
                    value={form.linkedCertifications}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, o => o.value);
                      setForm(f => ({ ...f, linkedCertifications: selected }));
                    }}
                    className="w-full h-24 px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none"
                  >
                    {availableCerts.map(c => (
                      <option key={c._id} value={c._id}>{c.title} ({c.issuer})</option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-bold text-text">Recommended Learning Resources & Documentation</span>
                  <select
                    multiple
                    value={form.linkedResources || []}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, o => o.value);
                      setForm(f => ({ ...f, linkedResources: selected }));
                    }}
                    className="w-full h-28 px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none"
                  >
                    {availableResources.map(r => (
                      <option key={r._id} value={r._id}>{r.title} ({r.type})</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-muted block">Select resources from central library to recommend for this roadmap.</span>
                </label>
              </div>
            )}

            {/* TAB 5: NOTES */}
            {modalTab === 'notes' && (
              <div className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-text">Internal Workspace Notes (Private)</span>
                  <textarea
                    rows={6}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Private reflection notes, architectural research notes, or reminders that will not be displayed on public portfolio..."
                    className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              </div>
            )}
            </fieldset>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="button-secondary text-xs"
              >
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button
                  type="submit"
                  disabled={busy}
                  className="button-primary text-xs"
                >
                  {busy ? 'Saving…' : editing ? 'Save Changes' : 'Create Roadmap'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* CONTEXTUAL CREATE GOAL MODAL */}
      {createGoalModal && (
        <Modal
          title={`Create Strategic Goal from "${createGoalModal.title}"`}
          onClose={() => setCreateGoalModal(null)}
        >
          {isViewer && <ReadOnlyNotice featureName="Goal Linking" />}
          <form onSubmit={submitCreateGoal} className="space-y-4">
            <fieldset disabled={isViewer} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-text">Goal Title *</span>
              <input
                required
                value={goalForm.title}
                onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-bold text-text">Time Horizon</span>
                <select
                  value={goalForm.timeHorizon}
                  onChange={e => setGoalForm(f => ({ ...f, timeHorizon: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
                >
                  <option value="Long-term Vision">Long-term Vision</option>
                  <option value="Strategic Goal">Strategic Goal</option>
                  <option value="Short-term Goal">Short-term Goal</option>
                  <option value="Weekly Action">Weekly Action</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-bold text-text">Priority</span>
                <select
                  value={goalForm.priority}
                  onChange={e => setGoalForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
                >
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </label>
            </div>

            <div className="p-3 bg-background rounded-xl border border-border text-xs text-muted">
              Roadmap phases will be automatically converted into goal milestones with inherited domain context.
            </div>
            </fieldset>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCreateGoalModal(null)} className="button-secondary text-xs">
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  {busy ? 'Creating…' : 'Create & Link Goal'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* CONTEXTUAL CREATE MILESTONE MODAL */}
      {createMilestoneModal && (
        <Modal
          title={`Create Milestone for Phase`}
          onClose={() => setCreateMilestoneModal(null)}
        >
          {isViewer && <ReadOnlyNotice featureName="Milestone Creation" />}
          <form onSubmit={submitCreateMilestone} className="space-y-4">
            <fieldset disabled={isViewer} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-text">Milestone Title *</span>
              <input
                required
                value={milestoneForm.title}
                onChange={e => setMilestoneForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-bold text-text">Target Date</span>
              <input
                type="date"
                value={milestoneForm.targetDate}
                onChange={e => setMilestoneForm(f => ({ ...f, targetDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-bold text-text">Description</span>
              <textarea
                rows={3}
                value={milestoneForm.description}
                onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
              />
            </label>
            </fieldset>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCreateMilestoneModal(null)} className="button-secondary text-xs">
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  {busy ? 'Creating…' : 'Create & Link Milestone'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* LINK EXISTING GOAL MODAL */}
      {linkGoalModal && (
        <Modal
          title={`Link Existing Goal to "${linkGoalModal.title}"`}
          onClose={() => setLinkGoalModal(null)}
        >
          {isViewer && <ReadOnlyNotice featureName="Goal Linking" />}
          <form onSubmit={submitLinkGoal} className="space-y-4">
            <fieldset disabled={isViewer} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-text">Select Goal to Link</span>
              <select
                required
                value={selectedGoalToLink}
                onChange={e => setSelectedGoalToLink(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
              >
                <option value="">-- Choose a Goal --</option>
                {availableGoals.map(g => (
                  <option key={g._id} value={g._id}>{g.title} ({g.status})</option>
                ))}
              </select>
            </label>
            </fieldset>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setLinkGoalModal(null)} className="button-secondary text-xs">
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy || !selectedGoalToLink} className="button-primary text-xs">
                  Link Goal
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* EVIDENCE SUBMISSION MODAL */}
      {evidenceModal && (
        <Modal
          title="Log Practical Evidence & Verification"
          onClose={() => setEvidenceModal(null)}
        >
          {isViewer && <ReadOnlyNotice featureName="Evidence Verification" />}
          <form onSubmit={submitEvidence} className="space-y-4">
            <fieldset disabled={isViewer} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-text">Evidence Title *</span>
              <input
                required
                value={evidenceForm.title}
                onChange={e => setEvidenceForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Implemented Redis cache with unit tests"
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-bold text-text">Artifact / Repository URL</span>
              <input
                value={evidenceForm.url}
                onChange={e => setEvidenceForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://github.com/... or PR link"
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-bold text-text">Reflection & Learnings</span>
              <textarea
                rows={3}
                value={evidenceForm.notes}
                onChange={e => setEvidenceForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Key architectural decisions, trade-offs, or challenges encountered..."
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text"
              />
            </label>
            </fieldset>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEvidenceModal(null)} className="button-secondary text-xs">
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" disabled={busy} className="button-primary text-xs">
                  Verify & Complete Step
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
          title="Delete Roadmap"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}"? Connected goals, skills, and projects will preserve their records with roadmap links safely removed.`}
          confirmLabel="Delete Permanently"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          onClose={() => setDeleteTarget(null)}
          danger
        />
      )}
      {/* CANONICAL RESOURCE MODAL PREFILLED WITH ROADMAP */}
      <ResourceModal
        isOpen={resourceModalOpen}
        onClose={() => setResourceModalOpen(false)}
        initialContext={resourceModalInitial}
        onSaved={async () => {
          showToast('Resource linked to roadmap successfully.');
          const res = await api('/resources?all=true').catch(() => []);
          setAvailableResources(Array.isArray(res) ? res : []);
          await load();
        }}
      />
    </div>
  );
}

export default AdminRoadmaps;
