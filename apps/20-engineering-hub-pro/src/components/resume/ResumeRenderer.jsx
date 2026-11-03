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
  GraduationCap
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
  const theme = resume.theme || getPalette('burgundy-gold');
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
    compact: { fontSize: '11.5px', lineHeight: '1.4' },
    normal: { fontSize: '12.5px', lineHeight: '1.5' },
    spacious: { fontSize: '13.5px', lineHeight: '1.6' }
  }[typography.fontSize] || { fontSize: '12.5px', lineHeight: '1.5' };

  // Page margin mappings
  const marginPadding = {
    compact: 'p-6 sm:p-8',
    normal: 'p-8 sm:p-10',
    spacious: 'p-10 sm:p-12'
  }[resume.pageSettings?.margins] || 'p-8 sm:p-10';

  // Layout dispatcher
  const isTwoColLeft = ['two-col-left', 'sidebar-dark'].includes(meta.layout);
  const isTimeline = meta.layout === 'timeline-vertical';
  const isExecutive = meta.layout === 'executive';
  const isCompact = meta.layout === 'compact-dense';
  const isCreative = meta.layout === 'creative-editorial';
  const isTechTop = ['tech-skills-top', 'backend-arch', 'devops-infra', 'ai-research'].includes(meta.layout);

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
          color: theme.text || '#1f2937',
          ...fontSizeStyle
        }}
        className={`resume-paper shadow-xl border border-stone-200 relative text-left box-border ${fontClass} print:shadow-none print:border-none print:m-0`}
      >
        {isTwoColLeft ? (
          <TwoColumnLayout
            resume={resume}
            theme={theme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
          />
        ) : (
          <SingleColumnLayout
            resume={resume}
            theme={theme}
            pi={pi}
            sections={sections}
            skillsData={skillsData}
            meta={meta}
            marginPadding={marginPadding}
            isTimeline={isTimeline}
            isExecutive={isExecutive}
            isCompact={isCompact}
            isCreative={isCreative}
            isTechTop={isTechTop}
          />
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. SINGLE COLUMN & ADAPTIVE LAYOUTS
// -------------------------------------------------------------
function SingleColumnLayout({
  resume,
  theme,
  pi,
  sections,
  skillsData,
  meta,
  marginPadding,
  isTimeline,
  isExecutive,
  isCompact,
  isCreative,
  isTechTop
}) {
  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Determine section arrangement priority
  let displaySections = sortedSections;
  if (isTechTop) {
    // Bring skills and projects higher
    const skillsSec = sortedSections.find(s => s.sectionType === 'skills');
    const projectsSec = sortedSections.find(s => s.sectionType === 'projects');
    const summarySec = sortedSections.find(s => s.sectionType === 'summary');
    const others = sortedSections.filter(s => !['skills', 'projects', 'summary'].includes(s.sectionType));

    displaySections = [
      ...(summarySec ? [summarySec] : []),
      ...(skillsSec ? [skillsSec] : []),
      ...(projectsSec ? [projectsSec] : []),
      ...others
    ];
  } else if (meta.layout === 'portfolio-first') {
    const projectsSec = sortedSections.find(s => s.sectionType === 'projects');
    const skillsSec = sortedSections.find(s => s.sectionType === 'skills');
    const summarySec = sortedSections.find(s => s.sectionType === 'summary');
    const others = sortedSections.filter(s => !['projects', 'skills', 'summary'].includes(s.sectionType));

    displaySections = [
      ...(summarySec ? [summarySec] : []),
      ...(projectsSec ? [projectsSec] : []),
      ...(skillsSec ? [skillsSec] : []),
      ...others
    ];
  } else if (meta.layout === 'academic-formal' || meta.layout === 'entry-coursework') {
    const eduSec = sortedSections.find(s => s.sectionType === 'education');
    const summarySec = sortedSections.find(s => s.sectionType === 'summary');
    const others = sortedSections.filter(s => !['education', 'summary'].includes(s.sectionType));

    displaySections = [
      ...(summarySec ? [summarySec] : []),
      ...(eduSec ? [eduSec] : []),
      ...others
    ];
  }

  return (
    <div className={`${marginPadding} flex flex-col space-y-5`}>
      {/* HEADER SECTION */}
      <HeaderSection
        pi={pi}
        theme={theme}
        meta={meta}
        isExecutive={isExecutive}
        isCompact={isCompact}
        isCreative={isCreative}
      />

      {/* DYNAMIC SECTIONS */}
      {displaySections.map(sec => (
        <SectionRenderer
          key={sec.id || sec._id || sec.title}
          section={sec}
          theme={theme}
          meta={meta}
          skillsData={skillsData}
          isTimeline={isTimeline}
          isCompact={isCompact}
        />
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// 2. TWO COLUMN / SIDEBAR LAYOUTS (Templates 13 & 14)
// -------------------------------------------------------------
function TwoColumnLayout({ resume, theme, pi, sections, skillsData, meta }) {
  const isDarkSidebar = meta.layout === 'sidebar-dark';
  const sidebarSections = sections.filter(s => ['skills', 'education', 'certifications'].includes(s.sectionType));
  const mainSections = sections.filter(s => !['skills', 'education', 'certifications'].includes(s.sectionType));

  return (
    <div className="flex flex-row min-h-[297mm]">
      {/* LEFT SIDEBAR (34%) */}
      <div
        style={{
          width: '34%',
          backgroundColor: isDarkSidebar ? theme.primary : (theme.sidebarBg || '#f8fafc'),
          color: isDarkSidebar ? '#ffffff' : (theme.text || '#1f2937'),
          borderColor: theme.border || '#e5e7eb'
        }}
        className="p-6 border-r flex flex-col space-y-5"
      >
        {/* Name in Sidebar */}
        <div className="pb-3 border-b border-white/20">
          <h1 className="text-xl font-bold tracking-tight">{pi.fullName || 'Emaan Humayun'}</h1>
          <p
            style={{ color: isDarkSidebar ? theme.accent : theme.primary }}
            className="text-xs font-semibold mt-1 tracking-wide uppercase"
          >
            {pi.professionalTitle || resume.targetRole}
          </p>
        </div>

        {/* Contact Details */}
        <div className="space-y-2 text-[11px]">
          {pi.email && (
            <div className="flex items-center gap-2">
              <Mail size={13} style={{ color: isDarkSidebar ? theme.accent : theme.primary }} />
              <span className="truncate">{pi.email}</span>
            </div>
          )}
          {pi.phone && (
            <div className="flex items-center gap-2">
              <Phone size={13} style={{ color: isDarkSidebar ? theme.accent : theme.primary }} />
              <span>{pi.phone}</span>
            </div>
          )}
          {pi.location && (
            <div className="flex items-center gap-2">
              <MapPin size={13} style={{ color: isDarkSidebar ? theme.accent : theme.primary }} />
              <span>{pi.location}</span>
            </div>
          )}
          {pi.githubUrl && (
            <div className="flex items-center gap-2">
              <Github size={13} style={{ color: isDarkSidebar ? theme.accent : theme.primary }} />
              <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                {pi.githubUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {pi.linkedinUrl && (
            <div className="flex items-center gap-2">
              <Linkedin size={13} style={{ color: isDarkSidebar ? theme.accent : theme.primary }} />
              <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                LinkedIn Profile
              </a>
            </div>
          )}
          {pi.portfolioUrl && (
            <div className="flex items-center gap-2">
              <Globe size={13} style={{ color: isDarkSidebar ? theme.accent : theme.primary }} />
              <a href={pi.portfolioUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                {pi.portfolioUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Sidebar Sections (Skills, Education, Certifications) */}
        {sidebarSections.map(sec => (
          <SectionRenderer
            key={sec.id}
            section={sec}
            theme={theme}
            meta={meta}
            skillsData={skillsData}
            inSidebar={true}
            isDarkSidebar={isDarkSidebar}
          />
        ))}
      </div>

      {/* RIGHT MAIN COLUMN (66%) */}
      <div className="p-8 flex-1 flex flex-col space-y-5">
        {mainSections.map(sec => (
          <SectionRenderer
            key={sec.id}
            section={sec}
            theme={theme}
            meta={meta}
            skillsData={skillsData}
          />
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. HEADER COMPONENT
// -------------------------------------------------------------
function HeaderSection({ pi, theme, meta, isExecutive, isCompact, isCreative }) {
  if (isExecutive) {
    return (
      <div
        style={{
          borderLeftColor: theme.primary,
          backgroundColor: theme.sidebarBg || '#f9fafb'
        }}
        className="p-5 border-l-4 rounded-r-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 style={{ color: theme.primary }} className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              {pi.fullName || 'Emaan Humayun'}
            </h1>
            <p style={{ color: theme.secondary }} className="text-xs font-bold uppercase tracking-widest mt-1">
              {pi.professionalTitle || 'Software Engineer | Systems Architect'}
            </p>
          </div>
          <div className="text-[11px] space-y-1 text-right text-stone-600">
            {pi.email && <div>{pi.email}</div>}
            {pi.phone && <div>{pi.phone}</div>}
            {pi.location && <div>{pi.location}</div>}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-stone-200 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
          {pi.githubUrl && (
            <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-700">
              <Github size={12} style={{ color: theme.primary }} /> {pi.githubUrl.replace('https://', '')}
            </a>
          )}
          {pi.linkedinUrl && (
            <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-700">
              <Linkedin size={12} style={{ color: theme.primary }} /> LinkedIn
            </a>
          )}
          {pi.portfolioUrl && (
            <a href={pi.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-700">
              <Globe size={12} style={{ color: theme.primary }} /> {pi.portfolioUrl.replace('https://', '')}
            </a>
          )}
        </div>
      </div>
    );
  }

  if (isCreative) {
    return (
      <div className="pb-4 border-b-2" style={{ borderColor: theme.primary }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 style={{ color: theme.primary }} className="text-3xl font-black tracking-tight font-serif">
              {pi.fullName || 'Emaan Humayun'}
            </h1>
            <p style={{ color: theme.accent }} className="text-xs font-bold uppercase tracking-widest mt-1">
              {pi.professionalTitle || 'Software Engineer'}
            </p>
          </div>
          <div className="text-right text-[11px] text-stone-600 space-y-0.5">
            {pi.email && <div>{pi.email}</div>}
            {pi.location && <div>{pi.location}</div>}
            {pi.portfolioUrl && <div>{pi.portfolioUrl.replace('https://', '')}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Standard Modern & Classic ATS Header
  return (
    <div className={`pb-3 ${isCompact ? 'border-b' : 'border-b-2'}`} style={{ borderColor: theme.border || '#e5e7eb' }}>
      <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1
            style={{ color: theme.primary }}
            className={`font-extrabold tracking-tight ${isCompact ? 'text-2xl' : 'text-2xl sm:text-3xl'}`}
          >
            {pi.fullName || 'Emaan Humayun'}
          </h1>
          <p
            style={{ color: theme.muted || '#4b5563' }}
            className="text-xs font-semibold uppercase tracking-wider mt-0.5"
          >
            {pi.professionalTitle || 'Software Engineer | DevOps & Cloud'}
          </p>
        </div>

        <div className="text-[11px] text-stone-600 flex flex-wrap sm:flex-col sm:items-end gap-x-3 gap-y-0.5">
          {pi.email && (
            <div className="flex items-center gap-1">
              <Mail size={12} style={{ color: theme.primary }} /> {pi.email}
            </div>
          )}
          {pi.phone && (
            <div className="flex items-center gap-1">
              <Phone size={12} style={{ color: theme.primary }} /> {pi.phone}
            </div>
          )}
          {pi.location && (
            <div className="flex items-center gap-1">
              <MapPin size={12} style={{ color: theme.primary }} /> {pi.location}
            </div>
          )}
        </div>
      </div>

      {/* Social / External Links Bar */}
      <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-[11px]">
        {pi.githubUrl && (
          <a href={pi.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-700">
            <Github size={12} style={{ color: theme.primary }} /> {pi.githubUrl.replace(/^https?:\/\//, '')}
          </a>
        )}
        {pi.linkedinUrl && (
          <a href={pi.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-700">
            <Linkedin size={12} style={{ color: theme.primary }} /> LinkedIn
          </a>
        )}
        {pi.portfolioUrl && (
          <a href={pi.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-stone-700">
            <Globe size={12} style={{ color: theme.primary }} /> {pi.portfolioUrl.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. SECTION RENDERER DISPATCHER
// -------------------------------------------------------------
function SectionRenderer({
  section,
  theme,
  meta,
  skillsData,
  inSidebar = false,
  isDarkSidebar = false,
  isTimeline = false,
  isCompact = false
}) {
  if (!section || section.visible === false) return null;

  const titleColor = isDarkSidebar ? theme.accent : theme.primary;
  const borderColor = isDarkSidebar ? 'rgba(255,255,255,0.2)' : (theme.border || '#e5e7eb');

  return (
    <div className={`resume-section ${isCompact ? 'space-y-1.5' : 'space-y-2.5'}`}>
      {/* Section Heading */}
      <div
        className={`flex items-center justify-between pb-1 ${
          meta.layout === 'minimal' ? '' : 'border-b'
        }`}
        style={{ borderColor }}
      >
        <h2
          style={{ color: titleColor }}
          className="text-xs font-bold uppercase tracking-wider font-sans flex items-center gap-1.5"
        >
          {section.title}
        </h2>
      </div>

      {/* Section Content */}
      {section.sectionType === 'summary' && (
        <SummarySectionContent
          section={section}
          theme={theme}
          isDarkSidebar={isDarkSidebar}
        />
      )}

      {section.sectionType === 'skills' && (
        <SkillsSectionContent
          section={section}
          skillsData={skillsData}
          theme={theme}
          isDarkSidebar={isDarkSidebar}
          isCompact={isCompact}
        />
      )}

      {section.sectionType === 'projects' && (
        <ProjectsSectionContent
          entries={section.entries || []}
          theme={theme}
          isCompact={isCompact}
        />
      )}

      {section.sectionType === 'experience' && (
        <ExperienceSectionContent
          entries={section.entries || []}
          theme={theme}
          isTimeline={isTimeline}
          isCompact={isCompact}
        />
      )}

      {section.sectionType === 'education' && (
        <EducationSectionContent
          entries={section.entries || []}
          theme={theme}
          isDarkSidebar={isDarkSidebar}
        />
      )}

      {section.sectionType === 'certifications' && (
        <CertificationsSectionContent
          entries={section.entries || []}
          theme={theme}
          isDarkSidebar={isDarkSidebar}
        />
      )}

      {section.sectionType === 'custom' && (
        <div className="text-[11.5px] leading-relaxed text-stone-700 whitespace-pre-line">
          {section.customContent}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 5. SUMMARY SECTION
// -------------------------------------------------------------
function SummarySectionContent({ section, theme, isDarkSidebar }) {
  const content = section.customContent || (section.entries && section.entries[0]?.description) || '';
  if (!content) return null;
  return (
    <p
      style={{ color: isDarkSidebar ? '#e5e7eb' : theme.text }}
      className="text-[11.5px] sm:text-[12px] leading-relaxed"
    >
      {content}
    </p>
  );
}

// -------------------------------------------------------------
// 6. SKILLS SECTION
// -------------------------------------------------------------
function SkillsSectionContent({ section, skillsData, theme, isDarkSidebar, isCompact }) {
  // If structured categories exist in skillsData
  if (skillsData && skillsData.length > 0) {
    return (
      <div className={`space-y-1.5 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>
        {skillsData.map((cat, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span
              style={{ color: isDarkSidebar ? theme.accent : theme.primary }}
              className="font-bold text-[11px] shrink-0"
            >
              {cat.name}:
            </span>
            <span
              style={{ color: isDarkSidebar ? '#e5e7eb' : theme.text }}
              className="leading-snug"
            >
              {cat.skills.join(', ')}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Fallback: entries list
  return (
    <div className="flex flex-wrap gap-1.5">
      {(section.entries || []).map((entry, idx) => (
        <span
          key={idx}
          style={{
            borderColor: isDarkSidebar ? 'rgba(255,255,255,0.2)' : theme.border,
            backgroundColor: isDarkSidebar ? 'rgba(255,255,255,0.1)' : (theme.sidebarBg || '#f9fafb'),
            color: isDarkSidebar ? '#ffffff' : theme.text
          }}
          className="px-2 py-0.5 rounded text-[10.5px] font-mono border"
        >
          {entry.title}
        </span>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// 7. PROJECTS SECTION
// -------------------------------------------------------------
function ProjectsSectionContent({ entries, theme, isCompact }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className={`space-y-3 ${isCompact ? 'space-y-2' : 'space-y-3'}`}>
      {entries.map((p, idx) => (
        <div key={idx} className="break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[12px] text-stone-900">{p.title}</span>
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: theme.primary }}
                  className="inline-flex items-center gap-0.5 text-[10.5px] font-mono hover:underline"
                >
                  <Github size={10} /> repo <ExternalLink size={9} />
                </a>
              )}
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: theme.primary }}
                  className="inline-flex items-center gap-0.5 text-[10.5px] font-mono hover:underline"
                >
                  demo <ExternalLink size={9} />
                </a>
              )}
            </div>
            {p.startDate && (
              <span className="text-[10.5px] text-stone-500 font-mono shrink-0">
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
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="text-[10px] text-stone-500 font-mono">Tech:</span>
              <span className="text-[10px] font-mono text-stone-600">
                {p.technologies.join(' · ')}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// 8. EXPERIENCE SECTION
// -------------------------------------------------------------
function ExperienceSectionContent({ entries, theme, isTimeline, isCompact }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className={`space-y-3 ${isCompact ? 'space-y-2' : 'space-y-3'}`}>
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
              {job.location ? ` | ${job.location}` : ''}
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

// -------------------------------------------------------------
// 9. EDUCATION SECTION
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 10. CERTIFICATIONS SECTION
// -------------------------------------------------------------
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
