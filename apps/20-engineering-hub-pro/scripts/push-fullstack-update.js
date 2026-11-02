import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.argv[2];
const GITHUB_USERNAME = 'EmaanHumayun';
const repoPath = path.join(__dirname, '..', 'github-ecosystem', 'fullstack-applications');

if (!token) {
  console.error('Token required');
  process.exit(1);
}

try {
  const authRemote = `https://${GITHUB_USERNAME}:${token}@github.com/${GITHUB_USERNAME}/fullstack-applications.git`;
  try { execSync('git remote remove origin', { cwd: repoPath, stdio: 'ignore' }); } catch {}
  execSync(`git remote add origin ${authRemote}`, { cwd: repoPath, stdio: 'ignore' });
  execSync('git push -u origin main --force', { cwd: repoPath, stdio: 'inherit' });
  execSync(`git remote set-url origin https://github.com/${GITHUB_USERNAME}/fullstack-applications.git`, { cwd: repoPath, stdio: 'ignore' });
  console.log('✅ Pushed updated fullstack-applications to GitHub successfully!');
} catch (e) {
  console.error('Push error:', e.message);
}

