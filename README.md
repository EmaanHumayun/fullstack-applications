# Full-Stack Applications Portfolio

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
| **01** | [**Task Management System**](./apps/01-task-management-system/) | Task tracking, priority queues, status workflows | SQLite / PostgreSQL | `Active` |
| **02** | **Student Management System** | Student enrollment, courses, grade tracking | PostgreSQL | `Planned` |
| **03** | **Inventory Management System** | Stock levels, supplier orders, audit logs | PostgreSQL | `Planned` |
| **04** | **E-Commerce Platform** | Product catalog, cart state, checkout webhooks | MongoDB | `Planned` |
| **05** | **Learning Management System** | Course modules, progress tracking, quizzes | MongoDB | `Planned` |
| **06** | **CRM Application** | Lead management, deal stages, client interaction | PostgreSQL | `Planned` |
| **07** | **Project Management System** | Kanban boards, sprint tracking, milestones | PostgreSQL | `Planned` |
| **08** | **Appointment Booking System** | Calendar scheduling, slot reservation, reminders | PostgreSQL | `Planned` |
| **09** | **Job Portal Platform** | Job postings, applicant resumes, recruiter filters | PostgreSQL | `Planned` |
| **10** | **Personal Engineering Workspace** | Headless portfolio CMS, telemetry, live themes | MongoDB / SQLite | `Active Architecture` |

---

## Repository Architecture

```text
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
```

---

## Standard Application Directory Specification

When an application moves from planned to active development, it conforms to the following standard layout:

```text
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
```

---

## Professional Coordinates

- **Engineer:** Emaan Humayun
- **Specialization:** Software Engineer | DevOps Engineer
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)
- **Central Hub:** [Engineering Portfolio](https://github.com/EmaanHumayun/engineering-portfolio)
