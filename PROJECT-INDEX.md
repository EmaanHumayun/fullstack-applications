# Master Project Index & Application Roadmap

This document outlines the strategic roadmap of real-world full-stack applications maintained within this repository. Applications are partitioned into active implementations and planned project specifications.

---

## Application Portfolio Matrix

| App ID | Application Name | Primary Tech Stack | Database | Architectural Highlight | Status |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **01** | [**Task Management System**](./apps/01-task-management-system/) | React 18, Node.js, Express, Docker | PostgreSQL / SQLite | Stateless JWT Auth, RBAC, RESTful API | `Active` |
| **02** | **Student Management System** | React, Node.js, Express, Tailwind | PostgreSQL | Complex relational joins, grade tracking, PDF report generation | `Planned` |
| **03** | **Inventory Management System** | TypeScript, React, Express | PostgreSQL / Redis | Real-time stock alerts, audit logging, barcode indexing | `Planned` |
| **04** | **E-Commerce Platform** | React, Express, Stripe API | MongoDB / PostgreSQL | Cart state, payment webhooks, order lifecycle state machine | `Planned` |
| **05** | **Learning Management System (LMS)** | React, Node.js, Video streaming API | MongoDB | Video progress tracking, modular quiz engine, certificates | `Planned` |
| **06** | **CRM Application** | React, Express, Webhook Ingestion | PostgreSQL | Sales pipeline Kanban, lead scoring, email automation | `Planned` |
| **07** | **Project Management System** | React, TypeScript, Express | MongoDB / PostgreSQL | Agile sprint boards, Gantt chart dependencies, team metrics | `Planned` |
| **08** | **Appointment Booking System** | React, Node.js, Express | PostgreSQL | Time slot reservation, double-booking prevention, calendar sync | `Planned` |
| **09** | **Job Portal Platform** | React, Express, Elasticsearch / SQL | PostgreSQL | Resume parsing, full-text job search, candidate applicant tracking | `Planned` |
| **10** | **Personal Engineering Workspace** | React 18, Node.js, Express, Tailwind | SQLite / MongoDB | Telemetry graphs, headless CMS, system logs, theme sync | `Active Architecture` |

---

## Application Development Policy
- Monorepo Isolation: Each application directory under `apps/` is fully decoupled from others, maintaining its own `package.json`, dependencies, and environmental configurations.
- Deployment Parity: Every application includes Dockerfiles and `docker-compose.yml` for single-command local execution.
