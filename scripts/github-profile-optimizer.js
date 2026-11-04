import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_USERNAME = 'EmaanHumayun';
const REPO_TO_KEEP = '50-javascript-projects';

const NEW_REPOS = [
  {
    name: 'EmaanHumayun',
    description: '⚡ Senior DevOps, SRE & Cloud Platform Architect Profile README | Emaan Humayun',
    topics: ['devops', 'sre', 'cloud-infrastructure', 'kubernetes', 'terraform', 'gitops', 'aws']
  },
  {
    name: 'devops-practice-labs',
    description: '🛠️ Production DevOps & Cloud Infrastructure Practice Labs (Linux, Docker, Kubernetes, Helm, Terraform, CI/CD, Observability)',
    topics: ['devops', 'kubernetes', 'docker', 'terraform', 'helm', 'bash', 'cicd', 'prometheus']
  },
  {
    name: 'devops-assignments-challenges',
    description: '📋 Production DevOps Architectural Assignments, Case Studies, and System Design Submissions',
    topics: ['devops', 'aws', 'system-design', 'cloud-architecture', 'security', 'kubernetes']
  },
  {
    name: 'cloud-infrastructure-iac',
    description: '☁️ Production Cloud Infrastructure as Code (Terraform & OpenTofu AWS Multi-AZ VPC, EKS, RDS, and GitOps)',
    topics: ['terraform', 'opentofu', 'aws', 'eks', 'iac', 'gitops', 'cloud-native']
  },
  {
    name: 'fullstack-cloud-native-app',
    description: '🚀 Enterprise Full-Stack Microservices Platform (React, Node.js, Docker, Kubernetes Manifests, Automated CI/CD)',
    topics: ['fullstack', 'react', 'nodejs', 'docker', 'kubernetes', 'microservices', 'cloud-native']
  }
];

async function main() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  console.log('========================================================================');
  console.log('   🚀 EMAAN HUMAYUN — GITHUB DEVOPS PROFILE & REPOS OPTIMIZER');
  console.log('========================================================================\n');

  // Fetch current repos from GitHub
  console.log(`[INFO] Fetching current repositories for @${GITHUB_USERNAME}...`);
  let currentRepos = [];
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, {
      headers: {
        'User-Agent': 'Node-Fetch',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    currentRepos = await res.json();
    if (!Array.isArray(currentRepos)) {
      throw new Error(currentRepos.message || 'Failed to list repos');
    }
  } catch (err) {
    console.error(`[ERROR] Could not fetch repositories: ${err.message}`);
    process.exit(1);
  }

  const toKeep = currentRepos.filter(r => r.name.toLowerCase() === REPO_TO_KEEP.toLowerCase());
  const toDelete = currentRepos.filter(r => r.name.toLowerCase() !== REPO_TO_KEEP.toLowerCase());

  console.log(`\n[CURRENT STATUS] Total Repositories Found: ${currentRepos.length}`);
  console.log(`  ✅ REPOSITORY TO KEEP (${toKeep.length}):`);
  toKeep.forEach(r => console.log(`     - ${r.name} (https://github.com/${GITHUB_USERNAME}/${r.name})`));

  console.log(`\n  🗑️ REPOSITORIES SCHEDULED FOR CLEANUP/DELETION (${toDelete.length}):`);
  toDelete.forEach((r, i) => console.log(`     ${i + 1}. ${r.name} ${r.fork ? '(Fork)' : ''}`));

  console.log(`\n  ✨ NEW DEVOPS REPOSITORIES TO BE CREATED & PUSHED (${NEW_REPOS.length}):`);
  NEW_REPOS.forEach((r, i) => console.log(`     ${i + 1}. ${r.name} — ${r.description}`));

  if (!token) {
    console.log('\n========================================================================');
    console.log('  ⚠️ GITHUB PERSONAL ACCESS TOKEN (PAT) REQUIRED TO COMPLETE ACTION');
    console.log('========================================================================');
    console.log('\nBecause deleting old repos and creating new ones requires administrative');
    console.log('authorization from GitHub, please follow these simple 30-second steps:');
    console.log('\n1. Open: https://github.com/settings/tokens/new');
    console.log('2. Note name: "DevOps Setup"');
    console.log('3. Check scopes:');
    console.log('   - [x] repo (Full control of private repositories & public repos)');
    console.log('   - [x] delete_repo (Delete repositories)');
    console.log('4. Click "Generate token" and copy it.');
    console.log('\n5. Run this command with your token:');
    console.log(`   node scripts/github-profile-optimizer.js YOUR_GITHUB_TOKEN\n`);
    console.log('========================================================================');
    return;
  }

  console.log('\n[AUTH] GitHub Token detected! Starting automated transformation...');

  // Step 1: Delete unwanted repos
  for (const repo of toDelete) {
    process.stdout.write(`[CLEANUP] Deleting ${repo.name}... `);
    try {
      const delRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Node-Fetch'
        }
      });
      if (delRes.status === 204 || delRes.status === 200) {
        console.log('✅ DELETED');
      } else {
        const errJson = await delRes.json().catch(() => ({}));
        console.log(`⚠️ Status ${delRes.status}: ${errJson.message || 'Could not delete'}`);
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
  }

  // Step 2: Create new repos & push code
  const baseDir = path.join(__dirname, '..', 'github-ecosystem');

  for (const newRepo of NEW_REPOS) {
    console.log(`\n[CREATE] Setting up repository: ${newRepo.name}...`);

    // Check if repo already exists
    const checkRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${newRepo.name}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Node-Fetch'
      }
    });

    if (checkRes.status === 404) {
      // Create it
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Node-Fetch'
        },
        body: JSON.stringify({
          name: newRepo.name,
          description: newRepo.description,
          private: false,
          has_issues: true,
          has_projects: true,
          has_wiki: false
        })
      });

      if (createRes.status === 201) {
        console.log(`   ✅ Created ${newRepo.name} on GitHub!`);
      } else {
        const err = await createRes.json();
        console.log(`   ⚠️ Failed to create ${newRepo.name}: ${err.message}`);
      }
    } else {
      console.log(`   ℹ️ Repository ${newRepo.name} already exists on GitHub.`);
    }

    // Set topics
    try {
      await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${newRepo.name}/topics`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Node-Fetch'
        },
        body: JSON.stringify({ names: newRepo.topics })
      });
      console.log(`   🏷️ Topics configured: ${newRepo.topics.join(', ')}`);
    } catch {}

    // Push local commits to GitHub
    const localPath = path.join(baseDir, newRepo.name);
    if (fs.existsSync(localPath)) {
      console.log(`   📤 Pushing code to https://github.com/${GITHUB_USERNAME}/${newRepo.name}...`);
      try {
        const remoteUrl = `https://${GITHUB_USERNAME}:${token}@github.com/${GITHUB_USERNAME}/${newRepo.name}.git`;
        try {
          execSync('git remote remove origin', { cwd: localPath, stdio: 'ignore' });
        } catch {}
        execSync(`git remote add origin ${remoteUrl}`, { cwd: localPath, stdio: 'ignore' });
        execSync('git push -u origin main --force', { cwd: localPath, stdio: 'inherit' });
        execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/${newRepo.name}.git`, { cwd: localPath, stdio: 'ignore' });
        console.log(`   🚀 Pushed successfully to main!`);
      } catch (e) {
        console.error(`   ❌ Failed to push ${newRepo.name}: ${e.message}`);
      }
    }
  }

  console.log('\n========================================================================');
  console.log('   🎉 PROFILE TRANSFORMATION COMPLETE!');
  console.log(`   View your updated GitHub profile: https://github.com/${GITHUB_USERNAME}`);
  console.log('========================================================================\n');
}

main().catch(console.error);

