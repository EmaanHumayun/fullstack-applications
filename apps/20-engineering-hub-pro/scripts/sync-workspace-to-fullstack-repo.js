import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.join(__dirname, '..');
const TARGET_APP_DIR = path.join(WORKSPACE_DIR, 'github-ecosystem', 'fullstack-applications', 'apps', '20-engineering-hub-pro');
const FULLSTACK_REPO_DIR = path.join(WORKSPACE_DIR, 'github-ecosystem', 'fullstack-applications');

console.log('[SYNC] Starting synchronization of Engineering Hub Pro to fullstack-applications...');

// 1. Ensure target directory
if (fs.existsSync(TARGET_APP_DIR)) {
  fs.rmSync(TARGET_APP_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TARGET_APP_DIR, { recursive: true });

// 2. Directories and files to exclude
const EXCLUDE = new Set([
  '.env',
  '.env.local',
  '.git',
  'node_modules',
  'dist',
  'github-ecosystem',
  'uploads',
  '.DS_Store'
]);

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (EXCLUDE.has(path.basename(src))) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (EXCLUDE.has(entry)) continue;
      // Do not copy any .env files
      if (entry === '.env' || (entry.startsWith('.env.') && entry !== '.env.example')) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else if (stat.isFile()) {
    const filename = path.basename(src);
    if (EXCLUDE.has(filename)) return;
    if (filename === '.env' || (filename.startsWith('.env.') && filename !== '.env.example')) {
      console.log(`[SKIP SECURE] Skipping ${src}`);
      return;
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('[COPY] Copying workspace project files into apps/20-engineering-hub-pro...');
const rootEntries = fs.readdirSync(WORKSPACE_DIR);
for (const entry of rootEntries) {
  if (EXCLUDE.has(entry)) continue;
  if (entry === '.env' || (entry.startsWith('.env.') && entry !== '.env.example')) {
    console.log(`[SKIP SECURE] Skipping ${entry}`);
    continue;
  }
  const srcPath = path.join(WORKSPACE_DIR, entry);
  const destPath = path.join(TARGET_APP_DIR, entry);
  copyRecursive(srcPath, destPath);
}

console.log('[VERIFY] Ensuring sanitized .env.example exists in target...');
const sanitizedEnvExample = `PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/engineering_hub?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@engineeringhub.pro
ADMIN_PASSWORD_HASH=$2a$10$YourBcryptHashedPasswordHere
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=certificates
MAX_UPLOAD_MB=10
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="Engineering Hub Pro" <notifications@engineeringhub.pro>
`;
fs.writeFileSync(path.join(TARGET_APP_DIR, '.env.example'), sanitizedEnvExample, 'utf8');

// Verify that no .env leaked
if (fs.existsSync(path.join(TARGET_APP_DIR, '.env'))) {
  fs.unlinkSync(path.join(TARGET_APP_DIR, '.env'));
  console.log('[SECURITY] Removed leaked .env file!');
}

// 3. Update fullstack-applications PROJECT-INDEX.md and README.md
const projectIndexPath = path.join(FULLSTACK_REPO_DIR, 'PROJECT-INDEX.md');
let projectIndex = fs.readFileSync(projectIndexPath, 'utf8');
if (!projectIndex.includes('apps/20-engineering-hub-pro')) {
  projectIndex = projectIndex.replace(
    '| **20. Personal Engineering Workspace** | Developer Platform | React 18, Express, Tailwind, SQLite | `Active Architecture` | [Workspace Spec](./apps/10-personal-engineering-workspace/) |',
    '| **20. Engineering Hub Pro** | Developer Platform & Headless CMS | React 18, Vite, Express, MongoDB, Tailwind, RBAC | `Completed & Verified` | [Application Source](./apps/20-engineering-hub-pro/) |'
  );
  fs.writeFileSync(projectIndexPath, projectIndex, 'utf8');
  console.log('[DOCS] Updated fullstack-applications/PROJECT-INDEX.md');
}

const fullstackReadmePath = path.join(FULLSTACK_REPO_DIR, 'README.md');
let fullstackReadme = fs.readFileSync(fullstackReadmePath, 'utf8');
if (!fullstackReadme.includes('Engineering Hub Pro')) {
  const showcaseSection = `
---

## Featured Flagship Application: Engineering Hub Pro (v2.0)

Located at [\`apps/20-engineering-hub-pro\`](./apps/20-engineering-hub-pro):

- **Architecture**: Decoupled React 18 single-page application with Express 4 backend and MongoDB Atlas persistence.
- **Key Modules**: Super Admin Control Center, RBAC authorization, Hierarchical Project DAG engine with cycle prevention, Headless CMS for site copy, Dynamic theme engine with CSS variable injection, XSS-safe native Markdown AST parser (\`SafeMarkdown\`), and multi-tier file storage.
- **Documentation**: Includes comprehensive [Architecture Guide](./apps/20-engineering-hub-pro/ARCHITECTURE.md), [Deployment Guide](./apps/20-engineering-hub-pro/DEPLOYMENT.md), [Implementation Status](./apps/20-engineering-hub-pro/IMPLEMENTATION-STATUS.md), [Security Policy](./apps/20-engineering-hub-pro/SECURITY.md), and [Testing Runbook](./apps/20-engineering-hub-pro/TESTING.md).
`;
  fullstackReadme = fullstackReadme.replace('## Application Portfolio Matrix', showcaseSection + '\n## Application Portfolio Matrix');
  fs.writeFileSync(fullstackReadmePath, fullstackReadme, 'utf8');
  console.log('[DOCS] Updated fullstack-applications/README.md with flagship application showcase.');
}

console.log('[GIT] Staging and committing in fullstack-applications...');
try {
  execSync('git add .', { cwd: FULLSTACK_REPO_DIR });
  execSync('git commit -m "feat(apps): add Engineering Hub Pro v2.0 full-stack application and technical documentation suite"', { cwd: FULLSTACK_REPO_DIR });
  console.log('[GIT] Committed successfully.');
} catch (e) {
  console.log('[GIT] Notice:', e.message);
}

console.log('[SYNC] Engineering Hub Pro sync complete.');
