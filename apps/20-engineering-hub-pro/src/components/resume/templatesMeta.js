export const TEMPLATE_CATEGORIES = [
  'All',
  'ATS-Friendly Professional',
  'Technology & Engineering',
  'Modern Creative',
  'Specialized'
];

export const RESUME_TEMPLATES = [
  // CATEGORY A — ATS-FRIENDLY PROFESSIONAL
  {
    id: 'classic-pro',
    name: 'Classic Professional',
    number: '01',
    category: 'ATS-Friendly Professional',
    atsFriendly: true,
    layout: 'single-col',
    description: 'Traditional single-column layout with clean horizontal divider rules, standard section headings, and zero decorative noise. 100% ATS parser compliant.',
    recommendedFor: 'Corporate, Enterprise Software, Traditional Engineering Roles'
  },
  {
    id: 'modern-pro',
    name: 'Modern Professional',
    number: '02',
    category: 'ATS-Friendly Professional',
    atsFriendly: true,
    layout: 'single-col-accent',
    description: 'Modern typography with centered contact header, subtle accent color bands, and crisp hierarchical spacing.',
    recommendedFor: 'Mid & Senior Software Engineers, Tech Leads, Engineering Managers'
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegant',
    number: '03',
    category: 'ATS-Friendly Professional',
    atsFriendly: true,
    layout: 'minimal',
    description: 'Generous whitespace with borderless sections, refined understated typography, and clean airy bullet points.',
    recommendedFor: 'Staff Engineers, System Architects, Consultants'
  },
  {
    id: 'executive-pro',
    name: 'Executive Professional',
    number: '04',
    category: 'ATS-Friendly Professional',
    atsFriendly: true,
    layout: 'executive',
    description: 'Commanding header with bold title band, structured executive summary box, and achievement-focused metrics layout.',
    recommendedFor: 'Engineering Directors, Principal Engineers, Executives'
  },
  {
    id: 'compact-ats',
    name: 'Compact ATS',
    number: '05',
    category: 'ATS-Friendly Professional',
    atsFriendly: true,
    layout: 'compact-dense',
    description: 'High-density space-efficient layout designed to maximize content per A4 page with inline skills and tight line spacing.',
    recommendedFor: 'Experienced Engineers with high volume of projects and certifications'
  },

  // CATEGORY B — TECHNOLOGY & ENGINEERING
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    number: '06',
    category: 'Technology & Engineering',
    atsFriendly: true,
    layout: 'tech-skills-top',
    description: 'Categorized technical skills prominently positioned directly under the summary. Distinct separation between production projects and employment.',
    recommendedFor: 'Full-Stack & Generalist Software Engineers'
  },
  {
    id: 'backend-engineer',
    name: 'Backend Engineer',
    number: '07',
    category: 'Technology & Engineering',
    atsFriendly: true,
    layout: 'backend-arch',
    description: 'Architecture and systems focus with emphasized sections for APIs, databases, caching layers, and distributed message queues.',
    recommendedFor: 'Backend Architects, API Developers, Distributed Systems Engineers'
  },
  {
    id: 'devops-engineer',
    name: 'DevOps & Cloud Engineer',
    number: '08',
    category: 'Technology & Engineering',
    atsFriendly: true,
    layout: 'devops-infra',
    description: 'Features infrastructure badges (Linux, Docker, K8s, Terraform, CI/CD), reliability metrics, and cloud automation achievements.',
    recommendedFor: 'DevOps Engineers, SREs, Cloud Platform Engineers'
  },
  {
    id: 'ai-ml-engineer',
    name: 'AI & Machine Learning Engineer',
    number: '09',
    category: 'Technology & Engineering',
    atsFriendly: true,
    layout: 'ai-research',
    description: 'Emphasizes LLM frameworks, agentic architectures (LangGraph, Pydantic), vector search, dataset pipelines, and technical research.',
    recommendedFor: 'AI Engineers, ML Practitioners, Agentic Systems Developers'
  },
  {
    id: 'fullstack-dev',
    name: 'Full-Stack Developer',
    number: '10',
    category: 'Technology & Engineering',
    atsFriendly: true,
    layout: 'fullstack-split',
    description: 'Features balanced dual-column skill categorization (Frontend UI vs Backend/Cloud) with direct GitHub and live demo deployment badges.',
    recommendedFor: 'Frontend & Full-Stack Web Developers'
  },
  {
    id: 'automation-engineer',
    name: 'Automation & Integration Engineer',
    number: '11',
    category: 'Technology & Engineering',
    atsFriendly: true,
    layout: 'automation-flow',
    description: 'Dedicated to event-driven workflows, webhook listeners, third-party API sync daemons, and measurable operational time-savings.',
    recommendedFor: 'Integration Engineers, Automation Specialists, QA/SDET'
  },
  {
    id: 'cybersecurity-networking',
    name: 'Cybersecurity & Networking',
    number: '12',
    category: 'Technology & Engineering',
    atsFriendly: true,
    layout: 'security-matrix',
    description: 'Highlights security standards (OWASP, RBAC, JWT, TLS), network topology labs, vulnerability auditing, and verified certifications.',
    recommendedFor: 'Security Engineers, Network Administrators, DevSecOps'
  },

  // CATEGORY C — MODERN CREATIVE
  {
    id: 'modern-two-col',
    name: 'Modern Two-Column',
    number: '13',
    category: 'Modern Creative',
    atsFriendly: false,
    layout: 'two-col-left',
    description: '35% left sidebar for contact, education, certifications, and skills; 65% right main column for summary, experience, and major projects.',
    recommendedFor: 'Modern tech companies, startups, and creative engineering agencies'
  },
  {
    id: 'elegant-sidebar',
    name: 'Elegant Sidebar',
    number: '14',
    category: 'Modern Creative',
    atsFriendly: false,
    layout: 'sidebar-dark',
    description: 'Sophisticated dark or accent-tinted sidebar with crisp contrasting typography; white main content body with gold/accent rules.',
    recommendedFor: 'Product Engineers, UI/UX Technologists, Creative Leads'
  },
  {
    id: 'contemporary-creative',
    name: 'Contemporary Creative',
    number: '15',
    category: 'Modern Creative',
    atsFriendly: false,
    layout: 'creative-editorial',
    description: 'Distinctive editorial typography pairing (`DM Serif` + `Inter`), bold colored initials monogram, and geometric section bullets.',
    recommendedFor: 'Design Technologists, Creative Coders, Startup Founders'
  },
  {
    id: 'timeline-resume',
    name: 'Timeline Journey',
    number: '16',
    category: 'Modern Creative',
    atsFriendly: false,
    layout: 'timeline-vertical',
    description: 'A continuous vertical timeline spine connecting career roles, academic degrees, and major milestone accomplishments.',
    recommendedFor: 'Engineers with a continuous, progressive career track'
  },
  {
    id: 'portfolio-oriented',
    name: 'Portfolio-Oriented Showcase',
    number: '17',
    category: 'Modern Creative',
    atsFriendly: true,
    layout: 'portfolio-first',
    description: 'Features prominent showcase project cards with architecture summaries, tech badges, and clickable repo links positioned before work history.',
    recommendedFor: 'Open-Source Contributors, Independent Builders, Freelancers'
  },

  // CATEGORY D — SPECIALIZED
  {
    id: 'academic-research',
    name: 'Academic & Research',
    number: '18',
    category: 'Specialized',
    atsFriendly: true,
    layout: 'academic-formal',
    description: 'Formal academic hierarchy prioritizing education, thesis/dissertation, research projects, publications, and teaching appointments.',
    recommendedFor: 'Graduate Researchers, Computer Science Scholars, Academics'
  },
  {
    id: 'entry-graduate',
    name: 'Graduate & Entry-Level',
    number: '19',
    category: 'Specialized',
    atsFriendly: true,
    layout: 'entry-coursework',
    description: 'Prioritizes university education, core coursework, academic projects, practical labs, and technical certifications over employment history.',
    recommendedFor: 'Recent CS Graduates, Junior Developers, Career Changers'
  },
  {
    id: 'international-premium',
    name: 'International Premium',
    number: '20',
    category: 'Specialized',
    atsFriendly: true,
    layout: 'international-tabular',
    description: 'Standardized European and international format featuring clean tabular date alignment, multilingual proficiency, and exhaustive credential proof.',
    recommendedFor: 'Global / Remote roles, European & Middle-Eastern tech applications'
  }
];

export function getTemplateMeta(id) {
  return RESUME_TEMPLATES.find(t => t.id === id) || RESUME_TEMPLATES[1]; // default modern-pro
}

