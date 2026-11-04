import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Archive,
  RefreshCw,
  UploadCloud,
  FileCheck,
  Tag,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { DomainSelector } from '../../components/DomainSelector.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

export default function AdminCertificates() {
  const { isViewer, canEdit } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // active | archived | all
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    primaryDomain: '',
    domain: '',
    subdomain: '',
    status: 'completed',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    verificationUrl: '',
    fileUrl: '',
    description: '',
    tags: '',
    published: true
  });

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/certificates?all=true');
      setCerts(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    if (isViewer) {
      showToast('Viewer mode: adding certificates is disabled.');
      return;
    }
    setEditingCert(null);
    setFormData({
      title: '',
      issuer: '',
      primaryDomain: '',
      domain: '',
      subdomain: '',
      status: 'completed',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      verificationUrl: '',
      fileUrl: '',
      description: '',
      tags: '',
      published: true
    });
    setModalOpen(true);
  };

  const openEdit = cert => {
    if (isViewer) {
      showToast('Viewer mode: editing certificates is disabled.');
      return;
    }
    setEditingCert(cert);
    setFormData({
      title: cert.title || '',
      issuer: cert.issuer || '',
      primaryDomain: cert.primaryDomain?._id || cert.primaryDomain || '',
      domain: cert.domain || (cert.primaryDomain?.name || ''),
      subdomain: cert.subdomain || '',
      status: cert.status || 'completed',
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : (cert.issuedAt || ''),
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      verificationUrl: cert.verificationUrl || '',
      fileUrl: cert.fileUrl || cert.imageUrl || '',
      description: cert.description || '',
      tags: Array.isArray(cert.tags) ? cert.tags.join(', ') : cert.tags || '',
      published: cert.published !== false
    });
    setModalOpen(true);
  };

  const handleFileUpload = async e => {
    if (isViewer) {
      showToast('Viewer mode: uploads are disabled.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api('/upload', {
        method: 'POST',
        body: data
      });
      setFormData(prev => ({ ...prev, fileUrl: res.url }));
      showToast('Certificate document uploaded successfully');
    } catch (err) {
      showToast(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
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
        issuer: formData.issuer,
        primaryDomain: formData.primaryDomain || undefined,
        domain: formData.domain || undefined,
        subdomain: formData.subdomain || undefined,
        status: formData.status || 'completed',
        issueDate: formData.issueDate ? new Date(formData.issueDate) : undefined,
        issuedAt: formData.issueDate,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        credentialId: formData.credentialId,
        credentialUrl: formData.credentialUrl,
        verificationUrl: formData.verificationUrl,
        fileUrl: formData.fileUrl,
        imageUrl: formData.fileUrl,
        description: formData.description,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        published: formData.published
      };

      if (editingCert) {
        await api(`/certificates/${editingCert._id}`, {
          method: 'PUT',
          body: jsonBody(payload)
        });
        showToast('Certificate updated successfully');
      } else {
        await api('/certificates', {
          method: 'POST',
          body: jsonBody(payload)
        });
        showToast('Certificate added successfully');
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save certificate');
    }
  };

  const handleArchiveToggle = async cert => {
    if (isViewer) {
      showToast('Viewer mode: archiving is disabled.');
      return;
    }
    try {
      const isArchived = !cert.isArchived;
      await api(`/certificates/${cert._id}`, {
        method: 'PUT',
        body: jsonBody({ isArchived })
      });
      showToast(isArchived ? 'Certificate archived' : 'Certificate restored');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update certificate status');
    }
  };

  const handleDelete = async () => {
    if (isViewer) {
      showToast('Viewer mode: deletion is disabled.');
      return;
    }
    if (!deleteTarget) return;
    try {
      await api(`/certificates/${deleteTarget._id}`, {
        method: 'DELETE'
      });
      showToast('Certificate permanently removed');
      setCerts(prev => prev.filter(c => c._id !== deleteTarget._id));
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete certificate');
    }
  };

  const filtered = certs.filter(c => {
    if (statusFilter === 'active' && c.isArchived) return false;
    if (statusFilter === 'archived' && !c.isArchived) return false;

    const query = search.toLowerCase();
    return (
      (c.title || '').toLowerCase().includes(query) ||
      (c.issuer || '').toLowerCase().includes(query) ||
      (c.credentialId || '').toLowerCase().includes(query) ||
      (c.tags || []).some(t => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <GraduationCap size={14} />
            Credential & Licensing Engine
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
            Certificates & Qualifications
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Manage professional credentials, verifiable links, and PDF/image proofs for your portfolio.
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
              Add Certificate
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, issuer, tag..."
            className="w-full pl-10 pr-3 py-2 text-xs border border-border bg-background text-text placeholder:text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                statusFilter === 'active' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              Active ({certs.filter(c => !c.isArchived).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                statusFilter === 'archived' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              Archived ({certs.filter(c => c.isArchived).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              All ({certs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Certificates */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-sm">Loading credentials…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No certificates found"
          description="Add verified certificates from AWS, Coursera, Google, deeplearning.ai, etc."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(cert => (
            <div
              key={cert._id}
              className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                cert.isArchived ? 'opacity-65 border-stone-200 bg-stone-50/60' : 'border-stone-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {cert.published ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle size={10} /> Public
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        Private
                      </span>
                    )}
                    {cert.isArchived && (
                      <span className="text-[10px] font-medium bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-2">
                  {cert.title}
                </h3>
                <p className="text-xs font-medium text-amber-800 mt-1">{cert.issuer}</p>

                {cert.description && (
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2">{cert.description}</p>
                )}

                <div className="mt-4 space-y-1.5 text-xs text-stone-500">
                  {(cert.issueDate || cert.issuedAt) && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-stone-400" />
                      <span>
                        Issued:{' '}
                        {cert.issueDate
                          ? new Date(cert.issueDate).toLocaleDateString()
                          : cert.issuedAt}
                      </span>
                    </div>
                  )}
                  {cert.credentialId && (
                    <div className="flex items-center gap-1.5 truncate">
                      <FileCheck size={13} className="text-stone-400" />
                      <span className="truncate">ID: {cert.credentialId}</span>
                    </div>
                  )}
                </div>

                {cert.tags && cert.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {cert.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1"
                    >
                      Verify <ExternalLink size={12} />
                    </a>
                  )}
                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-stone-600 hover:underline"
                    >
                      Proof
                    </a>
                  )}
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleArchiveToggle(cert)}
                      title={cert.isArchived ? 'Restore' : 'Archive'}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition"
                    >
                      <Archive size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(cert)}
                      title="Edit"
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded transition"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cert)}
                      title="Delete permanently"
                      className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <Modal
          title={editingCert ? 'Edit Certificate' : 'Add New Certificate'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {isViewer && <ReadOnlyNotice featureName="Certificates & Qualifications" />}
            <fieldset disabled={isViewer} className="contents space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Certificate Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.issuer}
                    onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Credential Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 bg-white disabled:opacity-60 disabled:bg-stone-50"
                  >
                    <option value="completed">Completed / Verified</option>
                    <option value="in_progress">In-Progress Preparation</option>
                    <option value="planned">Planned</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <DomainSelector
                    primaryDomain={formData.primaryDomain}
                    subdomain={formData.subdomain}
                    onChange={({ primaryDomain, subdomain }) => {
                      setFormData(prev => ({ ...prev, primaryDomain, subdomain }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Credential ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.credentialId}
                    onChange={e => setFormData({ ...formData, credentialId: e.target.value })}
                    placeholder="e.g. ABC-123456-XYZ"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Expiry Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Verification / Badge URL
                  </label>
                  <input
                    type="url"
                    value={formData.credentialUrl}
                    onChange={e => setFormData({ ...formData, credentialUrl: e.target.value })}
                    placeholder="https://www.credly.com/badges/..."
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Certificate Document (Image or PDF)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="url"
                      value={formData.fileUrl}
                      onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                      placeholder="Document URL or upload file"
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                    />
                    {!isViewer && (
                      <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer transition">
                        <UploadCloud size={15} />
                        <span>{uploading ? 'Uploading…' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Skills & Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Cloud, DevOps, Architecture"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Description / Key Topics
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe what this certification validates..."
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:opacity-60 disabled:bg-stone-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={e => setFormData({ ...formData, published: e.target.checked })}
                      className="rounded text-amber-700 focus:ring-amber-700 disabled:opacity-60"
                    />
                    <span>Show this certificate on public portfolio</span>
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
                  disabled={uploading}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition"
                >
                  {editingCert ? 'Save Changes' : 'Add Certificate'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title={`Permanently delete "${deleteTarget.title}"?`}
          message="This action removes the certificate record and cannot be undone."
          confirmText="Delete Certificate"
          danger
          onCancel={() => setDeleteTarget(null)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
