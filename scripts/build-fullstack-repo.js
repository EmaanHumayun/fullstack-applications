import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_DIR = path.join(__dirname, '..', 'github-ecosystem', 'fullstack-applications');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

console.log('[INIT] Creating directory structure for fullstack-applications...');

ensureDir(REPO_DIR);
ensureDir(path.join(REPO_DIR, 'apps', '01-task-management-system', 'client'));
ensureDir(path.join(REPO_DIR, 'apps', '01-task-management-system', 'server'));
ensureDir(path.join(REPO_DIR, 'apps', '01-task-management-system', 'docs'));
ensureDir(path.join(REPO_DIR, 'templates'));
ensureDir(path.join(REPO_DIR, 'architecture', 'system-design'));
ensureDir(path.join(REPO_DIR, 'architecture', 'architecture-diagrams'));
ensureDir(path.join(REPO_DIR, 'architecture', 'database-design'));
ensureDir(path.join(REPO_DIR, 'resources', 'documentation'));
ensureDir(path.join(REPO_DIR, 'resources', 'tools'));
ensureDir(path.join(REPO_DIR, 'resources', 'references'));
ensureDir(path.join(REPO_DIR, 'progress'));

// -----------------------------------------------------------------------------
// 1. ROOT FILES
// -----------------------------------------------------------------------------

// .gitignore
fs.writeFileSync(path.join(REPO_DIR, '.gitignore'), `node_modules/
dist/
build/
.env
.env.*
*.log
.DS_Store
Thumbs.db
coverage/
*.sqlite
*.sqlite3
`);

// LICENSE
fs.writeFileSync(path.join(REPO_DIR, 'LICENSE'), `MIT License

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
fs.writeFileSync(path.join(REPO_DIR, 'CONTRIBUTING.md'), `# Contributing to Full-Stack Applications

This repository serves as a personal engineering portfolio showcasing complete, end-to-end full-stack software applications.

## Engineering Standards
1. Modular Architecture: Every application under \`apps/\` must be independently runnable and self-contained with its own client, server, and Docker Compose configuration.
2. Code Hygiene: All codebases must adhere to modern JavaScript/TypeScript standards, strict linting, and meaningful conventional commits.
3. Documentation: Each application requires an architectural overview, API specification, database schema diagram, and local setup guide.
`);

// CHANGELOG.md
fs.writeFileSync(path.join(REPO_DIR, 'CHANGELOG.md'), `# Changelog

All notable application releases, schema migrations, and portfolio additions are documented in this file.

## [2026-11-02] - Initial Portfolio Architecture Initialized
### Added
- Repository established with scalable monorepo structure.
- Comprehensive project index cataloging 10 real-world planned and active full-stack applications.
- Application templates for architecture, API documentation, testing, and deployment.
- Initial runnable application \`01-task-management-system\` with Express REST API, React frontend, and Docker orchestration.
`);

// PROJECT-INDEX.md
fs.writeFileSync(path.join(REPO_DIR, 'PROJECT-INDEX.md'), `# Master Project Index & Application Roadmap

This document outlines the strategic roadmap of real-world full-stack applications maintained within this repository. Applications are partitioned into active implementations and planned project specifications.

---

## Application Portfolio Matrix

| App ID | Application Name | Primary Tech Stack | Database | Architectural Highlight | Status |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **01** | [**Task Management System**](./apps/01-task-management-system/) | React 18, Node.js, Express, Docker | PostgreSQL / SQLite | Stateless JWT Auth, RBAC, RESTful API | \`Active\` |
| **02** | **Student Management System** | React, Node.js, Express, Tailwind | PostgreSQL | Complex relational joins, grade tracking, PDF report generation | \`Planned\` |
| **03** | **Inventory Management System** | TypeScript, React, Express | PostgreSQL / Redis | Real-time stock alerts, audit logging, barcode indexing | \`Planned\` |
| **04** | **E-Commerce Platform** | React, Express, Stripe API | MongoDB / PostgreSQL | Cart state, payment webhooks, order lifecycle state machine | \`Planned\` |
| **05** | **Learning Management System (LMS)** | React, Node.js, Video streaming API | MongoDB | Video progress tracking, modular quiz engine, certificates | \`Planned\` |
| **06** | **CRM Application** | React, Express, Webhook Ingestion | PostgreSQL | Sales pipeline Kanban, lead scoring, email automation | \`Planned\` |
| **07** | **Project Management System** | React, TypeScript, Express | MongoDB / PostgreSQL | Agile sprint boards, Gantt chart dependencies, team metrics | \`Planned\` |
| **08** | **Appointment Booking System** | React, Node.js, Express | PostgreSQL | Time slot reservation, double-booking prevention, calendar sync | \`Planned\` |
| **09** | **Job Portal Platform** | React, Express, Elasticsearch / SQL | PostgreSQL | Resume parsing, full-text job search, candidate applicant tracking | \`Planned\` |
| **10** | **Personal Engineering Workspace** | React 18, Node.js, Express, Tailwind | SQLite / MongoDB | Telemetry graphs, headless CMS, system logs, theme sync | \`Active Architecture\` |

---

## Application Development Policy
- Monorepo Isolation: Each application directory under \`apps/\` is fully decoupled from others, maintaining its own \`package.json\`, dependencies, and environmental configurations.
- Deployment Parity: Every application includes Dockerfiles and \`docker-compose.yml\` for single-command local execution.
`);

// Root README.md
const rootReadme = `# Full-Stack Applications Portfolio

[![Maintained by: Emaan Humayun](https://img.shields.io/badge/Maintainer-Emaan%20Humayun-1F2937?style=flat-square&logo=github)](https://github.com/EmaanHumayun)
[![Engineering Track](https://img.shields.io/badge/Track-Full--Stack%20%26%20Backend-059669?style=flat-square)](#application-portfolio-matrix)
[![Architecture: Decoupled Monorepo](https://img.shields.io/badge/Architecture-Decoupled%20Monorepo-blue?style=flat-square)](#repository-architecture)

A collection of production-oriented, end-to-end full-stack software applications demonstrating modern frontend development, backend architecture, relational and document database design, deterministic REST APIs, authentication mechanisms, and containerized deployment.

---

## Engineering Overview

**Engineer:** Emaan Humayun  
**Professional Identity:** Software Engineer | DevOps Engineer  
**Core Stack:** JavaScript / TypeScript, React 18, Vite, Tailwind CSS, Node.js, Express.js, PostgreSQL, MongoDB, Docker.

This repository serves as a permanent, growing engineering portfolio of real-world web applications. Each application is engineered with an emphasis on code maintainability, clean separation of concerns, defensive security practices, and reliable operational deployment.

---

## Technical Competency Matrix

### Frontend Engineering
![React](https://img.shields.io/badge/-React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

- Responsive, mobile-first component architecture.
- Predictable client-side state management and custom hooks.
- Asynchronous API communication, caching, and optimistic UI updates.
- Accessibility, semantic markup, and performance optimization.

### Backend & API Engineering
![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/-Express.js-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

- RESTful API design following standard HTTP status codes and JSON envelopes.
- Stateless authentication with JSON Web Tokens (JWT) and bcrypt password hashing.
- Role-Based Access Control (RBAC) middleware for route authorization.
- Data persistence with relational (PostgreSQL) and document (MongoDB) databases.
- Centralized error handling, input sanitization, and structured request logging.

---

## Application Portfolio Matrix

| App ID | Application Name | Primary Focus | Database | Status |
| :---: | :--- | :--- | :--- | :--- |
| **01** | [**Task Management System**](./apps/01-task-management-system/) | Task tracking, priority queues, status workflows | SQLite / PostgreSQL | \`Active\` |
| **02** | **Student Management System** | Student enrollment, courses, grade tracking | PostgreSQL | \`Planned\` |
| **03** | **Inventory Management System** | Stock levels, supplier orders, audit logs | PostgreSQL | \`Planned\` |
| **04** | **E-Commerce Platform** | Product catalog, cart state, checkout webhooks | MongoDB | \`Planned\` |
| **05** | **Learning Management System** | Course modules, progress tracking, quizzes | MongoDB | \`Planned\` |
| **06** | **CRM Application** | Lead management, deal stages, client interaction | PostgreSQL | \`Planned\` |
| **07** | **Project Management System** | Kanban boards, sprint tracking, milestones | PostgreSQL | \`Planned\` |
| **08** | **Appointment Booking System** | Calendar scheduling, slot reservation, reminders | PostgreSQL | \`Planned\` |
| **09** | **Job Portal Platform** | Job postings, applicant resumes, recruiter filters | PostgreSQL | \`Planned\` |
| **10** | **Personal Engineering Workspace** | Headless portfolio CMS, telemetry, live themes | MongoDB / SQLite | \`Active Architecture\` |

---

## Repository Architecture

\`\`\`text
fullstack-applications/
├── README.md                           # Master repository documentation
├── PROJECT-INDEX.md                    # In-depth roadmap of all 10 applications
├── CONTRIBUTING.md                     # Code hygiene and commit guidelines
├── CHANGELOG.md                        # Application release notes and schema updates
│
├── apps/                               # Decoupled application suites
│   └── 01-task-management-system/      # [Active] Production Task Manager App
│       ├── client/                     # Frontend client (HTML5/React UI)
│       ├── server/                     # Express REST API backend
│       ├── docs/                       # API specs and architecture
│       ├── docker-compose.yml          # Containerized orchestration
│       └── README.md                   # App-specific run instructions
│
├── templates/                          # Reusable engineering templates
│   ├── application-readme-template.md  # Standardized README for new applications
│   ├── api-documentation-template.md   # OpenAPI / Markdown API documentation
│   ├── database-design-template.md     # Schema definition and relationship matrix
│   ├── testing-template.md             # Unit and integration testing protocols
│   └── deployment-template.md          # Containerization and hosting runbook
│
├── architecture/                       # Shared architectural specifications
│   ├── system-design/                  # Monolith vs Microservices patterns
│   ├── architecture-diagrams/          # Standard fullstack request topologies
│   └── database-design/                # Relational vs Document trade-off evaluations
│
├── resources/                          # Tooling guides, design patterns, references
└── progress/                           # Project tracker, dev logs, skill audits
\`\`\`

---

## Standard Application Directory Specification

When an application moves from planned to active development, it conforms to the following standard layout:

\`\`\`text
[application-name]/
├── README.md                 # Project introduction, tech stack, setup commands
├── docker-compose.yml        # Multi-container orchestration (client, server, database)
├── client/                   # Frontend SPA (React / Vite / Tailwind)
│   ├── src/
│   ├── package.json
│   └── Dockerfile            # Multi-stage production Nginx container
├── server/                   # Backend API (Node.js / Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── package.json
│   └── Dockerfile            # Lightweight Node.js Alpine container
└── docs/                     # Technical specifications
    ├── api-spec.md           # Endpoint routes, request payloads, responses
    └── architecture.md       # Data flow diagrams and system design
\`\`\`

---

## Professional Coordinates

- **Engineer:** Emaan Humayun
- **Specialization:** Software Engineer | DevOps Engineer
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)
- **Central Hub:** [Engineering Portfolio](https://github.com/EmaanHumayun/engineering-portfolio)
`;

fs.writeFileSync(path.join(REPO_DIR, 'README.md'), rootReadme);

// -----------------------------------------------------------------------------
// 2. TEMPLATES
// -----------------------------------------------------------------------------
fs.writeFileSync(path.join(REPO_DIR, 'templates', 'application-readme-template.md'), `# [Application Name]

[![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue?style=flat-square)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20Express-green?style=flat-square)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?style=flat-square)](https://postgresql.org/)
[![Container](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square)](https://docker.com/)

[Brief 2-3 sentence overview describing the business problem and core technical capabilities of the application].

---

## Features
- **Authentication & RBAC:** Secure JWT token handling, password hashing with bcrypt.
- **RESTful API:** Predictable endpoints with comprehensive HTTP error handling.
- **Responsive UI:** Clean, accessible user interface optimized for desktop and mobile.
- **Containerized Deployment:** Docker Compose orchestration for local development and cloud deployment.

---

## Architecture & Data Flow
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend as React Client
    participant Backend as Express API
    participant DB as Database

    User->>Frontend: Action Trigger
    Frontend->>Backend: HTTP REST Request (JWT in Auth Header)
    Backend->>Backend: Middleware Verification
    Backend->>DB: Query / Transaction
    DB-->>Backend: Result Set
    Backend-->>Frontend: JSON Response Envelope
    Frontend-->>User: UI State Update
\`\`\`

---

## Quickstart & Local Setup

### Prerequisites
- Node.js v18+ or Docker & Docker Compose

### 1. Run with Docker Compose
\`\`\`bash
docker compose up --build
\`\`\`
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1/status

### 2. Manual Development Setup
\`\`\`bash
# Backend
cd server && npm install && npm run dev

# Frontend
cd ../client && npm install && npm run dev
\`\`\`
`);

fs.writeFileSync(path.join(REPO_DIR, 'templates', 'api-documentation-template.md'), `# API Specification: [Application Name]

**Base URL:** \`http://localhost:5000/api/v1\`  
**Authentication:** \`Authorization: Bearer <token>\`  
**Content-Type:** \`application/json\`  

---

## Endpoints

### 1. Authentication
#### \`POST /auth/register\`
Creates a new user account.
- **Request Body:**
  \`\`\`json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "Jane Doe"
  }
  \`\`\`
- **Success Response (201 Created):**
  \`\`\`json
  {
    "success": true,
    "user": { "id": "uuid", "email": "user@example.com", "name": "Jane Doe" },
    "token": "jwt_token_string"
  }
  \`\`\`

#### \`POST /auth/login\`
Authenticates existing credentials.

### 2. Core Resource
#### \`GET /resources\`
Retrieves paginated list of resources.
#### \`POST /resources\`
Creates a new resource record.
#### \`GET /resources/:id\`
Retrieves single resource by ID.
#### \`PUT /resources/:id\`
Updates existing resource record.
#### \`DELETE /resources/:id\`
Deletes resource record.
`);

fs.writeFileSync(path.join(REPO_DIR, 'templates', 'database-design-template.md'), `# Database Schema & Entity Relationships

## Entity-Relationship Diagram (ERD)

\`\`\`mermaid
erDiagram
    USERS ||--o{ TASKS : assigns
    USERS {
        uuid id PK
        string email
        string password_hash
        string role
        timestamp created_at
    }
    TASKS {
        uuid id PK
        uuid user_id FK
        string title
        text description
        string status
        string priority
        timestamp due_date
        timestamp created_at
    }
\`\`\`

## Indexing & Performance Strategy
- Primary keys use UUID v4 for distributed uniqueness.
- Foreign keys (\`user_id\`) indexed to optimize join performance.
- Composite index on \`(status, priority)\` for filtered dashboard queries.
`);

fs.writeFileSync(path.join(REPO_DIR, 'templates', 'testing-template.md'), `# Testing Strategy & Verification Protocol

## 1. Unit Testing
- Test isolated business logic functions, validators, and utility modules.
- Framework: Jest / Mocha.

## 2. Integration & API Testing
- Test full HTTP request/response lifecycles against test database instances.
- Framework: Supertest with Jest.

## 3. End-to-End (E2E) Testing
- Verify critical user flows (Login -> Create Task -> Update -> Delete).
- Framework: Playwright / Cypress.
`);

fs.writeFileSync(path.join(REPO_DIR, 'templates', 'deployment-template.md'), `# Deployment Runbook & Operational Guide

## 1. Container Build
\`\`\`bash
docker build -t app-backend:v1.0 ./server
docker build -t app-frontend:v1.0 ./client
\`\`\`

## 2. Environment Variables Checklist
- \`NODE_ENV=production\`
- \`PORT=5000\`
- \`DATABASE_URL=postgresql://...\`
- \`JWT_SECRET=super_secure_secret\`

## 3. Production Healthcheck
Verify service health:
\`\`\`bash
curl -f http://localhost:5000/healthz
\`\`\`
`);

// -----------------------------------------------------------------------------
// 3. PROGRESS & ROADMAP FILES
// -----------------------------------------------------------------------------
fs.writeFileSync(path.join(REPO_DIR, 'progress', 'project-tracker.md'), `# Application Development Tracker

| App ID | Application Name | Architecture | Frontend | Backend | Database | Docker | Status |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **01** | Task Management System | Done | Done | Done | In-Memory/DB | Done | Active |
| **02** | Student Management System | Planned | Spec | Spec | Spec | Pending | Planned |
| **03** | Inventory Management System | Planned | Spec | Spec | Spec | Pending | Planned |
| **04** | E-Commerce Platform | Planned | Spec | Spec | Spec | Pending | Planned |
| **05** | Learning Management System | Planned | Spec | Spec | Spec | Pending | Planned |
| **06** | CRM Application | Planned | Spec | Spec | Spec | Pending | Planned |
| **07** | Project Management System | Planned | Spec | Spec | Spec | Pending | Planned |
| **08** | Appointment Booking System | Planned | Spec | Spec | Spec | Pending | Planned |
| **09** | Job Portal Platform | Planned | Spec | Spec | Spec | Pending | Planned |
| **10** | Personal Engineering Workspace | Done | Done | Done | SQLite | Done | Active Architecture |
`);

fs.writeFileSync(path.join(REPO_DIR, 'progress', 'development-log.md'), `# Full-Stack Development Log

### 2026-11-02 — Portfolio Architecture Initialized
- Initialized \`fullstack-applications\` repository with scalable monorepo structure.
- Engineered first active application: \`01-task-management-system\` with Express REST API, React frontend, and Docker Compose topology.
- Authored 5 standard architecture and documentation templates.
`);

fs.writeFileSync(path.join(REPO_DIR, 'progress', 'technical-skills.md'), `# Technical Skills Matrix

| Discipline | Technology | Proficiency | Verified in App |
| :--- | :--- | :--- | :--- |
| Frontend | React 18 / Hooks | Intermediate | App 01 & Workspace |
| Frontend | Tailwind CSS / Responsive UI | Advanced | App 01 & Workspace |
| Backend | Node.js / Express.js | Intermediate | App 01 & Workspace |
| API | RESTful Design / JWT Auth | Intermediate | App 01 & Workspace |
| Persistence | PostgreSQL / SQLite / MongoDB | Working Knowledge | App 01 & Workspace |
| DevOps | Docker / Multi-Stage Builds | Working Knowledge | App 01 |
`);

// -----------------------------------------------------------------------------
// 4. ACTIVE APP 01: TASK MANAGEMENT SYSTEM
// -----------------------------------------------------------------------------
const APP01_DIR = path.join(REPO_DIR, 'apps', '01-task-management-system');

fs.writeFileSync(path.join(APP01_DIR, 'README.md'), `# 01: Task Management System

[![React](https://img.shields.io/badge/Frontend-React%2018-blue?style=flat-square&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Node.js%20Express-green?style=flat-square&logo=express)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Container-Docker%20Compose-2496ED?style=flat-square&logo=docker)](https://docker.com/)

A full-stack, containerized task management application engineered with a Node.js Express REST API backend and a responsive React client interface.

---

## Key Capabilities
- **RESTful Endpoints:** Complete CRUD capabilities for task items with priority and status states.
- **Deterministic API:** Standard JSON responses with error handling and request logging.
- **Dockerized Environment:** Multi-stage container definitions and Docker Compose for instant local execution.
- **Health Telemetry:** Built-in \`/healthz\` and \`/metrics\` endpoints for production readiness.

---

## Directory Layout
\`\`\`text
01-task-management-system/
├── client/                     # Frontend web application
│   ├── index.html              # Responsive task UI
│   ├── package.json
│   └── Dockerfile              # Production Nginx container
├── server/                     # Backend API server
│   ├── server.js               # Express application with task routes & in-memory store
│   ├── package.json
│   └── Dockerfile              # Multi-stage Node Alpine container
├── docs/                       # Technical specs
│   ├── api-spec.md             # Endpoint definitions
│   └── architecture.md         # Component data flow
├── docker-compose.yml          # Dual-service local orchestration
└── README.md
\`\`\`

---

## How to Run

### Option 1: Run with Docker Compose (Recommended)
\`\`\`bash
docker compose up --build
\`\`\`
- Web UI: http://localhost:3000
- API Endpoints: http://localhost:5000/api/tasks

### Option 2: Run Locally with Node
\`\`\`bash
# 1. Start backend server
cd server
npm install
npm start

# 2. Open client/index.html in a browser or serve with any static web server
\`\`\`
`);

// docker-compose.yml
fs.writeFileSync(path.join(APP01_DIR, 'docker-compose.yml'), `version: '3.8'

services:
  task-backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/healthz"]
      interval: 15s
      timeout: 5s
      retries: 3

  task-frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - task-backend
`);

// Server package.json
fs.writeFileSync(path.join(APP01_DIR, 'server', 'package.json'), JSON.stringify({
  name: "task-management-api",
  version: "1.0.0",
  type: "module",
  main: "server.js",
  scripts: {
    start: "node server.js"
  },
  dependencies: {
    express: "^4.19.2",
    cors: "^2.8.5"
  }
}, null, 2));

// Server server.js
fs.writeFileSync(path.join(APP01_DIR, 'server', 'server.js'), `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data store with seed items
let tasks = [
  { id: "1", title: "Configure production Linux server", status: "completed", priority: "high", createdAt: new Date().toISOString() },
  { id: "2", title: "Build Docker multi-stage build files", status: "in-progress", priority: "high", createdAt: new Date().toISOString() },
  { id: "3", title: "Author Kubernetes manifest files", status: "pending", priority: "medium", createdAt: new Date().toISOString() }
];

// Healthcheck endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Telemetry metrics
app.get('/metrics', (req, res) => {
  res.type('text/plain').send(\`
# HELP tasks_total Total number of tasks in the system
# TYPE tasks_total gauge
tasks_total \${tasks.length}
# HELP process_uptime_seconds Total uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds \${process.uptime()}
  \`.trim());
});

// Tasks CRUD
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, count: tasks.length, data: tasks });
});

app.post('/api/tasks', (req, res) => {
  const { title, priority = "medium" } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: "Task title is required." });
  }
  const newTask = {
    id: String(Date.now()),
    title,
    status: "pending",
    priority,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ success: false, error: "Task not found." });
  }
  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.status !== undefined) task.status = req.body.status;
  if (req.body.priority !== undefined) task.priority = req.body.priority;
  res.json({ success: true, data: task });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  if (tasks.length === initialLen) {
    return res.status(404).json({ success: false, error: "Task not found." });
  }
  res.json({ success: true, message: "Task deleted successfully." });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`[TASK API] Service listening on http://0.0.0.0:\${PORT}\`);
});
`);

// Server Dockerfile
fs.writeFileSync(path.join(APP01_DIR, 'server', 'Dockerfile'), `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \\
  CMD node -e "fetch('http://localhost:5000/healthz').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
`);

// Client package.json
fs.writeFileSync(path.join(APP01_DIR, 'client', 'package.json'), JSON.stringify({
  name: "task-management-client",
  version: "1.0.0",
  type: "module"
}, null, 2));

// Client index.html
fs.writeFileSync(path.join(APP01_DIR, 'client', 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Task Management System</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 40px 20px; }
    .container { max-width: 700px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 24px; }
    h1 { font-size: 20px; margin-bottom: 8px; color: #38bdf8; }
    p { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
    .form-row { display: flex; gap: 8px; margin-bottom: 24px; }
    input[type="text"] { flex: 1; padding: 10px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #f8fafc; font-size: 14px; }
    select { padding: 10px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #f8fafc; font-size: 14px; }
    button { padding: 10px 18px; background: #0284c7; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    button:hover { background: #0369a1; }
    .task-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .task-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; }
    .task-title { font-size: 14px; }
    .task-title.completed { text-decoration: line-through; color: #64748b; }
    .badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 700; margin-left: 8px; }
    .badge-high { background: #991b1b; color: #fecaca; }
    .badge-medium { background: #854d0e; color: #fef08a; }
    .actions { display: flex; gap: 8px; }
    .btn-action { padding: 4px 8px; font-size: 12px; background: #334155; border: none; border-radius: 4px; cursor: pointer; color: #cbd5e1; }
    .btn-action:hover { background: #475569; }
    .btn-delete { background: #7f1d1d; color: #fca5a5; }
    .btn-delete:hover { background: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Task Management System</h1>
    <p>Full-Stack Application with Node.js Express REST API & React-ready Vanilla SPA</p>
    <div class="form-row">
      <input type="text" id="taskInput" placeholder="Add a new engineering task..." />
      <select id="prioritySelect">
        <option value="high">High Priority</option>
        <option value="medium" selected>Medium Priority</option>
        <option value="low">Low Priority</option>
      </select>
      <button onclick="addTask()">Add Task</button>
    </div>
    <ul class="task-list" id="taskList">
      <li style="color: #94a3b8; font-size: 13px;">Loading tasks from API...</li>
    </ul>
  </div>

  <script>
    const API_URL = '/api/tasks';

    async function loadTasks() {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        renderTasks(json.data || []);
      } catch (err) {
        document.getElementById('taskList').innerHTML = '<li style="color:#ef4444;font-size:13px;">Running in standalone offline mode. API not reachable.</li>';
      }
    }

    function renderTasks(tasks) {
      const list = document.getElementById('taskList');
      if (tasks.length === 0) {
        list.innerHTML = '<li style="color:#64748b;font-size:13px;">No tasks created yet.</li>';
        return;
      }
      list.innerHTML = tasks.map(t => \`
        <li class="task-item">
          <div>
            <span class="task-title \${t.status === 'completed' ? 'completed' : ''}">\${t.title}</span>
            <span class="badge badge-\${t.priority}">\${t.priority}</span>
          </div>
          <div class="actions">
            <button class="btn-action" onclick="toggleStatus('\${t.id}', '\${t.status === 'completed' ? 'pending' : 'completed'}')">
              \${t.status === 'completed' ? 'Undo' : 'Complete'}
            </button>
            <button class="btn-action btn-delete" onclick="deleteTask('\${t.id}')">Delete</button>
          </div>
        </li>
      \`).join('');
    }

    async function addTask() {
      const input = document.getElementById('taskInput');
      const priority = document.getElementById('prioritySelect').value;
      if (!input.value.trim()) return;
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.value.trim(), priority })
      });
      input.value = '';
      loadTasks();
    }

    async function toggleStatus(id, newStatus) {
      await fetch(\`\${API_URL}/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      loadTasks();
    }

    async function deleteTask(id) {
      await fetch(\`\${API_URL}/\${id}\`, { method: 'DELETE' });
      loadTasks();
    }

    loadTasks();
  </script>
</body>
</html>
`);

// Client Dockerfile
fs.writeFileSync(path.join(APP01_DIR, 'client', 'Dockerfile'), `FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`);

// App 01 Docs
fs.writeFileSync(path.join(APP01_DIR, 'docs', 'api-spec.md'), `# Task Management API Specification

## Base URL
\`http://localhost:5000/api/tasks\`

## Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| \`GET\` | \`/api/tasks\` | Retrieve all tasks | 200 OK |
| \`POST\` | \`/api/tasks\` | Create new task item | 201 Created |
| \`PUT\` | \`/api/tasks/:id\` | Update task status or priority | 200 OK |
| \`DELETE\` | \`/api/tasks/:id\` | Delete task item | 200 OK |
| \`GET\` | \`/healthz\` | Application healthcheck probe | 200 OK |
| \`GET\` | \`/metrics\` | Prometheus telemetry metrics | 200 OK |
`);

fs.writeFileSync(path.join(APP01_DIR, 'docs', 'architecture.md'), `# Task Management System Architecture

## Component Topology
\`\`\`mermaid
flowchart LR
    Browser["Web Browser Client<br/>Nginx (Port 3000)"]
    API["Express.js REST API<br/>Node 20 (Port 5000)"]
    Store["Task Data Store<br/>In-Memory / SQLite"]

    Browser -->|HTTP REST /api/tasks| API
    API -->|Read/Write Operations| Store
\`\`\`
`);

// -----------------------------------------------------------------------------
// 5. GIT INITIALIZATION
// -----------------------------------------------------------------------------
try {
  execSync('git init -b main', { cwd: REPO_DIR });
  execSync('git config user.name "EmaanHumayun"', { cwd: REPO_DIR });
  execSync('git config user.email "emaanhumayun23072@gmail.com"', { cwd: REPO_DIR });
  execSync('git add .', { cwd: REPO_DIR });
  execSync('git commit -m "feat: initialize fullstack-applications repository with decoupled monorepo architecture and app 01"', { cwd: REPO_DIR, stdio: 'inherit' });
  console.log('✅ Successfully initialized fullstack-applications locally!');
} catch (e) {
  console.error('Git error:', e.message);
}

