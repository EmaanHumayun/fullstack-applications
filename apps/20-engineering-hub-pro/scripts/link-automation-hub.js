import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = path.join(__dirname, '..', 'github-ecosystem');

// 1. Update EmaanHumayun/README.md
const profileReadmePath = path.join(BASE, 'EmaanHumayun', 'README.md');
let profileReadme = fs.readFileSync(profileReadmePath, 'utf8');

if (!profileReadme.includes('automation-integration-hub')) {
  profileReadme = profileReadme.replace(
    '├── backend-engineering-hub',
    '├── automation-integration-hub       # Central 20-project progressive automation & integration ecosystem\n├── backend-engineering-hub'
  );
  profileReadme = profileReadme.replace(
    '| [**`backend-engineering-hub`**]',
    '| [**`automation-integration-hub`**](https://github.com/EmaanHumayun/automation-integration-hub) | Automation & Integration Ecosystem | 20 Projects, Webhooks, APIs, DevOps, AI | `Master Hub` |\n| [**`backend-engineering-hub`**]'
  );
  fs.writeFileSync(profileReadmePath, profileReadme);
  try {
    execSync('git add README.md && git commit -m "docs: add automation-integration-hub to featured portfolio repositories"', { cwd: path.join(BASE, 'EmaanHumayun') });
    console.log('Updated EmaanHumayun/README.md');
  } catch (e) {
    console.log('Notice EmaanHumayun:', e.message);
  }
}

// 2. Update engineering-portfolio/README.md
const hubReadmePath = path.join(BASE, 'engineering-portfolio', 'README.md');
let hubReadme = fs.readFileSync(hubReadmePath, 'utf8');

if (!hubReadme.includes('automation-integration-hub')) {
  hubReadme = hubReadme.replace(
    '• [`backend-engineering-hub`]',
    '• [`automation-integration-hub`](https://github.com/EmaanHumayun/automation-integration-hub)<br/>• [`backend-engineering-hub`]'
  );
  fs.writeFileSync(hubReadmePath, hubReadme);
  try {
    execSync('git add README.md && git commit -m "docs: add automation-integration-hub to central master directory"', { cwd: path.join(BASE, 'engineering-portfolio') });
    console.log('Updated engineering-portfolio/README.md');
  } catch (e) {
    console.log('Notice engineering-portfolio:', e.message);
  }
}

