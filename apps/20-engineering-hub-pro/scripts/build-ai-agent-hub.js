import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = path.join(__dirname, '..', 'github-ecosystem');
const HUB_DIR = path.join(BASE, 'ai-agent-engineering-hub');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function write(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
}

console.log('[BUILD] Constructing ai-agent-engineering-hub repository...');

ensureDir(HUB_DIR);

// 1. Root README.md
const README = `# AI Agent Engineering Hub

A structured engineering curriculum and practical portfolio ecosystem dedicated to learning, building, testing, evaluating, and deploying AI Agents and Agentic Systems.

This repository serves as the central documentation directory, knowledge management hub, architectural guide, and progress tracker for 20 progressive projects spanning foundational LLM tool-calling to enterprise-grade multi-agent autonomous platforms.

---

## Professional Scope & Positioning

- **Engineering Discipline**: Software Engineer | Backend & DevOps
- **Specializations**: API Integrations, Workflow Automation, Systems Architecture, AI & Agentic Systems
- **Core Technology Stack**: Python, Pydantic, FastAPI, LangGraph, Redis, PostgreSQL, Docker, Kubernetes, OpenTelemetry

This curriculum is designed around engineering first principles: understanding model behavior, structuring deterministic tool contracts, managing state and context windows, evaluating agent reliability, and establishing security guardrails before deploying autonomous workflows.

---

## What are AI Agents and Agentic Systems?

An **AI Agent** is an autonomous or semi-autonomous software entity that perceives its environment, reasons over a goal using a language model, selects and executes tools, and iterates based on intermediate feedback until it fulfills a defined objective.

An **Agentic System** extends this capability to complex, multi-component architectures:
- **Perception & Ingestion**: Parsing structured and unstructured user inputs, webhooks, or system events.
- **Cognitive Loop (Reasoning & Planning)**: Decomposing complex goals into sequential or parallel subtasks using techniques like ReAct (Reason + Act) or state-machine DAGs.
- **Tool Orchestration**: Interacting with deterministic APIs, databases, command-line interfaces, and web search tools.
- **Memory Systems**: Maintaining short-term context across conversational turns and long-term semantic memory in vector and relational stores.
- **Reflection & Error Recovery**: Evaluating intermediate tool execution outputs, handling rate limits or API errors, and replanning dynamically.
- **Safety & Oversight**: Enforcing schema constraints, prompt injection defenses, and human-in-the-loop approvals for sensitive side effects.

---

## Repository Ecosystem Architecture

The curriculum is partitioned into four independent, progressive level repositories:

\`\`\`
ai-agent-engineering-hub (Central Curriculum Hub & Architecture Guide)
|-- Level 1: ai-agents-beginner-projects (Projects 01-05)
|   |-- 01. Intelligent AI Chat Agent [Completed Reference]
|   |-- 02. Tool-Calling AI Agent
|   |-- 03. AI Research Assistant
|   |-- 04. Personal Productivity Agent
|   \`-- 05. Document Q&A Agent
|
|-- Level 2: ai-agents-intermediate-projects (Projects 06-10)
|   |-- 06. Memory-Enabled Personal AI Agent
|   |-- 07. AI Email Management Agent
|   |-- 08. AI Coding Assistant Agent
|   |-- 09. RAG-Based Knowledge Base Agent
|   \`-- 10. API Integration Agent
|
|-- Level 3: ai-agents-advanced-projects (Projects 11-15)
|   |-- 11. Autonomous Planning & Execution Agent
|   |-- 12. Multi-Agent Research System
|   |-- 13. Multi-Agent Software Development System
|   |-- 14. AI Data Analyst Agent
|   \`-- 15. Agent Evaluation & Testing Platform
|
\`-- Level 4: ai-agents-professional-projects (Projects 16-20)
    |-- 16. DevOps AI Operations Agent (AIOps)
    |-- 17. AI Customer Support Multi-Agent Platform
    |-- 18. AI Business Operations Agent Platform
    |-- 19. Autonomous Software Engineering Platform
    \`-- 20. Enterprise Agentic AI Platform
\`\`\`

---

## Level Repositories Index

| Tier | Repository | Focus Areas | Project Range |
| :--- | :--- | :--- | :--- |
| **Level 1: Beginner** | [**ai-agents-beginner-projects**](https://github.com/EmaanHumayun/ai-agents-beginner-projects) | System prompts, token tracking, function calling, tool schemas, SQLite persistence, basic RAG | Projects 01 - 05 |
| **Level 2: Intermediate** | [**ai-agents-intermediate-projects**](https://github.com/EmaanHumayun/ai-agents-intermediate-projects) | PostgreSQL/Redis memory, OAuth 2.0 email agents, code analysis, hybrid search RAG, API orchestration | Projects 06 - 10 |
| **Level 3: Advanced** | [**ai-agents-advanced-projects**](https://github.com/EmaanHumayun/ai-agents-advanced-projects) | State machine planning (LangGraph), multi-agent coordination, text-to-SQL, agent evaluation | Projects 11 - 15 |
| **Level 4: Professional** | [**ai-agents-professional-projects**](https://github.com/EmaanHumayun/ai-agents-professional-projects) | AIOps self-healing, customer support graphs, enterprise business ops, autonomous repo agents, enterprise gateway | Projects 16 - 20 |

---

## Learning Methodology

Every project follows an eight-stage engineering cycle:

\`\`\`
Understand -> Explore -> Build -> Test -> Evaluate -> Document -> Deploy -> Explain
\`\`\`

1. **Understand**: Review the problem statement, why an AI Agent is suitable, and architectural trade-offs.
2. **Explore**: Complete guided practical labs to inspect raw API calls, tool schemas, and token usage.
3. **Build**: Implement modular Python packages cleanly separating prompts, tools, memory, and services.
4. **Test**: Write automated unit tests for tools and integration tests for agent execution loops.
5. **Evaluate**: Measure response groundedness, tool-selection accuracy, token efficiency, and latency.
6. **Document**: Record system specifications, state machine transitions, and known failure modes.
7. **Deploy**: Package applications with Docker containers and environment configurations.
8. **Explain**: Articulate design decisions, limitations, and future architectural improvements.

---

## Navigation & Documentation Map

- [Roadmap](ROADMAP.md) - Comprehensive four-tier curriculum roadmap
- [Learning Path](LEARNING-PATH.md) - Systematic progression guide and prerequisites
- [Project Catalog](PROJECT-CATALOG.md) - Complete briefs, architectures, and deliverables for all 20 projects
- [Concept Mastery Index](CONCEPT-MASTERY-INDEX.md) - 50+ agentic concepts mapped across tiers
- [Technology Stack](TECHNOLOGY-STACK.md) - Runtimes, vector databases, frameworks, and tools
- [Architecture Guide](ARCHITECTURE-GUIDE.md) - Agent loops, state machines, memory architectures, and safety
- [Glossary](GLOSSARY.md) - Formal technical definitions of agentic and LLM terminology
- [Progress Dashboard](progress/overall-progress.md) - Authentic implementation progress across all 20 projects

---

## Security Policy & Credential Isolation

- **Zero Credential Persistence**: API keys, database credentials, and OAuth tokens must reside exclusively in local \`.env\` files (never committed).
- **Sanitized Templates**: Every project provides a clean \`.env.example\` with placeholder variables.
- **Untrusted Inputs**: Tool outputs, retrieved web pages, user uploads, and external emails are treated as untrusted and sanitized against prompt injection.
- **Least-Privilege Execution**: Tools execute with scoped, read-only permissions by default. Destructive actions require explicit human-in-the-loop confirmation.

---

## Author & Maintainer

- **Engineer**: Emaan Humayun
- **GitHub**: [@EmaanHumayun](https://github.com/EmaanHumayun)
- **Central Portfolio**: [engineering-portfolio](https://github.com/EmaanHumayun/engineering-portfolio)
`;
write(path.join(HUB_DIR, 'README.md'), README);

// 2. ROADMAP.md
const ROADMAP = `# Master AI Agent Engineering Roadmap

A structured 4-tier learning and implementation curriculum designed to build practical engineering competence in autonomous agents and multi-agent distributed systems.

---

## Level 1: Foundations of Agentic AI (Projects 01-05)
- **Goal**: Understand model inference mechanics, context management, prompt engineering, structured tool calling, database interactions, and vector retrieval.
- **Core Stack**: Python, Pydantic, SQLite, OpenAI / Anthropic / Gemini API, ChromaDB / FAISS.
- **Projects**:
  1. \`01-intelligent-ai-chat-agent\`: Terminal conversation agent with sliding-window history, token counting, and cost telemetry.
  2. \`02-tool-calling-ai-agent\`: Deterministic tool integration using Pydantic schemas, validation, and JSON function returns.
  3. \`03-ai-research-assistant\`: Web search extraction agent synthesizing external findings with source citations.
  4. \`04-personal-productivity-agent\`: Task automation agent interacting with a local SQLite database via CRUD tools.
  5. \`05-document-qa-agent\`: Retrieval-Augmented Generation (RAG) agent chunking text, querying vector embeddings, and answering grounded questions.

---

## Level 2: Stateful & Integrated Agents (Projects 06-10)
- **Goal**: Implement persistent short/long-term memory, external SaaS APIs with OAuth 2.0, hybrid vector retrieval, and code repository inspection.
- **Core Stack**: Python, FastAPI, PostgreSQL, Redis, pgvector, GitHub API, Gmail API, Pytest.
- **Projects**:
  6. \`06-memory-enabled-personal-ai-agent\`: Dual-layer memory architecture combining Redis working memory and PostgreSQL episodic memory.
  7. \`07-ai-email-management-agent\`: Gmail integration classifying inbound emails, drafting replies, and requiring human-in-the-loop approval.
  8. \`08-ai-coding-assistant-agent\`: Code repository analyzer parsing Abstract Syntax Trees (AST), identifying defects, and drafting PR summaries.
  9. \`09-rag-based-knowledge-base-agent\`: Advanced RAG platform combining BM25 keyword search, dense vector retrieval, and cross-encoder reranking.
  10. \`10-api-integration-agent\`: FastAPI orchestration gateway executing multi-step third-party API workflows with exponential backoff retries.

---

## Level 3: Planning, Multi-Agent Systems & Evaluation (Projects 11-15)
- **Goal**: Master state-machine planning, multi-agent collaboration topologies, text-to-SQL data pipelines, and quantitative agent evaluation.
- **Core Stack**: Python, LangGraph / StateGraph, Pydantic, Pandas, SQLAlchemy, Tracing (LangSmith / OpenTelemetry), Pytest.
- **Projects**:
  11. \`11-autonomous-planning-execution-agent\`: Goal decomposition engine executing plans via a Directed Acyclic Graph (DAG) state machine with automated replanning.
  12. \`12-multi-agent-research-system\`: Collaborative graph featuring Researcher, Analyst, Fact-Checker, and Report Writer agents.
  13. \`13-multi-agent-software-dev-system\`: SDLC agent team coordinating Product, Architect, Developer, Tester, and Documentation agents in sandboxed workspaces.
  14. \`14-ai-data-analyst-agent\`: Safe Text-to-SQL analyst inspecting schemas, validating queries against AST guards, executing read-only SQL, and generating charts.
  15. \`15-agent-evaluation-testing-platform\`: Automated test harness evaluating tool-selection accuracy, hallucination rates, latency, and token consumption across model versions.

---

## Level 4: Enterprise, DevOps & Autonomous Systems (Projects 16-20)
- **Goal**: Develop production-grade, observable, secure, and multi-tenant agent platforms deployed on cloud and containerized infrastructure.
- **Core Stack**: Python, FastAPI, Docker, Kubernetes, Helm, Prometheus, Grafana, OpenTelemetry, Envoy / Kong, GitHub Actions.
- **Projects**:
  16. \`16-devops-ai-operations-agent\`: AIOps incident triage engine parsing logs, correlating Prometheus alerts, suggesting remediation runbooks, and enforcing least privilege.
  17. \`17-ai-customer-support-platform\`: Multi-agent support engine handling intent triage, knowledge retrieval, CRM ticketing, and seamless human agent escalation.
  18. \`18-ai-business-operations-platform\`: Cross-system business process orchestrator automating invoice approval routing, audit logging, and role-based permissions.
  19. \`19-autonomous-software-engineering\`: End-to-end repository worker taking GitHub issues, exploring codebases, running tests in Docker, and opening draft pull requests.
  20. \`20-enterprise-agentic-ai-platform\`: High-availability, multi-tenant agent gateway featuring an agent registry, model router, distributed queues, RBAC, and OpenTelemetry tracing.
`;
write(path.join(HUB_DIR, 'ROADMAP.md'), ROADMAP);

// 3. LEARNING-PATH.md
const LEARNING_PATH = `# Learning Path & Progression Guide

This guide details the sequential progression of skills, theoretical concepts, and engineering milestones across the curriculum.

---

## Progression Flowchart

\`\`\`
[ Level 1: Foundations ]
   - Prompt Engineering & Context Management
   - Function Calling & Tool Schemas (Pydantic)
   - In-Memory & SQLite Persistence
   - Basic Vector Embeddings & Similarity Search
         |
         v
[ Level 2: Stateful & Integrated Systems ]
   - Short-term (Redis) vs Long-Term (PostgreSQL) Memory
   - OAuth 2.0 & Human-in-the-Loop Safeguards
   - Repository AST Inspection & Code Analysis
   - Hybrid Search RAG (BM25 + Dense Vectors) + Reranking
         |
         v
[ Level 3: Planning, Multi-Agent & Evaluation ]
   - DAG State Machines & Replanning Loops (LangGraph)
   - Multi-Agent Orchestration & Task Delegation
   - Safe Text-to-SQL with AST Query Validation
   - Quantitative Evaluation Frameworks (Accuracy, Groundedness, Hallucination)
         |
         v
[ Level 4: Enterprise Production & Cloud Platforms ]
   - AIOps Infrastructure & Log Telemetry Integration
   - Multi-Tenant Isolation & Role-Based Access Control (RBAC)
   - Sandboxed Docker / Containerized Execution Environments
   - Distributed Tracing (OpenTelemetry) & Production Kubernetes Gateways
\`\`\`

---

## Progression Criteria Between Levels

### Moving from Level 1 to Level 2
- Understand tokenization, context windows, and cost modeling.
- Implement structured tool schemas using Pydantic without schema errors.
- Construct a deterministic single-agent ReAct loop handling tool failure gracefully.

### Moving from Level 2 to Level 3
- Implement dual-layer memory architectures with automatic session context trimming.
- Build authenticated API integrations featuring token rotation and retry policies.
- Quantitatively evaluate retrieval recall and precision in a RAG pipeline.

### Moving from Level 3 to Level 4
- Build multi-agent coordination graphs with isolated state and message passing.
- Construct comprehensive automated evaluation suites asserting tool selection and groundedness.
- Enforce sandboxed execution and prompt injection defense on untrusted user inputs.
`;
write(path.join(HUB_DIR, 'LEARNING-PATH.md'), LEARNING_PATH);

// 4. PROJECT-CATALOG.md
const PROJECT_CATALOG = `# Complete Project Catalog (20 Progressive Projects)

Technical catalog detailing the problem statements, architectural patterns, technologies, and deliverables for all 20 projects.

---

## Level 1: Beginner Projects

### Project 01: Intelligent AI Chat Agent
- **Repository**: [ai-agents-beginner-projects](https://github.com/EmaanHumayun/ai-agents-beginner-projects/tree/main/projects/01-intelligent-ai-chat-agent)
- **Status**: **Completed Reference Implementation**
- **Problem**: Applications require structured, cost-aware conversational interfaces that enforce system prompts and manage token context limits gracefully.
- **Architecture**: Terminal loop maintaining a sliding-window message queue, calculating token consumption, and handling API exceptions with exponential backoff.
- **Tech Stack**: Python 3.10+, LLM Client (OpenAI/Anthropic/Gemini/Mock), Dataclasses, Tokenizer, Pytest.
- **Deliverables**: Modular chat package, token cost calculator, comprehensive test suite.

### Project 02: Tool-Calling AI Agent
- **Repository**: [ai-agents-beginner-projects](https://github.com/EmaanHumayun/ai-agents-beginner-projects/tree/main/projects/02-tool-calling-ai-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: LLMs cannot perform accurate arithmetic, fetch current timestamps, or evaluate deterministic rules without external function calling.
- **Architecture**: Decoupled agent loop parsing tool call requests from model responses, validating arguments against Pydantic models, executing local Python tools, and returning results.
- **Tech Stack**: Python, Pydantic, JSON Schema, Custom Tool Registry.
- **Deliverables**: Tool dispatcher, mathematical calculator tool, unit conversion tool, argument validation test suite.

### Project 03: AI Research Assistant
- **Repository**: [ai-agents-beginner-projects](https://github.com/EmaanHumayun/ai-agents-beginner-projects/tree/main/projects/03-ai-research-assistant)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Manual web research requires synthesizing multiple disparate articles while maintaining strict attribution and avoiding unsupported claims.
- **Architecture**: Multi-step agent querying search APIs, scraping content, extracting relevant paragraphs, and compiling structured markdown reports with inline citation anchors.
- **Tech Stack**: Python, Search API (Tavily/DuckDuckGo), Requests/BeautifulSoup, Markdown Formatter.
- **Deliverables**: Research agent, search adapter, citation tracker, report compiler.

### Project 04: Personal Productivity Agent
- **Repository**: [ai-agents-beginner-projects](https://github.com/EmaanHumayun/ai-agents-beginner-projects/tree/main/projects/04-personal-productivity-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Natural language task management requires parsing conversational intents into structured SQL database operations.
- **Architecture**: Agent equipped with CRUD tools operating on a local SQLite database, extracting dates and priorities from conversational queries.
- **Tech Stack**: Python, SQLite, Pydantic, Dateparser.
- **Deliverables**: Task database schema, CRUD tool functions, intent extraction parser, daily digest generator.

### Project 05: Document Q&A Agent
- **Repository**: [ai-agents-beginner-projects](https://github.com/EmaanHumayun/ai-agents-beginner-projects/tree/main/projects/05-document-qa-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Users need grounded answers from proprietary PDF documents without transmitting the entire document text in each prompt.
- **Architecture**: Ingestion pipeline extracting PDF text, chunking text with semantic overlap, generating dense vector embeddings, and executing similarity retrieval to augment prompts.
- **Tech Stack**: Python, PyPDF/pdfplumber, Vector Store (ChromaDB/FAISS), Sentence Transformers.
- **Deliverables**: Document chunker, embedding generator, vector retriever, grounded Q&A agent.

---

## Level 2: Intermediate Projects

### Project 06: Memory-Enabled Personal AI Agent
- **Repository**: [ai-agents-intermediate-projects](https://github.com/EmaanHumayun/ai-agents-intermediate-projects/tree/main/projects/06-memory-enabled-personal-ai-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Stateless agents forget user preferences, context, and previous interactions once the conversation thread terminates.
- **Architecture**: Hierarchical memory engine utilizing Redis for short-term session buffering and PostgreSQL with vector extensions for semantic long-term recall.
- **Tech Stack**: Python, Redis, PostgreSQL, SQLAlchemy, pgvector.
- **Deliverables**: Dual-tier memory manager, memory summarization worker, user privacy inspection CLI.

### Project 07: AI Email Management Agent
- **Repository**: [ai-agents-intermediate-projects](https://github.com/EmaanHumayun/ai-agents-intermediate-projects/tree/main/projects/07-ai-email-management-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: High email volumes require automated priority triage, draft synthesis, and follow-up tracking while strictly avoiding unauthorized email transmissions.
- **Architecture**: Authenticated OAuth 2.0 service reading email threads, categorizing urgency, drafting contextual replies, and queuing outbound messages for explicit human approval.
- **Tech Stack**: Python, Gmail API / IMAP, OAuth 2.0, Human-in-the-Loop Queue.
- **Deliverables**: OAuth authorization service, email classification engine, draft generator, approval interface.

### Project 08: AI Coding Assistant Agent
- **Repository**: [ai-agents-intermediate-projects](https://github.com/EmaanHumayun/ai-agents-intermediate-projects/tree/main/projects/08-ai-coding-assistant-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Developers need intelligent repository navigation, static defect detection, and automated pull request summarization.
- **Architecture**: Python static analysis tool traversing Git repositories, building an AST dependency graph, inspecting functions for common bugs, and drafting pull request descriptions.
- **Tech Stack**: Python, GitPython, AST module, GitHub REST API.
- **Deliverables**: Repository crawler, code chunking engine, static analysis reviewer, PR summarizer.

### Project 09: RAG-Based Knowledge Base Agent
- **Repository**: [ai-agents-intermediate-projects](https://github.com/EmaanHumayun/ai-agents-intermediate-projects/tree/main/projects/09-rag-based-knowledge-base-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Pure semantic vector search frequently misses exact keyword matches, SKU numbers, or metadata constraints in enterprise knowledge bases.
- **Architecture**: Hybrid retrieval pipeline combining BM25 lexical keyword scoring with dense vector search, followed by a cross-encoder reranking stage.
- **Tech Stack**: Python, Rank-BM25, Qdrant / PostgreSQL pgvector, Cross-Encoder Reranker.
- **Deliverables**: Hybrid retriever, metadata filter engine, reranking pipeline, evaluation benchmarks.

### Project 10: API Integration Agent
- **Repository**: [ai-agents-intermediate-projects](https://github.com/EmaanHumayun/ai-agents-intermediate-projects/tree/main/projects/10-api-integration-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Multi-step workflows requiring interaction with diverse REST APIs require resilient rate-limiting, authentication token rotation, and transactional retries.
- **Architecture**: FastAPI orchestration service providing standardized tool connectors, exponential backoff with jitter, and cryptographic webhook verification.
- **Tech Stack**: Python, FastAPI, HTTPX, Pydantic, Webhook Ingress.
- **Deliverables**: Integration gateway, connector registry, resilient HTTP client, audit logger.

---

## Level 3: Advanced Projects

### Project 11: Autonomous Planning & Execution Agent
- **Repository**: [ai-agents-advanced-projects](https://github.com/EmaanHumayun/ai-agents-advanced-projects/tree/main/projects/11-autonomous-planning-execution-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Complex goals cannot be solved in a single prompt; agents require non-linear step execution, conditional branching, and self-correction upon step failure.
- **Architecture**: State-machine DAG execution engine that generates an initial execution plan, evaluates step outputs, dynamically replans when errors occur, and halts at predefined limits.
- **Tech Stack**: Python, LangGraph / Custom State Machine, Pydantic, Asyncio.
- **Deliverables**: Plan decomposition module, DAG execution engine, replanning handler, state visualizer.

### Project 12: Multi-Agent Research System
- **Repository**: [ai-agents-advanced-projects](https://github.com/EmaanHumayun/ai-agents-advanced-projects/tree/main/projects/12-multi-agent-research-system)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Complex investigative research exceeds single-prompt context limits and requires adversarial critique to eliminate bias and hallucinated facts.
- **Architecture**: Multi-agent coordination graph with specialized agents: Lead Coordinator, Web Researcher, Data Analyst, Fact-Checker, and Technical Writer communicating over a shared blackboard state.
- **Tech Stack**: Python, Multi-Agent Orchestration Bus, LangGraph, Schema Validation.
- **Deliverables**: Agent role definitions, communication protocol, consensus algorithm, synthesized final report.

### Project 13: Multi-Agent Software Development System
- **Repository**: [ai-agents-advanced-projects](https://github.com/EmaanHumayun/ai-agents-advanced-projects/tree/main/projects/13-multi-agent-software-dev-system)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Software development requires coordinating specifications, architecture, code writing, unit testing, and documentation across distinct specialized perspectives.
- **Architecture**: Agent collective simulating an agile sprint: Product Analyst drafts user stories, Software Architect outlines interfaces, Developer writes code in an isolated directory, Tester executes test runners, and Documentation agent writes API specs.
- **Tech Stack**: Python, Subprocess Sandbox, Git Branching, Pytest Runner.
- **Deliverables**: SDLC agent team, workspace manager, automated test feedback loop, PR generator.

### Project 14: AI Data Analyst Agent
- **Repository**: [ai-agents-advanced-projects](https://github.com/EmaanHumayun/ai-agents-advanced-projects/tree/main/projects/14-ai-data-analyst-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Non-technical stakeholders need data insights without writing SQL, but open text-to-SQL poses severe SQL injection and destructive operation risks.
- **Architecture**: Guarded Text-to-SQL pipeline parsing database schemas, generating read-only queries validated against an AST parser, executing queries in PostgreSQL, and rendering charts via Matplotlib/Seaborn.
- **Tech Stack**: Python, SQLGlot (AST parsing), SQLAlchemy, Pandas, Matplotlib.
- **Deliverables**: Schema profiler, AST SQL validator, safe execution sandbox, automated visualization generator.

### Project 15: Agent Evaluation & Testing Platform
- **Repository**: [ai-agents-advanced-projects](https://github.com/EmaanHumayun/ai-agents-advanced-projects/tree/main/projects/15-agent-evaluation-testing-platform)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Prompts and models drift over time; engineering teams need automated regression testing to measure tool accuracy, hallucination rates, and cost tradeoffs.
- **Architecture**: Automated testing framework running synthetic test suites, measuring tool-calling precision, evaluating groundedness using LLM-as-a-judge, and logging latency/token metrics.
- **Tech Stack**: Python, Pytest, Ragas / DeepEval concepts, OpenTelemetry, Pandas.
- **Deliverables**: Benchmark dataset, evaluation metrics suite, regression test runner, markdown report generator.

---

## Level 4: Professional Projects

### Project 16: DevOps AI Operations Agent (AIOps)
- **Repository**: [ai-agents-professional-projects](https://github.com/EmaanHumayun/ai-agents-professional-projects/tree/main/projects/16-devops-ai-operations-agent)
- **Status**: Planned / Scaffolding Ready
- **Problem**: SRE teams spend hours diagnosing cryptic error logs and alert storms during infrastructure incidents.
- **Architecture**: Operational agent ingesting Prometheus alerts and system logs, parsing stack traces, querying internal runbooks, proposing remediation commands, and requiring operator approval before executing SSH commands.
- **Tech Stack**: Python, Paramiko (SSH), Prometheus Client, Docker SDK, Audit Logger.
- **Deliverables**: Alert receiver, log triage analyzer, runbook matcher, approval gatekeeper, audit logger.

### Project 17: AI Customer Support Multi-Agent Platform
- **Repository**: [ai-agents-professional-projects](https://github.com/EmaanHumayun/ai-agents-professional-projects/tree/main/projects/17-ai-customer-support-platform)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Customer support operations need automated tier-1 resolution, sentiment analysis, CRM ticketing, and instant human escalation.
- **Architecture**: Production support system comprising Intent Classification Agent, Knowledge Retrieval Agent, Resolution Generator, and Escalation Guardrail.
- **Tech Stack**: Python, FastAPI, PostgreSQL, Redis, Slack / Zendesk Mock Webhooks.
- **Deliverables**: Multi-agent support pipeline, escalation manager, ticket synchronization adapter, conversation visualizer.

### Project 18: AI Business Operations Agent Platform
- **Repository**: [ai-agents-professional-projects](https://github.com/EmaanHumayun/ai-agents-professional-projects/tree/main/projects/18-ai-business-operations-platform)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Disparate corporate systems (CRM, ERP, billing) require cross-platform workflow orchestration, financial approvals, and immutable compliance auditing.
- **Architecture**: Business operations gateway managing document extraction, ERP data validation, expense policy enforcement, and multi-tier cryptographic approval workflows.
- **Tech Stack**: Python, FastAPI, Role-Based Access Control (RBAC), Cryptographic Audit Ledger.
- **Deliverables**: Business process orchestrator, policy rule engine, RBAC authorizer, compliance report generator.

### Project 19: Autonomous Software Engineering Platform
- **Repository**: [ai-agents-professional-projects](https://github.com/EmaanHumayun/ai-agents-professional-projects/tree/main/projects/19-autonomous-software-engineering)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Repetitive software engineering tasks (fixing linting errors, updating deprecated dependencies, resolving minor bugs) require end-to-end autonomous resolution in isolated sandboxes.
- **Architecture**: Autonomous agent that consumes a GitHub issue, explores the repository files, formulates an implementation plan, makes code edits in an ephemeral Docker container, runs tests, and submits a pull request with CI status summaries.
- **Tech Stack**: Python, Docker SDK, GitHub Apps API, Git, Pytest.
- **Deliverables**: Autonomous issue worker, ephemeral container sandbox, git commit synthesizer, PR generator.

### Project 20: Enterprise Agentic AI Platform
- **Repository**: [ai-agents-professional-projects](https://github.com/EmaanHumayun/ai-agents-professional-projects/tree/main/projects/20-enterprise-agentic-ai-platform)
- **Status**: Planned / Scaffolding Ready
- **Problem**: Enterprises require a secure, unified gateway to govern, rate-limit, authenticate, observe, and deploy diverse autonomous agents at scale.
- **Architecture**: Cloud-native platform running on Kubernetes, featuring an Agent Registry, Model Routing Gateway, Multi-Tenant RBAC, Distributed Task Queues (Celery/Redis), OpenTelemetry tracing, and Grafana monitoring.
- **Tech Stack**: Python, FastAPI, Kubernetes (Helm), Celery/Redis, PostgreSQL, OpenTelemetry, Prometheus.
- **Deliverables**: Microservices architecture, Kubernetes manifests, gateway security filters, tracing exporter, enterprise case study.
`;
write(path.join(HUB_DIR, 'PROJECT-CATALOG.md'), PROJECT_CATALOG);

// 5. CONCEPT-MASTERY-INDEX.md
const CONCEPT_INDEX = `# Concept Mastery Index

A comprehensive cross-tier index tracking where core agentic AI concepts are introduced, practiced, and mastered across the curriculum.

---

## Mastery Matrix

| Concept | Introduced In | Practiced In | Applied In | Level |
| :--- | :--- | :--- | :--- | :--- |
| **LLM Fundamentals & Tokens** | Project 01 | Project 02, 03 | Projects 01 - 20 | Level 1: Beginner |
| **System Prompts & Context** | Project 01 | Project 02, 04 | Projects 01 - 20 | Level 1: Beginner |
| **Function Calling & Tool Schemas** | Project 02 | Project 03, 04 | Projects 02, 06, 10, 16 | Level 1: Beginner |
| **Pydantic Structured Outputs** | Project 02 | Project 04, 05 | Projects 02, 08, 14, 15 | Level 1: Beginner |
| **Deterministic Tool Execution** | Project 02 | Project 04 | Projects 02, 07, 10, 16 | Level 1: Beginner |
| **Information Extraction & Citations** | Project 03 | Project 05 | Projects 03, 09, 12 | Level 1: Beginner |
| **Database Tool CRUD Interaction** | Project 04 | Project 06, 07 | Projects 04, 10, 14 | Level 1: Beginner |
| **Chunking & Semantic Embeddings** | Project 05 | Project 06, 09 | Projects 05, 08, 09, 17 | Level 1: Beginner |
| **Retrieval-Augmented Generation (RAG)**| Project 05 | Project 09 | Projects 05, 09, 17, 20 | Level 1: Beginner |
| **Dual-Tier Memory (Short vs Long)** | Project 06 | Project 07 | Projects 06, 11, 18, 20 | Level 2: Intermediate |
| **Redis Working Memory** | Project 06 | Project 10 | Projects 06, 13, 20 | Level 2: Intermediate |
| **OAuth 2.0 & Token Refresh** | Project 07 | Project 10 | Projects 07, 10, 18 | Level 2: Intermediate |
| **Human-in-the-Loop Safeguards** | Project 07 | Project 13, 16 | Projects 07, 16, 18, 19 | Level 2: Intermediate |
| **AST Parsing & Code Analysis** | Project 08 | Project 13 | Projects 08, 14, 19 | Level 2: Intermediate |
| **Hybrid Search (BM25 + Dense Vectors)**| Project 09 | Project 17 | Projects 09, 17, 20 | Level 2: Intermediate |
| **Cross-Encoder Reranking** | Project 09 | Project 15 | Projects 09, 15 | Level 2: Intermediate |
| **API Webhook Orchestration** | Project 10 | Project 16 | Projects 10, 16, 18, 20 | Level 2: Intermediate |
| **State-Machine DAG Planning** | Project 11 | Project 12, 13 | Projects 11, 12, 19, 20 | Level 3: Advanced |
| **Dynamic Replanning on Failure** | Project 11 | Project 13 | Projects 11, 19 | Level 3: Advanced |
| **Multi-Agent Coordination & Consensus**| Project 12 | Project 13, 17 | Projects 12, 13, 17, 19 | Level 3: Advanced |
| **Shared State & Message Passing** | Project 12 | Project 13 | Projects 12, 13, 17, 20 | Level 3: Advanced |
| **Text-to-SQL with Guardrail ASTs** | Project 14 | Project 15 | Projects 14, 18 | Level 3: Advanced |
| **Quantitative Agent Evaluation** | Project 15 | Project 16 | Projects 15, 20 | Level 3: Advanced |
| **Hallucination & Groundedness Metrics**| Project 15 | Project 20 | Projects 15, 20 | Level 3: Advanced |
| **AIOps & Log Telemetry Integration** | Project 16 | Project 20 | Projects 16, 20 | Level 4: Professional |
| **SSH & Infrastructure Automation** | Project 16 | Project 19 | Projects 16, 19 | Level 4: Professional |
| **Enterprise RBAC & Multi-Tenancy** | Project 18 | Project 20 | Projects 18, 20 | Level 4: Professional |
| **Sandboxed Docker Execution** | Project 19 | Project 20 | Projects 19, 20 | Level 4: Professional |
| **Kubernetes Container Orchestration**| Project 20 | - | Project 20 | Level 4: Professional |
| **Distributed Tracing (OpenTelemetry)** | Project 20 | - | Projects 15, 20 | Level 4: Professional |
`;
write(path.join(HUB_DIR, 'CONCEPT-MASTERY-INDEX.md'), CONCEPT_INDEX);

// 6. TECHNOLOGY-STACK.md
const TECH_STACK = `# Technology Stack & Rationale

This document defines the toolchain, libraries, and infrastructure components used across the AI Agent Engineering curriculum.

---

## Technology Progression Matrix

| Category | Beginner (01-05) | Intermediate (06-10) | Advanced (11-15) | Professional (16-20) |
| :--- | :--- | :--- | :--- | :--- |
| **Programming Language** | Python 3.10+ | Python 3.10+ | Python 3.10+ (Async) | Python 3.11+, Bash |
| **Web Framework** | - | FastAPI, HTTPX | FastAPI | FastAPI, Uvicorn, Gunicorn |
| **Data Validation** | Pydantic v2 | Pydantic v2 | Pydantic v2 | Pydantic v2 |
| **Database & Persistence** | SQLite | PostgreSQL, Redis | PostgreSQL | PostgreSQL, Redis, MinIO |
| **Vector Storage** | ChromaDB / In-Memory | pgvector / Qdrant | Qdrant / FAISS | Milvus / pgvector |
| **Agent Orchestration** | Pure Python loops | Custom Dispatchers | LangGraph / StateGraph | LangGraph, Celery, K8s |
| **Static & SQL Analysis** | - | AST, GitPython | SQLGlot | AST, Docker SDK, Paramiko |
| **Testing & Evaluation** | Pytest | Pytest, Mock APIs | Pytest, Ragas, Tracing | Pytest, Testcontainers |
| **Infrastructure & DevOps**| Local environment | Docker | Docker Compose | Docker, Kubernetes, Helm |
| **Observability** | Console logs | Structured JSON logs | OpenTelemetry, Traces | Prometheus, Grafana, OpenTelemetry |

---

## Tool Rationale

### Why Python?
Python is the undisputed industry standard for AI, machine learning, and agentic workflows. Its native support for dynamic typing, rich AST inspection, mature async runtimes, and universal SDK adoption across major model providers makes it ideal for building robust agent loops.

### Why Pydantic?
Pydantic v2 offers ultra-fast C-extension data validation and automatic JSON Schema generation. In agentic systems, Pydantic models guarantee that LLM function call arguments strictly adhere to expected types before tool execution.

### Why LangGraph for Advanced Tiers?
Unlike rigid sequential pipelines, LangGraph models agent reasoning as a Directed Acyclic Graph (DAG) with cycles. This enables deterministic state persistence, branching, human-in-the-loop pause/resume checkpoints, and multi-agent cyclic loops.
`;
write(path.join(HUB_DIR, 'TECHNOLOGY-STACK.md'), TECH_STACK);

// 7. ARCHITECTURE-GUIDE.md
const ARCH_GUIDE = `# AI Agent Architecture Guide

Comprehensive reference detailing architectural patterns, state representations, cognitive loops, and security guardrails for agentic systems.

---

## 1. The Core Agent Loop (ReAct Pattern)

\`\`\`
                     [ User Goal / Event ]
                               |
                               v
                     +-------------------+
                     | Context Assembly  | <--- [ Short/Long Memory ]
                     +-------------------+
                               |
                               v
                  +-------------------------+
                  |  LLM Cognitive Step     |
                  |  (Reasoning & Planning) |
                  +-------------------------+
                               |
            +------------------+------------------+
            |                                     |
    (Tool Call Required)                    (Goal Fulfilled)
            |                                     |
            v                                     v
+-----------------------+              +----------------------+
| Schema Validation     |              | Final Output Return  |
+-----------------------+              +----------------------+
            |
            v
+-----------------------+
| Deterministic Tool    |
| Execution             |
+-----------------------+
            |
            v
+-----------------------+
| Append Result to State|
+-----------------------+
            |
            +------------------+ (Loop back for next reasoning step)
\`\`\`

---

## 2. Memory Architectures

### Short-Term (Working Context)
- Maintained inside the model's active context window.
- In-memory message queues trimmed via sliding-window algorithms or token-budget summarizers.

### Long-Term (Episodic & Semantic Memory)
- Stored externally in PostgreSQL (relational event history) and vector databases (semantic embeddings).
- Queried via cosine similarity to recall relevant past conversations or user preferences.

---

## 3. Human-in-the-Loop (HITL) Architecture

Destructive or sensitive actions (transmitting emails, modifying infrastructure, financial payments) must never execute autonomously without verified human review:

\`\`\`
[ Agent proposes action ] ---> [ Action flagged as SENSITIVE ]
                                        |
                                        v
                            [ Save checkpoint to State ]
                            [ Send Approval Notification ]
                                        |
                            +-----------+-----------+
                            |                       |
                     (Approved)                 (Rejected)
                            |                       |
                            v                       v
               [ Execute Action Handler ]  [ Append Rejection Notice ]
                            |                       |
                            +-----------+-----------+
                                        |
                                        v
                          [ Resume Agent Execution ]
\`\`\`
`;
write(path.join(HUB_DIR, 'ARCHITECTURE-GUIDE.md'), ARCH_GUIDE);

// 8. GLOSSARY.md
const GLOSSARY = `# AI Agent Engineering Glossary

Formal definitions of core terms across LLM inference, cognitive loops, tool calling, and multi-agent systems.

- **AI Agent**: A software component that uses an LLM to reason, plan, and autonomously execute actions via tools to achieve a specified goal.
- **Agent Loop**: The iterative execution cycle wherein an agent perceives state, queries a model, executes chosen tools, and reflects on outcomes.
- **Context Window**: The maximum sequence of tokens (prompt + completion) an LLM can process in a single inference call.
- **Function / Tool Calling**: A capability allowing models to output structured JSON arguments matching a predefined schema to invoke external functions.
- **Groundedness**: The degree to which an agent's claims are directly supported by retrieved context rather than unverified internal model weights.
- **Hallucination**: Generated model output that presents incorrect, ungrounded, or fabricated information as factual.
- **Human-in-the-Loop (HITL)**: A system design pattern requiring explicit manual authorization before an agent can execute high-stakes or irreversible actions.
- **Prompt Injection**: A security vulnerability wherein untrusted inputs manipulate an LLM into ignoring instructions and executing malicious commands.
- **Retrieval-Augmented Generation (RAG)**: Architecture enriching prompt context with relevant documents retrieved from external knowledge bases.
- **Token**: The atomic unit of text (typically 3-4 characters in English) processed by language models.
`;
write(path.join(HUB_DIR, 'GLOSSARY.md'), GLOSSARY);

// 9. CONTRIBUTING.md, LICENSE, .gitignore
write(path.join(HUB_DIR, 'CONTRIBUTING.md'), `# Contributing Guidelines\n\nContributions are welcome! Please follow clean coding standards, add unit tests, and preserve zero-emoji engineering typography.\n`);
write(path.join(HUB_DIR, 'LICENSE'), `MIT License\n\nCopyright (c) 2026 Emaan Humayun\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software...\n`);
write(path.join(HUB_DIR, '.gitignore'), `__pycache__/\n*.py[cod]\n*$py.class\n*.so\n.env\n.env.local\nvenv/\nENV/\nenv/\n*.log\n.pytest_cache/\n.coverage\ncoverage/\nhtmlcov/\n.DS_Store\n`);

// 10. docs/ directory files
const DOCS_DIR = path.join(HUB_DIR, 'docs');
write(path.join(DOCS_DIR, 'getting-started.md'), `# Getting Started with the AI Agent Engineering Curriculum\n\nInstructions on setting up local Python virtual environments, API keys, and repository navigation.\n`);
write(path.join(DOCS_DIR, 'how-ai-agents-work.md'), `# How AI Agents Work\n\nCore breakdown of perception, reasoning, tool execution, and reflection loops.\n`);
write(path.join(DOCS_DIR, 'llm-fundamentals.md'), `# LLM Fundamentals\n\nInference mechanics, tokenization, temperature parameters, and cost optimization.\n`);
write(path.join(DOCS_DIR, 'prompt-engineering.md'), `# Prompt Engineering for Agents\n\nRole definitions, few-shot examples, system instructions, and ReAct structuring.\n`);
write(path.join(DOCS_DIR, 'function-calling.md'), `# Function Calling & Tool Schemas\n\nPydantic JSON Schema generation and error handling during model tool selection.\n`);
write(path.join(DOCS_DIR, 'agent-memory.md'), `# Agent Memory Systems\n\nSliding window context, Redis session caching, and PostgreSQL vector persistence.\n`);
write(path.join(DOCS_DIR, 'rag-fundamentals.md'), `# Retrieval-Augmented Generation (RAG)\n\nChunking strategies, embedding models, vector similarity metrics, and context injection.\n`);
write(path.join(DOCS_DIR, 'agent-planning.md'), `# Agent Planning & Goal Decomposition\n\nSingle-path planning, tree-of-thought, DAG state machines, and dynamic replanning.\n`);
write(path.join(DOCS_DIR, 'tool-orchestration.md'), `# Tool Orchestration\n\nRate limiting, timeout policies, idempotency, and error recovery in external tools.\n`);
write(path.join(DOCS_DIR, 'multi-agent-systems.md'), `# Multi-Agent Systems\n\nTopologies (hierarchical, peer-to-peer, blackboard), message passing, and conflict resolution.\n`);
write(path.join(DOCS_DIR, 'agent-evaluation.md'), `# Agent Evaluation & Benchmarks\n\nEvaluating tool selection precision, task success rate, hallucination detection, and latency.\n`);
write(path.join(DOCS_DIR, 'agent-security.md'), `# Agent Security & Guardrails\n\nPrompt injection mitigation, least-privilege tool execution, and human approval gates.\n`);
write(path.join(DOCS_DIR, 'production-deployment.md'), `# Production Deployment\n\nContainerization, Kubernetes scaling, background queue workers, and OpenTelemetry tracing.\n`);
write(path.join(DOCS_DIR, 'glossary.md'), `# Agentic AI Glossary\n\nReference definitions for all curriculum terminology.\n`);

// 11. learning-levels/
const LEVELS_DIR = path.join(HUB_DIR, 'learning-levels');
write(path.join(LEVELS_DIR, 'beginner.md'), `# Level 1: Beginner Overview\n\nProjects 01 to 05: LLM basics, prompt structure, tool calling, and foundational RAG.\n`);
write(path.join(LEVELS_DIR, 'intermediate.md'), `# Level 2: Intermediate Overview\n\nProjects 06 to 10: Persistent memory, OAuth 2.0 email agents, code analysis, and hybrid RAG.\n`);
write(path.join(LEVELS_DIR, 'advanced.md'), `# Level 3: Advanced Overview\n\nProjects 11 to 15: State-machine planning, multi-agent systems, text-to-SQL, and evaluation.\n`);
write(path.join(LEVELS_DIR, 'professional.md'), `# Level 4: Professional Overview\n\nProjects 16 to 20: AIOps, customer support platforms, enterprise ops, and production gateways.\n`);

// 12. progress/
const PROGRESS_DIR = path.join(HUB_DIR, 'progress');
write(path.join(PROGRESS_DIR, 'overall-progress.md'), `# Overall Progress Dashboard\n\n- Total Projects: 20\n- Completed Reference: 1 (Project 01: Intelligent AI Chat Agent)\n- Scaffolding & Specifications Ready: 19 (Projects 02 - 20)\n- Authentic Progress: 5% Complete (1/20)\n\n| Project | Level | Status |\n| :--- | :--- | :--- |\n| 01. Intelligent AI Chat Agent | Level 1 | Completed |\n| 02. Tool-Calling AI Agent | Level 1 | Planned |\n| 03. AI Research Assistant | Level 1 | Planned |\n| 04. Personal Productivity Agent | Level 1 | Planned |\n| 05. Document Q&A Agent | Level 1 | Planned |\n| 06. Memory-Enabled Personal AI Agent | Level 2 | Planned |\n| 07. AI Email Management Agent | Level 2 | Planned |\n| 08. AI Coding Assistant Agent | Level 2 | Planned |\n| 09. RAG-Based Knowledge Base Agent | Level 2 | Planned |\n| 10. API Integration Agent | Level 2 | Planned |\n| 11. Autonomous Planning & Execution Agent | Level 3 | Planned |\n| 12. Multi-Agent Research System | Level 3 | Planned |\n| 13. Multi-Agent Software Development System | Level 3 | Planned |\n| 14. AI Data Analyst Agent | Level 3 | Planned |\n| 15. Agent Evaluation & Testing Platform | Level 3 | Planned |\n| 16. DevOps AI Operations Agent | Level 4 | Planned |\n| 17. AI Customer Support Multi-Agent Platform | Level 4 | Planned |\n| 18. AI Business Operations Agent Platform | Level 4 | Planned |\n| 19. Autonomous Software Engineering Platform | Level 4 | Planned |\n| 20. Enterprise Agentic AI Platform | Level 4 | Planned |\n`);
write(path.join(PROGRESS_DIR, 'beginner-progress.md'), `# Beginner Tier Progress\n\n- [x] Project 01: Intelligent AI Chat Agent\n- [ ] Project 02: Tool-Calling AI Agent\n- [ ] Project 03: AI Research Assistant\n- [ ] Project 04: Personal Productivity Agent\n- [ ] Project 05: Document Q&A Agent\n`);
write(path.join(PROGRESS_DIR, 'intermediate-progress.md'), `# Intermediate Tier Progress\n\n- [ ] Project 06: Memory-Enabled Personal AI Agent\n- [ ] Project 07: AI Email Management Agent\n- [ ] Project 08: AI Coding Assistant Agent\n- [ ] Project 09: RAG-Based Knowledge Base Agent\n- [ ] Project 10: API Integration Agent\n`);
write(path.join(PROGRESS_DIR, 'advanced-progress.md'), `# Advanced Tier Progress\n\n- [ ] Project 11: Autonomous Planning & Execution Agent\n- [ ] Project 12: Multi-Agent Research System\n- [ ] Project 13: Multi-Agent Software Development System\n- [ ] Project 14: AI Data Analyst Agent\n- [ ] Project 15: Agent Evaluation & Testing Platform\n`);
write(path.join(PROGRESS_DIR, 'professional-progress.md'), `# Professional Tier Progress\n\n- [ ] Project 16: DevOps AI Operations Agent\n- [ ] Project 17: AI Customer Support Multi-Agent Platform\n- [ ] Project 18: AI Business Operations Agent Platform\n- [ ] Project 19: Autonomous Software Engineering Platform\n- [ ] Project 20: Enterprise Agentic AI Platform\n`);

// 13. templates/
const TEMPLATES_DIR = path.join(HUB_DIR, 'templates');
write(path.join(TEMPLATES_DIR, 'project-readme-template.md'), `# Project Title\n\n## Overview\n## Problem Solved\n## Architecture\n## Quick Start\n\`\`\`bash\npip install -r requirements.txt\npython -m pytest\npython main.py\n\`\`\`\n`);
write(path.join(TEMPLATES_DIR, 'lab-template.md'), `# Lab Title\n\n- **Difficulty**: Beginner / Intermediate / Advanced\n- **Estimated Time**: 30-45 minutes\n\n### Learning Objectives\n### Step-by-Step Instructions\n### Expected Output\n### Verification\n`);
write(path.join(TEMPLATES_DIR, 'assignment-template.md'), `# Assignment Title\n\n### Problem Statement\n### Requirements\n### Constraints\n### Evaluation Rubric\n`);
write(path.join(TEMPLATES_DIR, 'technical-report-template.md'), `# Technical Report Template\n\n## Executive Summary\n## System Architecture\n## Performance & Evaluation Metrics\n## Lessons Learned\n`);
write(path.join(TEMPLATES_DIR, 'project-completion-template.md'), `# Project Completion Checklist\n\n- [ ] All guided practical labs executed\n- [ ] Independent assignments completed\n- [ ] Source code implemented and structured\n- [ ] Automated tests passing\n- [ ] Evaluation metrics documented\n`);

// 14. resources/
const RES_DIR = path.join(HUB_DIR, 'resources');
write(path.join(RES_DIR, 'official-documentation.md'), `# Official Documentation References\n\n- Python Documentation: docs.python.org\n- Pydantic Documentation: docs.pydantic.dev\n- FastAPI Documentation: fastapi.tiangolo.com\n- LangGraph Documentation: langchain-ai.github.io/langgraph\n- Qdrant Documentation: qdrant.tech/documentation\n`);
write(path.join(RES_DIR, 'free-learning-resources.md'), `# Free Learning Resources\n\n- Anthropic Prompt Engineering Interactive Tutorial\n- DeepLearning.AI Short Courses on AI Agents\n- Hugging Face Open-Source LLMs Course\n`);
write(path.join(RES_DIR, 'recommended-tools.md'), `# Recommended Developer Tools\n\n- Ollama for local LLM testing (Llama 3, Mistral)\n- SQLite Browser & DBeaver for database inspection\n- Docker Desktop / Podman for containerized isolation\n`);
write(path.join(RES_DIR, 'research-papers.md'), `# Essential Research Papers on Agentic AI\n\n- ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., 2022)\n- Toolformer: Language Models Can Teach Themselves to Use Tools (Schick et al., 2023)\n- Reflexion: Language Agents with Verbal Reinforcement Learning (Shinn et al., 2023)\n- Communicative Agents for Software Development (Qian et al., 2023)\n`);

// Initialize local git repo
try {
  execSync('git init -b main', { cwd: HUB_DIR, stdio: 'ignore' });
} catch {
  execSync('git init', { cwd: HUB_DIR, stdio: 'ignore' });
  try { execSync('git branch -M main', { cwd: HUB_DIR, stdio: 'ignore' }); } catch {}
}

execSync('git add .', { cwd: HUB_DIR });
execSync('git commit -m "feat: initialize ai-agent-engineering-hub with roadmap, project catalog, concept index, and architecture guides"', { cwd: HUB_DIR });
console.log('Constructed ai-agent-engineering-hub locally.');

