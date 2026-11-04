import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Save,
  X,
  Maximize2,
  Minimize2,
  Columns,
  Eye,
  Code,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Quote,
  Minus,
  Sparkles,
  FileCode,
  Check,
  AlertCircle
} from 'lucide-react';
import { SafeMarkdown } from '../lib/markdown.jsx';

export const LAB_TEMPLATES = [
  {
    type: 'Lab README',
    filename: 'README.md',
    title: 'Lab Overview & Architecture',
    content: `# Lab Overview & Architecture

## Objective
Provide a concise statement of what technical capability this hands-on lab explores.

## Topology & Blueprint
\`\`\`
[ Client / Developer ] ---> [ Ingress / Load Balancer ] ---> [ Service / Pods ]
                                                                   |
                                                                   v
                                                            [ Persistent Volume ]
\`\`\`

## Key Takeaways
- Practical understanding of core configuration patterns.
- Automated verification using health checks and assertions.
`
  },
  {
    type: 'Lab Instructions',
    filename: 'lab-instructions.md',
    title: 'Step-by-Step Lab Instructions',
    content: `# Step-by-Step Lab Instructions

## Prerequisites
- [ ] Ensure local CLI tools are installed (\`kubectl\`, \`docker\`, \`aws-cli\`).
- [ ] Confirm access to target test cluster / namespace.

## Phase 1: Environment Setup
1. Clone the target configuration repository.
2. Initialize environment variables.

\`\`\`bash
export LAB_ENV=sandbox
export NAMESPACE=engineering-lab
\`\`\`

## Phase 2: Implementation Steps
1. Apply the manifest or run provisioning scripts.
2. Verify service status and inspect logs.

## Phase 3: Validation & Assertions
- [ ] Service responds with HTTP 200 on health endpoint.
- [ ] Metrics endpoint scraped successfully.
`
  },
  {
    type: 'Command Reference',
    filename: 'commands.md',
    title: 'Commands & Cheatsheet',
    content: `# Essential Commands & Cheatsheet

| Command | Purpose | Expected Output |
| :--- | :--- | :--- |
| \`systemctl status nginx\` | Verify daemon status | Active (running) |
| \`kubectl get pods -A\` | Inspect cluster state | All pods Running |
| \`docker compose up -d\` | Run service stack | Started in background |

## Useful One-Liners
\`\`\`bash
# Tail logs with timestamp
docker logs -f --tail 50 my-container

# Inspect container network bindings
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-container
\`\`\`
`
  },
  {
    type: 'Troubleshooting Log',
    filename: 'troubleshooting.md',
    title: 'Troubleshooting & Incident Notes',
    content: `# Troubleshooting & Diagnostics Log

## Incident / Blocker Description
*Document unexpected failure, error code, or performance bottleneck encountered.*

### Symptoms & Error Output
\`\`\`log
Error: dial tcp 127.0.0.1:5432: connect: connection refused
\`\`\`

### Root Cause Analysis (RCA)
- Checked container health: container exited with code 1.
- Inspected volume permissions: UID mismatch on data directory.

### Remediation Applied
\`\`\`bash
chown -R 999:999 /var/lib/postgresql/data
\`\`\`

### Verification
Service recovered; connection verified via \`pg_isready\`.
`
  },
  {
    type: 'Lab Report',
    filename: 'lab-report.md',
    title: 'Comprehensive Lab Report',
    content: `# Engineering Lab Report

## Executive Summary
Brief summary of exercises executed, hypotheses tested, and practical results.

## Execution Timeline
- **Start Time:** 
- **Duration:** 
- **Environment:** 

## Test Results & Metrics
| Metric | Baseline | Target | Achieved |
| :--- | :--- | :--- | :--- |
| Response Latency | 120ms | < 50ms | 38ms |
| Memory Utilization | 512MB | < 700MB | 480MB |

## Conclusion
Key learnings and considerations for production deployment.
`
  },
  {
    type: 'Learning Reflection',
    filename: 'reflection.md',
    title: 'Learning Reflection & Synthesis',
    content: `# Learning Reflection & Synthesis

## What went well?
- Successfully provisioned high-availability architecture on first attempt.

## What was challenging?
- Configuring mutual TLS between internal service components.

## How does this apply to real-world engineering?
- Directly relevant to hardening cloud-native services before production rollout.
`
  }
];

export const ASSIGNMENT_TEMPLATES = [
  {
    type: 'Assignment README',
    filename: 'README.md',
    title: 'Assignment Overview',
    content: `# Assignment Overview

## Title
Brief description of the assignment challenge and expected engineering deliverable.

## Problem Statement
Detailed breakdown of the requirements, constraints, and business context.

## Deliverables Checklist
- [ ] Source Code repository with clean commit history.
- [ ] Automated unit and integration test suite.
- [ ] Deployment manifest or container configuration.
- [ ] Documentation report.
`
  },
  {
    type: 'Assignment Brief',
    filename: 'assignment-brief.md',
    title: 'Assignment Brief & Scope',
    content: `# Assignment Brief & Scope

## Target Scope
Define boundary conditions, scope, and technical acceptance criteria.

## Requirements
1. **Architecture:** Decoupled components with clear interface definitions.
2. **Reliability:** Graceful error handling and retry mechanisms.
3. **Observability:** Structured JSON logging and health endpoints.
`
  },
  {
    type: 'Requirements Document',
    filename: 'requirements.md',
    title: 'System Requirements Specification',
    content: `# System Requirements Specification

## Functional Requirements
- **FR-1:** System must ingest incoming telemetry payloads.
- **FR-2:** System must validate schema and reject malformed records with HTTP 400.

## Non-Functional Requirements
- **NFR-1 (Performance):** Process 1,000 events/second under 100ms.
- **NFR-2 (Security):** All external endpoints require JWT bearer authentication.
`
  },
  {
    type: 'Implementation Notes',
    filename: 'implementation-notes.md',
    title: 'Implementation Notes & Decisions',
    content: `# Implementation Notes & Architectural Decisions

## Key Trade-Offs
- Selected PostgreSQL over MongoDB for strict transactional guarantees.
- Implemented connection pooling with \`pg-pool\` to prevent exhaustion.

## Code Structure
\`\`\`
src/
├── controllers/    # Request handlers & validation
├── services/       # Core business logic
├── models/         # Database schemas
└── tests/          # Automated test suites
\`\`\`
`
  },
  {
    type: 'Submission Report',
    filename: 'submission-report.md',
    title: 'Deliverable Submission Report',
    content: `# Assignment Submission Report

## Submission Metadata
- **Candidate:** 
- **Submission Date:** 
- **Repository URL:** 
- **Live Demo URL:** 

## Deliverables Summary
1. Core service implementation.
2. Dockerfile and docker-compose orchestration.
3. CI/CD GitHub Actions pipeline.

## Verification & Test Results
\`\`\`bash
# Test execution summary
PASS tests/api.test.js
  ✓ Health check endpoint returns 200 (12ms)
  ✓ Payload validation rejects missing fields (8ms)
  ✓ End-to-end processing pipeline succeeds (45ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
\`\`\`
`
  }
];

export function MarkdownDocumentEditor({
  documents = [],
  onSaveDocument,
  onDeleteDocument,
  contextType = 'lab', // 'lab' or 'assignment'
  canEdit = true
}) {
  const [activeDocId, setActiveDocId] = useState(documents[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorMode, setEditorMode] = useState('split'); // 'split', 'source', 'preview'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Form state for current document being edited
  const [docTitle, setDocTitle] = useState('');
  const [docFilename, setDocFilename] = useState('');
  const [docContent, setDocContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0] || null;
  const templates = contextType === 'assignment' ? ASSIGNMENT_TEMPLATES : LAB_TEMPLATES;

  useEffect(() => {
    if (activeDoc) {
      setDocTitle(activeDoc.title);
      setDocFilename(activeDoc.filename);
      setDocContent(activeDoc.content || '');
      setHasUnsavedChanges(false);
    } else {
      setDocTitle('');
      setDocFilename('');
      setDocContent('');
      setHasUnsavedChanges(false);
    }
  }, [activeDocId, activeDoc]);

  // Insert syntax into textarea at current cursor position
  function insertSyntax(prefix, suffix = '', placeholder = '') {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end) || placeholder;
    const replacement = `${prefix}${selected}${suffix}`;
    const nextContent = text.substring(0, start) + replacement + text.substring(end);

    setDocContent(nextContent);
    setHasUnsavedChanges(true);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  }

  // Handle Save
  async function handleSave() {
    if (!canEdit) return;
    if (!docFilename.trim()) {
      alert('Please provide a filename (e.g. README.md)');
      return;
    }
    let safeName = docFilename.trim();
    if (!safeName.endsWith('.md') && !safeName.endsWith('.markdown')) {
      safeName += '.md';
    }

    try {
      await onSaveDocument({
        id: activeDoc?.id,
        title: (docTitle || safeName.replace(/\.md$/, '')).trim(),
        filename: safeName,
        content: docContent,
        templateType: activeDoc?.templateType || 'Custom'
      });
      setHasUnsavedChanges(false);
      setFeedbackMsg('Document saved!');
      setTimeout(() => setFeedbackMsg(''), 2500);
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to save markdown document');
    }
  }

  // Handle Delete
  async function handleDelete(doc) {
    if (!canEdit) return;
    if (!window.confirm(`Are you sure you want to delete "${doc.filename}"?`)) return;
    try {
      await onDeleteDocument(doc.id);
      if (activeDocId === doc.id) {
        const remaining = documents.filter(d => d.id !== doc.id);
        setActiveDocId(remaining[0]?.id || null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    }
  }

  // Handle Create from Template
  function handleCreateFromTemplate(tmpl) {
    setShowTemplateModal(false);
    onSaveDocument({
      title: tmpl.title,
      filename: tmpl.filename,
      content: tmpl.content,
      templateType: tmpl.type
    }).then(newDoc => {
      if (newDoc?.id) setActiveDocId(newDoc.id);
      setIsEditing(true);
    });
  }

  // Handle Blank Creation
  function handleCreateBlank() {
    setShowTemplateModal(false);
    const newDocName = `doc-${documents.length + 1}.md`;
    onSaveDocument({
      title: `Document ${documents.length + 1}`,
      filename: newDocName,
      content: `# New Document\n\nWrite your documentation here...`,
      templateType: 'Blank'
    }).then(newDoc => {
      if (newDoc?.id) setActiveDocId(newDoc.id);
      setIsEditing(true);
    });
  }

  // Handle Upload of .md file
  function handleUploadMd(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      alert('Please select a valid Markdown (.md or .markdown) file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async event => {
      const text = event.target?.result || '';
      try {
        const newDoc = await onSaveDocument({
          title: file.name.replace(/\.(md|markdown)$/i, ''),
          filename: file.name,
          content: text,
          templateType: 'Uploaded File'
        });
        if (newDoc?.id) setActiveDocId(newDoc.id);
        setIsEditing(false);
      } catch (err) {
        alert(err.message || 'Failed to upload markdown file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // Handle Download of current .md file
  function handleDownload(doc) {
    if (!doc) return;
    const blob = new Blob([doc.content || ''], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.filename || 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-surface p-6 overflow-y-auto' : ''}`}>
      {/* Top Header / Document Tabs Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border">
        {/* Document Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {documents.map(doc => {
            const isSelected = (activeDoc?.id === doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (!window.confirm('You have unsaved changes in the current document. Discard them?')) return;
                  }
                  setActiveDocId(doc.id);
                  setIsEditing(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer border ${
                  isSelected
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-2xs font-bold'
                    : 'bg-background text-muted hover:text-text border-border hover:bg-hover'
                }`}
              >
                <FileText size={13} className="shrink-0" />
                <span className="truncate max-w-[140px]">{doc.filename}</span>
                {canEdit && isSelected && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(doc);
                    }}
                    className="opacity-50 hover:opacity-100 hover:text-rose-600 transition p-0.5"
                    title="Delete document"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}

          {documents.length === 0 && (
            <span className="text-xs text-muted italic">No Markdown files created yet.</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadMd}
            accept=".md,.markdown"
            className="hidden"
          />

          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-background hover:bg-hover text-xs font-medium text-text flex items-center gap-1.5 transition"
                title="Upload .md file from computer"
              >
                <Upload size={13} />
                <span>Upload .md</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-primary text-primary-text hover:brightness-105 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                title="Create new markdown document"
              >
                <Plus size={13} />
                <span>+ New File</span>
              </button>
            </>
          )}

          {activeDoc && (
            <button
              type="button"
              onClick={() => handleDownload(activeDoc)}
              className="p-1.5 rounded-xl border border-border bg-background hover:bg-hover text-muted hover:text-text transition"
              title="Download original .md file"
            >
              <Download size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-border bg-background hover:bg-hover text-muted hover:text-text transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Document Workspace */}
      {activeDoc ? (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs">
          {/* Document Header Bar */}
          <div className="px-4 py-3 bg-background/70 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <FileCode size={16} />
              </span>
              {isEditing ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={docFilename}
                    onChange={e => {
                      setDocFilename(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="filename.md"
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-surface border border-border rounded-lg text-text outline-none focus:ring-1 focus:ring-primary w-48"
                  />
                  <input
                    type="text"
                    value={docTitle}
                    onChange={e => {
                      setDocTitle(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Document Title"
                    className="px-2.5 py-1 text-xs font-medium bg-surface border border-border rounded-lg text-text outline-none focus:ring-1 focus:ring-primary flex-1"
                  />
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-bold text-text truncate">{activeDoc.title}</h4>
                  <span className="text-[10px] font-mono text-muted">
                    {activeDoc.filename} · Template: {activeDoc.templateType || 'Custom'}
                  </span>
                </div>
              )}
            </div>

            {/* Mode / Save Controls */}
            <div className="flex items-center gap-2">
              {feedbackMsg && (
                <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1">
                  <Check size={12} /> {feedbackMsg}
                </span>
              )}

              {isEditing ? (
                <>
                  {/* Editor View Switcher */}
                  <div className="flex items-center bg-surface border border-border rounded-xl p-0.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setEditorMode('source')}
                      className={`px-2 py-1 rounded-lg transition ${
                        editorMode === 'source' ? 'bg-primary text-primary-text font-bold' : 'text-muted hover:text-text'
                      }`}
                      title="Source only"
                    >
                      <Code size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('split')}
                      className={`px-2 py-1 rounded-lg transition hidden md:block ${
                        editorMode === 'split' ? 'bg-primary text-primary-text font-bold' : 'text-muted hover:text-text'
                      }`}
                      title="Split view"
                    >
                      <Columns size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('preview')}
                      className={`px-2 py-1 rounded-lg transition ${
                        editorMode === 'preview' ? 'bg-primary text-primary-text font-bold' : 'text-muted hover:text-text'
                      }`}
                      title="Preview only"
                    >
                      <Eye size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (hasUnsavedChanges && !window.confirm('Discard unsaved edits?')) return;
                      setDocTitle(activeDoc.title);
                      setDocFilename(activeDoc.filename);
                      setDocContent(activeDoc.content || '');
                      setHasUnsavedChanges(false);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-medium text-muted hover:text-text transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-text hover:brightness-105 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <Save size={13} />
                    <span>Save</span>
                  </button>
                </>
              ) : (
                canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-semibold text-text hover:bg-hover flex items-center gap-1.5 transition"
                  >
                    <Edit2 size={13} />
                    <span>Edit Document</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Syntax Toolbar (Only active while editing and not preview-only) */}
          {isEditing && editorMode !== 'preview' && (
            <div className="px-3 py-1.5 bg-surface border-b border-border flex flex-wrap items-center gap-1 text-muted text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => insertSyntax('# ', '', 'Heading 1')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Heading 1"
              >
                <Heading1 size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('## ', '', 'Heading 2')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Heading 2"
              >
                <Heading2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('### ', '', 'Heading 3')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Heading 3"
              >
                <Heading3 size={14} />
              </button>
              <span className="h-4 w-px bg-border mx-1" />
              <button
                type="button"
                onClick={() => insertSyntax('**', '**', 'bold text')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Bold"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('*', '*', 'italic text')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Italic"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('~~', '~~', 'strikethrough')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Strikethrough"
              >
                <Strikethrough size={14} />
              </button>
              <span className="h-4 w-px bg-border mx-1" />
              <button
                type="button"
                onClick={() => insertSyntax('- ', '', 'List item')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Bullet List"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('- [ ] ', '', 'Task item')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Task Checklist"
              >
                <CheckSquare size={14} />
              </button>
              <span className="h-4 w-px bg-border mx-1" />
              <button
                type="button"
                onClick={() => insertSyntax('`', '`', 'inline code')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Inline Code"
              >
                <Code size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('```bash\n', '\n```', 'echo "Hello World"')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition font-mono text-[11px]"
                title="Code Block"
              >
                ```
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('> ', '', 'Quoted text')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Blockquote"
              >
                <Quote size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('[', '](https://example.com)', 'Link label')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Link"
              >
                <LinkIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('![', '](https://images.unsplash.com/photo-1518770660439-4636190af475)', 'Image alt')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Image"
              >
                <ImageIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('| Column 1 | Column 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Table"
              >
                <TableIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSyntax('\n---\n')}
                className="p-1.5 rounded hover:bg-hover hover:text-text transition"
                title="Horizontal Rule"
              >
                <Minus size={14} />
              </button>
            </div>
          )}

          {/* Editor Body */}
          <div className="p-4">
            {isEditing ? (
              <div className={`grid gap-4 ${editorMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Source Input */}
                {(editorMode === 'source' || editorMode === 'split') && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
                      Markdown Source
                    </span>
                    <textarea
                      ref={textareaRef}
                      value={docContent}
                      onChange={e => {
                        setDocContent(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      rows={isFullscreen ? 28 : 18}
                      placeholder="# Enter Markdown content here..."
                      className="w-full font-mono text-xs p-3.5 bg-background border border-border rounded-xl text-text leading-relaxed outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                    />
                  </div>
                )}

                {/* Live Preview */}
                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
                      Rendered Preview
                    </span>
                    <div
                      className={`p-4 bg-background border border-border rounded-xl overflow-y-auto ${
                        isFullscreen ? 'h-[650px]' : 'h-[370px]'
                      }`}
                    >
                      <SafeMarkdown content={docContent || '_No content written yet._'} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Read-only Rendered View */
              <div className="p-2 min-h-[160px]">
                <SafeMarkdown content={activeDoc.content || '_This document is empty._'} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 text-center bg-surface border border-dashed border-border rounded-2xl space-y-3">
          <FileText size={32} className="mx-auto text-muted/60" />
          <h4 className="text-sm font-bold text-text">No Documentation Files</h4>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Attach technical READMEs, lab instructions, command cheatsheets, or assignment briefs.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 rounded-xl bg-primary text-primary-text font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs hover:brightness-105 transition"
            >
              <Plus size={14} /> Create First Document
            </button>
          )}
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-card overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <h3 className="text-base font-bold text-text">Create Markdown Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded-lg text-muted hover:text-text transition"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted">
              Choose an engineering template tailored for {contextType === 'assignment' ? 'assignments' : 'hands-on labs'}, or start with a blank canvas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
              {templates.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCreateFromTemplate(tmpl)}
                  className="p-3.5 rounded-xl border border-border bg-background hover:border-primary hover:bg-hover transition cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-text group-hover:text-primary transition">
                      {tmpl.type}
                    </strong>
                    <span className="text-[10px] font-mono text-muted">.{tmpl.filename}</span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                    {tmpl.title}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={handleCreateBlank}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-hover text-xs font-semibold text-text transition"
              >
                Start with Blank Document
              </button>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-3 py-1.5 text-xs text-muted hover:text-text transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
