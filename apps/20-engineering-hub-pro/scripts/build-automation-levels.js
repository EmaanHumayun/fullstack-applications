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
    repoName: 'automation-beginner-projects',
    title: 'Automation Beginner Projects (Level 1)',
    tier: 'Level 1: Beginner',
    description: 'Foundational automation projects covering webhook triggers, REST APIs, JSON data transformation, file automation, and email notifications.',
    projects: [
      {
        id: '01',
        slug: '01-automated-email-notification-system',
        name: 'Automated Email Notification System',
        status: 'Completed',
        summary: 'Transactional email notification service ingesting authenticated webhooks, compiling HTML templates, and dispatching notifications with retry resilience.',
        tech: 'Node.js, Express, Nodemailer, Ethereal/SMTP, HMAC, Docker',
        problem: 'Distributed applications need a centralized, decoupled email notification endpoint that validates incoming events and guarantees delivery without exposing internal SMTP credentials to multiple services.',
        users: 'Backend services, microservices, internal applications requiring transactional email dispatch.',
        concepts: 'Webhook triggers, HMAC-SHA256 signature verification, JSON payload validation, HTML templating, exponential backoff, rate limiting, Docker containerization.',
        triggers: 'HTTP POST /api/v1/notifications/email with HMAC header.',
        actions: 'Verify HMAC, validate schema, compile template, send via SMTP, record delivery log.',
        inputs: 'JSON payload containing recipient email, subject, templateId, and dynamic template variables.',
        outputs: 'JSON response with delivery status, tracking ID, and message timestamp.'
      },
      {
        id: '02',
        slug: '02-google-sheets-data-automation',
        name: 'Google Sheets Data Automation',
        status: 'Planned',
        summary: 'Bidirectional spreadsheet automation extracting, validating, and updating rows based on cron schedules and incoming webhooks.',
        tech: 'Python, Google Sheets API, OAuth 2.0 / Service Account, Cron, JSON',
        problem: 'Operational teams manually maintain spreadsheets, leading to out-of-sync inventory, duplicated entries, and lack of audit logging.',
        users: 'Operations managers, sales ops, data entry specialists.',
        concepts: 'OAuth 2.0 service accounts, batch API reads/writes, rate limit pacing, cell validation, cron scheduling, data delta detection.',
        triggers: 'Scheduled cron every 15 minutes, or HTTP webhook on row change.',
        actions: 'Authenticate with Google APIs, read sheet range, filter modified rows, validate format, sync to database.',
        inputs: 'Raw sheet rows or JSON webhook event from Google Forms/Sheets.',
        outputs: 'Formatted data rows written to sheet or database sync status report.'
      },
      {
        id: '03',
        slug: '03-form-submission-automation',
        name: 'Form Submission Automation',
        status: 'Planned',
        summary: 'High-throughput form ingestion service validating fields, preventing duplicate submissions, and dispatching multi-channel alerts.',
        tech: 'Node.js, Express, SQLite, Joi/Zod, Nodemailer, Slack Webhook',
        problem: 'Website contact and inquiry forms receive spam, duplicate submissions, and need instant routing to sales without server lag.',
        users: 'Marketing teams, customer acquisition teams, site administrators.',
        concepts: 'Input sanitization, honeypot spam detection, hash-based deduplication, async notification dispatch, SQLite audit storage.',
        triggers: 'HTTP POST /api/v1/forms/submit from website frontend.',
        actions: 'Validate schema, verify honeypot, calculate submission hash, save to SQLite, dispatch Slack notification and confirmation email.',
        inputs: 'Multipart or JSON form payload (name, email, company, inquiry, honeypot).',
        outputs: 'HTTP 201 Created with submission ticket ID and sanitized confirmation.'
      },
      {
        id: '04',
        slug: '04-automated-file-management-system',
        name: 'Automated File Management System',
        status: 'Planned',
        summary: 'File system automation watching directories, sorting incoming files by MIME type, compressing aged archives, and syncing to remote storage.',
        tech: 'Python, Watchdog, Shutil, Cron, S3 SDK (Boto3/MinIO)',
        problem: 'Application servers and shared drives accumulate gigabytes of disorganized logs, reports, and uploads without automated lifecycle policies.',
        users: 'System administrators, DevOps engineers, content managers.',
        concepts: 'File system event watching, MIME detection, gzip compression, automated retention rules, object storage backup.',
        triggers: 'File system creation event (watchdog) or daily cron archive run.',
        actions: 'Inspect new file, detect type, move to categorized subfolder, compress files older than 30 days, upload to S3 bucket.',
        inputs: 'Local directory paths, file system change notifications.',
        outputs: 'Structured directory tree, compressed .tar.gz archives, transfer logs.'
      },
      {
        id: '05',
        slug: '05-multi-api-data-integration-system',
        name: 'Multi-API Data Integration System',
        status: 'Planned',
        summary: 'Aggregator service querying diverse external REST APIs, normalizing inconsistent schemas, and providing a unified consolidated payload.',
        tech: 'Node.js, Axios, Express, JSON Schema, Redis/In-Memory Cache',
        problem: 'Frontend dashboards and microservices must query multiple third-party APIs with differing authentication, pagination, and data formats.',
        users: 'Frontend engineers, data analysts, downstream reporting tools.',
        concepts: 'Parallel HTTP requests, token-bucket rate limiting, circuit breaking, JSON data normalization, cache invalidation.',
        triggers: 'HTTP GET /api/v1/aggregate-feed or scheduled cache refresher.',
        actions: 'Fetch Weather, Financial, and News APIs concurrently, transform outputs into canonical schema, cache response, return payload.',
        inputs: 'Query parameters (location, symbol, category).',
        outputs: 'Unified canonical JSON response containing aggregated and normalized data.'
      }
    ]
  },
  {
    repoName: 'automation-intermediate-projects',
    title: 'Automation Intermediate Projects (Level 2)',
    tier: 'Level 2: Intermediate',
    description: 'Business process and SaaS integrations covering CRM lead routing, e-commerce transactions, social publishing, helpdesk ticketing, and financial reconciliation.',
    projects: [
      {
        id: '06',
        slug: '06-crm-lead-management-automation',
        name: 'CRM Lead Management Automation',
        status: 'Planned',
        summary: 'Automated lead ingest pipeline syncing webhooks from inbound marketing to CRM platforms with qualification scoring and deduplication.',
        tech: 'Node.js, Express, HubSpot/Mock CRM API, Redis, BullMQ',
        problem: 'Sales teams lose qualified leads due to delayed manual data entry into CRM and lack of automated lead scoring.',
        users: 'Sales operations, growth marketing teams, revenue operations.',
        concepts: 'CRM contact lifecycles, lead scoring algorithms, asynchronous queue workers, OAuth 2.0 token refreshes, deduplication lookups.',
        triggers: 'Webhook from landing page or marketing automation platform.',
        actions: 'Enqueue lead, calculate score, check CRM for existing contact, create or patch contact, assign sales owner.',
        inputs: 'Lead payload (name, email, company_size, budget, intent_score).',
        outputs: 'CRM record ID, assignment notification, queue execution log.'
      },
      {
        id: '07',
        slug: '07-ecommerce-order-automation',
        name: 'E-commerce Order Automation',
        status: 'Planned',
        summary: 'Transactional order processing pipeline handling payment webhooks, inventory decrement, receipt generation, and fulfillment dispatch.',
        tech: 'Node.js, PostgreSQL, Stripe Webhooks, Redis, BullMQ',
        problem: 'E-commerce platforms require bulletproof order processing that never loses an order during traffic spikes or payment gateway retries.',
        users: 'Store merchants, fulfillment teams, e-commerce customers.',
        concepts: 'Stripe signature verification, database transactions (ACID), idempotency tables, distributed job queues, customer receipt dispatch.',
        triggers: 'Stripe webhook payment_intent.succeeded.',
        actions: 'Verify signature, check idempotency key, reserve inventory, create order record in PostgreSQL, enqueue fulfillment task.',
        inputs: 'Stripe webhook JSON payload with customer and cart metadata.',
        outputs: 'Confirmed order record, PDF receipt link, fulfillment queue job ID.'
      },
      {
        id: '08',
        slug: '08-social-media-content-publishing-automation',
        name: 'Social Media Content Publishing Automation',
        status: 'Planned',
        summary: 'Multi-platform content scheduling engine publishing text and media across social networks with platform-specific formatting and telemetry.',
        tech: 'Python, Meta Graph API, X API, Cron, S3 Object Storage',
        problem: 'Publishing content manually across multiple social networks leads to formatting errors, inconsistent timing, and tedious administrative overhead.',
        users: 'Content creators, marketing managers, brand managers.',
        concepts: 'Platform rate limiting, image resizing/aspect ratio adaptation, scheduled database polling, OAuth token refreshing, social analytics capture.',
        triggers: 'Scheduled cron evaluating pending publication queue in database.',
        actions: 'Query scheduled posts, validate media constraints, invoke platform APIs, log post URLs and engagement metrics.',
        inputs: 'Post text, media URL, target platforms, publish timestamp.',
        outputs: 'Published social post IDs, direct URLs, delivery confirmation report.'
      },
      {
        id: '09',
        slug: '09-customer-support-ticket-automation',
        name: 'Customer Support Ticket Automation',
        status: 'Planned',
        summary: 'Intelligent ticket triage and dispatch engine evaluating customer urgency, assigning priority tags, and alerting on-call engineers.',
        tech: 'Node.js, Express, Zendesk/Helpdesk API, Slack API, Regex/NLP',
        problem: 'High volumes of customer support tickets cause critical outages to sit in general queues without immediate triage.',
        users: 'Customer support teams, DevOps on-call engineers, customer success.',
        concepts: 'Keyword sentiment analysis, SLA escalation triggers, webhook notifications, Slack channel alerting, automated acknowledgment emails.',
        triggers: 'Incoming ticket webhook from contact portal or support inbox.',
        actions: 'Parse message, evaluate urgency score, assign priority and tags in Helpdesk, send urgent alert to Slack, reply to customer.',
        inputs: 'Support ticket JSON (user, subject, message, customer tier).',
        outputs: 'Classified ticket ID, assigned agent group, Slack notification status.'
      },
      {
        id: '10',
        slug: '10-invoice-and-payment-reconciliation-automation',
        name: 'Invoice and Payment Reconciliation Automation',
        status: 'Planned',
        summary: 'Financial automation engine matching payment gateway settlements against internal accounting records and detecting fee discrepancies.',
        tech: 'Python, Pandas, Stripe API, PostgreSQL, SMTP Reporting',
        problem: 'Finance teams spend hours manually cross-referencing bank payouts, payment processor transaction fees, and internal order records.',
        users: 'Finance officers, accountants, operations directors.',
        concepts: 'Batch transaction ETL, data joining with Pandas, floating-point currency safety, automated audit report generation, discrepancy alerting.',
        triggers: 'Daily scheduled cron job at 02:00 UTC.',
        actions: 'Extract Stripe payout transaction list, query PostgreSQL order ledger, join on reference ID, identify mismatches, send executive report.',
        inputs: 'Stripe balance transactions batch and internal database order rows.',
        outputs: 'Reconciliation summary report (CSV/HTML) with variance totals.'
      }
    ]
  },
  {
    repoName: 'automation-advanced-projects',
    title: 'Automation Advanced Projects (Level 3)',
    tier: 'Level 3: Advanced',
    description: 'Custom integration platforms, DAG workflow orchestration, event-driven message architectures, data pipelines, and AI business automation.',
    projects: [
      {
        id: '11',
        slug: '11-custom-integration-platform',
        name: 'Custom Integration Platform',
        status: 'Planned',
        summary: 'Pluggable integration runtime engine with standardized connector interfaces, AES-256 encrypted credential vault, and execution telemetry.',
        tech: 'TypeScript, Node.js, Plugin Architecture, AES-256, SQLite/PostgreSQL',
        problem: 'Engineering teams lack an extensible, secure internal integration harness to register and execute custom third-party integrations cleanly.',
        users: 'Integration engineers, platform teams, internal service developers.',
        concepts: 'Plugin architecture, interface segregation, symmetric credential encryption, standardized context passing, execution metrics.',
        triggers: 'CLI invocation, internal API call, or registered webhook trigger.',
        actions: 'Load registered connector, decrypt credentials in memory, execute action handler, record execution duration and status.',
        inputs: 'Connector ID, action name, decrypted config reference, input parameters.',
        outputs: 'Standardized action result object, performance telemetry.'
      },
      {
        id: '12',
        slug: '12-advanced-workflow-orchestration-engine',
        name: 'Advanced Workflow Orchestration Engine',
        status: 'Planned',
        summary: 'Directed Acyclic Graph (DAG) workflow engine supporting concurrent branches, dependency resolution, retries, and rollback compensation.',
        tech: 'TypeScript, Node.js, PostgreSQL, State Machine, Docker',
        problem: 'Linear script automation breaks down when business logic requires complex branch decisions, parallel tasks, and transactional rollbacks.',
        users: 'DevOps architects, backend engineers, workflow designers.',
        concepts: 'Topological sort, DAG cycle detection, persistent state machines, step retry policies, compensating transaction rollbacks.',
        triggers: 'API trigger or scheduled execution of a defined DAG workflow.',
        actions: 'Parse DAG JSON, compute execution order, spawn parallel worker promises, checkpoint step outputs in DB, execute compensations on error.',
        inputs: 'DAG definition JSON containing nodes, dependency edges, and step parameters.',
        outputs: 'Workflow run ID, detailed step execution graph, final state payload.'
      },
      {
        id: '13',
        slug: '13-event-driven-automation-platform',
        name: 'Event-Driven Automation Platform',
        status: 'Planned',
        summary: 'High-throughput event bus decoupling ingestion from worker execution using RabbitMQ, topic exchanges, and dead-letter queues.',
        tech: 'Node.js/Go, RabbitMQ, AMQP 0-9-1, Docker, Prometheus',
        problem: 'Direct webhook calls fail under sudden load spikes, overwhelming downstream internal APIs and causing catastrophic cascading failures.',
        users: 'System architects, microservices teams, high-traffic web applications.',
        concepts: 'AMQP topic routing keys, producer-consumer decoupling, prefetch limits, message acknowledgments (ACK/NACK), dead-lettering.',
        triggers: 'HTTP event ingestion gateway or internal message publish.',
        actions: 'Publish event to RabbitMQ topic exchange, consume in dedicated worker pool, process idempotent payload, re-route failed messages to DLQ.',
        inputs: 'Domain event payload (event_type, timestamp, payload, source).',
        outputs: 'Queue publish ACK, worker execution telemetry, DLQ inspection metrics.'
      },
      {
        id: '14',
        slug: '14-data-synchronization-and-etl-pipeline',
        name: 'Data Synchronization and ETL Pipeline',
        status: 'Planned',
        summary: 'High-volume batch and streaming ETL pipeline extracting relational data, transforming schemas, and loading into an analytical warehouse.',
        tech: 'Python, SQLAlchemy, PostgreSQL, Redis, Pandas',
        problem: 'Analytical reporting queries lock operational transaction tables, degrading customer-facing database performance.',
        users: 'Data engineers, BI analysts, analytics teams.',
        concepts: 'High-watermark incremental sync, batch chunking, data schema validation, bulk upsert operations, pipeline failure alerting.',
        triggers: 'Hourly cron schedule or streaming change-data-capture trigger.',
        actions: 'Query changed rows since last watermark, clean and normalize fields, bulk write to analytics database, update watermark in Redis.',
        inputs: 'Source database connection, target warehouse credentials, sync window.',
        outputs: 'Synchronized table rows, execution duration log, error summary report.'
      },
      {
        id: '15',
        slug: '15-ai-powered-business-automation-system',
        name: 'AI-Powered Business Automation System',
        status: 'Planned',
        summary: 'Intelligent document extraction and routing pipeline utilizing LLM APIs with strict schema validation to parse invoices and customer emails.',
        tech: 'Python, OpenAI/Gemini API, Instructor/Pydantic, FastAPI, Docker',
        problem: 'Semi-structured invoices, contracts, and unstructured customer emails require expensive human hours to manually transcribe into ERP systems.',
        users: 'Enterprise operations, accounts payable, legal review teams.',
        concepts: 'LLM structured output enforcement, prompt engineering, schema validation, confidence scoring, human-in-the-loop review queues.',
        triggers: 'HTTP POST with document PDF or raw text body.',
        actions: 'Pre-process text, invoke LLM with structured output schema, validate extracted JSON against Pydantic models, route to ERP or review queue.',
        inputs: 'Document text or PDF binary, extraction target schema.',
        outputs: 'Structured JSON containing verified entities, confidence scores, review flags.'
      }
    ]
  },
  {
    repoName: 'automation-professional-projects',
    title: 'Automation Professional Projects (Level 4)',
    tier: 'Level 4: Professional',
    description: 'DevOps infrastructure automation, CI/CD GitHub bots, cloud resource governance, multi-agent AI systems, and enterprise integration gateways.',
    projects: [
      {
        id: '16',
        slug: '16-devops-infrastructure-automation-platform',
        name: 'DevOps Infrastructure Automation Platform',
        status: 'Planned',
        summary: 'Automated health monitoring and self-healing engine executing SSH and container API remediations on unhealthy server instances.',
        tech: 'Python, Paramiko, Docker SDK, Prometheus, Alertmanager',
        problem: 'On-call engineers are repeatedly woken up for routine server failures like disk space exhaustion, frozen containers, and crashed daemons.',
        users: 'DevOps engineers, Site Reliability Engineers (SREs), infrastructure leads.',
        concepts: 'Automated runbook execution, SSH connection pooling, Prometheus webhook receiver, container restart policies, audit logging.',
        triggers: 'Prometheus Alertmanager webhook alert (e.g. DiskFull, ServiceDown).',
        actions: 'Receive alert, identify target host, execute predefined remediation runbook over SSH/Docker API, verify resolution, notify on-call Slack.',
        inputs: 'Alertmanager webhook JSON payload with alert name and host labels.',
        outputs: 'Remediation execution transcript, server health status report.'
      },
      {
        id: '17',
        slug: '17-ci-cd-and-github-automation-platform',
        name: 'CI/CD and GitHub Automation Platform',
        status: 'Planned',
        summary: 'Event-driven GitHub App managing pull request triage, conventional commit validation, test dispatch, and automated release tagging.',
        tech: 'Node.js, TypeScript, Octokit, GitHub Apps, GitHub Actions',
        problem: 'Engineering teams suffer from inconsistent pull request reviews, missed semantic release notes, and broken release branch hygiene.',
        users: 'Software engineering teams, release managers, open-source maintainers.',
        concepts: 'GitHub App authentication (JWT & installation tokens), webhook event handling, conventional commit linting, automated releases.',
        triggers: 'GitHub webhook events: pull_request, issue_comment, push.',
        actions: 'Verify webhook secret, parse PR title/body, apply labels, trigger automated preview deployment, create GitHub release upon merge.',
        inputs: 'GitHub webhook payload with repository, commit, and PR metadata.',
        outputs: 'PR comments, status check updates, automated release notes.'
      },
      {
        id: '18',
        slug: '18-cloud-resource-management-and-automation-system',
        name: 'Cloud Resource Management and Automation System',
        status: 'Planned',
        summary: 'Cloud governance and FinOps automation terminating idle dev instances, enforcing tagging policies, and optimizing cloud expenditures.',
        tech: 'Python, AWS SDK (Boto3), AWS Lambda, CloudWatch, Terraform',
        problem: 'Cloud budgets spiral out of control due to orphaned EBS volumes, untagged test instances running over weekends, and stale snapshots.',
        users: 'Cloud architects, FinOps practitioners, DevOps managers.',
        concepts: 'Cloud resource discovery, policy-as-code enforcement, automated instance shutdown schedules, cost anomaly detection, Terraform IaC.',
        triggers: 'CloudWatch scheduled rule or AWS Config compliance event.',
        actions: 'Scan active cloud resources, evaluate compliance against policy rules, stop unapproved instances, generate weekly cost savings report.',
        inputs: 'Cloud account credentials, policy configuration file.',
        outputs: 'Resource audit manifest, cost reduction metrics, remediation log.'
      },
      {
        id: '19',
        slug: '19-multi-agent-business-process-automation-system',
        name: 'Multi-Agent Business Process Automation System',
        status: 'Planned',
        summary: 'Collaborative multi-agent system coordinating specialized AI agents (researcher, analyst, verifier) to execute multi-stage enterprise workflows.',
        tech: 'Python, LangGraph/CrewAI, Redis, FastAPI, Docker',
        problem: 'Complex strategic business workflows require multi-perspective research, synthesis, and strict fact verification before execution.',
        users: 'Business analysts, executive leadership, operations researchers.',
        concepts: 'Agent communication protocols, shared memory graphs, dynamic tool execution, consensus mechanisms, human-in-the-loop review checkpoints.',
        triggers: 'HTTP POST /api/v1/agent-workflows/execute with process brief.',
        actions: 'Initialize agent graph, assign sub-goals to specialist agents, aggregate findings, critique results, pause for human approval if needed.',
        inputs: 'Business objective brief, required tools list, constraint parameters.',
        outputs: 'Comprehensive final strategic deliverable, agent thought trace, audit log.'
      },
      {
        id: '20',
        slug: '20-enterprise-automation-and-integration-platform',
        name: 'Enterprise Automation and Integration Platform',
        status: 'Planned',
        summary: 'Production-ready, multi-tenant automation gateway deployed on Kubernetes with granular RBAC, distributed tracing, and high availability.',
        tech: 'TypeScript/Go, Kubernetes, PostgreSQL, Redis, Envoy, Prometheus',
        problem: 'Large enterprises need a secure, unified gateway to govern, rate-limit, and monitor hundreds of disparate internal automation pipelines.',
        users: 'Enterprise architects, security officers, engineering leadership.',
        concepts: 'Multi-tenancy isolation, token-bucket rate limiting, distributed tracing (OpenTelemetry), Kubernetes Helm deployments, audit compliance.',
        triggers: 'Authenticated API ingress or enterprise message bus event.',
        actions: 'Authenticate tenant JWT, enforce quota limits, route event to target integration service, emit OpenTelemetry spans, persist audit log.',
        inputs: 'Tenant-scoped API request with authorization bearer token.',
        outputs: 'Routed response, OpenTelemetry trace ID, tenant usage metrics.'
      }
    ]
  }
];

console.log('[BUILD] Constructing 4 Automation Level Repositories...');

for (const level of LEVELS) {
  const repoDir = path.join(BASE, level.repoName);
  ensureDir(repoDir);
  console.log(`[LEVEL] Building ${level.repoName}...`);

  // 1. Root README.md for level repo
  const levelReadme = `# ${level.title}

${level.description}

This repository is part of the **Automation and Integration Engineering Ecosystem** coordinated by the [**automation-integration-hub**](https://github.com/EmaanHumayun/automation-integration-hub).

---

## Repository Overview

- **Engineering Tier**: ${level.tier}
- **Master Hub**: [automation-integration-hub](https://github.com/EmaanHumayun/automation-integration-hub)
- **Engineer**: Emaan Humayun ([@EmaanHumayun](https://github.com/EmaanHumayun))
- **Professional Identity**: Software Engineer | DevOps Engineer

---

## Projects in this Repository

| ID | Project Directory | Status | Technologies | Focus |
| :--- | :--- | :--- | :--- | :--- |
${level.projects.map(p => `| **${p.id}** | [**${p.slug}**](./${p.slug}) | \`${p.status}\` | ${p.tech} | ${p.name} |`).join('\n')}

---

## Internal Directory Architecture

Every project in this repository follows a standardized, production-ready directory structure:

\`\`\`
<project-name>/
|-- README.md                    # Project overview, setup, and execution instructions
|-- PROJECT-SPECIFICATION.md     # 20-point comprehensive engineering specification
|-- REQUIREMENTS.md              # Functional, non-functional, and security requirements
|-- IMPLEMENTATION-ROADMAP.md    # Phased milestones and technical checklist
|-- CHANGELOG.md                 # Project version history and change record
|-- .gitignore                   # Ignore node_modules, .env, *.log, build artifacts
|-- .env.example                 # Sanitized environment variable template
|-- labs/                        # Guided progressive practical labs
|-- assignments/                 # Independent assessment challenges
|-- workflows/                   # Sanitized workflow definitions and templates
|-- src/                         # Application source code (triggers, actions, services)
|-- docs/                        # Architecture, workflows, APIs, webhooks, decisions
|-- tests/                       # Automated test suites
|-- examples/                    # Sample inputs, mock payloads, test fixtures
|-- reports/                     # Lab execution outputs, test runs, audit evidence
\`-- deployment/                  # Dockerfile, docker-compose.yml, k8s manifests
\`\`\`

---

## Cross-Repository Navigation

- [Master Automation Hub](https://github.com/EmaanHumayun/automation-integration-hub)
- [Level 1: Beginner Projects](https://github.com/EmaanHumayun/automation-beginner-projects)
- [Level 2: Intermediate Projects](https://github.com/EmaanHumayun/automation-intermediate-projects)
- [Level 3: Advanced Projects](https://github.com/EmaanHumayun/automation-advanced-projects)
- [Level 4: Professional Projects](https://github.com/EmaanHumayun/automation-professional-projects)
`;

  write(path.join(repoDir, 'README.md'), levelReadme);

  // 2. PROJECT-INDEX.md
  const projectIndex = `# Project Index — ${level.tier}

Detailed technical briefs for all projects in this tier.

${level.projects.map(p => `
---

### Project ${p.id}: ${p.name}
- **Directory**: [\`${p.slug}\`](./${p.slug})
- **Status**: \`${p.status}\`
- **Core Technology**: ${p.tech}
- **Summary**: ${p.summary}
- **Problem Solved**: ${p.problem}
- **Key Concepts**: ${p.concepts}
`).join('\n')}
`;
  write(path.join(repoDir, 'PROJECT-INDEX.md'), projectIndex);

  // 3. CONCEPT-INDEX.md
  const conceptIndex = `# Concept Index — ${level.tier}

Mapping of concepts introduced and applied within ${level.tier}.

| Concept | Description | Project |
| :--- | :--- | :--- |
${level.projects.map(p => `| **${p.name} Concepts** | ${p.concepts} | [\`${p.slug}\`](./${p.slug}) |`).join('\n')}
`;
  write(path.join(repoDir, 'CONCEPT-INDEX.md'), conceptIndex);

  // 4. PROGRESS-TRACKER.md
  const progressTracker = `# Progress Tracker — ${level.tier}

| Project ID | Project Name | Directory | Status | Lab Status | Test Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
${level.projects.map(p => `| **${p.id}** | ${p.name} | [\`${p.slug}\`](./${p.slug}) | \`${p.status}\` | ${p.status === 'Completed' ? 'Executed' : 'Scaffolding Ready'} | ${p.status === 'Completed' ? 'Passing' : 'Planned'} |`).join('\n')}
`;
  write(path.join(repoDir, 'PROGRESS-TRACKER.md'), progressTracker);

  // 5. LEARNING-LOG.md
  const learningLog = `# Learning Log — ${level.tier}

Chronological log of implementation milestones and technical insights for ${level.tier}.

- **2026-11-02**: Initialized repository structure, project specifications, and guided labs for Projects ${level.projects[0].id} to ${level.projects[level.projects.length - 1].id}.
`;
  write(path.join(repoDir, 'LEARNING-LOG.md'), learningLog);

  // 6. INTEGRATIONS-CATALOG.md
  const integrationsCat = `# Integrations Catalog — ${level.tier}

Inventory of external services, protocols, and APIs utilized in ${level.tier}.

| Project | Target Services & APIs | Protocols | Authentication |
| :--- | :--- | :--- | :--- |
${level.projects.map(p => `| **${p.id} - ${p.name}** | ${p.tech} | HTTP/REST, JSON | API Key / HMAC / Token |`).join('\n')}
`;
  write(path.join(repoDir, 'INTEGRATIONS-CATALOG.md'), integrationsCat);

  // 7. templates/ inside level repo
  const levelTemplatesDir = path.join(repoDir, 'templates');
  write(path.join(levelTemplatesDir, 'lab-template.md'), `# Lab Template\n\n## Objective\n## Prerequisites\n## Steps\n## Verification\n`);
  write(path.join(levelTemplatesDir, 'assignment-template.md'), `# Assignment Template\n\n## Task\n## Requirements\n## Rubric\n`);

  // Build each project directory
  for (const project of level.projects) {
    const projDir = path.join(repoDir, project.slug);
    ensureDir(projDir);

    // Project README.md
    const pReadme = `# ${project.name}

> Project ${project.id} | ${level.tier}

${project.summary}

---

## Quick Reference

- **Status**: \`${project.status}\`
- **Primary Runtime**: ${project.tech}
- **Architecture**: Ingestion Trigger -> Validation -> Service Execution -> Outbound Action
- **Master Catalog**: [Complete Project Catalog](https://github.com/EmaanHumayun/automation-integration-hub/blob/main/COMPLETE-PROJECT-CATALOG.md)

---

## Directory Layout

\`\`\`
${project.slug}/
|-- README.md                    # Project overview and quick start guide
|-- PROJECT-SPECIFICATION.md     # 20-point comprehensive engineering specification
|-- REQUIREMENTS.md              # Functional, non-functional, and security requirements
|-- IMPLEMENTATION-ROADMAP.md    # Phased milestones and technical checklist
|-- CHANGELOG.md                 # Project version history
|-- .gitignore                   # Ignore node_modules, .env, logs
|-- .env.example                 # Sanitized environment configuration
|
|-- labs/                        # Step-by-step practical labs
|   |-- lab-01-setup-and-prerequisites.md
|   |-- lab-02-core-workflow-implementation.md
|   \`-- lab-03-validation-and-testing.md
|
|-- assignments/                 # Independent assessment challenges
|   \`-- assignment-01-core-enhancement.md
|
|-- workflows/                   # Sanitized workflow JSON templates
|   |-- development/
|   |-- production/
|   \`-- examples/
|
|-- src/                         # Application source code
|   |-- config/                  # Environment and application configuration
|   |-- integrations/            # External API client modules
|   |-- triggers/                # Webhooks, cron schedules, event listeners
|   |-- actions/                 # Outbound operations and delivery handlers
|   |-- services/                # Business logic, transformation, validation
|   \`-- utils/                   # Helpers, loggers, schema validators
|
|-- docs/                        # Architecture, APIs, webhooks, schemas
|-- tests/                       # Unit and integration test suites
|-- examples/                    # Sample payloads and mock fixtures
|-- reports/                     # Test execution outputs and verification logs
\`-- deployment/                  # Dockerfile, docker-compose.yml
\`\`\`

---

## Quick Start & Execution

\`\`\`bash
# 1. Navigate to directory
cd ${project.slug}

# 2. Configure environment
cp .env.example .env

# 3. Install dependencies
npm install  # (or pip install -r requirements.txt)

# 4. Run automated test suite
npm test     # (or pytest)

# 5. Start development service
npm start    # (or python src/main.py)
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
- Design and implement resilient automation workflows for ${project.name}.
- Apply robust error handling, schema validation, and logging hygiene.
- Package services in Docker containers for reproducible local and cloud deployment.
- Implement comprehensive automated test suites to verify trigger-action contracts.

### 4. Prerequisites
- Proficient in JavaScript/Node.js or Python fundamentals.
- Understanding of HTTP methods, headers, status codes, and JSON schemas.
- Familiarity with Git version control, Docker containers, and environment variables.

### 5. Concepts Covered
${project.concepts}

### 6. Tools and Technology
- **Runtime / Framework**: ${project.tech}
- **Data Stores**: In-Memory / SQLite / PostgreSQL / Redis
- **Containerization**: Docker, Docker Compose
- **Testing**: Jest / Mocha / Pytest, Supertest

### 7. Functional Requirements
- **FR-01**: Ingest incoming triggers through configured endpoints or schedules (${project.triggers}).
- **FR-02**: Validate payload format against strict JSON schemas before processing.
- **FR-03**: Execute core action operations (${project.actions}).
- **FR-04**: Emit structured execution logs capturing timestamp, duration, and delivery status.
- **FR-05**: Provide liveness and readiness health check endpoints (\`GET /health\`).

### 8. Non-Functional Requirements
- **NFR-01 (Performance)**: Webhook ingress must acknowledge callers within 200ms.
- **NFR-02 (Reliability)**: Automatic retry with exponential backoff for transient network errors.
- **NFR-03 (Security)**: Zero plain-text credentials in logs or source code.
- **NFR-04 (Maintainability)**: Clear separation between trigger listeners, services, and actions.

### 9. Workflow Design
\`\`\`
[ Trigger: ${project.triggers} ]
                  |
                  v
       [ Input Validation ] ---- (Invalid) ----> [ Return 400 Bad Request ]
                  |
              (Valid)
                  v
       [ Service Business Logic ]
                  |
                  v
       [ Action: ${project.actions} ]
                  |
                  v
       [ Structured Log & Return Status ]
\`\`\`

### 10. Trigger Definitions
- **Type**: ${project.triggers}
- **Method**: HTTP POST / Scheduled Cron / Event Subscription
- **Authentication**: Header verification (HMAC or Bearer token)

### 11. Actions and Integrations
- **Primary Actions**: ${project.actions}
- **External Dependencies**: Mock endpoints / sandbox APIs / SMTP / Cloud services

### 12. Input and Output Data Formats
- **Input Format**: ${project.inputs}
- **Output Format**: ${project.outputs}

### 13. Error Handling
- Invalid payload: HTTP \`400 Bad Request\` with detailed schema validation errors.
- Authentication failure: HTTP \`401 Unauthorized\` or \`403 Forbidden\`.
- Upstream service error: Retry 3 times with exponential backoff (1s, 2s, 4s) before logging to dead-letter queue.

### 14. Authentication Requirements
- Webhook endpoints require cryptographic HMAC validation or Bearer API keys.
- Secret keys loaded exclusively from environment variables.

### 15. Security Requirements
- Reject payloads exceeding 1MB.
- Sanitize all string fields against script injection.
- Never log authorization headers or private credentials.

### 16. Testing Requirements
- **Unit Tests**: Test payload schema validator with valid and boundary inputs.
- **Integration Tests**: Verify trigger-to-action execution with mock upstream services.
- **Error Tests**: Verify proper status codes on invalid signatures and missing fields.

### 17. Implementation Milestones
- **Milestone 1**: Scaffolding, configuration, and environment setup.
- **Milestone 2**: Ingress trigger and validation middleware implementation.
- **Milestone 3**: Core service logic and action handlers.
- **Milestone 4**: Automated test suite and Docker containerization.

### 18. Expected Deliverables
- Working application code in \`src/\`.
- Sanitized workflow JSON definitions in \`workflows/\`.
- Automated test runner in \`tests/\`.
- Container definition in \`deployment/\` (Dockerfile & docker-compose.yml).
- Completed practical lab reports in \`reports/\`.

### 19. Completion Criteria
- All automated unit and integration tests passing.
- Zero credentials or tokens in git history.
- Docker image builds and executes successfully.
- Lab reports documented with terminal outputs.

### 20. Advanced Extensions
- Introduce distributed Redis queues for high-throughput buffering.
- Add OpenTelemetry distributed tracing spans.
- Implement automated dead-letter queue re-drive utility.
`;
    write(path.join(projDir, 'PROJECT-SPECIFICATION.md'), pSpec);

    // REQUIREMENTS.md
    const pReq = `# Requirements Document: ${project.name}

## 1. System Requirements
- Node.js v18+ or Python 3.10+
- Docker & Docker Compose v2+
- Git 2.30+

## 2. Functional Requirements
- **FR-01**: Ingestion and validation of trigger events.
- **FR-02**: Execution of target actions with delivery verification.
- **FR-03**: Health monitoring via \`GET /health\`.

## 3. Non-Functional Requirements
- **NFR-01**: Latency under 250ms for synchronous operations.
- **NFR-02**: 99.9% processing success rate with retries.
- **NFR-03**: Strict secret isolation via \`.env\`.
`;
    write(path.join(projDir, 'REQUIREMENTS.md'), pReq);

    // ARCHITECTURE.md
    const pArch = `# Architecture Document: ${project.name}

## System Overview
The ${project.name} separates concerns into four discrete layers:

1. **Trigger Layer (\`src/triggers/\`)**: Ingests external HTTP webhooks, cron ticks, or queue messages.
2. **Validation Layer (\`src/utils/\`)**: Enforces JSON schema constraints and validates authentication.
3. **Service Layer (\`src/services/\`)**: Implements business rules and coordinates actions.
4. **Action Layer (\`src/actions/\`)**: Executes side effects against databases, SMTP, or external APIs.

\`\`\`
[ Ingress Trigger ] -> [ Validation ] -> [ Service Logic ] -> [ Outbound Action ]
                             |                  |                     |
                             v                  v                     v
                        [ Reject 400 ]     [ Audit Log ]        [ External API ]
\`\`\`
`;
    write(path.join(projDir, 'ARCHITECTURE.md'), pArch);

    // IMPLEMENTATION-ROADMAP.md
    const pRoadmap = `# Implementation Roadmap: ${project.name}

- [x] Phase 1: Directory scaffolding and configuration templates
- [x] Phase 2: Specification, requirements, and architecture documentation
- [${project.status === 'Completed' ? 'x' : ' '}] Phase 3: Core application code implementation in \`src/\`
- [${project.status === 'Completed' ? 'x' : ' '}] Phase 4: Automated test suite in \`tests/\`
- [${project.status === 'Completed' ? 'x' : ' '}] Phase 5: Containerization via Dockerfile and docker-compose.yml
`;
    write(path.join(projDir, 'IMPLEMENTATION-ROADMAP.md'), pRoadmap);

    // TESTING-STRATEGY.md
    const pTesting = `# Testing Strategy: ${project.name}

## 1. Test Categories
- **Unit Tests**: Verify schema validators, hash generators, and utility functions.
- **Integration Tests**: Execute trigger endpoints and verify action handler calls using mock servers.
- **Negative Tests**: Confirm rejection of invalid payloads, expired signatures, and malformed headers.

## 2. Running Tests
\`\`\`bash
npm test
\`\`\`
`;
    write(path.join(projDir, 'TESTING-STRATEGY.md'), pTesting);

    // SECURITY-CONSIDERATIONS.md
    const pSec = `# Security Considerations: ${project.name}

## Security Controls
- **HMAC Signature Check**: Validates incoming payload authenticity.
- **Secret Isolation**: Configuration loaded exclusively from environment variables.
- **Input Sanitization**: Prevents script injection and payload bloat attacks.
- **No Credentials Committed**: Zero sensitive keys in git history.
`;
    write(path.join(projDir, 'SECURITY-CONSIDERATIONS.md'), pSec);

    // CHANGELOG.md
    const pChangelog = `# Changelog: ${project.name}

## [1.0.0] - 2026-11-02
- Established project scaffolding, complete 20-point specification, requirements, and guided labs.
`;
    write(path.join(projDir, 'CHANGELOG.md'), pChangelog);

    // .gitignore & .env.example
    write(path.join(projDir, '.gitignore'), `node_modules/\n.env\n*.log\ncoverage/\n__pycache__/\n*.pyc\n`);
    write(path.join(projDir, '.env.example'), `PORT=3000\nNODE_ENV=development\nWEBHOOK_SECRET=your_sanitized_hmac_secret_here\nSMTP_HOST=smtp.ethereal.email\nSMTP_PORT=587\nSMTP_USER=your_user\nSMTP_PASS=your_pass\nLOG_LEVEL=info\n`);

    // labs/
    const labsDir = path.join(projDir, 'labs');
    write(path.join(labsDir, 'lab-01-setup-and-prerequisites.md'), `# Lab 01: Setup and Prerequisites for ${project.name}\n\n### Objective\nSet up the local development environment, install dependencies, and configure \`.env\`.\n\n### Tasks\n1. Verify runtime (Node.js / Python).\n2. Copy \`.env.example\` to \`.env\`.\n3. Run dependency installation.\n\n### Verification\nConfirm \`node -v\` and dependency installation succeed without errors.\n`);
    write(path.join(labsDir, 'lab-02-core-workflow-implementation.md'), `# Lab 02: Core Workflow Implementation for ${project.name}\n\n### Objective\nImplement the primary trigger and action execution logic.\n\n### Tasks\n1. Build the trigger listener.\n2. Configure the schema validator.\n3. Implement the action dispatcher.\n\n### Expected Output\nTrigger acknowledges payload and returns execution receipt.\n`);
    write(path.join(labsDir, 'lab-03-validation-and-testing.md'), `# Lab 03: Validation and Testing for ${project.name}\n\n### Objective\nExecute automated test suites and verify negative test cases.\n\n### Tasks\n1. Run unit tests.\n2. Run integration tests.\n3. Inspect test coverage report.\n\n### Completion Criteria\nAll assertions pass with 100% exit code 0.\n`);

    // assignments/
    const assignDir = path.join(projDir, 'assignments');
    write(path.join(assignDir, 'assignment-01-core-enhancement.md'), `# Assignment 01: Core Enhancement for ${project.name}\n\n### Objective\nExtend the core automation with a dead-letter queue mechanism or rate-limiting filter.\n\n### Requirements\n1. Implement exponential backoff retry on failure.\n2. Capture permanently failed jobs in a dead-letter queue.\n3. Write an automated test verifying the retry mechanism.\n\n### Rubric\n- Code modularity: 30%\n- Error handling: 40%\n- Test coverage: 30%\n`);

    // workflows/
    const wfDir = path.join(projDir, 'workflows');
    ensureDir(path.join(wfDir, 'development'));
    ensureDir(path.join(wfDir, 'production'));
    write(path.join(wfDir, 'examples', 'sample-workflow.json'), JSON.stringify({
      name: `${project.name} Workflow Template`,
      nodes: [
        { name: 'Webhook Ingestion Trigger', type: 'webhook', position: [100, 200] },
        { name: 'Payload Schema Validation', type: 'validation', position: [300, 200] },
        { name: 'Execute Action Handler', type: 'action', position: [500, 200] }
      ],
      connections: {
        'Webhook Ingestion Trigger': { main: [[{ node: 'Payload Schema Validation', type: 'main', index: 0 }]] },
        'Payload Schema Validation': { main: [[{ node: 'Execute Action Handler', type: 'main', index: 0 }]] }
      }
    }, null, 2));

    // src/ directories
    const srcDir = path.join(projDir, 'src');
    ensureDir(path.join(srcDir, 'config'));
    ensureDir(path.join(srcDir, 'integrations'));
    ensureDir(path.join(srcDir, 'triggers'));
    ensureDir(path.join(srcDir, 'actions'));
    ensureDir(path.join(srcDir, 'services'));
    ensureDir(path.join(srcDir, 'utils'));

    // docs/ directories
    const docsDir = path.join(projDir, 'docs');
    ensureDir(path.join(docsDir, 'architecture'));
    ensureDir(path.join(docsDir, 'workflows'));
    ensureDir(path.join(docsDir, 'APIs'));
    ensureDir(path.join(docsDir, 'webhooks'));
    ensureDir(path.join(docsDir, 'database'));
    ensureDir(path.join(docsDir, 'decisions'));

    // tests/, examples/, reports/, deployment/
    ensureDir(path.join(projDir, 'tests'));
    ensureDir(path.join(projDir, 'examples'));
    ensureDir(path.join(projDir, 'reports'));
    const deployDir = path.join(projDir, 'deployment');
    ensureDir(deployDir);
    write(path.join(deployDir, 'Dockerfile'), `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install --production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n`);
    write(path.join(deployDir, 'docker-compose.yml'), `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n      - PORT=3000\n`);
  }

  // Initialize git repo for level repo
  try {
    execSync('git init -b main', { cwd: repoDir, stdio: 'ignore' });
  } catch {
    execSync('git init', { cwd: repoDir, stdio: 'ignore' });
    try { execSync('git branch -M main', { cwd: repoDir, stdio: 'ignore' }); } catch {}
  }
  execSync('git add .', { cwd: repoDir });
  execSync(`git commit -m "feat: initialize ${level.repoName} with 5 detailed project specifications, labs, and architecture"`, { cwd: repoDir });
  console.log(`[LEVEL] Completed ${level.repoName} successfully.`);
}

console.log('[BUILD] All 4 Automation Level Repositories constructed successfully.');
