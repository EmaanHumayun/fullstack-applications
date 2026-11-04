import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Sparkles,
  Layout,
  Sliders,
  CheckCircle2,
  Copy,
  Trash2,
  ExternalLink,
  Edit,
  Printer,
  Shield,
  Eye,
  Star,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Toast, EmptyState, Modal } from '../../components.jsx';
import { RESUME_TEMPLATES, TEMPLATE_CATEGORIES } from '../../components/resume/templatesMeta.js';
import { ResumeRenderer } from '../../components/resume/ResumeRenderer.jsx';
import { printResumeDocument } from '../../components/resume/printResume.js';

export default function AdminResumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('resumes'); // 'resumes' | 'templates' | 'portfolio'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingResume, setDownloadingResume] = useState(null);

  const handleDirectDownload = async (resumeId, targetRole) => {
    try {
      showToast('Preparing vector PDF download...');
      const full = await api(`/resumes/${resumeId}`);
      if (full) {
        setDownloadingResume(full);
        setTimeout(() => {
          const cleanRole = (targetRole || 'Engineer').replace(/[^a-zA-Z0-9]/g, '-');
          printResumeDocument({
            elementId: 'admin-dashboard-hidden-printable-resume',
            title: `Emaan-Humayun-${cleanRole}-Resume`
          });
        }, 200);
      }
    } catch (e) {
      showToast('Failed to load resume document for download');
    }
  };

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadResumes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/resumes');
      setResumes(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  // Set Featured Resume on Public Portfolio
  const handleSetFeatured = async id => {
    try {
      const res = await api(`/resumes/${id}/set-featured`, { method: 'POST' });
      showToast(res.message || 'Featured portfolio resume updated');
      loadResumes();
    } catch (err) {
      showToast(err.message || 'Failed to update featured resume');
    }
  };

  // Duplicate Resume
  const handleDuplicate = async id => {
    try {
      const dup = await api(`/resumes/${id}/duplicate`, { method: 'POST' });
      showToast(`Created duplicate version: "${dup.title}"`);
      loadResumes();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate resume');
    }
  };

  // Delete Resume
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api(`/resumes/${deletingId}`, { method: 'DELETE' });
      showToast('Resume removed');
      setDeletingId(null);
      loadResumes();
    } catch (err) {
      showToast(err.message || 'Failed to delete resume');
    }
  };

  // Create new resume with specific template
  const handleCreateWithTemplate = templateId => {
    navigate(`/admin/resumes/builder?template=${templateId}`);
  };

  const featuredResume = resumes.find(r => r.isFeatured);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Confirmation Modal */}
      {deletingId && (
        <Modal
          title="Move Resume to Recycle Bin"
          onClose={() => setDeletingId(null)}
          onConfirm={handleDelete}
          confirmText="Move to Recycle Bin"
          confirmVariant="danger"
        >
          <p className="text-xs text-stone-600">
            Are you sure you want to remove this resume? It will be moved to the Unified Recycle Bin where it can be restored anytime or permanently purged.
          </p>
        </Modal>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
            CAREER & PRESENTATION ENGINE
          </span>
          <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight mt-1.5">
            Resume Studio
          </h1>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            Design, customize, and maintain multiple professional resumes. Choose from 20 templates, import verified workspace data, and designate your public portfolio resume.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link
            to="/admin/resumes/builder"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:brightness-105 transition shadow-xs"
          >
            <Plus size={14} /> Create New Resume
          </Link>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border text-xs font-semibold pb-1">
        <button
          onClick={() => setActiveTab('resumes')}
          className={`py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'resumes'
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <FileText size={14} /> My Resumes ({resumes.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'templates'
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Layout size={14} /> Template Gallery (20)
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'portfolio'
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Star size={14} /> Portfolio Featured Settings
        </button>
      </div>

      {/* TAB 1: MY RESUMES */}
      {activeTab === 'resumes' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-stone-500">
              Loading saved resume records...
            </div>
          ) : resumes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Resumes Created Yet"
              description="Create your first tailored engineering resume manually or import your existing workspace projects, skills, and certifications."
              action={
                <Link
                  to="/admin/resumes/builder"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white"
                >
                  <Plus size={14} /> Build First Resume
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map(r => (
                <div
                  key={r._id}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md ${
                    r.isFeatured
                      ? 'border-primary ring-2 ring-primary/20 bg-amber-50/10'
                      : 'border-border hover:border-stone-400'
                  }`}
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {r.templateId || 'modern-pro'}
                      </span>
                      {r.isFeatured ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          <Star size={10} className="fill-amber-600 text-amber-600" /> Featured Public
                        </span>
                      ) : (
                        <span className="font-mono text-[9.5px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                          Private
                        </span>
                      )}
                    </div>

                    {/* Title & Target Role */}
                    <h3 className="font-bold text-base text-stone-900 font-serif line-clamp-1">
                      {r.title}
                    </h3>
                    <p className="text-xs text-primary font-semibold mt-0.5">
                      {r.targetRole || 'Software Engineer'}
                    </p>

                    <div className="text-[11px] text-stone-500 mt-2 space-y-0.5">
                      <div>Name: {r.personalInformation?.fullName || 'Emaan Humayun'}</div>
                      <div>Version: v{r.version || 1}</div>
                      <div>
                        Updated: {new Date(r.updatedAt || r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/admin/resumes/builder/${r._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition"
                      >
                        <Edit size={12} /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDirectDownload(r._id, r.targetRole)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                        title="Download Vector PDF"
                      >
                        <Printer size={13} />
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {!r.isFeatured && (
                        <button
                          type="button"
                          onClick={() => handleSetFeatured(r._id)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition"
                          title="Set as Featured Portfolio Resume"
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(r._id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
                        title="Duplicate Version"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(r._id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Resume"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEMPLATE GALLERY (20 Templates) */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white border border-border text-stone-700 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESUME_TEMPLATES.filter(
              t => selectedCategory === 'All' || t.category === selectedCategory
            ).map(t => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-border p-5 flex flex-col justify-between hover:border-stone-400 transition shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-primary">
                      {t.number}. {t.name}
                    </span>
                    {t.atsFriendly && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ATS-Friendly
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono block mb-2">
                    {t.category}
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    {t.description}
                  </p>
                  <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <strong>Recommended for:</strong> {t.recommendedFor}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-stone-500 font-mono">{t.layout}</span>
                  <button
                    type="button"
                    onClick={() => handleCreateWithTemplate(t.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition"
                  >
                    <span>Use Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PORTFOLIO FEATURED SETTINGS */}
      {activeTab === 'portfolio' && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Public Portfolio Resume Designation
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              Select exactly one resume to appear on your public portfolio home page. Visitors will be able to inspect its preview and download the approved high-quality PDF. All your other resumes remain strictly private.
            </p>
          </div>

          {featuredResume ? (
            <div className="p-5 rounded-xl border border-primary/40 bg-amber-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 mb-1.5">
                  <Star size={11} className="fill-amber-600 text-amber-600" /> Currently Active Public Resume
                </span>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  {featuredResume.title}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Target Role: <strong>{featuredResume.targetRole}</strong> · Template: <code>{featuredResume.templateId}</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/resumes/builder/${featuredResume._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-border text-stone-700 hover:bg-stone-50"
                >
                  <Edit size={13} /> Edit Content
                </Link>
                <a
                  href="/#resume"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-primary text-white hover:brightness-105"
                >
                  <span>View on Portfolio</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center text-xs text-stone-500">
              No resume is currently designated as featured. Select one below to activate the public portfolio resume download.
            </div>
          )}

          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-3">
              Switch Featured Resume:
            </h3>
            <div className="space-y-2">
              {resumes.map(r => (
                <div
                  key={r._id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    r.isFeatured
                      ? 'bg-primary/5 border-primary font-semibold'
                      : 'bg-stone-50 border-border hover:bg-white'
                  }`}
                >
                  <div>
                    <strong className="text-stone-900 block">{r.title}</strong>
                    <span className="text-stone-500 text-[11px]">
                      {r.targetRole} · v{r.version} · {r.templateId}
                    </span>
                  </div>

                  {r.isFeatured ? (
                    <span className="inline-flex items-center gap-1 text-primary font-bold">
                      <Check size={14} /> Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetFeatured(r._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition"
                    >
                      Set as Featured
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Offscreen Resume for Direct Dashboard Vector PDF Downloads */}
      {downloadingResume && (
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
          <ResumeRenderer resume={downloadingResume} zoom={1} id="admin-dashboard-hidden-printable-resume" />
        </div>
      )}
    </div>
  );
}

