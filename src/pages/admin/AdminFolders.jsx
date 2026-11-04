import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  FolderPlus,
  Plus,
  Search,
  Trash2,
  Edit2,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Layers,
  Archive,
  RefreshCw,
  ExternalLink,
  Code2
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

export default function AdminFolders() {
  const { isViewer, canEdit } = useAuth();
  const [tree, setTree] = useState([]);
  const [flatFolders, setFlatFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteStrategy, setDeleteStrategy] = useState('reparent'); // 'reparent' | 'cascade'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    color: '#bb9457',
    icon: 'folder',
    published: true
  });

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [treeRes, foldersRes] = await Promise.all([
        api('/projects/tree'),
        api('/folders')
      ]);
      setTree(treeRes || []);
      setFlatFolders(foldersRes || []);
      
      // Auto-expand root folders
      const initialExp = {};
      (treeRes || []).forEach(node => {
        initialExp[node._id] = true;
      });
      setExpanded(prev => ({ ...initialExp, ...prev }));
    } catch (err) {
      showToast(err.message || 'Failed to load collections hierarchy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleExpand = id => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreate = (parentFolder = null) => {
    if (isViewer) {
      showToast('Viewer mode: creating collections is disabled.');
      return;
    }
    setEditingFolder(null);
    setFormData({
      name: '',
      description: '',
      parentId: parentFolder ? parentFolder._id : '',
      color: '#bb9457',
      icon: 'folder',
      published: true
    });
    setModalOpen(true);
  };

  const openEdit = folder => {
    if (isViewer) {
      showToast('Viewer mode: editing collections is disabled.');
      return;
    }
    setEditingFolder(folder);
    setFormData({
      name: folder.name || folder.title || '',
      description: folder.description || folder.summary || '',
      parentId: folder.parentId?._id || folder.parentId || '',
      color: folder.color || '#bb9457',
      icon: folder.icon || 'folder',
      published: folder.published !== false
    });
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
        name: formData.name,
        title: formData.name, // sync for project compatibility
        description: formData.description,
        summary: formData.description,
        parentId: formData.parentId || null,
        color: formData.color,
        icon: formData.icon,
        published: formData.published,
        type: 'folder'
      };

      if (editingFolder) {
        await api(`/folders/${editingFolder._id}`, {
          method: 'PUT',
          body: jsonBody(payload)
        });
        showToast('Collection updated successfully');
      } else {
        await api('/folders', {
          method: 'POST',
          body: jsonBody(payload)
        });
        showToast('Collection created successfully');
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save collection');
    }
  };

  const handleDelete = async () => {
    if (isViewer) {
      showToast('Viewer mode: deletion is disabled.');
      return;
    }
    if (!deleteTarget) return;
    try {
      await api(`/folders/${deleteTarget._id}?strategy=${deleteStrategy}`, {
        method: 'DELETE'
      });
      showToast(
        deleteStrategy === 'cascade'
          ? 'Collection and sub-items permanently deleted'
          : 'Collection deleted and sub-items re-parented'
      );
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete collection');
    }
  };

  // Render tree node recursively
  const renderTreeNode = (node, depth = 0) => {
    const isFolder = node.type === 'folder' || !node.type;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expanded[node._id];

    return (
      <div key={node._id} className="tree-node-wrapper" style={{ marginLeft: `${depth * 20}px` }}>
        <div className={`tree-row flex items-center justify-between p-2.5 rounded-lg border border-stone-200/80 mb-1.5 transition ${
          isFolder ? 'bg-amber-50/40 hover:bg-amber-50/80' : 'bg-white hover:bg-stone-50'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node._id)}
                className="p-1 text-stone-500 hover:text-stone-800 rounded transition"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-6" />
            )}

            <span
              className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: node.color || (isFolder ? '#bb9457' : '#6f1d1b') }}
            >
              {isFolder ? <Folder size={14} /> : <Code2 size={14} />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-stone-800 truncate">
                  {node.title || node.name}
                </span>
                {node.level && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700">
                    {node.level}
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-stone-100 text-stone-600">
                  {node.repoType || node.type || 'item'}
                </span>
                {node.githubUrl && (
                  <a
                    href={node.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-stone-400 hover:text-stone-800 p-0.5"
                    title="Open on GitHub"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
                {!node.published && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                    Draft
                  </span>
                )}
              </div>
              {node.summary && (
                <p className="text-xs text-stone-500 truncate max-w-md">{node.summary}</p>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1.5 shrink-0">
              {isFolder && (
                <button
                  type="button"
                  onClick={() => openCreate(node)}
                  title="Add sub-collection inside"
                  className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-100/50 rounded transition"
                >
                  <Plus size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={() => openEdit(node)}
                title="Edit collection"
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded transition"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(node)}
                title="Delete collection"
                className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children border-l-2 border-stone-200 ml-4 pl-1">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredFlat = flatFolders.filter(f =>
    (f.name || f.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.description || f.summary || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <Layers size={14} />
            Hierarchy & Collections Engine
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
            Project Tree & Workspaces
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Organize engineering repositories into nested acyclic hierarchies with DAG cycle-prevention.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="p-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition"
            title="Refresh tree"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={() => openCreate(null)}
              className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition shadow-sm"
            >
              <FolderPlus size={16} />
              New Root Collection
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Tree */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderTree size={18} className="text-amber-700" />
                <h3 className="font-semibold text-stone-900">Nested Hierarchy Explorer</h3>
              </div>
              <span className="text-xs text-stone-500">
                {flatFolders.length} Collections Total
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-stone-500">
                Loading project tree…
              </div>
            ) : tree.length === 0 ? (
              <EmptyState
                title="No collections created yet"
                description="Create root folders like 'Backend Systems' or 'AI Agents' to organize projects."
              />
            ) : (
              <div className="space-y-1">{tree.map(node => renderTreeNode(node, 0))}</div>
            )}
          </div>
        </div>

        {/* Right Col: Flat Quick List & Info */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-stone-900 text-sm">Quick Search</h3>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search collection name…"
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto pt-2">
              {filteredFlat.map(f => (
                <div
                  key={f._id}
                  className="py-2.5 flex items-center justify-between text-xs hover:bg-stone-50 px-2 rounded transition"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: f.color || '#bb9457' }}
                    />
                    <span className="font-medium text-stone-800 truncate">
                      {f.name || f.title}
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openEdit(f)}
                      className="text-stone-400 hover:text-stone-800 px-1"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-xs text-stone-700 space-y-2">
            <strong className="block font-semibold text-amber-900">
              Acyclic DAG Guarantee
            </strong>
            <p>
              The hierarchy engine prevents circular references (e.g. A → B → A). When modifying a
              parent collection, the server verifies full graph reachability before committing.
            </p>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <Modal
          title={editingFolder ? 'Edit Collection' : 'Create New Collection'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {isViewer && <ReadOnlyNotice featureName="Collections & Folders" />}
            <fieldset disabled={isViewer} className="contents space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Backend Architecture"
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of projects in this domain…"
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Parent Collection (Hierarchy)
                </label>
                <select
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                >
                  <option value="">None (Top-Level Root)</option>
                  {flatFolders
                    .filter(f => !editingFolder || f._id !== editingFolder._id)
                    .map(f => (
                      <option key={f._id} value={f._id}>
                        {f.name || f.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      className="w-8 h-8 rounded border border-stone-200 cursor-pointer disabled:opacity-60"
                    />
                    <span className="text-xs font-mono text-stone-600">{formData.color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Public Visibility
                  </label>
                  <label className="flex items-center gap-2 mt-2 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={e => setFormData({ ...formData, published: e.target.checked })}
                      className="rounded text-amber-700 focus:ring-amber-700 disabled:opacity-60"
                    />
                    <span>Show in public catalogue</span>
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
                  {editingFolder ? 'Save Changes' : 'Create Collection'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Strategy Modal */}
      {deleteTarget && (
        <ConfirmModal
          title={`Delete Collection: "${deleteTarget.name || deleteTarget.title}"?`}
          message="Choose how you want to handle any child projects or nested sub-collections inside this folder."
          confirmText="Confirm Deletion"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        >
          <div className="space-y-3 py-2 text-xs text-stone-700">
            <label className="flex items-start gap-2.5 p-2.5 border rounded-lg cursor-pointer hover:bg-stone-50 transition border-stone-200">
              <input
                type="radio"
                name="strategy"
                value="reparent"
                checked={deleteStrategy === 'reparent'}
                onChange={() => setDeleteStrategy('reparent')}
                className="mt-0.5"
              />
              <div>
                <strong className="block text-stone-900">Re-parent (Safe)</strong>
                <span className="text-stone-500">
                  Move sub-items up to this collection's parent (or root). No projects are deleted.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 border rounded-lg cursor-pointer hover:bg-red-50/50 transition border-red-200">
              <input
                type="radio"
                name="strategy"
                value="cascade"
                checked={deleteStrategy === 'cascade'}
                onChange={() => setDeleteStrategy('cascade')}
                className="mt-0.5 text-red-600"
              />
              <div>
                <strong className="block text-red-900">Cascade Delete (Destructive)</strong>
                <span className="text-stone-500">
                  Permanently delete all nested child projects, sub-tasks, and sub-folders recursively.
                </span>
              </div>
            </label>
          </div>
        </ConfirmModal>
      )}

      <Toast message={toast} />
    </div>
  );
}
