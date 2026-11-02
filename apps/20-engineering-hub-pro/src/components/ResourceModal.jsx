import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  BookOpen,
  Layers,
  Sparkles,
  Code2,
  Workflow,
  Target,
  Star,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Compass,
  Tag
} from 'lucide-react';
import { api, jsonBody } from '../lib/api.js';
import { Modal } from '../components.jsx';
import { DomainSelector } from './DomainSelector.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ReadOnlyNotice } from './ReadOnlyNotice.jsx';

export const RESOURCE_TAXONOMY = {
  'Learning Resources': [
    'Online courses',
    'Tutorials',
    'Video lectures',
    'Learning paths',
    'Books and ebooks',
    'Interactive learning platforms'
  ],
  'Technical Documentation': [
    'Official documentation',
    'API references',
    'Technical specifications',
    'Standards and RFCs',
    'Cheat sheets',
    'Architecture documentation'
  ],
  'Code & Implementation': [
    'GitHub repositories',
    'Code examples',
    'Starter templates',
    'SDKs and libraries',
    'Reusable components',
    'Code snippets',
    'Boilerplates'
  ],
  'Architecture & Engineering': [
    'System design references',
    'Design patterns',
    'Database design references',
    'Scalability guides',
    'Testing and quality references',
    'Performance optimization guides',
    'Software engineering best practices'
  ],
  'Tools & Utilities': [
    'Developer tools',
    'IDEs and extensions',
    'Debugging utilities',
    'API testing platforms',
    'Deployment platforms',
    'Development productivity tools'
  ],
  'Research & Technical Reading': [
    'Research papers',
    'Technical articles',
    'Engineering blogs',
    'Benchmarks',
    'Case studies',
    'Technology comparisons'
  ],
  'Personal Knowledge': [
    'Personal notes',
    'Implementation notes',
    'Debugging solutions',
    'Error-resolution guides',
    'Useful commands',
    'Lessons learned'
  ],
  'Practice & Assessment': [
    'Coding challenges',
    'Quizzes and exercises',
    'Interactive labs',
    'Interview preparation',
    'Hands-on workshops'
  ],
  'Community & Media': [
    'Developer communities',
    'Forums',
    'Technical newsletters',
    'Conference talks',
    'Webinars and events',
    'Engineering podcasts',
    'Other'
  ]
};

export const RESOURCE_STATUSES = ['To Learn', 'Learning', 'Completed', 'Reference', 'Archived'];
export const RESOURCE_PRIORITIES = ['Low', 'Medium', 'High'];
export const RESOURCE_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const defaultResource = {
  title: '',
  summary: '',
  description: '',
  url: '',
  attachmentUrl: '',
  coverImageUrl: '',
  type: 'Official documentation',
  provider: '',
  author: '',
  difficulty: 'Intermediate',
  status: 'To Learn',
  priority: 'Medium',
  rating: 5,
  isFavorite: false,
  tags: [],
  primaryDomain: '',
  domainName: '',
  subdomain: '',
  subdomainId: null,
  relatedSkills: [],
  relatedProjects: [],
  relatedRoadmaps: [],
  relatedMilestones: [],
  notes: '',
  intendedOutcome: '',
  estimatedDuration: '',
  metadata: {},
  visibility: 'public'
};

export function ResourceModal({
  isOpen,
  onClose,
  resourceToEdit = null,
  initialContext = {},
  onSaved
}) {
  const { isViewer, canEdit } = useAuth();
  const [form, setForm] = useState(defaultResource);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'relations' | 'workflow' | 'specific'
  const [tagInput, setTagInput] = useState('');
  const [milestoneInput, setMilestoneInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Entities for multi-select relationship pickers
  const [skillsList, setSkillsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [roadmapsList, setRoadmapsList] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [roadmapSearch, setRoadmapSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Load available cross-section entities for linking
    Promise.all([
      api('/skills?all=true').catch(() => []),
      api('/projects?all=true').catch(() => []),
      api('/roadmaps?all=true').catch(() => [])
    ]).then(([sData, pData, rData]) => {
      setSkillsList(Array.isArray(sData) ? sData : []);
      setProjectsList(Array.isArray(pData) ? pData : []);
      setRoadmapsList(Array.isArray(rData) ? rData : []);
    });

    if (resourceToEdit) {
      setForm({
        ...defaultResource,
        ...resourceToEdit,
        primaryDomain: resourceToEdit.primaryDomain?._id || resourceToEdit.primaryDomain || '',
        domainName: resourceToEdit.domainName || resourceToEdit.primaryDomain?.name || '',
        relatedSkills: (resourceToEdit.relatedSkills || []).map(s => (typeof s === 'object' ? s._id : s)),
        relatedProjects: (resourceToEdit.relatedProjects || []).map(p => (typeof p === 'object' ? p._id : p)),
        relatedRoadmaps: (resourceToEdit.relatedRoadmaps || []).map(r => (typeof r === 'object' ? r._id : r)),
        tags: Array.isArray(resourceToEdit.tags) ? resourceToEdit.tags : [],
        metadata: resourceToEdit.metadata || {}
      });
      setTagInput(Array.isArray(resourceToEdit.tags) ? resourceToEdit.tags.join(', ') : '');
    } else {
      // Create new with initialContext prefill
      setForm({
        ...defaultResource,
        primaryDomain: initialContext.primaryDomain || initialContext.domainId || '',
        domainName: initialContext.domainName || initialContext.domain || '',
        subdomain: initialContext.subdomain || initialContext.field || '',
        subdomainId: initialContext.subdomainId || null,
        relatedSkills: initialContext.skillId ? [initialContext.skillId] : (initialContext.relatedSkills || []),
        relatedProjects: initialContext.projectId ? [initialContext.projectId] : (initialContext.relatedProjects || []),
        relatedRoadmaps: initialContext.roadmapId ? [initialContext.roadmapId] : (initialContext.relatedRoadmaps || []),
        relatedMilestones: initialContext.milestone ? [initialContext.milestone] : []
      });
      setTagInput('');
    }

    setError(null);
    setActiveTab('basic');
  }, [isOpen, resourceToEdit, initialContext]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api('/upload', { method: 'POST', body: fd });
      setForm(prev => ({
        ...prev,
        attachmentUrl: res.url,
        url: prev.url ? prev.url : res.url
      }));
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, '');
      if (val && !form.tags.includes(val)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, val] }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const toggleSkillLink = (id) => {
    setForm(prev => {
      const exists = prev.relatedSkills.includes(id);
      return {
        ...prev,
        relatedSkills: exists
          ? prev.relatedSkills.filter(sId => sId !== id)
          : [...prev.relatedSkills, id]
      };
    });
  };

  const toggleProjectLink = (id) => {
    setForm(prev => {
      const exists = prev.relatedProjects.includes(id);
      return {
        ...prev,
        relatedProjects: exists
          ? prev.relatedProjects.filter(pId => pId !== id)
          : [...prev.relatedProjects, id]
      };
    });
  };

  const toggleRoadmapLink = (id) => {
    setForm(prev => {
      const exists = prev.relatedRoadmaps.includes(id);
      return {
        ...prev,
        relatedRoadmaps: exists
          ? prev.relatedRoadmaps.filter(rId => rId !== id)
          : [...prev.relatedRoadmaps, id]
      };
    });
  };

  const handleAddMilestone = () => {
    const trimmed = milestoneInput.trim();
    if (trimmed && !form.relatedMilestones.includes(trimmed)) {
      setForm(prev => ({
        ...prev,
        relatedMilestones: [...prev.relatedMilestones, trimmed]
      }));
      setMilestoneInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewer) {
      setError('Viewer mode: changes cannot be saved.');
      return;
    }
    if (!form.title.trim()) {
      setError('Resource title is required.');
      setActiveTab('basic');
      return;
    }
    if (!form.url.trim() && !form.attachmentUrl.trim()) {
      setError('Destination URL or an uploaded attachment is required.');
      setActiveTab('basic');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        url: form.url.trim() || form.attachmentUrl.trim(),
        tags: form.tags,
        rating: Number(form.rating) || 5
      };

      let saved;
      if (resourceToEdit?._id) {
        saved = await api(`/resources/${resourceToEdit._id}`, {
          method: 'PUT',
          body: jsonBody(payload)
        });
      } else {
        saved = await api('/resources', {
          method: 'POST',
          body: jsonBody(payload)
        });
      }

      if (onSaved) {
        onSaved(saved);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCourse = form.type.toLowerCase().includes('course');
  const isRepo = form.type.toLowerCase().includes('github') || form.type.toLowerCase().includes('repo');
  const isPaper = form.type.toLowerCase().includes('paper');
  const isBook = form.type.toLowerCase().includes('book');
  const isTool = form.type.toLowerCase().includes('tool') || form.type.toLowerCase().includes('ide');

  return (
    <Modal
      title={resourceToEdit ? `Edit Resource: ${resourceToEdit.title}` : 'Add New Learning Resource'}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isViewer && <ReadOnlyNotice featureName="Learning Resources" />}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <fieldset disabled={isViewer} className="contents space-y-4">
        {/* Form Step / Section Navigation */}
        <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'basic' ? 'bg-primary text-primary-text' : 'text-muted hover:text-ink hover:bg-surface'
            }`}
          >
            <BookOpen size={13} /> 1. Basic Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('relations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'relations' ? 'bg-primary text-primary-text' : 'text-muted hover:text-ink hover:bg-surface'
            }`}
          >
            <Layers size={13} /> 2. Relationships ({form.relatedSkills.length + form.relatedProjects.length + form.relatedRoadmaps.length + (form.domainName ? 1 : 0)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'workflow' ? 'bg-primary text-primary-text' : 'text-muted hover:text-ink hover:bg-surface'
            }`}
          >
            <Clock size={13} /> 3. Learning Workflow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specific')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'specific' ? 'bg-primary text-primary-text' : 'text-muted hover:text-ink hover:bg-surface'
            }`}
          >
            <Sparkles size={13} /> 4. Type Details
          </button>
        </div>

        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-ink block mb-1">
                Resource Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Designing Data-Intensive Applications, Official React Docs..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink focus:ring-2 focus:ring-primary/30 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Primary Resource Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  {Object.entries(RESOURCE_TAXONOMY).map(([group, types]) => (
                    <optgroup key={group} label={group}>
                      {types.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Target Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  {RESOURCE_DIFFICULTIES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">
                Destination URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="url"
                  placeholder="https://documentation.domain.com/path..."
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-border bg-background text-ink rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
                  required={!form.attachmentUrl}
                />
              </div>
            </div>

            {/* Optional Attachment File Upload */}
            <div className="p-3 rounded-xl border border-dashed border-border bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Upload size={13} className="text-primary" /> Optional Local File / Attachment (PDF, Guide, Ebook)
                </span>
                <span className="text-[11px] text-muted block">
                  {form.attachmentUrl ? `Attached: ${form.attachmentUrl}` : 'Upload a PDF, cheat sheet, or local document asset.'}
                </span>
              </div>
              <label className="button-secondary text-xs shrink-0 cursor-pointer">
                {uploading ? 'Uploading…' : form.attachmentUrl ? 'Replace File' : 'Upload File'}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Provider / Platform / Source</label>
                <input
                  type="text"
                  placeholder="e.g. GitHub, Coursera, MDN, AWS, O'Reilly..."
                  value={form.provider}
                  onChange={e => setForm({ ...form, provider: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Author / Instructor / Creator</label>
                <input
                  type="text"
                  placeholder="e.g. Martin Kleppmann, Andrew Ng, Official Team..."
                  value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Short Summary (Scannable)</label>
              <input
                type="text"
                placeholder="High-level essence of what this resource covers…"
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Detailed Technical Description</label>
              <textarea
                rows="3"
                placeholder="Key concepts, architecture patterns, syllabus highlights, and takeaways…"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Tags (Type and press Enter or comma)</label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-border bg-background min-h-[42px]">
                {form.tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-primary/10 text-primary"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600 transition"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={form.tags.length === 0 ? "Add tags like 'distributed-systems', 'caching'..." : ""}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 min-w-[120px] bg-transparent text-xs text-ink outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RELATIONSHIPS & CONNECTIONS */}
        {activeTab === 'relations' && (
          <div className="space-y-5">
            {/* Domain & Subdomain Cascading Selector */}
            <div className="p-4 rounded-xl border border-border bg-surface shadow-xs space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase text-ink flex items-center gap-1.5">
                <Layers size={14} className="text-primary" /> 1. Domain & Field Association
              </h4>
              <DomainSelector
                primaryDomainId={form.primaryDomain || form.domainName}
                subdomainName={form.subdomain}
                required={false}
                onChange={({ primaryDomainId, primaryDomainName, subdomainName, subdomainId }) => {
                  setForm(prev => ({
                    ...prev,
                    primaryDomain: primaryDomainId,
                    domainName: primaryDomainName,
                    subdomain: subdomainName,
                    subdomainId: subdomainId
                  }));
                }}
              />
            </div>

            {/* Linked Skills Multi-Select */}
            <div className="p-4 rounded-xl border border-border bg-surface shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono uppercase text-ink flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" /> 2. Linked Skills ({form.relatedSkills.length} Selected)
                </h4>
                <input
                  type="text"
                  placeholder="Filter skills…"
                  value={skillSearch}
                  onChange={e => setSkillSearch(e.target.value)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-border bg-background text-ink outline-none w-40"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {skillsList
                  .filter(s => !skillSearch || s.name.toLowerCase().includes(skillSearch.toLowerCase()) || (s.category || '').toLowerCase().includes(skillSearch.toLowerCase()))
                  .map(s => {
                    const isSelected = form.relatedSkills.includes(s._id);
                    return (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => toggleSkillLink(s._id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-text shadow-xs'
                            : 'border border-border bg-background text-muted hover:text-ink'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={12} />}
                        <span>{s.name}</span>
                        <span className="text-[10px] font-mono opacity-80">({s.level})</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Linked Projects Multi-Select */}
            <div className="p-4 rounded-xl border border-border bg-surface shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono uppercase text-ink flex items-center gap-1.5">
                  <Code2 size={14} className="text-primary" /> 3. Related Projects & Architecture Implementations ({form.relatedProjects.length})
                </h4>
                <input
                  type="text"
                  placeholder="Filter projects…"
                  value={projectSearch}
                  onChange={e => setProjectSearch(e.target.value)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-border bg-background text-ink outline-none w-40"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {projectsList
                  .filter(p => !projectSearch || p.title.toLowerCase().includes(projectSearch.toLowerCase()))
                  .map(p => {
                    const isSelected = form.relatedProjects.includes(p._id);
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => toggleProjectLink(p._id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-text shadow-xs'
                            : 'border border-border bg-background text-muted hover:text-ink'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={12} />}
                        <span>{p.title}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Linked Roadmaps & Milestones */}
            <div className="p-4 rounded-xl border border-border bg-surface shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono uppercase text-ink flex items-center gap-1.5">
                  <Workflow size={14} className="text-primary" /> 4. Related Roadmaps ({form.relatedRoadmaps.length})
                </h4>
                <input
                  type="text"
                  placeholder="Filter roadmaps…"
                  value={roadmapSearch}
                  onChange={e => setRoadmapSearch(e.target.value)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-border bg-background text-ink outline-none w-40"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {roadmapsList
                  .filter(r => !roadmapSearch || r.title.toLowerCase().includes(roadmapSearch.toLowerCase()))
                  .map(r => {
                    const isSelected = form.relatedRoadmaps.includes(r._id);
                    return (
                      <button
                        key={r._id}
                        type="button"
                        onClick={() => toggleRoadmapLink(r._id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-text shadow-xs'
                            : 'border border-border bg-background text-muted hover:text-ink'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={12} />}
                        <span>{r.title}</span>
                      </button>
                    );
                  })}
              </div>

              {/* Specific Milestone Association */}
              <div className="pt-2 border-t border-border/60">
                <label className="text-[11px] font-mono font-bold text-muted block mb-1">
                  Specific Roadmap Milestones
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Phase 2: Raft Consensus Implementation"
                    value={milestoneInput}
                    onChange={e => setMilestoneInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMilestone(); } }}
                    className="flex-1 rounded-xl border border-border bg-background p-2 text-xs text-ink outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="button-secondary text-xs"
                  >
                    Add Milestone
                  </button>
                </div>
                {form.relatedMilestones.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.relatedMilestones.map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-secondary-background text-ink font-mono">
                        {m}
                        <button type="button" onClick={() => setForm(f => ({ ...f, relatedMilestones: f.relatedMilestones.filter((_, idx) => idx !== i) }))}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEARNING WORKFLOW */}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Learning Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink font-bold focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  {RESOURCE_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Learning Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink font-bold focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  {RESOURCE_PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Quality Rating (1-5)</label>
                <div className="flex items-center gap-1 p-2 rounded-xl border border-border bg-background">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        size={16}
                        className={star <= form.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}
                      />
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-bold font-mono text-muted">{form.rating}/5</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Estimated Duration / Length</label>
                <input
                  type="text"
                  placeholder="e.g. 15 hours, 450 pages, 8 modules..."
                  value={form.estimatedDuration}
                  onChange={e => setForm({ ...form, estimatedDuration: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Favorite / Bookmarked</label>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isFavorite: !f.isFavorite }))}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    form.isFavorite
                      ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-border bg-background text-muted hover:text-ink'
                  }`}
                >
                  <Star size={14} className={form.isFavorite ? 'fill-amber-500 text-amber-500' : ''} />
                  {form.isFavorite ? 'Saved to Favorites & Bookmarks' : 'Mark as Favorite'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Intended Learning Outcome</label>
              <textarea
                rows="2"
                placeholder="What precise capability or architecture will you master by completing this resource?"
                value={form.intendedOutcome}
                onChange={e => setForm({ ...form, intendedOutcome: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Personal Notes & Synthesis (Markdown Supported)</label>
              <textarea
                rows="4"
                placeholder="Key discoveries, implementation recipes, snippets, takeaways, or pitfalls…"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink focus:ring-2 focus:ring-primary/30 outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* TAB 4: TYPE-SPECIFIC DETAILS */}
        {activeTab === 'specific' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-ink">
              <strong>Active Type:</strong> {form.type}. Provide additional structured metadata relevant to this specific resource format.
            </div>

            {/* Course Specific */}
            {isCourse && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-surface">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Course Provider / Platform</label>
                  <input
                    type="text"
                    placeholder="e.g. Coursera, Udemy, MIT OCW..."
                    value={form.metadata.courseProvider || form.provider}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, courseProvider: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Credential / Certificate URL</label>
                  <input
                    type="url"
                    placeholder="https://coursera.org/verify/..."
                    value={form.metadata.certificateUrl || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, certificateUrl: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
              </div>
            )}

            {/* GitHub / Code Specific */}
            {isRepo && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-surface">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Primary Language</label>
                  <input
                    type="text"
                    placeholder="e.g. Rust, Go, TypeScript..."
                    value={form.metadata.repoLanguage || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, repoLanguage: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Repository Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. vercel, facebook, tokio-rs..."
                    value={form.metadata.repoOwner || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, repoOwner: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">License</label>
                  <input
                    type="text"
                    placeholder="e.g. MIT, Apache-2.0..."
                    value={form.metadata.license || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, license: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
              </div>
            )}

            {/* Research Paper Specific */}
            {isPaper && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-surface">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">DOI / ArXiv ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 10.1145/3035918.3035928, 2305.18290"
                    value={form.metadata.doi || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, doi: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Publication Venue / Conference</label>
                  <input
                    type="text"
                    placeholder="e.g. OSDI '22, SIGMOD, NeurIPS..."
                    value={form.metadata.venue || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, venue: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
              </div>
            )}

            {/* Book Specific */}
            {isBook && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-surface">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">ISBN</label>
                  <input
                    type="text"
                    placeholder="e.g. 978-1449373320"
                    value={form.metadata.isbn || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, isbn: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Publisher</label>
                  <input
                    type="text"
                    placeholder="e.g. O'Reilly, Addison-Wesley, No Starch Press..."
                    value={form.metadata.publisher || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, publisher: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
              </div>
            )}

            {/* Tool / Utility Specific */}
            {isTool && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-surface">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Tool Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Profiler, Linter, API Client, Database GUI..."
                    value={form.metadata.toolCategory || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, toolCategory: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Version / Command</label>
                  <input
                    type="text"
                    placeholder="e.g. v2.18, cargo clippy..."
                    value={form.metadata.version || ''}
                    onChange={e => setForm({ ...form, metadata: { ...form.metadata, version: e.target.value } })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-ink"
                  />
                </div>
              </div>
            )}

            {/* General fallback fields */}
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Cover Image or Thumbnail URL (Optional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or /uploads/..."
                value={form.coverImageUrl}
                onChange={e => setForm({ ...form, coverImageUrl: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-ink focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>
        )}

        </fieldset>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted">
              {activeTab === 'basic' && 'Step 1 of 4'}
              {activeTab === 'relations' && 'Step 2 of 4'}
              {activeTab === 'workflow' && 'Step 3 of 4'}
              {activeTab === 'specific' && 'Step 4 of 4'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary text-xs"
              disabled={submitting}
            >
              {isViewer ? 'Close' : 'Cancel'}
            </button>
            {canEdit && (
              <button
                type="submit"
                disabled={submitting}
                className="button-primary text-xs"
              >
                {submitting ? 'Saving to Database…' : resourceToEdit ? 'Save Changes' : 'Create Resource'}
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
