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
  Sparkles
} from 'lucide-react';
import { getPalette } from './palettes.js';
import { getTemplateMeta } from './templatesMeta.js';

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

  // Archetype Dispatcher
  const isExecutiveLuxe = ['executive-pro', 'contemporary-creative'].includes(templateId) || meta.layout === 'executive';
  const isSplitSidebar = ['modern-two-col', 'elegant-sidebar'].includes(templateId) || ['two-col-left', 'sidebar-dark'].includes(meta.layout);
  const isTimeline = templateId === 'timeline-resume' || meta.layout === 'timeline-vertical';
  const isTechGrid = ['software-engineer', 'backend-engineer', 'devops-engineer', 'ai-ml-engineer', 'fullstack-dev', 'automation-engineer', 'cybersecurity-networking'].includes(templateId);
  const isSwissMinimal = ['minimal-elegant', 'academic-research', 'international-premium'].includes(templateId);

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
          backgroundColor: theme.background || '#ffffff',
          color: theme.text || '#0f172a',
          ...fontSizeStyle
        }}
        className={`resume-paper shadow-2xl border border-stone-200 relative text-left box-border ${fontClass} print:shadow-none print:border-none print:m-0`}
      >
        {isExecutiveLuxe ? (
          <CanvaExecutiveLuxeLayout
            resume={resume}
            theme={theme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        ) : isSplitSidebar ? (
          <AdobeSplitSidebarLayout
            resume={resume}
            theme={theme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
          />
        ) : isTechGrid ? (
          <SiliconValleyTechLayout
            resume={resume}
            theme={theme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        ) : isTimeline ? (
          <ModernTimelineLayout
            resume={resume}
            theme={theme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        ) : isSwissMinimal ? (
          <SwissMinimalLayout
            resume={resume}
            theme={theme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
          />
        ) : (
          <ClassicATSLayout
            resume={resume}
            theme={theme}
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
// 1. CANVA EXECUTIVE LUXE LAYOUT (Top Gradient Banner + 2-Column Body)
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
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
          color: '#ffffff'
        }}
        className="p-8 sm:p-9 relative overflow-hidden"
      >
        {/* Subtle decorative geometry */}
        <div
          style={{ borderColor: theme.accent || '#d97706' }}
          className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full border-8 opacity-15 pointer-events-none"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Initials Seal */}
            <div
              style={{
                borderColor: theme.accent || '#d97706',
                color: theme.accent || '#d97706'
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
                style={{ color: theme.accent || '#d97706' }}
                className="text-xs font-bold uppercase tracking-[0.2em] mt-1"
              >
                {pi.professionalTitle || resume.targetRole || 'Software Engineer'}
              </p>
            </div>
          </div>

          {/* Contact Pill Badges */}
          <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 text-[11px] text-white/90">
            {pi.email && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs">
                <Mail size={12} style={{ color: theme.accent }} /> {pi.email}
              </span>
            )}
            {pi.phone && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs">
                <Phone size={12} style={{ color: theme.accent }} /> {pi.phone}
              </span>
            )}
            {pi.location && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs">
                <MapPin size={12} style={{ color: theme.accent }} /> {pi.location}
              </span>
            )}
            {pi.linkedinUrl && (
              <a
                href={pi.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs hover:bg-white/20 transition"
              >
                <Linkedin size={12} style={{ color: theme.accent }} /> LinkedIn
              </a>
            )}
            {pi.githubUrl && (
              <a
                href={pi.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs hover:bg-white/20 transition"
              >
                <Github size={12} style={{ color: theme.accent }} /> GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      {/* BODY (2-Column Grid) */}
      <div className="p-8 sm:p-9 flex-1 flex flex-col sm:flex-row gap-8">
        {/* LEFT COLUMN (35%): Skills, Education, Certifications */}
        <div className="w-full sm:w-[35%] flex flex-col space-y-6">
          {sideSecs.map(sec => (
            <div key={sec.id || sec._id || sec.title} className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b-2" style={{ borderColor: theme.primary }}>
                <h2 style={{ color: theme.primary }} className="text-xs font-bold uppercase tracking-wider font-serif">
                  {sec.title}
                </h2>
              </div>

              {sec.sectionType === 'skills' && (
                <CanvaPillSkills skillsData={skillsData} fallbackEntries={sec.entries} theme={theme} />
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

        {/* RIGHT COLUMN (65%): Executive Summary, Experience, Projects */}
        <div className="w-full sm:w-[65%] flex flex-col space-y-6">
          {/* Executive Summary Quote Box */}
          {summarySec && (
            <div
              style={{
                backgroundColor: theme.sidebarBg || '#f8fafc',
                borderLeftColor: theme.accent || theme.primary
              }}
              className="p-4 border-l-4 rounded-r-xl shadow-xs"
            >
              <h2 style={{ color: theme.primary }} className="text-xs font-bold uppercase tracking-wider font-serif mb-1">
                {summarySec.title}
              </h2>
              <p className="text-[11.5px] leading-relaxed text-stone-700">
                {summarySec.customContent || summarySec.entries?.[0]?.description || resume.professionalSummary}
              </p>
            </div>
          )}

          {mainSecs.map(sec => (
            <div key={sec.id || sec._id || sec.title} className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b-2" style={{ borderColor: theme.primary }}>
                <h2 style={{ color: theme.primary }} className="text-xs font-bold uppercase tracking-wider font-serif">
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
// 2. ADOBE SPLIT SIDEBAR LAYOUT (34% Tinted Sidebar + 66% Editorial Main)
// =========================================================================
function AdobeSplitSidebarLayout({ resume, theme, pi, sections, skillsData, meta }) {
  const isDark = meta.layout === 'sidebar-dark';
  const sidebarBg = isDark ? theme.primary : (theme.sidebarBg || '#f8fafc');
  const sidebarTextColor = isDark ? '#ffffff' : (theme.text || '#0f172a');
  const sidebarMuted = isDark ? 'rgba(255,255,255,0.7)' : (theme.muted || '#475569');

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
          borderRightColor: theme.border || '#e2e8f0'
        }}
        className="p-7 border-r flex flex-col space-y-6"
      >
        {/* Monogram Badge & Title */}
        <div className="pb-4 border-b border-black/10 dark:border-white/20">
          <div
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : theme.primary,
              color: isDark ? theme.accent : '#ffffff'
            }}
            className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold mb-3 shadow-xs"
          >
            {(pi.fullName || 'EH').slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-xl font-black tracking-tight font-serif leading-tight">
            {pi.fullName || 'Emaan Humayun'}
          </h1>
          <p
            style={{ color: isDark ? theme.accent : theme.primary }}
            className="text-[11px] font-bold uppercase tracking-widest mt-1"
          >
            {pi.professionalTitle || resume.targetRole}
          </p>
        </div>

        {/* Contact Strip */}
        <div className="space-y-2 text-[11px]">
          {pi.email && (
            <div className="flex items-center gap-2">
              <Mail size={13} style={{ color: isDark ? theme.accent : theme.primary }} className="shrink-0" />
              <span className="truncate">{pi.email}</span>
            </div>
          )}
          {pi.phone && (
            <div className="flex items-center gap-2">
              <Phone size={13} style={{ color: isDark ? theme.accent : theme.primary }} className="shrink-0" />
              <span>{pi.phone}</span>
            </div>
          )}
          {pi.location && (
            <div className="flex items-center gap-2">
              <MapPin size={13} style={{ color: isDark ? theme.accent : theme.primary }} className="shrink-0" />
              <span>{pi.location}</span>
            </div>
          )}
          {pi.githubUrl && (
            <div className="flex items-center gap-2">
              <Github size={13} style={{ color: isDark ? theme.accent : theme.primary }} className="shrink-0" />
              <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                {pi.githubUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {pi.linkedinUrl && (
            <div className="flex items-center gap-2">
              <Linkedin size={13} style={{ color: isDark ? theme.accent : theme.primary }} className="shrink-0" />
              <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                LinkedIn Profile
              </a>
            </div>
          )}
          {pi.portfolioUrl && (
            <div className="flex items-center gap-2">
              <Globe size={13} style={{ color: isDark ? theme.accent : theme.primary }} className="shrink-0" />
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
              style={{ color: isDark ? theme.accent : theme.primary }}
              className="text-xs font-bold uppercase tracking-wider font-serif border-b pb-1"
            >
              {sec.title}
            </h2>

            {sec.sectionType === 'skills' && (
              <VisualMeterSkills skillsData={skillsData} theme={theme} isDark={isDark} />
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
            <div className="flex items-center justify-between pb-1.5 border-b-2" style={{ borderColor: theme.primary }}>
              <h2 style={{ color: theme.primary }} className="text-xs font-bold uppercase tracking-wider font-serif">
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
// 3. SILICON VALLEY TECH & ENGINEERING LAYOUT (Domain Cards & Project Tags)
// =========================================================================
function SiliconValleyTechLayout({ resume, theme, pi, sections, skillsData, meta, marginPadding }) {
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  const summarySec = sortedSections.find(s => s.sectionType === 'summary');
  const skillsSec = sortedSections.find(s => s.sectionType === 'skills');
  const otherSecs = sortedSections.filter(s => !['summary', 'skills'].includes(s.sectionType));

  return (
    <div className={`${marginPadding} flex flex-col space-y-5`}>
      {/* TECH HERO HEADER */}
      <div className="pb-4 border-b-2" style={{ borderColor: theme.primary }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 style={{ color: theme.primary }} className="text-2xl sm:text-3xl font-black tracking-tight">
              {pi.fullName || 'Emaan Humayun'}
            </h1>
            <p style={{ color: theme.accent || theme.secondary }} className="text-xs font-bold uppercase tracking-widest mt-1">
              {pi.professionalTitle || resume.targetRole || 'Full-Stack Software Engineer'}
            </p>
          </div>

          <div className="text-[11px] text-stone-600 flex flex-wrap sm:flex-col sm:items-end gap-1.5">
            {pi.email && (
              <span className="flex items-center gap-1 font-mono">
                <Mail size={12} style={{ color: theme.primary }} /> {pi.email}
              </span>
            )}
            {pi.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} style={{ color: theme.primary }} /> {pi.location}
              </span>
            )}
            <div className="flex items-center gap-3 pt-1">
              {pi.githubUrl && (
                <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-800 font-mono text-[10.5px]">
                  <Github size={12} style={{ color: theme.primary }} /> github
                </a>
              )}
              {pi.linkedinUrl && (
                <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-800 font-mono text-[10.5px]">
                  <Linkedin size={12} style={{ color: theme.primary }} /> linkedin
                </a>
              )}
              {pi.portfolioUrl && (
                <a href={pi.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-800 font-mono text-[10.5px]">
                  <Globe size={12} style={{ color: theme.primary }} /> portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      {summarySec && (
        <div className="space-y-1.5">
          <h2 style={{ color: theme.primary }} className="text-[11.5px] font-bold uppercase tracking-wider font-mono">
            // {summarySec.title}
          </h2>
          <p className="text-[11.5px] leading-relaxed text-stone-700">
            {summarySec.customContent || summarySec.entries?.[0]?.description || resume.professionalSummary}
          </p>
        </div>
      )}

      {/* TECHNICAL COMPETENCIES (Interactive Domain Cards) */}
      {skillsSec && (
        <div className="space-y-2">
          <h2 style={{ color: theme.primary }} className="text-[11.5px] font-bold uppercase tracking-wider font-mono">
            // {skillsSec.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(skillsData || []).map((cat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: theme.sidebarBg || '#f8fafc',
                  borderColor: theme.border || '#e2e8f0'
                }}
                className="p-2.5 rounded-xl border flex flex-col gap-1"
              >
                <span style={{ color: theme.primary }} className="font-bold text-[11px] font-mono flex items-center gap-1">
                  <Terminal size={11} /> {cat.name}
                </span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {cat.skills.map((sk, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        backgroundColor: theme.tagBg || '#f1f5f9',
                        color: theme.tagText || '#0f172a'
                      }}
                      className="px-2 py-0.5 rounded text-[10.5px] font-mono font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OTHER SECTIONS (Projects, Experience, Education) */}
      {otherSecs.map(sec => (
        <div key={sec.id || sec._id || sec.title} className="space-y-2.5">
          <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: theme.border || '#e2e8f0' }}>
            <h2 style={{ color: theme.primary }} className="text-[11.5px] font-bold uppercase tracking-wider font-mono">
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
// 4. MODERN TIMELINE LAYOUT (Vertical Progress Spine)
// =========================================================================
function ModernTimelineLayout({ resume, theme, pi, sections, skillsData, meta, marginPadding }) {
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className={`${marginPadding} flex flex-col space-y-6`}>
      {/* Header */}
      <div className="pb-4 border-b-2" style={{ borderColor: theme.primary }}>
        <h1 style={{ color: theme.primary }} className="text-3xl font-black font-serif tracking-tight">
          {pi.fullName || 'Emaan Humayun'}
        </h1>
        <p style={{ color: theme.accent || theme.secondary }} className="text-xs font-bold uppercase tracking-widest mt-1">
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
          <h2 style={{ color: theme.primary }} className="text-xs font-bold uppercase tracking-widest font-serif border-b pb-1">
            {sec.title}
          </h2>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] leading-relaxed text-stone-700">
              {sec.customContent || sec.entries?.[0]?.description || resume.professionalSummary}
            </p>
          )}

          {sec.sectionType === 'skills' && (
            <CanvaPillSkills skillsData={skillsData} fallbackEntries={sec.entries} theme={theme} />
          )}

          {['experience', 'projects', 'education'].includes(sec.sectionType) && (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-300">
              {(sec.entries || []).map((entry, idx) => (
                <div key={idx} className="relative break-inside-avoid">
                  {/* Timeline Node Dot */}
                  <div
                    style={{ backgroundColor: theme.primary }}
                    className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-bold text-[12px] text-stone-900">{entry.title}</span>
                    <span className="text-[10.5px] text-stone-500 font-mono">
                      {entry.startDate} {entry.endDate ? `— ${entry.endDate}` : ''}
                    </span>
                  </div>
                  {entry.subtitle && (
                    <div style={{ color: theme.accent || theme.secondary }} className="text-[11px] font-semibold">
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
// 5. SWISS GRID MINIMALIST LAYOUT (Architectural Left Accent Rule)
// =========================================================================
function SwissMinimalLayout({ resume, theme, pi, sections, skillsData, meta, marginPadding }) {
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div
      style={{ borderLeftColor: theme.primary }}
      className={`min-h-[297mm] border-l-8 ${marginPadding} flex flex-col space-y-6`}
    >
      <div className="pb-4 border-b border-stone-200">
        <h1 style={{ color: theme.primary }} className="text-3xl font-black font-serif tracking-tight">
          {pi.fullName || 'Emaan Humayun'}
        </h1>
        <p style={{ color: theme.secondary }} className="text-xs font-bold uppercase tracking-[0.15em] mt-1">
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
            <h2 style={{ color: theme.primary }} className="text-xs font-bold uppercase tracking-widest font-serif">
              {sec.title}
            </h2>
          </div>

          {sec.sectionType === 'summary' && (
            <p className="text-[11.5px] leading-relaxed text-stone-700">
              {sec.customContent || sec.entries?.[0]?.description || resume.professionalSummary}
            </p>
          )}
          {sec.sectionType === 'skills' && (
            <CanvaPillSkills skillsData={skillsData} fallbackEntries={sec.entries} theme={theme} />
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
// 6. CLASSIC ATS HARVARD / STANFORD LAYOUT (Centered Clean Single Column)
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
// REUSABLE SUBCOMPONENTS
// =========================================================================

// Visual Canva Pill Skills
function CanvaPillSkills({ skillsData, fallbackEntries, theme }) {
  if (skillsData && skillsData.length > 0) {
    return (
      <div className="space-y-2.5">
        {skillsData.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            <span style={{ color: theme.primary }} className="font-bold text-[10.5px] uppercase tracking-wider block">
              {cat.name}
            </span>
            <div className="flex flex-wrap gap-1">
              {cat.skills.map((sk, sIdx) => (
                <span
                  key={sIdx}
                  style={{
                    backgroundColor: theme.tagBg || '#f1f5f9',
                    color: theme.tagText || '#0f172a'
                  }}
                  className="px-2 py-0.5 rounded-md text-[10.5px] font-medium"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {(fallbackEntries || []).map((e, idx) => (
        <span
          key={idx}
          style={{ backgroundColor: theme.tagBg || '#f1f5f9', color: theme.tagText || '#0f172a' }}
          className="px-2 py-0.5 rounded-md text-[10.5px] font-medium"
        >
          {e.title}
        </span>
      ))}
    </div>
  );
}

// Visual Skill Meters for Adobe Sidebar
function VisualMeterSkills({ skillsData, theme, isDark }) {
  const topSkills = (skillsData || []).flatMap(c => c.skills).slice(0, 10);
  return (
    <div className="space-y-2">
      {topSkills.map((sk, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex justify-between text-[10.5px] font-semibold">
            <span style={{ color: isDark ? '#ffffff' : theme.text }}>{sk}</span>
          </div>
          {/* 5-Dot Visual Rating */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(dot => (
              <div
                key={dot}
                style={{
                  backgroundColor: dot <= 4
                    ? (isDark ? theme.accent : theme.primary)
                    : (isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0')
                }}
                className="h-1.5 flex-1 rounded-full"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Canva Project Highlight Cards
function CanvaProjectCards({ entries, theme }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-3">
      {entries.map((p, idx) => (
        <div
          key={idx}
          style={{
            borderColor: theme.border || '#e2e8f0',
            backgroundColor: theme.sidebarBg || '#ffffff'
          }}
          className="p-3 rounded-xl border shadow-xs break-inside-avoid"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[12px] text-stone-900 font-sans">{p.title}</span>
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: theme.primary }}
                  className="inline-flex items-center gap-0.5 text-[10px] font-mono hover:underline"
                >
                  <Github size={10} /> repo <ExternalLink size={9} />
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
                  style={{ backgroundColor: theme.tagBg || '#f1f5f9', color: theme.tagText || '#0f172a' }}
                  className="px-2 py-0.2 rounded text-[10px] font-mono font-medium"
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
            style={{ color: isDarkSidebar ? theme.accent : theme.primary }}
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
