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

if (!profileReadme.includes('devops-engineering-bootcamp')) {
  profileReadme = profileReadme.replace(
    '├── devops-practice-labs',
    '├── devops-engineering-bootcamp       # Comprehensive bootcamp curriculum, lecture notes & labs\n├── devops-practice-labs'
  );
  profileReadme = profileReadme.replace(
    '| [**`engineering-portfolio`**]',
    '| [**`devops-engineering-bootcamp`**](https://github.com/EmaanHumayun/devops-engineering-bootcamp) | DevOps Bootcamp Archive | Linux, CLI, Services, Scripting, Labs | `In Progress` |\n| [**`engineering-portfolio`**]'
  );
  fs.writeFileSync(profileReadmePath, profileReadme);
  try {
    execSync('git add README.md && git commit -m "docs: add devops-engineering-bootcamp to featured repositories"', { cwd: path.join(BASE, 'EmaanHumayun') });
    console.log('✅ Updated EmaanHumayun/README.md');
  } catch (e) {
    console.log('Notice EmaanHumayun:', e.message);
  }
}

// 2. Update engineering-portfolio/README.md
const hubReadmePath = path.join(BASE, 'engineering-portfolio', 'README.md');
let hubReadme = fs.readFileSync(hubReadmePath, 'utf8');

if (!hubReadme.includes('devops-engineering-bootcamp')) {
  hubReadme = hubReadme.replace(
    '• [`devops-practice-labs`]',
    '• [`devops-engineering-bootcamp`](https://github.com/EmaanHumayun/devops-engineering-bootcamp)<br/>• [`devops-practice-labs`]'
  );
  fs.writeFileSync(hubReadmePath, hubReadme);
  try {
    execSync('git add README.md && git commit -m "docs: add devops-engineering-bootcamp to central master directory"', { cwd: path.join(BASE, 'engineering-portfolio') });
    console.log('✅ Updated engineering-portfolio/README.md');
  } catch (e) {
    console.log('Notice engineering-portfolio:', e.message);
  }
}

