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
    name: 'ai-agent-engineering-hub',
    description: 'Central architectural hub, curriculum roadmap, concept index, and design guides for 20 progressive AI Agent and Agentic Systems engineering projects.',
    topics: [
      'ai-agents',
      'agentic-ai',
      'llm',
      'langgraph',
      'multi-agent-systems',
      'python',
      'pydantic',
      'rag',
      'function-calling',
      'ai-engineering'
    ]
  },
  {
    name: 'ai-agents-beginner-projects',
    description: 'Level 1 AI Agent Projects (01-05): Foundational LLM chat agents, deterministic tool calling, research extraction, SQLite task agents, and document RAG.',
    topics: [
      'ai-agents',
      'llm',
      'python',
      'pydantic',
      'tool-calling',
      'sqlite',
      'rag',
      'chromadb',
      'embeddings'
    ]
  },
  {
    name: 'ai-agents-intermediate-projects',
    description: 'Level 2 AI Agent Projects (06-10): Dual-tier memory (Postgres/Redis), Gmail OAuth agents, AST code assistants, hybrid search RAG, and API gateways.',
    topics: [
      'ai-agents',
      'fastapi',
      'postgresql',
      'redis',
      'oauth2',
      'hybrid-search',
      'reranking',
      'git-automation',
      'pgvector'
    ]
  },
  {
    name: 'ai-agents-advanced-projects',
    description: 'Level 3 AI Agent Projects (11-15): State-machine DAG planning, collaborative multi-agent research teams, SDLC agent collectives, text-to-SQL, and agent testing.',
    topics: [
      'ai-agents',
      'langgraph',
      'multi-agent-systems',
      'dag-planning',
      'text-to-sql',
      'evaluation',
      'opentelemetry',
      'state-machine'
    ]
  },
  {
    name: 'ai-agents-professional-projects',
    description: 'Level 4 AI Agent Projects (16-20): AIOps incident triage, multi-agent customer support, enterprise business operations, autonomous issue-to-PR agents, and enterprise gateways.',
    topics: [
      'ai-agents',
      'aiops',
      'kubernetes',
      'docker',
      'enterprise-ai',
      'multi-tenant',
      'rbac',
      'autonomous-agents',
      'observability'
    ]
  }
];

async function main() {
  if (!token) {
    console.error('Error: GitHub Personal Access Token is required.');
    process.exit(1);
  }

  console.log('[DEPLOYMENT] Starting deployment of AI Agent Engineering Ecosystem to GitHub...');
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
  console.log('   AI AGENT ENGINEERING ECOSYSTEM DEPLOYED TO GITHUB SUCCESSFULLY');
  console.log('========================================================================');
  for (const repo of REPOSITORIES) {
    console.log(`   - https://github.com/${GITHUB_USERNAME}/${repo.name}`);
  }
  console.log('========================================================================\n');
}

main().catch(console.error);

