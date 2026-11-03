import { Project } from '../models/Project.js';
import { Domain } from '../models/Domain.js';
import { Roadmap } from '../models/Roadmap.js';
import { Skill } from '../models/Skill.js';
import { PracticeLab } from '../models/PracticeLab.js';
import { Assignment } from '../models/Assignment.js';

export const ECOSYSTEM_DEFINITIONS = [
  {
    slug: 'backend-engineering',
    name: 'Backend Engineering Ecosystem',
    shortName: 'Backend Engineering',
    domainSlug: 'software-engineering',
    description: 'A structured backend engineering learning and project ecosystem covering 20 progressive projects from beginner fundamentals to advanced production-oriented backend architecture.',
    icon: 'server',
    accentColor: '#3b82f6',
    hubRepo: 'backend-engineering-hub',
    roadmapSlug: 'backend-engineering-master-roadmap',
    levels: [
      { level: 'Beginner', repo: 'backend-beginner-projects', range: 'Projects 01-05', focus: 'HTTP, REST APIs, CRUD, Auth, Relational DBs' },
      { level: 'Intermediate', repo: 'backend-intermediate-projects', range: 'Projects 06-10', focus: 'Caching, Queues, Rate Limiting, WebSockets, RBAC' },
      { level: 'Advanced', repo: 'backend-advanced-projects', range: 'Projects 11-15', focus: 'Event-Driven, Distributed Tracing, High-Load, GraphQL' },
      { level: 'Professional', repo: 'backend-professional-projects', range: 'Projects 16-20', focus: 'CQRS, Event Sourcing, Multi-Tenant SaaS, Microservices Mesh' }
    ]
  },
  {
    slug: 'automation-integrations',
    name: 'Automation & Integration Engineering Ecosystem',
    shortName: 'Automation & Integrations',
    domainSlug: 'automation-integrations',
    description: 'A comprehensive Automation and Integration Engineering roadmap featuring 20 progressive projects covering workflow automation, APIs, business integrations, DevOps automation, cloud automation and AI-powered systems.',
    icon: 'layers',
    accentColor: '#10b981',
    hubRepo: 'automation-integration-hub',
    roadmapSlug: 'automation-integration-engineering-roadmap',
    levels: [
      { level: 'Beginner', repo: 'automation-beginner-projects', range: 'Projects 01-05', focus: 'Email Daemons, File Processing, Form Pipelines, Webhooks' },
      { level: 'Intermediate', repo: 'automation-intermediate-projects', range: 'Projects 06-10', focus: 'CRM Sync, E-commerce, Alerts, GitHub Automation, Invoicing' },
      { level: 'Advanced', repo: 'automation-advanced-projects', range: 'Projects 11-15', focus: 'Custom Integrations, Workflow Engines, Event Brokers, ETL Pipelines' },
      { level: 'Professional', repo: 'automation-professional-projects', range: 'Projects 16-20', focus: 'DevOps Auto-Remediation, CI/CD Engines, AI Pipelines, Enterprise' }
    ]
  },
  {
    slug: 'ai-agents',
    name: 'AI Agent Engineering & Agentic Systems',
    shortName: 'AI Agent Engineering',
    domainSlug: 'artificial-intelligence',
    description: 'An industry-oriented ecosystem for learning, building, testing, documenting, and showcasing AI Agents and Agentic Systems from first principles to multi-agent production platforms.',
    icon: 'cpu',
    accentColor: '#8b5cf6',
    hubRepo: 'ai-agent-engineering-hub',
    roadmapSlug: 'ai-agent-engineering-systems-roadmap',
    levels: [
      { level: 'Beginner', repo: 'ai-agents-beginner-projects', range: 'Projects 01-05', focus: 'LLM Chat, Tool Calling, Research Extraction, SQLite Agents, RAG' },
      { level: 'Intermediate', repo: 'ai-agents-intermediate-projects', range: 'Projects 06-10', focus: 'Persistent Memory, Email Agents, Coding Assistants, Hybrid Search' },
      { level: 'Advanced', repo: 'ai-agents-advanced-projects', range: 'Projects 11-15', focus: 'DAG Planning, Multi-Agent Teams, SDLC Collectives, Text-to-SQL' },
      { level: 'Professional', repo: 'ai-agents-professional-projects', range: 'Projects 16-20', focus: 'AIOps Ops Agents, Customer Support, Autonomous SWE, Enterprise Gateway' }
    ]
  },
  {
    slug: 'devops-cloud',
    name: 'DevOps & Cloud Infrastructure Track',
    shortName: 'DevOps & Cloud',
    domainSlug: 'cloud-infrastructure',
    description: 'A production-grade infrastructure and DevOps mastery curriculum covering Linux system internals, Docker containerization, Kubernetes orchestration, Terraform IaC, and CI/CD pipelines.',
    icon: 'cloud',
    accentColor: '#f59e0b',
    hubRepo: 'devops-engineering-bootcamp',
    roadmapSlug: 'devops-engineering-bootcamp-roadmap',
    levels: [
      { level: 'Foundation', repo: 'devops-engineering-bootcamp', range: '10 Core Modules', focus: 'Linux, Networking, Shell Scripting, Git, Services, Administration' },
      { level: 'Intermediate', repo: 'devops-practice-labs', range: 'Modules 01-08', focus: 'Docker Multi-Stage, Kubernetes Pods, Helm Charts, Prometheus' },
      { level: 'Advanced', repo: 'cloud-infrastructure-iac', range: 'AWS IaC Modules', focus: 'Terraform Multi-AZ VPC, EKS Cluster, Remote State Locking' },
      { level: 'Professional', repo: 'devops-assignments-challenges', range: 'Case Studies', focus: 'Canary Zero-Downtime Rollouts, Supply Chain Security' }
    ]
  },
  {
    slug: 'fullstack-apps',
    name: 'Full-Stack Applications Portfolio',
    shortName: 'Full-Stack Applications',
    domainSlug: 'software-engineering',
    description: 'End-to-end full-stack applications with decoupled frontend architectures, robust backend REST APIs, authentication, and containerized deployments.',
    icon: 'code',
    accentColor: '#ec4899',
    hubRepo: 'fullstack-applications',
    roadmapSlug: 'backend-engineering-master-roadmap',
    levels: [
      { level: 'Flagship', repo: 'fullstack-applications', range: 'Monorepo Applications', focus: 'Engineering Hub Pro (v2.0), Task Management Platform' },
      { level: 'Advanced', repo: 'fullstack-cloud-native-app', range: 'Cloud-Native Platform', focus: 'React 18 + Express + Docker + K8s Manifests' },
      { level: 'Foundation', repo: '50-javascript-projects', range: '50 Vanilla JS Apps', focus: 'DOM Manipulation, Async JS, Algorithms, Fetch API' }
    ]
  }
];

/**
 * Summarizes all learning ecosystems with real-time statistics from MongoDB.
 */
export async function getEcosystemsSummary() {
  const [allProjects, allRoadmaps, allSkills] = await Promise.all([
    Project.find({ isArchived: false }).lean(),
    Roadmap.find({ isArchived: false }).lean(),
    Skill.find({ isArchived: false }).lean()
  ]);

  const roadmapBySlug = new Map(allRoadmaps.map(r => [r.slug, r]));

  return ECOSYSTEM_DEFINITIONS.map(def => {
    const ecosystemProjects = allProjects.filter(p =>
      p.ecosystem === def.name ||
      p.ecosystem === def.shortName ||
      p.domain === def.shortName ||
      (p.tags && p.tags.includes(def.slug))
    );

    const mainHubProject = allProjects.find(p => p.slug === def.hubRepo);
    const completedCount = ecosystemProjects.filter(p => p.status === 'Completed').length;
    const inProgressCount = ecosystemProjects.filter(p => p.status === 'In progress').length;
    const plannedCount = ecosystemProjects.filter(p => p.status === 'Planned' || p.status === 'Ready to Start').length;

    const roadmap = roadmapBySlug.get(def.roadmapSlug) || null;

    return {
      ...def,
      totalProjects: ecosystemProjects.length,
      completedProjects: completedCount,
      inProgressProjects: inProgressCount,
      plannedProjects: plannedCount,
      progressPercentage: ecosystemProjects.length > 0
        ? Math.round((completedCount / ecosystemProjects.length) * 100)
        : 0,
      hubProject: mainHubProject ? {
        id: mainHubProject._id,
        title: mainHubProject.title,
        slug: mainHubProject.slug,
        githubUrl: mainHubProject.githubUrl,
        status: mainHubProject.status,
        progress: mainHubProject.progress
      } : null,
      roadmap: roadmap ? {
        id: roadmap._id,
        title: roadmap.title,
        slug: roadmap.slug,
        progress: roadmap.progress || 0,
        phasesCount: roadmap.phases ? roadmap.phases.length : 0
      } : null
    };
  });
}

/**
 * Returns deep-dive data for a single ecosystem.
 */
export async function getEcosystemDetail(slug) {
  const definition = ECOSYSTEM_DEFINITIONS.find(e => e.slug === slug);
  if (!definition) return null;

  const [projects, roadmap, skills, labs, assignments] = await Promise.all([
    Project.find({
      isArchived: false,
      $or: [
        { ecosystem: definition.name },
        { ecosystem: definition.shortName },
        { domain: definition.shortName },
        { slug: definition.hubRepo }
      ]
    }).sort({ order: 1, projectNumber: 1, title: 1 }).lean(),
    Roadmap.findOne({ slug: definition.roadmapSlug, isArchived: false }).lean(),
    Skill.find({
      isArchived: false,
      $or: [
        { category: definition.shortName },
        { category: definition.name }
      ]
    }).lean(),
    PracticeLab.find({ isArchived: false }).lean(),
    Assignment.find({ isArchived: false }).lean()
  ]);

  // Separate Hub, Levels, and Subprojects
  const hubProject = projects.find(p => p.slug === definition.hubRepo) || null;
  const levelProjects = projects.filter(p => p.repoType === 'level_repo' || definition.levels.some(l => l.repo === p.slug));
  const subprojects = projects.filter(p => p.projectNumber !== null && p.projectNumber !== undefined && p.projectNumber > 0);

  return {
    definition,
    hubProject,
    levelProjects,
    subprojects,
    allProjects: projects,
    roadmap,
    skills,
    labs: labs.filter(l => l.category === definition.shortName || l.tags?.includes(definition.slug)),
    assignments: assignments.filter(a => a.category === definition.shortName || a.tags?.includes(definition.slug)),
    metrics: {
      total: projects.length,
      subprojectsCount: subprojects.length,
      completed: projects.filter(p => p.status === 'Completed').length,
      inProgress: projects.filter(p => p.status === 'In progress').length,
      planned: projects.filter(p => p.status === 'Planned' || p.status === 'Ready to Start').length,
      skillsCount: skills.length
    }
  };
}

/**
 * Evaluates incomplete prerequisites and recommends the next deterministic engineering task.
 */
export async function getRecommendedNextAction() {
  const projects = await Project.find({
    isArchived: false,
    projectNumber: { $ne: null }
  }).sort({ ecosystem: 1, projectNumber: 1 }).lean();

  if (projects.length === 0) {
    return {
      status: 'no_projects',
      message: 'No progressive ecosystem projects registered yet.',
      recommendation: null
    };
  }

  // Find the first project in each ecosystem that is not completed
  const nextActions = [];
  const ecosystems = ['Backend Engineering Ecosystem', 'Automation & Integration Engineering Ecosystem', 'AI Agent Engineering & Agentic Systems'];

  for (const ecoName of ecosystems) {
    const ecoProjects = projects
      .filter(p => p.ecosystem === ecoName)
      .sort((a, b) => (a.projectNumber || 0) - (b.projectNumber || 0));

    const pendingProject = ecoProjects.find(p => p.status !== 'Completed');
    if (pendingProject) {
      const prevProject = ecoProjects.find(p => p.projectNumber === (pendingProject.projectNumber - 1));
      nextActions.push({
        ecosystem: ecoName,
        project: {
          id: pendingProject._id,
          title: pendingProject.title,
          slug: pendingProject.slug,
          projectNumber: pendingProject.projectNumber,
          level: pendingProject.level,
          status: pendingProject.status,
          githubUrl: pendingProject.githubUrl,
          localPath: pendingProject.localPath,
          summary: pendingProject.summary,
          technologies: pendingProject.technologies
        },
        prerequisiteSatisfied: !prevProject || prevProject.status === 'Completed',
        previousProjectTitle: prevProject ? prevProject.title : 'None (First Project)',
        reason: prevProject && prevProject.status === 'Completed'
          ? `Project ${prevProject.projectNumber} is verified and completed. You are ready to develop Project ${pendingProject.projectNumber}: ${pendingProject.title}.`
          : `Project ${pendingProject.projectNumber} is the active milestone for ${ecoName}.`
      });
    }
  }

  // The primary next action is the top priority incomplete project across ecosystems
  const primaryRecommendation = nextActions.find(a => a.prerequisiteSatisfied) || nextActions[0] || null;

  return {
    status: 'active',
    primaryRecommendation,
    allPendingEcosystemActions: nextActions,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Promotes a completed project into the public portfolio.
 */
export async function promoteProjectToPortfolio(projectId, portfolioData = {}) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  project.portfolioStatus = 'public_portfolio';
  project.visibility = 'public';
  project.published = true;
  if (portfolioData.summary) project.summary = portfolioData.summary;
  if (portfolioData.liveUrl) project.liveUrl = portfolioData.liveUrl;
  if (portfolioData.coverImage) project.coverImage = portfolioData.coverImage;
  if (portfolioData.featured !== undefined) project.featured = Boolean(portfolioData.featured);

  await project.save();
  return project;
}

