/**
 * 10 BEST PREMIUM PROFESSIONAL RESUME TEMPLATES
 * Curated Canva Pro & Adobe InDesign editorial layouts across 5 focused categories.
 * Each template has its own unique visual identity, layout structure, typography,
 * domain icons, and skill telemetry charts - strictly optimized for single-page visual impact.
 */

export const TEMPLATE_CATEGORIES = [
  'All',
  'Executive & Modern',
  'Technical & Engineering',
  'Creative & Portfolio',
  'Editorial & Luxury',
  'Universal & ATS'
];

export const RESUME_TEMPLATES = [
  // =========================================================================
  // CATEGORY 1: EXECUTIVE & MODERN
  // =========================================================================
  {
    id: 'modern-executive',
    name: 'Modern Executive',
    number: '01',
    category: 'Executive & Modern',
    atsFriendly: true,
    layout: 'executive-grid',
    description: 'Commanding corporate layout with dark navy title band, KPI metric indicators, executive summary callout, and dual-column experience with 5-pill segmented battery charts.',
    recommendedFor: 'Engineering Directors, Tech Leads, Principal Engineers, Executives'
  },
  {
    id: 'contemporary-split',
    name: 'Contemporary Split',
    number: '02',
    category: 'Executive & Modern',
    atsFriendly: true,
    layout: 'architectural-split',
    description: 'Canva Pro architectural two-column layout with 35% colored left sidebar housing circular SVG telemetry dials and contact details, paired with high-impact 65% right main body.',
    recommendedFor: 'Mid & Senior Developers, Modern Tech Startups, Product Engineers'
  },

  // =========================================================================
  // CATEGORY 2: TECHNICAL & ENGINEERING
  // =========================================================================
  {
    id: 'software-engineer',
    name: 'Software Engineer Pro',
    number: '03',
    category: 'Technical & Engineering',
    atsFriendly: true,
    layout: 'dev-terminal',
    description: 'Silicon Valley developer layout with macOS traffic lights, active git branch indicator, monospace code docstrings, live GitHub repository links, and clean battery skill meters.',
    recommendedFor: 'Full-Stack Software Engineers, Systems Programmers, Backend Developers'
  },
  {
    id: 'data-ai-pro',
    name: 'Data & AI Specialist',
    number: '04',
    category: 'Technical & Engineering',
    atsFriendly: true,
    layout: 'ai-telemetry',
    description: 'AI & Data Science lab presentation with neural framework tags (LangGraph, PyTorch, RAG), circular SVG model accuracy gauges, and dataset project metrics.',
    recommendedFor: 'AI Engineers, Machine Learning Scientists, Data Architects'
  },
  {
    id: 'devops-engineer',
    name: 'DevOps & Cloud Architect',
    number: '05',
    category: 'Technical & Engineering',
    atsFriendly: true,
    layout: 'devops-sre',
    description: 'CNCF Cloud Native platform dashboard featuring 99.99% uptime SLA banner, Kubernetes/Terraform infrastructure badges, and automated GitOps CI/CD delivery cards.',
    recommendedFor: 'DevOps Engineers, Site Reliability Engineers (SRE), Cloud Architects'
  },

  // =========================================================================
  // CATEGORY 3: CREATIVE & PORTFOLIO
  // =========================================================================
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    number: '06',
    category: 'Creative & Portfolio',
    atsFriendly: true,
    layout: 'portfolio-showcase',
    description: 'Visual project showcase layout placing production case studies and live repository links first, accompanied by 5-dot visual rating scales and high-impact metric cards.',
    recommendedFor: 'Open-Source Builders, Design Engineers, Frontend Architects'
  },

  // =========================================================================
  // CATEGORY 4: EDITORIAL & LUXURY
  // =========================================================================
  {
    id: 'luxury-gold',
    name: 'Luxury Gold & Champagne',
    number: '07',
    category: 'Editorial & Luxury',
    atsFriendly: true,
    layout: 'luxury-gold',
    description: 'Opulent ivory and metallic gold presentation featuring an executive monogram crest, double gold hairline border, Roman serif headers, and 5-star precision ratings.',
    recommendedFor: 'C-Suite Executives, Partners, Senior Advisors, Luxury Tech'
  },
  {
    id: 'burgundy-elegance',
    name: 'Burgundy Elegance',
    number: '08',
    category: 'Editorial & Luxury',
    atsFriendly: true,
    layout: 'burgundy-elegance',
    description: 'Deep Bordeaux burgundy paired with warm champagne neutral. Rich header, gold serif typography, rose-tinted achievement badges, and a vertical career timeline.',
    recommendedFor: 'High-Profile Consultants, Corporate Executives, Senior Architects'
  },
  {
    id: 'swiss-design',
    name: 'Swiss Design Grid',
    number: '09',
    category: 'Editorial & Luxury',
    atsFriendly: true,
    layout: 'swiss-grid',
    description: 'Strict International Typographic Style based on a mathematical grid. Asymmetric numbered headers (01/SUMMARY, 02/SKILLS), precise tabular alignment, and zero clutter.',
    recommendedFor: 'Systems Engineers, Quantitative Analysts, European & Global Roles'
  },

  // =========================================================================
  // CATEGORY 5: UNIVERSAL & ATS
  // =========================================================================
  {
    id: 'ats-classic',
    name: 'ATS Universal Classic',
    number: '10',
    category: 'Universal & ATS',
    atsFriendly: true,
    layout: 'ats-single-col',
    description: '100% ATS parser compliant single-column document with standard headings, zero graphical interference, perfect text extraction, and maximum readability.',
    recommendedFor: 'Corporate Job Portals (Workday, Greenhouse, Taleo), High-Volume Applications'
  }
];

/**
 * Backward compatibility alias map ensuring all previously saved resumes
 * resolve seamlessly to one of the 10 canonical Canva Pro templates.
 */
export const TEMPLATE_ALIASES = {
  // Aliases from the 20-template set to the 10 best templates
  'modern-minimalist': 'ats-classic',
  'professional-corporate': 'modern-executive',
  'elegant-professional': 'modern-executive',
  'graphic-designer': 'creative-portfolio',
  'editorial-magazine': 'burgundy-elegance',
  'bold-creative': 'creative-portfolio',
  'artistic-minimal': 'swiss-design',
  'classic-serif': 'luxury-gold',
  'scandinavian-minimal': 'swiss-design',
  'academic-research': 'ats-classic',

  // Legacy database aliases
  'executive-pro': 'modern-executive',
  'minimal-elegant': 'ats-classic',
  'modern-two-col': 'contemporary-split',
  'elegant-sidebar': 'contemporary-split',
  'modern-pro': 'modern-executive',
  'portfolio-oriented': 'creative-portfolio',
  'contemporary-creative': 'creative-portfolio',
  'international-premium': 'swiss-design',
  'ai-ml-engineer': 'data-ai-pro',
  'classic-pro': 'ats-classic',
  'compact-ats': 'ats-classic',
  'fullstack-dev': 'software-engineer',
  'backend-engineer': 'software-engineer',
  'automation-engineer': 'devops-engineer',
  'cybersecurity-networking': 'devops-engineer',
  'timeline-resume': 'burgundy-elegance',
  'entry-graduate': 'ats-classic'
};

/**
 * Normalizes any template identifier to one of the 10 canonical IDs.
 */
export function normalizeTemplateId(id) {
  if (!id) return 'modern-executive';
  if (TEMPLATE_ALIASES[id]) return TEMPLATE_ALIASES[id];
  return RESUME_TEMPLATES.some(t => t.id === id) ? id : 'modern-executive';
}

/**
 * Retrieves the full metadata record for a template id.
 */
export function getTemplateMeta(id) {
  const canonicalId = normalizeTemplateId(id);
  return RESUME_TEMPLATES.find(t => t.id === canonicalId) || RESUME_TEMPLATES[0];
}
