import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  Github,
  ExternalLink,
  FolderOpen,
  Sparkles,
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Code2,
  Server,
  Cpu,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from './components/Button.jsx';

export { Button };

gsap.registerPlugin(ScrollTrigger);

export function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

export function ProjectBlueprintCover({ project, featured = false }) {
  const domain = project.domain || 'Backend Systems';
  const isBackend = domain.toLowerCase().includes('backend') || domain.toLowerCase().includes('systems');
  const isAI = domain.toLowerCase().includes('ai') || domain.toLowerCase().includes('agent');
  const slug = project.slug || 'architecture-spec';
  const domainInitials = domain.split(' ').map(x => x[0]).slice(0, 2).join('');

  if (project.coverImage) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-stone-900 group/img">
        <img
          src={project.coverImage}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90">
          <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10">
            {project.domain || 'Engineering'}
          </span>
          {project.featured && (
            <span className="bg-wine/90 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20 font-bold">
              Featured
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#181311] overflow-hidden flex flex-col justify-between p-4 sm:p-5 select-none font-mono">
      {/* Blueprint Technical Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #BB9457 1px, transparent 1px)`,
          backgroundSize: '16px 16px'
        }}
      />

      {/* Diagonal Technical Watermark Grid */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-200 fill-none">
          <circle cx="50" cy="50" r="45" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx="50" cy="50" r="30" strokeWidth="1" />
          <line x1="5" y1="50" x2="95" y2="50" strokeWidth="0.8" />
          <line x1="50" y1="5" x2="50" y2="95" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Top Window Bar */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E06C75]/80 shadow-xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5C07B]/80 shadow-xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#98C379]/80 shadow-xs" />
          <span className="ml-2 text-stone-400 truncate max-w-[140px] sm:max-w-[200px]">
            spec://{slug}.arch.v2
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] uppercase tracking-wider text-emerald-400/90 font-semibold">99.98% SLA</span>
        </div>
      </div>

      {/* Center Architecture Topology Canvas */}
      <div className="relative z-10 my-auto py-3 flex flex-col items-center justify-center">
        {/* Visual Diagram */}
        <div className="w-full max-w-[280px] sm:max-w-[340px] flex items-center justify-between gap-1 text-[9px] text-stone-300">
          {/* Node 1: Ingress Gateway */}
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs min-w-[70px] text-center shadow-xs">
            <Server size={14} className="text-amber-300" />
            <span className="font-bold text-white text-[10px]">Ingress</span>
            <span className="text-stone-400 text-[8px]">&lt;12ms API</span>
          </div>

          {/* Connection Line */}
          <div className="flex-1 flex items-center justify-center relative px-1">
            <div className="w-full h-[1.5px] bg-gradient-to-r from-amber-400/40 via-red-500/60 to-emerald-400/40" />
            <span className="absolute w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-60" />
          </div>

          {/* Node 2: Core Processing Engine */}
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-wine/25 border border-wine/50 backdrop-blur-xs min-w-[85px] text-center shadow-xs">
            <Cpu size={14} className="text-amber-200" />
            <span className="font-bold text-amber-100 text-[10px]">{isAI ? 'Agent Core' : 'Pipeline'}</span>
            <span className="text-amber-300/80 text-[8px]">Worker Node</span>
          </div>

          {/* Connection Line */}
          <div className="flex-1 flex items-center justify-center relative px-1">
            <div className="w-full h-[1.5px] bg-gradient-to-r from-red-500/60 to-emerald-400/40" />
          </div>

          {/* Node 3: Storage / State */}
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs min-w-[70px] text-center shadow-xs">
            <Layers size={14} className="text-emerald-400" />
            <span className="font-bold text-white text-[10px]">State/DB</span>
            <span className="text-stone-400 text-[8px]">Idempotent</span>
          </div>
        </div>

        {/* Central System Emblem */}
        <div className="mt-3.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-[9px] text-amber-200/90 shadow-xs">
          <span className="font-bold tracking-widest uppercase">
            [ {domainInitials || 'EH'} // ARCH-SPEC ]
          </span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-300">{project.technologies?.[0] || 'Clean Architecture'}</span>
        </div>
      </div>

      {/* Bottom Status Footprint Bar */}
      <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-white/10 text-[9px] text-stone-400">
        <span className="truncate max-w-[180px]">
          {project.domain || 'Software Engineering'}
        </span>
        <span className="text-amber-300 font-semibold uppercase tracking-wider">
          Verified Blueprint
        </span>
      </div>
    </div>
  );
}

export function ProjectCard({
  project,
  featuredHero = false,
  admin = false,
  onEdit,
  onArchive,
  onRestore,
  onDelete
}) {
  const isFeatured = featuredHero || project.featured;
  const domainLabel = project.domain || project.parentId?.title || 'Backend Systems';

  return (
    <article className={`project-card group flex flex-col justify-between bg-surface border rounded-2xl overflow-hidden shadow-xs hover:shadow-card hover:-translate-y-1 transition-all duration-300 ${
      isFeatured ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border hover:border-gold'
    }`}>
      <div className="flex flex-col">
        {/* Cover / Blueprint Media Container (Consistent 16:10 Ratio) */}
        <div className="aspect-[16/10] w-full overflow-hidden border-b border-border/70 relative bg-stone-900">
          <ProjectBlueprintCover project={project} featured={isFeatured} />
        </div>

        {/* Card Content Body */}
        <div className="p-5 sm:p-6 flex flex-col">
          {/* Header Metadata: Domain & Status */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 truncate">
              {domainLabel}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {isFeatured && (
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold/15 text-primary border border-gold/30">
                  Featured
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {project.status || 'Active'}
              </span>
            </div>
          </div>

          {/* Project Title */}
          <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-ink group-hover:text-primary transition line-clamp-1 mt-0.5">
            <Link to={`/projects/${project.slug}`}>
              {project.title}
            </Link>
          </h3>

          {/* Problem Statement / Summary */}
          <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-muted min-h-[2.6rem]">
            {project.summary || project.description || 'A practical engineering architecture documenting design decisions and verifiable implementation.'}
          </p>

          {/* Technology Badges (3-4 items) */}
          <div className="mt-4 flex flex-wrap gap-1.5 min-h-[1.75rem]">
            {(project.technologies || []).slice(0, 4).map(t => (
              <span className="tech-chip text-[10.5px] font-mono" key={t}>
                {t}
              </span>
            ))}
            {(project.technologies || []).length > 4 && (
              <span className="text-[10px] font-mono text-stone-400 self-center">
                +{(project.technologies || []).length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer: Primary Action + Secondary Links */}
      <div className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6 flex items-center justify-between border-t border-border/70 text-xs mt-auto bg-surface/50">
        <Link
          to={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold shadow-xs hover:brightness-110 active:scale-95 transition"
        >
          <span>View Case Study</span>
          <ArrowUpRight size={13} />
        </Link>

        <div className="flex items-center gap-2.5">
          {project.githubUrl && (
            <a
              className="text-stone-600 hover:text-primary p-1.5 rounded-lg border border-border/80 hover:border-gold bg-surface transition"
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              title="View source repository"
              aria-label={`View source code for ${project.title}`}
            >
              <Github size={14} />
            </a>
          )}
          {project.liveUrl && (
            <a
              className="text-stone-600 hover:text-primary p-1.5 rounded-lg border border-border/80 hover:border-gold bg-surface transition"
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              title="View live deployment"
              aria-label={`View live demo for ${project.title}`}
            >
              <ExternalLink size={14} />
            </a>
          )}

          {admin && (
            <div className="flex gap-2 ml-2 pl-2 border-l border-border">
              {onEdit && (
                <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => onEdit(project)}>
                  Edit
                </button>
              )}
              {onArchive && !project.isArchived && (
                <button type="button" className="text-xs font-semibold text-amber-700 hover:underline" onClick={() => onArchive(project)}>
                  Archive
                </button>
              )}
              {onRestore && project.isArchived && (
                <button type="button" className="text-xs font-semibold text-emerald-700 hover:underline" onClick={() => onRestore(project)}>
                  Restore
                </button>
              )}
              {onDelete && (
                <button type="button" className="text-xs font-semibold text-red-600 hover:underline" onClick={() => onDelete(project)}>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function EmptyState({ title = 'Nothing here yet', description = 'Add your first item from the workspace.' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FolderOpen size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-title mt-1.5">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Modal({ title, onClose, open, isOpen, maxWidth, children }) {
  if (open === false || isOpen === false) return null;

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal-card ${maxWidth || ''}`.trim()}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">WORKSPACE MODAL</p>
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={19} />
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, open, title, message, confirmText = 'Confirm', confirmLabel, danger = false, onConfirm, onCancel, onClose, children }) {
  const show = isOpen !== undefined ? isOpen : (open !== undefined ? open : true);
  if (!show) return null;
  const btnLabel = confirmLabel || confirmText;
  const handleCancel = onCancel || onClose || (() => {});

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && handleCancel()}>
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${danger ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-base font-bold font-display text-ink">{title}</h3>
          </div>
          {message && <p className="mt-3 text-xs leading-relaxed text-muted">{message}</p>}
          {children && <div className="mt-3">{children}</div>}
          <div className="mt-6 flex justify-end gap-2.5 border-t border-border pt-4">
            <Button variant="secondary" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant={danger ? 'destructive' : 'primary'} size="sm" onClick={onConfirm}>
              {btnLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Toast({ message }) {
  return message ? (
    <div className="toast" role="status" aria-live="polite">
      <Check size={16} className="text-emerald-400 shrink-0" />
      <span>{message}</span>
    </div>
  ) : null;
}
