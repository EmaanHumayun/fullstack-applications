import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUB_DIR = path.join(__dirname, '..', 'github-ecosystem', 'engineering-portfolio');

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

ensureDir(HUB_DIR);
ensureDir(path.join(HUB_DIR, 'domains'));
ensureDir(path.join(HUB_DIR, 'roadmaps'));

const README_CONTENT = `# Central Engineering Portfolio & Architecture Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Maintained by](https://img.shields.io/badge/Maintainer-Emaan%20Humayun-6f1d1b)](https://github.com/EmaanHumayun)
[![Ecosystem](https://img.shields.io/badge/Architecture-Modular%20Ecosystem-emerald)](#repository-ecosystem-matrix)

Welcome to the central architectural hub of my engineering portfolio. This repository serves as the master navigation index, technical documentation directory, and structural map for all my codebases, practice labs, architecture case studies, and continuous learning roadmaps.

---

## 🏛️ Engineering Ecosystem Architecture

The engineering ecosystem is partitioned into dedicated domain repositories. Each domain maintains its own source code, testing configurations, CI/CD pipelines, and practical implementation evidence.

\`\`\`mermaid
flowchart TD
    HUB["🏛️ Central Engineering Hub<br/>(engineering-portfolio)"]

    D1["☁️ DevOps & Cloud Infrastructure<br/>(devops-practice-labs & cloud-infrastructure-iac)"]
    D2["⚙️ Systems Architecture & Case Studies<br/>(devops-assignments-challenges)"]
    D3["🚀 Full-Stack & Cloud-Native<br/>(fullstack-cloud-native-app)"]
    D4["⚡ Frontend & Core JavaScript<br/>(50-javascript-projects)"]
    D5["🤖 Automation & Integrations<br/>(automation-engineering)"]
    D6["📊 Data, BI & Analytics<br/>(data-analytics-portfolio)"]

    HUB --> D1
    HUB --> D2
    HUB --> D3
    HUB --> D4
    HUB --> D5
    HUB --> D6
\`\`\`

---

## 🗺️ Master Domain Directory

| Technical Domain | Primary Focus | Repositories & Modules | Status |
| :--- | :--- | :--- | :--- |
| **DevOps & Cloud** | Linux administration, Docker containerization, Kubernetes orchestration, Terraform IaC, GitHub Actions CI/CD | • [\`devops-practice-labs\`](https://github.com/EmaanHumayun/devops-practice-labs)<br/>• [\`cloud-infrastructure-iac\`](https://github.com/EmaanHumayun/cloud-infrastructure-iac) | \`Active Labs\` |
| **Architecture & Case Studies** | High availability VPC design, zero-downtime canary rollouts, secure supply-chain CI/CD | • [\`devops-assignments-challenges\`](https://github.com/EmaanHumayun/devops-assignments-challenges) | \`Case Studies\` |
| **Full-Stack Engineering** | Microservices, Node.js + Express REST APIs, React frontend, Docker compose, K8s manifests | • [\`fullstack-cloud-native-app\`](https://github.com/EmaanHumayun/fullstack-cloud-native-app) | \`Active App\` |
| **Core JavaScript & Web** | DOM manipulation, asynchronous algorithms, Fetch API integration, state management | • [\`50-javascript-projects\`](https://github.com/EmaanHumayun/50-javascript-projects) | \`Complete\` |
| **Automation & Tooling** | Bash server maintenance, Python API automation, cron job daemons, log parsers | • [\`automation-engineering\`](./domains/automation-integrations.md) | \`In Progress\` |
| **Data & Analytics** | Relational SQL queries, data modeling, Power BI reports, exploratory analysis | • [\`data-analytics-portfolio\`](./domains/data-and-bi.md) | \`Planned\` |

---

## 📂 Featured Engineering Projects

### 1. [Full-Stack Cloud-Native Microservices Platform](https://github.com/EmaanHumayun/fullstack-cloud-native-app)
- **Problem Statement:** Engineering a production-oriented web platform with independent frontend/backend microservices, resilient containerization, and zero-downtime deployment capabilities.
- **Tech Stack:** React 18, Vite, Tailwind CSS, Node.js, Express.js, Docker, Kubernetes, GitHub Actions.
- **Key Deliverables:** Multi-stage distroless Dockerfiles, health check endpoints (\`/healthz\`, \`/metrics\`), declarative K8s manifests (Deployments, Services, ConfigMaps).

### 2. [Multi-AZ AWS Infrastructure as Code (Terraform)](https://github.com/EmaanHumayun/cloud-infrastructure-iac)
- **Problem Statement:** Declarative provisioning of a multi-tier, multi-AZ cloud network adhering to the principle of least privilege and strict network segmentation.
- **Tech Stack:** Terraform / OpenTofu, AWS (VPC, Public/Private Subnets, NAT Gateways, EKS cluster prerequisites).
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

## 📚 Practice Labs & Architecture Assignments Matrix

| Lab / Assignment | Domain | Key Architectural Concept | Artifacts |
| :--- | :--- | :--- | :--- |
| **[Lab 01: Linux & Bash Daemons](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-01-linux-automation)** | Systems | Automated log rotation, system health checks, cron triggers | Shell scripts, cron configs |
| **[Lab 02: Multi-Stage Docker](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-02-docker-containerization)** | Containers | Image footprint minimization, non-root user execution | Dockerfile, docker-compose.yml |
| **[Lab 03: Kubernetes Manifests](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-03-kubernetes-orchestration)** | Orchestration | Rolling updates, liveness/readiness probes, pod security | Deployment, Service, ConfigMap YAML |
| **[Lab 05: Terraform AWS Modules](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-05-terraform-opentofu-iac)** | IaC | Declarative resource provisioning, input variable validation | main.tf, variables.tf, outputs.tf |
| **[Lab 06: GitHub Actions CI](https://github.com/EmaanHumayun/devops-practice-labs/tree/main/module-06-cicd-github-actions)** | CI/CD | Automated test runs, security scanning, artifact caching | .github/workflows/ci-pipeline.yml |
| **[Assignment 01: Multi-AZ VPC](https://github.com/EmaanHumayun/devops-assignments-challenges)** | Architecture | High availability CIDR subnetting across 3 availability zones | IaC templates, network diagram |
| **[Assignment 02: Zero-Downtime Rollout](https://github.com/EmaanHumayun/devops-assignments-challenges)** | Deployment | Blue/Green deployment switching with zero customer interruption | Ingress routing & service switching |

---

## 📈 Engineering Roadmaps & Development Tracking

Track detailed learning goals and milestones across domains:
- **[DevOps & Cloud Engineering Roadmap 2026](./roadmaps/devops-roadmap-2026.md)**
- **[Backend & Distributed Systems Roadmap 2026](./roadmaps/backend-roadmap-2026.md)**

---

## 🛡️ Engineering Standards & Verification

All codebases within this portfolio follow strict engineering guidelines:
1. **Reproducibility:** Every repository includes step-by-step reproduction instructions and prerequisites.
2. **Security:** No hardcoded secrets, API tokens, or \`.env\` files. Automated \`.gitignore\` patterns for all environments.
3. **Authenticity:** All code represents actual hands-on implementations or documented learning exercises.
4. **Clean Git History:** Meaningful conventional commit messages (\`feat:\`, \`fix:\`, \`docs:\`, \`chore:\`).

---

## 📬 Contact & Coordinates

- **Engineer:** Emaan Humayun
- **Specialization:** Software Engineer | Backend & Full-Stack | DevOps & Automation
- **Email:** [emaanhumayun23072@gmail.com](mailto:emaanhumayun23072@gmail.com)
- **LinkedIn:** [linkedin.com/in/emaanmuhammadhumayun](https://www.linkedin.com/in/emaanmuhammadhumayun)
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)

---
<div align="center">
  <sub>Maintained transparently as a live engineering portfolio.</sub>
</div>
`;

fs.writeFileSync(path.join(HUB_DIR, 'README.md'), README_CONTENT);

const CONTRIBUTING_CONTENT = `# Contributing & Engineering Guidelines

This repository and its sub-domains serve as a personal engineering portfolio and open-source learning resource.

## Guidelines
1. Issues and suggestions for improving architectural documentation or fixing bugs in lab scripts are welcome.
2. Please open an issue detailing any broken links, typo fixes, or suggested curriculum improvements.
3. Code submissions should follow conventional commit specifications and include clear test instructions.
`;
fs.writeFileSync(path.join(HUB_DIR, 'CONTRIBUTING.md'), CONTRIBUTING_CONTENT);

const LICENSE_CONTENT = `MIT License

Copyright (c) 2026 Emaan Humayun

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
fs.writeFileSync(path.join(HUB_DIR, 'LICENSE'), LICENSE_CONTENT);

const GITIGNORE_CONTENT = `node_modules/
.env
.env.*
*.log
.DS_Store
Thumbs.db
dist/
build/
coverage/
.terraform/
*.tfstate*
`;
fs.writeFileSync(path.join(HUB_DIR, '.gitignore'), GITIGNORE_CONTENT);

// Domain 1: DevOps & Cloud
fs.writeFileSync(path.join(HUB_DIR, 'domains', 'devops-and-cloud.md'), `# DevOps & Cloud Infrastructure Domain

## Scope & Purpose
The DevOps domain covers modern infrastructure automation, system administration, containerization, cloud networking, and continuous delivery.

## Key Repositories
1. [\`devops-practice-labs\`](https://github.com/EmaanHumayun/devops-practice-labs)
   - 8 structured modules spanning Linux, Docker, Kubernetes, Helm, Terraform, CI/CD, and Observability.
2. [\`cloud-infrastructure-iac\`](https://github.com/EmaanHumayun/cloud-infrastructure-iac)
   - Modular Terraform and OpenTofu infrastructure blueprints for AWS multi-AZ VPC, EKS, and IAM.
3. [\`devops-assignments-challenges\`](https://github.com/EmaanHumayun/devops-assignments-challenges)
   - Production scenario case studies and architecture writeups.

## Core Toolchain
- **Operating Systems:** Ubuntu 22.04 LTS, Debian Linux
- **Containers:** Docker, Docker Compose, Multi-stage builds
- **Orchestration:** Kubernetes (v1.28+), Helm (v3+)
- **IaC:** Terraform (v1.7+), OpenTofu
- **CI/CD:** GitHub Actions
- **Scripting:** Bash, Python 3.11+
`);

// Domain 2: Backend Engineering
fs.writeFileSync(path.join(HUB_DIR, 'domains', 'backend-engineering.md'), `# Backend Engineering Domain

## Scope & Purpose
Focuses on scalable server-side systems, deterministic RESTful APIs, database transactions, authentication mechanisms, and software testing.

## Key Principles
- **Clean Architecture:** Separation of routing, business logic (services), and data access layers (models).
- **Authentication:** Stateless JWT authentication, secure HTTP-only cookies, password hashing with bcrypt.
- **Data Integrity:** Schema validation, input sanitization, and structured error handling middleware.
- **Observability:** Structured JSON request logging, HTTP error tracking, health check endpoints.

## Primary Technologies
- Node.js, Express.js
- Python (FastAPI / Flask fundamentals)
- PostgreSQL, MongoDB
- Jest, Supertest (API testing)
`);

// Domain 3: Full-Stack Development
fs.writeFileSync(path.join(HUB_DIR, 'domains', 'fullstack-development.md'), `# Full-Stack Development Domain

## Scope & Purpose
Building complete, end-to-end web applications combining robust server-side APIs with intuitive, accessible user interfaces.

## Key Repositories
1. [\`fullstack-cloud-native-app\`](https://github.com/EmaanHumayun/fullstack-cloud-native-app)
   - Microservices platform combining React, Express, Docker, and Kubernetes manifests.
2. [\`50-javascript-projects\`](https://github.com/EmaanHumayun/50-javascript-projects)
   - 50 vanilla JavaScript implementations highlighting core DOM algorithms and browser APIs.

## Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Persistence:** MongoDB / PostgreSQL
- **Packaging:** Multi-stage Docker containers
`);

// Domain 4: Automation & Integrations
fs.writeFileSync(path.join(HUB_DIR, 'domains', 'automation-integrations.md'), `# Automation & Integration Engineering Domain

## Scope & Purpose
Automating repetitive system maintenance tasks, data synchronization across external APIs, and event-driven webhook processing.

## Current Projects & Labs
- Automated backup & S3 replication scripts
- Server health check and alerting daemons (CPU, Memory, Disk thresholds)
- Log rotation and archival pipelines
- Webhook ingestion services with HMAC signature verification
`);

// Domain 5: Data, BI & Analytics
fs.writeFileSync(path.join(HUB_DIR, 'domains', 'data-and-bi.md'), `# Data, BI & Analytics Domain

## Scope & Purpose
Structured data querying, relational database design, exploratory data analysis, and business intelligence dashboards.

## Competencies & Tools
- **Relational Databases:** SQL queries, complex joins, CTEs, indexing strategies.
- **Business Intelligence:** Microsoft Power BI dashboard development, DAX calculations, KPI cards.
- **Python Data Stack:** Pandas, NumPy, Matplotlib for data cleaning and statistical summaries.
`);

// Domain 6: AI & Emerging Tech
fs.writeFileSync(path.join(HUB_DIR, 'domains', 'ai-and-emerging.md'), `# Artificial Intelligence & Agentic AI Domain

## Scope & Purpose
Exploring modern AI integrations, Large Language Model APIs, prompt engineering patterns, and autonomous agent workflows.

## Focus Areas
- Python LLM integrations (Gemini API, OpenAI SDK)
- Function-calling and tool-use agentic architectures
- Automated data extraction and semantic search
`);

// Roadmaps
fs.writeFileSync(path.join(HUB_DIR, 'roadmaps', 'devops-roadmap-2026.md'), `# DevOps & Cloud Engineering Roadmap (2026)

| Milestone | Objective | Key Deliverable | Status |
| :--- | :--- | :--- | :--- |
| **M1: Linux & Scripting** | Mastery of Linux internals, file permissions, systemd, and cron | Automated health check and backup shell daemons | \`Completed\` |
| **M2: Containerization** | Docker multi-stage builds, non-root execution, Docker Compose | Production-ready multi-service container manifests | \`Completed\` |
| **M3: Orchestration** | Kubernetes Deployments, Services, ConfigMaps, Ingress | Declarative K8s manifests & local cluster testing | \`In Progress\` |
| **M4: Infrastructure as Code** | Terraform AWS modules, state locking, multi-AZ VPC | Validated Terraform configuration templates | \`In Progress\` |
| **M5: CI/CD & Delivery** | GitHub Actions workflows, test gates, container registry publish | Automated build and verification pipelines | \`In Progress\` |
| **M6: Observability & SRE** | Prometheus metric scraping, Grafana alerts, distributed tracing | Service health telemetry and dashboards | \`Planned\` |
`);

fs.writeFileSync(path.join(HUB_DIR, 'roadmaps', 'backend-roadmap-2026.md'), `# Backend Engineering Roadmap (2026)

| Milestone | Objective | Key Deliverable | Status |
| :--- | :--- | :--- | :--- |
| **M1: REST API Foundations** | Express routing, middleware chains, JSON schema validation | RESTful API service with standard error handling | \`Completed\` |
| **M2: Authentication & Security** | JWT lifecycle, bcrypt password hashing, RBAC middleware | Secure auth service with refresh token rotation | \`Completed\` |
| **M3: Database Architecture** | Relational & Document modeling, connection pooling, indexing | Optimized database schema and query layer | \`In Progress\` |
| **M4: Automated Testing** | Unit and integration testing with Jest & Supertest | Automated test suites with >80% code coverage | \`In Progress\` |
| **M5: Microservices & Messaging** | Decoupled services, event-driven webhooks, message queues | Asynchronous task processing pipeline | \`Planned\` |
`);

// Initialize git repository
try {
  execSync('git init -b main', { cwd: HUB_DIR, stdio: 'inherit' });
  execSync('git config user.name "EmaanHumayun"', { cwd: HUB_DIR });
  execSync('git config user.email "emaanhumayun23072@gmail.com"', { cwd: HUB_DIR });
  execSync('git add .', { cwd: HUB_DIR });
  execSync('git commit -m "feat: initialize central engineering portfolio hub with domain matrix and roadmaps"', { cwd: HUB_DIR, stdio: 'inherit' });
  console.log('✅ Successfully initialized engineering-portfolio locally!');
} catch (e) {
  console.error('Git error:', e.message);
}

