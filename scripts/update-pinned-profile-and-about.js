import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE = path.join(__dirname, '..', 'github-ecosystem');

// 1. Build EmaanHumayun/README.md
const profileReadme = `# Emaan Humayun

### Software Engineer | DevOps Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/emaanmuhammadhumayun)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:emaanhumayun23072@gmail.com)
[![Central Hub](https://img.shields.io/badge/Hub-engineering--portfolio-1F2937?style=flat-square&logo=github&logoColor=white)](https://github.com/EmaanHumayun/engineering-portfolio)
[![Architecture: Modular](https://img.shields.io/badge/Architecture-Modular%20Ecosystem-059669?style=flat-square)](https://github.com/EmaanHumayun/engineering-portfolio)

---

## Pinned Flagship Repositories

The primary architectural hubs and active flagship engineering tracks across my GitHub ecosystem:

| Repository | Engineering Track | Key Capabilities & Architecture | Primary Tech Stack |
| :--- | :--- | :--- | :--- |
| [**\`engineering-portfolio\`**](https://github.com/EmaanHumayun/engineering-portfolio) | **Central Portfolio Hub** | Master architectural roadmap, domain matrices, cross-repository index, and engineering standards. | Architecture Docs, Markdown, Diagrams |
| [**\`devops-engineering-bootcamp\`**](https://github.com/EmaanHumayun/devops-engineering-bootcamp) | **DevOps & Cloud Infrastructure Track** | 10-module production curriculum: Linux internals, networking, Docker, K8s, Terraform IaC, CI/CD, and Observability. | Linux, Docker, K8s, Terraform, AWS, CI/CD |
| [**\`backend-engineering-hub\`**](https://github.com/EmaanHumayun/backend-engineering-hub) | **Backend Engineering Ecosystem** | 20 progressive backend projects: REST/GraphQL APIs, dual-tier caching, message queues, and microservices. | Node.js, Express, Postgres, Redis, RabbitMQ |
| [**\`automation-integration-hub\`**](https://github.com/EmaanHumayun/automation-integration-hub) | **Automation & Integrations Ecosystem** | 20 progressive integration projects: webhooks, idempotency, CRM sync, DevOps pipelines, and AI orchestrators. | Python, TypeScript, Fastify, Docker, Webhooks |
| [**\`ai-agent-engineering-hub\`**](https://github.com/EmaanHumayun/ai-agent-engineering-hub) | **AI Agent Engineering Ecosystem** | 20 progressive agentic systems: tool calling, persistent memory, hybrid RAG, multi-agent SDLC, and AIOps. | Python, Pydantic, LangGraph, pgvector, FastAPI |
| [**\`fullstack-applications\`**](https://github.com/EmaanHumayun/fullstack-applications) | **Full-Stack Applications Portfolio** | Production application monorepo featuring Engineering Hub Pro (v2.0) and multi-tier web platforms. | React 18, Vite, Node.js, Express, MongoDB |

---

## About & Professional Identity

I am a Software Engineer and DevOps Engineer dedicated to building reliable application architectures, scalable backend services, and automated cloud infrastructure. My work emphasizes first principles: mastering operating system fundamentals, networking, database transaction mechanics, and immutable infrastructure before layering high-level abstractions.

My technical focus spans seven interconnected engineering disciplines:

1. **Central Portfolio Hubs:** Maintaining a structured, documented, and transparent architecture portfolio that serves as an engineering roadmap and single source of truth.
2. **DevOps & Cloud Infrastructure:** Architecting resilient container platforms, automating multi-AZ cloud networks with Terraform, packaging Kubernetes workloads, and constructing deterministic CI/CD release pipelines.
3. **Backend Engineering (20 Projects):** Building production-ready backend architectures from fundamentals (REST, authentication, relational databases) to enterprise scale (event streaming, distributed caching, CQRS, and microservices).
4. **Automation & Integration Engineering (20 Projects):** Engineering robust system-to-system integrations, deterministic webhook listeners, API synchronization daemons, and cloud automation workflows.
5. **AI Agent Engineering & Agentic Systems (20 Projects):** Developing practical agentic architectures: schema-validated tool calling, dual-tier memory, hybrid retrieval (RAG), collaborative multi-agent collectives, and autonomous ops workflows.
6. **Full-Stack Applications Portfolio:** Delivering end-to-end full-stack web applications with decoupled React/Vite frontends, Express/Node backends, role-based access control (RBAC), and containerized deployments.
7. **Specialized Engineering Repositories:** Practical utility codebases for system administration scripting, relational data analytics, and targeted automation experiments.

---

## Complete Engineering Ecosystem (The 7 Pillars)

### 1. Central Portfolio Hubs
- [**\`engineering-portfolio\`**](https://github.com/EmaanHumayun/engineering-portfolio): Central architectural hub, domain matrix, system diagrams, and cross-repo navigation.
- [**\`EmaanHumayun\`**](https://github.com/EmaanHumayun/EmaanHumayun): GitHub profile root, public identity, repository index, and technical competency overview.

### 2. DevOps & Cloud Infrastructure Track
- [**\`devops-engineering-bootcamp\`**](https://github.com/EmaanHumayun/devops-engineering-bootcamp): Structured 10-module curriculum covering Linux, Bash, networking, Git, Docker, Kubernetes, Terraform, AWS, and Prometheus.
- [**\`devops-practice-labs\`**](https://github.com/EmaanHumayun/devops-practice-labs): Reproducible hands-on labs with executable scripts, manifests, and verification runbooks.
- [**\`cloud-infrastructure-iac\`**](https://github.com/EmaanHumayun/cloud-infrastructure-iac): Modular Terraform and OpenTofu blueprints for multi-AZ AWS VPCs, EKS clusters, and remote S3/DynamoDB state locking.
- [**\`devops-assignments-challenges\`**](https://github.com/EmaanHumayun/devops-assignments-challenges): In-depth architectural case studies (multi-AZ VPC design, canary deployments, DevSecOps supply chain security).

### 3. Backend Engineering Ecosystem (20 Progressive Projects)
- [**\`backend-engineering-hub\`**](https://github.com/EmaanHumayun/backend-engineering-hub): Central index, concept master index, roadmap, and architecture standards.
- [**\`backend-beginner-projects\`**](https://github.com/EmaanHumayun/backend-beginner-projects): Projects 01-05 (HTTP Servers, CRUD APIs, Authentication & Authorization, Relational Databases, File Processing).
- [**\`backend-intermediate-projects\`**](https://github.com/EmaanHumayun/backend-intermediate-projects): Projects 06-10 (Caching, Background Queues, Rate Limiting, Real-time WebSockets, Microservices Foundation).
- [**\`backend-advanced-projects\`**](https://github.com/EmaanHumayun/backend-advanced-projects): Projects 11-15 (Event-Driven Architecture, Distributed Tracing, High-Concurrency Engines, GraphQL, Payment Gateway).
- [**\`backend-professional-projects\`**](https://github.com/EmaanHumayun/backend-professional-projects): Projects 16-20 (CQRS & Event Sourcing, Multi-Tenant SaaS, Search Engine, Fault Tolerance, Production Microservices Mesh).

### 4. Automation & Integration Engineering Ecosystem (20 Progressive Projects)
- [**\`automation-integration-hub\`**](https://github.com/EmaanHumayun/automation-integration-hub): Master roadmap, integrations catalog, webhook standards, and security specifications.
- [**\`automation-beginner-projects\`**](https://github.com/EmaanHumayun/automation-beginner-projects): Projects 01-05 (Automated Email Notifications, File Processing Pipelines, Scheduled Data Ingestion, Webhook Dispatcher, External API Sync).
- [**\`automation-intermediate-projects\`**](https://github.com/EmaanHumayun/automation-intermediate-projects): Projects 06-10 (CRM Synchronization Engine, Automated Invoice Generator, Multi-Channel Alert Router, Git/GitHub Automation, Payment Reconciliation).
- [**\`automation-advanced-projects\`**](https://github.com/EmaanHumayun/automation-advanced-projects): Projects 11-15 (ETL Pipeline Engine, Event-Driven Webhook Broker, CI/CD Pipeline Automation, Infrastructure Provisioning, Cross-Platform Data Sync).
- [**\`automation-professional-projects\`**](https://github.com/EmaanHumayun/automation-professional-projects): Projects 16-20 (Incident Auto-Remediation, Enterprise Order Workflow, AI-Assisted Document Pipeline, Multi-Cloud Backup, Workflow Engine).

### 5. AI Agent Engineering & Agentic Systems (20 Progressive Projects)
- [**\`ai-agent-engineering-hub\`**](https://github.com/EmaanHumayun/ai-agent-engineering-hub): Central curriculum, agent architecture guide, concept mastery index, and technology stack.
- [**\`ai-agents-beginner-projects\`**](https://github.com/EmaanHumayun/ai-agents-beginner-projects): Projects 01-05 (Personal Assistant, Structured Data Extractor, Research Summary Agent, SQLite Task Agent, Document QA RAG Agent).
- [**\`ai-agents-intermediate-projects\`**](https://github.com/EmaanHumayun/ai-agents-intermediate-projects): Projects 06-10 (Persistent Memory Agent, Email/Calendar Action Agent, Code Assistant, Hybrid Search RAG, API Integration Agent).
- [**\`ai-agents-advanced-projects\`**](https://github.com/EmaanHumayun/ai-agents-advanced-projects): Projects 11-15 (Autonomous Planning Agent, Multi-Agent Research System, SDLC Collective, AI Data Analyst, Agent Evaluation Platform).
- [**\`ai-agents-professional-projects\`**](https://github.com/EmaanHumayun/ai-agents-professional-projects): Projects 16-20 (DevOps AIOps Agent, Customer Support Platform, Business Ops Platform, Autonomous SWE Platform, Enterprise Agent Gateway).

### 6. Full-Stack Applications Portfolio
- [**\`fullstack-applications\`**](https://github.com/EmaanHumayun/fullstack-applications): Production monorepo hosting multi-tier applications including Engineering Hub Pro (v2.0) and Task Management Platform.
- [**\`fullstack-cloud-native-app\`**](https://github.com/EmaanHumayun/fullstack-cloud-native-app): Decoupled React 18 + Node.js/Express platform with Docker containerization and declarative Kubernetes manifests.
- [**\`50-javascript-projects\`**](https://github.com/EmaanHumayun/50-javascript-projects): 50 foundational web applications demonstrating native DOM manipulation, asynchronous algorithms, and client-side state.

### 7. Specialized Engineering Repositories
- [**\`automation-engineering\`**](https://github.com/EmaanHumayun/automation-engineering): Operational Bash daemons, system health monitors, log rotation engines, and Python sync utilities.
- [**\`data-analytics-portfolio\`**](https://github.com/EmaanHumayun/data-analytics-portfolio): Complex SQL queries, cohort retention analyses, database schemas, and data modeling artifacts.
- [**\`ai-automation-engineering\`**](https://github.com/EmaanHumayun/ai-automation-engineering): Experimental agent loops, JSON-schema tool calling scripts, and prompt engineering utilities.

---

## Universal Daily Git Workflow

To maintain a disciplined, professional, and audit-ready portfolio, all work across all repositories follows this deterministic execution protocol:

### Step 1: Navigate to Workspace & Select Project
\`\`\`bash
# Select repository and target project directory
cd d:/my\\ personal-workspace/github-ecosystem/backend-beginner-projects/02-restful-api-task-manager
\`\`\`

### Step 2: Create a Feature Branch
\`\`\`bash
git checkout -b feat/project-02-implementation
\`\`\`

### Step 3: Implement Code & Unit Tests
- Develop clean, typed source files inside \`src/\`.
- Write deterministic automated test assertions inside \`tests/\`.
- Ensure all dependencies are recorded in \`package.json\` or \`requirements.txt\`.

### Step 4: Verify Tests & Zero-Leak Security
\`\`\`bash
# Run automated tests
npm test
# or: pytest tests/

# Verify that no .env or sensitive credentials exist in git status
git status
\`\`\`

### Step 5: Update Documentation & Progress Tracking
- Complete the project \`README.md\` (Overview, Architecture, API Endpoints, Reproduction Steps).
- Update the progress indicator in the repository's root \`PROGRESS.md\` or \`README.md\`.

### Step 6: Atomic Conventional Commit
\`\`\`bash
git add src/ tests/ README.md
git commit -m "feat(p02): implement REST task manager endpoints with JWT auth and test suite"
\`\`\`

### Step 7: Push & Merge to Main
\`\`\`bash
git checkout main
git merge feat/project-02-implementation
git push origin main
git branch -d feat/project-02-implementation
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

- **Backend & REST APIs:** Express.js routing, middleware chains, JWT stateless authentication, bcrypt password hashing, Role-Based Access Control (RBAC), and connection pooling.
- **Frontend & Full-Stack:** React 18, Vite, modular component hierarchies, client-side routing, Axios / Fetch API integration, and responsive design systems.
- **Containerization & Workflows:** Multi-stage Docker builds, layer caching optimization, multi-container Docker Compose networks, and conventional Git branching.
- **Operating Systems & Scripting:** Ubuntu/Debian administration, systemd service management, automated backup daemons, and cron automation.

### Developing & Lab-Verified Practices

![Kubernetes](https://img.shields.io/badge/-Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Helm](https://img.shields.io/badge/-Helm-0F1689?style=flat-square&logo=helm&logoColor=white)
![Terraform](https://img.shields.io/badge/-Terraform-844FBA?style=flat-square&logo=terraform&logoColor=white)
![AWS](https://img.shields.io/badge/-AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Prometheus](https://img.shields.io/badge/-Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white)

- **Container Orchestration:** Declarative Kubernetes manifests (Deployments, Services, ConfigMaps, Secrets, Probes), and Helm packaging.
- **Infrastructure as Code (IaC):** Modular Terraform and OpenTofu definitions for multi-AZ AWS VPCs, subnets, internet gateways, and security groups.
- **Cloud Infrastructure & Networking:** AWS network architecture, CIDR subnetting, egress NAT Gateways, TCP/IP, and DNS diagnostics.
- **Observability & SRE:** Prometheus metrics exposition (/metrics endpoints), scraping configurations, and threshold alerting rules.

---

## Professional Coordinates

- **Email:** [emaanhumayun23072@gmail.com](mailto:emaanhumayun23072@gmail.com)
- **LinkedIn:** [linkedin.com/in/emaanmuhammadhumayun](https://www.linkedin.com/in/emaanmuhammadhumayun)
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)
- **Central Portfolio Hub:** [engineering-portfolio](https://github.com/EmaanHumayun/engineering-portfolio)
`;

// 2. Build engineering-portfolio/README.md
const portfolioReadme = `# Central Engineering Portfolio & Architecture Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Maintainer: Emaan Humayun](https://img.shields.io/badge/Maintainer-Emaan%20Humayun-1F2937?style=flat-square&logo=github)](https://github.com/EmaanHumayun)
[![Architecture: Modular](https://img.shields.io/badge/Architecture-7%20Engineering%20Pillars-059669?style=flat-square)](#the-7-core-engineering-pillars)
[![Workflow: Universal](https://img.shields.io/badge/Workflow-Universal%20Git%20Protocol-6366F1?style=flat-square)](./GIT-WORKFLOW.md)

Central architectural hub and master navigation directory for all software engineering, cloud infrastructure, practice labs, automation pipelines, and agentic AI systems maintained by Emaan Humayun.

---

## Pinned Flagship Repositories

The top 6 primary flagship repositories representing the core disciplines of this ecosystem:

| Repository | Engineering Discipline | Scope & Architecture | Status |
| :--- | :--- | :--- | :--- |
| [**\`engineering-portfolio\`**](https://github.com/EmaanHumayun/engineering-portfolio) | **Central Portfolio Hub** | Master architectural roadmap, domain matrices, cross-repository index, and engineering standards. | \`Active Master Hub\` |
| [**\`devops-engineering-bootcamp\`**](https://github.com/EmaanHumayun/devops-engineering-bootcamp) | **DevOps & Cloud Infrastructure Track** | 10-module curriculum: Linux internals, networking, Docker, K8s, Terraform IaC, CI/CD, and Observability. | \`Active Track\` |
| [**\`backend-engineering-hub\`**](https://github.com/EmaanHumayun/backend-engineering-hub) | **Backend Engineering Ecosystem** | 20 progressive projects: REST/GraphQL APIs, dual-tier caching, message queues, and microservices. | \`20-Project Hub\` |
| [**\`automation-integration-hub\`**](https://github.com/EmaanHumayun/automation-integration-hub) | **Automation & Integrations Ecosystem** | 20 progressive projects: webhooks, idempotency, CRM sync, DevOps pipelines, and AI orchestrators. | \`20-Project Hub\` |
| [**\`ai-agent-engineering-hub\`**](https://github.com/EmaanHumayun/ai-agent-engineering-hub) | **AI Agent Engineering Ecosystem** | 20 progressive systems: tool calling, persistent memory, hybrid RAG, multi-agent SDLC, and AIOps. | \`20-Project Hub\` |
| [**\`fullstack-applications\`**](https://github.com/EmaanHumayun/fullstack-applications) | **Full-Stack Applications Portfolio** | Production monorepo featuring Engineering Hub Pro (v2.0) and multi-tier web platforms. | \`Active Monorepo\` |

---

## About & Engineering Philosophy

This ecosystem demonstrates an authentic, progression-oriented engineering journey across application development, infrastructure architecture, system automation, and agentic AI.

- **First-Principles Foundation:** We master operating system mechanisms, networking primitives, database concurrency, and container runtimes before applying higher-level abstraction frameworks.
- **Clean Architecture & Separation of Concerns:** Domain layers, infrastructure controllers, data access repositories, and deployment manifests maintain strict boundaries.
- **Reproducibility & Verification:** Every project contains deterministic setup scripts, verified dependencies, and automated test assertions.
- **Zero-Secret Security Policy:** Strict credential isolation, automated \`.gitignore\` patterns, and zero hardcoded tokens across all repositories.

---

## Ecosystem Architecture

\`\`\`mermaid
flowchart TD
    HUB["Central Engineering Hub<br/>engineering-portfolio"]

    P1["1. Central Hubs<br/>engineering-portfolio & EmaanHumayun"]
    P2["2. DevOps & Cloud Track<br/>bootcamp, labs, cloud-iac, challenges"]
    P3["3. Backend Ecosystem (20 Projects)<br/>backend-hub + 4 level repositories"]
    P4["4. Automation Ecosystem (20 Projects)<br/>automation-hub + 4 level repositories"]
    P5["5. AI Agent Ecosystem (20 Projects)<br/>ai-agent-hub + 4 level repositories"]
    P6["6. Full-Stack Applications<br/>fullstack-applications & cloud-native"]
    P7["7. Specialized Repositories<br/>automation, analytics, ai-experiments"]

    HUB --> P1
    HUB --> P2
    HUB --> P3
    HUB --> P4
    HUB --> P5
    HUB --> P6
    HUB --> P7
\`\`\`

---

## The 7 Core Engineering Pillars

### Pillar 1: Central Portfolio Hubs
- [**\`engineering-portfolio\`**](https://github.com/EmaanHumayun/engineering-portfolio): Central architectural roadmap, domain matrices, system diagrams, and cross-repo navigation.
- [**\`EmaanHumayun\`**](https://github.com/EmaanHumayun/EmaanHumayun): GitHub profile root, public identity, repository index, and technical competency overview.

### Pillar 2: DevOps & Cloud Infrastructure Track
- [**\`devops-engineering-bootcamp\`**](https://github.com/EmaanHumayun/devops-engineering-bootcamp): Structured 10-module curriculum covering Linux, Bash, networking, Git, Docker, Kubernetes, Terraform, AWS, and Prometheus.
- [**\`devops-practice-labs\`**](https://github.com/EmaanHumayun/devops-practice-labs): Reproducible hands-on labs with executable scripts, manifests, and verification runbooks.
- [**\`cloud-infrastructure-iac\`**](https://github.com/EmaanHumayun/cloud-infrastructure-iac): Modular Terraform and OpenTofu blueprints for multi-AZ AWS VPCs, EKS clusters, and remote S3/DynamoDB state locking.
- [**\`devops-assignments-challenges\`**](https://github.com/EmaanHumayun/devops-assignments-challenges): In-depth architectural case studies (multi-AZ VPC design, canary deployments, DevSecOps supply chain security).

### Pillar 3: Backend Engineering Ecosystem (20 Progressive Projects)
- [**\`backend-engineering-hub\`**](https://github.com/EmaanHumayun/backend-engineering-hub): Central index, concept master index, roadmap, and architecture standards.
- [**\`backend-beginner-projects\`**](https://github.com/EmaanHumayun/backend-beginner-projects): Projects 01-05 (HTTP Servers, CRUD APIs, Authentication & Authorization, Relational Databases, File Processing).
- [**\`backend-intermediate-projects\`**](https://github.com/EmaanHumayun/backend-intermediate-projects): Projects 06-10 (Caching, Background Queues, Rate Limiting, Real-time WebSockets, Microservices Foundation).
- [**\`backend-advanced-projects\`**](https://github.com/EmaanHumayun/backend-advanced-projects): Projects 11-15 (Event-Driven Architecture, Distributed Tracing, High-Concurrency Engines, GraphQL, Payment Gateway).
- [**\`backend-professional-projects\`**](https://github.com/EmaanHumayun/backend-professional-projects): Projects 16-20 (CQRS & Event Sourcing, Multi-Tenant SaaS, Search Engine, Fault Tolerance, Production Microservices Mesh).

### Pillar 4: Automation & Integration Engineering Ecosystem (20 Progressive Projects)
- [**\`automation-integration-hub\`**](https://github.com/EmaanHumayun/automation-integration-hub): Master roadmap, integrations catalog, webhook standards, and security specifications.
- [**\`automation-beginner-projects\`**](https://github.com/EmaanHumayun/automation-beginner-projects): Projects 01-05 (Automated Email Notifications, File Processing Pipelines, Scheduled Data Ingestion, Webhook Dispatcher, External API Sync).
- [**\`automation-intermediate-projects\`**](https://github.com/EmaanHumayun/automation-intermediate-projects): Projects 06-10 (CRM Synchronization Engine, Automated Invoice Generator, Multi-Channel Alert Router, Git/GitHub Automation, Payment Reconciliation).
- [**\`automation-advanced-projects\`**](https://github.com/EmaanHumayun/automation-advanced-projects): Projects 11-15 (ETL Pipeline Engine, Event-Driven Webhook Broker, CI/CD Pipeline Automation, Infrastructure Provisioning, Cross-Platform Data Sync).
- [**\`automation-professional-projects\`**](https://github.com/EmaanHumayun/automation-professional-projects): Projects 16-20 (Incident Auto-Remediation, Enterprise Order Workflow, AI-Assisted Document Pipeline, Multi-Cloud Backup, Workflow Engine).

### Pillar 5: AI Agent Engineering & Agentic Systems (20 Progressive Projects)
- [**\`ai-agent-engineering-hub\`**](https://github.com/EmaanHumayun/ai-agent-engineering-hub): Central curriculum, agent architecture guide, concept mastery index, and technology stack.
- [**\`ai-agents-beginner-projects\`**](https://github.com/EmaanHumayun/ai-agents-beginner-projects): Projects 01-05 (Personal Assistant, Structured Data Extractor, Research Summary Agent, SQLite Task Agent, Document QA RAG Agent).
- [**\`ai-agents-intermediate-projects\`**](https://github.com/EmaanHumayun/ai-agents-intermediate-projects): Projects 06-10 (Persistent Memory Agent, Email/Calendar Action Agent, Code Assistant, Hybrid Search RAG, API Integration Agent).
- [**\`ai-agents-advanced-projects\`**](https://github.com/EmaanHumayun/ai-agents-advanced-projects): Projects 11-15 (Autonomous Planning Agent, Multi-Agent Research System, SDLC Collective, AI Data Analyst, Agent Evaluation Platform).
- [**\`ai-agents-professional-projects\`**](https://github.com/EmaanHumayun/ai-agents-professional-projects): Projects 16-20 (DevOps AIOps Agent, Customer Support Platform, Business Ops Platform, Autonomous SWE Platform, Enterprise Agent Gateway).

### Pillar 6: Full-Stack Applications Portfolio
- [**\`fullstack-applications\`**](https://github.com/EmaanHumayun/fullstack-applications): Production monorepo hosting multi-tier applications including Engineering Hub Pro (v2.0) and Task Management Platform.
- [**\`fullstack-cloud-native-app\`**](https://github.com/EmaanHumayun/fullstack-cloud-native-app): Decoupled React 18 + Node.js/Express platform with Docker containerization and declarative Kubernetes manifests.
- [**\`50-javascript-projects\`**](https://github.com/EmaanHumayun/50-javascript-projects): 50 foundational web applications demonstrating native DOM manipulation, asynchronous algorithms, and client-side state.

### Pillar 7: Specialized Engineering Repositories
- [**\`automation-engineering\`**](https://github.com/EmaanHumayun/automation-engineering): Operational Bash daemons, system health monitors, log rotation engines, and Python sync utilities.
- [**\`data-analytics-portfolio\`**](https://github.com/EmaanHumayun/data-analytics-portfolio): Complex SQL queries, cohort retention analyses, database schemas, and data modeling artifacts.
- [**\`ai-automation-engineering\`**](https://github.com/EmaanHumayun/ai-automation-engineering): Experimental agent loops, JSON-schema tool calling scripts, and prompt engineering utilities.

---

## Universal Daily Git Workflow

Detailed in full in [**\`GIT-WORKFLOW.md\`**](./GIT-WORKFLOW.md):

\`\`\`bash
# 1. Select repository and project directory
cd d:/my\\ personal-workspace/github-ecosystem/backend-beginner-projects/02-restful-api-task-manager

# 2. Create feature branch
git checkout -b feat/p02-task-manager

# 3. Develop implementation, test assertions, and docs
# 4. Run automated tests and verify zero secret leaks
npm test && git status

# 5. Commit with atomic conventional commit message
git add src/ tests/ README.md
git commit -m "feat(p02): implement REST task manager endpoints with JWT auth and test suite"

# 6. Merge to main and push
git checkout main
git merge feat/p02-task-manager
git push origin main
git branch -d feat/p02-task-manager
\`\`\`

---

## Engineering Standards & Verification

All codebases within this portfolio adhere to four mandatory architectural constraints:
1. **Reproducibility:** Every repository includes comprehensive prerequisite documentation, configuration samples, and runbooks.
2. **Security:** No hardcoded secrets, API tokens, or \`.env\` files. Automated \`.gitignore\` patterns for all environments.
3. **Authenticity:** All code represents actual hands-on implementations or documented learning exercises.
4. **Clean Git History:** Meaningful conventional commit messages (\`feat:\`, \`fix:\`, \`docs:\`, \`chore:\`).

---

## Professional Coordinates

- **Engineer:** Emaan Humayun
- **Specialization:** Software Engineer | DevOps Engineer
- **Email:** [emaanhumayun23072@gmail.com](mailto:emaanhumayun23072@gmail.com)
- **LinkedIn:** [linkedin.com/in/emaanmuhammadhumayun](https://www.linkedin.com/in/emaanmuhammadhumayun)
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)
`;

// 3. Build engineering-portfolio/GIT-WORKFLOW.md
const gitWorkflowDoc = `# Universal Daily Git Workflow

A disciplined, reproducible, and recruiter-friendly daily Git workflow for managing all 27 repositories across the 7 engineering pillars.

---

## Workflow Principles

1. **Isolation:** Never commit directly on an experimental state without verifying tests.
2. **Security:** Always verify that no \`.env\`, credentials, or secret keys are staged before committing.
3. **Traceability:** Use Conventional Commits (\`feat:\`, \`fix:\`, \`docs:\`, \`test:\`, \`refactor:\`, \`chore:\`).
4. **Documentation Sync:** Whenever code is implemented or tests pass, update the corresponding \`README.md\` and \`PROGRESS.md\`.

---

## Daily 7-Step Command Protocol

### Step 1: Navigate to the Target Repository & Project Directory
Select the appropriate level repository and navigate into the target project folder:

\`\`\`bash
# Example: Navigating to Backend Level 1, Project 02
cd d:/my\\ personal-workspace/github-ecosystem/backend-beginner-projects/02-restful-api-task-manager

# Or Automation Level 1, Project 02:
# cd d:/my\\ personal-workspace/github-ecosystem/automation-beginner-projects/02-file-processing-data-pipeline

# Or AI Agent Level 1, Project 02:
# cd d:/my\\ personal-workspace/github-ecosystem/ai-agents-beginner-projects/02-structured-data-extractor-agent
\`\`\`

### Step 2: Ensure Clean Main & Create Feature Branch
\`\`\`bash
# Pull latest changes from remote
git checkout main
git pull origin main

# Create and switch to a descriptive feature branch
git checkout -b feat/project-02-implementation
\`\`\`

### Step 3: Implement Code, Tests & Documentation
Work inside the established project directory structure:
- \`src/\`: Production application source code.
- \`tests/\`: Automated test cases and validation assertions.
- \`README.md\`: Technical project documentation, architecture details, and reproduction steps.

### Step 4: Run Tests & Verify Clean Working Tree
Before staging any changes, run the automated test suite and check git status:

\`\`\`bash
# Node.js project:
npm test

# Python project:
python -m unittest discover tests/
# or: pytest tests/

# Verify that no .env, credentials, or build artifacts are untracked
git status
\`\`\`

### Step 5: Update Progress Tracking
Update the repository progress tracker (e.g., \`PROGRESS.md\`, \`README.md\`, or \`COMPLETE-PROJECT-CATALOG.md\`):
- Change project status from \`Available\` to \`In Progress\` or \`Completed\`.
- Record test execution results and completion timestamp.

### Step 6: Atomic Conventional Commit
Stage only the relevant files (never \`git add .\` indiscriminately if sensitive files might exist):

\`\`\`bash
# Stage application code, tests, and documentation
git add src/ tests/ README.md

# Stage updated progress tracker in root
git add ../PROGRESS.md

# Commit with a structured Conventional Commit message
git commit -m "feat(p02): implement REST task manager endpoints with JWT auth and test suite"
\`\`\`

### Step 7: Merge to Main & Push to GitHub
\`\`\`bash
# Switch to main branch
git checkout main

# Merge feature branch
git merge feat/project-02-implementation

# Push verified changes to GitHub
git push origin main

# Clean up local feature branch
git branch -d feat/project-02-implementation
\`\`\`

---

## Conventional Commit Reference

| Prefix | Usage | Example |
| :--- | :--- | :--- |
| \`feat\` | New project implementation or feature | \`feat(p02): implement JWT authentication middleware\` |
| \`fix\` | Bug fix or error resolution | \`fix(p01): resolve connection pool timeout in database client\` |
| \`test\` | Adding or updating test cases | \`test(p03): add end-to-end integration tests for webhooks\` |
| \`docs\` | Documentation, README, or roadmap update | \`docs(hub): update progress metrics across level 1 repos\` |
| \`refactor\` | Code restructuring without feature changes | \`refactor(p04): extract reusable validation schema helper\` |
| \`chore\` | Dependency updates, tooling, or config | \`chore(deps): update fastify to v4.26.0\` |

---

## Security & Clean Hygiene Checklist

- [ ] \`.env\` is listed in \`.gitignore\` and has NEVER been added to git history.
- [ ] Only sanitized \`.env.example\` with dummy placeholder values is committed.
- [ ] No hardcoded passwords, tokens, or private keys exist in source code.
- [ ] Git remote URL uses clean HTTPS format (\`https://github.com/EmaanHumayun/<repo>.git\`) with zero embedded tokens.
- [ ] All automated tests pass with 100% success rate before merging to \`main\`.
`;

// Write files
const profilePath = path.join(BASE, 'EmaanHumayun', 'README.md');
fs.writeFileSync(profilePath, profileReadme, 'utf8');
console.log('Updated:', profilePath);

const portfolioReadmePath = path.join(BASE, 'engineering-portfolio', 'README.md');
fs.writeFileSync(portfolioReadmePath, portfolioReadme, 'utf8');
console.log('Updated:', portfolioReadmePath);

const gitWorkflowPath = path.join(BASE, 'engineering-portfolio', 'GIT-WORKFLOW.md');
fs.writeFileSync(gitWorkflowPath, gitWorkflowDoc, 'utf8');
console.log('Updated:', gitWorkflowPath);

console.log('All files generated successfully.');

