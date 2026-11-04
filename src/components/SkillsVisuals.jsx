import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Cpu,
  Layers,
  Shield,
  Code2,
  Database,
  Search,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Radar,
  LayoutGrid,
  Filter,
  Check,
  Star,
  ExternalLink,
  ArrowUpRight,
  FolderGit2,
  Award,
  X,
  FileCheck,
  BookOpen,
  Workflow,
  Globe,
  SlidersHorizontal,
  Terminal,
  Network,
  Lock,
  Boxes
} from 'lucide-react';
import { Modal } from '../components.jsx';

/**
 * 4 CORE STRATEGIC ENGINEERING FIELDS
 * Replaces 16 fragmented 1-item micro-categories with an executive,
 * cohesive engineering capability architecture.
 */
export const ENGINEERING_FIELDS = [
  {
    id: 'backend_systems',
    title: 'Backend & Distributed Systems',
    shortTitle: 'Backend & Systems',
    icon: Server,
    accentColor: '#6f1d1b',
    borderClass: 'border-[#6f1d1b]/30 hover:border-[#6f1d1b]',
    bgBadgeClass: 'bg-[#6f1d1b]/10 text-[#6f1d1b] border-[#6f1d1b]/20 dark:bg-[#6f1d1b]/25 dark:text-[#f8d7da] dark:border-[#6f1d1b]/40',
    tagline: 'High-Throughput Microservices & Scalable Systems',
    description: 'Resilient REST & ASGI APIs, distributed system design, idempotent microservices, async event queues, and fault-tolerant service contracts.',
    keyTechnologies: ['Node.js & Express', 'Distributed System Design', 'Full-Stack Architecture', 'Python & FastAPI', 'Webhooks & Third-Party APIs'],
    targetRadarAxis: 'Backend Architecture',
    match: s => {
      const n = (s?.name || '').toLowerCase();
      const c = (s?.category || '').toLowerCase();
      if (n.includes('fastapi')) return true;
      return (
        n.includes('distributed') ||
        n.includes('node') ||
        n.includes('express') ||
        n.includes('system design') ||
        n.includes('webhook') ||
        n.includes('full-stack') ||
        c.includes('backend') ||
        c.includes('full-stack') ||
        c.includes('architecture') ||
        c.includes('integration')
      );
    }
  },
  {
    id: 'applied_ai',
    title: 'Applied AI & Intelligent Workflows',
    shortTitle: 'Applied AI & Agents',
    icon: Cpu,
    accentColor: '#99582a',
    borderClass: 'border-[#99582a]/30 hover:border-[#99582a]',
    bgBadgeClass: 'bg-[#99582a]/10 text-[#99582a] border-[#99582a]/20 dark:bg-[#99582a]/25 dark:text-[#ffe6a7] dark:border-[#99582a]/40',
    tagline: 'Agentic Orchestration & Deterministic Reasoning',
    description: 'Autonomous multi-agent workflows, context retrieval (RAG), structured tool calling, telemetry data aggregation, and architectural whitepapers.',
    keyTechnologies: ['Agentic AI & LLMs', 'Technical Writing & Architecture', 'Telemetry & Analytics Visualization'],
    targetRadarAxis: 'Applied AI & Agents',
    match: s => {
      const n = (s?.name || '').toLowerCase();
      const c = (s?.category || '').toLowerCase();
      if (n.includes('fastapi')) return false;
      return (
        n.includes('agentic') ||
        n.includes('telemetry') ||
        n.includes('technical writing') ||
        n.includes('blueprint') ||
        n.includes('llm') ||
        n.includes('ai') ||
        c.includes('ai') ||
        c.includes('analytics') ||
        c.includes('research')
      );
    }
  },
  {
    id: 'systems_security',
    title: 'Systems, AppSec & Cloud Infrastructure',
    shortTitle: 'Systems & Security',
    icon: Shield,
    accentColor: '#432818',
    borderClass: 'border-[#432818]/30 hover:border-[#432818]',
    bgBadgeClass: 'bg-[#432818]/10 text-[#432818] border-[#432818]/20 dark:bg-[#432818]/25 dark:text-[#e2d5cc] dark:border-[#432818]/40',
    tagline: 'Defensive Security, Low-Level Protocols & Containers',
    description: 'OWASP Top 10 mitigation, memory-safe systems programming, TCP/IP networking, multi-stage Docker containerization, and automated shell workflows.',
    keyTechnologies: ['Web Application Security', 'Docker & Containerization', 'TCP/IP & Network Protocols', 'Rust Systems Programming', 'Bash & Shell Scripting'],
    targetRadarAxis: 'Systems & AppSec',
    match: s => {
      const n = (s?.name || '').toLowerCase();
      const c = (s?.category || '').toLowerCase();
      return (
        n.includes('security') ||
        n.includes('docker') ||
        n.includes('container') ||
        n.includes('tcp') ||
        n.includes('network') ||
        n.includes('rust') ||
        n.includes('bash') ||
        n.includes('shell') ||
        c.includes('security') ||
        c.includes('cloud') ||
        c.includes('network') ||
        c.includes('systems')
      );
    }
  },
  {
    id: 'data_languages_web',
    title: 'Data Systems, Languages & Modern Web',
    shortTitle: 'Data, Languages & Web',
    icon: Database,
    accentColor: '#bb9457',
    borderClass: 'border-[#bb9457]/30 hover:border-[#bb9457]',
    bgBadgeClass: 'bg-[#bb9457]/10 text-[#bb9457] border-[#bb9457]/20 dark:bg-[#bb9457]/25 dark:text-[#ffe6a7] dark:border-[#bb9457]/40',
    tagline: 'Type-Safe Platforms, ACID Stores & Modern UIs',
    description: 'Relational 3NF & document schemas, strict TypeScript generics, reactive component architectures, WCAG accessibility, and foundational data structures.',
    keyTechnologies: ['TypeScript', 'Python', 'React & Vite', 'MongoDB & Mongoose', 'SQL & Relational Modeling', 'Data Structures & Algorithms'],
    targetRadarAxis: 'Data & Languages',
    match: () => true // Fallback matches remaining items
  }
];

export function getSkillField(skill) {
  for (const field of ENGINEERING_FIELDS) {
    if (field.match(skill)) {
      return field;
    }
  }
  return ENGINEERING_FIELDS[3];
}

export function getSkillIcon(skill) {
  const name = (skill?.name || '').toLowerCase();
  const cat = (skill?.category || '').toLowerCase();

  if (name.includes('security') || cat.includes('security')) return Shield;
  if (name.includes('ai') || name.includes('llm') || name.includes('agent') || cat.includes('ai')) return Cpu;
  if (name.includes('writing') || name.includes('blueprint') || name.includes('doc') || cat.includes('writing')) return BookOpen;
  if (name.includes('distributed') || name.includes('system design') || name.includes('pipeline') || name.includes('workflow')) return Workflow;
  if (name.includes('database') || name.includes('mongo') || name.includes('sql') || name.includes('redis')) return Database;
  if (name.includes('react') || name.includes('vite') || name.includes('ui') || name.includes('frontend')) return Layers;
  if (name.includes('node') || name.includes('backend') || name.includes('express') || name.includes('fastapi') || name.includes('api')) return Server;
  if (name.includes('network') || name.includes('tcp')) return Network;
  if (name.includes('docker') || name.includes('container')) return Boxes;
  if (name.includes('rust') || name.includes('bash') || name.includes('shell')) return Terminal;
  if (name.includes('python') || name.includes('typescript') || name.includes('javascript') || name.includes('code')) return Code2;
  return Code2;
}

export function getSkillCapabilityTier(skill) {
  const hasEvidence = skill?.practicalEvidence && skill.practicalEvidence.length > 0;
  const hasProjects = skill?.relatedProjects && skill.relatedProjects.length > 0;
  if (hasEvidence || hasProjects) {
    return {
      tier: 'Demonstrated',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
      description: 'Applied in active production repositories with verifiable proof.'
    };
  }
  if (skill?.level === 'Advanced' || skill?.level === 'Expert' || (skill?.proficiencyPercentage || 0) >= 75) {
    return {
      tier: 'Practiced',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
      description: 'Hands-on practical development capability in active production workflows.'
    };
  }
  return {
    tier: 'Foundational',
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
    description: 'Core concepts, algorithms, and theoretical understanding.'
  };
}

/**
 * 5-AXIS BALANCED RADAR COMPASS
 * Clear geometric pentagon representing the key engineering pillars.
 */
export function RadarCompass({ axes = [], hoveredIndex, onHoverAxis }) {
  const cx = 200;
  const cy = 175;
  const maxR = 110;
  const N = Math.max(axes.length, 3);
  const levels = [0.25, 0.5, 0.75, 1.0];

  const gridPolygons = levels.map(level => {
    return axes
      .map((_, i) => {
        const theta = (2 * Math.PI * i) / N - Math.PI / 2;
        const x = cx + maxR * level * Math.cos(theta);
        const y = cy + maxR * level * Math.sin(theta);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  const spokeLines = axes.map((_, i) => {
    const theta = (2 * Math.PI * i) / N - Math.PI / 2;
    const x = cx + maxR * Math.cos(theta);
    const y = cy + maxR * Math.sin(theta);
    return { x1: cx, y1: cy, x2: x, y2: y };
  });

  const dataPoints = axes.map((axis, i) => {
    const theta = (2 * Math.PI * i) / N - Math.PI / 2;
    const scoreFrac = Math.max(0.2, Math.min(1.0, (axis.score || 50) / 100));
    const r = maxR * scoreFrac;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    return { x, y, theta, r, score: axis.score, label: axis.label };
  });

  const polygonString = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-square flex items-center justify-center select-none py-2">
      <svg
        viewBox="0 0 400 350"
        className="w-full h-auto overflow-visible"
        aria-label="5-axis radar chart of engineering capability pillars"
      >
        <defs>
          <linearGradient id="radarFieldFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#bb9457" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#99582a" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="centerRadarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={maxR + 10} fill="url(#centerRadarGlow)" />

        {/* Concentric Grid Levels */}
        {gridPolygons.map((poly, idx) => (
          <polygon
            key={idx}
            points={poly}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={idx === levels.length - 1 ? 'none' : '3 3'}
            opacity="0.8"
          />
        ))}

        {/* Spoke Lines */}
        {spokeLines.map((spoke, idx) => (
          <line
            key={idx}
            x1={spoke.x1}
            y1={spoke.y1}
            x2={spoke.x2}
            y2={spoke.y2}
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.8"
          />
        ))}

        {/* Data Area Polygon */}
        <polygon
          points={polygonString}
          fill="url(#radarFieldFillGrad)"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Interactive Data Vertices */}
        {dataPoints.map((p, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <g
              key={idx}
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => onHoverAxis && onHoverAxis(idx)}
              onMouseLeave={() => onHoverAxis && onHoverAxis(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4}
                fill="var(--surface)"
                stroke="var(--primary)"
                strokeWidth={isHovered ? 3 : 2}
              />
              {isHovered && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              )}
            </g>
          );
        })}

        {/* Axis Labels */}
        {axes.map((axis, i) => {
          const theta = (2 * Math.PI * i) / N - Math.PI / 2;
          const labelDist = maxR + 26;
          const lx = cx + labelDist * Math.cos(theta);
          const ly = cy + labelDist * Math.sin(theta);
          const isHovered = hoveredIndex === i;

          let textAnchor = 'middle';
          if (Math.cos(theta) > 0.35) textAnchor = 'start';
          else if (Math.cos(theta) < -0.35) textAnchor = 'end';

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className={`font-mono text-[10px] tracking-wider transition-all duration-150 cursor-pointer ${
                isHovered
                  ? 'fill-ink font-extrabold text-[11px]'
                  : 'fill-muted font-medium'
              }`}
              onMouseEnter={() => onHoverAxis && onHoverAxis(i)}
              onMouseLeave={() => onHoverAxis && onHoverAxis(null)}
            >
              {axis.label.toUpperCase()}
              <tspan className="fill-primary font-bold ml-1">
                {` ${axis.score}%`}
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * 4-FIELD STRATEGIC TELEMETRY CARD
 * Replaces the 16-row unorganized list with high-signal, clickable discipline summaries.
 */
export function FieldTelemetryOverview({ fieldStats = [], activeField, onSelectField }) {
  return (
    <div className="w-full space-y-3">
      {fieldStats.map(f => {
        const isSelected = activeField === f.id;
        const FieldIcon = f.icon;

        return (
          <div
            key={f.id}
            onClick={() => onSelectField(isSelected ? 'All' : f.id)}
            className={`group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-hover-surface border-primary ring-1 ring-primary/40 shadow-xs'
                : 'bg-surface border-border hover:border-primary/50 hover:bg-hover-surface/50'
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${f.accentColor}15`,
                    borderColor: `${f.accentColor}30`,
                    color: f.accentColor
                  }}
                >
                  <FieldIcon size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-xs sm:text-sm text-ink truncate group-hover:text-primary transition">
                    {f.title}
                  </h4>
                  <p className="text-[10.5px] text-muted truncate">
                    {f.tagline}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-black text-primary">
                  {f.averageScore}%
                </span>
                <span className="text-[9.5px] font-mono text-muted block">
                  {f.count} Techs
                </span>
              </div>
            </div>

            {/* Visual Progress Bar with Tier Markers */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-secondary-background overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${f.averageScore}%`,
                    backgroundColor: f.accentColor
                  }}
                />
              </div>
              <span className="text-[9.5px] font-mono font-semibold text-muted shrink-0">
                {f.demonstratedCount > 0 ? `${f.demonstratedCount} Repos` : 'Practiced'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * MAIN PUBLIC SKILLS VISUAL SECTION
 */
export function SkillsVisualSection({ rawSkills = [], sections = {} }) {
  const [activeTab, setActiveTab] = useState('radar'); // 'radar', 'matrix', 'spectrum'
  const [selectedField, setSelectedField] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [hoveredRadarAxis, setHoveredRadarAxis] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillModal, setSelectedSkillModal] = useState(null);

  // Deduplicate and sanitize unique skills
  const uniqueSkills = useMemo(() => {
    const list = rawSkills.filter(s => !s.isArchived && s.visibility !== 'private');
    const seen = new Set();
    const result = [];
    for (const s of list) {
      if (!seen.has(s.name)) {
        seen.add(s.name);
        result.push({
          ...s,
          engineeringField: getSkillField(s)
        });
      }
    }
    return result;
  }, [rawSkills]);

  // Aggregate stats into 4 Strategic Engineering Fields
  const fieldStats = useMemo(() => {
    return ENGINEERING_FIELDS.map(f => {
      const skillsInField = uniqueSkills.filter(s => s.engineeringField.id === f.id);
      const count = skillsInField.length;
      const totalScore = skillsInField.reduce((acc, s) => acc + (s.proficiencyPercentage || 75), 0);
      const averageScore = count > 0 ? Math.round(totalScore / count) : 80;
      const demonstratedCount = skillsInField.filter(
        s => (s.practicalEvidence && s.practicalEvidence.length > 0) || (s.relatedProjects && s.relatedProjects.length > 0)
      ).length;

      return {
        ...f,
        count,
        skills: skillsInField,
        averageScore,
        demonstratedCount
      };
    });
  }, [uniqueSkills]);

  // 5 Balanced Radar Axes
  const radarAxes = useMemo(() => {
    const backendField = fieldStats.find(f => f.id === 'backend_systems');
    const aiField = fieldStats.find(f => f.id === 'applied_ai');
    const secField = fieldStats.find(f => f.id === 'systems_security');
    const dataWebField = fieldStats.find(f => f.id === 'data_languages_web');

    // Extract sub-scores for Data & Languages to create a clean 5-axis pentagon
    const dataSkills = dataWebField?.skills.filter(s => (s.name || '').toLowerCase().includes('mongo') || (s.name || '').toLowerCase().includes('sql')) || [];
    const langSkills = dataWebField?.skills.filter(s => !(s.name || '').toLowerCase().includes('mongo') && !(s.name || '').toLowerCase().includes('sql')) || [];

    const dataScore = dataSkills.length > 0
      ? Math.round(dataSkills.reduce((a, b) => a + (b.proficiencyPercentage || 80), 0) / dataSkills.length)
      : 84;
    const langScore = langSkills.length > 0
      ? Math.round(langSkills.reduce((a, b) => a + (b.proficiencyPercentage || 82), 0) / langSkills.length)
      : 88;

    return [
      { label: 'Backend Architecture', score: backendField?.averageScore || 90, fieldId: 'backend_systems' },
      { label: 'Applied AI & Agents', score: aiField?.averageScore || 88, fieldId: 'applied_ai' },
      { label: 'Systems & AppSec', score: secField?.averageScore || 86, fieldId: 'systems_security' },
      { label: 'Data Engineering', score: dataScore, fieldId: 'data_languages_web' },
      { label: 'Languages & Web', score: langScore, fieldId: 'data_languages_web' }
    ];
  }, [fieldStats]);

  // Overall Headline Metrics
  const overallStats = useMemo(() => {
    const total = uniqueSkills.length;
    const demonstrated = uniqueSkills.filter(
      s => (s.practicalEvidence && s.practicalEvidence.length > 0) || (s.relatedProjects && s.relatedProjects.length > 0)
    ).length;
    const practiced = uniqueSkills.filter(
      s => s.level === 'Advanced' || s.level === 'Expert' || (s.proficiencyPercentage || 0) >= 75
    ).length;

    return {
      total,
      demonstrated,
      practiced,
      fieldsCount: ENGINEERING_FIELDS.length
    };
  }, [uniqueSkills]);

  // Filtered skills based on field, tier, and search query
  const filteredSkills = useMemo(() => {
    return uniqueSkills.filter(s => {
      const matchesField = selectedField === 'All' || s.engineeringField.id === selectedField;
      const tier = getSkillCapabilityTier(s);
      const matchesTier = selectedTier === 'All' || tier.tier === selectedTier;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q) ||
        (s.subcategory || '').toLowerCase().includes(q) ||
        s.engineeringField.title.toLowerCase().includes(q) ||
        (s.tags || []).some(t => t.toLowerCase().includes(q));

      return matchesField && matchesTier && matchesSearch;
    });
  }, [uniqueSkills, selectedField, selectedTier, searchQuery]);

  if (uniqueSkills.length === 0) {
    return (
      <section id="skills" className="public-section border-t border-border">
        <div className="mb-8">
          <p className="eyebrow">{sections.skills?.eyebrow || 'TECHNICAL EXPERTISE & DISCIPLINES'}</p>
          <h2 className="section-title mt-1.5">
            {sections.skills?.title || 'Engineering Capabilities & Disciplines'}
          </h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted">
            {sections.skills?.description ||
              'A structured overview of core engineering fields, production-verified architectures, and active software competencies.'}
          </p>
        </div>

        <div className="p-12 text-center bg-surface border border-dashed border-border rounded-3xl my-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Cpu size={24} />
          </div>
          <h3 className="font-display font-bold text-lg text-ink">No Skills Documented Yet</h3>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto mt-1.5 mb-6 leading-relaxed">
            No technical skills or competencies have been added to the workspace yet. As soon as you add skills in the Admin Console, the live competency matrix, radar telemetry, and disciplines will render automatically.
          </p>
          <Link
            to="/admin/skills"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:brightness-105 transition"
          >
            <span>Add Skills in Admin</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="public-section border-t border-border">
      {/* Section Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{sections.skills?.eyebrow || 'TECHNICAL EXPERTISE & DISCIPLINES'}</p>
          <h2 className="section-title mt-1.5">
            {sections.skills?.title || 'Engineering Capabilities & Disciplines'}
          </h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted">
            {sections.skills?.description ||
              'A structured overview of core engineering fields, production-verified architectures, and active software competencies.'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border shrink-0 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-primary text-primary-text shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Radar size={14} /> Charts & Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-primary text-primary-text shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            <LayoutGrid size={14} /> Disciplines & Grid
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spectrum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'spectrum'
                ? 'bg-primary text-primary-text shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            <BarChart3 size={14} /> Capability Spectrum
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            TOTAL COMPETENCIES
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">{overallStats.total}</span>
            <span className="text-xs text-muted font-medium">Documented Techs</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-700 dark:text-emerald-400 font-bold block">
            DEMONSTRATED IN WORK
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-emerald-700 dark:text-emerald-400">{overallStats.demonstrated}</span>
            <span className="text-xs text-muted font-medium">Active Repositories</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-primary font-bold block">
            PRACTICED CAPABILITY
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-primary">{overallStats.practiced}</span>
            <span className="text-xs text-muted font-medium">Production Tier</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted font-bold block">
            CORE DISCIPLINES
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-display text-ink">4</span>
            <span className="text-xs text-muted font-medium">Strategic Fields</span>
          </div>
        </div>
      </div>

      {/* TAB 1: RADAR & FIELD TELEMETRY (Balanced 2-Column Command Center) */}
      {activeTab === 'radar' && (
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-elevated mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: 5-Axis Radar Compass */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-border mb-2">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                    RADAR TELEMETRY
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-bold text-ink">
                    Engineering Domain Compass
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-muted bg-secondary-background px-2.5 py-1 rounded-full border border-border">
                  5 Key Pillars
                </span>
              </div>

              <RadarCompass
                axes={radarAxes}
                hoveredIndex={hoveredRadarAxis}
                onHoverAxis={setHoveredRadarAxis}
              />
            </div>

            {/* Right Column: 4 Strategic Engineering Fields Overview */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                  CORE DISCIPLINES
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-ink mb-1">
                  Discipline Balance
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Aggregated mastery across primary engineering disciplines. Click any discipline to filter the competency matrix below.
                </p>
              </div>

              <FieldTelemetryOverview
                fieldStats={fieldStats}
                activeField={selectedField}
                onSelectField={setSelectedField}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4 STRATEGIC FIELD CARDS (High-level editorial cards for immediate clarity) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-ink">
              Core Engineering Disciplines
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Click any discipline card to filter competencies and architectural evidence.
            </p>
          </div>
          {selectedField !== 'All' && (
            <button
              type="button"
              onClick={() => setSelectedField('All')}
              className="text-xs font-mono font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              Reset to All Fields <X size={12} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fieldStats.map(f => {
            const isSelected = selectedField === f.id;
            const FieldIcon = f.icon;

            return (
              <div
                key={f.id}
                onClick={() => setSelectedField(isSelected ? 'All' : f.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-hover-surface border-primary ring-2 ring-primary/40 shadow-sm -translate-y-0.5'
                    : 'bg-surface border-border hover:border-primary/50 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: `${f.accentColor}15`,
                        borderColor: `${f.accentColor}30`,
                        color: f.accentColor
                      }}
                    >
                      <FieldIcon size={18} />
                    </div>
                    <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-secondary-background text-muted border border-border">
                      {f.count} Techs
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-sm text-ink group-hover:text-primary transition leading-snug">
                    {f.title}
                  </h4>
                  <p className="text-[11px] text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-primary">
                    {f.demonstratedCount > 0 ? `${f.demonstratedCount} Active Repos` : 'Practiced'}
                  </span>
                  <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-primary' : 'text-muted group-hover:text-ink'} flex items-center gap-0.5`}>
                    {isSelected ? 'Active Filter' : 'Filter Field →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-border shadow-xs space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Keyword Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search competencies (e.g. Node, React, Docker)..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-ink placeholder:text-muted"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Capability Tier Selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <span className="font-mono text-[10px] text-muted uppercase font-bold mr-1 hidden md:inline">Tier:</span>
            {['All', 'Demonstrated', 'Practiced'].map(tierName => (
              <button
                key={tierName}
                type="button"
                onClick={() => setSelectedTier(tierName)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedTier === tierName
                    ? 'bg-primary text-primary-text border-primary shadow-xs'
                    : 'bg-background text-muted border-border hover:text-ink'
                }`}
              >
                {tierName === 'Demonstrated' ? 'Demonstrated (Repos)' : tierName}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-muted self-end sm:self-auto">
            Showing <strong className="text-ink">{filteredSkills.length}</strong> of {uniqueSkills.length} competencies
          </div>
        </div>

        {/* 4 Strategic Field Quick-Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-border/80 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedField('All')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
              selectedField === 'All'
                ? 'bg-primary text-primary-text border-primary shadow-xs'
                : 'bg-surface text-ink border-border hover:bg-hover-surface'
            }`}
          >
            All Fields ({uniqueSkills.length})
          </button>

          {fieldStats.map(f => {
            const isSelected = selectedField === f.id;
            const FieldIcon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedField(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-primary text-primary-text border-primary shadow-xs'
                    : 'bg-surface text-ink border-border hover:bg-hover-surface'
                }`}
              >
                <FieldIcon size={13} />
                {f.shortTitle} ({f.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPETENCY MATRIX OR SPECTRUM VIEW */}
      {filteredSkills.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-dashed border-border rounded-2xl mb-8">
          <p className="text-sm font-semibold text-ink">No competencies match your filter</p>
          <p className="text-xs text-muted mt-1">Try resetting the field filter or clearing your search query.</p>
          <button
            type="button"
            onClick={() => { setSelectedField('All'); setSelectedTier('All'); setSearchQuery(''); }}
            className="mt-3 px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-text shadow-xs cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : activeTab === 'spectrum' ? (
        /* SPECTRUM VIEW: Ranked horizontal comparison bars */
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4 mb-8">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="font-display font-bold text-sm text-ink block">Stack Mastery Spectrum</span>
              <span className="text-[11px] text-muted">Comparative breakdown across all verified technologies</span>
            </div>
            <span className="font-mono text-xs text-muted">Ranked by capability tier</span>
          </div>

          <div className="space-y-3">
            {[...filteredSkills]
              .sort((a, b) => {
                const tierA = (a.relatedProjects?.length || 0) + (a.practicalEvidence?.length || 0);
                const tierB = (b.relatedProjects?.length || 0) + (b.practicalEvidence?.length || 0);
                if (tierB !== tierA) return tierB - tierA;
                return (b.proficiencyPercentage || 0) - (a.proficiencyPercentage || 0);
              })
              .map(skill => {
                const tier = getSkillCapabilityTier(skill);
                const FieldIcon = skill.engineeringField.icon;

                return (
                  <div
                    key={skill._id}
                    onClick={() => setSelectedSkillModal(skill)}
                    className="p-3.5 rounded-xl bg-background border border-border hover:border-primary transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold font-display text-ink text-sm">{skill.name}</span>
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${skill.engineeringField.bgBadgeClass}`}>
                          <FieldIcon size={10} />
                          {skill.engineeringField.shortTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md border ${tier.badgeClass}`}>
                          <CheckCircle2 size={10} className={tier.tier === 'Demonstrated' ? 'text-emerald-700' : 'text-amber-800'} />
                          {tier.tier}
                        </span>
                        <span className="font-mono text-xs font-bold text-primary">{skill.proficiencyPercentage}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-secondary-background rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${skill.proficiencyPercentage}%`,
                          backgroundColor: skill.engineeringField.accentColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* STRUCTURED 3-COLUMN COMPETENCY MATRIX */
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {filteredSkills.map(skill => {
            const tier = getSkillCapabilityTier(skill);
            const SkillIcon = getSkillIcon(skill);
            const projectCount = (skill.relatedProjects || []).length;
            const evidenceCount = (skill.practicalEvidence || []).length;

            return (
              <div
                key={skill._id}
                onClick={() => setSelectedSkillModal(skill)}
                className="group relative bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs hover:border-primary hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        <SkillIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-ink text-sm sm:text-base group-hover:text-primary transition-colors leading-snug truncate">
                          {skill.name}
                        </h4>
                        <span className="font-mono text-[9.5px] text-muted block truncate">
                          {skill.engineeringField.shortTitle}
                        </span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${tier.badgeClass}`}>
                      <CheckCircle2 size={10} className={tier.tier === 'Demonstrated' ? 'text-emerald-700' : 'text-amber-800'} />
                      {tier.tier}
                    </span>
                  </div>

                  <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                    {skill.publicDescription || skill.description || tier.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-secondary-background text-text-secondary border border-border/80">
                    {skill.level || 'Practiced'}
                  </span>

                  <span className="font-mono text-muted flex items-center gap-1 text-[11px]">
                    {projectCount > 0 ? (
                      <span className="text-primary font-bold inline-flex items-center gap-1">
                        <FolderGit2 size={12} /> {projectCount} {projectCount === 1 ? 'Repo' : 'Repos'}
                      </span>
                    ) : evidenceCount > 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                        <FileCheck size={12} /> {evidenceCount} Evidence
                      </span>
                    ) : (
                      <span className="text-muted">Core Foundation</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VERIFIED SKILL EVIDENCE MODAL */}
      {selectedSkillModal && (
        <Modal
          title={`Verified Competency: ${selectedSkillModal.name}`}
          onClose={() => setSelectedSkillModal(null)}
        >
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border mb-1.5 ${selectedSkillModal.engineeringField.bgBadgeClass}`}>
                  {selectedSkillModal.engineeringField.title}
                </span>
                <h3 className="font-display font-bold text-xl text-ink">{selectedSkillModal.name}</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {selectedSkillModal.publicDescription || selectedSkillModal.description || 'Production-verified software engineering capability.'}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                {(() => {
                  const modalTier = getSkillCapabilityTier(selectedSkillModal);
                  return (
                    <div className="text-right font-mono">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${modalTier.badgeClass}`}>
                        <CheckCircle2 size={13} className={modalTier.tier === 'Demonstrated' ? 'text-emerald-700' : 'text-amber-800'} />
                        {modalTier.tier} Status
                      </span>
                      <span className="text-[10px] text-muted block mt-1 font-semibold">{selectedSkillModal.level || 'Practiced'} Tier</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Practical Evidence (Publicly visible proof) */}
            {selectedSkillModal.practicalEvidence && selectedSkillModal.practicalEvidence.length > 0 && (
              <div>
                <h4 className="font-display font-bold text-sm text-ink mb-2 flex items-center gap-1.5">
                  <FileCheck size={15} className="text-primary" /> Practical Evidence & Benchmarks
                </h4>
                <div className="space-y-2">
                  {selectedSkillModal.practicalEvidence.map((ev, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-border bg-surface text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">{ev.title}</span>
                        {ev.url && (
                          <a href={ev.url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1">
                            Link <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      {ev.description && <p className="text-muted text-[11px] leading-relaxed">{ev.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Public Projects */}
            {selectedSkillModal.relatedProjects && selectedSkillModal.relatedProjects.length > 0 && (
              <div>
                <h4 className="font-display font-bold text-sm text-ink mb-2 flex items-center gap-1.5">
                  <FolderGit2 size={15} className="text-primary" /> Related Engineering Projects
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedSkillModal.relatedProjects.map(p => {
                    const isObj = typeof p === 'object' && p !== null;
                    const pTitle = isObj ? p.title : 'Engineering Project';
                    const pSlug = isObj ? p.slug : '';
                    return (
                      <div key={isObj ? p._id : p} className="p-3.5 rounded-xl border border-border bg-surface text-xs space-y-2">
                        <span className="font-bold text-ink block">{pTitle}</span>
                        {isObj && p.description && (
                          <p className="text-muted text-[11px] line-clamp-2 leading-relaxed">{p.description}</p>
                        )}
                        {pSlug && (
                          <a
                            href={`/projects/${pSlug}`}
                            className="text-primary font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                          >
                            View Architecture Specs <ArrowUpRight size={12} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}

export default SkillsVisualSection;
