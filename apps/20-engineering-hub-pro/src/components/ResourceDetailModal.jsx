import React from 'react';
import {
  ExternalLink,
  Download,
  Star,
  Layers,
  Sparkles,
  Code2,
  Workflow,
  Clock,
  Pencil,
  Trash2,
  Tag,
  CheckCircle2,
  FileText,
  Calendar,
  User,
  Compass,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../components.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function ResourceDetailModal({
  isOpen,
  onClose,
  resource,
  onEdit,
  onDelete,
  onToggleFavorite,
  onStatusChange,
  onUnlink
}) {
  const { canEdit } = useAuth();
  if (!isOpen || !resource) return null;

  const metadata = resource.metadata || {};

  return (
    <Modal
      title={resource.title}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Header Information & Key Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-primary/10 text-primary">
                {resource.type || 'Documentation'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                resource.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : resource.status === 'Learning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-secondary-background text-muted'
              }`}>
                {resource.status}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                resource.priority === 'High'
                  ? 'bg-rose-100 text-rose-800'
                  : resource.priority === 'Low'
                    ? 'bg-stone-100 text-stone-600'
                    : 'bg-amber-50 text-amber-800'
              }`}>
                {resource.priority} Priority
              </span>
              <span className="text-xs font-mono text-muted">
                {resource.difficulty}
              </span>
            </div>

            <h2 className="text-xl font-bold font-display text-ink leading-snug">
              {resource.title}
            </h2>

            {resource.summary && (
              <p className="text-xs text-muted leading-relaxed font-medium">
                {resource.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted pt-1">
              {resource.provider && (
                <span className="flex items-center gap-1">
                  <Compass size={13} className="text-primary" /> {resource.provider}
                </span>
              )}
              {resource.author && (
                <span className="flex items-center gap-1">
                  <User size={13} className="text-primary" /> {resource.author}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={13} /> Added {new Date(resource.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Quick Action Top Buttons */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary text-xs inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              Open External Resource <ExternalLink size={13} />
            </a>

            {resource.attachmentUrl && (
              <a
                href={resource.attachmentUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary text-xs inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download size={13} /> Download File
              </a>
            )}

            <button
              type="button"
              onClick={() => onToggleFavorite && onToggleFavorite(resource)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                resource.isFavorite
                  ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
                  : 'border-border bg-surface text-muted hover:text-ink'
              }`}
            >
              <Star size={13} className={resource.isFavorite ? 'fill-amber-500 text-amber-500' : ''} />
              {resource.isFavorite ? 'Favorited' : 'Bookmark'}
            </button>
          </div>
        </div>

        {/* Technical Description */}
        {resource.description && (
          <div className="p-4 rounded-xl border border-border bg-surface/50 space-y-1.5">
            <h4 className="text-xs font-bold font-mono uppercase text-muted">Technical Scope & Overview</h4>
            <p className="text-xs text-ink leading-relaxed whitespace-pre-line">
              {resource.description}
            </p>
          </div>
        )}

        {/* Learning Workflow & Intended Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resource.intendedOutcome && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5">
              <h4 className="text-xs font-bold font-mono uppercase text-primary flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Intended Learning Outcome
              </h4>
              <p className="text-xs text-ink leading-relaxed">
                {resource.intendedOutcome}
              </p>
            </div>
          )}

          {resource.notes && (
            <div className="p-4 rounded-xl border border-border bg-surface space-y-1.5">
              <h4 className="text-xs font-bold font-mono uppercase text-ink flex items-center gap-1.5">
                <FileText size={14} className="text-primary" /> Personal Notes & Synthesis
              </h4>
              <p className="text-xs text-ink leading-relaxed font-mono whitespace-pre-line">
                {resource.notes}
              </p>
            </div>
          )}
        </div>

        {/* Type-Specific Structured Metadata */}
        {Object.keys(metadata).length > 0 && (
          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
            <h4 className="text-xs font-bold font-mono uppercase text-muted">Type-Specific Metadata</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {Object.entries(metadata).map(([key, val]) => val ? (
                <div key={key}>
                  <span className="text-[10px] font-mono text-muted uppercase block">{key}</span>
                  <span className="font-bold text-ink truncate block">{String(val)}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* Cross-Section Relationships */}
        <div className="space-y-4 pt-2 border-t border-border">
          <h3 className="text-xs font-bold font-mono uppercase text-ink">Connected Architecture Relationships</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Domain & Field */}
            <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-muted flex items-center gap-1">
                <Layers size={12} className="text-primary" /> Primary Domain & Subdomain
              </span>
              <div className="text-xs font-bold text-ink">
                {resource.domainName || resource.primaryDomain?.name || 'Unassigned Domain'}
                {resource.subdomain && (
                  <span className="text-primary font-normal ml-1">/ {resource.subdomain}</span>
                )}
              </div>
            </div>

            {/* Linked Skills */}
            <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-muted flex items-center gap-1">
                  <Sparkles size={12} className="text-primary" /> Linked Skills ({resource.relatedSkills?.length || 0})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(resource.relatedSkills || []).length > 0 ? (
                  resource.relatedSkills.map(s => (
                    <span
                      key={s._id || s}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-secondary-background text-ink border border-border flex items-center gap-1"
                    >
                      <span>{s.name || s}</span>
                      {onUnlink && (
                        <button
                          type="button"
                          onClick={() => onUnlink(resource._id, 'skill', s._id || s)}
                          className="text-muted hover:text-rose-600 ml-1"
                          title="Unlink skill from this resource"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted italic">No linked skills</span>
                )}
              </div>
            </div>

            {/* Linked Projects */}
            <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-muted flex items-center gap-1">
                <Code2 size={12} className="text-primary" /> Linked Projects ({resource.relatedProjects?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(resource.relatedProjects || []).length > 0 ? (
                  resource.relatedProjects.map(p => (
                    <span
                      key={p._id || p}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-secondary-background text-ink border border-border flex items-center gap-1"
                    >
                      <span>{p.title || p}</span>
                      {onUnlink && (
                        <button
                          type="button"
                          onClick={() => onUnlink(resource._id, 'project', p._id || p)}
                          className="text-muted hover:text-rose-600 ml-1"
                          title="Unlink project"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted italic">No linked projects</span>
                )}
              </div>
            </div>

            {/* Linked Roadmaps */}
            <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-muted flex items-center gap-1">
                <Workflow size={12} className="text-primary" /> Linked Roadmaps ({resource.relatedRoadmaps?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(resource.relatedRoadmaps || []).length > 0 ? (
                  resource.relatedRoadmaps.map(r => (
                    <span
                      key={r._id || r}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-secondary-background text-ink border border-border flex items-center gap-1"
                    >
                      <span>{r.title || r}</span>
                      {onUnlink && (
                        <button
                          type="button"
                          onClick={() => onUnlink(resource._id, 'roadmap', r._id || r)}
                          className="text-muted hover:text-rose-600 ml-1"
                          title="Unlink roadmap"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted italic">No linked roadmaps</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[10px] font-mono text-muted uppercase mr-1">Tags:</span>
            {resource.tags.map(t => (
              <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-secondary-background text-muted">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(resource)}
                  className="button-primary text-xs inline-flex items-center gap-1.5"
                >
                  <Pencil size={13} /> Edit Resource
                </button>
                <button
                  type="button"
                  onClick={() => onDelete && onDelete(resource)}
                  className="button-ghost text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1.5"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="button-secondary text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
