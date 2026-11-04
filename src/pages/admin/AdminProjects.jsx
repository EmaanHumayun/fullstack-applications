import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  UploadCloud,
  Check,
  LoaderCircle,
  FolderTree,
  List,
  Archive,
  Trash2,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { ProjectCard, Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { DomainSelector } from '../../components/DomainSelector.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';


const emptyProject = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  domain: 'Backend Engineering',
  fieldName: '',
  type: 'project',
  parentId: '',
  technologies: '',
  githubUrl: '',
  liveUrl: '',
  coverImage: '',
  featured: false,
  published: true,
  status: 'In progress',
  priority: 'Medium',
  tasks: []
};

export function AdminProjects() {
  const { isViewer } = useAuth();
  const [projects, setProjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [savedDomains, setSavedDomains] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [viewArchived, setViewArchived] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteCascadeModal, setDeleteCascadeModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const location = useLocation();

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    try {
      const url = viewArchived ? '/projects?all=true&archived=true' : '/projects?all=true';
      const [p, f, d] = await Promise.all([
        api(url),
        api('/folders'),
        api('/domains').catch(() => [])
      ]);
      setProjects(p);
      setFolders(f);
      setSavedDomains(d);
    } catch (err) {
      showToast(err.message);
    }
  }, [viewArchived]);

  const categoryOptions = useMemo(() => {
    const list = new Set(['All']);
    savedDomains.forEach(dom => {
      list.add(dom.name);
      (dom.fields || []).forEach(f => list.add(f.name));
    });
    projects.forEach(p => {
      if (p.domain) list.add(p.domain);
      if (p.fieldName) list.add(p.fieldName);
    });
    return Array.from(list);
  }, [savedDomains, projects]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('new') === '1') {
      openCreate();
    }
  }, [location.search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyProject);
    setModal(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      ...p,
      parentId: p.parentId?._id || p.parentId || '',
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies || '',
      tasks: p.tasks || []
    });
    setModal(true);
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api('/upload', { method: 'POST', body: data });
      setForm(f => ({ ...f, coverImage: res.url }));
      showToast('Cover image uploaded successfully');
    } catch (err) {
      showToast(err.message);
    } finally {
      setUploading(false);
    }
  }

  function addTask() {
    setForm(f => ({
      ...f,
      tasks: [
        ...f.tasks,
        { id: Math.random().toString(36).substring(2, 9), title: 'New task', weight: 1, completed: false, subtasks: [] }
      ]
    }));
  }

  function addSubtask(taskIdx) {
    setForm(f => {
      const copy = [...f.tasks];
      if (!copy[taskIdx].subtasks) copy[taskIdx].subtasks = [];
      copy[taskIdx].subtasks.push({
        id: Math.random().toString(36).substring(2, 9),
        title: 'New subtask',
        completed: false
      });
      return { ...f, tasks: copy };
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (isViewer) {
      showToast('Action restricted: Viewers cannot create or edit projects.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        parentId: form.parentId || null,
        technologies: typeof form.technologies === 'string'
          ? form.technologies.split(',').map(s => s.trim()).filter(Boolean)
          : form.technologies
      };

      if (editing) {
        await api(`/projects/${editing._id}`, { method: 'PUT', body: jsonBody(payload) });
        showToast('Project updated successfully');
      } else {
        await api('/projects', { method: 'POST', body: jsonBody(payload) });
        showToast('Project created successfully');
      }
      setModal(false);
      await load();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive(p) {
    if (isViewer) {
      showToast('Action restricted: Viewers cannot archive projects.');
      return;
    }
    try {
      await api(`/projects/${p._id}/archive`, { method: 'PUT' });
      showToast(`Project "${p.title}" archived`);
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleRestore(p) {
    if (isViewer) {
      showToast('Action restricted: Viewers cannot restore projects.');
      return;
    }
    try {
      await api(`/projects/${p._id}/restore`, { method: 'PUT' });
      showToast(`Project "${p.title}" restored`);
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleDelete(p) {
    if (isViewer) {
      showToast('Action restricted: Viewers cannot delete projects.');
      return;
    }
    try {
      const res = await fetch(`/api/projects/${p._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('eh_token') ? { Authorization: `Bearer ${localStorage.getItem('eh_token')}` } : {})
        }
      });
      const data = await res.json();

      if (res.status === 400 && data.hasChildren) {
        setDeleteCascadeModal({ project: p, children: data.children, count: data.childrenCount });
        return;
      }

      if (!res.ok) throw new Error(data.message || 'Delete failed');
      showToast('Project deleted');
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function executeCascadeDelete(mode) {
    if (!deleteCascadeModal) return;
    try {
      await api(`/projects/${deleteCascadeModal.project._id}?mode=${mode}`, { method: 'DELETE' });
      showToast(mode === 'cascade' ? 'Project and descendants deleted' : 'Project deleted and children reparented');
      setDeleteCascadeModal(null);
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  const filtered = projects.filter(p => {
    const catMatch =
      selectedCategory === 'All' ||
      p.domain === selectedCategory ||
      p.fieldName === selectedCategory;
    const textMatch = `${p.title} ${p.domain} ${p.fieldName || ''} ${p.summary} ${(p.technologies || []).join(' ')}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return catMatch && textMatch;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-top">
        <div>
          <p className="eyebrow">PORTFOLIO & CODEBASE</p>
          <h1 className="admin-title">Projects & <em>Repositories</em></h1>
          <p className="admin-subtitle">
            Manage hierarchical software projects, subtasks, external GitHub and live links, and publishing status.
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
              <Plus size={16} /> Add Project
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
        {categoryOptions.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-primary text-primary-text border-primary shadow-xs'
                  : 'bg-surface text-muted border-border hover:bg-hover hover:text-text hover:border-border-subtle'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Enhanced Search & Meta Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 sm:p-3.5 rounded-2xl border border-border shadow-xs mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects, technologies, or keywords…"
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

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-muted px-1">
          <span className="font-mono font-medium">
            <strong className="text-text font-bold">{filtered.length}</strong> {filtered.length === 1 ? 'project' : 'projects'} {viewArchived ? '(Archived)' : ''}
          </span>
          <span className="hidden md:inline-block opacity-40">·</span>
          <span className="hidden md:inline-block text-[11px] text-muted">
            Published records render live on portfolio
          </span>
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(p => (
            <ProjectCard
              key={p._id}
              project={p}
              admin={!isViewer}
              onEdit={!isViewer ? openEdit : null}
              onArchive={!isViewer ? handleArchive : null}
              onRestore={!isViewer ? handleRestore : null}
              onDelete={!isViewer ? handleDelete : null}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={viewArchived ? 'No archived projects' : 'No projects yet'}
          description="Create your first project record to populate your portfolio and engineering tree."
        />
      )}

      {/* Project Modal */}
      {modal && (
        <Modal title={editing ? (isViewer ? 'Project Specification (Read-Only)' : 'Edit Project') : 'Create Project'} onClose={() => setModal(false)}>
          <form onSubmit={handleSave} className="editor-form">
            <ReadOnlyNotice message="Project records cannot be added or modified in Read-Only Viewer mode." />
            <div className="form-grid">
              <label className="field-span-2">
                Project Title *
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Distributed Background Job Pipeline"
                />
              </label>

              <label className="field-span-2">
                Short Summary
                <textarea
                  rows="2"
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  placeholder="What problem does it solve and what is the architecture?"
                />
              </label>

              <div className="field-span-2">
                <DomainSelector
                  primaryDomainId={form.primaryDomain || form.domainId || form.domain}
                  subdomainName={form.subdomain || form.fieldName}
                  onChange={({ primaryDomainId, primaryDomainName, subdomainName, subdomainId }) => {
                    setForm(f => ({
                      ...f,
                      primaryDomain: primaryDomainId,
                      domainId: primaryDomainId,
                      domain: primaryDomainName,
                      subdomain: subdomainName,
                      fieldName: subdomainName,
                      fieldId: subdomainId ? String(subdomainId) : null
                    }));
                  }}
                />
              </div>

              <label>
                Parent Project / Category
                <select
                  value={form.parentId}
                  onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                >
                  <option value="">No Parent (Root Item)</option>
                  {projects
                    .filter(item => !editing || item._id !== editing._id)
                    .map(item => (
                      <option key={item._id} value={item._id}>
                        {item.type === 'folder' ? '📁 ' : '⚡ '} {item.title}
                      </option>
                    ))}
                </select>
              </label>

              <label className="field-span-2">
                Detailed Description (Markdown supported)
                <textarea
                  rows="5"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Design decisions, API endpoints, scalability trade-offs, and technical learnings…"
                />
              </label>

              <label className="field-span-2">
                Technologies (comma-separated)
                <input
                  value={form.technologies}
                  onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))}
                  placeholder="Node.js, Express, MongoDB, Docker, Python"
                />
              </label>

              <label>
                GitHub Repository URL
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                  placeholder="https://github.com/EmaanHumayun/…"
                />
              </label>

              <label>
                Live Demo URL
                <input
                  type="url"
                  value={form.liveUrl}
                  onChange={e => setForm(f => ({ ...f, liveUrl: e.target.value }))}
                  placeholder="https://…"
                />
              </label>

              <label className="field-span-2">
                Cover Image URL or File Upload
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                  placeholder="https://… or upload file below"
                />
                {form.coverImage && (
                  <div className="relative mt-2 inline-block">
                    <img src={form.coverImage} alt="Cover preview" className="upload-preview rounded-lg max-h-40 border border-stone-200" />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, coverImage: '' }))}
                      className="absolute top-1 right-1 bg-black/75 hover:bg-black text-white p-1 rounded-full shadow-md transition"
                      title="Remove image"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
                <span className="upload-control mt-2">
                  <UploadCloud size={16} />
                  <span>{uploading ? 'Uploading to storage…' : 'Upload Cover Image (Max 10 MB)'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </span>
              </label>

              <label>
                Lifecycle Status
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option>Planned</option>
                  <option>In progress</option>
                  <option>Completed</option>
                  <option>Maintained</option>
                  <option>Archived</option>
                </select>
              </label>

              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </label>

              <div className="field-span-2 flex flex-wrap gap-5 mt-2">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  />
                  Feature on Homepage Hero
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                  />
                  Publish Publicly on Portfolio
                </label>
              </div>
            </div>

            {/* Tasks & Subtasks Checklist Editor */}
            <div className="mt-6 border-t border-stone-200 pt-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Project Tasks & Milestones</h4>
                  <p className="text-[11px] text-stone-500">Progress is derived automatically from task weights.</p>
                </div>
                <button type="button" className="button-secondary text-xs" onClick={addTask}>
                  <Plus size={13} /> Add Task
                </button>
              </div>

              <div className="space-y-3">
                {(form.tasks || []).map((t, tIdx) => (
                  <div key={t.id || tIdx} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={e => {
                          const copy = [...form.tasks];
                          copy[tIdx].completed = e.target.checked;
                          setForm(f => ({ ...f, tasks: copy }));
                        }}
                        className="rounded"
                      />
                      <input
                        value={t.title}
                        onChange={e => {
                          const copy = [...form.tasks];
                          copy[tIdx].title = e.target.value;
                          setForm(f => ({ ...f, tasks: copy }));
                        }}
                        placeholder="Task description"
                        className="text-xs flex-1 bg-white border border-stone-200 rounded p-1.5"
                      />
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={t.weight || 1}
                        onChange={e => {
                          const copy = [...form.tasks];
                          copy[tIdx].weight = Number(e.target.value);
                          setForm(f => ({ ...f, tasks: copy }));
                        }}
                        title="Task weight"
                        className="w-14 text-xs bg-white border border-stone-200 rounded p-1.5 text-center"
                      />
                    </div>

                    {/* Subtasks */}
                    <div className="ml-6 mt-2 space-y-1.5 border-l-2 border-stone-200 pl-3">
                      {(t.subtasks || []).map((st, stIdx) => (
                        <div key={st.id || stIdx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={e => {
                              const copy = [...form.tasks];
                              copy[tIdx].subtasks[stIdx].completed = e.target.checked;
                              setForm(f => ({ ...f, tasks: copy }));
                            }}
                          />
                          <input
                            value={st.title}
                            onChange={e => {
                              const copy = [...form.tasks];
                              copy[tIdx].subtasks[stIdx].title = e.target.value;
                              setForm(f => ({ ...f, tasks: copy }));
                            }}
                            className="text-xs flex-1 bg-white border border-stone-200 rounded p-1"
                            placeholder="Subtask description"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSubtask(tIdx)}
                        className="text-[10px] text-wine font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <Plus size={11} /> Add Subtask
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="button-secondary" onClick={() => setModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" className="button-primary" disabled={busy || uploading}>
                  {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />} Save Project
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Cascade / Reparent Confirmation Modal */}
      {deleteCascadeModal && (
        <Modal title="Nested Child Items Detected" onClose={() => setDeleteCascadeModal(null)}>
          <div className="space-y-4">
            <p className="text-xs text-stone-700 leading-relaxed">
              <strong>"{deleteCascadeModal.project?.title}"</strong> has <strong>{deleteCascadeModal.count} descendant item(s)</strong>.
              How would you like to handle child projects?
            </p>
            <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 max-h-40 overflow-y-auto space-y-1">
              {deleteCascadeModal.children.map(c => (
                <div key={c.id} className="text-xs text-stone-600">
                  • {c.type === 'folder' ? '📁' : '⚡'} {c.title}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                className="button-secondary text-xs flex-1"
                onClick={() => executeCascadeDelete('reparent')}
              >
                Keep Children & Reparent to Root
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 flex-1"
                onClick={() => executeCascadeDelete('cascade')}
              >
                Cascade Delete All Descendants
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Toast message={toast} />
    </div>
  );
}

export default AdminProjects;
