import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Code2,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  FolderTree,
  ExternalLink,
  Github,
  ArrowRight,
  Folder,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Tag
} from 'lucide-react';
import { api } from '../lib/api.js';
import { ProjectCard, EmptyState, SectionHeading } from '../components.jsx';

export default function ProjectsPage({ profile }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [tree, setTree] = useState([]);
  const [domains, setDomains] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get('domain') || searchParams.get('category') || 'All';
  });
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('engineering_hub_projects_view') || 'grid';
  });
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    const domainParam = searchParams.get('domain') || searchParams.get('category');
    if (domainParam && domainParam !== selectedCategory) {
      setSelectedCategory(domainParam);
    }
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('engineering_hub_projects_view', viewMode);
  }, [viewMode]);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, treeRes, domRes, contentRes] = await Promise.all([
          api('/projects'),
          api('/projects/tree').catch(() => []),
          api('/domains').catch(() => []),
          api('/site-content').catch(() => null)
        ]);
        setProjects(projRes || []);
        setTree(treeRes || []);
        setDomains(domRes || []);
        setSiteContent(contentRes);

        const initialExp = {};
        (treeRes || []).forEach(n => {
          initialExp[n._id] = true;
        });
        setExpandedNodes(initialExp);
      } catch (err) {
        console.error('Failed to load public projects:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleExpand = id => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Build dynamic categories list from saved domains, their fields, and existing project records
  const dynamicCategories = useMemo(() => {
    const list = new Set(['All']);
    domains.forEach(d => {
      list.add(d.name);
      (d.fields || []).forEach(f => list.add(f.name));
    });
    projects.forEach(p => {
      if (p.domain) list.add(p.domain);
      if (p.fieldName) list.add(p.fieldName);
    });
    return Array.from(list);
  }, [domains, projects]);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      // Must be published and not archived
      if (!p.published || p.isArchived) return false;

      const categoryMatch =
        selectedCategory === 'All' ||
        p.domain === selectedCategory ||
        p.fieldName === selectedCategory ||
        (p.technologies || []).some(t => t.toLowerCase() === selectedCategory.toLowerCase());

      const q = search.toLowerCase().trim();
      if (!q) return categoryMatch;

      const textMatch =
        (p.title || '').toLowerCase().includes(q) ||
        (p.summary || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.domain || '').toLowerCase().includes(q) ||
        (p.fieldName || '').toLowerCase().includes(q) ||
        (p.technologies || []).some(t => t.toLowerCase().includes(q));

      return categoryMatch && textMatch;
    });
  }, [projects, selectedCategory, search]);

  const renderTree = (node, depth = 0) => {
    const isFolder = node.type === 'folder';
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodes[node._id];

    // If searching, check if node matches or any child matches
    if (search.trim()) {
      const q = search.toLowerCase();
      const nodeMatches =
        (node.title || '').toLowerCase().includes(q) ||
        (node.summary || '').toLowerCase().includes(q) ||
        (node.domain || '').toLowerCase().includes(q);
      const childMatches = hasChildren && node.children.some(c =>
        (c.title || '').toLowerCase().includes(q) || (c.domain || '').toLowerCase().includes(q)
      );
      if (!nodeMatches && !childMatches) return null;
    }

    if (selectedCategory !== 'All') {
      const nodeCatMatch = node.domain === selectedCategory || node.fieldName === selectedCategory;
      const childCatMatch = hasChildren && node.children.some(c => c.domain === selectedCategory || c.fieldName === selectedCategory);
      if (!nodeCatMatch && !childCatMatch) return null;
    }

    return (
      <div key={node._id} className="tree-node" style={{ marginLeft: `${depth * 20}px` }}>
        <div className={`flex items-center justify-between p-3.5 rounded-xl mb-2 transition border ${
          isFolder ? 'bg-secondary-background border-border' : 'bg-surface border-border shadow-xs hover:border-gold'
        }`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node._id)}
                className="p-1 text-stone-500 hover:text-stone-800 rounded transition"
                aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-6" />
            )}

            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: node.color || (isFolder ? 'var(--gold, #bb9457)' : 'var(--primary, #6f1d1b)') }}
            >
              {isFolder ? <Folder size={15} /> : <Code2 size={15} />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isFolder ? (
                  <span className="font-bold text-ink text-sm">{node.title || node.name}</span>
                ) : (
                  <Link
                    to={`/projects/${node.slug}`}
                    className="font-bold text-ink hover:text-primary text-sm transition"
                  >
                    {node.title}
                  </Link>
                )}

                {node.domain && (
                  <span className="text-[10px] bg-secondary-background text-text-secondary px-2 py-0.5 rounded font-medium border border-border">
                    {node.domain}
                  </span>
                )}

                {node.status && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                    {node.status}
                  </span>
                )}
              </div>

              {node.summary && (
                <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                  {node.summary}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFolder && (
              <Link
                to={`/projects/${node.slug}`}
                className="text-xs text-wine font-semibold inline-flex items-center gap-1 hover:underline p-1"
              >
                View Specs <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="node-children">
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const projectSectionConfig = siteContent?.sections?.projects || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="listing-hero text-center max-w-3xl mx-auto py-6">
        <span className="eyebrow inline-block mb-2 font-bold tracking-widest text-xs uppercase text-gold">
          {projectSectionConfig.eyebrow || 'THE ENGINEERING REPOSITORIES'}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-ink leading-tight">
          {projectSectionConfig.title || 'Practical systems, built from first principles.'}
        </h1>
        <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
          {projectSectionConfig.description ||
            'Explore production backend systems, autonomous agentic workflows, and full-stack software documented with architecture decisions and source code.'}
        </p>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by keyword, domain, tech (Node, Python, Redis)..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-border bg-surface text-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="inline-flex rounded-xl border border-border p-1 bg-secondary-background text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-ink'
                }`}
              >
                <LayoutGrid size={14} /> Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'tree' ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-ink'
                }`}
              >
                <FolderTree size={14} /> Hierarchy
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Category Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-t border-border/80 pt-3.5 scrollbar-thin">
          {dynamicCategories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  if (cat === 'All') {
                    setSearchParams({});
                  } else {
                    setSearchParams({ domain: cat });
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-primary text-[var(--primary-text,#ffffff)] border-primary shadow-sm shadow-primary/20'
                    : 'bg-secondary-background text-text-secondary border-border hover:bg-hover-surface hover:text-ink hover:border-gold/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center text-sm text-stone-500">
          Loading engineering catalog and hierarchy…
        </div>
      ) : filtered.length === 0 ? (
        projects.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-dashed border-border rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Code2 size={24} />
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-ink">
              No Projects in Workspace Yet
            </h3>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto mt-1 mb-5 leading-relaxed">
              You haven't added any engineering projects or repositories yet. As soon as you add projects from the Admin Workspace, they will sync here in real time.
            </p>
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-105 transition shadow-xs"
            >
              <span>Add Projects in Admin</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <EmptyState
            title="No projects match your criteria"
            description="Try broadening your search term or selecting a different technical category."
          />
        )
      ) : viewMode === 'tree' ? (
        <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="mb-4">
            <h3 className="font-bold text-stone-900 text-base font-serif">Acyclic Repository Tree</h3>
            <p className="text-xs text-stone-500">
              Structured hierarchical arrangement of parent engineering workspaces and subprojects.
            </p>
          </div>
          {tree.map(node => renderTree(node, 0))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
