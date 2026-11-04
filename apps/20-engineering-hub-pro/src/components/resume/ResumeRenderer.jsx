import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Award,
  Terminal,
  Server,
  Layers,
  Cpu,
  Shield,
  Zap,
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
  BarChart2,
  TrendingUp,
  Code2,
  Workflow,
  Lock,
  Cloud,
  Database,
  GitBranch,
  CircleDot,
  Star,
  Check,
  FileText
} from 'lucide-react';
import { getPalette } from './palettes.js';
import { getTemplateMeta, normalizeTemplateId } from './templatesMeta.js';

// =========================================================================
// DETERMINISTIC SKILL PROFICIENCY GENERATOR
// =========================================================================
function getSkillProficiency(skill, index = 0) {
  if (typeof skill === 'object' && skill.percentage) {
    return Math.min(100, Math.max(10, skill.percentage));
  }
  const name = typeof skill === 'string' ? skill : skill?.name || skill?.title || '';
  const highTier = [
    'Docker', 'Kubernetes', 'Node.js', 'React', 'TypeScript',
    'Python', 'PostgreSQL', 'AWS', 'Linux', 'REST APIs',
    'CI/CD', 'GitOps', 'FastAPI', 'Redis', 'MongoDB', 'System Design'
  ];
  const isHigh = highTier.some(h => name.toLowerCase().includes(h.toLowerCase()));
  if (isHigh) {
    const scores = [96, 94, 92, 95, 93];
    return scores[index % scores.length];
  }
  const fallbackScores = [90, 88, 85, 91, 87, 86, 89, 84];
  return fallbackScores[index % fallbackScores.length];
}

// =========================================================================
// SHARED GRAPHIC PRIMITIVES (CIRCULAR GAUGES, PROGRESS BARS, DOT METERS)
// =========================================================================

export function CircularSkillGauge({ label, percentage, color, trackColor, size = 52, textColor }) {
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
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
            className="font-mono text-[10px] font-bold"
          >
            {percentage}%
          </span>
        </div>
      </div>
      <span
        style={{ color: textColor || '#292524' }}
        className="text-[10px] font-semibold text-center max-w-[68px] truncate"
        title={label}
      >
        {label}
      </span>
    </div>
  );
}

export function CanvaProSkillProgressBars({ skillsData, fallbackEntries, theme, maxItems }) {
  if (skillsData && skillsData.length > 0) {
    return (
      <div className="space-y-3">
        {skillsData.map((cat, idx) => {
          const list = maxItems ? cat.skills.slice(0, maxItems) : cat.skills;
          return (
            <div key={idx} className="space-y-1.5">
              <span
                style={{ color: theme.c1 }}
                className="font-bold text-[10.5px] uppercase tracking-wider block font-mono"
              >
                {cat.name}
              </span>
              <div className="space-y-1.5">
                {list.map((sk, sIdx) => {
                  const pct = getSkillProficiency(sk, sIdx);
                  return (
                    <div key={sIdx} className="space-y-0.5">
                      <div className="flex justify-between items-baseline text-[10.5px]">
                        <span className="font-semibold text-stone-800">{sk}</span>
                        <span
                          style={{ color: theme.c2 }}
                          className="font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-stone-100"
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full rounded-full overflow-hidden"
                        style={{ backgroundColor: theme.c3 || '#e2e8f0' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${theme.c2} 0%, ${theme.c2}dd 100%)`
                          }}
                        />
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

  return (
    <div className="space-y-2">
      {(fallbackEntries || []).map((e, idx) => {
        const pct = getSkillProficiency(e.title, idx);
        return (
          <div key={idx} className="space-y-0.5">
            <div className="flex justify-between text-[10.5px]">
              <span className="font-semibold text-stone-800">{e.title}</span>
              <span style={{ color: theme.c2 }} className="font-mono text-[9.5px] font-bold">
                {pct}%
              </span>
            </div>
            <div
              className="h-1.5 w-full rounded-full overflow-hidden"
              style={{ backgroundColor: theme.c3 || '#e2e8f0' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: theme.c2 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CanvaPro5DotRatingMeters({ skillsData, theme, isDark }) {
  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 10);
  return (
    <div className="space-y-2.5">
      {topSkills.map((sk, idx) => {
        const pct = getSkillProficiency(sk, idx);
        const dotsFilled = pct >= 93 ? 5 : pct >= 86 ? 4 : 3;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-[10.5px] font-medium">
              <span style={{ color: isDark ? '#ffffff' : theme.c1 }}>{sk}</span>
              <span
                style={{ color: isDark ? theme.c2 : theme.c2 }}
                className="font-mono text-[9.5px] font-semibold"
              >
                {pct}%
              </span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(dot => (
                <div
                  key={dot}
                  style={{
                    backgroundColor:
                      dot <= dotsFilled
                        ? isDark
                          ? theme.c2
                          : theme.c2
                        : isDark
                        ? 'rgba(255,255,255,0.2)'
                        : theme.c3 || '#e2e8f0'
                  }}
                  className="h-1.5 flex-1 rounded-full transition"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StarRatingMeter({ score = 5, color = '#c5a059', emptyColor = '#e2e8f0' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={10}
          fill={s <= score ? color : emptyColor}
          color={s <= score ? color : emptyColor}
        />
      ))}
    </div>
  );
}

// =========================================================================
// REUSABLE CONTENT SECTIONS (PROJECTS, EXPERIENCE, EDUCATION, CERTS)
// =========================================================================

function ExperienceSectionContent({ entries, theme, bulletShape = 'disc' }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-3">
      {entries.map((job, idx) => (
        <div key={idx} className="break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <span className="font-bold text-[12px] text-stone-900 font-sans">{job.title}</span>
              {job.organization && (
                <span className="text-stone-600 font-medium text-[11.5px]">
                  {' '}· {job.organization}
                </span>
              )}
            </div>
            <div className="text-[10.5px] text-stone-500 font-mono shrink-0">
              {job.startDate} — {job.current ? 'Present' : job.endDate}
            </div>
          </div>

          {job.description && (
            <p className="text-[11px] text-stone-700 mt-1 leading-relaxed">{job.description}</p>
          )}

          {job.bullets && job.bullets.length > 0 && (
            <ul className={`list-${bulletShape} list-outside ml-4 mt-1 space-y-0.5 text-[11px] text-stone-700`}>
              {job.bullets.map((b, bIdx) => (
                <li key={bIdx} className="leading-snug">{b}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function CanvaProjectCards({ entries, theme }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-3">
      {entries.map((p, idx) => (
        <div
          key={idx}
          style={{
            borderColor: theme.c3,
            backgroundColor: theme.c4
          }}
          className="p-3.5 rounded-xl border shadow-xs break-inside-avoid"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[12px] text-stone-900 font-sans">{p.title}</span>
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: theme.c2, borderColor: theme.c3 }}
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border hover:underline"
                >
                  <Github size={10} /> repo <ExternalLink size={9} />
                </a>
              )}
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: theme.c2, borderColor: theme.c3 }}
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border hover:underline"
                >
                  <Globe size={10} /> demo <ExternalLink size={9} />
                </a>
              )}
            </div>
            {p.startDate && (
              <span className="text-[10px] text-stone-500 font-mono shrink-0">
                {p.startDate} {p.endDate ? `— ${p.endDate}` : ''}
              </span>
            )}
          </div>

          {p.description && (
            <p className="text-[11px] text-stone-700 mt-1 leading-relaxed">{p.description}</p>
          )}

          {p.bullets && p.bullets.length > 0 && (
            <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[11px] text-stone-700">
              {p.bullets.map((b, bIdx) => (
                <li key={bIdx} className="leading-snug">{b}</li>
              ))}
            </ul>
          )}

          {p.technologies && p.technologies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {p.technologies.map((t, tIdx) => (
                <span
                  key={tIdx}
                  style={{
                    backgroundColor: '#ffffff',
                    color: theme.c1,
                    borderColor: theme.c3
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EducationSectionContent({ entries, theme, isDarkSidebar }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-2">
      {entries.map((edu, idx) => (
        <div key={idx} className="break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
            <span
              style={{ color: isDarkSidebar ? '#ffffff' : '#111827' }}
              className="font-bold text-[11.5px]"
            >
              {edu.title}
            </span>
            <span className="text-[10.5px] text-stone-500 font-mono shrink-0">
              {edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ''}
            </span>
          </div>
          <div
            style={{ color: isDarkSidebar ? theme.c2 : theme.c2 }}
            className="text-[11px] font-medium"
          >
            {edu.organization || edu.subtitle}
          </div>
          {edu.description && (
            <p
              style={{ color: isDarkSidebar ? '#d1d5db' : '#4b5563' }}
              className="text-[10.5px] mt-0.5 leading-snug"
            >
              {edu.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function CertificationsSectionContent({ entries, theme, isDarkSidebar }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {entries.map((cert, idx) => (
        <div key={idx} className="flex items-start justify-between gap-1 text-[11px] break-inside-avoid">
          <div>
            <span
              style={{ color: isDarkSidebar ? '#ffffff' : '#111827' }}
              className="font-semibold"
            >
              {cert.title}
            </span>
            {cert.organization && (
              <span
                style={{ color: isDarkSidebar ? '#9ca3af' : '#6b7280' }}
                className="text-[10.5px]"
              >
                {' '}· {cert.organization}
              </span>
            )}
          </div>
          {cert.startDate && (
            <span className="text-[10px] text-stone-400 font-mono shrink-0">
              {cert.startDate}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// MAIN RESUME RENDERER COMPONENT & 20-TEMPLATE DISPATCHER
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

  // Base font size scaling
  const fontSizeStyle = {
    compact: { fontSize: '11px', lineHeight: '1.4' },
    normal: { fontSize: '12px', lineHeight: '1.5' },
    spacious: { fontSize: '13px', lineHeight: '1.6' }
  }[typography.fontSize] || { fontSize: '12px', lineHeight: '1.5' };

  // Page margin mappings
  const marginPadding = {
    compact: 'p-6 sm:p-7',
    normal: 'p-8 sm:p-9',
    spacious: 'p-10 sm:p-11'
  }[resume.pageSettings?.margins] || 'p-8 sm:p-9';

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

  const sharedProps = {
    resume,
    theme: normalizedTheme,
    pi,
    sections,
    skillsData,
    meta,
    marginPadding
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
      <div
        id={id}
        style={{
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: c5,
          color: c1,
          ...fontSizeStyle
        }}
        className={`resume-paper shadow-2xl border border-stone-200 relative text-left box-border ${fontClass} print:shadow-none print:border-none print:m-0`}
      >
        {/* ================= CATEGORY A: MODERN & PROFESSIONAL ================= */}
        {canonicalId === 'modern-executive' && <ModernExecutiveLayout {...sharedProps} />}
        {canonicalId === 'modern-minimalist' && <ModernMinimalistLayout {...sharedProps} />}
        {canonicalId === 'professional-corporate' && <ProfessionalCorporateLayout {...sharedProps} />}
        {canonicalId === 'contemporary-split' && <ContemporarySplitLayout {...sharedProps} />}
        {canonicalId === 'elegant-professional' && <ElegantProfessionalLayout {...sharedProps} />}

        {/* ================= CATEGORY B: CREATIVE & DESIGNER ================= */}
        {canonicalId === 'creative-portfolio' && <CreativePortfolioLayout {...sharedProps} />}
        {canonicalId === 'graphic-designer' && <GraphicDesignerLayout {...sharedProps} />}
        {canonicalId === 'editorial-magazine' && <EditorialMagazineLayout {...sharedProps} />}
        {canonicalId === 'bold-creative' && <BoldCreativeLayout {...sharedProps} />}
        {canonicalId === 'artistic-minimal' && <ArtisticMinimalLayout {...sharedProps} />}

        {/* ================= CATEGORY C: ELEGANT & PREMIUM ================= */}
        {canonicalId === 'luxury-gold' && <LuxuryGoldLayout {...sharedProps} />}
        {canonicalId === 'burgundy-elegance' && <BurgundyEleganceLayout {...sharedProps} />}
        {canonicalId === 'swiss-design' && <SwissDesignLayout {...sharedProps} />}
        {canonicalId === 'classic-serif' && <ClassicSerifLayout {...sharedProps} />}
        {canonicalId === 'scandinavian-minimal' && <ScandinavianMinimalLayout {...sharedProps} />}

        {/* ================= CATEGORY D: TECHNICAL & INDUSTRY-SPECIFIC ================= */}
        {canonicalId === 'software-engineer' && <SoftwareEngineerLayout {...sharedProps} />}
        {canonicalId === 'data-ai-pro' && <DataAIProLayout {...sharedProps} />}
        {canonicalId === 'devops-engineer' && <DevOpsEngineerLayout {...sharedProps} />}
        {canonicalId === 'academic-research' && <AcademicResearchLayout {...sharedProps} />}
        {canonicalId === 'ats-classic' && <ATSClassicLayout {...sharedProps} />}
      </div>
    </div>
  );
}

// =========================================================================
// 1. MODERN EXECUTIVE LAYOUT (Template 01)
// Command executive boardroom header, KPI metrics ribbon, dual-column governance
// =========================================================================
function ModernExecutiveLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const summarySec = sections.find(s => s.sectionType === 'summary');
  const expSec = sections.find(s => s.sectionType === 'experience');
  const projSec = sections.find(s => s.sectionType === 'projects');
  const eduSec = sections.find(s => s.sectionType === 'education');
  const certSec = sections.find(s => s.sectionType === 'certifications');

  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 4);

  return (
    <div className="flex flex-col min-h-[297mm]">
      {/* Executive Command Header Band */}
      <div
        style={{
          backgroundColor: theme.c1,
          borderTop: `6px solid ${theme.c2}`
        }}
        className="px-8 py-6 text-white"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                style={{ backgroundColor: theme.c2, color: theme.c1 }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase"
              >
                Executive Profile
              </span>
              <span className="text-white/60 text-xs font-mono">ID: {pi.fullName ? pi.fullName.replace(/\s+/g, '-').toUpperCase() : 'EXECUTIVE'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display">{pi.fullName}</h1>
            <p style={{ color: theme.c2 }} className="text-xs sm:text-sm font-semibold tracking-wide uppercase mt-0.5">
              {pi.targetRole || pi.headline}
            </p>
          </div>

          {/* Contact Strip */}
          <div className="text-[11px] text-white/80 space-y-1 font-mono text-left sm:text-right">
            {pi.email && <div>{pi.email}</div>}
            {pi.phone && <div>{pi.phone} · {pi.location}</div>}
            <div className="flex items-center gap-2 sm:justify-end text-[10.5px]">
              {pi.linkedinUrl && <span style={{ color: theme.c2 }}>LinkedIn</span>}
              {pi.githubUrl && <span>GitHub</span>}
              {pi.portfolioUrl && <span style={{ color: theme.c2 }}>Portfolio</span>}
            </div>
          </div>
        </div>

        {/* 4-Item Executive KPI Ribbon */}
        <div
          style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)' }}
          className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl border text-center"
        >
          <div>
            <span style={{ color: theme.c2 }} className="font-mono text-base font-black block">10+ Yrs</span>
            <span className="text-[9.5px] uppercase tracking-wider text-white/70">Engineering Leadership</span>
          </div>
          <div>
            <span style={{ color: theme.c2 }} className="font-mono text-base font-black block">99.99%</span>
            <span className="text-[9.5px] uppercase tracking-wider text-white/70">Production Uptime SLA</span>
          </div>
          <div>
            <span style={{ color: theme.c2 }} className="font-mono text-base font-black block">Distributed</span>
            <span className="text-[9.5px] uppercase tracking-wider text-white/70">Cloud Native Systems</span>
          </div>
          <div>
            <span style={{ color: theme.c2 }} className="font-mono text-base font-black block">Enterprise</span>
            <span className="text-[9.5px] uppercase tracking-wider text-white/70">Governance &amp; Delivery</span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className={`flex-1 ${marginPadding} space-y-6`}>
        {/* Executive Summary Callout Box */}
        {summarySec?.content && (
          <div
            style={{
              backgroundColor: theme.c4,
              borderLeft: `4px solid ${theme.c2}`,
              borderColor: theme.c3
            }}
            className="p-4 rounded-r-xl border-y border-r shadow-2xs"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} style={{ color: theme.c2 }} />
              <span style={{ color: theme.c1 }} className="font-bold text-xs uppercase tracking-wider font-mono">
                Executive Synthesis
              </span>
            </div>
            <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{summarySec.content}</p>
          </div>
        )}

        {/* Two-Column Grid: Left (Experience/Projects) vs Right (Gauges/Degrees/Certs) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 7-Column Work Experience Track */}
          <div className="lg:col-span-7 space-y-5">
            {expSec && (
              <div className="space-y-3">
                <div style={{ borderColor: theme.c1 }} className="pb-1.5 border-b-2 flex items-center justify-between">
                  <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono">
                    Career Trajectory &amp; Leadership
                  </h2>
                  <span className="text-[10px] text-stone-500 font-mono">Production Track</span>
                </div>
                <ExperienceSectionContent entries={expSec.entries || []} theme={theme} />
              </div>
            )}

            {projSec && (
              <div className="space-y-3 pt-2">
                <div style={{ borderColor: theme.c1 }} className="pb-1.5 border-b-2 flex items-center justify-between">
                  <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono">
                    High-Impact Systems &amp; Case Studies
                  </h2>
                  <span className="text-[10px] text-stone-500 font-mono">Architectural Impact</span>
                </div>
                <CanvaProjectCards entries={projSec.entries || []} theme={theme} />
              </div>
            )}
          </div>

          {/* Right 5-Column Governance & Technical Pillars */}
          <div className="lg:col-span-5 space-y-5">
            {/* SVG Circular Competency Gauges */}
            <div
              style={{ backgroundColor: theme.c4, borderColor: theme.c3 }}
              className="p-4 rounded-xl border shadow-xs space-y-3"
            >
              <span style={{ color: theme.c1 }} className="font-mono text-xs font-bold uppercase tracking-wider block">
                Core Competency Gauges
              </span>
              <div className="grid grid-cols-2 gap-3 py-1">
                {topSkills.map((sk, idx) => (
                  <CircularSkillGauge
                    key={idx}
                    label={sk}
                    percentage={getSkillProficiency(sk, idx)}
                    color={theme.c2}
                    trackColor={theme.c3}
                    textColor={theme.c1}
                    size={52}
                  />
                ))}
              </div>
            </div>

            {/* Linear Skills Progress Breakdown */}
            <div
              style={{ backgroundColor: theme.c4, borderColor: theme.c3 }}
              className="p-4 rounded-xl border shadow-xs space-y-3"
            >
              <span style={{ color: theme.c1 }} className="font-mono text-xs font-bold uppercase tracking-wider block">
                Technical Mastery Index
              </span>
              <CanvaProSkillProgressBars skillsData={skillsData} theme={theme} maxItems={4} />
            </div>

            {/* Education */}
            {eduSec && (
              <div
                style={{ backgroundColor: theme.c4, borderColor: theme.c3 }}
                className="p-4 rounded-xl border shadow-xs space-y-2"
              >
                <span style={{ color: theme.c1 }} className="font-mono text-xs font-bold uppercase tracking-wider block">
                  Academic Credentials
                </span>
                <EducationSectionContent entries={eduSec.entries || []} theme={theme} />
              </div>
            )}

            {/* Certifications */}
            {certSec && (
              <div
                style={{ backgroundColor: theme.c4, borderColor: theme.c3 }}
                className="p-4 rounded-xl border shadow-xs space-y-2"
              >
                <span style={{ color: theme.c1 }} className="font-mono text-xs font-bold uppercase tracking-wider block">
                  Industry Certifications
                </span>
                <CertificationsSectionContent entries={certSec.entries || []} theme={theme} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. MODERN MINIMALIST LAYOUT (Template 02)
// Pure gallery white space, asymmetric letter-spaced header, delicate dot meters
// =========================================================================
function ModernMinimalistLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  return (
    <div className={`${marginPadding} space-y-6 text-stone-900`}>
      {/* Asymmetric Gallery Header */}
      <div className="space-y-1.5 pb-4">
        <h1 className="text-3xl font-light tracking-tight text-stone-900 font-sans">
          {pi.fullName ? (
            <>
              <span className="font-light">{pi.fullName.split(' ')[0]} </span>
              <span className="font-bold">{pi.fullName.split(' ').slice(1).join(' ')}</span>
            </>
          ) : 'Candidate'}
        </h1>
        <p style={{ color: theme.c2 }} className="text-xs uppercase tracking-[0.2em] font-medium">
          {pi.targetRole || pi.headline}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-500 font-sans pt-1">
          {pi.email && <span>{pi.email}</span>}
          {pi.phone && <span>· {pi.phone}</span>}
          {pi.location && <span>· {pi.location}</span>}
          {pi.githubUrl && <span>· github.com/{pi.githubUrl.split('/').pop()}</span>}
        </div>

        {/* Minimal Hairline with Offset Signature Dot */}
        <div className="relative pt-3">
          <div className="w-full h-px bg-stone-200" />
          <div
            style={{ backgroundColor: theme.c2 }}
            className="absolute left-1/4 -top-[1.5px] w-2 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Clean Airy Sections */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="space-y-2.5">
          <h2
            style={{ color: theme.c1 }}
            className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-700 font-sans"
          >
            {sec.title}
          </h2>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] text-stone-700 leading-relaxed font-sans">{sec.content}</p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <CanvaPro5DotRatingMeters skillsData={skillsData} theme={theme} isDark={false} />
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'projects' && (
            <div className="space-y-3">
              {(sec.entries || []).map((p, idx) => (
                <div key={idx} className="space-y-1 break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[12px] text-stone-900">{p.title}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{p.startDate}</span>
                  </div>
                  {p.description && <p className="text-[11px] text-stone-600 leading-relaxed">{p.description}</p>}
                  {p.technologies && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {p.technologies.map((t, tIdx) => (
                        <span key={tIdx} className="text-[10px] text-stone-500 font-mono">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// 3. PROFESSIONAL CORPORATE LAYOUT (Template 03)
// Structured navy/charcoal corporate grid, tinted capsule headers, diamond bullets
// =========================================================================
function ProfessionalCorporateLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  return (
    <div className={`${marginPadding} space-y-5 text-stone-900`}>
      {/* Corporate Header */}
      <div style={{ borderColor: theme.c1 }} className="pb-4 border-b-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h1 style={{ color: theme.c1 }} className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
              {pi.fullName}
            </h1>
            <p style={{ color: theme.c2 }} className="text-xs sm:text-sm font-bold tracking-wide uppercase mt-0.5">
              {pi.targetRole || pi.headline}
            </p>
          </div>
          <div className="text-[11px] text-stone-600 text-left sm:text-right font-sans space-y-0.5">
            <div>{pi.email} · {pi.phone}</div>
            <div>{pi.location} {pi.linkedinUrl && `· ${pi.linkedinUrl}`}</div>
          </div>
        </div>
      </div>

      {/* Sections with Tinted Header Capsules */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="space-y-2.5">
          <div
            style={{
              backgroundColor: theme.c3,
              borderLeft: `4px solid ${theme.c1}`
            }}
            className="px-3 py-1 rounded-r flex items-center justify-between"
          >
            <h2 style={{ color: theme.c1 }} className="text-xs font-bold uppercase tracking-wider font-sans">
              {sec.title}
            </h2>
            <span style={{ color: theme.c2 }} className="text-[10px] font-mono font-bold">
              CORPORATE STANDARD
            </span>
          </div>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{sec.content}</p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CanvaProSkillProgressBars skillsData={skillsData} theme={theme} maxItems={4} />
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={theme} bulletShape="disc" />
          )}

          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// 4. CONTEMPORARY SPLIT LAYOUT (Template 04)
// Two-column architectural split: 35% solid colored left sidebar + 65% right body
// =========================================================================
function ContemporarySplitLayout({ resume, theme, pi, sections, skillsData }) {
  const summarySec = sections.find(s => s.sectionType === 'summary');
  const expSec = sections.find(s => s.sectionType === 'experience');
  const projSec = sections.find(s => s.sectionType === 'projects');
  const eduSec = sections.find(s => s.sectionType === 'education');
  const certSec = sections.find(s => s.sectionType === 'certifications');

  const initials = pi.fullName
    ? pi.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'EH';

  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 4);

  return (
    <div className="flex min-h-[297mm]">
      {/* Left 35% Colored Architectural Sidebar */}
      <div
        style={{
          width: '35%',
          backgroundColor: theme.c4,
          borderRight: `2px solid ${theme.c3}`
        }}
        className="p-6 space-y-6 shrink-0"
      >
        {/* Monogram Seal Avatar */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div
            style={{
              backgroundColor: theme.c1,
              color: '#ffffff',
              borderColor: theme.c2
            }}
            className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-display font-black text-xl shadow-sm"
          >
            {initials}
          </div>
          <div>
            <h3 style={{ color: theme.c1 }} className="font-bold text-sm leading-tight">{pi.fullName}</h3>
            <span style={{ color: theme.c2 }} className="text-[10.5px] font-medium block">{pi.targetRole}</span>
          </div>
        </div>

        {/* Contact Icons */}
        <div className="space-y-2 text-[11px] text-stone-700">
          <span style={{ color: theme.c1 }} className="font-mono text-[10.5px] font-bold uppercase tracking-wider block border-b pb-1">
            Contact
          </span>
          {pi.email && <div className="truncate flex items-center gap-1.5"><Mail size={12} style={{ color: theme.c2 }} /> {pi.email}</div>}
          {pi.phone && <div className="flex items-center gap-1.5"><Phone size={12} style={{ color: theme.c2 }} /> {pi.phone}</div>}
          {pi.location && <div className="flex items-center gap-1.5"><MapPin size={12} style={{ color: theme.c2 }} /> {pi.location}</div>}
          {pi.githubUrl && <div className="truncate flex items-center gap-1.5"><Github size={12} style={{ color: theme.c2 }} /> {pi.githubUrl.split('/').pop()}</div>}
        </div>

        {/* Circular SVG Skill Gauges */}
        <div className="space-y-2">
          <span style={{ color: theme.c1 }} className="font-mono text-[10.5px] font-bold uppercase tracking-wider block border-b pb-1">
            Skill Meters
          </span>
          <div className="grid grid-cols-2 gap-2 py-1">
            {topSkills.map((sk, idx) => (
              <CircularSkillGauge
                key={idx}
                label={sk}
                percentage={getSkillProficiency(sk, idx)}
                color={theme.c2}
                trackColor={theme.c3}
                textColor={theme.c1}
                size={48}
              />
            ))}
          </div>
        </div>

        {/* Education in Sidebar */}
        {eduSec && (
          <div className="space-y-2">
            <span style={{ color: theme.c1 }} className="font-mono text-[10.5px] font-bold uppercase tracking-wider block border-b pb-1">
              Education
            </span>
            <EducationSectionContent entries={eduSec.entries || []} theme={theme} isDarkSidebar={false} />
          </div>
        )}

        {/* Certifications in Sidebar */}
        {certSec && (
          <div className="space-y-2">
            <span style={{ color: theme.c1 }} className="font-mono text-[10.5px] font-bold uppercase tracking-wider block border-b pb-1">
              Credentials
            </span>
            <CertificationsSectionContent entries={certSec.entries || []} theme={theme} isDarkSidebar={false} />
          </div>
        )}
      </div>

      {/* Right 65% Main Content Body */}
      <div style={{ width: '65%' }} className="p-8 space-y-6">
        <div>
          <h1 style={{ color: theme.c1 }} className="text-2xl font-black tracking-tight">{pi.fullName}</h1>
          <p style={{ color: theme.c2 }} className="text-xs font-bold uppercase tracking-widest mt-0.5">
            {pi.targetRole || pi.headline}
          </p>
        </div>

        {summarySec?.content && (
          <div className="space-y-1">
            <h3 style={{ color: theme.c1 }} className="font-mono text-xs font-bold uppercase tracking-wider">
              Profile Overview
            </h3>
            <p className="text-[11.5px] text-stone-700 leading-relaxed font-sans">{summarySec.content}</p>
          </div>
        )}

        {expSec && (
          <div className="space-y-3">
            <div style={{ borderColor: theme.c1 }} className="pb-1 border-b flex justify-between items-baseline">
              <h3 style={{ color: theme.c1 }} className="font-mono text-xs font-bold uppercase tracking-wider">
                Work Experience
              </h3>
            </div>
            <ExperienceSectionContent entries={expSec.entries || []} theme={theme} />
          </div>
        )}

        {projSec && (
          <div className="space-y-3">
            <div style={{ borderColor: theme.c1 }} className="pb-1 border-b flex justify-between items-baseline">
              <h3 style={{ color: theme.c1 }} className="font-mono text-xs font-bold uppercase tracking-wider">
                Key Engineering Projects
              </h3>
            </div>
            <CanvaProjectCards entries={projSec.entries || []} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 5. ELEGANT PROFESSIONAL LAYOUT (Template 05)
// Refined editorial styling, centered title hierarchy, subtle accent color bands
// =========================================================================
function ElegantProfessionalLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  return (
    <div className="flex flex-col min-h-[297mm]">
      {/* Accent Ribbon */}
      <div
        style={{
          background: `linear-gradient(90deg, ${theme.c1} 0%, ${theme.c2} 50%, ${theme.c1} 100%)`
        }}
        className="h-2 w-full"
      />

      <div className={`${marginPadding} space-y-6 flex-1`}>
        {/* Centered Editorial Header */}
        <div className="text-center space-y-1.5 pb-4 border-b border-stone-200">
          <h1 style={{ color: theme.c1 }} className="text-3xl font-black tracking-tight font-display">
            {pi.fullName}
          </h1>
          <p style={{ color: theme.c2 }} className="text-xs font-bold tracking-[0.2em] uppercase font-sans">
            {pi.targetRole || pi.headline}
          </p>
          <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-500 font-sans pt-1">
            {pi.email && <span>{pi.email}</span>}
            {pi.phone && <span>· {pi.phone}</span>}
            {pi.location && <span>· {pi.location}</span>}
            {pi.linkedinUrl && <span>· LinkedIn</span>}
            {pi.githubUrl && <span>· GitHub</span>}
          </div>
        </div>

        {/* Section Blocks */}
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono shrink-0">
                {sec.title}
              </h2>
              <div style={{ backgroundColor: theme.c3 }} className="h-0.5 flex-1 rounded-full" />
            </div>

            {sec.sectionType === 'summary' && (
              <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{sec.content}</p>
            )}

            {sec.sectionType === 'skills' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CanvaProSkillProgressBars skillsData={skillsData} theme={theme} maxItems={4} />
              </div>
            )}

            {sec.sectionType === 'experience' && (
              <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
            )}

            {sec.sectionType === 'projects' && (
              <CanvaProjectCards entries={sec.entries || []} theme={theme} />
            )}

            {sec.sectionType === 'education' && (
              <EducationSectionContent entries={sec.entries || []} theme={theme} />
            )}

            {sec.sectionType === 'certifications' && (
              <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 6. CREATIVE PORTFOLIO LAYOUT (Template 06)
// Project showcase first, live demo & repo buttons, interactive skill badges
// =========================================================================
function CreativePortfolioLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const projSec = sections.find(s => s.sectionType === 'projects');
  const expSec = sections.find(s => s.sectionType === 'experience');
  const summarySec = sections.find(s => s.sectionType === 'summary');
  const eduSec = sections.find(s => s.sectionType === 'education');
  const certSec = sections.find(s => s.sectionType === 'certifications');

  return (
    <div className={`${marginPadding} space-y-6 text-stone-900`}>
      {/* Showcase Hero Header */}
      <div
        style={{
          backgroundColor: theme.c1,
          color: '#ffffff'
        }}
        className="p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <span style={{ color: theme.c2 }} className="text-[10px] font-mono font-bold tracking-widest uppercase block">
            CREATIVE ENGINEER &amp; BUILDER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{pi.fullName}</h1>
          <p className="text-xs text-white/80 mt-0.5">{pi.targetRole}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10.5px] font-mono">
          {pi.portfolioUrl && (
            <span
              style={{ backgroundColor: theme.c2, color: theme.c1 }}
              className="px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
            >
              <Globe size={11} /> Portfolio
            </span>
          )}
          {pi.githubUrl && (
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white flex items-center gap-1 border border-white/20">
              <Github size={11} /> GitHub
            </span>
          )}
          {pi.email && (
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white flex items-center gap-1 border border-white/20">
              <Mail size={11} /> Email
            </span>
          )}
        </div>
      </div>

      {summarySec?.content && (
        <p className="text-[11.5px] text-stone-700 leading-relaxed font-sans">{summarySec.content}</p>
      )}

      {/* FEATURED WORK FIRST */}
      {projSec && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b-2" style={{ borderColor: theme.c2 }}>
            <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono">
              Featured Case Studies &amp; Open-Source Projects
            </h2>
            <span style={{ color: theme.c2 }} className="text-[10px] font-mono font-bold">4 Verified Builds</span>
          </div>
          <CanvaProjectCards entries={projSec.entries || []} theme={theme} />
        </div>
      )}

      {/* Skills Matrix */}
      <div className="space-y-2">
        <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono border-b pb-1">
          Technical Arsenal &amp; Frameworks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CanvaProSkillProgressBars skillsData={skillsData} theme={theme} maxItems={4} />
        </div>
      </div>

      {/* Experience */}
      {expSec && (
        <div className="space-y-3">
          <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono border-b pb-1">
            Engineering Trajectory
          </h2>
          <ExperienceSectionContent entries={expSec.entries || []} theme={theme} />
        </div>
      )}

      {/* Education & Certs Two-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {eduSec && (
          <div className="space-y-2">
            <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono border-b pb-1">
              Education
            </h2>
            <EducationSectionContent entries={eduSec.entries || []} theme={theme} />
          </div>
        )}
        {certSec && (
          <div className="space-y-2">
            <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono border-b pb-1">
              Certifications
            </h2>
            <CertificationsSectionContent entries={certSec.entries || []} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 7. GRAPHIC DESIGNER LAYOUT (Template 07)
// High-contrast creative blocks, vibrant colored pill badges, circular SVG dials
// =========================================================================
function GraphicDesignerLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 4);

  return (
    <div className={`${marginPadding} space-y-6 text-stone-900`}>
      {/* Creative Asymmetric Block Header */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-stone-900 text-white">
        <div
          style={{ backgroundColor: theme.c2 }}
          className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-30 blur-xl pointer-events-none"
        />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 relative z-10">
          <div>
            <span style={{ color: theme.c2 }} className="text-[10.5px] font-mono uppercase tracking-widest block font-bold">
              PORTFOLIO ARCHIVE / 2026
            </span>
            <h1 className="text-3xl font-black tracking-tight mt-0.5">{pi.fullName}</h1>
            <p className="text-xs text-stone-300 font-medium">{pi.targetRole}</p>
          </div>
          <div className="text-[11px] text-stone-300 font-mono space-y-0.5 text-left sm:text-right">
            <div>{pi.email}</div>
            <div>{pi.location} · {pi.phone}</div>
          </div>
        </div>
      </div>

      {/* Creative Suite circular dials */}
      <div style={{ backgroundColor: theme.c4, borderColor: theme.c3 }} className="p-4 rounded-xl border shadow-xs space-y-2">
        <div className="flex items-center gap-1.5">
          <span style={{ backgroundColor: theme.c2 }} className="w-2 h-2 rounded-xs inline-block" />
          <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono">
            Creative &amp; Technical Proficiency Dials
          </h2>
        </div>
        <div className="flex justify-around flex-wrap gap-3 py-2">
          {topSkills.map((sk, idx) => (
            <CircularSkillGauge
              key={idx}
              label={sk}
              percentage={getSkillProficiency(sk, idx)}
              color={theme.c2}
              trackColor={theme.c3}
              textColor={theme.c1}
              size={56}
            />
          ))}
        </div>
      </div>

      {/* Sections */}
      {sections.map((sec, sIdx) => {
        if (sec.sectionType === 'skills') return null; // rendered in dials above
        return (
          <div key={sIdx} className="space-y-3">
            <div className="flex items-center gap-2 border-b pb-1">
              <span style={{ backgroundColor: theme.c2 }} className="w-2 h-2 rounded-xs inline-block" />
              <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono">
                {sec.title}
              </h2>
            </div>

            {sec.sectionType === 'summary' && (
              <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{sec.content}</p>
            )}
            {sec.sectionType === 'experience' && (
              <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
            )}
            {sec.sectionType === 'projects' && (
              <CanvaProjectCards entries={sec.entries || []} theme={theme} />
            )}
            {sec.sectionType === 'education' && (
              <EducationSectionContent entries={sec.entries || []} theme={theme} />
            )}
            {sec.sectionType === 'certifications' && (
              <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// =========================================================================
// 8. EDITORIAL MAGAZINE LAYOUT (Template 08)
// Magazine 3-column headlines, oversized Roman numerals (I, II, III), serif initial
// =========================================================================
function EditorialMagazineLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  return (
    <div className={`${marginPadding} space-y-6 text-stone-900 font-serif`}>
      {/* Magazine Cover Header */}
      <div className="text-center pb-5 border-b-2 border-stone-900 space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-500">
          CURRICULUM VITAE · SPECIAL EDITION 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight font-serif text-stone-950">
          {pi.fullName}
        </h1>
        <p style={{ color: theme.c2 }} className="text-xs font-sans uppercase tracking-[0.2em] font-bold">
          {pi.targetRole || pi.headline}
        </p>
        <div className="flex justify-center gap-3 text-[10.5px] text-stone-600 font-sans pt-1">
          <span>{pi.email}</span>
          <span>·</span>
          <span>{pi.phone}</span>
          <span>·</span>
          <span>{pi.location}</span>
        </div>
      </div>

      {/* Sections with Roman Numerals */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="space-y-3 font-sans">
          <div className="flex items-baseline gap-2 border-b border-stone-300 pb-1">
            <span style={{ color: theme.c2 }} className="font-serif text-base font-bold italic">
              {romanNumerals[sIdx] || `${sIdx + 1}`}.
            </span>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-stone-900 font-serif">
              {sec.title}
            </h2>
          </div>

          {sec.sectionType === 'summary' && (
            <div className="pl-4 border-l-2 border-stone-300 italic text-[12px] text-stone-800 font-serif leading-relaxed">
              “{sec.content}”
            </div>
          )}

          {sec.sectionType === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-sans">
              <CanvaProSkillProgressBars skillsData={skillsData} theme={theme} maxItems={4} />
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// 9. BOLD CREATIVE LAYOUT (Template 09)
// Neo-brutalist dark header ribbon, solid neon/accent badges, 2px borders
// =========================================================================
function BoldCreativeLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  return (
    <div className="flex flex-col min-h-[297mm]">
      {/* Heavy Neo-Brutalist Header */}
      <div
        style={{
          backgroundColor: theme.c1,
          borderBottom: `4px solid ${theme.c2}`
        }}
        className="p-8 text-white space-y-2"
      >
        <div className="flex justify-between items-start">
          <span
            style={{ backgroundColor: theme.c2, color: theme.c1 }}
            className="px-2.5 py-0.5 rounded font-black text-xs uppercase tracking-wider font-mono shadow-sm"
          >
            CONFIDENTIAL / VERIFIED
          </span>
          <span className="font-mono text-xs text-white/70">{pi.location}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display">{pi.fullName}</h1>
        <p style={{ color: theme.c2 }} className="text-sm font-bold uppercase tracking-wider font-mono">
          {pi.targetRole || pi.headline}
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-mono text-white/80 pt-2">
          <span>{pi.email}</span>
          <span>·</span>
          <span>{pi.phone}</span>
          {pi.githubUrl && <span>· github: {pi.githubUrl.split('/').pop()}</span>}
        </div>
      </div>

      <div className={`${marginPadding} space-y-6 flex-1 text-stone-900`}>
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-3">
            <div
              style={{
                borderColor: theme.c1,
                borderBottomWidth: '3px'
              }}
              className="pb-1 flex items-center justify-between"
            >
              <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono">
                // {sec.title}
              </h2>
            </div>

            {sec.sectionType === 'summary' && (
              <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{sec.content}</p>
            )}

            {sec.sectionType === 'skills' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CanvaProSkillProgressBars skillsData={skillsData} theme={theme} maxItems={4} />
              </div>
            )}

            {sec.sectionType === 'experience' && (
              <ExperienceSectionContent entries={sec.entries || []} theme={theme} bulletShape="square" />
            )}

            {sec.sectionType === 'projects' && (
              <CanvaProjectCards entries={sec.entries || []} theme={theme} />
            )}

            {sec.sectionType === 'education' && (
              <EducationSectionContent entries={sec.entries || []} theme={theme} />
            )}

            {sec.sectionType === 'certifications' && (
              <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 10. ARTISTIC MINIMAL LAYOUT (Template 10)
// Japanese Zen minimalism, warm linen canvas, subtle 5-dot rating tracks
// =========================================================================
function ArtisticMinimalLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  return (
    <div
      style={{ backgroundColor: '#faf9f6' }}
      className={`min-h-[297mm] ${marginPadding} space-y-6 text-stone-800`}
    >
      {/* Tranquil Header */}
      <div className="text-center space-y-1 pb-4 border-b border-stone-200">
        <h1 className="text-2xl sm:text-3xl font-light tracking-[0.15em] uppercase text-stone-900 font-sans">
          {pi.fullName}
        </h1>
        <p style={{ color: theme.c2 }} className="text-[11px] uppercase tracking-[0.25em] font-medium">
          {pi.targetRole || pi.headline}
        </p>
        <div className="flex justify-center gap-3 text-[10.5px] text-stone-400 font-sans pt-1">
          <span>{pi.email}</span>
          <span>·</span>
          <span>{pi.phone}</span>
          <span>·</span>
          <span>{pi.location}</span>
        </div>
      </div>

      {/* Zen Sections */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="space-y-2.5">
          <h2
            style={{ color: theme.c1 }}
            className="text-[10.5px] font-bold uppercase tracking-[0.25em] text-stone-600 font-sans text-center"
          >
            — {sec.title} —
          </h2>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] text-stone-600 leading-relaxed font-sans text-center max-w-xl mx-auto">
              {sec.content}
            </p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="max-w-lg mx-auto py-1">
              <CanvaPro5DotRatingMeters skillsData={skillsData} theme={theme} isDark={false} />
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// 11. LUXURY GOLD LAYOUT (Template 11)
// Ivory & metallic gold palette, monogram crest, Roman serif, star rating meters
// =========================================================================
function LuxuryGoldLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const goldColor = '#c5a059';
  const initials = pi.fullName
    ? pi.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'EH';

  return (
    <div
      style={{
        backgroundColor: '#fcfaf6',
        borderColor: goldColor
      }}
      className="min-h-[297mm] p-6 sm:p-8 border-4 m-2 text-stone-900 space-y-6 font-serif"
    >
      {/* Luxury Crest & Header */}
      <div className="text-center space-y-2 pb-4 border-b border-[#c5a059]/40">
        <div className="flex justify-center">
          <div
            style={{ borderColor: goldColor, color: goldColor }}
            className="w-14 h-14 rounded-full border-2 flex items-center justify-center font-display font-bold text-lg shadow-2xs"
          >
            {initials}
          </div>
        </div>
        <h1 className="text-3xl font-normal tracking-wide text-stone-900 font-serif">
          {pi.fullName}
        </h1>
        <p style={{ color: goldColor }} className="text-xs uppercase tracking-[0.25em] font-sans font-bold">
          {pi.targetRole || pi.headline}
        </p>
        <div className="flex justify-center gap-3 text-[11px] text-stone-600 font-sans">
          <span>{pi.email}</span>
          <span>♦</span>
          <span>{pi.phone}</span>
          <span>♦</span>
          <span>{pi.location}</span>
        </div>
      </div>

      {/* Luxury Sections */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="space-y-3 font-sans">
          <div className="flex items-center justify-center gap-3">
            <div style={{ backgroundColor: goldColor }} className="h-px w-12" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-900 font-serif">
              {sec.title}
            </h2>
            <div style={{ backgroundColor: goldColor }} className="h-px w-12" />
          </div>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans text-center max-w-xl mx-auto">
              {sec.content}
            </p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <CanvaProSkillProgressBars skillsData={skillsData} theme={{ ...theme, c2: goldColor }} maxItems={4} />
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={{ ...theme, c2: goldColor }} />
          )}

          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={{ ...theme, c2: goldColor }} />
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={{ ...theme, c2: goldColor }} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={{ ...theme, c2: goldColor }} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// 12. BURGUNDY ELEGANCE LAYOUT (Template 12)
// Deep Bordeaux burgundy header banner, warm champagne neutral, rose silk cards
// =========================================================================
function BurgundyEleganceLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const burgundy = '#581825';

  return (
    <div className="flex flex-col min-h-[297mm]">
      {/* Bordeaux Burgundy Top Header */}
      <div
        style={{
          backgroundColor: burgundy,
          borderBottom: '3px solid #d4af37'
        }}
        className="p-8 text-white text-center space-y-1.5"
      >
        <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#d4af37] font-bold block">
          EXECUTIVE PORTFOLIO
        </span>
        <h1 className="text-3xl font-serif tracking-wide">{pi.fullName}</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-white/90 font-sans font-semibold">
          {pi.targetRole || pi.headline}
        </p>
        <div className="flex justify-center gap-3 text-[11px] text-white/80 font-sans pt-1">
          <span>{pi.email}</span>
          <span>·</span>
          <span>{pi.phone}</span>
          <span>·</span>
          <span>{pi.location}</span>
        </div>
      </div>

      <div className={`${marginPadding} space-y-6 flex-1 text-stone-900`}>
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-3">
            <div
              style={{
                backgroundColor: '#fbf7f4',
                borderColor: burgundy
              }}
              className="p-2 border-l-4 rounded-r flex items-center justify-between"
            >
              <h2 style={{ color: burgundy }} className="text-xs font-bold uppercase tracking-wider font-serif">
                {sec.title}
              </h2>
            </div>

            {sec.sectionType === 'summary' && (
              <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{sec.content}</p>
            )}

            {sec.sectionType === 'skills' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CanvaProSkillProgressBars skillsData={skillsData} theme={{ ...theme, c1: burgundy, c2: '#9a3412' }} maxItems={4} />
              </div>
            )}

            {sec.sectionType === 'experience' && (
              <ExperienceSectionContent entries={sec.entries || []} theme={{ ...theme, c2: burgundy }} />
            )}

            {sec.sectionType === 'projects' && (
              <CanvaProjectCards entries={sec.entries || []} theme={{ ...theme, c2: burgundy }} />
            )}

            {sec.sectionType === 'education' && (
              <EducationSectionContent entries={sec.entries || []} theme={{ ...theme, c2: burgundy }} />
            )}

            {sec.sectionType === 'certifications' && (
              <CertificationsSectionContent entries={sec.entries || []} theme={{ ...theme, c2: burgundy }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 13. SWISS DESIGN LAYOUT (Template 13)
// International Typographic Style (Max Bill), strict grid, 01/02 numbering
// =========================================================================
function SwissDesignLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const swissRed = '#e11d48';

  return (
    <div className={`${marginPadding} space-y-6 text-black font-sans`}>
      {/* Swiss Header */}
      <div className="grid grid-cols-12 gap-4 pb-4 border-b-2 border-black">
        <div className="col-span-8 space-y-1">
          <div style={{ backgroundColor: swissRed }} className="w-8 h-1 mb-2" />
          <h1 className="text-3xl font-black tracking-tighter uppercase">{pi.fullName}</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-600">
            {pi.targetRole || pi.headline}
          </p>
        </div>
        <div className="col-span-4 text-right text-[11px] font-mono space-y-0.5 text-stone-600">
          <div>{pi.email}</div>
          <div>{pi.phone}</div>
          <div>{pi.location}</div>
        </div>
      </div>

      {/* Asymmetric Swiss Grid Rows */}
      {sections.map((sec, sIdx) => {
        const num = String(sIdx + 1).padStart(2, '0');
        return (
          <div key={sIdx} className="grid grid-cols-12 gap-4 pt-2">
            <div className="col-span-3">
              <span className="font-mono text-xs font-black block">{num} /</span>
              <span className="text-[11px] font-black uppercase tracking-wider block text-stone-800">
                {sec.title}
              </span>
            </div>

            <div className="col-span-9 space-y-2">
              {sec.sectionType === 'summary' && (
                <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{sec.content}</p>
              )}

              {sec.sectionType === 'skills' && (
                <div className="grid grid-cols-2 gap-3">
                  <CanvaProSkillProgressBars skillsData={skillsData} theme={{ ...theme, c2: swissRed }} maxItems={4} />
                </div>
              )}

              {sec.sectionType === 'experience' && (
                <ExperienceSectionContent entries={sec.entries || []} theme={{ ...theme, c2: swissRed }} />
              )}

              {sec.sectionType === 'projects' && (
                <CanvaProjectCards entries={sec.entries || []} theme={{ ...theme, c2: swissRed }} />
              )}

              {sec.sectionType === 'education' && (
                <EducationSectionContent entries={sec.entries || []} theme={{ ...theme, c2: swissRed }} />
              )}

              {sec.sectionType === 'certifications' && (
                <CertificationsSectionContent entries={sec.entries || []} theme={{ ...theme, c2: swissRed }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =========================================================================
// 14. CLASSIC SERIF LAYOUT (Template 14)
// Harvard / Oxford traditional academic prestige, classical double dividers
// =========================================================================
function ClassicSerifLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  return (
    <div className={`${marginPadding} space-y-5 text-stone-900 font-serif`}>
      {/* Traditional Centered Header */}
      <div className="text-center space-y-1 pb-3">
        <h1 className="text-3xl font-bold tracking-tight text-stone-950 font-serif">
          {pi.fullName}
        </h1>
        <p className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-stone-700">
          {pi.targetRole || pi.headline}
        </p>
        <div className="flex justify-center gap-3 text-[11px] text-stone-600 font-serif pt-1">
          <span>{pi.location}</span>
          <span>♦</span>
          <span>{pi.email}</span>
          <span>♦</span>
          <span>{pi.phone}</span>
        </div>
      </div>

      {/* Classical Double Hairline Rule */}
      <div className="space-y-0.5">
        <div className="h-0.5 bg-stone-900 w-full" />
        <div className="h-px bg-stone-500 w-full" />
      </div>

      {/* Classical Sections */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="space-y-2">
          <div className="border-b border-stone-400 pb-0.5">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-stone-900 font-serif">
              {sec.title}
            </h2>
          </div>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] text-stone-800 leading-relaxed font-serif text-justify">{sec.content}</p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
              <CanvaProSkillProgressBars skillsData={skillsData} theme={theme} maxItems={4} />
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// 15. SCANDINAVIAN MINIMAL LAYOUT (Template 15)
// Nordic hygge functional minimalism, warm sand canvas, soft rounded cards
// =========================================================================
function ScandinavianMinimalLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const sageColor = '#319795';

  return (
    <div
      style={{ backgroundColor: '#f9f8f5' }}
      className={`min-h-[297mm] ${marginPadding} space-y-5 text-stone-800 font-sans`}
    >
      {/* Nordic Clean Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-4 border-b border-stone-200">
        <div>
          <span style={{ color: sageColor }} className="text-[10px] font-mono uppercase tracking-widest font-bold block">
            NORDIC ENGINEERING MATRIX
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 mt-0.5">{pi.fullName}</h1>
          <p className="text-xs font-semibold text-stone-600">{pi.targetRole}</p>
        </div>
        <div className="text-[11px] text-stone-500 font-mono space-y-0.5 text-left sm:text-right">
          <div>{pi.email}</div>
          <div>{pi.location} · {pi.phone}</div>
        </div>
      </div>

      {/* Rounded Soft Cards */}
      {sections.map((sec, sIdx) => (
        <div
          key={sIdx}
          className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2.5 break-inside-avoid"
        >
          <div className="flex items-center gap-2">
            <span style={{ backgroundColor: sageColor }} className="w-2 h-2 rounded-full inline-block" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-sans">
              {sec.title}
            </h2>
          </div>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] text-stone-700 leading-relaxed font-sans">{sec.content}</p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CanvaProSkillProgressBars skillsData={skillsData} theme={{ ...theme, c2: sageColor }} maxItems={4} />
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={{ ...theme, c2: sageColor }} />
          )}

          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={{ ...theme, c2: sageColor }} />
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={{ ...theme, c2: sageColor }} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={{ ...theme, c2: sageColor }} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// 16. SOFTWARE ENGINEER LAYOUT (Template 16)
// Silicon Valley developer terminal workspace, macOS traffic lights, docstring summary
// =========================================================================
function SoftwareEngineerLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const summarySec = sections.find(s => s.sectionType === 'summary');

  return (
    <div className="flex flex-col min-h-[297mm]">
      {/* Terminal Title Bar */}
      <div
        style={{ backgroundColor: theme.c1 }}
        className="px-6 py-3 text-white flex items-center justify-between font-mono text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-white/60 ml-2 text-[11px]">dev-workspace — bash — 80x24</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/80">
          <span className="px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-bold">git: (main) *</span>
          <span>status: 200 OK</span>
        </div>
      </div>

      <div className={`${marginPadding} space-y-5 flex-1 text-stone-900`}>
        {/* Developer Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-3 border-b-2 border-stone-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-mono">{pi.fullName}</h1>
            <p style={{ color: theme.c2 }} className="text-xs font-bold uppercase tracking-wider font-mono">
              // {pi.targetRole || pi.headline}
            </p>
          </div>
          <div className="text-[11px] font-mono text-stone-600 text-left sm:text-right space-y-0.5">
            <div>{pi.email} · {pi.phone}</div>
            <div>{pi.githubUrl && `github: ${pi.githubUrl.split('/').pop()}`} · {pi.location}</div>
          </div>
        </div>

        {/* Docstring Summary */}
        {summarySec?.content && (
          <div
            style={{ backgroundColor: theme.c4, borderColor: theme.c3 }}
            className="p-3.5 rounded-xl border font-mono text-[11px] text-stone-800 space-y-1 shadow-2xs"
          >
            <span style={{ color: theme.c2 }} className="block font-bold">/**</span>
            <p className="pl-4 leading-relaxed font-sans text-stone-700">{summarySec.content}</p>
            <span style={{ color: theme.c2 }} className="block font-bold"> */</span>
          </div>
        )}

        {/* Other Sections */}
        {sections.map((sec, sIdx) => {
          if (sec.sectionType === 'summary') return null;
          return (
            <div key={sIdx} className="space-y-2.5">
              <div className="flex items-center gap-2 border-b border-stone-300 pb-1">
                <span className="font-mono text-xs font-bold text-emerald-600">$</span>
                <h2 style={{ color: theme.c1 }} className="text-xs font-bold uppercase tracking-wider font-mono">
                  cat ./{sec.title.toLowerCase().replace(/\s+/g, '_')}
                </h2>
              </div>

              {sec.sectionType === 'skills' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CanvaProSkillProgressBars skillsData={skillsData} theme={theme} maxItems={4} />
                </div>
              )}

              {sec.sectionType === 'experience' && (
                <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
              )}

              {sec.sectionType === 'projects' && (
                <CanvaProjectCards entries={sec.entries || []} theme={theme} />
              )}

              {sec.sectionType === 'education' && (
                <EducationSectionContent entries={sec.entries || []} theme={theme} />
              )}

              {sec.sectionType === 'certifications' && (
                <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// 17. DATA & AI PROFESSIONAL LAYOUT (Template 17)
// Neural network telemetry, model accuracy progress rings, LangGraph & PyTorch
// =========================================================================
function DataAIProLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const aiAccent = '#7c3aed'; // Purple
  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 4);

  return (
    <div className={`${marginPadding} space-y-6 text-stone-900`}>
      {/* AI Telemetry Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.c1} 0%, #1e1b4b 100%)`,
          borderBottom: `3px solid ${aiAccent}`
        }}
        className="p-6 rounded-2xl text-white space-y-3"
      >
        <div className="flex justify-between items-center text-[10px] font-mono text-purple-300">
          <span>MODEL ARCHITECTURE · MULTI-AGENT RAG · DEEP LEARNING</span>
          <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500 font-bold">PyTorch 2.4</span>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{pi.fullName}</h1>
          <p style={{ color: '#c084fc' }} className="text-xs font-bold uppercase tracking-widest mt-0.5">
            {pi.targetRole || pi.headline}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-white/80 font-mono pt-1">
          <span>{pi.email}</span>
          <span>·</span>
          <span>{pi.phone}</span>
          <span>·</span>
          <span>{pi.location}</span>
        </div>
      </div>

      {/* Circular Model Accuracy Rings */}
      <div
        style={{ backgroundColor: theme.c4, borderColor: theme.c3 }}
        className="p-4 rounded-xl border shadow-xs space-y-2"
      >
        <span style={{ color: aiAccent }} className="font-mono text-xs font-bold uppercase tracking-wider block">
          Model Accuracy &amp; Neural Pipeline Telemetry
        </span>
        <div className="flex justify-around flex-wrap gap-3 py-1">
          {topSkills.map((sk, idx) => (
            <CircularSkillGauge
              key={idx}
              label={sk}
              percentage={getSkillProficiency(sk, idx)}
              color={aiAccent}
              trackColor={theme.c3}
              textColor={theme.c1}
              size={52}
            />
          ))}
        </div>
      </div>

      {/* Sections */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: aiAccent }}>
            <Cpu size={14} style={{ color: aiAccent }} />
            <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono">
              {sec.title}
            </h2>
          </div>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{sec.content}</p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CanvaProSkillProgressBars skillsData={skillsData} theme={{ ...theme, c2: aiAccent }} maxItems={4} />
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={{ ...theme, c2: aiAccent }} />
          )}

          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={{ ...theme, c2: aiAccent }} />
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={{ ...theme, c2: aiAccent }} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={{ ...theme, c2: aiAccent }} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// 18. DEVOPS ENGINEER LAYOUT (Template 18)
// CNCF Cloud Native platform dashboard, 99.99% uptime SLA banner, GitOps cards
// =========================================================================
function DevOpsEngineerLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const k8sBlue = '#0284c7'; // Sky/K8s Blue

  return (
    <div className={`${marginPadding} space-y-5 text-stone-900`}>
      {/* CNCF Cloud Native Dashboard Header */}
      <div
        style={{
          backgroundColor: '#0f172a',
          borderTop: `5px solid ${k8sBlue}`
        }}
        className="p-6 rounded-2xl text-white space-y-3"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[10.5px] font-bold uppercase tracking-wider mb-1">
              <Cloud size={13} /> Cloud Native Platform &amp; SRE Infrastructure
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display">{pi.fullName}</h1>
            <p className="text-xs text-sky-300 font-semibold">{pi.targetRole || pi.headline}</p>
          </div>
          <div className="text-[11px] font-mono text-stone-300 space-y-0.5 text-left sm:text-right">
            <div>{pi.email}</div>
            <div>{pi.location} · {pi.phone}</div>
          </div>
        </div>

        {/* 99.99% SLA Uptime Strip */}
        <div
          style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)' }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl border text-center font-mono text-xs"
        >
          <div>
            <span className="text-emerald-400 font-bold block">99.99% SLA</span>
            <span className="text-[9px] text-white/70 uppercase">Uptime Verified</span>
          </div>
          <div>
            <span className="text-sky-400 font-bold block">Kubernetes</span>
            <span className="text-[9px] text-white/70 uppercase">Cluster Fleet</span>
          </div>
          <div>
            <span className="text-amber-400 font-bold block">Terraform</span>
            <span className="text-[9px] text-white/70 uppercase">IaC Modular</span>
          </div>
          <div>
            <span className="text-indigo-400 font-bold block">GitOps</span>
            <span className="text-[9px] text-white/70 uppercase">Zero-Downtime</span>
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="space-y-3">
          <div style={{ borderColor: k8sBlue }} className="pb-1 border-b-2 flex items-center justify-between">
            <h2 style={{ color: theme.c1 }} className="text-xs font-black uppercase tracking-wider font-mono">
              // {sec.title}
            </h2>
            <span style={{ color: k8sBlue }} className="text-[10px] font-mono font-bold">
              PRODUCTION TELEMETRY
            </span>
          </div>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{sec.content}</p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CanvaProSkillProgressBars skillsData={skillsData} theme={{ ...theme, c2: k8sBlue }} maxItems={4} />
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={{ ...theme, c2: k8sBlue }} />
          )}

          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={{ ...theme, c2: k8sBlue }} />
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={{ ...theme, c2: k8sBlue }} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={{ ...theme, c2: k8sBlue }} />
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// 19. ACADEMIC & RESEARCH LAYOUT (Template 19)
// Education & research placed first, formal academic CV hierarchy
// =========================================================================
function AcademicResearchLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  const eduSec = sections.find(s => s.sectionType === 'education');
  const summarySec = sections.find(s => s.sectionType === 'summary');
  const projSec = sections.find(s => s.sectionType === 'projects');
  const expSec = sections.find(s => s.sectionType === 'experience');
  const certSec = sections.find(s => s.sectionType === 'certifications');

  return (
    <div className={`${marginPadding} space-y-5 text-stone-900 font-serif`}>
      {/* Formal Academic Header */}
      <div className="text-center pb-3 border-b border-stone-400 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-serif">
          {pi.fullName}
        </h1>
        <p className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-stone-600">
          {pi.targetRole || 'Academic Researcher & Computer Scientist'}
        </p>
        <div className="flex justify-center gap-3 text-[11px] text-stone-600 font-serif pt-0.5">
          <span>{pi.email}</span>
          <span>·</span>
          <span>{pi.phone}</span>
          <span>·</span>
          <span>{pi.location}</span>
        </div>
      </div>

      {summarySec?.content && (
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-0.5">
            Research Statement &amp; Focus
          </h2>
          <p className="text-[11.5px] text-stone-800 leading-relaxed font-serif text-justify">
            {summarySec.content}
          </p>
        </div>
      )}

      {/* EDUCATION PLACED FIRST */}
      {eduSec && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-0.5">
            Academic Degrees &amp; University Appointments
          </h2>
          <EducationSectionContent entries={eduSec.entries || []} theme={theme} />
        </div>
      )}

      {/* RESEARCH & PROJECTS */}
      {projSec && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-0.5">
            Research Publications &amp; Laboratory Implementations
          </h2>
          <CanvaProjectCards entries={projSec.entries || []} theme={theme} />
        </div>
      )}

      {/* SKILLS */}
      <div className="space-y-2 font-sans">
        <h2 className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-0.5">
          Research Methodologies &amp; Technical Proficiency
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <CanvaProSkillProgressBars skillsData={skillsData} theme={theme} maxItems={4} />
        </div>
      </div>

      {/* EXPERIENCE */}
      {expSec && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-0.5">
            Teaching &amp; Professional Positions
          </h2>
          <ExperienceSectionContent entries={expSec.entries || []} theme={theme} />
        </div>
      )}

      {/* CERTS */}
      {certSec && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-0.5">
            Honors, Fellowships &amp; Accreditations
          </h2>
          <CertificationsSectionContent entries={certSec.entries || []} theme={theme} />
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 20. ATS CLASSIC LAYOUT (Template 20)
// 100% ATS parser compliant single-column, zero graphical noise, perfect text extraction
// =========================================================================
function ATSClassicLayout({ resume, theme, pi, sections, skillsData, marginPadding }) {
  return (
    <div className={`${marginPadding} space-y-4 text-stone-900 font-sans`}>
      {/* 100% Parser Compliant Header */}
      <div className="text-center pb-2 border-b border-stone-800 space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight text-black font-sans uppercase">
          {pi.fullName}
        </h1>
        <p className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
          {pi.targetRole || pi.headline}
        </p>
        <div className="text-[11px] text-stone-700 space-y-0.5 pt-0.5">
          <div>{pi.location} | {pi.phone} | {pi.email}</div>
          {pi.linkedinUrl && <div>LinkedIn: {pi.linkedinUrl}</div>}
          {pi.githubUrl && <div>GitHub: {pi.githubUrl}</div>}
        </div>
      </div>

      {/* Clean Single-Column Sections */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="space-y-2 break-inside-avoid">
          <div className="border-b border-stone-800 pb-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black font-sans">
              {sec.title}
            </h2>
          </div>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] text-stone-800 leading-relaxed font-sans">{sec.content}</p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="space-y-1 text-[11px] text-stone-800 font-sans">
              {(skillsData && skillsData.length > 0) ? (
                skillsData.map((cat, idx) => (
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
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'projects' && (
            <div className="space-y-2.5">
              {(sec.entries || []).map((p, idx) => (
                <div key={idx} className="break-inside-avoid space-y-0.5">
                  <div className="flex justify-between items-baseline text-[11.5px]">
                    <span className="font-bold text-black">{p.title}</span>
                    {p.startDate && <span className="text-[10.5px] text-stone-600 font-mono">{p.startDate}</span>}
                  </div>
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="text-[10.5px] text-stone-700 italic">
                      Technologies: {p.technologies.join(', ')}
                    </div>
                  )}
                  {p.description && <p className="text-[11px] text-stone-800 leading-relaxed">{p.description}</p>}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-[11px] text-stone-800">
                      {p.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {sec.sectionType === 'education' && (
            <EducationSectionContent entries={sec.entries || []} theme={theme} />
          )}

          {sec.sectionType === 'certifications' && (
            <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
          )}
        </div>
      ))}
    </div>
  );
}
