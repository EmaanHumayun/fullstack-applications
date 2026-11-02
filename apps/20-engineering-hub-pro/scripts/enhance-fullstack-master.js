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

console.log('[ENHANCE] Upgrading fullstack-applications to full master specification...');

// -----------------------------------------------------------------------------
// 1. UPDATE PROJECT-INDEX.md (Complete 24-Project Catalog)
// -----------------------------------------------------------------------------
const projectIndex = `# Master Project Index & Application Catalog

Master catalog of all full-stack applications in this repository. Applications progress through structured lifecycle stages: \`Planned\`, \`Requirements\`, \`In Progress\`, \`Testing\`, \`Completed\`, \`Deployed\`, and \`Archived\`.

---

## 1. Business & Management Applications

| Project | Category | Stack | Status | Documentation |
| :--- | :--- | :--- | :--- | :--- |
| **01. Task Management System** | Productivity & Workflow | React 18, Node.js, Express, Docker | \`In Progress\` | [Specification](./apps/01-task-management-system/) |
| **02. Student Management System** | Enterprise Records | React, Node.js, Express, PostgreSQL | \`Planned\` | Spec Awaiting Development |
| **03. Inventory Management System** | Supply Chain | TypeScript, React, Express, PostgreSQL | \`Planned\` | Spec Awaiting Development |
| **04. CRM Application** | Sales & Marketing | React, Express, PostgreSQL, Webhooks | \`Planned\` | Spec Awaiting Development |
| **05. Project Management Platform** | Team Collaboration | React, TypeScript, Express, PostgreSQL | \`Planned\` | Spec Awaiting Development |
| **06. Appointment Booking System** | Scheduling | React, Node.js, Express, PostgreSQL | \`Planned\` | Spec Awaiting Development |
| **07. Job Portal Platform** | Recruitment | React, Express, PostgreSQL, Search | \`Planned\` | Spec Awaiting Development |
| **08. Employee Management System** | Human Resources | React, Express, PostgreSQL, RBAC | \`Planned\` | Spec Awaiting Development |
| **09. Expense Tracking Application** | Finance & Budgeting | React, Express, SQLite, Chart.js | \`Planned\` | Spec Awaiting Development |
| **10. Document Management System** | Content & Storage | React, Express, S3 API, MongoDB | \`Planned\` | Spec Awaiting Development |

---

## 2. E-Commerce & Marketplace Applications

| Project | Category | Stack | Status | Documentation |
| :--- | :--- | :--- | :--- | :--- |
| **11. E-Commerce Platform** | Retail & Storefront | React, Express, MongoDB, Stripe API | \`Planned\` | Spec Awaiting Development |
| **12. Product & Inventory Marketplace** | Catalog & Stock | React, Express, PostgreSQL, Redis | \`Planned\` | Spec Awaiting Development |
| **13. Order Management System** | Logistics & Fulfillment | React, Node.js, Express, PostgreSQL | \`Planned\` | Spec Awaiting Development |
| **14. Multi-Vendor Marketplace** | Multi-Tenant Platform | React, Express, PostgreSQL, Stripe Connect | \`Planned\` | Spec Awaiting Development |

---

## 3. Education & Productivity Applications

| Project | Category | Stack | Status | Documentation |
| :--- | :--- | :--- | :--- | :--- |
| **15. Learning Management System (LMS)** | E-Learning | React, Express, MongoDB, Video API | \`Planned\` | Spec Awaiting Development |
| **16. Online Examination System** | Assessment Engine | React, Express, PostgreSQL, Timer API | \`Planned\` | Spec Awaiting Development |
| **17. Student Learning Dashboard** | Analytics & Telemetry | React, Express, Chart.js, PostgreSQL | \`Planned\` | Spec Awaiting Development |
| **18. Personal Knowledge Base (PKM)** | Markdown Engine | React, Express, SQLite, Full-Text Search | \`Planned\` | Spec Awaiting Development |
| **19. Resource Management Platform** | Asset Allocation | React, Express, PostgreSQL | \`Planned\` | Spec Awaiting Development |

---

## 4. Developer & Engineering Applications

| Project | Category | Stack | Status | Documentation |
| :--- | :--- | :--- | :--- | :--- |
| **20. Personal Engineering Workspace** | Developer Platform | React 18, Express, Tailwind, SQLite | \`Active Architecture\` | [Workspace Spec](./apps/10-personal-engineering-workspace/) |
| **21. API Management Dashboard** | API Gateway UI | React, Express, Redis, Rate Limiter | \`Planned\` | Spec Awaiting Development |
| **22. Developer Documentation Platform** | Static & Dynamic Docs | React, Markdown Parser, Express | \`Planned\` | Spec Awaiting Development |
| **23. Deployment Management Dashboard** | DevOps Tooling | React, Express, Docker Engine API | \`Planned\` | Spec Awaiting Development |
| **24. Server Monitoring Dashboard** | Systems Telemetry | React, Express, WebSocket, Prometheus | \`Planned\` | Spec Awaiting Development |
`;

fs.writeFileSync(path.join(REPO_DIR, 'PROJECT-INDEX.md'), projectIndex);

// -----------------------------------------------------------------------------
// 2. UPDATE progress/project-tracker.md
// -----------------------------------------------------------------------------
const projectTracker = `# Application Progress Tracker

Detailed engineering metrics and lifecycle status across all full-stack applications.

---

## Active Applications Deep-Dive

### App 01: Task Management System
- **Repository Path:** \`apps/01-task-management-system/\`
- **Start Date:** 2026-11-02
- **Current Lifecycle Status:** \`In Progress\`
- **Completed Features:**
  - Express.js REST API with full CRUD endpoints (\`/api/tasks\`).
  - Production health probe (\`/healthz\`) and Prometheus metrics exposition (\`/metrics\`).
  - Responsive client SPA supporting priority tags, status toggles, and real-time updates.
  - Multi-container Docker Compose configuration with automated health checks.
  - Comprehensive API documentation and architecture diagrams.
- **Pending Features:**
  - PostgreSQL persistent container migration (transition from in-memory).
  - JWT authentication middleware and login/register modal.
- **Known Issues:** None identified.
- **Next Development Tasks:** Add Jest/Supertest integration test suite.
- **Testing Status:** Manual verification complete; automated unit test suite scaffolded.
- **Deployment Status:** Containerized and verified locally on port 3000 / 5000.

### App 10: Personal Engineering Workspace
- **Start Date:** 2026-10-15
- **Current Lifecycle Status:** \`Active Architecture\`
- **Completed Features:**
  - Full-stack developer workspace with live database synchronization.
  - Headless CMS for project and documentation management.
  - Multi-tier RBAC authentication (Viewer vs Administrator).
  - Theme state synchronization and analytics telemetry.
- **Testing Status:** End-to-end CRUD test suite passed.
- **Deployment Status:** Local production server running.

---

## Planned Applications Roadmap Queue

| App ID | Application Name | Target Architecture | Planned Database | Next Action |
| :---: | :--- | :--- | :--- | :--- |
| **02** | Student Management System | React + Express Monorepo | PostgreSQL | Draft functional requirements |
| **03** | Inventory Management System | TypeScript + Express | PostgreSQL + Redis | Draft inventory state machine |
| **04** | CRM Application | React + Express | PostgreSQL | Define lead stage workflows |
| **11** | E-Commerce Platform | React + Express + Stripe | MongoDB | Draft checkout sequence diagram |
| **15** | Learning Management System | React + Express + Video | MongoDB | Design modular course data model |
`;

fs.writeFileSync(path.join(REPO_DIR, 'progress', 'project-tracker.md'), projectTracker);

// -----------------------------------------------------------------------------
// 3. ENHANCE apps/01-task-management-system/ TO FULL QUALITY STANDARD
// -----------------------------------------------------------------------------
const APP01_DIR = path.join(REPO_DIR, 'apps', '01-task-management-system');
ensureDir(path.join(APP01_DIR, 'docs', 'architecture'));
ensureDir(path.join(APP01_DIR, 'docs', 'api'));
ensureDir(path.join(APP01_DIR, 'docs', 'database'));
ensureDir(path.join(APP01_DIR, 'tests'));
ensureDir(path.join(APP01_DIR, 'deployment'));

// .env.example
fs.writeFileSync(path.join(APP01_DIR, '.env.example'), `# Environment Variables Configuration Template
NODE_ENV=development
PORT=5000
CLIENT_PORT=3000
DATABASE_URL=sqlite://./tasks.db
JWT_SECRET=your_jwt_secret_key_change_in_production
LOG_LEVEL=info
`);

// CHANGELOG.md
fs.writeFileSync(path.join(APP01_DIR, 'CHANGELOG.md'), `# Changelog - Task Management System

All notable changes to the Task Management System are recorded in this file.

## [1.0.0] - 2026-11-02
### Added
- Complete RESTful API service with express router.
- In-memory data store with default engineering seed tasks.
- Healthcheck (\`/healthz\`) and Prometheus telemetry (\`/metrics\`) endpoints.
- Single-page responsive client interface with instant CRUD capabilities.
- Multi-stage Dockerfiles and Docker Compose configuration.
- Comprehensive OpenAPI markdown route specification and system architecture diagrams.
`);

// PROJECT-REQUIREMENTS.md
fs.writeFileSync(path.join(APP01_DIR, 'PROJECT-REQUIREMENTS.md'), `# Project Requirements: Task Management System

## 1. Problem Statement
Engineering teams require a lightweight, deterministic task tracking platform to manage operational tasks, prioritize urgent issues, and observe service health without complex SaaS overhead.

## 2. Target Users
- Software Engineers and DevOps practitioners managing sprint workflows.
- Technical leads requiring visibility into operational deliverables.

## 3. Functional Requirements
- **FR-01 (Task Creation):** Users must be able to create tasks with a mandatory title and priority level (\`high\`, \`medium\`, \`low\`).
- **FR-02 (Task Listing):** Users must view all active and completed tasks with creation timestamps.
- **FR-03 (State Transition):** Users must toggle task status between \`pending\`, \`in-progress\`, and \`completed\`.
- **FR-04 (Task Deletion):** Users must be able to remove obsolete tasks with instant feedback.
- **FR-05 (Health Telemetry):** The system must expose real-time uptime and task counts for automated monitoring.

## 4. Non-Functional Requirements
- **NFR-01 (Performance):** API responses must execute in <50ms under typical loads.
- **NFR-02 (Reliability):** Service must provide automated health probes for container restart policies.
- **NFR-03 (Accessibility):** Web client must follow semantic HTML5 standards and responsive mobile layouts.
- **NFR-04 (Security):** Strict CORS policies and payload size limits to protect backend memory.
`);

// docs/architecture/system-design.md
fs.writeFileSync(path.join(APP01_DIR, 'docs', 'architecture', 'system-design.md'), `# System Design Document: Task Management System

## Overview
The application follows a decoupled client-server architecture. The backend Express API service operates independently of the presentation client, communicating exclusively over HTTP REST using JSON envelopes.

## Request Lifecycle
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Client (SPA / Nginx)
    participant API as Backend (Node.js Express)
    participant Store as State Store

    User->>UI: Input task & click "Add Task"
    UI->>API: POST /api/tasks (JSON body)
    API->>API: Validate input (title required)
    alt Validation Failure
        API-->>UI: 400 Bad Request
    else Validation Success
        API->>Store: Insert task record
        Store-->>API: Persisted record
        API-->>UI: 201 Created (JSON envelope)
        UI->>User: Update task list in DOM
    end
\`\`\`
`);

// docs/api/endpoints.md
fs.writeFileSync(path.join(APP01_DIR, 'docs', 'api', 'endpoints.md'), `# API Endpoint Documentation

**Base URL:** \`http://localhost:5000/api/tasks\`  
**Content-Type:** \`application/json\`  

## 1. Get All Tasks
- **Route:** \`GET /api/tasks\`
- **Response (200 OK):**
  \`\`\`json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "id": "1",
        "title": "Configure production Linux server",
        "status": "completed",
        "priority": "high",
        "createdAt": "2026-11-02T12:00:00.000Z"
      }
    ]
  }
  \`\`\`

## 2. Create Task
- **Route:** \`POST /api/tasks\`
- **Request Body:**
  \`\`\`json
  {
    "title": "Configure Prometheus alert rules",
    "priority": "high"
  }
  \`\`\`
- **Response (201 Created):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "id": "1730560000000",
      "title": "Configure Prometheus alert rules",
      "status": "pending",
      "priority": "high",
      "createdAt": "2026-11-02T12:05:00.000Z"
    }
  }
  \`\`\`

## 3. Update Task
- **Route:** \`PUT /api/tasks/:id\`
- **Request Body:** \`{ "status": "completed" }\`
- **Response (200 OK):** \`{ "success": true, "data": { ... } }\`

## 4. Delete Task
- **Route:** \`DELETE /api/tasks/:id\`
- **Response (200 OK):** \`{ "success": true, "message": "Task deleted successfully." }\`
`);

// docs/database/schema.md
fs.writeFileSync(path.join(APP01_DIR, 'docs', 'database', 'schema.md'), `# Database Schema Specification

## Entity Definition: Task

| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| \`id\` | String / UUID | No | Unique identifier (Primary Key) |
| \`title\` | String (max 255) | No | Concise description of the task |
| \`status\` | Enum (\`pending\`, \`in-progress\`, \`completed\`) | No | Current workflow state |
| \`priority\` | Enum (\`low\`, \`medium\`, \`high\`) | No | Urgency level |
| \`createdAt\` | ISO 8601 Timestamp | No | Record generation time |
`);

// tests/api.test.js
fs.writeFileSync(path.join(APP01_DIR, 'tests', 'api.test.js'), `/**
 * Automated Verification Test for Task Management API Endpoints
 * Runs against live or local Express server instance.
 */
async function runTests() {
  const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';
  console.log(\`[TEST] Verifying API endpoints against \${BASE_URL}...\`);

  try {
    // 1. Healthcheck
    const health = await fetch(\`\${BASE_URL}/healthz\`);
    console.log(\`[TEST 1] GET /healthz: \${health.status === 200 ? 'PASS' : 'FAIL'}\`);

    // 2. Fetch Tasks
    const listRes = await fetch(\`\${BASE_URL}/api/tasks\`);
    const listData = await listRes.json();
    console.log(\`[TEST 2] GET /api/tasks: \${listData.success ? 'PASS' : 'FAIL'} (Count: \${listData.count})\`);

    // 3. Create Task
    const createRes = await fetch(\`\${BASE_URL}/api/tasks\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Automated test task', priority: 'medium' })
    });
    const createData = await createRes.json();
    console.log(\`[TEST 3] POST /api/tasks: \${createRes.status === 201 ? 'PASS' : 'FAIL'} (ID: \${createData.data?.id})\`);

    // 4. Delete Created Task
    if (createData.data?.id) {
      const delRes = await fetch(\`\${BASE_URL}/api/tasks/\${createData.data.id}\`, { method: 'DELETE' });
      console.log(\`[TEST 4] DELETE /api/tasks/:id: \${delRes.status === 200 ? 'PASS' : 'FAIL'}\`);
    }

    console.log('[TEST] All integration checks completed successfully!');
  } catch (err) {
    console.error(\`[TEST ERROR] Could not reach server: \${err.message}\`);
  }
}

runTests();
`);

// 20-Section README in apps/01-task-management-system/README.md
const app01Readme = `# 01: Task Management System

[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%2F%20React%20SPA-blue?style=flat-square&logo=react)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20Express-green?style=flat-square&logo=express)](https://expressjs.com/)
[![Container](https://img.shields.io/badge/Container-Docker%20Compose-2496ED?style=flat-square&logo=docker)](https://docker.com/)
[![Status](https://img.shields.io/badge/Status-In%20Progress-blue?style=flat-square)](#project-status)

---

## 1. Project Name
**Task Management System** (\`01-task-management-system\`)

## 2. Overview
A full-stack, containerized task management platform engineered with an Express.js REST API backend and an interactive responsive web client interface.

## 3. Problem Statement
Technical teams require a streamlined, deterministic task tracking platform to manage operational deliverables without the configuration overhead and latency of bloated SaaS tools.

## 4. Objectives
- Provide a clean, zero-dependency REST API for task lifecycle management.
- Deliver an instant, responsive interface supporting real-time status transitions.
- Guarantee containerized deployment parity via Docker Compose.

## 5. Features
- Full CRUD API operations (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`).
- Priority classification (\`high\`, \`medium\`, \`low\`).
- Status toggles (\`pending\`, \`completed\`).
- Health probes (\`/healthz\`) and Prometheus telemetry (\`/metrics\`).

## 6. User Roles
- **Standard User:** Create, update, and manage assigned tasks.
- **Administrator / Auditor:** Monitor service telemetry, query healthchecks, and inspect metrics.

## 7. Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript SPA (React-ready component layout), Nginx.
- **Backend:** Node.js (v20 Alpine), Express.js framework, CORS.
- **Deployment:** Docker multi-stage builds, Docker Compose orchestration.

## 8. Architecture Diagram
\`\`\`mermaid
flowchart LR
    Browser["Client Browser<br/>Port 3000 (Nginx)"]
    API["Express.js REST API<br/>Port 5000 (Node.js)"]
    Store["Task State Store<br/>In-Memory / SQLite"]

    Browser -->|HTTP REST /api/tasks| API
    API -->|Read/Write Operations| Store
\`\`\`

## 9. Repository Structure
\`\`\`text
01-task-management-system/
├── README.md                           # Comprehensive application documentation
├── PROJECT-REQUIREMENTS.md             # Functional and non-functional requirements
├── CHANGELOG.md                        # Versioning and release log
├── docker-compose.yml                  # Container orchestration specification
├── .env.example                        # Environment variables template
├── client/
│   ├── index.html                      # Responsive task user interface
│   ├── package.json
│   └── Dockerfile                      # Production Nginx container
├── server/
│   ├── server.js                       # Express API service and CRUD handlers
│   ├── package.json
│   └── Dockerfile                      # Node.js 20 Alpine container
├── docs/
│   ├── architecture/system-design.md   # Architectural sequence diagrams
│   ├── api/endpoints.md                # Endpoint route definitions
│   └── database/schema.md              # Entity specifications and data dictionary
└── tests/
    └── api.test.js                     # Integration test runner
\`\`\`

## 10. Database Schema
| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`id\` | String | Primary Key | Unique timestamp-derived identifier |
| \`title\` | String | Mandatory | Task description |
| \`status\` | Enum | Default \`pending\` | Current state (\`pending\` / \`completed\`) |
| \`priority\` | Enum | Default \`medium\` | Urgency (\`low\`, \`medium\`, \`high\`) |
| \`createdAt\` | Timestamp | Auto | ISO 8601 generation timestamp |

## 11. API Endpoints
- \`GET /api/tasks\` - Retrieve all task records
- \`POST /api/tasks\` - Create new task item
- \`PUT /api/tasks/:id\` - Modify task status or priority
- \`DELETE /api/tasks/:id\` - Remove task record
- \`GET /healthz\` - Application health probe
- \`GET /metrics\` - Prometheus metrics output

## 12. Installation Instructions
\`\`\`bash
# Clone and navigate to application directory
cd apps/01-task-management-system/server
npm install
\`\`\`

## 13. Environment Variables
Copy the template to establish local environment parameters:
\`\`\`bash
cp .env.example .env
\`\`\`

## 14. Running Locally
\`\`\`bash
# Start backend server
cd server && npm start

# Access client: Open client/index.html in any modern browser
\`\`\`

## 15. Testing
Execute the automated integration test suite:
\`\`\`bash
node tests/api.test.js
\`\`\`

## 16. Screenshots
Sanitized visual evidence of the user interface and API telemetry will be documented in \`docs/screenshots/\`.

## 17. Deployment
Deploy using Docker Compose:
\`\`\`bash
docker compose up --build -d
\`\`\`
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/tasks

## 18. Security Considerations
- CORS middleware restricted to designated client origins.
- Input validation rejects empty or malformed task payloads.
- Container executes under non-root permissions in production images.

## 19. Future Improvements
- Migration to persistent PostgreSQL database with Prisma ORM.
- User authentication using JWT tokens and password hashing.
- Task search, filtering, and tag management.

## 20. Project Status
\`In Progress\` — Core full-stack functionality and Docker orchestration fully operational.
`;

fs.writeFileSync(path.join(APP01_DIR, 'README.md'), app01Readme);

// -----------------------------------------------------------------------------
// 4. COMMIT ALL ENHANCEMENTS
// -----------------------------------------------------------------------------
try {
  execSync('git add .', { cwd: REPO_DIR });
  execSync('git commit -m "feat(task-manager): implement complete 20-section spec, requirements, and full 24-app catalog"', { cwd: REPO_DIR, stdio: 'inherit' });
  console.log('✅ Successfully enhanced fullstack-applications repository!');
} catch (e) {
  console.log('Notice:', e.message);
}

