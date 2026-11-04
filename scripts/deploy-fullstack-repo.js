import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.argv[2];
const GITHUB_USERNAME = 'EmaanHumayun';
const BASE = path.join(__dirname, '..', 'github-ecosystem');

const REPO_NAME = 'fullstack-applications';
const REPO_DESC = 'A collection of end-to-end full-stack applications demonstrating modern frontend development, backend engineering, database design, API integrations, authentication, testing, and deployment.';
const REPO_TOPICS = [
  'fullstack-development',
  'fullstack-applications',
  'software-engineering',
  'react',
  'nodejs',
  'express',
  'javascript',
  'typescript',
  'mongodb',
  'postgresql',
  'rest-api',
  'web-development'
];

async function main() {
  if (!token) {
    console.error('Error: Token required as argument');
    process.exit(1);
  }

  console.log(`[FULLSTACK] Checking repository ${REPO_NAME} on GitHub...`);
  let exists = false;
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Node-Fetch'
      }
    });
    exists = res.status === 200;
  } catch {}

  if (!exists) {
    console.log(`[FULLSTACK] Creating ${REPO_NAME} on GitHub...`);
    try {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Node-Fetch'
        },
        body: JSON.stringify({
          name: REPO_NAME,
          description: REPO_DESC,
          private: false,
          has_issues: true,
          has_projects: true,
          has_wiki: false
        })
      });
      if (createRes.status === 201) {
        console.log(`✅ Created ${REPO_NAME} on GitHub!`);
      } else {
        const err = await createRes.json();
        console.log(`Notice: ${err.message}`);
      }
    } catch (e) {
      console.log('Error creating repo:', e.message);
    }
  } else {
    console.log(`Repository ${REPO_NAME} already exists.`);
  }

  // Set topics
  try {
    await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/topics`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Node-Fetch'
      },
      body: JSON.stringify({ names: REPO_TOPICS })
    });
    console.log('🏷️ Configured topics for fullstack-applications.');
  } catch {}

  // Push fullstack repo
  const repoPath = path.join(BASE, REPO_NAME);
  try {
    const authRemote = `https://${GITHUB_USERNAME}:${token}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git`;
    try { execSync('git remote remove origin', { cwd: repoPath, stdio: 'ignore' }); } catch {}
    execSync(`git remote add origin ${authRemote}`, { cwd: repoPath, stdio: 'ignore' });
    execSync('git push -u origin main --force', { cwd: repoPath, stdio: 'inherit' });
    execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git`, { cwd: repoPath, stdio: 'ignore' });
    console.log('🚀 Pushed fullstack-applications to GitHub successfully!');
  } catch (e) {
    console.error('Push error:', e.message);
  }

  // Push updated cross-links in EmaanHumayun & engineering-portfolio
  ['EmaanHumayun', 'engineering-portfolio'].forEach(r => {
    const p = path.join(BASE, r);
    try {
      const authRemote = `https://${GITHUB_USERNAME}:${token}@github.com/${GITHUB_USERNAME}/${r}.git`;
      try { execSync('git remote remove origin', { cwd: p, stdio: 'ignore' }); } catch {}
      execSync(`git remote add origin ${authRemote}`, { cwd: p, stdio: 'ignore' });
      execSync('git push -u origin main --force', { cwd: p, stdio: 'inherit' });
      execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/${r}.git`, { cwd: p, stdio: 'ignore' });
      console.log(`🚀 Synchronized cross-links for ${r} successfully!`);
    } catch (e) {
      console.error(`Push error in ${r}:`, e.message);
    }
  });

  console.log('\n========================================================================');
  console.log('   FULL-STACK APPLICATIONS REPOSITORY DEPLOYED SUCCESSFULLY!');
  console.log(`   Repository URL: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}`);
  console.log('========================================================================\n');
}

main().catch(console.error);

