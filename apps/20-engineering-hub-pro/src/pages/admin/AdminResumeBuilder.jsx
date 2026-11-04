import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Printer,
  Download,
  Sparkles,
  Layout,
  Palette,
  Sliders,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  ExternalLink,
  Github,
  Check,
  AlertCircle,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Toast, EmptyState } from '../../components.jsx';
import { ResumeRenderer } from '../../components/resume/ResumeRenderer.jsx';
import { RESUME_TEMPLATES, TEMPLATE_CATEGORIES } from '../../components/resume/templatesMeta.js';
import { RESUME_PALETTES, getPalette } from '../../components/resume/palettes.js';
import { parseRawSkills, autoCategorizeSkills } from '../../components/resume/SmartSkillsParser.js';
import { WorkspaceImporterModal } from '../../components/resume/WorkspaceImporterModal.jsx';

const DEFAULT_RESUME = {
  title: 'Software Engineer Resume',
  targetRole: 'Software Engineer',
  templateId: 'modern-pro',
  theme: getPalette('burgundy-gold'),
  typography: {
    fontFamily: 'inter',
    fontSize: 'normal',
    lineHeight: 'normal'
  },
  personalInformation: {
    fullName: 'Emaan Humayun',
    professionalTitle: 'Software Engineer | DevOps Engineer',
    email: 'emaan.humayun@example.com',
    phone: '',
    location: 'Lahore, Pakistan',
    linkedinUrl: 'https://linkedin.com/in/emaanmuhammadhumayun',
    githubUrl: 'https://github.com/EmaanHumayun',
    portfolioUrl: 'https://emaan.dev',
    websiteUrl: '',
    avatarUrl: ''
  },
  professionalSummary:
    'Software Engineer with an emphasis on backend architectures, automation pipelines, and scalable cloud systems. Experienced in designing deterministic REST APIs, containerized deployments, and agentic workflows built on first-principles computing.',
  sections: [
    {
      id: 'sec-summary',
      sectionType: 'summary',
      title: 'Professional Summary',
      visible: true,
      order: 0,
      entries: []
    },
    {
      id: 'sec-skills',
      sectionType: 'skills',
      title: 'Technical Competencies',
      visible: true,
      order: 1,
      entries: []
    },
    {
      id: 'sec-projects',
      sectionType: 'projects',
      title: 'Key Technical Projects',
      visible: true,
      order: 2,
      entries: []
    },
    {
      id: 'sec-experience',
      sectionType: 'experience',
      title: 'Engineering Experience',
      visible: true,
      order: 3,
      entries: []
    },
    {
      id: 'sec-education',
      sectionType: 'education',
      title: 'Education & Academic Background',
      visible: true,
      order: 4,
      entries: []
    },
    {
      id: 'sec-certifications',
      sectionType: 'certifications',
      title: 'Certifications & Credentials',
      visible: true,
      order: 5,
      entries: []
    }
  ],
  skillsData: {
    categories: [
      {
        name: 'Backend & APIs',
        skills: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'GraphQL', 'JWT', 'RBAC']
      },
      {
        name: 'Databases & Storage',
        skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Mongoose', 'Prisma', 'SQL']
      },
      {
        name: 'Cloud & Infrastructure',
        skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'Linux', 'GitHub Actions', 'CI/CD']
      },
      {
        name: 'Frontend & UI',
        skills: ['React 18', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML5/CSS3']
      }
    ]
  },
  pageSettings: {
    pageSize: 'A4',
    margins: 'normal',
    showPageNumbers: false
  },
  visibility: 'private',
  isFeatured: false,
  version: 1
};

export default function AdminResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'templates' | 'theme' | 'sections'
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'
  const [zoom, setZoom] = useState(0.85);
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  // Skill text paste state
  const [rawSkillsInput, setRawSkillsInput] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('All');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Load existing resume if editing
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api(`/resumes/${id}`)
      .then(res => {
        setResume(res);
      })
      .catch(err => {
        showToast(err.message || 'Failed to load resume');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        const updated = await api(`/resumes/${id}`, {
          method: 'PUT',
          ...jsonBody(resume)
        });
        setResume(updated);
        showToast('Resume changes saved successfully');
      } else {
        const created = await api('/resumes', {
          method: 'POST',
          ...jsonBody(resume)
        });
        showToast('Resume created successfully');
        navigate(`/admin/resumes/builder/${created._id}`, { replace: true });
      }
    } catch (err) {
      showToast(err.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  // Handle Print / PDF Download
  const handlePrint = () => {
    // Generate clean professional title for download
    const cleanRole = (resume.targetRole || 'Engineer').replace(/[^a-zA-Z0-9]/g, '-');
    const prevTitle = document.title;
    document.title = `Emaan-Humayun-${cleanRole}-Resume`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  // Update Personal Info
  const updatePI = (field, val) => {
    setResume(prev => ({
      ...prev,
      personalInformation: {
        ...prev.personalInformation,
        [field]: val
      }
    }));
  };

  // Parse Raw Skills Text
  const handleParseSkills = () => {
    if (!rawSkillsInput.trim()) return;
    const parsed = parseRawSkills(rawSkillsInput);
    const categorized = autoCategorizeSkills(parsed);

    setResume(prev => ({
      ...prev,
      skillsData: {
        categories: categorized
      }
    }));

    showToast(`Parsed and organized ${parsed.length} skills into ${categorized.length} categories`);
    setRawSkillsInput('');
  };

  // Apply Workspace Importer Snapshot
  const handleImportWorkspaceData = data => {
    setResume(prev => {
      const next = { ...prev };

      // Update Personal Info & Summary if selected
      if (data.profile) {
        next.personalInformation = {
          ...next.personalInformation,
          fullName: data.profile.name || next.personalInformation.fullName,
          professionalTitle: data.profile.headline || next.personalInformation.professionalTitle,
          email: data.profile.email || data.profile.contactEmail || next.personalInformation.email,
          phone: data.profile.phone || next.personalInformation.phone,
          location: data.profile.location || next.personalInformation.location,
          githubUrl: data.profile.githubUrl || next.personalInformation.githubUrl,
          linkedinUrl: data.profile.linkedinUrl || next.personalInformation.linkedinUrl,
          websiteUrl: data.profile.websiteUrl || next.personalInformation.websiteUrl
        };
        if (data.profile.bio) {
          next.professionalSummary = data.profile.bio;
        }
      }

      // Update skills if selected
      if (data.skillsData) {
        next.skillsData = data.skillsData;
      }

      // Update project entries
      if (data.projectEntries && data.projectEntries.length > 0) {
        const projSec = next.sections.find(s => s.sectionType === 'projects');
        if (projSec) {
          projSec.entries = data.projectEntries;
          projSec.visible = true;
        }
      }

      // Update cert entries
      if (data.certEntries && data.certEntries.length > 0) {
        const certSec = next.sections.find(s => s.sectionType === 'certifications');
        if (certSec) {
          certSec.entries = data.certEntries;
          certSec.visible = true;
        }
      }

      // Update edu entries
      if (data.eduEntries && data.eduEntries.length > 0) {
        const eduSec = next.sections.find(s => s.sectionType === 'education');
        if (eduSec) {
          eduSec.entries = data.eduEntries;
          eduSec.visible = true;
        }
      }

      return next;
    });

    showToast(
      `Imported: ${data.counts.skills} skills, ${data.counts.projects} projects, ${data.counts.certs} certs, ${data.counts.edu} education`
    );
  };

  // Add a new project entry
  const addProject = () => {
    setResume(prev => {
      const next = { ...prev };
      const projSec = next.sections.find(s => s.sectionType === 'projects');
      if (projSec) {
        projSec.entries = [
          {
            title: 'New Technical Project',
            subtitle: 'Backend Architecture',
            startDate: '2026',
            endDate: '',
            description: 'Architecture overview and primary engineering objectives.',
            technologies: ['Node.js', 'Express', 'PostgreSQL'],
            githubUrl: 'https://github.com/EmaanHumayun',
            url: '',
            bullets: ['Implemented deterministic API handlers and caching layer.']
          },
          ...(projSec.entries || [])
        ];
      }
      return next;
    });
  };

  // Remove a project entry
  const removeProject = index => {
    setResume(prev => {
      const next = { ...prev };
      const projSec = next.sections.find(s => s.sectionType === 'projects');
      if (projSec && projSec.entries) {
        projSec.entries = projSec.entries.filter((_, i) => i !== index);
      }
      return next;
    });
  };

  // Add a work experience entry
  const addExperience = () => {
    setResume(prev => {
      const next = { ...prev };
      const expSec = next.sections.find(s => s.sectionType === 'experience');
      if (expSec) {
        expSec.entries = [
          {
            title: 'Software Engineer',
            organization: 'Technology Organization',
            location: 'Remote',
            startDate: '2025',
            endDate: 'Present',
            current: true,
            description: 'Designed and deployed distributed backend services and data workflows.',
            bullets: [
              'Constructed automated CI/CD release pipelines reducing delivery latency by 40%.',
              'Maintained 99.9% uptime across production container workloads.'
            ]
          },
          ...(expSec.entries || [])
        ];
      }
      return next;
    });
  };

  // Remove a work experience entry
  const removeExperience = index => {
    setResume(prev => {
      const next = { ...prev };
      const expSec = next.sections.find(s => s.sectionType === 'experience');
      if (expSec && expSec.entries) {
        expSec.entries = expSec.entries.filter((_, i) => i !== index);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-stone-500">
        Loading resume document specifications...
      </div>
    );
  }

  return (
    <div className="resume-builder-workspace flex flex-col h-[calc(100vh-4rem)] bg-stone-100 -m-6 sm:-m-8">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <WorkspaceImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportData={handleImportWorkspaceData}
      />

      {/* TOP ACTION BAR */}
      <header className="bg-white border-b border-border px-5 py-3 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/resumes"
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
            title="Back to Resumes"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <input
              type="text"
              value={resume.title}
              onChange={e => setResume(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Resume Title..."
              className="font-bold text-sm text-stone-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0 truncate"
            />
            <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
              <span>{resume.targetRole || 'Software Engineer'}</span>
              <span>•</span>
              <span className="font-mono uppercase">{resume.templateId}</span>
              {resume.isFeatured && (
                <span className="px-1.5 py-0.2 rounded bg-gold/20 text-primary font-bold">
                  Featured Portfolio Resume
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Workspace Data Quick Import Button */}
          <button
            type="button"
            onClick={() => setIsImporterOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition"
          >
            <Sparkles size={13} />
            <span>Import Workspace Data</span>
          </button>

          {/* Print / Download Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition shadow-xs"
          >
            <Printer size={13} />
            <span>Download PDF</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:brightness-105 transition shadow-xs disabled:opacity-50"
          >
            <Save size={13} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </header>

      {/* MOBILE SWITCHER (Editor vs Preview) */}
      <div className="lg:hidden bg-stone-200 p-1 flex items-center justify-around border-b border-border text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-1.5 rounded-md text-center transition ${
            mobileView === 'editor' ? 'bg-white text-primary shadow-xs' : 'text-stone-600'
          }`}
        >
          Editor & Controls
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-1.5 rounded-md text-center transition ${
            mobileView === 'preview' ? 'bg-white text-primary shadow-xs' : 'text-stone-600'
          }`}
        >
          Live A4 Preview
        </button>
      </div>

      {/* SPLIT SCREEN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: CONTROLS & EDITOR (50% on Desktop) */}
        <div
          className={`w-full lg:w-1/2 flex flex-col bg-white border-r border-border ${
            mobileView === 'editor' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Subtabs Navigation */}
          <div className="flex items-center px-4 border-b border-border bg-stone-50 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'content'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText size={13} /> Content
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'templates'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layout size={13} /> Templates (20)
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'theme'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Palette size={13} /> Theme & Colors
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'sections'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sliders size={13} /> Sections & Layout
            </button>
          </div>

          {/* Subtab Body Container */}
          <div className="p-5 overflow-y-auto flex-1 space-y-6">
            {/* 1. CONTENT EDITOR TAB */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/50 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={resume.personalInformation?.fullName || ''}
                        onChange={e => updatePI('fullName', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Professional Title</label>
                      <input
                        type="text"
                        value={resume.personalInformation?.professionalTitle || ''}
                        onChange={e => updatePI('professionalTitle', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={resume.personalInformation?.email || ''}
                        onChange={e => updatePI('email', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={resume.personalInformation?.phone || ''}
                        onChange={e => updatePI('phone', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Location</label>
                      <input
                        type="text"
                        value={resume.personalInformation?.location || ''}
                        onChange={e => updatePI('location', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">GitHub Profile URL</label>
                      <input
                        type="text"
                        value={resume.personalInformation?.githubUrl || ''}
                        onChange={e => updatePI('githubUrl', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">LinkedIn URL</label>
                      <input
                        type="text"
                        value={resume.personalInformation?.linkedinUrl || ''}
                        onChange={e => updatePI('linkedinUrl', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Portfolio Website</label>
                      <input
                        type="text"
                        value={resume.personalInformation?.portfolioUrl || ''}
                        onChange={e => updatePI('portfolioUrl', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/50 space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                    Professional Summary
                  </h3>
                  <textarea
                    rows={4}
                    value={resume.professionalSummary || ''}
                    onChange={e => setResume(prev => ({ ...prev, professionalSummary: e.target.value }))}
                    placeholder="Concise overview of engineering focus, systems built, and core strengths..."
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>

                {/* Technical Skills & Raw Text Parser */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                      Technical Skills
                    </h3>
                    <span className="text-[10px] text-stone-500">Auto-categorization available</span>
                  </div>

                  {/* Raw Text Input Box */}
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-border">
                    <label className="block text-[11px] font-semibold text-stone-700">
                      Paste Skills (comma or newline separated):
                    </label>
                    <textarea
                      rows={2}
                      value={rawSkillsInput}
                      onChange={e => setRawSkillsInput(e.target.value)}
                      placeholder="e.g. Python, JavaScript, Node.js, Express, React, PostgreSQL, Docker, Kubernetes, Linux, Git, AI Agents..."
                      className="w-full p-2 text-xs rounded-lg border border-border bg-stone-50 focus:bg-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleParseSkills}
                        disabled={!rawSkillsInput.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-primary text-white disabled:opacity-50 hover:brightness-105 transition"
                      >
                        <Sparkles size={12} /> Parse & Organize Skills
                      </button>
                    </div>
                  </div>

                  {/* Render Categorized Skills Editor */}
                  <div className="space-y-2">
                    {(resume.skillsData?.categories || []).map((cat, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-border text-xs">
                        <div className="flex items-center justify-between font-bold text-stone-800 mb-1">
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {cat.skills.length} skills
                          </span>
                        </div>
                        <input
                          type="text"
                          value={cat.skills.join(', ')}
                          onChange={e => {
                            const newSkills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setResume(prev => {
                              const nextCats = [...(prev.skillsData?.categories || [])];
                              nextCats[idx] = { ...nextCats[idx], skills: newSkills };
                              return { ...prev, skillsData: { categories: nextCats } };
                            });
                          }}
                          className="w-full px-2 py-1 text-[11.5px] rounded border border-stone-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Technical Projects */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                      Technical Projects
                    </h3>
                    <button
                      type="button"
                      onClick={addProject}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-border hover:bg-stone-100 text-stone-700"
                    >
                      <Plus size={12} /> Add Project
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(resume.sections?.find(s => s.sectionType === 'projects')?.entries || []).map(
                      (p, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-border text-xs space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <input
                              type="text"
                              value={p.title}
                              onChange={e => {
                                const val = e.target.value;
                                setResume(prev => {
                                  const next = { ...prev };
                                  const sec = next.sections.find(s => s.sectionType === 'projects');
                                  if (sec) sec.entries[idx].title = val;
                                  return next;
                                });
                              }}
                              placeholder="Project Title"
                              className="font-bold text-xs text-stone-900 flex-1 px-2 py-1 rounded border border-stone-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeProject(idx)}
                              className="text-stone-400 hover:text-red-600 p-1"
                              title="Remove Project"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={p.githubUrl || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setResume(prev => {
                                  const next = { ...prev };
                                  const sec = next.sections.find(s => s.sectionType === 'projects');
                                  if (sec) sec.entries[idx].githubUrl = val;
                                  return next;
                                });
                              }}
                              placeholder="GitHub Repository URL"
                              className="px-2 py-1 text-[11px] rounded border border-stone-200"
                            />
                            <input
                              type="text"
                              value={(p.technologies || []).join(', ')}
                              onChange={e => {
                                const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                setResume(prev => {
                                  const next = { ...prev };
                                  const sec = next.sections.find(s => s.sectionType === 'projects');
                                  if (sec) sec.entries[idx].technologies = val;
                                  return next;
                                });
                              }}
                              placeholder="Technologies (e.g. Node, React, Redis)"
                              className="px-2 py-1 text-[11px] rounded border border-stone-200"
                            />
                          </div>

                          <textarea
                            rows={2}
                            value={p.description || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setResume(prev => {
                                const next = { ...prev };
                                const sec = next.sections.find(s => s.sectionType === 'projects');
                                if (sec) sec.entries[idx].description = val;
                                return next;
                              });
                            }}
                            placeholder="Architectural overview, system components, trade-offs..."
                            className="w-full px-2 py-1 text-[11px] rounded border border-stone-200"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Work Experience */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                      Work Experience
                    </h3>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-border hover:bg-stone-100 text-stone-700"
                    >
                      <Plus size={12} /> Add Experience
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(resume.sections?.find(s => s.sectionType === 'experience')?.entries || []).map(
                      (job, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-border text-xs space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <input
                              type="text"
                              value={job.title}
                              onChange={e => {
                                const val = e.target.value;
                                setResume(prev => {
                                  const next = { ...prev };
                                  const sec = next.sections.find(s => s.sectionType === 'experience');
                                  if (sec) sec.entries[idx].title = val;
                                  return next;
                                });
                              }}
                              placeholder="Position / Role"
                              className="font-bold text-xs text-stone-900 flex-1 px-2 py-1 rounded border border-stone-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeExperience(idx)}
                              className="text-stone-400 hover:text-red-600 p-1"
                              title="Remove Experience"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={job.organization || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setResume(prev => {
                                  const next = { ...prev };
                                  const sec = next.sections.find(s => s.sectionType === 'experience');
                                  if (sec) sec.entries[idx].organization = val;
                                  return next;
                                });
                              }}
                              placeholder="Company / Organization"
                              className="px-2 py-1 text-[11px] rounded border border-stone-200"
                            />
                            <input
                              type="text"
                              value={job.startDate || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setResume(prev => {
                                  const next = { ...prev };
                                  const sec = next.sections.find(s => s.sectionType === 'experience');
                                  if (sec) sec.entries[idx].startDate = val;
                                  return next;
                                });
                              }}
                              placeholder="Start Date (e.g. 2024)"
                              className="px-2 py-1 text-[11px] rounded border border-stone-200"
                            />
                          </div>

                          <textarea
                            rows={2}
                            value={job.description || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setResume(prev => {
                                const next = { ...prev };
                                const sec = next.sections.find(s => s.sectionType === 'experience');
                                if (sec) sec.entries[idx].description = val;
                                return next;
                              });
                            }}
                            placeholder="Key responsibilities and engineering outcomes..."
                            className="w-full px-2 py-1 text-[11px] rounded border border-stone-200"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. TEMPLATES GALLERY TAB (20 Templates) */}
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedTemplateCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                        selectedTemplateCategory === cat
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {RESUME_TEMPLATES.filter(
                    t => selectedTemplateCategory === 'All' || t.category === selectedTemplateCategory
                  ).map(t => {
                    const isSelected = resume.templateId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setResume(prev => ({ ...prev, templateId: t.id }))}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-sm'
                            : 'bg-white border-border hover:border-stone-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-stone-900">
                              {t.number}. {t.name}
                            </span>
                            {t.atsFriendly && (
                              <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ATS
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono block mb-2">
                            {t.category}
                          </span>
                          <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10.5px]">
                          <span className="text-stone-500 font-mono">{t.layout}</span>
                          <span
                            className={`font-semibold ${
                              isSelected ? 'text-primary' : 'text-stone-400'
                            }`}
                          >
                            {isSelected ? 'Active Template' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. THEME & TYPOGRAPHY TAB */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                {/* 10 Preset Color Palettes */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                    Ready-Made Colour Palettes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {RESUME_PALETTES.map(p => {
                      const isSelected = resume.theme?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setResume(prev => ({ ...prev, theme: p }))}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                              : 'bg-white border-border hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center -space-x-1">
                              <span
                                style={{ backgroundColor: p.primary }}
                                className="w-4 h-4 rounded-full border border-white"
                              />
                              <span
                                style={{ backgroundColor: p.accent }}
                                className="w-4 h-4 rounded-full border border-white"
                              />
                              <span
                                style={{ backgroundColor: p.secondary }}
                                className="w-4 h-4 rounded-full border border-white"
                              />
                            </div>
                            <span className="text-xs font-semibold text-stone-800">{p.name}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-primary shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Settings */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/50 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                    Typography & Sizing
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Font Family
                      </label>
                      <select
                        value={resume.typography?.fontFamily || 'inter'}
                        onChange={e =>
                          setResume(prev => ({
                            ...prev,
                            typography: { ...prev.typography, fontFamily: e.target.value }
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      >
                        <option value="inter">Inter (Modern Clean Sans)</option>
                        <option value="dm-sans">DM Sans (Editorial Sans)</option>
                        <option value="playfair">Playfair Display (Serif)</option>
                        <option value="merriweather">Merriweather (Classic Serif)</option>
                        <option value="jetbrains-mono">JetBrains Mono (Technical)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Base Font Density
                      </label>
                      <select
                        value={resume.typography?.fontSize || 'normal'}
                        onChange={e =>
                          setResume(prev => ({
                            ...prev,
                            typography: { ...prev.typography, fontSize: e.target.value }
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white"
                      >
                        <option value="compact">Compact (High Density / Max Content)</option>
                        <option value="normal">Normal (Standard Balanced)</option>
                        <option value="spacious">Spacious (Executive / Airy)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SECTIONS & LAYOUT TAB */}
            {activeTab === 'sections' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                    Section Visibility & Order
                  </h3>
                  <span className="text-[10px] text-stone-500">Reorder with arrow buttons</span>
                </div>

                <div className="space-y-2">
                  {resume.sections?.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="p-3 bg-white rounded-xl border border-border flex items-center justify-between gap-3 text-xs"
                    >
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                        <input
                          type="checkbox"
                          checked={sec.visible !== false}
                          onChange={e => {
                            const isVis = e.target.checked;
                            setResume(prev => {
                              const nextSecs = [...prev.sections];
                              nextSecs[idx].visible = isVis;
                              return { ...prev, sections: nextSecs };
                            });
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span>{sec.title}</span>
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            setResume(prev => {
                              const nextSecs = [...prev.sections];
                              const temp = nextSecs[idx - 1];
                              nextSecs[idx - 1] = nextSecs[idx];
                              nextSecs[idx] = temp;
                              return { ...prev, sections: nextSecs };
                            });
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20"
                          title="Move Up"
                        >
                          <MoveUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === resume.sections.length - 1}
                          onClick={() => {
                            setResume(prev => {
                              const nextSecs = [...prev.sections];
                              const temp = nextSecs[idx + 1];
                              nextSecs[idx + 1] = nextSecs[idx];
                              nextSecs[idx] = temp;
                              return { ...prev, sections: nextSecs };
                            });
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20"
                          title="Move Down"
                        >
                          <MoveDown size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: LIVE A4 PREVIEW (50% on Desktop) */}
        <div
          className={`w-full lg:w-1/2 flex flex-col bg-stone-200/70 overflow-hidden ${
            mobileView === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Preview Canvas Toolbar */}
          <div className="p-3 bg-white/90 backdrop-blur-xs border-b border-stone-300 flex items-center justify-between text-xs z-10">
            <span className="font-bold text-stone-700 flex items-center gap-1.5 font-mono text-[11px]">
              <Eye size={13} className="text-primary" /> Live A4 Print Canvas
            </span>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="font-mono text-[11px] text-stone-600 min-w-[2.5rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
                className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(0.85)}
                className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10.5px] font-semibold text-stone-700"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Interactive Scaled Canvas Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
            <ResumeRenderer resume={resume} zoom={zoom} />
          </div>
        </div>
      </div>
    </div>
  );
}

