import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '..', 'github-ecosystem');
const repos = [
  'EmaanHumayun',
  'devops-practice-labs',
  'devops-assignments-challenges',
  'cloud-infrastructure-iac',
  'fullstack-cloud-native-app'
];

repos.forEach(repoName => {
  const repoPath = path.join(baseDir, repoName);
  if (fs.existsSync(repoPath)) {
    console.log(`[GIT] Initializing repository: ${repoName}`);
    try {
      execSync('git init -b main', { cwd: repoPath, stdio: 'inherit' });
      execSync('git config user.name "EmaanHumayun"', { cwd: repoPath, stdio: 'inherit' });
      execSync('git config user.email "emaanhumayun23072@gmail.com"', { cwd: repoPath, stdio: 'inherit' });
      execSync('git add -A', { cwd: repoPath, stdio: 'inherit' });
      execSync('git commit -m "feat: initial production engineering setup"', { cwd: repoPath, stdio: 'inherit' });
      console.log(`[SUCCESS] Initialized and committed ${repoName}\n`);
    } catch (e) {
      console.error(`[ERROR] Failed to commit ${repoName}:`, e.message);
    }
  }
});
