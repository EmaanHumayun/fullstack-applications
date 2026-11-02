import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FlaskConical,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Archive,
  Search,
  X,
  Play,
  CheckCircle2,
  Square,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  FileCode,
  Paperclip,
  Activity,
  Terminal,
  Cpu,
  Shield,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { MultiDomainSubdomainSelector } from '../../components/MultiDomainSubdomainSelector.jsx';
import { MarkdownDocumentEditor } from '../../components/MarkdownDocumentEditor.jsx';
import { AttachmentManager } from '../../components/AttachmentManager.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

const emptyLab = {
  title: '',
  shortDescription: '',
  detailedDescription: '',
  learningObjective: '',
  difficulty: 'Intermediate',
  labType: 'Guided Lab',
  estimatedDuration: '1 hour',
  priority: 'Medium',
  status: 'Not Started',
  domainAssociations: [],
  technologies: [],
  requiredSoftware: [],
  requiredEnvironment: 'Local Docker or Cloud Sandbox',
  operatingSystem: 'Linux (Ubuntu / Alpine)',
  hardwareRequirements: '',
  commands: [],
  prerequisites: [],
  expectedOutput: '',
  completionCriteria: [],
  tasks: [
    { title: 'Provision environment and verify connectivity', isCompleted: false },
    { title: 'Implement configuration blueprint', isCompleted: false },
    { title: 'Run automated assertions and verify health', isCompleted: false }
  ],
  linkedGoals: [],
  linkedRoadmaps: [],
  linkedSkills: [],
  linkedResources: [],
  relatedProjects: [],
  personalNotes: '',
  learningReflection: ''
};

export function AdminPracticeLabs() {
  const { isViewer, canEdit } = useAuth();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewArchived, setViewArchived] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedSubdomain, setSelectedSubdomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Master lookup data
  const [availableDomains, setAvailableDomains] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableGoals, setAvailableGoals] = useState([]);
  const [availableRoadmaps, setAvailableRoadmaps] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);

  // Modals & Active state
  const [modal, setModal] = useState(false);
  const [modalTab, setModalTab] = useState('basic'); // basic, technical, tasks, relationships
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyLab);
  const [detailLab, setDetailLab] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // overview, tasks, technical, docs, attachments, evidence, notes
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  // Evidence Form Modal
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({ title: '', evidenceType: 'Screenshot / Terminal Log', description: '', fileUrl: '', externalUrl: '' });

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Load master data
  useEffect(() => {
    Promise.all([
      api('/domains?all=true').catch(() => []),
      api('/skills?all=true').catch(() => []),
      api('/goals?all=true').catch(() => []),
      api('/roadmaps?all=true').catch(() => []),
      api('/projects?all=true').catch(() => []),
      api('/resources?all=true').catch(() => [])
    ]).then(([doms, sk, gl, rm, pr, res]) => {
      setAvailableDomains(Array.isArray(doms) ? doms : []);
      setAvailableSkills(Array.isArray(sk) ? sk : []);
      setAvailableGoals(Array.isArray(gl) ? gl : []);
      setAvailableRoadmaps(Array.isArray(rm) ? rm : []);
      setAvailableProjects(Array.isArray(pr) ? pr : []);
      setAvailableResources(Array.isArray(res) ? res : []);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = viewArchived ? '/practice-labs?archived=true&all=true' : '/practice-labs?all=true';
      const data = await api(url);
      setLabs(Array.isArray(data) ? data : []);
      if (detailLab) {
        const refreshed = data.find(l => l._id === detailLab._id);
        if (refreshed) setDetailLab(refreshed);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load practice labs');
    } finally {
      setLoading(false);
    }
  }, [viewArchived, detailLab?._id]);

  useEffect(() => {
    load();
  }, [load]);

  // Filtered Subdomains for toolbar
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

  // Filtered Labs List
  const filteredLabs = useMemo(() => {
    return labs.filter(lab => {
      // Domain filter
      if (selectedDomain !== 'All') {
        const matchesMulti = (lab.domainAssociations || []).some(da =>
          (da.domainId?._id || da.domainId) === selectedDomain ||
          da.domainId?.name === selectedDomain
        );
        const matchesLegacy =
          (lab.primaryDomain?._id || lab.primaryDomain) === selectedDomain ||
          lab.primaryDomain?.name === selectedDomain;
        if (!matchesMulti && !matchesLegacy) return false;
      }

      // Subdomain filter
      if (selectedSubdomain !== 'All') {
        const matchesSub = (lab.domainAssociations || []).some(da =>
          (da.subdomainIds || []).some(sId => (sId._id || sId) === selectedSubdomain) ||
          (da.subdomains || []).some(s => s._id === selectedSubdomain || s.name === selectedSubdomain)
        );
        if (!matchesSub && lab.subdomainId !== selectedSubdomain) return false;
      }

      // Difficulty & Type & Status
      if (selectedDifficulty !== 'All' && lab.difficulty !== selectedDifficulty) return false;
      if (selectedType !== 'All' && lab.labType !== selectedType) return false;
      if (selectedStatus !== 'All' && lab.status !== selectedStatus) return false;

      // Search query
      if (search.trim()) {
        const s = search.toLowerCase();
        const titleMatch = (lab.title || '').toLowerCase().includes(s);
        const descMatch = (lab.shortDescription || '').toLowerCase().includes(s);
        const objMatch = (lab.learningObjective || '').toLowerCase().includes(s);
        const idMatch = (lab.labId || '').toLowerCase().includes(s);
        const techMatch = (lab.technologies || []).some(t => t.toLowerCase().includes(s));
        if (!titleMatch && !descMatch && !objMatch && !idMatch && !techMatch) return false;
      }

      return true;
    });
  }, [labs, selectedDomain, selectedSubdomain, selectedDifficulty, selectedType, selectedStatus, search]);

  // Open Create
  function openCreate() {
    setEditing(null);
    setForm(emptyLab);
    setModalTab('basic');
    setModal(true);
  }

  // Open Edit
  function openEdit(lab) {
    setEditing(lab);
    const associations = (lab.domainAssociations && lab.domainAssociations.length > 0)
      ? lab.domainAssociations.map(da => ({
          domainId: da.domainId?._id || da.domainId || '',
          subdomainIds: (da.subdomainIds || []).map(s => s?._id || s)
        }))
      : (lab.primaryDomain ? [{
          domainId: lab.primaryDomain?._id || lab.primaryDomain,
          subdomainIds: (lab.subdomainId ? [lab.subdomainId] : [])
        }] : []);

    setForm({
      ...emptyLab,
      ...lab,
      domainAssociations: associations,
      tasks: (lab.tasks || []).map(t => ({ ...t })),
      technologies: Array.isArray(lab.technologies) ? lab.technologies : [],
      requiredSoftware: Array.isArray(lab.requiredSoftware) ? lab.requiredSoftware : [],
      commands: Array.isArray(lab.commands) ? lab.commands : [],
      prerequisites: Array.isArray(lab.prerequisites) ? lab.prerequisites : [],
      completionCriteria: Array.isArray(lab.completionCriteria) ? lab.completionCriteria : [],
      linkedGoals: (lab.linkedGoals || []).map(g => g._id || g),
      linkedRoadmaps: (lab.linkedRoadmaps || []).map(r => r._id || r),
      linkedSkills: (lab.linkedSkills || []).map(s => s._id || s),
      linkedResources: (lab.linkedResources || []).map(r => r._id || r),
      relatedProjects: (lab.relatedProjects || []).map(p => p._id || p)
    });
    setModalTab('basic');
    setModal(true);
  }

  // Save Lab
  async function handleSave(e) {
    e.preventDefault();
    if (isViewer) return;
    setBusy(true);
    try {
      if (editing) {
        const updated = await api(`/practice-labs/${editing._id}`, {
          method: 'PUT',
          body: jsonBody(form)
        });
        showToast('Practice Lab updated successfully');
        if (detailLab?._id === editing._id) setDetailLab(updated);
      } else {
        await api('/practice-labs', {
          method: 'POST',
          body: jsonBody(form)
        });
        showToast('Practice Lab created successfully');
      }
      setModal(false);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to save practice lab');
    } finally {
      setBusy(false);
    }
  }

  // Delete Lab
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api(`/practice-labs/${deleteTarget._id}`, { method: 'DELETE' });
      showToast('Practice Lab deleted permanently');
      if (detailLab?._id === deleteTarget._id) setDetailLab(null);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to delete practice lab');
    }
  }

  // Duplicate Lab
  async function handleDuplicate(lab) {
    try {
      await api(`/practice-labs/${lab._id}/duplicate`, { method: 'POST' });
      showToast(`Duplicated "${lab.title}"`);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate practice lab');
    }
  }

  // Toggle Task in Detail view
  async function handleToggleTask(taskId, currentStatus) {
    if (!detailLab) return;
    try {
      const res = await api(`/practice-labs/${detailLab._id}/toggle-task`, {
        method: 'PUT',
        body: jsonBody({ taskId, isCompleted: !currentStatus })
      });
      setDetailLab(prev => ({
        ...prev,
        tasks: res.tasks,
        completionPercentage: res.completionPercentage,
        status: res.status
      }));
      setLabs(prev => prev.map(l => l._id === detailLab._id ? { ...l, completionPercentage: res.completionPercentage, status: res.status } : l));
    } catch (err) {
      showToast(err.message || 'Failed to toggle task');
    }
  }

  // Start Lab Action
  async function handleStartLab(labId) {
    try {
      const updated = await api(`/practice-labs/${labId}/start`, { method: 'PUT' });
      showToast('Lab started! Practice telemetry logged.');
      if (detailLab?._id === labId) setDetailLab(updated);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to start lab');
    }
  }

  // Complete Lab Action
  async function handleCompleteLab(labId) {
    try {
      const updated = await api(`/practice-labs/${labId}/complete`, { method: 'PUT' });
      showToast('Congratulations! Practice Lab marked Completed (100%).');
      if (detailLab?._id === labId) setDetailLab(updated);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to complete lab');
    }
  }

  // Evidence Management
  async function handleAddEvidence(e) {
    e.preventDefault();
    if (!detailLab) return;
    try {
      const evList = await api(`/practice-labs/${detailLab._id}/evidence`, {
        method: 'POST',
        body: jsonBody(evidenceForm)
      });
      setDetailLab(prev => ({ ...prev, evidence: evList }));
      setEvidenceModalOpen(false);
      setEvidenceForm({ title: '', evidenceType: 'Screenshot / Terminal Log', description: '', fileUrl: '', externalUrl: '' });
      showToast('Practical evidence logged!');
    } catch (err) {
      showToast(err.message || 'Failed to add evidence');
    }
  }

  async function handleDeleteEvidence(evidenceId) {
    if (!detailLab) return;
    try {
      const evList = await api(`/practice-labs/${detailLab._id}/evidence/${evidenceId}`, { method: 'DELETE' });
      setDetailLab(prev => ({ ...prev, evidence: evList }));
      showToast('Evidence record deleted');
    } catch (err) {
      showToast(err.message || 'Failed to delete evidence');
    }
  }

  // Markdown Document Handlers
  async function handleSaveMarkdownDoc(docData) {
    if (!detailLab) return;
    if (docData.id) {
      const updated = await api(`/practice-labs/${detailLab._id}/markdown/${docData.id}`, {
        method: 'PUT',
        body: jsonBody(docData)
      });
      setDetailLab(prev => ({
        ...prev,
        markdownFiles: prev.markdownFiles.map(d => d.id === docData.id ? updated : d)
      }));
      return updated;
    } else {
      const created = await api(`/practice-labs/${detailLab._id}/markdown`, {
        method: 'POST',
        body: jsonBody(docData)
      });
      setDetailLab(prev => ({
        ...prev,
        markdownFiles: [...(prev.markdownFiles || []), created]
      }));
      return created;
    }
  }

  async function handleDeleteMarkdownDoc(docId) {
    if (!detailLab) return;
    await api(`/practice-labs/${detailLab._id}/markdown/${docId}`, { method: 'DELETE' });
    setDetailLab(prev => ({
      ...prev,
      markdownFiles: prev.markdownFiles.filter(d => d.id !== docId)
    }));
  }

  // Attachment Handlers
  async function handleUploadAttachment(file) {
    if (!detailLab) return;
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('eh_token') || '';
    const res = await fetch(`/api/practice-labs/${detailLab._id}/attachments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Upload failed');
    }
    const uploaded = await res.json();
    setDetailLab(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), uploaded]
    }));
    showToast('Attachment uploaded successfully');
    return uploaded;
  }

  async function handleDeleteAttachment(attachmentId) {
    if (!detailLab) return;
    await api(`/practice-labs/${detailLab._id}/attachments/${attachmentId}`, { method: 'DELETE' });
    setDetailLab(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
    showToast('Attachment removed');
  }

  return (
    <div className="admin-page space-y-6 animate-fade-in">
      <Toast message={toast} />

      {/* Top Header */}
      <div className="admin-page-top">
        <div>
          <p className="eyebrow">HANDS-ON TECHNICAL LEARNING & EXPERIMENTATION</p>
          <h1 className="admin-title">Practice <em>Labs</em></h1>
          <p className="admin-subtitle">
            Guided technical tutorials, sandbox challenges, troubleshooting simulations, and practical cloud infrastructure experiments.
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
              <Plus size={16} /> New Lab
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
          All Domains ({labs.length})
        </button>
        {availableDomains.map(d => {
          const isSelected = selectedDomain === d.name || selectedDomain === d._id;
          const count = labs.filter(l =>
            (l.domainAssociations || []).some(da => (da.domainId?._id || da.domainId) === d._id || da.domainId?.name === d.name) ||
            (l.primaryDomain?._id || l.primaryDomain) === d._id
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

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search labs, tools, commands…"
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-border bg-background text-text placeholder:text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Subdomain Filter */}
          <select
            value={selectedSubdomain}
            onChange={e => setSelectedSubdomain(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-text outline-none"
          >
            <option value="All">All Subdomains</option>
            {availableSubdomainsForFilter.map(sub => (
              <option key={sub._id || sub.name} value={sub._id || sub.name}>{sub.name}</option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-text outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>

          {/* Lab Type */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-text outline-none"
          >
            <option value="All">All Types</option>
            <option value="Guided Lab">Guided Lab</option>
            <option value="Challenge Lab">Challenge Lab</option>
            <option value="Simulation">Simulation</option>
            <option value="Troubleshooting">Troubleshooting</option>
            <option value="Experiment">Experiment</option>
            <option value="Practical Exercise">Practical Exercise</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-text outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-end lg:self-auto text-muted">
          <span className="text-xs font-mono">
            <strong>{filteredLabs.length}</strong> {filteredLabs.length === 1 ? 'lab' : 'labs'}
          </span>
          <div className="flex items-center border border-border rounded-xl bg-background p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-primary text-primary-text' : 'hover:text-text'}`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-primary text-primary-text' : 'hover:text-text'}`}
              title="List View"
            >
              <ListIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL INSPECTION DRAWER */}
      {detailLab && (
        <div className="bg-surface rounded-2xl border-2 border-primary/40 shadow-card p-6 space-y-6 animate-fade-in relative">
          <button
            type="button"
            onClick={() => setDetailLab(null)}
            className="absolute right-4 top-4 text-muted hover:text-text p-1.5 rounded-xl border border-border bg-background hover:bg-hover transition"
            title="Close Drawer"
          >
            <X size={16} />
          </button>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <span>Practice Labs</span>
            <span>/</span>
            <span className="text-primary font-bold">{detailLab.labId}</span>
            <span>/</span>
            <span className="text-text font-bold truncate max-w-sm">{detailLab.title}</span>
          </div>

          {/* Header Summary */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-primary/10 text-primary border border-primary/20">
                  {detailLab.labId}
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-stone-100 text-stone-700">
                  {detailLab.labType}
                </span>
                <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-amber-50 text-amber-800 border border-amber-200">
                  {detailLab.difficulty}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                  detailLab.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : detailLab.status === 'In Progress'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-stone-50 text-stone-700 border border-stone-200'
                }`}>
                  {detailLab.status}
                </span>
                <span className="text-xs text-muted flex items-center gap-1 font-mono">
                  <Clock size={12} /> {detailLab.estimatedDuration}
                </span>
              </div>
              <h2 className="text-2xl font-black font-display text-text">{detailLab.title}</h2>
              {detailLab.learningObjective && (
                <p className="text-xs font-semibold text-primary">{detailLab.learningObjective}</p>
              )}
              {detailLab.shortDescription && (
                <p className="text-xs text-muted leading-relaxed">{detailLab.shortDescription}</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              {detailLab.status !== 'Completed' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartLab(detailLab._id)}
                    className="button-secondary text-xs flex items-center gap-1.5"
                  >
                    <Play size={13} className="text-primary fill-primary" /> Start / Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteLab(detailLab._id)}
                    className="button-primary text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} /> Complete Lab
                  </button>
                </>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Completed
                </span>
              )}

              {canEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => openEdit(detailLab)}
                    className="button-secondary text-xs flex items-center gap-1.5"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(detailLab)}
                    className="button-ghost text-xs text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress Strip */}
          <div className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted font-mono text-[11px]">
                  Tasks: {(detailLab.tasks || []).filter(t => t.isCompleted).length}/{(detailLab.tasks || []).length} completed
                </span>
                <span className="text-primary font-mono">{detailLab.completionPercentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${detailLab.completionPercentage}%` }}
                />
              </div>
            </div>
            {detailLab.attemptsCount > 0 && (
              <span className="text-xs font-mono text-muted shrink-0">
                Practice Attempts: <strong className="text-text">{detailLab.attemptsCount}</strong>
              </span>
            )}
          </div>

          {/* Drawer Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-border overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview & Domains' },
              { id: 'tasks', label: `Tasks & Commands (${(detailLab.tasks || []).length})` },
              { id: 'technical', label: 'Environment & Tools' },
              { id: 'docs', label: `Markdown Docs (${(detailLab.markdownFiles || []).length})` },
              { id: 'attachments', label: `Attachments (${(detailLab.attachments || []).length})` },
              { id: 'evidence', label: `Evidence (${(detailLab.evidence || []).length})` },
              { id: 'notes', label: 'Notes & Reflection' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDetailTab(tab.id)}
                className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                  detailTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & DOMAINS */}
          {detailTab === 'overview' && (
            <div className="space-y-4">
              {detailLab.detailedDescription && (
                <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted block">Detailed Overview</span>
                  <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">{detailLab.detailedDescription}</p>
                </div>
              )}

              {/* Associated Domains & Subdomains */}
              {detailLab.domainAssociations && detailLab.domainAssociations.length > 0 && (
                <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted block">
                    Associated Domains & Specializations ({detailLab.domainAssociations.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {detailLab.domainAssociations.map((da, idx) => {
                      const domName = da.domainId?.name || 'Engineering Domain';
                      const accent = da.domainId?.accentColor || '#bb9457';
                      const subs = da.subdomains || [];
                      return (
                        <div key={idx} className="p-3 rounded-xl bg-surface border border-border space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                            <strong className="text-xs font-bold text-text truncate">{domName}</strong>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {subs.length > 0 ? (
                              subs.map((s, sIdx) => (
                                <span key={sIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-border text-muted">
                                  {s.name || s}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted italic">Core domain scope</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Connected Entities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(detailLab.linkedSkills || []).length > 0 && (
                  <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-muted block">Connected Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {detailLab.linkedSkills.map((sk, idx) => (
                        <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text">
                          {sk.name || sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(detailLab.linkedRoadmaps || []).length > 0 && (
                  <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-muted block">Connected Roadmaps</span>
                    <div className="flex flex-wrap gap-1.5">
                      {detailLab.linkedRoadmaps.map((rm, idx) => (
                        <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text">
                          {rm.title || rm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TASKS & COMMANDS */}
          {detailTab === 'tasks' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-text block">Actionable Lab Tasks</span>
                <div className="space-y-1.5">
                  {(detailLab.tasks || []).map((t, idx) => (
                    <div
                      key={t.id || idx}
                      onClick={() => handleToggleTask(t.id, t.isCompleted)}
                      className="p-3 rounded-xl border border-border bg-background hover:border-primary/50 transition cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {t.isCompleted ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Square size={16} className="text-muted shrink-0" />
                        )}
                        <span className={t.isCompleted ? 'line-through text-muted' : 'text-text font-bold'}>
                          {t.title}
                        </span>
                      </div>
                      {t.completedAt && (
                        <span className="text-[10px] font-mono text-muted">
                          Verified {new Date(t.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                  {(!detailLab.tasks || detailLab.tasks.length === 0) && (
                    <p className="text-xs text-muted italic">No granular tasks defined.</p>
                  )}
                </div>
              </div>

              {/* Commands execution snippets */}
              {(detailLab.commands || []).length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-text block flex items-center gap-1.5">
                    <Terminal size={14} className="text-primary" /> Key Commands & Scripts
                  </span>
                  <div className="space-y-2">
                    {detailLab.commands.map((cmd, idx) => (
                      <pre key={idx} className="p-3 rounded-xl bg-stone-900 font-mono text-xs text-stone-100 overflow-x-auto">
                        <code>{cmd}</code>
                      </pre>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion criteria */}
              {(detailLab.completionCriteria || []).length > 0 && (
                <div className="p-3.5 rounded-xl border border-border bg-background space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted block">Completion Criteria</span>
                  <ul className="list-disc pl-5 text-xs text-text space-y-1">
                    {detailLab.completionCriteria.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TECHNICAL ENVIRONMENT */}
          {detailTab === 'technical' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <span className="text-xs font-bold text-text block flex items-center gap-1.5">
                  <Cpu size={14} className="text-primary" /> Operating System & Environment
                </span>
                <p className="text-xs text-text"><strong>OS:</strong> {detailLab.operatingSystem || 'Linux'}</p>
                <p className="text-xs text-text"><strong>Target Environment:</strong> {detailLab.requiredEnvironment || 'Sandbox'}</p>
                {detailLab.hardwareRequirements && (
                  <p className="text-xs text-text"><strong>Hardware:</strong> {detailLab.hardwareRequirements}</p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <span className="text-xs font-bold text-text block flex items-center gap-1.5">
                  <Activity size={14} className="text-primary" /> Technologies & Tools
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(detailLab.technologies || []).map((tech, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] font-bold">
                      {tech}
                    </span>
                  ))}
                  {(!detailLab.technologies || detailLab.technologies.length === 0) && (
                    <span className="text-xs text-muted italic">No specific technologies tagged.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MARKDOWN DOCUMENTATION (PART C) */}
          {detailTab === 'docs' && (
            <MarkdownDocumentEditor
              documents={detailLab.markdownFiles || []}
              onSaveDocument={handleSaveMarkdownDoc}
              onDeleteDocument={handleDeleteMarkdownDoc}
              contextType="lab"
              canEdit={canEdit}
            />
          )}

          {/* TAB 5: ATTACHMENTS (PART D) */}
          {detailTab === 'attachments' && (
            <AttachmentManager
              attachments={detailLab.attachments || []}
              onUploadFile={handleUploadAttachment}
              onDeleteFile={handleDeleteAttachment}
              canEdit={canEdit}
            />
          )}

          {/* TAB 6: EVIDENCE RECORDS */}
          {detailTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-text">Verified Lab Evidence & Telemetry</span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEvidenceModalOpen(true)}
                    className="button-primary text-xs flex items-center gap-1.5"
                  >
                    <Plus size={13} /> + Log Evidence
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(detailLab.evidence || []).map(ev => (
                  <div key={ev.id} className="p-3.5 rounded-xl border border-border bg-background space-y-1.5 relative">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-text">{ev.title}</strong>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEvidence(ev.id)}
                          className="text-muted hover:text-rose-600 p-0.5"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-primary block">{ev.evidenceType}</span>
                    {ev.description && <p className="text-xs text-muted leading-relaxed">{ev.description}</p>}
                    <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
                      {ev.fileUrl && (
                        <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          View Attachment <ExternalLink size={10} />
                        </a>
                      )}
                      {ev.externalUrl && (
                        <a href={ev.externalUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          External Link <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {(!detailLab.evidence || detailLab.evidence.length === 0) && (
                  <p className="text-xs text-muted italic col-span-2">No evidence records logged yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: PRIVATE NOTES & REFLECTION */}
          {detailTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <span className="text-xs font-bold text-text block">Personal Practice Notes</span>
                <p className="text-xs text-text whitespace-pre-wrap leading-relaxed">
                  {detailLab.personalNotes || '_No personal notes written._'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <span className="text-xs font-bold text-text block">Learning Reflection & Synthesis</span>
                <p className="text-xs text-text whitespace-pre-wrap leading-relaxed">
                  {detailLab.learningReflection || '_No reflection logged._'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LABS GRID / LIST VIEW */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-muted">
          Loading practical engineering labs and telemetry…
        </div>
      ) : filteredLabs.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
          {filteredLabs.map(lab => {
            const completedCount = (lab.tasks || []).filter(t => t.isCompleted).length;
            const totalTasks = (lab.tasks || []).length;

            return (
              <div
                key={lab._id}
                className="panel-card bg-surface rounded-2xl border border-border p-5 shadow-xs hover:shadow-card transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                        {lab.labId}
                      </span>
                      {lab.domainAssociations && lab.domainAssociations.length > 0 ? (
                        lab.domainAssociations.map((da, idx) => {
                          const dName = da.domainId?.name || 'Domain';
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
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-surface border border-border text-muted">
                          {lab.primaryDomain?.name || 'General'}
                        </span>
                      )}
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      lab.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : lab.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-stone-50 text-stone-700 border border-stone-200'
                    }`}>
                      {lab.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      onClick={() => {
                        setDetailLab(lab);
                        setDetailTab('overview');
                      }}
                      className="text-base font-bold text-text font-display hover:text-primary transition cursor-pointer line-clamp-1"
                    >
                      {lab.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                      {lab.shortDescription || lab.learningObjective || 'Hands-on practical exercise.'}
                    </p>
                  </div>

                  {/* Progress Strip */}
                  <div className="space-y-1.5 bg-background p-3 rounded-xl border border-border">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-muted font-mono text-[11px]">
                        {completedCount}/{totalTasks} tasks
                      </span>
                      <span className="font-mono text-primary text-xs font-black">{lab.completionPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${lab.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Technologies Pills */}
                  {(lab.technologies || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {lab.technologies.slice(0, 4).map((tech, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                          {tech}
                        </span>
                      ))}
                      {lab.technologies.length > 4 && (
                        <span className="text-[10px] font-mono text-muted">+{lab.technologies.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3.5 border-t border-border mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailLab(lab);
                      setDetailTab('overview');
                    }}
                    className="button-secondary text-xs flex items-center gap-1"
                  >
                    <Eye size={13} /> View Lab
                  </button>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(lab)}
                        className="p-1.5 rounded-lg border border-border text-muted hover:text-text transition"
                        title="Duplicate Lab"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(lab)}
                        className="p-1.5 rounded-lg border border-border text-muted hover:text-text transition"
                        title="Edit Lab"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(lab)}
                        className="p-1.5 rounded-lg text-muted hover:text-rose-600 transition"
                        title="Delete Lab"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No practice labs found"
          description={viewArchived ? 'No archived practice labs found.' : 'Create your first practical engineering lab to begin hands-on experiments.'}
        />
      )}

      {/* CREATE / EDIT MODAL */}
      {modal && (
        <Modal
          title={editing ? `Edit Lab: ${editing.labId}` : 'Create Practice Lab'}
          onClose={() => setModal(false)}
        >
          {isViewer && <ReadOnlyNotice feature="Practice Labs" />}
          <form onSubmit={handleSave} className="space-y-4">
            <fieldset disabled={isViewer} className="contents">
              {/* Modal Tabs */}
              <div className="flex items-center gap-1 border-b border-border mb-4">
                {[
                  { id: 'basic', label: '1. Basic Info & Domains' },
                  { id: 'technical', label: '2. Environment & Tools' },
                  { id: 'tasks', label: '3. Tasks & Criteria' },
                  { id: 'relationships', label: '4. Linked Entities' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModalTab(tab.id)}
                    className={`px-3 py-1.5 text-xs font-bold border-b-2 transition ${
                      modalTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: BASIC INFO */}
              {modalTab === 'basic' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Lab Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Linux Process Management & Systemd Service Architecture"
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-text block mb-1">Difficulty</label>
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
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text block mb-1">Lab Type</label>
                      <select
                        value={form.labType}
                        onChange={e => setForm(f => ({ ...f, labType: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="Guided Lab">Guided Lab</option>
                        <option value="Challenge Lab">Challenge Lab</option>
                        <option value="Simulation">Simulation</option>
                        <option value="Troubleshooting">Troubleshooting</option>
                        <option value="Experiment">Experiment</option>
                        <option value="Practical Exercise">Practical Exercise</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text block mb-1">Estimated Duration</label>
                      <input
                        type="text"
                        value={form.estimatedDuration}
                        onChange={e => setForm(f => ({ ...f, estimatedDuration: e.target.value }))}
                        placeholder="e.g. 1 hour / 45 mins"
                        className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {/* Multi-Domain Selector */}
                  <div className="p-3.5 bg-background rounded-xl border border-border space-y-2">
                    <span className="text-xs font-bold text-text block">
                      Engineering Domains & Subdomain Specializations
                    </span>
                    <MultiDomainSubdomainSelector
                      value={form.domainAssociations || []}
                      onChange={associations => {
                        setForm(f => {
                          const primaryAssoc = associations[0];
                          const primaryId = primaryAssoc?.domainId || '';
                          return {
                            ...f,
                            domainAssociations: associations,
                            primaryDomain: primaryId,
                            subdomainId: primaryAssoc?.subdomainIds?.[0] || '',
                            secondaryDomains: associations.slice(1).map(a => a.domainId)
                          };
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Learning Objective</label>
                    <input
                      type="text"
                      value={form.learningObjective}
                      onChange={e => setForm(f => ({ ...f, learningObjective: e.target.value }))}
                      placeholder="What core capability or mental model does this lab instill?"
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Short Description</label>
                    <textarea
                      rows="2"
                      value={form.shortDescription}
                      onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                      placeholder="Brief summary of the exercise..."
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL ENVIRONMENT */}
              {modalTab === 'technical' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-text block mb-1">Operating System</label>
                      <input
                        type="text"
                        value={form.operatingSystem}
                        onChange={e => setForm(f => ({ ...f, operatingSystem: e.target.value }))}
                        placeholder="e.g. Ubuntu 22.04 LTS / Alpine Linux"
                        className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text block mb-1">Target Environment</label>
                      <input
                        type="text"
                        value={form.requiredEnvironment}
                        onChange={e => setForm(f => ({ ...f, requiredEnvironment: e.target.value }))}
                        placeholder="e.g. AWS Sandbox, Docker, Vagrant"
                        className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Technologies (Comma separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(form.technologies) ? form.technologies.join(', ') : ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                      placeholder="e.g. Docker, Systemd, Linux, Bash"
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Required Commands & Snippets (One per line)</label>
                    <textarea
                      rows="3"
                      value={Array.isArray(form.commands) ? form.commands.join('\n') : ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        commands: e.target.value.split('\n').filter(Boolean)
                      }))}
                      placeholder="systemctl start my-service&#10;journalctl -u my-service -f"
                      className="w-full font-mono text-xs px-3 py-2 border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: TASKS & CRITERIA */}
              {modalTab === 'tasks' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text">Tasks Checklist</label>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        tasks: [...(f.tasks || []), { title: '', isCompleted: false }]
                      }))}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      + Add Task
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {(form.tasks || []).map((t, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={t.title}
                          onChange={e => {
                            const val = e.target.value;
                            setForm(f => {
                              const copy = [...f.tasks];
                              copy[idx].title = val;
                              return { ...f, tasks: copy };
                            });
                          }}
                          placeholder={`Task ${idx + 1}`}
                          className="flex-1 px-3 py-1.5 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({
                            ...f,
                            tasks: f.tasks.filter((_, i) => i !== idx)
                          }))}
                          className="text-muted hover:text-rose-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Completion Criteria (One per line)</label>
                    <textarea
                      rows="2"
                      value={Array.isArray(form.completionCriteria) ? form.completionCriteria.join('\n') : ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        completionCriteria: e.target.value.split('\n').filter(Boolean)
                      }))}
                      placeholder="Service auto-restarts upon failure&#10;Memory limits enforced correctly"
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: RELATIONSHIPS */}
              {modalTab === 'relationships' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Linked Skills</label>
                    <select
                      multiple
                      value={form.linkedSkills}
                      onChange={e => {
                        const vals = Array.from(e.target.selectedOptions, opt => opt.value);
                        setForm(f => ({ ...f, linkedSkills: vals }));
                      }}
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text h-24"
                    >
                      {availableSkills.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.category})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Linked Roadmaps</label>
                    <select
                      multiple
                      value={form.linkedRoadmaps}
                      onChange={e => {
                        const vals = Array.from(e.target.selectedOptions, opt => opt.value);
                        setForm(f => ({ ...f, linkedRoadmaps: vals }));
                      }}
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text h-20"
                    >
                      {availableRoadmaps.map(r => (
                        <option key={r._id} value={r._id}>{r.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </fieldset>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <button
                type="button"
                className="button-secondary text-xs"
                onClick={() => setModal(false)}
              >
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button
                  type="submit"
                  disabled={busy}
                  className="button-primary text-xs"
                >
                  {editing ? 'Save Changes' : 'Create Lab'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* EVIDENCE LOGGING MODAL */}
      {evidenceModalOpen && (
        <Modal
          title="Log Practical Evidence"
          onClose={() => setEvidenceModalOpen(false)}
        >
          <form onSubmit={handleAddEvidence} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-text block mb-1">Evidence Title *</label>
              <input
                type="text"
                value={evidenceForm.title}
                onChange={e => setEvidenceForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Successful systemd health check assertion"
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text block mb-1">Evidence Type</label>
              <select
                value={evidenceForm.evidenceType}
                onChange={e => setEvidenceForm(f => ({ ...f, evidenceType: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Screenshot / Terminal Log">Screenshot / Terminal Log</option>
                <option value="Git Commit / PR">Git Commit / PR</option>
                <option value="Configuration File">Configuration File</option>
                <option value="Live URL Verification">Live URL Verification</option>
                <option value="Test Execution Report">Test Execution Report</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text block mb-1">File URL or External URL</label>
              <input
                type="text"
                value={evidenceForm.fileUrl}
                onChange={e => setEvidenceForm(f => ({ ...f, fileUrl: e.target.value }))}
                placeholder="https://... or /uploads/..."
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text block mb-1">Verification Notes</label>
              <textarea
                rows="2"
                value={evidenceForm.description}
                onChange={e => setEvidenceForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Observed output and verification details..."
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="button-secondary text-xs"
                onClick={() => setEvidenceModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button-primary text-xs">
                Log Evidence
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Practice Lab"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}" (${deleteTarget.labId}) and all attached files? This action cannot be undone.`}
          confirmLabel="Delete Permanently"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminPracticeLabs;

