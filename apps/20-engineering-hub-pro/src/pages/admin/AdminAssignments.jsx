import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileCheck,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Archive,
  Search,
  X,
  Send,
  Award,
  CheckCircle2,
  Square,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  FileCode,
  Paperclip,
  Activity,
  AlertCircle,
  RotateCcw,
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

const emptyAssignment = {
  title: '',
  shortDescription: '',
  detailedDescription: '',
  objective: '',
  assignmentType: 'Practical',
  difficulty: 'Intermediate',
  estimatedDuration: '2 hours',
  priority: 'Medium',
  status: 'Not Started',
  domainAssociations: [],
  instructions: '',
  tasks: [
    { title: 'Read project brief and analyze requirements', isCompleted: false },
    { title: 'Implement deliverable according to specifications', isCompleted: false },
    { title: 'Validate tests and verify edge-cases', isCompleted: false },
    { title: 'Document implementation report and submit deliverables', isCompleted: false }
  ],
  technicalRequirements: [],
  constraints: [],
  prerequisites: [],
  expectedResults: '',
  completionCriteria: [],
  assignedDate: '',
  dueDate: '',
  expectedDeliverables: ['Source Code Repository', 'Markdown Documentation', 'Automated Test Suite'],
  maxMarks: 100,
  obtainedMarks: 0,
  evaluationCriteria: '',
  feedback: '',
  reviewComments: '',
  revisionRequests: '',
  linkedGoals: [],
  linkedRoadmaps: [],
  linkedSkills: [],
  linkedResources: [],
  relatedPracticeLabs: [],
  relatedProjects: [],
  privateNotes: ''
};

export function AdminAssignments() {
  const { isViewer, canEdit } = useAuth();
  const [assignments, setAssignments] = useState([]);
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
  const [availableLabs, setAvailableLabs] = useState([]);

  // Modals & Active state
  const [modal, setModal] = useState(false);
  const [modalTab, setModalTab] = useState('basic'); // basic, requirements, tasks, evaluation, relationships
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAssignment);
  const [detailAssignment, setDetailAssignment] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // overview, instructions, tasks, submissions, evaluation, docs, attachments, notes
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  // Submission Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ githubUrl: '', liveUrl: '', textResponse: '', notes: '' });

  // Evaluation Modal
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalForm, setEvalForm] = useState({ obtainedMarks: 0, maxMarks: 100, feedback: '', reviewComments: '', revisionRequests: '', status: 'Reviewed' });

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
      api('/practice-labs?all=true').catch(() => [])
    ]).then(([doms, sk, gl, rm, pr, lbs]) => {
      setAvailableDomains(Array.isArray(doms) ? doms : []);
      setAvailableSkills(Array.isArray(sk) ? sk : []);
      setAvailableGoals(Array.isArray(gl) ? gl : []);
      setAvailableRoadmaps(Array.isArray(rm) ? rm : []);
      setAvailableProjects(Array.isArray(pr) ? pr : []);
      setAvailableLabs(Array.isArray(lbs) ? lbs : []);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = viewArchived ? '/assignments?archived=true&all=true' : '/assignments?all=true';
      const data = await api(url);
      setAssignments(Array.isArray(data) ? data : []);
      if (detailAssignment) {
        const refreshed = data.find(a => a._id === detailAssignment._id);
        if (refreshed) setDetailAssignment(refreshed);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [viewArchived, detailAssignment?._id]);

  useEffect(() => {
    load();
  }, [load]);

  // Available Subdomains for toolbar
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

  // Filtered Assignments List
  const filteredAssignments = useMemo(() => {
    return assignments.filter(asn => {
      // Domain filter
      if (selectedDomain !== 'All') {
        const matchesMulti = (asn.domainAssociations || []).some(da =>
          (da.domainId?._id || da.domainId) === selectedDomain ||
          da.domainId?.name === selectedDomain
        );
        const matchesLegacy =
          (asn.primaryDomain?._id || asn.primaryDomain) === selectedDomain ||
          asn.primaryDomain?.name === selectedDomain;
        if (!matchesMulti && !matchesLegacy) return false;
      }

      // Subdomain filter
      if (selectedSubdomain !== 'All') {
        const matchesSub = (asn.domainAssociations || []).some(da =>
          (da.subdomainIds || []).some(sId => (sId._id || sId) === selectedSubdomain) ||
          (da.subdomains || []).some(s => s._id === selectedSubdomain || s.name === selectedSubdomain)
        );
        if (!matchesSub && asn.subdomainId !== selectedSubdomain) return false;
      }

      if (selectedDifficulty !== 'All' && asn.difficulty !== selectedDifficulty) return false;
      if (selectedType !== 'All' && asn.assignmentType !== selectedType) return false;
      if (selectedStatus !== 'All' && asn.status !== selectedStatus) return false;

      if (search.trim()) {
        const s = search.toLowerCase();
        const titleMatch = (asn.title || '').toLowerCase().includes(s);
        const descMatch = (asn.shortDescription || '').toLowerCase().includes(s);
        const objMatch = (asn.objective || '').toLowerCase().includes(s);
        const idMatch = (asn.assignmentId || '').toLowerCase().includes(s);
        if (!titleMatch && !descMatch && !objMatch && !idMatch) return false;
      }

      return true;
    });
  }, [assignments, selectedDomain, selectedSubdomain, selectedDifficulty, selectedType, selectedStatus, search]);

  // Open Create
  function openCreate() {
    setEditing(null);
    setForm(emptyAssignment);
    setModalTab('basic');
    setModal(true);
  }

  // Open Edit
  function openEdit(asn) {
    setEditing(asn);
    const associations = (asn.domainAssociations && asn.domainAssociations.length > 0)
      ? asn.domainAssociations.map(da => ({
          domainId: da.domainId?._id || da.domainId || '',
          subdomainIds: (da.subdomainIds || []).map(s => s?._id || s)
        }))
      : (asn.primaryDomain ? [{
          domainId: asn.primaryDomain?._id || asn.primaryDomain,
          subdomainIds: (asn.subdomainId ? [asn.subdomainId] : [])
        }] : []);

    setForm({
      ...emptyAssignment,
      ...asn,
      dueDate: asn.dueDate ? new Date(asn.dueDate).toISOString().substring(0, 10) : '',
      assignedDate: asn.assignedDate ? new Date(asn.assignedDate).toISOString().substring(0, 10) : '',
      domainAssociations: associations,
      tasks: (asn.tasks || []).map(t => ({ ...t })),
      technicalRequirements: Array.isArray(asn.technicalRequirements) ? asn.technicalRequirements : [],
      constraints: Array.isArray(asn.constraints) ? asn.constraints : [],
      prerequisites: Array.isArray(asn.prerequisites) ? asn.prerequisites : [],
      completionCriteria: Array.isArray(asn.completionCriteria) ? asn.completionCriteria : [],
      expectedDeliverables: Array.isArray(asn.expectedDeliverables) ? asn.expectedDeliverables : [],
      linkedGoals: (asn.linkedGoals || []).map(g => g._id || g),
      linkedRoadmaps: (asn.linkedRoadmaps || []).map(r => r._id || r),
      linkedSkills: (asn.linkedSkills || []).map(s => s._id || s),
      relatedPracticeLabs: (asn.relatedPracticeLabs || []).map(l => l._id || l),
      relatedProjects: (asn.relatedProjects || []).map(p => p._id || p)
    });
    setModalTab('basic');
    setModal(true);
  }

  // Save Assignment
  async function handleSave(e) {
    e.preventDefault();
    if (isViewer) return;
    setBusy(true);
    try {
      if (editing) {
        const updated = await api(`/assignments/${editing._id}`, {
          method: 'PUT',
          body: jsonBody(form)
        });
        showToast('Assignment updated successfully');
        if (detailAssignment?._id === editing._id) setDetailAssignment(updated);
      } else {
        await api('/assignments', {
          method: 'POST',
          body: jsonBody(form)
        });
        showToast('Assignment created successfully');
      }
      setModal(false);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to save assignment');
    } finally {
      setBusy(false);
    }
  }

  // Delete Assignment
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api(`/assignments/${deleteTarget._id}`, { method: 'DELETE' });
      showToast('Assignment deleted permanently');
      if (detailAssignment?._id === deleteTarget._id) setDetailAssignment(null);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to delete assignment');
    }
  }

  // Duplicate Assignment
  async function handleDuplicate(asn) {
    try {
      await api(`/assignments/${asn._id}/duplicate`, { method: 'POST' });
      showToast(`Duplicated "${asn.title}"`);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate assignment');
    }
  }

  // Toggle Task
  async function handleToggleTask(taskId, currentStatus) {
    if (!detailAssignment) return;
    try {
      const res = await api(`/assignments/${detailAssignment._id}/toggle-task`, {
        method: 'PUT',
        body: jsonBody({ taskId, isCompleted: !currentStatus })
      });
      setDetailAssignment(prev => ({
        ...prev,
        tasks: res.tasks,
        status: res.status
      }));
    } catch (err) {
      showToast(err.message || 'Failed to toggle task');
    }
  }

  // Submit / Resubmit Deliverable (Part E)
  async function handleSubmitAssignment(e) {
    e.preventDefault();
    if (!detailAssignment) return;
    try {
      const res = await api(`/assignments/${detailAssignment._id}/submit`, {
        method: 'POST',
        body: jsonBody(submitForm)
      });
      setDetailAssignment(prev => ({
        ...prev,
        submissions: res.submissions,
        status: res.status
      }));
      setSubmitModalOpen(false);
      setSubmitForm({ githubUrl: '', liveUrl: '', textResponse: '', notes: '' });
      showToast(`Deliverable successfully submitted (v${res.latestSubmission?.version})!`);
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to submit assignment');
    }
  }

  // Evaluate / Grade Assignment (Part E)
  async function handleEvaluateAssignment(e) {
    e.preventDefault();
    if (!detailAssignment) return;
    try {
      const updated = await api(`/assignments/${detailAssignment._id}/evaluate`, {
        method: 'PUT',
        body: jsonBody(evalForm)
      });
      setDetailAssignment(updated);
      setEvalModalOpen(false);
      showToast('Assignment evaluation and feedback saved!');
      await load();
    } catch (err) {
      showToast(err.message || 'Failed to save evaluation');
    }
  }

  // Markdown Document Handlers
  async function handleSaveMarkdownDoc(docData) {
    if (!detailAssignment) return;
    if (docData.id) {
      const updated = await api(`/assignments/${detailAssignment._id}/markdown/${docData.id}`, {
        method: 'PUT',
        body: jsonBody(docData)
      });
      setDetailAssignment(prev => ({
        ...prev,
        markdownFiles: prev.markdownFiles.map(d => d.id === docData.id ? updated : d)
      }));
      return updated;
    } else {
      const created = await api(`/assignments/${detailAssignment._id}/markdown`, {
        method: 'POST',
        body: jsonBody(docData)
      });
      setDetailAssignment(prev => ({
        ...prev,
        markdownFiles: [...(prev.markdownFiles || []), created]
      }));
      return created;
    }
  }

  async function handleDeleteMarkdownDoc(docId) {
    if (!detailAssignment) return;
    await api(`/assignments/${detailAssignment._id}/markdown/${docId}`, { method: 'DELETE' });
    setDetailAssignment(prev => ({
      ...prev,
      markdownFiles: prev.markdownFiles.filter(d => d.id !== docId)
    }));
  }

  // Attachment Handlers
  async function handleUploadAttachment(file) {
    if (!detailAssignment) return;
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('eh_token') || '';
    const res = await fetch(`/api/assignments/${detailAssignment._id}/attachments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Upload failed');
    }
    const uploaded = await res.json();
    setDetailAssignment(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), uploaded]
    }));
    showToast('Attachment uploaded successfully');
    return uploaded;
  }

  async function handleDeleteAttachment(attachmentId) {
    if (!detailAssignment) return;
    await api(`/assignments/${detailAssignment._id}/attachments/${attachmentId}`, { method: 'DELETE' });
    setDetailAssignment(prev => ({
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
          <p className="eyebrow">STRUCTURED COURSEWORK & PRACTICAL ASSESSMENTS</p>
          <h1 className="admin-title">Technical <em>Assignments</em></h1>
          <p className="admin-subtitle">
            Curated engineering challenges, coding tasks, research documentation, and practical deliverables with rubrics and submission history.
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
              <Plus size={16} /> New Assignment
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
          All Domains ({assignments.length})
        </button>
        {availableDomains.map(d => {
          const isSelected = selectedDomain === d.name || selectedDomain === d._id;
          const count = assignments.filter(a =>
            (a.domainAssociations || []).some(da => (da.domainId?._id || da.domainId) === d._id || da.domainId?.name === d.name) ||
            (a.primaryDomain?._id || a.primaryDomain) === d._id
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
              placeholder="Search assignments, objectives, IDs…"
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

          {/* Assignment Type */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-text outline-none"
          >
            <option value="All">All Types</option>
            <option value="Coding">Coding</option>
            <option value="Practical">Practical</option>
            <option value="Research">Research</option>
            <option value="Documentation">Documentation</option>
            <option value="Case Study">Case Study</option>
            <option value="Configuration">Configuration</option>
            <option value="Project-Based">Project-Based</option>
            <option value="Assessment">Assessment</option>
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
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Revision Required">Revision Required</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-end lg:self-auto text-muted">
          <span className="text-xs font-mono">
            <strong>{filteredAssignments.length}</strong> {filteredAssignments.length === 1 ? 'assignment' : 'assignments'}
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
      {detailAssignment && (
        <div className="bg-surface rounded-2xl border-2 border-primary/40 shadow-card p-6 space-y-6 animate-fade-in relative">
          <button
            type="button"
            onClick={() => setDetailAssignment(null)}
            className="absolute right-4 top-4 text-muted hover:text-text p-1.5 rounded-xl border border-border bg-background hover:bg-hover transition"
            title="Close Drawer"
          >
            <X size={16} />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <span>Assignments</span>
            <span>/</span>
            <span className="text-primary font-bold">{detailAssignment.assignmentId}</span>
            <span>/</span>
            <span className="text-text font-bold truncate max-w-sm">{detailAssignment.title}</span>
          </div>

          {/* Header Summary */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-primary/10 text-primary border border-primary/20">
                  {detailAssignment.assignmentId}
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-stone-100 text-stone-700">
                  {detailAssignment.assignmentType}
                </span>
                <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-amber-50 text-amber-800 border border-amber-200">
                  {detailAssignment.difficulty}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                  detailAssignment.status === 'Completed' || detailAssignment.status === 'Reviewed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : detailAssignment.status === 'Submitted'
                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                    : detailAssignment.status === 'Revision Required'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {detailAssignment.status}
                </span>
                {detailAssignment.dueDate && (
                  <span className="text-xs text-muted flex items-center gap-1 font-mono">
                    <Calendar size={12} className="text-rose-600" /> Due: {new Date(detailAssignment.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black font-display text-text">{detailAssignment.title}</h2>
              {detailAssignment.objective && (
                <p className="text-xs font-semibold text-primary">{detailAssignment.objective}</p>
              )}
              {detailAssignment.shortDescription && (
                <p className="text-xs text-muted leading-relaxed">{detailAssignment.shortDescription}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(true)}
                className="button-primary text-xs flex items-center gap-1.5"
              >
                <Send size={13} />
                {(detailAssignment.submissions || []).length > 0 ? 'Resubmit Deliverable' : 'Submit Assignment'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEvalForm({
                    obtainedMarks: detailAssignment.obtainedMarks || 0,
                    maxMarks: detailAssignment.maxMarks || 100,
                    feedback: detailAssignment.feedback || '',
                    reviewComments: detailAssignment.reviewComments || '',
                    revisionRequests: detailAssignment.revisionRequests || '',
                    status: detailAssignment.status || 'Reviewed'
                  });
                  setEvalModalOpen(true);
                }}
                className="button-secondary text-xs flex items-center gap-1.5"
              >
                <Award size={13} /> Evaluate / Rubric
              </button>

              {canEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => openEdit(detailAssignment)}
                    className="button-secondary text-xs flex items-center gap-1.5"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(detailAssignment)}
                    className="button-ghost text-xs text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Grade / Evaluation Banner (if evaluated) */}
          {detailAssignment.maxMarks > 0 && typeof detailAssignment.obtainedMarks === 'number' && (
            <div className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Award size={18} />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-muted block">Score / Evaluation</span>
                  <span className="text-sm font-bold text-text font-mono">
                    {detailAssignment.obtainedMarks} / {detailAssignment.maxMarks} marks
                  </span>
                </div>
              </div>
              <span className="text-base font-black font-mono text-primary px-3 py-1 rounded-xl bg-surface border border-border">
                {detailAssignment.percentage}%
              </span>
            </div>
          )}

          {/* Drawer Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-border overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview & Scope' },
              { id: 'instructions', label: 'Instructions & Requirements' },
              { id: 'tasks', label: `Tasks Checklist (${(detailAssignment.tasks || []).length})` },
              { id: 'submissions', label: `Deliverable Submissions (${(detailAssignment.submissions || []).length})` },
              { id: 'evaluation', label: 'Rubric & Feedback' },
              { id: 'docs', label: `Markdown Docs (${(detailAssignment.markdownFiles || []).length})` },
              { id: 'attachments', label: `Attachments (${(detailAssignment.attachments || []).length})` },
              { id: 'notes', label: 'Private Notes' }
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

          {/* TAB 1: OVERVIEW */}
          {detailTab === 'overview' && (
            <div className="space-y-4">
              {detailAssignment.detailedDescription && (
                <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted block">Detailed Overview</span>
                  <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">{detailAssignment.detailedDescription}</p>
                </div>
              )}

              {/* Multi-Domain Associations */}
              {detailAssignment.domainAssociations && detailAssignment.domainAssociations.length > 0 && (
                <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted block">
                    Associated Domains & Specializations ({detailAssignment.domainAssociations.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {detailAssignment.domainAssociations.map((da, idx) => {
                      const domName = da.domainId?.name || 'Domain';
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
            </div>
          )}

          {/* TAB 2: INSTRUCTIONS & REQUIREMENTS */}
          {detailTab === 'instructions' && (
            <div className="space-y-4">
              {detailAssignment.instructions && (
                <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                  <span className="text-xs font-bold text-text block">Detailed Instructions</span>
                  <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">{detailAssignment.instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(detailAssignment.technicalRequirements || []).length > 0 && (
                  <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
                    <span className="text-xs font-bold text-text block">Technical Requirements</span>
                    <ul className="list-disc pl-5 text-xs text-text space-y-1">
                      {detailAssignment.technicalRequirements.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(detailAssignment.expectedDeliverables || []).length > 0 && (
                  <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
                    <span className="text-xs font-bold text-text block">Expected Deliverables</span>
                    <ul className="list-disc pl-5 text-xs text-text space-y-1">
                      {detailAssignment.expectedDeliverables.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {detailTab === 'tasks' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-text block">Assignment Subtasks & Progress</span>
              <div className="space-y-1.5">
                {(detailAssignment.tasks || []).map((t, idx) => (
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
              </div>
            </div>
          )}

          {/* TAB 4: SUBMISSIONS (PART E) */}
          {detailTab === 'submissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-text">Submission History & Revisions</span>
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(true)}
                  className="button-primary text-xs flex items-center gap-1.5"
                >
                  <Send size={13} /> Submit Revised Work
                </button>
              </div>

              <div className="space-y-3">
                {(detailAssignment.submissions || []).map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-background space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-primary/10 text-primary">
                          Revision #{sub.version}
                        </span>
                        <span className="text-[11px] font-mono text-muted">
                          Submitted on {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface border border-border text-text">
                        {sub.status || 'Submitted'}
                      </span>
                    </div>

                    {sub.githubUrl && (
                      <div className="text-xs flex items-center gap-2">
                        <strong className="text-muted">Repository:</strong>
                        <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          {sub.githubUrl} <ExternalLink size={10} />
                        </a>
                      </div>
                    )}

                    {sub.liveUrl && (
                      <div className="text-xs flex items-center gap-2">
                        <strong className="text-muted">Live Demo:</strong>
                        <a href={sub.liveUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          {sub.liveUrl} <ExternalLink size={10} />
                        </a>
                      </div>
                    )}

                    {sub.textResponse && (
                      <div className="p-3 rounded-lg bg-surface border border-border text-xs text-text whitespace-pre-wrap">
                        {sub.textResponse}
                      </div>
                    )}
                  </div>
                ))}

                {(!detailAssignment.submissions || detailAssignment.submissions.length === 0) && (
                  <div className="p-8 text-center bg-background border border-dashed border-border rounded-xl">
                    <Send size={24} className="mx-auto text-muted/60 mb-2" />
                    <span className="text-xs text-muted block">No deliverables submitted yet.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: EVALUATION & FEEDBACK */}
          {detailTab === 'evaluation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-text">Review Comments & Rubric Feedback</span>
                <button
                  type="button"
                  onClick={() => {
                    setEvalForm({
                      obtainedMarks: detailAssignment.obtainedMarks || 0,
                      maxMarks: detailAssignment.maxMarks || 100,
                      feedback: detailAssignment.feedback || '',
                      reviewComments: detailAssignment.reviewComments || '',
                      revisionRequests: detailAssignment.revisionRequests || '',
                      status: detailAssignment.status || 'Reviewed'
                    });
                    setEvalModalOpen(true);
                  }}
                  className="button-primary text-xs flex items-center gap-1.5"
                >
                  <Award size={13} /> Update Evaluation
                </button>
              </div>

              {detailAssignment.feedback && (
                <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-primary block">Evaluation Feedback</span>
                  <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">{detailAssignment.feedback}</p>
                </div>
              )}

              {detailAssignment.revisionRequests && (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-700 block">Revision Requests</span>
                  <p className="text-xs text-rose-900 leading-relaxed whitespace-pre-wrap">{detailAssignment.revisionRequests}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MARKDOWN DOCUMENTS (PART C) */}
          {detailTab === 'docs' && (
            <MarkdownDocumentEditor
              documents={detailAssignment.markdownFiles || []}
              onSaveDocument={handleSaveMarkdownDoc}
              onDeleteDocument={handleDeleteMarkdownDoc}
              contextType="assignment"
              canEdit={canEdit}
            />
          )}

          {/* TAB 7: ATTACHMENTS (PART D) */}
          {detailTab === 'attachments' && (
            <AttachmentManager
              attachments={detailAssignment.attachments || []}
              onUploadFile={handleUploadAttachment}
              onDeleteFile={handleDeleteAttachment}
              canEdit={canEdit}
            />
          )}

          {/* TAB 8: PRIVATE NOTES */}
          {detailTab === 'notes' && (
            <div className="p-4 rounded-xl border border-border bg-background space-y-2">
              <span className="text-xs font-bold text-text block">Private Engineering Notes</span>
              <p className="text-xs text-text whitespace-pre-wrap leading-relaxed">
                {detailAssignment.privateNotes || '_No private notes written._'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ASSIGNMENTS GRID / LIST VIEW */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-muted">
          Loading technical assignments and submissions…
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
          {filteredAssignments.map(asn => (
            <div
              key={asn._id}
              className="panel-card bg-surface rounded-2xl border border-border p-5 shadow-xs hover:shadow-card transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                      {asn.assignmentId}
                    </span>
                    {asn.domainAssociations && asn.domainAssociations.length > 0 ? (
                      asn.domainAssociations.map((da, idx) => {
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
                        {asn.primaryDomain?.name || 'General'}
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    asn.status === 'Completed' || asn.status === 'Reviewed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : asn.status === 'Submitted'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : asn.status === 'Revision Required'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    {asn.status}
                  </span>
                </div>

                {/* Title & Short Description */}
                <div>
                  <h3
                    onClick={() => {
                      setDetailAssignment(asn);
                      setDetailTab('overview');
                    }}
                    className="text-base font-bold text-text font-display hover:text-primary transition cursor-pointer line-clamp-1"
                  >
                    {asn.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                    {asn.shortDescription || asn.objective || 'Technical coursework deliverable.'}
                  </p>
                </div>

                {/* Metadata & Due Date */}
                <div className="space-y-1.5 bg-background p-3 rounded-xl border border-border text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted flex items-center gap-1">
                      <Clock size={11} /> {asn.estimatedDuration}
                    </span>
                    {asn.dueDate && (
                      <span className="text-text font-bold flex items-center gap-1">
                        <Calendar size={11} className="text-rose-600" /> Due: {new Date(asn.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {(asn.submissions || []).length > 0 && (
                    <div className="text-[10px] text-primary pt-1 border-t border-border/60">
                      Submissions: <strong>{asn.submissions.length} revision(s)</strong> logged
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3.5 border-t border-border mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDetailAssignment(asn);
                    setDetailTab('overview');
                  }}
                  className="button-secondary text-xs flex items-center gap-1"
                >
                  <Eye size={13} /> View Brief
                </button>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(asn)}
                      className="p-1.5 rounded-lg border border-border text-muted hover:text-text transition"
                      title="Duplicate Assignment"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(asn)}
                      className="p-1.5 rounded-lg border border-border text-muted hover:text-text transition"
                      title="Edit Assignment"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(asn)}
                      className="p-1.5 rounded-lg text-muted hover:text-rose-600 transition"
                      title="Delete Assignment"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No assignments found"
          description={viewArchived ? 'No archived assignments found.' : 'Create your first technical assignment or practical challenge.'}
        />
      )}

      {/* CREATE / EDIT MODAL */}
      {modal && (
        <Modal
          title={editing ? `Edit Assignment: ${editing.assignmentId}` : 'Create Technical Assignment'}
          onClose={() => setModal(false)}
        >
          {isViewer && <ReadOnlyNotice feature="Assignments" />}
          <form onSubmit={handleSave} className="space-y-4">
            <fieldset disabled={isViewer} className="contents">
              <div className="flex items-center gap-1 border-b border-border mb-4">
                {[
                  { id: 'basic', label: '1. Basic Info & Domains' },
                  { id: 'requirements', label: '2. Instructions & Scope' },
                  { id: 'tasks', label: '3. Tasks & Deliverables' },
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
                    <label className="text-xs font-bold text-text block mb-1">Assignment Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Automated Kubernetes Health Check & Self-Healing Controller"
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-text block mb-1">Type</label>
                      <select
                        value={form.assignmentType}
                        onChange={e => setForm(f => ({ ...f, assignmentType: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="Coding">Coding</option>
                        <option value="Practical">Practical</option>
                        <option value="Research">Research</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Case Study">Case Study</option>
                        <option value="Configuration">Configuration</option>
                        <option value="Project-Based">Project-Based</option>
                        <option value="Assessment">Assessment</option>
                      </select>
                    </div>

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
                      <label className="text-xs font-bold text-text block mb-1">Due Date</label>
                      <input
                        type="date"
                        value={form.dueDate}
                        onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30 font-mono"
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
                    <label className="text-xs font-bold text-text block mb-1">Assignment Objective</label>
                    <input
                      type="text"
                      value={form.objective}
                      onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
                      placeholder="High-level goal of this engineering challenge..."
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Short Description</label>
                    <textarea
                      rows="2"
                      value={form.shortDescription}
                      onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                      placeholder="Brief summary..."
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: INSTRUCTIONS & SCOPE */}
              {modalTab === 'requirements' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Detailed Instructions</label>
                    <textarea
                      rows="4"
                      value={form.instructions}
                      onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                      placeholder="Provide step-by-step guidance, architectural constraints, and requirements..."
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Technical Requirements (One per line)</label>
                    <textarea
                      rows="3"
                      value={Array.isArray(form.technicalRequirements) ? form.technicalRequirements.join('\n') : ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        technicalRequirements: e.target.value.split('\n').filter(Boolean)
                      }))}
                      placeholder="Must include Dockerfile&#10;Must pass lint and automated tests"
                      className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: TASKS & DELIVERABLES */}
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
                    <label className="text-xs font-bold text-text block mb-1">Expected Deliverables (One per line)</label>
                    <textarea
                      rows="2"
                      value={Array.isArray(form.expectedDeliverables) ? form.expectedDeliverables.join('\n') : ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        expectedDeliverables: e.target.value.split('\n').filter(Boolean)
                      }))}
                      placeholder="Source Code Repository&#10;Technical Report (PDF / Markdown)"
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
                  {editing ? 'Save Changes' : 'Create Assignment'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* SUBMISSION MODAL (PART E) */}
      {submitModalOpen && (
        <Modal
          title={`Submit Work: ${detailAssignment?.assignmentId}`}
          onClose={() => setSubmitModalOpen(false)}
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-text block mb-1">GitHub Repository URL</label>
              <input
                type="url"
                value={submitForm.githubUrl}
                onChange={e => setSubmitForm(f => ({ ...f, githubUrl: e.target.value }))}
                placeholder="https://github.com/username/repository"
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text block mb-1">Live Demo / Deployment URL</label>
              <input
                type="url"
                value={submitForm.liveUrl}
                onChange={e => setSubmitForm(f => ({ ...f, liveUrl: e.target.value }))}
                placeholder="https://my-assignment.demo.app"
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text block mb-1">Submission Notes & Summary</label>
              <textarea
                rows="3"
                value={submitForm.textResponse}
                onChange={e => setSubmitForm(f => ({ ...f, textResponse: e.target.value }))}
                placeholder="Explain your architectural choices, instructions for running the code, and key takeaways..."
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="button-secondary text-xs"
                onClick={() => setSubmitModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button-primary text-xs flex items-center gap-1.5">
                <Send size={13} /> Confirm Submission
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EVALUATION MODAL (PART E) */}
      {evalModalOpen && (
        <Modal
          title={`Evaluate Assignment: ${detailAssignment?.assignmentId}`}
          onClose={() => setEvalModalOpen(false)}
        >
          <form onSubmit={handleEvaluateAssignment} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-text block mb-1">Obtained Marks</label>
                <input
                  type="number"
                  min="0"
                  max={evalForm.maxMarks}
                  value={evalForm.obtainedMarks}
                  onChange={e => setEvalForm(f => ({ ...f, obtainedMarks: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text block mb-1">Max Marks</label>
                <input
                  type="number"
                  min="1"
                  value={evalForm.maxMarks}
                  onChange={e => setEvalForm(f => ({ ...f, maxMarks: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text block mb-1">Review Status</label>
              <select
                value={evalForm.status}
                onChange={e => setEvalForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Reviewed">Reviewed</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-text block mb-1">Evaluation Feedback</label>
              <textarea
                rows="3"
                value={evalForm.feedback}
                onChange={e => setEvalForm(f => ({ ...f, feedback: e.target.value }))}
                placeholder="Praise, architectural feedback, and optimization suggestions..."
                className="w-full px-3 py-2 text-xs border border-border bg-background rounded-xl text-text outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {evalForm.status === 'Revision Required' && (
              <div>
                <label className="text-xs font-bold text-rose-700 block mb-1">Specific Revision Requests</label>
                <textarea
                  rows="2"
                  value={evalForm.revisionRequests}
                  onChange={e => setEvalForm(f => ({ ...f, revisionRequests: e.target.value }))}
                  placeholder="What must be revised before this assignment is approved?"
                  className="w-full px-3 py-2 text-xs border border-rose-300 bg-rose-50/40 rounded-xl text-text outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="button-secondary text-xs"
                onClick={() => setEvalModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button-primary text-xs">
                Save Evaluation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Assignment"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}" (${deleteTarget.assignmentId}) and all attached files? This action cannot be undone.`}
          confirmLabel="Delete Permanently"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminAssignments;

