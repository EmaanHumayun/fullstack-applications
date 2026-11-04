import React, { useState, useRef } from 'react';
import {
  Paperclip,
  Upload,
  Download,
  Trash2,
  FileCode,
  FileText,
  FileArchive,
  Image,
  Eye,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function getFileIcon(ext = '') {
  const clean = ext.toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(clean)) {
    return <Image size={15} className="text-blue-600" />;
  }
  if (clean === '.pdf') {
    return <FileText size={15} className="text-rose-600" />;
  }
  if (clean === '.zip') {
    return <FileArchive size={15} className="text-amber-600" />;
  }
  if (['.json', '.yaml', '.yml', '.xml', '.log', '.sh', '.py', '.js', '.jsx', '.ts', '.tsx', '.sql', '.html', '.css'].includes(clean)) {
    return <FileCode size={15} className="text-emerald-600" />;
  }
  return <Paperclip size={15} className="text-muted" />;
}

function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function AttachmentManager({
  attachments = [],
  onUploadFile,
  onDeleteFile,
  canEdit = true
}) {
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onUploadFile(file);
    } catch (err) {
      alert(err.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handlePreview(att) {
    setPreviewFile(att);
    const ext = att.fileExtension?.toLowerCase() || '';
    const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext);

    if (isImage) {
      setPreviewContent('');
      return;
    }

    const isTextCode = ['.txt', '.json', '.yaml', '.yml', '.xml', '.log', '.sh', '.py', '.js', '.jsx', '.ts', '.tsx', '.sql', '.html', '.css', '.md', '.markdown'].includes(ext);
    if (isTextCode) {
      setLoadingPreview(true);
      try {
        const res = await fetch(att.fileUrl);
        const text = await res.text();
        setPreviewContent(text);
      } catch (e) {
        setPreviewContent('Failed to load text preview.');
      } finally {
        setLoadingPreview(false);
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Header */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-text flex items-center gap-1.5">
            <Paperclip size={14} className="text-primary" />
            File Attachments & Deliverables ({attachments.length})
          </h4>
          <span className="text-[11px] text-muted">
            PDFs, configuration manifests, scripts, logs, ZIP archives, and screenshots.
          </span>
        </div>

        {canEdit && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept=".md,.markdown,.pdf,.docx,.txt,.json,.yaml,.yml,.sh,.py,.js,.jsx,.ts,.tsx,.html,.css,.sql,.xml,.log,.zip,image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-background border border-border hover:bg-hover text-xs font-bold text-text flex items-center gap-1.5 shadow-2xs transition disabled:opacity-50"
            >
              <Upload size={13} />
              <span>{uploading ? 'Uploading…' : '+ Attach File'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attachments.map(att => {
            const ext = att.fileExtension?.toLowerCase() || '';
            const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext);
            const isText = ['.txt', '.json', '.yaml', '.yml', '.xml', '.log', '.sh', '.py', '.js', '.jsx', '.ts', '.tsx', '.sql', '.html', '.css', '.md'].includes(ext);

            return (
              <div
                key={att.id}
                className="p-3.5 rounded-xl border border-border bg-surface shadow-2xs hover:border-primary/40 transition flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <span className="p-2 rounded-lg bg-background border border-border shrink-0">
                    {getFileIcon(att.fileExtension)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <strong className="text-xs font-bold text-text block truncate" title={att.originalFilename}>
                      {att.originalFilename}
                    </strong>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted mt-0.5">
                      <span>{formatBytes(att.sizeBytes)}</span>
                      <span>·</span>
                      <span>{new Date(att.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {(isImage || isText) ? (
                      <button
                        type="button"
                        onClick={() => handlePreview(att)}
                        className="px-2 py-1 rounded-lg border border-border bg-background hover:bg-hover text-[11px] font-medium text-text flex items-center gap-1 transition"
                      >
                        <Eye size={12} /> Preview
                      </button>
                    ) : (
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg border border-border bg-background hover:bg-hover text-[11px] font-medium text-primary flex items-center gap-1 transition"
                      >
                        <ExternalLink size={12} /> Open
                      </a>
                    )}

                    <a
                      href={att.fileUrl}
                      download={att.originalFilename}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-lg border border-border bg-background hover:bg-hover text-muted hover:text-text transition"
                      title="Download File"
                    >
                      <Download size={13} />
                    </a>
                  </div>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete attachment "${att.originalFilename}"?`)) {
                          onDeleteFile(att.id);
                        }
                      }}
                      className="p-1 rounded-lg text-muted hover:text-rose-600 transition"
                      title="Delete attachment"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center bg-background/50 border border-dashed border-border rounded-xl">
          <Paperclip size={24} className="mx-auto text-muted/60 mb-2" />
          <span className="text-xs text-muted block">No external attachments or deliverables uploaded.</span>
        </div>
      )}

      {/* Preview Modal for Images & Text/Code */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-3xl bg-surface border border-border rounded-2xl shadow-card p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 truncate">
                {getFileIcon(previewFile.fileExtension)}
                <span className="text-sm font-bold text-text truncate">{previewFile.originalFilename}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.fileUrl}
                  download={previewFile.originalFilename}
                  className="p-1.5 rounded-lg border border-border text-muted hover:text-text transition"
                  title="Download File"
                >
                  <Download size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-lg text-muted hover:text-text transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1">
              {['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(previewFile.fileExtension?.toLowerCase()) ? (
                <div className="text-center">
                  <img
                    src={previewFile.fileUrl}
                    alt={previewFile.originalFilename}
                    className="max-h-[60vh] mx-auto rounded-xl object-contain border border-border"
                  />
                </div>
              ) : loadingPreview ? (
                <div className="p-8 text-center text-xs font-mono text-muted">Loading content preview…</div>
              ) : (
                <pre className="p-4 rounded-xl bg-background border border-border font-mono text-xs text-text overflow-x-auto leading-relaxed">
                  <code>{previewContent}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
