import { Theme } from '../models/Theme.js';
import { Settings } from '../models/Settings.js';
import { Profile } from '../models/Profile.js';
import { Skill } from '../models/Skill.js';
import { Roadmap } from '../models/Roadmap.js';
import { Project } from '../models/Project.js';
import { Certificate } from '../models/Certificate.js';
import { Note } from '../models/Note.js';
import { Goal } from '../models/Goal.js';
import { Domain } from '../models/Domain.js';
import { SiteContent } from '../models/SiteContent.js';
import { SocialLink } from '../models/SocialLink.js';
import { User, ROLES } from '../models/User.js';
import { WorkLog } from '../models/WorkLog.js';
import { Milestone } from '../models/Milestone.js';
import bcrypt from 'bcryptjs';
import { calculateProjectProgress } from './progress.js';

import { PALETTES } from '../../src/lib/palettes.js';

export const INITIAL_THEMES = PALETTES.map((p, idx) => ({
  themeId: p.themeId,
  name: p.name,
  mode: p.mode,
  description: p.description,
  raw: p.raw,
  colors: p.colors,
  isPreset: true,
  isActive: p.themeId === 'editorial-sage' || idx === 2
}));

export async function seedInitialData() {
  try {
    // 0. Seed Default Super Admin
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hash = await bcrypt.hash('SuperSecurePass123!', 12);
      await User.create({
        email: 'superadmin@engineeringhub.dev',
        passwordHash: hash,
        name: 'Chief Super Admin',
        role: ROLES.SUPER_ADMIN,
        status: 'active'
      });
      console.log('[seed] Default Super Admin provisioned (superadmin@engineeringhub.dev).');
    }

    // 1. Seed Themes
    const themeCount = await Theme.countDocuments();
    if (themeCount === 0) {
      await Theme.insertMany(INITIAL_THEMES);
      console.log('[seed] Initial themes seeded (Coffee & Garnet active).');
    }

    // 2. Seed Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({});
      console.log('[seed] Default application settings created.');
    }

    // 3. Seed Profile
    const profile = await Profile.findOne();
    if (!profile) {
      await Profile.create({
        name: 'Emaan Humayun',
        headline: 'Software Engineer · Backend · AI · Automation',
        bio: 'Building practical software, reliable backend systems and intelligent workflows. Curious about distributed systems, resilient API design, and pragmatic AI applications.',
        location: 'Lahore, Pakistan',
        contactEmail: 'emaan.humayun@example.com',
        education: [
          {
            degree: 'Matriculation in Computer Science',
            institution: 'The Trust School',
            fieldOfStudy: 'Computer Science',
            startYear: '2019',
            endYear: '2021',
            grade: 'Grade A+',
            description: 'Foundations in computer science, mathematics, and analytical reasoning.',
            order: 1
          },
          {
            degree: 'Intermediate in Computer Science (ICS)',
            institution: 'Government College University',
            fieldOfStudy: 'Computer Science & Statistics',
            startYear: '2021',
            endYear: '2023',
            grade: 'Grade A',
            description: 'Core concepts of procedural programming, mathematics, physics, and computer fundamentals.',
            order: 2
          }
        ],
        achievements: [
          {
            title: 'Academic Honor Roll',
            year: '2023',
            issuer: 'Academic Excellence Award',
            description: 'Awarded for distinction in computer science coursework.'
          }
        ],
        interests: ['Distributed Systems', 'Agentic AI Workflows', 'API Architecture', 'Database Optimization', 'Modern Full-Stack'],
        careerGoals: [
          'Design scalable backend services handling real-world throughput',
          'Build autonomous agentic engineering tools',
          'Contribute meaningfully to open-source software'
        ],
        socialLinks: {
          github: 'https://github.com/EmaanHumayun',
          linkedin: 'https://linkedin.com/in/emaanhumayun',
          twitter: '',
          website: ''
        }
      });
      console.log('[seed] Initial profile initialized.');
    }

    // 4. Skills, Roadmaps, Projects: kept clean for user's actual data
    // (Automatic dummy data injection disabled)

    // 7. Seed initial certificates if empty
    const certCount = await Certificate.countDocuments();
    if (certCount === 0) {
      await Certificate.create({
        title: 'Python for Data Science & Backend Systems',
        issuer: 'Coursera / IBM',
        issuedAt: '2025',
        credentialUrl: 'https://coursera.org',
        description: 'Comprehensive study of Python syntax, data structures, backend scripting, and API communication.',
        tags: ['Python', 'Data Structures', 'APIs'],
        visibility: 'public',
        published: true
      });
      console.log('[seed] Initial certificate seeded.');
    }

    // 8. Seed initial notes if empty
    const noteCount = await Note.countDocuments();
    if (noteCount === 0) {
      await Note.create({
        title: 'Idempotency and Safe Retries in REST APIs',
        slug: 'idempotency-and-safe-retries',
        category: 'Backend Architecture',
        folder: 'Architecture',
        content: `### Understanding Idempotency in Distributed Systems

In distributed architectures, network failures are inevitable. A client may send a request, the server executes it, but the client disconnects before receiving the acknowledgment.

#### The Problem
If the client retries a POST request without an idempotency key, it risks creating duplicate records (such as duplicate payments or duplicate database inserts).

#### The Solution
1. **Idempotency Keys**: Have the client generate a unique UUID v4 header (\`Idempotency-Key\`).
2. **Atomic Lock**: In Redis or MongoDB, store the key with a temporary lease.
3. **Cached Response**: Save the completed response payload against the key. Future retries with the same key return the cached response.
`,
        tags: ['API Design', 'Reliability', 'Idempotency'],
        pinned: true,
        draft: false,
        visibility: 'public',
        published: true
      });
      console.log('[seed] Initial knowledge note seeded.');
    }

    // 9. Goals: kept clean for user's actual goals
    // (Automatic dummy data injection disabled)

    // 10. Seed Domains if empty
    const domainCount = await Domain.countDocuments();
    if (domainCount === 0) {
      await Domain.create([
        {
          name: 'Software Engineering',
          slug: 'software-engineering',
          description: 'Architecture, scalable backend services, resilient APIs, and modern full-stack systems.',
          accentColor: '#6f1d1b',
          icon: 'code',
          order: 1,
          isFeatured: true,
          visibility: 'public',
          fields: [
            { name: 'Backend Engineering', slug: 'backend-engineering', description: 'Server-side systems, REST APIs, microservices, and databases.', order: 1, isFeatured: true },
            { name: 'Frontend Engineering', slug: 'frontend-engineering', description: 'Modern accessible user interfaces and web performance.', order: 2, isFeatured: false },
            { name: 'Full-Stack Development', slug: 'full-stack-development', description: 'End-to-end web applications and unified design tokens.', order: 3, isFeatured: true },
            { name: 'System Design', slug: 'system-design', description: 'Distributed systems, caching strategies, and data modeling.', order: 4, isFeatured: true },
            { name: 'Software Architecture', slug: 'software-architecture', description: 'Clean architecture, domain-driven design, and patterns.', order: 5, isFeatured: false },
            { name: 'DevOps & Reliability', slug: 'devops', description: 'CI/CD pipelines, containerization, and observability.', order: 6, isFeatured: false }
          ]
        },
        {
          name: 'Artificial Intelligence',
          slug: 'artificial-intelligence',
          description: 'Agentic workflows, LLM orchestration, structured tool calling, and applied machine learning.',
          accentColor: '#bb9457',
          icon: 'cpu',
          order: 2,
          isFeatured: true,
          visibility: 'public',
          fields: [
            { name: 'Agentic AI', slug: 'agentic-ai', description: 'Multi-agent orchestration, tool loops, and autonomous workflows.', order: 1, isFeatured: true },
            { name: 'Machine Learning', slug: 'machine-learning', description: 'Supervised/unsupervised models and algorithmic foundations.', order: 2, isFeatured: false },
            { name: 'Generative AI', slug: 'generative-ai', description: 'RAG pipelines, vector search, embeddings, and prompt engineering.', order: 3, isFeatured: true },
            { name: 'AI Infrastructure & Safety', slug: 'ai-infrastructure', description: 'Model serving, latency optimization, and evaluation benchmarks.', order: 4, isFeatured: false }
          ]
        },
        {
          name: 'Cybersecurity',
          slug: 'cybersecurity',
          description: 'Network defense, application security, safe authorization, and vulnerability auditing.',
          accentColor: '#941b0c',
          icon: 'shield',
          order: 3,
          isFeatured: true,
          visibility: 'public',
          fields: [
            { name: 'Application Security', slug: 'application-security', description: 'OWASP Top 10 mitigation, secure authentication, and RBAC.', order: 1, isFeatured: true },
            { name: 'Network Security', slug: 'network-security', description: 'Packet inspection, secure protocols, and firewall rules.', order: 2, isFeatured: false },
            { name: 'Cloud Security', slug: 'cloud-security', description: 'IAM policies, container security, and secret management.', order: 3, isFeatured: false }
          ]
        },
        {
          name: 'Cloud & Infrastructure',
          slug: 'cloud-infrastructure',
          description: 'Serverless architectures, container orchestration, and cloud-native services.',
          accentColor: '#2a9d8f',
          icon: 'cloud',
          order: 4,
          isFeatured: true,
          visibility: 'public',
          fields: [
            { name: 'Cloud Architecture', slug: 'cloud-architecture', description: 'Scalable infrastructure on AWS, GCP, and Supabase.', order: 1, isFeatured: true },
            { name: 'Containers & Kubernetes', slug: 'containers-kubernetes', description: 'Docker packaging, cluster management, and health checks.', order: 2, isFeatured: false }
          ]
        },
        {
          name: 'Automation & Integrations',
          slug: 'automation-integrations',
          description: 'ETL pipelines, event-driven webhooks, and developer productivity tooling.',
          accentColor: '#99582a',
          icon: 'zap',
          order: 5,
          isFeatured: true,
          visibility: 'public',
          fields: [
            { name: 'Workflow Automation', slug: 'workflow-automation', description: 'Trigger-based systems, scheduled workers, and sync pipelines.', order: 1, isFeatured: true },
            { name: 'API Integrations', slug: 'api-integrations', description: 'Third-party REST/GraphQL integration and webhook consumers.', order: 2, isFeatured: true }
          ]
        }
      ]);
      console.log('[seed] Hierarchical Domains and Fields seeded.');
    }

    // 11. Seed SiteContent if empty
    const siteContentCount = await SiteContent.countDocuments();
    if (siteContentCount === 0) {
      await SiteContent.create({
        hero: {
          kicker: 'DEVOPS & CLOUD INFRASTRUCTURE HUB',
          availabilityText: 'KUBERNETES • CI/CD AUTOMATION • TERRAFORM • SRE',
          heading: 'Automating cloud infrastructure.',
          headingAccent: 'From commit to self-healing cluster.',
          description: 'DevOps & Site Reliability Engineer specializing in resilient multi-cloud architectures, Kubernetes orchestration, zero-downtime CI/CD delivery pipelines, and Infrastructure as Code. Engineering scalable, observable, and automated production platforms.',
          primaryCtaText: 'Explore Cloud Infrastructure',
          primaryCtaLink: '/projects',
          secondaryCtaText: 'Cluster Blueprints & IaC',
          secondaryCtaLink: 'https://github.com/EmaanHumayun',
          statusBadge: 'Orchestrating Kubernetes, Terraform & GitOps Delivery'
        },
        about: {
          eyebrow: "WHAT I'M EXPLORING",
          heading: 'Curiosity, with a',
          headingAccent: 'practical direction.',
          description: 'From resilient APIs and distributed architectures to AI-powered agentic systems and security engineering, I focus on understanding first principles and turning complex technical ideas into reliable, usable software.',
          focusGrid: [
            { title: 'Distributed Systems & Microservices', subtitle: 'Idempotency, queue workers, and transaction safety', icon: 'server' },
            { title: 'Agentic AI & Orchestration', subtitle: 'Multi-agent coordination, structured JSON outputs, and tools', icon: 'cpu' },
            { title: 'System Security & Clean Architecture', subtitle: 'Centralized RBAC, input sanitization, and defensive engineering', icon: 'shield' },
            { title: 'Full-Stack Performance & UX', subtitle: 'Fast feedback loops, accessible design, and unified design tokens', icon: 'layers' }
          ]
        },
        sections: {
          projects: { eyebrow: 'SELECTED WORK', title: 'Projects with an architectural purpose.', description: 'Practical systems, experiments, and engineering repositories — built from first principles and documented with technical decisions.', visible: true },
          domains: { eyebrow: 'SPECIALIZATIONS', title: 'Technical domains & areas of focus.', description: 'Specialized disciplines across software engineering, artificial intelligence, security, and systems architecture.', visible: true },
          skills: { eyebrow: 'CORE COMPETENCIES', title: 'Skills, categorized and verified.', description: 'A breakdown of programming languages, frameworks, database engines, and architectural patterns in active use.', visible: true },
          roadmaps: { eyebrow: 'CONTINUOUS MASTERY', title: 'Learning roadmaps & progression.', description: 'Transparent technical learning paths and stages tracked in public.', visible: true },
          education: { eyebrow: 'ACADEMIC BACKGROUND', title: 'Education & computer science foundations.', description: 'Formal qualifications and foundational studies in computer science, mathematics, and analytical reasoning.', visible: true },
          certificates: { eyebrow: 'VERIFIED CREDENTIALS', title: 'Certificates & qualifications.', description: 'Verified external certifications, technical assessments, and professional milestones.', visible: true },
          notes: { eyebrow: 'KNOWLEDGE BASE', title: 'Technical notes & concept breakdowns.', description: 'Lessons learned, architecture notes, and deep dives written while building software.', visible: true },
          contact: { eyebrow: "LET'S CONNECT", title: 'Good work gets better', headingAccent: 'when it is shared.', description: 'Have an interesting engineering problem, collaboration idea, or question? Feel free to reach out directly.', visible: true }
        },
        navigation: {
          projectsLabel: 'Projects',
          domainsLabel: 'Domains',
          skillsLabel: 'Skills',
          roadmapsLabel: 'Roadmaps',
          educationLabel: 'Education',
          certificatesLabel: 'Certificates',
          notesLabel: 'Notes'
        },
        footer: {
          brandText: 'Engineering Hub Pro — Built with curiosity and precision',
          copyrightText: '© 2026 Emaan Humayun. All rights reserved.'
        },
        seo: {
          title: 'Emaan Humayun — Software Engineer & Systems Architect',
          description: 'A personal engineering workspace and technical portfolio documenting backend systems, AI workflows, and software architecture.'
        }
      });
      console.log('[seed] SiteContent document initialized.');
    }

    // 12. Seed SocialLinks if empty
    const socialCount = await SocialLink.countDocuments();
    if (socialCount === 0) {
      await SocialLink.create([
        {
          platform: 'github',
          label: 'GitHub',
          url: 'https://github.com/EmaanHumayun',
          username: 'EmaanHumayun',
          icon: 'github',
          order: 1,
          isEnabled: true,
          placement: ['hero', 'footer', 'contact']
        },
        {
          platform: 'linkedin',
          label: 'LinkedIn',
          url: 'https://linkedin.com/in/emaanhumayun',
          username: 'emaanhumayun',
          icon: 'linkedin',
          order: 2,
          isEnabled: true,
          placement: ['hero', 'footer', 'contact']
        },
        {
          platform: 'email',
          label: 'Email',
          url: 'mailto:emaan.humayun@example.com?subject=Engineering%20Hub%20Inquiry',
          username: 'emaan.humayun@example.com',
          icon: 'mail',
          order: 3,
          isEnabled: true,
          placement: ['hero', 'footer', 'contact']
        },
        {
          platform: 'whatsapp',
          label: 'WhatsApp',
          url: 'https://wa.me/?text=Hi%20Emaan%2C%20I%20saw%20your%20Engineering%20Hub%20Pro%20portfolio',
          username: '',
          icon: 'message-circle',
          order: 4,
          isEnabled: true,
          placement: ['hero', 'footer', 'contact']
        }
      ]);
      console.log('[seed] Social and contact links seeded.');
    }

    // 13. Milestones & 14. WorkLogs: kept clean for user's actual data
    // (Automatic dummy data injection disabled)
  } catch (err) {
    console.error('[seed] Error during initial data seeding:', err);
  }
}
