import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
  Terminal,
  Cpu,
  Server,
  Cloud,
  Shield,
  Layers,
  Code2,
  Activity,
  CheckCircle2,
  TrendingUp,
  Brain,
  GitBranch,
  Star,
  Building2,
  Workflow,
  Layout
} from 'lucide-react';
import { getPalette } from './palettes.js';
import { normalizeTemplateId, getTemplateMeta } from './templatesMeta.js';

// =========================================================================
// EXECUTIVE FALLBACK DATA (GUARANTEES 100% COMPLETE VISIBILITY)
// =========================================================================

export const DEFAULT_RESUME_EXPERIENCE = [
  {
    title: 'Senior Software Engineer / DevOps Lead',
    organization: 'Engineering Workspace Lab',
    location: 'Remote',
    startDate: '2024',
    endDate: 'Present',
    current: true,
    description: 'Directing high-reliability backend microservices, Kubernetes platforms, and automated GitOps pipelines.',
    bullets: [
      'Constructed 20+ production backend systems with Redis caching, PostgreSQL persistence, and sub-25ms response latency.',
      'Engineered automated multi-region deployment pipelines using Docker, Kubernetes, and GitHub Actions with zero downtime.'
    ]
  },
  {
    title: 'Cloud Systems Developer',
    organization: 'Cloud Native Solutions',
    location: 'Hybrid',
    startDate: '2022',
    endDate: '2024',
    current: false,
    description: 'Engineered distributed API gateways, PostgreSQL persistence layers, and automated telemetry.',
    bullets: [
      'Designed REST and ASGI APIs serving 10,000+ requests/minute with cryptographic HMAC verification and JWT RBAC.',
      'Automated multi-cloud infrastructure provisioning using modular Terraform and AWS ECS/EKS clusters.'
    ]
  }
];

export const DEFAULT_RESUME_PROJECTS = [
  {
    title: 'Kubernetes Workload Platform & Cloud IaC',
    subtitle: 'Cloud Native & SRE Platform',
    startDate: '2025',
    endDate: '2026',
    description: 'Production-grade cloud platform featuring automated GitOps delivery, container orchestration, and continuous observability.',
    technologies: ['Kubernetes', 'Docker', 'Terraform', 'Helm', 'AWS', 'GitHub Actions'],
    githubUrl: 'https://github.com/EmaanHumayun/k8s-cloud-platform',
    liveUrl: 'https://k8s.engineeringhub.dev',
    bullets: [
      'Maintained 99.99% service availability across multi-zone cluster deployments with automated TLS cert renewal.',
      'Constructed declarative Helm blueprints and automated Prometheus/Grafana infrastructure alerting.'
    ]
  },
  {
    title: 'Autonomous Multi-Agent Orchestration Framework',
    subtitle: 'AI Systems & RAG Pipelines',
    startDate: '2025',
    endDate: '2026',
    description: 'Directed Acyclic Graph (DAG) multi-agent workflow framework featuring hybrid vector search and structured tool execution.',
    technologies: ['Python', 'FastAPI', 'LangGraph', 'PyTorch', 'Vector DB', 'Pydantic'],
    githubUrl: 'https://github.com/EmaanHumayun/multi-agent-orchestrator',
    liveUrl: 'https://agents.engineeringhub.dev',
    bullets: [
      'Designed dual-tier memory system with short-term sliding context and persistent vector storage.',
      'Achieved 35% improvement in multi-hop query answering through reciprocal rank fusion retrieval.'
    ]
  }
];

export const DEFAULT_RESUME_EDUCATION = [
  {
    title: 'Bachelor of Science in Computer Science',
    organization: 'FAST National University of Computer & Emerging Sciences',
    subtitle: 'Distributed Systems & Operating Systems',
    startDate: '2022',
    endDate: '2026',
    description: 'Focus in Distributed Systems, Operating Systems, Database Architecture, and Computer Networks. Graduated with Honors.'
  }
];

export const DEFAULT_RESUME_CERTIFICATIONS = [
  {
    title: 'Certified Kubernetes Administrator (CKA)',
    organization: 'The Linux Foundation',
    startDate: '2025',
    description: 'Credential ID: LF-CKA-99201'
  },
  {
    title: 'AWS Certified Solutions Architect',
    organization: 'Amazon Web Services',
    startDate: '2025',
    description: 'Credential ID: AWS-SAA-40912'
  },
  {
    title: 'HashiCorp Certified: Terraform Associate',
    organization: 'HashiCorp',
    startDate: '2024',
    description: 'Credential ID: HC-TA-18304'
  }
];

// Helper to calculate realistic skill proficiency
function getSkillProficiency(skillName, index) {
  const map = {
    'Kubernetes': 94,
    'Docker': 96,
    'Terraform': 92,
    'Linux': 95,
    'Node.js': 95,
    'FastAPI': 90,
    'Python': 92,
    'PostgreSQL': 91,
    'Redis': 89,
    'AWS': 90,
    'CI/CD': 93,
    'GitOps': 91,
    'LangGraph': 88,
    'React 18': 88,
    'TypeScript': 90
  };
  if (map[skillName]) return map[skillName];
  const defaults = [95, 92, 90, 88, 87, 85];
  return defaults[index % defaults.length];
}

function getSummaryText(summarySec, resume) {
  if (summarySec?.customContent && summarySec.customContent.trim().length > 0) {
    return summarySec.customContent;
  }
  if (resume.professionalSummary && resume.professionalSummary.trim().length > 0) {
    return resume.professionalSummary;
  }
  return 'Cloud Native & DevOps Architect with 6+ years designing Kubernetes platforms, Terraform IaC, and zero-downtime CI/CD pipelines. Specializes in multi-region infrastructure, autonomous agent workflows, and resilient distributed microservices.';
}

function getSectionEntries(section, fallbackList) {
  if (section && section.entries && section.entries.length > 0) {
    return section.entries;
  }
  return fallbackList;
}

// =========================================================================
// EXECUTIVE CONTACT BAR (FULL CONTACT DETAILS WITH LUCIDE ICONS)
// =========================================================================

export function ProfessionalContactRow({ pi, theme, isDark = false, layout = 'horizontal' }) {
  const iconColor = isDark ? (theme.c2 || '#38bdf8') : (theme.c2 || theme.primary || '#0284c7');
  const textColor = isDark ? '#f3f4f6' : '#292524';

  const cleanDisplay = url => {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  };

  const email = pi.email || 'emaan.humayun@gmail.com';
  const phone = pi.phone || '+92 300 1234567';
  const location = pi.location || 'Lahore, Punjab, Pakistan';
  const linkedinUrl = pi.linkedinUrl || 'https://linkedin.com/in/emaan-humayun';
  const githubUrl = pi.githubUrl || 'https://github.com/EmaanHumayun';
  const portfolioUrl = pi.portfolioUrl || 'https://engineeringhub.dev';

  const items = [
    { icon: Mail, text: email, href: `mailto:${email}` },
    { icon: Phone, text: phone, href: `tel:${phone.replace(/\s+/g, '')}` },
    { icon: MapPin, text: location, href: null },
    { icon: Linkedin, text: cleanDisplay(linkedinUrl), href: linkedinUrl },
    { icon: Github, text: cleanDisplay(githubUrl), href: githubUrl },
    { icon: Globe, text: cleanDisplay(portfolioUrl), href: portfolioUrl }
  ].filter(Boolean);

  if (layout === 'vertical') {
    return (
      <div className="space-y-1.5 text-[10px] font-mono leading-tight" style={{ color: textColor }}>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 break-all">
            <item.icon size={11} style={{ color: iconColor }} className="shrink-0" />
            {item.href ? (
              <a href={item.href} target="_blank" rel="noreferrer" className="hover:underline">
                {item.text}
              </a>
            ) : (
              <span>{item.text}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10.5px] font-mono" style={{ color: textColor }}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5 shrink-0">
          <item.icon size={11} style={{ color: iconColor }} className="shrink-0" />
          {item.href ? (
            <a href={item.href} target="_blank" rel="noreferrer" className="hover:underline">
              {item.text}
            </a>
          ) : (
            <span>{item.text}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// PREMIUM SKILL CHARTS (NO ORDINARY/NORMAL BARS)
// =========================================================================

// 1. CIRCULAR SVG TELEMETRY DIALS
export function CircularSkillGauge({ label, percentage, color, trackColor, size = 46, textColor }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor || '#e2e8f0'}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            style={{ color: textColor || '#1c1917' }}
            className="font-mono text-[9px] font-bold"
          >
            {percentage}%
          </span>
        </div>
      </div>
      <span
        style={{ color: textColor || '#292524' }}
        className="text-[9.5px] font-semibold text-center max-w-[64px] truncate"
        title={label}
      >
        {label}
      </span>
    </div>
  );
}

// 2. SEGMENTED 5-PILL BATTERY METER (DISCRETE REPLACEMENT FOR NORMAL BARS)
export function SegmentedProficiencyChart({ skillsData, theme, maxItems = 3, isDark = false }) {
  const categories = skillsData && skillsData.length > 0
    ? skillsData
    : [
        { name: 'Cloud & Infrastructure', skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS'] },
        { name: 'Backend & Systems', skills: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'] }
      ];

  return (
    <div className="space-y-2">
      {categories.slice(0, 2).map((cat, idx) => {
        const list = maxItems ? cat.skills.slice(0, maxItems) : cat.skills;
        return (
          <div key={idx} className="space-y-1">
            <span
              style={{ color: isDark ? '#ffffff' : theme.c1 }}
              className="font-bold text-[9.5px] uppercase tracking-wider block font-mono"
            >
              {cat.name}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {list.map((sk, sIdx) => {
                const pct = getSkillProficiency(sk, sIdx);
                const filledPills = pct >= 95 ? 5 : pct >= 90 ? 4 : pct >= 80 ? 3 : 2;
                const levelLabel = pct >= 90 ? 'Expert' : 'Advanced';

                return (
                  <div key={sIdx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline text-[9.5px]">
                      <span className={`font-semibold ${isDark ? 'text-white/90' : 'text-stone-800'}`}>
                        {sk}
                      </span>
                      <span
                        style={{ color: theme.c2 }}
                        className="font-mono text-[8.5px] font-bold"
                      >
                        {pct}% · {levelLabel}
                      </span>
                    </div>

                    {/* 5 Distinct Rounded Pill Blocks */}
                    <div className="flex gap-0.5 pt-0.5">
                      {[1, 2, 3, 4, 5].map(seg => (
                        <div
                          key={seg}
                          style={{
                            backgroundColor: seg <= filledPills ? theme.c2 : (theme.c3 || '#e2e8f0')
                          }}
                          className="h-1 flex-1 rounded-full transition-all"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 3. 5-DOT VISUAL RATING SCALE
export function CanvaPro5DotRatingMeters({ skillsData, theme, isDark }) {
  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 6);
  return (
    <div className="space-y-1.5">
      {topSkills.map((sk, idx) => {
        const pct = getSkillProficiency(sk, idx);
        const dotsFilled = pct >= 93 ? 5 : pct >= 86 ? 4 : 3;
        return (
          <div key={idx} className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-medium">
              <span style={{ color: isDark ? '#ffffff' : theme.c1 }}>{sk}</span>
              <span
                style={{ color: theme.c2 }}
                className="font-mono text-[9px] font-semibold"
              >
                {pct}%
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(dot => (
                <div
                  key={dot}
                  style={{
                    backgroundColor:
                      dot <= dotsFilled
                        ? theme.c2
                        : isDark
                        ? 'rgba(255,255,255,0.2)'
                        : theme.c3 || '#e2e8f0'
                  }}
                  className="h-1 flex-1 rounded-full transition"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 4. STAR PRECISION RATINGS (FOR LUXURY GOLD)
function StarRatingChart({ skillsData, theme }) {
  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 6);
  return (
    <div className="grid grid-cols-2 gap-2">
      {topSkills.map((sk, idx) => {
        const pct = getSkillProficiency(sk, idx);
        const stars = pct >= 94 ? 5 : 4;
        return (
          <div key={idx} className="flex items-center justify-between p-1.5 rounded border border-stone-200/80 bg-white shadow-2xs">
            <span className="font-semibold text-[10px] text-stone-800">{sk}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={10}
                  className={star <= stars ? 'fill-[#c5a059] text-[#c5a059]' : 'text-stone-300'}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =========================================================================
// REUSABLE SINGLE-PAGE CONTENT BLOCKS (STRICT TOP 2 ENTRIES, ZERO FLOOD)
// =========================================================================

function ExperienceSectionContent({ entries, theme, bulletShape = 'disc', isDevMonospace = false }) {
  const list = (entries && entries.length > 0 ? entries : DEFAULT_RESUME_EXPERIENCE).slice(0, 2);

  return (
    <div className="space-y-2">
      {list.map((job, idx) => (
        <div key={idx} className="break-inside-avoid space-y-0.5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <span className="font-bold text-[11.5px] text-stone-900 font-sans">{job.title}</span>
              {job.organization && (
                <span className="text-stone-600 font-medium text-[11px]">
                  {' '}· {job.organization} {job.location ? `(${job.location})` : ''}
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500 font-mono shrink-0">
              {job.startDate} — {job.current ? 'Present' : job.endDate}
            </div>
          </div>

          {job.description && (
            <p className="text-[10.5px] text-stone-700 leading-snug">{job.description}</p>
          )}

          {job.bullets && job.bullets.length > 0 && (
            <ul className={`list-${bulletShape} list-outside ml-3.5 space-y-0.5 text-[10.5px] text-stone-700`}>
              {job.bullets.slice(0, 2).map((b, bIdx) => (
                <li key={bIdx} className="leading-snug">
                  {isDevMonospace && <span className="font-mono text-emerald-600 mr-1">$</span>}
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function CanvaProjectCards({ entries, theme }) {
  const list = (entries && entries.length > 0 ? entries : DEFAULT_RESUME_PROJECTS).slice(0, 2);

  const cleanDisplay = url => (url ? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '');

  return (
    <div className="space-y-2">
      {list.map((p, idx) => {
        const linkUrl = p.githubUrl || p.liveUrl || p.url;
        const displayLink = cleanDisplay(linkUrl);

        return (
          <div
            key={idx}
            style={{
              borderColor: theme.c3,
              backgroundColor: theme.c4
            }}
            className="p-2.5 rounded-lg border shadow-2xs break-inside-avoid space-y-1"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[11px] text-stone-900 font-sans">{p.title}</span>
                {displayLink && (
                  <span
                    style={{ color: theme.c2 }}
                    className="text-[9.5px] font-mono hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>{displayLink}</span>
                    <ExternalLink size={9} />
                  </span>
                )}
              </div>
              {p.startDate && (
                <span className="text-[9.5px] text-stone-500 font-mono shrink-0">
                  {p.startDate} {p.endDate ? `— ${p.endDate}` : ''}
                </span>
              )}
            </div>

            {p.description && (
              <p className="text-[10px] text-stone-700 leading-snug">{p.description}</p>
            )}

            {p.technologies && p.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {p.technologies.slice(0, 5).map((t, tIdx) => (
                  <span
                    key={tIdx}
                    style={{
                      backgroundColor: '#ffffff',
                      color: theme.c1,
                      borderColor: theme.c3
                    }}
                    className="px-1.5 py-0.2 rounded text-[9px] font-mono font-medium border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EducationSectionContent({ entries, theme, isDarkSidebar = false }) {
  const list = (entries && entries.length > 0 ? entries : DEFAULT_RESUME_EDUCATION).slice(0, 1);

  return (
    <div className="space-y-1">
      {list.map((edu, idx) => (
        <div key={idx} className="break-inside-avoid space-y-0.5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
            <span
              style={{ color: isDarkSidebar ? '#ffffff' : '#111827' }}
              className="font-bold text-[11px]"
            >
              {edu.title}
            </span>
            <span className="text-[9.5px] text-stone-500 font-mono shrink-0">
              {edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ''}
            </span>
          </div>
          <div
            style={{ color: theme.c2 }}
            className="text-[10.5px] font-medium"
          >
            {edu.organization || edu.subtitle}
          </div>
          {edu.description && (
            <p
              style={{ color: isDarkSidebar ? '#d1d5db' : '#4b5563' }}
              className="text-[10px] leading-snug"
            >
              {edu.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function CertificationsSectionContent({ entries, theme, isDarkSidebar = false }) {
  const list = (entries && entries.length > 0 ? entries : DEFAULT_RESUME_CERTIFICATIONS).slice(0, 3);

  return (
    <div className="flex flex-wrap gap-1.5 pt-0.5">
      {list.map((cert, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: isDarkSidebar ? 'rgba(255,255,255,0.08)' : theme.c4,
            borderColor: isDarkSidebar ? 'rgba(255,255,255,0.15)' : theme.c3,
            color: isDarkSidebar ? '#ffffff' : theme.c1
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] border font-medium"
        >
          <Award size={10} style={{ color: theme.c2 }} className="shrink-0" />
          <span className="font-semibold">{cert.title}</span>
          {cert.organization && (
            <span className="text-[8.5px] opacity-75">· {cert.organization}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// MAIN RESUME RENDERER (10 BEST CANVA PRO SINGLE-PAGE TEMPLATES)
// =========================================================================

export function ResumeRenderer({
  resume,
  zoom = 1,
  id = 'printable-resume',
  className = ''
}) {
  if (!resume) return null;

  const rawTemplateId = resume.templateId || 'modern-executive';
  const canonicalId = normalizeTemplateId(rawTemplateId);
  const meta = getTemplateMeta(canonicalId);
  const theme = resume.theme || getPalette('canva-executive');
  const typography = resume.typography || { fontFamily: 'inter', fontSize: 'normal' };
  const pi = resume.personalInformation || {};
  const sections = (resume.sections || []).filter(s => s.visible !== false);
  const skillsData = resume.skillsData?.categories || [];

  // Font family mappings
  const fontClass = {
    'inter': 'font-sans',
    'dm-sans': 'font-sans',
    'playfair': 'font-serif',
    'merriweather': 'font-serif',
    'jetbrains-mono': 'font-mono'
  }[typography.fontFamily] || 'font-sans';

  // Base font size scaling (Allows user to scale text dynamically: compact -> spacious)
  const fontSizeStyle = {
    'extra-compact': { fontSize: '10px', lineHeight: '1.3' },
    'compact': { fontSize: '10.5px', lineHeight: '1.35' },
    'normal': { fontSize: '11px', lineHeight: '1.4' },
    'medium': { fontSize: '12px', lineHeight: '1.45' },
    'large': { fontSize: '13px', lineHeight: '1.5' },
    'spacious': { fontSize: '14px', lineHeight: '1.55' }
  }[typography.fontSize] || { fontSize: '11px', lineHeight: '1.4' };

  // Page margin mappings (Tuned for single-page A4 elegance)
  const marginPadding = {
    compact: 'p-5 sm:p-6',
    normal: 'p-6 sm:p-7',
    spacious: 'p-7 sm:p-8'
  }[resume.pageSettings?.margins] || 'p-6 sm:p-7';

  // Strict 5-Color Normalization
  const c1 = theme.c1 || theme.primary || '#0f172a';
  const c2 = theme.c2 || theme.accent || '#d97706';
  const c3 = theme.c3 || theme.lightAccent || '#fef3c7';
  const c4 = theme.c4 || theme.sidebarBg || '#f8fafc';
  const c5 = theme.c5 || theme.background || '#ffffff';

  const normalizedTheme = {
    ...theme,
    c1,
    c2,
    c3,
    c4,
    c5,
    primary: c1,
    accent: c2,
    lightAccent: c3,
    sidebarBg: c4,
    background: c5
  };

  // Section Resolvers
  const summarySec = sections.find(s => s.sectionType === 'summary');
  const expSec = sections.find(s => s.sectionType === 'experience');
  const projSec = sections.find(s => s.sectionType === 'projects');
  const eduSec = sections.find(s => s.sectionType === 'education');
  const certSec = sections.find(s => s.sectionType === 'certifications');

  const summaryText = getSummaryText(summarySec, resume);
  const expEntries = getSectionEntries(expSec, DEFAULT_RESUME_EXPERIENCE);
  const projEntries = getSectionEntries(projSec, DEFAULT_RESUME_PROJECTS);
  const eduEntries = getSectionEntries(eduSec, DEFAULT_RESUME_EDUCATION);
  const certEntries = getSectionEntries(certSec, DEFAULT_RESUME_CERTIFICATIONS);

  const sharedProps = {
    resume,
    theme: normalizedTheme,
    pi,
    sections,
    skillsData,
    meta,
    marginPadding,
    summaryText,
    expEntries,
    projEntries,
    eduEntries,
    certEntries
  };

  return (
    <div
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
        transition: 'transform 0.15s ease'
      }}
      className={`resume-canvas-outer mx-auto ${className}`}
    >
      {/* STRICT SINGLE-PAGE A4 CONTAINER (210mm x 297mm, OVERFLOW HIDDEN) */}
      <div
        id={id}
        style={{
          width: '210mm',
          height: '297mm',
          maxHeight: '297mm',
          overflow: 'hidden',
          backgroundColor: c5,
          color: c1,
          boxSizing: 'border-box',
          ...fontSizeStyle
        }}
        className={`resume-paper shadow-2xl border border-stone-200 relative text-left box-border ${fontClass} print:shadow-none print:border-none print:m-0 flex flex-col justify-between`}
      >
        {/* ================= 10 BEST CURATED TEMPLATES ================= */}
        {canonicalId === 'modern-executive' && <ModernExecutiveLayout {...sharedProps} />}
        {canonicalId === 'contemporary-split' && <ContemporarySplitLayout {...sharedProps} />}
        {canonicalId === 'software-engineer' && <SoftwareEngineerLayout {...sharedProps} />}
        {canonicalId === 'data-ai-pro' && <DataAIProLayout {...sharedProps} />}
        {canonicalId === 'devops-engineer' && <DevOpsEngineerLayout {...sharedProps} />}
        {canonicalId === 'creative-portfolio' && <CreativePortfolioLayout {...sharedProps} />}
        {canonicalId === 'luxury-gold' && <LuxuryGoldLayout {...sharedProps} />}
        {canonicalId === 'burgundy-elegance' && <BurgundyEleganceLayout {...sharedProps} />}
        {canonicalId === 'swiss-design' && <SwissDesignLayout {...sharedProps} />}
        {canonicalId === 'ats-classic' && <ATSClassicLayout {...sharedProps} />}
      </div>
    </div>
  );
}

// =========================================================================
// 1. MODERN EXECUTIVE LAYOUT (Template 01)
// Command navy/charcoal band, KPI ribbon, dual-column governance, 5-pill charts
// =========================================================================
function ModernExecutiveLayout({
  theme,
  pi,
  skillsData,
  marginPadding,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  return (
    <div className="flex flex-col h-full justify-between">
      {/* Executive Command Header Band */}
      <div
        style={{
          backgroundColor: theme.c1,
          borderTop: `5px solid ${theme.c2}`
        }}
        className="px-6 py-4 text-white space-y-2.5 shrink-0"
      >
        <div className="flex justify-between items-baseline">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                style={{ backgroundColor: theme.c2, color: theme.c1 }}
                className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-wider uppercase flex items-center gap-1"
              >
                <Briefcase size={10} /> Executive Leadership
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight font-display">{pi.fullName}</h1>
            <p style={{ color: theme.c2 }} className="text-xs font-semibold tracking-wide uppercase">
              {pi.targetRole || pi.headline}
            </p>
          </div>

          {/* Inline Executive KPI Indicators */}
          <div className="hidden sm:flex items-center gap-3 text-right text-[10px] font-mono text-white/80">
            <div>
              <span style={{ color: theme.c2 }} className="font-bold block">10+ Yrs</span>
              <span className="text-[8.5px] uppercase text-white/60">Experience</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <span style={{ color: theme.c2 }} className="font-bold block">99.99%</span>
              <span className="text-[8.5px] uppercase text-white/60">Uptime SLA</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <span style={{ color: theme.c2 }} className="font-bold block">Cloud Native</span>
              <span className="text-[8.5px] uppercase text-white/60">Architecture</span>
            </div>
          </div>
        </div>

        {/* Full Executive Contact Row */}
        <ProfessionalContactRow pi={pi} theme={theme} isDark={true} />
      </div>

      {/* Main Content Body (Balanced Dual Column) */}
      <div className={`flex-1 ${marginPadding} space-y-3.5 flex flex-col justify-between`}>
        {/* Executive Summary Callout Box */}
        {summaryText && (
          <div
            style={{
              backgroundColor: theme.c4,
              borderLeft: `3px solid ${theme.c2}`,
              borderColor: theme.c3
            }}
            className="p-2.5 rounded-r-lg border-y border-r shadow-2xs shrink-0"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles size={12} style={{ color: theme.c2 }} />
              <span style={{ color: theme.c1 }} className="font-bold text-[10px] uppercase tracking-wider font-mono">
                Executive Synthesis
              </span>
            </div>
            <p className="text-[10.5px] text-stone-800 leading-snug font-sans">{summaryText}</p>
          </div>
        )}

        {/* Two-Column Grid */}
        <div className="grid grid-cols-12 gap-5 flex-1 items-start">
          {/* Main 7-Column Work Experience & Projects Track */}
          <div className="col-span-7 space-y-3.5">
            <div className="space-y-2">
              <div style={{ borderColor: theme.c1 }} className="pb-1 border-b-2 flex items-center justify-between">
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Briefcase size={12} style={{ color: theme.c2 }} /> Career Trajectory &amp; Leadership
                </h2>
              </div>
              <ExperienceSectionContent entries={expEntries} theme={theme} />
            </div>

            <div className="space-y-2">
              <div style={{ borderColor: theme.c1 }} className="pb-1 border-b-2 flex items-center justify-between">
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Code2 size={12} style={{ color: theme.c2 }} /> Production Architecture Deliverables
                </h2>
              </div>
              <CanvaProjectCards entries={projEntries} theme={theme} />
            </div>
          </div>

          {/* Right 5-Column Governance, Skills & Education */}
          <div className="col-span-5 space-y-3">
            <div className="space-y-1.5">
              <div style={{ borderColor: theme.c1 }} className="pb-1 border-b-2 flex items-center justify-between">
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <TrendingUp size={12} style={{ color: theme.c2 }} /> Technical Competencies
                </h2>
              </div>
              <SegmentedProficiencyChart skillsData={skillsData} theme={theme} maxItems={3} />
            </div>

            <div className="space-y-1.5">
              <div style={{ borderColor: theme.c1 }} className="pb-1 border-b-2 flex items-center justify-between">
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <GraduationCap size={12} style={{ color: theme.c2 }} /> Academic Foundations
                </h2>
              </div>
              <EducationSectionContent entries={eduEntries} theme={theme} />
            </div>

            <div className="space-y-1.5">
              <div style={{ borderColor: theme.c1 }} className="pb-1 border-b-2 flex items-center justify-between">
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Award size={12} style={{ color: theme.c2 }} /> Certifications
                </h2>
              </div>
              <CertificationsSectionContent entries={certEntries} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. CONTEMPORARY SPLIT LAYOUT (Template 02)
// 35% colored architectural left sidebar + circular SVG gauges + 65% right body
// =========================================================================
function ContemporarySplitLayout({
  theme,
  pi,
  skillsData,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  const initials = pi.fullName
    ? pi.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'EH';

  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 4);

  return (
    <div className="flex h-full">
      {/* Left 35% Colored Architectural Sidebar */}
      <div
        style={{
          width: '35%',
          backgroundColor: theme.c4,
          borderRight: `2px solid ${theme.c3}`
        }}
        className="p-5 space-y-4 shrink-0 flex flex-col justify-between"
      >
        <div className="space-y-3.5">
          {/* Monogram Seal Avatar */}
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div
              style={{
                backgroundColor: theme.c1,
                color: '#ffffff',
                borderColor: theme.c2
              }}
              className="w-13 h-13 rounded-xl border-2 flex items-center justify-center font-display font-black text-lg shadow-xs"
            >
              {initials}
            </div>
            <div>
              <h3 style={{ color: theme.c1 }} className="font-bold text-sm leading-tight">{pi.fullName}</h3>
              <span style={{ color: theme.c2 }} className="text-[10px] font-medium block">{pi.targetRole}</span>
            </div>
          </div>

          {/* Full Contact with Icons */}
          <div className="space-y-1.5 border-t pt-2.5">
            <span style={{ color: theme.c1 }} className="font-mono text-[9.5px] font-bold uppercase tracking-wider block">
              Contact
            </span>
            <ProfessionalContactRow pi={pi} theme={theme} layout="vertical" />
          </div>

          {/* Circular SVG Skill Gauges */}
          <div className="space-y-1.5 border-t pt-2.5">
            <span style={{ color: theme.c1 }} className="font-mono text-[9.5px] font-bold uppercase tracking-wider block">
              Core Competencies
            </span>
            <div className="grid grid-cols-2 gap-2 py-0.5">
              {topSkills.map((sk, idx) => (
                <CircularSkillGauge
                  key={idx}
                  label={sk}
                  percentage={getSkillProficiency(sk, idx)}
                  color={theme.c2}
                  trackColor={theme.c3}
                  textColor={theme.c1}
                  size={42}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Education & Certs in Sidebar */}
        <div className="space-y-2.5 border-t pt-2.5">
          <div className="space-y-1">
            <span style={{ color: theme.c1 }} className="font-mono text-[9.5px] font-bold uppercase tracking-wider block">
              Education
            </span>
            <EducationSectionContent entries={eduEntries} theme={theme} />
          </div>

          <div className="space-y-1">
            <span style={{ color: theme.c1 }} className="font-mono text-[9.5px] font-bold uppercase tracking-wider block">
              Certifications
            </span>
            <CertificationsSectionContent entries={certEntries} theme={theme} />
          </div>
        </div>
      </div>

      {/* Right 65% White Main Body */}
      <div className="flex-1 p-6 space-y-3.5 flex flex-col justify-between">
        {/* Header Ribbon */}
        <div className="border-b pb-2 space-y-0.5">
          <h1 style={{ color: theme.c1 }} className="text-2xl font-black tracking-tight font-display">
            {pi.fullName}
          </h1>
          <p style={{ color: theme.c2 }} className="text-xs font-semibold tracking-wider uppercase font-mono">
            {pi.targetRole || pi.headline}
          </p>
        </div>

        {/* Executive Summary */}
        {summaryText && (
          <div className="space-y-1">
            <span style={{ color: theme.c1 }} className="font-mono text-[10px] font-bold uppercase tracking-wider block">
              Executive Profile
            </span>
            <p className="text-[10.5px] text-stone-700 leading-snug font-sans">{summaryText}</p>
          </div>
        )}

        {/* Career Experience */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: theme.c2 }}>
            <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Briefcase size={12} style={{ color: theme.c2 }} /> Professional Experience
            </h2>
          </div>
          <ExperienceSectionContent entries={expEntries} theme={theme} />
        </div>

        {/* Engineering Projects */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: theme.c2 }}>
            <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Code2 size={12} style={{ color: theme.c2 }} /> Key Technical Projects
            </h2>
          </div>
          <CanvaProjectCards entries={projEntries} theme={theme} />
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. SOFTWARE ENGINEER PRO LAYOUT (Template 03)
// macOS traffic lights, active git branch, monospace docstring, prompt $ bullets
// =========================================================================
function SoftwareEngineerLayout({
  theme,
  pi,
  skillsData,
  marginPadding,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  return (
    <div className="flex flex-col h-full justify-between">
      {/* Terminal Title Bar */}
      <div
        style={{ backgroundColor: theme.c1 }}
        className="px-5 py-2 text-white flex items-center justify-between font-mono text-xs shrink-0"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-white/70 ml-2 text-[10px] flex items-center gap-1">
            <Terminal size={11} /> dev-workspace — zsh
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/80">
          <span className="px-1.5 py-0.2 rounded bg-white/10 text-emerald-300 font-bold flex items-center gap-1">
            <GitBranch size={9} /> git:(main)
          </span>
          <span className="text-emerald-400">● clean</span>
        </div>
      </div>

      <div className={`${marginPadding} space-y-3 flex-1 flex flex-col justify-between text-stone-900`}>
        {/* Developer Header */}
        <div className="pb-2 border-b-2 border-stone-800 space-y-1.5">
          <div className="flex justify-between items-baseline">
            <div>
              <h1 className="text-2xl font-black tracking-tight font-mono">{pi.fullName}</h1>
              <p style={{ color: theme.c2 }} className="text-xs font-bold uppercase tracking-wider font-mono">
                // {pi.targetRole || pi.headline}
              </p>
            </div>
          </div>
          <ProfessionalContactRow pi={pi} theme={theme} />
        </div>

        {/* Docstring Summary */}
        {summaryText && (
          <div
            style={{ backgroundColor: theme.c4, borderColor: theme.c3 }}
            className="p-2.5 rounded-lg border font-mono text-[10.5px] text-stone-800 space-y-0.5 shadow-2xs shrink-0"
          >
            <span style={{ color: theme.c2 }} className="block font-bold">/**</span>
            <p className="pl-3 leading-snug font-sans text-stone-700">{summaryText}</p>
            <span style={{ color: theme.c2 }} className="block font-bold"> */</span>
          </div>
        )}

        {/* 2-Column Developer Layout */}
        <div className="grid grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Code & Deliverables */}
          <div className="col-span-7 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 border-b border-stone-300 pb-0.5">
                <span className="font-mono text-xs font-bold text-emerald-600">$</span>
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  git log --engineering-experience
                </h2>
              </div>
              <ExperienceSectionContent entries={expEntries} theme={theme} isDevMonospace={true} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 border-b border-stone-300 pb-0.5">
                <span className="font-mono text-xs font-bold text-emerald-600">$</span>
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  ls ./production-repositories
                </h2>
              </div>
              <CanvaProjectCards entries={projEntries} theme={theme} />
            </div>
          </div>

          {/* Right Column: Stack & Credentials */}
          <div className="col-span-5 space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 border-b border-stone-300 pb-0.5">
                <span className="font-mono text-xs font-bold text-emerald-600">$</span>
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  cat ./tech_stack
                </h2>
              </div>
              <SegmentedProficiencyChart skillsData={skillsData} theme={theme} maxItems={3} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 border-b border-stone-300 pb-0.5">
                <span className="font-mono text-xs font-bold text-emerald-600">$</span>
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  cat ./education
                </h2>
              </div>
              <EducationSectionContent entries={eduEntries} theme={theme} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 border-b border-stone-300 pb-0.5">
                <span className="font-mono text-xs font-bold text-emerald-600">$</span>
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  cat ./certifications
                </h2>
              </div>
              <CertificationsSectionContent entries={certEntries} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. DATA & AI SPECIALIST LAYOUT (Template 04)
// AI & ML lab styling, circular model accuracy gauges, neural framework tags
// =========================================================================
function DataAIProLayout({
  theme,
  pi,
  skillsData,
  marginPadding,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  const aiAccent = '#7c3aed';
  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 4);

  return (
    <div className="flex flex-col h-full justify-between">
      {/* AI Telemetry Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.c1} 0%, #1e1b4b 100%)`,
          borderBottom: `3px solid ${aiAccent}`
        }}
        className="px-6 py-4 text-white space-y-2 shrink-0"
      >
        <div className="flex justify-between items-center text-[9.5px] font-mono text-purple-300">
          <span className="flex items-center gap-1.5"><Cpu size={11} /> MODEL ARCHITECTURE · MULTI-AGENT RAG · DEEP LEARNING</span>
          <span className="px-1.5 py-0.2 rounded bg-purple-900/60 border border-purple-500 font-bold">PyTorch 2.4</span>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{pi.fullName}</h1>
          <p style={{ color: '#c084fc' }} className="text-xs font-bold uppercase tracking-widest mt-0.5">
            {pi.targetRole || pi.headline}
          </p>
        </div>
        <ProfessionalContactRow pi={pi} theme={{ ...theme, c2: '#c084fc' }} isDark={true} />
      </div>

      <div className={`flex-1 ${marginPadding} space-y-3 flex flex-col justify-between text-stone-900`}>
        {/* Research & Engineering Summary */}
        {summaryText && (
          <p className="text-[10.5px] text-stone-800 leading-snug font-sans shrink-0">{summaryText}</p>
        )}

        {/* 2-Column AI Grid */}
        <div className="grid grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: AI & ML Systems */}
          <div className="col-span-7 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: aiAccent }}>
                <Brain size={12} style={{ color: aiAccent }} />
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  ML &amp; AI Systems Engineering
                </h2>
              </div>
              <ExperienceSectionContent entries={expEntries} theme={{ ...theme, c2: aiAccent }} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: aiAccent }}>
                <Workflow size={12} style={{ color: aiAccent }} />
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  Applied AI &amp; Agentic Frameworks
                </h2>
              </div>
              <CanvaProjectCards entries={projEntries} theme={{ ...theme, c2: aiAccent }} />
            </div>
          </div>

          {/* Right Column: Model Accuracy Gauges & Tech */}
          <div className="col-span-5 space-y-2.5">
            {/* Circular Model Accuracy Rings */}
            <div
              style={{ backgroundColor: theme.c4, borderColor: theme.c3 }}
              className="p-2.5 rounded-lg border shadow-2xs space-y-1"
            >
              <span style={{ color: aiAccent }} className="font-mono text-[9.5px] font-bold uppercase tracking-wider block flex items-center gap-1">
                <Activity size={11} /> Model Accuracy &amp; Telemetry
              </span>
              <div className="flex justify-around gap-2 py-0.5">
                {topSkills.map((sk, idx) => (
                  <CircularSkillGauge
                    key={idx}
                    label={sk}
                    percentage={getSkillProficiency(sk, idx)}
                    color={aiAccent}
                    trackColor={theme.c3}
                    textColor={theme.c1}
                    size={40}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: aiAccent }}>
                <Layers size={11} style={{ color: aiAccent }} />
                <h2 style={{ color: theme.c1 }} className="text-[10.5px] font-bold uppercase tracking-wider font-mono">
                  Neural Toolchain
                </h2>
              </div>
              <SegmentedProficiencyChart skillsData={skillsData} theme={{ ...theme, c2: aiAccent }} maxItems={3} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: aiAccent }}>
                <GraduationCap size={11} style={{ color: aiAccent }} />
                <h2 style={{ color: theme.c1 }} className="text-[10.5px] font-bold uppercase tracking-wider font-mono">
                  Academic Foundations
                </h2>
              </div>
              <EducationSectionContent entries={eduEntries} theme={theme} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: aiAccent }}>
                <Award size={11} style={{ color: aiAccent }} />
                <h2 style={{ color: theme.c1 }} className="text-[10.5px] font-bold uppercase tracking-wider font-mono">
                  Certifications
                </h2>
              </div>
              <CertificationsSectionContent entries={certEntries} theme={{ ...theme, c2: aiAccent }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5. DEVOPS & CLOUD ARCHITECT LAYOUT (Template 05)
// CNCF platform styling, 99.99% SLA banner, K8s/Terraform infrastructure cards
// =========================================================================
function DevOpsEngineerLayout({
  theme,
  pi,
  skillsData,
  marginPadding,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  const k8sBlue = '#0284c7';

  return (
    <div className="flex flex-col h-full justify-between">
      {/* CNCF Cloud Native Dashboard Header */}
      <div
        style={{
          backgroundColor: '#0f172a',
          borderTop: `4px solid ${k8sBlue}`
        }}
        className="px-6 py-3.5 text-white space-y-2 shrink-0"
      >
        <div className="flex justify-between items-baseline">
          <div>
            <div className="flex items-center gap-1 text-sky-400 font-mono text-[9.5px] font-bold uppercase tracking-wider mb-0.5">
              <Cloud size={11} /> Cloud Native Platform &amp; SRE Infrastructure
            </div>
            <h1 className="text-2xl font-black tracking-tight font-display">{pi.fullName}</h1>
            <p className="text-xs text-sky-300 font-semibold">{pi.targetRole || pi.headline}</p>
          </div>

          {/* 99.99% SLA Uptime Strip */}
          <div
            style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)' }}
            className="hidden sm:flex items-center gap-2.5 p-1.5 rounded-lg border text-center font-mono text-[9.5px]"
          >
            <div>
              <span className="text-emerald-400 font-bold block">99.99% SLA</span>
              <span className="text-[8px] text-white/60 uppercase">Uptime</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div>
              <span className="text-sky-400 font-bold block">Kubernetes</span>
              <span className="text-[8px] text-white/60 uppercase">Fleet</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div>
              <span className="text-amber-400 font-bold block">Terraform</span>
              <span className="text-[8px] text-white/60 uppercase">IaC</span>
            </div>
          </div>
        </div>

        {/* Full Contact with Icons */}
        <ProfessionalContactRow pi={pi} theme={{ ...theme, c2: '#38bdf8' }} isDark={true} />
      </div>

      <div className={`flex-1 ${marginPadding} space-y-3 flex flex-col justify-between text-stone-900`}>
        {summaryText && (
          <p className="text-[10.5px] text-stone-800 leading-snug font-sans shrink-0">{summaryText}</p>
        )}

        {/* 2-Column Cloud Infrastructure Grid */}
        <div className="grid grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Cloud Platforms & Projects */}
          <div className="col-span-7 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: k8sBlue }}>
                <Server size={12} style={{ color: k8sBlue }} />
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  Cloud Infrastructure &amp; SRE Platforms
                </h2>
              </div>
              <ExperienceSectionContent entries={expEntries} theme={{ ...theme, c2: k8sBlue }} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: k8sBlue }}>
                <Cloud size={12} style={{ color: k8sBlue }} />
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  IaC &amp; GitOps Production Deliverables
                </h2>
              </div>
              <CanvaProjectCards entries={projEntries} theme={{ ...theme, c2: k8sBlue }} />
            </div>
          </div>

          {/* Right Column: Cloud Toolchain & Certs */}
          <div className="col-span-5 space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: k8sBlue }}>
                <Shield size={11} style={{ color: k8sBlue }} />
                <h2 style={{ color: theme.c1 }} className="text-[10.5px] font-bold uppercase tracking-wider font-mono">
                  Cloud Native Toolchain
                </h2>
              </div>
              <SegmentedProficiencyChart skillsData={skillsData} theme={{ ...theme, c2: k8sBlue }} maxItems={3} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: k8sBlue }}>
                <GraduationCap size={11} style={{ color: k8sBlue }} />
                <h2 style={{ color: theme.c1 }} className="text-[10.5px] font-bold uppercase tracking-wider font-mono">
                  Academic Degree
                </h2>
              </div>
              <EducationSectionContent entries={eduEntries} theme={theme} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 border-b pb-0.5" style={{ borderColor: k8sBlue }}>
                <Award size={11} style={{ color: k8sBlue }} />
                <h2 style={{ color: theme.c1 }} className="text-[10.5px] font-bold uppercase tracking-wider font-mono">
                  Cloud Credentials (CKA, AWS, Terraform)
                </h2>
              </div>
              <CertificationsSectionContent entries={certEntries} theme={{ ...theme, c2: k8sBlue }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 6. CREATIVE PORTFOLIO LAYOUT (Template 06)
// Featured builds prominently presented, 5-dot rating meters, high-impact cards
// =========================================================================
function CreativePortfolioLayout({
  theme,
  pi,
  skillsData,
  marginPadding,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  return (
    <div className="flex flex-col h-full justify-between">
      {/* Showcase Hero Header */}
      <div
        style={{
          backgroundColor: theme.c1,
          color: '#ffffff'
        }}
        className="px-6 py-4 rounded-b-xl flex flex-col justify-between gap-2 shrink-0"
      >
        <div className="flex justify-between items-baseline">
          <div>
            <span style={{ color: theme.c2 }} className="text-[9.5px] font-mono font-bold tracking-widest uppercase block flex items-center gap-1">
              <Layout size={10} /> CREATIVE ENGINEER &amp; ARCHITECT
            </span>
            <h1 className="text-2xl font-black tracking-tight">{pi.fullName}</h1>
            <p className="text-xs text-white/80 mt-0.5">{pi.targetRole}</p>
          </div>
        </div>
        <ProfessionalContactRow pi={pi} theme={theme} isDark={true} />
      </div>

      <div className={`flex-1 ${marginPadding} space-y-3 flex flex-col justify-between text-stone-900`}>
        {summaryText && (
          <p className="text-[10.5px] text-stone-700 leading-snug font-sans shrink-0">{summaryText}</p>
        )}

        {/* 2-Column Creative Grid */}
        <div className="grid grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Featured Work & Experience */}
          <div className="col-span-7 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-0.5 border-b-2" style={{ borderColor: theme.c2 }}>
                <h2 style={{ color: theme.c1 }} className="text-[11px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Code2 size={11} style={{ color: theme.c2 }} /> Featured Architectural Builds
                </h2>
              </div>
              <CanvaProjectCards entries={projEntries} theme={theme} />
            </div>

            <div className="space-y-1.5">
              <h2 style={{ color: theme.c1 }} className="text-[11px] font-black uppercase tracking-wider font-mono border-b pb-0.5 flex items-center gap-1.5">
                <Briefcase size={11} style={{ color: theme.c2 }} /> Engineering Trajectory
              </h2>
              <ExperienceSectionContent entries={expEntries} theme={theme} />
            </div>
          </div>

          {/* Right Column: 5-Dot Skills & Education */}
          <div className="col-span-5 space-y-2.5">
            <div className="space-y-1">
              <h2 style={{ color: theme.c1 }} className="text-[10.5px] font-black uppercase tracking-wider font-mono border-b pb-0.5 flex items-center gap-1.5">
                <TrendingUp size={11} style={{ color: theme.c2 }} /> Technical Arsenal
              </h2>
              <CanvaPro5DotRatingMeters skillsData={skillsData} theme={theme} />
            </div>

            <div className="space-y-1">
              <h2 style={{ color: theme.c1 }} className="text-[10.5px] font-black uppercase tracking-wider font-mono border-b pb-0.5 flex items-center gap-1.5">
                <GraduationCap size={11} style={{ color: theme.c2 }} /> Education
              </h2>
              <EducationSectionContent entries={eduEntries} theme={theme} />
            </div>

            <div className="space-y-1">
              <h2 style={{ color: theme.c1 }} className="text-[10.5px] font-black uppercase tracking-wider font-mono border-b pb-0.5 flex items-center gap-1.5">
                <Award size={11} style={{ color: theme.c2 }} /> Certifications
              </h2>
              <CertificationsSectionContent entries={certEntries} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 7. LUXURY GOLD & CHAMPAGNE LAYOUT (Template 07)
// Opulent ivory canvas, gold hairline border, monogram, 5-star precision ratings
// =========================================================================
function LuxuryGoldLayout({
  theme,
  pi,
  skillsData,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  const goldColor = '#c5a059';
  const initials = pi.fullName
    ? pi.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'EH';

  return (
    <div
      style={{
        backgroundColor: '#fdfbf7',
        borderColor: goldColor
      }}
      className="h-full p-6 border-3 text-stone-900 space-y-3 font-serif flex flex-col justify-between"
    >
      {/* Luxury Crest & Header */}
      <div className="text-center space-y-1.5 pb-2 border-b border-[#c5a059]/40 shrink-0">
        <div className="flex justify-center">
          <div
            style={{ borderColor: goldColor, color: goldColor }}
            className="w-11 h-11 rounded-full border-2 flex items-center justify-center font-display font-bold text-base shadow-2xs"
          >
            {initials}
          </div>
        </div>
        <h1 className="text-2xl font-normal tracking-wide text-stone-900 font-serif">
          {pi.fullName}
        </h1>
        <p style={{ color: goldColor }} className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold">
          {pi.targetRole || pi.headline}
        </p>
        <div className="flex justify-center pt-0.5 font-sans">
          <ProfessionalContactRow pi={pi} theme={{ ...theme, c2: goldColor }} />
        </div>
      </div>

      {/* Summary */}
      {summaryText && (
        <p className="text-[10.5px] text-stone-800 leading-snug font-sans text-center max-w-xl mx-auto shrink-0">
          {summaryText}
        </p>
      )}

      {/* 2-Column Luxury Flow */}
      <div className="grid grid-cols-12 gap-5 flex-1 items-start font-sans">
        {/* Left Column: Career & Projects */}
        <div className="col-span-7 space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 pb-0.5 border-b" style={{ borderColor: goldColor }}>
              <Briefcase size={11} style={{ color: goldColor }} />
              <h2 className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-stone-900 font-serif">
                Career History
              </h2>
            </div>
            <ExperienceSectionContent entries={expEntries} theme={{ ...theme, c2: goldColor }} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 pb-0.5 border-b" style={{ borderColor: goldColor }}>
              <Code2 size={11} style={{ color: goldColor }} />
              <h2 className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-stone-900 font-serif">
                Engineering Deliverables
              </h2>
            </div>
            <CanvaProjectCards entries={projEntries} theme={{ ...theme, c2: goldColor }} />
          </div>
        </div>

        {/* Right Column: 5-Star Ratings & Education */}
        <div className="col-span-5 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 pb-0.5 border-b" style={{ borderColor: goldColor }}>
              <Star size={11} style={{ color: goldColor }} />
              <h2 className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-stone-900 font-serif">
                Core Competence Ratings
              </h2>
            </div>
            <StarRatingChart skillsData={skillsData} theme={{ ...theme, c2: goldColor }} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 pb-0.5 border-b" style={{ borderColor: goldColor }}>
              <GraduationCap size={11} style={{ color: goldColor }} />
              <h2 className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-stone-900 font-serif">
                Academic Degree
              </h2>
            </div>
            <EducationSectionContent entries={eduEntries} theme={theme} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 pb-0.5 border-b" style={{ borderColor: goldColor }}>
              <Award size={11} style={{ color: goldColor }} />
              <h2 className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-stone-900 font-serif">
                Credentials
              </h2>
            </div>
            <CertificationsSectionContent entries={certEntries} theme={{ ...theme, c2: goldColor }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 8. BURGUNDY ELEGANCE LAYOUT (Template 08)
// Bordeaux burgundy ribbon, gold accents, vertical timeline nodes
// =========================================================================
function BurgundyEleganceLayout({
  theme,
  pi,
  skillsData,
  marginPadding,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  const burgundy = '#581825';

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Bordeaux Burgundy Top Header */}
      <div
        style={{
          backgroundColor: burgundy,
          borderBottom: '2.5px solid #d4af37'
        }}
        className="px-6 py-4 text-white text-center space-y-1.5 shrink-0"
      >
        <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#d4af37] font-bold block">
          EXECUTIVE PORTFOLIO
        </span>
        <h1 className="text-2xl font-serif tracking-wide">{pi.fullName}</h1>
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/90 font-sans font-semibold">
          {pi.targetRole || pi.headline}
        </p>
        <div className="flex justify-center pt-0.5 font-sans">
          <ProfessionalContactRow pi={pi} theme={{ ...theme, c2: '#d4af37' }} isDark={true} />
        </div>
      </div>

      <div className={`${marginPadding} space-y-3 flex-1 flex flex-col justify-between text-stone-900`}>
        {summaryText && (
          <div style={{ backgroundColor: '#fbf7f4', borderColor: burgundy }} className="p-2 border-l-3 rounded-r shrink-0">
            <p className="text-[10.5px] text-stone-800 leading-snug font-sans">{summaryText}</p>
          </div>
        )}

        {/* 2-Column Burgundy Flow */}
        <div className="grid grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Timeline Experience & Projects */}
          <div className="col-span-7 space-y-3">
            <div className="space-y-1.5">
              <div style={{ borderColor: burgundy }} className="pb-0.5 border-b-2 flex items-center gap-1.5">
                <Briefcase size={11} style={{ color: burgundy }} />
                <h2 style={{ color: burgundy }} className="text-[11px] font-bold uppercase tracking-wider font-serif">
                  Professional Trajectory
                </h2>
              </div>
              <ExperienceSectionContent entries={expEntries} theme={{ ...theme, c2: burgundy }} />
            </div>

            <div className="space-y-1.5">
              <div style={{ borderColor: burgundy }} className="pb-0.5 border-b-2 flex items-center gap-1.5">
                <Code2 size={11} style={{ color: burgundy }} />
                <h2 style={{ color: burgundy }} className="text-[11px] font-bold uppercase tracking-wider font-serif">
                  Key Projects
                </h2>
              </div>
              <CanvaProjectCards entries={projEntries} theme={{ ...theme, c2: burgundy }} />
            </div>
          </div>

          {/* Right Column: Competencies & Credentials */}
          <div className="col-span-5 space-y-2.5">
            <div className="space-y-1">
              <div style={{ borderColor: burgundy }} className="pb-0.5 border-b-2 flex items-center gap-1.5">
                <TrendingUp size={11} style={{ color: burgundy }} />
                <h2 style={{ color: burgundy }} className="text-[10.5px] font-bold uppercase tracking-wider font-serif">
                  Technical Competencies
                </h2>
              </div>
              <SegmentedProficiencyChart skillsData={skillsData} theme={{ ...theme, c2: burgundy }} maxItems={3} />
            </div>

            <div className="space-y-1">
              <div style={{ borderColor: burgundy }} className="pb-0.5 border-b-2 flex items-center gap-1.5">
                <GraduationCap size={11} style={{ color: burgundy }} />
                <h2 style={{ color: burgundy }} className="text-[10.5px] font-bold uppercase tracking-wider font-serif">
                  Education
                </h2>
              </div>
              <EducationSectionContent entries={eduEntries} theme={theme} />
            </div>

            <div className="space-y-1">
              <div style={{ borderColor: burgundy }} className="pb-0.5 border-b-2 flex items-center gap-1.5">
                <Award size={11} style={{ color: burgundy }} />
                <h2 style={{ color: burgundy }} className="text-[10.5px] font-bold uppercase tracking-wider font-serif">
                  Certifications
                </h2>
              </div>
              <CertificationsSectionContent entries={certEntries} theme={{ ...theme, c2: burgundy }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 9. SWISS DESIGN GRID LAYOUT (Template 09)
// Mathematical grid, numbered sections (01/ 02/ 03/), high information density
// =========================================================================
function SwissDesignLayout({
  theme,
  pi,
  skillsData,
  marginPadding,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  const swissRed = '#e11d48';

  return (
    <div className={`${marginPadding} h-full space-y-3 text-black font-sans flex flex-col justify-between`}>
      {/* Swiss Header */}
      <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 border-black shrink-0">
        <div className="col-span-8 space-y-0.5">
          <div style={{ backgroundColor: swissRed }} className="w-7 h-1 mb-1" />
          <h1 className="text-2xl font-black tracking-tighter uppercase">{pi.fullName}</h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-600">
            {pi.targetRole || pi.headline}
          </p>
        </div>
        <div className="col-span-4 flex justify-end">
          <ProfessionalContactRow pi={pi} theme={{ ...theme, c2: swissRed }} layout="vertical" />
        </div>
      </div>

      {/* 01 / SUMMARY */}
      {summaryText && (
        <div className="grid grid-cols-12 gap-3 shrink-0">
          <div className="col-span-3">
            <span className="font-mono text-[11px] font-black block">01 /</span>
            <span className="text-[10px] font-black uppercase tracking-wider block text-stone-800">
              SUMMARY
            </span>
          </div>
          <div className="col-span-9">
            <p className="text-[10.5px] text-stone-800 leading-snug font-sans">{summaryText}</p>
          </div>
        </div>
      )}

      {/* 02 / SKILLS */}
      <div className="grid grid-cols-12 gap-3 shrink-0">
        <div className="col-span-3">
          <span className="font-mono text-[11px] font-black block">02 /</span>
          <span className="text-[10px] font-black uppercase tracking-wider block text-stone-800">
            SKILLS
          </span>
        </div>
        <div className="col-span-9">
          <SegmentedProficiencyChart skillsData={skillsData} theme={{ ...theme, c2: swissRed }} maxItems={3} />
        </div>
      </div>

      {/* 03 / EXPERIENCE */}
      <div className="grid grid-cols-12 gap-3 flex-1 items-start">
        <div className="col-span-3">
          <span className="font-mono text-[11px] font-black block">03 /</span>
          <span className="text-[10px] font-black uppercase tracking-wider block text-stone-800">
            EXPERIENCE
          </span>
        </div>
        <div className="col-span-9">
          <ExperienceSectionContent entries={expEntries} theme={{ ...theme, c2: swissRed }} />
        </div>
      </div>

      {/* 04 / PROJECTS */}
      <div className="grid grid-cols-12 gap-3 shrink-0">
        <div className="col-span-3">
          <span className="font-mono text-[11px] font-black block">04 /</span>
          <span className="text-[10px] font-black uppercase tracking-wider block text-stone-800">
            PROJECTS
          </span>
        </div>
        <div className="col-span-9">
          <CanvaProjectCards entries={projEntries} theme={{ ...theme, c2: swissRed }} />
        </div>
      </div>

      {/* 05 / EDUCATION & CERTS */}
      <div className="grid grid-cols-12 gap-3 shrink-0 border-t pt-2">
        <div className="col-span-3">
          <span className="font-mono text-[11px] font-black block">05 /</span>
          <span className="text-[10px] font-black uppercase tracking-wider block text-stone-800">
            CREDENTIALS
          </span>
        </div>
        <div className="col-span-9 grid grid-cols-2 gap-3">
          <EducationSectionContent entries={eduEntries} theme={theme} />
          <CertificationsSectionContent entries={certEntries} theme={{ ...theme, c2: swissRed }} />
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 10. ATS UNIVERSAL CLASSIC LAYOUT (Template 10)
// 100% ATS parser compliant single-column document, standard headings, bulletproof
// =========================================================================
function ATSClassicLayout({
  theme,
  pi,
  skillsData,
  marginPadding,
  summaryText,
  expEntries,
  projEntries,
  eduEntries,
  certEntries
}) {
  return (
    <div className={`${marginPadding} h-full space-y-2.5 text-stone-900 font-sans flex flex-col justify-between`}>
      {/* 100% Parser Compliant Header */}
      <div className="text-center pb-1.5 border-b border-stone-800 space-y-0.5 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-black font-sans uppercase">
          {pi.fullName}
        </h1>
        <p className="text-[11px] font-semibold text-stone-800 uppercase tracking-wider">
          {pi.targetRole || pi.headline}
        </p>
        <div className="text-[10px] text-stone-700 space-y-0.5 pt-0.5 font-mono">
          <div>
            {pi.location} | {pi.phone} | {pi.email}
          </div>
          <div className="flex justify-center gap-3">
            {pi.linkedinUrl && <span>LinkedIn: {pi.linkedinUrl.replace(/^https?:\/\//, '')}</span>}
            {pi.githubUrl && <span>GitHub: {pi.githubUrl.replace(/^https?:\/\//, '')}</span>}
            {pi.portfolioUrl && <span>Portfolio: {pi.portfolioUrl.replace(/^https?:\/\//, '')}</span>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {summaryText && (
        <div className="space-y-0.5 break-inside-avoid shrink-0">
          <div className="border-b border-stone-800 pb-0.2">
            <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-black font-sans">
              PROFESSIONAL SUMMARY
            </h2>
          </div>
          <p className="text-[10.5px] text-stone-800 leading-snug font-sans">{summaryText}</p>
        </div>
      )}

      {/* Skills */}
      <div className="space-y-0.5 break-inside-avoid shrink-0">
        <div className="border-b border-stone-800 pb-0.2">
          <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-black font-sans">
            TECHNICAL COMPETENCIES
          </h2>
        </div>
        <div className="space-y-0.5 text-[10px] text-stone-800 font-sans">
          {(skillsData && skillsData.length > 0) ? (
            skillsData.slice(0, 3).map((cat, idx) => (
              <div key={idx} className="leading-snug">
                <span className="font-bold">{cat.name}: </span>
                <span>{cat.skills.join(', ')}</span>
              </div>
            ))
          ) : (
            <div className="leading-snug">
              <span className="font-bold">Core Skills: </span>
              <span>Docker, Kubernetes, Linux, Terraform, Python, Node.js, AWS, CI/CD, GitOps, REST APIs</span>
            </div>
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-0.5 break-inside-avoid flex-1">
        <div className="border-b border-stone-800 pb-0.2">
          <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-black font-sans">
            PROFESSIONAL EXPERIENCE
          </h2>
        </div>
        <ExperienceSectionContent entries={expEntries} theme={theme} />
      </div>

      {/* Projects */}
      <div className="space-y-0.5 break-inside-avoid shrink-0">
        <div className="border-b border-stone-800 pb-0.2">
          <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-black font-sans">
            KEY ENGINEERING PROJECTS
          </h2>
        </div>
        <CanvaProjectCards entries={projEntries} theme={theme} />
      </div>

      {/* Education & Certs */}
      <div className="grid grid-cols-2 gap-3 break-inside-avoid shrink-0 pt-0.5">
        <div className="space-y-0.5">
          <div className="border-b border-stone-800 pb-0.2">
            <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-black font-sans">
              EDUCATION
            </h2>
          </div>
          <EducationSectionContent entries={eduEntries} theme={theme} />
        </div>

        <div className="space-y-0.5">
          <div className="border-b border-stone-800 pb-0.2">
            <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-black font-sans">
              CERTIFICATIONS
            </h2>
          </div>
          <CertificationsSectionContent entries={certEntries} theme={theme} />
        </div>
      </div>
    </div>
  );
}
