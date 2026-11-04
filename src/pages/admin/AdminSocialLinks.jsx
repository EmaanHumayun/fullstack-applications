import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Check,
  Eye,
  EyeOff,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  Send,
  HelpCircle,
  Archive,
  RotateCcw,
  Code2,
  BookOpen,
  GitBranch,
  Flame,
  MessageSquare
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast } from '../../components.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';

export const PLATFORM_PRESETS = [
  { id: 'github', label: 'GitHub', icon: 'github', defaultUrlPrefix: 'https://github.com/' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', defaultUrlPrefix: 'https://linkedin.com/in/' },
  { id: 'email', label: 'Email (mailto)', icon: 'mail', defaultUrlPrefix: 'mailto:' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'message-circle', defaultUrlPrefix: 'https://wa.me/' },
  { id: 'twitter', label: 'X / Twitter', icon: 'twitter', defaultUrlPrefix: 'https://x.com/' },
  { id: 'telegram', label: 'Telegram', icon: 'send', defaultUrlPrefix: 'https://t.me/' },
  { id: 'discord', label: 'Discord', icon: 'message-square', defaultUrlPrefix: 'https://discord.gg/' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube', defaultUrlPrefix: 'https://youtube.com/@' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram', defaultUrlPrefix: 'https://instagram.com/' },
  { id: 'tiktok', label: 'TikTok', icon: 'message-circle', defaultUrlPrefix: 'https://www.tiktok.com/@' },
  { id: 'leetcode', label: 'LeetCode', icon: 'code-2', defaultUrlPrefix: 'https://leetcode.com/' },
  { id: 'medium', label: 'Medium', icon: 'book-open', defaultUrlPrefix: 'https://medium.com/@' },
  { id: 'gitlab', label: 'GitLab', icon: 'git-branch', defaultUrlPrefix: 'https://gitlab.com/' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook', defaultUrlPrefix: 'https://facebook.com/' },
  { id: 'website', label: 'Personal Website / Blog', icon: 'globe', defaultUrlPrefix: 'https://' },
  { id: 'custom', label: 'Custom Channel / Link', icon: 'globe', defaultUrlPrefix: 'https://' }
];

export function getPlatformIcon(platform) {
  switch ((platform || '').toLowerCase()) {
    case 'github': return Github;
    case 'linkedin': return Linkedin;
    case 'email': return Mail;
    case 'whatsapp': return MessageCircle;
    case 'twitter':
    case 'x': return Twitter;
    case 'telegram': return Send;
    case 'discord': return MessageSquare;
    case 'youtube': return Youtube;
    case 'instagram': return Instagram;
    case 'tiktok': return MessageCircle;
    case 'leetcode': return Code2;
    case 'medium': return BookOpen;
    case 'gitlab': return GitBranch;
    case 'facebook': return Facebook;
    case 'website': return Globe;
    default: return Globe;
  }
}

export function AdminSocialLinks() {
  const { isViewer, canEdit } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'archived' | 'all'
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  // Form State
  const [form, setForm] = useState({
    platform: 'github',
    customPlatformName: '',
    label: '',
    url: '',
    username: '',
    icon: 'github',
    order: 0,
    isEnabled: true,
    placement: ['hero', 'footer', 'contact']
  });

  // Smart Helpers for email / whatsapp
  const [emailSubject, setEmailSubject] = useState('Engineering Hub Pro Inquiry');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('Hi Emaan, I came across your Engineering Hub portfolio.');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadLinks = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'archived'
        ? '/social-links?archived=true'
        : statusFilter === 'all'
        ? '/social-links?all=true&archived=false'
        : '/social-links?all=true';
      
      const data = await api(url);
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load social links');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleOpenModal = (link = null) => {
    if (isViewer && !link) {
      showToast('Viewer mode: adding social links is disabled.');
      return;
    }
    if (link) {
      setEditing(link);
      setForm({
        platform: link.platform || 'custom',
        customPlatformName: link.customPlatformName || '',
        label: link.label || '',
        url: link.url || '',
        username: link.username || '',
        icon: link.icon || 'globe',
        order: link.order || 0,
        isEnabled: link.isEnabled !== false,
        placement: link.placement || ['hero', 'footer', 'contact']
      });
    } else {
      setEditing(null);
      const defaultPlatform = PLATFORM_PRESETS[0];
      setForm({
        platform: defaultPlatform.id,
        customPlatformName: '',
        label: defaultPlatform.label,
        url: defaultPlatform.defaultUrlPrefix,
        username: '',
        icon: defaultPlatform.icon,
        order: links.length + 1,
        isEnabled: true,
        placement: ['hero', 'footer', 'contact']
      });
    }
    setModal(true);
  };

  const handlePlatformChange = newPlatform => {
    const preset = PLATFORM_PRESETS.find(p => p.id === newPlatform);
    if (preset) {
      setForm(f => ({
        ...f,
        platform: newPlatform,
        label: f.label && f.label !== '' ? f.label : preset.label,
        icon: preset.icon,
        url: f.url && f.url !== '' && !f.url.startsWith('https://github.com/') ? f.url : preset.defaultUrlPrefix
      }));
    }
  };

  const handleBuildEmailUrl = () => {
    const targetEmail = form.username.trim() || 'emaan.humayun@example.com';
    const encodedSub = encodeURIComponent(emailSubject);
    const generated = `mailto:${targetEmail}?subject=${encodedSub}`;
    setForm(f => ({ ...f, url: generated }));
    showToast('Mailto URL generated');
  };

  const handleBuildWhatsAppUrl = () => {
    const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(whatsappMessage);
    const generated = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;
    setForm(f => ({ ...f, url: generated }));
    showToast('WhatsApp direct link generated');
  };

  const handleSave = async e => {
    e.preventDefault();
    if (isViewer) {
      showToast('Viewer mode: changes cannot be saved.');
      return;
    }
    if (!form.label.trim() || !form.url.trim()) {
      showToast('Label and destination URL are required');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await api(`/social-links/${editing._id}`, {
          method: 'PUT',
          body: jsonBody(form)
        });
        showToast(`Updated link "${form.label}"`);
      } else {
        await api('/social-links', {
          method: 'POST',
          body: jsonBody(form)
        });
        showToast(`Added link "${form.label}"`);
      }
      setModal(false);
      await loadLinks();
    } catch (err) {
      showToast(err.message || 'Error saving link');
    } finally {
      setBusy(false);
    }
  };

  const handleArchiveToggle = async link => {
    if (isViewer) {
      showToast('Viewer mode: archiving is disabled.');
      return;
    }
    try {
      const willArchive = !link.isArchived;
      await api(`/social-links/${link._id}`, {
        method: 'PUT',
        body: jsonBody({ isArchived: willArchive })
      });
      showToast(willArchive ? `Archived "${link.label}"` : `Restored "${link.label}"`);
      await loadLinks();
    } catch (err) {
      showToast(err.message || 'Failed to update archive status');
    }
  };

  const handleDeletePermanent = async () => {
    if (isViewer) {
      showToast('Viewer mode: deletion is disabled.');
      return;
    }
    if (!deleteTarget) return;
    try {
      await api(`/social-links/${deleteTarget._id}?permanent=true`, { method: 'DELETE' });
      showToast(`Permanently deleted "${deleteTarget.label}"`);
      setDeleteTarget(null);
      await loadLinks();
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  const handleToggleEnabled = async link => {
    if (isViewer) {
      showToast('Viewer mode: status cannot be toggled.');
      return;
    }
    try {
      await api(`/social-links/${link._id}`, {
        method: 'PUT',
        body: jsonBody({ isEnabled: !link.isEnabled })
      });
      showToast(`Link "${link.label}" ${!link.isEnabled ? 'enabled' : 'disabled'}`);
      await loadLinks();
    } catch (err) {
      showToast(err.message || 'Failed to toggle status');
    }
  };

  const handleMove = async (index, direction) => {
    if (isViewer) {
      showToast('Viewer mode: reordering is disabled.');
      return;
    }
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= links.length) return;

    const newLinks = [...links];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIdx, 0, moved);

    const reorderedItems = newLinks.map((item, idx) => ({
      _id: item._id,
      order: idx + 1
    }));

    try {
      await api('/social-links/reorder/batch', {
        method: 'PUT',
        body: jsonBody({
          orderedIds: newLinks.map(l => l._id),
          items: reorderedItems
        })
      });
      await loadLinks();
    } catch (err) {
      showToast(err.message || 'Failed to reorder');
    }
  };

  const togglePlacement = place => {
    setForm(f => {
      const cur = f.placement || [];
      const updated = cur.includes(place)
        ? cur.filter(p => p !== place)
        : [...cur, place];
      return { ...f, placement: updated };
    });
  };

  const displayedLinks = links.filter(link => {
    if (statusFilter === 'active') return !link.isArchived;
    if (statusFilter === 'archived') return !!link.isArchived;
    return true;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-top">
        <div>
          <p className="eyebrow">COMMUNICATION &amp; CONNECTIVITY</p>
          <h1 className="admin-title">Social Links &amp; <em>Direct Contact</em></h1>
          <p className="admin-subtitle">
            Manage your public engineering profiles (GitHub, LinkedIn, WhatsApp, Email, Telegram, Discord, and custom channels). 
            Links render with accessible icons, prefilled parameters, and verified direct actions across Hero, Footer, and Contact sections.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            className="button-primary"
            onClick={() => handleOpenModal()}
          >
            <Plus size={16} /> Add Social Channel
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'active'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Active Channels
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('archived')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'archived'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Archived Channels
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="loading-row">Loading social and contact channels…</div>
      ) : displayedLinks.length === 0 ? (
        <div className="empty-state">
          <Share2 className="empty-icon" size={28} />
          <h3>{statusFilter === 'archived' ? 'No Archived Channels' : 'No Channels Configured'}</h3>
          <p>
            {statusFilter === 'archived'
              ? 'There are currently no archived social or direct contact channels.'
              : 'Add your GitHub, LinkedIn, Email, WhatsApp, or Telegram to let visitors contact you directly.'}
          </p>
          {canEdit && statusFilter !== 'archived' && (
            <button type="button" className="button-primary mt-4" onClick={() => handleOpenModal()}>
              <Plus size={16} /> Add First Link
            </button>
          )}
        </div>
      ) : (
        <div className="panel-card max-w-4xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {statusFilter === 'archived' ? 'Archived Channels' : 'Configured Channels'} ({displayedLinks.length})
            </span>
            {statusFilter === 'active' && (
              <span className="text-xs text-stone-400">
                Use arrows to adjust display sequence
              </span>
            )}
          </div>

          <div className="divide-y divide-stone-100">
            {displayedLinks.map((link, idx) => {
              const IconComp = getPlatformIcon(link.platform);
              const isEnabled = link.isEnabled !== false;
              const isArchived = !!link.isArchived;

              return (
                <div
                  key={link._id}
                  className={`py-3.5 flex items-center justify-between gap-4 transition ${
                    isArchived
                      ? 'opacity-60 bg-stone-50/80'
                      : !isEnabled
                      ? 'opacity-60 bg-stone-50/50'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Reorder Buttons */}
                    {canEdit && !isArchived && (
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, -1)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === displayedLinks.length - 1}
                          onClick={() => handleMove(idx, 1)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    )}

                    {/* Platform Icon */}
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center flex-shrink-0 shadow-xs border border-stone-200">
                      <IconComp size={18} />
                    </div>

                    {/* Link Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-semibold text-stone-900">
                          {link.label}
                        </strong>
                        <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                          {link.platform === 'custom' && link.customPlatformName ? link.customPlatformName : link.platform}
                        </span>
                        {link.username && (
                          <span className="text-xs text-stone-400">
                            @{link.username}
                          </span>
                        )}
                        {isArchived && (
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            Archived
                          </span>
                        )}
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-wine truncate max-w-md mt-0.5"
                      >
                        {link.url} <ExternalLink size={10} />
                      </a>
                      <div className="flex gap-1.5 mt-1">
                        {(link.placement || []).map(p => (
                          <span
                            key={p}
                            className="text-[9px] font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.2 rounded"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isArchived && (
                      <button
                        type="button"
                        disabled={isViewer}
                        onClick={() => handleToggleEnabled(link)}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold transition disabled:opacity-60 ${
                          isEnabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                        title={isEnabled ? 'Click to disable' : 'Click to enable'}
                      >
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    )}

                    {canEdit && (
                      <>
                        <button
                          type="button"
                          className="p-1.5 text-stone-400 hover:text-stone-800 rounded transition"
                          onClick={() => handleOpenModal(link)}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          type="button"
                          className="p-1.5 text-stone-400 hover:text-stone-800 rounded transition"
                          onClick={() => handleArchiveToggle(link)}
                          title={isArchived ? 'Restore from Archive' : 'Move to Archive'}
                        >
                          {isArchived ? <RotateCcw size={15} /> : <Archive size={15} />}
                        </button>

                        <button
                          type="button"
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded transition"
                          onClick={() => setDeleteTarget(link)}
                          title="Permanently Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <Modal
          title={editing ? `Edit Channel: ${editing.label}` : 'Add Social or Contact Channel'}
          onClose={() => setModal(false)}
        >
          <form onSubmit={handleSave} className="editor-form">
            {isViewer && <ReadOnlyNotice featureName="Social Links & Direct Contact" />}
            <fieldset disabled={isViewer} className="contents">
            <div className="form-grid">
              <label>
                Platform Preset *
                <select
                  value={form.platform}
                  onChange={e => handlePlatformChange(e.target.value)}
                >
                  {PLATFORM_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              {form.platform === 'custom' && (
                <label>
                  Custom Brand / Network Name
                  <input
                    value={form.customPlatformName}
                    onChange={e => setForm(f => ({ ...f, customPlatformName: e.target.value }))}
                    placeholder="e.g. Substack, Hashnode, Kaggle"
                  />
                </label>
              )}

              <label>
                Display Label *
                <input
                  required
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. GitHub, LinkedIn, Email Me, WhatsApp"
                />
              </label>

              <label className="field-span-2">
                Destination URL / Action *
                <input
                  required
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://... or mailto:..."
                />
              </label>

              <label>
                Handle / Public Username
                <input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="e.g. EmaanHumayun"
                />
              </label>

              <label>
                Display Order
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                />
              </label>

              {/* Smart Helper: Email */}
              {form.platform === 'email' && (
                <div className="field-span-2 p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
                    <Mail size={12} /> Email Mailto Builder
                  </span>
                  <div className="flex gap-2">
                    <input
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="Default subject line"
                      className="text-xs"
                    />
                    <button
                      type="button"
                      className="button-secondary text-xs whitespace-nowrap"
                      onClick={handleBuildEmailUrl}
                    >
                      Generate mailto:
                    </button>
                  </div>
                </div>
              )}

              {/* Smart Helper: WhatsApp */}
              {form.platform === 'whatsapp' && (
                <div className="field-span-2 p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
                    <MessageCircle size={12} /> WhatsApp Direct Link Generator
                  </span>
                  <div className="space-y-2">
                    <input
                      value={whatsappPhone}
                      onChange={e => setWhatsappPhone(e.target.value)}
                      placeholder="Phone with country code (e.g. 923001234567)"
                      className="text-xs"
                    />
                    <input
                      value={whatsappMessage}
                      onChange={e => setWhatsappMessage(e.target.value)}
                      placeholder="Default greetings message"
                      className="text-xs"
                    />
                    <button
                      type="button"
                      className="button-secondary text-xs"
                      onClick={handleBuildWhatsAppUrl}
                    >
                      Generate wa.me link
                    </button>
                  </div>
                </div>
              )}

              {/* Placements */}
              <div className="field-span-2">
                <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Display Placements
                </span>
                <div className="flex gap-4">
                  {[
                    { id: 'hero', label: 'Hero Header' },
                    { id: 'footer', label: 'Footer' },
                    { id: 'contact', label: 'Contact Section' }
                  ].map(p => (
                    <label key={p.id} className="check-label text-xs">
                      <input
                        type="checkbox"
                        checked={(form.placement || []).includes(p.id)}
                        onChange={() => togglePlacement(p.id)}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <label className="check-label field-span-2 mt-2">
                <input
                  type="checkbox"
                  checked={form.isEnabled}
                  onChange={e => setForm(f => ({ ...f, isEnabled: e.target.checked }))}
                />
                Enable this channel on public portfolio
              </label>
            </div>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="button-secondary" onClick={() => setModal(false)}>
                {isViewer ? 'Close' : 'Cancel'}
              </button>
              {canEdit && (
                <button type="submit" className="button-primary" disabled={busy}>
                  {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Channel'}
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
          title={`Permanently delete "${deleteTarget.label}"?`}
          message="This action removes the social channel record permanently. If you want to temporarily hide it, consider using Archive instead."
          confirmText="Delete Channel"
          danger
          onCancel={() => setDeleteTarget(null)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeletePermanent}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}

export default AdminSocialLinks;
