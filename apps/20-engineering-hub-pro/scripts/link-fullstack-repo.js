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

if (!profileReadme.includes('fullstack-applications')) {
  profileReadme = profileReadme.replace(
    '├── fullstack-cloud-native-app',
    '├── fullstack-applications            # Scalable monorepo of complete production web apps\n├── fullstack-cloud-native-app'
  );
  profileReadme = profileReadme.replace(
    '| [**`fullstack-cloud-native-app`**]',
    '| [**`fullstack-applications`**](https://github.com/EmaanHumayun/fullstack-applications) | Full-Stack Applications Portfolio | React, Node.js, Express, Postgres, Docker | `Active Monorepo` |\n| [**`fullstack-cloud-native-app`**]'
  );
  fs.writeFileSync(profileReadmePath, profileReadme);
  try {
    execSync('git add README.md && git commit -m "docs: add fullstack-applications to featured portfolio repositories"', { cwd: path.join(BASE, 'EmaanHumayun') });
    console.log('✅ Updated EmaanHumayun/README.md');
  } catch (e) {
    console.log('Notice EmaanHumayun:', e.message);
  }
}

// 2. Update engineering-portfolio/README.md
const hubReadmePath = path.join(BASE, 'engineering-portfolio', 'README.md');
let hubReadme = fs.readFileSync(hubReadmePath, 'utf8');

if (!hubReadme.includes('fullstack-applications')) {
  hubReadme = hubReadme.replace(
    '• [`fullstack-cloud-native-app`]',
    '• [`fullstack-applications`](https://github.com/EmaanHumayun/fullstack-applications)<br/>• [`fullstack-cloud-native-app`]'
  );
  fs.writeFileSync(hubReadmePath, hubReadme);
  try {
    execSync('git add README.md && git commit -m "docs: add fullstack-applications to central master directory"', { cwd: path.join(BASE, 'engineering-portfolio') });
    console.log('✅ Updated engineering-portfolio/README.md');
  } catch (e) {
    console.log('Notice engineering-portfolio:', e.message);
  }
}

