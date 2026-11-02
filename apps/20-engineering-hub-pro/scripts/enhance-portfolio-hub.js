import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = path.join(__dirname, '..', 'github-ecosystem');
const hubPath = path.join(BASE, 'engineering-portfolio', 'README.md');

let content = fs.readFileSync(hubPath, 'utf8');

// Update mermaid diagram to include the two hubs
const oldMermaid = `    D5["Automation & Integrations<br/>automation-engineering"]
    D6["Data, BI & Analytics<br/>data-analytics-portfolio"]

    HUB --> D1
    HUB --> D2
    HUB --> D3
    HUB --> D4
    HUB --> D5
    HUB --> D6`;

const newMermaid = `    D5["Backend Architecture & Systems<br/>backend-engineering-hub"]
    D6["Automation & Integration Engineering<br/>automation-integration-hub"]
    D7["DevOps Bootcamp & Practice<br/>devops-engineering-bootcamp & devops-practice-labs"]
    D8["Full-Stack Applications<br/>fullstack-applications & fullstack-cloud-native-app"]

    HUB --> D1
    HUB --> D2
    HUB --> D3
    HUB --> D4
    HUB --> D5
    HUB --> D6
    HUB --> D7
    HUB --> D8`;

if (content.includes(oldMermaid)) {
  content = content.replace(oldMermaid, newMermaid);
}

fs.writeFileSync(hubPath, content);
console.log('Updated engineering-portfolio/README.md architecture diagram.');

try {
  execSync('git add README.md && git commit -m "docs: expand architecture topology diagram to include backend and automation hubs"', {
    cwd: path.join(BASE, 'engineering-portfolio')
  });
  console.log('Committed engineering-portfolio updates.');
} catch (e) {
  console.log('Notice:', e.message);
}

