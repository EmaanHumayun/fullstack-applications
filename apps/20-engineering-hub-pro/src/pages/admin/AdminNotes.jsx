import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Archive,
  RefreshCw,
  Folder,
  Tag,
  Eye,
  EyeOff,
  Code2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { SafeMarkdown } from '../../lib/markdown.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

export default function AdminNotes() {
  const { isViewer, canEdit } = useAuth();
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('active'); // active | archived | all
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTab, setPreviewTab] = useState('edit'); // edit | preview | split

  const [formData, setFormData] = useState({
    title: '',
    category: 'Backend',
    content: '',
    tags: '',
    project: '',
    published: false
  });

  const categories = ['Backend', 'System Design', 'AI & Agents', 'Database', 'DevOps', 'Architecture', 'General'];

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [notesRes, projectsRes] = await Promise.all([
        api('/notes?all=true'),
        api('/projects?all=true')
      ]);
      setNotes(notesRes || []);
      setProjects(projectsRes || []);
    } catch (err) {
      showToast(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    if (isViewer) {
      showToast('Viewer mode: creating notes is disabled.');
      return;
    }
    setEditingNote(null);
    setFormData({
      title: '',
      category: 'Backend',
      content: '## Overview\n\nExplain the architectural concept or problem statement here...\n\n### Key Takeaways\n- Point 1\n- Point 2',
      tags: '',
      project: '',
      published: false
    });
    setPreviewTab('edit');
    setModalOpen(true);
  };

  const openEdit = note => {
    if (isViewer) {
      showToast('Viewer mode: editing notes is disabled.');
      return;
    }
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      category: note.category || 'Backend',
      content: note.content || '',
      tags: Array.isArray(note.tags) ? note.tags.join(', ') : note.tags || '',
      project: note.project?._id || note.project || '',
      published: note.published === true
    });
    setPreviewTab('edit');
    setModalOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewer mode: changes cannot be saved.');
      return;
    }
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        content: formData.content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        project: formData.project || null,
        published: formData.published
      };

      if (editingNote) {
        await api(`/notes/${editingNote._id}`, {
          method: 'PUT',
          body: jsonBody(payload)
        });
        showToast('Knowledge note updated');
      } else {
        await api('/notes', {
          method: 'POST',
          body: jsonBody(payload)
        });
        showToast('Knowledge note created');
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save note');
    }
  };

  const handleArchiveToggle = async note => {
    if (isViewer) {
      showToast('Viewer mode: archiving is disabled.');
      return;
    }
    try {
      const isArchived = !note.isArchived;
      await api(`/notes/${note._id}`, {
        method: 'PUT',
        body: jsonBody({ isArchived })
      });
      showToast(isArchived ? 'Note archived' : 'Note restored');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update note status');
    }
  };

  const handleDelete = async () => {
    if (isViewer) {
      showToast('Viewer mode: deletion is disabled.');
      return;
    }
    if (!deleteTarget) return;
    try {
      await api(`/notes/${deleteTarget._id}`, {
        method: 'DELETE'
      });
      showToast('Note permanently deleted');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete note');
    }
  };

  const filtered = notes.filter(n => {
    if (statusFilter === 'active' && n.isArchived) return false;
    if (statusFilter === 'archived' && !n.isArchived) return false;
    if (categoryFilter !== 'All' && n.category !== categoryFilter) return false;

    const query = search.toLowerCase();
    return (
      (n.title || '').toLowerCase().includes(query) ||
      (n.content || '').toLowerCase().includes(query) ||
      (n.tags || []).some(t => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <BookOpen size={14} />
            Personal Knowledge Management (PKM)
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
            Technical Knowledge Notes
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Document architectural trade-offs, concept breakdowns, and learning in public with safe Markdown.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="p-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition shadow-sm"
            >
              <Plus size={16} />
              New Knowledge Note
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search concepts, notes, tags..."
              className="w-full pl-10 pr-3 py-2 text-xs border border-border bg-background text-text placeholder:text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setCategoryFilter('All')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                categoryFilter === 'All' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  categoryFilter === cat ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              statusFilter === 'active' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            Active ({notes.filter(n => !n.isArchived).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('archived')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              statusFilter === 'archived' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            Archived ({notes.filter(n => n.isArchived).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              statusFilter === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            All ({notes.length})
          </button>
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-sm">Loading notes…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notes match your filters"
          description="Create your first PKM note on idempotency, distributed systems, or LLM prompting."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(note => (
            <article
              key={note._id}
              className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                note.isArchived ? 'opacity-65 border-stone-200 bg-stone-50/60' : 'border-stone-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                    {note.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {note.published ? (
                      <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        Public
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                    {note.isArchived && (
                      <span className="text-[10px] font-medium bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-2">
                  {note.title}
                </h3>

                <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                  {note.content.replace(/[#*`_]/g, '')}
                </p>

                {note.project && (
                  <div className="mt-3.5 flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                    <Code2 size={13} className="text-stone-400" />
                    <span className="truncate">
                      Linked: {note.project.title || 'Project'}
                    </span>
                  </div>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {note.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                <span>
                  {note.updatedAt
                    ? new Date(note.updatedAt).toLocaleDateString()
                    : new Date(note.createdAt).toLocaleDateString()}
                </span>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleArchiveToggle(note)}
                      title={note.isArchived ? 'Restore' : 'Archive'}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition"
                    >
                      <Archive size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(note)}
                      title="Edit Note"
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded transition"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(note)}
                      title="Delete permanently"
                      className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <Modal
          title={editingNote ? 'Edit Knowledge Note' : 'Write Knowledge Note'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {isViewer && <ReadOnlyNotice featureName="Knowledge Notes" />}
            <fieldset disabled={isViewer} className="contents space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Distributed Lock Patterns in Redis"
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Associated Project (optional)
                </label>
                <select
                  value={formData.project}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                >
                  <option value="">None (Independent Note)</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Concurrency, Mutex, Architecture"
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Content (Markdown) *
                  </label>
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-md text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('edit')}
                      className={`px-2 py-0.5 rounded font-medium transition ${
                        previewTab === 'edit' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('preview')}
                      className={`px-2 py-0.5 rounded font-medium transition ${
                        previewTab === 'preview' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('split')}
                      className={`px-2 py-0.5 rounded font-medium transition ${
                        previewTab === 'split' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                      }`}
                    >
                      Split
                    </button>
                  </div>
                </div>

                {previewTab === 'edit' && (
                  <textarea
                    rows={12}
                    required
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write detailed notes with code blocks, tables, and lists..."
                    className="w-full font-mono text-xs p-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 leading-relaxed"
                  />
                )}

                {previewTab === 'preview' && (
                  <div className="p-4 border border-stone-200 rounded-lg bg-stone-50/50 min-h-[280px] max-h-96 overflow-y-auto">
                    <SafeMarkdown content={formData.content || '_No content written yet._'} />
                  </div>
                )}

                {previewTab === 'split' && (
                  <div className="grid grid-cols-2 gap-3">
                    <textarea
                      rows={12}
                      required
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      className="w-full font-mono text-xs p-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 leading-relaxed"
                    />
                    <div className="p-3 border border-stone-200 rounded-lg bg-stone-50/50 max-h-96 overflow-y-auto">
                      <SafeMarkdown content={formData.content || '_No content written yet._'} />
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={e => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded text-amber-700 focus:ring-amber-700"
                  />
                  <span>Publish publicly to Portfolio Notes library</span>
                </label>
              </div>
            </div>
            </fieldset>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition"
              >
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {canEdit && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition"
                >
                  {editingNote ? 'Save Changes' : 'Save Note'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          title={`Delete Note: "${deleteTarget.title}"?`}
          message="This action removes the note record permanently."
          confirmText="Delete Note"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
