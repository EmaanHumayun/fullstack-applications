import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Code2,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Paperclip,
  Award,
  AlertTriangle,
  FolderGit2,
  Check
} from 'lucide-react';
import { api } from '../lib/api.js';
import { SafeMarkdown } from '../lib/markdown.jsx';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeAssignment, setActiveAssignment] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [assignRes, domRes] = await Promise.all([
          api('/assignments').catch(() => []),
          api('/domains').catch(() => [])
        ]);
        setAssignments(assignRes || []);
        setDomains(domRes || []);
      } catch (err) {
        console.error('Failed to load assignments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const domainsList = useMemo(() => {
    const list = new Set(['All']);
    domains.forEach(d => list.add(d.name));
    assignments.forEach(a => {
      (a.domainAssociations || []).forEach(da => {
        if (da.domainId?.name) list.add(da.domainId.name);
      });
      if (a.primaryDomain?.name) list.add(a.primaryDomain.name);
    });
    return Array.from(list);
  }, [domains, assignments]);

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const assignmentTypes = [
    'All',
    'Coding',
    'Practical',
    'Research',
    'Documentation',
    'Case Study',
    'Configuration',
    'Project-Based',
    'Assessment'
  ];
  const statuses = ['All', 'Not Started', 'In Progress', 'Submitted', 'Under Review', 'Completed'];

  const filteredAssignments = useMemo(() => {
    return assignments.filter(item => {
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.shortDescription || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.technicalRequirements || []).some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        (item.domainAssociations || []).some(da =>
          (da.domainId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (da.subdomains || []).some(s => (s.name || '').toLowerCase().includes(search.toLowerCase()))
        );

      const matchesDomain =
        selectedDomain === 'All' ||
        (item.domainAssociations || []).some(da => da.domainId?.name === selectedDomain) ||
        item.primaryDomain?.name === selectedDomain;

      const matchesDifficulty =
        selectedDifficulty === 'All' || item.difficulty === selectedDifficulty;

      const matchesType =
        selectedType === 'All' || item.assignmentType === selectedType;

      const matchesStatus =
        selectedStatus === 'All' || item.status === selectedStatus;

      return matchesSearch && matchesDomain && matchesDifficulty && matchesType && matchesStatus;
    });
  }, [assignments, search, selectedDomain, selectedDifficulty, selectedType, selectedStatus]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'Completed').length;
    const submitted = assignments.filter(a => ['Submitted', 'Under Review', 'Reviewed'].includes(a.status)).length;
    const inProgress = assignments.filter(a => ['Assigned', 'In Progress'].includes(a.status)).length;
    return { total, completed, submitted, inProgress };
  }, [assignments]);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header Banner */}
      <div className="bg-surface border-b border-border py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                <FileCheck className="w-3.5 h-3.5" />
                Structured Engineering Assessments
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
                Technical Assignments & Deliverables
              </h1>
              <p className="mt-2 text-base text-text-muted max-w-2xl">
                Rigorous engineering coursework, architecture designs, automation scripts, and practical assessments with deliverable tracking and rubric evaluations.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-background/80 p-4 rounded-xl border border-border">
              <div className="text-center px-2">
                <div className="text-2xl font-black text-text">{stats.total}</div>
                <div className="text-xs text-text-muted font-medium">Assignments</div>
              </div>
              <div className="text-center px-2 border-l border-border">
                <div className="text-2xl font-black text-blue-600">{stats.inProgress}</div>
                <div className="text-xs text-text-muted font-medium">Active</div>
              </div>
              <div className="text-center px-2 border-l border-border">
                <div className="text-2xl font-black text-amber-600">{stats.submitted}</div>
                <div className="text-xs text-text-muted font-medium">Submitted</div>
              </div>
              <div className="text-center px-2 border-l border-border">
                <div className="text-2xl font-black text-emerald-600">{stats.completed}</div>
                <div className="text-xs text-text-muted font-medium">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filters Bar */}
        <div className="bg-surface rounded-2xl border border-border p-4 mb-8 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assignments by title, requirements, domains..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text placeholder-text-muted"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                aria-label="Filter assignments by difficulty"
                className="px-3 py-2 text-sm bg-background border border-border rounded-xl text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {difficulties.map(d => (
                  <option key={d} value={d}>
                    Difficulty: {d}
                  </option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                aria-label="Filter assignments by type"
                className="px-3 py-2 text-sm bg-background border border-border rounded-xl text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {assignmentTypes.map(t => (
                  <option key={t} value={t}>
                    Type: {t}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                aria-label="Filter assignments by status"
                className="px-3 py-2 text-sm bg-background border border-border rounded-xl text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Domain Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Domains:
            </span>
            {domainsList.map(domain => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedDomain === domain
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-background hover:bg-border/60 text-text-muted hover:text-text border border-border'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Assignments Grid */}
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
            <p className="text-sm text-text-muted">Loading engineering assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center max-w-lg mx-auto">
            <FileCheck className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-text">No Assignments Found</h3>
            <p className="text-sm text-text-muted mt-1">
              No technical assignments matched your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map(item => {
              const hasDueDate = !!item.dueDate;
              const isOverdue =
                hasDueDate &&
                new Date(item.dueDate) < new Date() &&
                !['Completed', 'Submitted', 'Reviewed'].includes(item.status);

              return (
                <div
                  key={item._id}
                  onClick={() => setActiveAssignment(item)}
                  className="group bg-surface rounded-2xl border border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer overflow-hidden relative"
                >
                  {/* Status indicator bar */}
                  <div
                    className={`h-1.5 w-full ${
                      item.status === 'Completed'
                        ? 'bg-emerald-500'
                        : item.status === 'Submitted'
                        ? 'bg-blue-500'
                        : item.status === 'Under Review'
                        ? 'bg-purple-500'
                        : item.status === 'In Progress'
                        ? 'bg-amber-500'
                        : 'bg-gray-300'
                    }`}
                  />

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Type and Difficulty */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                        {item.assignmentType || 'Assignment'}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          item.difficulty === 'Beginner'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.difficulty === 'Intermediate'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.difficulty === 'Advanced'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {item.difficulty}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors line-clamp-1 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-muted line-clamp-2 mb-4 flex-1">
                      {item.shortDescription || 'No description provided.'}
                    </p>

                    {/* Domains and Subdomains */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(item.domainAssociations || []).slice(0, 2).map((da, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] bg-background border border-border px-2 py-0.5 rounded text-text-muted"
                        >
                          <span className="font-semibold text-text">{da.domainId?.name}</span>
                          {da.subdomains && da.subdomains.length > 0 && (
                            <span className="text-primary font-medium">
                              / {da.subdomains[0].name}
                              {da.subdomains.length > 1 && ` +${da.subdomains.length - 1}`}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Deliverables tags */}
                    {item.expectedDeliverables && item.expectedDeliverables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.expectedDeliverables.slice(0, 3).map((del, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-border/40 text-text px-2 py-0.5 rounded font-medium flex items-center gap-1"
                          >
                            <Paperclip className="w-3 h-3 text-text-muted" /> {del}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer: Due date & Status */}
                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          className={`w-3.5 h-3.5 ${
                            isOverdue ? 'text-red-500' : 'text-text-muted'
                          }`}
                        />
                        <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                          {hasDueDate
                            ? `Due ${new Date(item.dueDate).toLocaleDateString()}`
                            : 'Flexible Due Date'}
                        </span>
                      </div>

                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'Submitted'
                            ? 'bg-blue-50 text-blue-700'
                            : item.status === 'Under Review'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-background border border-border text-text-muted'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignment Detail Interactive Modal */}
      {activeAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-start justify-between gap-4 bg-background/50">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                    {activeAssignment.assignmentType}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {activeAssignment.difficulty}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    {activeAssignment.status}
                  </span>
                  <span className="text-xs font-mono text-text-muted bg-border/40 px-2 py-0.5 rounded">
                    ID: {activeAssignment.assignmentId || 'ASG'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-text">{activeAssignment.title}</h2>
              </div>
              <button
                onClick={() => setActiveAssignment(null)}
                className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-border/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Objective & Instructions */}
              <div>
                <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">
                  Assignment Objective & Instructions
                </h4>
                <p className="text-text leading-relaxed font-medium mb-3">
                  {activeAssignment.objective || activeAssignment.shortDescription}
                </p>
                {activeAssignment.instructions && (
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <SafeMarkdown content={activeAssignment.instructions} />
                  </div>
                )}
              </div>

              {/* Tasks & Requirements */}
              {activeAssignment.tasks && activeAssignment.tasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">
                    Required Tasks ({activeAssignment.tasks.filter(t => t.completed).length}/
                    {activeAssignment.tasks.length})
                  </h4>
                  <div className="space-y-2">
                    {activeAssignment.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-background border border-border rounded-xl"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            task.completed ? 'text-emerald-500' : 'text-text-muted/40'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-text">{task.title}</div>
                          {task.description && (
                            <div className="text-xs text-text-muted mt-0.5">{task.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {activeAssignment.expectedDeliverables &&
                activeAssignment.expectedDeliverables.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">
                      Required Deliverables
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeAssignment.expectedDeliverables.map((del, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium text-text"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-primary" />
                          {del}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Evaluation Rubric / Criteria */}
              {(activeAssignment.rubric || activeAssignment.maxMarks) && (
                <div className="bg-background rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" /> Evaluation & Grading Rubric
                    </h4>
                    {activeAssignment.maxMarks && (
                      <span className="text-xs font-bold text-text bg-surface px-2.5 py-0.5 rounded border border-border">
                        Max Score: {activeAssignment.maxMarks} Marks
                      </span>
                    )}
                  </div>
                  {activeAssignment.rubric && (
                    <div className="text-xs text-text-muted leading-relaxed">
                      <SafeMarkdown content={activeAssignment.rubric} />
                    </div>
                  )}
                </div>
              )}

              {/* Markdown Documentation Preview */}
              {activeAssignment.markdownFiles && activeAssignment.markdownFiles.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" /> Technical Documentation Files (
                    {activeAssignment.markdownFiles.length})
                  </h4>
                  <div className="border border-border rounded-xl overflow-hidden bg-background divide-y divide-border">
                    {activeAssignment.markdownFiles.map(doc => (
                      <div key={doc._id} className="p-4">
                        <div className="font-bold text-text text-sm flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {doc.title} ({doc.fileName})
                        </div>
                        <div className="max-h-60 overflow-y-auto bg-surface p-3 rounded-lg border border-border">
                          <SafeMarkdown content={doc.content} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-background/50 border-t border-border flex justify-end">
              <button
                onClick={() => setActiveAssignment(null)}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-all"
              >
                Close Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
