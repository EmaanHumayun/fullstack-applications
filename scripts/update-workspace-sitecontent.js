import 'dotenv/config';
import mongoose from 'mongoose';

async function updateSiteContent() {
  console.log('[SITE_CONTENT] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SITE_CONTENT] Connected successfully.');

  const db = mongoose.connection.db;
  const siteContentCol = db.collection('sitecontents');

  const updateDoc = {
    'hero.kicker': 'ENGINEERING WORKSPACE & PORTFOLIO',
    'hero.heading': 'Software & DevOps Engineering.',
    'hero.headingAccent': 'Architecting resilient systems.',
    'hero.description': 'I build practical software applications, deterministic backend architectures, and modern cloud deployment pipelines across Software Engineering, DevOps, Automation, and Agentic AI.',
    'hero.statusBadge': '22 Repositories · 5 Comprehensive Roadmaps · Verified Clean Architecture',
    
    'about.eyebrow': 'CORE ENGINEERING TRACKS',
    'about.heading': 'Structured systems, with an',
    'about.headingAccent': 'architectural focus.',
    'about.description': 'From deterministic REST APIs and cloud infrastructure to event-driven integrations and agentic AI systems, my work centers on first principles, disciplined documentation, and reliable production software.',
    'about.focusGrid': [
      {
        title: 'Central Portfolio Hubs',
        subtitle: 'Master architectural blueprints, domain matrices, cross-repo indexes, and engineering standards.',
        icon: 'terminal'
      },
      {
        title: 'DevOps & Cloud Infrastructure Track',
        subtitle: '10-module curriculum: Linux internals, Docker containerization, Kubernetes, Terraform IaC, and CI/CD.',
        icon: 'cloud'
      },
      {
        title: 'Backend Engineering Ecosystem',
        subtitle: '20 progressive projects from HTTP servers and relational databases to microservices and distributed caching.',
        icon: 'server'
      },
      {
        title: 'Automation & Integration Ecosystem',
        subtitle: '20 progressive projects covering webhook brokers, CRM data sync, ETL pipelines, and cloud automation.',
        icon: 'layers'
      },
      {
        title: 'AI Agent Engineering & Systems',
        subtitle: '20 progressive projects: schema-validated tool calling, persistent memory, hybrid RAG, and multi-agent SDLC.',
        icon: 'cpu'
      },
      {
        title: 'Full-Stack Applications Portfolio',
        subtitle: 'Decoupled React 18 single-page apps, Express backends, RBAC security, and Engineering Hub Pro (v2.0).',
        icon: 'code'
      },
      {
        title: 'Specialized Engineering Repositories',
        subtitle: 'Operational Bash daemons, relational data analytics schemas, and experimental agent scripts.',
        icon: 'shield'
      }
    ],

    'sections.projects.eyebrow': 'PINNED & ACTIVE REPOSITORIES',
    'sections.projects.title': '7 Core Engineering Pillars & Flagship Repositories.',
    'sections.projects.description': 'A modular ecosystem of 27 repositories spanning DevOps, Backend Engineering, Automation & Integrations, AI Agent Systems, and Full-Stack Applications.'
  };

  const result = await siteContentCol.updateOne(
    {},
    { $set: updateDoc },
    { upsert: true }
  );

  console.log('[SITE_CONTENT] Successfully updated SiteContent document:', result.acknowledged);
  await mongoose.disconnect();
  console.log('[SITE_CONTENT] Disconnected cleanly.');
}

updateSiteContent().catch(err => {
  console.error('[SITE_CONTENT ERROR]', err);
  process.exit(1);
});

