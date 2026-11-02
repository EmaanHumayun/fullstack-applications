# 01: Task Management System

[![React](https://img.shields.io/badge/Frontend-React%2018-blue?style=flat-square&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Node.js%20Express-green?style=flat-square&logo=express)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Container-Docker%20Compose-2496ED?style=flat-square&logo=docker)](https://docker.com/)

A full-stack, containerized task management application engineered with a Node.js Express REST API backend and a responsive React client interface.

---

## Key Capabilities
- **RESTful Endpoints:** Complete CRUD capabilities for task items with priority and status states.
- **Deterministic API:** Standard JSON responses with error handling and request logging.
- **Dockerized Environment:** Multi-stage container definitions and Docker Compose for instant local execution.
- **Health Telemetry:** Built-in `/healthz` and `/metrics` endpoints for production readiness.

---

## Directory Layout
```text
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
```

---

## How to Run

### Option 1: Run with Docker Compose (Recommended)
```bash
docker compose up --build
```
- Web UI: http://localhost:3000
- API Endpoints: http://localhost:5000/api/tasks

### Option 2: Run Locally with Node
```bash
# 1. Start backend server
cd server
npm install
npm start

# 2. Open client/index.html in a browser or serve with any static web server
```
