import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  Award,
  Target,
  CheckCircle2,
  BookOpen,
  Code2,
  FolderOpen,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Search,
  Trophy,
  BarChart3,
  Globe,
  Shield,
  FileBadge,
  Terminal,
  Cpu,
  Workflow,
  X,
  UploadCloud,
  Pencil,
  Link2Off
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Button } from '../../components/Button.jsx';
import { DomainSelector } from '../../components/DomainSelector.jsx';
import { Modal, ConfirmModal, Toast } from '../../components.jsx';
import { ResourceModal } from '../../components/ResourceModal.jsx';
import { ResourceDetailModal } from '../../components/ResourceDetailModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

const PROFICIENCY_LEVELS = ['Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert'];
const LEARNING_STATUSES = ['Planned', 'Learning', 'Practising', 'Demonstrated', 'Needs revision', 'On hold'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const TIME_HORIZONS = ['Long-term Vision', 'Strategic Goal', 'Short-term Goal', 'Weekly Action'];
const GOAL_STATUSES = ['Active', 'Planned', 'In Progress', 'Draft', 'On hold', 'Completed'];
const ROADMAP_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const ROADMAP_STATUSES = ['in_progress', 'draft', 'completed', 'on_hold'];
const CERT_STATUSES = ['completed', 'in_progress', 'planned', 'expired'];
const RESOURCE_TYPES = ['Documentation', 'Courses', 'Tutorials', 'Practical labs', 'Books and papers', 'Tools'];
const RESOURCE_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export default function AdminDomainDetail() {
  const { isViewer, canEdit } = useAuth();
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubdomain = searchParams.get('subdomain') || '';
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Quick Action Modal states
  const [modalType, setModalType] = useState(null); // 'skill' | 'goal' | 'resource' | 'cert' | 'roadmap'
  const [modalForm, setModalForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);

  // Canonical Resource Library Modals & State
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceModalInitial, setResourceModalInitial] = useState({});
  const [resourceToEdit, setResourceToEdit] = useState(null);
  const [detailResource, setDetailResource] = useState(null);
  const [resourceDeleteTarget, setResourceDeleteTarget] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleFileUpload = async (e) => {
    if (isViewer) {
      setModalError('Viewer mode: uploading files is disabled.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api('/upload', {
        method: 'POST',
        body: fd
      });
      setModalForm(prev => ({ ...prev, fileUrl: res.url }));
      showToast('Certificate document uploaded successfully');
    } catch (err) {
      setModalError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const fetchDomainData = () => {
    setLoading(true);
    const query = activeSubdomain ? `?subdomain=${encodeURIComponent(activeSubdomain)}` : '';
    api(`/domains/${slug}/deep-dive${query}`)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load domain telemetry');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDomainData();
  }, [slug, activeSubdomain]);

  const openCreateModal = (type) => {
    if (isViewer) {
      showToast('Viewer mode: item creation is disabled.');
      return;
    }
    setModalType(type);
    setModalError(null);
    const primaryId = data?.domain?._id ? String(data.domain._id) : '';
    const domName = data?.domain?.name || 'Backend Engineering';
    const subName = activeSubdomain || data?.subdomain?.name || data?.siblingSubdomains?.[0]?.name || '';
    const subId = data?.subdomain?._id || data?.siblingSubdomains?.find(s => s.name === subName)?._id || undefined;

    if (type === 'skill') {
      setModalForm({
        name: '',
        primaryDomain: primaryId,
        category: domName,
        subdomain: subName,
        subdomainId: subId,
        subcategory: subName,
        level: 'Intermediate',
        targetProficiency: 'Advanced',
        status: 'Learning',
        proficiencyPercentage: 65,
        confidenceRating: 7,
        priority: 'Medium',
        description: '',
        publicDescription: '',
        tags: '',
        nextAction: '',
        visibility: 'public'
      });
    } else if (type === 'goal') {
      setModalForm({
        title: '',
        primaryDomain: primaryId,
        category: domName,
        subdomain: subName,
        subdomainId: subId,
        timeHorizon: 'Strategic Goal',
        priority: 'High',
        status: 'Active',
        progress: 0,
        targetDate: '',
        deadline: '',
        progressMode: 'milestones',
        whyItMatters: '',
        measurableSuccessCriteria: '',
        description: ''
      });
    } else if (type === 'cert') {
      setModalForm({
        title: '',
        issuer: '',
        primaryDomain: primaryId,
        domain: domName,
        subdomain: subName,
        subdomainId: subId,
        status: 'completed',
        credentialId: '',
        issueDate: '',
        expiryDate: '',
        credentialUrl: '',
        fileUrl: '',
        tags: '',
        description: '',
        visibility: 'public',
        published: true
      });
    } else if (type === 'roadmap') {
      setModalForm({
        title: '',
        primaryDomain: primaryId,
        category: domName,
        subdomain: subName,
        subdomainId: subId,
        difficulty: 'Intermediate',
        status: 'in_progress',
        estimatedDuration: '8 weeks',
        targetDate: '',
        purpose: '',
        targetRole: '',
        description: '',
        visibility: 'public',
        phaseTitle: 'Phase 1: Foundations & Core Architecture',
        milestoneTitle: 'Core architecture blueprint'
      });
    } else if (type === 'resource') {
      setResourceModalInitial({
        primaryDomain: primaryId,
        domainName: domName,
        subdomain: subName,
        subdomainId: subId
      });
      setResourceToEdit(null);
      setResourceModalOpen(true);
      return;
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (isViewer) {
      setModalError('Viewer mode: saving is disabled.');
      return;
    }
    setSubmitting(true);
    setModalError(null);

    try {
      if (modalType === 'skill') {
        const payload = {
          name: modalForm.name,
          category: modalForm.category || data?.domain?.name,
          primaryDomain: modalForm.primaryDomain || undefined,
          subdomain: modalForm.subdomain || undefined,
          subdomainId: modalForm.subdomainId || undefined,
          subcategory: modalForm.subdomain || undefined,
          level: modalForm.level || 'Intermediate',
          targetProficiency: modalForm.targetProficiency || 'Advanced',
          status: modalForm.status || 'Learning',
          proficiencyPercentage: Number(modalForm.proficiencyPercentage) || 0,
          confidenceRating: Number(modalForm.confidenceRating) || 7,
          priority: modalForm.priority || 'Medium',
          description: modalForm.description || '',
          publicDescription: modalForm.publicDescription || '',
          tags: typeof modalForm.tags === 'string'
            ? modalForm.tags.split(',').map(t => t.trim()).filter(Boolean)
            : modalForm.tags || [],
          nextAction: modalForm.nextAction || '',
          visibility: modalForm.visibility || 'public'
        };
        await api('/skills', { method: 'POST', body: jsonBody(payload) });
        showToast(`Skill "${modalForm.name}" created successfully`);
      } else if (modalType === 'goal') {
        const payload = {
          title: modalForm.title,
          category: modalForm.category || data?.domain?.name || 'Technical Mastery',
          primaryDomain: modalForm.primaryDomain || undefined,
          subdomain: modalForm.subdomain || undefined,
          subdomainId: modalForm.subdomainId || undefined,
          timeHorizon: modalForm.timeHorizon || 'Strategic Goal',
          priority: modalForm.priority || 'High',
          status: modalForm.status || 'Active',
          progress: Number(modalForm.progress) || 0,
          targetDate: modalForm.targetDate || undefined,
          deadline: modalForm.targetDate || undefined,
          progressMode: modalForm.progressMode || 'milestones',
          whyItMatters: modalForm.whyItMatters || '',
          measurableSuccessCriteria: modalForm.measurableSuccessCriteria || '',
          description: modalForm.description || ''
        };
        await api('/goals', { method: 'POST', body: jsonBody(payload) });
        showToast(`Goal "${modalForm.title}" created successfully`);
      } else if (modalType === 'cert') {
        const payload = {
          title: modalForm.title,
          issuer: modalForm.issuer || '',
          primaryDomain: modalForm.primaryDomain || undefined,
          domain: modalForm.domain || data?.domain?.name || '',
          subdomain: modalForm.subdomain || undefined,
          subdomainId: modalForm.subdomainId || undefined,
          status: modalForm.status || 'completed',
          credentialId: modalForm.credentialId || '',
          issuedAt: modalForm.issueDate || '',
          issueDate: modalForm.issueDate ? new Date(modalForm.issueDate) : undefined,
          expiryDate: modalForm.expiryDate ? new Date(modalForm.expiryDate) : undefined,
          credentialUrl: modalForm.credentialUrl || '',
          fileUrl: modalForm.fileUrl || '',
          imageUrl: modalForm.fileUrl || '',
          tags: typeof modalForm.tags === 'string'
            ? modalForm.tags.split(',').map(t => t.trim()).filter(Boolean)
            : modalForm.tags || [],
          description: modalForm.description || '',
          visibility: modalForm.visibility || 'public',
          published: modalForm.visibility === 'public'
        };
        await api('/certificates', { method: 'POST', body: jsonBody(payload) });
        showToast(`Certificate "${modalForm.title}" created successfully`);
      } else if (modalType === 'roadmap') {
        const payload = {
          title: modalForm.title,
          category: modalForm.category || data?.domain?.name || 'Backend Engineering',
          primaryDomain: modalForm.primaryDomain || undefined,
          subdomain: modalForm.subdomain || undefined,
          subdomainId: modalForm.subdomainId || undefined,
          difficulty: modalForm.difficulty || 'Intermediate',
          status: modalForm.status || 'in_progress',
          estimatedDuration: modalForm.estimatedDuration || '8 weeks',
          targetDate: modalForm.targetDate || undefined,
          purpose: modalForm.purpose || '',
          targetRoles: modalForm.targetRole ? [modalForm.targetRole] : [],
          description: modalForm.description || '',
          visibility: modalForm.visibility || 'public',
          phases: [
            {
              title: modalForm.phaseTitle || 'Phase 1: Foundations & Core Architecture',
              order: 1,
              milestones: [
                {
                  title: modalForm.milestoneTitle || 'Core architecture blueprint',
                  status: 'in_progress'
                }
              ]
            }
          ]
        };
        await api('/roadmaps', { method: 'POST', body: jsonBody(payload) });
        showToast(`Roadmap "${modalForm.title}" created successfully`);
      } else if (modalType === 'resource') {
        const payload = {
          title: modalForm.title,
          url: modalForm.url,
          primaryDomain: modalForm.primaryDomain || undefined,
          domain: modalForm.domain || data?.domain?.name || '',
          subdomain: modalForm.subdomain || undefined,
          subdomainId: modalForm.subdomainId || undefined,
          type: modalForm.type || 'Documentation',
          difficulty: modalForm.difficulty || 'Intermediate',
          status: modalForm.status || 'To Explore',
          rating: Number(modalForm.rating) || 5,
          description: modalForm.description || ''
        };
        await api('/resources', { method: 'POST', body: jsonBody(payload) });
        showToast(`Resource "${modalForm.title}" added successfully`);
      }

      setModalType(null);
      fetchDomainData();
    } catch (err) {
      setModalError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-mono">Aggregating workspace telemetry…</p>
      </div>
    );
  }

  if (error || !data || !data.domain) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto">
          <Layers size={22} />
        </div>
        <h2 className="text-lg font-bold font-serif text-stone-900">Domain Not Found</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">{error || 'Requested domain could not be loaded.'}</p>
        <Link
          to="/admin/domains"
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800"
        >
          <ArrowLeft size={14} /> Back to Domains
        </Link>
      </div>
    );
  }

  const {
    domain,
    subdomain,
    siblingSubdomains = [],
    skills = [],
    goals = [],
    milestones = [],
    certifications = [],
    projects = [],
    resources = [],
    achievements = [],
    counts = {},
    analytics = {}
  } = data;

  const accentColor = domain.accentColor || '#bb9457';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'skills', label: `Skills (${counts.skills || 0})`, icon: Code2 },
    { id: 'goals', label: `Goals (${(counts.activeGoals || 0) + (counts.completedGoals || 0)})`, icon: Target },
    { id: 'milestones', label: `Milestones (${counts.milestones || 0})`, icon: Clock },
    { id: 'certifications', label: `Certifications (${counts.certifications || 0})`, icon: FileBadge },
    { id: 'projects', label: `Projects (${counts.projects || 0})`, icon: FolderOpen },
    { id: 'roadmaps', label: `Roadmaps (${counts.roadmaps || (data.roadmaps || []).length || 0})`, icon: Workflow },
    { id: 'workLogs', label: `Work Logs (${counts.workLogs || (data.workLogs || []).length || 0})`, icon: Clock },
    { id: 'resources', label: `Resources (${counts.resources || 0})`, icon: BookOpen },
    { id: 'achievements', label: `Achievements (${counts.achievements || 0})`, icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6 pb-16">
      {isViewer && <ReadOnlyNotice featureName="Domain Operations & Deep Dive" />}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
          <Link to="/admin" className="hover:text-stone-900 transition">Admin</Link>
          <ChevronRight size={12} className="text-stone-400" />
          <Link to="/admin/domains" className="hover:text-stone-900 transition">Domains</Link>
          <ChevronRight size={12} className="text-stone-400" />
          <span className="font-semibold text-stone-900">{domain.name}</span>
          {subdomain && (
            <>
              <ChevronRight size={12} className="text-stone-400" />
              <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {subdomain.name}
              </span>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={`/domains/${domain.slug}${activeSubdomain ? `?subdomain=${encodeURIComponent(activeSubdomain)}` : ''}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition"
          >
            <Globe size={13} /> View Public Domain <ExternalLink size={11} className="text-stone-400" />
          </Link>
        </div>
      </div>

      {/* Domain Command Header */}
      <header
        className="rounded-2xl bg-white border border-stone-200 p-6 shadow-xs space-y-5"
        style={{ borderTopWidth: 4, borderTopColor: accentColor }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs font-bold text-xs"
                style={{ backgroundColor: accentColor }}
              >
                <Layers size={14} />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-stone-500 uppercase">
                Central Domain Authority
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                domain.visibility === 'public' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
              }`}>
                {domain.visibility}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {domain.name}
              {subdomain && (
                <span className="text-lg font-sans font-medium text-amber-800 ml-2">
                  / {subdomain.name}
                </span>
              )}
            </h1>

            <p className="text-xs text-stone-600 leading-relaxed">
              {subdomain?.description || domain.description || 'Central domain hub connecting skills, goals, milestones, certifications, and active projects.'}
            </p>
          </div>

          {/* Context Creation Action Buttons */}
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                onClick={() => openCreateModal('skill')}
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
              >
                <Plus size={13} /> Add Skill
              </Button>
              <Button
                onClick={() => openCreateModal('goal')}
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
              >
                <Plus size={13} /> Create Goal
              </Button>
              <Button
                onClick={() => openCreateModal('resource')}
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
              >
                <Plus size={13} /> Add Resource
              </Button>
              <Button
                onClick={() => openCreateModal('cert')}
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
              >
                <Plus size={13} /> Add Cert
              </Button>
              <Button
                onClick={() => openCreateModal('roadmap')}
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
              >
                <Plus size={13} /> Add Roadmap
              </Button>
            </div>
          )}
        </div>

        {/* Subdomains Navigator */}
        {siblingSubdomains.length > 0 && (
          <div className="pt-4 border-t border-stone-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider mr-1">
              Subdomains:
            </span>
            <button
              onClick={() => setSearchParams({})}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition ${
                !activeSubdomain
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              All ({siblingSubdomains.length})
            </button>
            {siblingSubdomains.map(sub => {
              const isSelected = activeSubdomain === sub.slug || activeSubdomain === sub.name;
              return (
                <button
                  key={sub._id || sub.slug}
                  onClick={() => setSearchParams({ subdomain: sub.slug })}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition ${
                    isSelected
                      ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-stone-200">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-amber-800 text-amber-900 bg-white shadow-xs font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-amber-800' : 'text-stone-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-stone-400">Linked Skills</span>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1">{counts.skills || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-stone-400">Goals (Done / Active)</span>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
                {counts.completedGoals || 0} / {counts.activeGoals || 0}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-stone-400">Verified Achievements</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{counts.achievements || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-stone-400">Projects & Labs</span>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1">{counts.projects || 0}</div>
            </div>
          </div>

          {/* Quick Deep Dive Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Skills in domain */}
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Code2 size={14} className="text-amber-800" /> Skills in {subdomain?.name || domain.name}
                </h3>
                <button onClick={() => setActiveTab('skills')} className="text-[11px] text-amber-800 hover:underline font-semibold">
                  View all ({skills.length})
                </button>
              </div>
              <div className="space-y-2">
                {skills.slice(0, 5).map(s => (
                  <div key={s._id} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900">{s.name}</span>
                      <span className="text-[10px] font-mono text-stone-400 ml-2">({s.level})</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-stone-700 border border-stone-200">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals in domain */}
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Target size={14} className="text-amber-800" /> Active Goals
                </h3>
                <button onClick={() => setActiveTab('goals')} className="text-[11px] text-amber-800 hover:underline font-semibold">
                  View all ({goals.length})
                </button>
              </div>
              <div className="space-y-2">
                {goals.slice(0, 5).map(g => (
                  <div key={g._id} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900">{g.title}</span>
                      <div className="text-[10px] font-mono text-stone-400">Progress: {g.progress}%</div>
                    </div>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                      g.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-stone-500">{skills.length} skills in domain</span>
            {canEdit && (
              <Button onClick={() => openCreateModal('skill')} size="sm" variant="primary">
                <Plus size={13} /> Add Skill to {subdomain?.name || domain.name}
              </Button>
            )}
          </div>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Skill Name</th>
                  <th className="py-2.5 px-4">Subdomain</th>
                  <th className="py-2.5 px-4">Level</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Proficiency</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {skills.map(s => (
                  <tr key={s._id} className="hover:bg-stone-50/80">
                    <td className="py-2.5 px-4 font-bold text-stone-900">{s.name}</td>
                    <td className="py-2.5 px-4 text-stone-600">{s.subdomain || s.subcategory || '-'}</td>
                    <td className="py-2.5 px-4 font-mono">{s.level}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 text-stone-700">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono">{s.proficiencyPercentage || 0}%</td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        to={`/admin/skills?id=${s._id}`}
                        className="text-amber-800 hover:underline font-semibold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GOALS & MILESTONES */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-stone-500">{goals.length} goals in domain</span>
            {canEdit && (
              <Button onClick={() => openCreateModal('goal')} size="sm" variant="primary">
                <Plus size={13} /> Create Goal in {subdomain?.name || domain.name}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(g => (
              <div key={g._id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">{g.subdomain || domain.name}</span>
                    <h4 className="text-sm font-bold text-stone-900">{g.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                    {g.status}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${g.progress || 0}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-stone-500 pt-1">
                  <span>Progress: {g.progress || 0}%</span>
                  <Link to={`/admin/goals?id=${g._id}`} className="text-amber-800 font-semibold hover:underline">
                    Edit Goal →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-stone-500">{milestones.length} milestones in domain</span>
            {canEdit && (
              <Button onClick={() => openCreateModal('milestone')} size="sm" variant="primary">
                <Plus size={13} /> Add Milestone in {subdomain?.name || domain.name}
              </Button>
            )}
          </div>
          {milestones.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-200">
              <Clock size={32} className="mx-auto text-stone-300 mb-2" />
              <h4 className="text-sm font-bold text-stone-900">No Milestones Recorded</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                Add architectural milestones, deliverables, and targets specifically for this technical domain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestones.map(m => (
                <div key={m._id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                        {m.subdomain || domain.name}
                      </span>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        m.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 font-serif">{m.title}</h4>
                    {m.description && <p className="text-xs text-stone-600 line-clamp-2">{m.description}</p>}

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${m.progress || (m.status === 'completed' ? 100 : 0)}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-stone-500">
                    <span>Due: {m.dueDate || m.targetDate || 'None'}</span>
                    <Link to={`/admin/milestones?id=${m._id}`} className="text-amber-800 font-semibold hover:underline">
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-stone-500">{resources.length} learning resources</span>
            {canEdit && (
              <Button onClick={() => openCreateModal('resource')} size="sm" variant="primary">
                <Plus size={13} /> Add Resource
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map(r => (
              <div key={r._id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900">
                    {r.type}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">{r.difficulty}</span>
                </div>
                <h4 className="text-xs font-bold text-stone-900">{r.title}</h4>
                <p className="text-[11px] text-stone-600 line-clamp-2">{r.description}</p>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono">
                  <span>Status: <strong>{r.status}</strong></span>
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-amber-800 hover:underline font-semibold flex items-center gap-1">
                    Open <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-stone-500">{certifications.length} credentials</span>
            {canEdit && (
              <Button onClick={() => openCreateModal('cert')} size="sm" variant="primary">
                <Plus size={13} /> Add Certification
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certifications.map(c => (
              <div key={c._id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{c.title}</h4>
                    <span className="text-[11px] text-stone-500">{c.issuer}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {c.status || 'Verified'}
                  </span>
                </div>
                {c.credentialUrl && (
                  <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="text-[11px] text-amber-800 hover:underline font-mono inline-flex items-center gap-1">
                    Credential Link <ExternalLink size={10} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-3">
          {achievements.map(ach => (
            <div key={ach.id} className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy size={16} className="text-amber-800" />
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 mr-2">
                    {ach.type}
                  </span>
                  <span className="text-xs font-bold text-stone-900">{ach.title}</span>
                </div>
              </div>
              {ach.date && (
                <span className="text-[10px] font-mono text-stone-400">
                  {new Date(ach.date).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: ROADMAPS */}
      {activeTab === 'roadmaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-mono">
              {(data.roadmaps || []).length} roadmaps associated with {domain.name}
            </span>
            {canEdit && (
              <Button
                onClick={() => openCreateModal('roadmap')}
                variant="primary"
                size="sm"
                className="text-xs"
              >
                <Plus size={13} /> New Roadmap in {domain.name}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data.roadmaps || []).map(r => (
              <div key={r._id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {r.difficulty || 'Intermediate'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {r.progress}% Complete
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{r.title}</h4>
                  {r.description && (
                    <p className="text-xs text-stone-600 line-clamp-2">{r.description}</p>
                  )}
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-800 rounded-full" style={{ width: `${r.progress}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">
                    {(r.phases || r.stages || []).length} Phases
                  </span>
                  <Link
                    to="/admin/roadmaps"
                    className="text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                  >
                    Open Roadmap <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
            {(data.roadmaps || []).length === 0 && (
              <div className="col-span-full p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 space-y-2">
                <p className="text-xs text-stone-600 font-medium">No roadmaps associated with this domain context yet.</p>
                {canEdit && (
                  <Button onClick={() => openCreateModal('roadmap')} variant="outline" size="sm" className="text-xs">
                    <Plus size={12} /> Create Domain Roadmap
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: WORK LOGS */}
      {activeTab === 'workLogs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-stone-500">
              {(data.workLogs || []).length} recorded sessions • {data.totalLoggedHours || 0} total hours
            </span>
            <Link
              to="/admin/work-logs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-800"
            >
              <Plus size={13} /> Work Logs Dashboard
            </Link>
          </div>

          <div className="space-y-2.5">
            {(data.workLogs || []).map(w => (
              <div key={w._id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">{w.date}</span>
                    <span className="rounded bg-wine/10 px-2 py-0.5 text-[10px] font-bold text-wine">
                      {Math.round((w.timeSpentMinutes / 60) * 10) / 10} hrs ({w.timeSpentMinutes} min)
                    </span>
                    <span className="text-[10px] font-semibold text-stone-600 bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5">{w.category}</span>
                    {w.projectId && (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 border border-amber-200">{w.projectId.title}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">{w.title}</h4>
                  {w.outcome && (
                    <p className="text-xs text-emerald-800 bg-emerald-50 rounded p-1.5 mt-2 border border-emerald-200">
                      <strong>Deliverable:</strong> {w.outcome}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {(data.workLogs || []).length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-200">
                <Clock size={32} className="mx-auto text-stone-300 mb-2" />
                <h4 className="text-sm font-bold text-stone-700">No Work Sessions Logged in this Domain</h4>
                <p className="text-xs text-stone-400 mt-1">Start a timer or log a session in Work Logs to see your practice time here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <BookOpen size={16} className="text-amber-800" />
                Technical Learning Resources & References ({(resources || []).length})
              </h3>
              <p className="text-xs text-stone-500">
                Official documentation, courses, repositories, and technical reading associated with {subdomain?.name || domain.name}.
              </p>
            </div>
            <Button
              onClick={() => {
                setResourceModalInitial({
                  primaryDomain: domain._id,
                  domainName: domain.name,
                  subdomain: subdomain?.name || activeSubdomain || '',
                  subdomainId: subdomain?._id || undefined
                });
                setResourceToEdit(null);
                setResourceModalOpen(true);
              }}
              variant="primary"
              size="sm"
              className="text-xs font-semibold gap-1.5"
            >
              <Plus size={13} /> Add Resource to {domain.name.split(' ')[0]}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(resources || []).map(r => (
              <div
                key={r._id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-800 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                      {r.type || 'Documentation'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                      r.status === 'Learning' ? 'bg-amber-50 text-amber-800' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <h4
                    onClick={() => setDetailResource(r)}
                    className="font-bold text-sm text-stone-900 cursor-pointer hover:text-amber-800 transition line-clamp-2 mb-1"
                  >
                    {r.title}
                  </h4>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                    {r.summary || r.description || 'Reference documentation asset.'}
                  </p>

                  {r.provider && (
                    <span className="text-[11px] font-mono text-stone-500 block mb-2">
                      Provider: {r.provider} {r.author ? `• by ${r.author}` : ''}
                    </span>
                  )}

                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {r.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-semibold text-stone-500">
                    ★ {r.rating || 5}/5
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
                      title="Open external link"
                    >
                      <ExternalLink size={13} />
                    </a>
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api(`/resources/${r._id}/unlink`, {
                                method: 'PATCH',
                                body: jsonBody({ targetType: 'domain', targetId: domain._id || domain.name })
                              });
                              showToast('Resource unlinked from domain successfully.');
                              fetchDomainData();
                            } catch (e) {
                              showToast(e.message || 'Unlink failed.');
                            }
                          }}
                          className="p-1.5 text-stone-500 hover:text-amber-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                          title="Unlink from this domain"
                        >
                          <Link2Off size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResourceToEdit(r);
                            setResourceModalOpen(true);
                          }}
                          className="p-1.5 text-stone-500 hover:text-amber-800 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                          title="Edit resource"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setResourceDeleteTarget(r)}
                          className="p-1.5 text-stone-500 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                          title="Delete resource"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(resources || []).length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-stone-200">
                <BookOpen size={32} className="mx-auto text-stone-300 mb-2" />
                <h4 className="text-sm font-bold text-stone-700">No Resources Linked to this Domain</h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  Attach documentation, textbooks, courses, and GitHub repos to build your domain reference library.
                </p>
                {canEdit && (
                  <Button
                    onClick={() => {
                      setResourceModalInitial({
                        primaryDomain: domain._id,
                        domainName: domain.name,
                        subdomain: subdomain?.name || activeSubdomain || '',
                        subdomainId: subdomain?._id || undefined
                      });
                      setResourceToEdit(null);
                      setResourceModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                  >
                    <Plus size={13} /> Add First Resource
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CANONICAL RESOURCE LIBRARY MODALS */}
      <ResourceModal
        isOpen={resourceModalOpen}
        onClose={() => {
          setResourceModalOpen(false);
          setResourceToEdit(null);
        }}
        resourceToEdit={resourceToEdit}
        initialContext={resourceModalInitial}
        onSaved={() => {
          fetchDomainData();
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
        onUnlink={async (resId, targetType, targetId) => {
          if (isViewer) {
            showToast('Viewer mode: unlinking is disabled.');
            return;
          }
          try {
            await api(`/resources/${resId}/unlink`, {
              method: 'PATCH',
              body: jsonBody({ targetType, targetId })
            });
            showToast(`Unlinked ${targetType} safely.`);
            fetchDomainData();
            setDetailResource(null);
          } catch (e) {
            showToast(e.message || 'Unlink failed.');
          }
        }}
      />

      <ConfirmModal
        isOpen={!!resourceDeleteTarget}
        title="Delete Learning Resource"
        message={`Are you sure you want to permanently delete "${resourceDeleteTarget?.title}"? All associated skills, domains, and roadmaps will remain intact.`}
        confirmText="Delete Resource"
        onConfirm={async () => {
          if (isViewer) {
            showToast('Viewer mode: resource deletion is disabled.');
            return;
          }
          if (!resourceDeleteTarget) return;
          try {
            await api(`/resources/${resourceDeleteTarget._id}`, { method: 'DELETE' });
            showToast(`Resource "${resourceDeleteTarget.title}" deleted.`);
            setResourceDeleteTarget(null);
            fetchDomainData();
          } catch (e) {
            showToast(e.message || 'Failed to delete resource.');
          }
        }}
        onCancel={() => setResourceDeleteTarget(null)}
        danger
      />

      {/* FULL FEATURE-COMPLETE CREATE MODALS */}
      {modalType && (
        <Modal
          title={
            modalType === 'skill' ? `Add New Skill — ${domain.name}` :
            modalType === 'goal' ? `Create Goal — ${domain.name}` :
            modalType === 'cert' ? `Add Certificate — ${domain.name}` :
            modalType === 'roadmap' ? `Create Roadmap — ${domain.name}` :
            `Add Learning Resource — ${domain.name}`
          }
          onClose={() => setModalType(null)}
          maxWidth="max-w-2xl"
        >
          {/* SKILL FORM */}
          {modalType === 'skill' && (
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modalError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} /> {modalError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={modalForm.name || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Distributed Consensus Algorithms"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                />
              </div>

              <DomainSelector
                primaryDomainId={modalForm.primaryDomain || String(domain._id)}
                subdomainName={modalForm.subdomain || activeSubdomain}
                onChange={({ primaryDomainId, primaryDomainName, subdomainName, subdomainId }) => {
                  setModalForm(prev => ({
                    ...prev,
                    primaryDomain: primaryDomainId,
                    category: primaryDomainName,
                    subdomain: subdomainName,
                    subdomainId
                  }));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Current Level</label>
                  <select
                    value={modalForm.level || 'Intermediate'}
                    onChange={e => setModalForm(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {PROFICIENCY_LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Target Level</label>
                  <select
                    value={modalForm.targetProficiency || 'Advanced'}
                    onChange={e => setModalForm(prev => ({ ...prev, targetProficiency: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {PROFICIENCY_LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Learning Status</label>
                  <select
                    value={modalForm.status || 'Learning'}
                    onChange={e => setModalForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {LEARNING_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Mastery % (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={modalForm.proficiencyPercentage ?? 65}
                    onChange={e => setModalForm(prev => ({ ...prev, proficiencyPercentage: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Confidence (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={modalForm.confidenceRating ?? 7}
                    onChange={e => setModalForm(prev => ({ ...prev, confidenceRating: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Priority</label>
                  <select
                    value={modalForm.priority || 'Medium'}
                    onChange={e => setModalForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Technical Description</label>
                <textarea
                  rows="2"
                  placeholder="Technical scope, architectural context, and capabilities…"
                  value={modalForm.description || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Public Portfolio Description</label>
                <textarea
                  rows="2"
                  placeholder="Polished description displayed on public portfolio showcase…"
                  value={modalForm.publicDescription || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, publicDescription: e.target.value }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="backend, architecture, raft"
                    value={modalForm.tags || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Next Action</label>
                  <input
                    type="text"
                    placeholder="e.g. Implement Raft leader election lab"
                    value={modalForm.nextAction || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, nextAction: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm.visibility === 'public'}
                    onChange={e => setModalForm(prev => ({ ...prev, visibility: e.target.checked ? 'public' : 'private' }))}
                    className="rounded border-stone-300"
                  />
                  Public Visibility
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Creating Skill…' : 'Add Skill'}
                </Button>
              </div>
            </form>
          )}

          {/* GOAL FORM */}
          {modalType === 'goal' && (
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modalError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} /> {modalError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={modalForm.title || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Master Production Distributed Systems"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                />
              </div>

              <DomainSelector
                primaryDomainId={modalForm.primaryDomain || String(domain._id)}
                subdomainName={modalForm.subdomain || activeSubdomain}
                onChange={({ primaryDomainId, primaryDomainName, subdomainName, subdomainId }) => {
                  setModalForm(prev => ({
                    ...prev,
                    primaryDomain: primaryDomainId,
                    category: primaryDomainName,
                    subdomain: subdomainName,
                    subdomainId
                  }));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Time Horizon</label>
                  <select
                    value={modalForm.timeHorizon || 'Strategic Goal'}
                    onChange={e => setModalForm(prev => ({ ...prev, timeHorizon: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {TIME_HORIZONS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Priority</label>
                  <select
                    value={modalForm.priority || 'High'}
                    onChange={e => setModalForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Status</label>
                  <select
                    value={modalForm.status || 'Active'}
                    onChange={e => setModalForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {GOAL_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Target Date / Deadline</label>
                  <input
                    type="date"
                    value={modalForm.targetDate || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Progress Mode</label>
                  <select
                    value={modalForm.progressMode || 'milestones'}
                    onChange={e => setModalForm(prev => ({ ...prev, progressMode: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    <option value="milestones">Milestones Weighted Average</option>
                    <option value="tasks">Tasks Completion Ratio</option>
                    <option value="manual">Manual Outcome %</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Why This Matters (Strategic Justification)</label>
                <textarea
                  rows="2"
                  placeholder="Explain the technical or career impact of achieving this goal…"
                  value={modalForm.whyItMatters || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, whyItMatters: e.target.value }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Measurable Success Criteria</label>
                <input
                  type="text"
                  placeholder="e.g. Sub-50ms p95 latency, 99.9% uptime, 90% test coverage"
                  value={modalForm.measurableSuccessCriteria || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, measurableSuccessCriteria: e.target.value }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Detailed scope, milestone roadmap outline, and references…"
                  value={modalForm.description || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Creating Goal…' : 'Create Goal'}
                </Button>
              </div>
            </form>
          )}

          {/* CERTIFICATE FORM */}
          {modalType === 'cert' && (
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modalError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} /> {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Certificate Title *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.title || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Certified Kubernetes Administrator (CKA)"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Issuing Organization *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.issuer || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder="e.g. CNCF, Amazon Web Services, CompTIA"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900"
                  />
                </div>
              </div>

              <DomainSelector
                primaryDomainId={modalForm.primaryDomain || String(domain._id)}
                subdomainName={modalForm.subdomain || activeSubdomain}
                onChange={({ primaryDomainId, primaryDomainName, subdomainName, subdomainId }) => {
                  setModalForm(prev => ({
                    ...prev,
                    primaryDomain: primaryDomainId,
                    domain: primaryDomainName,
                    category: primaryDomainName,
                    subdomain: subdomainName,
                    subdomainId
                  }));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Credential ID</label>
                  <input
                    type="text"
                    value={modalForm.credentialId || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, credentialId: e.target.value }))}
                    placeholder="e.g. CKA-889900"
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Status</label>
                  <select
                    value={modalForm.status || 'completed'}
                    onChange={e => setModalForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {CERT_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={modalForm.issueDate || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={modalForm.expiryDate || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Verification / Badge URL</label>
                  <input
                    type="url"
                    value={modalForm.credentialUrl || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, credentialUrl: e.target.value }))}
                    placeholder="https://credly.com/..."
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Certificate Document / Proof (Image or PDF)</label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="url"
                    value={modalForm.fileUrl || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                    placeholder="Document URL or upload file proof"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white text-stone-900"
                  />
                  <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition">
                    <UploadCloud size={14} />
                    <span>{uploading ? 'Uploading…' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Skills & Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Cloud, Kubernetes, Linux, DevOps"
                  value={modalForm.tags || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Description / Key Competencies</label>
                <textarea
                  rows="2"
                  placeholder="Topics covered, practical exam components, and competencies verified…"
                  value={modalForm.description || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm.visibility === 'public'}
                    onChange={e => setModalForm(prev => ({ ...prev, visibility: e.target.checked ? 'public' : 'private' }))}
                    className="rounded border-stone-300"
                  />
                  Public Visibility
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting || uploading}>
                  {submitting ? 'Adding Certificate…' : 'Add Certificate'}
                </Button>
              </div>
            </form>
          )}

          {/* ROADMAP FORM */}
          {modalType === 'roadmap' && (
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modalError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} /> {modalError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Roadmap Title *</label>
                <input
                  type="text"
                  required
                  value={modalForm.title || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Distributed Backend Architecture Mastery"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                />
              </div>

              <DomainSelector
                primaryDomainId={modalForm.primaryDomain || String(domain._id)}
                subdomainName={modalForm.subdomain || activeSubdomain}
                onChange={({ primaryDomainId, primaryDomainName, subdomainName, subdomainId }) => {
                  setModalForm(prev => ({
                    ...prev,
                    primaryDomain: primaryDomainId,
                    category: primaryDomainName,
                    subdomain: subdomainName,
                    subdomainId
                  }));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Difficulty</label>
                  <select
                    value={modalForm.difficulty || 'Intermediate'}
                    onChange={e => setModalForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {ROADMAP_DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Status</label>
                  <select
                    value={modalForm.status || 'in_progress'}
                    onChange={e => setModalForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    {ROADMAP_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={modalForm.estimatedDuration || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    placeholder="e.g. 8 weeks"
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={modalForm.targetDate || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Target Role</label>
                  <input
                    type="text"
                    value={modalForm.targetRole || ''}
                    onChange={e => setModalForm(prev => ({ ...prev, targetRole: e.target.value }))}
                    placeholder="e.g. Staff Distributed Systems Engineer"
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Purpose & Strategic Value</label>
                <input
                  type="text"
                  value={modalForm.purpose || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="e.g. Build enterprise-grade reliability and deep distributed knowledge"
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-2.5">
                <span className="text-xs font-bold text-amber-900 block font-serif">Initial Phase & Milestone Setup</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">Phase 1 Title *</label>
                    <input
                      type="text"
                      required
                      value={modalForm.phaseTitle || ''}
                      onChange={e => setModalForm(prev => ({ ...prev, phaseTitle: e.target.value }))}
                      placeholder="e.g. Phase 1: Core Fundamentals"
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">Primary Milestone *</label>
                    <input
                      type="text"
                      required
                      value={modalForm.milestoneTitle || ''}
                      onChange={e => setModalForm(prev => ({ ...prev, milestoneTitle: e.target.value }))}
                      placeholder="e.g. Architectural blueprint & hands-on lab"
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white text-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Description / Strategic Scope</label>
                <textarea
                  rows="2"
                  placeholder="High level roadmap blueprint and learning progression overview…"
                  value={modalForm.description || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm.visibility === 'public'}
                    onChange={e => setModalForm(prev => ({ ...prev, visibility: e.target.checked ? 'public' : 'private' }))}
                    className="rounded border-stone-300"
                  />
                  Public Visibility
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Creating Roadmap…' : 'Create Roadmap'}
                </Button>
              </div>
            </form>
          )}

          {/* RESOURCE FORM */}
          {modalType === 'resource' && (
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modalError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} /> {modalError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={modalForm.title || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Designing Data-Intensive Applications"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Destination URL *</label>
                <input
                  type="url"
                  required
                  value={modalForm.url || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900"
                />
              </div>

              <DomainSelector
                primaryDomainId={modalForm.primaryDomain || String(domain._id)}
                subdomainName={modalForm.subdomain || activeSubdomain}
                onChange={({ primaryDomainId, primaryDomainName, subdomainName, subdomainId }) => {
                  setModalForm(prev => ({
                    ...prev,
                    primaryDomain: primaryDomainId,
                    domain: primaryDomainName,
                    category: primaryDomainName,
                    subdomain: subdomainName,
                    subdomainId
                  }));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Resource Type</label>
                  <select
                    value={modalForm.type || 'Documentation'}
                    onChange={e => setModalForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    {RESOURCE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Difficulty</label>
                  <select
                    value={modalForm.difficulty || 'Intermediate'}
                    onChange={e => setModalForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    {RESOURCE_DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">Status</label>
                  <select
                    value={modalForm.status || 'To Explore'}
                    onChange={e => setModalForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    {['To Explore', 'In Progress', 'Completed', 'Essential Reference'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Rating (1 to 5 Stars)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={modalForm.rating ?? 5}
                  onChange={e => setModalForm(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Key learnings, chapter notes, and why this resource is valuable…"
                  value={modalForm.description || ''}
                  onChange={e => setModalForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Adding Resource…' : 'Add Resource'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      <Toast message={toast} />
    </div>
  );
}
