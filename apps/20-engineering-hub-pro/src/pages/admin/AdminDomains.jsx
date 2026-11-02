import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Tag,
  Check,
  AlertCircle,
  ExternalLink,
  Code,
  Shield,
  Cpu,
  Cloud,
  Zap,
  Globe,
  Database,
  Terminal,
  Server
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, Toast } from '../../components.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

const ICON_PRESETS = [
  { id: 'layers', label: 'Layers', Icon: Layers },
  { id: 'code', label: 'Code', Icon: Code },
  { id: 'cpu', label: 'CPU / AI', Icon: Cpu },
  { id: 'shield', label: 'Security', Icon: Shield },
  { id: 'cloud', label: 'Cloud', Icon: Cloud },
  { id: 'zap', label: 'Automation', Icon: Zap },
  { id: 'database', label: 'Database', Icon: Database },
  { id: 'terminal', label: 'Systems', Icon: Terminal },
  { id: 'server', label: 'Server', Icon: Server },
  { id: 'globe', label: 'Web', Icon: Globe }
];

export function getDomainIcon(iconKey) {
  const match = ICON_PRESETS.find(p => p.id === iconKey);
  return match ? match.Icon : Layers;
}

export function AdminDomains() {
  const { isViewer } = useAuth();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  // Domain Modal
  const [domainModal, setDomainModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [domainForm, setDomainForm] = useState({
    name: '',
    description: '',
    accentColor: '#6f1d1b',
    icon: 'layers',
    order: 0,
    visibility: 'public',
    isFeatured: true
  });

  // Field Modal
  const [fieldModal, setFieldModal] = useState(false);
  const [targetDomainId, setTargetDomainId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    name: '',
    description: '',
    order: 0,
    icon: 'code',
    isFeatured: true
  });

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadDomains = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api('/domains?includeArchived=true');
      setDomains(data);
      // Expand all by default
      const exp = {};
      data.forEach(d => { exp[d._id] = true; });
      setExpanded(exp);
    } catch (err) {
      showToast(err.message || 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  const toggleExpand = id => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Domain Modal
  const handleOpenDomainModal = (domain = null) => {
    if (domain) {
      setEditingDomain(domain);
      setDomainForm({
        name: domain.name,
        description: domain.description || '',
        accentColor: domain.accentColor || '#6f1d1b',
        icon: domain.icon || 'layers',
        order: domain.order || 0,
        visibility: domain.visibility || 'public',
        isFeatured: domain.isFeatured !== false
      });
    } else {
      setEditingDomain(null);
      setDomainForm({
        name: '',
        description: '',
        accentColor: '#6f1d1b',
        icon: 'layers',
        order: domains.length + 1,
        visibility: 'public',
        isFeatured: true
      });
    }
    setDomainModal(true);
  };

  const handleSaveDomain = async e => {
    e.preventDefault();
    if (isViewer) {
      showToast('Action restricted: Viewers cannot create or edit domains.');
      return;
    }
    if (!domainForm.name.trim()) {
      showToast('Domain name is required');
      return;
    }
    setBusy(true);
    try {
      if (editingDomain) {
        await api(`/domains/${editingDomain._id}`, {
          method: 'PUT',
          body: jsonBody(domainForm)
        });
        showToast(`Domain "${domainForm.name}" updated successfully`);
      } else {
        await api('/domains', {
          method: 'POST',
          body: jsonBody(domainForm)
        });
        showToast(`Domain "${domainForm.name}" created successfully`);
      }
      setDomainModal(false);
      await loadDomains();
    } catch (err) {
      showToast(err.message || 'Error saving domain');
    } finally {
      setBusy(false);
    }
  };

  // Archive / Restore
  const handleToggleArchive = async domain => {
    if (isViewer) {
      showToast('Action restricted: Viewers cannot archive or restore domains.');
      return;
    }
    try {
      if (domain.isArchived) {
        await api(`/domains/${domain._id}/restore`, { method: 'POST' });
        showToast(`Restored domain "${domain.name}"`);
      } else {
        if (!confirm(`Archive domain "${domain.name}"? Associated projects will be preserved safely.`)) return;
        await api(`/domains/${domain._id}/archive`, { method: 'POST' });
        showToast(`Archived domain "${domain.name}"`);
      }
      await loadDomains();
    } catch (err) {
      showToast(err.message || 'Action failed');
    }
  };

  const handleDeleteDomain = async domain => {
    if (isViewer) {
      showToast('Action restricted: Viewers cannot delete domains.');
      return;
    }
    if (!confirm(`Permanently delete domain "${domain.name}"? This cannot be undone.`)) return;
    try {
      await api(`/domains/${domain._id}`, { method: 'DELETE' });
      showToast(`Domain "${domain.name}" deleted`);
      await loadDomains();
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  // Field Operations
  const handleOpenFieldModal = (domainId, field = null) => {
    setTargetDomainId(domainId);
    if (field) {
      setEditingField(field);
      setFieldForm({
        name: field.name,
        description: field.description || '',
        order: field.order || 0,
        icon: field.icon || 'code',
        isFeatured: field.isFeatured !== false
      });
    } else {
      const parentDom = domains.find(d => d._id === domainId);
      const curFields = parentDom?.fields || [];
      setEditingField(null);
      setFieldForm({
        name: '',
        description: '',
        order: curFields.length + 1,
        icon: 'code',
        isFeatured: true
      });
    }
    setFieldModal(true);
  };

  const handleSaveField = async e => {
    e.preventDefault();
    if (isViewer) {
      showToast('Action restricted: Viewers cannot create or edit specialization fields.');
      return;
    }
    if (!fieldForm.name.trim()) {
      showToast('Field name is required');
      return;
    }
    setBusy(true);
    try {
      if (editingField) {
        await api(`/domains/${targetDomainId}/fields/${editingField._id}`, {
          method: 'PUT',
          body: jsonBody(fieldForm)
        });
        showToast(`Field "${fieldForm.name}" updated`);
      } else {
        await api(`/domains/${targetDomainId}/fields`, {
          method: 'POST',
          body: jsonBody(fieldForm)
        });
        showToast(`Field "${fieldForm.name}" added`);
      }
      setFieldModal(false);
      await loadDomains();
    } catch (err) {
      showToast(err.message || 'Failed to save field');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteField = async (domainId, field) => {
    if (isViewer) {
      showToast('Action restricted: Viewers cannot delete specialization fields.');
      return;
    }
    if (!confirm(`Delete field "${field.name}"? Projects using this field will retain their reference.`)) return;
    try {
      await api(`/domains/${domainId}/fields/${field._id}`, { method: 'DELETE' });
      showToast(`Field "${field.name}" removed`);
      await loadDomains();
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-top">
        <div>
          <p className="eyebrow">WORKSPACE TAXONOMY & HIERARCHY</p>
          <h1 className="admin-title">Domains & <em>Fields Manager</em></h1>
          <p className="admin-subtitle">
            Organize your engineering workspace into Level 1 Technical Domains and Level 2 Specialization Fields. 
            Customize colors, icons, public portfolio visibility, and display order.
          </p>
        </div>
        {!isViewer && (
          <button
            type="button"
            className="button-primary"
            onClick={() => handleOpenDomainModal()}
          >
            <Plus size={16} /> New Domain
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-row">Loading taxonomy and domains…</div>
      ) : domains.length === 0 ? (
        <div className="empty-state">
          <Layers className="empty-icon" size={28} />
          <h3>No Technical Domains Defined</h3>
          <p>Create your first Level 1 Domain (e.g. Software Engineering, Cybersecurity, AI) to organize your projects and research.</p>
          {!isViewer && (
            <button type="button" className="button-primary mt-4" onClick={() => handleOpenDomainModal()}>
              <Plus size={16} /> Create Domain
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {domains.map(domain => {
            const IconComp = getDomainIcon(domain.icon);
            const isExp = expanded[domain._id];
            const isArchived = domain.isArchived;

            return (
              <div
                key={domain._id}
                className={`panel-card transition-all ${
                  isArchived ? 'opacity-60 bg-stone-50 border-dashed' : ''
                }`}
                style={{ borderLeftWidth: 5, borderLeftColor: domain.accentColor || '#6f1d1b' }}
              >
                {/* Domain Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(domain._id)}
                      className="p-1 hover:bg-stone-100 rounded text-stone-500 mt-0.5 sm:mt-0"
                      title={isExp ? 'Collapse' : 'Expand'}
                    >
                      {isExp ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>

                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ background: domain.accentColor || '#6f1d1b' }}
                    >
                      <IconComp size={20} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/admin/domains/${domain.slug}`}
                          className="text-base font-bold text-stone-900 m-0 hover:text-amber-800 transition inline-flex items-center gap-1.5"
                          title="Open Domain Command Center"
                        >
                          {domain.name}
                          <ExternalLink size={13} className="text-stone-400" />
                        </Link>
                        <span className="font-mono text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                          {domain.slug}
                        </span>
                        {domain.visibility === 'private' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">
                            <EyeOff size={10} /> Private
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            <Eye size={10} /> Public
                          </span>
                        )}
                        {isArchived && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-1 max-w-xl">
                        {domain.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Domain Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/admin/domains/${domain.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-800/30 bg-amber-50/60 text-amber-900 hover:bg-amber-100/80 transition"
                      title="Open Dedicated Domain Hub"
                    >
                      <Layers size={13} /> Deep Dive
                    </Link>
                    {!isViewer && (
                      <>
                        <button
                          type="button"
                          className="button-secondary text-xs py-1.5 px-2.5"
                          onClick={() => handleOpenFieldModal(domain._id)}
                          title="Add specialization field"
                        >
                          <Plus size={13} /> Add Field
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-stone-400 hover:text-stone-800 rounded transition"
                          onClick={() => handleOpenDomainModal(domain)}
                          title="Edit Domain"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-stone-400 hover:text-amber-700 rounded transition"
                          onClick={() => handleToggleArchive(domain)}
                          title={isArchived ? 'Restore Domain' : 'Archive Domain'}
                        >
                          {isArchived ? <RotateCcw size={15} /> : <Archive size={15} />}
                        </button>
                        {(!domain.fields || domain.fields.length === 0) && (
                          <button
                            type="button"
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded transition"
                            onClick={() => handleDeleteDomain(domain)}
                            title="Delete empty domain"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Subfields list (Level 2 Hierarchy) */}
                {isExp && (
                  <div className="mt-5 pt-4 border-t border-stone-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <FolderTree size={12} /> Level 2 Specialization Fields ({domain.fields?.length || 0})
                      </span>
                    </div>

                    {!domain.fields || domain.fields.length === 0 ? (
                      <div className="p-4 bg-stone-50 rounded-lg text-center text-xs text-stone-500 border border-dashed border-stone-200">
                        No fields defined yet.{!isViewer && <> Click <strong>Add Field</strong> to create specializations under {domain.name}.</>}
                      </div>
                    ) : (
                      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {domain.fields.map(field => {
                          const FieldIcon = getDomainIcon(field.icon || 'code');
                          return (
                            <div
                              key={field._id}
                              className="group p-3 rounded-lg border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs transition flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center flex-shrink-0">
                                  <FieldIcon size={14} />
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    to={`/admin/domains/${domain.slug}?subdomain=${field.slug}`}
                                    className="block text-xs font-semibold text-stone-800 hover:text-amber-800 transition truncate"
                                    title={`Explore ${field.name} in ${domain.name}`}
                                  >
                                    {field.name}
                                  </Link>
                                  <span className="block text-[10px] font-mono text-stone-400 truncate">
                                    {field.slug}
                                  </span>
                                </div>
                              </div>

                              {!isViewer && (
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                  <button
                                    type="button"
                                    className="p-1 text-stone-400 hover:text-stone-700 rounded"
                                    onClick={() => handleOpenFieldModal(domain._id, field)}
                                    title="Edit field"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="p-1 text-stone-400 hover:text-red-600 rounded"
                                    onClick={() => handleDeleteField(domain._id, field)}
                                    title="Delete field"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Domain Create / Edit Modal */}
      {domainModal && (
        <Modal
          title={editingDomain ? `Edit Domain: ${editingDomain.name}` : 'Create Level 1 Technical Domain'}
          onClose={() => setDomainModal(false)}
        >
          {isViewer && <ReadOnlyNotice feature="Domains & Fields" />}
          <form onSubmit={handleSaveDomain} className="editor-form">
            <fieldset disabled={isViewer} className="contents">
            <div className="form-grid">
              <label className="field-span-2">
                Domain Name *
                <input
                  required
                  value={domainForm.name}
                  onChange={e => setDomainForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Software Engineering, Cybersecurity, Artificial Intelligence"
                />
              </label>

              <label className="field-span-2">
                Description / Purpose
                <textarea
                  rows={2}
                  value={domainForm.description}
                  onChange={e => setDomainForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Summary of disciplines, technologies, and objectives within this domain…"
                />
              </label>

              <label>
                Accent Brand Color
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="color"
                    value={domainForm.accentColor}
                    onChange={e => setDomainForm(f => ({ ...f, accentColor: e.target.value }))}
                  />
                  <input
                    value={domainForm.accentColor}
                    onChange={e => setDomainForm(f => ({ ...f, accentColor: e.target.value }))}
                    className="font-mono text-xs"
                  />
                </div>
              </label>

              <label>
                Domain Icon
                <select
                  value={domainForm.icon}
                  onChange={e => setDomainForm(f => ({ ...f, icon: e.target.value }))}
                  className="mt-1"
                >
                  {ICON_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.id})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Display Order
                <input
                  type="number"
                  value={domainForm.order}
                  onChange={e => setDomainForm(f => ({ ...f, order: Number(e.target.value) }))}
                />
              </label>

              <label>
                Portfolio Visibility
                <select
                  value={domainForm.visibility}
                  onChange={e => setDomainForm(f => ({ ...f, visibility: e.target.value }))}
                >
                  <option value="public">Public (Show on Portfolio Explorer)</option>
                  <option value="private">Private (Workspace Only)</option>
                </select>
              </label>

              <label className="check-label field-span-2 mt-2">
                <input
                  type="checkbox"
                  checked={domainForm.isFeatured}
                  onChange={e => setDomainForm(f => ({ ...f, isFeatured: e.target.checked }))}
                />
                Feature prominently on public portfolio homepage
              </label>
            </div>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="button-secondary" onClick={() => setDomainModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" className="button-primary" disabled={busy}>
                  {busy ? 'Saving…' : editingDomain ? 'Save Changes' : 'Create Domain'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Field Create / Edit Modal */}
      {fieldModal && (
        <Modal
          title={editingField ? `Edit Field: ${editingField.name}` : 'Add Specialization Field'}
          onClose={() => setFieldModal(false)}
        >
          {isViewer && <ReadOnlyNotice feature="Specialization Fields" />}
          <form onSubmit={handleSaveField} className="editor-form">
            <fieldset disabled={isViewer} className="contents">
            <div className="form-grid">
              <label className="field-span-2">
                Field Name *
                <input
                  required
                  value={fieldForm.name}
                  onChange={e => setFieldForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Backend Engineering, Agentic AI, Application Security"
                />
              </label>

              <label className="field-span-2">
                Description
                <textarea
                  rows={2}
                  value={fieldForm.description}
                  onChange={e => setFieldForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Scope of this subfield…"
                />
              </label>

              <label>
                Field Icon
                <select
                  value={fieldForm.icon}
                  onChange={e => setFieldForm(f => ({ ...f, icon: e.target.value }))}
                >
                  {ICON_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.id})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Display Order
                <input
                  type="number"
                  value={fieldForm.order}
                  onChange={e => setFieldForm(f => ({ ...f, order: Number(e.target.value) }))}
                />
              </label>

              <label className="check-label field-span-2 mt-2">
                <input
                  type="checkbox"
                  checked={fieldForm.isFeatured}
                  onChange={e => setFieldForm(f => ({ ...f, isFeatured: e.target.checked }))}
                />
                Feature in quick filter chips
              </label>
            </div>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="button-secondary" onClick={() => setFieldModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {!isViewer && (
                <button type="submit" className="button-primary" disabled={busy}>
                  {busy ? 'Saving…' : editingField ? 'Save Field' : 'Add Field'}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      <Toast message={toast} />
    </div>
  );
}

export default AdminDomains;
