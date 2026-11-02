import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUB_DIR = path.join(__dirname, '..', 'github-ecosystem', 'backend-engineering-hub');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

console.log('[INIT] Creating backend-engineering-hub...');
ensureDir(HUB_DIR);
ensureDir(path.join(HUB_DIR, 'templates'));
ensureDir(path.join(HUB_DIR, 'architecture'));
ensureDir(path.join(HUB_DIR, 'resources'));

// .gitignore
fs.writeFileSync(path.join(HUB_DIR, '.gitignore'), `node_modules/
dist/
build/
.env
.env.*
*.log
.DS_Store
Thumbs.db
`);

// LICENSE
fs.writeFileSync(path.join(HUB_DIR, 'LICENSE'), `MIT License

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
`);

// CONTRIBUTING.md
fs.writeFileSync(path.join(HUB_DIR, 'CONTRIBUTING.md'), `# Contributing to Backend Engineering Hub

This repository functions as the architectural central authority and navigation hub for the complete 20-project Backend Engineering Ecosystem.

## Engineering Standards
- Architecture Centrality: This repository does not contain application code. Application implementations reside strictly inside their designated Level repositories.
- Documentation Integrity: All roadmaps, concept indexes, and progress dashboards must reflect genuine, verifiable engineering implementations.
`);

// CHANGELOG.md
fs.writeFileSync(path.join(HUB_DIR, 'CHANGELOG.md'), `# Changelog - Backend Engineering Hub

## [1.0.0] - 2026-11-02
### Added
- Complete 20-project backend engineering curriculum catalog.
- Master concept index spanning HTTP, Node.js, databases, security, architecture, async systems, and production engineering.
- Standardized templates for project specifications, architecture documents, API design, testing, and deployment.
- Interconnected links to all 4 level repositories.
`);

// REPOSITORY-DIRECTORY.md
fs.writeFileSync(path.join(HUB_DIR, 'REPOSITORY-DIRECTORY.md'), `# Backend Engineering Ecosystem — Repository Directory

| Repository | Level & Tier | Project Range | Primary Focus | Status |
| :--- | :--- | :---: | :--- | :--- |
| [**backend-engineering-hub**](https://github.com/EmaanHumayun/backend-engineering-hub) | Central Architecture Hub | 01–20 | Master roadmap, concept index, progress dashboard | Active Master |
| [**backend-beginner-projects\\**](https://github.com/EmaanHumayun/backend-beginner-projects) | Level 1: Beginner | 01–05 | HTTP, REST APIs, Express, MongoDB, Auth, File Uploads | Ready for Practice |
| [**backend-intermediate-projects\\**](https://github.com/EmaanHumayun/backend-intermediate-projects) | Level 2: Intermediate | 06–10 | RBAC, E-Commerce, Content APIs, Queues, Webhooks | Ready for Practice |
| [**backend-advanced-projects\\**](https://github.com/EmaanHumayun/backend-advanced-projects) | Level 3: Advanced | 11–15 | Modular Monoliths, API Gateways, WebSockets, Redis, Security | Ready for Practice |
| [**backend-professional-projects\\**](https://github.com/EmaanHumayun/backend-professional-projects) | Level 4: Professional | 16–20 | Microservices, Event-Driven, Distributed Queues, SaaS Platforms | Ready for Practice |
`);

// BACKEND-ENGINEERING-ROADMAP.md
fs.writeFileSync(path.join(HUB_DIR, 'BACKEND-ENGINEERING-ROADMAP.md'), `# Complete Backend Engineering Roadmap (2026)

A progressive, four-tier engineering curriculum taking backend developers from HTTP fundamentals to production-grade distributed architectures.

\`\`\`mermaid
flowchart TD
    L1["Level 1: Beginner<br/>HTTP, REST, Express, MongoDB, Auth, Files<br/>(Projects 01-05)"]
    L2["Level 2: Intermediate<br/>RBAC, Transactions, Queues, Webhooks<br/>(Projects 06-10)"]
    L3["Level 3: Advanced<br/>Modular Monolith, Gateway, WebSockets, Redis<br/>(Projects 11-15)"]
    L4["Level 4: Professional<br/>Microservices, Event-Driven, Distributed Systems<br/>(Projects 16-20)"]

    L1 --> L2
    L2 --> L3
    L3 --> L4
\`\`\`

## Progression Philosophy
1. Beginner (Level 1): Master deterministic REST APIs, request lifecycles, and database CRUD.
2. Intermediate (Level 2): Enforce enterprise authorization, database ACID transactions, and asynchronous background jobs.
3. Advanced (Level 3): Implement real-time communications, caching layers, reverse-proxy gateways, and OWASP API security.
4. Professional (Level 4): Architect resilient microservices, event-driven streaming, distributed locking, and production observability.
`);

// COMPLETE-PROJECT-CATALOG.md
fs.writeFileSync(path.join(HUB_DIR, 'COMPLETE-PROJECT-CATALOG.md'), `# Complete 20-Project Curriculum Catalog

### Level 1: Beginner (backend-beginner-projects)
1. **Task Manager REST API:** HTTP methods, routing, controllers, validation, error handling, status codes.
2. **Contact Management API:** MongoDB, Mongoose schemas, indexes, pagination, filtering, search.
3. **URL Shortener Service:** Unique hash generation, HTTP 301/302 redirects, click analytics, expiration.
4. **Authentication API:** User registration, bcrypt hashing, JWT access/refresh token rotation, protected middleware.
5. **File Upload and Media API:** Multipart streaming with Multer, MIME validation, storage abstraction, security.

### Level 2: Intermediate (backend-intermediate-projects)
6. **Role-Based Access Control System:** Granular permissions, role assignment, resource ownership policies.
7. **E-commerce Backend API:** Complex business logic, cart state, inventory locking, checkout transactions.
8. **Blog & Content Management API:** Relational one-to-many/many-to-many joins, comments, tagging, soft deletes.
9. **Notification Service:** Asynchronous worker processing, email delivery, retry backoff, templating.
10. **API Integration & Webhook Platform:** Third-party consumption, webhook signature verification, rate limiting.

### Level 3: Advanced (backend-advanced-projects)
11. **Modular Monolithic SaaS Backend:** Separation of concerns, repository pattern, multi-tenant database isolation.
12. **Advanced API Gateway:** Reverse proxy, rate limiting, centralized token validation, dynamic routing.
13. **Real-Time Chat Backend:** WebSockets / Socket.IO, rooms, user presence, message persistence, receipts.
14. **Advanced Search & Analytics API:** Full-text search, query optimization, Redis cache invalidation, aggregation.
15. **Backend Testing & Security Platform:** Jest/Vitest, Supertest, OWASP Top 10 API security, load testing.

### Level 4: Professional (backend-professional-projects)
16. **Microservices E-commerce Platform:** Service boundaries, gRPC/HTTP communication, distributed authentication.
17. **Event-Driven Order Processing System:** Message broker (RabbitMQ/Kafka), event publishing, dead-letter queues.
18. **Distributed Job Processing System:** BullMQ + Redis, concurrent workers, failure recovery, priority scheduling.
19. **Scalable Booking & Reservation Backend:** Race conditions, distributed locking, idempotency keys, ACID isolation.
20. **Production-Ready SaaS Platform:** Complete end-to-end architecture, multi-tenancy, CI/CD, Docker, Prometheus telemetry.
`);

// CONCEPT-MASTER-INDEX.md
fs.writeFileSync(path.join(HUB_DIR, 'CONCEPT-MASTER-INDEX.md'), `# Concept Master Index

Comprehensive mapping of backend engineering concepts across the 20-project curriculum.

| Concept Domain | Key Topics | Projects Introduced | Mastery Status |
| :--- | :--- | :---: | :--- |
| **HTTP & Networking** | Methods, status codes, headers, DNS, TLS, REST, CORS | 01, 03, 10 | Core Practice |
| **Node.js & Express** | Event loop, middleware chains, error boundaries, routing | 01, 04, 11 | Core Practice |
| **Databases & ORM** | Schemas, indexes, ACID transactions, migrations, pooling | 02, 07, 08 | Core Practice |
| **API Engineering** | Pagination, filtering, idempotency, versioning, webhooks | 01, 03, 10, 12 | Core Practice |
| **Security & Auth** | Hashing (bcrypt), JWT, RBAC, OWASP API Top 10, sanitization | 04, 06, 15 | Core Practice |
| **Architecture** | MVC, repository pattern, modular monoliths, microservices | 01, 11, 16 | Developing |
| **Asynchronous Systems** | Background jobs, queues, message brokers, dead-letter queues | 09, 17, 18 | Developing |
| **Performance & Scale** | Redis caching, query tuning, connection pools, load testing | 14, 15, 19 | Developing |
| **Production Engineering**| Docker, CI/CD, structured logging, Prometheus metrics, tracing | 01, 16, 20 | Developing |
`);

// TECHNOLOGY-ROADMAP.md
fs.writeFileSync(path.join(HUB_DIR, 'TECHNOLOGY-ROADMAP.md'), `# Technology Progression Roadmap

| Curriculum Level | Languages | Frameworks | Persistence & Cache | Infrastructure & DevOps |
| :--- | :--- | :--- | :--- | :--- |
| **Beginner (01-05)** | JavaScript (ES6+) | Node.js, Express.js | MongoDB, Mongoose | Git, Postman, Environment Variables |
| **Intermediate (06-10)** | JavaScript / Node.js | Express.js, Multer | PostgreSQL, MongoDB | Docker, Background Queues |
| **Advanced (11-15)** | TypeScript, Node.js | Express, Socket.IO | PostgreSQL, Redis | Docker Compose, Jest, Supertest |
| **Professional (16-20)** | TypeScript | Express / NestJS | PostgreSQL, Redis, Mongo | Kubernetes, RabbitMQ/Kafka, CI/CD, Prometheus |
`);

// ARCHITECTURE-OVERVIEW.md
fs.writeFileSync(path.join(HUB_DIR, 'ARCHITECTURE-OVERVIEW.md'), `# Architecture & System Design Overview

## Monolithic vs Microservices Evolution
\`\`\`mermaid
flowchart LR
    subgraph Monolith [Tier 1 & 2: Monolithic API]
        Client1[Client] --> API1[Express Server]
        API1 --> DB1[(Database)]
    end

    subgraph Modular [Tier 3: Modular Monolith]
        Client2[Client] --> Gateway[API Gateway]
        Gateway --> AuthMod[Auth Module]
        Gateway --> CoreMod[Core Domain Module]
        Gateway --> CacheMod[(Redis Cache)]
    end

    subgraph Microservices [Tier 4: Distributed Microservices]
        Client3[Client] --> Ingress[Ingress Controller]
        Ingress --> SvcA[Auth Service]
        Ingress --> SvcB[Order Service]
        SvcB --> Broker[(RabbitMQ / Kafka)]
        Broker --> SvcC[Worker Service]
    end
\`\`\`
`);

// DEVELOPMENT-STANDARDS.md
fs.writeFileSync(path.join(HUB_DIR, 'DEVELOPMENT-STANDARDS.md'), `# Development Standards & Code Hygiene

1. Separation of Concerns: Strict decoupling between routes, controllers, services, models, and repositories.
2. Defensive Validation: All incoming payloads must be strictly validated before entering service business logic.
3. Centralized Error Handling: Uncaught exceptions and operational errors must route through dedicated Express error middleware.
4. Deterministic JSON Envelopes: All API responses conform to \`{ success: boolean, data?: any, error?: string, timestamp: string }\`.
5. Zero Hardcoded Secrets: All ports, database URIs, and JWT secrets must derive strictly from \`process.env\`.
`);

// PROJECT-COMPLETION-STANDARDS.md
fs.writeFileSync(path.join(HUB_DIR, 'PROJECT-COMPLETION-STANDARDS.md'), `# Project Completion Standards

A project is marked **Completed** only when all the following criteria are fulfilled:
- [ ] Functional requirements fully implemented and manual verification passed.
- [ ] Architecture document and sequence diagram created.
- [ ] Database schema documented with entity relationships.
- [ ] API endpoint reference fully populated with request/response examples.
- [ ] Input validation and centralized error handling verified.
- [ ] Automated integration tests written and passing.
- [ ] Project README completed with verified local setup instructions.
- [ ] Dockerfile and Docker Compose configuration verified.
`);

// SECURITY-STANDARDS.md
fs.writeFileSync(path.join(HUB_DIR, 'SECURITY-STANDARDS.md'), `# Backend Security Standards (OWASP API Top 10 Aligned)

1. Authentication: Passwords hashed with bcrypt (salt rounds >= 10). JWT tokens use short lifespans (15m) with refresh token rotation.
2. Authorization: Granular RBAC and resource ownership verification on all state-changing endpoints.
3. Injection Defense: Parameterized database queries to eliminate SQL injection; strict NoSQL casting.
4. Transport & Rate Limiting: Strict CORS origins, security headers via Helmet, and IP rate limiting on public endpoints.
`);

// PROGRESS-DASHBOARD.md
fs.writeFileSync(path.join(HUB_DIR, 'PROGRESS-DASHBOARD.md'), `# Master Progress Dashboard

## Curriculum Overview (0 of 20 Completed)

| Level | Repository | Total Projects | Completed | Status |
| :--- | :--- | :---: | :---: | :--- |
| **Level 1** | [backend-beginner-projects](https://github.com/EmaanHumayun/backend-beginner-projects) | 5 | 0 | Ready for Development |
| **Level 2** | [backend-intermediate-projects](https://github.com/EmaanHumayun/backend-intermediate-projects) | 5 | 0 | Ready for Development |
| **Level 3** | [backend-advanced-projects](https://github.com/EmaanHumayun/backend-advanced-projects) | 5 | 0 | Ready for Development |
| **Level 4** | [backend-professional-projects](https://github.com/EmaanHumayun/backend-professional-projects) | 5 | 0 | Ready for Development |
`);

// LEARNING-LOG.md
fs.writeFileSync(path.join(HUB_DIR, 'LEARNING-LOG.md'), `# Master Backend Engineering Learning Log

### 2026-11-02 — Ecosystem Architecture Established
- Initialized central backend engineering hub and 4 level repositories.
- Cataloged full 20-project curriculum, concept master index, and progression standards.
`);

// Main Hub README.md
const mainReadme = `# Backend Engineering Ecosystem Hub

[![Architecture: 4 Levels](https://img.shields.io/badge/Architecture-4%20Progressive%20Levels-blue?style=flat-square)](#four-learning-levels)
[![Projects: 20 Curriculum](https://img.shields.io/badge/Projects-20%20Curriculum%20Specs-059669?style=flat-square)](#twenty-project-directory)
[![Maintainer: Emaan Humayun](https://img.shields.io/badge/Maintainer-Emaan%20Humayun-1F2937?style=flat-square&logo=github)](https://github.com/EmaanHumayun)

Central architectural authority, curriculum directory, and master navigation hub for the complete 20-project Backend Engineering Ecosystem.

---

## Professional Overview

**Engineer:** Emaan Humayun  
**Professional Identity:** Software Engineer | DevOps Engineer  
**Discipline Focus:** Backend Systems, REST API Engineering, Database Architecture, Microservices, and Cloud Infrastructure.

This ecosystem provides a rigorous, long-term engineering framework that bridges foundational backend development with production-oriented Site Reliability and DevOps practices.

---

## Four Learning Levels

| Level | Repository | Focus & Core Concepts | Projects | Status |
| :--- | :--- | :--- | :---: | :--- |
| **Level 1** | [**backend-beginner-projects**](https://github.com/EmaanHumayun/backend-beginner-projects) | HTTP, Express routing, MongoDB, Schemas, JWT Auth, File Streaming | 01–05 | \`Ready for Practice\` |
| **Level 2** | [**backend-intermediate-projects**](https://github.com/EmaanHumayun/backend-intermediate-projects) | Granular RBAC, Transactions, Relational Joins, Queues, Webhooks | 06–10 | \`Ready for Practice\` |
| **Level 3** | [**backend-advanced-projects**](https://github.com/EmaanHumayun/backend-advanced-projects) | Modular Monoliths, Gateways, WebSockets, Redis Caching, Testing | 11–15 | \`Ready for Practice\` |
| **Level 4** | [**backend-professional-projects**](https://github.com/EmaanHumayun/backend-professional-projects) | Microservices, Event-Driven Streaming, Distributed Locks, Production SaaS | 16–20 | \`Ready for Practice\` |

---

## Twenty Project Directory

\`\`\`text
backend-engineering-ecosystem/
├── backend-engineering-hub/                # Master documentation, concept index & standards
│
├── backend-beginner-projects/              # Level 1: Beginner Fundamentals
│   ├── 01-task-manager-rest-api/           # REST fundamentals, Express routing, CRUD, validation
│   ├── 02-contact-management-api/          # MongoDB, Mongoose schemas, pagination, search
│   ├── 03-url-shortener-service/           # Hash generation, HTTP redirects, click analytics
│   ├── 04-authentication-api/              # bcrypt hashing, JWT access/refresh tokens, auth guards
│   └── 05-file-upload-media-api/           # Multer multipart upload, MIME validation, storage abstraction
│
├── backend-intermediate-projects/          # Level 2: Intermediate Architecture
│   ├── 06-role-based-access-control-system/# Roles, permissions, access policies, ownership
│   ├── 07-ecommerce-backend-api/           # Inventory locking, ACID transactions, checkout logic
│   ├── 08-blog-content-management-api/     # Relational joins, tags, comments, soft deletion
│   ├── 09-notification-service/            # Background worker queues, email delivery, retries
│   └── 10-api-integration-webhook-platform/# Third-party REST consumption, signature verification
│
├── backend-advanced-projects/              # Level 3: Advanced Systems
│   ├── 11-modular-monolithic-saas-backend/ # Domain modules, repository pattern, multi-tenancy
│   ├── 12-advanced-api-gateway/            # Reverse proxy, rate limiting, token validation
│   ├── 13-real-time-chat-backend/          # WebSockets, Socket.IO, rooms, message persistence
│   ├── 14-advanced-search-analytics-api/   # Full-text search, Redis caching, query profiling
│   └── 15-backend-testing-security-platform# Vitest/Jest, Supertest, OWASP API Top 10 security
│
└── backend-professional-projects/          # Level 4: Production Engineering
    ├── 16-microservices-ecommerce-platform/# Service boundaries, gRPC/HTTP, distributed auth
    ├── 17-event-driven-order-processing/   # RabbitMQ / Kafka, event streaming, dead-letter queues
    ├── 18-distributed-job-processing/      # BullMQ + Redis, worker concurrency, failure recovery
    ├── 19-scalable-booking-reservation/    # Race condition mitigation, distributed locks, ACID
    └── 20-production-ready-saas-platform/  # Multi-tenant SaaS, Docker, CI/CD, Prometheus telemetry
\`\`\`

---

## Core Technical Concept Coverage

Full mapping available in **[CONCEPT-MASTER-INDEX.md](./CONCEPT-MASTER-INDEX.md)**:
- **HTTP & Networking:** Status codes, request-response lifecycle, headers, DNS, TLS, REST constraints.
- **Node.js & Express:** Event loop mechanics, middleware pipelines, error handling boundaries.
- **Data Persistence:** Relational (PostgreSQL) vs Document (MongoDB) modeling, indexing, transactions.
- **Security:** bcrypt password hashing, JWT stateless tokens, RBAC authorization, OWASP API safeguards.
- **Distributed Architecture:** API gateways, event-driven messaging, distributed workers, horizontal scaling.

---

## Future Daily Development Workflow

When initiating practical development on any project:

\`\`\`bash
# 1. Navigate to the level repository and target project
cd backend-beginner-projects/projects/01-task-manager-rest-api/

# 2. Review requirements and technical specification
cat PROJECT-SPECIFICATION.md

# 3. Implement code inside src/ and tests inside tests/

# 4. Commit changes with conventional commit standard
git commit -m "feat(task-api): implement task creation endpoint with payload validation"

# 5. Update progress tracker and push
git push origin main
\`\`\`

---

## Professional Coordinates

- **Engineer:** Emaan Humayun
- **Specialization:** Software Engineer | DevOps Engineer
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)
- **Central Portfolio:** [Engineering Portfolio](https://github.com/EmaanHumayun/engineering-portfolio)
`;

fs.writeFileSync(path.join(HUB_DIR, 'README.md'), mainReadme);

// Templates in templates/
const TEMPLATE_NAMES = [
  'project-specification.md',
  'project-readme.md',
  'architecture-document.md',
  'api-documentation.md',
  'database-design.md',
  'testing-strategy.md',
  'deployment-guide.md',
  'troubleshooting-report.md',
  'learning-reflection.md',
  'project-review.md'
];

TEMPLATE_NAMES.forEach(t => {
  fs.writeFileSync(path.join(HUB_DIR, 'templates', t), `# Template: ${t.replace('.md', '').replace(/-/g, ' ').toUpperCase()}\n\nStandardized specification template for backend engineering implementations.\n`);
});

// Architecture docs in architecture/
fs.writeFileSync(path.join(HUB_DIR, 'architecture', 'backend-learning-architecture.md'), `# Backend Learning Architecture\n\nFramework detailing the progression from basic synchronous HTTP request handling to distributed event-driven microservices.\n`);
fs.writeFileSync(path.join(HUB_DIR, 'architecture', 'project-dependency-map.md'), `# Project Dependency Map\n\nVisual graph showing prerequisites and skill dependencies across all 20 projects.\n`);
fs.writeFileSync(path.join(HUB_DIR, 'architecture', 'concept-progression.md'), `# Concept Progression Guide\n\nStep-by-step breakdown of how foundational concepts evolve into production architectures.\n`);

// Resources in resources/
fs.writeFileSync(path.join(HUB_DIR, 'resources', 'official-documentation.md'), `# Official Technical Documentation Links\n\n- Node.js Official Docs\n- Express.js Documentation\n- PostgreSQL Manual\n- MongoDB Documentation\n- Docker & Kubernetes Reference\n`);
fs.writeFileSync(path.join(HUB_DIR, 'resources', 'development-tools.md'), `# Development Tools & Utilities\n\n- Postman / Bruno\n- Docker & Docker Compose\n- Jest & Supertest\n- Redis Commander\n- DBeaver / pgAdmin\n`);
fs.writeFileSync(path.join(HUB_DIR, 'resources', 'recommended-reading.md'), `# Recommended Engineering References\n\n- Designing Data-Intensive Applications (Martin Kleppmann)\n- Clean Architecture (Robert C. Martin)\n- Building Microservices (Sam Newman)\n`);

// Git Init Hub
try {
  execSync('git init -b main', { cwd: HUB_DIR });
  execSync('git config user.name "EmaanHumayun"', { cwd: HUB_DIR });
  execSync('git config user.email "emaanhumayun23072@gmail.com"', { cwd: HUB_DIR });
  execSync('git add .', { cwd: HUB_DIR });
  execSync('git commit -m "feat: initialize backend-engineering-hub with roadmap, 20-project catalog, concept index, and standards"', { cwd: HUB_DIR, stdio: 'inherit' });
  console.log('✅ Successfully initialized backend-engineering-hub locally!');
} catch (e) {
  console.error('Git notice:', e.message);
}
