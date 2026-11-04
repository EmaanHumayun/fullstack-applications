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
    name: 'automation-integration-hub',
    description: 'A comprehensive Automation and Integration Engineering roadmap featuring 20 progressive projects covering workflow automation, APIs, business integrations, DevOps automation, cloud automation and AI-powered systems.',
    topics: [
      'automation',
      'workflow-automation',
      'integration-engineering',
      'n8n',
      'python-automation',
      'api-integration',
      'webhooks',
      'business-automation',
      'devops-automation',
      'ci-cd',
      'ai-automation'
    ]
  },
  {
    name: 'automation-beginner-projects',
    description: 'Level 1 Automation Projects (01-05): Webhook triggers, Google Sheets sync, form processing, file lifecycle automation, and multi-API data integration.',
    topics: [
      'automation',
      'workflow-automation',
      'webhooks',
      'rest-api',
      'python',
      'nodejs',
      'google-sheets-api',
      'file-automation',
      'docker'
    ]
  },
  {
    name: 'automation-intermediate-projects',
    description: 'Level 2 Automation Projects (06-10): CRM lead workflows, e-commerce order automation, social publishing, support ticket dispatch, and payment reconciliation.',
    topics: [
      'automation',
      'integration-engineering',
      'crm-integration',
      'hubspot',
      'stripe-webhooks',
      'ecommerce-automation',
      'redis',
      'bullmq',
      'postgresql'
    ]
  },
  {
    name: 'automation-advanced-projects',
    description: 'Level 3 Automation Projects (11-15): Custom integration platform, DAG workflow orchestration, event-driven message architectures, ETL pipelines, and AI business systems.',
    topics: [
      'automation',
      'workflow-orchestration',
      'dag-engine',
      'event-driven',
      'rabbitmq',
      'etl-pipeline',
      'ai-automation',
      'llm-integration',
      'typescript'
    ]
  },
  {
    name: 'automation-professional-projects',
    description: 'Level 4 Automation Projects (16-20): DevOps infrastructure self-healing, CI/CD GitHub bots, cloud resource governance, multi-agent AI systems, and enterprise gateways.',
    topics: [
      'automation',
      'devops-automation',
      'github-actions',
      'infrastructure-automation',
      'cloud-automation',
      'kubernetes',
      'multi-agent-systems',
      'prometheus',
      'terraform'
    ]
  }
];

async function main() {
  if (!token) {
    console.error('Error: GitHub Personal Access Token is required.');
    process.exit(1);
  }

  console.log('[DEPLOYMENT] Starting deployment of Automation & Integration Ecosystem to GitHub...');
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
      try {
        await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Node-Deploy-Agent'
          },
          body: JSON.stringify({ description: repo.description })
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
  console.log('   AUTOMATION & INTEGRATION ECOSYSTEM DEPLOYED TO GITHUB SUCCESSFULLY');
  console.log('========================================================================');
  for (const repo of REPOSITORIES) {
    console.log(`   - https://github.com/${GITHUB_USERNAME}/${repo.name}`);
  }
  console.log('========================================================================\n');
}

main().catch(console.error);

