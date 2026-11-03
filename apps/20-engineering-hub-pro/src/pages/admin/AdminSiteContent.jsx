import React, { useState, useEffect, useCallback } from 'react';
import {
  FileEdit,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle,
  HelpCircle,
  Layout,
  Type,
  Sliders,
  Globe,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Mail,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Toast, Modal, ConfirmModal } from '../../components.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice.jsx';
import { PLATFORM_PRESETS, getPlatformIcon } from './AdminSocialLinks.jsx';

export function AdminSiteContent() {
  const { isViewer, canEdit } = useAuth();
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [content, setContent] = useState(null);

  // Contact Channels / Social Handles state
  const [socialLinks, setSocialLinks] = useState([]);
  const [loadingSocials, setLoadingSocials] = useState(false);
  const [channelModal, setChannelModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [deleteChannelTarget, setDeleteChannelTarget] = useState(null);
  const [savingChannel, setSavingChannel] = useState(false);
  const [channelForm, setChannelForm] = useState({
    platform: 'whatsapp',
    customPlatformName: '',
    label: 'WhatsApp',
    url: 'https://wa.me/',
    username: 'Instant Direct Message',
    icon: 'message-circle',
    order: 0,
    isEnabled: true,
    placement: ['contact', 'hero', 'footer']
  });

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadSocialLinks = useCallback(async () => {
    try {
      setLoadingSocials(true);
      const res = await api('/social-links?all=true');
      setSocialLinks(Array.isArray(res) ? res : []);
    } catch {
      // ignore
    } finally {
      setLoadingSocials(false);
    }
  }, []);

  useEffect(() => {
    loadSocialLinks();
  }, [loadSocialLinks]);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api('/site-content');
      setContent({
        ...data,
        sections: {
          ...(data?.sections || {}),
          contact: {
            eyebrow: "LET'S CONNECT",
            title: 'Good work gets better',
            headingAccent: 'when it is shared.',
            description: 'Have an interesting engineering problem, collaboration idea, or question? Feel free to reach out directly.',
            primaryEmail: 'emaan.humayun@example.com',
            responseTimeBadge: 'Typically responds within 24h',
            locationBadge: 'Lahore, PK · Remote Available (PKT · UTC+5)',
            architectureBadge: 'First-Principles Architecture',
            guaranteeNote: '⚡ Guaranteed response within 24 hours · Open to consulting & engineering engagements',
            channelCardHeader: 'Direct Communication Channel',
            channelCardTimezone: 'PKT · UTC+5',
            channelsSubheading: 'VERIFIED PROFESSIONAL CHANNELS',
            visible: true,
            ...(data?.sections?.contact || {})
          }
        },
        navigation: {
          projectsLabel: 'Projects',
          domainsLabel: 'Domains',
          skillsLabel: 'Skills',
          roadmapsLabel: 'Roadmaps',
          practiceLabsLabel: 'Labs',
          assignmentsLabel: 'Assignments',
          educationLabel: 'Education',
          certificatesLabel: 'Credentials',
          notesLabel: 'Notes',
          analyticsLabel: 'Analytics',
          contactLabel: 'Contact',
          ...(data?.navigation || {})
        }
      });
    } catch (err) {
      showToast(err.message || 'Failed to load site content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSave = async e => {
    if (e) e.preventDefault();
    if (isViewer) {
      showToast('Viewer mode: changes cannot be saved.');
      return;
    }
    setSaving(true);
    try {
      const updated = await api('/site-content', {
        method: 'PUT',
        body: jsonBody(content)
      });
      setContent(updated);
      showToast('All site content & configuration saved successfully');
    } catch (err) {
      showToast(err.message || 'Failed to save site content');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (isViewer) {
      showToast('Viewer mode: reset is disabled.');
      return;
    }
    if (!confirm('Reset all site copy and section configurations to defaults? Any custom copy will be replaced.')) return;
    setSaving(true);
    try {
      const reset = await api('/site-content/reset', { method: 'POST' });
      setContent({
        ...reset,
        sections: {
          ...(reset?.sections || {}),
          contact: {
            eyebrow: "LET'S CONNECT",
            title: 'Good work gets better',
            headingAccent: 'when it is shared.',
            description: 'Have an interesting engineering problem, collaboration idea, or question? Feel free to reach out directly.',
            primaryEmail: 'emaan.humayun@example.com',
            responseTimeBadge: 'Typically responds within 24h',
            locationBadge: 'Lahore, PK · Remote Available (PKT · UTC+5)',
            architectureBadge: 'First-Principles Architecture',
            guaranteeNote: '⚡ Guaranteed response within 24 hours · Open to consulting & engineering engagements',
            channelCardHeader: 'Direct Communication Channel',
            channelCardTimezone: 'PKT · UTC+5',
            channelsSubheading: 'VERIFIED PROFESSIONAL CHANNELS',
            visible: true,
            ...(reset?.sections?.contact || {})
          }
        },
        navigation: {
          projectsLabel: 'Projects',
          domainsLabel: 'Domains',
          skillsLabel: 'Skills',
          roadmapsLabel: 'Roadmaps',
          practiceLabsLabel: 'Labs',
          assignmentsLabel: 'Assignments',
          educationLabel: 'Education',
          certificatesLabel: 'Credentials',
          notesLabel: 'Notes',
          analyticsLabel: 'Analytics',
          contactLabel: 'Contact',
          ...(reset?.navigation || {})
        }
      });
      showToast('Content restored to system defaults');
    } catch (err) {
      showToast(err.message || 'Reset failed');
    } finally {
      setSaving(false);
    }
  };

  // Helper setters
  const updateHero = (key, val) => {
    setContent(c => ({ ...c, hero: { ...c.hero, [key]: val } }));
  };

  const updateAbout = (key, val) => {
    setContent(c => ({ ...c, about: { ...c.about, [key]: val } }));
  };

  const updateSection = (secKey, field, val) => {
    setContent(c => ({
      ...c,
      sections: {
        ...c.sections,
        [secKey]: {
          ...c.sections?.[secKey],
          [field]: val
        }
      }
    }));
  };

  const updateNav = (key, val) => {
    setContent(c => ({ ...c, navigation: { ...c.navigation, [key]: val } }));
  };

  const updateFooter = (key, val) => {
    setContent(c => ({ ...c, footer: { ...c.footer, [key]: val } }));
  };

  const updateSeo = (key, val) => {
    setContent(c => ({ ...c, seo: { ...c.seo, [key]: val } }));
  };

  // Channel management handlers
  const handleOpenChannelModal = (link = null) => {
    if (isViewer && !link) {
      showToast('Viewer mode: adding channels is disabled.');
      return;
    }
    if (link) {
      setEditingChannel(link);
      setChannelForm({
        platform: link.platform || 'custom',
        customPlatformName: link.customPlatformName || '',
        label: link.label || '',
        url: link.url || '',
        username: link.username || '',
        icon: link.icon || 'globe',
        order: link.order || 0,
        isEnabled: link.isEnabled !== false,
        placement: link.placement || ['contact', 'hero', 'footer']
      });
    } else {
      setEditingChannel(null);
      const defaultPlatform = PLATFORM_PRESETS.find(p => p.id === 'whatsapp') || PLATFORM_PRESETS[0];
      setChannelForm({
        platform: defaultPlatform.id,
        customPlatformName: '',
        label: defaultPlatform.label,
        url: defaultPlatform.defaultUrlPrefix,
        username: 'Instant Direct Message',
        icon: defaultPlatform.icon,
        order: socialLinks.length + 1,
        isEnabled: true,
        placement: ['contact', 'hero', 'footer']
      });
    }
    setChannelModal(true);
  };

  const handlePlatformChange = newPlatform => {
    const preset = PLATFORM_PRESETS.find(p => p.id === newPlatform);
    if (preset) {
      setChannelForm(f => ({
        ...f,
        platform: newPlatform,
        label: preset.label,
        icon: preset.icon,
        url: preset.defaultUrlPrefix,
        username:
          newPlatform === 'whatsapp'
            ? 'Instant Direct Message'
            : newPlatform === 'github'
            ? 'Code & IaC Repositories'
            : newPlatform === 'linkedin'
            ? 'Professional Network & SRE'
            : f.username
      }));
    }
  };

  const handleTogglePlacement = place => {
    setChannelForm(f => {
      const cur = f.placement || [];
      const updated = cur.includes(place) ? cur.filter(p => p !== place) : [...cur, place];
      return { ...f, placement: updated };
    });
  };

  const handleSaveChannel = async e => {
    if (e) e.preventDefault();
    if (isViewer) {
      showToast('Viewer mode: saving channels is disabled.');
      return;
    }
    if (!channelForm.url?.trim()) {
      showToast('Please provide a valid URL or link address');
      return;
    }
    setSavingChannel(true);
    try {
      const payload = {
        platform: channelForm.platform,
        customPlatformName: channelForm.customPlatformName?.trim() || '',
        label: channelForm.label?.trim() || channelForm.platform,
        url: channelForm.url.trim(),
        username: channelForm.username?.trim() || '',
        icon: channelForm.icon || 'globe',
        order: Number(channelForm.order) || 0,
        isEnabled: channelForm.isEnabled,
        placement: channelForm.placement && channelForm.placement.length > 0 ? channelForm.placement : ['contact']
      };

      if (editingChannel) {
        await api(`/social-links/${editingChannel._id}`, {
          method: 'PUT',
          body: jsonBody(payload)
        });
        showToast(`Channel "${payload.label}" updated successfully`);
      } else {
        await api('/social-links', {
          method: 'POST',
          body: jsonBody(payload)
        });
        showToast(`Channel "${payload.label}" added successfully`);
      }
      setChannelModal(false);
      setEditingChannel(null);
      await loadSocialLinks();
    } catch (err) {
      showToast(err.message || 'Failed to save channel');
    } finally {
      setSavingChannel(false);
    }
  };

  const handleToggleChannelEnabled = async link => {
    if (isViewer) return;
    try {
      await api(`/social-links/${link._id}`, {
        method: 'PUT',
        body: jsonBody({ isEnabled: !link.isEnabled })
      });
      showToast(`Channel "${link.label}" ${!link.isEnabled ? 'enabled' : 'disabled'}`);
      await loadSocialLinks();
    } catch (err) {
      showToast(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteChannel = async () => {
    if (isViewer || !deleteChannelTarget) return;
    try {
      await api(`/social-links/${deleteChannelTarget._id}?permanent=true`, { method: 'DELETE' });
      showToast(`Channel "${deleteChannelTarget.label}" deleted`);
      setDeleteChannelTarget(null);
      await loadSocialLinks();
    } catch (err) {
      showToast(err.message || 'Failed to delete channel');
    }
  };

  const handleMoveChannel = async (index, direction) => {
    if (isViewer) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= socialLinks.length) return;

    const newLinks = [...socialLinks];
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
      await loadSocialLinks();
    } catch (err) {
      showToast(err.message || 'Failed to reorder');
    }
  };

  if (loading || !content) {
    return (
      <div className="admin-page">
        <div className="loading-row">Loading site content configuration…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-top">
        <div>
          <p className="eyebrow">HEADLESS CMS & PRESENTATION</p>
          <h1 className="admin-title">Site Content & <em>Presentation</em></h1>
          <p className="admin-subtitle">
            Customize hero text, headings, section visibility, CTAs, navigation labels, and SEO metadata 
            without touching code. Changes persist directly to the database and update the portfolio instantly.
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              className="button-secondary"
              onClick={handleResetDefaults}
              disabled={saving}
            >
              <RotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {isViewer && <ReadOnlyNotice featureName="Site Content & Presentation" />}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2 mb-6 overflow-x-auto">
        {[
          { id: 'hero', label: 'Hero & Introduction', icon: Type },
          { id: 'about', label: 'About & Focus', icon: Sliders },
          { id: 'sections', label: 'Portfolio Sections & Visibility', icon: Layout },
          { id: 'navigation', label: 'Navigation Labels', icon: Globe },
          { id: 'contact', label: 'Contacts Management', icon: MessageSquare },
          { id: 'footer-seo', label: 'Footer & SEO', icon: FileEdit }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-wine text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <fieldset disabled={isViewer} className="contents">

      {/* Tab: Hero */}
      {activeTab === 'hero' && (
        <div className="panel-card max-w-4xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">Hero Section Content</h3>
            <p className="text-xs text-stone-500 mt-1">
              Main introductory viewport visible when visitors arrive at your public portfolio.
            </p>
          </div>

          <div className="form-grid">
            <label>
              Header Kicker / Eyebrow
              <input
                value={content.hero?.kicker || ''}
                onChange={e => updateHero('kicker', e.target.value)}
                placeholder="e.g. ENGINEERING WORKSPACE & PORTFOLIO"
              />
            </label>

            <label>
              Status / Availability Pill
              <input
                value={content.hero?.availabilityText || ''}
                onChange={e => updateHero('availabilityText', e.target.value)}
                placeholder="e.g. OPEN TO RESEARCH & COLLABORATION"
              />
            </label>

            <label className="field-span-2">
              Main Heading (Standard Font)
              <input
                value={content.hero?.heading || ''}
                onChange={e => updateHero('heading', e.target.value)}
                placeholder="e.g. Building thoughtful software."
              />
            </label>

            <label className="field-span-2">
              Heading Accent (Editorial Serif Emphasized Text)
              <input
                value={content.hero?.headingAccent || ''}
                onChange={e => updateHero('headingAccent', e.target.value)}
                placeholder="e.g. Making complexity useful."
              />
            </label>

            <label className="field-span-2">
              Introduction Summary Paragraph
              <textarea
                rows={3}
                value={content.hero?.description || ''}
                onChange={e => updateHero('description', e.target.value)}
                placeholder="Comprehensive professional introduction…"
              />
            </label>

            <label>
              Primary CTA Button Text
              <input
                value={content.hero?.primaryCtaText || ''}
                onChange={e => updateHero('primaryCtaText', e.target.value)}
                placeholder="e.g. Explore Engineering Work"
              />
            </label>

            <label>
              Primary CTA Link Destination
              <input
                value={content.hero?.primaryCtaLink || ''}
                onChange={e => updateHero('primaryCtaLink', e.target.value)}
                placeholder="e.g. /projects or #projects"
              />
            </label>

            <label>
              Secondary CTA Button Text
              <input
                value={content.hero?.secondaryCtaText || ''}
                onChange={e => updateHero('secondaryCtaText', e.target.value)}
                placeholder="e.g. GitHub Repositories"
              />
            </label>

            <label>
              Secondary CTA Link Destination
              <input
                value={content.hero?.secondaryCtaLink || ''}
                onChange={e => updateHero('secondaryCtaLink', e.target.value)}
                placeholder="e.g. https://github.com/..."
              />
            </label>

            <label className="field-span-2">
              Interactive Floating Badge / Terminal Status Text
              <input
                value={content.hero?.statusBadge || ''}
                onChange={e => updateHero('statusBadge', e.target.value)}
                placeholder="e.g. Exploring system architecture & agentic AI"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab: About */}
      {activeTab === 'about' && (
        <div className="panel-card max-w-4xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">About & Professional Focus</h3>
            <p className="text-xs text-stone-500 mt-1">
              Curated highlights explaining your engineering philosophy and core disciplines.
            </p>
          </div>

          <div className="form-grid">
            <label>
              Section Eyebrow
              <input
                value={content.about?.eyebrow || ''}
                onChange={e => updateAbout('eyebrow', e.target.value)}
                placeholder="e.g. WHAT I'M EXPLORING"
              />
            </label>

            <label>
              Heading Prefix
              <input
                value={content.about?.heading || ''}
                onChange={e => updateAbout('heading', e.target.value)}
                placeholder="e.g. Curiosity, with a"
              />
            </label>

            <label className="field-span-2">
              Heading Accent (Serif)
              <input
                value={content.about?.headingAccent || ''}
                onChange={e => updateAbout('headingAccent', e.target.value)}
                placeholder="e.g. practical direction."
              />
            </label>

            <label className="field-span-2">
              About Description
              <textarea
                rows={3}
                value={content.about?.description || ''}
                onChange={e => updateAbout('description', e.target.value)}
                placeholder="Detailed statement on technical focus…"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab: Portfolio Sections & Visibility */}
      {activeTab === 'sections' && (
        <div className="space-y-6 max-w-4xl">
          <div className="panel-card">
            <h3 className="text-base font-bold text-stone-900">Portfolio Section Titles & Visibility</h3>
            <p className="text-xs text-stone-500 mt-1">
              Toggle visibility for individual portfolio sections on the public homepage. Edit section titles, eyebrows, and subheadings.
            </p>
          </div>

          {[
            { key: 'domains', label: 'Technical Domains & Explorer', defaultIcon: 'Layers' },
            { key: 'projects', label: 'Selected Work & Projects', defaultIcon: 'Code2' },
            { key: 'skills', label: 'Core Competencies & Skills', defaultIcon: 'Sparkles' },
            { key: 'roadmaps', label: 'Learning Roadmaps & Progression', defaultIcon: 'Workflow' },
            { key: 'practiceLabs', label: 'Practice Labs & Environments', defaultIcon: 'Terminal' },
            { key: 'assignments', label: 'Technical Assignments & Case Studies', defaultIcon: 'FileCheck' },
            { key: 'education', label: 'Academic Background & Studies', defaultIcon: 'GraduationCap' },
            { key: 'certificates', label: 'Verified Credentials & Certificates', defaultIcon: 'Trophy' },
            { key: 'resume', label: 'Professional Resume & Credentials', defaultIcon: 'FileText' },
            { key: 'notes', label: 'Knowledge Base & Notes', defaultIcon: 'BookOpen' },
            { key: 'contact', label: 'Contact & Collaboration Section', defaultIcon: 'Share2' }
          ].map(sec => {
            const secData = content.sections?.[sec.key] || {};
            const isVisible = secData.visible !== false;

            return (
              <div
                key={sec.key}
                className={`panel-card transition border-l-4 ${
                  isVisible ? 'border-l-wine' : 'border-l-stone-300 opacity-70 bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-stone-800">{sec.label}</strong>
                    <span className="font-mono text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                      sections.{sec.key}
                    </span>
                  </div>

                  <label className="check-label m-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={e => updateSection(sec.key, 'visible', e.target.checked)}
                    />
                    <span className={`text-xs font-bold ${isVisible ? 'text-emerald-700' : 'text-stone-400'}`}>
                      {isVisible ? 'Visible on Portfolio' : 'Hidden from Public'}
                    </span>
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Section Eyebrow
                    <input
                      value={secData.eyebrow || ''}
                      onChange={e => updateSection(sec.key, 'eyebrow', e.target.value)}
                    />
                  </label>

                  <label>
                    Section Title
                    <input
                      value={secData.title || ''}
                      onChange={e => updateSection(sec.key, 'title', e.target.value)}
                    />
                  </label>

                  <label className="field-span-2">
                    Section Description
                    <input
                      value={secData.description || ''}
                      onChange={e => updateSection(sec.key, 'description', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Navigation */}
      {activeTab === 'navigation' && (
        <div className="panel-card max-w-4xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">Custom Navigation Labels</h3>
            <p className="text-xs text-stone-500 mt-1">
              Rename the labels appearing in the public header and navigation bar.
            </p>
          </div>

          <div className="form-grid">
            <label>
              Projects Menu Label
              <input
                value={content.navigation?.projectsLabel ?? 'Projects'}
                onChange={e => updateNav('projectsLabel', e.target.value)}
                placeholder="Projects"
              />
            </label>

            <label>
              Domains Menu Label
              <input
                value={content.navigation?.domainsLabel ?? 'Domains'}
                onChange={e => updateNav('domainsLabel', e.target.value)}
                placeholder="Domains"
              />
            </label>

            <label>
              Skills Menu Label
              <input
                value={content.navigation?.skillsLabel ?? 'Skills'}
                onChange={e => updateNav('skillsLabel', e.target.value)}
                placeholder="Skills"
              />
            </label>

            <label>
              Roadmaps Menu Label
              <input
                value={content.navigation?.roadmapsLabel ?? 'Roadmaps'}
                onChange={e => updateNav('roadmapsLabel', e.target.value)}
                placeholder="Roadmaps"
              />
            </label>

            <label>
              Practice Labs Menu Label
              <input
                value={content.navigation?.practiceLabsLabel ?? 'Labs'}
                onChange={e => updateNav('practiceLabsLabel', e.target.value)}
                placeholder="Labs"
              />
            </label>

            <label>
              Assignments Menu Label
              <input
                value={content.navigation?.assignmentsLabel ?? 'Assignments'}
                onChange={e => updateNav('assignmentsLabel', e.target.value)}
                placeholder="Assignments"
              />
            </label>

            <label>
              Credentials / Certificates Label
              <input
                value={content.navigation?.certificatesLabel ?? 'Credentials'}
                onChange={e => updateNav('certificatesLabel', e.target.value)}
                placeholder="Credentials"
              />
            </label>

            <label>
              Notes Menu Label
              <input
                value={content.navigation?.notesLabel ?? 'Notes'}
                onChange={e => updateNav('notesLabel', e.target.value)}
                placeholder="Notes"
              />
            </label>

            <label>
              Analytics Menu Label
              <input
                value={content.navigation?.analyticsLabel ?? 'Analytics'}
                onChange={e => updateNav('analyticsLabel', e.target.value)}
                placeholder="Analytics"
              />
            </label>

            <label>
              Contact Menu Label
              <input
                value={content.navigation?.contactLabel ?? 'Contact'}
                onChange={e => updateNav('contactLabel', e.target.value)}
                placeholder="Contact"
              />
            </label>

            <label className="field-span-2">
              Education Menu Label
              <input
                value={content.navigation?.educationLabel ?? 'Education'}
                onChange={e => updateNav('educationLabel', e.target.value)}
                placeholder="Education"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab: Contacts Management */}
      {activeTab === 'contact' && (
        <div className="space-y-6 max-w-4xl">
          {/* Section 1: Contact Section Copy & Presentation */}
          <div className="panel-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">Contact Section Storytelling &amp; Presentation</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Customize the headline, descriptions, primary email address, response guarantee, and operational signals on your portfolio.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  checked={content.sections?.contact?.visible !== false}
                  onChange={e => updateSection('contact', 'visible', e.target.checked)}
                  className="rounded text-amber-800 focus:ring-amber-800"
                />
                Show Section
              </label>
            </div>

            <div className="form-grid">
              <label>
                Section Eyebrow
                <input
                  value={content.sections?.contact?.eyebrow || ''}
                  onChange={e => updateSection('contact', 'eyebrow', e.target.value)}
                  placeholder="e.g. LET'S CONNECT"
                />
              </label>

              <label>
                Primary Direct Email
                <input
                  type="email"
                  value={content.sections?.contact?.primaryEmail || ''}
                  onChange={e => updateSection('contact', 'primaryEmail', e.target.value)}
                  placeholder="e.g. emaan.humayun@example.com"
                />
              </label>

              <label>
                Main Heading
                <input
                  value={content.sections?.contact?.title || ''}
                  onChange={e => updateSection('contact', 'title', e.target.value)}
                  placeholder="e.g. Good work gets better"
                />
              </label>

              <label>
                Heading Accent (Italic / Serif)
                <input
                  value={content.sections?.contact?.headingAccent || ''}
                  onChange={e => updateSection('contact', 'headingAccent', e.target.value)}
                  placeholder="e.g. when it is shared."
                />
              </label>

              <label className="field-span-2">
                Section Description
                <textarea
                  rows={3}
                  value={content.sections?.contact?.description || ''}
                  onChange={e => updateSection('contact', 'description', e.target.value)}
                  placeholder="Have an interesting engineering problem, collaboration idea, or question? Feel free to reach out directly."
                />
              </label>

              <label>
                Response Time Signal
                <input
                  value={content.sections?.contact?.responseTimeBadge || ''}
                  onChange={e => updateSection('contact', 'responseTimeBadge', e.target.value)}
                  placeholder="e.g. Typically responds within 24h"
                />
              </label>

              <label>
                Location &amp; Remote Availability Signal
                <input
                  value={content.sections?.contact?.locationBadge || ''}
                  onChange={e => updateSection('contact', 'locationBadge', e.target.value)}
                  placeholder="e.g. Lahore, PK · Remote Available (PKT · UTC+5)"
                />
              </label>

              <label>
                Engineering Discipline Signal
                <input
                  value={content.sections?.contact?.architectureBadge || ''}
                  onChange={e => updateSection('contact', 'architectureBadge', e.target.value)}
                  placeholder="e.g. First-Principles Architecture"
                />
              </label>

              <label>
                Card Timezone Badge
                <input
                  value={content.sections?.contact?.channelCardTimezone || ''}
                  onChange={e => updateSection('contact', 'channelCardTimezone', e.target.value)}
                  placeholder="e.g. PKT · UTC+5"
                />
              </label>

              <label>
                Channel Card Header
                <input
                  value={content.sections?.contact?.channelCardHeader || ''}
                  onChange={e => updateSection('contact', 'channelCardHeader', e.target.value)}
                  placeholder="e.g. Direct Communication Channel"
                />
              </label>

              <label>
                Channels Subheading
                <input
                  value={content.sections?.contact?.channelsSubheading || ''}
                  onChange={e => updateSection('contact', 'channelsSubheading', e.target.value)}
                  placeholder="e.g. VERIFIED PROFESSIONAL CHANNELS"
                />
              </label>

              <label className="field-span-2">
                Response Guarantee / Footer Note
                <input
                  value={content.sections?.contact?.guaranteeNote || ''}
                  onChange={e => updateSection('contact', 'guaranteeNote', e.target.value)}
                  placeholder="e.g. ⚡ Guaranteed response within 24 hours · Open to consulting & engineering engagements"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Contact Channels & Social Handles Management */}
          <div className="panel-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">Verified Contact Channels &amp; Social Handles</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Manage channels (GitHub, LinkedIn, WhatsApp, Email, Twitter/X, Discord, etc.) displayed in the Contact card, Hero, and Footer.
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleOpenChannelModal()}
                  className="button-primary inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <Plus size={15} /> Add Contact Channel
                </button>
              )}
            </div>

            {loadingSocials ? (
              <div className="p-8 text-center text-xs text-stone-500">Loading channels…</div>
            ) : socialLinks.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300">
                <p className="text-sm font-semibold text-stone-700">No channels added yet.</p>
                <p className="text-xs text-stone-500 mt-1">Add WhatsApp, GitHub, LinkedIn, or any direct channel to display in your portfolio's contact section.</p>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleOpenChannelModal()}
                    className="mt-4 button-primary inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add First Channel
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {socialLinks.map((link, idx) => {
                  const IconComp = getPlatformIcon(link.platform);
                  const isFirst = idx === 0;
                  const isLast = idx === socialLinks.length - 1;
                  return (
                    <div
                      key={link._id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition gap-3 ${
                        link.isEnabled ? 'bg-surface border-stone-200' : 'bg-stone-50 border-stone-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={isFirst || isViewer}
                            onClick={() => handleMoveChannel(idx, -1)}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={isLast || isViewer}
                            onClick={() => handleMoveChannel(idx, 1)}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        {/* Icon */}
                        <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800 shrink-0">
                          <IconComp size={18} />
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-stone-900 truncate">
                              {link.label || link.platform}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 uppercase font-semibold">
                              {link.platform}
                            </span>
                            {link.isEnabled ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-500 truncate flex items-center gap-1.5 mt-0.5">
                            {link.username && <span className="font-semibold text-stone-700">{link.username} ·</span>}
                            <span className="font-mono truncate">{link.url}</span>
                          </div>
                          {/* Placements */}
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {(link.placement || ['contact']).map(p => (
                              <span
                                key={p}
                                className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                                  p === 'contact' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-stone-50 text-stone-600 border-stone-200'
                                }`}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
                          title="Open URL in new tab"
                        >
                          <ExternalLink size={15} />
                        </a>
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleChannelEnabled(link)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                link.isEnabled
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                  : 'text-stone-400 bg-stone-100 border-stone-200 hover:bg-stone-200'
                              }`}
                              title={link.isEnabled ? 'Disable channel' : 'Enable channel'}
                            >
                              {link.isEnabled ? <Eye size={15} /> : <EyeOff size={15} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenChannelModal(link)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
                              title="Edit channel details"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteChannelTarget(link)}
                              className="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 border border-red-200 transition cursor-pointer"
                              title="Delete channel"
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
            )}
          </div>
        </div>
      )}

      {/* Tab: Footer & SEO */}
      {activeTab === 'footer-seo' && (
        <div className="panel-card max-w-4xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">Footer Text & SEO Metadata</h3>
            <p className="text-xs text-stone-500 mt-1">
              Configure search engine metadata and footer branding statements.
            </p>
          </div>

          <div className="form-grid">
            <label className="field-span-2">
              Footer Brand Statement
              <input
                value={content.footer?.brandText || ''}
                onChange={e => updateFooter('brandText', e.target.value)}
                placeholder="e.g. Built with curiosity and precision"
              />
            </label>

            <label className="field-span-2">
              Footer Copyright / Ownership Statement
              <input
                value={content.footer?.copyrightText || ''}
                onChange={e => updateFooter('copyrightText', e.target.value)}
                placeholder="e.g. © 2026 Emaan Humayun. All rights reserved."
              />
            </label>

            <label className="field-span-2">
              SEO Page Title
              <input
                value={content.seo?.title || ''}
                onChange={e => updateSeo('title', e.target.value)}
                placeholder="e.g. Emaan Humayun — Software Engineer & Systems Architect"
              />
            </label>

            <label className="field-span-2">
              SEO Meta Description
              <textarea
                rows={3}
                value={content.seo?.description || ''}
                onChange={e => updateSeo('description', e.target.value)}
                placeholder="Compelling meta description for search engines and social cards…"
              />
            </label>
          </div>
        </div>
      )}
      </fieldset>

      {canEdit && (
        <div className="mt-8 pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            className="button-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={15} /> {saving ? 'Saving…' : 'Save All Content & Presentation Changes'}
          </button>
        </div>
      )}

      <Toast message={toast} />

      {/* Channel Add / Edit Modal */}
      {channelModal && (
        <Modal
          title={editingChannel ? `Edit Channel: ${editingChannel.label}` : 'Add Contact / Social Channel'}
          onClose={() => {
            setChannelModal(false);
            setEditingChannel(null);
          }}
        >
          <form onSubmit={handleSaveChannel} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label>
                Platform Preset
                <select
                  value={channelForm.platform}
                  onChange={e => handlePlatformChange(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-stone-200 bg-surface px-3 py-2 text-stone-800"
                >
                  {PLATFORM_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              {channelForm.platform === 'custom' && (
                <label>
                  Custom Platform Name
                  <input
                    value={channelForm.customPlatformName || ''}
                    onChange={e => setChannelForm(f => ({ ...f, customPlatformName: e.target.value }))}
                    placeholder="e.g. Substack, Behance..."
                  />
                </label>
              )}

              <label>
                Channel Label
                <input
                  value={channelForm.label || ''}
                  onChange={e => setChannelForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. WhatsApp, GitHub, LinkedIn..."
                  required
                />
              </label>

              <label className="sm:col-span-2">
                Target URL / Link Address
                <input
                  value={channelForm.url || ''}
                  onChange={e => setChannelForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="e.g. https://wa.me/923001234567, https://github.com/..."
                  required
                />
              </label>

              <label className="sm:col-span-2">
                Sublabel / Handle / Description
                <input
                  value={channelForm.username || ''}
                  onChange={e => setChannelForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="e.g. Instant Direct Message, Code & IaC Repositories, or @username"
                />
              </label>
            </div>

            {/* Placements */}
            <div className="space-y-1.5 pt-2 border-t border-stone-200">
              <span className="block text-xs font-bold text-stone-700">Display Placements</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'contact', label: 'Contact Card' },
                  { id: 'hero', label: 'Hero Quick Links' },
                  { id: 'footer', label: 'Footer Links' }
                ].map(p => {
                  const isChecked = (channelForm.placement || []).includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                        isChecked ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-surface border-stone-200 text-stone-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePlacement(p.id)}
                        className="rounded text-amber-800 focus:ring-amber-800"
                      />
                      <span>{p.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channelForm.isEnabled}
                  onChange={e => setChannelForm(f => ({ ...f, isEnabled: e.target.checked }))}
                  className="rounded text-amber-800 focus:ring-amber-800"
                />
                Active &amp; Enabled
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setChannelModal(false);
                  setEditingChannel(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={savingChannel}
              >
                <Save size={14} /> {savingChannel ? 'Saving…' : editingChannel ? 'Update Channel' : 'Add Channel'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteChannelTarget && (
        <ConfirmModal
          title="Delete Channel"
          message={`Are you sure you want to permanently delete the channel "${deleteChannelTarget.label}" (${deleteChannelTarget.url})? This action cannot be undone.`}
          danger={true}
          confirmText="Delete Channel"
          onConfirm={handleDeleteChannel}
          onCancel={() => setDeleteChannelTarget(null)}
          onClose={() => setDeleteChannelTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminSiteContent;
