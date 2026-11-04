import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = path.join(__dirname, '..', 'github-ecosystem');

// 1. EmaanHumayun/README.md
const profileReadme = `# Emaan Humayun

### Software Engineer | DevOps Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/emaanmuhammadhumayun)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:emaanhumayun23072@gmail.com)
[![Engineering Hub](https://img.shields.io/badge/Hub-engineering--portfolio-1F2937?style=flat-square&logo=github&logoColor=white)](https://github.com/EmaanHumayun/engineering-portfolio)

---

## Professional Profile

I am a Software Engineer and DevOps Engineer working across application development and modern infrastructure engineering. I build resilient backend systems and full-stack web applications while architecting the containerization, continuous integration, infrastructure as code, and operational deployment pipelines that support them.

My engineering philosophy is rooted in first principles: mastering operating system fundamentals, networking, database transaction mechanics, and immutable infrastructure before layering high-level tooling.

- **Software Engineering:** Backend architecture, deterministic REST APIs, asynchronous event processing, database modeling, and responsive web user interfaces.
- **DevOps Engineering:** Linux system administration, Docker containerization, Kubernetes workload orchestration, Terraform infrastructure provisioning, and automated CI/CD release engineering.
- **Automation & Integrations:** Background daemon scripting in Bash and Python, third-party webhook integrations, and automated operational pipelines.

---

## Engineering Ecosystem

All codebases, practice labs, architecture case studies, and documentation roadmaps are centrally cataloged in the **[Engineering Portfolio Hub](https://github.com/EmaanHumayun/engineering-portfolio)**.

\`\`\`text
EmaanHumayun/
├── engineering-portfolio             # Central architectural hub, domain matrix & roadmaps
├── devops-practice-labs              # Production DevOps labs (Linux, Docker, K8s, Helm, IaC, CI/CD)
├── devops-assignments-challenges     # Real-world scenario case studies & architectural submissions
├── cloud-infrastructure-iac          # Modular Terraform / OpenTofu AWS cloud blueprints
├── fullstack-cloud-native-app        # End-to-end React + Express + Docker + K8s application
├── automation-engineering            # Shell & Python automation daemons, log rotators, API sync
├── data-analytics-portfolio          # SQL queries, cohort retention models & BI dashboards
├── ai-automation-engineering         # Tool-calling agentic loops & LLM API integrations
└── 50-javascript-projects            # 50 foundational JS DOM & async algorithm implementations
\`\`\`

---

## Technical Competency Matrix

### Actively Built & Implemented (Core Toolchain)

![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/-Express.js-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/-React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Linux](https://img.shields.io/badge/-Linux-FCC624?style=flat-square&logo=linux&logoColor=black)
![Bash](https://img.shields.io/badge/-Bash-4EAA25?style=flat-square&logo=gnu-bash&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/-Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

- **Backend & REST APIs:** Express.js routing, middleware pipelines, JWT stateless authentication, bcrypt password hashing, Role-Based Access Control (RBAC), connection pooling.
- **Frontend & Full-Stack:** React 18, Vite, component state architecture, client-side routing, Axios / Fetch API integration, responsive interface design.
- **Containerization & Workflows:** Multi-stage Docker builds, layer caching optimization, multi-container Docker Compose networks, Git branching strategies.
- **Operating Systems & Scripting:** Ubuntu/Debian Linux administration, process monitoring, systemd services, cron job automation, automated backup and log rotation scripts.

### Developing & Lab-Verified Practices

![Kubernetes](https://img.shields.io/badge/-Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Helm](https://img.shields.io/badge/-Helm-0F1689?style=flat-square&logo=helm&logoColor=white)
![Terraform](https://img.shields.io/badge/-Terraform-844FBA?style=flat-square&logo=terraform&logoColor=white)
![AWS](https://img.shields.io/badge/-AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Prometheus](https://img.shields.io/badge/-Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white)

- **Container Orchestration:** Declarative Kubernetes manifests (Deployments, ClusterIP/NodePort Services, ConfigMaps, Secrets, Liveness/Readiness probes), Helm chart packaging and parameterization.
- **Infrastructure as Code (IaC):** Modular Terraform and OpenTofu definitions for AWS multi-AZ VPCs, public/private subnets, internet gateways, and security groups.
- **Cloud Infrastructure & Networking:** AWS network architecture, CIDR subnetting, egress NAT Gateways, TCP/IP, DNS troubleshooting, socket reachability diagnostics.
- **Observability & SRE:** Prometheus metrics exposition (\`/metrics\` endpoints), scraping configurations, threshold-based alerting rules.

### Automation & Systems Integration

- **Operational Automation:** Python scripts with exponential backoff retries, JSON schema transformations, server health monitoring daemons.
- **Webhooks & APIs:** Event-driven HTTP webhook listeners, signature verification, REST data synchronization.
- **Emerging & AI Workflows:** First-principles tool-calling agent loops, schema-constrained prompt engineering, LLM API consumption.

---

## Featured Repositories

| Repository | Engineering Discipline | Key Technologies | Status |
| :--- | :--- | :--- | :--- |
| [**\`engineering-portfolio\`**](https://github.com/EmaanHumayun/engineering-portfolio) | Central Engineering Hub | Architectural Maps, Domain Indexes | \`Master Hub\` |
| [**\`fullstack-cloud-native-app\`**](https://github.com/EmaanHumayun/fullstack-cloud-native-app) | Full-Stack & Cloud-Native | React, Express, Docker, Kubernetes | \`Production Architecture\` |
| [**\`devops-practice-labs\`**](https://github.com/EmaanHumayun/devops-practice-labs) | DevOps Practice Curriculum | Linux, Docker, K8s, Helm, IaC, CI/CD | \`Active Labs\` |
| [**\`cloud-infrastructure-iac\`**](https://github.com/EmaanHumayun/cloud-infrastructure-iac) | Infrastructure as Code | Terraform, OpenTofu, AWS VPC & Security | \`Modular Blueprints\` |
| [**\`devops-assignments-challenges\`**](https://github.com/EmaanHumayun/devops-assignments-challenges) | Systems Architecture & Design | Multi-AZ VPC, Canary Deployments, DevSecOps | \`Case Studies\` |
| [**\`automation-engineering\`**](https://github.com/EmaanHumayun/automation-engineering) | Automation & Integrations | Bash Daemons, Python Sync, Cron | \`Active Scripts\` |
| [**\`50-javascript-projects\`**](https://github.com/EmaanHumayun/50-javascript-projects) | Frontend & Algorithm Basics | Vanilla JavaScript, DOM API, Async JS | \`Completed Portfolio\` |

---

## Professional Coordinates

- **Email:** [emaanhumayun23072@gmail.com](mailto:emaanhumayun23072@gmail.com)
- **LinkedIn:** [linkedin.com/in/emaanmuhammadhumayun](https://www.linkedin.com/in/emaanmuhammadhumayun)
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)
- **Engineering Hub:** [Engineering Portfolio](https://github.com/EmaanHumayun/engineering-portfolio)
`;

fs.writeFileSync(path.join(BASE, 'EmaanHumayun', 'README.md'), profileReadme);

// 2. engineering-portfolio/README.md
const hubPath = path.join(BASE, 'engineering-portfolio', 'README.md');
let hubContent = fs.readFileSync(hubPath, 'utf8');
hubContent = hubContent.replace(
  'Software Engineer | Backend & Full-Stack | DevOps & Automation',
  'Software Engineer | DevOps Engineer'
);
fs.writeFileSync(hubPath, hubContent);

// Commit in both repos
['EmaanHumayun', 'engineering-portfolio'].forEach(repo => {
  const p = path.join(BASE, repo);
  try {
    execSync('git add .', { cwd: p });
    execSync('git commit -m "docs: establish combined Software Engineer and DevOps Engineer identity and competency matrix"', { cwd: p, stdio: 'ignore' });
    console.log(`✅ Committed in ${repo}`);
  } catch (e) {
    console.log(`Notice in ${repo}: ${e.message}`);
  }
});

