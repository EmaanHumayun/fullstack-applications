import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = path.join(__dirname, '..', 'github-ecosystem');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function write(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
}

const LEVELS = [
  {
    repoName: 'ai-agents-beginner-projects',
    title: 'AI Agents Beginner Projects (Level 1)',
    tier: 'Level 1: Beginner',
    description: 'Foundational AI agent projects covering prompt structuring, token tracking, function calling, tool schemas, SQLite persistence, and vector RAG.',
    projects: [
      {
        id: '01',
        slug: '01-intelligent-ai-chat-agent',
        name: 'Intelligent AI Chat Agent',
        status: 'Completed',
        summary: 'Interactive terminal-based chat agent with sliding-window history, token and cost calculation, and structured error handling.',
        tech: 'Python 3.10+, LLM API, Pydantic, Tokenizer, Pytest',
        problem: 'Applications need conversational interfaces that strictly enforce system personas, handle context window limits gracefully, and monitor token expenditures.',
        users: 'Developers, system operators, conversational support users.',
        concepts: 'System vs user messages, context windows, temperature parameters, sliding-window context, token and cost modeling, exception retries.',
        inputs: 'User natural language query via terminal interface or programmatic call.',
        outputs: 'Model response stream, token usage breakdown, conversation turn latency.'
      },
      {
        id: '02',
        slug: '02-tool-calling-ai-agent',
        name: 'Tool-Calling AI Agent',
        status: 'Planned',
        summary: 'Deterministic tool-calling agent executing mathematical calculations, date-time lookups, and unit conversions via Pydantic schemas.',
        tech: 'Python, LLM Function Calling, Pydantic v2, JSON Schema',
        problem: 'Language models produce inaccurate results when performing multi-step arithmetic, date math, or unit conversions without deterministic tools.',
        users: 'Analytical professionals, engineering calculation workflows.',
        concepts: 'Function calling schemas, Pydantic validation, tool selection loops, tool argument error recovery, separation of model reasoning and tool execution.',
        inputs: 'Natural language questions requiring computation or factual lookup.',
        outputs: 'Structured execution plan, deterministic tool result, grounded final response.'
      },
      {
        id: '03',
        slug: '03-ai-research-assistant',
        name: 'AI Research Assistant',
        status: 'Planned',
        summary: 'Web research extraction agent querying search APIs, scraping content, and generating structured markdown reports with source citations.',
        tech: 'Python, Search API, Requests, BeautifulSoup, JSON',
        problem: 'Synthesizing technical research across disparate web pages is time-consuming and often plagued by unsourced or fabricated claims.',
        users: 'Researchers, technical writers, competitive analysts.',
        concepts: 'Search tool integration, HTML content extraction, source attribution, citation anchors, hallucination minimization.',
        inputs: 'Research prompt or query topic.',
        outputs: 'Comprehensive Markdown research brief with inline numerical citations.'
      },
      {
        id: '04',
        slug: '04-personal-productivity-agent',
        name: 'Personal Productivity Agent',
        status: 'Planned',
        summary: 'Task automation agent parsing natural language requests into SQLite database CRUD operations with automatic deadline extraction.',
        tech: 'Python, SQLite, Pydantic, Dateparser, CRUD Tools',
        problem: 'Users need conversational task management that reliably extracts deadlines and priority tiers without manual form entry.',
        users: 'Individual knowledge workers, team coordinators.',
        concepts: 'Database tool integration, SQL transactions, intent extraction, state management, daily summary generation.',
        inputs: 'Conversational task commands (e.g., "Schedule security audit by next Friday with high priority").',
        outputs: 'Database record confirmations, daily task agendas, query results.'
      },
      {
        id: '05',
        slug: '05-document-qa-agent',
        name: 'Document Q&A Agent',
        status: 'Planned',
        summary: 'Retrieval-Augmented Generation (RAG) agent chunking PDF documents, generating vector embeddings, and answering grounded questions.',
        tech: 'Python, Vector Store (ChromaDB/FAISS), Sentence Transformers, PyPDF',
        problem: 'Answering questions over proprietary enterprise documentation requires grounding answers in verifiable chunks without exceeding context limits.',
        users: 'Knowledge workers, compliance auditors, technical support teams.',
        concepts: 'Text chunking strategies, vector embeddings, cosine similarity search, RAG prompt augmentation, groundedness evaluation.',
        inputs: 'Document PDF/text files and user natural language questions.',
        outputs: 'Grounded answers with exact page and chunk attribution references.'
      }
    ]
  },
  {
    repoName: 'ai-agents-intermediate-projects',
    title: 'AI Agents Intermediate Projects (Level 2)',
    tier: 'Level 2: Intermediate',
    description: 'Stateful and integrated agents featuring persistent PostgreSQL/Redis memory, OAuth 2.0 email workflows, code repository analysis, and hybrid search RAG.',
    projects: [
      {
        id: '06',
        slug: '06-memory-enabled-personal-ai-agent',
        name: 'Memory-Enabled Personal AI Agent',
        status: 'Planned',
        summary: 'Hierarchical dual-tier memory agent combining Redis working context and PostgreSQL long-term episodic recall.',
        tech: 'Python, Redis, PostgreSQL, SQLAlchemy, pgvector',
        problem: 'Stateless agents forget user context and historical preferences across conversation sessions.',
        users: 'Personal executive assistants, customer-facing agents.',
        concepts: 'Short-term vs long-term memory, working memory buffers, vector recall, memory consolidation, user privacy deletion controls.',
        inputs: 'User conversational input across multiple sessions.',
        outputs: 'Contextually aware responses leveraging historical facts.'
      },
      {
        id: '07',
        slug: '07-ai-email-management-agent',
        name: 'AI Email Management Agent',
        status: 'Planned',
        summary: 'Gmail API integration prioritizing inbound emails, drafting contextual replies, and requiring human-in-the-loop authorization.',
        tech: 'Python, Gmail API, OAuth 2.0, Human-in-the-Loop, SQLite',
        problem: 'Managing high-volume email requires automated classification and drafting while strictly preventing unauthorized autonomous sending.',
        users: 'Operations leads, busy executives, customer support triage.',
        concepts: 'OAuth 2.0 token lifecycle, email MIME parsing, urgency scoring, human approval queues, audit trails.',
        inputs: 'Inbound email messages via Gmail API.',
        outputs: 'Categorized email feed, drafted responses awaiting human approval.'
      },
      {
        id: '08',
        slug: '08-ai-coding-assistant-agent',
        name: 'AI Coding Assistant Agent',
        status: 'Planned',
        summary: 'Static code analysis agent parsing AST trees, finding defects, and generating pull request summaries via GitHub API.',
        tech: 'Python, GitPython, AST Module, GitHub REST API, Pytest',
        problem: 'Code reviews require comprehensive repository understanding, syntax inspection, and automated pull request summarization.',
        users: 'Software engineers, tech leads, open-source maintainers.',
        concepts: 'AST syntax parsing, repository dependency graphing, static defect detection, GitHub API integration, PR generation.',
        inputs: 'Local Git repository path or GitHub repository URL.',
        outputs: 'Static analysis report, suggested patches, automated PR summary.'
      },
      {
        id: '09',
        slug: '09-rag-based-knowledge-base-agent',
        name: 'RAG-Based Knowledge Base Agent',
        status: 'Planned',
        summary: 'Advanced enterprise RAG pipeline combining BM25 keyword search, dense vector retrieval, and cross-encoder reranking.',
        tech: 'Python, Rank-BM25, Qdrant/PostgreSQL pgvector, Cross-Encoder Reranker',
        problem: 'Standard vector search struggles with exact keyword matching, code identifiers, and acronyms in enterprise documentation.',
        users: 'Enterprise knowledge workers, customer success teams.',
        concepts: 'Hybrid search fusion, reciprocal rank fusion (RRF), cross-encoder reranking, metadata filtering, hallucination reduction.',
        inputs: 'Technical queries across heterogeneous documentation sets.',
        outputs: 'Reranked source chunks and grounded responses.'
      },
      {
        id: '10',
        slug: '10-api-integration-agent',
        name: 'API Integration Agent',
        status: 'Planned',
        summary: 'FastAPI gateway orchestrating multi-step external REST API workflows with rate limiting, retries, and webhook callbacks.',
        tech: 'Python, FastAPI, HTTPX, OAuth 2.0, PostgreSQL',
        problem: 'Complex workflows require interacting with diverse third-party APIs that have differing rate limits, authentication schemes, and failure modes.',
        users: 'Integration engineers, backend platform teams.',
        concepts: 'API orchestration, exponential backoff, rate limiting, idempotency keys, webhook signature verification.',
        inputs: 'Workflow execution requests via REST API.',
        outputs: 'Orchestrated API call transcripts, execution telemetry, callback webhooks.'
      }
    ]
  },
  {
    repoName: 'ai-agents-advanced-projects',
    title: 'AI Agents Advanced Projects (Level 3)',
    tier: 'Level 3: Advanced',
    description: 'Planning agents, multi-agent collaboration topologies, guarded text-to-SQL data analytics, and quantitative agent evaluation frameworks.',
    projects: [
      {
        id: '11',
        slug: '11-autonomous-planning-execution-agent',
        name: 'Autonomous Planning & Execution Agent',
        status: 'Planned',
        summary: 'State-machine DAG planning engine decomposing goals, executing tasks, and dynamically replanning upon step failure.',
        tech: 'Python, LangGraph / StateGraph, Pydantic, Asyncio',
        problem: 'Complex goals cannot be executed linearly; agents require multi-step planning, state checkpoints, and automated recovery loops.',
        users: 'DevOps architects, backend engineers, workflow designers.',
        concepts: 'Goal decomposition, state machine transitions, DAG execution, dynamic replanning, failure boundary enforcement.',
        inputs: 'High-level business or engineering objective.',
        outputs: 'Executed step trace, intermediate state checkpoints, final deliverable.'
      },
      {
        id: '12',
        slug: '12-multi-agent-research-system',
        name: 'Multi-Agent Research System',
        status: 'Planned',
        summary: 'Collaborative agent collective (Researcher, Analyst, Fact-Checker, Report Writer) synthesizing in-depth investigative reports.',
        tech: 'Python, Multi-Agent Graph, LangGraph, Pydantic',
        problem: 'Investigative technical research requires distinct perspectives (gathering, analysis, critique, verification) to avoid bias and errors.',
        users: 'Research analysts, technical strategists, academic teams.',
        concepts: 'Multi-agent topologies, blackboard communication, task delegation, adversarial fact-checking, report synthesis.',
        inputs: 'Complex research brief.',
        outputs: 'Multi-agent thought traces, verified factual claims, comprehensive report.'
      },
      {
        id: '13',
        slug: '13-multi-agent-software-dev-system',
        name: 'Multi-Agent Software Development System',
        status: 'Planned',
        summary: 'Agile software development agent team (Product, Architect, Developer, Tester, Doc) generating and testing code in isolated sandboxes.',
        tech: 'Python, Subprocess Sandbox, Git Branching, Pytest Runner',
        problem: 'Autonomous code generation without architectural boundaries and automated test validation produces non-working code.',
        users: 'Software engineering teams, platform developers.',
        concepts: 'Agent role specialization, workspace isolation, automated test-driven feedback loops, pull request generation.',
        inputs: 'User story or feature requirement specification.',
        outputs: 'Architecture document, working source files, passing test suites, PR diff.'
      },
      {
        id: '14',
        slug: '14-ai-data-analyst-agent',
        name: 'AI Data Analyst Agent',
        status: 'Planned',
        summary: 'Guarded Text-to-SQL analyst inspecting schemas, validating queries via AST parser, executing read-only SQL, and generating charts.',
        tech: 'Python, SQLGlot, SQLAlchemy, PostgreSQL, Pandas, Matplotlib',
        problem: 'Business users need direct database answers without posing SQL injection or destructive table modification risks.',
        users: 'Business analysts, product managers, executive leadership.',
        concepts: 'Schema reflection, AST SQL validation, read-only transaction sandboxing, statistical charting, analytical reasoning.',
        inputs: 'Natural language analytical question.',
        outputs: 'Validated SQL query, query execution table, generated chart image, summary.'
      },
      {
        id: '15',
        slug: '15-agent-evaluation-testing-platform',
        name: 'Agent Evaluation & Testing Platform',
        status: 'Planned',
        summary: 'Automated evaluation platform benchmarking tool selection accuracy, hallucination rates, latency, and token costs.',
        tech: 'Python, Pytest, OpenTelemetry, Evaluation Datasets, Pandas',
        problem: 'Model updates or prompt changes can silently degrade agent reliability and tool-calling precision without regression testing.',
        users: 'AI engineers, QA teams, MLOps practitioners.',
        concepts: 'Agent evaluation metrics, tool selection precision, hallucination detection, cost/latency benchmarking, regression test suites.',
        inputs: 'Agent candidates, prompt variants, evaluation dataset.',
        outputs: 'Comprehensive evaluation matrix, pass/fail thresholds, performance comparison.'
      }
    ]
  },
  {
    repoName: 'ai-agents-professional-projects',
    title: 'AI Agents Professional Projects (Level 4)',
    tier: 'Level 4: Professional',
    description: 'Production-ready, observable, secure, and multi-tenant agent systems deployed on cloud and containerized infrastructure.',
    projects: [
      {
        id: '16',
        slug: '16-devops-ai-operations-agent',
        name: 'DevOps AI Operations Agent (AIOps)',
        status: 'Planned',
        summary: 'AIOps operational agent analyzing system logs, correlating Prometheus alerts, matching runbooks, and enforcing human-in-the-loop approvals.',
        tech: 'Python, Paramiko, Prometheus Client, Docker SDK, Alertmanager',
        problem: 'SRE teams suffer alert fatigue and slow incident response times during production outages.',
        users: 'Site Reliability Engineers, DevOps leads, system administrators.',
        concepts: 'Log anomaly classification, Prometheus alert correlation, runbook automation, least-privilege SSH execution, audit logging.',
        inputs: 'Prometheus Alertmanager webhooks and system log streams.',
        outputs: 'Root cause analysis report, recommended runbook steps, operator approval prompt.'
      },
      {
        id: '17',
        slug: '17-ai-customer-support-platform',
        name: 'AI Customer Support Multi-Agent Platform',
        status: 'Planned',
        summary: 'Enterprise support collective classifying intent, querying knowledge bases, managing CRM tickets, and escalating to human agents.',
        tech: 'Python, FastAPI, PostgreSQL, Redis, Zendesk/Slack Mock APIs',
        problem: 'Customer support teams need automated tier-1 resolution while guaranteeing smooth escalation for edge cases.',
        users: 'Support operations, customer success teams, end-users.',
        concepts: 'Customer intent routing, conversational state management, ticket status synchronization, graceful human handoff.',
        inputs: 'Customer inquiry messages via web chat or API.',
        outputs: 'Contextually grounded response, support ticket record, escalation notice.'
      },
      {
        id: '18',
        slug: '18-ai-business-operations-platform',
        name: 'AI Business Operations Agent Platform',
        status: 'Planned',
        summary: 'Cross-system business process orchestrator automating invoice approval routing, audit logging, and role-based permissions.',
        tech: 'Python, FastAPI, RBAC, Cryptographic Audit Ledger, PostgreSQL',
        problem: 'Disparate corporate systems (CRM, ERP, billing) require secure workflow orchestration with strict compliance auditing.',
        users: 'Operations directors, finance controllers, compliance officers.',
        concepts: 'Business process orchestration, enterprise RBAC, multi-tier approval routing, tamper-evident audit logs.',
        inputs: 'Business transaction records (invoices, purchase orders).',
        outputs: 'Orchestrated ERP sync records, approval receipts, audit ledger entries.'
      },
      {
        id: '19',
        slug: '19-autonomous-software-engineering',
        name: 'Autonomous Software Engineering Platform',
        status: 'Planned',
        summary: 'Autonomous repository worker resolving GitHub issues, editing code in ephemeral Docker containers, running tests, and opening PRs.',
        tech: 'Python, Docker SDK, Git, GitHub Apps API, Pytest',
        problem: 'Engineering backlogs accumulate routine bug fixes and maintenance tasks that can be addressed autonomously in sandboxed environments.',
        users: 'Software engineering teams, open-source maintainers.',
        concepts: 'Autonomous issue triage, containerized sandboxing, dynamic test execution, pull request synthesis, CI status checks.',
        inputs: 'GitHub issue URL or issue specification payload.',
        outputs: 'Containerized execution logs, git branch with commits, draft pull request.'
      },
      {
        id: '20',
        slug: '20-enterprise-agentic-ai-platform',
        name: 'Enterprise Agentic AI Platform',
        status: 'Planned',
        summary: 'Cloud-native multi-tenant agent gateway running on Kubernetes with agent registry, model router, distributed queues, and OpenTelemetry.',
        tech: 'Python, FastAPI, Kubernetes (Helm), Redis, Celery, PostgreSQL, OpenTelemetry',
        problem: 'Enterprises require a unified, secure platform to govern, authenticate, observe, and deploy multiple autonomous agent workloads.',
        users: 'Enterprise architects, platform teams, security compliance leads.',
        concepts: 'Multi-tenant isolation, agent lifecycle registry, model routing gateway, distributed task queues, OpenTelemetry tracing, Kubernetes scaling.',
        inputs: 'Tenant-scoped agent execution API requests.',
        outputs: 'Routed execution streams, trace spans, tenant quota and cost metrics.'
      }
    ]
  }
];

console.log('[BUILD] Constructing 4 AI Agents Level Repositories...');

for (const level of LEVELS) {
  const repoDir = path.join(BASE, level.repoName);
  ensureDir(repoDir);
  console.log(`[LEVEL] Building ${level.repoName}...`);

  // 1. Root README.md
  const levelReadme = `# ${level.title}

${level.description}

This repository is part of the **AI Agent Engineering Ecosystem** coordinated by the [**ai-agent-engineering-hub**](https://github.com/EmaanHumayun/ai-agent-engineering-hub).

---

## Repository Overview

- **Engineering Tier**: ${level.tier}
- **Master Hub**: [ai-agent-engineering-hub](https://github.com/EmaanHumayun/ai-agent-engineering-hub)
- **Engineer**: Emaan Humayun ([@EmaanHumayun](https://github.com/EmaanHumayun))
- **Professional Focus**: Software Engineer | Backend & DevOps | AI & Agentic Systems

---

## Projects in this Repository

| ID | Project Directory | Status | Technologies | Focus |
| :--- | :--- | :--- | :--- | :--- |
${level.projects.map(p => `| **${p.id}** | [**${p.slug}**](./projects/${p.slug}) | \`${p.status}\` | ${p.tech} | ${p.name} |`).join('\n')}

---

## Internal Directory Architecture

Every project in this repository follows a standardized, production-ready directory structure:

\`\`\`
projects/<project-name>/
|-- README.md                          # Problem statement, architecture, setup & execution
|-- PROJECT-SPECIFICATION.md           # 20-point comprehensive engineering specification
|-- ARCHITECTURE.md                    # Agent loop, state transitions, sequence diagrams
|-- REQUIREMENTS.md                    # Functional, non-functional, and boundary constraints
|-- LEARNING-OBJECTIVES.md             # Theoretical and practical competencies
|-- .env.example                       # Sanitized environment template (no real keys)
|-- .gitignore                         # Secret and runtime artifact exclusions
|-- labs/                              # Guided step-by-step practical labs
|-- assignments/                       # Independent skill assessments & challenges
|-- src/                               # Modular application source code (agents, tools, memory)
|-- tests/                             # Unit, integration, and evaluation test suites
|-- docs/                              # Setup, workflow, troubleshooting, and limitations
|-- examples/                          # Sample inputs, traces, and mock fixtures
\`-- reports/                           # Evaluation reports and verification runs
\`\`\`

---

## Cross-Repository Navigation

- [Master AI Agent Hub](https://github.com/EmaanHumayun/ai-agent-engineering-hub)
- [Level 1: Beginner Projects](https://github.com/EmaanHumayun/ai-agents-beginner-projects)
- [Level 2: Intermediate Projects](https://github.com/EmaanHumayun/ai-agents-intermediate-projects)
- [Level 3: Advanced Projects](https://github.com/EmaanHumayun/ai-agents-advanced-projects)
- [Level 4: Professional Projects](https://github.com/EmaanHumayun/ai-agents-professional-projects)
`;
  write(path.join(repoDir, 'README.md'), levelReadme);

  // 2. Root docs/ in level repo
  const levelDocsDir = path.join(repoDir, 'docs');
  write(path.join(levelDocsDir, 'level-overview.md'), `# ${level.tier} Overview\n\nDetailed breakdown of learning objectives, projects, and competencies for ${level.tier}.\n`);
  write(path.join(levelDocsDir, 'setup-guide.md'), `# Environment Setup Guide\n\nInstructions for configuring Python virtual environments, package management, and dependencies.\n`);
  write(path.join(levelDocsDir, 'coding-standards.md'), `# Coding Standards\n\nPydantic schema validation, type annotations, structured logging, and clean Python styling.\n`);
  write(path.join(levelDocsDir, 'common-troubleshooting.md'), `# Common Troubleshooting\n\nGuidance on resolving common errors: API timeouts, invalid tool arguments, token context overflows.\n`);

  // 3. Root templates/ in level repo
  const levelTemplatesDir = path.join(repoDir, 'templates');
  write(path.join(levelTemplatesDir, 'lab-template.md'), `# Lab Template\n\n## Objective\n## Prerequisites\n## Steps\n## Verification\n`);
  write(path.join(levelTemplatesDir, 'assignment-template.md'), `# Assignment Template\n\n## Task\n## Requirements\n## Rubric\n`);
  write(path.join(levelTemplatesDir, 'project-report-template.md'), `# Project Report Template\n\n## Summary\n## Implementation Evidence\n## Evaluation Results\n`);

  // 4. Root resources/ in level repo
  const levelResDir = path.join(repoDir, 'resources');
  write(path.join(levelResDir, 'official-documentation.md'), `# Official Documentation\n\nCurated reference links for libraries used in ${level.tier}.\n`);
  write(path.join(levelResDir, 'useful-references.md'), `# Useful References\n\nArticles, tutorials, and design patterns relevant to ${level.tier}.\n`);

  // 5. Root metadata files
  write(path.join(repoDir, 'ROADMAP.md'), `# Roadmap — ${level.tier}\n\n${level.projects.map(p => `### Project ${p.id}: ${p.name}\n- **Focus**: ${p.summary}\n- **Stack**: ${p.tech}\n`).join('\n')}`);
  write(path.join(repoDir, 'PROGRESS.md'), `# Progress Tracker — ${level.tier}\n\n${level.projects.map(p => `### Project ${p.id} — ${p.name}\n- [${p.status === 'Completed' ? 'x' : ' '}] Read project specification\n- [${p.status === 'Completed' ? 'x' : ' '}] Complete guided labs\n- [${p.status === 'Completed' ? 'x' : ' '}] Complete independent assignments\n- [${p.status === 'Completed' ? 'x' : ' '}] Implement source code in \`src/\`\n- [${p.status === 'Completed' ? 'x' : ' '}] Run automated tests in \`tests/\`\n- [${p.status === 'Completed' ? 'x' : ' '}] Complete documentation\n`).join('\n')}`);
  write(path.join(repoDir, 'CONCEPT-INDEX.md'), `# Concept Index — ${level.tier}\n\n| Concept | Project |\n| :--- | :--- |\n${level.projects.map(p => `| ${p.concepts} | [\`${p.slug}\`](./projects/${p.slug}) |`).join('\n')}`);
  write(path.join(repoDir, 'TECHNOLOGY-STACK.md'), `# Technology Stack — ${level.tier}\n\n| Project | Primary Stack |\n| :--- | :--- |\n${level.projects.map(p => `| ${p.name} | ${p.tech} |`).join('\n')}`);
  write(path.join(repoDir, 'CONTRIBUTING.md'), `# Contributing — ${level.tier}\n\nPlease follow repository coding standards and write automated tests for all tools.\n`);
  write(path.join(repoDir, 'LICENSE'), `MIT License\n\nCopyright (c) 2026 Emaan Humayun\n`);
  write(path.join(repoDir, '.gitignore'), `__pycache__/\n*.py[cod]\n*$py.class\n.env\nvenv/\nenv/\n*.log\n.pytest_cache/\n.coverage\n`);

  // Build each project directory
  for (const project of level.projects) {
    const projDir = path.join(repoDir, 'projects', project.slug);
    ensureDir(projDir);

    // Project README.md
    const pReadme = `# ${project.name}

> Project ${project.id} | ${level.tier}

${project.summary}

---

## Quick Reference

- **Status**: \`${project.status}\`
- **Primary Runtime**: ${project.tech}
- **Architecture**: Perception -> Reasoning & Planning -> Tool Orchestration -> Grounded Response
- **Master Catalog**: [Complete Project Catalog](https://github.com/EmaanHumayun/ai-agent-engineering-hub/blob/main/PROJECT-CATALOG.md)

---

## Real-World Problem Statement
${project.problem}

## Why an AI Agent is Appropriate
Traditional deterministic software cannot interpret open-ended natural language requests or adapt dynamically to varying API payloads. A fine-tuned language model alone cannot perform accurate math, query databases, or execute verified side effects. An AI Agent unites generative reasoning with deterministic tools and memory to bridge this gap safely.

---

## Project Layout

\`\`\`
${project.slug}/
|-- README.md                          # Project overview and quick start guide
|-- PROJECT-SPECIFICATION.md           # 20-point comprehensive engineering specification
|-- ARCHITECTURE.md                    # Agent loop, state transitions, sequence diagrams
|-- REQUIREMENTS.md                    # Functional, non-functional, and boundary constraints
|-- LEARNING-OBJECTIVES.md             # Theoretical and practical competencies
|-- .env.example                       # Sanitized environment template
|-- .gitignore                         # Secret and runtime artifact exclusions
|
|-- labs/                              # Guided practical labs (01 to 04)
|   |-- README.md
|   |-- lab-01-foundations.md
|   |-- lab-02-implementation.md
|   |-- lab-03-integration.md
|   \`-- lab-04-testing.md
|
|-- assignments/                       # Independent assessments (01 to 03 + Final Challenge)
|   |-- README.md
|   |-- assignment-01.md
|   |-- assignment-02.md
|   |-- assignment-03.md
|   \`-- final-challenge.md
|
|-- src/                               # Application source code
|   |-- agents/                        # Agent loop coordinator
|   |-- models/                        # LLM client abstractions
|   |-- prompts/                       # System prompts and templates
|   |-- tools/                         # Deterministic tool implementations
|   |-- memory/                        # Session and vector memory managers
|   |-- services/                      # Business logic orchestration
|   |-- schemas/                       # Pydantic validation models
|   \`-- utils/                         # Token counting, logging, formatting
|
|-- tests/                             # Test-driven development suite
|   |-- unit/
|   |-- integration/
|   \`-- evaluation/
|
|-- docs/                              # Architecture, workflows, troubleshooting
\`-- reports/                           # Evaluation reports and verification runs
\`\`\`

---

## Quick Start & Execution

\`\`\`bash
# 1. Navigate to project directory
cd projects/${project.slug}

# 2. Configure environment
cp .env.example .env

# 3. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # (or venv\\Scripts\\activate on Windows)

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run automated test suite
python -m pytest

# 6. Run application
python main.py
\`\`\`
`;
    write(path.join(projDir, 'README.md'), pReadme);

    // PROJECT-SPECIFICATION.md (20 points complete!)
    const pSpec = `# Project Specification: ${project.name}

---

### 1. Problem Statement
${project.problem}

### 2. Target Users
${project.users}

### 3. Learning Objectives
- Master the underlying concepts of ${project.name}.
- Build deterministic tools with strict Pydantic v2 schemas.
- Structure resilient agent cognitive loops with error recovery and retries.
- Evaluate token consumption, inference latency, and groundedness.

### 4. Prerequisites
- Python 3.10+ programming proficiency (OOP, async, type annotations).
- Basic understanding of REST APIs, HTTP status codes, and JSON schemas.
- Familiarity with Git version control and environment variables.

### 5. Concepts Covered
${project.concepts}

### 6. Tools and Technology
- **Language / Runtime**: ${project.tech}
- **Validation**: Pydantic v2
- **Testing**: Pytest, Mocking
- **Environment**: Python \`venv\`, \`.env\`

### 7. Functional Requirements
- **FR-01**: Ingest natural language inputs (${project.inputs}).
- **FR-02**: Enforce system prompt boundaries and manage conversational history.
- **FR-03**: Select and execute appropriate tools when required.
- **FR-04**: Track token consumption and compute execution latency.
- **FR-05**: Return grounded outputs (${project.outputs}).

### 8. Non-Functional Requirements
- **NFR-01 (Reliability)**: Gracefully handle network timeouts and API exceptions with retries.
- **NFR-02 (Security)**: Zero plain-text credentials in logs or source files.
- **NFR-03 (Performance)**: Maintain sub-second latency for local tool execution.
- **NFR-04 (Maintainability)**: Clean separation between prompts, tools, memory, and services.

### 9. Agent Workflow Design
\`\`\`
[ User Input ] ---> [ Assemble Context & History ]
                               |
                               v
                     [ LLM Cognitive Step ]
                               |
            +------------------+------------------+
            |                                     |
    (Tool Call Required)                    (Goal Fulfilled)
            |                                     |
            v                                     v
[ Validate Pydantic Schema ]              [ Output Return ]
            |
            v
[ Execute Deterministic Tool ]
            |
            v
[ Append Tool Result to Context ]
            |
            +---> (Loop back to LLM for final response)
\`\`\`

### 10. Trigger Definitions
- Terminal prompt input, API endpoint trigger, or automated test invocation.

### 11. Actions and Integrations
- Tool execution (calculation, search, database query, API dispatch).
- LLM inference request and response parsing.

### 12. Input and Output Data Formats
- **Input**: ${project.inputs}
- **Output**: ${project.outputs}

### 13. Error Handling
- Invalid tool parameters: Catch validation error and feed failure context back to model to retry.
- API rate limits: Exponential backoff with jitter (1s, 2s, 4s).
- Context overflow: Automatically trim oldest conversational turns while retaining the system prompt.

### 14. Authentication Requirements
- API keys loaded exclusively from environment variables via \`.env\`.

### 15. Security Requirements
- Treat all external documents and tool outputs as untrusted input.
- Defend against prompt injection using XML-tagged context boundaries.
- Never execute destructive database or file commands without explicit verification.

### 16. Testing Requirements
- **Unit Tests**: Test tool schemas and edge cases in isolation.
- **Integration Tests**: Verify full agent loop with simulated tool returns.
- **Evaluation Tests**: Measure tool selection precision and output groundedness.

### 17. Implementation Milestones
- **Milestone 1**: Project directory scaffolding and configuration templates.
- **Milestone 2**: Core prompts and tool schema definition.
- **Milestone 3**: Agent loop execution and memory integration.
- **Milestone 4**: Automated test suite and evaluation documentation.

### 18. Expected Deliverables
- Working Python source code in \`src/\`.
- Passing Pytest suite in \`tests/\`.
- Practical lab documentation in \`labs/\`.
- Independent assignments in \`assignments/\`.

### 19. Completion Criteria
- All automated unit and integration tests passing.
- Zero credentials or tokens in git history.
- Clean execution output with documented evaluation report.

### 20. Advanced Extensions
- Add distributed tracing spans using OpenTelemetry.
- Implement streaming response generation.
- Integrate local model fallback via Ollama.
`;
    write(path.join(projDir, 'PROJECT-SPECIFICATION.md'), pSpec);

    // ARCHITECTURE.md
    const pArch = `# Architecture Document: ${project.name}

## System Overview
The ${project.name} organizes agent logic into modular, decoupled layers:

1. **Prompts Layer (\`src/prompts/\`)**: Defines system personas, few-shot examples, and ReAct instructions.
2. **Tools Layer (\`src/tools/\`)**: Contains deterministic functions with Pydantic schema validation.
3. **Memory Layer (\`src/memory/\`)**: Manages conversation history, context trimming, and persistent state.
4. **Agent Layer (\`src/agents/\`)**: Coordinates the perception-reasoning-action loop.
`;
    write(path.join(projDir, 'ARCHITECTURE.md'), pArch);

    // REQUIREMENTS.md
    const pReq = `# Requirements Document: ${project.name}

## 1. Environment Requirements
- Python 3.10+
- Virtual environment (\`venv\`)
- Git 2.30+

## 2. Functional Requirements
- **FR-01**: Ingestion and validation of inputs (${project.inputs}).
- **FR-02**: Execution of target agent actions with error resilience.
- **FR-03**: Grounded output return with token tracking.

## 3. Non-Functional Requirements
- **NFR-01**: Clean error handling without unhandled tracebacks.
- **NFR-02**: Zero hardcoded credentials.
`;
    write(path.join(projDir, 'REQUIREMENTS.md'), pReq);

    // LEARNING-OBJECTIVES.md
    const pObj = `# Learning Objectives: ${project.name}

By completing this project, you will understand:
1. The architectural role of ${project.name}.
2. How to define clean Pydantic tool schemas.
3. How to manage model context windows and calculate token costs.
4. How to write automated tests for agentic workflows.
`;
    write(path.join(projDir, 'LEARNING-OBJECTIVES.md'), pObj);

    // .env.example & .gitignore
    write(path.join(projDir, '.env.example'), `LLM_API_KEY=your_sanitized_api_key_here\nLLM_MODEL=gpt-4o-mini\nLOG_LEVEL=info\n`);
    write(path.join(projDir, '.gitignore'), `__pycache__/\n*.py[cod]\n.env\nvenv/\n*.log\n.pytest_cache/\n.coverage\n`);

    // labs/
    const labsDir = path.join(projDir, 'labs');
    write(path.join(labsDir, 'README.md'), `# Guided Practical Labs — ${project.name}\n\nThis directory contains hands-on guided exercises designed to master foundational concepts before building the full project.\n`);
    write(path.join(labsDir, 'lab-01-foundations.md'), `# Lab 01: Foundations for ${project.name}\n\n- **Difficulty**: Beginner\n- **Estimated Time**: 30 minutes\n\n### Learning Objectives\n- Understand the core problem and verify Python environment.\n- Test basic LLM API inference or mock client.\n\n### Step-by-Step Instructions\n1. Activate your virtual environment: \`source venv/bin/activate\`.\n2. Verify Python version: \`python --version\`.\n3. Run baseline connection test.\n\n### Expected Output\nSuccessful connection with token usage printed.\n`);
    write(path.join(labsDir, 'lab-02-implementation.md'), `# Lab 02: Core Implementation for ${project.name}\n\n- **Difficulty**: Intermediate\n- **Estimated Time**: 45 minutes\n\n### Learning Objectives\n- Implement tool schemas and argument validation.\n- Structure system prompt templates.\n\n### Step-by-Step Instructions\n1. Define tool functions with type hints.\n2. Validate input arguments using Pydantic models.\n3. Test tool execution with edge-case parameters.\n\n### Expected Output\nTools execute deterministically and reject invalid types.\n`);
    write(path.join(labsDir, 'lab-03-integration.md'), `# Lab 03: Integration & Loop Execution for ${project.name}\n\n- **Difficulty**: Intermediate\n- **Estimated Time**: 45 minutes\n\n### Learning Objectives\n- Connect the agent loop to tool dispatchers.\n- Implement sliding-window memory management.\n\n### Step-by-Step Instructions\n1. Wire conversation history buffer to the agent loop.\n2. Execute a multi-turn conversation requiring tools.\n3. Inspect context window length after each turn.\n\n### Expected Output\nAgent invokes tools and summarizes findings accurately.\n`);
    write(path.join(labsDir, 'lab-04-testing.md'), `# Lab 04: Testing & Verification for ${project.name}\n\n- **Difficulty**: Intermediate\n- **Estimated Time**: 30 minutes\n\n### Learning Objectives\n- Write unit tests for tools and integration tests for the loop.\n- Assert tool selection accuracy and error handling.\n\n### Step-by-Step Instructions\n1. Create unit test assertions using Pytest.\n2. Mock external API calls to ensure reproducible test runs.\n3. Run \`python -m pytest\`.\n\n### Verification\nAll test assertions pass with exit code 0.\n`);

    // assignments/
    const assignDir = path.join(projDir, 'assignments');
    write(path.join(assignDir, 'README.md'), `# Independent Assignments — ${project.name}\n\nIndependent skill challenges to test your ability to extend and harden the agent.\n`);
    write(path.join(assignDir, 'assignment-01.md'), `# Assignment 01: Input Validation & Edge Cases\n\n### Problem Statement\nExtend the agent to handle malformed inputs and unexpected tool arguments gracefully.\n\n### Requirements\n1. Add schema validation for edge-case payloads.\n2. Return informative error context to the model to retry.\n3. Write a unit test verifying the recovery.\n`);
    write(path.join(assignDir, 'assignment-02.md'), `# Assignment 02: Context Optimization & Pruning\n\n### Problem Statement\nImplement a token budget monitor that prunes intermediate tool outputs when context approaches limits.\n\n### Requirements\n1. Measure token counts per conversational turn.\n2. Prune verbose tool outputs once answered.\n3. Verify token savings via automated benchmarks.\n`);
    write(path.join(assignDir, 'assignment-03.md'), `# Assignment 03: Guardrails & Prompt Injection Defense\n\n### Problem Statement\nHarden the agent against adversarial prompt injection embedded in external inputs.\n\n### Requirements\n1. Wrap external data in strict XML boundaries.\n2. Instruct the model to treat bounded data as untrusted text.\n3. Test against adversarial injection payloads.\n`);
    write(path.join(assignDir, 'final-challenge.md'), `# Final Challenge: Production Hardening\n\n### Problem Statement\nCombine all concepts to deliver a fully production-ready, tested implementation of ${project.name}.\n\n### Requirements\n1. Complete modular code in \`src/\`.\n2. Comprehensive test suite in \`tests/\`.\n3. Documented evaluation report in \`reports/\`.\n\n### Acceptance Criteria\n- 100% automated test pass rate.\n- Zero hardcoded secrets.\n`);

    // src/ directories
    const srcDir = path.join(projDir, 'src');
    ensureDir(path.join(srcDir, 'agents'));
    ensureDir(path.join(srcDir, 'models'));
    ensureDir(path.join(srcDir, 'prompts'));
    ensureDir(path.join(srcDir, 'tools'));
    ensureDir(path.join(srcDir, 'memory'));
    ensureDir(path.join(srcDir, 'services'));
    ensureDir(path.join(srcDir, 'schemas'));
    ensureDir(path.join(srcDir, 'utils'));

    // tests/ directories
    const testsDir = path.join(projDir, 'tests');
    ensureDir(path.join(testsDir, 'unit'));
    ensureDir(path.join(testsDir, 'integration'));
    ensureDir(path.join(testsDir, 'evaluation'));

    // docs/ directories
    const docsDir = path.join(projDir, 'docs');
    write(path.join(docsDir, 'setup.md'), `# Setup Guide\n\nInstructions for configuring dependencies and environment variables.\n`);
    write(path.join(docsDir, 'architecture.md'), `# Architecture Guide\n\nComponent breakdown and sequence diagrams.\n`);
    write(path.join(docsDir, 'workflow.md'), `# Workflow Guide\n\nExecution flow and error recovery pathways.\n`);
    write(path.join(docsDir, 'troubleshooting.md'), `# Troubleshooting Guide\n\nCommon pitfalls, error codes, and resolutions.\n`);
    write(path.join(docsDir, 'limitations.md'), `# Known Limitations\n\nCurrent boundaries and planned future enhancements.\n`);

    // examples/ & reports/
    ensureDir(path.join(projDir, 'examples'));
    const repDir = path.join(projDir, 'reports');
    ensureDir(repDir);
    write(path.join(repDir, 'evaluation-report-template.md'), `# Evaluation Report: ${project.name}\n\n- **Date**: YYYY-MM-DD\n- **Model**: gpt-4o-mini / Claude 3.5 / Gemini 1.5\n- **Tool Accuracy**: --%\n- **Groundedness Score**: --%\n- **Average Latency**: --ms\n- **Token Cost**: $--\n`);

    // requirements.txt
    write(path.join(projDir, 'requirements.txt'), `pydantic>=2.7.0\npytest>=8.0.0\npython-dotenv>=1.0.0\n`);
  }

  // Initialize git repo for level repo
  try {
    execSync('git init -b main', { cwd: repoDir, stdio: 'ignore' });
  } catch {
    execSync('git init', { cwd: repoDir, stdio: 'ignore' });
    try { execSync('git branch -M main', { cwd: repoDir, stdio: 'ignore' }); } catch {}
  }
  execSync('git add .', { cwd: repoDir });
  execSync(`git commit -m "feat: initialize ${level.repoName} with 5 detailed project specifications, labs, and assignments"`, { cwd: repoDir });
  console.log(`[LEVEL] Completed ${level.repoName} successfully.`);
}

console.log('[BUILD] All 4 AI Agents Level Repositories constructed successfully.');

