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

if (!profileReadme.includes('backend-engineering-hub')) {
  profileReadme = profileReadme.replace(
    '├── devops-engineering-bootcamp',
    '├── backend-engineering-hub          # Central 20-project progressive backend architecture ecosystem\n├── devops-engineering-bootcamp'
  );
  profileReadme = profileReadme.replace(
    '| [**`fullstack-applications`**]',
    '| [**`backend-engineering-hub`**](https://github.com/EmaanHumayun/backend-engineering-hub) | Backend Engineering Ecosystem | 20 Projects, Node.js, Express, Microservices | `Master Hub` |\n| [**`fullstack-applications`**]'
  );
  fs.writeFileSync(profileReadmePath, profileReadme);
  try {
    execSync('git add README.md && git commit -m "docs: add backend-engineering-hub to featured portfolio repositories"', { cwd: path.join(BASE, 'EmaanHumayun') });
    console.log('✅ Updated EmaanHumayun/README.md');
  } catch (e) {
    console.log('Notice EmaanHumayun:', e.message);
  }
}

// 2. Update engineering-portfolio/README.md
const hubReadmePath = path.join(BASE, 'engineering-portfolio', 'README.md');
let hubReadme = fs.readFileSync(hubReadmePath, 'utf8');

if (!hubReadme.includes('backend-engineering-hub')) {
  hubReadme = hubReadme.replace(
    '• [`devops-engineering-bootcamp`]',
    '• [`backend-engineering-hub`](https://github.com/EmaanHumayun/backend-engineering-hub)<br/>• [`devops-engineering-bootcamp`]'
  );
  fs.writeFileSync(hubReadmePath, hubReadme);
  try {
    execSync('git add README.md && git commit -m "docs: add backend-engineering-hub to central master directory"', { cwd: path.join(BASE, 'engineering-portfolio') });
    console.log('✅ Updated engineering-portfolio/README.md');
  } catch (e) {
    console.log('Notice engineering-portfolio:', e.message);
  }
}

