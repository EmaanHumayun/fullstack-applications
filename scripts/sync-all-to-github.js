import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_USERNAME = 'EmaanHumayun';

const REPOS_TO_SYNC = [
  {
    name: 'EmaanHumayun',
    description: 'Software Engineer | Backend & Full-Stack Development | DevOps & Automation',
    topics: ['software-engineering', 'backend', 'fullstack', 'devops', 'automation', 'cloud']
  },
  {
    name: 'engineering-portfolio',
    description: 'Central Engineering Portfolio & Architecture Hub | Master Navigation, Domain Indexes & Roadmaps',
    topics: ['portfolio', 'architecture', 'devops', 'backend', 'fullstack', 'cloud-native', 'engineering']
  },
  {
    name: 'devops-practice-labs',
    description: 'Production DevOps & Cloud Infrastructure Practice Labs (Linux, Docker, Kubernetes, Helm, Terraform, CI/CD, Observability)',
    topics: ['devops', 'kubernetes', 'docker', 'terraform', 'helm', 'bash', 'cicd', 'prometheus']
  },
  {
    name: 'devops-assignments-challenges',
    description: 'Production Systems Architecture Assignments, Case Studies, and System Design Submissions',
    topics: ['devops', 'aws', 'system-design', 'cloud-architecture', 'security', 'kubernetes']
  },
  {
    name: 'cloud-infrastructure-iac',
    description: 'Modular AWS Infrastructure as Code (Terraform & OpenTofu Multi-AZ VPC, Security, and CI Validation)',
    topics: ['terraform', 'opentofu', 'aws', 'iac', 'vpc', 'cloud-native', 'devops']
  },
  {
    name: 'fullstack-cloud-native-app',
    description: 'Full-Stack Cloud-Native Microservices Application (React, Node.js, Express, Docker, Kubernetes)',
    topics: ['fullstack', 'react', 'nodejs', 'express', 'docker', 'kubernetes', 'microservices']
  },
  {
    name: 'automation-engineering',
    description: 'Systems & Integration Automation Engineering (Bash Daemons, Python API Pipelines, Cron)',
    topics: ['automation', 'bash', 'python', 'cron', 'devops', 'scripting']
  },
  {
    name: 'data-analytics-portfolio',
    description: 'Data, SQL & Business Intelligence Engineering Portfolio (Cohort Analysis, Window Functions, Power BI)',
    topics: ['data-analytics', 'sql', 'postgresql', 'power-bi', 'business-intelligence']
  },
  {
    name: 'ai-automation-engineering',
    description: 'AI & Agentic Automation Engineering (Tool-Calling Loops, LLM API Integrations, Structured Outputs)',
    topics: ['artificial-intelligence', 'agentic-ai', 'python', 'llm', 'automation']
  }
];

async function main() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  console.log('========================================================================');
  console.log('   EMAAN HUMAYUN — CLEAN REPOSITORIES & SYNC (NO EMOJIS)');
  console.log('========================================================================\n');

  if (!token) {
    console.error('Error: GitHub Token required as first argument or GITHUB_TOKEN env variable.');
    process.exit(1);
  }

  const baseDir = path.join(__dirname, '..', 'github-ecosystem');

  for (const repo of REPOS_TO_SYNC) {
    console.log(`Processing: ${repo.name}`);

    // Update repository description (clean of emojis)
    try {
      const patchRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Node-Fetch'
        },
        body: JSON.stringify({
          description: repo.description
        })
      });
      if (patchRes.ok) {
        console.log(`  [METADATA] Clean description updated.`);
      }
    } catch (e) {
      console.log(`  [METADATA] Notice: ${e.message}`);
    }

    // Push local commits
    const localRepoPath = path.join(baseDir, repo.name);
    if (fs.existsSync(localRepoPath)) {
      try {
        const authRemote = `https://${GITHUB_USERNAME}:${token}@github.com/${GITHUB_USERNAME}/${repo.name}.git`;
        try { execSync('git remote remove origin', { cwd: localRepoPath, stdio: 'ignore' }); } catch {}
        execSync(`git remote add origin ${authRemote}`, { cwd: localRepoPath, stdio: 'ignore' });
        execSync('git push -u origin main --force', { cwd: localRepoPath, stdio: 'inherit' });
        execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/${repo.name}.git`, { cwd: localRepoPath, stdio: 'ignore' });
        console.log(`  [PUSH] Clean code synchronized to GitHub successfully.`);
      } catch (err) {
        console.error(`  [PUSH] Push error: ${err.message}`);
      }
    }
  }

  console.log('\n========================================================================');
  console.log('   ALL REPOSITORIES CLEANED & SYNCHRONIZED ON GITHUB!');
  console.log('========================================================================\n');
}

main().catch(console.error);
