import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Code2,
  Github,
  Globe,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Share2,
  Sparkles,
  Layers,
  Folder,
  ChevronRight,
  Workflow,
  Check,
  BookOpen,
  Plus,
  Trash2,
  Link2Off,
  Pencil
} from 'lucide-react';
import { api, jsonBody } from '../lib/api.js';
import { SafeMarkdown } from '../lib/markdown.jsx';
import { EmptyState, Toast, Button } from '../components.jsx';
import { ResourceModal } from '../components/ResourceModal.jsx';
import { ResourceDetailModal } from '../components/ResourceDetailModal.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api(`/projects/${slug}`);
        setProject(data);
      } catch (err) {
        setError(err.message || 'Project not found or private');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const [showShareMenu, setShowShareMenu] = useState(false);

  // Project-Linked Resources
  const [projectResources, setProjectResources] = useState([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState(null);
  const [detailResource, setDetailResource] = useState(null);

  const loadProjectResources = async (projId) => {
    if (!projId) return;
    try {
      const res = await api(`/resources?projectId=${projId}`);
      setProjectResources(Array.isArray(res) ? res : []);
    } catch (e) {
      setProjectResources([]);
    }
  };

  useEffect(() => {
    if (project?._id) {
      loadProjectResources(project._id);
    }
  }, [project?._id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Project link copied to clipboard');
      setShowShareMenu(false);
    } catch (e) {
      showToast(window.location.href);
    }
  };

  const handleCopyRepo = async () => {
    if (!project?.githubUrl) return;
    try {
      await navigator.clipboard.writeText(project.githubUrl);
      showToast('Repository URL copied to clipboard');
      setShowShareMenu(false);
    } catch (e) {
      showToast(project.githubUrl);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.title,
          text: project?.summary,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out ${project?.title || 'this engineering project'}:`
  )}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`;

  const shareLinkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : ''
  )}`;

  const shareEmailUrl = `mailto:?subject=${encodeURIComponent(
    `Engineering Project: ${project?.title || ''}`
  )}&body=${encodeURIComponent(
    `I thought you might find this interesting:\n\n${project?.title}\n${project?.summary || ''}\n\n${
      typeof window !== 'undefined' ? window.location.href : ''
    }`
  )}`;

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-stone-500">
        Loading project specification…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <EmptyState
          title="Project Not Accessible"
          description="This repository may be in private draft status, archived, or the slug link is invalid."
        />
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition"
        >
          <ArrowLeft size={16} /> Back to Project Catalog
        </Link>
      </div>
    );
  }

  const tasks = project.tasks || [];
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : (project.progress || 0);

  return (
    <article className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-primary transition"
        >
          <ArrowLeft size={14} /> All Projects
        </Link>

        <div className="relative">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50 transition"
              title="Share project specification"
            >
              <Share2 size={13} /> Share Spec
            </button>
            <button
              type="button"
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="inline-flex items-center px-2 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50 transition"
              aria-label="More share options"
            >
              ▾
            </button>
          </div>

          {showShareMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-20 text-xs">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full text-left px-3.5 py-1.5 text-stone-700 hover:bg-stone-100 flex items-center justify-between"
              >
                <span>Copy Project URL</span>
                <Check size={12} className="text-stone-400" />
              </button>

              {project.githubUrl && (
                <button
                  type="button"
                  onClick={handleCopyRepo}
                  className="w-full text-left px-3.5 py-1.5 text-stone-700 hover:bg-stone-100 flex items-center justify-between"
                >
                  <span>Copy Repo URL</span>
                  <Github size={12} className="text-stone-400" />
                </button>
              )}

              <div className="my-1 border-t border-stone-100" />

              <a
                href={shareTwitterUrl}
                target="_blank"
                rel="noreferrer"
                className="block px-3.5 py-1.5 text-stone-700 hover:bg-stone-100"
              >
                Share on X / Twitter
              </a>

              <a
                href={shareLinkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="block px-3.5 py-1.5 text-stone-700 hover:bg-stone-100"
              >
                Share on LinkedIn
              </a>

              <a
                href={shareEmailUrl}
                className="block px-3.5 py-1.5 text-stone-700 hover:bg-stone-100"
              >
                Share via Email
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-secondary-background text-primary border border-border">
            {project.domain || 'Software Engineering'}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-secondary-background text-text-secondary border border-border">
            {project.status || 'Active'}
          </span>
          {project.featured && (
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary text-[var(--primary-text,#ffffff)]">
              <Sparkles size={11} /> Featured
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-ink leading-tight">
            {project.title}
          </h1>
          {project.summary && (
            <p className="text-base sm:text-lg text-muted mt-3 leading-relaxed">
              {project.summary}
            </p>
          )}
        </div>

        {/* Cover image if available */}
        {project.coverImage && (
          <div className="rounded-xl overflow-hidden border border-stone-200 aspect-video max-h-96 w-full">
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
            <span>Engineering Progress ({completedTasks}/{tasks.length || 1} milestones)</span>
            <span className="font-mono text-amber-800">{taskProgress}%</span>
          </div>
          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-800 rounded-full transition-all duration-500"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons: GitHub, Demo, Documentation */}
        <div className="flex flex-wrap gap-3 pt-3 border-t border-stone-100">
          {project.githubUrl && (
            <Button
              as="a"
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              variant="primary"
              size="sm"
            >
              <Github size={15} /> Source Code <ExternalLink size={12} />
            </Button>
          )}
          {project.liveUrl && (
            <Button
              as="a"
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              size="sm"
            >
              <Globe size={15} /> Live Deployment <ExternalLink size={12} />
            </Button>
          )}
          {project.links &&
            project.links.map((link, idx) => (
              <Button
                key={idx}
                as="a"
                href={link.url}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                size="sm"
              >
                {link.label || 'Resource'} <ExternalLink size={12} />
              </Button>
            ))}
        </div>
      </div>

      {/* Main 2-Col Body: Description / SafeMarkdown (left) & Metadata / Tasks (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Markdown Specs */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold font-display text-ink pb-2 border-b border-border">
              Architecture & Implementation
            </h2>
            <div className="prose-container leading-relaxed text-ink">
              <SafeMarkdown
                content={
                  project.description ||
                  `### Project Overview\n\n${project.summary}\n\n*Detailed architecture breakdown in progress.*`
                }
              />
            </div>
          </section>

          {/* Subprojects / Nested Hierarchy if present */}
          {project.children && project.children.length > 0 && (
            <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-2">
                <Layers size={17} className="text-amber-800" />
                Subprojects & Workspaces
              </h3>
              <div className="divide-y divide-stone-100">
                {project.children.map(child => (
                  <div key={child._id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder size={14} className="text-amber-700" />
                      <Link
                        to={`/projects/${child.slug || child._id}`}
                        className="font-semibold text-stone-800 hover:text-amber-800 truncate"
                      >
                        {child.title}
                      </Link>
                    </div>
                    <Link
                      to={`/projects/${child.slug || child._id}`}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Technical Resources & References */}
          <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" /> Technical Resources & Architecture References ({projectResources.length})
                </h3>
                <p className="text-xs text-muted">
                  Official documentation, tutorials, repositories, and specifications used to design and build this project.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResourceToEdit(null);
                  setResourceModalOpen(true);
                }}
                className="button-secondary text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} /> Add Resource
              </button>
            </div>

            {projectResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projectResources.map(r => (
                  <div
                    key={r._id}
                    className="p-4 rounded-xl border border-border bg-background/50 hover:border-primary transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] uppercase font-bold text-primary">{r.type}</span>
                        <span className="text-[10px] font-mono text-muted">{r.status}</span>
                      </div>
                      <h4
                        onClick={() => setDetailResource(r)}
                        className="font-bold text-sm text-ink mb-1 cursor-pointer hover:text-primary transition"
                      >
                        {r.title}
                      </h4>
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-2">
                        {r.summary || r.description || 'Reference documentation asset.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-muted">{r.provider || 'External'}</span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-muted hover:text-ink rounded"
                          title="Open URL"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api(`/resources/${r._id}/unlink`, {
                                method: 'PATCH',
                                body: jsonBody({ targetType: 'project', targetId: project._id })
                              });
                              showToast('Resource unlinked from project.');
                              loadProjectResources(project._id);
                            } catch (e) {
                              showToast(e.message || 'Unlink failed');
                            }
                          }}
                          className="p-1 text-muted hover:text-rose-600 rounded cursor-pointer"
                          title="Unlink from this project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic">No external references or documentation attached to this project yet.</p>
            )}
          </section>
        </div>

        {/* Right Column: Sidebar Specs & Tasks */}
        <div className="space-y-6">
          {/* Tech Stack */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
                Technologies & Tools
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map(tech => (
                  <span
                    key={tech}
                    className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-secondary-background text-text-secondary border border-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Task Checklist / Execution Milestones */}
          {tasks.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                <span>Milestone Tasks</span>
                <span className="font-mono text-amber-800">
                  {completedTasks}/{tasks.length}
                </span>
              </h3>
              <div className="space-y-2 pt-1">
                {tasks.map(task => (
                  <div
                    key={task._id || task.title}
                    className="flex items-start gap-2.5 text-xs text-stone-700"
                  >
                    <span className="mt-0.5 shrink-0 text-amber-800">
                      {task.completed ? (
                        <CheckCircle2 size={15} className="text-emerald-700" />
                      ) : (
                        <Circle size={15} className="text-stone-300" />
                      )}
                    </span>
                    <span
                      className={`leading-tight ${
                        task.completed ? 'line-through text-stone-400' : 'font-medium'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-xs text-stone-600 space-y-3">
            <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              Specification Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Domain</span>
                <span className="font-semibold text-stone-800">{project.domain || 'Software'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status</span>
                <span className="font-semibold text-stone-800">{project.status || 'Active'}</span>
              </div>
              {project.createdAt && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Started</span>
                  <span className="font-semibold text-stone-800">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast} />
      {/* CANONICAL RESOURCE MODAL PREFILLED WITH PROJECT */}
      <ResourceModal
        isOpen={resourceModalOpen}
        onClose={() => {
          setResourceModalOpen(false);
          setResourceToEdit(null);
        }}
        resourceToEdit={resourceToEdit}
        initialContext={{
          projectId: project?._id,
          primaryDomain: project?.primaryDomain,
          domainName: project?.domain
        }}
        onSaved={() => {
          if (project?._id) loadProjectResources(project._id);
          showToast('Resource linked to project successfully.');
        }}
      />

      <ResourceDetailModal
        isOpen={!!detailResource}
        onClose={() => setDetailResource(null)}
        resource={detailResource}
        onEdit={(r) => {
          setDetailResource(null);
          setResourceToEdit(r);
          setResourceModalOpen(true);
        }}
        onDelete={() => {}}
      />
    </article>
  );
}
