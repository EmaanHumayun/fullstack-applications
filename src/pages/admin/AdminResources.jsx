import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Star,
  ExternalLink,
  BookOpen,
  LayoutGrid,
  Table as TableIcon,
  Layers,
  Sparkles,
  Code2,
  Workflow,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
  Download,
  Bookmark,
  TrendingUp,
  Tag
} from 'lucide-react';
import { api, jsonBody } from '../../lib/api.js';
import { Modal, ConfirmModal, Toast, EmptyState } from '../../components.jsx';
import { ResourceModal, RESOURCE_TAXONOMY, RESOURCE_STATUSES, RESOURCE_PRIORITIES } from '../../components/ResourceModal.jsx';
import { ResourceDetailModal } from '../../components/ResourceDetailModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function AdminResources() {
  const { isViewer, canEdit } = useAuth();
  const [resources, setResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  // Search & Filtering State
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'by-domain' | 'by-type' | 'favorites' | 'completed'

  // Modals State
  const [modalOpen, setModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState(null);
  const [detailResource, setDetailResource] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resList, analyticsData] = await Promise.all([
        api('/resources?all=true'),
        api('/resources/analytics').catch(() => null)
      ]);
      setResources(Array.isArray(resList) ? resList : []);
      setAnalytics(analyticsData);
    } catch (err) {
      showToast(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dynamic Domains List from resources
  const domainList = useMemo(() => {
    const list = resources.map(r => r.domainName || r.primaryDomain?.name).filter(Boolean);
    return ['All', ...new Set(list)];
  }, [resources]);

  // Flattened types list for dropdown
  const typesList = useMemo(() => {
    const flattened = Object.values(RESOURCE_TAXONOMY).flat();
    return ['All', ...flattened];
  }, []);

  // Filtered and Sorted Resources
  const filtered = useMemo(() => {
    return resources.filter(r => {
      // View Mode constraints
      if (viewMode === 'favorites' && !r.isFavorite) return false;
      if (viewMode === 'completed' && r.status !== 'Completed') return false;

      // Search Query
      if (search && search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = (r.title || '').toLowerCase().includes(q);
        const matchesSummary = (r.summary || '').toLowerCase().includes(q);
        const matchesDesc = (r.description || '').toLowerCase().includes(q);
        const matchesNotes = (r.notes || '').toLowerCase().includes(q);
        const matchesProvider = (r.provider || '').toLowerCase().includes(q);
        const matchesAuthor = (r.author || '').toLowerCase().includes(q);
        const matchesDomain = (r.domainName || r.primaryDomain?.name || '').toLowerCase().includes(q);
        const matchesTags = (r.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesDesc && !matchesNotes && !matchesProvider && !matchesAuthor && !matchesDomain && !matchesTags) {
          return false;
        }
      }

      // Type Filter
      if (selectedType !== 'All') {
        if ((r.type || '').toLowerCase() !== selectedType.toLowerCase()) return false;
      }

      // Domain Filter
      if (selectedDomain !== 'All') {
        const dom = r.domainName || r.primaryDomain?.name || '';
        if (dom.toLowerCase() !== selectedDomain.toLowerCase()) return false;
      }

      // Status Filter
      if (selectedStatus !== 'All') {
        if (r.status !== selectedStatus) return false;
      }

      // Priority Filter
      if (selectedPriority !== 'All') {
        if (r.priority !== selectedPriority) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name' || sortBy === 'alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'priority') {
        const weight = { High: 3, Medium: 2, Low: 1 };
        return (weight[b.priority] || 2) - (weight[a.priority] || 2);
      }
      if (sortBy === 'rating') {
        return (b.rating || 5) - (a.rating || 5);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // 'recent'
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });
  }, [resources, search, selectedType, selectedDomain, selectedStatus, selectedPriority, sortBy, viewMode]);

  const isFiltering = Boolean(
    search ||
    selectedType !== 'All' ||
    selectedDomain !== 'All' ||
    selectedStatus !== 'All' ||
    selectedPriority !== 'All' ||
    sortBy !== 'recent' ||
    viewMode !== 'grid'
  );

  const resetFilters = () => {
    setSearch('');
    setSelectedType('All');
    setSelectedDomain('All');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSortBy('recent');
    setViewMode('grid');
  };

  // Toggle Favorite
  const handleToggleFavorite = async (resource) => {
    if (isViewer) {
      showToast('Viewer mode: favorites cannot be modified.');
      return;
    }
    try {
      const updated = await api(`/resources/${resource._id}`, {
        method: 'PATCH',
        body: jsonBody({ isFavorite: !resource.isFavorite })
      });
      setResources(prev => prev.map(r => (r._id === resource._id ? updated : r)));
      if (detailResource?._id === resource._id) {
        setDetailResource(updated);
      }
      showToast(updated.isFavorite ? 'Saved to Favorites' : 'Removed from Favorites');
    } catch (err) {
      showToast(err.message || 'Failed to update favorite status');
    }
  };

  // Quick Status Change
  const handleQuickStatusChange = async (resource, newStatus) => {
    if (isViewer) {
      showToast('Viewer mode: status cannot be modified.');
      return;
    }
    try {
      const updated = await api(`/resources/${resource._id}`, {
        method: 'PATCH',
        body: jsonBody({ status: newStatus })
      });
      setResources(prev => prev.map(r => (r._id === resource._id ? updated : r)));
      if (detailResource?._id === resource._id) {
        setDetailResource(updated);
      }
      showToast(`Status updated to "${newStatus}"`);
    } catch (err) {
      showToast(err.message || 'Failed to update status');
    }
  };

  // Safe Unlinking
  const handleUnlink = async (resourceId, targetType, targetId) => {
    if (isViewer) {
      showToast('Viewer mode: unlinking is disabled.');
      return;
    }
    try {
      const updated = await api(`/resources/${resourceId}/unlink`, {
        method: 'PATCH',
        body: jsonBody({ targetType, targetId })
      });
      setResources(prev => prev.map(r => (r._id === resourceId ? updated : r)));
      if (detailResource?._id === resourceId) {
        setDetailResource(updated);
      }
      showToast(`Unlinked ${targetType} safely.`);
    } catch (err) {
      showToast(err.message || 'Unlink failed.');
    }
  };

  // Delete Resource
  const handleDelete = async () => {
    if (isViewer) {
      showToast('Viewer mode: deletion is disabled.');
      return;
    }
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await api(`/resources/${deleteTarget._id}`, { method: 'DELETE' });
      setResources(prev => prev.filter(r => r._id !== deleteTarget._id));
      if (detailResource?._id === deleteTarget._id) {
        setDetailResource(null);
      }
      showToast(`Resource "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <BookOpen size={13} />
            </span>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-muted">
              Central Knowledge & Reference Base
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink">
            Resources & Engineering Library
          </h1>
          <p className="text-xs text-muted max-w-2xl mt-1 leading-relaxed">
            Centralized hub for all official documentation, architectural blueprints, GitHub repositories, courses, technical reading, and personal implementation notes.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setResourceToEdit(null);
              setModalOpen(true);
            }}
            className="button-primary text-xs inline-flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} /> Add Resource
          </button>
        )}
      </div>

      {/* Telemetry / Metrics Bar */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Total Catalog</span>
            <span className="text-2xl font-bold font-display text-ink mt-1 block">{analytics.total || 0}</span>
            <span className="text-[10px] text-muted">All active resources</span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-800 dark:text-amber-400 block">To Learn</span>
            <span className="text-2xl font-bold font-display text-amber-800 dark:text-amber-400 mt-1 block">
              {analytics.byStatus?.['To Learn'] || 0}
            </span>
            <span className="text-[10px] text-muted">Backlog queue</span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-primary block">In Progress</span>
            <span className="text-2xl font-bold font-display text-primary mt-1 block">
              {analytics.byStatus?.['Learning'] || 0}
            </span>
            <span className="text-[10px] text-muted">Currently mastering</span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 block">Completed</span>
            <span className="text-2xl font-bold font-display text-emerald-700 mt-1 block">
              {analytics.byStatus?.['Completed'] || 0}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">Mastered materials</span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-muted block">Reference Base</span>
            <span className="text-2xl font-bold font-display text-ink mt-1 block">
              {analytics.byStatus?.['Reference'] || 0}
            </span>
            <span className="text-[10px] text-muted">Standing manuals</span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-600 block">Favorited</span>
            <span className="text-2xl font-bold font-display text-amber-600 mt-1 block">
              {analytics.favoritesCount || 0}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">Priority bookmarks</span>
          </div>
        </div>
      )}

      {/* UNIFIED 2-TIER VIEW NAVIGATION & SEARCH/FILTER TOOLBAR */}
      <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden">
        {/* Tier 1: View Mode Switcher & Results Summary */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 px-4 py-3 border-b border-border/70 bg-surface">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <TableIcon size={14} /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('by-domain')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'by-domain'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <Layers size={14} /> By Domain ({domainList.length - 1})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('by-type')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'by-type'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <Compass size={14} /> By Category
            </button>
            <button
              type="button"
              onClick={() => setViewMode('favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'favorites'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <Star size={14} /> Bookmarks ({resources.filter(r => r.isFavorite).length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'completed'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-surface-elevated/60'
              }`}
            >
              <CheckCircle2 size={14} /> Completed ({resources.filter(r => r.status === 'Completed').length})
            </button>
          </div>

          {/* Result Counter & Active Filters Indicator */}
          <div className="flex items-center justify-between lg:justify-end gap-3 text-xs text-muted shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
            <span className="font-mono text-[11px]">
              Showing <strong className="text-ink font-sans font-bold">{filtered.length}</strong> of {resources.length} resources
            </span>
            {isFiltering && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={11} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Search Input & Filter Dropdowns */}
        <div className="p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface/50">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-full md:max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title, description, tags, provider, author…"
              className="w-full pl-9 pr-8 py-2 text-xs border border-border bg-background text-ink placeholder:text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 rounded-md transition cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Dropdown Filters Group */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full sm:w-auto sm:max-w-[170px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-primary/30 transition truncate cursor-pointer"
                title={selectedType}
              >
                <option value="All">All Types</option>
                {typesList.filter(t => t !== 'All').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Domain Filter */}
            <div className="relative">
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                className="w-full sm:w-auto sm:max-w-[180px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-primary/30 transition truncate cursor-pointer"
                title={selectedDomain}
              >
                {domainList.map(d => (
                  <option key={d} value={d}>{d === 'All' ? 'All Domains' : d}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[125px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-primary/30 transition cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {RESOURCE_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[115px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-primary/30 transition cursor-pointer"
              >
                <option value="All">All Priorities</option>
                {RESOURCE_PRIORITIES.map(p => (
                  <option key={p} value={p}>{p} Priority</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="relative col-span-2 sm:col-span-1">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[145px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-primary/30 transition cursor-pointer"
              >
                <option value="recent">Recently Added</option>
                <option value="name">Name (A-Z)</option>
                <option value="priority">Priority</option>
                <option value="rating">Rating (5-1)</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="p-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-mono">Loading technical resource catalog…</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No Learning Resources Found"
          message={
            isFiltering
              ? 'No resources match your active search or filter criteria. Try resetting filters.'
              : 'Start building your engineering knowledge catalog by adding official documentation, architectural guides, GitHub repos, or courses.'
          }
          actionLabel={canEdit ? "Add First Resource" : undefined}
          onAction={canEdit ? () => {
            setResourceToEdit(null);
            setModalOpen(true);
          } : undefined}
        />
      )}

      {/* VIEW: GRID VIEW (DEFAULT) */}
      {!loading && viewMode === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(resource => (
            <div
              key={resource._id}
              className="p-5 rounded-2xl border border-border bg-surface shadow-xs hover:border-primary transition flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Type & Difficulty & Favorite Star */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-primary truncate max-w-[170px]">
                    {resource.type || 'Documentation'}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={isViewer}
                      onClick={() => handleToggleFavorite(resource)}
                      className="p-1 rounded-md text-muted hover:text-amber-500 transition cursor-pointer disabled:opacity-50"
                      title={resource.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                    >
                      <Star
                        size={14}
                        className={resource.isFavorite ? 'text-amber-500 fill-amber-500' : ''}
                      />
                    </button>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary-background text-muted">
                      {resource.difficulty}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setDetailResource(resource)}
                  className="font-display font-bold text-base text-ink mb-1 cursor-pointer hover:text-primary transition line-clamp-2"
                >
                  {resource.title}
                </h3>

                {/* Summary or Description */}
                <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-3">
                  {resource.summary || resource.description || 'Verified engineering learning asset.'}
                </p>

                {/* Provider & Author */}
                {(resource.provider || resource.author) && (
                  <div className="flex items-center gap-3 text-[11px] font-mono text-muted mb-3">
                    {resource.provider && (
                      <span className="flex items-center gap-1 truncate">
                        <Compass size={11} className="text-primary" /> {resource.provider}
                      </span>
                    )}
                    {resource.author && (
                      <span className="truncate">by {resource.author}</span>
                    )}
                  </div>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary-background text-muted">
                        #{tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="text-[10px] font-mono text-muted">+{resource.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom Row: Relationships & Action Controls */}
              <div className="pt-3 border-t border-border/70 space-y-3">
                {/* Domain & Field Indicator */}
                {(resource.domainName || resource.primaryDomain?.name) && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                    <span className="truncate">
                      {resource.domainName || resource.primaryDomain?.name}
                      {resource.subdomain && ` / ${resource.subdomain}`}
                    </span>
                    <span className="text-[10px] font-bold text-primary shrink-0">
                      {(resource.relatedSkills || []).length} Skills
                    </span>
                  </div>
                )}

                {/* Inline Status & Priority & Actions */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <select
                      value={resource.status}
                      disabled={isViewer}
                      onChange={e => handleQuickStatusChange(resource, e.target.value)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border border-border bg-background outline-none cursor-pointer disabled:opacity-60 ${
                        resource.status === 'Completed'
                          ? 'text-emerald-700'
                          : resource.status === 'Learning'
                            ? 'text-amber-800'
                            : 'text-muted'
                      }`}
                    >
                      {RESOURCE_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      resource.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-secondary-background text-muted'
                    }`}>
                      {resource.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-secondary-background transition"
                      title="Open external link"
                    >
                      <ExternalLink size={13} />
                    </a>
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setResourceToEdit(resource);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-muted hover:text-primary rounded-lg hover:bg-secondary-background transition cursor-pointer"
                          title="Edit resource"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(resource)}
                          className="p-1.5 text-muted hover:text-rose-600 rounded-lg hover:bg-secondary-background transition cursor-pointer"
                          title="Delete resource"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: TABLE VIEW */}
      {!loading && viewMode === 'table' && filtered.length > 0 && (
        <div className="panel-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary-background/60 font-mono text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3.5 pl-5">Resource Title & Source</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Domain / Subdomain</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Connected</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map(r => (
                  <tr key={r._id} className="hover:bg-hover-surface/50 transition">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          disabled={isViewer}
                          onClick={() => handleToggleFavorite(r)}
                          className="text-muted hover:text-amber-500 transition mt-0.5 cursor-pointer disabled:opacity-50"
                        >
                          <Star size={13} className={r.isFavorite ? 'text-amber-500 fill-amber-500' : ''} />
                        </button>
                        <div>
                          <span
                            onClick={() => setDetailResource(r)}
                            className="font-bold text-ink cursor-pointer hover:text-primary block transition"
                          >
                            {r.title}
                          </span>
                          <span className="text-[11px] text-muted font-mono block">
                            {r.provider ? `${r.provider} • ` : ''}{r.author ? `by ${r.author}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-muted">{r.type}</td>
                    <td className="p-3.5 text-ink font-semibold">
                      {r.domainName || r.primaryDomain?.name || '—'}
                      {r.subdomain && <span className="text-muted block text-[10px] font-mono">{r.subdomain}</span>}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'Learning' ? 'bg-amber-100 text-amber-800' : 'bg-secondary-background text-muted'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        r.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-secondary-background text-muted'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-amber-600 font-bold">
                      ★ {r.rating || 5}/5
                    </td>
                    <td className="p-3.5 text-muted font-mono text-[10px]">
                      {(r.relatedSkills || []).length} Skills • {(r.relatedProjects || []).length} Projects
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button-ghost p-1.5 text-xs text-muted hover:text-ink"
                          title="Open URL"
                        >
                          <ExternalLink size={13} />
                        </a>
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setResourceToEdit(r);
                                setModalOpen(true);
                              }}
                              className="button-ghost p-1.5 text-xs text-muted hover:text-primary"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(r)}
                              className="button-ghost p-1.5 text-xs text-rose-600 hover:text-rose-700"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: BY DOMAIN GROUPED VIEW */}
      {!loading && viewMode === 'by-domain' && (
        <div className="space-y-6">
          {domainList.filter(d => d !== 'All').map(domain => {
            const domainResources = filtered.filter(r => (r.domainName || r.primaryDomain?.name) === domain);
            if (domainResources.length === 0) return null;

            return (
              <div key={domain} className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                      <Layers size={16} className="text-primary" /> {domain}
                    </h3>
                    <span className="text-xs text-muted">{domainResources.length} engineering resources indexed</span>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setResourceToEdit(null);
                        setModalOpen(true);
                      }}
                      className="button-secondary text-xs"
                    >
                      <Plus size={13} /> Add to {domain.split(' ')[0]}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {domainResources.map(r => (
                    <div
                      key={r._id}
                      onClick={() => setDetailResource(r)}
                      className="p-4 rounded-xl border border-border bg-background/50 hover:border-primary transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] text-primary font-bold uppercase">{r.type}</span>
                          <span className="text-[10px] font-mono text-muted">{r.status}</span>
                        </div>
                        <h4 className="font-bold text-sm text-ink mb-1">{r.title}</h4>
                        <p className="text-xs text-muted line-clamp-2">{r.summary || r.description || 'Reference asset'}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted">
                        <span>{r.provider || 'Self-hosted'}</span>
                        <span className="text-amber-500 font-bold">★ {r.rating || 5}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: BY CATEGORY / TAXONOMY VIEW */}
      {!loading && viewMode === 'by-type' && (
        <div className="space-y-6">
          {Object.entries(RESOURCE_TAXONOMY).map(([group, types]) => {
            const groupResources = filtered.filter(r => types.includes(r.type));
            if (groupResources.length === 0) return null;

            return (
              <div key={group} className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                      <Compass size={16} className="text-primary" /> {group}
                    </h3>
                    <span className="text-xs text-muted">{groupResources.length} items in this category</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupResources.map(r => (
                    <div
                      key={r._id}
                      onClick={() => setDetailResource(r)}
                      className="p-4 rounded-xl border border-border bg-background/50 hover:border-primary transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold text-primary block mb-1">{r.type}</span>
                        <h4 className="font-bold text-sm text-ink mb-1">{r.title}</h4>
                        <p className="text-xs text-muted line-clamp-2">{r.summary || r.description}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted">
                        <span>{r.domainName || 'Unassigned'}</span>
                        <span className="font-bold text-ink">{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAVORITES VIEW */}
      {!loading && viewMode === 'favorites' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(resource => (
            <div
              key={resource._id}
              className="p-5 rounded-2xl border border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-primary">{resource.type}</span>
                  <Star size={15} className="text-amber-500 fill-amber-500" />
                </div>
                <h3
                  onClick={() => setDetailResource(resource)}
                  className="font-display font-bold text-base text-ink mb-1.5 cursor-pointer hover:text-primary transition"
                >
                  {resource.title}
                </h3>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-3">
                  {resource.summary || resource.description}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-muted">{resource.domainName || 'General'}</span>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary text-xs inline-flex items-center gap-1 py-1"
                >
                  Open <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT RESOURCE MODAL */}
      <ResourceModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setResourceToEdit(null);
        }}
        resourceToEdit={resourceToEdit}
        onSaved={(saved) => {
          loadData();
          showToast(`Resource "${saved.title}" saved successfully!`);
        }}
      />

      {/* RESOURCE DETAIL MODAL */}
      <ResourceDetailModal
        isOpen={!!detailResource}
        onClose={() => setDetailResource(null)}
        resource={detailResource}
        onEdit={(r) => {
          setDetailResource(null);
          setResourceToEdit(r);
          setModalOpen(true);
        }}
        onDelete={(r) => {
          setDeleteTarget(r);
        }}
        onToggleFavorite={handleToggleFavorite}
        onStatusChange={handleQuickStatusChange}
        onUnlink={handleUnlink}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Learning Resource"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This will remove the record from your central library. All connected domains, skills, projects, and roadmaps will remain intact.`}
        confirmText={busy ? 'Deleting…' : 'Delete Resource'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
