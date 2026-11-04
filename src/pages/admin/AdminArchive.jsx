import React, { useState, useEffect, useCallback } from 'react';
import { Archive, RefreshCw, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api.js';
import { ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

export function AdminArchive() {
  const { isViewer, canEdit } = useAuth();
  const [data, setData] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [emptyTrashConfirm, setEmptyTrashConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/archive');
      setData(res);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRestore(entityType, id) {
    if (isViewer) {
      showToast('Viewer mode: item restoration is disabled.');
      return;
    }
    try {
      await api(`/archive/restore/${entityType}/${id}`, { method: 'PUT' });
      showToast('Item restored successfully');
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handlePermanentDelete() {
    if (isViewer) {
      showToast('Viewer mode: permanent deletion is disabled.');
      return;
    }
    if (!deleteTarget) return;
    try {
      await api(`/archive/permanent/${deleteTarget.entityType}/${deleteTarget._id}`, { method: 'DELETE' });
      showToast('Item permanently deleted');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleEmptyTrash() {
    if (isViewer) {
      showToast('Viewer mode: emptying recycle bin is disabled.');
      return;
    }
    try {
      await api('/archive/empty-trash', { method: 'POST' });
      showToast('Recycle bin emptied');
      setEmptyTrashConfirm(false);
      await load();
    } catch (err) {
      showToast(err.message);
    }
  }

  const allItems = data
    ? [
        ...(data.projects || []),
        ...(data.skills || []),
        ...(data.roadmaps || []),
        ...(data.workLogs || []),
        ...(data.milestones || []),
        ...(data.goals || []),
        ...(data.notes || []),
        ...(data.certificates || []),
        ...(data.socialLinks || []),
        ...(data.practiceLabs || []),
        ...(data.assignments || []),
        ...(data.resumes || [])
      ]
    : [];

  const filteredItems = selectedEntity === 'all'
    ? allItems
    : allItems.filter(item => item.entityType === selectedEntity);

  return (
    <div className="admin-page">
      {isViewer && <ReadOnlyNotice featureName="Recycle Bin & Archive" />}

      <div className="admin-page-top">
        <div>
          <p className="eyebrow">RECYCLE BIN & RESTORATION</p>
          <h1 className="admin-title">Unified <em>Archive</em></h1>
          <p className="admin-subtitle">
            Safely recover archived records or permanently purge discarded content across all modules.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="button-secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
          {canEdit && data?.totalArchived > 0 && (
            <button
              type="button"
              className="rounded-lg bg-red-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-800 flex items-center gap-1.5"
              onClick={() => setEmptyTrashConfirm(true)}
            >
              <Trash2 size={14} /> Empty Recycle Bin
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'all', label: `All Archived (${data?.totalArchived ?? 0})` },
          { id: 'project', label: `Projects (${data?.projects?.length ?? 0})` },
          { id: 'skill', label: `Skills (${data?.skills?.length ?? 0})` },
          { id: 'roadmap', label: `Roadmaps (${data?.roadmaps?.length ?? 0})` },
          { id: 'workLog', label: `Work Logs (${data?.workLogs?.length ?? 0})` },
          { id: 'milestone', label: `Milestones (${data?.milestones?.length ?? 0})` },
          { id: 'goal', label: `Goals (${data?.goals?.length ?? 0})` },
          { id: 'note', label: `Notes (${data?.notes?.length ?? 0})` },
          { id: 'certificate', label: `Certificates (${data?.certificates?.length ?? 0})` },
          { id: 'socialLink', label: `Social Links (${data?.socialLinks?.length ?? 0})` },
          { id: 'practiceLab', label: `Practice Labs (${data?.practiceLabs?.length ?? 0})` },
          { id: 'assignment', label: `Assignments (${data?.assignments?.length ?? 0})` },
          { id: 'resume', label: `Resumes (${data?.resumes?.length ?? 0})` }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedEntity(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${selectedEntity === tab.id
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredItems.length ? (
        <div className="panel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-100 text-[10px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="p-3">Record Title</th>
                  <th className="p-3">Module Type</th>
                  <th className="p-3">Archived Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredItems.map(item => (
                  <tr key={`${item.entityType}-${item._id}`} className="hover:bg-stone-50/70">
                    <td className="p-3 font-semibold text-stone-900">
                      {item.label || item.title || item.name}
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-600">
                        {item.entityType}
                      </span>
                    </td>
                    <td className="p-3 text-stone-500">
                      {item.archivedAt ? new Date(item.archivedAt).toLocaleString() : 'Archived'}
                    </td>
                    <td className="p-3 text-right">
                      {canEdit ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="button-secondary text-xs text-emerald-700 flex items-center gap-1"
                            onClick={() => handleRestore(item.entityType, item._id)}
                          >
                            <RotateCcw size={12} /> Restore
                          </button>
                          <button
                            type="button"
                            className="button-secondary text-xs text-red-600 flex items-center gap-1"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 size={12} /> Permanent Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Recycle bin is empty"
          description="Archived items across projects, skills, notes, and milestones will be listed here."
        />
      )}

      {/* Permanent Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Permanently Delete Item"
        message={`This will permanently remove "${deleteTarget?.label || deleteTarget?.title}" from the database. This cannot be undone.`}
        confirmText="Permanently Delete"
        danger
        onConfirm={handlePermanentDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Empty Trash Confirm */}
      <ConfirmModal
        isOpen={emptyTrashConfirm}
        title="Empty Entire Recycle Bin"
        message="Are you sure you want to permanently delete all archived items across all modules? This action cannot be reversed."
        confirmText="Empty Recycle Bin"
        danger
        onConfirm={handleEmptyTrash}
        onCancel={() => setEmptyTrashConfirm(false)}
      />

      <Toast message={toast} />
    </div>
  );
}

export default AdminArchive;
