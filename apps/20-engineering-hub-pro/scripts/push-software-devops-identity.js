import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.argv[2];
const GITHUB_USERNAME = 'EmaanHumayun';
const BASE = path.join(__dirname, '..', 'github-ecosystem');

async function main() {
  if (!token) {
    console.error('Token required');
    process.exit(1);
  }

  // Update bio via GitHub API
  try {
    const res = await fetch('https://api.github.com/user', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Node-Fetch'
      },
      body: JSON.stringify({
        bio: 'Software Engineer | DevOps Engineer · Application systems, cloud infrastructure & automation.',
        blog: 'https://github.com/EmaanHumayun/engineering-portfolio',
        location: 'Lahore, Pakistan'
      })
    });
    if (res.ok) console.log('✅ GitHub user bio updated successfully!');
  } catch (e) {
    console.log('Bio update error:', e.message);
  }

  // Update repo description for EmaanHumayun
  try {
    await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/EmaanHumayun`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Node-Fetch'
      },
      body: JSON.stringify({
        description: 'Software Engineer | DevOps Engineer · Profile README & Engineering Matrix'
      })
    });
  } catch {}

  // Push EmaanHumayun and engineering-portfolio
  ['EmaanHumayun', 'engineering-portfolio'].forEach(repo => {
    const p = path.join(BASE, repo);
    try {
      const authRemote = `https://${GITHUB_USERNAME}:${token}@github.com/${GITHUB_USERNAME}/${repo}.git`;
      try { execSync('git remote remove origin', { cwd: p, stdio: 'ignore' }); } catch {}
      execSync(`git remote add origin ${authRemote}`, { cwd: p, stdio: 'ignore' });
      execSync('git push -u origin main --force', { cwd: p, stdio: 'inherit' });
      execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/${repo}.git`, { cwd: p, stdio: 'ignore' });
      console.log(`✅ Pushed ${repo} to GitHub successfully!`);
    } catch (e) {
      console.error(`Error pushing ${repo}:`, e.message);
    }
  });
}

main().catch(console.error);

