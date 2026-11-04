import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.argv[2] || process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'EmaanHumayun';
const BASE = path.join(__dirname, '..', 'github-ecosystem');

const REPOSITORIES = [
  {
    name: 'backend-engineering-hub',
    description: 'Central architectural hub and progressive master directory for 20 production-grade backend engineering projects covering REST APIs, security, modular monoliths, distributed systems, and cloud-native microservices.',
    topics: [
      'backend-engineering',
      'backend-hub',
      'software-engineering',
      'system-design',
      'software-architecture',
      'nodejs',
      'express',
      'microservices',
      'distributed-systems',
      'docker',
      'kubernetes',
      'api-design',
      'clean-architecture'
    ]
  },
  {
    name: 'backend-beginner-projects',
    description: 'Level 1 Backend Engineering Projects (01-05): Foundational REST APIs, CRUD operations, database persistence, JWT authentication, and file storage.',
    topics: [
      'backend-engineering',
      'rest-api',
      'nodejs',
      'express',
      'mongodb',
      'postgresql',
      'jwt-authentication',
      'multer',
      'docker',
      'crud'
    ]
  },
  {
    name: 'backend-intermediate-projects',
    description: 'Level 2 Backend Engineering Projects (06-10): Enterprise RBAC, transactional e-commerce APIs, CMS with search, asynchronous notifications, and webhook event delivery.',
    topics: [
      'backend-engineering',
      'rbac',
      'ecommerce-backend',
      'cms-api',
      'notification-service',
      'webhooks',
      'redis',
      'bullmq',
      'postgresql',
      'stripe-integration'
    ]
  },
  {
    name: 'backend-advanced-projects',
    description: 'Level 3 Backend Engineering Projects (11-15): Modular monolithic SaaS, high-throughput API gateway, real-time WebSocket chat, Elasticsearch analytics, and security hardening.',
    topics: [
      'backend-engineering',
      'modular-monolith',
      'api-gateway',
      'websockets',
      'elasticsearch',
      'security-hardening',
      'rate-limiting',
      'distributed-systems',
      'redis',
      'testing'
    ]
  },
  {
    name: 'backend-professional-projects',
    description: 'Level 4 Backend Engineering Projects (16-20): Cloud-native microservices, event-driven architecture, distributed job workers, concurrent booking engine, and production multi-tenant SaaS.',
    topics: [
      'backend-engineering',
      'microservices',
      'event-driven-architecture',
      'kafka',
      'rabbitmq',
      'distributed-systems',
      'kubernetes',
      'multi-tenancy',
      'grpc',
      'observability'
    ]
  }
];

async function main() {
  if (!token) {
    console.error('Error: GitHub Personal Access Token is required as an argument or in GITHUB_TOKEN environment variable.');
    process.exit(1);
  }

  console.log('[DEPLOYMENT] Starting deployment of Backend Engineering Ecosystem to GitHub...');
  console.log(`[DEPLOYMENT] Target Account: ${GITHUB_USERNAME}`);
  console.log(`[DEPLOYMENT] Total Repositories to deploy: ${REPOSITORIES.length}\n`);

  for (const repo of REPOSITORIES) {
    console.log(`------------------------------------------------------------------------`);
    console.log(`[REPO] Processing: ${repo.name}`);

    // 1. Check if repo exists
    let exists = false;
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Node-Deploy-Agent'
        }
      });
      exists = res.status === 200;
    } catch (e) {
      console.log(`[INFO] Existence check notice: ${e.message}`);
    }

    // 2. Create if not exists
    if (!exists) {
      console.log(`[CREATE] Creating repository ${repo.name} on GitHub...`);
      try {
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Node-Deploy-Agent'
          },
          body: JSON.stringify({
            name: repo.name,
            description: repo.description,
            private: false,
            has_issues: true,
            has_projects: true,
            has_wiki: false
          })
        });
        if (createRes.status === 201) {
          console.log(`[SUCCESS] Repository ${repo.name} created successfully.`);
        } else {
          const err = await createRes.json();
          console.log(`[WARNING] Create status ${createRes.status}: ${err.message || 'Unknown'}`);
        }
      } catch (e) {
        console.error(`[ERROR] Failed to create repo ${repo.name}: ${e.message}`);
      }
    } else {
      console.log(`[EXISTS] Repository ${repo.name} already exists on GitHub.`);
      // Update description
      try {
        await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Node-Deploy-Agent'
          },
          body: JSON.stringify({
            description: repo.description
          })
        });
      } catch {}
    }

    // 3. Set Topics
    try {
      const topicRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/topics`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Node-Deploy-Agent'
        },
        body: JSON.stringify({ names: repo.topics })
      });
      if (topicRes.ok) {
        console.log(`[TOPICS] Configured ${repo.topics.length} topics for ${repo.name}.`);
      } else {
        const err = await topicRes.json();
        console.log(`[TOPICS] Notice: ${err.message}`);
      }
    } catch (e) {
      console.log(`[TOPICS] Error: ${e.message}`);
    }

    // 4. Push local git repo
    const repoPath = path.join(BASE, repo.name);
    try {
      const authRemote = `https://${GITHUB_USERNAME}:${token}@github.com/${GITHUB_USERNAME}/${repo.name}.git`;
      try { execSync('git remote remove origin', { cwd: repoPath, stdio: 'ignore' }); } catch {}
      execSync(`git remote add origin ${authRemote}`, { cwd: repoPath, stdio: 'ignore' });
      execSync('git push -u origin main --force', { cwd: repoPath, stdio: 'ignore' });
      execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/${repo.name}.git`, { cwd: repoPath, stdio: 'ignore' });
      console.log(`[PUSH] Pushed ${repo.name} to branch main.`);
      console.log(`[REMOTE] Cleaned origin remote to: https://github.com/${GITHUB_USERNAME}/${repo.name}.git`);
    } catch (e) {
      console.error(`[PUSH ERROR] ${repo.name}: ${e.message}`);
      // Ensure remote is cleaned regardless
      try { execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/${repo.name}.git`, { cwd: repoPath, stdio: 'ignore' }); } catch {}
    }
  }

  // 5. Push cross-linked repositories: EmaanHumayun & engineering-portfolio
  console.log(`\n------------------------------------------------------------------------`);
  console.log('[CROSS-LINKS] Synchronizing updated root profile and central engineering-portfolio...');
  for (const r of ['EmaanHumayun', 'engineering-portfolio']) {
    const p = path.join(BASE, r);
    try {
      const authRemote = `https://${GITHUB_USERNAME}:${token}@github.com/${GITHUB_USERNAME}/${r}.git`;
      try { execSync('git remote remove origin', { cwd: p, stdio: 'ignore' }); } catch {}
      execSync(`git remote add origin ${authRemote}`, { cwd: p, stdio: 'ignore' });
      execSync('git push -u origin main --force', { cwd: p, stdio: 'ignore' });
      execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/${r}.git`, { cwd: p, stdio: 'ignore' });
      console.log(`[SYNC] Pushed updated cross-links for ${r}. Clean remote restored.`);
    } catch (e) {
      console.error(`[SYNC ERROR] ${r}: ${e.message}`);
      try { execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/${r}.git`, { cwd: p, stdio: 'ignore' }); } catch {}
    }
  }

  console.log('\n========================================================================');
  console.log('   BACKEND ENGINEERING ECOSYSTEM DEPLOYED TO GITHUB SUCCESSFULLY');
  console.log('========================================================================');
  for (const repo of REPOSITORIES) {
    console.log(`   - https://github.com/${GITHUB_USERNAME}/${repo.name}`);
  }
  console.log('========================================================================\n');
}

main().catch(console.error);

