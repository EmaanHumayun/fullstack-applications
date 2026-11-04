/**
 * 20 PREMIUM PROFESSIONAL RESUME TEMPLATES
 * Canva Pro & Adobe InDesign editorial layouts across 4 distinct categories.
 * Each template has its own unique visual identity, geometry, typography hierarchy,
 * and section arrangement.
 */

export const TEMPLATE_CATEGORIES = [
  'All',
  'Modern & Professional',
  'Creative & Designer',
  'Elegant & Premium',
  'Technical & Industry-Specific'
];

export const RESUME_TEMPLATES = [
  // =========================================================================
  // CATEGORY A: MODERN & PROFESSIONAL
  // =========================================================================
  {
    id: 'modern-executive',
    name: 'Modern Executive',
    number: '01',
    category: 'Modern & Professional',
    atsFriendly: true,
    layout: 'executive-grid',
    description: 'High-level executive layout featuring commanding title band, KPI metric indicators, executive summary callout, and dual-column experience with governance badges.',
    recommendedFor: 'Engineering Directors, Tech Leads, Principal Engineers, Executives'
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    number: '02',
    category: 'Modern & Professional',
    atsFriendly: true,
    layout: 'minimal-zen',
    description: 'Pristine white canvas with generous whitespace, asymmetric header, hairline dividers, delicate dot skill meters, and refined typographic hierarchy.',
    recommendedFor: 'Senior Engineers, System Architects, Minimalist Tech Professionals'
  },
  {
    id: 'professional-corporate',
    name: 'Professional Corporate',
    number: '03',
    category: 'Modern & Professional',
    atsFriendly: true,
    layout: 'corporate-cards',
    description: 'Structured corporate grid with navy and charcoal styling, tinted rectangular section headers, company badges, diamond bullets, and competency meters.',
    recommendedFor: 'Enterprise Software Engineers, Corporate IT, Fortune 500 Roles'
  },
  {
    id: 'contemporary-split',
    name: 'Contemporary Split Layout',
    number: '04',
    category: 'Modern & Professional',
    atsFriendly: false,
    layout: 'architectural-split',
    description: 'Architectural two-column layout with full-height colored left sidebar housing circular SVG skill dials and education, paired with high-impact right main body.',
    recommendedFor: 'Mid & Senior Developers, Modern Tech Startups, Product Engineers'
  },
  {
    id: 'elegant-professional',
    name: 'Elegant Professional',
    number: '05',
    category: 'Modern & Professional',
    atsFriendly: true,
    layout: 'editorial-chic',
    description: 'Refined editorial styling with centered title hierarchy, subtle accent color bands, philosophy callout card, and horizontal gradient skills telemetry.',
    recommendedFor: 'Full-Stack Developers, Engineering Managers, Consultants'
  },

  // =========================================================================
  // CATEGORY B: CREATIVE & DESIGNER
  // =========================================================================
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    number: '06',
    category: 'Creative & Designer',
    atsFriendly: true,
    layout: 'portfolio-showcase',
    description: 'Visual project showcase layout placing production case studies and clickable repository links first, accompanied by interactive skill badges and metrics.',
    recommendedFor: 'Open-Source Builders, Design Engineers, Frontend Architects'
  },
  {
    id: 'graphic-designer',
    name: 'Graphic Designer',
    number: '07',
    category: 'Creative & Designer',
    atsFriendly: false,
    layout: 'creative-blocks',
    description: 'High-contrast creative composition with geometric header blocks, circular tool proficiency dials, multi-column project showcase, and vibrant tags.',
    recommendedFor: 'Creative Technologists, UI/UX Engineers, Design Systems Leads'
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    number: '08',
    category: 'Creative & Designer',
    atsFriendly: false,
    layout: 'editorial-magazine',
    description: 'Magazine-inspired editorial presentation with oversized Roman numeral section headings (I, II, III), large serif initials, pull-quote summary, and italic dates.',
    recommendedFor: 'Product Designers, Creative Directors, Thought Leaders'
  },
  {
    id: 'bold-creative',
    name: 'Bold Creative',
    number: '09',
    category: 'Creative & Designer',
    atsFriendly: false,
    layout: 'bold-brutalist',
    description: 'Ultra-modern neo-brutalist aesthetic with high-contrast dark header ribbon, solid signature neon accents, bold section headers, and heavy pill tags.',
    recommendedFor: 'Startup Founders, Creative Coders, Modern Web Innovators'
  },
  {
    id: 'artistic-minimal',
    name: 'Artistic Minimal',
    number: '10',
    category: 'Creative & Designer',
    atsFriendly: true,
    layout: 'artistic-minimal',
    description: 'Japanese Zen-inspired aesthetic with soft warm background, organic rounded cards, delicate 5-dot rating tracks, and serene spacious flow.',
    recommendedFor: 'Designers, Product Strategists, Refined Engineering Crafters'
  },

  // =========================================================================
  // CATEGORY C: ELEGANT & PREMIUM
  // =========================================================================
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    number: '11',
    category: 'Elegant & Premium',
    atsFriendly: true,
    layout: 'luxury-gold',
    description: 'Opulent ivory and metallic gold presentation featuring an executive monogram crest, double gold hairline border, Roman serif headers, and star rating meters.',
    recommendedFor: 'C-Suite Executives, Partners, Senior Advisors, Luxury Tech'
  },
  {
    id: 'burgundy-elegance',
    name: 'Burgundy Elegance',
    number: '12',
    category: 'Elegant & Premium',
    atsFriendly: true,
    layout: 'burgundy-elegance',
    description: 'Deep Bordeaux burgundy paired with warm champagne neutral. Rich banner, gold serif typography, rose-tinted achievement badges, and vertical timeline.',
    recommendedFor: 'High-Profile Consultants, Corporate Executives, Senior Architects'
  },
  {
    id: 'swiss-design',
    name: 'Swiss Design',
    number: '13',
    category: 'Elegant & Premium',
    atsFriendly: true,
    layout: 'swiss-grid',
    description: 'Strict International Typographic Style based on mathematical grid. Asymmetric numbered headers (01/SUMMARY, 02/SKILLS), precise tabular dates, zero fluff.',
    recommendedFor: 'Systems Engineers, Quantitative Analysts, European & Global Roles'
  },
  {
    id: 'classic-serif',
    name: 'Classic Serif',
    number: '14',
    category: 'Elegant & Premium',
    atsFriendly: true,
    layout: 'classic-serif',
    description: 'Ivy League / Harvard prestige styling. Timeless serif typography, centered classical header, double horizontal dividers, and justified prose formatting.',
    recommendedFor: 'Academics, Research Scientists, Corporate Legal & Finance Technologists'
  },
  {
    id: 'scandinavian-minimal',
    name: 'Scandinavian Minimal',
    number: '15',
    category: 'Elegant & Premium',
    atsFriendly: true,
    layout: 'scandi-minimal',
    description: 'Nordic functional minimalism with warm linen canvas, muted slate and sage accents, soft rounded card containers, and clean horizontal progress lines.',
    recommendedFor: 'Product Engineers, Sustainability Tech, Scandinavian & Remote Roles'
  },

  // =========================================================================
  // CATEGORY D: TECHNICAL & INDUSTRY-SPECIFIC
  // =========================================================================
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    number: '16',
    category: 'Technical & Industry-Specific',
    atsFriendly: true,
    layout: 'dev-terminal',
    description: 'Silicon Valley developer terminal layout with macOS traffic lights, active git branch indicator, monospace code docstrings, and verified GitHub project links.',
    recommendedFor: 'Full-Stack Software Engineers, Systems Programmers, Backend Developers'
  },
  {
    id: 'data-ai-pro',
    name: 'Data & AI Professional',
    number: '17',
    category: 'Technical & Industry-Specific',
    atsFriendly: true,
    layout: 'ai-telemetry',
    description: 'AI & Data Science lab presentation with neural framework tags (LangGraph, PyTorch, RAG), circular SVG model accuracy rings, and dataset project metrics.',
    recommendedFor: 'AI Engineers, Machine Learning Scientists, Data Architects'
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    number: '18',
    category: 'Technical & Industry-Specific',
    atsFriendly: true,
    layout: 'devops-sre',
    description: 'CNCF Cloud Native platform dashboard featuring 99.99% uptime SLA banner, Kubernetes/Terraform infrastructure badges, and automated GitOps pipeline cards.',
    recommendedFor: 'DevOps Engineers, Site Reliability Engineers (SRE), Cloud Architects'
  },
  {
    id: 'academic-research',
    name: 'Academic & Research',
    number: '19',
    category: 'Technical & Industry-Specific',
    atsFriendly: true,
    layout: 'academic-cv',
    description: 'Scholarly curriculum vitae hierarchy prioritizing university degrees, thesis research, peer-reviewed publications, academic projects, and certifications.',
    recommendedFor: 'PhD Candidates, CS Researchers, University Lecturers, Graduate Students'
  },
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    number: '20',
    category: 'Technical & Industry-Specific',
    atsFriendly: true,
    layout: 'ats-single-col',
    description: '100% ATS parser compliant single-column document with standard headings, zero graphical interference, perfect text extraction, and maximum readability.',
    recommendedFor: 'Corporate Job Portals (Workday, Greenhouse, Taleo), High-Volume Applications'
  }
];

/**
 * Backward compatibility alias map ensuring previously saved resumes
 * resolve seamlessly to one of the 20 canonical Canva Pro templates.
 */
export const TEMPLATE_ALIASES = {
  'executive-pro': 'modern-executive',
  'minimal-elegant': 'modern-minimalist',
  'modern-two-col': 'contemporary-split',
  'elegant-sidebar': 'contemporary-split',
  'modern-pro': 'elegant-professional',
  'portfolio-oriented': 'creative-portfolio',
  'contemporary-creative': 'bold-creative',
  'international-premium': 'swiss-design',
  'ai-ml-engineer': 'data-ai-pro',
  'classic-pro': 'ats-classic',
  'compact-ats': 'ats-classic',
  'fullstack-dev': 'software-engineer',
  'backend-engineer': 'software-engineer',
  'automation-engineer': 'devops-engineer',
  'cybersecurity-networking': 'devops-engineer',
  'timeline-resume': 'editorial-magazine',
  'entry-graduate': 'academic-research'
};

/**
 * Normalizes any template identifier to one of the 20 canonical IDs.
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
