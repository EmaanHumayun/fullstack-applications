import 'dotenv/config';
import { connectDB, disconnectDB } from '../server/config/db.js';
import { Resume } from '../server/models/Resume.js';
import { Profile } from '../server/models/Profile.js';
import { Skill } from '../server/models/Skill.js';
import { Project } from '../server/models/Project.js';
import { Certificate } from '../server/models/Certificate.js';
import { User } from '../server/models/User.js';
import { getPalette } from '../src/components/resume/palettes.js';

async function seedResumes() {
  console.log('[SEED-RESUME] Connecting to database...');
  await connectDB();

  // Find admin user
  let admin = await User.findOne();
  if (!admin) {
    admin = await User.create({
      email: 'admin@engineeringhub.dev',
      name: 'Emaan Humayun',
      role: 'super_admin'
    });
  }

  const existingCount = await Resume.countDocuments();
  console.log(`[SEED-RESUME] Existing resumes: ${existingCount}`);

  // Fetch real workspace projects and skills
  const [profile, skills, projects, certs] = await Promise.all([
    Profile.findOne().lean(),
    Skill.find({ status: { $ne: 'Archived' } }).limit(20).lean(),
    Project.find({ type: 'project' }).limit(5).lean(),
    Certificate.find().limit(4).lean()
  ]);

  const projectEntries = (projects || []).map(p => ({
    title: p.title,
    subtitle: p.domain || 'Backend Architecture',
    startDate: '2025',
    endDate: '2026',
    description: p.summary || p.description || 'Production-grade software application.',
    technologies: p.technologies || [],
    githubUrl: p.githubUrl || '',
    url: p.liveUrl || '',
    bullets: [
      'Designed and deployed deterministic REST APIs with centralized authentication.',
      'Achieved zero-downtime rolling container releases with health-check probes.'
    ]
  }));

  const certEntries = (certs || []).map(c => ({
    title: c.title,
    organization: c.issuer,
    startDate: c.issuedAt || '2025',
    url: c.credentialUrl || '',
    description: c.credentialId ? `Credential ID: ${c.credentialId}` : ''
  }));

  const eduEntries = (profile?.education && profile.education.length > 0)
    ? profile.education.map(e => ({
        title: e.degree,
        organization: e.institution,
        subtitle: e.fieldOfStudy || 'Computer Science',
        startDate: e.startYear || '2022',
        endDate: e.endYear || '2026',
        description: e.grade ? `Academic standing / CGPA: ${e.grade}` : ''
      }))
    : [{
        title: 'Bachelor of Science in Computer Science',
        organization: 'FAST National University of Computer and Emerging Sciences',
        subtitle: 'Software Systems & Distributed Computing',
        startDate: '2022',
        endDate: '2026',
        description: 'Focus: Operating Systems, Distributed Systems, Database Design, Networks.'
      }];

  const expEntries = [
    {
      title: 'Software Engineer',
      organization: 'Engineering Workspace Lab',
      location: 'Remote',
      startDate: '2025',
      endDate: 'Present',
      current: true,
      description: 'Designing high-reliability backend services, cloud infrastructures, and automated systems.',
      bullets: [
        'Constructed 20+ progressive production backend systems covering microservices, caching, and rate limiting.',
        'Engineered containerized deployment pipelines using Docker, Kubernetes, and GitHub Actions CI/CD.',
        'Implemented Role-Based Access Control (RBAC) and immutable audit logging for enterprise security compliance.'
      ]
    }
  ];

  const defaultSkillsData = {
    categories: [
      {
        name: 'Backend & APIs',
        skills: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'GraphQL', 'JWT Auth', 'RBAC Middleware']
      },
      {
        name: 'Databases & In-Memory',
        skills: ['PostgreSQL', 'MongoDB Atlas', 'Redis', 'Mongoose', 'Prisma', 'SQL Optimization']
      },
      {
        name: 'DevOps & Cloud Infrastructure',
        skills: ['Docker', 'Kubernetes', 'Terraform IaC', 'AWS', 'Linux Systems', 'GitHub Actions', 'Prometheus']
      },
      {
        name: 'Frontend & UI Frameworks',
        skills: ['React 18', 'JavaScript (ES6+)', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML5/CSS3']
      },
      {
        name: 'Agentic AI & Automation',
        skills: ['LangGraph', 'Pydantic Schemas', 'LLM Tool Calling', 'Hybrid Search RAG', 'Webhooks']
      }
    ]
  };

  // Resume 1: Flagship Software Engineer Resume (Featured Public)
  const resume1 = {
    ownerId: admin._id,
    title: 'Software Engineer — Full-Stack & Systems',
    targetRole: 'Software Engineer',
    templateId: 'modern-pro',
    theme: getPalette('burgundy-gold'),
    typography: { fontFamily: 'inter', fontSize: 'normal', lineHeight: 'normal' },
    personalInformation: {
      fullName: profile?.name || 'Emaan Humayun',
      professionalTitle: 'Software Engineer | DevOps Engineer',
      email: profile?.email || profile?.contactEmail || 'emaan.humayun@example.com',
      phone: profile?.phone || '',
      location: profile?.location || 'Lahore, Pakistan',
      linkedinUrl: profile?.linkedinUrl || 'https://linkedin.com/in/emaanmuhammadhumayun',
      githubUrl: profile?.githubUrl || 'https://github.com/EmaanHumayun',
      portfolioUrl: 'https://emaan.dev',
      websiteUrl: ''
    },
    professionalSummary:
      'Software Engineer and DevOps practitioner dedicated to building resilient backend architectures, automated cloud platforms, and practical agentic AI workflows. Grounded in first-principles software engineering with production experience across decoupled REST APIs, relational/document persistence, and continuous release pipelines.',
    sections: [
      { id: 's-sum', sectionType: 'summary', title: 'Professional Summary', visible: true, order: 0, entries: [] },
      { id: 's-ski', sectionType: 'skills', title: 'Technical Competencies', visible: true, order: 1, entries: [] },
      { id: 's-pro', sectionType: 'projects', title: 'Key Production Projects', visible: true, order: 2, entries: projectEntries },
      { id: 's-exp', sectionType: 'experience', title: 'Engineering Experience', visible: true, order: 3, entries: expEntries },
      { id: 's-edu', sectionType: 'education', title: 'Academic Education', visible: true, order: 4, entries: eduEntries },
      { id: 's-cer', sectionType: 'certifications', title: 'Verified Credentials', visible: true, order: 5, entries: certEntries }
    ],
    skillsData: defaultSkillsData,
    pageSettings: { pageSize: 'A4', margins: 'normal', showPageNumbers: false },
    visibility: 'public',
    isFeatured: true,
    version: 1
  };

  // Resume 2: DevOps & Cloud Infrastructure Resume
  const resume2 = {
    ownerId: admin._id,
    title: 'DevOps & Cloud Infrastructure Resume',
    targetRole: 'DevOps / Cloud Platform Engineer',
    templateId: 'devops-engineer',
    theme: getPalette('classic-navy'),
    typography: { fontFamily: 'jetbrains-mono', fontSize: 'normal', lineHeight: 'normal' },
    personalInformation: { ...resume1.personalInformation },
    professionalSummary:
      'Cloud & DevOps Engineer focused on multi-AZ cloud architecture, immutable infrastructure as code, containerized Kubernetes orchestration, and continuous telemetry monitoring. Proven record of zero-downtime rolling deployments and automated CI/CD releases.',
    sections: [
      { id: 's-sum', sectionType: 'summary', title: 'Infrastructure Profile', visible: true, order: 0, entries: [] },
      { id: 's-ski', sectionType: 'skills', title: 'Platform & Cloud Stack', visible: true, order: 1, entries: [] },
      { id: 's-pro', sectionType: 'projects', title: 'Infrastructure & IaC Deployments', visible: true, order: 2, entries: projectEntries },
      { id: 's-exp', sectionType: 'experience', title: 'DevOps Experience', visible: true, order: 3, entries: expEntries },
      { id: 's-cer', sectionType: 'certifications', title: 'Cloud Certifications', visible: true, order: 4, entries: certEntries },
      { id: 's-edu', sectionType: 'education', title: 'Education', visible: true, order: 5, entries: eduEntries }
    ],
    skillsData: {
      categories: [
        { name: 'Cloud & Infrastructure', skills: ['AWS Multi-AZ VPC', 'Terraform IaC', 'Kubernetes', 'Docker Engine', 'Helm'] },
        { name: 'CI/CD & Release', skills: ['GitHub Actions', 'GitOps Workflows', 'Canary Rollouts', 'Linux Shell Scripting'] },
        { name: 'Observability & Telemetry', skills: ['Prometheus', 'Grafana', 'Structured Logging', 'Health Probes'] }
      ]
    },
    pageSettings: { pageSize: 'A4', margins: 'compact', showPageNumbers: false },
    visibility: 'private',
    isFeatured: false,
    version: 1
  };

  // Upsert initial resumes
  await Resume.deleteMany({ ownerId: admin._id });
  await Resume.create([resume1, resume2]);

  console.log('[SEED-RESUME] Successfully created 2 verified initial resumes.');
  console.log('[SEED-RESUME] Resume 1 ("Software Engineer") designated as featured public portfolio resume.');

  await disconnectDB();
}

seedResumes().catch(err => {
  console.error('[SEED-RESUME] Error:', err);
  process.exit(1);
});

