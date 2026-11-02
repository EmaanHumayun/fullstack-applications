import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = path.join(__dirname, '..', 'github-ecosystem');

// Comprehensive emoji regex
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1FA00}-\u{1FAFF}]|[\u{1F000}-\u{1F02F}]|⚡|👋|🚀|🛠️|📋|☁️|⚙️|📊|🤖|📌|🧭|🏛️|🗺️|📂|📚|📈|🛡️|📬|🔒|👤|🏗️/gu;

// 1. EmaanHumayun/README.md
const profileReadme = `# Emaan Humayun

### Software Engineer | Backend & Full-Stack Development | DevOps & Automation

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/emaanmuhammadhumayun)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:emaanhumayun23072@gmail.com)
[![Engineering Hub](https://img.shields.io/badge/Hub-engineering--portfolio-1F2937?style=flat-square&logo=github&logoColor=white)](https://github.com/EmaanHumayun/engineering-portfolio)

---

## Professional Overview

Software Engineer focused on backend architecture, full-stack web applications, and modern cloud deployment workflows. My work centers on writing clean, maintainable code, designing deterministic REST APIs, containerizing microservices with Docker, and establishing structured continuous delivery pipelines.

I approach engineering from first principles: understanding operating system internals, networking layers, database transactions, and deployment topology before abstracting them with tools.

- **Primary Languages & Runtimes:** JavaScript (ES6+), TypeScript, Node.js, Python, Bash, SQL.
- **Infrastructure & Delivery:** Linux administration, Docker, Kubernetes, Terraform (IaC), GitHub Actions.
- **Current Development Focus:** Distributed backend systems, automated CI/CD validation gates, and container orchestration patterns.

---

## Engineering Ecosystem

All repositories, practice labs, architecture case studies, and documentation roadmaps are centrally cataloged in the **[Engineering Portfolio Hub](https://github.com/EmaanHumayun/engineering-portfolio)**.

\`\`\`text
EmaanHumayun/
├── engineering-portfolio             # Master directory, domain indexes, roadmaps
├── devops-practice-labs              # Hands-on labs (Linux, Docker, K8s, CI/CD, IaC)
├── devops-assignments-challenges     # Production scenario case studies & submissions
├── cloud-infrastructure-iac          # Modular Terraform / OpenTofu AWS blueprints
├── fullstack-cloud-native-app        # End-to-end React + Express + K8s application
├── automation-engineering            # Shell & Python automation daemons & API pipelines
├── data-analytics-portfolio          # SQL queries, analytics models & BI dashboards
└── 50-javascript-projects            # 50 foundational JS DOM & async implementations
\`\`\`

---

## Technical Competencies

### Languages & Runtime Environments
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Bash](https://img.shields.io/badge/-Bash-4EAA25?style=flat-square&logo=gnu-bash&logoColor=white)
![SQL](https://img.shields.io/badge/-SQL-CC292B?style=flat-square&logo=sqlite&logoColor=white)
![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

### Backend & API Architecture
- **Frameworks & Engines:** Node.js, Express.js
- **API Architecture:** RESTful APIs, JSON Schema validation, webhook event handlers, middleware pipelines
- **Authentication & Security:** JWT (JSON Web Tokens), bcrypt password hashing, Role-Based Access Control (RBAC)
- **Data Persistence:** PostgreSQL, MongoDB, query optimization, connection pooling

### Full-Stack & Frontend
- **Frontend Architecture:** React (v18+), Vite, Tailwind CSS, Component-driven design
- **State & Integration:** Client-side routing, custom hooks, Axios / Fetch API integration, accessible UX

### DevOps, Cloud & Automation (Active Development)
![Linux](https://img.shields.io/badge/-Linux-FCC624?style=flat-square&logo=linux&logoColor=black)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/-Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Terraform](https://img.shields.io/badge/-Terraform-844FBA?style=flat-square&logo=terraform&logoColor=white)
![AWS](https://img.shields.io/badge/-AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

- **Containerization:** Multi-stage builds, layer caching, Docker Compose multi-service topologies
- **Orchestration:** Kubernetes manifests (Deployments, Services, ConfigMaps, Secrets, Ingress, Probes)
- **Infrastructure as Code:** Terraform / OpenTofu (AWS VPC, Subnets, Internet Gateways, Security Groups)
- **Continuous Delivery:** GitHub Actions workflows, automated linting, test runners, container publishing
- **Systems & Networking:** Ubuntu / Debian, systemd services, cron daemons, TCP/IP, DNS, SSH key management

---

## Featured Repositories

| Repository | Discipline | Core Technologies | Status |
| :--- | :--- | :--- | :--- |
| [**\`engineering-portfolio\`**](https://github.com/EmaanHumayun/engineering-portfolio) | Central Engineering Hub | Architecture Specs, System Maps | \`Master Hub\` |
| [**\`fullstack-cloud-native-app\`**](https://github.com/EmaanHumayun/fullstack-cloud-native-app) | Full-Stack & Cloud-Native | React, Node.js, Docker, K8s | \`Active Development\` |
| [**\`devops-practice-labs\`**](https://github.com/EmaanHumayun/devops-practice-labs) | DevOps Practical Labs | Linux, Bash, Docker, K8s, CI/CD | \`In-Progress Labs\` |
| [**\`cloud-infrastructure-iac\`**](https://github.com/EmaanHumayun/cloud-infrastructure-iac) | Infrastructure as Code | Terraform, OpenTofu, AWS | \`Modular Blueprints\` |
| [**\`automation-engineering\`**](https://github.com/EmaanHumayun/automation-engineering) | Automation & Integrations | Bash Daemons, Python Sync | \`Active Scripts\` |
| [**\`50-javascript-projects\`**](https://github.com/EmaanHumayun/50-javascript-projects) | Frontend Foundations | Vanilla JavaScript, DOM, APIs | \`Completed Archive\` |

---

## Continuous Learning Roadmap

- [x] **Foundational Systems & Web:** Linux CLI, Git workflows, JavaScript ES6+, REST API development.
- [x] **Containerization & Scripting:** Docker image optimization, multi-container compose, Bash healthcheck daemons.
- [/] **Orchestration & Cloud:** Kubernetes resource lifecycle, Helm package management, Terraform AWS VPC modules.
- [ ] **Observability & SRE:** Prometheus metrics exposition, Grafana dashboards, zero-downtime release strategies.
- [ ] **Data & AI Pipelines:** SQL data transformation models, Python API automation, and agentic workflows.

---

## Professional Coordinates

- **Email:** [emaanhumayun23072@gmail.com](mailto:emaanhumayun23072@gmail.com)
- **LinkedIn:** [linkedin.com/in/emaanmuhammadhumayun](https://www.linkedin.com/in/emaanmuhammadhumayun)
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)
- **Portfolio Hub:** [Engineering Portfolio](https://github.com/EmaanHumayun/engineering-portfolio)
`;
fs.writeFileSync(path.join(BASE, 'EmaanHumayun', 'README.md'), profileReadme);

// 2. engineering-portfolio/README.md
const hubReadme = `# Central Engineering Portfolio & Architecture Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Maintainer: Emaan Humayun](https://img.shields.io/badge/Maintainer-Emaan%20Humayun-1F2937?style=flat-square&logo=github)](https://github.com/EmaanHumayun)
[![Architecture: Modular](https://img.shields.io/badge/Architecture-Modular%20Ecosystem-059669?style=flat-square)](#repository-ecosystem-matrix)

Central architectural hub and master navigation directory for all software engineering, cloud infrastructure, practice labs, and continuous learning repositories maintained by Emaan Humayun.

---

## Ecosystem Architecture

The engineering portfolio is partitioned into dedicated domain repositories. Each domain manages its own source code, configurations, tests, and implementation evidence.

\`\`\`mermaid
flowchart TD
    HUB["Central Engineering Hub<br/>engineering-portfolio"]

    D1["DevOps & Cloud Infrastructure<br/>devops-practice-labs & cloud-infrastructure-iac"]
    D2["Systems Architecture & Case Studies<br/>devops-assignments-challenges"]
    D3["Full-Stack & Cloud-Native<br/>fullstack-cloud-native-app"]
    D4["Frontend & Core JavaScript<br/>50-javascript-projects"]
    D5["Automation & Integrations<br/>automation-engineering"]
    D6["Data, BI & Analytics<br/>data-analytics-portfolio"]

    HUB --> D1
    HUB --> D2
    HUB --> D3
    HUB --> D4
    HUB --> D5
    HUB --> D6
\`\`\`

---

## Master Domain Directory

| Technical Domain | Primary Focus | Repositories & Modules | Status |
| :--- | :--- | :--- | :--- |
| **DevOps & Cloud** | Linux administration, Docker containerization, Kubernetes orchestration, Terraform IaC, GitHub Actions CI/CD | • [\`devops-practice-labs\`](https://github.com/EmaanHumayun/devops-practice-labs)<br/>• [\`cloud-infrastructure-iac\`](https://github.com/EmaanHumayun/cloud-infrastructure-iac) | \`Active Labs\` |
| **Architecture & Case Studies** | High availability VPC design, zero-downtime canary rollouts, secure supply-chain CI/CD | • [\`devops-assignments-challenges\`](https://github.com/EmaanHumayun/devops-assignments-challenges) | \`Case Studies\` |
| **Full-Stack Engineering** | Microservices, Node.js + Express REST APIs, React frontend, Docker compose, K8s manifests | • [\`fullstack-cloud-native-app\`](https://github.com/EmaanHumayun/fullstack-cloud-native-app) | \`Active App\` |
| **Core JavaScript & Web** | DOM manipulation, asynchronous algorithms, Fetch API integration, state management | • [\`50-javascript-projects\`](https://github.com/EmaanHumayun/50-javascript-projects) | \`Complete\` |
| **Automation & Tooling** | Bash server maintenance, Python API automation, cron job daemons, log parsers | • [\`automation-engineering\`](https://github.com/EmaanHumayun/automation-engineering) | \`In Progress\` |
| **Data & Analytics** | Relational SQL queries, data modeling, Power BI reports, exploratory analysis | • [\`data-analytics-portfolio\`](https://github.com/EmaanHumayun/data-analytics-portfolio) | \`In Progress\` |
| **AI & Emerging** | Tool-calling loops, LLM integrations, prompt engineering | • [\`ai-automation-engineering\`](https://github.com/EmaanHumayun/ai-automation-engineering) | \`Active\` |

---

## Featured Engineering Projects

### 1. [Full-Stack Cloud-Native Microservices Platform](https://github.com/EmaanHumayun/fullstack-cloud-native-app)
- **Problem Statement:** Engineering a production-oriented web platform with independent frontend/backend microservices, resilient containerization, and zero-downtime deployment capabilities.
- **Tech Stack:** React 18, Vite, Tailwind CSS, Node.js, Express.js, Docker, Kubernetes, GitHub Actions.
- **Key Deliverables:** Multi-stage distroless Dockerfiles, health check endpoints (\`/healthz\`, \`/metrics\`), declarative K8s manifests (Deployments, Services, ConfigMaps).

### 2. [Multi-AZ AWS Infrastructure as Code (Terraform)](https://github.com/EmaanHumayun/cloud-infrastructure-iac)
- **Problem Statement:** Declarative provisioning of a multi-tier, multi-AZ cloud network adhering to the principle of least privilege and strict network segmentation.
- **Tech Stack:** Terraform / OpenTofu, AWS (VPC, Public/Private Subnets, NAT Gateways, Security Groups).
- **Key Deliverables:** Reusable Terraform modules, remote state locking patterns, automated linting & plan validation workflows.

### 3. [DevOps Practice Labs Curriculum](https://github.com/EmaanHumayun/devops-practice-labs)
- **Problem Statement:** Hands-on mastery of fundamental DevOps tasks from Linux system administration to automated CI/CD and container orchestration.
- **Tech Stack:** Bash, Linux (Ubuntu/Debian), Docker, Kubernetes, Helm, Terraform, Prometheus.
- **Key Deliverables:** 8 structured modules with executable scripts, manifests, and step-by-step problem statements.

### 4. [50 JavaScript Projects Portfolio](https://github.com/EmaanHumayun/50-javascript-projects)
- **Problem Statement:** Mastering foundational client-side engineering, asynchronous JavaScript, event handling, and external API consumption without heavy frameworks.
- **Tech Stack:** Vanilla JavaScript (ES6+), Modern DOM API, CSS3, HTML5.
- **Key Deliverables:** 50 functional web applications demonstrating pure JavaScript capabilities.

---

## Practice Labs & Architecture Assignments Matrix

| Lab / Assignment | Domain | Key Architectural Concept | Artifacts |
| :--- | :--- | :--- | :--- |
| **[Lab 01: Linux & Bash Daemons](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-01-linux-automation)** | Systems | Automated log rotation, system health checks, cron triggers | Shell scripts, cron configs |
| **[Lab 02: Multi-Stage Docker](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-02-docker-containerization)** | Containers | Image footprint minimization, non-root user execution | Dockerfile, docker-compose.yml |
| **[Lab 03: Kubernetes Manifests](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-03-kubernetes-orchestration)** | Orchestration | Rolling updates, liveness/readiness probes, pod security | Deployment, Service, ConfigMap YAML |
| **[Lab 05: Terraform AWS Modules](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-05-terraform-opentofu-iac)** | IaC | Declarative resource provisioning, input variable validation | main.tf, variables.tf, outputs.tf |
| **[Lab 06: GitHub Actions CI](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-06-cicd-github-actions)** | CI/CD | Automated test runs, security scanning, artifact caching | ci-pipeline.yml |
| **[Assignment 01: Multi-AZ VPC](https://github.com/EmaanHumayun/devops-assignments-challenges)** | Architecture | High availability CIDR subnetting across 3 availability zones | IaC templates, network diagram |
| **[Assignment 02: Zero-Downtime Rollout](https://github.com/EmaanHumayun/devops-assignments-challenges)** | Deployment | Blue/Green deployment switching with zero customer interruption | Ingress routing & service switching |

---

## Engineering Roadmaps & Development Tracking

Track detailed learning goals and milestones across domains:
- **[DevOps & Cloud Engineering Roadmap 2026](./roadmaps/devops-roadmap-2026.md)**
- **[Backend & Distributed Systems Roadmap 2026](./roadmaps/backend-roadmap-2026.md)**

---

## Engineering Standards & Verification

All codebases within this portfolio follow strict engineering guidelines:
1. **Reproducibility:** Every repository includes step-by-step reproduction instructions and prerequisites.
2. **Security:** No hardcoded secrets, API tokens, or \`.env\` files. Automated \`.gitignore\` patterns for all environments.
3. **Authenticity:** All code represents actual hands-on implementations or documented learning exercises.
4. **Clean Git History:** Meaningful conventional commit messages (\`feat:\`, \`fix:\`, \`docs:\`, \`chore:\`).

---

## Professional Coordinates

- **Engineer:** Emaan Humayun
- **Specialization:** Software Engineer | Backend & Full-Stack | DevOps & Automation
- **Email:** [emaanhumayun23072@gmail.com](mailto:emaanhumayun23072@gmail.com)
- **LinkedIn:** [linkedin.com/in/emaanmuhammadhumayun](https://www.linkedin.com/in/emaanmuhammadhumayun)
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)
`;
fs.writeFileSync(path.join(BASE, 'engineering-portfolio', 'README.md'), hubReadme);

// Strip emojis from all remaining README and markdown files
function cleanFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  const cleaned = text.replace(emojiRegex, '').replace(/[ \t]+$/gm, '');
  if (cleaned !== text) {
    fs.writeFileSync(filePath, cleaned);
    console.log('Cleaned emojis from: ' + filePath.replace(BASE, ''));
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    if (file === '.git') return;
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full);
    } else if (file.endsWith('.md')) {
      cleanFile(full);
    }
  });
}

walkDir(BASE);

// Commit all repositories
const repos = fs.readdirSync(BASE).filter(d => fs.statSync(path.join(BASE, d)).isDirectory());
repos.forEach(repo => {
  const p = path.join(BASE, repo);
  if (fs.existsSync(path.join(p, '.git'))) {
    try {
      execSync('git add .', { cwd: p });
      execSync('git commit -m "docs: remove emojis for clean, professional engineering documentation and badges"', { cwd: p, stdio: 'ignore' });
      console.log('✅ Committed clean documentation in ' + repo);
    } catch {}
  }
});
console.log('Finished removing emojis across all repositories!');

