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
  Code2
} from 'lucide-react';
import { getPalette } from './palettes.js';
import { getTemplateMeta } from './templatesMeta.js';

// =========================================================================
// DETERMINISTIC SKILL PROFICIENCY GENERATOR
// Provides realistic engineering percentages (96%, 92%, 88%, etc.)
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

export function ResumeRenderer({
  resume,
  zoom = 1,
  id = 'printable-resume',
  className = ''
}) {
  if (!resume) return null;

  const templateId = resume.templateId || 'modern-pro';
  const meta = getTemplateMeta(templateId);
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

  // Archetype Dispatcher
  const isExecutiveLuxe = ['executive-pro', 'contemporary-creative'].includes(templateId) || meta.layout === 'executive';
  const isSplitSidebar = ['modern-two-col', 'elegant-sidebar'].includes(templateId) || ['two-col-left', 'sidebar-dark'].includes(meta.layout);
  const isTimeline = templateId === 'timeline-resume' || meta.layout === 'timeline-vertical';
  const isTechGrid = ['software-engineer', 'backend-engineer', 'devops-engineer', 'ai-ml-engineer', 'fullstack-dev', 'automation-engineer', 'cybersecurity-networking'].includes(templateId);
  const isSwissMinimal = ['minimal-elegant', 'academic-research', 'international-premium'].includes(templateId);
  const isPortfolioShowcase = templateId === 'portfolio-oriented' || meta.layout === 'portfolio-first';

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
        {isExecutiveLuxe ? (
          <CanvaExecutiveLuxeLayout
            resume={resume}
            theme={normalizedTheme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        ) : isSplitSidebar ? (
          <AdobeSplitSidebarLayout
            resume={resume}
            theme={normalizedTheme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
          />
        ) : isPortfolioShowcase ? (
          <PortfolioShowcaseLayout
            resume={resume}
            theme={normalizedTheme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        ) : isTechGrid ? (
          <SiliconValleyTechLayout
            resume={resume}
            theme={normalizedTheme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        ) : isTimeline ? (
          <ModernTimelineLayout
            resume={resume}
            theme={normalizedTheme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        ) : isSwissMinimal ? (
          <SwissMinimalLayout
            resume={resume}
            theme={normalizedTheme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        ) : (
          <ClassicATSLayout
            resume={resume}
            theme={normalizedTheme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 1. CANVA EXECUTIVE LUXE LAYOUT
// Top Gradient Ribbon, Monogram Badge, 2-Column Grid with Visual Skill Bars
// =========================================================================
function CanvaExecutiveLuxeLayout({ resume, theme, pi, sections, skillsData, meta, marginPadding }) {
  const initials = (pi.fullName || 'EH')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  const summarySec = sortedSections.find(s => s.sectionType === 'summary');
  const mainSecs = sortedSections.filter(s => ['projects', 'experience'].includes(s.sectionType));
  const sideSecs = sortedSections.filter(s => ['skills', 'education', 'certifications', 'custom'].includes(s.sectionType));

  return (
    <div className="flex flex-col min-h-[297mm]">
      {/* LUXURY TOP BANNER */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.c1} 0%, ${theme.c1}ee 100%)`,
          color: '#ffffff'
        }}
        className="p-8 sm:p-9 relative overflow-hidden"
      >
        {/* Subtle geometric circles */}
        <div
          style={{ borderColor: theme.c2 }}
          className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border-8 opacity-15 pointer-events-none"
        />
        <div
          style={{ borderColor: theme.c3 }}
          className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full border-4 opacity-20 pointer-events-none"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Monogram Seal */}
            <div
              style={{
                borderColor: theme.c2,
                color: theme.c2
              }}
              className="w-14 h-14 rounded-2xl border-2 bg-white/10 backdrop-blur-xs flex items-center justify-center font-serif text-xl font-black shadow-inner shrink-0"
            >
              {initials}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif text-white">
                {pi.fullName || 'Emaan Humayun'}
              </h1>
              <p
                style={{ color: theme.c2 }}
                className="text-xs font-bold uppercase tracking-[0.2em] mt-1"
              >
                {pi.professionalTitle || resume.targetRole || 'Software Engineer'}
              </p>
            </div>
          </div>

          {/* Contact Badges */}
          <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 text-[11px] text-white/90">
            {pi.email && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs">
                <Mail size={12} style={{ color: theme.c2 }} /> {pi.email}
              </span>
            )}
            {pi.phone && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs">
                <Phone size={12} style={{ color: theme.c2 }} /> {pi.phone}
              </span>
            )}
            {pi.location && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs">
                <MapPin size={12} style={{ color: theme.c2 }} /> {pi.location}
              </span>
            )}
            {pi.linkedinUrl && (
              <a
                href={pi.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs hover:bg-white/20 transition"
              >
                <Linkedin size={12} style={{ color: theme.c2 }} /> LinkedIn
              </a>
            )}
            {pi.githubUrl && (
              <a
                href={pi.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs hover:bg-white/20 transition"
              >
                <Github size={12} style={{ color: theme.c2 }} /> GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      {/* BODY (2-Column Grid) */}
      <div className="p-8 sm:p-9 flex-1 flex flex-col sm:flex-row gap-8">
        {/* LEFT COLUMN (38%): Visual Skill Progress Bars, Education, Certifications */}
        <div className="w-full sm:w-[38%] flex flex-col space-y-6">
          {sideSecs.map(sec => (
            <div key={sec.id || sec._id || sec.title} className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b-2" style={{ borderColor: theme.c1 }}>
                <h2 style={{ color: theme.c1 }} className="text-xs font-bold uppercase tracking-wider font-serif">
                  {sec.title}
                </h2>
              </div>

              {sec.sectionType === 'skills' && (
                <CanvaProSkillProgressBars skillsData={skillsData} fallbackEntries={sec.entries} theme={theme} />
              )}
              {sec.sectionType === 'education' && (
                <EducationSectionContent entries={sec.entries || []} theme={theme} />
              )}
              {sec.sectionType === 'certifications' && (
                <CertificationsSectionContent entries={sec.entries || []} theme={theme} />
              )}
              {sec.sectionType === 'custom' && (
                <div className="text-[11.5px] leading-relaxed text-stone-700 whitespace-pre-line">
                  {sec.customContent}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN (62%): Executive Summary, Experience, Projects */}
        <div className="w-full sm:w-[62%] flex flex-col space-y-6">
          {/* Executive Summary Quote Box */}
          {summarySec && (
            <div
              style={{
                backgroundColor: theme.c4,
                borderLeftColor: theme.c2
              }}
              className="p-4 border-l-4 rounded-r-xl shadow-xs"
            >
              <h2 style={{ color: theme.c1 }} className="text-xs font-bold uppercase tracking-wider font-serif mb-1">
                {summarySec.title}
              </h2>
              <p className="text-[11.5px] leading-relaxed text-stone-700">
                {summarySec.customContent || summarySec.entries?.[0]?.description || resume.professionalSummary}
              </p>
            </div>
          )}

          {mainSecs.map(sec => (
            <div key={sec.id || sec._id || sec.title} className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b-2" style={{ borderColor: theme.c1 }}>
                <h2 style={{ color: theme.c1 }} className="text-xs font-bold uppercase tracking-wider font-serif">
                  {sec.title}
                </h2>
              </div>

              {sec.sectionType === 'projects' && (
                <CanvaProjectCards entries={sec.entries || []} theme={theme} />
              )}
              {sec.sectionType === 'experience' && (
                <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. ADOBE SPLIT SIDEBAR LAYOUT
// 34% Tinted Architectural Sidebar with 5-Dot Visual Rating Meters & Monogram
// =========================================================================
function AdobeSplitSidebarLayout({ resume, theme, pi, sections, skillsData, meta }) {
  const isDark = meta.layout === 'sidebar-dark';
  const sidebarBg = isDark ? theme.c1 : theme.c4;
  const sidebarTextColor = isDark ? '#ffffff' : theme.c1;

  const sideSecs = sections.filter(s => ['skills', 'education', 'certifications'].includes(s.sectionType));
  const mainSecs = sections.filter(s => !['skills', 'education', 'certifications'].includes(s.sectionType));

  return (
    <div className="flex flex-row min-h-[297mm]">
      {/* LEFT ARCHITECTURAL SIDEBAR (34%) */}
      <div
        style={{
          width: '34%',
          backgroundColor: sidebarBg,
          color: sidebarTextColor,
          borderRightColor: theme.c3
        }}
        className="p-7 border-r flex flex-col space-y-6"
      >
        {/* Monogram Badge & Title */}
        <div className="pb-4 border-b border-black/10 dark:border-white/20">
          <div
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : theme.c1,
              color: isDark ? theme.c2 : '#ffffff'
            }}
            className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold mb-3 shadow-xs"
          >
            {(pi.fullName || 'EH').slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-xl font-black tracking-tight font-serif leading-tight">
            {pi.fullName || 'Emaan Humayun'}
          </h1>
          <p
            style={{ color: isDark ? theme.c2 : theme.c1 }}
            className="text-[11px] font-bold uppercase tracking-widest mt-1"
          >
            {pi.professionalTitle || resume.targetRole}
          </p>
        </div>

        {/* Contact Strip */}
        <div className="space-y-2 text-[11px]">
          {pi.email && (
            <div className="flex items-center gap-2">
              <Mail size={13} style={{ color: isDark ? theme.c2 : theme.c2 }} className="shrink-0" />
              <span className="truncate">{pi.email}</span>
            </div>
          )}
          {pi.phone && (
            <div className="flex items-center gap-2">
              <Phone size={13} style={{ color: isDark ? theme.c2 : theme.c2 }} className="shrink-0" />
              <span>{pi.phone}</span>
            </div>
          )}
          {pi.location && (
            <div className="flex items-center gap-2">
              <MapPin size={13} style={{ color: isDark ? theme.c2 : theme.c2 }} className="shrink-0" />
              <span>{pi.location}</span>
            </div>
          )}
          {pi.githubUrl && (
            <div className="flex items-center gap-2">
              <Github size={13} style={{ color: isDark ? theme.c2 : theme.c2 }} className="shrink-0" />
              <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                {pi.githubUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {pi.linkedinUrl && (
            <div className="flex items-center gap-2">
              <Linkedin size={13} style={{ color: isDark ? theme.c2 : theme.c2 }} className="shrink-0" />
              <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                LinkedIn Profile
              </a>
            </div>
          )}
          {pi.portfolioUrl && (
            <div className="flex items-center gap-2">
              <Globe size={13} style={{ color: isDark ? theme.c2 : theme.c2 }} className="shrink-0" />
              <a href={pi.portfolioUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                Portfolio Site
              </a>
            </div>
          )}
        </div>

        {/* Sidebar Sections */}
        {sideSecs.map(sec => (
          <div key={sec.id || sec._id || sec.title} className="space-y-2.5">
            <h2
              style={{ color: isDark ? theme.c2 : theme.c1 }}
              className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-1"
            >
              {sec.title}
            </h2>

            {sec.sectionType === 'skills' && (
              <CanvaPro5DotRatingMeters skillsData={skillsData} theme={theme} isDark={isDark} />
            )}
            {sec.sectionType === 'education' && (
              <EducationSectionContent entries={sec.entries || []} theme={theme} isDarkSidebar={isDark} />
            )}
            {sec.sectionType === 'certifications' && (
              <CertificationsSectionContent entries={sec.entries || []} theme={theme} isDarkSidebar={isDark} />
            )}
          </div>
        ))}
      </div>

      {/* RIGHT MAIN CONTENT (66%) */}
      <div className="p-8 sm:p-9 flex-1 flex flex-col space-y-6">
        {mainSecs.map(sec => (
          <div key={sec.id || sec._id || sec.title} className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b-2" style={{ borderColor: theme.c1 }}>
              <h2 style={{ color: theme.c1 }} className="text-xs font-bold uppercase tracking-wider font-serif">
                {sec.title}
              </h2>
            </div>

            {sec.sectionType === 'summary' && (
              <p className="text-[11.5px] sm:text-[12px] leading-relaxed text-stone-700">
                {sec.customContent || sec.entries?.[0]?.description || resume.professionalSummary}
              </p>
            )}
            {sec.sectionType === 'projects' && (
              <CanvaProjectCards entries={sec.entries || []} theme={theme} />
            )}
            {sec.sectionType === 'experience' && (
              <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 3. SILICON VALLEY TECH & ENGINEERING LAYOUT
// Domain Cards with Telemetry Progress Meters & Tech Badges
// =========================================================================
function SiliconValleyTechLayout({ resume, theme, pi, sections, skillsData, meta, marginPadding }) {
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  const summarySec = sortedSections.find(s => s.sectionType === 'summary');
  const skillsSec = sortedSections.find(s => s.sectionType === 'skills');
  const otherSecs = sortedSections.filter(s => !['summary', 'skills'].includes(s.sectionType));

  return (
    <div className={`${marginPadding} flex flex-col space-y-5`}>
      {/* TECH HERO HEADER */}
      <div className="pb-4 border-b-2" style={{ borderColor: theme.c1 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 style={{ color: theme.c1 }} className="text-2xl sm:text-3xl font-black tracking-tight">
              {pi.fullName || 'Emaan Humayun'}
            </h1>
            <p style={{ color: theme.c2 }} className="text-xs font-bold uppercase tracking-widest mt-1">
              {pi.professionalTitle || resume.targetRole || 'Full-Stack Software Engineer'}
            </p>
          </div>

          <div className="text-[11px] text-stone-600 flex flex-wrap sm:flex-col sm:items-end gap-1.5">
            {pi.email && (
              <span className="flex items-center gap-1 font-mono">
                <Mail size={12} style={{ color: theme.c2 }} /> {pi.email}
              </span>
            )}
            {pi.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} style={{ color: theme.c2 }} /> {pi.location}
              </span>
            )}
            <div className="flex items-center gap-3 pt-1">
              {pi.githubUrl && (
                <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-800 font-mono text-[10.5px]">
                  <Github size={12} style={{ color: theme.c2 }} /> github
                </a>
              )}
              {pi.linkedinUrl && (
                <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-800 font-mono text-[10.5px]">
                  <Linkedin size={12} style={{ color: theme.c2 }} /> linkedin
                </a>
              )}
              {pi.portfolioUrl && (
                <a href={pi.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-800 font-mono text-[10.5px]">
                  <Globe size={12} style={{ color: theme.c2 }} /> portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      {summarySec && (
        <div className="space-y-1.5">
          <h2 style={{ color: theme.c1 }} className="text-[11.5px] font-bold uppercase tracking-wider font-mono">
            // {summarySec.title}
          </h2>
          <p className="text-[11.5px] leading-relaxed text-stone-700">
            {summarySec.customContent || summarySec.entries?.[0]?.description || resume.professionalSummary}
          </p>
        </div>
      )}

      {/* TECHNICAL COMPETENCIES (Interactive Domain Cards with Progress Meters) */}
      {skillsSec && (
        <div className="space-y-2.5">
          <h2 style={{ color: theme.c1 }} className="text-[11.5px] font-bold uppercase tracking-wider font-mono flex items-center justify-between">
            <span>// {skillsSec.title}</span>
            <span className="text-[10px] text-stone-500 font-normal">Telemetry Verification: Active</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(skillsData || []).map((cat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: theme.c4,
                  borderColor: theme.c3
                }}
                className="p-3 rounded-xl border flex flex-col gap-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: theme.c1 }} className="font-bold text-[11px] font-mono flex items-center gap-1.5">
                    <Terminal size={12} style={{ color: theme.c2 }} /> {cat.name}
                  </span>
                  <span
                    style={{ backgroundColor: theme.c3, color: theme.c1 }}
                    className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded"
                  >
                    Tier-1
                  </span>
                </div>

                {/* Progress telemetry tracks for top skills */}
                <div className="space-y-1.5 pt-1">
                  {(cat.skills || []).slice(0, 3).map((sk, sIdx) => {
                    const pct = getSkillProficiency(sk, sIdx);
                    return (
                      <div key={sIdx} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-stone-700 font-medium">{sk}</span>
                          <span style={{ color: theme.c2 }} className="font-bold">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: theme.c3 }}>
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: theme.c2
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Secondary skill badges */}
                {(cat.skills || []).length > 3 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-black/5">
                    {(cat.skills || []).slice(3).map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          backgroundColor: '#ffffff',
                          color: theme.c1,
                          borderColor: theme.c3
                        }}
                        className="px-1.5 py-0.5 rounded text-[9.5px] font-mono border"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OTHER SECTIONS (Projects, Experience, Education) */}
      {otherSecs.map(sec => (
        <div key={sec.id || sec._id || sec.title} className="space-y-2.5">
          <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: theme.c3 }}>
            <h2 style={{ color: theme.c1 }} className="text-[11.5px] font-bold uppercase tracking-wider font-mono">
              // {sec.title}
            </h2>
          </div>

          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={theme} />
          )}
          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
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
// 4. PORTFOLIO SHOWCASE FIRST LAYOUT
// Projects Prominently Positioned with Capability Progress Meters
// =========================================================================
function PortfolioShowcaseLayout({ resume, theme, pi, sections, skillsData, meta, marginPadding }) {
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  const summarySec = sortedSections.find(s => s.sectionType === 'summary');
  const projectSec = sortedSections.find(s => s.sectionType === 'projects');
  const skillsSec = sortedSections.find(s => s.sectionType === 'skills');
  const otherSecs = sortedSections.filter(s => !['summary', 'projects', 'skills'].includes(s.sectionType));

  return (
    <div className={`${marginPadding} flex flex-col space-y-6`}>
      {/* Editorial Header */}
      <div
        style={{
          borderBottomColor: theme.c2,
          backgroundColor: theme.c4
        }}
        className="p-6 rounded-2xl border-b-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <span
            style={{ color: theme.c2, backgroundColor: theme.c3 }}
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-1.5"
          >
            Engineering Portfolio Resume
          </span>
          <h1 style={{ color: theme.c1 }} className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
            {pi.fullName || 'Emaan Humayun'}
          </h1>
          <p style={{ color: theme.c1 }} className="text-xs font-semibold uppercase tracking-wider mt-0.5 opacity-80">
            {pi.professionalTitle || resume.targetRole}
          </p>
        </div>

        <div className="text-[11px] space-y-1 text-stone-700">
          {pi.email && <div className="flex items-center gap-1.5"><Mail size={12} style={{ color: theme.c2 }} /> {pi.email}</div>}
          {pi.location && <div className="flex items-center gap-1.5"><MapPin size={12} style={{ color: theme.c2 }} /> {pi.location}</div>}
          <div className="flex items-center gap-2 pt-1 font-mono text-[10.5px]">
            {pi.githubUrl && <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="underline hover:text-stone-900">GitHub</a>}
            {pi.portfolioUrl && <a href={pi.portfolioUrl} target="_blank" rel="noreferrer" className="underline hover:text-stone-900">Live Portfolio</a>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {summarySec && (
        <div className="space-y-1">
          <p className="text-[12px] leading-relaxed text-stone-700 italic border-l-2 pl-3" style={{ borderColor: theme.c2 }}>
            "{summarySec.customContent || summarySec.entries?.[0]?.description || resume.professionalSummary}"
          </p>
        </div>
      )}

      {/* 2-Column: Left (Skills Graphs), Right (Showcase Projects) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
        {/* Left: Skills Progress Bars (40%) */}
        <div className="sm:col-span-5 space-y-4">
          {skillsSec && (
            <div className="space-y-3">
              <h2 style={{ color: theme.c1, borderColor: theme.c2 }} className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-1">
                {skillsSec.title}
              </h2>
              <CanvaProSkillProgressBars skillsData={skillsData} fallbackEntries={skillsSec.entries} theme={theme} />
            </div>
          )}

          {otherSecs.filter(s => ['education', 'certifications'].includes(s.sectionType)).map(sec => (
            <div key={sec.id || sec.title} className="space-y-2 pt-2">
              <h2 style={{ color: theme.c1, borderColor: theme.c2 }} className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-1">
                {sec.title}
              </h2>
              {sec.sectionType === 'education' && <EducationSectionContent entries={sec.entries || []} theme={theme} />}
              {sec.sectionType === 'certifications' && <CertificationsSectionContent entries={sec.entries || []} theme={theme} />}
            </div>
          ))}
        </div>

        {/* Right: Projects First & Experience (60%) */}
        <div className="sm:col-span-7 space-y-5">
          {projectSec && (
            <div className="space-y-3">
              <h2 style={{ color: theme.c1, borderColor: theme.c2 }} className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-1">
                {projectSec.title}
              </h2>
              <CanvaProjectCards entries={projectSec.entries || []} theme={theme} />
            </div>
          )}

          {otherSecs.filter(s => s.sectionType === 'experience').map(sec => (
            <div key={sec.id || sec.title} className="space-y-3">
              <h2 style={{ color: theme.c1, borderColor: theme.c2 }} className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-1">
                {sec.title}
              </h2>
              <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5. MODERN TIMELINE LAYOUT
// Vertical Progress Spine with Milestone Nodes & Skill Telemetry Bars
// =========================================================================
function ModernTimelineLayout({ resume, theme, pi, sections, skillsData, meta, marginPadding }) {
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className={`${marginPadding} flex flex-col space-y-6`}>
      {/* Header */}
      <div className="pb-4 border-b-2" style={{ borderColor: theme.c1 }}>
        <h1 style={{ color: theme.c1 }} className="text-3xl font-black font-serif tracking-tight">
          {pi.fullName || 'Emaan Humayun'}
        </h1>
        <p style={{ color: theme.c2 }} className="text-xs font-bold uppercase tracking-widest mt-1">
          {pi.professionalTitle || resume.targetRole}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-600">
          {pi.email && <span>{pi.email}</span>}
          {pi.phone && <span>{pi.phone}</span>}
          {pi.location && <span>{pi.location}</span>}
          {pi.linkedinUrl && <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>}
          {pi.githubUrl && <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
        </div>
      </div>

      {sortedSections.map(sec => (
        <div key={sec.id || sec._id || sec.title} className="space-y-3">
          <h2 style={{ color: theme.c1 }} className="text-xs font-bold uppercase tracking-widest font-serif border-b pb-1">
            {sec.title}
          </h2>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] leading-relaxed text-stone-700">
              {sec.customContent || sec.entries?.[0]?.description || resume.professionalSummary}
            </p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CanvaProSkillProgressBars skillsData={skillsData} fallbackEntries={sec.entries} theme={theme} />
            </div>
          )}

          {['experience', 'projects', 'education'].includes(sec.sectionType) && (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-300">
              {(sec.entries || []).map((entry, idx) => (
                <div key={idx} className="relative break-inside-avoid">
                  {/* Timeline Node Dot */}
                  <div
                    style={{ backgroundColor: theme.c2 }}
                    className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-bold text-[12px] text-stone-900">{entry.title}</span>
                    <span className="text-[10.5px] text-stone-500 font-mono">
                      {entry.startDate} {entry.endDate ? `— ${entry.endDate}` : ''}
                    </span>
                  </div>
                  {entry.subtitle && (
                    <div style={{ color: theme.c2 }} className="text-[11px] font-semibold">
                      {entry.subtitle} {entry.organization ? `| ${entry.organization}` : ''}
                    </div>
                  )}
                  {entry.description && (
                    <p className="text-[11px] text-stone-700 mt-1 leading-relaxed">{entry.description}</p>
                  )}
                  {entry.bullets && entry.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[11px] text-stone-700">
                      {entry.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
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
// 6. SWISS GRID MINIMALIST LAYOUT
// Left Vertical Accent Rule with Clean Progress Bars & Academic Purity
// =========================================================================
function SwissMinimalLayout({ resume, theme, pi, sections, skillsData, meta, marginPadding }) {
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div
      style={{ borderLeftColor: theme.c1 }}
      className={`min-h-[297mm] border-l-8 ${marginPadding} flex flex-col space-y-6`}
    >
      <div className="pb-4 border-b border-stone-200">
        <h1 style={{ color: theme.c1 }} className="text-3xl font-black font-serif tracking-tight">
          {pi.fullName || 'Emaan Humayun'}
        </h1>
        <p style={{ color: theme.c2 }} className="text-xs font-bold uppercase tracking-[0.15em] mt-1">
          {pi.professionalTitle || resume.targetRole}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-stone-600 font-mono">
          {pi.email && <span>{pi.email}</span>}
          {pi.location && <span>{pi.location}</span>}
          {pi.githubUrl && <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
          {pi.linkedinUrl && <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>}
          {pi.portfolioUrl && <a href={pi.portfolioUrl} target="_blank" rel="noreferrer" className="hover:underline">Portfolio</a>}
        </div>
      </div>

      {sortedSections.map(sec => (
        <div key={sec.id || sec._id || sec.title} className="space-y-2.5">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-300">
            <h2 style={{ color: theme.c1 }} className="text-xs font-bold uppercase tracking-widest font-serif">
              {sec.title}
            </h2>
          </div>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] leading-relaxed text-stone-700">
              {sec.customContent || sec.entries?.[0]?.description || resume.professionalSummary}
            </p>
          )}
          {sec.sectionType === 'skills' && (
            <CanvaProSkillProgressBars skillsData={skillsData} fallbackEntries={sec.entries} theme={theme} />
          )}
          {sec.sectionType === 'projects' && (
            <CanvaProjectCards entries={sec.entries || []} theme={theme} />
          )}
          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
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
// 7. CLASSIC ATS HARVARD / STANFORD LAYOUT
// Single Column Parser Safe with Horizontal Dividers
// =========================================================================
function ClassicATSLayout({ resume, theme, pi, sections, skillsData, meta, marginPadding }) {
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className={`${marginPadding} flex flex-col space-y-4`}>
      {/* Centered ATS Header */}
      <div className="text-center pb-2.5 border-b border-stone-800">
        <h1 className="text-2xl font-bold uppercase tracking-wider font-serif text-stone-900">
          {pi.fullName || 'Emaan Humayun'}
        </h1>
        <p className="text-xs font-medium text-stone-700 uppercase tracking-wide mt-0.5">
          {pi.professionalTitle || resume.targetRole}
        </p>
        <div className="mt-1 flex items-center justify-center flex-wrap gap-2 text-[11px] text-stone-600">
          {pi.email && <span>{pi.email}</span>}
          {pi.phone && <span>• {pi.phone}</span>}
          {pi.location && <span>• {pi.location}</span>}
          {pi.linkedinUrl && <span>• <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="underline">LinkedIn</a></span>}
          {pi.githubUrl && <span>• <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="underline">GitHub</a></span>}
        </div>
      </div>

      {sortedSections.map(sec => (
        <div key={sec.id || sec._id || sec.title} className="space-y-1.5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-900 border-b border-stone-800 pb-0.5">
            {sec.title}
          </h2>

          {sec.sectionType === 'summary' && (
            <p className="text-[11px] leading-relaxed text-stone-800">
              {sec.customContent || sec.entries?.[0]?.description || resume.professionalSummary}
            </p>
          )}

          {sec.sectionType === 'skills' && (
            <div className="text-[11px] space-y-1">
              {(skillsData || []).map((cat, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="font-bold text-stone-900 shrink-0">{cat.name}:</span>
                  <span className="text-stone-700">{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {sec.sectionType === 'projects' && (
            <div className="space-y-2.5">
              {(sec.entries || []).map((p, idx) => (
                <div key={idx} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[11.5px] text-stone-900">{p.title}</span>
                    <span className="text-[10.5px] font-mono text-stone-600">
                      {p.startDate} {p.endDate ? `— ${p.endDate}` : ''}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-stone-700 leading-snug mt-0.5">{p.description}</p>
                  )}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-[11px] text-stone-700">
                      {p.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {sec.sectionType === 'experience' && (
            <ExperienceSectionContent entries={sec.entries || []} theme={theme} />
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
// CANVA PRO VISUAL SKILLS GRAPH COMPONENTS
// =========================================================================

// 1. Sleek Linear Progress Bars with Dynamic Percentages & 5-Color Harmony
export function CanvaProSkillProgressBars({ skillsData, fallbackEntries, theme }) {
  if (skillsData && skillsData.length > 0) {
    return (
      <div className="space-y-3.5">
        {skillsData.map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <span
              style={{ color: theme.c1 }}
              className="font-bold text-[10.5px] uppercase tracking-wider block font-mono"
            >
              {cat.name}
            </span>
            <div className="space-y-1.5">
              {cat.skills.map((sk, sIdx) => {
                const pct = getSkillProficiency(sk, sIdx);
                return (
                  <div key={sIdx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline text-[10.5px]">
                      <span className="font-medium text-stone-800">{sk}</span>
                      <span
                        style={{ color: theme.c2 }}
                        className="font-mono text-[10px] font-bold"
                      >
                        {pct}%
                      </span>
                    </div>
                    {/* Linear Progress Bar */}
                    <div
                      className="h-1.5 w-full rounded-full overflow-hidden"
                      style={{ backgroundColor: theme.c3 || '#e2e8f0' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: theme.c2
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback flat skills
  return (
    <div className="space-y-2">
      {(fallbackEntries || []).map((e, idx) => {
        const pct = getSkillProficiency(e.title, idx);
        return (
          <div key={idx} className="space-y-0.5">
            <div className="flex justify-between text-[10.5px]">
              <span className="font-medium text-stone-800">{e.title}</span>
              <span style={{ color: theme.c2 }} className="font-mono text-[10px] font-bold">
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

// 2. Canva Pro 5-Dot Visual Rating Scale (Sidebar & Compact)
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
            {/* 5-Dot Visual Rating Scale */}
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

// =========================================================================
// REUSABLE SUBCOMPONENTS (PROJECT CARDS, EXPERIENCE, EDUCATION)
// =========================================================================

// Canva Project Highlight Cards with Repo & Demo Pills
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

// Experience Section Content
function ExperienceSectionContent({ entries, theme }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-3">
      {entries.map((job, idx) => (
        <div key={idx} className="break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <span className="font-bold text-[12px] text-stone-900">{job.title}</span>
              {job.organization && (
                <span className="text-stone-600 font-medium text-[11.5px]">
                  {' '}— {job.organization}
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
            <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[11px] text-stone-700">
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

// Education Section Content
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

// Certifications Section Content
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
                {' '}— {cert.organization}
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
